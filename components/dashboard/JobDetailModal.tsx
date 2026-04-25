"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Eye, 
  MapPin, 
  Briefcase, 
  DollarSign, 
  Calendar, 
  Layers, 
  CheckCircle2 
} from "lucide-react"

interface JobDetailProps {
  job: any; // Database se aane wala asli job object
}

export function JobDetailModal({ job }: JobDetailProps) {
  // Status Colors Logic 
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-700";
      case "closed": return "bg-red-100 text-red-700";
      default: return "bg-yellow-100 text-yellow-700";
    }
  };

  return (
    <Dialog>
      {/* 1. TRIGGER: The Professional Eye Icon  */}
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-primary/5 hover:text-primary transition-all">
          <Eye className="w-4 h-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[600px] rounded-[2rem] border-border shadow-2xl p-0 overflow-hidden">
        {/* Header Section with Background Accent */}
        <div className="bg-primary/5 p-8 border-b border-border/50">
          <div className="flex justify-between items-start mb-4">
            <Badge variant="outline" className="rounded-lg border-primary/20 text-primary uppercase text-[10px] tracking-[0.2em] font-bold px-3">
              {job.jobType}
            </Badge>
            <Badge className={`rounded-full px-3 py-1 border-0 text-[10px] font-black uppercase ${getStatusColor(job.status)}`}>
              {job.status}
            </Badge>
          </div>
          <DialogHeader>
            <DialogTitle className="text-3xl font-black tracking-tight text-foreground">
              {job.title}
            </DialogTitle>
            <div className="flex items-center gap-2 text-muted-foreground mt-2 font-medium">
              <Briefcase className="w-4 h-4 text-primary" />
              <span>{job.company}</span>
            </div>
          </DialogHeader>
        </div>

        {/* Content Section */}
        <div className="p-8 space-y-8">
          
          {/* META GRID: Key Info Boxes  */}
          <div className="grid grid-cols-2 gap-4">
             <div className="p-4 rounded-2xl bg-muted/40 border border-border/50 space-y-1">
                <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest flex items-center gap-1.5">
                   <MapPin className="w-3 h-3" /> Location
                </p>
                <p className="text-sm font-bold text-foreground">{job.location}</p>
             </div>
             <div className="p-4 rounded-2xl bg-muted/40 border border-border/50 space-y-1">
                <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest flex items-center gap-1.5">
                   <DollarSign className="w-3 h-3" /> Monthly Salary
                </p>
                <p className="text-sm font-bold text-foreground">
                  {job.salary?.min?.toLocaleString()} - {job.salary?.max?.toLocaleString()} {job.salary?.currency || 'PKR'}
                </p>
             </div>
          </div>

          {/* DESCRIPTION SECTION  */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold flex items-center gap-2 text-primary">
               <Layers className="w-4 h-4" /> Role Description
            </h4>
            <div className="text-sm text-muted-foreground leading-relaxed bg-muted/20 p-5 rounded-2xl border border-border/40">
              {job.description || "No detailed description provided for this role."}
            </div>
          </div>

          {/* SKILLS SECTION: Mapping the Array  */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold flex items-center gap-2 text-primary">
               <CheckCircle2 className="w-4 h-4" /> Required Expertise
            </h4>
            <div className="flex flex-wrap gap-2">
              {job.skills && job.skills.length > 0 ? (
                job.skills.map((skill: string) => (
                  <Badge 
                    key={skill} 
                    variant="secondary" 
                    className="rounded-xl px-4 py-1.5 bg-background border-border hover:border-primary/30 transition-colors font-semibold text-xs"
                  >
                    {skill}
                  </Badge>
                ))
              ) : (
                <span className="text-xs text-muted-foreground italic">No skills specified.</span>
              )}
            </div>
          </div>

        </div>

        {/* Footer info */}
        <div className="px-8 py-4 bg-muted/30 border-t border-border/50 flex justify-between items-center">
           <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
              Post ID: {job._id?.toString().substring(0, 8)}...
           </span>
           <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
              <Calendar className="w-3 h-3" /> Posted: {new Date(job.createdAt).toLocaleDateString()}
           </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}