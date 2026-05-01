"use client"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Eye, Mail, Calendar, Download, UserCheck, UserX, Loader2, Phone, ChevronDown, FileText, ExternalLink } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { updateApplicationStatusAction } from "@/src/actions/application.actions"

export function ApplicationDetailModal({ application }: { application: any }) {
  const [loading, setLoading] = useState(false)
  const [showContact, setShowContact] = useState(false)

  // 🛠️ REASONING: Koshish mat karo URL badalne ki. Sirf HTTPS ensure karo ✅
  const getStableUrl = (url: string) => {
    if (!url) return "#";
    return url.replace("http://", "https://");
  }

  const handleStatusUpdate = async (newStatus: string) => {
    setLoading(true)
    const res = await updateApplicationStatusAction(application.id, newStatus);
    if (res.success) {
      alert(`Candidate marked as ${newStatus}!`);
      window.location.reload();
    }
    setLoading(false)
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-primary/5">
          <Eye className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[600px] rounded-[2.5rem] border-border shadow-2xl p-0 overflow-hidden">
        {/* Header Section */}
        <div className="bg-primary/5 p-8 border-b border-border/50">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-background rounded-2xl flex items-center justify-center font-black text-primary text-xl border border-border">
              {application.initials}
            </div>
            <div>
              <DialogTitle className="text-2xl font-black tracking-tight">{application.name}</DialogTitle>
              <p className="text-sm text-muted-foreground font-medium">{application.role}</p>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Action Buttons ✅ */}
          <div className="flex flex-col gap-4">
             
             {/* Contact Information Toggle */}
             <div className="space-y-3">
                <Button 
                   onClick={() => setShowContact(!showContact)}
                   variant="outline" 
                   className={`w-full rounded-2xl h-14 font-bold border-primary/20 text-primary flex justify-between px-6 ${showContact ? 'bg-primary/5' : ''}`}
                >
                   <div className="flex items-center gap-2"><Mail className="w-5 h-5" /> Contact Information</div>
                   <ChevronDown className={`w-4 h-4 transition-transform ${showContact ? 'rotate-180' : ''}`} />
                </Button>

                {showContact && (
                   <div className="p-5 bg-muted/30 rounded-2xl border border-border/50 grid grid-cols-1 gap-3">
                      <div className="flex items-center gap-3">
                         <Mail className="w-4 h-4 text-muted-foreground" />
                         <span className="text-sm font-bold">{application.email || "No Email"}</span>
                      </div>
                      <div className="flex items-center gap-3">
                         <Phone className="w-4 h-4 text-muted-foreground" />
                         <span className="text-sm font-bold">{application.phone || "No Phone"}</span>
                      </div>
                   </div>
                )}
             </div>

             {/* 🛠️ ASLI CV BUTTON: Simple, Secure & Working ✅ */}
             <Button asChild className="w-full rounded-2xl h-14 font-black shadow-lg shadow-primary/20 text-lg">
                <a 
                   href={getStableUrl(application.resume)} 
                   target="_blank" 
                   rel="noopener noreferrer"
                >
                   <FileText className="w-5 h-5 mr-2" /> View Candidate Resume
                </a>
             </Button>
             <p className="text-[10px] text-center text-muted-foreground italic px-4">
                *Clicking above will open the resume in a secure new tab.
             </p>
          </div>

          {/* Message Section */}
          <div className="space-y-2">
            <h4 className="text-xs font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2">
               <FileText className="w-3 h-3" /> Candidate's Message
            </h4>
            <div className="p-5 rounded-2xl border border-border bg-card text-sm text-foreground leading-relaxed italic shadow-inner">
              "{application.coverLetter || "No message provided."}"
            </div>
          </div>

          {/* Status Buttons Footer */}
          <div className="pt-4 border-t border-border/50 grid grid-cols-2 gap-3">
             <Button onClick={() => handleStatusUpdate("shortlisted")} disabled={loading} variant="outline" className="rounded-xl h-12 font-bold text-green-600 border-green-200">
                Shortlist
             </Button>
             <Button onClick={() => handleStatusUpdate("rejected")} disabled={loading} variant="outline" className="rounded-xl h-12 font-bold text-red-600 border-red-200">
                Reject
             </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}