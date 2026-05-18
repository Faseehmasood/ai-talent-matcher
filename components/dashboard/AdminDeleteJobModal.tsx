"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash2, AlertOctagon, Loader2 } from "lucide-react"
import { adminDeleteJobAction } from "@/src/actions/job.actions"

export function AdminDeleteJobModal({ job }: { job: any }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [reason, setReason] = useState("")

  const handleDelete = async () => {
    if (!reason.trim() || reason.length < 5) return alert("Please provide a valid reason (min 5 chars) for HR.");

    setLoading(true)
    try {
      const response = await adminDeleteJobAction(job._id, reason)
      
      if (response.success) {
        alert("Job successfully removed and HR notified.")
        setOpen(false)
      } else {
        alert("Error: " + response.message)
      }
    } catch (error) {
      alert("Failed to connect to server.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(val) => { setOpen(val); setReason(""); }}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-red-500 hover:bg-red-50 hover:text-red-700 transition-all">
          <Trash2 className="w-4 h-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[450px] rounded-[2rem] border-border shadow-2xl p-0 overflow-hidden">
        <div className="bg-red-50 p-8 flex flex-col items-center text-center border-b border-red-100">
          <div className="w-16 h-16 bg-red-100 rounded-3xl flex items-center justify-center mb-4 text-red-600 shadow-inner">
            <AlertOctagon className="w-8 h-8" />
          </div>
          <DialogTitle className="text-2xl font-black tracking-tight text-red-900">Remove Job Posting?</DialogTitle>
          <DialogDescription className="text-red-700/70 font-medium mt-1">
            You are about to delete <span className="font-bold text-red-900">"{job.title}"</span>. This action is final.
          </DialogDescription>
        </div>

        <div className="p-8 space-y-4">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
              Reason for Deletion (Sent to HR)
            </Label>
            <Input 
              placeholder="e.g. Duplicate post, False information, Policy violation" 
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="rounded-xl h-12 border-red-100 focus-visible:ring-red-500/20 bg-muted/20 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button variant="ghost" type="button" onClick={() => setOpen(false)} className="rounded-xl font-bold h-12">
               Cancel
            </Button>
            <Button 
              variant="destructive" 
              disabled={loading || reason.length < 5}
              onClick={handleDelete}
              className="rounded-xl font-black h-12 gap-2 shadow-lg shadow-red-500/20"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete Listing"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}