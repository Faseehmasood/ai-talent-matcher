import { getAllCandidatesAction } from "@/src/actions/candidate.actions";
import { CandidateCardActions } from "@/components/dashboard/CandidateCardActions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, UserCheck } from "lucide-react";
import Link from "next/link";

export default async function ArchivedCandidatesPage() {
  // 🚀 FETCH ARCHIVED: doosra parameter 'true' bheja ✅
  const response = await getAllCandidatesAction("", true);
  const candidates = response.candidates || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-red-600">Archived Candidates</h1>
          <p className="text-muted-foreground text-sm">Users who are currently inactive or suspended.</p>
        </div>
        <Button asChild variant="outline" className="rounded-xl gap-2">
           <Link href="/hr/candidates"><ArrowLeft className="w-4 h-4" /> Back to Pipeline</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {candidates.length > 0 ? (
          candidates.map((candidate: any) => (
            <Card key={candidate._id} className="rounded-3xl border-border bg-card opacity-80 grayscale-[50%] hover:grayscale-0 transition-all">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <Avatar className="w-12 h-12 border">
                    <AvatarFallback className="bg-muted text-muted-foreground font-bold">
                       {candidate.name?.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  {/* Reuse actions for Activate logic ✅ */}
                  <CandidateCardActions candidateId={candidate._id} />
                </div>

                <div className="space-y-1">
                  <h3 className="font-bold text-lg text-muted-foreground">{candidate.name}</h3>
                  <p className="text-[10px] font-bold uppercase text-muted-foreground">{candidate.email}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between">
                  <Badge variant="secondary" className="bg-red-50 text-red-600 border-0 uppercase text-[9px]">Archived</Badge>
                  <span className="text-[10px] text-muted-foreground italic">ID: {candidate._id.substring(0,6)}</span>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-20 text-muted-foreground italic">No archived candidates.</div>
        )}
      </div>
    </div>
  );
}