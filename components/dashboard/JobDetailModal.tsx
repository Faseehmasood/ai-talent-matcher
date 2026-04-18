"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Eye, MapPin, Briefcase, DollarSign, Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function JobDetailModal({ job }: { job: any }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-primary/5 hover:text-primary">
          <Eye className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] rounded-3xl">
        <DialogHeader>
          <Badge variant="outline" className="w-fit mb-2 border-primary/20 text-primary uppercase text-[10px] tracking-widest">{job.jobType}</Badge>
          <DialogTitle className="text-2xl font-bold">{job.title}</DialogTitle>
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <span className="font-medium text-foreground">{job.company}</span> • {job.location}
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
             <div className="p-3 rounded-2xl bg-muted/50">
                <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Salary Range</p>
                <div className="flex items-center gap-2 text-sm font-bold"><DollarSign className="w-4 h-4 text-primary" /> 50k - 80k PKR</div>
             </div>
             <div className="p-3 rounded-2xl bg-muted/50">
                <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Posted On</p>
                <div className="flex items-center gap-2 text-sm font-bold"><Calendar className="w-4 h-4 text-primary" /> {job.createdAt}</div>
             </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-sm font-bold mb-2">Job Description</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {job.description || "We are looking for a skilled professional to join our growing team. You will be responsible for building high-quality features..."}
            </p>
          </div>

          {/* Skills Tag */}
          <div>
            <h4 className="text-sm font-bold mb-2">Required Skills</h4>
            <div className="flex flex-wrap gap-2">
              {["React", "TypeScript", "Tailwind"].map(skill => (
                <Badge key={skill} className="rounded-lg bg-primary/5 text-primary border-0 font-medium">{skill}</Badge>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}