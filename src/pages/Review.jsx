import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/Avatar'
import { 
  Star,
  Users,
  TrendingUp,
  CheckCircle,
  Clock,
  Award,
  MessageSquare,
  Eye,
  EyeOff,
  Send,
  Filter
} from 'lucide-react'
import { users, teams, projects } from '../data/mockData'
import { getAvatarFallback, formatDate } from '../lib/utils'

const reviewCategories = [
  { id: 'technical', name: 'Technical Skills', description: 'Quality of technical contributions' },
  { id: 'collaboration', name: 'Collaboration', description: 'Teamwork and communication' },
  { id: 'initiative', name: 'Initiative', description: 'Proactivity and leadership' },
  { id: 'reliability', name: 'Reliability', description: 'Meeting deadlines and commitments' },
  { id: 'creativity', name: 'Creativity', description: 'Innovation and problem-solving' }
]

export function Review() {
  const [activeTab, setActiveTab] = useState('pending')
  const [selectedProject, setSelectedProject] = useState('all')
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [selectedMember, setSelectedMember] = useState(null)
  const [isAnonymous, setIsAnonymous] = useState(true)
  const [ratings, setRatings] = useState({})
  const [comment, setComment] = useState('')

  const currentUser = users[0]
  
  // Mock review data
  const pendingReviews = [
    {
      id: 1,
      projectId: 2,
      projectTitle: "Greenhouse Dashboard",
      teamMember: users[1], // Maya Rodriguez
      deadline: "2024-01-25",
      status: 'pending'
    },
    {
      id: 2,
      projectId: 2,
      projectTitle: "Greenhouse Dashboard", 
      teamMember: users[2], // David Kim
      deadline: "2024-01-25",
      status: 'pending'
    }
  ]

  const completedReviews = [
    {
      id: 3,
      projectId: 1,
      projectTitle: "AI Coffee Assistant",
      teamMember: users[3], // Sophie Laurent
      completedDate: "2024-01-15",
      rating: 4.5,
      anonymous: true
    }
  ]

  const receivedReviews = [
    {
      id: 4,
      projectId: 2,
      projectTitle: "Greenhouse Dashboard",
      reviewer: "Anonymous",
      ratings: { technical: 5, collaboration: 4, initiative: 5, reliability: 4, creativity: 5 },
      comment: "Excellent technical skills and great team player. Always willing to help others.",
      date: "2024-01-20"
    },
    {
      id: 5,
      projectId: 1,
      projectTitle: "AI Coffee Assistant",
      reviewer: "Maya Rodriguez",
      ratings: { technical: 4, collaboration: 5, initiative: 4, reliability: 5, creativity: 4 },
      comment: "Strong developer with good communication skills. Delivered quality code on time.",
      date: "2024-01-18"
    }
  ]

  const handleRatingChange = (category, value) => {
    setRatings(prev => ({
      ...prev,
      [category]: value
    }))
  }

  const submitReview = () => {
    // Handle review submission
    console.log({
      member: selectedMember,
      ratings,
      comment,
      anonymous: isAnonymous
    })
    setShowReviewForm(false)
    setSelectedMember(null)
    setRatings({})
    setComment('')
  }

  const StarRating = ({ value, onChange, readonly = false }) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => !readonly && onChange?.(star)}
            className={`${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform`}
          >
            <Star
              className={`h-5 w-5 ${
                star <= value 
                  ? 'text-yellow-500 fill-yellow-500' 
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Peer Reviews</h1>
          <p className="text-muted-foreground">
            Review your teammates and track your own feedback to improve collaboration
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select 
            className="px-3 py-2 border rounded-md bg-background"
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
          >
            <option value="all">All Projects</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>{project.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <Clock className="h-8 w-8 text-orange-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{pendingReviews.length}</div>
            <div className="text-sm text-muted-foreground">Pending Reviews</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{completedReviews.length}</div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <TrendingUp className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">4.5</div>
            <div className="text-sm text-muted-foreground">Avg Rating</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Award className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">150</div>
            <div className="text-sm text-muted-foreground">Peer XP Earned</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
        {[
          { id: 'pending', label: 'Pending Reviews', count: pendingReviews.length },
          { id: 'completed', label: 'Completed', count: completedReviews.length },
          { id: 'received', label: 'Received Reviews', count: receivedReviews.length }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {tab.count}
              </Badge>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Reviews Due</h2>
          {pendingReviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage src={review.teamMember.avatar} alt={review.teamMember.name} />
                        <AvatarFallback>{getAvatarFallback(review.teamMember.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{review.teamMember.name}</h3>
                        <p className="text-sm text-muted-foreground">{review.projectTitle}</p>
                        <p className="text-xs text-muted-foreground">Due {formatDate(review.deadline)}</p>
                      </div>
                    </div>
                    <Button 
                      onClick={() => {
                        setSelectedMember(review.teamMember)
                        setShowReviewForm(true)
                      }}
                    >
                      <Star className="h-4 w-4 mr-2" />
                      Start Review
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {activeTab === 'completed' && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Completed Reviews</h2>
          {completedReviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage src={review.teamMember.avatar} alt={review.teamMember.name} />
                        <AvatarFallback>{getAvatarFallback(review.teamMember.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{review.teamMember.name}</h3>
                        <p className="text-sm text-muted-foreground">{review.projectTitle}</p>
                        <p className="text-xs text-muted-foreground">Completed {formatDate(review.completedDate)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-medium">{review.rating}</span>
                      </div>
                      {review.anonymous && (
                        <Badge variant="outline" className="text-xs">
                          <EyeOff className="h-3 w-3 mr-1" />
                          Anonymous
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {activeTab === 'received' && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Reviews You've Received</h2>
          {receivedReviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold">{review.projectTitle}</h3>
                      <p className="text-sm text-muted-foreground">
                        Reviewed by {review.reviewer} • {formatDate(review.date)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                    {reviewCategories.map((category) => (
                      <div key={category.id} className="text-center">
                        <div className="text-sm font-medium mb-1">{category.name}</div>
                        <StarRating value={review.ratings[category.id]} readonly />
                        <div className="text-xs text-muted-foreground mt-1">
                          {review.ratings[category.id]}/5
                        </div>
                      </div>
                    ))}
                  </div>

                  {review.comment && (
                    <div className="bg-muted p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        <span className="text-sm font-medium">Feedback</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{review.comment}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Review Form Modal */}
      {showReviewForm && selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-background rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Review {selectedMember.name}</h2>
                <Button variant="ghost" onClick={() => setShowReviewForm(false)}>
                  ×
                </Button>
              </div>

              <div className="flex items-center space-x-4 mb-6">
                <Avatar>
                  <AvatarImage src={selectedMember.avatar} alt={selectedMember.name} />
                  <AvatarFallback>{getAvatarFallback(selectedMember.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{selectedMember.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedMember.role}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Rate Performance</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAnonymous(!isAnonymous)}
                  >
                    {isAnonymous ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                    {isAnonymous ? 'Anonymous' : 'Public'}
                  </Button>
                </div>

                {reviewCategories.map((category) => (
                  <div key={category.id} className="space-y-2">
                    <div>
                      <h4 className="font-medium">{category.name}</h4>
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                    </div>
                    <StarRating 
                      value={ratings[category.id] || 0}
                      onChange={(value) => handleRatingChange(category.id, value)}
                    />
                  </div>
                ))}

                <div className="space-y-2">
                  <label className="font-medium">Additional Comments (Optional)</label>
                  <textarea
                    className="w-full p-3 border rounded-md bg-background min-h-[100px]"
                    placeholder="Share specific feedback about their contributions..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                </div>

                <div className="flex space-x-4">
                  <Button onClick={submitReview} className="flex-1">
                    <Send className="h-4 w-4 mr-2" />
                    Submit Review
                  </Button>
                  <Button variant="outline" onClick={() => setShowReviewForm(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
} 