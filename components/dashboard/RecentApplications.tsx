"use client"

import { useState, useEffect } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Award,
  Loader2,
  Sparkles,
  AlertCircle,
  Radio,
} from "lucide-react"
import { ApplicationDetailModal } from "./ApplicationDetailModal"
import { retriggerAIAnalysisAction } from "@/src/actions/application.actions"

interface RecentApplicationsProps {
  applications: any[]
}

const STAGE_LABELS: Record<string, string> = {
  QUEUED: "Queued (5%)",
  PARSING_PDF: "Parsing PDF (20%)",
  EMBEDDING_CHUNKS: "Embedding 768-d Chunks (45%)",
  VERIFYING_GITHUB: "Verifying GitHub (70%)",
  SCORING_CANDIDATE: "Scoring (90%)",
}

export function RecentApplications({ applications }: RecentApplicationsProps) {
  const [rows, setRows] = useState<any[]>(applications || [])
  const [triggeringIds, setTriggeringIds] = useState<Record<string, boolean>>({})
  const [sseConnected, setSseConnected] = useState(false)

  useEffect(() => {
    setRows(applications || [])
  }, [applications])

  // Subscribe to `/api/sse/events` for live stage transitions and score updates
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
              setRows((prev) =>
                prev.map((app) => {
                  if (String(app._id) !== targetId) return app
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
                    ...(event.payload.githubVerification
                      ? {
                          githubVerification: event.payload.githubVerification,
                        }
                      : {}),
                  }
                })
              )
              if (
                event.type === "AI_PIPELINE_COMPLETED" ||
                event.type === "AI_PIPELINE_FAILED"
              ) {
                setTriggeringIds((prev) => ({ ...prev, [targetId]: false }))
              }
            }
          } catch {
            // Ignore malformed SSE event
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
    setRows((prev) =>
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
    <Card className="rounded-3xl border-border shadow-sm bg-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg font-bold tracking-tight">
            Recently Applied
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Latest candidates with real-time AI pipeline streaming.
          </p>
        </div>
        <Badge
          variant="outline"
          className={`rounded-xl text-[10px] font-bold gap-1.5 ${
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
          {sseConnected ? "Live SSE Stream" : "Connecting..."}
        </Badge>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="px-6 font-bold text-xs uppercase">
                Candidate
              </TableHead>
              <TableHead className="font-bold text-xs uppercase">
                Applied Role
              </TableHead>
              <TableHead className="font-bold text-xs uppercase">
                AI Pipeline &amp; Score
              </TableHead>
              <TableHead className="font-bold text-xs uppercase">
                Status
              </TableHead>
              <TableHead className="text-right px-6 font-bold text-xs uppercase">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length > 0 ? (
              rows.map((app: any) => {
                const appId = String(app._id)
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
                        <Avatar className="w-8 h-8 border border-border">
                          <AvatarFallback className="text-[10px] font-bold bg-primary/5 text-primary">
                            {app.candidate?.name
                              ?.substring(0, 2)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-bold">
                          {app.candidate?.name}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="text-sm font-medium">
                      {app.job?.title}
                    </TableCell>

                    <TableCell>
                      {isRunning ? (
                        <div className="w-44 space-y-1">
                          <div className="flex items-center justify-between text-[10px] font-bold text-primary">
                            <span className="flex items-center gap-1">
                              <Loader2 className="w-3 h-3 animate-spin" />
                              {STAGE_LABELS[proc?.status || "QUEUED"] ||
                                "Processing..."}
                            </span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full bg-primary transition-all duration-500 rounded-full"
                              style={{
                                width: `${proc?.progress ?? 10}%`,
                              }}
                            />
                          </div>
                        </div>
                      ) : compositeScore !== null ? (
                        <div className="flex items-center gap-2">
                          <Badge
                            className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-lg border-0 ${
                              compositeScore >= 75
                                ? "bg-emerald-100 text-emerald-800"
                                : compositeScore >= 55
                                ? "bg-primary/10 text-primary"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            <Award className="w-3 h-3 mr-1" />
                            {compositeScore}% Match
                          </Badge>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          {proc?.status === "FAILED" && (
                            <span className="text-[10px] font-bold text-rose-600 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" /> Failed
                            </span>
                          )}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleRetriggerAI(appId)}
                            className="h-7 rounded-xl text-[10px] font-bold gap-1 border-primary/20 text-primary"
                          >
                            <Sparkles className="w-3 h-3" /> Re-Analyze AI
                          </Button>
                        </div>
                      )}
                    </TableCell>

                    <TableCell>
                      <span
                        className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${statusColor(
                          app.status
                        )}`}
                      >
                        {app.status}
                      </span>
                    </TableCell>

                    <TableCell className="text-right px-6">
                      <ApplicationDetailModal
                        application={{
                          id: app._id,
                          name: app.candidate?.name,
                          role: app.job?.title,
                          email: app.candidate?.email,
                          phoneNumber: app.candidate?.phoneNumber,
                          resume: app.resume,
                          coverLetter: app.coverLetter,
                          status: app.status,
                          matchScore: app.matchScore,
                          extractedGithubUsername:
                            app.extractedGithubUsername,
                          githubVerification: app.githubVerification,
                          aiProcessing: app.aiProcessing,
                          aiAnalysis: app.aiAnalysis,
                          date: new Date(app.createdAt).toLocaleDateString(),
                          initials: app.candidate?.name
                            ?.substring(0, 2)
                            .toUpperCase(),
                        }}
                        hideActions={true}
                      />
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-10 text-muted-foreground"
                >
                  No recent applications found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
