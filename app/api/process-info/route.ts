import { NextResponse } from 'next/server'
import { Configuration, OpenAIApi } from 'openai'

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})

const openai = new OpenAIApi(configuration)

export const maxDuration = 60 // Set max duration to 60 seconds

export async function POST(req: Request) {
  try {
    const { perplexityData, rocketReachData } = await req.json()

    // Prepare the data for OpenAI
    const combinedInfo = {
      perplexity: perplexityData,
      rocketReach: rocketReachData
    }

    // Make the OpenAI request with a shorter timeout
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that combines and enhances professional information."
        },
        {
          role: "user",
          content: `Combine and enhance this information: ${JSON.stringify(combinedInfo)}`
        }
      ],
      max_tokens: 1000,
      temperature: 0.7,
      timeout: 30000 // 30 second timeout
    })

    if (!completion.data.choices[0]?.message?.content) {
      throw new Error('No response from OpenAI')
    }

    return NextResponse.json({ 
      success: true,
      result: completion.data.choices[0].message.content 
    })

  } catch (error) {
    console.error('Processing Error:', error)
    return NextResponse.json({
      error: 'Failed to process information',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 