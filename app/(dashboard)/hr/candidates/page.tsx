import { 
  Users, 
  Search, 
  Filter, 
  MoreVertical, 
  Mail, 
  MapPin, 
  Download
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Mock Data (Taake design nazar aaye)
const candidates = [
  {
    id: "CAN-001",
    name: "Mirha Fatima",
    email: "mirha@gmail.com",
    role: "Frontend Developer",
    location: "Karachi, PK",
    skills: ["React", "Next.js", "Tailwind"],
    status: "Shortlisted",
    initials: "MF"
  },
  {
    id: "CAN-002",
    name: "Ali Ahmed",
    email: "ali@gmail.com",
    role: "Backend Developer",
    location: "Lahore, PK",
    skills: ["Node.js", "MongoDB", "Express"],
    status: "Pending",
    initials: "AA"
  },
  {
    id: "CAN-003",
    name: "Sara Khan",
    email: "sara@gmail.com",
    role: "UI/UX Designer",
    location: "Islamabad, PK",
    skills: ["Figma", "Adobe XD"],
    status: "Reviewed",
    initials: "SK"
  }
]

export default function CandidatesPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Candidates</h1>
          <p className="text-muted-foreground">Manage and review all job seekers</p>
        </div>
        <Button className="rounded-xl gap-2">
          <Download className="w-4 h-4" /> Export List
        </Button>
      </div>

      {/* Filter Section */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name, skill, or email..." 
            className="pl-9 rounded-xl border-border bg-card h-11"
          />
        </div>
        <Button variant="outline" className="rounded-xl h-11 gap-2">
          <Filter className="w-4 h-4" /> Filters
        </Button>
      </div>

      {/* Candidates Table */}
      <Card className="rounded-2xl border-border bg-card overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[250px]">Candidate</TableHead>
              <TableHead>Role & Location</TableHead>
              <TableHead>Skills</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {candidates.map((candidate) => (
              <TableRow key={candidate.id} className="hover:bg-muted/30 transition-colors">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-border">
                      <AvatarImage src="" />
                      <AvatarFallback className="font-bold">{candidate.initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm">{candidate.name}</span>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Mail className="w-3 h-3 mr-1" /> {candidate.email}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm font-medium">{candidate.role}</div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3 mr-1" /> {candidate.location}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {candidate.skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-[10px] px-2 py-0 bg-muted/50 border-none">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={`
                    text-[10px] px-2 py-0 border-none
                    ${candidate.status === 'Shortlisted' ? 'bg-blue-100 text-blue-700' : 
                      candidate.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 
                      'bg-gray-100 text-gray-700'}
                  `}>
                    {candidate.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}