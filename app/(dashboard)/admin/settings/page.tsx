"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ShieldAlert, Fingerprint } from "lucide-react"

export default function AdminSettingsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
      <Card className="rounded-3xl border-border">
        <CardHeader className="flex flex-row items-center gap-3"><div className="p-2 bg-purple-50 rounded-lg"><Fingerprint className="w-5 h-5 text-purple-600" /></div><CardTitle className="text-lg">2FA Authentication</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">Enhance security with Two-Factor authentication.</p>
          <Button className="rounded-xl bg-purple-600 text-white">Enable 2FA Now</Button>
        </CardContent>
      </Card>
    </div>
  )
}