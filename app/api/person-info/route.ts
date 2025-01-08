import { NextResponse } from 'next/server'

function extractJSON(text: string): string {
  // Remove markdown code blocks if present
  text = text.replace(/```json\n|\n```/g, '')
  
  // Find the first { and last } to extract the JSON object
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  
  if (start === -1 || end === -1) {
    throw new Error('No JSON object found in response')
  }
  
  // Extract the JSON string
  let jsonStr = text.substring(start, end + 1)
  
  try {
    // First attempt: try parsing as-is
    JSON.parse(jsonStr)
    return jsonStr
  } catch {
    console.log('Initial parse failed, attempting to clean JSON...')
    
    try {
      // Replace common issues
      jsonStr = jsonStr
        // Remove any comments
        .replace(/\/\/.*/g, '')
        // Remove newlines and extra spaces
        .replace(/\s+/g, ' ')
        // Fix common quote issues
        .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":')
        // Remove any remaining control characters
        .replace(/[\x00-\x1F\x7F-\x9F]/g, '')
        // Clean up any remaining invalid quotes
        .replace(/"+/g, '"')
        .replace(/'+/g, "'")
        // Ensure proper quote usage
        .replace(/(\w+):/g, '"$1":')
        .trim()

      // Validate the cleaned JSON
      JSON.parse(jsonStr)
      return jsonStr
    } catch (e2) {
      console.error('JSON cleaning failed:', e2)
      console.error('Original text:', text)
      console.error('Attempted clean JSON:', jsonStr)
      
      // Last resort: try to rebuild the JSON structure
      try {
        const rebuilt = rebuildJSON(text)
        JSON.parse(rebuilt) // Validate it's valid JSON
        return rebuilt
      } catch (e3) {
        console.error('JSON rebuild failed:', e3)
        throw new Error('Could not parse response as valid JSON')
      }
    }
  }
}

function rebuildJSON(text: string): string {
  // Extract key information using regex patterns
  const currentRole = text.match(/["']?currentRole["']?\s*:\s*["']([^"']+)["']/)?.[1] || ''
  const keyAchievements = extractArray(text, 'keyAchievements')
  const professionalBackground = text.match(/["']?professionalBackground["']?\s*:\s*["']([^"']+)["']/)?.[1] || ''
  const previousRoles = extractArray(text, 'previousRoles')
  const expertiseAreas = extractArray(text, 'expertiseAreas')

  // Rebuild a clean JSON structure
  return JSON.stringify({
    currentRole,
    keyAchievements,
    professionalBackground,
    previousRoles,
    expertiseAreas
  }, null, 2)
}

function extractArray(text: string, key: string): string[] {
  try {
    const regex = new RegExp(`"${key}"\\s*:\\s*(\\[([^\\]]+)\\])`)
    const match = text.match(regex)
    if (match) {
      const arrayStr = match[1]
      return JSON.parse(arrayStr)
    }
  } catch (error) {
    console.error(`Failed to extract ${key} array:`, error)
  }
  return []
}

interface PerplexityResponse {
  text: string
  links: Array<{
    title: string
    url: string
  }>
  choices: Array<{
    message: {
      content: string
    }
  }>
}

export async function POST(req: Request) {
  try {
    const payload = await req.json()
    console.group('Person Info API')
    console.log('Received payload:', payload)

    if (!payload.name || !payload.company || !payload.prompt) {
      console.log('Missing required fields')
      console.groupEnd()
      return NextResponse.json({ 
        error: 'Missing required fields',
        details: 'Name, company, and prompt are required'
      }, { status: 400 })
    }

    console.log('Calling Perplexity API...')
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "llama-3.1-sonar-large-128k-online",
        messages: [
          {
            role: "system",
            content: "You're a helpful research assistant, user will give you a person's name and where they work. Use those to find info on that exact person. only reply facts do not do commentary from yourself."
          },
          {
            role: "user",
            content: payload.prompt
              .replace(/{{name}}/g, payload.name)
              .replace(/{{company}}/g, payload.company)
          }
        ],
        temperature: 0.2,
        max_tokens: 2000
      }),
    })

    const data: PerplexityResponse = await response.json()
    console.log('Perplexity API Response:', data)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json({ 
        error: 'Perplexity API error',
        details: errorData?.error || response.statusText,
        status: response.status
      }, { status: response.status })
    }

    if (!data.choices?.[0]?.message?.content) {
      return NextResponse.json({ 
        error: 'Invalid API response',
        details: 'No content in API response',
        raw: data
      }, { status: 422 })
    }

    try {
      const content = data.choices[0].message.content.trim()
      console.log('Raw response:', content)
      
      try {
        const jsonStr = extractJSON(content)
        console.log('Cleaned JSON:', jsonStr)
        
        const parsedInfo = JSON.parse(jsonStr)
        
        // Validate the required fields
        if (!parsedInfo.currentRole || !Array.isArray(parsedInfo.keyAchievements) || 
            !parsedInfo.professionalBackground || !Array.isArray(parsedInfo.expertiseAreas)) {
          throw new Error('Response missing required fields')
        }

        return NextResponse.json({ info: parsedInfo })
      } catch (e) {
        console.error('JSON processing failed:', e)
        console.error('Raw content:', content)
        return NextResponse.json({ 
          error: 'Invalid response format',
          details: e instanceof Error ? e.message : 'Unknown error',
          raw: content
        }, { status: 422 })
      }
    } catch (error) {
      console.group('Person Info API Error')
      console.error('Error:', error)
      if (error instanceof Error) {
        console.error('Stack:', error.stack)
      }
      console.groupEnd()
      return NextResponse.json({ 
        error: 'Failed to fetch person information',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 })
    }

    console.groupEnd()
  } catch (error) {
    console.group('Person Info API Error')
    console.error('Error:', error)
    if (error instanceof Error) {
      console.error('Stack:', error.stack)
    }
    console.groupEnd()
    return NextResponse.json({ 
      error: 'Failed to fetch person information',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 