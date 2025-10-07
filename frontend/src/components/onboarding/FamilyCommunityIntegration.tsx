import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Heart, Users, Building, Globe2, UserPlus } from 'lucide-react';

interface FamilyCommunityIntegrationProps {
  onNext: (data: any) => void;
  onBack: () => void;
}

export const FamilyCommunityIntegration: React.FC<FamilyCommunityIntegrationProps> = ({ onNext, onBack }) => {
  const [formData, setFormData] = useState({
    familyInvolvement: 'individual',
    emergencyContacts: [],
    communityConnections: false,
    culturalMentorship: false,
    crossCulturalLearning: false,
    familyWellnessSharing: false,
    communityEvents: false,
    culturalCelebrations: [],
    supportNetworkPreferences: {
      family: false,
      religiousLeaders: false,
      culturalElders: false,
      communityGroups: false,
      healthcareProviders: false
    }
  });

  const handleNext = () => {
    onNext(formData);
  };

  const renderFamilyInvolvementOptions = () => (
    <div className="space-y-3">
      {[
        { 
          id: 'individual', 
          icon: '👤',
          label: 'Individual Focus', 
          desc: 'Personal wellness journey with family context awareness' 
        },
        { 
          id: 'family-informed', 
          icon: '👨‍👩‍👧‍👦',
          label: 'Family-Informed', 
          desc: 'Include family perspectives in wellness planning' 
        },
        { 
          id: 'family-collaborative', 
          icon: '🤝',
          label: 'Family-Collaborative', 
          desc: 'Active family participation in wellness activities' 
        },
        { 
          id: 'multigenerational', 
          icon: '👵👨👶',
          label: 'Multi-Generational', 
          desc: 'Honor different generational approaches to wellness' 
        }
      ].map((option) => (
        <Card 
          key={option.id} 
          className={`cursor-pointer transition-all hover:shadow-md ${
            formData.familyInvolvement === option.id ? 'ring-2 ring-primary bg-primary/5' : ''
          }`}
          onClick={() => setFormData({ ...formData, familyInvolvement: option.id })}
        >
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="text-2xl">{option.icon}</div>
              <div className="flex-1">
                <h3 className="font-medium text-foreground">{option.label}</h3>
                <p className="text-sm text-muted-foreground mt-1">{option.desc}</p>
              </div>
              <div className={`w-4 h-4 rounded-full border-2 ${
                formData.familyInvolvement === option.id 
                  ? 'border-primary bg-primary' 
                  : 'border-muted'
              }`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderSupportNetworkPreferences = () => (
    <div className="space-y-3">
      {[
        { id: 'family', label: 'Family Members', icon: '👨‍👩‍👧‍👦', desc: 'Immediate and extended family' },
        { id: 'religiousLeaders', label: 'Religious/Spiritual Leaders', icon: '🕌', desc: 'Faith community leaders' },
        { id: 'culturalElders', label: 'Cultural Elders', icon: '👴', desc: 'Respected community elders' },
        { id: 'communityGroups', label: 'Community Groups', icon: '👥', desc: 'Cultural community organizations' },
        { id: 'healthcareProviders', label: 'Healthcare Providers', icon: '👩‍⚕️', desc: 'Professional medical support' }
      ].map((network) => (
        <div key={network.id} className="flex items-start space-x-3 p-3 border rounded-lg">
          <Checkbox
            checked={formData.supportNetworkPreferences[network.id]}
            onCheckedChange={(checked) => 
              setFormData({ 
                ...formData, 
                supportNetworkPreferences: { 
                  ...formData.supportNetworkPreferences, 
                  [network.id]: checked 
                } 
              })
            }
          />
          <div className="text-lg">{network.icon}</div>
          <div className="flex-1">
            <p className="font-medium text-foreground">{network.label}</p>
            <p className="text-sm text-muted-foreground">{network.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <div className="space-y-4">
        <Progress value={(7 / 7) * 100} className="w-full" />
        <div className="text-center text-sm text-muted-foreground">
          Step 7 of 7: Family & Community Integration
        </div>
      </div>

      <Card className="border-2 border-primary/20">
        <CardHeader className="pb-6">
          <CardTitle className="text-center text-primary flex items-center justify-center space-x-2">
            <Heart className="h-5 w-5" />
            <span>Your Support Circle</span>
          </CardTitle>
          <p className="text-center text-muted-foreground">
            Help us understand how your family and community can be part of your wellness journey in ways that feel right to you.
          </p>
        </CardHeader>
        <CardContent className="space-y-8">
          
          {/* Family Involvement Level */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-primary" />
              <Label className="text-lg font-semibold">Family Involvement Preferences</Label>
            </div>
            <p className="text-sm text-muted-foreground">
              Different cultures have different approaches to family in wellness. What feels right for you?
            </p>
            {renderFamilyInvolvementOptions()}
          </div>

          {/* Support Network Preferences */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Building className="h-5 w-5 text-primary" />
              <Label className="text-lg font-semibold">Preferred Support Network</Label>
            </div>
            <p className="text-sm text-muted-foreground">
              Who would you feel comfortable having as part of your wellness support system?
            </p>
            {renderSupportNetworkPreferences()}
          </div>

          {/* Community Connections */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Globe2 className="h-5 w-5 text-primary" />
              <Label className="text-lg font-semibold">Community Connections</Label>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-4 p-4 border rounded-lg">
                <Switch
                  checked={formData.communityConnections}
                  onCheckedChange={(checked) => setFormData({ ...formData, communityConnections: checked })}
                />
                <div className="flex-1">
                  <p className="font-medium text-foreground">Connect with Cultural Community</p>
                  <p className="text-sm text-muted-foreground">
                    Find and connect with others from similar cultural backgrounds who share wellness goals.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 border rounded-lg">
                <Switch
                  checked={formData.culturalMentorship}
                  onCheckedChange={(checked) => setFormData({ ...formData, culturalMentorship: checked })}
                />
                <div className="flex-1">
                  <p className="font-medium text-foreground">Cultural Wellness Mentorship</p>
                  <p className="text-sm text-muted-foreground">
                    Connect with culturally-aware wellness mentors or become a mentor for others.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 border rounded-lg">
                <Switch
                  checked={formData.crossCulturalLearning}
                  onCheckedChange={(checked) => setFormData({ ...formData, crossCulturalLearning: checked })}
                />
                <div className="flex-1">
                  <p className="font-medium text-foreground">Cross-Cultural Wellness Learning</p>
                  <p className="text-sm text-muted-foreground">
                    Learn about wellness practices from other cultures that might resonate with you.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 border rounded-lg">
                <Switch
                  checked={formData.communityEvents}
                  onCheckedChange={(checked) => setFormData({ ...formData, communityEvents: checked })}
                />
                <div className="flex-1">
                  <p className="font-medium text-foreground">Cultural Community Events</p>
                  <p className="text-sm text-muted-foreground">
                    Get notified about cultural wellness events, celebrations, and community gatherings.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Family Wellness Sharing */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <UserPlus className="h-5 w-5 text-primary" />
              <Label className="text-lg font-semibold">Family Wellness Sharing</Label>
            </div>
            
            <div className="flex items-start space-x-4 p-4 border rounded-lg">
              <Switch
                checked={formData.familyWellnessSharing}
                onCheckedChange={(checked) => setFormData({ ...formData, familyWellnessSharing: checked })}
              />
              <div className="flex-1">
                <p className="font-medium text-foreground">Share Wellness Insights with Family</p>
                <p className="text-sm text-muted-foreground">
                  When appropriate, share general wellness insights and suggestions with family members who can support your journey.
                </p>
              </div>
            </div>
          </div>

          {/* Cultural Celebrations */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Cultural Celebrations & Events</Label>
            <Textarea
              placeholder="Share any cultural holidays, celebrations, or significant dates that are important to your wellness and mental health (e.g., Ramadan, Día de los Muertos, Chinese New Year, Diwali, etc.)..."
              value={formData.culturalCelebrations.join('\n')}
              onChange={(e) => setFormData({ ...formData, culturalCelebrations: e.target.value.split('\n').filter(Boolean) })}
              className="min-h-[100px] resize-none"
            />
            <p className="text-sm text-muted-foreground">
              This helps us understand how cultural events might affect your wellness patterns and provide appropriate support.
            </p>
          </div>

          <div className="flex justify-between pt-6">
            <Button 
              variant="outline" 
              onClick={onBack}
              className="px-8"
            >
              Previous
            </Button>
            <Button 
              onClick={handleNext}
              className="px-8"
            >
              Complete Setup
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};