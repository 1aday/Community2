import { NextResponse } from 'next/server'
import axios from 'axios'

interface SerperImage {
  imageUrl: string
  link: string
  source: string
}

interface SerperResult {
  title: string
  link: string
  snippet: string
  position: number
}

function validateRocketReachResult(result: SerperResult, name: string, company: string): boolean {
  if (!result?.title) return false
  
  // Convert everything to lowercase for case-insensitive comparison
  const title = result.title.toLowerCase()
  const searchName = name.toLowerCase()
  const searchCompany = company.toLowerCase()
  
  // Split name into parts for more flexible matching
  const nameParts = searchName.split(' ')
  const hasName = nameParts.every(part => title.includes(part))
  
  // Check if company name is in title or snippet
  const hasCompany = title.includes(searchCompany) || 
                    (result.snippet && result.snippet.toLowerCase().includes(searchCompany))
  
  return hasName && hasCompany
}

export async function POST(req: Request) {
  try {
    const { name, company } = await req.json()

    // LinkedIn Image Search
    console.group('Serper LinkedIn API Request')
    console.log('Query:', `${name} ${company} site:linkedin.com/in`)

    const linkedInResponse = await axios.post('https://google.serper.dev/images', {
      q: `${name} ${company} site:linkedin.com/in`
    }, {
      headers: {
        'X-API-KEY': process.env.SERPER_API_KEY,
        'Content-Type': 'application/json'
      }
    })

    console.log('Serper LinkedIn Response:', linkedInResponse.data)
    console.groupEnd()

    // RocketReach Search using regular search API
    console.group('Serper RocketReach API Request')
    const rocketReachQuery = `"${name}" ${company} site:rocketreach.co`
    console.log('Query:', rocketReachQuery)

    const rocketReachResponse = await axios.post('https://google.serper.dev/search', {
      q: rocketReachQuery
    }, {
      headers: {
        'X-API-KEY': process.env.SERPER_API_KEY,
        'Content-Type': 'application/json'
      }
    })

    console.log('Serper RocketReach Response:', rocketReachResponse.data)

    // Find the first valid RocketReach result
    const rocketReachResult = rocketReachResponse.data.organic?.find(
      (result: SerperResult) => validateRocketReachResult(result, name, company)
    )

    console.log('Validated RocketReach Result:', rocketReachResult || 'No valid result found')
    console.groupEnd()

    const linkedInResult = linkedInResponse.data.images?.[0]

    return NextResponse.json({ 
      imageUrl: linkedInResult?.imageUrl || null,
      linkedInUrl: linkedInResult?.link || null,
      rocketReachUrl: rocketReachResult?.link || null
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile information' },
      { status: 500 }
    )
  }
} 