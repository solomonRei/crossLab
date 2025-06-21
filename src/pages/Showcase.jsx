import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/Avatar'
import { 
  Play,
  ExternalLink,
  Github,
  Heart,
  Star,
  Filter,
  Search,
  Users,
  Calendar,
  Zap,
  Trophy,
  ThumbsUp,
  Eye
} from 'lucide-react'
import { demoProjects, users } from '../data/mockData'
import { formatDate, getAvatarFallback } from '../lib/utils'

export function Showcase() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTag, setSelectedTag] = useState('all')
  const [sortBy, setSortBy] = useState('likes')
  const [likedProjects, setLikedProjects] = useState(new Set())

  // Get all unique tags
  const allTags = [...new Set(demoProjects.flatMap(project => project.tags))]

  const filteredProjects = demoProjects
    .filter(project => 
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedTag === 'all' || project.tags.includes(selectedTag))
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'likes':
          return b.likes - a.likes
        case 'recent':
          return new Date(b.completedDate) - new Date(a.completedDate)
        case 'alphabetical':
          return a.title.localeCompare(b.title)
        default:
          return 0
      }
    })

  const toggleLike = (projectId) => {
    setLikedProjects(prev => {
      const newLiked = new Set(prev)
      if (newLiked.has(projectId)) {
        newLiked.delete(projectId)
      } else {
        newLiked.add(projectId)
      }
      return newLiked
    })
  }

  const featuredProject = demoProjects[0]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Project Showcase</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Discover amazing projects built by our collaborative teams. Get inspired and see what's possible when different disciplines work together.
        </p>
      </div>

      {/* Featured Project */}
      <Card className="overflow-hidden bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
        <CardHeader>
          <div className="flex items-center space-x-2 mb-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <Badge variant="secondary" className="bg-yellow-500 text-white">
              Featured Project
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl font-bold mb-3">{featuredProject.title}</h2>
              <p className="text-muted-foreground mb-4">{featuredProject.description}</p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {featuredProject.tags.map(tag => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-2">
                  <Heart className="h-4 w-4 text-red-500" />
                  <span className="font-medium">{featuredProject.likes} likes</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{featuredProject.teamMembers.length} team members</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{formatDate(featuredProject.completedDate)}</span>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button>
                  <Play className="h-4 w-4 mr-2" />
                  Watch Demo
                </Button>
                <Button variant="outline">
                  <Github className="h-4 w-4 mr-2" />
                  View Code
                </Button>
              </div>
            </div>

            <div className="bg-muted rounded-lg p-6">
              <div className="flex items-center mb-3">
                <Zap className="h-5 w-5 text-blue-500 mr-2" />
                <span className="font-medium">AI Insights</span>
              </div>
              <p className="text-muted-foreground mb-4">{featuredProject.aiInsights}</p>
              
              <div className="space-y-3">
                <h4 className="font-medium">Team Members:</h4>
                <div className="flex flex-wrap gap-2">
                  {featuredProject.teamMembers.map((memberName, index) => {
                    const user = users.find(u => u.name === memberName)
                    return (
                      <div key={index} className="flex items-center space-x-2 bg-background p-2 rounded-lg">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={user?.avatar} alt={memberName} />
                          <AvatarFallback className="text-xs">{getAvatarFallback(memberName)}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{memberName}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  className="w-full pl-10 pr-4 py-2 border rounded-md bg-background"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Tag Filter */}
              <select 
                className="px-3 py-2 border rounded-md bg-background"
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
              >
                <option value="all">All Tags</option>
                {allTags.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <select 
              className="px-3 py-2 border rounded-md bg-background"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="likes">Most Liked</option>
              <option value="recent">Most Recent</option>
              <option value="alphabetical">Alphabetical</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <Card className="card-hover h-full">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{project.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{project.description}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => toggleLike(project.id)}
                    className={likedProjects.has(project.id) ? 'text-red-500' : ''}
                  >
                    <Heart className={`h-4 w-4 ${likedProjects.has(project.id) ? 'fill-current' : ''}`} />
                  </Button>
                </div>
              </CardHeader>

              <CardContent>
                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tags.map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Team Members */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-2">Team:</h4>
                  <div className="flex flex-wrap gap-1">
                    {project.teamMembers.map((memberName, index) => {
                      const user = users.find(u => u.name === memberName)
                      return (
                        <Avatar key={index} className="h-6 w-6">
                          <AvatarImage src={user?.avatar} alt={memberName} />
                          <AvatarFallback className="text-xs">{getAvatarFallback(memberName)}</AvatarFallback>
                        </Avatar>
                      )
                    })}
                  </div>
                </div>

                {/* AI Insights */}
                <div className="bg-muted p-3 rounded-lg mb-4">
                  <div className="flex items-center mb-2">
                    <Zap className="h-4 w-4 text-blue-500 mr-2" />
                    <span className="text-sm font-medium">AI Insights</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{project.aiInsights}</p>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between mb-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <ThumbsUp className="h-4 w-4" />
                      <span>{project.likes + (likedProjects.has(project.id) ? 1 : 0)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Eye className="h-4 w-4" />
                      <span>{Math.floor(Math.random() * 500) + 100}</span>
                    </div>
                  </div>
                  <span>{formatDate(project.completedDate)}</span>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  {project.demoVideo && (
                    <Button variant="outline" size="sm" className="flex-1">
                      <Play className="h-3 w-3 mr-2" />
                      Demo
                    </Button>
                  )}
                  {project.githubLink && (
                    <Button variant="outline" size="sm" className="flex-1">
                      <Github className="h-3 w-3 mr-2" />
                      Code
                    </Button>
                  )}
                  {project.figmaLink && (
                    <Button variant="outline" size="sm" className="flex-1">
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

      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-4">
            No projects match your current filters
          </div>
          <Button onClick={() => {
            setSearchTerm('')
            setSelectedTag('all')
          }}>
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  )
} 