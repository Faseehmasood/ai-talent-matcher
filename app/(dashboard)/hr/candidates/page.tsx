"use client"

import { Search, Filter, Mail, MapPin, MoreVertical, Download, Trash2, UserX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

const candidates = [
  { id: "C-101", name: "Mirha Fatima", email: "mirha@gmail.com", location: "Karachi, PK", role: "Frontend Developer", skills: ["React", "Next.js"], avatar: "MF", status: "Shortlisted" },
  { id: "C-102", name: "Ali Ahmed", email: "ali@gmail.com", location: "Lahore, PK", role: "Backend Developer", skills: ["Node.js", "MongoDB"], avatar: "AA", status: "New" },
  { id: "C-103", name: "Sara Khan", email: "sara@gmail.com", location: "Islamabad, PK", role: "UI/UX Designer", skills: ["Figma", "Adobe XD"], avatar: "SK", status: "Rejected" }
]

export default function HRCandidatesPage() {
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Candidates Pipeline</h1>
          <p className="text-muted-foreground text-sm">Review and manage candidate profiles.</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search candidates..." className="pl-9 rounded-xl bg-background border-border h-11" />
        </div>
        <Button variant="outline" className="rounded-xl gap-2 h-11 px-6 font-bold border-border shadow-sm">
          <Filter className="w-4 h-4" /> Filter
        </Button>
      </div>

      {/* Candidates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {candidates.map((candidate) => (
          <Card key={candidate.id} className="rounded-3xl border-border overflow-hidden bg-card shadow-sm hover:shadow-md transition-all">
            <CardContent className="p-6">
              
              <div className="flex justify-between items-start mb-4">
                <Avatar className="w-14 h-14 border border-border shadow-sm">
                  <AvatarFallback className="bg-primary/5 text-primary font-bold">{candidate.avatar}</AvatarFallback>
                </Avatar>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 rounded-2xl p-1.5 shadow-xl border-border/50">
                    
                    {/* ✅ RAKHO: Backend resume URL support karta hai */}
                    <DropdownMenuItem className="rounded-xl cursor-pointer gap-2 font-medium">
                      <Download className="w-4 h-4 text-primary" /> Download CV
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator className="opacity-50" />
                    
                    {/* ✅ RAKHO: Backend isActive toggle support karta hai */}
                    <DropdownMenuItem className="text-red-500 rounded-xl cursor-pointer font-bold gap-2 focus:bg-red-50 focus:text-red-600">
                      <UserX className="w-4 h-4" /> Archive Candidate
                    </DropdownMenuItem>

                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-1">
                <h3 className="font-bold text-lg leading-tight">{candidate.name}</h3>
                <p className="text-[10px] font-black uppercase text-primary tracking-widest">{candidate.role}</p>
              </div>

              <div className="mt-4 space-y-2 pb-6 border-b border-border/50">
                <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                  <Mail className="w-3.5 h-3.5" /> {candidate.email}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                  <MapPin className="w-3.5 h-3.5" /> {candidate.location}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <Badge className={`rounded-lg px-2.5 py-0.5 text-[10px] font-black uppercase border-0 ${
                  candidate.status === "Shortlisted" ? "bg-blue-100 text-blue-700" :
                  candidate.status === "Rejected" ? "bg-red-100 text-red-700" :
                  "bg-green-100 text-green-700"
                }`}>
                  {candidate.status}
                </Badge>
                <span className="text-[10px] text-muted-foreground font-bold italic opacity-50">ID: {candidate.id}</span>
              </div>

            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}