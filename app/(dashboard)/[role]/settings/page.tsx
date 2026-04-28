"use client"
import { useState } from "react"
import { changePasswordAction } from "@/src/actions/user.actions" //  Action import kiya
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Key, ShieldCheck, Loader2 } from "lucide-react"

export default function SettingsPage() {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  })

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // FRONTEND CHECK: New passwords match? 
    if (formData.newPassword !== formData.confirmPassword) {
      alert("New passwords do not match!")
      return
    }

    setLoading(true)
    const response = await changePasswordAction({
      oldPassword: formData.oldPassword,
      newPassword: formData.newPassword
    })

    if (response.success) {
      alert(response.message)
      setFormData({ oldPassword: "", newPassword: "", confirmPassword: "" }) // Form clear karo
    } else {
      alert(response.message)
    }
    setLoading(false)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">Security Settings</h1>

      <Card className="rounded-[2.5rem] border-border shadow-sm bg-card overflow-hidden">
        <CardHeader className="bg-muted/30 border-b border-border py-6 px-8">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-primary/10 rounded-xl text-primary"><Key className="w-5 h-5" /></div>
             <CardTitle className="text-lg font-bold">Update Password</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handlePasswordChange} className="space-y-6">
            {/* Old Password */}
            <div className="space-y-2">
              <Label className="font-bold text-xs uppercase text-muted-foreground">Current Password</Label>
              <Input 
                type="password" required
                value={formData.oldPassword}
                onChange={(e) => setFormData({...formData, oldPassword: e.target.value})}
                className="rounded-xl h-12 border-border/60" 
              />
            </div>
            
            {/* New Password Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-bold text-xs uppercase text-muted-foreground">New Password</Label>
                <Input 
                  type="password" required
                  value={formData.newPassword}
                  onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                  className="rounded-xl h-12 border-border/60" 
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-xs uppercase text-muted-foreground">Confirm New</Label>
                <Input 
                  type="password" required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  className="rounded-xl h-12 border-border/60" 
                />
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full rounded-xl h-12 font-bold shadow-lg shadow-primary/20 gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              Update Security Settings
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}