import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  Send, 
  Smile,
  MoreVertical,
  Pin
} from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { ScrollArea } from '../ui/ScrollArea';
import { Badge } from '../ui/Badge';
import { formatDate } from '../../lib/utils';

const ChatMessage = ({ message, isCurrentUser = false }) => {
  const displayName = `${message.sender?.firstName || ''} ${message.sender?.lastName || ''}`.trim()
    || message.sender?.userName
    || message.sender?.email
    || 'Unknown User';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 p-3 hover:bg-gray-700/30 rounded-lg transition-colors ${
        isCurrentUser ? 'bg-blue-500/10' : ''
      }`}
    >
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarImage src={message.sender?.avatar} />
        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
          {message.sender?.firstName?.[0] || message.sender?.userName?.[0] || 'U'}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-white font-medium text-sm">
            {displayName}
            {isCurrentUser && ' (You)'}
          </span>
          
          {message.sender?.role === 'host' && (
            <Badge variant="destructive" className="text-xs">Host</Badge>
          )}
          
          <span className="text-xs text-gray-400">
            {formatDate(message.timestamp)}
          </span>
        </div>
        
        <div className="text-gray-200 text-sm leading-relaxed break-words">
          {message.content}
        </div>
        
        {message.type === 'system' && (
          <div className="text-xs text-blue-400 italic mt-1">
            System message
          </div>
        )}
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-white flex-shrink-0"
      >
        <MoreVertical className="h-3 w-3" />
      </Button>
    </motion.div>
  );
};

export const ChatPanel = ({ 
  sessionId,
  currentUserId = null,
  messages = [],
  onSendMessage = null 
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Mock messages for demo purposes
  const mockMessages = [
    {
      id: '1',
      content: 'Welcome to the demo session! Feel free to ask questions in the chat.',
      timestamp: new Date(Date.now() - 300000),
      type: 'system',
      sender: {
        id: 'host',
        firstName: 'Demo',
        lastName: 'Host',
        role: 'host'
      }
    },
    {
      id: '2',
      content: 'Thanks for joining! This looks really interesting.',
      timestamp: new Date(Date.now() - 120000),
      type: 'message',
      sender: {
        id: 'user1',
        firstName: 'John',
        lastName: 'Doe',
        role: 'participant'
      }
    },
    {
      id: '3',
      content: 'Can you show us the dashboard features?',
      timestamp: new Date(Date.now() - 60000),
      type: 'message',
      sender: {
        id: 'user2',
        firstName: 'Jane',
        lastName: 'Smith',
        role: 'participant'
      }
    }
  ];

  const displayMessages = messages.length > 0 ? messages : mockMessages;

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [displayMessages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    if (onSendMessage) {
      onSendMessage({
        content: newMessage.trim(),
        type: 'message',
        sessionId
      });
    } else {
      // Mock message sending for demo
      console.log('Sending message:', newMessage);
    }
    
    setNewMessage('');
    inputRef.current?.focus();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-800">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-gray-400" />
          <h3 className="text-white font-semibold">Chat</h3>
          <Badge variant="outline" className="text-xs">
            {displayMessages.length}
          </Badge>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          <AnimatePresence>
            {displayMessages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                isCurrentUser={message.sender?.id === currentUserId}
              />
            ))}
          </AnimatePresence>
          
          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 p-3 text-gray-400 text-sm"
            >
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span>Someone is typing...</span>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-700">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 pr-10"
            />
            
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 text-gray-400 hover:text-white"
            >
              <Smile className="h-4 w-4" />
            </Button>
          </div>
          
          <Button
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
        
        <div className="text-xs text-gray-400 mt-2">
          Press Enter to send, Shift+Enter for new line
        </div>
      </div>
    </div>
  );
}; 