"use client"

import { useState } from "react"
import { applyForJobAction } from "@/src/actions/application.actions" // Asli Action
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  UploadCloud, 
  Send, 
  Loader2, 
  FileCheck, 
  MapPin, 
  DollarSign, 
  Briefcase,
  AlertCircle
} from "lucide-react"

export function JobViewAndApplyModal({ job }: { job: any }) {
  const [step, setStep] = useState<"view" | "apply">("view")
  const [loading, setLoading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [coverLetter, setCoverLetter] = useState("")

  // ASLI SUBMIT LOGIC 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Basic frontend checks
    if (!file) return alert("Please upload your resume first!")
    if (file.type !== "application/pdf") return alert("Only PDF files are allowed!")

    setLoading(true)
    
    try {
      //  MULTIPART DATA: Files hamesha FormData mein jati hain 
      const formData = new FormData()
      formData.append("jobId", job._id)
      formData.append("coverLetter", coverLetter)
      formData.append("resume", file)

      const response = await applyForJobAction(formData)

      if (response.success) {
        alert("Application sent successfully to " + job.company + "! 🎉")
        setStep("view")
        setFile(null)
        setCoverLetter("")
        window.location.reload() // UI Sync (Counts update ho jayenge)
      } else {
        alert(response.message || "Failed to apply. You might have already applied.")
      }
    } catch (error) {
      alert("An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog onOpenChange={() => {
      setStep("view")
      setFile(null)
      setCoverLetter("")
    }}>
      <DialogTrigger asChild>
        <Button className="w-full rounded-2xl h-11 group/btn gap-2 shadow-lg shadow-primary/20 transition-all font-bold">
          View & Apply 
          <Send className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[600px] rounded-[2rem] border-border shadow-2xl p-0 overflow-hidden">
        {step === "view" ? (
          <div className="flex flex-col h-full">
            {/* JOB VIEW SECTION */}
            <div className="bg-primary/5 p-8 border-b border-border/50">
               <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-background rounded-2xl flex items-center justify-center font-black text-primary text-2xl border border-border shadow-sm">
                    {job.company?.substring(0, 1)}
                  </div>
                  <div>
                    <DialogTitle className="text-2xl font-black tracking-tight">{job.title}</DialogTitle>
                    <p className="text-muted-foreground font-semibold flex items-center gap-1.5">
                      <Briefcase className="w-4 h-4" /> {job.company}
                    </p>
                  </div>
               </div>
            </div>

            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-muted/50 p-4 rounded-2xl space-y-1">
                    <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Location</p>
                    <p className="text-sm font-bold flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" /> {job.location}</p>
                 </div>
                 <div className="bg-muted/50 p-4 rounded-2xl space-y-1">
                    <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Est. Salary</p>
                    <p className="text-sm font-bold flex items-center gap-2"><DollarSign className="w-4 h-4 text-primary" /> {job.salary?.min} - {job.salary?.max}</p>
                 </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-sm text-primary uppercase tracking-widest">About this role</h4>
                <p className="text-sm text-muted-foreground leading-relaxed bg-muted/20 p-4 rounded-2xl border border-border/40">
                  {job.description}
                </p>
              </div>

              <Button onClick={() => setStep("apply")} className="w-full h-12 rounded-2xl font-black text-md shadow-xl shadow-primary/20">
                Proceed to Apply
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col">
            {/* APPLY FORM SECTION */}
            <div className="bg-primary/5 p-8 border-b border-border/50">
               <DialogTitle className="text-2xl font-black tracking-tight">Submit Application</DialogTitle>
               <DialogDescription className="font-medium">Applying for <span className="text-primary">{job.title}</span></DialogDescription>
            </div>

            <div className="p-8 space-y-6">
              {/* File Upload UI */}
              <div className="space-y-2">
                <Label className="font-black text-xs uppercase tracking-widest text-muted-foreground">Upload Resume (PDF)</Label>
                <div className="relative border-2 border-dashed border-border rounded-[2rem] p-10 flex flex-col items-center justify-center bg-muted/30 hover:bg-muted/50 transition-all cursor-pointer group">
                  <input 
                    type="file" accept=".pdf" required 
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                  {file ? (
                    <div className="text-center animate-in fade-in zoom-in duration-300">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 text-primary">
                        <FileCheck className="w-8 h-8" />
                      </div>
                      <p className="text-sm font-black text-foreground truncate max-w-[200px]">{file.name}</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  ) : (
                    <div className="text-center group-hover:scale-105 transition-transform">
                      <UploadCloud className="w-12 h-12 text-muted-foreground group-hover:text-primary transition-colors mb-2 mx-auto" />
                      <p className="text-sm font-bold text-foreground">Click to select PDF</p>
                      <p className="text-[10px] text-muted-foreground mt-1 font-medium">Max file size: 5MB</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Cover Letter */}
              <div className="space-y-2">
                <Label className="font-black text-xs uppercase tracking-widest text-muted-foreground">Message to Recruiter</Label>
                <Textarea 
                  placeholder="Tell us why you are a great fit..." 
                  required
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  className="rounded-2xl min-h-[120px] border-border/60 focus-visible:ring-primary/20" 
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                 <Button type="button" variant="outline" onClick={() => setStep("view")} className="flex-1 rounded-xl h-12 font-bold">Back</Button>
                 <Button type="submit" disabled={loading} className="flex-2 rounded-xl h-12 font-black shadow-lg shadow-primary/20">
                   {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Processing...</> : "Submit Application"}
                 </Button>
              </div>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}