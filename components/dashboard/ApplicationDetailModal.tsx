"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Eye, FileText, User, Mail, Calendar, Briefcase } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function ApplicationDetailModal({ application }: { application: any }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
    <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-foreground hover:bg-primary/5 rounded-xl transition-all duration-200 outline-none group">
      <div className="p-1.5 rounded-lg bg-primary/10 group-hover:bg-primary group-hover:text-white transition-colors">
        <Eye className="w-4 h-4" />
      </div>
      <span>View Candidate Details</span>
    </button>
  </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] rounded-3xl">
        <DialogHeader>
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center font-bold text-primary">
              {application.initials}
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold">{application.name}</DialogTitle>
              <p className="text-sm text-muted-foreground">{application.role} • {application.level}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Status & Date Info */}
          <div className="grid grid-cols-2 gap-4">
             <div className="p-3 rounded-2xl bg-muted/50">
                <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Status</p>
                <Badge className="bg-blue-100 text-blue-700 border-0 capitalize">{application.status}</Badge>
             </div>
             <div className="p-3 rounded-2xl bg-muted/50">
                <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Applied On</p>
                <div className="flex items-center gap-2 text-sm font-bold"><Calendar className="w-4 h-4 text-primary" /> {application.date}</div>
             </div>
          </div>

          {/* Cover Letter Section */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" /> Cover Letter / Message
            </h4>
            <div className="p-4 rounded-2xl border border-border bg-card text-sm text-muted-foreground leading-relaxed">
              "I am very interested in this role. I have over 5 years of experience in full-stack development and have led multiple teams..."
            </div>
          </div>

          {/* Action Links */}
          <div className="flex gap-3">
             <Button variant="outline" className="flex-1 rounded-xl gap-2 h-11 border-primary/20 text-primary hover:bg-primary/5">
                <Mail className="w-4 h-4" /> Contact Candidate
             </Button>
             <Button className="flex-1 rounded-xl gap-2 h-11">
                <FileText className="w-4 h-4" /> Download Resume
             </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}