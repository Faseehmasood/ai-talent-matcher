"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CalendarDays, Clock, MapPin } from "lucide-react"

interface ScheduleModalProps {
  candidateName: string;
  jobTitle: string;
}

export function ScheduleModal({ candidateName, jobTitle }: ScheduleModalProps) {
  return (
    <Dialog>
      {/* 1. Trigger Button - Jo table mein nazar aaye ga */}
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="rounded-xl border-primary text-primary hover:bg-primary hover:text-white transition-all">
          Schedule
        </Button>
      </DialogTrigger>

      {/* 2. Modal Content */}
      <DialogContent className="sm:max-w-[500px] rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-primary" />
            Schedule Interview
          </DialogTitle>
          <DialogDescription>
            Scheduling interview for <span className="font-bold text-foreground">{candidateName}</span> for the <span className="font-bold text-foreground">{jobTitle}</span> position.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-4">
          {/* Date Picker (Simple Date Input for now) */}
          <div className="space-y-2">
            <Label htmlFor="date">Interview Date</Label>
            <Input id="date" type="date" className="rounded-xl" />
          </div>

          {/* Start & End Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime" className="flex items-center gap-2">
                <Clock className="w-4 h-4" /> Start Time
              </Label>
              <Input id="startTime" type="time" className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime" className="flex items-center gap-2">
                <Clock className="w-4 h-4" /> End Time
              </Label>
              <Input id="endTime" type="time" className="rounded-xl" />
            </div>
          </div>

          {/* Type (Onsite/Remote) */}
          <div className="space-y-2">
            <Label>Interview Type</Label>
            <select className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="onsite">Onsite (at Office)</option>
              <option value="remote">Remote (Online Meeting)</option>
            </select>
          </div>

          {/* Location / Link */}
          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Location or Meeting Link
            </Label>
            <Input id="location" placeholder="Office address or Zoom/Meet link" className="rounded-xl" />
          </div>

          {/* Additional Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes for Candidate</Label>
            <Textarea id="notes" placeholder="Any specific instructions..." className="rounded-xl" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" className="rounded-xl">Cancel</Button>
          <Button className="rounded-xl px-10">Confirm Schedule</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}