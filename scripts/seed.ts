import fs from "fs"
import path from "path"
import mongoose from "mongoose"
import bcrypt from "bcryptjs"

// 1. Load .env.local variables reliably
const envPath = path.resolve(process.cwd(), ".env.local")
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, "utf-8")
  envConfig.split("\n").forEach((line) => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/)
    if (match) {
      const key = match[1]
      let value = match[2] || ""
      value = value.trim().replace(/^['"](.*)['"]$/, "$1")
      process.env[key] = value
    }
  })
}

// 2. Import Models
import { User } from "../src/models/users.model"
import { Job } from "../src/models/job.model"
import { Application } from "../src/models/application.model"
import { Interview } from "../src/models/interview.model"
import { Notification } from "../src/models/notification.model"
import { ResumeChunk } from "../src/models/resume-chunk.model"

/**
 * Generates an L2-normalized 768-dimension vector (||v|| = 1.0)
 * matching Google's text-embedding-004 specification.
 */
function generateUnitEmbedding(seedText: string): number[] {
  const vec: number[] = new Array(768).fill(0)
  let hash = 0
  for (let i = 0; i < seedText.length; i++) {
    hash = (hash << 5) - hash + seedText.charCodeAt(i)
    hash |= 0
  }
  let sumSq = 0
  for (let i = 0; i < 768; i++) {
    const val = Math.sin(hash + i * 1.61803398875)
    vec[i] = val
    sumSq += val * val
  }
  const norm = Math.sqrt(sumSq) || 1
  return vec.map((v) => Number((v / norm).toFixed(6)))
}

async function runSeed() {
  const mongoUri = process.env.MONGODB_URI
  const dbName = process.env.DB_NAME || "talentasync"

  if (!mongoUri) {
    console.error("❌ MONGODB_URI is not defined in .env.local")
    process.exit(1)
  }

  console.log("🚀 Connecting to MongoDB Atlas...")
  await mongoose.connect(mongoUri, { dbName })
  console.log("✅ Connected successfully to database:", dbName)

  // Default plain-text password (Mongoose pre-save hook will hash it with bcrypt 10 rounds)
  const defaultPassword = "Password123!"

  console.log("🧹 Cleaning up old demo seed records...")
  const demoEmailRegex = /@(stripe\.com|meta\.com|vercel\.com|demotalent\.io)$/i
  const demoCandidateEmails = [
    "ali.fullstack@gmail.com",
    "zain.ai@gmail.com",
    "bilal.devops@gmail.com",
    "sarah.frontend@gmail.com",
    "david.systems@gmail.com",
    "ayesha.junior@gmail.com",
    "marcus.fullstack@gmail.com",
    "fatima.ml@gmail.com",
    "omar.cloud@gmail.com",
    "john.doe.web@gmail.com",
    "admin@talentasync.com",
  ]

  // Find demo users to clean up related data
  const existingDemoUsers = await User.find({
    $or: [{ email: { $in: demoCandidateEmails } }, { email: demoEmailRegex }],
  }).select("_id")
  const demoUserIds = existingDemoUsers.map((u) => u._id)

  if (demoUserIds.length > 0) {
    const demoJobs = await Job.find({ postedBy: { $in: demoUserIds } }).select("_id")
    const demoJobIds = demoJobs.map((j) => j._id)

    await Promise.all([
      Application.deleteMany({
        $or: [{ candidate: { $in: demoUserIds } }, { job: { $in: demoJobIds } }],
      }),
      Interview.deleteMany({
        $or: [
          { candidate: { $in: demoUserIds } },
          { interviewer: { $in: demoUserIds } },
        ],
      }),
      ResumeChunk.deleteMany({ candidateId: { $in: demoUserIds } }),
      Notification.deleteMany({
        $or: [{ recipient: { $in: demoUserIds } }, { sender: { $in: demoUserIds } }],
      }),
      Job.deleteMany({ postedBy: { $in: demoUserIds } }),
      User.deleteMany({ _id: { $in: demoUserIds } }),
    ])
  }

  console.log("👤 Creating Admin & HR Managers...")
  // 1. Super Admin
  const admin = await User.create({
    name: "Platform Administrator",
    email: "admin@talentasync.com",
    password: defaultPassword,
    role: "admin",
    phoneNumber: "+1 555 019 2831",
    bio: "Chief Talent Architect & Platform Administrator at TalentaSync.",
    isActive: true,
  })

  // 2. HR Managers
  const hrSarah = await User.create({
    name: "Sarah Jenkins",
    email: "sarah.tech@stripe.com",
    password: defaultPassword,
    role: "hr",
    phoneNumber: "+1 415 892 4110",
    bio: "Head of Technical Talent & FinTech Engineering at Stripe.",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    isActive: true,
  })

  const hrAlex = await User.create({
    name: "Alex Rivera",
    email: "alex.hr@meta.com",
    password: defaultPassword,
    role: "hr",
    phoneNumber: "+1 650 334 9912",
    bio: "Principal AI Talent Partner for Llama & Applied GenAI at Meta.",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80",
    isActive: true,
  })

  const hrElena = await User.create({
    name: "Elena Rostova",
    email: "elena.recruiter@vercel.com",
    password: defaultPassword,
    role: "hr",
    phoneNumber: "+1 212 443 8901",
    bio: "Staff Technical Recruiter for Next.js, v0 & Edge Compute at Vercel.",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    isActive: true,
  })

  console.log("💼 Creating Realistic Tech Job Postings (including Full-Stack JavaScript, React, Next.js, Supabase, Docker)...")
  // 3. Jobs
  const jobFullStackSupabase = await Job.create({
    title: "Senior Full-Stack Engineer (Next.js & Supabase)",
    company: "Vercel Partner Labs",
    location: "Remote (Global)",
    salary: { min: 95000, max: 135000, currency: "USD" },
    jobType: "remote",
    status: "active",
    postedBy: hrElena._id,
    skills: ["JavaScript", "TypeScript", "React", "Next.js", "Supabase", "Docker", "Node.js", "TailwindCSS"],
    description:
      "We are seeking an exceptional Senior Full-Stack Engineer to architect modern cloud applications. The ideal candidate has deep expertise in React 19, Next.js App Router, Supabase (PostgreSQL, Row-Level Security, Realtime subscriptions), and containerized microservices using Docker.",
  })

  const jobFullStackDocker = await Job.create({
    title: "Full-Stack Platform Engineer (React & Docker)",
    company: "Stripe",
    location: "Hybrid (San Francisco, CA)",
    salary: { min: 110000, max: 155000, currency: "USD" },
    jobType: "hybrid",
    status: "active",
    postedBy: hrSarah._id,
    skills: ["JavaScript", "React", "Node.js", "Docker", "PostgreSQL", "Redis", "TypeScript", "REST APIs"],
    description:
      "Join Stripe's Merchant Checkout platform team. You will build highly reliable, PCI-compliant web workflows utilizing React on the frontend, Node.js microservices wrapped in Docker containers, and high-performance Redis caching pipelines.",
  })

  const jobAIEngineer = await Job.create({
    title: "Lead Applied AI / LLM Engineer",
    company: "Meta AI",
    location: "Remote",
    salary: { min: 140000, max: 185000, currency: "USD" },
    jobType: "remote",
    status: "active",
    postedBy: hrAlex._id,
    skills: ["Python", "PyTorch", "LLMs", "RAG", "Vector Databases", "FastAPI", "Docker"],
    description:
      "Meta AI is seeking an Applied AI Architect to build multi-agent RAG pipelines, fine-tune open models, and deploy low-latency inference endpoints with Docker and Kubernetes.",
  })

  const jobFrontendArchitect = await Job.create({
    title: "Staff Frontend Architect (Next.js & Design Systems)",
    company: "Vercel Partner Labs",
    location: "Remote",
    salary: { min: 120000, max: 160000, currency: "USD" },
    jobType: "remote",
    status: "active",
    postedBy: hrElena._id,
    skills: ["JavaScript", "TypeScript", "React", "Next.js", "TailwindCSS", "Framer Motion", "Design Systems"],
    description:
      "Lead our design system engineering. Craft micro-animations with Framer Motion, implement accessible Radix UI primitives, and optimize Core Web Vitals across millions of user sessions.",
  })

  const jobDevOps = await Job.create({
    title: "Senior DevOps & Cloud Architect",
    company: "Stripe",
    location: "Remote",
    salary: { min: 115000, max: 150000, currency: "USD" },
    jobType: "remote",
    status: "active",
    postedBy: hrSarah._id,
    skills: ["Docker", "Kubernetes", "AWS", "Terraform", "CI/CD", "Linux", "Prometheus"],
    description:
      "Oversee multi-region Kubernetes clusters and Docker-based CI/CD pipelines. Ensure 99.999% availability, zero-downtime deployments, and automated failovers across AWS regions.",
  })

  const jobBackendDistributed = await Job.create({
    title: "Distributed Systems Go Engineer",
    company: "Stripe",
    location: "Onsite (New York, NY)",
    salary: { min: 130000, max: 175000, currency: "USD" },
    jobType: "full-time",
    status: "active",
    postedBy: hrSarah._id,
    skills: ["Go", "Kafka", "PostgreSQL", "Microservices", "Docker", "gRPC", "Redis"],
    description:
      "Design ultra-low-latency financial ledgers handling over 10,000 transactions per second using Go, Apache Kafka, and Docker containers.",
  })

  const jobJuniorWeb = await Job.create({
    title: "Associate Web Developer (React & JavaScript)",
    company: "Vercel Partner Labs",
    location: "Remote",
    salary: { min: 55000, max: 75000, currency: "USD" },
    jobType: "remote",
    status: "active",
    postedBy: hrElena._id,
    skills: ["JavaScript", "React", "HTML5", "CSS3", "Git", "TailwindCSS"],
    description:
      "Great opportunity for an ambitious junior engineer to level up in React, JavaScript, modern component libraries, and Git collaborative workflows.",
  })

  const jobAIEngineerFullStack = await Job.create({
    title: "AI Product Engineer (Next.js, Gemini & Supabase)",
    company: "Meta AI",
    location: "Hybrid (New York, NY)",
    salary: { min: 125000, max: 165000, currency: "USD" },
    jobType: "hybrid",
    status: "active",
    postedBy: hrAlex._id,
    skills: ["Next.js", "React", "TypeScript", "Supabase", "Gemini API", "Docker", "Python"],
    description:
      "Build generative AI user experiences. Integrate Gemini 2.5 Flash models with Next.js frontend interfaces, Supabase database backends, and Docker containerized services.",
  })

  console.log("👨‍💻 Creating Diverse Candidate Profiles...")
  // 4. Candidates
  const candAli = await User.create({
    name: "Ali Khan",
    email: "ali.fullstack@gmail.com",
    password: defaultPassword,
    role: "candidate",
    phoneNumber: "+92 300 8472910",
    bio: "Senior Full-Stack Engineer with 6+ years shipping high-scale React, Next.js, and Supabase apps in Dockerized containers.",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    skills: ["JavaScript", "TypeScript", "React", "Next.js", "Supabase", "Docker", "Node.js", "PostgreSQL"],
    isActive: true,
  })

  const candZain = await User.create({
    name: "Zain Malik",
    email: "zain.ai@gmail.com",
    password: defaultPassword,
    role: "candidate",
    phoneNumber: "+92 321 9841234",
    bio: "Applied AI Engineer specialized in Retrieval-Augmented Generation (RAG), Gemini & PyTorch integration.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    skills: ["Python", "PyTorch", "LLMs", "RAG", "FastAPI", "Docker", "Vector Search"],
    isActive: true,
  })

  const candBilal = await User.create({
    name: "Bilal Ahmed",
    email: "bilal.devops@gmail.com",
    password: defaultPassword,
    role: "candidate",
    phoneNumber: "+92 333 4567890",
    bio: "Senior DevOps & Cloud Engineer with deep Kubernetes and Docker infrastructure mastery.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    skills: ["Docker", "Kubernetes", "AWS", "Terraform", "CI/CD", "Linux"],
    isActive: true,
  })

  const candSarahC = await User.create({
    name: "Sarah Connor",
    email: "sarah.frontend@gmail.com",
    password: defaultPassword,
    role: "candidate",
    phoneNumber: "+1 555 432 9988",
    bio: "Staff Frontend Designer crafting high-performance interactive interfaces with Next.js and Tailwind.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    skills: ["JavaScript", "React", "Next.js", "TailwindCSS", "CSS3", "Framer Motion"],
    isActive: true,
  })

  const candDavid = await User.create({
    name: "David Chen",
    email: "david.systems@gmail.com",
    password: defaultPassword,
    role: "candidate",
    phoneNumber: "+1 415 678 1234",
    bio: "Distributed systems backend architect building payment ledgers in Go and Kafka.",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
    skills: ["Go", "Kafka", "Docker", "PostgreSQL", "gRPC", "Microservices", "Redis"],
    isActive: true,
  })

  const candAyesha = await User.create({
    name: "Ayesha Tariq",
    email: "ayesha.junior@gmail.com",
    password: defaultPassword,
    role: "candidate",
    phoneNumber: "+92 345 1122334",
    bio: "Junior Web Developer eager to contribute to React and JavaScript client applications.",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    skills: ["JavaScript", "React", "HTML5", "CSS3", "Git"],
    isActive: true,
  })

  const candMarcus = await User.create({
    name: "Marcus Vance",
    email: "marcus.fullstack@gmail.com",
    password: defaultPassword,
    role: "candidate",
    phoneNumber: "+1 312 901 4455",
    bio: "Full-Stack developer building real-time dashboards with Supabase, Next.js, and Docker.",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
    skills: ["JavaScript", "React", "Next.js", "Supabase", "Docker", "Node.js"],
    isActive: true,
  })

  const candFatima = await User.create({
    name: "Fatima Noor",
    email: "fatima.ml@gmail.com",
    password: defaultPassword,
    role: "candidate",
    phoneNumber: "+92 312 7788990",
    bio: "AI Product Engineer with expertise in Google Gemini APIs, Python, and Supabase.",
    avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&auto=format&fit=crop&q=80",
    skills: ["Python", "FastAPI", "Docker", "PostgreSQL", "Gemini API", "Supabase", "Next.js"],
    isActive: true,
  })

  const candOmar = await User.create({
    name: "Omar Farooq",
    email: "omar.cloud@gmail.com",
    password: defaultPassword,
    role: "candidate",
    phoneNumber: "+92 301 2233445",
    bio: "Cloud Systems Engineer with strong Linux and Docker container infrastructure knowledge.",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    skills: ["Docker", "AWS", "CI/CD", "JavaScript", "Node.js", "Linux"],
    isActive: true,
  })

  const candJohn = await User.create({
    name: "John Doe",
    email: "john.doe.web@gmail.com",
    password: defaultPassword,
    role: "candidate",
    phoneNumber: "+1 555 123 4567",
    bio: "Web Developer exploring React and modern JavaScript web technologies.",
    avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
    skills: ["JavaScript", "HTML5", "CSS3", "React"],
    isActive: true,
  })

  console.log("📄 Submitting Applications with Rich AI Scorecards & Evaluations...")
  // 5. Applications
  const samplePdfUrl = "https://res.cloudinary.com/dln1m2k6t/image/upload/v1740000000/resumes/sample_candidate_cv.pdf"

  // Ali Khan -> Full Stack Next.js & Supabase (Score: 95 - Top Match)
  const appAli1 = await Application.create({
    job: jobFullStackSupabase._id,
    candidate: candAli._id,
    resume: samplePdfUrl,
    coverLetter: "I have built multiple production SaaS platforms utilizing Next.js 15 App Router, Supabase PostgreSQL with RLS, and containerized Docker services. I would love to contribute to Vercel Partner Labs.",
    status: "shortlisted",
    matchScore: 95,
    resumeHash: "hash_ali_fullstack_2026",
    extractedGithubUsername: "facebook",
    extractedLinks: ["https://github.com/facebook", "https://linkedin.com/in/alidev"],
    ocrUsed: false,
    githubVerification: {
      status: "VERIFIED_PUBLIC",
      verificationScore: 92,
      githubUsername: "facebook",
      verifiedSkills: ["JavaScript", "TypeScript", "React", "Next.js", "Docker"],
      unverifiedClaims: ["Supabase"],
      repoEvidence: [
        { repoName: "react", language: "JavaScript", stars: 220000, description: "The library for web and native user interfaces." },
        { repoName: "lexical", language: "TypeScript", stars: 18000, description: "An extensible text editor framework." },
      ],
      summary: "Candidate exhibits exceptional, verified authorship in core JavaScript, React, and TypeScript repositories.",
      interviewQuestions: [
        "How do you implement Row-Level Security (RLS) in Supabase when using server actions in Next.js?",
        "Describe your Docker multi-stage build optimization for a production Next.js standalone server.",
      ],
    },
    aiProcessing: { status: "COMPLETED", progress: 100, cachedHit: true, updatedAt: new Date() },
    aiAnalysis: {
      matchScore: 95,
      skillsMatchScore: 98,
      experienceRelevanceScore: 94,
      githubVerificationScore: 92,
      educationDomainScore: 90,
      matchedSkills: ["JavaScript", "TypeScript", "React", "Next.js", "Supabase", "Docker", "Node.js", "TailwindCSS"],
      missingCriticalSkills: [],
      experienceAnalysis: {
        claimedYears: 6,
        relevantYears: 6,
        seniorityFit: "matched",
        summary: "6+ years of verified high-scale full-stack architecture matching all core requirements.",
      },
      strengths: [
        "Proven expertise in Next.js App Router and React modern patterns.",
        "Production experience with Supabase and PostgreSQL.",
        "Demonstrated Docker container orchestration skills.",
      ],
      redFlags: [],
      executiveSummary: "Outstanding candidate with a near-perfect match across all technical disciplines. Strongly recommended for technical interview.",
      suggestedInterviewQuestions: [
        "Can you walk through your caching strategy when combining Next.js revalidation with Supabase Realtime?",
        "How do you handle connection pooling with Supabase PostgreSQL under burst traffic?",
      ],
    },
  })

  // Marcus Vance -> Full Stack Next.js & Supabase (Score: 88)
  const appMarcus = await Application.create({
    job: jobFullStackSupabase._id,
    candidate: candMarcus._id,
    resume: samplePdfUrl,
    coverLetter: "Excited to apply. I specialize in Next.js and Supabase database schema design.",
    status: "reviewing",
    matchScore: 88,
    resumeHash: "hash_marcus_fullstack_2026",
    extractedGithubUsername: "marcusvance",
    ocrUsed: false,
    githubVerification: {
      status: "VERIFIED_PUBLIC",
      verificationScore: 85,
      githubUsername: "marcusvance",
      verifiedSkills: ["JavaScript", "React", "Next.js", "Node.js"],
      unverifiedClaims: ["Docker"],
      repoEvidence: [
        { repoName: "next-saas-starter", language: "TypeScript", stars: 45, description: "Full-stack starter kit with Next.js and Supabase." },
      ],
      summary: "Solid public repositories exhibiting Next.js and React full-stack code.",
      interviewQuestions: [
        "Tell us about a time you optimized a slow Supabase PostgreSQL query.",
      ],
    },
    aiProcessing: { status: "COMPLETED", progress: 100, cachedHit: false, updatedAt: new Date() },
    aiAnalysis: {
      matchScore: 88,
      skillsMatchScore: 90,
      experienceRelevanceScore: 85,
      githubVerificationScore: 85,
      educationDomainScore: 88,
      matchedSkills: ["JavaScript", "React", "Next.js", "Supabase", "Node.js"],
      missingCriticalSkills: ["Docker"],
      experienceAnalysis: { claimedYears: 4, relevantYears: 4, seniorityFit: "matched", summary: "4 years of relevant SaaS full-stack development." },
      strengths: ["Clean component structure in Next.js", "Good database schema intuition"],
      redFlags: ["Docker production deployment experience is unverified in public code"],
      executiveSummary: "Strong full-stack candidate with solid Next.js and Supabase knowledge. Test containerization skills during technical round.",
      suggestedInterviewQuestions: [
        "How do you configure Docker Compose for local Supabase and Next.js development?",
      ],
    },
  })

  // Ali Khan -> React & Docker at Stripe (Score: 92)
  const appAli2 = await Application.create({
    job: jobFullStackDocker._id,
    candidate: candAli._id,
    resume: samplePdfUrl,
    coverLetter: "Applying for the Full-Stack Platform Engineer role at Stripe. Extensive experience in Docker microservices and React.",
    status: "hired",
    matchScore: 92,
    resumeHash: "hash_ali_stripe_2026",
    extractedGithubUsername: "facebook",
    aiProcessing: { status: "COMPLETED", progress: 100, cachedHit: true, updatedAt: new Date() },
    aiAnalysis: {
      matchScore: 92,
      skillsMatchScore: 95,
      experienceRelevanceScore: 90,
      githubVerificationScore: 92,
      educationDomainScore: 90,
      matchedSkills: ["JavaScript", "React", "Node.js", "Docker", "PostgreSQL", "Redis", "TypeScript"],
      missingCriticalSkills: [],
      experienceAnalysis: { claimedYears: 6, relevantYears: 5.5, seniorityFit: "matched", summary: "Strong distributed full-stack experience." },
      strengths: ["High-throughput Node.js microservices", "Solid Docker containerization"],
      redFlags: [],
      executiveSummary: "Excellent candidate who successfully passed all evaluation stages and has been extended an offer.",
      suggestedInterviewQuestions: ["Describe your experience implementing idempotent payment processing APIs."],
    },
  })

  // Zain Malik -> Lead AI Engineer at Meta (Score: 94)
  const appZain = await Application.create({
    job: jobAIEngineer._id,
    candidate: candZain._id,
    resume: samplePdfUrl,
    coverLetter: "Meta AI's open-source vision aligns perfectly with my research in RAG architectures.",
    status: "shortlisted",
    matchScore: 94,
    resumeHash: "hash_zain_ai_2026",
    extractedGithubUsername: "zain-ai-research",
    githubVerification: {
      status: "VERIFIED_PUBLIC",
      verificationScore: 90,
      githubUsername: "zain-ai-research",
      verifiedSkills: ["Python", "PyTorch", "RAG", "FastAPI", "Docker"],
      unverifiedClaims: [],
      repoEvidence: [
        { repoName: "rag-eval-framework", language: "Python", stars: 340, description: "Evaluation framework for multi-agent RAG pipelines." },
      ],
      summary: "Verified public Python and PyTorch contributions.",
      interviewQuestions: ["How do you solve semantic dilution in vector chunking?"],
    },
    aiProcessing: { status: "COMPLETED", progress: 100, cachedHit: false, updatedAt: new Date() },
    aiAnalysis: {
      matchScore: 94,
      skillsMatchScore: 96,
      experienceRelevanceScore: 92,
      githubVerificationScore: 90,
      educationDomainScore: 95,
      matchedSkills: ["Python", "PyTorch", "LLMs", "RAG", "Vector Databases", "FastAPI", "Docker"],
      missingCriticalSkills: [],
      experienceAnalysis: { claimedYears: 5, relevantYears: 5, seniorityFit: "matched", summary: "5 years dedicated to AI/ML systems." },
      strengths: ["Deep RAG knowledge", "Hands-on vector search indexing experience"],
      redFlags: [],
      executiveSummary: "Top-tier AI researcher with excellent hands-on engineering capability.",
      suggestedInterviewQuestions: ["Compare HNSW vs IVF indexing in high-dimensional vector spaces."],
    },
  })

  // Sarah Connor -> Frontend Architect at Vercel (Score: 96)
  const appSarahC = await Application.create({
    job: jobFrontendArchitect._id,
    candidate: candSarahC._id,
    resume: samplePdfUrl,
    coverLetter: "Passionate about building world-class design systems with Tailwind and Radix UI.",
    status: "shortlisted",
    matchScore: 96,
    aiProcessing: { status: "COMPLETED", progress: 100, cachedHit: true, updatedAt: new Date() },
    aiAnalysis: {
      matchScore: 96,
      skillsMatchScore: 98,
      experienceRelevanceScore: 95,
      githubVerificationScore: 94,
      educationDomainScore: 92,
      matchedSkills: ["JavaScript", "TypeScript", "React", "Next.js", "TailwindCSS", "Framer Motion"],
      missingCriticalSkills: [],
      experienceAnalysis: { claimedYears: 7, relevantYears: 7, seniorityFit: "matched", summary: "7 years of frontend architecture." },
      strengths: ["Design system mastery", "Performance and accessibility focus"],
      redFlags: [],
      executiveSummary: "Exceptional frontend leader who fits Vercel's design and engineering culture.",
      suggestedInterviewQuestions: ["How do you architect theme providers to eliminate light/dark mode flash in Next.js?"],
    },
  })

  // Bilal Ahmed -> DevOps at Stripe (Score: 91)
  const appBilal = await Application.create({
    job: jobDevOps._id,
    candidate: candBilal._id,
    resume: samplePdfUrl,
    coverLetter: "I specialize in automated zero-downtime Kubernetes deployments and Docker orchestration.",
    status: "reviewing",
    matchScore: 91,
    aiProcessing: { status: "COMPLETED", progress: 100, cachedHit: false, updatedAt: new Date() },
    aiAnalysis: {
      matchScore: 91,
      skillsMatchScore: 94,
      experienceRelevanceScore: 90,
      githubVerificationScore: 88,
      educationDomainScore: 90,
      matchedSkills: ["Docker", "Kubernetes", "AWS", "Terraform", "CI/CD", "Linux"],
      missingCriticalSkills: [],
      experienceAnalysis: { claimedYears: 5, relevantYears: 5, seniorityFit: "matched", summary: "5 years of cloud platform engineering." },
      strengths: ["Multi-region AWS expertise", "Robust Terraform modularity"],
      redFlags: [],
      executiveSummary: "Dependable cloud architect ready for production site-reliability roles.",
      suggestedInterviewQuestions: ["Explain how you handle stateful set migrations in Kubernetes with zero data loss."],
    },
  })

  // David Chen -> Distributed Systems Go at Stripe (Score: 93)
  const appDavid = await Application.create({
    job: jobBackendDistributed._id,
    candidate: candDavid._id,
    resume: samplePdfUrl,
    coverLetter: "Excited about Stripe's distributed ledger challenges. Strong background in Go, Kafka, and Redis.",
    status: "shortlisted",
    matchScore: 93,
    aiProcessing: { status: "COMPLETED", progress: 100, cachedHit: false, updatedAt: new Date() },
    aiAnalysis: {
      matchScore: 93,
      skillsMatchScore: 96,
      experienceRelevanceScore: 92,
      githubVerificationScore: 90,
      educationDomainScore: 92,
      matchedSkills: ["Go", "Kafka", "PostgreSQL", "Microservices", "Docker", "gRPC", "Redis"],
      missingCriticalSkills: [],
      experienceAnalysis: { claimedYears: 6, relevantYears: 6, seniorityFit: "matched", summary: "6 years building low-latency financial systems." },
      strengths: ["High concurrent Go goroutine profiling", "Distributed transaction management"],
      redFlags: [],
      executiveSummary: "Strong fit for financial ledger engineering.",
      suggestedInterviewQuestions: ["How do you prevent split-brain scenarios in Kafka consumer groups?"],
    },
  })

  // Ayesha Tariq -> Junior Web Developer (Score: 85 - High potential)
  const appAyesha = await Application.create({
    job: jobJuniorWeb._id,
    candidate: candAyesha._id,
    resume: samplePdfUrl,
    coverLetter: "Looking for an opportunity to contribute my React and modern JavaScript skills in a fast-paced team.",
    status: "reviewing",
    matchScore: 85,
    aiProcessing: { status: "COMPLETED", progress: 100, cachedHit: false, updatedAt: new Date() },
    aiAnalysis: {
      matchScore: 85,
      skillsMatchScore: 88,
      experienceRelevanceScore: 82,
      githubVerificationScore: 80,
      educationDomainScore: 85,
      matchedSkills: ["JavaScript", "React", "HTML5", "CSS3", "Git"],
      missingCriticalSkills: [],
      experienceAnalysis: { claimedYears: 1.5, relevantYears: 1.5, seniorityFit: "matched", summary: "1.5 years of practical React frontends." },
      strengths: ["Fast learner", "Clean modern CSS and Tailwind usage"],
      redFlags: [],
      executiveSummary: "Promising associate developer with strong foundational web skills.",
      suggestedInterviewQuestions: ["Explain the difference between useEffect and useMemo in React."],
    },
  })

  // Fatima Noor -> AI Product Engineer at Meta (Score: 90)
  const appFatima = await Application.create({
    job: jobAIEngineerFullStack._id,
    candidate: candFatima._id,
    resume: samplePdfUrl,
    coverLetter: "I bridge Next.js frontends with Gemini AI backends and Supabase databases.",
    status: "shortlisted",
    matchScore: 90,
    aiProcessing: { status: "COMPLETED", progress: 100, cachedHit: false, updatedAt: new Date() },
    aiAnalysis: {
      matchScore: 90,
      skillsMatchScore: 92,
      experienceRelevanceScore: 88,
      githubVerificationScore: 88,
      educationDomainScore: 90,
      matchedSkills: ["Next.js", "React", "TypeScript", "Supabase", "Gemini API", "Docker", "Python"],
      missingCriticalSkills: [],
      experienceAnalysis: { claimedYears: 4, relevantYears: 4, seniorityFit: "matched", summary: "4 years building AI-driven web apps." },
      strengths: ["End-to-end full-stack plus AI API integration", "Supabase authentication and data modeling"],
      redFlags: [],
      executiveSummary: "Great product intuition for user-facing generative AI tools.",
      suggestedInterviewQuestions: ["How do you stream responses from the Gemini API directly to a Next.js client component?"],
    },
  })

  // John Doe -> Full-Stack Supabase (Score: 42 - Rejected / Low Fit for comparison)
  const appJohn = await Application.create({
    job: jobFullStackSupabase._id,
    candidate: candJohn._id,
    resume: samplePdfUrl,
    coverLetter: "Hi, I know some JavaScript and HTML. Hope to get this role.",
    status: "rejected",
    matchScore: 42,
    aiProcessing: { status: "COMPLETED", progress: 100, cachedHit: false, updatedAt: new Date() },
    aiAnalysis: {
      matchScore: 42,
      skillsMatchScore: 45,
      experienceRelevanceScore: 35,
      githubVerificationScore: 40,
      educationDomainScore: 50,
      matchedSkills: ["JavaScript"],
      missingCriticalSkills: ["TypeScript", "Next.js", "Supabase", "Docker", "Node.js"],
      experienceAnalysis: { claimedYears: 1, relevantYears: 0.5, seniorityFit: "underqualified", summary: "Lacks senior engineering depth." },
      strengths: ["Basic HTML/CSS knowledge"],
      redFlags: ["Missing 5 out of 6 core required technologies"],
      executiveSummary: "Candidate is underqualified for this senior level role. Recommended for entry level positions.",
      suggestedInterviewQuestions: [],
    },
  })

  console.log("🧬 Generating 768-d Vector Embeddings & Resume Chunks...")
  // 6. Resume Chunks (Vector Search testing)
  const chunksToCreate = [
    {
      candidateId: candAli._id,
      jobId: jobFullStackSupabase._id,
      applicationId: appAli1._id,
      resumeHash: "hash_ali_fullstack_2026",
      sectionType: "experience" as const,
      chunkIndex: 0,
      chunkText:
        "Senior Full-Stack Engineer at TechCorp (2021-Present): Architected and deployed production web applications utilizing React 19, Next.js App Router, and Supabase PostgreSQL with Row-Level Security. Containerized all microservices using Docker and orchestrated zero-downtime deployment pipelines.",
      extractedLinks: ["https://github.com/facebook"],
      extractedGithubUsername: "facebook",
      embedding: generateUnitEmbedding(
        "Full-Stack Engineer React Next.js Supabase Docker JavaScript TypeScript PostgreSQL"
      ),
      embeddingModel: "text-embedding-004",
    },
    {
      candidateId: candAli._id,
      jobId: jobFullStackSupabase._id,
      applicationId: appAli1._id,
      resumeHash: "hash_ali_fullstack_2026",
      sectionType: "skills" as const,
      chunkIndex: 1,
      chunkText:
        "Technical Skills: JavaScript, TypeScript, React, Next.js, Supabase, Docker, Node.js, Express, PostgreSQL, Redis, TailwindCSS, Git, CI/CD.",
      extractedLinks: [],
      embedding: generateUnitEmbedding(
        "Technical Skills JavaScript TypeScript React Next.js Supabase Docker Node.js PostgreSQL Redis"
      ),
      embeddingModel: "text-embedding-004",
    },
    {
      candidateId: candMarcus._id,
      jobId: jobFullStackSupabase._id,
      applicationId: appMarcus._id,
      resumeHash: "hash_marcus_fullstack_2026",
      sectionType: "experience" as const,
      chunkIndex: 0,
      chunkText:
        "Full-Stack Web Developer at SaaS Studio (2022-Present): Developed customer-facing web apps with Next.js and Supabase database. Managed real-time state with Zustand and integrated REST APIs.",
      extractedLinks: [],
      embedding: generateUnitEmbedding(
        "Full-Stack Web Developer Next.js Supabase React JavaScript SaaS REST API"
      ),
      embeddingModel: "text-embedding-004",
    },
    {
      candidateId: candZain._id,
      jobId: jobAIEngineer._id,
      applicationId: appZain._id,
      resumeHash: "hash_zain_ai_2026",
      sectionType: "experience" as const,
      chunkIndex: 0,
      chunkText:
        "AI Research Engineer at DeepData (2020-Present): Designed high-throughput RAG systems using vector databases and PyTorch. Integrated Google Gemini and OpenAI models for real-time document analysis.",
      extractedLinks: ["https://github.com/zain-ai-research"],
      extractedGithubUsername: "zain-ai-research",
      embedding: generateUnitEmbedding(
        "AI Research Engineer RAG PyTorch LLMs Vector Search Python FastAPI Docker"
      ),
      embeddingModel: "text-embedding-004",
    },
    {
      candidateId: candSarahC._id,
      jobId: jobFrontendArchitect._id,
      applicationId: appSarahC._id,
      resumeHash: "hash_sarahc_frontend_2026",
      sectionType: "experience" as const,
      chunkIndex: 0,
      chunkText:
        "Staff Frontend Engineer at DesignLabs (2019-Present): Architected accessible component libraries using Next.js, React, TailwindCSS, and Framer Motion for over 2 million monthly active users.",
      extractedLinks: [],
      embedding: generateUnitEmbedding(
        "Staff Frontend Engineer Next.js React TailwindCSS Framer Motion Design Systems TypeScript"
      ),
      embeddingModel: "text-embedding-004",
    },
    {
      candidateId: candDavid._id,
      jobId: jobBackendDistributed._id,
      applicationId: appDavid._id,
      resumeHash: "hash_david_systems_2026",
      sectionType: "experience" as const,
      chunkIndex: 0,
      chunkText:
        "Distributed Systems Engineer at CloudLedger (2019-Present): Built event-driven transaction processing engines handling 10k+ TPS with Go, Apache Kafka, gRPC, and Docker containerized deployments.",
      extractedLinks: [],
      embedding: generateUnitEmbedding(
        "Distributed Systems Engineer Go Kafka Docker PostgreSQL gRPC Redis Microservices"
      ),
      embeddingModel: "text-embedding-004",
    },
  ]

  await ResumeChunk.insertMany(chunksToCreate)

  console.log("📅 Scheduling Realistic Calendar Interviews...")
  // 7. Interviews
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 14, 0, 0)
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 10, 30, 0)
  const inThreeDays = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3, 16, 0, 0)
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 11, 0, 0)

  await Interview.create([
    {
      job: jobFullStackSupabase._id,
      candidate: candAli._id,
      interviewer: hrElena._id,
      interviewDate: today,
      startTime: "02:00 PM",
      endTime: "03:00 PM",
      type: "remote",
      location: "https://meet.google.com/abc-talent-test",
      status: "scheduled",
      notes: "Technical deep-dive on Next.js App Router and Supabase RLS security.",
    },
    {
      job: jobAIEngineer._id,
      candidate: candZain._id,
      interviewer: hrAlex._id,
      interviewDate: tomorrow,
      startTime: "10:30 AM",
      endTime: "11:30 AM",
      type: "remote",
      location: "https://meet.google.com/meta-ai-interview",
      status: "scheduled",
      notes: "Discussion on multi-agent RAG vector chunking architectures.",
    },
    {
      job: jobFrontendArchitect._id,
      candidate: candSarahC._id,
      interviewer: hrElena._id,
      interviewDate: inThreeDays,
      startTime: "04:00 PM",
      endTime: "04:45 PM",
      type: "remote",
      location: "https://meet.google.com/vercel-design-review",
      status: "scheduled",
      notes: "Design system architectural review and portfolio showcase.",
    },
    {
      job: jobFullStackDocker._id,
      candidate: candAli._id,
      interviewer: hrSarah._id,
      interviewDate: yesterday,
      startTime: "11:00 AM",
      endTime: "12:00 PM",
      type: "remote",
      location: "https://meet.google.com/stripe-checkout-eng",
      status: "completed",
      notes: "Completed final executive debrief. Extended official offer letter.",
    },
  ])

  console.log("🔔 Creating Notification Alerts...")
  // 8. Notifications
  await Notification.create([
    {
      recipient: hrElena._id,
      sender: candAli._id,
      message: "New 95% Match Applicant: Ali Khan applied for Senior Full-Stack Engineer (Next.js & Supabase)",
      link: "/hr/applications",
      type: "success",
      isRead: false,
    },
    {
      recipient: hrAlex._id,
      sender: candZain._id,
      message: "New 94% Match Applicant: Zain Malik applied for Lead Applied AI / LLM Engineer",
      link: "/hr/applications",
      type: "success",
      isRead: false,
    },
    {
      recipient: admin._id,
      sender: hrElena._id,
      message: "New Job Posted: Senior Full-Stack Engineer (Next.js & Supabase) by Elena Rostova",
      link: "/admin/jobs",
      type: "info",
      isRead: false,
    },
    {
      recipient: candAli._id,
      sender: hrElena._id,
      message: "Congratulations! Your interview for Senior Full-Stack Engineer is confirmed for Today at 02:00 PM.",
      link: "/candidate/schedule",
      type: "success",
      isRead: false,
    },
  ])

  console.log("\n========================================================")
  console.log("🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!")
  console.log("========================================================")
  console.log("🔑 READY-TO-USE TEST LOGINS (Password for ALL is 'Password123!'):")
  console.log("--------------------------------------------------------")
  console.log("👑 ADMIN:")
  console.log("   Email: admin@talentasync.com")
  console.log("   URL:   http://localhost:3000/admin/dashboard\n")
  console.log("💼 HR MANAGERS:")
  console.log("   1. Elena Rostova (Vercel Partner Labs): elena.recruiter@vercel.com")
  console.log("   2. Sarah Jenkins (Stripe):               sarah.tech@stripe.com")
  console.log("   3. Alex Rivera   (Meta AI):              alex.hr@meta.com")
  console.log("   URL: http://localhost:3000/hr/dashboard\n")
  console.log("👨‍💻 CANDIDATES:")
  console.log("   1. Ali Khan (Senior Full-Stack Next.js/Supabase/Docker): ali.fullstack@gmail.com")
  console.log("   2. Zain Malik (Applied AI & LLMs):                     zain.ai@gmail.com")
  console.log("   3. Sarah Connor (Staff Frontend Design Systems):        sarah.frontend@gmail.com")
  console.log("   URL: http://localhost:3000/candidate/dashboard")
  console.log("========================================================\n")

  await mongoose.disconnect()
  console.log("🔌 Database disconnected gracefully.")
}

runSeed().catch((err) => {
  console.error("❌ Seeding failed with error:", err)
  process.exit(1)
})
