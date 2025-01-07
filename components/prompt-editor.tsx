"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface PromptEditorProps {
  value: string
  onChange: (value: string) => void
  onReset: () => void
}

const VARIABLES = [
  { key: "name", description: "The person's name" },
  { key: "company", description: "The company name" }
]

export function PromptEditor({ value, onChange, onReset }: PromptEditorProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  const insertVariable = (variable: string) => {
    if (!textareaRef.current) return

    const textarea = textareaRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const before = value.substring(0, start)
    const after = value.substring(end)
    const newValue = `${before}{{${variable}}}${after}`
    
    onChange(newValue)
    
    // Set cursor position after the inserted variable
    const newPosition = start + variable.length + 4 // 4 for the {{ and }}
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(newPosition, newPosition)
    }, 0)
  }

  return (
    <Card className="relative">
      <CardHeader className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Prompt Editor</CardTitle>
            <CardDescription className="text-base mt-2">
              Customize how the AI finds and presents information
            </CardDescription>
          </div>
          <Button variant="outline" onClick={onReset}>
            Reset to Default
          </Button>
        </div>
        
        <div className="space-y-2">
          <div className="text-sm font-medium text-muted-foreground">
            Available Variables:
          </div>
          <div className="flex flex-wrap gap-2">
            <TooltipProvider>
              {VARIABLES.map((variable) => (
                <Tooltip key={variable.key}>
                  <TooltipTrigger asChild>
                    <Badge 
                      variant="secondary" 
                      className="cursor-pointer hover:bg-secondary/80 transition-colors px-3 py-1.5"
                      onClick={() => insertVariable(variable.key)}
                    >
                      {`{{${variable.key}}}`}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{variable.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Click to insert at cursor position
                    </p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </TooltipProvider>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative rounded-md border">
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="min-h-[200px] font-mono text-sm leading-relaxed resize-y p-4"
            placeholder="Enter your prompt here..."
            spellCheck={false}
          />
          <div 
            className="absolute top-0 left-0 w-full h-full pointer-events-none p-4 font-mono text-sm"
            style={{
              color: 'transparent',
              WebkitTextFillColor: 'transparent',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              background: value.replace(
                /{{(.*?)}}/g, 
                (match) => `<span style="color: var(--primary)">${match}</span>`
              )
            }}
          >
            {value}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 