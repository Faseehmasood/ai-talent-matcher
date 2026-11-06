/**
 * Deterministic GitHub REST & Git Trees Inspection Service (System B)
 * Provides ETag-cached, rate-limit-aware, timeout-bounded tools for the
 * Autonomous GitHub & Resume Cross-Verification Agent.
 */

export interface GithubUserProfile {
  found: boolean
  username: string
  name: string | null
  bio: string | null
  company: string | null
  blog: string | null
  location: string | null
  publicRepos: number
  followers: number
  following: number
  createdAt: string | null
  htmlUrl: string
  rateLimitRemaining: number | null
  error?: string
}

export interface GithubAuthoredRepo {
  name: string
  fullName: string
  htmlUrl: string
  description: string | null
  primaryLanguage: string | null
  topics: string[]
  stargazersCount: number
  forksCount: number
  sizeKb: number
  defaultBranch: string
  pushedAt: string
  createdAt: string
}

export interface GithubAuthoredReposResult {
  username: string
  totalPublicNonForkRepos: number
  repositories: GithubAuthoredRepo[]
  rateLimitRemaining: number | null
  error?: string
}

export interface DecodedManifestSummary {
  path: string
  manifestType:
    | "package.json"
    | "requirements.txt"
    | "pyproject.toml"
    | "go.mod"
    | "Cargo.toml"
    | "pom.xml"
  dependencies: string[]
  rawSnippet: string
}

export interface RepoDependencyInspectionResult {
  owner: string
  repo: string
  defaultBranch: string
  totalFilesInTree: number
  detectedLanguagesAndConfigs: string[]
  manifests: DecodedManifestSummary[]
  rateLimitRemaining: number | null
  error?: string
}

interface EtagCacheEntry {
  etag: string
  data: unknown
  status: number
  rateLimitRemaining: number | null
  timestamp: number
}

declare global {
  var __githubEtagCache: Map<string, EtagCacheEntry> | undefined
}

const CACHE_TTL_MS = 30 * 60 * 1000 // 30 minutes
const MAX_CACHE_ENTRIES = 500
const GITHUB_TIMEOUT_MS = 10000 // 10s strict AbortController timeout

const RESERVED_GITHUB_PATHS = new Set([
  "features",
  "pricing",
  "enterprise",
  "login",
  "join",
  "orgs",
  "organizations",
  "settings",
  "about",
  "topics",
  "collections",
  "explore",
  "marketplace",
  "sponsors",
  "readme",
  "security",
  "customer-stories",
  "team",
  "codespaces",
  "copilot",
  "pulls",
  "issues",
  "notifications",
  "search",
  "trending",
  "events",
  "site",
  "contact",
  "apps",
  "blog",
])

const SUPPORTED_MANIFEST_FILENAMES = new Set([
  "package.json",
  "requirements.txt",
  "pyproject.toml",
  "go.mod",
  "Cargo.toml",
  "pom.xml",
])

function getEtagCache(): Map<string, EtagCacheEntry> {
  if (!global.__githubEtagCache) {
    global.__githubEtagCache = new Map<string, EtagCacheEntry>()
  }
  return global.__githubEtagCache
}

function pruneCacheIfNeeded(cache: Map<string, EtagCacheEntry>): void {
  if (cache.size <= MAX_CACHE_ENTRIES) return
  const oldestKey = cache.keys().next().value
  if (oldestKey) {
    cache.delete(oldestKey)
  }
}

/**
 * Normalizes any raw GitHub username, handle, or full URL (e.g. "https://github.com/username")
 * down to just the canonical username string.
 */
export function cleanGithubUsername(raw: string | null | undefined): string {
  if (!raw) return ""
  let cleaned = raw.trim()
  cleaned = cleaned.replace(/^(?:https?:\/\/)?(?:www\.)?github\.com\//i, "")
  cleaned = cleaned.replace(/^[@/]+/, "")
  cleaned = cleaned.replace(/[\/?#].*$/, "")
  return cleaned.trim().replace(/^-+|-+$/g, "")
}

/**
 * Deterministically extracts a candidate's GitHub handle from visible PDF text
 * and extracted PDF /Annots /URI hyperlink annotations.
 */
export function extractGithubHandle(
  text: string,
  annotations: string[] = []
): string | null {
  const candidates: string[] = []
  const urlRegex = /github\.com\/([a-zA-Z0-9-]{1,39})(?:\/|\?|#|$)/gi

  for (const uri of annotations) {
    if (!uri) continue
    const matches = uri.matchAll(urlRegex)
    for (const match of matches) {
      if (match[1]) {
        candidates.push(match[1])
      }
    }
  }

  if (text) {
    const textUrlMatches = text.matchAll(urlRegex)
    for (const match of textUrlMatches) {
      if (match[1]) {
        candidates.push(match[1])
      }
    }

    const explicitHandleRegex =
      /\bgithub(?:\s+(?:username|handle|profile|id))?\s*[:\-@]\s*@?([a-zA-Z0-9-]{2,39})\b/gi
    const handleMatches = text.matchAll(explicitHandleRegex)
    for (const match of handleMatches) {
      if (match[1]) {
        candidates.push(match[1])
      }
    }
  }

  for (const raw of candidates) {
    const cleaned = raw.trim().replace(/^-+|-+$/g, "")
    if (
      cleaned.length >= 2 &&
      cleaned.length <= 39 &&
      !cleaned.includes("--") &&
      !RESERVED_GITHUB_PATHS.has(cleaned.toLowerCase()) &&
      !/\.(pdf|png|jpg|jpeg|svg|gif|html|js|ts|css|json|md)$/i.test(cleaned)
    ) {
      return cleaned
    }
  }

  return null
}

/**
 * Executes an authenticated (if GITHUB_PAT is configured) GitHub REST API GET request
 * with a 10s AbortController timeout, ETag conditional caching, and rate-limit inspection.
 */
async function githubApiGet<T>(url: string): Promise<{
  ok: boolean
  status: number
  data: T | null
  rateLimitRemaining: number | null
  error?: string
}> {
  const cache = getEtagCache()
  const cached = cache.get(url)
  const now = Date.now()

  if (cached && now - cached.timestamp < 60_000) {
    return {
      ok: cached.status >= 200 && cached.status < 300,
      status: cached.status,
      data: cached.data as T,
      rateLimitRemaining: cached.rateLimitRemaining,
    }
  }

  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "TalentaSync-AI-Verifier/2.0",
    "X-GitHub-Api-Version": "2022-11-28",
  }

  const pat = process.env.GITHUB_PAT?.trim()
  if (pat) {
    headers.Authorization = `Bearer ${pat}`
  }

  if (cached?.etag && now - cached.timestamp < CACHE_TTL_MS) {
    headers["If-None-Match"] = cached.etag
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), GITHUB_TIMEOUT_MS)

  try {
    const response = await fetch(url, {
      method: "GET",
      headers,
      signal: controller.signal,
    })
    clearTimeout(timeoutId)

    const remainingHeader = response.headers.get("x-ratelimit-remaining")
    const rateLimitRemaining =
      remainingHeader !== null ? Number(remainingHeader) : null

    // 304 Not Modified -> serve from ETag cache without consuming GitHub rate-limit quota
    if (response.status === 304 && cached) {
      cached.timestamp = now
      cached.rateLimitRemaining = rateLimitRemaining
      return {
        ok: true,
        status: 200,
        data: cached.data as T,
        rateLimitRemaining,
      }
    }

    if (response.status === 404) {
      return {
        ok: false,
        status: 404,
        data: null,
        rateLimitRemaining,
        error: "GitHub resource not found (404)",
      }
    }

    if (response.status === 403 || response.status === 429) {
      return {
        ok: false,
        status: response.status,
        data: null,
        rateLimitRemaining: rateLimitRemaining ?? 0,
        error: "GitHub API rate limit exceeded or access forbidden",
      }
    }

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        data: null,
        rateLimitRemaining,
        error: `GitHub API returned HTTP ${response.status}`,
      }
    }

    const json = (await response.json()) as T
    const etag = response.headers.get("etag") || ""

    if (etag) {
      pruneCacheIfNeeded(cache)
      cache.set(url, {
        etag,
        data: json,
        status: response.status,
        rateLimitRemaining,
        timestamp: now,
      })
    }

    return {
      ok: true,
      status: response.status,
      data: json,
      rateLimitRemaining,
    }
  } catch (err: unknown) {
    clearTimeout(timeoutId)
    const msg =
      err instanceof Error ? err.message : "GitHub network request timed out"
    return {
      ok: false,
      status: 504,
      data: null,
      rateLimitRemaining: null,
      error: msg,
    }
  }
}

/**
 * Tool 1: Fetches a GitHub user's public profile metadata.
 */
export async function getGithubUserProfile(
  username: string
): Promise<GithubUserProfile> {
  const cleanUser = cleanGithubUsername(username)
  const encodedUser = encodeURIComponent(cleanUser)
  const res = await githubApiGet<Record<string, unknown>>(
    `https://api.github.com/users/${encodedUser}`
  )

  if (!res.ok || !res.data) {
    return {
      found: false,
      username: cleanUser,
      name: null,
      bio: null,
      company: null,
      blog: null,
      location: null,
      publicRepos: 0,
      followers: 0,
      following: 0,
      createdAt: null,
      htmlUrl: `https://github.com/${cleanUser}`,
      rateLimitRemaining: res.rateLimitRemaining,
      error: res.error || "User not found",
    }
  }

  const d = res.data
  return {
    found: true,
    username: String(d.login || cleanUser),
    name: typeof d.name === "string" ? d.name : null,
    bio: typeof d.bio === "string" ? d.bio : null,
    company: typeof d.company === "string" ? d.company : null,
    blog: typeof d.blog === "string" ? d.blog : null,
    location: typeof d.location === "string" ? d.location : null,
    publicRepos: Number(d.public_repos) || 0,
    followers: Number(d.followers) || 0,
    following: Number(d.following) || 0,
    createdAt: typeof d.created_at === "string" ? d.created_at : null,
    htmlUrl:
      typeof d.html_url === "string"
        ? d.html_url
        : `https://github.com/${cleanUser}`,
    rateLimitRemaining: res.rateLimitRemaining,
  }
}

/**
 * Tool 2: Fetches a user's top 6 authored (non-fork, non-empty) repositories
 * sorted by pushed_at descending.
 */
export async function getAuthoredRepositories(
  username: string
): Promise<GithubAuthoredReposResult> {
  const cleanUser = cleanGithubUsername(username)
  const encodedUser = encodeURIComponent(cleanUser)
  const res = await githubApiGet<Array<Record<string, unknown>>>(
    `https://api.github.com/users/${encodedUser}/repos?sort=pushed&direction=desc&per_page=30&type=owner`
  )

  if (!res.ok || !Array.isArray(res.data)) {
    return {
      username: cleanUser,
      totalPublicNonForkRepos: 0,
      repositories: [],
      rateLimitRemaining: res.rateLimitRemaining,
      error: res.error || "Unable to fetch repositories",
    }
  }

  const authored = res.data
    .filter((repo) => repo.fork === false && (Number(repo.size) || 0) > 0)
    .sort((a, b) => {
      const dateA = new Date(String(a.pushed_at || 0)).getTime()
      const dateB = new Date(String(b.pushed_at || 0)).getTime()
      return dateB - dateA
    })

  const topSix: GithubAuthoredRepo[] = authored.slice(0, 6).map((repo) => ({
    name: String(repo.name || ""),
    fullName: String(repo.full_name || `${cleanUser}/${repo.name}`),
    htmlUrl: String(
      repo.html_url || `https://github.com/${cleanUser}/${repo.name}`
    ),
    description: typeof repo.description === "string" ? repo.description : null,
    primaryLanguage: typeof repo.language === "string" ? repo.language : null,
    topics: Array.isArray(repo.topics)
      ? repo.topics.map((t) => String(t))
      : [],
    stargazersCount: Number(repo.stargazers_count) || 0,
    forksCount: Number(repo.forks_count) || 0,
    sizeKb: Number(repo.size) || 0,
    defaultBranch: String(repo.default_branch || "main"),
    pushedAt: String(repo.pushed_at || ""),
    createdAt: String(repo.created_at || ""),
  }))

  return {
    username: cleanUser,
    totalPublicNonForkRepos: authored.length,
    repositories: topSix,
    rateLimitRemaining: res.rateLimitRemaining,
  }
}

/**
 * Parses dependency names from a manifest file's decoded string content.
 */
function parseManifestDependencies(
  filename: string,
  content: string
): string[] {
  const deps = new Set<string>()

  if (filename === "package.json") {
    try {
      const parsed = JSON.parse(content) as Record<string, unknown>
      const sections = [
        "dependencies",
        "devDependencies",
        "peerDependencies",
      ] as const
      for (const sec of sections) {
        const obj = parsed[sec]
        if (obj && typeof obj === "object") {
          for (const key of Object.keys(obj as Record<string, unknown>)) {
            deps.add(key)
          }
        }
      }
    } catch {
      // Malformed package.json
    }
  } else if (filename === "requirements.txt") {
    const lines = content.split(/\r?\n/)
    for (const line of lines) {
      const clean = line.split("#")[0].trim()
      if (!clean || clean.startsWith("-")) continue
      const pkgMatch = clean.match(/^([a-zA-Z0-9_.-]+)/)
      if (pkgMatch?.[1]) {
        deps.add(pkgMatch[1].toLowerCase())
      }
    }
  } else if (filename === "pyproject.toml" || filename === "Cargo.toml") {
    const matches = content.matchAll(
      /^\s*([a-zA-Z0-9_-]{2,45})\s*=\s*["'{]/gm
    )
    for (const match of matches) {
      const key = match[1]
      if (
        key &&
        ![
          "name",
          "version",
          "description",
          "authors",
          "edition",
          "license",
          "readme",
          "python",
        ].includes(key.toLowerCase())
      ) {
        deps.add(key)
      }
    }
  } else if (filename === "go.mod") {
    const matches = content.matchAll(/^\s*([a-zA-Z0-9_.-]+\/[^\s]+)\s+v/gm)
    for (const match of matches) {
      if (match[1]) deps.add(match[1])
    }
  } else if (filename === "pom.xml") {
    const matches = content.matchAll(/<artifactId>([^<]+)<\/artifactId>/g)
    for (const match of matches) {
      if (match[1]) deps.add(match[1].trim())
    }
  }

  return Array.from(deps).slice(0, 60)
}

/**
 * Tool 3: Uses the GitHub Git Trees API (/repos/{owner}/{repo}/git/trees/{default_branch}?recursive=1)
 * to locate and decode manifest files up to depth 2 (supporting monorepos like
 * /frontend/package.json and /backend/package.json).
 */
export async function inspectRepoDependencies(
  owner: string,
  repo: string
): Promise<RepoDependencyInspectionResult> {
  const cleanOwner = cleanGithubUsername(owner)
  const cleanRepo = repo.trim()
  const encodedOwner = encodeURIComponent(cleanOwner)
  const encodedRepo = encodeURIComponent(cleanRepo)

  // 1. Resolve repository default_branch
  let defaultBranch = "main"
  const repoMeta = await githubApiGet<Record<string, unknown>>(
    `https://api.github.com/repos/${encodedOwner}/${encodedRepo}`
  )
  if (repoMeta.ok && repoMeta.data && typeof repoMeta.data.default_branch === "string") {
    defaultBranch = repoMeta.data.default_branch
  } else if (!repoMeta.ok && repoMeta.status === 404) {
    return {
      owner: cleanOwner,
      repo: cleanRepo,
      defaultBranch,
      totalFilesInTree: 0,
      detectedLanguagesAndConfigs: [],
      manifests: [],
      rateLimitRemaining: repoMeta.rateLimitRemaining,
      error: repoMeta.error || "Repository not found",
    }
  }

  // 2. Fetch recursive Git Tree
  const treeRes = await githubApiGet<{
    tree?: Array<{ path?: string; type?: string; size?: number }>
  }>(
    `https://api.github.com/repos/${encodedOwner}/${encodedRepo}/git/trees/${encodeURIComponent(
      defaultBranch
    )}?recursive=1`
  )

  if (!treeRes.ok || !treeRes.data || !Array.isArray(treeRes.data.tree)) {
    return {
      owner: cleanOwner,
      repo: cleanRepo,
      defaultBranch,
      totalFilesInTree: 0,
      detectedLanguagesAndConfigs: [],
      manifests: [],
      rateLimitRemaining: treeRes.rateLimitRemaining,
      error: treeRes.error || "Unable to inspect repository git tree",
    }
  }

  const treeEntries = treeRes.data.tree.filter((item) => item.type === "blob")
  const configIndicators = new Set<string>()
  const candidateManifestPaths: Array<{
    path: string
    filename: DecodedManifestSummary["manifestType"]
    depth: number
  }> = []

  for (const entry of treeEntries) {
    const filePath = entry.path || ""
    if (!filePath) continue

    const segments = filePath.split("/")
    const depth = segments.length - 1 // 0 = root, 1 = /frontend/package.json, 2 = /apps/web/package.json
    const basename = segments[segments.length - 1]

    if (basename === "Dockerfile" || basename.startsWith("docker-compose")) {
      configIndicators.add("Docker")
    } else if (filePath.startsWith(".github/workflows/")) {
      configIndicators.add("GitHub Actions CI/CD")
    } else if (basename === "tsconfig.json") {
      configIndicators.add("TypeScript")
    } else if (basename.startsWith("next.config.")) {
      configIndicators.add("Next.js")
    } else if (basename === "nest-cli.json") {
      configIndicators.add("NestJS")
    } else if (basename === "schema.prisma") {
      configIndicators.add("Prisma ORM")
    } else if (basename.endsWith(".tf")) {
      configIndicators.add("Terraform")
    }

    if (depth <= 2 && SUPPORTED_MANIFEST_FILENAMES.has(basename)) {
      candidateManifestPaths.push({
        path: filePath,
        filename: basename as DecodedManifestSummary["manifestType"],
        depth,
      })
    }
  }

  // Sort by shallowest depth first and cap at 4 manifests per repo to preserve API quota
  candidateManifestPaths.sort((a, b) => a.depth - b.depth)
  const selectedManifests = candidateManifestPaths.slice(0, 4)

  const decodedManifests: DecodedManifestSummary[] = []
  let latestRateLimit = treeRes.rateLimitRemaining

  for (const item of selectedManifests) {
    const encodedPath = item.path
      .split("/")
      .map((seg) => encodeURIComponent(seg))
      .join("/")
    const contentRes = await githubApiGet<{
      content?: string
      encoding?: string
    }>(
      `https://api.github.com/repos/${encodedOwner}/${encodedRepo}/contents/${encodedPath}?ref=${encodeURIComponent(
        defaultBranch
      )}`
    )
    if (contentRes.rateLimitRemaining !== null) {
      latestRateLimit = contentRes.rateLimitRemaining
    }

    if (
      contentRes.ok &&
      contentRes.data &&
      typeof contentRes.data.content === "string"
    ) {
      const rawContent = Buffer.from(
        contentRes.data.content.replace(/\s/g, ""),
        "base64"
      ).toString("utf-8")

      const dependencies = parseManifestDependencies(item.filename, rawContent)
      decodedManifests.push({
        path: item.path,
        manifestType: item.filename,
        dependencies,
        rawSnippet: rawContent.slice(0, 800),
      })
    }
  }

  return {
    owner: cleanOwner,
    repo: cleanRepo,
    defaultBranch,
    totalFilesInTree: treeEntries.length,
    detectedLanguagesAndConfigs: Array.from(configIndicators),
    manifests: decodedManifests,
    rateLimitRemaining: latestRateLimit,
  }
}
