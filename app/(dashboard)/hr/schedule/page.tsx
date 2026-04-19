"use client"

import { Clock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
// 1. Action Menu Import kiya ✅
import { InterviewActionMenu } from "@/components/dashboard/InterviewActionMenu"

const scheduledInterviews = [
  {
    id: 1,
    time: "09:00 - 09:30",
    candidate: "Ruben Philips",
    role: "Frontend Developer",
    type: "Onsite",
    status: "pending",
    date: "Today, Dec 30",
  },
  {
    id: 2,
    time: "11:00 - 12:00",
    candidate: "Mirha Fatima",
    role: "React Developer",
    type: "Remote",
    status: "completed",
    date: "Yesterday",
  },
  {
    id: 3,
    time: "02:00 - 03:00",
    candidate: "Ali Ahmed",
    role: "Backend Developer",
    type: "Onsite",
    status: "pending",
    date: "Tomorrow, Dec 31",
  }
]

export default function HRSchedulePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header - Simple and Clean */}
      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold tracking-tight">Interview Schedule</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Your upcoming meetings and interview agenda.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2 px-1">
          <Clock className="w-5 h-5 text-primary" />
          Upcoming Interviews
        </h2>

        {/* Interviews List - Full Width since Summary is gone */}
        <div className="grid gap-4">
          {scheduledInterviews.map((interview) => (
            <Card key={interview.id} className="rounded-2xl border-border overflow-hidden hover:shadow-md transition-all bg-card">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row items-center p-5 gap-4">
                  
                  {/* Time & Date Box */}
                  <div className="w-full md:w-32 flex flex-col items-center justify-center p-3 bg-muted rounded-xl text-center">
                    <span className="text-sm font-bold text-primary">{interview.time}</span>
                    <span className="text-[10px] text-muted-foreground uppercase font-medium">{interview.date}</span>
                  </div>

                  {/* Candidate Info */}
                  <div className="flex-1 flex items-center gap-4">
                    <Avatar className="w-10 h-10 border border-border shadow-sm">
                      <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
                        {interview.candidate.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-bold text-sm text-foreground">{interview.candidate}</h3>
                      <p className="text-xs text-muted-foreground">{interview.role}</p>
                    </div>
                  </div>

                  {/* Type, Status & Actions */}
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className="rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase border-primary/20 text-primary">
                      {interview.type}
                    </Badge>
                    
                    <Badge className={`rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase border-0 ${
                      interview.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {interview.status}
                    </Badge>

                    {/* 🛠️ ASLI DROPDOWN MENU CONNECTED ✅ */}
                    <InterviewActionMenu interview={interview} />
                  </div>

                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}