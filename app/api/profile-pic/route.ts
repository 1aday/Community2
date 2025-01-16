import { NextResponse } from 'next/server'
import axios from 'axios'

// Add retry configuration
const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // 1 second

interface SerperResult {
  title: string
  link: string
  snippet: string
  position: number
}

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function makeRequestWithRetry(url: string, retries = MAX_RETRIES): Promise<any> {
  try {
    const response = await axios.get(url)
    return response
  } catch (error: any) {
    if (error.response?.status === 429 && retries > 0) {
      // Wait before retrying
      await delay(RETRY_DELAY)
      return makeRequestWithRetry(url, retries - 1)
    }
    throw error
  }
}

function validateRocketReachResult(result: SerperResult, name: string, company: string): boolean {
  if (!result?.title) return false
  
  // Convert everything to lowercase for case-insensitive comparison
  const title = result.title.toLowerCase()
  const searchName = name.toLowerCase()
  const searchCompany = company.toLowerCase()
  
  // Split name into parts for more flexible matching
  const nameParts = searchName.split(' ')
  const hasName = nameParts.every((part: string) => title.includes(part))
  
  // Check if company name is in title or snippet
  const hasCompanyInTitle = title.includes(searchCompany)
  const hasCompanyInSnippet = result.snippet ? 
    result.snippet.toLowerCase().includes(searchCompany) : 
    false
  
  return hasName && (hasCompanyInTitle || hasCompanyInSnippet)
}

export async function POST(req: Request) {
  try {
    const { imageUrl } = await req.json()
    
    const response = await makeRequestWithRetry(imageUrl)
    const base64Image = Buffer.from(response.data, 'binary').toString('base64')
    
    return NextResponse.json({
      proxiedUrl: `data:${response.headers['content-type']};base64,${base64Image}`
    })

  } catch (error) {
    console.error('Error proxying image:', error)
    return NextResponse.json(
      { error: 'Failed to proxy image' },
      { status: error.response?.status || 500 }
    )
  }
} 