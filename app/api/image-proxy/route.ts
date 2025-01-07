import { NextResponse } from 'next/server'
import axios from 'axios'

export async function POST(req: Request) {
  try {
    const { imageUrl } = await req.json()
    
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer'
    })

    const base64Image = Buffer.from(response.data, 'binary').toString('base64')
    return NextResponse.json({
      proxiedUrl: `data:${response.headers['content-type']};base64,${base64Image}`
    })
  } catch (error) {
    console.error('Error proxying image:', error)
    return NextResponse.json(
      { error: 'Failed to proxy image' },
      { status: 500 }
    )
  }
} 