"use client"
import { createContext, useContext, useEffect, useState } from "react"

type Theme = "light" | "dark"


interface ThemeContextType {
  theme: Theme  
  setTheme: (t: Theme) => void  
}


const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  setTheme: () => {},
})


export function ThemeProvider({ 
  children 
}: { 
  children: React.ReactNode 
}) {

  const [theme, setTheme] = useState<Theme>("light")

  
  useEffect(() => {
    const saved = localStorage.getItem("theme") as Theme
    if (saved) setTheme(saved) 
  }, [])


  useEffect(() => {
    const root = document.documentElement
    root.classList.remove("light", "dark") 
    root.classList.add(theme)              
    localStorage.setItem("theme", theme)   
  }, [theme])

  return (
   
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)