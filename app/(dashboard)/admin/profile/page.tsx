"use client"
import { ShieldCheck, Mail, Camera, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export default function AdminProfilePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-purple-600">Admin Profile</h1>
        <p className="text-muted-foreground">System Administrator Access Level.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="rounded-3xl border-border h-fit">
          <CardContent className="p-6 flex flex-col items-center">
            <Avatar className="w-32 h-32 border-4 border-purple-100">
              <AvatarFallback className="text-3xl font-bold bg-purple-50 text-purple-600">AD</AvatarFallback>
            </Avatar>
            <h2 className="mt-4 text-xl font-bold">Platform Admin</h2>
            <div className="mt-2 px-3 py-1 bg-purple-100 text-purple-600 text-[10px] font-bold rounded-full uppercase">Superuser</div>
          </CardContent>
        </Card>
        <div className="md:col-span-2">
          <Card className="rounded-3xl border-border">
            <CardHeader><CardTitle className="text-lg">Security Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2"><Label>Admin Name</Label><Input defaultValue="Master Admin" className="rounded-xl" /></div>
              <div className="space-y-2"><Label>Secure Email</Label><Input defaultValue="admin@system.com" disabled className="rounded-xl bg-muted/50" /></div>
              <Button className="rounded-xl px-8 bg-purple-600 hover:bg-purple-700 text-white">Save Changes</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}