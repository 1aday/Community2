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
  profilePic: boolean
  perplexity: boolean
  rocketReach: boolean
  openai: boolean
}

interface RowData {
  col1: string
  col2: string
  info: PersonInfo | null
  loading?: boolean
  profilePic?: string
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
        profilePic: false,
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
        profilePic: false,
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
        profilePic: false,
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
          profilePic: false,
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
        profilePic: false,
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
          profilePic: true,
          perplexity: false,
          rocketReach: false,
          openai: false
        }
      }
      return newRows
    })

    try {
      // First get profile pic and LinkedIn URL
      const profileResponse = await fetch('/api/profile-pic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: row.col1, company: row.col2 }),
      })
      const profileData = await profileResponse.json()
      if (!profileResponse.ok) {
        throw new Error(profileData.error || 'Failed to fetch profile information')
      }

      // Update loading state for Perplexity
      setRows(prev => {
        const newRows = [...prev]
        newRows[index] = { 
          ...newRows[index], 
          loadingStates: {
            profilePic: false,
            perplexity: true,
            rocketReach: false,
            openai: false
          }
        }
        return newRows
      })

      // Get person info from Perplexity
      const personInfoPayload = { 
        name: row.col1, 
        company: row.col2,
        prompt: prompt
      }

      const infoResponse = await fetch('/api/person-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(personInfoPayload)
      })
      const perplexityData = await infoResponse.json()
      if (!infoResponse.ok) {
        throw new Error(perplexityData.error || 'Failed to fetch person information')
      }

      // Update loading state for RocketReach
      setRows(prev => {
        const newRows = [...prev]
        newRows[index] = { 
          ...newRows[index], 
          loadingStates: {
            profilePic: false,
            perplexity: false,
            rocketReach: true,
            openai: false
          }
        }
        return newRows
      })

      let rocketReachData = null
      if (profileData.rocketReachUrl) {
        const historyResponse = await fetch('/api/history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: profileData.rocketReachUrl })
        })
        const historyData = await historyResponse.json()
        if (!historyResponse.ok) {
          throw new Error(historyData.error || 'Failed to fetch history information')
        }
        if (!historyData.error) {
          rocketReachData = historyData.history
        }
      }

      // Update loading state for OpenAI
      setRows(prev => {
        const newRows = [...prev]
        newRows[index] = { 
          ...newRows[index], 
          loadingStates: {
            profilePic: false,
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
          rocketReachData
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
          profilePic: profileData.imageUrl,
          loading: false,
          loadingStates: {
            profilePic: false,
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
            profilePic: false,
            perplexity: false,
            rocketReach: false,
            openai: false
          },
          info: {
            currentRole: error instanceof Error ? error.message : "Error fetching information",
            keyAchievements: [],
            professionalBackground: "An error occurred while fetching the data. Please try again.",
            expertiseAreas: [],
            careerHistory: [],
            linkedInUrl: "",
            rocketReachUrl: ""
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
                    <TableHead>Profile Picture</TableHead>
                    <TableHead>Information</TableHead>
                    <TableHead className="w-[150px]">Actions</TableHead>
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
                      <TableCell>
                        {row.loading ? (
                          <div className="flex items-center justify-center w-12 h-12">
                            <Loader2 className="h-6 w-6 animate-spin" />
                          </div>
                        ) : row.profilePic ? (
                          <Image 
                            src={row.profilePic} 
                            alt=""
                            width={48}
                            height={48}
                            className="rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                            {row.col1 ? row.col1[0].toUpperCase() : "—"}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="min-w-[400px]">
                        {row.loading ? (
                          <div className="space-y-8">
                            <LoadingIndicator 
                              loadingStates={{
                                profilePic: row.loadingStates?.profilePic ?? false,
                                perplexity: row.loadingStates?.perplexity ?? false,
                                rocketReach: row.loadingStates?.rocketReach ?? false,
                                openai: row.loadingStates?.openai ?? false
                              }} 
                            />
                            <motion.div 
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-center"
                            >
                              <motion.p 
                                className="text-sm text-muted-foreground"
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 2, repeat: Infinity }}
                              >
                                {row.loadingStates?.profilePic && (
                                  "Searching across professional networks..."
                                )}
                                {row.loadingStates?.perplexity && (
                                  "Analyzing career trajectory and achievements..."
                                )}
                                {row.loadingStates?.rocketReach && (
                                  "Building comprehensive professional profile..."
                                )}
                                {row.loadingStates?.openai && (
                                  "Crafting detailed career insights..."
                                )}
                              </motion.p>
                            </motion.div>
                          </div>
                        ) : row.info ? (
                          <PersonCard
                            name={row.col1}
                            info={row.info || defaultInfo}
                            profilePic={row.profilePic}
                            linkedinUrl={row.info.linkedInUrl}
                            rocketReachUrl={row.info.rocketReachUrl}
                          />
                        ) : (
                          "No information yet"
                        )}
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
