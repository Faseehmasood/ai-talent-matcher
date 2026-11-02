import { getAllCandidatesAction } from "@/src/actions/candidate.actions";
import { CandidateCardActions } from "@/components/dashboard/CandidateCardActions";
import {
  Mail,
  MapPin,
  Code2,
  ArrowRight,
  Sparkles,
  FileText,
  Github,
  Database,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  const searchMode = response.searchMode || "default";

  return (
    <div className="space-y-6">
      {/* Header with Archive Link */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">
            Candidates Pipeline
          </h1>
          <Link
            href="/hr/candidates/archived"
            className="text-xs text-primary font-bold hover:underline flex items-center gap-1 mt-1"
          >
            View Archived Talent <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="rounded-xl px-3 py-1.5 text-[10px] font-black uppercase tracking-wider border-primary/30 bg-primary/5 text-primary gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Hybrid RAG (768-d Vector + BM25 RRF)
          </Badge>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <SearchInput placeholder="Semantic + keyword search across resumes (e.g. 'distributed systems NestJS PostgreSQL')..." />
      </div>

      {/* Active Hybrid Search Telemetry Banner */}
      {query.trim().length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 rounded-2xl border border-primary/20 bg-primary/5">
          <div className="flex items-center gap-2 text-xs font-bold text-foreground">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>
              Hybrid RAG ranked <strong>{candidates.length}</strong> candidate
              {candidates.length === 1 ? "" : "s"} for{" "}
              <span className="text-primary">&ldquo;{query}&rdquo;</span>
            </span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Engine:{" "}
            {searchMode === "atlas_hybrid_rrf"
              ? "MongoDB Atlas $vectorSearch + BM25 (RRF k=60)"
              : "Hybrid Vector Dot-Product + BM25 RRF"}
          </span>
        </div>
      )}

      {/* Candidates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {candidates.length > 0 ? (
          candidates.map((candidate: any) => {
            const ragMatch = candidate.ragMatch;
            const githubHandle = candidate.extractedGithubUsername;

            return (
              <Card
                key={candidate._id}
                className="rounded-[2rem] border-border overflow-hidden bg-card shadow-sm hover:shadow-md transition-all duration-300"
              >
                <CardContent className="p-6 flex flex-col h-full">
                  {/* Top: Avatar, Semantic Match Score & Actions */}
                  <div className="flex justify-between items-start mb-4">
                    <Avatar className="w-14 h-14 border border-border shadow-sm">
                      <AvatarImage src={candidate.avatar} className="object-cover" />
                      <AvatarFallback className="bg-primary/5 text-primary font-black uppercase text-xs">
                        {candidate.name?.substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex items-center gap-2">
                      {ragMatch && (
                        <Badge className="rounded-xl px-2.5 py-1 text-[10px] font-black uppercase bg-primary text-primary-foreground border-0 shadow-sm">
                          {ragMatch.semanticSimilarityPercent}% Match
                        </Badge>
                      )}
                      <CandidateCardActions candidateId={candidate._id} />
                    </div>
                  </div>

                  {/* Identity Info */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-bold text-lg leading-tight text-foreground">
                        {candidate.name}
                      </h3>
                      {githubHandle && (
                        <a
                          href={`https://github.com/${githubHandle}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg bg-muted hover:bg-primary/10 text-foreground transition-colors"
                        >
                          <Github className="w-3 h-3" /> @{githubHandle}
                        </a>
                      )}
                    </div>
                    <p className="text-[10px] font-black uppercase text-primary tracking-[0.15em]">
                      {candidate.role || "Professional Candidate"}
                    </p>
                  </div>

                  {/* Contact Section */}
                  <div className="mt-4 space-y-2 pb-4 border-b border-border/50">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                      <Mail className="w-3.5 h-3.5 text-primary/60" />{" "}
                      {candidate.email}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                      <MapPin className="w-3.5 h-3.5 text-primary/60" />{" "}
                      {candidate.phoneNumber || "Phone Not Listed"}
                    </div>
                  </div>

                  {/* Matched Resume Chunk Snippet (When Hybrid Search is Active) */}
                  {ragMatch && (
                    <div className="mt-4 p-3.5 rounded-2xl bg-primary/5 border border-primary/15 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-primary">
                          <FileText className="w-3 h-3" /> Section:{" "}
                          {ragMatch.matchedSection}
                        </span>
                        <span className="text-[9px] font-bold text-muted-foreground">
                          RRF: {ragMatch.rrfScore}
                        </span>
                      </div>
                      <p className="text-xs text-foreground/90 leading-relaxed line-clamp-3 italic">
                        &ldquo;{ragMatch.matchedSnippet}&rdquo;
                      </p>
                      {ragMatch.matchedKeywords?.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {ragMatch.matchedKeywords.map((kw: string) => (
                            <span
                              key={kw}
                              className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-primary/15 text-primary"
                            >
                              {kw}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Skills Portion */}
                  <div className="mt-4 flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Code2 className="w-3 h-3 text-muted-foreground" />
                      <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                        Expertise
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {candidate.skills && candidate.skills.length > 0 ? (
                        candidate.skills.slice(0, 5).map((skill: string) => (
                          <Badge
                            key={skill}
                            variant="secondary"
                            className="text-[9px] font-bold uppercase bg-muted/60 text-muted-foreground border-0 px-2 py-0.5 rounded-md"
                          >
                            {skill}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-[10px] text-muted-foreground italic">
                          No profile skills listed
                        </span>
                      )}
                      {candidate.skills?.length > 5 && (
                        <span className="text-[9px] font-bold text-primary">
                          +{candidate.skills.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Footer: Status, Indexed Chunks & ID */}
                  <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge
                        className={`rounded-lg px-2.5 py-0.5 text-[10px] font-black uppercase border-0 ${
                          candidate.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {candidate.isActive ? "Active" : "Suspended"}
                      </Badge>
                      {candidate.resumeChunksIndexed > 0 && (
                        <Badge
                          variant="outline"
                          className="rounded-lg px-2 py-0.5 text-[9px] font-bold border-border text-muted-foreground gap-1"
                        >
                          <Database className="w-2.5 h-2.5" />{" "}
                          {candidate.resumeChunksIndexed} Vector Chunks
                        </Badge>
                      )}
                    </div>
                    <span className="text-[9px] text-muted-foreground font-bold italic opacity-40 uppercase">
                      #{candidate._id.substring(candidate._id.length - 6)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="col-span-full text-center py-32 bg-muted/10 rounded-[3rem] border border-dashed border-border">
            <p className="text-muted-foreground font-medium">
              {query
                ? `No candidates matched your hybrid query "${query}"`
                : "No registered candidates yet."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
