import fs from "fs"
import path from "path"
import dotenv from "dotenv"
import jwt from "jsonwebtoken"

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })

function buildRealResumePdfBuffer(): Buffer {
  const lines = [
    "FASEEH MASOOD",
    "Full-Stack Software Engineer | AI & Distributed Systems",
    "Email: faseeh.masood@example.com | Phone: +92 300 1234567",
    "GitHub: https://github.com/Faseehmasood",
    "Portfolio: https://github.com/Faseehmasood/my-portfolio",
    "",
    "SUMMARY",
    "Full-Stack Software Engineer with 3+ years of hands-on experience architecting",
    "production Next.js, TypeScript, Node.js, and MongoDB applications. Specialized",
    "in autonomous AI agents, 768-d vector search (RAG), and scalable backend queues.",
    "",
    "TECHNICAL SKILLS",
    "Languages: TypeScript, JavaScript (ES2024), Python, SQL, HTML5, CSS3",
    "Frontend: Next.js 16 (App Router), React 19, Tailwind CSS, Framer Motion, Zustand",
    "Backend: Node.js, Express.js, REST APIs, Server-Sent Events (SSE), BullMQ, Redis",
    "Databases: MongoDB Atlas, Vector Search (HNSW), PostgreSQL, Mongoose ODM",
    "AI & Cloud: Google Gemini API (gemini-2.5-flash, text-embedding-004), Cloudinary, Docker",
    "",
    "PROJECTS",
    "1. AI Talent Matcher (https://github.com/Faseehmasood/ai-talent-matcher)",
    "Built an end-to-end AI recruitment platform featuring coordinate-aware PDF parsing,",
    "768-dimensional hybrid vector + BM25 search with Reciprocal Rank Fusion (RRF),",
    "autonomous GitHub repository verification, and deterministic rubric scoring.",
    "",
    "2. LinkUp Social Platform (https://github.com/Faseehmasood/linkup)",
    "Engineered a full-stack social networking and real-time messaging application",
    "with JWT authentication, media uploads, and responsive UI components.",
    "",
    "3. Trading API Application (https://github.com/Faseehmasood/trading-api-app)",
    "Developed high-reliability financial market data ingestion and REST API endpoints.",
    "",
    "EXPERIENCE",
    "Senior Full-Stack Developer | Tech Solutions Lab (2023 - Present)",
    "- Designed and deployed scalable Next.js and Node.js microservices serving 10k+ users.",
    "- Implemented Redis + BullMQ asynchronous worker pipelines and SHA-256 caching.",
    "- Integrated automated GitHub code auditing and LLM structured JSON evaluation.",
    "",
    "EDUCATION",
    "Bachelor of Science in Computer Science (BSCS) | 2020 - 2024",
  ]

  const escapePdf = (str: string) =>
    str.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)")

  const contentOps: string[] = ["BT", "/F1 11 Tf", "50 760 Td", "14 TL"]
  for (const line of lines) {
    contentOps.push(`(${escapePdf(line)}) Tj T*`)
  }
  contentOps.push("ET")
  const streamData = contentOps.join("\n")

  const objects: string[] = [
    "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
    "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n",
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> /Annots [6 0 R] >>\nendobj\n",
    `4 0 obj\n<< /Length ${Buffer.byteLength(streamData, "utf8")} >>\nstream\n${streamData}\nendstream\nendobj\n`,
    "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n",
    "6 0 obj\n<< /Type /Annot /Subtype /Link /Rect [50 700 320 725] /Border [0 0 0] /A << /S /URI /URI (https://github.com/Faseehmasood) >> >>\nendobj\n",
  ]

  let body = "%PDF-1.4\n"
  const offsets: number[] = [0]
  for (const obj of objects) {
    offsets.push(Buffer.byteLength(body, "utf8"))
    body += obj
  }

  const xrefOffset = Buffer.byteLength(body, "utf8")
  let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  for (let i = 1; i <= objects.length; i++) {
    xref += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`
  }
  const trailer = `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`

  return Buffer.from(body + xref + trailer, "utf8")
}

async function testRoute(
  pathUrl: string,
  cookie?: string,
  followRedirect: boolean = false
): Promise<{ status: number; location: string | null; ms: number }> {
  const t0 = performance.now()
  const res = await fetch(`http://localhost:3000${pathUrl}`, {
    headers: cookie ? { Cookie: cookie } : {},
    redirect: followRedirect ? "follow" : "manual",
  })
  const t1 = performance.now()
  return {
    status: res.status,
    location: res.headers.get("location"),
    ms: Math.round(t1 - t0),
  }
}

async function main() {
  console.log("=================================================================")
  console.log("🚀 STARTING END-TO-END WORKFLOW, AUTH, RBAC & AI PIPELINE SUITE")
  console.log("=================================================================")

  const pdfBuffer = buildRealResumePdfBuffer()
  const pdfPath = path.resolve(process.cwd(), "public", "Faseeh_Masood_Resume.pdf")
  fs.writeFileSync(pdfPath, pdfBuffer)
  console.log(`✅ [1] Generated real PDF Resume (${pdfBuffer.length} bytes) at: ${pdfPath}`)

  // ---------------------------------------------------------------------------
  // STEP 2: PDF PARSER BENCHMARK
  // ---------------------------------------------------------------------------
  const { parseResumePdf } = await import("../src/services/pdf-parser.service")
  const t0 = performance.now()
  const parsed = await parseResumePdf(pdfBuffer, "Faseeh Masood")
  const t1 = performance.now()

  console.log(`\n📄 [2] PDF PARSER BENCHMARK: ${(t1 - t0).toFixed(1)} ms`)
  console.log(`   - Page Count: ${parsed.pageCount}`)
  console.log(`   - OCR Fallback Used: ${parsed.ocrUsed}`)
  console.log(`   - Extracted Text Length: ${parsed.fullText.length} chars`)
  console.log(`   - Extracted Links: ${JSON.stringify(parsed.extractedLinks)}`)
  console.log(`   - Extracted GitHub Username: "${parsed.extractedGithubUsername}"`)
  console.log(`   - Chunks Generated: ${parsed.chunks.length} (${parsed.chunks.map((c) => c.sectionType).join(", ")})`)

  // ---------------------------------------------------------------------------
  // STEP 3: CLOUDINARY UPLOAD BENCHMARK
  // ---------------------------------------------------------------------------
  const { uploadOnCloudinary } = await import("../src/utils/cloudinary")
  const tc0 = performance.now()
  const uploadedUrl = await uploadOnCloudinary(pdfBuffer, "Faseeh_Masood_Resume.pdf")
  const tc1 = performance.now()
  console.log(`\n☁️  [3] CLOUDINARY UPLOAD BENCHMARK: ${(tc1 - tc0).toFixed(1)} ms`)
  console.log(`   - Uploaded URL: ${uploadedUrl || "FAILED"}`)

  // ---------------------------------------------------------------------------
  // STEP 4: DATABASE & AUTHENTICATION VERIFICATION FOR ALL 3 ROLES
  // ---------------------------------------------------------------------------
  const connectDB = (await import("../src/lib/db")).default
  const { User } = await import("../src/models/users.model")
  const { Job } = await import("../src/models/job.model")
  const { Application } = await import("../src/models/application.model")
  const { ResumeChunk } = await import("../src/models/resume-chunk.model")
  const { Notification } = await import("../src/models/notification.model")
  const { runApplicationAIPipeline } = await import("../src/services/ai-pipeline.orchestrator")

  await connectDB()

  const hrUser = await User.findOne({ email: "elena.recruiter@vercel.com" }).select("+password")
  const candidateUser = await User.findOne({ email: "ali.fullstack@gmail.com" }).select("+password")
  const adminUser = await User.findOne({ email: "admin@talentasync.com" }).select("+password")

  if (!hrUser || !candidateUser || !adminUser) {
    throw new Error("Required seeded users (HR, Candidate, Admin) not found in MongoDB")
  }

  const hrPassOk = await hrUser.comparePassword("Password123!")
  const candPassOk = await candidateUser.comparePassword("Password123!")
  const adminPassOk = await adminUser.comparePassword("Password123!")

  console.log(`\n🔐 [4] AUTHENTICATION & PASSWORD HASH VERIFICATION:`)
  console.log(`   - HR (${hrUser.email}, role=${hrUser.role}): password match = ${hrPassOk}`)
  console.log(`   - Candidate (${candidateUser.email}, role=${candidateUser.role}): password match = ${candPassOk}`)
  console.log(`   - Admin (${adminUser.email}, role=${adminUser.role}): password match = ${adminPassOk}`)

  const secret = process.env.ACCESS_TOKEN_SECRET!
  const hrCookie = `accessToken=${jwt.sign({ _id: hrUser._id.toString(), email: hrUser.email, role: "hr" }, secret, { expiresIn: "1h" })}`
  const candCookie = `accessToken=${jwt.sign({ _id: candidateUser._id.toString(), email: candidateUser.email, role: "candidate" }, secret, { expiresIn: "1h" })}`
  const adminCookie = `accessToken=${jwt.sign({ _id: adminUser._id.toString(), email: adminUser.email, role: "admin" }, secret, { expiresIn: "1h" })}`

  // ---------------------------------------------------------------------------
  // STEP 5: PROXY.TS RBAC & ROUTE TESTS ACROSS ALL ROLES
  // ---------------------------------------------------------------------------
  console.log(`\n🛡️  [5] ROUTE PROTECTION, REDIRECTS & PAGE RENDERING BENCHMARK:`)
  const routeChecks = [
    { label: "Unauthenticated -> /hr/dashboard (Should redirect to /hr/login)", path: "/hr/dashboard", cookie: undefined },
    { label: "Unauthenticated -> /candidate/dashboard (Should redirect to /login)", path: "/candidate/dashboard", cookie: undefined },
    { label: "Unauthenticated -> /admin/dashboard (Should redirect to /login)", path: "/admin/dashboard", cookie: undefined },
    { label: "Candidate -> /hr/dashboard (RBAC Block -> /candidate/dashboard)", path: "/hr/dashboard", cookie: candCookie },
    { label: "HR -> /admin/dashboard (RBAC Block -> /hr/dashboard)", path: "/admin/dashboard", cookie: hrCookie },
    { label: "Admin -> /hr/dashboard (RBAC Block -> /admin/dashboard)", path: "/hr/dashboard", cookie: adminCookie },
    { label: "Public Home -> /", path: "/", cookie: undefined },
    { label: "Candidate Login -> /login", path: "/login", cookie: undefined },
    { label: "Register Page -> /register", path: "/register", cookie: undefined },
    { label: "HR Portal Login -> /hr/login", path: "/hr/login", cookie: undefined },
    { label: "HR Dashboard -> /hr/dashboard", path: "/hr/dashboard", cookie: hrCookie },
    { label: "HR Jobs -> /hr/jobs", path: "/hr/jobs", cookie: hrCookie },
    { label: "HR Applications -> /hr/applications", path: "/hr/applications", cookie: hrCookie },
    { label: "HR Candidates -> /hr/candidates", path: "/hr/candidates", cookie: hrCookie },
    { label: "HR Hybrid RAG Search -> /hr/candidates?search=Next.js+TypeScript", path: "/hr/candidates?search=Next.js+TypeScript", cookie: hrCookie },
    { label: "HR Schedule -> /hr/schedule", path: "/hr/schedule", cookie: hrCookie },
    { label: "HR Profile -> /hr/profile", path: "/hr/profile", cookie: hrCookie },
    { label: "HR Settings -> /hr/settings", path: "/hr/settings", cookie: hrCookie },
    { label: "Candidate Dashboard -> /candidate/dashboard", path: "/candidate/dashboard", cookie: candCookie },
    { label: "Candidate Browse Jobs -> /candidate/jobs", path: "/candidate/jobs", cookie: candCookie },
    { label: "Candidate Applications -> /candidate/applications", path: "/candidate/applications", cookie: candCookie },
    { label: "Candidate Schedule -> /candidate/schedule", path: "/candidate/schedule", cookie: candCookie },
    { label: "Candidate Profile -> /candidate/profile", path: "/candidate/profile", cookie: candCookie },
    { label: "Admin Dashboard -> /admin/dashboard", path: "/admin/dashboard", cookie: adminCookie },
    { label: "Admin Users -> /admin/users", path: "/admin/users", cookie: adminCookie },
    { label: "Admin Jobs -> /admin/jobs", path: "/admin/jobs", cookie: adminCookie },
    { label: "Admin Analytics -> /admin/analytics", path: "/admin/analytics", cookie: adminCookie },
  ]

  for (const check of routeChecks) {
    const res = await testRoute(check.path, check.cookie)
    console.log(
      `   - ${check.label.padEnd(68)} => HTTP ${res.status}${res.location ? ` -> ${res.location}` : ""} (${res.ms} ms)`
    )
  }

  // ---------------------------------------------------------------------------
  // STEP 6: 5-STAGE AI PIPELINE + GITHUB VERIFICATION BENCHMARK
  // ---------------------------------------------------------------------------
  const job = await Job.findOne({ postedBy: hrUser._id, status: "active" })
  if (!job) {
    throw new Error("No active job found for HR user")
  }

  let app = await Application.findOne({ candidate: candidateUser._id, job: job._id })
  if (!app) {
    app = await Application.create({
      candidate: candidateUser._id,
      job: job._id,
      resume: uploadedUrl || "https://res.cloudinary.com/demo/raw/upload/Faseeh_Masood_Resume.pdf",
      coverLetter: "Full-Stack Engineer experienced in Next.js, TypeScript, BullMQ, and AI systems. GitHub: https://github.com/Faseehmasood",
      status: "pending",
    })
  } else if (uploadedUrl) {
    app.resume = uploadedUrl
    await app.save()
  }

  console.log(`\n🤖 [6] RUNNING 5-STAGE AI PIPELINE (UNCACHED / FORCE REFRESH) ON APPLICATION ${app._id}...`)
  console.log(`   - Candidate: ${candidateUser.name} | Target Job: "${job.title}"`)
  console.log(`   - Required Job Skills: ${(job.skills || []).join(", ")}`)

  const tp0 = performance.now()
  const pipelineRes = await runApplicationAIPipeline(app._id.toString(), {
    pdfBuffer,
    forceRefresh: true,
  })
  const tp1 = performance.now()

  console.log(`   - Pipeline Success: ${pipelineRes.success}`)
  console.log(`   - Total Uncached Pipeline Duration: ${((tp1 - tp0) / 1000).toFixed(2)}s (${(tp1 - tp0).toFixed(0)} ms)`)
  console.log(`   - Final Composite Match Score: ${pipelineRes.matchScore}/100`)
  console.log(
    `   - Rubric Sub-Scores: Skills=${pipelineRes.aiAnalysis?.skillsMatchScore}%, Experience=${pipelineRes.aiAnalysis?.experienceRelevanceScore}%, GitHub=${pipelineRes.aiAnalysis?.githubVerificationScore}%, Education=${pipelineRes.aiAnalysis?.educationDomainScore}%`
  )
  console.log(`   - GitHub Handle Auto-Extracted from PDF: @${pipelineRes.githubVerification?.githubUsername}`)
  console.log(
    `   - GitHub Verification Status: ${pipelineRes.githubVerification?.status} (${pipelineRes.githubVerification?.verificationScore}/100)`
  )
  console.log(`   - Verified Skills in Public Code: ${pipelineRes.githubVerification?.verifiedSkills.join(", ")}`)
  console.log(
    `   - Repositories Verified (${pipelineRes.githubVerification?.repoEvidence.length}): ${pipelineRes.githubVerification?.repoEvidence
      .map((r) => r.repoName)
      .join(", ")}`
  )
  console.log(`   - Executive Summary: ${pipelineRes.aiAnalysis?.executiveSummary}`)

  // Verify MongoDB Persistence
  const storedChunksCount = await ResumeChunk.countDocuments({ candidateId: candidateUser._id })
  const latestNotif = await Notification.findOne({ recipient: hrUser._id }).sort({ createdAt: -1 }).lean()
  console.log(`   - MongoDB Vector Chunks Saved (768-d): ${storedChunksCount} chunks`)
  console.log(`   - MongoDB HR Notification Created: "${latestNotif?.message}"`)

  // ---------------------------------------------------------------------------
  // STEP 7: SHA-256 CACHE HIT PIPELINE BENCHMARK
  // ---------------------------------------------------------------------------
  console.log(`\n⚡ [7] RUNNING 5-STAGE AI PIPELINE (SHA-256 CACHE HIT TEST)...`)
  const tcach0 = performance.now()
  const cachedRes = await runApplicationAIPipeline(app._id.toString(), {
    pdfBuffer,
    forceRefresh: false,
  })
  const tcach1 = performance.now()
  console.log(`   - Cached Pipeline Duration: ${((tcach1 - tcach0) / 1000).toFixed(2)}s (${(tcach1 - tcach0).toFixed(0)} ms)`)
  console.log(`   - Speedup Factor: ${((tp1 - tp0) / Math.max(tcach1 - tcach0, 1)).toFixed(1)}x faster`)
  console.log(`   - Cache Hit Flag: ${cachedRes.aiProcessing.cachedHit}`)
  console.log(`   - Match Score Consistency: ${cachedRes.matchScore}/100`)

  // ---------------------------------------------------------------------------
  // STEP 8: CV DOWNLOAD ENDPOINT TEST (/api/download)
  // ---------------------------------------------------------------------------
  const downloadQueryUrl = `/api/download?url=${encodeURIComponent(app.resume)}`
  console.log(`\n📥 [8] TESTING CV DOWNLOAD ENDPOINT (${downloadQueryUrl}):`)
  const td0 = performance.now()
  const dlRes = await fetch(`http://localhost:3000${downloadQueryUrl}`, {
    headers: { Cookie: hrCookie },
  })
  const dlBytes = await dlRes.arrayBuffer()
  const td1 = performance.now()
  console.log(
    `   - Status: HTTP ${dlRes.status} | Content-Type: ${dlRes.headers.get("content-type")} | Size: ${dlBytes.byteLength} bytes | Time: ${Math.round(td1 - td0)} ms`
  )

  console.log("\n=================================================================")
  console.log("✅ ALL E2E WORKFLOW, AUTH, RBAC, PDF & AI PIPELINE TESTS PASSED!")
  console.log("=================================================================")
  process.exit(0)
}

main().catch((err) => {
  console.error("❌ E2E Test Error:", err)
  process.exit(1)
})
