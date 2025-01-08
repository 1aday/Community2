import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

function cleanRocketReachData(data: string): string {
  return data
    // Remove markdown links
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove image references
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    // Remove escaped quotes
    .replace(/\\"/g, '"')
    // Remove HTML entities
    .replace(/&quot;/g, '"')
    // Remove markdown formatting
    .replace(/#{1,6}\s/g, '')
    // Clean up multiple spaces and newlines
    .replace(/\s+/g, ' ')
    .trim()
}

export async function POST(req: Request) {
  try {
    const { perplexityData, rocketReachData } = await req.json()

    // Log the incoming data to verify what we're receiving
    console.log('Processing Info:')
    console.log('Perplexity Data:', perplexityData)
    console.log('RocketReach Data:', rocketReachData)

    // Make sure we have the RocketReach data
    if (!rocketReachData) {
      return NextResponse.json({ 
        error: 'Missing RocketReach data',
        details: 'RocketReach data is required for processing'
      }, { status: 400 })
    }

    // Clean up the RocketReach data
    const cleanedRocketReachData = cleanRocketReachData(rocketReachData)
    console.log('Cleaned RocketReach Data:', cleanedRocketReachData)

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a helpful assistant that processes and combines information about people. DO NOT say whats unknown. Be detailed.
          Always return information in this exact JSON structure:
          {
            "currentRole": "string",
            "keyAchievements": ["string array of achievements"],
            "professionalBackground": "string",
            "previousRoles": [{"title": "string", "company": "string", "duration": "string", "highlights": ["string array"]}],
            "expertiseAreas": ["string array of expertise"]
          }`
        },
        {
          role: "user",
          content: `Please use this information about a person:
            Perplexity Data: ${JSON.stringify(perplexityData)}
            Career History: ${cleanedRocketReachData}
            
            Combine both sources to create a complete profile. Use the career history to enhance and verify the information.
            Return the information in the exact JSON structure specified.`
        }
      ],
      temperature: 0.1,
      response_format: { type: "json_object" }
    })

    // Parse the JSON response and wrap it in the expected structure
    const processedInfo = JSON.parse(completion.choices[0].message.content)
    return NextResponse.json({ info: processedInfo })

  } catch (error) {
    console.error('Processing Error:', error)
    return NextResponse.json({ 
      error: 'Failed to process information',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 