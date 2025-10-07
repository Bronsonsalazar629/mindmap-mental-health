import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Mic, Send, Heart, Users, MessageCircle, Languages } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  culturalContext?: string;
  timestamp: Date;
}

interface CulturalConversationInterfaceProps {
  culturalStyle?: 'collectivist' | 'individualist' | 'high-context' | 'direct';
  className?: string;
}

export function CulturalConversationInterface({ 
  culturalStyle = 'individualist',
  className 
}: CulturalConversationInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm here to support you in a way that honors your cultural background and communication style. How are you feeling today?",
      sender: 'ai',
      culturalContext: 'greeting-adaptive',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isVoiceMode, setIsVoiceMode] = useState(false);

  const getCulturalBubbleStyle = (sender: 'user' | 'ai') => {
    const baseStyles = "max-w-[80%] p-4 rounded-2xl mb-4 transition-all duration-300";
    
    switch (culturalStyle) {
      case 'collectivist':
        return cn(baseStyles, 
          sender === 'user' 
            ? "bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 ml-auto mr-4 shadow-gentle" 
            : "bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200 mr-auto ml-4 shadow-gentle"
        );
      case 'high-context':
        return cn(baseStyles, 
          sender === 'user' 
            ? "bg-gradient-to-r from-slate-50 to-gray-50 border border-slate-200 ml-auto mr-8 shadow-elegant rounded-3xl" 
            : "bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 mr-auto ml-8 shadow-elegant rounded-3xl"
        );
      case 'direct':
        return cn(baseStyles, 
          sender === 'user' 
            ? "bg-white border-2 border-primary ml-auto rounded-lg shadow-sm" 
            : "bg-muted border border-border mr-auto rounded-lg shadow-sm"
        );
      default: // individualist
        return cn(baseStyles, 
          sender === 'user' 
            ? "bg-primary text-primary-foreground ml-auto shadow-gentle" 
            : "bg-card border border-border mr-auto shadow-gentle"
        );
    }
  };

  const getCulturalInputStyle = () => {
    switch (culturalStyle) {
      case 'collectivist':
        return "border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 focus:border-amber-400 rounded-2xl";
      case 'high-context':
        return "border-2 border-slate-200 bg-gradient-to-r from-slate-50 to-gray-50 focus:border-slate-400 rounded-3xl";
      case 'direct':
        return "border-2 border-primary bg-white focus:border-primary rounded-lg";
      default:
        return "border-2 border-border bg-background focus:border-primary rounded-2xl";
    }
  };

  const sendMessage = () => {
    if (!inputValue.trim()) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newMessage]);
    setInputValue('');
    
    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: "I understand. Thank you for sharing that with me. Let me think about how I can best support you in a way that feels right for your cultural perspective.",
        sender: 'ai',
        culturalContext: 'empathetic-response',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1500);
  };

  const getCulturalContextBadge = (context?: string) => {
    if (!context) return null;
    
    const contextColors = {
      'greeting-adaptive': 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800',
      'empathetic-response': 'bg-gradient-to-r from-teal-100 to-cyan-100 text-teal-800',
      'cultural-understanding': 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800'
    };
    
    return (
      <Badge className={cn("text-xs mb-2", contextColors[context as keyof typeof contextColors])}>
        {context.replace('-', ' ')}
      </Badge>
    );
  };

  return (
    <Card className={cn("h-[600px] flex flex-col bg-gradient-to-br from-background to-muted/30", className)}>
      {/* Header */}
      <div className="p-4 border-b border-border bg-gradient-to-r from-primary/5 to-accent/5 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Cultural Companion</h3>
              <p className="text-sm text-muted-foreground">
                {culturalStyle === 'collectivist' && "Community-centered conversation"}
                {culturalStyle === 'individualist' && "Personal wellness focus"}
                {culturalStyle === 'high-context' && "Contextual understanding"}
                {culturalStyle === 'direct' && "Clear, direct communication"}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              <Languages className="w-3 h-3 mr-1" />
              {culturalStyle}
            </Badge>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((message) => (
          <div key={message.id} className="w-full">
            {message.sender === 'ai' && getCulturalContextBadge(message.culturalContext)}
            <div className={getCulturalBubbleStyle(message.sender)}>
              <p className="text-sm leading-relaxed">{message.content}</p>
              <span className="text-xs opacity-60 mt-2 block">
                {message.timestamp.toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Cultural Input Area */}
      <div className="p-4 border-t border-border bg-gradient-to-r from-background to-muted/20">
        {/* Cultural Expression Options */}
        <div className="flex gap-2 mb-3 overflow-x-auto">
          <Button variant="outline" size="sm" className="text-xs whitespace-nowrap">
            <Users className="w-3 h-3 mr-1" />
            Family Context
          </Button>
          <Button variant="outline" size="sm" className="text-xs whitespace-nowrap">
            <Heart className="w-3 h-3 mr-1" />
            Emotional Metaphor
          </Button>
          <Button variant="outline" size="sm" className="text-xs whitespace-nowrap">
            <MessageCircle className="w-3 h-3 mr-1" />
            Cultural Expression
          </Button>
        </div>
        
        {/* Input Area */}
        <div className="flex gap-2">
          <Textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={
              culturalStyle === 'collectivist' 
                ? "Share how you and your family are feeling..."
                : culturalStyle === 'high-context'
                ? "Express what's in your heart..."
                : culturalStyle === 'direct'
                ? "What's your specific concern?"
                : "How are you feeling today?"
            }
            className={cn("resize-none min-h-[60px]", getCulturalInputStyle())}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
          />
          <div className="flex flex-col gap-2">
            <Button
              variant={isVoiceMode ? "default" : "outline"}
              size="icon"
              onClick={() => setIsVoiceMode(!isVoiceMode)}
              className="transition-all duration-200"
            >
              <Mic className={cn("w-4 h-4", isVoiceMode && "text-red-500")} />
            </Button>
            <Button 
              onClick={sendMessage}
              size="icon"
              disabled={!inputValue.trim()}
              className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* Cultural Comfort Indicator */}
        <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
          <span>Cultural adaptation: Active</span>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span>Culturally comfortable</span>
          </div>
        </div>
      </div>
    </Card>
  );
}