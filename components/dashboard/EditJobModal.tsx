"use client"

import { useState } from "react"
import { updateJobAction } from "@/src/actions/job.actions"
import { UpdateJobInput } from "@/src/lib/validations"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Edit3 } from "lucide-react"

export function EditJobModal({ job }: { job: any }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    title: job.title || "",
    company: job.company || "",
    location: job.location || "",
    jobType: (job.jobType || "full-time") as
      | "full-time"
      | "part-time"
      | "remote"
      | "hybrid",
    minSalary: job.salary?.min ?? "",
    maxSalary: job.salary?.max ?? "",
    description: job.description || "",
    status: (job.status || "active") as "active" | "draft" | "closed",
    skills: Array.isArray(job.skills) ? job.skills.join(", ") : "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const finalUpdates: UpdateJobInput = {
      title: formData.title.trim(),
      company: formData.company.trim() || undefined,
      location: formData.location.trim(),
      jobType: formData.jobType,
      description: formData.description.trim(),
      status: formData.status,
      salary: {
        min: Number(formData.minSalary) || 0,
        max: Number(formData.maxSalary) || 0,
        currency: job.salary?.currency || "PKR",
      },
      skills: formData.skills
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean),
    }

    const response = await updateJobAction(job._id, finalUpdates)

    if (response.success) {
      setOpen(false)
    } else {
      alert(response.message || "Failed to update job")
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

      <DialogContent className="sm:max-w-[600px] rounded-3xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Edit Job Posting</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Job Title</Label>
                <Input
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <Label>Company</Label>
                <Input
                  required
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Location</Label>
                <Input
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <Label>Job Type</Label>
                <select
                  value={formData.jobType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      jobType: e.target.value as
                        | "full-time"
                        | "part-time"
                        | "remote"
                        | "hybrid",
                    })
                  }
                  className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Min Salary</Label>
                <Input
                  type="number"
                  min={0}
                  value={formData.minSalary}
                  onChange={(e) => setFormData({ ...formData, minSalary: e.target.value })}
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <Label>Max Salary</Label>
                <Input
                  type="number"
                  min={0}
                  value={formData.maxSalary}
                  onChange={(e) => setFormData({ ...formData, maxSalary: e.target.value })}
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label>Required Skills (comma-separated)</Label>
              <Input
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                placeholder="React, TypeScript, Node.js"
                className="rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <Label>Job Description</Label>
              <Textarea
                rows={4}
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <Label>Job Status</Label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as "active" | "draft" | "closed",
                  })
                }
                className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
              >
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
