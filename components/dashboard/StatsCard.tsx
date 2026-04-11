import { Card, CardContent } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  description?: string
}

export function StatsCard({ title, value, icon: Icon, description }: StatsCardProps) {
  return (
    <Card className="rounded-2xl border border-border bg-card">
      <CardContent className="p-6">
        {/* Icon */}
        <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center mb-4">
          <Icon className="w-5 h-5 text-muted-foreground" />
        </div>

        {/* Value */}
        <h2 className="text-3xl font-bold tracking-tight">
          {typeof value === "number" ? value.toLocaleString() : value}
        </h2>

        {/* Title */}
        <p className="text-sm text-muted-foreground mt-1">{title}</p>

        {/* Description */}
        {description && (
          <p className="text-xs text-muted-foreground mt-2">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}