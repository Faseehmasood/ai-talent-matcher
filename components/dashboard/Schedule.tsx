"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Calendar, Clock, CheckCircle2, ChevronDown } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

const tabs = ["Today", "Tomorrow", "This Week"]

const pendingInterviews = [
  {
    id: 1,
    time: "09:00 - 09:30",
    name: "Ruben Philips",
    description: "30 min call meeting Peer <> Leslie",
    date: "December 30, 2025",
    avatars: ["RP", "LE", "JK", "MN"],
  },
]

const completedInterviews = [
  {
    id: 1,
    time: "09:00 - 09:30",
    name: "Ruben Philips",
    description: "30 min call meeting Peer <> Leslie",
    date: "December 30, 2025",
    avatars: ["RP", "LE", "JK"],
  },
  {
    id: 2,
    time: "09:00 - 09:30",
    name: "Ruben Philips",
    description: "30 min call meeting Peer <> Leslie",
    date: "December 30, 2025",
    avatars: ["RP", "LE"],
  },
]

export function Schedule() {
  const [activeTab, setActiveTab] = useState("Today")
  const [pendingOpen, setPendingOpen] = useState(true)
  const [completedOpen, setCompletedOpen] = useState(true)

  return (
    <Card className="rounded-2xl border border-border h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold">Schedule</CardTitle>
          <Calendar className="w-5 h-5 text-muted-foreground" />
        </div>

        {/* Tabs */}
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
        {/* Pending */}
        <div>
          <button
            onClick={() => setPendingOpen(!pendingOpen)}
            className="flex items-center justify-between w-full mb-2"
          >
            <span className="text-sm text-muted-foreground">Pending</span>
            <ChevronDown
              className={cn(
                "w-4 h-4 text-muted-foreground transition-transform",
                !pendingOpen && "-rotate-90"
              )}
            />
          </button>

          {pendingOpen && (
            <div className="space-y-2">
              {pendingInterviews.map((interview) => (
                <div
                  key={interview.id}
                  className="p-3 rounded-xl border border-border bg-card space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {interview.time}
                    </div>
                    <div className="w-4 h-4 rounded-full border border-border" />
                  </div>
                  <p className="text-sm font-medium">
                    Interview with{" "}
                    <span className="font-bold">{interview.name}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {interview.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {interview.date}
                    </span>
                    <div className="flex -space-x-1">
                      {interview.avatars.map((avatar, i) => (
                        <Avatar key={i} className="w-5 h-5 border border-background">
                          <AvatarFallback className="text-[8px]">
                            {avatar}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Completed */}
        <div>
          <button
            onClick={() => setCompletedOpen(!completedOpen)}
            className="flex items-center justify-between w-full mb-2"
          >
            <span className="text-sm text-muted-foreground">Completed</span>
            <ChevronDown
              className={cn(
                "w-4 h-4 text-muted-foreground transition-transform",
                !completedOpen && "-rotate-90"
              )}
            />
          </button>

          {completedOpen && (
            <div className="space-y-2">
              {completedInterviews.map((interview) => (
                <div
                  key={interview.id}
                  className="p-3 rounded-xl border border-border bg-card space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {interview.time}
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  </div>
                  <p className="text-sm font-medium">
                    Interview with{" "}
                    <span className="font-bold">{interview.name}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {interview.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {interview.date}
                    </span>
                    <div className="flex -space-x-1">
                      {interview.avatars.map((avatar, i) => (
                        <Avatar key={i} className="w-5 h-5 border border-background">
                          <AvatarFallback className="text-[8px]">
                            {avatar}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}