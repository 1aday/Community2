import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

function cleanRocketReachData(data: string): string {
  return data
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\\"/g, '"')
    .replace(/&quot;/g, '"')
    .replace(/#{1,6}\s/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export async function POST(req: Request) {
  try {
    const { perplexityData, rocketReachData } = await req.json()

    console.log('Processing Info:')
    console.log('Perplexity Data:', perplexityData)
    console.log('RocketReach Data:', rocketReachData)

    // RocketReach data is now optional
    const cleanedRocketReachData = rocketReachData ? cleanRocketReachData(rocketReachData) : ''
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
            "careerHistory": [{"title": "string", "company": "string", "duration": "string", "highlights": ["string array"]}],
            "expertiseAreas": ["string array of expertise"]
          }
          
          For careerHistory, include both current and previous roles in chronological order, most recent first.`
        },
        {
          role: "user",
          content: `Please use this information about a person:
            Perplexity Data: ${JSON.stringify(perplexityData)}
            ${rocketReachData ? `Career History: ${cleanedRocketReachData}` : ''}
            
            ${rocketReachData 
              ? 'Combine both sources to create a complete profile. Use all available career history information.'
              : 'Create a profile based on the available information.'
            }
            Return the information in the exact JSON structure specified.`
        }
      ],
      temperature: 0.1,
      response_format: { type: "json_object" }
    })

    const content = completion.choices[0].message.content
    if (!content) {
      throw new Error('OpenAI response missing content')
    }

    // Parse the JSON response and wrap it in the expected structure
    const processedInfo = JSON.parse(content)
    return NextResponse.json({ info: processedInfo })

  } catch (error) {
    console.error('Processing Error:', error)
    return NextResponse.json({ 
      error: 'Failed to process information',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 