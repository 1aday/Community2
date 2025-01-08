import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  try {
    const { perplexityData, rocketReachData } = await req.json()

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

    return NextResponse.json(completion.choices[0].message)

  } catch (error) {
    console.error('Processing Error:', error)
    return NextResponse.json({ 
      error: 'Failed to process information',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 