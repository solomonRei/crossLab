import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "../components/ui/Button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Progress } from "../components/ui/Progress";
import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/Avatar";
import { CVUpload } from "../components/CVUpload";
import {
  Edit,
  Award,
  TrendingUp,
  Calendar,
  MapPin,
  Mail,
  Github,
  Linkedin,
  ExternalLink,
  Star,
  Users,
  Zap,
  Briefcase,
  GraduationCap,
  Languages,
  Code,
} from "lucide-react";
import { users, demoProjects } from "../data/mockData";
import { getAvatarFallback, formatDate } from "../lib/utils";
import { useProfileStore } from "../store/userStore";
import { useAuth } from "../contexts/AuthContext";

export function Profile() {
  const { profileData, setProfileData } = useProfileStore();
  const { user } = useAuth();
  
  // Fallback to mock data for demo purposes
  const currentUser = user || users[0];
  const userProjects = demoProjects.filter(project => 
    project.teamMembers.includes(currentUser.name || profileData.name)
  );

  const handleDataParsed = (parsedCvData) => {
    const newProfileData = {
      ...profileData,
      name: parsedCvData.personalInfo?.name || profileData.name,
      role: parsedCvData.experience?.[0]?.title || profileData.role,
      bio: parsedCvData.summary || profileData.bio,
      location: parsedCvData.personalInfo?.location || profileData.location,
      email: parsedCvData.personalInfo?.email || profileData.email,
      linkedin: parsedCvData.personalInfo?.linkedin,
      github: parsedCvData.personalInfo?.github,
      education: parsedCvData.education,
      experience: parsedCvData.experience,
      skills: parsedCvData.skills,
      projects: parsedCvData.projects,
      hasCvData: true,
    };

    setProfileData(newProfileData);
  };

  const xpToNextLevel = profileData.level * 500 - profileData.xp;
  const xpProgress = (profileData.xp % 500) / 500;

  const achievements = [
    {
      name: "First Project",
      description: "Complete your first project",
      earned: true,
      date: "2024-01-10",
    },
    {
      name: "Team Player",
      description: "Receive 5+ collaboration ratings",
      earned: true,
      date: "2024-01-15",
    },
    {
      name: "Code Ninja",
      description: "Submit 50+ commits",
      earned: true,
      date: "2024-01-20",
    },
    {
      name: "Demo Master",
      description: "Present 3 successful demos",
      earned: false,
    },
    { name: "Mentor", description: "Help 5 other students", earned: false },
    {
      name: "Innovation Leader",
      description: "Lead a groundbreaking project",
      earned: false,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Profile Info */}
        <Card className="flex-1">
          <CardContent className="p-6 pt-8">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profileData.avatar} alt={profileData.name} />
                <AvatarFallback className="text-xl">
                  {getAvatarFallback(profileData.name)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-3xl font-bold">{profileData.name}</h1>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </div>
                <p className="text-xl text-muted-foreground mb-3">
                  {profileData.role}
                </p>
                <p className="text-muted-foreground mb-4 max-w-2xl">
                  {profileData.bio}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {profileData.location || "Location not set"}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Joined January 2024
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-1" />
                    {profileData.email}
                  </div>
                </div>

                <div className="flex space-x-4 mt-4">
                  {profileData.github && (
                    <Button variant="outline" size="sm">
                      <a
                        href={profileData.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center"
                      >
                        <Github className="h-4 w-4 mr-2" />
                        GitHub
                      </a>
                    </Button>
                  )}
                  {profileData.linkedin && (
                    <Button variant="outline" size="sm">
                      <a
                        href={profileData.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center"
                      >
                        <Linkedin className="h-4 w-4 mr-2" />
                        LinkedIn
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="space-y-4 lg:w-80">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Level & XP
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-primary">
                  Level {profileData.level}
                </div>
                <div className="text-sm text-muted-foreground">
                  {profileData.xp} XP total
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress to Level {profileData.level + 1}</span>
                  <span>{Math.round(xpProgress * 100)}%</span>
                </div>
                <Progress value={xpProgress * 100} />
                <div className="text-xs text-muted-foreground text-center">
                  {xpToNextLevel} XP to next level
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-4 text-center pt-2">
                <div>
                  <div className="text-2xl font-bold text-primary">
                    {profileData.completedProjects}
                  </div>
                  <div className="text-sm text-muted-foreground">Projects</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">
                    {profileData.badges.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Badges</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CV-based Sections */}
      {profileData.hasCvData ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* Education Card */}
          {profileData.education?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <GraduationCap className="mr-2 h-5 w-5" /> Education
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profileData.education.map((edu, i) => (
                  <div key={i}>
                    <h3 className="font-semibold">{edu.institution}</h3>
                    <p className="text-muted-foreground">{edu.degree}</p>
                    <p className="text-sm text-muted-foreground">{edu.year}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Experience Card */}
          {profileData.experience?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Briefcase className="mr-2 h-5 w-5" /> Experience
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profileData.experience.map((exp, i) => (
                  <div key={i}>
                    <h3 className="font-semibold">
                      {exp.title} at {exp.company}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {exp.duration}
                    </p>
                    <p className="mt-2 text-muted-foreground">
                      {exp.description}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Skills Card */}
          {profileData.skills && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Code className="mr-2 h-5 w-5" /> Skills
                </CardTitle>
              </CardHeader>
              <CardContent>
                {profileData.skills.technical?.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">Technical</h4>
                    <div className="flex flex-wrap gap-2">
                      {profileData.skills.technical.map((skill) => (
                        <Badge key={skill} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {profileData.skills.languages?.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center">
                      <Languages className="mr-2 h-4 w-4" /> Languages
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {profileData.skills.languages.map((lang) => (
                        <Badge key={lang} variant="outline">
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Projects Card */}
          {profileData.projects?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="mr-2 h-5 w-5" /> Projects
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profileData.projects.map((proj, i) => (
                  <div key={i}>
                    <h3 className="font-semibold">{proj.name}</h3>
                    <p className="text-muted-foreground">{proj.description}</p>
                    {proj.technologies?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {proj.technologies.map((tech) => (
                          <Badge key={tech} variant="outline">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </motion.div>
      ) : (
        <div className="space-y-6">
          {/* Badges Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="h-5 w-5 mr-2" />
                Badges & Recognition
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {profileData.badges.map((badge, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Badge variant="secondary" className="px-4 py-2 text-sm">
                      <Award className="h-4 w-4 mr-2" />
                      {badge}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Achievements Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="h-5 w-5 mr-2" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements.map((achievement, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 border rounded-lg ${
                      achievement.earned
                        ? "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800"
                        : "bg-muted opacity-60"
                    }`}
                  >
                    <div className="flex items-center mb-2">
                      {achievement.earned ? (
                        <Star className="h-5 w-5 text-yellow-500 mr-2" />
                      ) : (
                        <Star className="h-5 w-5 text-muted-foreground mr-2" />
                      )}
                      <h3 className="font-medium">{achievement.name}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {achievement.description}
                    </p>
                    {achievement.earned && achievement.date && (
                      <div className="text-xs text-muted-foreground">
                        Earned {formatDate(achievement.date)}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Completed Projects Card (from mock data) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Completed Projects
                </div>
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {demoProjects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="card-hover">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">
                              {project.title}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                              {project.description}
                            </p>
                          </div>
                          <Button variant="ghost" size="icon">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {project.tags.map((tag) => (
                            <Badge
                              key={tag}
                              variant="outline"
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {project.teamMembers.length} members
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm font-medium">
                              {project.likes} likes
                            </span>
                          </div>
                        </div>

                        <div className="bg-muted p-3 rounded-lg">
                          <div className="flex items-center mb-2">
                            <Zap className="h-4 w-4 text-blue-500 mr-2" />
                            <span className="text-sm font-medium">
                              AI Insights
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {project.aiInsights}
                          </p>
                        </div>

                        <div className="flex space-x-2 mt-4">
                          {project.demoVideo && (
                            <Button variant="outline" size="sm">
                              <ExternalLink className="h-3 w-3 mr-2" />
                              Demo
                            </Button>
                          )}
                          {project.githubLink && (
                            <Button variant="outline" size="sm">
                              <Github className="h-3 w-3 mr-2" />
                              Code
                            </Button>
                          )}
                          {project.figmaLink && (
                            <Button variant="outline" size="sm">
                              <ExternalLink className="h-3 w-3 mr-2" />
                              Design
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* CV Uploader at the bottom */}
      <div className="pt-8 mt-8 border-t">
        <CVUpload onDataParsed={handleDataParsed} />
      </div>
    </div>
  );
}
