import { NextResponse } from 'next/server'

interface SerperResult {
  link: string
  // Add other properties if needed, but we only use link
}

interface SerperResponse {
  organic?: SerperResult[]
  images?: Array<{
    imageUrl: string
  }>
}

export async function POST(req: Request) {
  try {
    const { name, company } = await req.json()
    const rocketQuery = `${name} ${company} site:rocketreach.co`
    const linkedinQuery = `${name} ${company} site:linkedin.com/in`
    const imageQuery = `${name} ${company} profile picture`

    // Search for both profiles and image
    const [rocketResponse, linkedinResponse, imageResponse] = await Promise.all([
      fetch('https://google.serper.dev/search', {
        method: 'POST',
        headers: {
          'X-API-KEY': process.env.SERPER_API_KEY || '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ q: rocketQuery })
      }),
      fetch('https://google.serper.dev/search', {
        method: 'POST',
        headers: {
          'X-API-KEY': process.env.SERPER_API_KEY || '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ q: linkedinQuery })
      }),
      fetch('https://google.serper.dev/images', {
        method: 'POST',
        headers: {
          'X-API-KEY': process.env.SERPER_API_KEY || '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ q: imageQuery })
      })
    ])

    const [rocketData, linkedinData, imageData] = await Promise.all([
      rocketResponse.json(),
      linkedinResponse.json(),
      imageResponse.json()
    ])

    // Get first result that matches RocketReach
    const rocketReachUrl = rocketData.organic?.find(
      (result: SerperResult) => result.link.includes('rocketreach.co')
    )?.link

    // Get first result that matches LinkedIn
    const linkedinUrl = linkedinData.organic?.find(
      (result: SerperResult) => result.link.includes('linkedin.com/in')
    )?.link

    // Get first image result
    const profilePic = imageData.images?.[0]?.imageUrl

    return NextResponse.json({
      rocketReachUrl,
      linkedinUrl,
      profilePic
    })

  } catch (error) {
    console.error('Search Error:', error)
    return NextResponse.json({ 
      error: 'Failed to search',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 