import { getAllCandidatesAction } from "@/src/actions/candidate.actions";
import { CandidateCardActions } from "@/components/dashboard/CandidateCardActions"; // ✅ Naya Component
import { Search, Filter, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { redirect } from "next/navigation";

// 🛠️ FRESH DATA: Har baar database se mangwao ✅
export const revalidate = 0;

export default async function HRCandidatesPage() {
  // 1. Database se asli candidates mangwayein ⚡
  const response = await getAllCandidatesAction();

  if (!response.success) {
    if (response.code === "UNAUTHORIZED") redirect("/login");
    throw new Error("Failed to load candidates");
  }

  const candidates = response.candidates || [];

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Candidates Pipeline</h1>
        <p className="text-muted-foreground text-sm">Overview of all registered talent on the platform.</p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search candidates by name or skills..." 
            className="pl-9 rounded-xl bg-background border-border h-11 shadow-sm focus-visible:ring-1 focus-visible:ring-primary/20" 
          />
        </div>
        <Button variant="outline" className="rounded-xl gap-2 h-11 px-6 font-bold border-border shadow-sm">
          <Filter className="w-4 h-4" /> Filter
        </Button>
      </div>

      {/* 🚀 ASLI DATA GRID (No Flicker) ✅ */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {candidates.length > 0 ? (
          candidates.map((candidate: any) => (
            <Card key={candidate._id} className="rounded-[2rem] border-border overflow-hidden bg-card shadow-sm hover:shadow-md transition-all duration-300">
              <CardContent className="p-6">
                
                {/* Top Section: Avatar & Safe Dropdown ✅ */}
                <div className="flex justify-between items-start mb-4">
                  <Avatar className="w-14 h-14 border border-border shadow-sm">
                    <AvatarFallback className="bg-primary/5 text-primary font-black">
                      {candidate.name?.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  {/* 🛠️ YAHAN NAYA SAFE COMPONENT CALL KIYA ✅ */}
                  <CandidateCardActions candidateId={candidate._id} />
                </div>

                {/* Info Section */}
                <div className="space-y-1">
                  <h3 className="font-bold text-lg leading-tight text-foreground">{candidate.name}</h3>
                  <p className="text-[10px] font-black uppercase text-primary tracking-[0.15em]">
                    {candidate.role || "Professional"}
                  </p>
                </div>

                {/* Contact Info */}
                <div className="mt-4 space-y-2 pb-6 border-b border-border/50">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                    <Mail className="w-3.5 h-3.5 text-primary/60" /> {candidate.email}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                    <MapPin className="w-3.5 h-3.5 text-primary/60" /> {candidate.location || "Location Not Set"}
                  </div>
                </div>

                {/* Footer Section: Status Badge */}
                <div className="mt-4 flex items-center justify-between">
                  <Badge className={`rounded-lg px-2.5 py-0.5 text-[10px] font-black uppercase border-0 ${
                    candidate.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}>
                    {candidate.isActive ? "Active Account" : "Suspended"}
                  </Badge>
                  <span className="text-[9px] text-muted-foreground font-bold italic opacity-40">
                    #{candidate._id.substring(candidate._id.length - 6)}
                  </span>
                </div>

              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-32 bg-muted/20 rounded-[3rem] border border-dashed border-border">
             <p className="text-muted-foreground font-medium">No candidates have registered yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}