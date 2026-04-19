"use client"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Key, ShieldCheck } from "lucide-react"

export default function DynamicSettingsPage() {
  const params = useParams()
  const role = params.role

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight capitalize">{role} Settings</h1>
        <p className="text-muted-foreground text-sm">Security and account preferences for your {role} account.</p>
      </div>

      <Card className="rounded-[2rem] border-border shadow-sm bg-card overflow-hidden">
        <CardHeader className="bg-muted/30 border-b border-border py-6 px-8">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-primary/10 rounded-xl text-primary">
                <Key className="w-5 h-5" />
             </div>
             <CardTitle className="text-lg font-bold">Update Password</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <div className="space-y-2">
            <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Old Password</Label>
            <Input type="password" placeholder="••••••••" className="rounded-xl h-12" />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">New Password</Label>
              <Input type="password" placeholder="••••••••" className="rounded-xl h-12" />
            </div>
            <div className="space-y-2">
              <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Confirm New</Label>
              <Input type="password" placeholder="••••••••" className="rounded-xl h-12" />
            </div>
          </div>

          <Button className="w-full rounded-xl h-12 font-bold shadow-lg shadow-primary/20 gap-2 mt-4">
            <ShieldCheck className="w-4 h-4" /> Save Security Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}