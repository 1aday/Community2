import { NextResponse } from 'next/server'
import FirecrawlApp from '@mendable/firecrawl-js'

const firecrawl = new FirecrawlApp({
  apiKey: process.env.FIRECRAWL_API_KEY || ''
})

export async function POST(req: Request) {
  try {
    const { url } = await req.json()
    
    const scrapeResult = await firecrawl.scrapeUrl(url, {
      formats: ['markdown'],
      mobile: false,
      actions: [
        { type: "wait", milliseconds: 2000 },
        { type: "wait", selector: ".history-container" },
        { type: "scrape" }
      ]
    })

    if (!scrapeResult.success || !scrapeResult.markdown) {
      throw new Error('Failed to scrape profile')
    }

    return NextResponse.json({ 
      history: scrapeResult.markdown
    })

  } catch (error) {
    console.error('History Error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch history',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 