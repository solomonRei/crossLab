# CrossLab - Cross-Disciplinary Learning Platform

CrossLab is a modern, elegant project-based learning platform that connects students from different disciplines (developers, economists, designers, lawyers) into small teams to solve real-world challenges from companies, NGOs, or universities.

## 🌟 Features

### Core Functionality
- **Smart Matchmaking**: AI-powered team formation based on skills, personality, and project needs
- **AI Copilot**: Role-specific assistants (DevBot, UXBot, EcoBot, LegalBot) for each discipline
- **Sprint Tracking**: 4-stage project workflow with automatic progress tracking
- **Peer Review System**: Anonymous feedback and contribution tracking for fair assessment
- **Demo Showcase**: Public portfolio with video demos, code links, and AI insights
- **XP & Leveling**: Gamified progression system with badges and achievements

### Pages & Components
- **Landing Page**: Hero section, features, live stats, how it works
- **Project Catalog**: Filterable project list with role matching
- **Project Dashboard**: Sprint progress, team management, tabbed content (Tasks, Docs, Demo, Review)
- **Profile Page**: User stats, XP progress, badges, completed projects
- **Demo Showcase**: Gallery of completed projects with like system
- **Peer Reviews**: Multi-category rating system with anonymous options

### User Experience
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Dark/Light Mode**: Toggle between themes
- **Modern UI**: Inspired by Notion, Linear, and GitHub Classroom
- **Smooth Animations**: Framer Motion for polished interactions
- **Clean Components**: shadcn/ui inspired design system

## 🛠 Tech Stack

- **Frontend**: React.js (no TypeScript)
- **Styling**: Tailwind CSS with custom design tokens
- **Components**: Custom shadcn/ui inspired component library
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Routing**: React Router DOM
- **State Management**: Zustand (optional, prepared)
- **Utilities**: clsx for conditional styling

## 🏗 Project Structure

```
src/
├── components/
│   ├── ui/                 # Reusable UI components
│   │   ├── Card.jsx
│   │   ├── Button.jsx
│   │   ├── Badge.jsx
│   │   ├── Progress.jsx
│   │   ├── Avatar.jsx
│   │   └── Tabs.jsx
│   └── Copilot.jsx         # AI Copilot chat component
├── layouts/
│   ├── DashboardLayout.jsx # Authenticated user layout
│   └── PublicLayout.jsx    # Public pages layout
├── pages/
│   ├── Home.jsx           # Landing page
│   ├── Projects.jsx       # Project catalog
│   ├── ProjectView.jsx    # Individual project dashboard
│   ├── Profile.jsx        # User profile
│   ├── Showcase.jsx       # Demo gallery
│   └── Review.jsx         # Peer review system
├── data/
│   └── mockData.js        # Sample data for development
├── lib/
│   └── utils.js           # Utility functions
└── App.js                 # Main app with routing
```

## 🎨 Design System

### Colors & Themes
- CSS custom properties for light/dark mode
- Consistent color palette with semantic naming
- Tailwind CSS utilities for spacing and typography

### Components
- **Card**: Base container with consistent styling
- **Button**: Multiple variants (default, outline, ghost, destructive)
- **Badge**: Status indicators and tags
- **Progress**: Linear progress bars for XP and project completion
- **Avatar**: User profile pictures with fallback initials
- **Tabs**: Tabbed navigation for project dashboard

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd CrossLab
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Removes Create React App wrapper (one-way operation)

## 🎯 Key Features Deep Dive

### Smart Matchmaking Algorithm
The platform uses a comprehensive assessment system:
- **Skills Assessment**: Technical capabilities and preferred tools
- **Personality Quiz**: Communication style and work preferences  
- **Role Selection**: Primary discipline (Developer, Designer, Analyst, Legal, Marketing)
- **AI Matching**: Balances teams for optimal collaboration

### AI Copilot System
Role-specific assistants provide contextual help:
- **DevBot**: Code review, debugging, architecture guidance
- **UXBot**: Design patterns, user research, prototyping
- **EcoBot**: Business models, market analysis, financial projections
- **LegalBot**: Compliance, contracts, regulatory guidance

### Sprint Management
4-stage workflow ensures project success:
1. **Research & Analysis**: Problem definition and user research
2. **Prototype Development**: Core feature implementation
3. **Testing & Validation**: User testing and iteration
4. **Final Presentation**: Demo preparation and delivery

### Peer Review Framework
Multi-dimensional evaluation system:
- **Technical Skills**: Quality of domain-specific contributions
- **Collaboration**: Communication and teamwork effectiveness
- **Initiative**: Proactivity and leadership demonstration
- **Reliability**: Meeting deadlines and commitments
- **Creativity**: Innovation and problem-solving approach

## 🌈 Future Enhancements

- Real-time team chat and video calls
- Integration with external tools (GitHub, Figma, Notion)
- Mentor assignment and guidance system
- Company challenge marketplace
- Advanced analytics and insights
- Mobile app development
- API for third-party integrations

## 🤝 Contributing

This is a demonstration project showcasing modern React development practices and UX design principles. The codebase serves as a foundation for building comprehensive educational platforms.

## 📄 License

This project is built for demonstration purposes and showcases modern web development practices using React, Tailwind CSS, and contemporary design patterns.

## ✨ Credits

Inspired by the best practices from:
- **Notion**: Clean, organized content management
- **Linear**: Efficient project tracking and workflows  
- **GitHub Classroom**: Educational collaboration tools
- **shadcn/ui**: Modern component design patterns
