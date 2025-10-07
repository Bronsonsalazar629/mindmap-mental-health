import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Heart, Users, Globe, Compass } from 'lucide-react';

interface CulturalWelcomeJourneyProps {
  onNext: (data: any) => void;
  onBack?: () => void;
}

export const CulturalWelcomeJourney: React.FC<CulturalWelcomeJourneyProps> = ({ onNext, onBack }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    culturalBackground: '',
    communicationStyle: '',
    familyOrientation: '',
    spiritualPractices: ''
  });

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      onNext(formData);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else if (onBack) {
      onBack();
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <Heart className="mx-auto h-16 w-16 text-primary" />
              <h2 className="text-2xl font-semibold text-foreground">Welcome to Your Wellness Journey</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                We're honored you're here. Let's take a moment to understand your unique cultural story so we can support you in the most meaningful way.
              </p>
            </div>
            
            <div className="space-y-4">
              <Label htmlFor="cultural-background" className="text-base font-medium">
                Tell us about your cultural background (optional)
              </Label>
              <Textarea
                id="cultural-background"
                placeholder="Share as much or as little as you'd like about your cultural heritage, traditions, or background that feel important to your wellness journey..."
                value={formData.culturalBackground}
                onChange={(e) => setFormData({ ...formData, culturalBackground: e.target.value })}
                className="min-h-[120px] resize-none"
              />
              <p className="text-sm text-muted-foreground">
                This helps us understand how to best support you - there are no right or wrong answers.
              </p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <Users className="mx-auto h-16 w-16 text-primary" />
              <h2 className="text-2xl font-semibold text-foreground">How You Like to Communicate</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Everyone has different ways of expressing feelings and seeking support. What feels most natural to you?
              </p>
            </div>
            
            <div className="space-y-4">
              <Label className="text-base font-medium">Communication Style Preferences</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { id: 'direct', label: 'Direct & Clear', desc: 'I prefer straightforward communication' },
                  { id: 'gentle', label: 'Gentle & Thoughtful', desc: 'I like softer, more considerate approaches' },
                  { id: 'metaphorical', label: 'Stories & Metaphors', desc: 'I connect through stories and imagery' },
                  { id: 'collaborative', label: 'Collaborative Discussion', desc: 'I like exploring ideas together' }
                ].map((style) => (
                  <Card 
                    key={style.id} 
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      formData.communicationStyle === style.id ? 'ring-2 ring-primary bg-primary/5' : ''
                    }`}
                    onClick={() => setFormData({ ...formData, communicationStyle: style.id })}
                  >
                    <CardContent className="p-4">
                      <h3 className="font-medium text-foreground">{style.label}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{style.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <Globe className="mx-auto h-16 w-16 text-primary" />
              <h2 className="text-2xl font-semibold text-foreground">Your Support Circle</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Different cultures have different approaches to family and community in wellness. What feels right for you?
              </p>
            </div>
            
            <div className="space-y-4">
              <Label className="text-base font-medium">Family & Community Involvement</Label>
              <div className="space-y-3">
                {[
                  { id: 'individual', label: 'Personal Journey', desc: 'I prefer to focus on my individual wellness' },
                  { id: 'family-aware', label: 'Family-Aware', desc: 'Consider my family context but keep focus on me' },
                  { id: 'family-inclusive', label: 'Family-Inclusive', desc: 'My wellness is connected to my family\'s wellness' },
                  { id: 'community-connected', label: 'Community-Connected', desc: 'I find strength in my cultural community' }
                ].map((option) => (
                  <Card 
                    key={option.id} 
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      formData.familyOrientation === option.id ? 'ring-2 ring-primary bg-primary/5' : ''
                    }`}
                    onClick={() => setFormData({ ...formData, familyOrientation: option.id })}
                  >
                    <CardContent className="p-4">
                      <h3 className="font-medium text-foreground">{option.label}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{option.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <Compass className="mx-auto h-16 w-16 text-primary" />
              <h2 className="text-2xl font-semibold text-foreground">Spiritual & Traditional Practices</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Many find strength in spiritual practices or traditional ways of healing. We'd love to honor these in your journey.
              </p>
            </div>
            
            <div className="space-y-4">
              <Label htmlFor="spiritual-practices" className="text-base font-medium">
                Spiritual or Traditional Practices (optional)
              </Label>
              <Textarea
                id="spiritual-practices"
                placeholder="Share any spiritual practices, traditional healing methods, or cultural rituals that are important to your wellness..."
                value={formData.spiritualPractices}
                onChange={(e) => setFormData({ ...formData, spiritualPractices: e.target.value })}
                className="min-h-[120px] resize-none"
              />
              <p className="text-sm text-muted-foreground">
                This helps us suggest approaches that align with your values and beliefs.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <div className="space-y-4">
        <Progress value={(step / 4) * 100} className="w-full" />
        <div className="text-center text-sm text-muted-foreground">
          Step {step} of 4: Cultural Welcome Journey
        </div>
      </div>

      <Card className="border-2 border-primary/20">
        <CardHeader className="pb-6">
          <CardTitle className="text-center text-primary">Understanding Your Cultural Story</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {renderStep()}
          
          <div className="flex justify-between pt-6">
            <Button 
              variant="outline" 
              onClick={handleBack}
              className="px-8"
            >
              {step === 1 ? 'Back' : 'Previous'}
            </Button>
            <Button 
              onClick={handleNext}
              className="px-8"
            >
              {step === 4 ? 'Continue' : 'Next'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};