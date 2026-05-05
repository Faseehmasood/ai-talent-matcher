"use client"
import { useState } from "react"
import { createInterviewAction } from "@/src/actions/interview.actions"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CalendarDays, Clock, MapPin, Loader2 } from "lucide-react"

export function ScheduleModal({ candidateId, jobId, candidateName, jobTitle }: any) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  // 1. Form State 
  const [formData, setFormData] = useState({
    interviewDate: "",
    startTime: "",
    endTime: "",
    type: "onsite",
    location: "",
    notes: ""
  })

  // 2. Submit Logic 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Data package tayaar karo
    const finalData = {
      ...formData,
      candidateId,
      jobId
    }

    const response = await createInterviewAction(finalData)

    if (response.success) {
      alert(response.message)
      setOpen(false)
    } else {
      alert(response.message || "Failed to schedule")
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="rounded-xl border-primary/30 text-primary hover:bg-primary/5 font-bold">
          Schedule
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px] rounded-[2rem] border-border shadow-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-2xl font-black tracking-tight flex items-center gap-2">
              <CalendarDays className="w-6 h-6 text-primary" /> Schedule Interview
            </DialogTitle>
            <DialogDescription className="font-medium text-xs">
              Booking meeting for <span className="text-foreground font-bold">{candidateName}</span> for the <span className="text-foreground font-bold">{jobTitle}</span> position.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-5 py-6">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Date</Label>
              <Input type="date" required value={formData.interviewDate} onChange={(e)=>setFormData({...formData, interviewDate: e.target.value})} className="rounded-xl h-11 border-border/60" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5"><Clock className="w-3 h-3" /> Start</Label>
                <Input type="time" required value={formData.startTime} onChange={(e)=>setFormData({...formData, startTime: e.target.value})} className="rounded-xl h-11 border-border/60" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5"><Clock className="w-3 h-3" /> End</Label>
                <Input type="time" required value={formData.endTime} onChange={(e)=>setFormData({...formData, endTime: e.target.value})} className="rounded-xl h-11 border-border/60" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Type</Label>
                <select value={formData.type} onChange={(e)=>setFormData({...formData, type: e.target.value})} className="flex h-11 w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none">
                  <option value="onsite">Onsite</option>
                  <option value="remote">Remote</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Location/Link</Label>
                <Input required value={formData.location} onChange={(e)=>setFormData({...formData, location: e.target.value})} placeholder="Room 401 or Zoom Link" className="rounded-xl h-11 border-border/60" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Internal Notes</Label>
              <Textarea value={formData.notes} onChange={(e)=>setFormData({...formData, notes: e.target.value})} placeholder="Bring documents or technical test details..." className="rounded-xl min-h-[80px] border-border/60" />
            </div>
          </div>

          <DialogFooter className="border-t pt-6 border-border/50">
             <Button type="submit" disabled={loading} className="w-full rounded-xl h-12 font-black shadow-lg shadow-primary/20">
               {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Processing...</> : "Confirm & Schedule"}
             </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}