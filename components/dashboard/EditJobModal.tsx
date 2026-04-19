"use client"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Edit3 } from "lucide-react"

export function EditJobModal({ job }: { job: any }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-muted">
          <Edit3 className="w-4 h-4 text-blue-500" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] rounded-3xl border-border shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Edit Job Posting</DialogTitle>
          <DialogDescription>Update the details for "{job.title}" position.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Job Title</Label>
              <Input defaultValue={job.title} className="rounded-xl h-11 border-border/60" />
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Input defaultValue={job.location} className="rounded-xl h-11 border-border/60" />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea 
              defaultValue={job.description || "We are looking for a pro developer..."} 
              className="rounded-xl min-h-[100px] border-border/60" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* 🛠️ FIX 1: Corrected defaultValue to job.status */}
            <div className="space-y-2">
              <Label>Status</Label>
              <select 
                defaultValue={job.status} 
                className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none cursor-pointer"
              >
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            {/* 🛠️ FIX 2: Removed 'selected' from options and used defaultValue on select */}
            <div className="space-y-2">
              <Label>Job Type</Label>
              <select 
                defaultValue={job.jobType} 
                className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none cursor-pointer"
              >
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
          </div>
        </div>

        <DialogFooter className="border-t pt-4 border-border/50">
          <Button variant="outline" className="rounded-xl">Cancel</Button>
          <Button className="rounded-xl bg-blue-600 hover:bg-blue-700 px-8 font-bold text-white shadow-lg shadow-blue-500/20">
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}