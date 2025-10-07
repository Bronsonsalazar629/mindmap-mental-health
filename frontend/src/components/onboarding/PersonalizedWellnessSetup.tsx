import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Sparkles, Target, Calendar, MessageCircle } from 'lucide-react';

interface PersonalizedWellnessSetupProps {
  onNext: (data: any) => void;
  onBack: () => void;
}

export const PersonalizedWellnessSetup: React.FC<PersonalizedWellnessSetupProps> = ({ onNext, onBack }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    wellnessApproach: [],
    culturalCelebrations: false,
    crisisPreferences: {
      contactFamily: false,
      contactCommunity: false,
      traditionalHealing: false,
      professionalOnly: false
    },
    communicationLanguage: 'english',
    emotionalExpression: []
  });

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      onNext(formData);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      onBack();
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <Target className="mx-auto h-16 w-16 text-primary" />
              <h2 className="text-2xl font-semibold text-foreground">Your Wellness Approach</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Choose the approaches that resonate with your values and cultural background. You can select multiple options.
              </p>
            </div>
            
            <div className="space-y-4">
              <Label className="text-base font-medium">Preferred Wellness Approaches</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { id: 'traditional-modern', label: 'Traditional + Modern', desc: 'Blend cultural practices with modern mental health' },
                  { id: 'family-inclusive', label: 'Family-Inclusive', desc: 'Include family in wellness planning and support' },
                  { id: 'spiritual-integration', label: 'Spiritual Integration', desc: 'Honor spiritual and religious practices' },
                  { id: 'community-based', label: 'Community-Based', desc: 'Connect with others from similar backgrounds' },
                  { id: 'professional-clinical', label: 'Professional Clinical', desc: 'Focus on evidence-based clinical approaches' },
                  { id: 'holistic-lifestyle', label: 'Holistic Lifestyle', desc: 'Integrate wellness into daily cultural practices' }
                ].map((approach) => {
                  const isSelected = formData.wellnessApproach.includes(approach.id);
                  return (
                    <Card 
                      key={approach.id} 
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        isSelected ? 'ring-2 ring-primary bg-primary/5' : ''
                      }`}
                      onClick={() => {
                        const updated = isSelected
                          ? formData.wellnessApproach.filter(id => id !== approach.id)
                          : [...formData.wellnessApproach, approach.id];
                        setFormData({ ...formData, wellnessApproach: updated });
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <Checkbox checked={isSelected} className="mt-1" />
                          <div>
                            <h3 className="font-medium text-foreground">{approach.label}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{approach.desc}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <Calendar className="mx-auto h-16 w-16 text-primary" />
              <h2 className="text-2xl font-semibold text-foreground">Cultural Integration & Crisis Support</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Help us understand how to best support you during both celebration and challenging times.
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-4">
                <Label className="text-base font-medium">Cultural Celebration Integration</Label>
                <div className="flex items-center space-x-3 p-4 border rounded-lg">
                  <Switch
                    checked={formData.culturalCelebrations}
                    onCheckedChange={(checked) => setFormData({ ...formData, culturalCelebrations: checked })}
                  />
                  <div>
                    <p className="font-medium text-foreground">Include Cultural Holidays & Events</p>
                    <p className="text-sm text-muted-foreground">
                      Track how cultural celebrations and significant dates affect your wellness
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-base font-medium">Crisis Support Preferences</Label>
                <p className="text-sm text-muted-foreground">
                  In times of crisis, what approaches would feel most supportive to you?
                </p>
                <div className="space-y-3">
                  {[
                    { id: 'contactFamily', label: 'Contact my family/relatives', desc: 'Include family in crisis support when appropriate' },
                    { id: 'contactCommunity', label: 'Connect with community leaders', desc: 'Reach out to cultural or religious community' },
                    { id: 'traditionalHealing', label: 'Include traditional healing approaches', desc: 'Honor cultural healing practices alongside clinical care' },
                    { id: 'professionalOnly', label: 'Professional support only', desc: 'Focus on clinical professional support' }
                  ].map((option) => (
                    <div key={option.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                      <Checkbox
                        checked={formData.crisisPreferences[option.id]}
                        onCheckedChange={(checked) => 
                          setFormData({ 
                            ...formData, 
                            crisisPreferences: { 
                              ...formData.crisisPreferences, 
                              [option.id]: checked 
                            } 
                          })
                        }
                      />
                      <div>
                        <p className="font-medium text-foreground">{option.label}</p>
                        <p className="text-sm text-muted-foreground">{option.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <MessageCircle className="mx-auto h-16 w-16 text-primary" />
              <h2 className="text-2xl font-semibold text-foreground">Communication & Expression</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                How do you prefer to express emotions and communicate about your wellness?
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-4">
                <Label className="text-base font-medium">Primary Communication Language</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { id: 'english', label: 'English' },
                    { id: 'spanish', label: 'Español' },
                    { id: 'mandarin', label: '中文' },
                    { id: 'arabic', label: 'العربية' },
                    { id: 'hindi', label: 'हिन्दी' },
                    { id: 'other', label: 'Other' }
                  ].map((lang) => (
                    <Card 
                      key={lang.id} 
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        formData.communicationLanguage === lang.id ? 'ring-2 ring-primary bg-primary/5' : ''
                      }`}
                      onClick={() => setFormData({ ...formData, communicationLanguage: lang.id })}
                    >
                      <CardContent className="p-3 text-center">
                        <p className="font-medium text-foreground">{lang.label}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-base font-medium">Emotional Expression Preferences</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { id: 'verbal-direct', label: 'Direct verbal expression' },
                    { id: 'metaphors-stories', label: 'Metaphors and stories' },
                    { id: 'cultural-symbols', label: 'Cultural symbols and imagery' },
                    { id: 'artistic-creative', label: 'Artistic and creative expression' },
                    { id: 'music-rhythm', label: 'Music and rhythm' },
                    { id: 'movement-dance', label: 'Movement and dance' }
                  ].map((expression) => {
                    const isSelected = formData.emotionalExpression.includes(expression.id);
                    return (
                      <Card 
                        key={expression.id} 
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          isSelected ? 'ring-2 ring-primary bg-primary/5' : ''
                        }`}
                        onClick={() => {
                          const updated = isSelected
                            ? formData.emotionalExpression.filter(id => id !== expression.id)
                            : [...formData.emotionalExpression, expression.id];
                          setFormData({ ...formData, emotionalExpression: updated });
                        }}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center space-x-2">
                            <Checkbox checked={isSelected} />
                            <p className="font-medium text-foreground">{expression.label}</p>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
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
        <Progress value={((step + 4) / 7) * 100} className="w-full" />
        <div className="text-center text-sm text-muted-foreground">
          Step {step + 4} of 7: Personalized Wellness Setup
        </div>
      </div>

      <Card className="border-2 border-primary/20">
        <CardHeader className="pb-6">
          <CardTitle className="text-center text-primary flex items-center justify-center space-x-2">
            <Sparkles className="h-5 w-5" />
            <span>Creating Your Unique Wellness Profile</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {renderStep()}
          
          <div className="flex justify-between pt-6">
            <Button 
              variant="outline" 
              onClick={handleBack}
              className="px-8"
            >
              Previous
            </Button>
            <Button 
              onClick={handleNext}
              className="px-8"
            >
              {step === 3 ? 'Continue' : 'Next'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};