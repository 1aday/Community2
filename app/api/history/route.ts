import { NextResponse } from 'next/server'
import FirecrawlApp from '@mendable/firecrawl-js'
import { JSDOM } from 'jsdom'

interface ScrapeResult {
  success: boolean
  error?: string
  statusCode?: number
  markdown?: string
  html?: string
  scrape_id?: string
  formats?: string[]
}

interface CustomError extends Error {
  statusCode?: number
}

const firecrawl = new FirecrawlApp({
  apiKey: process.env.FIRECRAWL_API_KEY || ''
})

export async function POST(req: Request) {
  try {
    const { url } = await req.json()
    
    const scrapeResult = await firecrawl.scrapeUrl(url, {
      formats: ['markdown', 'html'],
      includeTags: ['.history-container']
    }) as ScrapeResult

    if (!scrapeResult.success) {
      console.error('Firecrawl scrape failed:', {
        success: scrapeResult.success,
        error: scrapeResult.error,
        statusCode: scrapeResult.statusCode
      })
      throw new Error(`Failed to scrape profile: ${scrapeResult.error || 'Unknown error'}`)
    }

    console.log('RocketReach Scrape Result:', {
      success: scrapeResult.success,
      markdown: scrapeResult.markdown,
      html: scrapeResult.html?.substring(0, 1000) + '...',
      scrapeId: scrapeResult.scrape_id,
      formats: scrapeResult.formats,
      error: scrapeResult.error,
      ...Object.fromEntries(
        Object.entries(scrapeResult)
          .filter(([key]) => !['markdown', 'html'].includes(key))
      )
    })

    const dom = new JSDOM(scrapeResult.html)
    const doc = dom.window.document

    const metadata = {
      title: doc.querySelector('meta[property="og:title"]')?.getAttribute('content'),
      description: doc.querySelector('meta[property="og:description"]')?.getAttribute('content'),
    }

    const responseData = {
      success: true,
      markdown: scrapeResult.markdown,
      metadata: metadata,
      html: scrapeResult.html
    }

    console.log('Sending to process-info:', {
      type: typeof responseData,
      isArray: Array.isArray(responseData),
      hasMetadata: !!responseData.metadata,
      hasMarkdown: !!responseData.markdown,
      metadata: responseData.metadata,
      firstFewLinesOfMarkdown: responseData.markdown?.split('\n').slice(0, 3)
    })

    return NextResponse.json(responseData)

  } catch (error) {
    const customError = error as CustomError
    const statusCode = customError.statusCode || 500

    console.error('History Error:', {
      message: customError.message || 'Unknown error',
      statusCode: statusCode,
      stack: customError.stack
    })
    
    return NextResponse.json({ 
      error: 'Failed to fetch history',
      details: customError.message || 'Unknown error',
      statusCode: statusCode
    }, { 
      status: statusCode 
    })
  }
} 