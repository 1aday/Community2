export interface Role {
  title: string
  company: string
  duration: string
  highlights: string[]
}

export interface PersonInfo {
  currentRole: string
  keyAchievements: string[]
  professionalBackground: string
  careerHistory: Role[]
  expertiseAreas: string[]
  linkedInUrl?: string
  rocketReachUrl?: string
} 