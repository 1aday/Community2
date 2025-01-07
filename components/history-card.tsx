import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import ReactMarkdown from 'react-markdown'

interface HistoryCardProps {
  name: string
  history: string | null
  loading?: boolean
  error?: string
}

export function HistoryCard({ name, history, loading, error }: HistoryCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Career History
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        </CardTitle>
        <CardDescription>
          Detailed work history from RocketReach
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error ? (
          <p className="text-destructive">{error}</p>
        ) : history ? (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown>{history}</ReactMarkdown>
          </div>
        ) : (
          <p className="text-muted-foreground">No history available</p>
        )}
      </CardContent>
    </Card>
  )
} 