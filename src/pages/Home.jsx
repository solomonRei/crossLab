import { motion, useAnimation } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
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
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import ThreeDScene from "../components/ThreeDScene";
import Typewriter from "typewriter-effect";

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
    delay: 0.1,
  },
  {
    name: "Maya Rodriguez",
    role: "UX Designer",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maya",
    testimonial:
      "I love the project-based learning approach. It's a great way to build a portfolio and get real-world experience.",
    delay: 0.2,
  },
  {
    name: "David Kim",
    role: "Business Analyst",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
    testimonial:
      "The platform's AI matchmaking is incredibly accurate. It connected me with the perfect team for my skills and interests.",
    delay: 0.3,
  },
];

const Section = ({ children, className }) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  return (
    <motion.section
      ref={ref}
      className={className}
      initial="hidden"
      animate={controls}
      variants={{
        visible: { opacity: 1, y: 0 },
        hidden: { opacity: 0, y: 50 },
      }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      {children}
    </motion.section>
  );
};

export function Home() {
  const heroControls = useAnimation();

  useEffect(() => {
    heroControls.start((i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.2, duration: 0.8, ease: "easeOut" },
    }));
  }, [heroControls]);

  return (
    <div className="relative overflow-hidden bg-gray-950 text-white">
      {/* 3D Hero Section */}
      <section className="relative h-screen flex items-center justify-center">
        <div className="absolute inset-0 w-full h-full z-0">
          <ThreeDScene />
        </div>
        <div className="relative z-10 text-center max-w-5xl mx-auto px-4">
          <motion.div
            custom={0}
            initial={{ opacity: 0, y: 30 }}
            animate={heroControls}
          >
            <Badge
              variant="secondary"
              className="mb-8 px-6 py-2 text-sm font-medium bg-white/10 text-blue-300 border border-blue-800/50 shadow-sm"
            >
              ✨ Welcome to the Future of Collaboration
            </Badge>
          </motion.div>

          <motion.h1
            custom={1}
            initial={{ opacity: 0, y: 30 }}
            animate={heroControls}
            className="text-5xl lg:text-7xl font-bold mb-8 leading-tight text-white"
          >
            <span className="block mb-2">Build real projects</span>
            <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
              with amazing teams
            </span>
          </motion.h1>

          <motion.p
            custom={2}
            initial={{ opacity: 0, y: 30 }}
            animate={heroControls}
            className="text-xl lg:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed typewriter-glow"
          >
            <Typewriter
              options={{
                strings: [
                  "Enhance your PBL experience.",
                  "Solve real-world challenges.",
                  "Build an impressive portfolio.",
                  "Land your dream job.",
                ],
                autoStart: true,
                loop: true,
                delay: 75,
                deleteSpeed: 50,
              }}
            />
          </motion.p>

          <motion.div
            custom={3}
            initial={{ opacity: 0, y: 30 }}
            animate={heroControls}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          >
            <Link to="/auth">
              <Button
                size="lg"
                className="group px-8 py-4 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Start Your Journey
                <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>

            <button className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors group">
              <div className="w-12 h-12 bg-white/10 rounded-full shadow-lg flex items-center justify-center group-hover:shadow-xl transition-shadow transform group-hover:scale-110">
                <Play className="h-5 w-5 text-blue-400 ml-0.5" />
              </div>
              <span className="font-medium">Watch how it works</span>
            </button>
          </motion.div>
        </div>
      </section>

      {/* Disciplines Section */}
      <Section className="relative container mx-auto px-4 py-20 bg-gray-950">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-gray-900 dark:text-gray-100">
            Find your perfect team
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Connect with talented students from these key disciplines
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {disciplines.map((discipline, index) => (
            <motion.div
              key={index}
              variants={{
                visible: { opacity: 1, y: 0 },
                hidden: { opacity: 0, y: 50 },
              }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group cursor-pointer"
            >
              <Card
                className={`relative p-8 ${discipline.bgColor} dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-lg hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-2 overflow-hidden`}
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

                  <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-gray-100">
                    {discipline.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm leading-relaxed">
                    {discipline.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {discipline.students}
                    </span>
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="w-8 h-8 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-full border-2 border-white dark:border-gray-900"
                        ></div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* Features Section */}
      <Section className="py-24 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-gray-900 dark:text-gray-100">
              Everything you need to succeed
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              A complete platform to collaborate, learn, and grow your career.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={{
                  visible: { opacity: 1, y: 0 },
                  hidden: { opacity: 0, y: 50 },
                }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="p-8 text-center h-full bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <div
                    className={`inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-gradient-to-br ${feature.color}`}
                  >
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* Testimonials Section */}
      <Section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-gray-900 dark:text-gray-100">
              Loved by students worldwide
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Don't just take our word for it. Here's what our users are saying.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <motion.div
                key={testimonial.name}
                variants={{
                  visible: { opacity: 1, scale: 1 },
                  hidden: { opacity: 0, scale: 0.9 },
                }}
                transition={{ duration: 0.6, delay: testimonial.delay }}
              >
                <Card className="h-full flex flex-col p-8 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-lg">
                  <CardContent className="flex-grow p-0">
                    <div className="flex items-center mb-6">
                      <img
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        className="w-14 h-14 rounded-full mr-4 border-2 border-blue-200 dark:border-blue-700"
                      />
                      <div>
                        <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                          {testimonial.name}
                        </h4>
                        <p className="text-gray-500 dark:text-gray-400">
                          {testimonial.role}
                        </p>
                      </div>
                    </div>
                    <blockquote className="text-gray-600 dark:text-gray-300 italic text-lg">
                      "{testimonial.testimonial}"
                    </blockquote>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* Call to Action Section */}
      <Section className="py-24 bg-gradient-to-br from-blue-600 to-purple-600">
        <div className="container mx-auto px-4 text-center text-white">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Ready to build something amazing?
          </h2>
          <p className="text-xl max-w-2xl mx-auto mb-10">
            Join thousands of innovators and start your journey on CrossLab
            today.
          </p>
          <Link to="/auth">
            <Button
              size="lg"
              variant="secondary"
              className="group px-10 py-5 text-lg font-semibold bg-white text-blue-600 hover:bg-gray-100 shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              Get Started for Free
              <Zap className="ml-3 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </Section>
    </div>
  );
}
