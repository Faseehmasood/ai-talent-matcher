"use client"

import { Calendar, Clock, CheckCircle2, MoreVertical, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Interview Schedule</h1>
          <p className="text-muted-foreground">Manage and track all your candidate meetings.</p>
        </div>
        <Button className="gap-2 rounded-xl">
          <Plus className="w-4 h-4" />
          Add Event
        </Button>
      </div>

      {/* Grid Layout: Calendar + List */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Side: Interviews List (2 Columns) */}
        <div className="xl:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Upcoming Interviews
          </h2>

          <div className="grid gap-4">
            {scheduledInterviews.map((interview) => (
              <Card key={interview.id} className="rounded-2xl border-border overflow-hidden hover:shadow-md transition-all">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row items-center p-5 gap-4">
                    {/* Time & Date Box */}
                    <div className="w-full md:w-32 flex flex-col items-center justify-center p-3 bg-muted rounded-xl">
                      <span className="text-sm font-bold text-primary">{interview.time}</span>
                      <span className="text-[10px] text-muted-foreground uppercase">{interview.date}</span>
                    </div>

                    {/* Candidate Info */}
                    <div className="flex-1 flex items-center gap-3">
                      <Avatar className="w-10 h-10 border border-border">
                        <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
                          {interview.candidate.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-bold text-sm">{interview.candidate}</h3>
                        <p className="text-xs text-muted-foreground">{interview.role}</p>
                      </div>
                    </div>

                    {/* Type & Status */}
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className="rounded-lg px-2 py-0.5 text-[10px] font-medium border-primary/20 text-primary">
                        {interview.type}
                      </Badge>
                      <Badge className={`rounded-lg px-2 py-0.5 text-[10px] font-medium border-0 capitalize ${
                        interview.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {interview.status}
                      </Badge>
                      <Button variant="ghost" size="icon" className="rounded-full">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Right Side: Mini Calendar / Stats (1 Column) */}
        <div className="space-y-6">
          <Card className="rounded-3xl border-border bg-primary/5 border-none">
            <CardHeader>
              <CardTitle className="text-sm font-bold">Schedule Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center bg-background p-3 rounded-2xl shadow-sm">
                <span className="text-xs text-muted-foreground font-medium">Total Interviews</span>
                <span className="text-lg font-bold">12</span>
              </div>
              <div className="flex justify-between items-center bg-background p-3 rounded-2xl shadow-sm">
                <span className="text-xs text-muted-foreground font-medium">Pending Today</span>
                <span className="text-lg font-bold text-orange-500">03</span>
              </div>
              <div className="flex justify-between items-center bg-background p-3 rounded-2xl shadow-sm">
                <span className="text-xs text-muted-foreground font-medium">Completed This Week</span>
                <span className="text-lg font-bold text-green-500">08</span>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  )
}