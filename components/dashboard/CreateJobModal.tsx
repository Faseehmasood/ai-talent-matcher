"use client"

import { useState } from "react"
import { createJobAction } from "@/src/actions/job.actions" //  Action import kiya
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { PlusCircle, Loader2 } from "lucide-react"

export function CreateJobModal() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  
  // 1. Form State Define karo 
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    jobType: "full-time",
    minSalary: "",
    maxSalary: "",
    description: "",
    skills: "" // Hum isay comma-separated string lenge phir array banayenge
  })

  // 2. Submit Logic 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    //  DATA FORMATTING: Backend ke mutabiq dhalo 
    const finalData = {
      title: formData.title,
      company: formData.company,
      location: formData.location,
      jobType: formData.jobType,
      description: formData.description,
      salary: {
        min: Number(formData.minSalary),
        max: Number(formData.maxSalary),
        currency: "PKR"
      },
      skills: formData.skills.split(",").map(s => s.trim()) // String to Array
    }

    const response = await createJobAction(finalData)

    if (response.success) {
      alert("Job Posted Successfully!")
      setOpen(false) // Modal band kar do
      setFormData({ title: "", company: "", location: "", jobType: "full-time", minSalary: "", maxSalary: "", description: "", skills: "" }) // Reset form
    } else {
      alert(response.message || "Failed to post job. Check all fields.")
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 rounded-xl">
          <PlusCircle className="w-4 h-4" /> Create Job
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[600px] rounded-3xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Post a New Job</DialogTitle>
            <DialogDescription>Fill in the details to publish your job listing.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Job Title</Label>
                <Input required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="rounded-xl" />
              </div>
              <div className="space-y-1">
                <Label>Company</Label>
                <Input required value={formData.company} onChange={(e) => setFormData({...formData, company: e.target.value})} className="rounded-xl" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Location</Label>
                <Input required value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className="rounded-xl" />
              </div>
              <div className="space-y-1">
                <Label>Job Type</Label>
                <select 
                  value={formData.jobType} 
                  onChange={(e) => setFormData({...formData, jobType: e.target.value})}
                  className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                >
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Min Salary</Label>
                <Input required type="number" value={formData.minSalary} onChange={(e) => setFormData({...formData, minSalary: e.target.value})} className="rounded-xl" />
              </div>
              <div className="space-y-1">
                <Label>Max Salary</Label>
                <Input required type="number" value={formData.maxSalary} onChange={(e) => setFormData({...formData, maxSalary: e.target.value})} className="rounded-xl" />
              </div>
            </div>

            <div className="space-y-1">
              <Label>Skills (Comma separated)</Label>
              <Input required placeholder="React, Node, MongoDB" value={formData.skills} onChange={(e) => setFormData({...formData, skills: e.target.value})} className="rounded-xl" />
            </div>

            <div className="space-y-1">
              <Label>Description</Label>
              <Textarea required value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="rounded-xl min-h-[80px]" />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => setOpen(false)} className="rounded-xl">Cancel</Button>
            <Button type="submit" disabled={loading} className="rounded-xl px-8">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Posting...</> : "Post Job"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}