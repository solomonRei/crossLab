import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Card, CardContent } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { 
  Users, 
  Target, 
  Bot, 
  FileCheck, 
  Video, 
  TrendingUp,
  Globe,
  Award,
  ArrowRight,
  Zap,
  Heart
} from 'lucide-react'

const features = [
  {
    icon: Users,
    title: "Smart Matchmaking",
    description: "AI-powered team formation based on skills, personality, and project needs",
    color: "text-blue-500"
  },
  {
    icon: Bot,
    title: "AI Copilot",
    description: "Role-specific assistants for developers, designers, analysts, and legal experts",
    color: "text-purple-500"
  },
  {
    icon: FileCheck,
    title: "Peer Review System",
    description: "Anonymous feedback and contribution tracking for fair assessment",
    color: "text-green-500"
  },
  {
    icon: Video,
    title: "Live Demo Showcase",
    description: "Present your projects with video demos and public portfolios",
    color: "text-orange-500"
  }
]

const stats = [
  { label: "Active Teams", value: "127", trend: "+12%" },
  { label: "Live Projects", value: "34", trend: "+5%" },
  { label: "Completed Demos", value: "89", trend: "+23%" },
  { label: "Success Rate", value: "94%", trend: "+2%" }
]

export function Home() {
  return (
    <div className="gradient-bg">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 lg:py-32">
        <div className="text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="secondary" className="mb-6">
              🚀 Now in Beta - Join 500+ students
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Cross-Disciplinary Learning
              <br />
              <span className="text-foreground">Made Simple</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Connect with students from different fields. Solve real business challenges. 
              Build amazing projects together. Get hired by top companies.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="group">
                <Link to="/projects">
                  Join a Team
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/showcase">
                  Browse Showcase
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Live Stats */}
      <section className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {stats.map((stat, index) => (
            <Card key={index} className="text-center p-6 card-hover">
              <CardContent className="p-0">
                <div className="text-3xl font-bold text-foreground mb-2">{stat.value}</div>
                <div className="text-sm text-muted-foreground mb-1">{stat.label}</div>
                <div className="flex items-center justify-center text-xs text-green-600">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {stat.trend}
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Everything you need to succeed
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            From team formation to project delivery, we've got your entire learning journey covered.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="p-8 card-hover h-full">
                <CardContent className="p-0">
                  <div className={`w-12 h-12 rounded-lg bg-muted flex items-center justify-center mb-4`}>
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            How CrossLab Works
          </h2>
          <p className="text-xl text-muted-foreground">
            Four simple steps to your next breakthrough project
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { step: "1", title: "Take Assessment", desc: "Answer questions about your skills and work style", icon: Target },
            { step: "2", title: "Get Matched", desc: "Our AI finds your perfect cross-functional team", icon: Users },
            { step: "3", title: "Build Together", desc: "Work on real challenges with AI copilot support", icon: Zap },
            { step: "4", title: "Showcase & Grow", desc: "Present your demo and add to your portfolio", icon: Award }
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold mb-4 mx-auto">
                {item.step}
              </div>
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              <p className="text-muted-foreground text-sm">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <Card className="p-12 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-0">
            <CardContent className="p-0">
              <h2 className="text-3xl font-bold mb-4">
                Ready to build something amazing?
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join thousands of students already collaborating on breakthrough projects.
                Your next career opportunity is one project away.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild>
                  <Link to="/signup">
                    Start Your Journey
                    <Heart className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/projects">
                    Explore Projects
                    <Globe className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </section>
    </div>
  )
} 