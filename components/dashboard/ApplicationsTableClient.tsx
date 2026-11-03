"use client"

import { useState, useEffect } from "react"
import { ApplicationDetailModal } from "@/components/dashboard/ApplicationDetailModal"
import { ScheduleModal } from "@/components/dashboard/ScheduleModal"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ShieldCheck,
  Award,
  Loader2,
  Sparkles,
  RefreshCw,
  AlertCircle,
  Radio,
} from "lucide-react"
import { Github } from "@/components/ui/github-icon"
import { retriggerAIAnalysisAction } from "@/src/actions/application.actions"

const STAGE_LABELS: Record<string, string> = {
  QUEUED: "Queued (5%)",
  PARSING_PDF: "Parsing PDF (20%)",
  EMBEDDING_CHUNKS: "Embedding 768-d Chunks (45%)",
  VERIFYING_GITHUB: "Verifying GitHub (70%)",
  SCORING_CANDIDATE: "Scoring (90%)",
}

export function ApplicationsTableClient({
  initialApplications,
}: {
  initialApplications: any[]
}) {
  const [applications, setApplications] = useState<any[]>(
    initialApplications || []
  )
  const [triggeringIds, setTriggeringIds] = useState<Record<string, boolean>>({})
  const [sseConnected, setSseConnected] = useState(false)

  useEffect(() => {
    setApplications(initialApplications || [])
  }, [initialApplications])

  // Subscribe to `/api/sse/events` for real-time 5-stage progress bars & score updates
  useEffect(() => {
    let eventSource: EventSource | null = null
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null
    let isUnmounted = false

    const connectSSE = () => {
      if (isUnmounted) return
      try {
        const es = new EventSource("/api/sse/events")
        eventSource = es

        es.onopen = () => {
          setSseConnected(true)
        }

        es.onmessage = (msg) => {
          try {
            const event = JSON.parse(msg.data)
            if (!event?.type || !event?.payload?.applicationId) return
            const targetId = String(event.payload.applicationId)

            if (
              event.type === "AI_PIPELINE_PROGRESS" ||
              event.type === "AI_PIPELINE_COMPLETED" ||
              event.type === "AI_PIPELINE_FAILED"
            ) {
              setApplications((prev) => {
                const updated = prev.map((app) => {
                  if (String(app._id) !== targetId) return app
                  const nextGh =
                    event.payload.githubVerification || app.githubVerification
                  return {
                    ...app,
                    aiProcessing:
                      event.payload.aiProcessing || app.aiProcessing,
                    ...(typeof event.payload.matchScore === "number"
                      ? { matchScore: event.payload.matchScore }
                      : {}),
                    ...(event.payload.aiAnalysis
                      ? { aiAnalysis: event.payload.aiAnalysis }
                      : {}),
                    ...(nextGh ? { githubVerification: nextGh } : {}),
                    ...(nextGh?.githubUsername
                      ? { extractedGithubUsername: nextGh.githubUsername }
                      : {}),
                  }
                })

                if (event.type === "AI_PIPELINE_COMPLETED") {
                  return [...updated].sort(
                    (a, b) => (b.matchScore ?? -1) - (a.matchScore ?? -1)
                  )
                }
                return updated
              })

              if (
                event.type === "AI_PIPELINE_COMPLETED" ||
                event.type === "AI_PIPELINE_FAILED"
              ) {
                setTriggeringIds((prev) => ({ ...prev, [targetId]: false }))
              }
            }
          } catch {
            // Ignore malformed SSE payload
          }
        }

        es.onerror = () => {
          setSseConnected(false)
          es.close()
          if (!isUnmounted) {
            reconnectTimer = setTimeout(connectSSE, 3000)
          }
        }
      } catch {
        setSseConnected(false)
      }
    }

    connectSSE()

    return () => {
      isUnmounted = true
      if (reconnectTimer) clearTimeout(reconnectTimer)
      if (eventSource) eventSource.close()
    }
  }, [])

  const handleRetriggerAI = async (applicationId: string) => {
    setTriggeringIds((prev) => ({ ...prev, [applicationId]: true }))
    setApplications((prev) =>
      prev.map((app) =>
        String(app._id) === applicationId
          ? {
              ...app,
              aiProcessing: {
                status: "QUEUED",
                progress: 5,
                cachedHit: false,
                updatedAt: new Date().toISOString(),
              },
            }
          : app
      )
    )

    const res = await retriggerAIAnalysisAction(applicationId)
    if (!res.success) {
      setTriggeringIds((prev) => ({ ...prev, [applicationId]: false }))
      alert(res.message || "Failed to trigger AI analysis")
    }
  }

  const statusColor = (status: string) => {
    switch (status) {
      case "hired":
        return "bg-green-100 text-green-700"
      case "shortlisted":
        return "bg-blue-100 text-blue-700"
      case "rejected":
        return "bg-red-100 text-red-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">
            Applications Manager
          </h1>
          <p className="text-muted-foreground text-sm">
            You have {applications.length} total applicants ranked by deterministic AI match score.
          </p>
        </div>

        <Badge
          variant="outline"
          className={`w-fit rounded-xl px-3 py-1 text-[10px] font-bold gap-1.5 ${
            sseConnected
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-muted text-muted-foreground"
          }`}
        >
          <Radio
            className={`w-3 h-3 ${
              sseConnected ? "text-emerald-600 animate-pulse" : ""
            }`}
          />
          {sseConnected ? "Real-Time SSE Active" : "Reconnecting SSE..."}
        </Badge>
      </div>

      <Card className="rounded-3xl border-border overflow-hidden shadow-sm bg-card">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/10">
              <TableRow>
                <TableHead className="font-bold px-6">
                  Candidate Details
                </TableHead>
                <TableHead className="font-bold">Target Role</TableHead>
                <TableHead className="font-bold">
                  AI Match &amp; GitHub Audit
                </TableHead>
                <TableHead className="font-bold">Apply Date</TableHead>
                <TableHead className="font-bold">Status</TableHead>
                <TableHead className="text-right px-8 font-bold">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.length > 0 ? (
                applications.map((app: any) => {
                  const appId = String(app._id)
                  const ghReport =
                    app.githubVerification || app.aiAnalysis?.githubReport
                  const ghUser =
                    app.extractedGithubUsername || ghReport?.githubUsername
                  const proc = app.aiProcessing
                  const isRunning =
                    triggeringIds[appId] ||
                    (proc?.status &&
                      proc.status !== "COMPLETED" &&
                      proc.status !== "FAILED")

                  const compositeScore =
                    typeof app.aiAnalysis?.matchScore === "number"
                      ? app.aiAnalysis.matchScore
                      : typeof app.matchScore === "number"
                      ? app.matchScore
                      : null

                  return (
                    <TableRow
                      key={appId}
                      className="border-border hover:bg-muted/5 transition-colors"
                    >
                      <TableCell className="px-6">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-9 h-9 border shadow-sm">
                            <AvatarFallback className="text-[10px] font-bold bg-primary/5 text-primary">
                              {app.candidate?.name
                                ?.substring(0, 2)
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold">
                              {app.candidate?.name}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {app.candidate?.email}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="text-sm font-medium">
                        {app.job?.title}
                      </TableCell>

                      <TableCell>
                        {isRunning ? (
                          <div className="w-52 space-y-1.5">
                            <div className="flex items-center justify-between text-[10px] font-bold text-primary">
                              <span className="flex items-center gap-1">
                                <Loader2 className="w-3 h-3 animate-spin" />
                                {STAGE_LABELS[proc?.status || "QUEUED"] ||
                                  "Processing..."}
                              </span>
                              <span>{proc?.progress ?? 5}%</span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                              <div
                                className="h-full bg-primary transition-all duration-500 rounded-full"
                                style={{
                                  width: `${proc?.progress ?? 5}%`,
                                }}
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {compositeScore !== null ? (
                                <Badge
                                  className={`w-fit text-[9px] font-black uppercase px-2.5 py-0.5 rounded-lg border-0 ${
                                    compositeScore >= 75
                                      ? "bg-emerald-100 text-emerald-800"
                                      : compositeScore >= 55
                                      ? "bg-primary/10 text-primary"
                                      : "bg-amber-100 text-amber-800"
                                  }`}
                                >
                                  <Award className="w-3 h-3 mr-1" />
                                  Match: {compositeScore}/100
                                </Badge>
                              ) : proc?.status === "FAILED" ? (
                                <Badge
                                  variant="outline"
                                  className="w-fit text-[9px] font-black uppercase px-2 py-0.5 rounded-lg bg-rose-100 text-rose-800 border-0"
                                >
                                  <AlertCircle className="w-3 h-3 mr-1" />
                                  AI Failed
                                </Badge>
                              ) : null}

                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRetriggerAI(appId)}
                                className="h-6 px-2 rounded-lg text-[10px] font-bold text-primary hover:bg-primary/10 gap-1"
                                title="Re-run 5-stage AI Evaluation & GitHub Audit"
                              >
                                {compositeScore !== null ? (
                                  <>
                                    <RefreshCw className="w-2.5 h-2.5" /> Re-Analyze AI
                                  </>
                                ) : (
                                  <>
                                    <Sparkles className="w-3 h-3" /> Re-Analyze AI
                                  </>
                                )}
                              </Button>
                            </div>

                            {ghReport ? (
                              <div className="flex items-center gap-1.5">
                                <Badge
                                  variant="outline"
                                  className={`w-fit text-[9px] font-black uppercase px-2 py-0.5 rounded-lg border-0 ${
                                    ghReport.status === "VERIFIED_PUBLIC"
                                      ? "bg-emerald-100 text-emerald-800"
                                      : ghReport.status === "CONTRADICTED"
                                      ? "bg-rose-100 text-rose-800"
                                      : "bg-amber-100 text-amber-800"
                                  }`}
                                >
                                  <ShieldCheck className="w-3 h-3 mr-1" />
                                  GH: {ghReport.verificationScore}% (
                                  {ghReport.status.replace(/_/g, " ")})
                                </Badge>
                                {ghUser && (
                                  <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                                    <Github className="w-2.5 h-2.5" /> @{ghUser}
                                  </span>
                                )}
                              </div>
                            ) : ghUser ? (
                              <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                                <Github className="w-3.5 h-3.5" /> @{ghUser}
                              </span>
                            ) : (
                              <span className="text-[10px] text-muted-foreground italic">
                                Click Re-Analyze AI to score &amp; audit
                              </span>
                            )}
                          </div>
                        )}
                      </TableCell>

                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(app.createdAt).toLocaleDateString("en-GB")}
                      </TableCell>

                      <TableCell>
                        <span
                          className={`text-[10px] px-2.5 py-0.5 rounded-full font-black uppercase border-0 ${statusColor(
                            app.status
                          )}`}
                        >
                          {app.status}
                        </span>
                      </TableCell>

                      <TableCell className="text-right px-6">
                        <div className="flex items-center justify-end gap-2">
                          <ApplicationDetailModal
                            application={{
                              id: app._id,
                              name: app.candidate?.name,
                              email: app.candidate?.email,
                              phoneNumber: app.candidate?.phoneNumber,
                              role: app.job?.title,
                              resume: app.resume,
                              coverLetter: app.coverLetter,
                              status: app.status,
                              matchScore: app.matchScore,
                              extractedGithubUsername:
                                app.extractedGithubUsername,
                              githubVerification: app.githubVerification,
                              aiProcessing: app.aiProcessing,
                              aiAnalysis: app.aiAnalysis,
                              date: new Date(
                                app.createdAt
                              ).toLocaleDateString(),
                              initials: app.candidate?.name
                                ?.substring(0, 2)
                                .toUpperCase(),
                            }}
                          />

                          <ScheduleModal
                            candidateId={app.candidate?._id}
                            jobId={app.job?._id}
                            candidateName={app.candidate?.name}
                            jobTitle={app.job?.title}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-20 text-muted-foreground"
                  >
                    No active applications found in your pipeline.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
