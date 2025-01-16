import { NextResponse } from 'next/server'
import axios, { AxiosResponse } from 'axios'

// Add retry configuration
const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // 1 second

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function makeRequestWithRetry(url: string, retries = MAX_RETRIES): Promise<AxiosResponse> {
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' })
    return response
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 429 && retries > 0) {
      // Wait before retrying
      await delay(RETRY_DELAY)
      return makeRequestWithRetry(url, retries - 1)
    }
    throw error
  }
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
    let status = 500
    
    if (axios.isAxiosError(error) && error.response?.status) {
      status = error.response.status
    }
    
    return NextResponse.json(
      { error: 'Failed to proxy image' },
      { status }
    )
  }
} 