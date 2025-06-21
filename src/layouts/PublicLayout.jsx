import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Github, Twitter, Linkedin } from 'lucide-react'

export function PublicLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">CL</span>
            </div>
            <span className="text-xl font-bold">CrossLab</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/projects" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Browse Projects
            </Link>
            <Link to="/showcase" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Showcase
            </Link>
            <Link to="/about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              About
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link to="/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link to="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t bg-card">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">CL</span>
                </div>
                <span className="text-xl font-bold">CrossLab</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Connecting students across disciplines to solve real-world challenges through collaborative project-based learning.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Platform</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/projects" className="hover:text-foreground transition-colors">Browse Projects</Link></li>
                <li><Link to="/showcase" className="hover:text-foreground transition-colors">Showcase</Link></li>
                <li><Link to="/teams" className="hover:text-foreground transition-colors">Find Teams</Link></li>
                <li><Link to="/mentors" className="hover:text-foreground transition-colors">Mentors</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Resources</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/help" className="hover:text-foreground transition-colors">Help Center</Link></li>
                <li><Link to="/guides" className="hover:text-foreground transition-colors">Getting Started</Link></li>
                <li><Link to="/api" className="hover:text-foreground transition-colors">API Docs</Link></li>
                <li><Link to="/blog" className="hover:text-foreground transition-colors">Blog</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Connect</h3>
              <div className="flex space-x-4">
                <Button variant="ghost" size="icon">
                  <Github className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Twitter className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Linkedin className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 CrossLab. All rights reserved. Built with ❤️ for collaborative learning.</p>
          </div>
        </div>
      </footer>
    </div>
  )
} 