"use client"
import { User, Mail, Camera, Save, Briefcase } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export default function HRProfilePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">HR Profile</h1>
        <p className="text-muted-foreground">Manage your recruitment office details.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="rounded-3xl border-border h-fit">
          <CardContent className="p-6 flex flex-col items-center">
            <div className="relative group">
              <Avatar className="w-32 h-32 border-4 border-primary/10">
                <AvatarFallback className="text-3xl font-bold bg-primary/5 text-primary">HR</AvatarFallback>
              </Avatar>
              <button className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full shadow-lg hover:scale-110 transition-transform"><Camera className="w-4 h-4" /></button>
            </div>
            <h2 className="mt-4 text-xl font-bold">HR Manager</h2>
            <p className="text-xs text-muted-foreground uppercase font-semibold">Talent Acquisition</p>
          </CardContent>
        </Card>
        <div className="md:col-span-2 space-y-6">
          <Card className="rounded-3xl border-border">
            <CardHeader><CardTitle className="text-lg">Company Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Full Name</Label><Input defaultValue="HR Manager" className="rounded-xl" /></div>
                <div className="space-y-2"><Label>Office Email</Label><Input defaultValue="hr@company.com" disabled className="rounded-xl bg-muted/50" /></div>
              </div>
              <div className="space-y-2"><Label>Department</Label><Input defaultValue="Human Resources" className="rounded-xl" /></div>
              <Button className="rounded-xl px-8">Update HR Profile</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}