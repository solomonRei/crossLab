import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
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
  Heart,
  BookOpen,
  Code,
  Palette,
  BarChart3,
  Scale,
  Play,
  Star,
  CheckCircle,
} from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Smart Team Matching",
    description:
      "Connect with talented students from different disciplines to create powerful cross-functional teams",
    color: "from-blue-400 to-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    icon: Bot,
    title: "AI Project Assistant",
    description:
      "Get personalized guidance and support tailored to your role, whether you're developing, designing, or analyzing",
    color: "from-purple-400 to-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    icon: FileCheck,
    title: "Professional Reviews",
    description:
      "Receive constructive feedback from peers and mentors to continuously improve your skills and projects",
    color: "from-green-400 to-green-600",
    bgColor: "bg-green-50",
  },
  {
    icon: Video,
    title: "Showcase Platform",
    description:
      "Present your completed projects to potential employers and build an impressive portfolio",
    color: "from-orange-400 to-orange-600",
    bgColor: "bg-orange-50",
  },
];

const disciplines = [
  {
    title: "Development",
    icon: Code,
    color: "from-blue-500 to-indigo-600",
    bgColor: "bg-gradient-to-br from-blue-50 to-indigo-50",
    description: "Frontend, Backend, Mobile",
    students: "250+ students",
  },
  {
    title: "Design",
    icon: Palette,
    color: "from-pink-500 to-rose-600",
    bgColor: "bg-gradient-to-br from-pink-50 to-rose-50",
    description: "UI/UX, Graphic, Product",
    students: "180+ students",
  },
  {
    title: "Analytics",
    icon: BarChart3,
    color: "from-emerald-500 to-green-600",
    bgColor: "bg-gradient-to-br from-emerald-50 to-green-50",
    description: "Data Science, Business Intelligence",
    students: "140+ students",
  },
  {
    title: "Business",
    icon: Scale,
    color: "from-amber-500 to-orange-600",
    bgColor: "bg-gradient-to-br from-amber-50 to-orange-50",
    description: "Strategy, Law, Marketing",
    students: "200+ students",
  },
];

const testimonials = [
  {
    name: "Alex Chen",
    role: "Full-Stack Developer",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    testimonial:
      "CrossLab helped me find a team with the right skills to bring my project to life. The collaboration tools are top-notch!",
  },
  {
    name: "Maya Rodriguez",
    role: "UX Designer",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maya",
    testimonial:
      "I love the project-based learning approach. It's a great way to build a portfolio and get real-world experience.",
  },
  {
    name: "David Kim",
    role: "Business Analyst",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
    testimonial:
      "The platform's AI matchmaking is incredibly accurate. It connected me with the perfect team for my skills and interests.",
  },
];

export function Home() {
  return (
    <div className="relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Top right soft gradient blob */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full blur-3xl"></div>

        {/* Left side geometric shape */}
        <div className="absolute top-1/4 -left-12 w-72 h-72 bg-gradient-to-br from-emerald-200/20 to-teal-200/20 rounded-full blur-2xl"></div>

        {/* Bottom right accent */}
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-tl from-rose-200/25 to-pink-200/25 rounded-full blur-3xl"></div>

        {/* Center floating elements */}
        <div className="absolute top-1/3 right-1/3 w-4 h-4 bg-blue-400/60 rounded-full animate-pulse"></div>
        <div className="absolute top-1/2 left-1/4 w-3 h-3 bg-purple-400/60 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/3 left-1/2 w-5 h-5 bg-emerald-400/60 rounded-full animate-pulse delay-2000"></div>
      </div>

      {/* Hero Section */}
      <section className="relative container mx-auto px-4 py-20 lg:py-32">
        <div className="text-center max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <Badge
              variant="secondary"
              className="mb-8 px-6 py-2 text-sm font-medium bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border border-blue-200/50 shadow-sm"
            >
              ✨ Trusted by 1,200+ students from top universities
            </Badge>

            <h1 className="text-5xl lg:text-7xl font-bold mb-8 leading-tight">
              <span className="block text-gray-900 mb-2">
                Build real projects
              </span>
              <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                with amazing teams
              </span>
            </h1>

            <p className="text-xl lg:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Join cross-disciplinary teams of designers, developers, analysts,
              and business minds. Solve real challenges. Build your portfolio.
              Land your dream job.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link to="/auth">
                <Button
                  size="lg"
                  className="group px-8 py-4 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Start Your Journey
                  <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>

              <button className="flex items-center gap-3 text-gray-600 hover:text-gray-900 transition-colors group">
                <div className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center group-hover:shadow-xl transition-shadow">
                  <Play className="h-5 w-5 text-blue-600 ml-0.5" />
                </div>
                <span className="font-medium">Watch how it works</span>
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Disciplines Section */}
      <section className="relative container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-gray-900">
            Find your perfect team
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Connect with talented students from these key disciplines
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {disciplines.map((discipline, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group cursor-pointer"
            >
              <Card
                className={`relative p-8 ${discipline.bgColor} border-0 shadow-lg hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-2 overflow-hidden`}
              >
                {/* Gradient overlay on hover */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${discipline.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                ></div>

                <CardContent className="p-0 relative z-10">
                  <div
                    className={`w-16 h-16 bg-gradient-to-br ${discipline.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  >
                    <discipline.icon className="h-8 w-8 text-white" />
                  </div>

                  <h3 className="text-2xl font-bold mb-3 text-gray-900">
                    {discipline.title}
                  </h3>
                  <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                    {discipline.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">
                      {discipline.students}
                    </span>
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="w-8 h-8 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full border-2 border-white"
                        ></div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="relative bg-gradient-to-br from-gray-50 to-blue-50/30 py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-gray-900">
              Everything you need to succeed
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              From intelligent team matching to professional mentorship, we
              provide all the tools and support for your success
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: index * 0.15 }}
                className="group"
              >
                <Card
                  className={`p-10 h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-500 ${feature.bgColor} group-hover:-translate-y-1 bg-white/80 backdrop-blur-sm`}
                >
                  <CardContent className="p-0">
                    <div
                      className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-8 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                    >
                      <feature.icon className="h-8 w-8 text-white" />
                    </div>

                    <h3 className="text-2xl font-bold mb-4 text-gray-900">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 text-lg leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="relative container mx-auto px-4 py-24">
        <div className="text-center mb-20">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-gray-900">
            Success stories from our community
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            See how CrossLab helped students land jobs at top companies
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              <Card className="p-8 h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur-sm">
                <CardContent className="p-0">
                  <div className="flex items-center mb-6">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-16 h-16 rounded-full object-cover mr-4 shadow-lg"
                    />
                    <div>
                      <h4 className="font-bold text-gray-900">
                        {testimonial.name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {testimonial.role}
                      </p>
                      <p className="text-sm font-medium text-blue-600">
                        {testimonial.company}
                      </p>
                    </div>
                  </div>

                  <div className="flex mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className="h-5 w-5 text-yellow-400 fill-current"
                      />
                    ))}
                  </div>

                  <p className="text-gray-700 italic leading-relaxed">
                    "{testimonial.testimonial}"
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section className="relative bg-gradient-to-br from-indigo-50 to-purple-50 py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-gray-900">
              Your journey in 4 simple steps
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From assessment to showcase, we guide you through every step
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "Take Skills Assessment",
                description:
                  "Tell us about your skills, interests, and what you want to learn",
                icon: Target,
                color: "from-blue-500 to-cyan-500",
              },
              {
                step: "02",
                title: "Get Matched",
                description:
                  "Our AI connects you with the perfect cross-functional team",
                icon: Users,
                color: "from-purple-500 to-pink-500",
              },
              {
                step: "03",
                title: "Build & Learn",
                description:
                  "Work on real projects with mentorship and peer support",
                icon: Zap,
                color: "from-emerald-500 to-teal-500",
              },
              {
                step: "04",
                title: "Showcase Success",
                description:
                  "Present your project and add it to your professional portfolio",
                icon: Award,
                color: "from-orange-500 to-red-500",
              },
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className="text-center group"
              >
                <div
                  className={`w-20 h-20 bg-gradient-to-br ${step.color} rounded-3xl flex items-center justify-center mb-6 mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300`}
                >
                  <step.icon className="h-10 w-10 text-white" />
                </div>

                <div className="text-sm font-bold text-gray-400 mb-2 tracking-wide">
                  {step.step}
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-900">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative container mx-auto px-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <Card className="relative p-16 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 border-0 shadow-2xl overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
              <div
                className="absolute top-0 left-0 w-full h-full"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}
              ></div>
            </div>

            <CardContent className="p-0 relative z-10">
              <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-white">
                Ready to build something amazing?
              </h2>
              <p className="text-xl text-blue-100 mb-12 max-w-3xl mx-auto leading-relaxed">
                Join over 1,200 students who are already building the future.
                Your next breakthrough project is waiting for you.
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <Link to="/auth">
                  <button className="inline-flex items-center justify-center px-10 py-4 text-lg font-semibold bg-white text-blue-600 hover:bg-gray-50 shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg">
                    Join CrossLab Today
                    <Heart className="ml-3 h-5 w-5" />
                  </button>
                </Link>

                <Link to="/projects">
                  <button className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold border border-white/30 text-white hover:bg-white/10 backdrop-blur-sm transition-all duration-300 rounded-lg bg-transparent">
                    Explore Projects
                    <Globe className="ml-3 h-5 w-5" />
                  </button>
                </Link>
              </div>

              <div className="flex items-center justify-center mt-8 gap-4 text-blue-100">
                <CheckCircle className="h-5 w-5" />
                <span className="text-sm">
                  Free to join • No credit card required
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </section>
    </div>
  );
}
