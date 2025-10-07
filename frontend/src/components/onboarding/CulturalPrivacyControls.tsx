import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Shield, Lock, Users, Eye, Globe } from 'lucide-react';

interface CulturalPrivacyControlsProps {
  onNext: (data: any) => void;
  onBack: () => void;
}

export const CulturalPrivacyControls: React.FC<CulturalPrivacyControlsProps> = ({ onNext, onBack }) => {
  const [formData, setFormData] = useState({
    shareWithResearchers: false,
    shareWithCommunity: false,
    shareWithProviders: false,
    culturalDataLevel: 'basic',
    anonymousContribution: true,
    communityFeedback: false,
    elderReview: false
  });

  const handleNext = () => {
    onNext(formData);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <div className="space-y-4">
        <Progress value={(6 / 7) * 100} className="w-full" />
        <div className="text-center text-sm text-muted-foreground">
          Step 6 of 7: Cultural Privacy & Data Sovereignty
        </div>
      </div>

      <Card className="border-2 border-primary/20">
        <CardHeader className="pb-6">
          <CardTitle className="text-center text-primary flex items-center justify-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Your Cultural Story, Your Control</span>
          </CardTitle>
          <p className="text-center text-muted-foreground">
            You have complete control over how your cultural information is used. Choose what feels right for you.
          </p>
        </CardHeader>
        <CardContent className="space-y-8">
          
          {/* Data Sharing Preferences */}
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Globe className="h-5 w-5 text-primary" />
                <Label className="text-lg font-semibold">Data Sharing Preferences</Label>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-4 p-4 border rounded-lg">
                  <Switch
                    checked={formData.shareWithResearchers}
                    onCheckedChange={(checked) => setFormData({ ...formData, shareWithResearchers: checked })}
                  />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">Support Academic Research</p>
                    <p className="text-sm text-muted-foreground">
                      Help improve cultural mental health understanding through anonymous research contribution. Your data helps develop better support for your cultural community.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 border rounded-lg">
                  <Switch
                    checked={formData.shareWithCommunity}
                    onCheckedChange={(checked) => setFormData({ ...formData, shareWithCommunity: checked })}
                  />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">Anonymous Community Insights</p>
                    <p className="text-sm text-muted-foreground">
                      Your anonymized wellness patterns help create better support resources for others from similar cultural backgrounds.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 border rounded-lg">
                  <Switch
                    checked={formData.shareWithProviders}
                    onCheckedChange={(checked) => setFormData({ ...formData, shareWithProviders: checked })}
                  />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">Healthcare Provider Cultural Training</p>
                    <p className="text-sm text-muted-foreground">
                      Help train healthcare providers to better understand and support people from your cultural background (fully anonymized).
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Cultural Data Granularity */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Eye className="h-5 w-5 text-primary" />
                <Label className="text-lg font-semibold">Cultural Information Sharing Level</Label>
              </div>
              
              <div className="space-y-3">
                {[
                  { 
                    id: 'minimal', 
                    label: 'Minimal', 
                    desc: 'Share only basic demographic information (age range, general region)' 
                  },
                  { 
                    id: 'basic', 
                    label: 'Basic', 
                    desc: 'Include general cultural background and communication preferences' 
                  },
                  { 
                    id: 'detailed', 
                    label: 'Detailed', 
                    desc: 'Share cultural practices, family structure, and wellness approaches to help research' 
                  }
                ].map((level) => (
                  <Card 
                    key={level.id} 
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      formData.culturalDataLevel === level.id ? 'ring-2 ring-primary bg-primary/5' : ''
                    }`}
                    onClick={() => setFormData({ ...formData, culturalDataLevel: level.id })}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          formData.culturalDataLevel === level.id 
                            ? 'border-primary bg-primary' 
                            : 'border-muted'
                        }`} />
                        <div>
                          <h3 className="font-medium text-foreground">{level.label}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{level.desc}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Community Involvement */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-primary" />
                <Label className="text-lg font-semibold">Cultural Community Involvement</Label>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-start space-x-3 p-3 border rounded-lg">
                  <Checkbox
                    checked={formData.communityFeedback}
                    onCheckedChange={(checked) => setFormData({ ...formData, communityFeedback: !!checked })}
                  />
                  <div>
                    <p className="font-medium text-foreground">Community Representation Feedback</p>
                    <p className="text-sm text-muted-foreground">
                      Help us improve how your culture is represented in SunPath AI by providing feedback when something doesn't feel right.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 border rounded-lg">
                  <Checkbox
                    checked={formData.elderReview}
                    onCheckedChange={(checked) => setFormData({ ...formData, elderReview: !!checked })}
                  />
                  <div>
                    <p className="font-medium text-foreground">Cultural Elder/Leader Review</p>
                    <p className="text-sm text-muted-foreground">
                      Invite respected community members to review how their culture is represented and suggest improvements.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Privacy Guarantee */}
          <div className="bg-primary/5 rounded-lg p-6 space-y-3">
            <div className="flex items-center space-x-2 text-primary">
              <Lock className="h-5 w-5" />
              <h3 className="font-semibold">Our Privacy Promise</h3>
            </div>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Your personal identity is never shared or sold</li>
              <li>• All cultural data contributions are completely anonymous</li>
              <li>• You can withdraw your data from research at any time</li>
              <li>• Cultural communities maintain sovereignty over their collective data</li>
              <li>• Research benefits flow back to participating communities</li>
            </ul>
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
              Continue
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};