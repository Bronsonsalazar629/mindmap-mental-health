import React, { useState } from 'react';
import { CulturalWelcomeJourney } from './CulturalWelcomeJourney';
import { PersonalizedWellnessSetup } from './PersonalizedWellnessSetup';
import { CulturalPrivacyControls } from './CulturalPrivacyControls';
import { FamilyCommunityIntegration } from './FamilyCommunityIntegration';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const OnboardingFlow: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState({});
  const navigate = useNavigate();

  const steps = [
    'Cultural Welcome Journey',
    'Personalized Wellness Setup', 
    'Cultural Privacy Controls',
    'Family & Community Integration',
    'Complete'
  ];

  const handleStepComplete = (stepData: any) => {
    const updatedData = { ...onboardingData, ...stepData };
    setOnboardingData(updatedData);
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    // Here you would typically save the onboarding data to your backend
    console.log('Onboarding completed with data:', onboardingData);
    navigate('/');
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <CulturalWelcomeJourney 
            onNext={handleStepComplete}
          />
        );
      case 1:
        return (
          <PersonalizedWellnessSetup 
            onNext={handleStepComplete}
            onBack={handleBack}
          />
        );
      case 2:
        return (
          <CulturalPrivacyControls 
            onNext={handleStepComplete}
            onBack={handleBack}
          />
        );
      case 3:
        return (
          <FamilyCommunityIntegration 
            onNext={handleStepComplete}
            onBack={handleBack}
          />
        );
      case 4:
        return (
          <div className="max-w-2xl mx-auto p-6">
            <Card className="border-2 border-primary/20">
              <CardContent className="p-8 text-center space-y-6">
                <div className="space-y-4">
                  <CheckCircle className="mx-auto h-24 w-24 text-primary" />
                  <h1 className="text-3xl font-bold text-foreground">Welcome to SunPath AI!</h1>
                  <p className="text-lg text-muted-foreground max-w-md mx-auto">
                    Your culturally-aware wellness journey is ready to begin. We're honored to be part of your path to wellness.
                  </p>
                </div>
                
                <div className="bg-primary/5 rounded-lg p-6 space-y-3">
                  <div className="flex items-center justify-center space-x-2 text-primary">
                    <Sparkles className="h-5 w-5" />
                    <h3 className="font-semibold">Your Cultural Profile is Complete</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    SunPath AI will now provide personalized wellness support that honors your cultural background, 
                    communication style, and family preferences. You can update these settings anytime.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <Button 
                    onClick={handleComplete}
                    size="lg" 
                    className="w-full"
                  >
                    Begin Your Wellness Journey
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    You can always update your cultural preferences in your settings.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto py-8">
        {/* Progress indicator */}
        {currentStep < steps.length - 1 && (
          <div className="max-w-4xl mx-auto mb-8">
            <div className="flex justify-center space-x-2 md:space-x-4">
              {steps.slice(0, -1).map((step, index) => (
                <div 
                  key={step} 
                  className={`flex items-center space-x-2 ${
                    index < currentStep ? 'text-primary' : 
                    index === currentStep ? 'text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                    index < currentStep ? 'bg-primary border-primary text-primary-foreground' :
                    index === currentStep ? 'border-primary text-primary bg-primary/10' : 'border-muted'
                  }`}>
                    {index < currentStep ? <CheckCircle className="h-4 w-4" /> : index + 1}
                  </div>
                  <span className="hidden md:block text-sm font-medium">{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {renderCurrentStep()}
      </div>
    </div>
  );
};