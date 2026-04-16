"use client"

import { Search, Filter, Mail, Phone, MapPin, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

const candidates = [
  {
    id: "C-101",
    name: "Mirha Fatima",
    email: "mirha@gmail.com",
    phone: "+92 300 1234567",
    location: "Karachi, PK",
    role: "Frontend Developer",
    skills: ["React", "Next.js", "Tailwind"],
    avatar: "MF",
    status: "Shortlisted"
  },
  {
    id: "C-102",
    name: "Ali Ahmed",
    email: "ali@gmail.com",
    phone: "+92 311 7654321",
    location: "Lahore, PK",
    role: "Backend Developer",
    skills: ["Node.js", "MongoDB", "Docker"],
    avatar: "AA",
    status: "New"
  },
  {
    id: "C-103",
    name: "Sara Khan",
    email: "sara@gmail.com",
    phone: "+92 321 9876543",
    location: "Islamabad, PK",
    role: "UI/UX Designer",
    skills: ["Figma", "Adobe XD", "Prototyping"],
    avatar: "SK",
    status: "Rejected"
  }
]

export default function HRCandidatesPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Candidates</h1>
          <p className="text-sm text-muted-foreground">
            Browse and manage all candidates in your pipeline.
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name, email or role..." 
            className="pl-9 rounded-xl bg-background"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="outline" className="flex-1 md:flex-none gap-2 rounded-xl">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
        </div>
      </div>

      {/* Candidates List/Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {candidates.map((candidate) => (
          <Card key={candidate.id} className="rounded-2xl overflow-hidden border-border hover:shadow-md transition-all">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <Avatar className="w-14 h-14 border-2 border-primary/10">
                  <AvatarFallback className="bg-primary/5 text-primary font-bold">
                    {candidate.avatar}
                  </AvatarFallback>
                </Avatar>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>View Profile</DropdownMenuItem>
                    <DropdownMenuItem>Download CV</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-500">Archive</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-1">
                <h3 className="font-bold text-lg">{candidate.name}</h3>
                <p className="text-sm text-primary font-medium">{candidate.role}</p>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Mail className="w-3.5 h-3.5" />
                  {candidate.email}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Phone className="w-3.5 h-3.5" />
                  {candidate.phone}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5" />
                  {candidate.location}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-1">
                {candidate.skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-[10px] font-normal px-2 py-0">
                    {skill}
                  </Badge>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t flex items-center justify-between">
                <Badge className={
                  candidate.status === "Shortlisted" ? "bg-blue-100 text-blue-700 hover:bg-blue-100 border-0" :
                  candidate.status === "Rejected" ? "bg-red-100 text-red-700 hover:bg-red-100 border-0" :
                  "bg-green-100 text-green-700 hover:bg-green-100 border-0"
                }>
                  {candidate.status}
                </Badge>
                <Button variant="link" className="text-xs h-auto p-0 text-primary">
                  See Applications
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function DropdownMenuSeparator() {
  return <div className="h-px bg-border my-1" />
}