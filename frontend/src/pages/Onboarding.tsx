import React from 'react';
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow';

const Onboarding: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <OnboardingFlow />
    </div>
  );
};

export default Onboarding;