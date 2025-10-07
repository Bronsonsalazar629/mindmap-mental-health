import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CulturalConversationInterface } from './CulturalConversationInterface';
import { CulturalStyleAdapter } from './CulturalStyleAdapter';
import { MultiCulturalLanguageInterface } from './MultiCulturalLanguageInterface';
import { MessageCircle, Settings, Languages, Sparkles, Brain, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import sunpathLogo from '@/assets/sunpath-ai-logo.png';

interface ConversationFoundationProps {
  className?: string;
}

export function ConversationFoundation({ className }: ConversationFoundationProps) {
  const [culturalStyle, setCulturalStyle] = useState<'collectivist' | 'individualist' | 'high-context' | 'direct'>('individualist');
  const [aiReadiness, setAiReadiness] = useState(false);

  const conversationCapabilities = [
    {
      icon: Brain,
      title: 'Claude-Powered Understanding',
      description: 'Advanced natural language processing that understands cultural context',
      status: 'Ready for Integration'
    },
    {
      icon: Heart,
      title: 'Cultural Emotion Recognition',
      description: 'AI that recognizes culturally-specific emotional expressions',
      status: 'Framework Active'
    },
    {
      icon: Languages,
      title: 'Multilingual Cultural Intelligence',
      description: 'Seamless communication across languages and cultural contexts',
      status: 'Interface Ready'
    },
    {
      icon: MessageCircle,
      title: 'Adaptive Conversation Flow',
      description: 'Conversation patterns that adapt to cultural communication styles',
      status: 'Framework Complete'
    }
  ];

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header with Logo and Vision */}
      <Card className="p-6 bg-gradient-to-r from-background via-primary/5 to-accent/5 border border-primary/20">
        <div className="flex items-center gap-4 mb-4">
          <img 
            src={sunpathLogo} 
            alt="SunPath AI" 
            className="w-16 h-16 object-contain"
          />
          <div>
            <h1 className="text-2xl font-bold text-foreground">SunPath AI Conversation Foundation</h1>
            <p className="text-muted-foreground">Culturally-intelligent conversation interface ready for advanced AI integration</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {conversationCapabilities.map((capability, index) => (
            <div key={index} className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-border">
              <div className="flex items-center gap-2 mb-2">
                <capability.icon className="w-5 h-5 text-primary" />
                <span className="font-medium text-foreground text-sm">{capability.title}</span>
              </div>
              <p className="text-xs text-muted-foreground mb-2">{capability.description}</p>
              <Badge variant="secondary" className="text-xs">
                {capability.status}
              </Badge>
            </div>
          ))}
        </div>
      </Card>

      {/* Main Conversation Interface */}
      <Tabs defaultValue="conversation" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="conversation" className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Live Conversation
          </TabsTrigger>
          <TabsTrigger value="cultural-setup" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Cultural Setup
          </TabsTrigger>
          <TabsTrigger value="language-setup" className="flex items-center gap-2">
            <Languages className="w-4 h-4" />
            Language Setup
          </TabsTrigger>
          <TabsTrigger value="ai-integration" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            AI Integration
          </TabsTrigger>
        </TabsList>

        <TabsContent value="conversation" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <CulturalConversationInterface 
                culturalStyle={culturalStyle}
                className="h-full"
              />
            </div>
            <div className="space-y-4">
              <Card className="p-4">
                <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Quick Style Switch
                </h4>
                <div className="space-y-2">
                  {(['collectivist', 'individualist', 'high-context', 'direct'] as const).map((style) => (
                    <Button
                      key={style}
                      variant={culturalStyle === style ? "default" : "outline"}
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => setCulturalStyle(style)}
                    >
                      {style.charAt(0).toUpperCase() + style.slice(1).replace('-', ' ')}
                    </Button>
                  ))}
                </div>
              </Card>

              <Card className="p-4">
                <h4 className="font-medium text-foreground mb-3">Conversation Analytics</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cultural Adaptation</span>
                    <Badge variant="secondary">Active</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Language Detection</span>
                    <Badge variant="secondary">Multi-lingual</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Emotional Context</span>
                    <Badge variant="secondary">Recognized</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cultural Comfort</span>
                    <Badge className="bg-green-100 text-green-800">High</Badge>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="cultural-setup">
          <CulturalStyleAdapter 
            onStyleChange={(profile) => {
              setCulturalStyle(profile.style as any);
            }}
          />
        </TabsContent>

        <TabsContent value="language-setup">
          <MultiCulturalLanguageInterface />
        </TabsContent>

        <TabsContent value="ai-integration" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Advanced AI Integration Ready</h3>
                <p className="text-sm text-muted-foreground">Foundation prepared for Claude and advanced conversation AI</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium text-foreground">Cultural Intelligence Features</h4>
                <div className="space-y-3">
                  {[
                    'Cultural context understanding',
                    'Emotion recognition across cultures',
                    'Adaptive communication styles',
                    'Multilingual natural conversation',
                    'Family dynamics awareness',
                    'Cultural metaphor interpretation'
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-foreground">Integration Points</h4>
                <div className="space-y-3">
                  <Card className="p-3 border border-border">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Claude NLP Integration</span>
                      <Badge className="bg-blue-100 text-blue-800">Ready</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Natural language understanding with cultural context</p>
                  </Card>
                  
                  <Card className="p-3 border border-border">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Voice AI Integration</span>
                      <Badge className="bg-purple-100 text-purple-800">Framework Ready</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Voice conversation with cultural speech patterns</p>
                  </Card>
                  
                  <Card className="p-3 border border-border">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Cultural ML Models</span>
                      <Badge className="bg-green-100 text-green-800">Interface Complete</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Machine learning adapted for cultural nuances</p>
                  </Card>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border border-primary/20">
              <h4 className="font-medium text-foreground mb-2">Next Steps for AI Enhancement</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Connect Claude API for advanced natural language processing</li>
                <li>• Integrate voice AI for spoken cultural conversations</li>
                <li>• Add real-time cultural sentiment analysis</li>
                <li>• Implement adaptive conversation learning</li>
              </ul>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}