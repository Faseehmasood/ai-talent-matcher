import { getAllCandidatesAction } from "@/src/actions/candidate.actions";
import { CandidateCardActions } from "@/components/dashboard/CandidateCardActions";
import { Mail, MapPin, Filter, Code2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { redirect } from "next/navigation";
import { SearchInput } from "@/components/shared/SearchInput";
import Link from "next/link";

export const revalidate = 0;

export default async function HRCandidatesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const resolvedParams = await searchParams;
  const query = resolvedParams.search || "";

  const response = await getAllCandidatesAction(query);

  if (!response.success) {
    if (response.code === "UNAUTHORIZED") redirect("/login");
    throw new Error("Failed to load candidates");
  }

  const candidates = response.candidates || [];

  return (
    <div className="space-y-6">
      {/* Header with Archive Link */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Candidates Pipeline</h1>
          <Link href="/hr/candidates/archived" className="text-xs text-primary font-bold hover:underline flex items-center gap-1 mt-1">
             View Archived Talent <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <SearchInput placeholder="Search by name or skill (e.g. React)..." />
        <Button variant="outline" className="rounded-xl gap-2 h-11 px-6 font-bold border-border shadow-sm shrink-0">
          <Filter className="w-4 h-4" /> Filter
        </Button>
      </div>

      {/* 🚀 CANDIDATES GRID ✅ */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {candidates.length > 0 ? (
          candidates.map((candidate: any) => (
            <Card key={candidate._id} className="rounded-[2rem] border-border overflow-hidden bg-card shadow-sm hover:shadow-md transition-all duration-300">
              <CardContent className="p-6 flex flex-col h-full">
                
                {/* Top: Avatar & Actions */}
                <div className="flex justify-between items-start mb-4">
                  <Avatar className="w-14 h-14 border border-border shadow-sm">
                    <AvatarFallback className="bg-primary/5 text-primary font-black uppercase text-xs">
                      {candidate.name?.substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <CandidateCardActions candidateId={candidate._id} />
                </div>

                {/* Identity Info */}
                <div className="space-y-1">
                  <h3 className="font-bold text-lg leading-tight text-foreground">{candidate.name}</h3>
                  <p className="text-[10px] font-black uppercase text-primary tracking-[0.15em]">
                    {candidate.role || "Professional Candidate"}
                  </p>
                </div>

                {/* Contact Section */}
                <div className="mt-4 space-y-2 pb-4 border-b border-border/50">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                    <Mail className="w-3.5 h-3.5 text-primary/60" /> {candidate.email}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                    <MapPin className="w-3.5 h-3.5 text-primary/60" /> {candidate.location || "Location Not Set"}
                  </div>
                </div>

                {/* 🛠️ NEW: SKILLS PORTION (Asli Badges) ✅ */}
                <div className="mt-4 flex-1">
                  <div className="flex items-center gap-2 mb-2">
                     <Code2 className="w-3 h-3 text-muted-foreground" />
                     <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Expertise</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {candidate.skills && candidate.skills.length > 0 ? (
                      candidate.skills.slice(0, 4).map((skill: string) => (
                        <Badge key={skill} variant="secondary" className="text-[9px] font-bold uppercase bg-muted/60 text-muted-foreground border-0 px-2 py-0.5 rounded-md">
                          {skill}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-[10px] text-muted-foreground italic">No skills listed</span>
                    )}
                    {candidate.skills?.length > 4 && (
                      <span className="text-[9px] font-bold text-primary">+{candidate.skills.length - 4} more</span>
                    )}
                  </div>
                </div>

                {/* Footer: Status & ID */}
                <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between">
                  <Badge className={`rounded-lg px-2.5 py-0.5 text-[10px] font-black uppercase border-0 ${
                    candidate.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}>
                    {candidate.isActive ? "Active Account" : "Suspended"}
                  </Badge>
                  <span className="text-[9px] text-muted-foreground font-bold italic opacity-40 uppercase">
                    #{candidate._id.substring(candidate._id.length - 6)}
                  </span>
                </div>

              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-32 bg-muted/10 rounded-[3rem] border border-dashed border-border">
             <p className="text-muted-foreground font-medium">
                {query ? `No candidates found for "${query}"` : "No registered candidates yet."}
             </p>
          </div>
        )}
      </div>
    </div>
  );
}