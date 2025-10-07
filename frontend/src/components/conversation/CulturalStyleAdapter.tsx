import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  Globe, 
  Users, 
  MessageSquare, 
  Crown, 
  Handshake,
  TreePine,
  Waves,
  Sun,
  Mountain
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CulturalProfile {
  style: string;
  formality: 'high' | 'medium' | 'low';
  contextLevel: 'high' | 'medium' | 'low';
  familyInvolvement: 'encouraged' | 'optional' | 'individual';
  communicationPattern: 'indirect' | 'mixed' | 'direct';
  metaphorPreference: string;
}

interface CulturalStyleAdapterProps {
  onStyleChange?: (profile: CulturalProfile) => void;
  className?: string;
}

export function CulturalStyleAdapter({ onStyleChange, className }: CulturalStyleAdapterProps) {
  const [selectedProfile, setSelectedProfile] = useState<CulturalProfile>({
    style: 'individualist',
    formality: 'medium',
    contextLevel: 'medium',
    familyInvolvement: 'optional',
    communicationPattern: 'mixed',
    metaphorPreference: 'nature'
  });

  const culturalProfiles = [
    {
      id: 'collectivist',
      name: 'Community-Centered',
      icon: Users,
      description: 'Family and community well-being focused',
      colors: 'from-amber-500 to-orange-500',
      bgColors: 'from-amber-50 to-orange-50',
      borderColors: 'border-amber-200',
      characteristics: ['Family involvement encouraged', 'Group harmony priority', 'Collective decision making']
    },
    {
      id: 'individualist',
      name: 'Personal-Focused',
      icon: MessageSquare,
      description: 'Individual autonomy and self-expression',
      colors: 'from-blue-500 to-indigo-500',
      bgColors: 'from-blue-50 to-indigo-50',
      borderColors: 'border-blue-200',
      characteristics: ['Personal choice emphasis', 'Individual responsibility', 'Self-directed goals']
    },
    {
      id: 'high-context',
      name: 'Context-Rich',
      icon: Waves,
      description: 'Meaning through context and relationships',
      colors: 'from-teal-500 to-cyan-500',
      bgColors: 'from-teal-50 to-cyan-50',
      borderColors: 'border-teal-200',
      characteristics: ['Implicit communication', 'Relationship context', 'Environmental awareness']
    },
    {
      id: 'hierarchical',
      name: 'Respectful Structure',
      icon: Crown,
      description: 'Respect for authority and experience',
      colors: 'from-purple-500 to-pink-500',
      bgColors: 'from-purple-50 to-pink-50',
      borderColors: 'border-purple-200',
      characteristics: ['Elder wisdom valued', 'Formal communication', 'Structured interactions']
    }
  ];

  const metaphorStyles = [
    { id: 'nature', name: 'Nature & Seasons', icon: TreePine, description: 'Growth, cycles, natural healing' },
    { id: 'water', name: 'Water & Flow', icon: Waves, description: 'Fluidity, adaptation, cleansing' },
    { id: 'light', name: 'Light & Sun', icon: Sun, description: 'Illumination, warmth, energy' },
    { id: 'mountain', name: 'Mountain & Journey', icon: Mountain, description: 'Strength, paths, elevation' }
  ];

  const handleProfileUpdate = (updates: Partial<CulturalProfile>) => {
    const newProfile = { ...selectedProfile, ...updates };
    setSelectedProfile(newProfile);
    onStyleChange?.(newProfile);
  };

  return (
    <Card className={cn("p-6 bg-gradient-to-br from-background to-muted/30", className)}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center">
          <Settings className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Cultural Communication Preferences</h3>
          <p className="text-sm text-muted-foreground">Customize how AI understands and responds to your cultural style</p>
        </div>
      </div>

      <Tabs defaultValue="style" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="style">Communication Style</TabsTrigger>
          <TabsTrigger value="formality">Formality Level</TabsTrigger>
          <TabsTrigger value="metaphors">Expression Style</TabsTrigger>
          <TabsTrigger value="family">Family Context</TabsTrigger>
        </TabsList>

        <TabsContent value="style" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {culturalProfiles.map((profile) => (
              <Card 
                key={profile.id}
                className={cn(
                  "p-4 border-2 cursor-pointer transition-all duration-200 hover:shadow-gentle",
                  selectedProfile.style === profile.id 
                    ? `bg-gradient-to-r ${profile.bgColors} ${profile.borderColors} shadow-gentle` 
                    : "border-border hover:border-primary/30"
                )}
                onClick={() => handleProfileUpdate({ style: profile.id })}
              >
                <div className="flex items-start gap-3">
                  <div className={cn("w-10 h-10 rounded-full bg-gradient-to-r flex items-center justify-center", profile.colors)}>
                    <profile.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">{profile.name}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{profile.description}</p>
                    <div className="space-y-1">
                      {profile.characteristics.map((char, index) => (
                        <Badge key={index} variant="secondary" className="text-xs mr-1">
                          {char}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="formality" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { id: 'high', name: 'Formal', desc: 'Professional, respectful address' },
              { id: 'medium', name: 'Balanced', desc: 'Warm but respectful tone' },
              { id: 'low', name: 'Casual', desc: 'Friendly, informal interaction' }
            ].map((level) => (
              <Button
                key={level.id}
                variant={selectedProfile.formality === level.id ? "default" : "outline"}
                className="h-auto p-4 flex flex-col items-center text-center"
                onClick={() => handleProfileUpdate({ formality: level.id as any })}
              >
                <Crown className="w-6 h-6 mb-2" />
                <span className="font-medium">{level.name}</span>
                <span className="text-xs opacity-80">{level.desc}</span>
              </Button>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="metaphors" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {metaphorStyles.map((style) => (
              <Card 
                key={style.id}
                className={cn(
                  "p-4 border-2 cursor-pointer transition-all duration-200 hover:shadow-gentle",
                  selectedProfile.metaphorPreference === style.id 
                    ? "bg-gradient-to-r from-primary/10 to-accent/10 border-primary shadow-gentle" 
                    : "border-border hover:border-primary/30"
                )}
                onClick={() => handleProfileUpdate({ metaphorPreference: style.id })}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center">
                    <style.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">{style.name}</h4>
                    <p className="text-sm text-muted-foreground">{style.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="family" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { 
                id: 'encouraged', 
                name: 'Family-Inclusive', 
                desc: 'Include family in wellness journey',
                icon: Users 
              },
              { 
                id: 'optional', 
                name: 'Flexible', 
                desc: 'Sometimes include family context',
                icon: Handshake 
              },
              { 
                id: 'individual', 
                name: 'Personal', 
                desc: 'Focus on individual experience',
                icon: MessageSquare 
              }
            ].map((option) => (
              <Button
                key={option.id}
                variant={selectedProfile.familyInvolvement === option.id ? "default" : "outline"}
                className="h-auto p-4 flex flex-col items-center text-center"
                onClick={() => handleProfileUpdate({ familyInvolvement: option.id as any })}
              >
                <option.icon className="w-6 h-6 mb-2" />
                <span className="font-medium">{option.name}</span>
                <span className="text-xs opacity-80">{option.desc}</span>
              </Button>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Current Profile Summary */}
      <div className="mt-6 p-4 bg-gradient-to-r from-muted/50 to-muted/30 rounded-lg border border-border">
        <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
          <Globe className="w-4 h-4" />
          Your Cultural Communication Profile
        </h4>
        <div className="flex flex-wrap gap-2">
          <Badge className="bg-gradient-to-r from-primary to-accent text-white">
            {selectedProfile.style.replace('-', ' ')}
          </Badge>
          <Badge variant="secondary">{selectedProfile.formality} formality</Badge>
          <Badge variant="secondary">{selectedProfile.familyInvolvement} family</Badge>
          <Badge variant="secondary">{selectedProfile.metaphorPreference} metaphors</Badge>
        </div>
      </div>
    </Card>
  );
}