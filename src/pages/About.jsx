import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { 
  Users, 
  Target, 
  Bot, 
  FileCheck, 
  Zap,
  Heart,
  Globe,
  Award,
  TrendingUp,
  Code,
  Palette,
  BarChart3,
  Scale
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
    icon: Award,
    title: "Live Demo Showcase",
    description: "Present your projects with video demos and public portfolios",
    color: "text-orange-500"
  }
]

const disciplines = [
  {
    title: "Development",
    icon: Code,
    description: "Frontend, Backend, Mobile, DevOps",
    students: "250+ students"
  },
  {
    title: "Design",
    icon: Palette,
    description: "UI/UX, Graphic, Product Design",
    students: "180+ students"
  },
  {
    title: "Analytics",
    icon: BarChart3,
    description: "Data Science, Business Intelligence",
    students: "140+ students"
  },
  {
    title: "Business",
    icon: Scale,
    description: "Strategy, Law, Marketing",
    students: "200+ students"
  }
]

const stats = [
  { label: "Active Students", value: "770+", icon: Users },
  { label: "Completed Projects", value: "120+", icon: Award },
  { label: "Success Rate", value: "94%", icon: TrendingUp },
  { label: "Partner Companies", value: "50+", icon: Globe }
]

export function About() {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            About CrossLab
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            We're revolutionizing education by bringing together students from different disciplines 
            to collaborate on real-world projects. Our platform combines AI-powered team matching, 
            professional mentorship, and industry partnerships to create an unparalleled learning experience.
          </p>
        </motion.div>
      </section>

      {/* Mission Section */}
      <section>
        <Card className="p-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
          <CardContent className="p-0">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
              <p className="text-xl text-muted-foreground max-w-4xl mx-auto">
                To bridge the gap between academic learning and professional practice by creating 
                cross-disciplinary teams that solve real business challenges while developing 
                essential collaboration skills for the modern workplace.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Stats Section */}
      <section>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">CrossLab by the Numbers</h2>
          <p className="text-xl text-muted-foreground">
            See the impact we're making in education and career development
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="text-center p-6 card-hover">
                <CardContent className="p-0">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
                    <stat.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">How CrossLab Works</h2>
          <p className="text-xl text-muted-foreground">
            A simple yet powerful process that transforms learning
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { step: "1", title: "Skills Assessment", desc: "Take our comprehensive assessment to identify your strengths and learning goals" },
            { step: "2", title: "AI Matching", desc: "Our algorithm creates balanced teams with complementary skills and personalities" },
            { step: "3", title: "Project Collaboration", desc: "Work on real challenges with AI copilot support and mentor guidance" },
            { step: "4", title: "Portfolio Building", desc: "Showcase your completed projects to potential employers and peers" }
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

      {/* Features Section */}
      <section>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Platform Features</h2>
          <p className="text-xl text-muted-foreground">
            Everything you need for successful cross-disciplinary collaboration
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

      {/* Disciplines Section */}
      <section>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Our Community</h2>
          <p className="text-xl text-muted-foreground">
            Students from diverse backgrounds working together
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {disciplines.map((discipline, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="p-6 card-hover text-center">
                <CardContent className="p-0">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                    <discipline.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{discipline.title}</h3>
                  <p className="text-muted-foreground text-sm mb-3">{discipline.description}</p>
                  <Badge variant="secondary">{discipline.students}</Badge>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Vision Section */}
      <section className="text-center">
        <Card className="p-12 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white">
          <CardContent className="p-0">
            <h2 className="text-3xl font-bold mb-6">Our Vision</h2>
            <p className="text-xl text-blue-100 max-w-4xl mx-auto leading-relaxed mb-8">
              We envision a world where education transcends traditional boundaries, 
              where students learn not just subjects but how to collaborate, innovate, 
              and solve complex problems together. CrossLab is building the foundation 
              for the next generation of professionals who understand that the greatest 
              breakthroughs happen when different minds work as one.
            </p>
            <div className="flex items-center justify-center gap-2">
              <Heart className="h-5 w-5 text-red-400" />
              <span className="text-blue-100">Built with passion for education and innovation</span>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
} 