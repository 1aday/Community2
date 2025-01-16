"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, ChevronDown, ChevronUp } from "lucide-react"
import { PromptEditor } from "@/components/prompt-editor"
import { PersonCard } from "@/components/person-card"
import { LoadingIndicator } from "@/components/loading-indicator"
import { motion } from "framer-motion"
import Image from 'next/image'
import { PersonInfo } from "@/types"

interface LoadingState {
  perplexity: boolean
  rocketReach: boolean
  openai: boolean
}

interface RowData {
  col1: string
  col2: string
  info: PersonInfo | null
  loading?: boolean
  loadingStates?: LoadingState
}

interface ApiResponse {
  info: PersonInfo
  error?: string
  details?: string
}

const defaultInfo: PersonInfo = {
  currentRole: "",
  keyAchievements: [],
  professionalBackground: "",
  careerHistory: [],
  expertiseAreas: [],
  linkedInUrl: "",
  rocketReachUrl: ""
}

export default function Home() {
  const [rows, setRows] = React.useState<RowData[]>([
    { 
      col1: "Amir Jaffari", 
      col2: "Shopify",
      info: null,
      loadingStates: {
        perplexity: false,
        rocketReach: false,
        openai: false
      }
    }
  ])
  const [bulkInput, setBulkInput] = React.useState("")
  const [prompt, setPrompt] = React.useState<string>(
    `Find information about {{name}} who works at {{company}}. Return the information in this exact JSON structure. Include at least 3-5 expertise areas, and provide a detailed professional background covering their career progression:
{
  "currentRole": "string - detailed current position",
  "keyAchievements": [
    "string - notable accomplishments in current and past roles"
  ],
  "professionalBackground": "string - comprehensive career narrative",
  "careerHistory": [
    {
      "title": "string - job title",
      "company": "string - company name",
      "duration": "string - time period",
      "highlights": [
        "string - key responsibilities and achievements"
      ]
    }
  ],
  "expertiseAreas": [
    "string - 3 to 5 specific areas of expertise"
  ]
}`
  )
  const [isPromptOpen, setIsPromptOpen] = React.useState(false)
  const [isBulkOpen, setIsBulkOpen] = React.useState(false)

  const handleRowChange = (index: number, column: 'col1' | 'col2', value: string) => {
    if (index < 0 || index >= rows.length) return  // Bounds check
    
    setRows(prev => {
      const newRows = [...prev]
      newRows[index] = {
        ...newRows[index],
        [column]: value
      }
      return newRows
    })
  }

  const addRow = () => {
    setRows([...rows, { 
      col1: "", 
      col2: "", 
      info: null,
      loadingStates: {
        perplexity: false,
        rocketReach: false,
        openai: false
      }
    }])
  }

  const removeRow = (index: number) => {
    const newRows = rows.filter((_, i) => i !== index)
    setRows(newRows.length ? newRows : [{
      col1: "",
      col2: "",
      info: null,
      loadingStates: {
        perplexity: false,
        rocketReach: false,
        openai: false
      }
    }])
  }

  const handleBulkPaste = () => {
    const lines = bulkInput.trim().split('\n')
    const newRows = lines.map(line => {
      const [col1 = "", col2 = ""] = line.split('\t')
      return {
        col1: col1.trim(),
        col2: col2.trim(),
        info: null,
        loadingStates: {
          perplexity: false,
          rocketReach: false,
          openai: false
        }
      }
    })
    setRows(newRows.length ? newRows : [{
      col1: "",
      col2: "",
      info: null,
      loadingStates: {
        perplexity: false,
        rocketReach: false,
        openai: false
      }
    }])
    setBulkInput("")
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Submitted data:", rows)
  }

  const resetPrompt = () => {
    setPrompt(
      `Find information about {{name}} who works at {{company}} DO NOT MAKE SHIT UP, and if you have any doubt that the info you found is not about this person do not include it. Return the information in this exact JSON structure. Include at least 3-5 expertise areas, and provide a detailed professional background covering their career progression:
{
  "currentRole": "string - detailed current position",
  "keyAchievements": [
    "string - notable accomplishments in current and past roles"
  ],
  "professionalBackground": "string - comprehensive career narrative",
  "careerHistory": [
    {
      "title": "string - job title",
      "company": "string - company name",
      "duration": "string - time period",
      "highlights": [
        "string - key responsibilities and achievements"
      ]
    }
  ],
  "expertiseAreas": [
    "string - 3 to 5 specific areas of expertise"
  ]
}`
    )
  }

  const handleSearch = async (index: number) => {
    const row = rows[index]
    if (!row.col1 || !row.col2) return

    // Initialize loading states
    setRows(prev => {
      const newRows = [...prev]
      newRows[index] = { 
        ...row, 
        loading: true,
        loadingStates: {
          perplexity: true,
          rocketReach: true,
          openai: false
        }
      }
      return newRows
    })

    try {
      // First get LinkedIn URL and RocketReach URL
      const profileResponse = await fetch('/api/profile-pic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: row.col1, company: row.col2 }),
      })
      const profileData = await profileResponse.json()
      if (!profileResponse.ok) {
        throw new Error(profileData.error || 'Failed to fetch profile information')
      }

      // Start both Perplexity and RocketReach requests in parallel
      const [perplexityData, rocketReachData] = await Promise.all([
        // Get person info from Perplexity
        fetch('/api/person-info', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            name: row.col1, 
            company: row.col2,
            prompt: prompt
          })
        }).then(res => res.json()),

        // Get RocketReach data if URL is available
        profileData.rocketReachUrl ? 
          fetch('/api/history', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: profileData.rocketReachUrl })
          })
            .then(res => res.json())
            .then(data => data.error ? null : data)
            .catch(error => {
              console.warn('RocketReach data fetch failed:', error)
              return null
            }) 
          : Promise.resolve(null)
      ])

      if (!perplexityData || perplexityData.error) {
        throw new Error(perplexityData.error || 'Failed to fetch person information')
      }

      // Update loading state for OpenAI
      setRows(prev => {
        const newRows = [...prev]
        newRows[index] = { 
          ...newRows[index], 
          loadingStates: {
            perplexity: false,
            rocketReach: false,
            openai: true
          }
        }
        return newRows
      })

      // Process with OpenAI
      const processResponse = await fetch('/api/process-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          perplexityData: perplexityData.info,
          rocketReachData: rocketReachData || null,
          name: row.col1,
          company: row.col2
        })
      })
      const processedData: ApiResponse = await processResponse.json()

      if (!processResponse.ok) {
        throw new Error(processedData.details || processedData.error || 'Failed to process information')
      }

      // Final update with results
      setRows(prev => {
        const newRows = [...prev]
        newRows[index] = {
          ...row,
          info: {
            ...processedData.info,
            linkedInUrl: profileData.linkedInUrl,
            rocketReachUrl: profileData.rocketReachUrl
          },
          loading: false,
          loadingStates: {
            perplexity: false,
            rocketReach: false,
            openai: false
          }
        }
        return newRows
      })
    } catch (error) {
      console.error('Search Error:', error)
      setRows(prev => {
        const newRows = [...prev]
        newRows[index] = { 
          ...row, 
          loading: false,
          loadingStates: {
            perplexity: false,
            rocketReach: false,
            openai: false
          },
          info: {
            ...defaultInfo,
            currentRole: error instanceof Error ? error.message : "Error fetching information",
            professionalBackground: "An error occurred while fetching the data. Please try again."
          }
        }
        return newRows
      })
    }
  }

  return (
    <div className="min-h-screen p-8">
      <main className="container mx-auto space-y-8">
        <section className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Person Info Finder
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Enter a person&apos;s name and company to find information about them
          </p>
        </section>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader 
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => setIsPromptOpen(!isPromptOpen)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Prompt Editor</CardTitle>
                  <CardDescription>
                    Customize how the AI finds and presents information
                  </CardDescription>
                </div>
                {isPromptOpen ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </CardHeader>
            {isPromptOpen && (
              <CardContent>
                <PromptEditor
                  value={prompt}
                  onChange={setPrompt}
                  onReset={resetPrompt}
                />
              </CardContent>
            )}
          </Card>

          <Card>
            <CardHeader 
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => setIsBulkOpen(!isBulkOpen)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Bulk Paste</CardTitle>
                  <CardDescription>
                    Paste your tab-separated data here (name and company)
                  </CardDescription>
                </div>
                {isBulkOpen ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </CardHeader>
            {isBulkOpen && (
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Paste your data here..."
                  value={bulkInput}
                  onChange={(e) => setBulkInput(e.target.value)}
                  className="min-h-[100px]"
                />
                <Button type="button" onClick={handleBulkPaste}>
                  Process Pasted Data
                </Button>
              </CardContent>
            )}
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Manual Entry</CardTitle>
              <CardDescription>
                Add or edit rows manually
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Info</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Input
                          value={row.col1}
                          onChange={(e) => handleRowChange(index, 'col1', e.target.value)}
                          placeholder="Name"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={row.col2}
                          onChange={(e) => handleRowChange(index, 'col2', e.target.value)}
                          placeholder="Company"
                        />
                      </TableCell>
                      <TableCell className="min-w-[400px]">
                        {row.loading ? (
                          <div className="space-y-8">
                            <LoadingIndicator 
                              loadingStates={{
                                perplexity: row.loadingStates?.perplexity ?? false,
                                rocketReach: row.loadingStates?.rocketReach ?? false,
                                openai: row.loadingStates?.openai ?? false
                              }} 
                            />
                          </div>
                        ) : row.info ? (
                          <PersonCard info={row.info} />
                        ) : null}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => handleSearch(index)}
                            disabled={!row.col1 || !row.col2 || row.loading}
                          >
                            Find Info
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeRow(index)}
                          >
                            Remove
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="mt-4 flex gap-4">
                <Button type="button" variant="outline" onClick={addRow}>
                  Add Row
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </main>
    </div>
  )
}
