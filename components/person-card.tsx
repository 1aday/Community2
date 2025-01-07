import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Linkedin, Rocket, MapPin, Calendar, ChevronDown, ChevronUp, GraduationCap, Award } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { PersonInfo } from "@/types"

interface PersonCardProps {
  name: string
  company: string
  info: PersonInfo
  profilePic?: string
}

export function PersonCard({ name, company, info, profilePic }: PersonCardProps) {
  const [showAllRoles, setShowAllRoles] = React.useState(false)
  const currentRole = typeof info.currentRole === 'object' ? info.currentRole : null
  
  const latestRole = info.previousRoles?.[0]
  const olderRoles = info.previousRoles?.slice(1) || []

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b bg-muted/50">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={profilePic} alt={name} />
            <AvatarFallback>{name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-2xl">{name}</CardTitle>
              <div className="flex gap-2">
                {info.linkedInUrl && (
                  <a 
                    href={info.linkedInUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary"
                    title="LinkedIn Profile"
                  >
                    <Linkedin className="h-5 w-5" />
                  </a>
                )}
                {info.rocketReachUrl && (
                  <a 
                    href={info.rocketReachUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary"
                    title="RocketReach Profile"
                  >
                    <Rocket className="h-5 w-5" />
                  </a>
                )}
              </div>
            </div>
            <CardDescription className="text-base space-y-1">
              {currentRole ? (
                <>
                  <div className="font-medium">{currentRole.title} at {currentRole.company}</div>
                  {currentRole.location && (
                    <div className="flex items-center gap-1 text-sm">
                      <MapPin className="h-4 w-4" />
                      {currentRole.location}
                    </div>
                  )}
                  {currentRole.duration && (
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="h-4 w-4" />
                      {currentRole.duration}
                    </div>
                  )}
                </>
              ) : (
                <div className="font-medium">{typeof info.currentRole === 'string' ? info.currentRole : `${name} at ${company}`}</div>
              )}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {currentRole?.responsibilities && (
          <div className="space-y-4">
            <h3 className="font-semibold">Current Responsibilities</h3>
            <ul className="list-disc pl-4 space-y-1">
              {currentRole.responsibilities.map((resp, i) => (
                <li key={i}>{resp}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="space-y-4">
          <h3 className="font-semibold">Key Achievements</h3>
          <ul className="list-disc pl-4 space-y-1">
            {info.keyAchievements.map((achievement, i) => (
              <li key={i}>{achievement}</li>
            ))}
          </ul>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold">Professional Background</h3>
          <p className="text-sm text-muted-foreground">
            {info.professionalBackground}
          </p>
        </div>

        {info.previousRoles && info.previousRoles.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold">Career History</h3>
            <div className="space-y-6">
              {latestRole && (
                <div className="space-y-2 border-l-2 border-primary pl-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{latestRole.title}</h4>
                      <p className="text-sm text-muted-foreground">{latestRole.company}</p>
                      {latestRole.location && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {latestRole.location}
                        </div>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground">{latestRole.duration}</span>
                  </div>
                  {latestRole.highlights && latestRole.highlights.length > 0 && (
                    <ul className="list-disc pl-4 space-y-1 text-sm">
                      {latestRole.highlights.map((highlight, j) => (
                        <li key={j}>{highlight}</li>
                      ))}
                    </ul>
                  )}
                  {latestRole.technologies && latestRole.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {latestRole.technologies.map((tech, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {olderRoles.length > 0 && (
                <>
                  <div className={`space-y-6 ${!showAllRoles && 'hidden'}`}>
                    {olderRoles.map((role, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{role.title}</h4>
                            <p className="text-sm text-muted-foreground">{role.company}</p>
                            {role.location && (
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                                {role.location}
                              </div>
                            )}
                          </div>
                          <span className="text-sm text-muted-foreground">{role.duration}</span>
                        </div>
                        {role.highlights && role.highlights.length > 0 && (
                          <ul className="list-disc pl-4 space-y-1 text-sm">
                            {role.highlights.map((highlight, j) => (
                              <li key={j}>{highlight}</li>
                            ))}
                          </ul>
                        )}
                        {role.technologies && role.technologies.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {role.technologies.map((tech, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {tech}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    onClick={() => setShowAllRoles(!showAllRoles)}
                  >
                    {showAllRoles ? (
                      <><ChevronUp className="h-4 w-4 mr-2" /> Show Less</>
                    ) : (
                      <><ChevronDown className="h-4 w-4 mr-2" /> Show {olderRoles.length} More Roles</>
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>
        )}

        {info.education && info.education.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Education
            </h3>
            <div className="grid gap-4">
              {info.education.map((edu, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{edu.degree} in {edu.field}</h4>
                      <p className="text-sm text-muted-foreground">{edu.institution}</p>
                    </div>
                    <span className="text-sm text-muted-foreground">{edu.year}</span>
                  </div>
                  {edu.achievements.length > 0 && (
                    <ul className="list-disc pl-4 space-y-1 text-sm text-muted-foreground">
                      {edu.achievements.map((achievement, j) => (
                        <li key={j}>{achievement}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {info.skills && (
          <div className="space-y-4">
            <h3 className="font-semibold">Skills & Expertise</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {info.skills.technical.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Technical</h4>
                  <div className="flex flex-wrap gap-1">
                    {info.skills.technical.map((skill, i) => (
                      <Badge key={i} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {info.skills.leadership.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Leadership</h4>
                  <div className="flex flex-wrap gap-1">
                    {info.skills.leadership.map((skill, i) => (
                      <Badge key={i} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {info.skills.domain.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Domain Expertise</h4>
                  <div className="flex flex-wrap gap-1">
                    {info.skills.domain.map((skill, i) => (
                      <Badge key={i} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {info.certifications && info.certifications.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Award className="h-5 w-5" />
              Certifications
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {info.certifications.map((cert, i) => (
                <div key={i} className="flex justify-between items-start p-3 rounded-lg border">
                  <div>
                    <h4 className="font-medium">{cert.name}</h4>
                    <p className="text-sm text-muted-foreground">{cert.issuer}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">{cert.year}</div>
                    <Badge variant={cert.status === 'active' ? 'default' : 'secondary'}>
                      {cert.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {info.languages && info.languages.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold">Languages</h3>
            <div className="flex flex-wrap gap-3">
              {info.languages.map((lang, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="font-medium">{lang.language}</span>
                  <Badge variant="outline">{lang.proficiency}</Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <h3 className="font-semibold">Areas of Expertise</h3>
          <div className="flex flex-wrap gap-2">
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