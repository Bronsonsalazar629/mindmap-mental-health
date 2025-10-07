import React from 'react';
import SystemIntegrationHub from '@/components/integration/SystemIntegrationHub';

const Index = () => {
  return (
    <SystemIntegrationHub 
      initialCulturalBackground="multicultural"
      userPreferences={{
        privacy: 'moderate',
        communication: 'adaptive',
        family: 'inclusive'
      }}
    />
  );
};

export default Index;
