"use client"
import { GraduationCap, Mail, Camera, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export default function CandidateProfilePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">My Candidate Profile</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="rounded-3xl border-border">
          <CardContent className="p-6 flex flex-col items-center">
            <Avatar className="w-32 h-32 border-4 border-green-100">
              <AvatarFallback className="text-3xl font-bold bg-green-50 text-green-600">CA</AvatarFallback>
            </Avatar>
            <h2 className="mt-4 text-xl font-bold">Candidate User</h2>
            <Button variant="outline" className="mt-4 rounded-xl gap-2 w-full"><FileText className="w-4 h-4" /> View Resume</Button>
          </CardContent>
        </Card>
        <div className="md:col-span-2 space-y-6">
          <Card className="rounded-3xl border-border">
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2"><Label>Full Name</Label><Input defaultValue="Faseeh Ahmed" className="rounded-xl" /></div>
              <div className="space-y-2"><Label>Headline</Label><Input defaultValue="Frontend Developer | React | Next.js" className="rounded-xl" /></div>
              <Button className="rounded-xl px-8 bg-green-600 text-white hover:bg-green-700">Update Profile</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}