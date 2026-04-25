"use client"
// React se 3 cheezein import karo
import { createContext, useContext, useEffect, useState } from "react"

// Theme sirf 2 values le sakti hai
type Theme = "light" | "dark"

// Context ka structure batao
interface ThemeContextType {
  theme: Theme           // Abhi kaunsi theme hai
  setTheme: (t: Theme) => void  // Theme kaise badlein
}

// Context banao — default values do
const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  setTheme: () => {},
})

// ThemeProvider = Ek wrapper hai
// Jahan bhi lagao — wahan context available ho jaata hai
export function ThemeProvider({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  // theme = current theme
  // setTheme = theme badalne ka function
  const [theme, setTheme] = useState<Theme>("light")

  // Page load par: kya theme save thi?
  useEffect(() => {
    const saved = localStorage.getItem("theme") as Theme
    if (saved) setTheme(saved)  // Mili toh use karo
  }, [])

  // Theme badle tab: HTML update karo
  useEffect(() => {
    const root = document.documentElement // = <html> tag
    root.classList.remove("light", "dark") // Purani class hatao
    root.classList.add(theme)              // Nayi class lagao
    localStorage.setItem("theme", theme)   // Save karo
  }, [theme])

  return (
    // Context mein theme aur setTheme do
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

// Hook = Shortcut hai context use karne ka
// Kisi bhi component mein likho:
// const { theme, setTheme } = useTheme()
export const useTheme = () => useContext(ThemeContext)