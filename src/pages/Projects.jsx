import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Progress } from '../components/ui/Progress'
import { 
  Search, 
  Filter, 
  Calendar, 
  Users, 
  Clock,
  MapPin,
  Star,
  TrendingUp,
  Code,
  Palette,
  Scale,
  Megaphone
} from 'lucide-react'
import { projects, roleTypes } from '../data/mockData'
import { formatDate, formatProgress } from '../lib/utils'

const difficultyColors = {
  Easy: 'bg-green-500',
  Medium: 'bg-yellow-500', 
  Hard: 'bg-red-500'
}

const statusColors = {
  recruiting: 'bg-blue-500',
  'in-progress': 'bg-orange-500',
  completed: 'bg-green-500'
}

export function Projects() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')

  const filteredProjects = projects.filter(project => {
    return (
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase())
    ) &&
    (selectedRole === 'all' || project.rolesNeeded.includes(selectedRole)) &&
    (selectedDifficulty === 'all' || project.difficulty === selectedDifficulty) &&
    (selectedStatus === 'all' || project.status === selectedStatus)
  })

  const getRoleIcon = (roleId) => {
    const role = roleTypes.find(r => r.id === roleId)
    const iconMap = {
      Code: Code,
      Palette: Palette,
      TrendingUp: TrendingUp,
      Scale: Scale,
      Megaphone: Megaphone
    }
    return iconMap[role?.icon] || Users
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Project Catalog</h1>
          <p className="text-muted-foreground">
            Find your next collaborative challenge and build something amazing
          </p>
        </div>
        <Button asChild>
          <Link to="/projects/create">Post a Challenge</Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              type="text"
              placeholder="Search projects..."
              className="w-full pl-10 pr-4 py-2 border rounded-md bg-background"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Role Needed</label>
              <select 
                className="w-full p-2 border rounded-md bg-background"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                <option value="all">All Roles</option>
                {roleTypes.map(role => (
                  <option key={role.id} value={role.id}>{role.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Difficulty</label>
              <select 
                className="w-full p-2 border rounded-md bg-background"
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
              >
                <option value="all">All Levels</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select 
                className="w-full p-2 border rounded-md bg-background"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="recruiting">Recruiting</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          {filteredProjects.length} Projects Found
        </h2>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Star className="h-4 w-4" />
          <span>Sorted by relevance</span>
        </div>
      </div>

      {/* Project Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                    <CardTitle className="text-xl mb-2">{project.title}</CardTitle>
                    <p className="text-muted-foreground text-sm mb-3">{project.description}</p>
                    <div className="flex items-center text-sm text-muted-foreground mb-3">
                      <MapPin className="h-4 w-4 mr-1" />
                      {project.company}
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <Badge 
                      variant="secondary"
                      className={`${statusColors[project.status]} text-white`}
                    >
                      {project.status.replace('-', ' ')}
                    </Badge>
                    <Badge 
                      variant="outline"
                      className={`${difficultyColors[project.difficulty]} text-white border-0`}
                    >
                      {project.difficulty}
                    </Badge>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {project.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Roles Needed */}
                <div className="flex items-center space-x-2 mb-3">
                  <span className="text-sm font-medium">Roles needed:</span>
                  <div className="flex space-x-1">
                    {project.rolesNeeded.map(roleId => {
                      const role = roleTypes.find(r => r.id === roleId)
                      const IconComponent = getRoleIcon(roleId)
                      return (
                        <div key={roleId} className={`w-8 h-8 rounded-full ${role?.color} flex items-center justify-center`}>
                          <IconComponent className="h-4 w-4 text-white" />
                        </div>
                      )
                    })}
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                {/* Progress for in-progress projects */}
                {project.status === 'in-progress' && (
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>{formatProgress(project.progress)}%</span>
                    </div>
                    <Progress value={formatProgress(project.progress)} />
                  </div>
                )}

                {/* Project Stats */}
                <div className="grid grid-cols-3 gap-4 text-center mb-6">
                  <div>
                    <div className="flex items-center justify-center text-muted-foreground mb-1">
                      <Users className="h-4 w-4 mr-1" />
                    </div>
                    <div className="text-sm font-medium">
                      {project.participants}/{project.maxParticipants}
                    </div>
                    <div className="text-xs text-muted-foreground">Team Size</div>
                  </div>
                  <div>
                    <div className="flex items-center justify-center text-muted-foreground mb-1">
                      <Clock className="h-4 w-4 mr-1" />
                    </div>
                    <div className="text-sm font-medium">{project.duration}</div>
                    <div className="text-xs text-muted-foreground">Duration</div>
                  </div>
                  <div>
                    <div className="flex items-center justify-center text-muted-foreground mb-1">
                      <Calendar className="h-4 w-4 mr-1" />
                    </div>
                    <div className="text-sm font-medium">{formatDate(project.deadline)}</div>
                    <div className="text-xs text-muted-foreground">Deadline</div>
                  </div>
                </div>

                {/* Action Button */}
                <Button 
                  className="w-full" 
                  variant={project.status === 'recruiting' ? 'default' : 'outline'}
                  asChild
                >
                  <Link to={`/projects/${project.id}`}>
                    {project.status === 'recruiting' ? 'Join Team' : 'View Details'}
                  </Link>
                </Button>
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
            setSelectedRole('all')
            setSelectedDifficulty('all')
            setSelectedStatus('all')
          }}>
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  )
} 