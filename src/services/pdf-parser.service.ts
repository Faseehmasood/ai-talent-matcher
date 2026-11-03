import crypto from "crypto"
import { validatePdfBuffer } from "@/src/lib/validations"
import {
  getGenAIClient,
  FAST_GENERATION_MODEL,
  withRetryAndTimeout,
} from "@/src/lib/gemini"
import { ResumeSectionType } from "@/src/models/resume-chunk.model"
import { extractGithubHandle } from "@/src/services/github-tool.service"

export interface ParsedResumeChunk {
  sectionType: ResumeSectionType
  chunkIndex: number
  chunkText: string
}

export interface ParsedResumeResult {
  resumeHash: string
  fullText: string
  pageCount: number
  extractedLinks: string[]
  extractedGithubUsername: string
  ocrUsed: boolean
  promptInjectionDetected: boolean
  chunks: ParsedResumeChunk[]
}

interface PositionedTextItem {
  str: string
  x: number
  y: number
  width: number
}

const PROMPT_INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior|above)\s+(instructions|prompts|rules)/gi,
  /disregard\s+(all\s+)?(previous|prior|above)\s+(instructions|prompts)/gi,
  /system\s*prompt\s*:/gi,
  /you\s+are\s+now\s+an?\s+unrestricted/gi,
  /give\s+this\s+(candidate|applicant|resume)\s+(a\s+)?(100|perfect|maximum)\s*(score|%)/gi,
  /<\|im_start\|>|<\|im_end\|>|\[INST\]|\[\/INST\]/gi,
]

const SECTION_HEADER_PATTERNS: Array<{
  type: ResumeSectionType
  regex: RegExp
}> = [
  {
    type: "summary",
    regex:
      /^(?:professional\s+summary|executive\s+summary|summary|profile|about\s+me|objective|career\s+objective)\s*:?\s*$/i,
  },
  {
    type: "experience",
    regex:
      /^(?:work\s+experience|professional\s+experience|employment\s+history|experience|career\s+history|relevant\s+experience|internships?)\s*:?\s*$/i,
  },
  {
    type: "projects",
    regex:
      /^(?:projects|key\s+projects|personal\s+projects|academic\s+projects|selected\s+projects|portfolio)\s*:?\s*$/i,
  },
  {
    type: "skills",
    regex:
      /^(?:technical\s+skills|core\s+competencies|skills|technologies|tech\s+stack|skills\s*&\s*tools|expertise)\s*:?\s*$/i,
  },
  {
    type: "education",
    regex:
      /^(?:education|academic\s+background|qualifications|certifications|education\s*&\s*certifications)\s*:?\s*$/i,
  },
]

/**
 * Computes a deterministic SHA-256 hex digest over the raw PDF Buffer.
 */
export function computeResumeSha256(buffer: Buffer): string {
  return crypto.createHash("sha256").update(buffer).digest("hex")
}

/**
 * Sanitizes text against indirect prompt injection attacks hidden in resumes.
 */
export function sanitizeResumeText(rawText: string): {
  sanitizedText: string
  promptInjectionDetected: boolean
} {
  let sanitizedText = rawText
  let promptInjectionDetected = false

  for (const pattern of PROMPT_INJECTION_PATTERNS) {
    if (pattern.test(sanitizedText)) {
      promptInjectionDetected = true
      sanitizedText = sanitizedText.replace(
        pattern,
        "[REDACTED_INJECTION_PATTERN]"
      )
    }
  }

  return { sanitizedText, promptInjectionDetected }
}

/**
 * Deterministically extracts a valid GitHub username from a list of URLs and raw text.
 */
export function extractGithubUsername(
  links: string[],
  rawText: string
): string {
  return extractGithubHandle(rawText, links) || ""
}

/**
 * Groups positioned PDF text items into lines and de-interleaves 2-column layouts
 * using (x, y) bounding coordinates.
 */
function reconstructCoordinateAwarePageText(
  items: PositionedTextItem[],
  pageWidth: number
): string {
  const validItems = items.filter((item) => item.str.trim().length > 0)
  if (validItems.length === 0) return ""

  const splitX = pageWidth * 0.44
  const gutterHalfWidth = pageWidth * 0.03

  const leftItems: PositionedTextItem[] = []
  const rightItems: PositionedTextItem[] = []
  const fullWidthTopItems: PositionedTextItem[] = []

  // Top 15% of page is often a full-width name/contact banner
  const maxY = Math.max(...validItems.map((i) => i.y))
  const minY = Math.min(...validItems.map((i) => i.y))
  const pageSpanY = Math.max(maxY - minY, 1)
  const headerThresholdY = maxY - pageSpanY * 0.14

  let itemsInGutter = 0
  let bodyItemsLeft = 0
  let bodyItemsRight = 0

  for (const item of validItems) {
    if (item.y >= headerThresholdY) continue
    if (Math.abs(item.x - splitX) <= gutterHalfWidth) {
      itemsInGutter++
    } else if (item.x < splitX) {
      bodyItemsLeft++
    } else {
      bodyItemsRight++
    }
  }

  const totalBodyItems = bodyItemsLeft + bodyItemsRight + itemsInGutter
  const isTwoColumn =
    totalBodyItems >= 20 &&
    bodyItemsLeft >= totalBodyItems * 0.18 &&
    bodyItemsRight >= totalBodyItems * 0.18 &&
    itemsInGutter <= totalBodyItems * 0.06

  const assembleLines = (group: PositionedTextItem[]): string => {
    if (group.length === 0) return ""
    const sortedByYDesc = [...group].sort((a, b) => b.y - a.y)
    const lines: PositionedTextItem[][] = []
    const lineTolerancePt = 3.5

    for (const item of sortedByYDesc) {
      const existingLine = lines.find(
        (line) => Math.abs(line[0].y - item.y) <= lineTolerancePt
      )
      if (existingLine) {
        existingLine.push(item)
      } else {
        lines.push([item])
      }
    }

    return lines
      .map((line) =>
        line
          .sort((a, b) => a.x - b.x)
          .map((token) => token.str.trim())
          .join(" ")
      )
      .join("\n")
  }

  if (!isTwoColumn) {
    return assembleLines(validItems)
  }

  for (const item of validItems) {
    if (item.y >= headerThresholdY) {
      fullWidthTopItems.push(item)
    } else if (item.x < splitX) {
      leftItems.push(item)
    } else {
      rightItems.push(item)
    }
  }

  return [
    assembleLines(fullWidthTopItems),
    assembleLines(leftItems),
    assembleLines(rightItems),
  ]
    .filter(Boolean)
    .join("\n\n")
}

/**
 * Fallback multimodal OCR using gemini-2.5-flash when a PDF has < 150 chars/page
 * (e.g., scanned image PDF or Canva/Figma vectorized outline PDF).
 */
async function extractResumeViaMultimodalVision(buffer: Buffer): Promise<{
  text: string
  links: string[]
}> {
  const ai = getGenAIClient()
  const base64Pdf = buffer.toString("base64")

  const response = await withRetryAndTimeout(
    async (signal) =>
      await ai.models.generateContent({
        model: FAST_GENERATION_MODEL,
        contents: [
          {
            role: "user",
            parts: [
              {
                inlineData: {
                  mimeType: "application/pdf",
                  data: base64Pdf,
                },
              },
              {
                text: [
                  "Extract all text from this PDF resume accurately, preserving the logical reading order of sections.",
                  "Format the output using exact uppercase section headers on their own lines:",
                  "SUMMARY",
                  "EXPERIENCE",
                  "PROJECTS",
                  "SKILLS",
                  "EDUCATION",
                  "Also include any visible URLs, email addresses, or GitHub usernames verbatim.",
                ].join("\n"),
              },
            ],
          },
        ],
        config: {
          temperature: 0.1,
          abortSignal: signal,
        },
      }),
    { timeoutMs: 25000, maxRetries: 2 }
  )

  const extractedText = (response.text || "").trim()
  const urlMatches =
    extractedText.match(/https?:\/\/[^\s)>\]"']+/gi)?.map((u) => u.trim()) || []

  return {
    text: extractedText,
    links: Array.from(new Set(urlMatches)),
  }
}

/**
 * Splits normalized resume text into canonical sections (Summary, Experience,
 * Projects, Skills, Education), prepends parent-document context headers,
 * and enforces a strict cap of 8 chunks per resume.
 */
export function buildSectionAwareChunks(
  sanitizedText: string,
  candidateName: string,
  maxChunks: number = 8
): ParsedResumeChunk[] {
  const lines = sanitizedText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)

  const sections: Array<{ type: ResumeSectionType; lines: string[] }> = []
  let currentSection: { type: ResumeSectionType; lines: string[] } = {
    type: "summary",
    lines: [],
  }

  for (const line of lines) {
    const cleanHeaderCandidate = line.replace(/^[#*\-•\d.)\s]+/, "").trim()
    const matchedHeader =
      cleanHeaderCandidate.length <= 45
        ? SECTION_HEADER_PATTERNS.find((h) => h.regex.test(cleanHeaderCandidate))
        : undefined

    if (matchedHeader) {
      if (currentSection.lines.length > 0) {
        sections.push(currentSection)
      }
      currentSection = {
        type: matchedHeader.type,
        lines: [line],
      }
    } else {
      currentSection.lines.push(line)
    }
  }

  if (currentSection.lines.length > 0) {
    sections.push(currentSection)
  }

  const maxCharsPerChunk = 1500
  const overlapChars = 150
  const rawChunks: Array<{ sectionType: ResumeSectionType; body: string }> = []

  for (const sec of sections) {
    const sectionBody = sec.lines.join("\n").trim()
    if (!sectionBody) continue

    if (sectionBody.length <= maxCharsPerChunk) {
      rawChunks.push({ sectionType: sec.type, body: sectionBody })
    } else {
      let cursor = 0
      while (cursor < sectionBody.length) {
        const sliceEnd = Math.min(cursor + maxCharsPerChunk, sectionBody.length)
        const slice = sectionBody.slice(cursor, sliceEnd).trim()
        if (slice.length > 30) {
          rawChunks.push({ sectionType: sec.type, body: slice })
        }
        if (sliceEnd >= sectionBody.length) break
        cursor = sliceEnd - overlapChars
      }
    }
  }

  const boundedChunks = rawChunks.slice(0, maxChunks)
  const safeName = (candidateName || "Candidate").trim()

  return boundedChunks.map((item, idx) => ({
    sectionType: item.sectionType,
    chunkIndex: idx,
    chunkText: `[Candidate: ${safeName} | Section: ${item.sectionType.toUpperCase()}]\n${
      item.body
    }`,
  }))
}

/**
 * End-to-end coordinate-aware PDF parser with /Annots hyperlink extraction,
 * multimodal gemini-2.5-flash OCR fallback, and section-aware chunking.
 */
export async function parseResumePdf(
  buffer: Buffer,
  candidateName: string = "Candidate"
): Promise<ParsedResumeResult> {
  const validation = validatePdfBuffer(buffer, 5 * 1024 * 1024)
  if (!validation.valid) {
    throw new Error(validation.message || "Invalid PDF buffer")
  }

  const resumeHash = computeResumeSha256(buffer)
  const extractedLinksSet = new Set<string>()
  const pageTexts: string[] = []
  let pageCount = 1
  let ocrUsed = false

  try {
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs")
    const loadingTask = pdfjs.getDocument({
      data: new Uint8Array(buffer),
      useSystemFonts: true,
      disableFontFace: true,
    })

    const pdfDoc = await loadingTask.promise
    pageCount = pdfDoc.numPages

    for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
      const page = await pdfDoc.getPage(pageNum)
      const viewport = page.getViewport({ scale: 1.0 })
      const textContent = await page.getTextContent()

      const positionedItems: PositionedTextItem[] = []
      for (const rawItem of textContent.items as Array<Record<string, unknown>>) {
        if (typeof rawItem.str === "string" && Array.isArray(rawItem.transform)) {
          const transform = rawItem.transform as number[]
          positionedItems.push({
            str: rawItem.str,
            x: Number(transform[4]) || 0,
            y: Number(transform[5]) || 0,
            width: Number(rawItem.width) || 0,
          })
        }
      }

      const pageText = reconstructCoordinateAwarePageText(
        positionedItems,
        viewport.width || 612
      )
      if (pageText) {
        pageTexts.push(pageText)
      }

      const annotations = await page.getAnnotations()
      for (const annot of annotations as Array<Record<string, unknown>>) {
        const uri =
          (typeof annot.url === "string" && annot.url) ||
          (typeof annot.unsafeUrl === "string" && annot.unsafeUrl) ||
          ""
        if (uri) {
          extractedLinksSet.add(uri.trim())
        }
      }
    }
  } catch {
    // If pdfjs-dist fails on a malformed PDF structure, fall through to multimodal OCR check
  }

  let combinedText = pageTexts.join("\n\n").trim()
  const avgCharsPerPage = combinedText.length / Math.max(pageCount, 1)

  if (avgCharsPerPage < 150) {
    try {
      const visionResult = await extractResumeViaMultimodalVision(buffer)
      if (visionResult.text.length > combinedText.length) {
        combinedText = visionResult.text
        ocrUsed = true
      }
      for (const link of visionResult.links) {
        extractedLinksSet.add(link)
      }
    } catch {
      // Keep whatever text pdfjs extracted if Gemini vision call fails
    }
  }

  const inlineUrls =
    combinedText.match(/https?:\/\/[^\s)>\]"']+/gi)?.map((u) => u.trim()) || []
  for (const url of inlineUrls) {
    extractedLinksSet.add(url)
  }

  const extractedLinks = Array.from(extractedLinksSet)
  const extractedGithubUsername = extractGithubUsername(
    extractedLinks,
    combinedText
  )

  const { sanitizedText, promptInjectionDetected } =
    sanitizeResumeText(combinedText)

  const chunks = buildSectionAwareChunks(sanitizedText, candidateName, 8)

  return {
    resumeHash,
    fullText: sanitizedText,
    pageCount,
    extractedLinks,
    extractedGithubUsername,
    ocrUsed,
    promptInjectionDetected,
    chunks,
  }
}
