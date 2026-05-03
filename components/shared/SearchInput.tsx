"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

export function SearchInput({ placeholder }: { placeholder: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  // 1. Local state taake input foran type ho (Smooth typing) 
  const [value, setValue] = useState(searchParams.get("search") || "")

  // 2. Debouncing Logic 
 useEffect(() => {
  const timer = setTimeout(() => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (value) {
      params.set("search", value)
    } else {
      params.delete("search")
    }
    
    router.push(`${pathname}?${params.toString()}`)
  }, 500)
  
  return () => clearTimeout(timer)
}, [value]) // sirf value rakho — baaki hata do

  return (
    <div className="relative flex-1 w-full">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        className="pl-9 rounded-xl bg-background border-border h-11 shadow-sm focus-visible:ring-1 focus-visible:ring-primary/20"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </div>
  )
}