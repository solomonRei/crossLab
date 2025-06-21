export const users = [
  {
    id: 1,
    name: "Alex Chen",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    role: "Full-Stack Developer",
    preferredRole: "developer",
    xp: 1250,
    level: 3,
    badges: ["Code Ninja", "Team Player", "Bug Hunter"],
    completedProjects: 8,
    bio: "Passionate about creating scalable web applications with modern tech stacks."
  },
  {
    id: 2,
    name: "Maya Rodriguez",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maya",
    role: "UX Designer",
    preferredRole: "designer",
    xp: 980,
    level: 2,
    badges: ["Design Wizard", "User Advocate"],
    completedProjects: 6,
    bio: "Creating intuitive and beautiful user experiences that solve real problems."
  },
  {
    id: 3,
    name: "David Kim",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
    role: "Business Analyst",
    preferredRole: "analyst",
    xp: 740,
    level: 2,
    badges: ["Data Guru", "Strategy Mind"],
    completedProjects: 4,
    bio: "Bridging the gap between business needs and technical solutions."
  },
  {
    id: 4,
    name: "Sophie Laurent",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie",
    role: "Legal Advisor",
    preferredRole: "legal",
    xp: 560,
    level: 1,
    badges: ["Compliance Expert"],
    completedProjects: 3,
    bio: "Ensuring projects meet regulatory requirements and ethical standards."
  }
];

export const projects = [
  {
    id: 1,
    title: "AI Coffee Assistant",
    description: "Smart coffee ordering system with ML recommendations",
    tags: ["AI", "Mobile", "E-commerce"],
    rolesNeeded: ["developer", "designer", "analyst"],
    deadline: "2024-02-15",
    difficulty: "Medium",
    duration: "4 weeks",
    company: "CafeTech Solutions",
    participants: 12,
    maxParticipants: 15,
    status: "recruiting",
    progress: 0.1,
    sprints: [
      { name: "Research & Analysis", completed: false, current: true },
      { name: "Prototype Development", completed: false, current: false },
      { name: "Testing & Validation", completed: false, current: false },
      { name: "Final Presentation", completed: false, current: false }
    ]
  },
  {
    id: 2,
    title: "Greenhouse Dashboard",
    description: "IoT monitoring system for smart agriculture",
    tags: ["IoT", "Data Viz", "Sustainability"],
    rolesNeeded: ["developer", "analyst", "designer"],
    deadline: "2024-03-01",
    difficulty: "Hard",
    duration: "6 weeks",
    company: "GreenTech Innovations",
    participants: 8,
    maxParticipants: 12,
    status: "in-progress",
    progress: 0.6,
    sprints: [
      { name: "Research & Analysis", completed: true, current: false },
      { name: "Prototype Development", completed: true, current: false },
      { name: "Testing & Validation", completed: false, current: true },
      { name: "Final Presentation", completed: false, current: false }
    ]
  },
  {
    id: 3,
    title: "Legal Doc Generator",
    description: "Automated contract generation with AI assistance",
    tags: ["Legal Tech", "AI", "Automation"],
    rolesNeeded: ["legal", "developer", "analyst"],
    deadline: "2024-02-28",
    difficulty: "Hard",
    duration: "5 weeks",
    company: "LegalFlow Inc",
    participants: 6,
    maxParticipants: 9,
    status: "recruiting",
    progress: 0,
    sprints: [
      { name: "Research & Analysis", completed: false, current: true },
      { name: "Prototype Development", completed: false, current: false },
      { name: "Testing & Validation", completed: false, current: false },
      { name: "Final Presentation", completed: false, current: false }
    ]
  }
];

export const teams = [
  {
    id: 1,
    projectId: 2,
    members: [
      { userId: 1, role: "Tech Lead", progress: 0.8 },
      { userId: 2, role: "UX Designer", progress: 0.7 },
      { userId: 3, role: "Business Analyst", progress: 0.6 }
    ],
    chatMessages: [
      {
        id: 1,
        userId: 1,
        message: "Just finished the API integration. Dashboard is looking great!",
        timestamp: "2024-01-20T10:30:00Z",
        type: "user"
      },
      {
        id: 2,
        userId: 2,
        message: "Perfect! I've updated the UI components. Ready for testing.",
        timestamp: "2024-01-20T10:35:00Z",
        type: "user"
      }
    ]
  }
];

export const demoProjects = [
  {
    id: 1,
    title: "EcoTracker Mobile App",
    description: "Carbon footprint tracking app with gamification",
    teamMembers: ["Alex Chen", "Maya Rodriguez", "David Kim"],
    demoVideo: "https://example.com/demo1",
    githubLink: "https://github.com/team1/ecotracker",
    tags: ["Mobile", "Sustainability", "Gamification"],
    likes: 42,
    aiInsights: "Strong UX design, excellent user engagement features",
    completedDate: "2024-01-15"
  },
  {
    id: 2,
    title: "FinanceBot Assistant",
    description: "AI-powered personal finance advisor",
    teamMembers: ["Sophie Laurent", "Alex Chen", "David Kim"],
    demoVideo: "https://example.com/demo2",
    figmaLink: "https://figma.com/team2/financebot",
    tags: ["AI", "Finance", "Chatbot"],
    likes: 38,
    aiInsights: "Innovative AI implementation, needs better data validation",
    completedDate: "2024-01-10"
  }
];

export const notifications = [
  {
    id: 1,
    type: "team_invite",
    title: "Team Invitation",
    message: "You've been invited to join the AI Coffee Assistant project",
    timestamp: "2024-01-20T14:30:00Z",
    read: false
  },
  {
    id: 2,
    type: "project_update",
    title: "Project Milestone",
    message: "Greenhouse Dashboard reached 60% completion",
    timestamp: "2024-01-20T11:00:00Z",
    read: true
  }
];

export const roleTypes = [
  { id: "developer", name: "Developer", icon: "Code", color: "bg-blue-500" },
  { id: "designer", name: "Designer", icon: "Palette", color: "bg-purple-500" },
  { id: "analyst", name: "Analyst", icon: "TrendingUp", color: "bg-green-500" },
  { id: "legal", name: "Legal", icon: "Scale", color: "bg-orange-500" },
  { id: "marketing", name: "Marketing", icon: "Megaphone", color: "bg-pink-500" }
];

export const aiCopilots = [
  {
    id: "devbot",
    name: "DevBot",
    description: "Your coding companion",
    icon: "Code",
    color: "text-blue-500"
  },
  {
    id: "uxbot", 
    name: "UXBot",
    description: "Design thinking assistant",
    icon: "Palette",
    color: "text-purple-500"
  },
  {
    id: "ecobot",
    name: "EcoBot", 
    description: "Business strategy helper",
    icon: "TrendingUp",
    color: "text-green-500"
  },
  {
    id: "legalbot",
    name: "LegalBot",
    description: "Compliance and law advisor", 
    icon: "Scale",
    color: "text-orange-500"
  }
]; 