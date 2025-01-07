import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

interface OpenAIResponse {
  currentRole: {
    title: string
    company: string
    location: string
    duration: string
    responsibilities: string[]
  }
  keyAchievements: string[]
  professionalBackground: string
  careerHistory: Array<{
    title: string
    company: string
    location?: string
    duration: string
    highlights: string[]
    technologies: string[]
    industry: string
    isCurrent: boolean
  }>
  skills: {
    technical: string[]
    leadership: string[]
    domain: string[]
  }
  education: Array<{
    degree: string
    institution: string
    field: string
    year: string
    achievements: string[]
  }>
  certifications: Array<{
    name: string
    issuer: string
    year: string
    status: string
  }>
  languages: Array<{
    language: string
    proficiency: string
  }>
  expertiseAreas: string[]
}

function formatResponse(data: OpenAIResponse) {
  return {
    currentRole: data.currentRole,
    keyAchievements: data.keyAchievements,
    professionalBackground: data.professionalBackground,
    previousRoles: data.careerHistory?.map((role) => ({
      title: role.title,
      company: role.company,
      duration: role.duration,
      highlights: Array.isArray(role.highlights) ? role.highlights : [],
      technologies: Array.isArray(role.technologies) ? role.technologies : [],
      industry: role.industry,
      isCurrent: !!role.isCurrent
    })) || [],
    expertiseAreas: data.expertiseAreas,
    education: data.education,
    certifications: data.certifications,
    languages: data.languages,
    skills: data.skills
  }
}

export async function POST(req: Request) {
  try {
    const { perplexityData, rocketReachData } = await req.json()

    if (!perplexityData) {
      return NextResponse.json({ 
        error: 'Missing Perplexity data' 
      }, { status: 400 })
    }

    const prompt = `Based on the following information, create a detailed professional profile. 

Perplexity Data:
${JSON.stringify(perplexityData, null, 2)}

${rocketReachData ? `Additional History from RocketReach:
${rocketReachData}` : ''}

Return a JSON response with this exact structure. Note that careerHistory should include ALL roles (including current role) in chronological order from most recent to oldest:
{
  "currentRole": {
    "title": "current job title",
    "company": "current company name",
    "location": "city, country/region",
    "duration": "start date - present",
    "responsibilities": [
      "detailed current responsibilities and achievements"
    ]
  },
  "keyAchievements": [
    "3-5 most significant career accomplishments with measurable impacts"
  ],
  "professionalBackground": "comprehensive career narrative focusing on progression and key transitions",
  "careerHistory": [
    {
      "title": "current job title (same as currentRole)",
      "company": "current company",
      "duration": "start date - present",
      "highlights": [
        "key responsibilities and notable achievements"
      ],
      "technologies": ["relevant technologies used"],
      "industry": "industry sector",
      "isCurrent": true
    },
    {
      "title": "previous job title",
      "company": "previous company",
      "duration": "start date - end date",
      "highlights": [
        "key responsibilities and notable achievements"
      ],
      "technologies": ["relevant technologies used"],
      "industry": "industry sector",
      "isCurrent": false
    }
  ],
  "skills": {
    "technical": ["3-5 core technical skills"],
    "leadership": ["2-3 leadership competencies"],
    "domain": ["2-3 industry/domain expertise areas"]
  },
  "education": [
    {
      "degree": "degree name",
      "institution": "school/university name",
      "field": "field of study",
      "year": "graduation year",
      "achievements": ["notable academic achievements"]
    }
  ],
  "certifications": [
    {
      "name": "certification name",
      "issuer": "issuing organization",
      "year": "year obtained",
      "status": "active/expired"
    }
  ],
  "languages": [
    {
      "language": "language name",
      "proficiency": "native/fluent/professional/basic"
    }
  ],
  "expertiseAreas": [
    "3-5 primary areas of professional expertise"
  ]
}`

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are a professional profile analyst. Create structured, accurate profiles based on provided information. Focus on facts and professional achievements."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      response_format: { type: "json_object" }
    })

    const response = completion.choices[0].message.content
    if (!response) {
      throw new Error('No response from OpenAI')
    }

    const parsedResponse = JSON.parse(response)
    const formattedInfo = formatResponse(parsedResponse)

    return NextResponse.json({ 
      info: formattedInfo
    })
  } catch (error) {
    console.error('OpenAI Processing Error:', error)
    return NextResponse.json({ 
      error: 'Failed to process information',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 