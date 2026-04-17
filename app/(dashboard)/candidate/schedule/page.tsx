"use client"

import { CalendarDays, Clock, MapPin, User, Video, Info } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const myInterviews = [
  {
    id: "INT-001",
    jobTitle: "Frontend Developer",
    interviewer: "Sophia Williams",
    date: "Dec 30, 2025",
    time: "09:00 AM - 09:30 AM",
    type: "onsite",
    location: "Floor 4, Tech Plaza, Karachi",
    status: "scheduled"
  },
  {
    id: "INT-002",
    jobTitle: "React Native Developer",
    interviewer: "Ali Ahmed",
    date: "Jan 05, 2026",
    time: "11:00 AM - 12:00 PM",
    type: "remote",
    location: "https://zoom.us/j/123456789",
    status: "scheduled"
  }
]

export default function CandidateSchedulePage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Interview Schedule</h1>
        <p className="text-muted-foreground text-sm">Stay updated on your upcoming meetings with hiring managers.</p>
      </div>

      {/* Info Alert */}
      <div className="bg-primary/5 border border-primary/10 p-4 rounded-2xl flex gap-3 items-start">
        <Info className="w-5 h-5 text-primary mt-0.5" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          Please arrive 10 minutes early for onsite interviews. For remote interviews, ensure your internet connection is stable and use the provided meeting link.
        </p>
      </div>

      {/* Interviews List */}
      <div className="grid gap-4">
        {myInterviews.map((interview) => (
          <Card key={interview.id} className="rounded-3xl border-border overflow-hidden hover:border-primary/30 transition-all shadow-sm">
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row items-stretch">
                
                {/* Date & Time Sidebar */}
                <div className="bg-muted/50 md:w-48 p-6 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-border">
                  <CalendarDays className="w-6 h-6 text-primary mb-2" />
                  <span className="font-bold text-sm">{interview.date}</span>
                  <span className="text-[10px] text-muted-foreground uppercase font-medium mt-1">{interview.time}</span>
                </div>

                {/* Content */}
                <div className="flex-1 p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <Badge variant="outline" className="mb-2 rounded-lg text-[10px] uppercase tracking-widest font-bold border-primary/20 text-primary">
                        {interview.type}
                      </Badge>
                      <h3 className="text-xl font-bold">{interview.jobTitle}</h3>
                    </div>
                    <Badge className="bg-green-100 text-green-700 border-0 rounded-lg capitalize">
                      {interview.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <div className="p-2 bg-background rounded-xl border border-border">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-muted-foreground/60">Interviewer</p>
                        <p className="font-medium text-foreground">{interview.interviewer}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <div className="p-2 bg-background rounded-xl border border-border">
                        {interview.type === 'onsite' ? <MapPin className="w-4 h-4 text-primary" /> : <Video className="w-4 h-4 text-primary" />}
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-muted-foreground/60">
                          {interview.type === 'onsite' ? "Location" : "Meeting Link"}
                        </p>
                        <p className="font-medium text-foreground truncate max-w-[200px]">{interview.location}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action (Join/Map) */}
                <div className="p-6 flex items-center justify-center bg-muted/20 border-t md:border-t-0 md:border-l border-border">
                   {interview.type === 'remote' ? (
                     <Button className="rounded-xl gap-2 px-6 shadow-lg shadow-primary/20">
                        <Video className="w-4 h-4" /> Join Now
                     </Button>
                   ) : (
                     <Button variant="outline" className="rounded-xl gap-2 px-6">
                        <MapPin className="w-4 h-4" /> View Map
                     </Button>
                   )}
                </div>

              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}