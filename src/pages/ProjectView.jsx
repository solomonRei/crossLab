import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Progress } from '../components/ui/Progress'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs'
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/Avatar'
import { Copilot } from '../components/Copilot'
import { 
  Users, 
  Calendar, 
  Clock,
  CheckCircle,
  Circle,
  MessageSquare,
  FileText,
  Video,
  Star,
  Award,
  TrendingUp,
  AlertCircle,
  ArrowRight
} from 'lucide-react'
import { projects, users, teams } from '../data/mockData'
import { formatDate, formatProgress, getAvatarFallback } from '../lib/utils'

export function ProjectView() {
  const { id } = useParams()
  const [activeTab, setActiveTab] = useState('tasks')
  const [copilotOpen, setCopilotOpen] = useState(false)
  
  const project = projects.find(p => p.id === parseInt(id)) || projects[0]
  const team = teams.find(t => t.projectId === project.id) || teams[0]
  const teamMembers = team.members.map(member => ({
    ...users.find(u => u.id === member.userId),
    ...member
  }))

  const currentSprint = project.sprints.find(s => s.current) || project.sprints[0]
  const completedSprints = project.sprints.filter(s => s.completed).length

  const tasks = [
    { id: 1, title: "Set up development environment", completed: true, assignee: "Alex Chen" },
    { id: 2, title: "Design user interface mockups", completed: true, assignee: "Maya Rodriguez" },
    { id: 3, title: "Implement API endpoints", completed: false, assignee: "Alex Chen" },
    { id: 4, title: "Create user testing plan", completed: false, assignee: "David Kim" },
    { id: 5, title: "Database schema design", completed: false, assignee: "Alex Chen" }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h1 className="text-3xl font-bold">{project.title}</h1>
            <Badge variant="secondary" className="bg-blue-500 text-white">
              {project.status.replace('-', ' ')}
            </Badge>
          </div>
          <p className="text-muted-foreground mb-4">{project.description}</p>
          <div className="flex items-center space-x-6 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              Due {formatDate(project.deadline)}
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {project.duration}
            </div>
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              {project.participants} members
            </div>
          </div>
        </div>

        <div className="flex space-x-4">
          <Button variant="outline">
            <MessageSquare className="h-4 w-4 mr-2" />
            Team Chat
          </Button>
          <Button>
            <Video className="h-4 w-4 mr-2" />
            Join Demo
          </Button>
        </div>
      </div>

      {/* Sprint Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Sprint Progress
            <Badge variant="outline">{completedSprints}/{project.sprints.length} Completed</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Overall Progress</span>
              <span>{formatProgress(project.progress)}%</span>
            </div>
            <Progress value={formatProgress(project.progress)} className="mb-6" />
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {project.sprints.map((sprint, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-lg border ${
                    sprint.completed 
                      ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800' 
                      : sprint.current 
                        ? 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800'
                        : 'bg-muted'
                  }`}
                >
                  <div className="flex items-center mb-2">
                    {sprint.completed ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    ) : sprint.current ? (
                      <AlertCircle className="h-5 w-5 text-blue-500 mr-2" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground mr-2" />
                    )}
                    <span className="font-medium text-sm">{sprint.name}</span>
                  </div>
                  {sprint.current && (
                    <Badge variant="secondary" className="text-xs">Current Sprint</Badge>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Members */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center space-x-3 p-4 border rounded-lg"
              >
                <Avatar>
                  <AvatarImage src={member.avatar} alt={member.name} />
                  <AvatarFallback>{getAvatarFallback(member.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">{member.name}</p>
                  <p className="text-sm text-muted-foreground">{member.role}</p>
                  <div className="mt-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Progress</span>
                      <span>{formatProgress(member.progress)}%</span>
                    </div>
                    <Progress value={formatProgress(member.progress)} className="h-2" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tabbed Content */}
      <Card>
        <CardHeader>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="tasks" active={activeTab === 'tasks'}>Tasks</TabsTrigger>
              <TabsTrigger value="docs" active={activeTab === 'docs'}>Docs</TabsTrigger>
              <TabsTrigger value="demo" active={activeTab === 'demo'}>Demo</TabsTrigger>
              <TabsTrigger value="review" active={activeTab === 'review'}>Review</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab}>
            <TabsContent value="tasks">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Current Sprint Tasks</h3>
                  <Button size="sm">Add Task</Button>
                </div>
                <div className="space-y-2">
                  {tasks.map((task) => (
                    <div key={task.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                      {task.completed ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground" />
                      )}
                      <span className={`flex-1 ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                        {task.title}
                      </span>
                      <Badge variant="outline" className="text-xs">{task.assignee}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="docs">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Project Documentation</h3>
                  <Button size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    New Doc
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { name: "Project Requirements", type: "Google Doc", updated: "2 hours ago" },
                    { name: "API Documentation", type: "Notion", updated: "1 day ago" },
                    { name: "User Research", type: "Figma", updated: "3 days ago" },
                    { name: "Technical Specs", type: "GitHub", updated: "1 week ago" }
                  ].map((doc, index) => (
                    <div key={index} className="p-4 border rounded-lg hover:bg-accent cursor-pointer">
                      <div className="flex items-center justify-between mb-2">
                        <FileText className="h-5 w-5 text-blue-500" />
                        <Badge variant="outline" className="text-xs">{doc.type}</Badge>
                      </div>
                      <h4 className="font-medium mb-1">{doc.name}</h4>
                      <p className="text-sm text-muted-foreground">Updated {doc.updated}</p>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="demo">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Demo Preparation</h3>
                  <Button size="sm">
                    <Video className="h-4 w-4 mr-2" />
                    Record Demo
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Demo Checklist</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {[
                        { task: "Prepare demo script", completed: true },
                        { task: "Set up demo environment", completed: true },
                        { task: "Create presentation slides", completed: false },
                        { task: "Test demo flow", completed: false },
                        { task: "Prepare Q&A responses", completed: false }
                      ].map((item, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          {item.completed ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <Circle className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className={item.completed ? 'line-through text-muted-foreground' : ''}>
                            {item.task}
                          </span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Demo Schedule</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <span>Internal Review</span>
                          <Badge variant="outline">Tomorrow 2 PM</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <span>Client Presentation</span>
                          <Badge variant="outline">Friday 10 AM</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="review">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Peer Reviews</h3>
                  <Button size="sm">
                    <Star className="h-4 w-4 mr-2" />
                    Start Review
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {teamMembers.map((member, index) => (
                    <Card key={member.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3 mb-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={member.avatar} alt={member.name} />
                            <AvatarFallback>{getAvatarFallback(member.name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{member.name}</p>
                            <p className="text-sm text-muted-foreground">{member.role}</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Technical Skills</span>
                            <div className="flex">
                              {[1,2,3,4,5].map(i => (
                                <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              ))}
                            </div>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Collaboration</span>
                            <div className="flex">
                              {[1,2,3,4].map(i => (
                                <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              ))}
                              <Star className="h-3 w-3 text-muted-foreground" />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* AI Copilot */}
      <Copilot isOpen={copilotOpen} onToggle={() => setCopilotOpen(!copilotOpen)} />
    </div>
  )
} 