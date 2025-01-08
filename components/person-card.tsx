import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Linkedin, Rocket, MapPin, Calendar, Award } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import Image from 'next/image'

interface Role {
  title: string
  company: string
  duration: string
  highlights: string[]
}

interface PersonInfo {
  currentRole: string
  keyAchievements: string[]
  professionalBackground: string
  careerHistory: Role[]
  expertiseAreas: string[]
}

interface PersonCardProps {
  info: PersonInfo
  profilePic?: string
  name: string
  location?: string
  linkedinUrl?: string
  rocketReachUrl?: string
}

export function PersonCard({ 
  info, 
  profilePic, 
  name, 
  location,
  linkedinUrl,
  rocketReachUrl 
}: PersonCardProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage asChild>
                <Image 
                  src={profilePic || ''} 
                  alt={name}
                  width={80}
                  height={80}
                  className="object-cover"
                />
              </AvatarImage>
              <AvatarFallback>{name[0]}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <CardTitle className="text-2xl">{name}</CardTitle>
              <CardDescription className="text-lg">{info.currentRole}</CardDescription>
              {location && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{location}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            {linkedinUrl && (
              <Button variant="outline" size="icon" asChild>
                <a href={linkedinUrl} target="_blank" rel="noopener noreferrer">
                  <Linkedin className="h-4 w-4" />
                </a>
              </Button>
            )}
            {rocketReachUrl && (
              <Button variant="outline" size="icon" asChild>
                <a href={rocketReachUrl} target="_blank" rel="noopener noreferrer">
                  <Rocket className="h-4 w-4" />
                </a>
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Key Achievements */}
        <div>
          <h3 className="font-semibold flex items-center gap-2">
            <Award className="h-5 w-5" />
            Key Achievements
          </h3>
          <ul className="list-disc pl-4 space-y-1 mt-2">
            {info.keyAchievements.map((achievement, i) => (
              <li key={i}>{achievement}</li>
            ))}
          </ul>
        </div>

        {/* Professional Background */}
        <div>
          <h3 className="font-semibold">Professional Background</h3>
          <p className="text-muted-foreground mt-2">{info.professionalBackground}</p>
        </div>

        {/* Career History */}
        <div>
          <h3 className="font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Career History
          </h3>
          <div className="space-y-4 mt-2">
            {info.careerHistory.map((role, i) => (
              <div key={i} className="border-l-2 border-muted pl-4">
                <h4 className="font-medium">{role.title}</h4>
                <p className="text-muted-foreground">{role.company} • {role.duration}</p>
                {role.highlights && role.highlights.length > 0 && (
                  <ul className="list-disc pl-4 mt-2 space-y-1">
                    {role.highlights.map((highlight, j) => (
                      <li key={j} className="text-muted-foreground">{highlight}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Expertise Areas */}
        <div>
          <h3 className="font-semibold">Areas of Expertise</h3>
          <div className="flex flex-wrap gap-2 mt-2">
            {info.expertiseAreas.map((area, i) => (
              <Badge key={i} variant="secondary">
                {area}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 