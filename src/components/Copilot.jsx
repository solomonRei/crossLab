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
  Sparkles,
  Code,
  FileText,
  Lightbulb,
  Zap
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
    timestamp: new Date().toISOString(),
    suggestions: ["Show JWT implementation", "Explain OAuth flow", "Security best practices"]
  }
]

// Enhanced AI responses based on selected copilot
const getAIResponse = (selectedCopilot, userMessage) => {
  const responses = {
    devbot: [
      "As DevBot, I can help you with code architecture, debugging, and best practices. Let me analyze your request...",
      "Here's a code solution for your problem:\n\n```javascript\n// Example implementation\nconst handleAuth = async (credentials) => {\n  // Your code here\n}\n```",
      "I recommend following these development principles for your project..."
    ],
    uxbot: [
      "From a UX perspective, let's focus on user needs and design patterns...",
      "Consider these design principles for better user experience:",
      "I suggest creating user personas and journey maps to better understand your users."
    ],
    ecobot: [
      "Let's analyze the business impact and market viability of this feature...",
      "From an economic perspective, consider these key metrics:",
      "I can help you build a business case and ROI calculation for this project."
    ],
    legalbot: [
      "From a legal compliance standpoint, here are the key considerations...",
      "Make sure to address these regulatory requirements:",
      "I recommend reviewing GDPR, CCPA, and other relevant privacy laws."
    ]
  }
  
  const copilotResponses = responses[selectedCopilot.id] || responses.devbot
  return copilotResponses[Math.floor(Math.random() * copilotResponses.length)]
}

export function Copilot({ isOpen = false, onToggle }) {
  const [messages, setMessages] = useState(sampleMessages)
  const [newMessage, setNewMessage] = useState('')
  const [selectedCopilot, setSelectedCopilot] = useState(aiCopilots[0])
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [isTyping, setIsTyping] = useState(false)

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
    setIsTyping(true)

    // Enhanced AI response simulation
    setTimeout(() => {
      const aiResponse = {
        id: messages.length + 2,
        type: 'ai',
        message: getAIResponse(selectedCopilot, newMessage),
        timestamp: new Date().toISOString(),
        suggestions: ["Follow up question", "Related topic", "More details"]
      }
      setMessages(prev => [...prev, aiResponse])
      setIsTyping(false)
    }, 1500)
  }

  const handleSuggestionClick = (suggestion) => {
    setNewMessage(suggestion)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatMessage = (message) => {
    // Enhanced message formatting with code blocks and lists
    return message.split('\n').map((line, index) => {
      if (line.startsWith('```')) {
        return <code key={index} className="block bg-muted p-2 rounded mt-2 text-sm font-mono">{line.replace(/```\w*/, '')}</code>
      }
      if (line.match(/^\d+\./)) {
        return <div key={index} className="ml-4 my-1">{line}</div>
      }
      return <div key={index} className="my-1">{line}</div>
    })
  }

  if (!isOpen) {
    return (
      <Button
        onClick={onToggle}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 group"
        size="icon"
      >
        <MessageCircle className="h-6 w-6 group-hover:scale-110 transition-transform" />
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
              <Badge variant="secondary" className="ml-2 text-xs">
                Enhanced
              </Badge>
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
                      className="w-full p-3 text-left hover:bg-accent flex items-center transition-colors"
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
                  {message.type === 'ai' ? formatMessage(message.message) : message.message}
                  
                  {/* AI Suggestions */}
                  {message.type === 'ai' && message.suggestions && (
                    <div className="mt-3 space-y-1">
                      {message.suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="block w-full text-left text-xs p-2 bg-background rounded border hover:bg-accent transition-colors"
                        >
                          <Lightbulb className="h-3 w-3 mr-1 inline" />
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
            
            {/* Typing Indicator */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="chat-bubble chat-bubble-ai">
                  <div className="flex items-center space-x-1">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                    <span className="text-xs">AI is thinking...</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>

        {/* Quick Actions */}
        <div className="px-4 py-2 border-t bg-muted/30">
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm" onClick={() => handleSuggestionClick("Help me debug this code")}>
              <Code className="h-3 w-3 mr-1" />
              Debug
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handleSuggestionClick("Review my design")}>
              <FileText className="h-3 w-3 mr-1" />
              Review
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handleSuggestionClick("Suggest improvements")}>
              <Zap className="h-3 w-3 mr-1" />
              Ideas
            </Button>
          </div>
        </div>

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
              disabled={isTyping}
            />
            <Button size="icon" onClick={sendMessage} disabled={!newMessage.trim() || isTyping}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  )
} 