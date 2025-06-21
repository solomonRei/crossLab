import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from './ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { Badge } from './ui/Badge'
import { 
  MessageCircle, 
  Send, 
  Bot, 
  X,
  ChevronDown,
  Sparkles
} from 'lucide-react'
import { aiCopilots } from '../data/mockData'

const sampleMessages = [
  {
    id: 1,
    type: 'ai',
    message: "Hi! I'm your AI Copilot. How can I help you with your project today?",
    timestamp: new Date().toISOString()
  },
  {
    id: 2,
    type: 'user', 
    message: "I need help with the user authentication flow",
    timestamp: new Date().toISOString()
  },
  {
    id: 3,
    type: 'ai',
    message: "I can help you with that! For user authentication, I recommend implementing OAuth 2.0 with JWT tokens. Here's a basic flow:\n\n1. User login request\n2. Verify credentials\n3. Generate JWT token\n4. Store token securely\n\nWould you like me to provide code examples for any specific part?",
    timestamp: new Date().toISOString()
  }
]

export function Copilot({ isOpen = false, onToggle }) {
  const [messages, setMessages] = useState(sampleMessages)
  const [newMessage, setNewMessage] = useState('')
  const [selectedCopilot, setSelectedCopilot] = useState(aiCopilots[0])
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const sendMessage = () => {
    if (!newMessage.trim()) return

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      message: newMessage,
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setNewMessage('')

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: messages.length + 2,
        type: 'ai',
        message: `Thanks for your question! As ${selectedCopilot.name}, I'm here to help with ${selectedCopilot.description.toLowerCase()}. Let me provide you with some guidance...`,
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, aiResponse])
    }, 1000)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (!isOpen) {
    return (
      <Button
        onClick={onToggle}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 400 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 400 }}
      transition={{ duration: 0.3 }}
      className="fixed right-6 bottom-6 w-80 h-96 z-50"
    >
      <Card className="h-full flex flex-col shadow-2xl">
        {/* Header */}
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center">
              <Bot className={`h-5 w-5 mr-2 ${selectedCopilot.color}`} />
              AI Copilot
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={onToggle}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Copilot Selector */}
          <div className="relative">
            <Button
              variant="outline"
              className="w-full justify-between"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <div className="flex items-center">
                <Sparkles className={`h-4 w-4 mr-2 ${selectedCopilot.color}`} />
                {selectedCopilot.name}
              </div>
              <ChevronDown className="h-4 w-4" />
            </Button>
            
            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-1 bg-card border rounded-md shadow-lg z-10"
                >
                  {aiCopilots.map((copilot) => (
                    <button
                      key={copilot.id}
                      className="w-full p-3 text-left hover:bg-accent flex items-center"
                      onClick={() => {
                        setSelectedCopilot(copilot)
                        setDropdownOpen(false)
                      }}
                    >
                      <Sparkles className={`h-4 w-4 mr-2 ${copilot.color}`} />
                      <div>
                        <div className="font-medium">{copilot.name}</div>
                        <div className="text-xs text-muted-foreground">{copilot.description}</div>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CardHeader>

        {/* Messages */}
        <CardContent className="flex-1 overflow-auto p-4 space-y-4">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`chat-bubble ${message.type === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}`}>
                  {message.message}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </CardContent>

        {/* Input */}
        <div className="p-4 border-t">
          <div className="flex space-x-2">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Ask ${selectedCopilot.name} anything...`}
              className="flex-1 min-h-[40px] max-h-20 p-2 border rounded-md resize-none bg-background"
              rows={1}
            />
            <Button size="icon" onClick={sendMessage} disabled={!newMessage.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  )
} 