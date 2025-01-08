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
    const query = `${name} ${company} site:rocketreach.co`
    const imageQuery = `${name} ${company} profile picture`

    // Search for RocketReach profile
    const profileResponse = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': process.env.SERPER_API_KEY || '',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ q: query })
    })

    // Search for profile picture
    const imageResponse = await fetch('https://google.serper.dev/images', {
      method: 'POST',
      headers: {
        'X-API-KEY': process.env.SERPER_API_KEY || '',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ q: imageQuery })
    })

    const profileData: SerperResponse = await profileResponse.json()
    const imageData: SerperResponse = await imageResponse.json()

    // Get first result that matches RocketReach
    const rocketReachUrl = profileData.organic?.find(
      (result) => result.link.includes('rocketreach.co')
    )?.link

    // Get first image result
    const profilePic = imageData.images?.[0]?.imageUrl

    return NextResponse.json({
      rocketReachUrl,
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