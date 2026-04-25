"use client"
import { useState } from "react"
import { updateJobAction } from "@/src/actions/job.actions" //  Action import kiya
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Edit3, Loader2 } from "lucide-react"

export function EditJobModal({ job }: { job: any }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  // 1. Initial State mein purana data bharo 
  const [formData, setFormData] = useState({
    title: job.title,
    location: job.location,
    jobType: job.jobType,
    minSalary: job.salary?.min || "",
    maxSalary: job.salary?.max || "",
    description: job.description || "",
    status: job.status,
    skills: job.skills?.join(", ") || "" // Array to String
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Data format as per Zod
    const finalUpdates = {
      ...formData,
      salary: {
        min: Number(formData.minSalary),
        max: Number(formData.maxSalary),
        currency: "PKR"
      },
      skills: formData.skills.split(",").map((s: string) => s.trim())
    }

    const response = await updateJobAction(job._id, finalUpdates)

    if (response.success) {
      alert("Job Updated Successfully! ✨")
      setOpen(false)
    } else {
      alert(response.message || "Failed to update")
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-muted">
          <Edit3 className="w-4 h-4 text-blue-500" />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[600px] rounded-3xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Edit Job Posting</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
             {/* ... Inputs (Wahi jo Create Modal mein thay, bas value=formData se bind honge) ... */}
             {/* Title example: */}
             <div className="space-y-1">
                <Label>Job Title</Label>
                <Input value={formData.title} onChange={(e)=>setFormData({...formData, title: e.target.value})} className="rounded-xl" />
             </div>
             
             {/* Status Selection (Very Important for Edit) */}
             <div className="space-y-1">
                <Label>Job Status</Label>
                <select value={formData.status} onChange={(e)=>setFormData({...formData, status: e.target.value})} className="...">
                   <option value="active">Active</option>
                   <option value="draft">Draft</option>
                   <option value="closed">Closed</option>
                </select>
             </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={loading} className="rounded-xl px-8">
              {loading ? "Updating..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}