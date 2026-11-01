"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Calendar, Clock, CheckCircle2, ChevronDown } from "lucide-react"
import { useEffect, useState, useMemo } from "react"
import { cn } from "@/lib/utils"
import { getMyScheduleAction } from "@/src/actions/interview.actions"

const tabs = ["Today", "Tomorrow", "This Week"] as const
type TabType = (typeof tabs)[number]

export function Schedule({ initialInterviews }: { initialInterviews?: any[] }) {
  const [activeTab, setActiveTab] = useState<TabType>("Today")
  const [pendingOpen, setPendingOpen] = useState(true)
  const [completedOpen, setCompletedOpen] = useState(true)
  const [interviews, setInterviews] = useState<any[]>(initialInterviews || [])

  useEffect(() => {
    if (initialInterviews) {
      setInterviews(initialInterviews)
      return
    }
    let mounted = true
    getMyScheduleAction().then((res) => {
      if (mounted && res.success && res.interviews) {
        setInterviews(res.interviews)
      }
    })
    return () => {
      mounted = false
    }
  }, [initialInterviews])

  const filteredInterviews = useMemo(() => {
    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfTomorrow = new Date(startOfToday)
    startOfTomorrow.setDate(startOfTomorrow.getDate() + 1)
    const endOfTomorrow = new Date(startOfTomorrow)
    endOfTomorrow.setDate(endOfTomorrow.getDate() + 1)
    const endOfWeek = new Date(startOfToday)
    endOfWeek.setDate(endOfWeek.getDate() + 7)

    return interviews.filter((item) => {
      const d = new Date(item.interviewDate)
      if (activeTab === "Today") {
        return d >= startOfToday && d < startOfTomorrow
      }
      if (activeTab === "Tomorrow") {
        return d >= startOfTomorrow && d < endOfTomorrow
      }
      return d >= startOfToday && d <= endOfWeek
    })
  }, [interviews, activeTab])

  const pendingInterviews = filteredInterviews.filter((i) => i.status !== "completed")
  const completedInterviews = filteredInterviews.filter((i) => i.status === "completed")

  return (
    <Card className="rounded-2xl border border-border h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold">Schedule</CardTitle>
          <Calendar className="w-5 h-5 text-muted-foreground" />
        </div>

        <div className="flex gap-1 bg-muted rounded-lg p-1 mt-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "flex-1 text-xs py-1.5 rounded-md transition-all",
                activeTab === tab
                  ? "bg-background font-medium shadow-sm"
                  : "text-muted-foreground"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <button
            onClick={() => setPendingOpen(!pendingOpen)}
            className="flex items-center justify-between w-full mb-2"
          >
            <span className="text-sm text-muted-foreground">
              Pending ({pendingInterviews.length})
            </span>
            <ChevronDown
              className={cn(
                "w-4 h-4 text-muted-foreground transition-transform",
                !pendingOpen && "-rotate-90"
              )}
            />
          </button>

          {pendingOpen && (
            <div className="space-y-2">
              {pendingInterviews.length > 0 ? (
                pendingInterviews.map((interview) => {
                  const personName =
                    interview.candidate?.name || interview.interviewer?.name || "Participant"
                  const initials = personName.substring(0, 2).toUpperCase()
                  return (
                    <div
                      key={interview._id}
                      className="p-3 rounded-xl border border-border bg-card space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {interview.startTime} ({interview.duration || "45 mins"})
                        </div>
                        <div className="w-4 h-4 rounded-full border border-border" />
                      </div>
                      <p className="text-sm font-medium">
                        Interview with <span className="font-bold">{personName}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {interview.job?.title || "Role Interview"} ({interview.type})
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {new Date(interview.interviewDate).toLocaleDateString()}
                        </span>
                        <Avatar className="w-5 h-5 border border-background">
                          <AvatarFallback className="text-[8px]">{initials}</AvatarFallback>
                        </Avatar>
                      </div>
                    </div>
                  )
                })
              ) : (
                <p className="text-xs text-muted-foreground py-2">
                  No pending interviews for {activeTab.toLowerCase()}.
                </p>
              )}
            </div>
          )}
        </div>

        <div>
          <button
            onClick={() => setCompletedOpen(!completedOpen)}
            className="flex items-center justify-between w-full mb-2"
          >
            <span className="text-sm text-muted-foreground">
              Completed ({completedInterviews.length})
            </span>
            <ChevronDown
              className={cn(
                "w-4 h-4 text-muted-foreground transition-transform",
                !completedOpen && "-rotate-90"
              )}
            />
          </button>

          {completedOpen && (
            <div className="space-y-2">
              {completedInterviews.length > 0 ? (
                completedInterviews.map((interview) => {
                  const personName =
                    interview.candidate?.name || interview.interviewer?.name || "Participant"
                  const initials = personName.substring(0, 2).toUpperCase()
                  return (
                    <div
                      key={interview._id}
                      className="p-3 rounded-xl border border-border bg-card space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {interview.startTime}
                        </div>
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      </div>
                      <p className="text-sm font-medium">
                        Interview with <span className="font-bold">{personName}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {interview.job?.title || "Role Interview"}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {new Date(interview.interviewDate).toLocaleDateString()}
                        </span>
                        <Avatar className="w-5 h-5 border border-background">
                          <AvatarFallback className="text-[8px]">{initials}</AvatarFallback>
                        </Avatar>
                      </div>
                    </div>
                  )
                })
              ) : (
                <p className="text-xs text-muted-foreground py-2">
                  No completed interviews for {activeTab.toLowerCase()}.
                </p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
