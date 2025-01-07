import { NextResponse } from 'next/server'
import axios from 'axios'
import * as cheerio from 'cheerio'

export async function POST(req: Request) {
  try {
    const { url } = await req.json()

    if (!url) {
      return NextResponse.json({ 
        error: 'Missing URL parameter' 
      }, { status: 400 })
    }

    console.group('RocketReach Scraping Request')
    console.log('URL:', url)

    // Fetch the page content
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    })

    // Load the HTML into cheerio
    const $ = cheerio.load(response.data)
    
    // Extract content from the history container
    const historyContent = $('.history-container').text()

    // Clean up the text
    const cleanedContent = historyContent
      .replace(/\s+/g, ' ')
      .trim()

    console.log('Scraped Content:', cleanedContent)
    console.groupEnd()

    return NextResponse.json({ 
      history: cleanedContent || 'No history found'
    })
  } catch (error) {
    console.error('Scraping Error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch history',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 