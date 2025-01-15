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
    const { perplexityData, rocketReachData: originalRocketReachData, name, company } = await req.json()
    
    console.log('Processing Info:')
    console.log('Perplexity Data:', perplexityData)
    
    let rocketReachData = originalRocketReachData

    // Simple validation - just check if title contains name and company
    if (rocketReachData?.metadata) {
      const title = (rocketReachData.metadata['og:title'] || '').toLowerCase()
      const hasName = name.toLowerCase().split(' ').every(part => title.includes(part))
      const hasCompany = title.includes(company.toLowerCase())

      if (!hasName || !hasCompany) {
        console.warn('Title validation failed:', { title, name, company })
        rocketReachData = null
      }
    }

    // Access the markdown directly from the validated data
    const cleanedRocketReachData = rocketReachData?.markdown ? cleanRocketReachData(rocketReachData.markdown) : ''
    console.log('Cleaned RocketReach Data:', cleanedRocketReachData)

    // Combine the data for OpenAI
    const combinedData = {
      ...perplexityData,
      additionalInfo: cleanedRocketReachData
    };

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a helpful assistant that processes and combines information about people. 
          DO NOT MAKE UP ANY INFORMATION. Only use what is provided in the data sources.
          
          The RocketReach data contains career history information - use this as the primary source for work history.
          The Perplexity data contains additional context and achievements.
          
          Return response in this exact JSON structure:
          {
            "currentRole": "string",
            "keyAchievements": ["string"],
            "professionalBackground": "string",
            "careerHistory": [{"title": "string", "company": "string", "duration": "string", "highlights": ["string"]}],
            "expertiseAreas": ["string"]
          }
          
          Important: 
          - The careerHistory array MUST include ALL roles found in the RocketReach data
          - Order roles from most recent to oldest
          - Only include factual information from the provided data sources
          - Do not invent or assume any details`
        },
        {
          role: "user",
          content: `Here are the information sources about ${name} at ${company}:
            
            RocketReach Career History:
            ${cleanedRocketReachData}
            
            Additional Context from Perplexity:
            ${JSON.stringify(perplexityData)}
            
            Extract and include ALL career history entries, especially from the RocketReach data.
            Do not make up or assume any information not present in these sources.`
        }
      ],
      temperature: 0.1
    })

    const content = completion.choices[0].message.content
    if (!content) {
      throw new Error('OpenAI response missing content')
    }

    // Parse the JSON response and wrap it in the expected structure
    const processedInfo = JSON.parse(content)
    return NextResponse.json({ info: processedInfo })

  } catch (error) {
    console.error("Error processing info:", error);
    return NextResponse.json({ error: "Failed to process information" }, { status: 500 });
  }
} 