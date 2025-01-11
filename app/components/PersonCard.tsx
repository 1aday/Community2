import Image from 'next/image'
import { Card } from '@/components/ui/card'

interface PersonInfo {
  currentRole: string
  keyAchievements: string[]
  professionalBackground: string
  careerHistory: Array<{
    title: string
    company: string
    duration: string
    highlights: string[]
  }>
  expertiseAreas: string[]
}

interface PersonCardProps {
  name: string
  info: PersonInfo
  profilePic?: string | null
}

const imageStyle = {
  width: '100px',
  height: '100px',
  objectFit: 'cover' as const,
  borderRadius: '50%',
  marginBottom: '1rem'
}

export function PersonCard({ name, info, profilePic }: PersonCardProps) {
  return (
    <Card className="p-6">
      <div className="flex flex-col items-center">
        {profilePic && (
          <Image 
            src={profilePic} 
            alt={`${name}'s profile picture`}
            width={100}
            height={100}
            style={imageStyle}
            unoptimized
          />
        )}
        <h2 className="text-2xl font-bold mb-4">{name}</h2>
        <h3 className="text-xl mb-2">{info.currentRole}</h3>
        <p className="text-gray-600 mb-4">{info.professionalBackground}</p>
        
        <div className="w-full">
          <h4 className="font-bold mb-2">Key Achievements</h4>
          <ul className="list-disc pl-5 mb-4">
            {info.keyAchievements.map((achievement, i) => (
              <li key={i}>{achievement}</li>
            ))}
          </ul>

          <h4 className="font-bold mb-2">Career History</h4>
          {info.careerHistory.map((role, i) => (
            <div key={i} className="mb-3">
              <h5 className="font-semibold">{role.title} at {role.company}</h5>
              <p className="text-sm text-gray-500">{role.duration}</p>
              <ul className="list-disc pl-5">
                {role.highlights.map((highlight, j) => (
                  <li key={j} className="text-sm">{highlight}</li>
                ))}
              </ul>
            </div>
          ))}

          <h4 className="font-bold mb-2">Areas of Expertise</h4>
          <div className="flex flex-wrap gap-2">
            {info.expertiseAreas.map((area, i) => (
              <span key={i} className="bg-gray-100 px-2 py-1 rounded text-sm">
                {area}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
} 