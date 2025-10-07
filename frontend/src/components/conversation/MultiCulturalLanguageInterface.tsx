import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Languages, 
  Globe, 
  Heart, 
  MessageCircle, 
  Mic,
  Volume2,
  Shuffle,
  Users,
  BookOpen,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

interface CulturalExpression {
  id: string;
  text: string;
  language: string;
  meaning: string;
  culturalContext: string;
  emotionalWeight: 'light' | 'medium' | 'deep';
}

interface MultiCulturalLanguageInterfaceProps {
  className?: string;
}

export function MultiCulturalLanguageInterface({ className }: MultiCulturalLanguageInterfaceProps) {
  const [primaryLanguage, setPrimaryLanguage] = useState('en');
  const [familyLanguages, setFamilyLanguages] = useState<string[]>(['es']);
  const [codeSwitchingEnabled, setCodeSwitchingEnabled] = useState(true);
  const [selectedExpression, setSelectedExpression] = useState<CulturalExpression | null>(null);

  const supportedLanguages: Language[] = [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
    { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
    { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
    { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
    { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
    { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' }
  ];

  const culturalExpressions: CulturalExpression[] = [
    {
      id: '1',
      text: 'Desahogo',
      language: 'es',
      meaning: 'The relief felt after expressing deep emotions',
      culturalContext: 'Latino/Hispanic - emotional release and sharing burdens',
      emotionalWeight: 'deep'
    },
    {
      id: '2',
      text: '心情不好',
      language: 'zh',
      meaning: 'Heart feeling bad - emotional distress',
      culturalContext: 'Chinese - connecting emotions to physical sensations',
      emotionalWeight: 'medium'
    },
    {
      id: '3',
      text: 'Ubuntu',
      language: 'zu',
      meaning: 'I am because we are - interconnected humanity',
      culturalContext: 'African philosophy - collective well-being',
      emotionalWeight: 'deep'
    },
    {
      id: '4',
      text: 'Ikigai',
      language: 'ja',
      meaning: 'Life purpose - reason for being',
      culturalContext: 'Japanese - finding meaning and wellness through purpose',
      emotionalWeight: 'deep'
    },
    {
      id: '5',
      text: 'Saudade',
      language: 'pt',
      meaning: 'Deep emotional longing for someone/something absent',
      culturalContext: 'Portuguese/Brazilian - complex emotional state',
      emotionalWeight: 'deep'
    }
  ];

  const getLanguageByCode = (code: string) => 
    supportedLanguages.find(lang => lang.code === code);

  const getEmotionalWeightColor = (weight: string) => {
    switch (weight) {
      case 'light': return 'from-green-100 to-emerald-100 text-green-800';
      case 'medium': return 'from-yellow-100 to-orange-100 text-yellow-800';
      case 'deep': return 'from-purple-100 to-pink-100 text-purple-800';
      default: return 'from-gray-100 to-slate-100 text-gray-800';
    }
  };

  return (
    <Card className={cn("p-6 bg-gradient-to-br from-background to-muted/30", className)}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
          <Languages className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Multicultural Expression Interface</h3>
          <p className="text-sm text-muted-foreground">Communicate naturally in your languages and cultural expressions</p>
        </div>
      </div>

      <Tabs defaultValue="languages" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="languages">Language Setup</TabsTrigger>
          <TabsTrigger value="expressions">Cultural Expressions</TabsTrigger>
          <TabsTrigger value="codeswitching">Code Switching</TabsTrigger>
          <TabsTrigger value="family">Family Languages</TabsTrigger>
        </TabsList>

        <TabsContent value="languages" className="space-y-4">
          <div>
            <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Primary Communication Language
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {supportedLanguages.map((lang) => (
                <Button
                  key={lang.code}
                  variant={primaryLanguage === lang.code ? "default" : "outline"}
                  className="h-auto p-3 flex flex-col items-center text-center"
                  onClick={() => setPrimaryLanguage(lang.code)}
                >
                  <span className="text-2xl mb-1">{lang.flag}</span>
                  <span className="font-medium text-xs">{lang.name}</span>
                  <span className="text-xs opacity-80">{lang.nativeName}</span>
                </Button>
              ))}
            </div>
          </div>

          <div className="p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <Volume2 className="w-4 h-4 text-primary" />
              <span className="font-medium text-foreground">Voice & Audio Support</span>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Speak naturally in your preferred language. AI will understand context, tone, and cultural nuances.
            </p>
            <div className="flex gap-2">
              <Button size="sm" className="bg-gradient-to-r from-primary to-accent">
                <Mic className="w-4 h-4 mr-2" />
                Test Voice Input
              </Button>
              <Button size="sm" variant="outline">
                <Volume2 className="w-4 h-4 mr-2" />
                Audio Preferences
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="expressions" className="space-y-4">
          <div>
            <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Cultural Emotional Expressions
            </h4>
            <p className="text-sm text-muted-foreground mb-4">
              Express emotions using words and concepts from your cultural background
            </p>
            
            <div className="grid gap-3">
              {culturalExpressions.map((expression) => (
                <Card 
                  key={expression.id}
                  className={cn(
                    "p-4 border cursor-pointer transition-all duration-200 hover:shadow-gentle",
                    selectedExpression?.id === expression.id 
                      ? "border-primary bg-gradient-to-r from-primary/5 to-accent/5" 
                      : "border-border hover:border-primary/30"
                  )}
                  onClick={() => setSelectedExpression(expression)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-lg text-foreground">{expression.text}</span>
                        <Badge className={cn("text-xs", `bg-gradient-to-r ${getEmotionalWeightColor(expression.emotionalWeight)}`)}>
                          {expression.emotionalWeight}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {getLanguageByCode(expression.language)?.flag}
                        </span>
                      </div>
                      <p className="text-sm text-foreground mb-1">{expression.meaning}</p>
                      <p className="text-xs text-muted-foreground">{expression.culturalContext}</p>
                    </div>
                    <Button size="sm" variant="ghost">
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="codeswitching" className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-muted/50 to-muted/30 rounded-lg border border-border">
            <div className="flex items-center gap-3">
              <Shuffle className="w-5 h-5 text-primary" />
              <div>
                <h4 className="font-medium text-foreground">Natural Code Switching</h4>
                <p className="text-sm text-muted-foreground">Mix languages naturally as you speak</p>
              </div>
            </div>
            <Button
              variant={codeSwitchingEnabled ? "default" : "outline"}
              onClick={() => setCodeSwitchingEnabled(!codeSwitchingEnabled)}
            >
              {codeSwitchingEnabled ? 'Enabled' : 'Disabled'}
            </Button>
          </div>

          {codeSwitchingEnabled && (
            <div className="space-y-3">
              <div className="p-4 border border-border rounded-lg bg-gradient-to-r from-green-50 to-emerald-50">
                <h5 className="font-medium text-foreground mb-2">Example: Natural Language Mixing</h5>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">You:</span> "I'm feeling muy triste today, like really sad, you know?"</p>
                  <p><span className="font-medium">AI:</span> "I understand you're feeling muy triste - that deep sadness. Would you like to explore what's making you feel this way? We can talk in whichever language feels most comfortable."</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 border border-border rounded-lg">
                  <h6 className="font-medium text-foreground text-sm mb-1">Emotional Expression Mixing</h6>
                  <p className="text-xs text-muted-foreground">Switch languages for emotional emphasis</p>
                </div>
                <div className="p-3 border border-border rounded-lg">
                  <h6 className="font-medium text-foreground text-sm mb-1">Cultural Concept Switching</h6>
                  <p className="text-xs text-muted-foreground">Use native terms for cultural concepts</p>
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="family" className="space-y-4">
          <div>
            <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Family Language Context
            </h4>
            <p className="text-sm text-muted-foreground mb-4">
              Include languages spoken by your family for culturally-aware conversations
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Family Languages</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {supportedLanguages.map((lang) => (
                    <Button
                      key={lang.code}
                      variant={familyLanguages.includes(lang.code) ? "default" : "outline"}
                      size="sm"
                      className="h-auto p-2 flex items-center justify-start text-left"
                      onClick={() => {
                        if (familyLanguages.includes(lang.code)) {
                          setFamilyLanguages(prev => prev.filter(l => l !== lang.code));
                        } else {
                          setFamilyLanguages(prev => [...prev, lang.code]);
                        }
                      }}
                    >
                      <span className="mr-2">{lang.flag}</span>
                      <span className="text-xs">{lang.name}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="w-4 h-4 text-amber-600" />
                  <span className="font-medium text-amber-800">Generational Communication Bridge</span>
                </div>
                <p className="text-sm text-amber-700">
                  AI will understand when family language dynamics affect your emotional expression and provide culturally-appropriate guidance for intergenerational communication.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Active Configuration Summary */}
      <div className="mt-6 p-4 bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg border border-primary/20">
        <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          Active Language Configuration
        </h4>
        <div className="flex flex-wrap gap-2">
          <Badge className="bg-gradient-to-r from-primary to-accent text-white">
            Primary: {getLanguageByCode(primaryLanguage)?.name}
          </Badge>
          {familyLanguages.map(langCode => (
            <Badge key={langCode} variant="secondary">
              Family: {getLanguageByCode(langCode)?.name}
            </Badge>
          ))}
          {codeSwitchingEnabled && (
            <Badge variant="outline" className="border-green-500 text-green-700">
              Code-switching enabled
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );
}