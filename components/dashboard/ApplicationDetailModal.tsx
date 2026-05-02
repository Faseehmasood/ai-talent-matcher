"use client"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Eye, FileText, Mail, Phone, Calendar, Download, UserCheck, UserX, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { updateApplicationStatusAction } from "@/src/actions/application.actions"

export function ApplicationDetailModal({ application }: { application: any }) {
  const [loading, setLoading] = useState(false)

  const handleStatusUpdate = async (newStatus: string) => {
    setLoading(true)
    const res = await updateApplicationStatusAction(application.id, newStatus);
    if (res.success) {
      alert(`Candidate has been successfully ${newStatus}!`);
      window.location.reload();
    } else {
      alert("Error updating status: " + res.code);
    }
    setLoading(false)
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-primary/5 hover:text-primary transition-all">
          <Eye className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[600px] rounded-[2.5rem] border-border shadow-2xl p-0 overflow-hidden">
        {/* Header */}
        <div className="bg-primary/5 p-8 border-b border-border/50">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-background rounded-2xl flex items-center justify-center font-black text-primary text-xl border border-border shadow-sm">
              {application.initials}
            </div>
            <div>
              <DialogTitle className="text-2xl font-black tracking-tight">{application.name}</DialogTitle>
              <p className="text-sm text-muted-foreground font-medium">{application.role}</p>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">

          {/* Status + Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-muted/40 border border-border/50">
              <p className="text-[10px] uppercase font-black text-muted-foreground mb-1 tracking-widest">Application Status</p>
              <Badge className="bg-blue-100 text-blue-700 border-0 font-bold px-3 capitalize">{application.status}</Badge>
            </div>
            <div className="p-4 rounded-2xl bg-muted/40 border border-border/50">
              <p className="text-[10px] uppercase font-black text-muted-foreground mb-1 tracking-widest">Applied Date</p>
              <p className="text-sm font-bold flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" /> {application.date}
              </p>
            </div>
          </div>

          {/* Contact Details */}
          <div className="p-4 rounded-2xl bg-muted/40 border border-border/50 space-y-3">
            <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Contact Details</p>
            <div className="flex items-center gap-2 text-sm font-medium">
              <Mail className="w-4 h-4 text-primary shrink-0" />
              <span className="text-foreground">{application.email || "Email not provided"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm font-medium">
              <Phone className="w-4 h-4 text-primary shrink-0" />
              <span className="text-foreground">{application.phoneNumber || "Phone not provided"}</span>
            </div>
          </div>

          {/* Cover Letter */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold flex items-center gap-2 text-primary uppercase tracking-widest">
              <FileText className="w-4 h-4" /> Cover Letter
            </h4>
            <div className="p-5 rounded-2xl border border-border/60 bg-card text-sm text-foreground leading-relaxed italic shadow-inner">
              {application.coverLetter || "No message provided by candidate."}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">

            {/* Email */}
            <Button asChild variant="outline" className="flex-1 rounded-xl h-12 font-bold border-primary/20 text-primary">
              <a href={`mailto:${application.email}?subject=Interview Update for ${application.role}`}>
                <Mail className="w-4 h-4 mr-2" /> Email Candidate
              </a>
            </Button>

            {/* Phone - sirf tab jab ho */}
            {application.phoneNumber && (
              <Button asChild variant="outline" className="flex-1 rounded-xl h-12 font-bold border-primary/20 text-primary">
                <a href={`tel:${application.phoneNumber}`}>
                  <Phone className="w-4 h-4 mr-2" /> Call Candidate
                </a>
              </Button>
            )}

            {/* Download CV - Proxy Route se */}
            <Button asChild className="flex-[1.5] rounded-xl h-12 font-black shadow-lg shadow-primary/20">
              <a href={`/api/download?url=${encodeURIComponent(application.resume)}`}>
                <Download className="w-4 h-4 mr-2" /> Download CV
              </a>
            </Button>

          </div>

          {/* Shortlist / Reject */}
          <div className="pt-6 border-t border-border/50 grid grid-cols-2 gap-3">
            <Button 
              onClick={() => handleStatusUpdate("shortlisted")}
              disabled={loading}
              variant="outline" 
              className="rounded-xl h-12 font-bold text-green-600 border-green-200 hover:bg-green-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4 mr-2" />}
              Shortlist
            </Button>
            <Button 
              onClick={() => handleStatusUpdate("rejected")}
              disabled={loading}
              variant="outline" 
              className="rounded-xl h-12 font-bold text-red-600 border-red-200 hover:bg-red-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserX className="w-4 h-4 mr-2" />}
              Reject
            </Button>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  )
}