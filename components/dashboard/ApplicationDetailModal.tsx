"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Eye,
  FileText,
  Mail,
  Calendar,
  Download,
  UserCheck,
  UserX,
  Loader2,
  ShieldCheck,
  ShieldAlert,
  HelpCircle,
  ExternalLink,
  Sparkles,
  Award,
  AlertTriangle,
  Database,
  Copy,
  Check,
  CheckCircle2,
  XCircle,
  RefreshCw,
} from "lucide-react"
import { Github } from "@/components/ui/github-icon"
import { Badge } from "@/components/ui/badge"
import {
  updateApplicationStatusAction,
  verifyCandidateGithubAction,
} from "@/src/actions/application.actions"
import { cleanGithubUsername } from "@/lib/utils"

const STAGE_LABELS: Record<string, string> = {
  QUEUED: "Queued (5%)",
  PARSING_PDF: "Parsing PDF (20%)",
  EMBEDDING_CHUNKS: "Embedding 768-d Chunks (45%)",
  VERIFYING_GITHUB: "Verifying GitHub (70%)",
  SCORING_CANDIDATE: "Scoring Candidate (90%)",
  COMPLETED: "Completed (100%)",
  FAILED: "Failed",
}

export function ApplicationDetailModal({
  application,
  hideActions = false,
}: {
  application: any
  hideActions?: boolean
}) {
  const [loading, setLoading] = useState(false)
  const [verifyingGithub, setVerifyingGithub] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState<number | "all" | null>(null)

  const [manualHandle, setManualHandle] = useState(
    application.extractedGithubUsername ||
      application.githubVerification?.githubUsername ||
      application.aiAnalysis?.githubReport?.githubUsername ||
      ""
  )
  const [githubReport, setGithubReport] = useState<any>(
    application.githubVerification ||
      application.aiAnalysis?.githubReport ||
      null
  )
  const [aiAnalysis, setAiAnalysis] = useState<any>(
    application.aiAnalysis || null
  )
  const [aiProcessing, setAiProcessing] = useState<any>(
    application.aiProcessing || null
  )

  // Synchronize local modal state when parent table receives real-time SSE updates
  useEffect(() => {
    if (application.aiAnalysis) {
      setAiAnalysis(application.aiAnalysis)
    }
    if (application.githubVerification || application.aiAnalysis?.githubReport) {
      setGithubReport(
        application.githubVerification || application.aiAnalysis?.githubReport
      )
    }
    if (application.aiProcessing) {
      setAiProcessing(application.aiProcessing)
    }
    const detectedUser =
      application.extractedGithubUsername ||
      application.githubVerification?.githubUsername ||
      application.aiAnalysis?.githubReport?.githubUsername
    if (detectedUser && !manualHandle) {
      setManualHandle(cleanGithubUsername(detectedUser))
    }
  }, [
    application.aiAnalysis,
    application.githubVerification,
    application.aiProcessing,
    application.extractedGithubUsername,
    manualHandle,
  ])

  const handleStatusUpdate = async (newStatus: string) => {
    if (!application.id) return
    setLoading(true)
    const res = await updateApplicationStatusAction(application.id, newStatus)
    if (res.success) {
      window.location.reload()
    } else {
      alert("Error updating status: " + (res.code || "FAILED"))
    }
    setLoading(false)
  }

  const handleRunGithubAudit = async (forceRefresh: boolean = true) => {
    if (!application.id) return
    setVerifyingGithub(true)
    const cleanHandle = cleanGithubUsername(manualHandle)
    if (cleanHandle) {
      setManualHandle(cleanHandle)
    }
    const res = await verifyCandidateGithubAction(
      application.id,
      cleanHandle || undefined,
      forceRefresh
    )
    if (res.success) {
      if (res.report) {
        setGithubReport(res.report)
        if (res.report.githubUsername) {
          setManualHandle(cleanGithubUsername(res.report.githubUsername))
        }
      }
      if (res.aiAnalysis) {
        setAiAnalysis(res.aiAnalysis)
      }
      if (res.aiProcessing) {
        setAiProcessing(res.aiProcessing)
      }
    } else {
      alert(res.message || "AI Scoring & GitHub verification failed")
    }
    setVerifyingGithub(false)
  }

  const handleCopyQuestion = async (text: string, idx: number | "all") => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedIndex(idx)
      setTimeout(() => setCopiedIndex(null), 1800)
    } catch {
      // Ignore clipboard permission errors
    }
  }

  const phoneNumber =
    application.phoneNumber || application.phone || "No Phone Number"

  const statusBadgeColor = (status?: string) => {
    switch (status) {
      case "VERIFIED_PUBLIC":
        return "bg-emerald-100 text-emerald-800 border-emerald-200"
      case "CONTRADICTED":
        return "bg-rose-100 text-rose-800 border-rose-200"
      default:
        return "bg-amber-100 text-amber-800 border-amber-200"
    }
  }

  const seniorityBadgeStyle = (fit?: string) => {
    switch (fit) {
      case "matched":
        return "bg-emerald-100 text-emerald-800 border-emerald-200"
      case "overqualified":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "underqualified":
        return "bg-amber-100 text-amber-800 border-amber-200"
      default:
        return "bg-muted text-muted-foreground border-border"
    }
  }

  const compositeScore =
    typeof aiAnalysis?.matchScore === "number"
      ? aiAnalysis.matchScore
      : typeof application.matchScore === "number"
      ? application.matchScore
      : githubReport?.verificationScore ?? null

  const isPipelineRunning =
    verifyingGithub ||
    (aiProcessing?.status &&
      aiProcessing.status !== "COMPLETED" &&
      aiProcessing.status !== "FAILED")

  const interviewQuestions: string[] =
    aiAnalysis?.suggestedInterviewQuestions?.length > 0
      ? aiAnalysis.suggestedInterviewQuestions
      : githubReport?.targetedInterviewQuestions || []

  const ghProfileHandle = cleanGithubUsername(
    githubReport?.githubUsername ||
    application.extractedGithubUsername ||
    manualHandle
  )

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full hover:bg-primary/5 hover:text-primary transition-all"
        >
          <Eye className="w-4 h-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[780px] rounded-[2.5rem] border-border shadow-2xl p-0 overflow-hidden">
        {/* Header Banner */}
        <div className="bg-primary/5 p-4 sm:p-7 border-b border-border/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-background rounded-2xl flex items-center justify-center font-black text-primary text-lg sm:text-xl border border-border shadow-sm shrink-0">
                {application.initials}
              </div>
              <div>
                <DialogTitle className="text-xl sm:text-2xl font-black tracking-tight">
                  {application.name}
                </DialogTitle>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                  {application.role}
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  <Badge className="bg-blue-100 text-blue-700 border-0 font-bold text-[10px] px-2.5 capitalize">
                    {application.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-primary" />{" "}
                    {application.date}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex sm:flex-col items-end justify-between gap-1.5">
              {compositeScore !== null ? (
                <div
                  className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-2xl font-black text-sm shadow-sm ${
                    compositeScore >= 75
                      ? "bg-emerald-600 text-white"
                      : compositeScore >= 55
                      ? "bg-primary text-primary-foreground"
                      : "bg-amber-600 text-white"
                  }`}
                >
                  <Award className="w-4 h-4" />
                  AI Match: {compositeScore}/100
                </div>
              ) : (
                <Badge
                  variant="outline"
                  className="rounded-xl px-3 py-1 text-[10px] font-black uppercase"
                >
                  Unscored
                </Badge>
              )}

              {githubReport?.status && (
                <Badge
                  variant="outline"
                  className={`rounded-xl px-2.5 py-0.5 text-[9px] font-black uppercase ${statusBadgeColor(
                    githubReport.status
                  )}`}
                >
                  {githubReport.status.replace(/_/g, " ")}
                </Badge>
              )}

              {aiProcessing?.cachedHit && (
                <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-700">
                  <Database className="w-3 h-3" /> SHA-256 Cache Hit
                </div>
              )}
            </div>
          </div>

          {/* Live Pipeline Progress Bar when AI Evaluation is Running */}
          {isPipelineRunning && (
            <div className="mt-4 p-3 rounded-2xl bg-background/90 border border-primary/20 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-primary">
                <span className="flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  {STAGE_LABELS[aiProcessing?.status || "SCORING_CANDIDATE"] ||
                    "Running AI Pipeline..."}
                </span>
                <span>{aiProcessing?.progress ?? 50}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500 rounded-full"
                  style={{ width: `${aiProcessing?.progress ?? 50}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Main Scrollable Scorecard Body */}
        <div className="p-4 sm:p-7 space-y-5 sm:space-y-6 max-h-[74vh] overflow-y-auto">
          {/* Contact Details Row */}
          <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/50 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-bold text-foreground">
              {application.email || "No Email"}
            </span>
            <span className="text-muted-foreground font-medium">
              {phoneNumber}
            </span>
          </div>

          {/* ================================================================= */}
          {/* HR AI COMMAND CENTER SCORECARD (System C)                         */}
          {/* ================================================================= */}
          {aiAnalysis ? (
            <div className="p-5 rounded-3xl border border-border bg-muted/15 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-foreground flex items-center gap-2">
                  <Award className="w-4 h-4 text-primary" /> HR AI Command Center Scorecard (Rubric{" "}
                  {aiAnalysis.rubricVersion || "v1"})
                </h4>

                {aiAnalysis.experienceAnalysis && (
                  <Badge
                    variant="outline"
                    className={`text-[10px] font-black uppercase rounded-xl px-2.5 py-0.5 ${seniorityBadgeStyle(
                      aiAnalysis.experienceAnalysis.seniorityFit
                    )}`}
                  >
                    Seniority: {aiAnalysis.experienceAnalysis.seniorityFit} (
                    {aiAnalysis.experienceAnalysis.relevantYears}y relevant /{" "}
                    {aiAnalysis.experienceAnalysis.claimedYears}y claimed)
                  </Badge>
                )}
              </div>

              {/* 4 Weighted Sub-Score Progress Bars */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-background p-4 rounded-2xl border border-border/60">
                {[
                  {
                    label: "Skills Match (40% Weight)",
                    score: aiAnalysis.skillsMatchScore ?? 0,
                    barClass: "bg-emerald-600",
                  },
                  {
                    label: "Experience Relevance (35% Weight)",
                    score: aiAnalysis.experienceRelevanceScore ?? 0,
                    barClass: "bg-blue-600",
                  },
                  {
                    label: "GitHub Verification (15% Weight)",
                    score: aiAnalysis.githubVerificationScore ?? 70,
                    barClass: "bg-purple-600",
                  },
                  {
                    label: "Education & Domain (10% Weight)",
                    score: aiAnalysis.educationDomainScore ?? 0,
                    barClass: "bg-amber-500",
                  },
                ].map((item) => (
                  <div key={item.label} className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-muted-foreground">
                        {item.label}
                      </span>
                      <span className="font-black text-foreground">
                        {item.score}/100
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${item.barClass}`}
                        style={{
                          width: `${Math.max(0, Math.min(100, item.score))}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Executive Summary & Experience Summary */}
              {(aiAnalysis.executiveSummary ||
                aiAnalysis.experienceAnalysis?.summary) && (
                <div className="p-4 rounded-2xl bg-background border border-border/60 space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary">
                    Executive Assessment
                  </p>
                  {aiAnalysis.executiveSummary && (
                    <p className="text-xs text-foreground leading-relaxed font-medium">
                      {aiAnalysis.executiveSummary}
                    </p>
                  )}
                  {aiAnalysis.experienceAnalysis?.summary && (
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      {aiAnalysis.experienceAnalysis.summary}
                    </p>
                  )}
                </div>
              )}

              {/* Matched Skills vs Missing Critical Skills */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-background border border-border/60 space-y-2">
                  <p className="text-[10px] font-black uppercase text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Matched Skills (
                    {aiAnalysis.matchedSkills?.length || 0})
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {aiAnalysis.matchedSkills?.length > 0 ? (
                      aiAnalysis.matchedSkills.map((s: string) => (
                        <span
                          key={s}
                          className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-200"
                        >
                          {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] text-muted-foreground italic">
                        No direct skill matches detected
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-background border border-border/60 space-y-2">
                  <p className="text-[10px] font-black uppercase text-rose-700 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Missing Critical Skills (
                    {aiAnalysis.missingCriticalSkills?.length || 0})
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {aiAnalysis.missingCriticalSkills?.length > 0 ? (
                      aiAnalysis.missingCriticalSkills.map((s: string) => (
                        <span
                          key={s}
                          className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-lg bg-rose-100 text-rose-800 border border-rose-200"
                        >
                          {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] text-emerald-700 font-semibold">
                        All required job skills covered!
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Strengths & Red Flags */}
              {(aiAnalysis.strengths?.length > 0 ||
                aiAnalysis.redFlags?.length > 0) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-background border border-border/60 space-y-2">
                    <p className="text-[10px] font-black uppercase text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Key Strengths
                    </p>
                    {aiAnalysis.strengths?.length > 0 ? (
                      <ul className="space-y-1.5 text-xs text-foreground/90 list-disc list-inside">
                        {aiAnalysis.strengths.map((str: string, i: number) => (
                          <li key={i} className="leading-relaxed">
                            {str}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-[11px] text-muted-foreground italic">
                        None highlighted
                      </p>
                    )}
                  </div>

                  <div className="p-3.5 rounded-2xl bg-background border border-border/60 space-y-2">
                    <p className="text-[10px] font-black uppercase text-rose-700 flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" /> Red Flags &amp; Risk Notes
                    </p>
                    {aiAnalysis.redFlags?.length > 0 ? (
                      <ul className="space-y-1.5 text-xs text-foreground/90 list-disc list-inside">
                        {aiAnalysis.redFlags.map((flag: string, i: number) => (
                          <li key={i} className="leading-relaxed">
                            {flag}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-[11px] text-emerald-700 font-semibold">
                        Zero red flags identified.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-5 rounded-3xl border border-dashed border-border bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase text-foreground">
                  AI Scorecard Not Yet Generated
                </p>
                <p className="text-xs text-muted-foreground">
                  Trigger the 5-stage AI Scoring &amp; GitHub Cross-Verification pipeline below.
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                onClick={() => handleRunGithubAudit(true)}
                disabled={verifyingGithub}
                className="rounded-xl text-xs font-bold gap-1.5"
              >
                {verifyingGithub ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                Analyze Candidate Now
              </Button>
            </div>
          )}

          {/* ================================================================= */}
          {/* GITHUB CROSS-VERIFICATION CARD (System B)                         */}
          {/* ================================================================= */}
          {application.id && (
            <div className="p-5 rounded-3xl border border-primary/20 bg-primary/5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Github className="w-4 h-4 text-primary" />
                  <h4 className="text-xs font-black uppercase tracking-wider text-foreground">
                    GitHub Cross-Verification Card
                  </h4>
                  {ghProfileHandle && (
                    <a
                      href={`https://github.com/${ghProfileHandle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1"
                    >
                      @{ghProfileHandle}{" "}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                  <Input
                    value={manualHandle}
                    onChange={(e) => setManualHandle(e.target.value)}
                    placeholder="GitHub username (optional)"
                    className="h-8 text-xs rounded-xl w-full sm:w-44 bg-background"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => handleRunGithubAudit(true)}
                    disabled={verifyingGithub}
                    className="h-8 rounded-xl text-xs font-bold gap-1.5 w-full sm:w-auto justify-center"
                  >
                    {verifyingGithub ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <RefreshCw className="w-3.5 h-3.5" />
                    )}
                    {githubReport ? "Re-Analyze AI" : "Score & Verify"}
                  </Button>
                </div>
              </div>

              {githubReport ? (
                <div className="space-y-4 pt-2 border-t border-border/50">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded-2xl bg-background border border-border/60 space-y-1.5">
                      <p className="text-[10px] font-black uppercase text-emerald-700 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" /> Verified in Public Code (
                        {githubReport.verifiedSkills?.length || 0})
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {githubReport.verifiedSkills?.length > 0 ? (
                          githubReport.verifiedSkills.map((s: string) => (
                            <span
                              key={s}
                              className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800"
                            >
                              {s}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-muted-foreground italic">
                            None verified in public repos
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-background border border-border/60 space-y-1.5">
                      <p className="text-[10px] font-black uppercase text-amber-700 flex items-center gap-1">
                        <ShieldAlert className="w-3.5 h-3.5" /> Unverified / Private Claims (
                        {githubReport.unverifiedClaims?.length || 0})
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {githubReport.unverifiedClaims?.length > 0 ? (
                          githubReport.unverifiedClaims.map((s: string) => (
                            <span
                              key={s}
                              className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-800"
                            >
                              {s}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-muted-foreground italic">
                            All required skills verified!
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Verified Authored Repositories */}
                  {githubReport.repoEvidence?.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        Inspected Authored Repositories (Non-Fork)
                      </p>
                      <div className="grid grid-cols-1 gap-2">
                        {githubReport.repoEvidence
                          .slice(0, 4)
                          .map((repo: any) => (
                            <div
                              key={repo.repoName}
                              className="p-3 rounded-2xl bg-background border border-border/60 space-y-1"
                            >
                              <div className="flex items-center justify-between gap-2 flex-wrap">
                                <a
                                  href={repo.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                                >
                                  {repo.repoName}{" "}
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                                <div className="flex flex-wrap gap-1">
                                  {repo.verifiedTech
                                    ?.slice(0, 6)
                                    .map((t: string) => (
                                      <span
                                        key={t}
                                        className="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
                                      >
                                        {t}
                                      </span>
                                    ))}
                                </div>
                              </div>
                              <p className="text-[11px] text-muted-foreground">
                                {repo.EvidenceSummary}
                              </p>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Discrepancy Notes */}
                  {githubReport.discrepancyFlags?.length > 0 && (
                    <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/70 space-y-1">
                      <p className="text-[10px] font-black uppercase text-amber-800">
                        Verification Notes &amp; Discrepancies
                      </p>
                      <ul className="list-disc list-inside text-[11px] text-amber-900 space-y-0.5">
                        {githubReport.discrepancyFlags.map(
                          (flag: string, i: number) => (
                            <li key={i}>{flag}</li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Click <strong>Score &amp; Verify</strong> to inspect the candidate&apos;s public GitHub repositories and dependency manifests.
                </p>
              )}
            </div>
          )}

          {/* ================================================================= */}
          {/* AI-SUGGESTED INTERVIEW QUESTIONS (with Copy-to-Clipboard)         */}
          {/* ================================================================= */}
          {interviewQuestions.length > 0 && (
            <div className="p-5 rounded-3xl border border-border bg-card space-y-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4" /> AI-Suggested Technical Interview Questions
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleCopyQuestion(
                      interviewQuestions
                        .map((q, i) => `${i + 1}. ${q}`)
                        .join("\n"),
                      "all"
                    )
                  }
                  className="h-7 rounded-xl text-[10px] font-bold gap-1"
                >
                  {copiedIndex === "all" ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" /> Copied All
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" /> Copy All
                    </>
                  )}
                </Button>
              </div>

              <div className="space-y-2">
                {interviewQuestions.map((q: string, idx: number) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-muted/30 border border-border/60 flex items-start justify-between gap-3"
                  >
                    <p className="text-xs text-foreground/90 leading-relaxed">
                      <span className="font-black text-primary mr-1.5">
                        Q{idx + 1}.
                      </span>
                      {q}
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopyQuestion(q, idx)}
                      className="h-7 w-7 shrink-0 rounded-lg"
                      title="Copy question"
                    >
                      {copiedIndex === idx ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Candidate's Cover Letter */}
          <div className="space-y-2">
            <h4 className="text-xs font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2">
              <FileText className="w-3 h-3" /> Candidate&apos;s Message
            </h4>
            <div className="p-4 rounded-2xl border border-border/60 bg-card text-sm text-foreground leading-relaxed italic shadow-inner">
              &ldquo;{application.coverLetter || "No message provided."}&rdquo;
            </div>
          </div>

          {/* Primary Actions: Email + Download CV */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            {application.email && (
              <Button
                asChild
                variant="outline"
                className="flex-1 rounded-xl h-11 font-bold border-primary/20 text-primary"
              >
                <a
                  href={`mailto:${application.email}?subject=Interview Update for ${application.role}`}
                >
                  <Mail className="w-4 h-4 mr-2" /> Email Candidate
                </a>
              </Button>
            )}

            {application.resume && (
              <Button
                asChild
                className="flex-[1.5] rounded-xl h-11 font-black shadow-lg shadow-primary/20"
              >
                <a
                  href={`/api/download?url=${encodeURIComponent(
                    application.resume
                  )}`}
                >
                  <Download className="w-4 h-4 mr-2" /> Download CV
                </a>
              </Button>
            )}
          </div>

          {/* Shortlist / Reject Buttons */}
          {!hideActions && application.id && (
            <div className="pt-4 border-t border-border/50 grid grid-cols-2 gap-3">
              <Button
                onClick={() => handleStatusUpdate("shortlisted")}
                disabled={loading}
                variant="outline"
                className="rounded-xl h-11 font-bold text-green-600 border-green-200 hover:bg-green-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <UserCheck className="w-4 h-4 mr-2" />
                )}
                Shortlist
              </Button>
              <Button
                onClick={() => handleStatusUpdate("rejected")}
                disabled={loading}
                variant="outline"
                className="rounded-xl h-11 font-bold text-red-600 border-red-200 hover:bg-red-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <UserX className="w-4 h-4 mr-2" />
                )}
                Reject
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
