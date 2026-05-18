"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Briefcase, User, Loader2, Sparkles } from "lucide-react"

export default function SelectRolePage() {
  const [selectedRole, setSelectedRole] = useState<"candidate" | "hr" | null>(null)
  const [loading, setLoading] = useState(false)

  const handleRoleSelect = async () => {
    if (!selectedRole) return
    setLoading(true)

    try {
      const res = await fetch("/api/auth/set-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: selectedRole }),
      })

      if (res.ok) {
        const contentType = res.headers.get("content-type")
        if (contentType && contentType.includes("text/html")) {
          const html = await res.text()
          document.open()
          document.write(html)
          document.close()
        } else {
          const data = await res.json()
          if (data.success) {
            window.location.href = data.redirectUrl
          } else {
            alert(data.message || "Something went wrong")
          }
        }
      } else {
        alert("Something went wrong")
      }
    } catch (error) {
      console.error(error)
    } finally {
     
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
    
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-lg p-10 bg-card border border-border shadow-2xl rounded-[3rem] text-center space-y-10"
      >

        <div className="space-y-3">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-primary/20 text-primary bg-primary/5 text-[10px] font-black uppercase tracking-widest mb-2">
             <Sparkles className="w-3 h-3 mr-2 fill-primary" /> One last step
          </div>
          <h2 className="text-4xl font-black tracking-tighter text-foreground">
            Choose your role
          </h2>
          <p className="text-muted-foreground font-medium text-sm">
            How would you like to use TalentaSync today?
          </p>
        </div>

        <div className="grid grid-cols-2 gap-5">

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedRole("candidate")}
            className={`p-8 rounded-[2.5rem] border-2 transition-all flex flex-col items-center gap-4 relative overflow-hidden ${
              selectedRole === "candidate"
                ? "border-primary bg-primary/5 shadow-xl shadow-primary/10"
                : "border-border/40 opacity-50 hover:opacity-100"
            }`}
          >
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${
              selectedRole === "candidate" ? "bg-primary text-white shadow-lg" : "bg-muted"
            }`}>
              <User className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <p className="font-bold text-md">Candidate</p>
              <p className="text-[10px] text-muted-foreground leading-tight uppercase font-bold tracking-tighter">I'm looking for jobs</p>
            </div>
          </motion.button>

          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedRole("hr")}
            className={`p-8 rounded-[2.5rem] border-2 transition-all flex flex-col items-center gap-4 relative overflow-hidden ${
              selectedRole === "hr"
                ? "border-primary bg-primary/5 shadow-xl shadow-primary/10"
                : "border-border/40 opacity-50 hover:opacity-100"
            }`}
          >
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${
              selectedRole === "hr" ? "bg-primary text-white shadow-lg" : "bg-muted"
            }`}>
              <Briefcase className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <p className="font-bold text-md">HR Manager</p>
              <p className="text-[10px] text-muted-foreground leading-tight uppercase font-bold tracking-tighter">I'm hiring talent</p>
            </div>
          </motion.button>
        </div>


        <div className="flex justify-center h-16">
          <motion.button
            layout 
            onClick={handleRoleSelect}
            disabled={!selectedRole || loading}
            animate={{
              width: loading ? "64px" : "100%",
              borderRadius: loading ? "100px" : "24px",
            }}
            transition={{ 
              type: "spring", 
              stiffness: 400, 
              damping: 30 
            }}
            className={`h-full flex items-center justify-center font-black text-md bg-primary text-white shadow-xl shadow-primary/30 overflow-hidden disabled:opacity-20 transition-colors`}
          >
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="loader"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Loader2 className="w-7 h-7 animate-spin" />
                </motion.div>
              ) : (
                <motion.span
                  key="text"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="whitespace-nowrap"
                >
                  Complete Setup
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}
