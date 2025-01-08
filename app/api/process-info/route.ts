import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  try {
    const { perplexityData, rocketReachData } = await req.json()

    // Get AI insights about the person
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that processes and combines information about people."
        },
        {
          role: "user",
          content: `Please combine and process this information about a person:
            Perplexity Data: ${JSON.stringify(perplexityData)}
            RocketReach Data: ${rocketReachData}`
        }
      ],
      temperature: 0.7,
    })

    // Combine AI insights with existing data
    const processedInfo = {
      ...perplexityData,
      professionalBackground: completion.choices[0].message.content || perplexityData.professionalBackground
    }

    return NextResponse.json({ 
      info: {
        currentRole: processedInfo.currentRole || "",
        keyAchievements: processedInfo.keyAchievements || [],
        professionalBackground: processedInfo.professionalBackground || "",
        previousRoles: processedInfo.previousRoles || [],
        expertiseAreas: processedInfo.expertiseAreas || []
      }
    })

  } catch (error) {
    console.error('Processing Error:', error)
    return NextResponse.json({ 
      error: 'Failed to process information',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 