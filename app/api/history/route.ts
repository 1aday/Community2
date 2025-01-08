import { NextResponse } from 'next/server'
import FirecrawlApp, { ScrapeResponse } from '@mendable/firecrawl-js'

interface ScrapeData {
  markdown?: string
  html?: string
  metadata?: {
    title?: string
    description?: string
    sourceURL?: string
  }
}

const firecrawl = new FirecrawlApp({
  apiKey: process.env.FIRECRAWL_API_KEY || ''
})

export async function POST(req: Request) {
  try {
    const { url } = await req.json()
    
    console.log('Scraping URL:', url)

    const scrapeResult = await firecrawl.scrapeUrl(url, {
      formats: ['markdown', 'html'],
      mobile: false,
      actions: [
        { type: "wait", milliseconds: 2000 },
        { type: "wait", selector: ".history-container" },
        { type: "scrape" }
      ]
    }) as ScrapeResponse<ScrapeData>

    if (!scrapeResult.success) {
      console.error('Scrape failed:', scrapeResult.error)
      return NextResponse.json({ 
        error: 'Failed to fetch history',
        details: scrapeResult.error
      }, { status: 500 })
    }

    // Try to get content from either markdown or HTML
    const content = scrapeResult.markdown || 
                   (scrapeResult.html && extractTextFromHtml(scrapeResult.html))

    if (!content) {
      return NextResponse.json({ 
        error: 'No content found'
      }, { status: 404 })
    }

    // Clean up the text and extract relevant parts
    const cleanedContent = content
      .replace(/\s+/g, ' ')
      .trim()

    return NextResponse.json({ 
      history: cleanedContent,
      success: true
    })

  } catch (error) {
    console.error('History Error:', error)
    
    // Check if the error is a response parsing error
    if (error instanceof SyntaxError && error.message.includes('Unexpected token')) {
      return NextResponse.json({ 
        error: 'Invalid response format',
        details: 'The server returned an invalid response'
      }, { status: 500 })
    }

    return NextResponse.json({ 
      error: 'Failed to fetch history',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

function extractTextFromHtml(html: string): string {
  // Basic HTML text extraction
  return html
    .replace(/<[^>]*>/g, ' ')  // Remove HTML tags
    .replace(/\s+/g, ' ')      // Normalize whitespace
    .trim()
} 