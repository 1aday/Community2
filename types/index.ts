export interface PersonInfo {
  currentRole: string | {
    title: string
    company: string
    location?: string
    duration: string
    responsibilities: string[]
  }
  keyAchievements: string[]
  professionalBackground: string
  previousRoles: Array<{
    title: string
    company: string
    location?: string
    duration: string
    highlights: string[]
    technologies?: string[]
  }>
  expertiseAreas: string[]
  education?: Array<{
    degree: string
    institution: string
    field: string
    year: string
    achievements: string[]
  }>
  certifications?: Array<{
    name: string
    issuer: string
    year: string
    status: string
  }>
  languages?: Array<{
    language: string
    proficiency: string
  }>
  skills?: {
    technical: string[]
    leadership: string[]
    domain: string[]
  }
  linkedInUrl?: string
  rocketReachUrl?: string
} 