"use client"
import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Briefcase, MapPin, DollarSign, UploadCloud, Send, FileText } from "lucide-react"

export function JobViewAndApplyModal({ job }: { job: any }) {
  const [step, setStep] = useState<"view" | "apply">("view")

  return (
    <Dialog onOpenChange={() => setStep("view")}>
      <DialogTrigger asChild>
        <Button className="w-full rounded-2xl h-11 group/btn gap-2 shadow-lg shadow-primary/20 transition-all">
          View & Apply <Send className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[600px] rounded-3xl border-border shadow-2xl overflow-y-auto max-h-[90vh]">
        {step === "view" ? (
          <>
            {/* SECTION 1: JOB DETAILS 👁️ */}
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                 <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center font-bold text-primary text-xl">
                   {job.companyLogo}
                 </div>
                 <div>
                    <DialogTitle className="text-2xl font-bold">{job.title}</DialogTitle>
                    <p className="text-muted-foreground font-medium">{job.company}</p>
                 </div>
              </div>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                 <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-xl">
                    <MapPin className="w-4 h-4 text-primary" /> {job.location}
                 </div>
                 <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-xl">
                    <DollarSign className="w-4 h-4 text-primary" /> {job.salary}
                 </div>
              </div>

              <div>
                <h4 className="font-bold text-sm mb-2 uppercase tracking-widest text-primary">About the role</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We are looking for an experienced developer to join our innovative team. You will work on cutting-edge technologies and help us scale our platform.
                </p>
              </div>

              <Button onClick={() => setStep("apply")} className="w-full h-12 rounded-2xl font-bold text-md shadow-xl shadow-primary/10">
                Proceed to Apply
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* SECTION 2: APPLY FORM (BACKEND READY) 📤 */}
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Submit Application</DialogTitle>
              <DialogDescription>Apply for <span className="font-bold text-foreground">{job.title}</span></DialogDescription>
            </DialogHeader>

            <form className="space-y-6 py-4">
              <div className="space-y-2">
                <Label className="font-bold">Upload Resume (Required)</Label>
                <div className="border-2 border-dashed border-border rounded-2xl p-8 flex flex-col items-center justify-center bg-muted/30 hover:bg-muted/50 transition-all cursor-pointer group">
                   <UploadCloud className="w-10 h-10 text-muted-foreground group-hover:text-primary transition-colors mb-2" />
                   <p className="text-sm font-bold">Select PDF or Word File</p>
                   <p className="text-[10px] text-muted-foreground mt-1">Max size: 5MB</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-bold">Cover Letter / Message</Label>
                <Textarea placeholder="Tell the HR why you are the best fit..." className="rounded-2xl min-h-[120px] border-border/60" />
              </div>

              <div className="flex gap-3 pt-2">
                 <Button type="button" variant="outline" onClick={() => setStep("view")} className="flex-1 rounded-xl h-11">Back</Button>
                 <Button type="submit" className="flex-2 rounded-xl h-11 font-bold gap-2 shadow-lg shadow-primary/20">
                   Submit Application <FileText className="w-4 h-4" />
                 </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}