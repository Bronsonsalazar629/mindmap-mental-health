import React, { createContext, useContext, useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowRight, 
  Sparkles, 
  Target, 
  TrendingUp,
  Heart,
  Brain,
  Users,
  Globe
} from 'lucide-react';

interface CulturalContext {
  background: string;
  communicationStyle: string;
  familyInvolvement: string;
  currentEmotionalState: string;
  recentActivity: string[];
  preferences: {
    privacy: string;
    support: string;
    learning: string;
  };
}

interface FeatureTransition {
  from: string;
  to: string;
  reason: string;
  culturalContext: string;
  confidence: number;
}

interface FeatureTransitionContextType {
  currentFeature: string;
  culturalContext: CulturalContext;
  suggestedTransitions: FeatureTransition[];
  transitionHistory: string[];
  updateContext: (updates: Partial<CulturalContext>) => void;
  transitionTo: (feature: string, context?: string) => void;
}

const FeatureTransitionContext = createContext<FeatureTransitionContextType | null>(null);

export const useFeatureTransition = () => {
  const context = useContext(FeatureTransitionContext);
  if (!context) {
    throw new Error('useFeatureTransition must be used within FeatureTransitionProvider');
  }
  return context;
};

interface FeatureTransitionProviderProps {
  children: React.ReactNode;
  initialFeature?: string;
  culturalBackground: string;
}

export const FeatureTransitionProvider: React.FC<FeatureTransitionProviderProps> = ({
  children,
  initialFeature = 'dashboard',
  culturalBackground
}) => {
  const [currentFeature, setCurrentFeature] = useState(initialFeature);
  const [transitionHistory, setTransitionHistory] = useState<string[]>([initialFeature]);
  const [culturalContext, setCulturalContext] = useState<CulturalContext>({
    background: culturalBackground,
    communicationStyle: 'adaptive',
    familyInvolvement: 'moderate',
    currentEmotionalState: 'stable',
    recentActivity: [],
    preferences: {
      privacy: 'moderate',
      support: 'balanced',
      learning: 'gradual'
    }
  });

  const generateSuggestedTransitions = (): FeatureTransition[] => {
    const transitions: FeatureTransition[] = [];
    
    // AI-powered suggestions based on current context
    if (currentFeature === 'checkin' && culturalContext.currentEmotionalState === 'stressed') {
      transitions.push({
        from: 'checkin',
        to: 'conversation',
        reason: 'Your check-in suggests you might benefit from talking through your feelings',
        culturalContext: 'Respecting your preference for supportive dialogue',
        confidence: 0.85
      });
      
      if (culturalContext.background.includes('collectivist')) {
        transitions.push({
          from: 'checkin',
          to: 'family',
          reason: 'Consider including your support network in your wellness journey',
          culturalContext: 'Honoring your cultural value of community support',
          confidence: 0.75
        });
      }
    }

    if (currentFeature === 'conversation' && culturalContext.recentActivity.includes('resourceRequest')) {
      transitions.push({
        from: 'conversation',
        to: 'resources',
        reason: 'Based on our conversation, let me help you find local cultural resources',
        culturalContext: 'Connecting you with culturally-appropriate support options',
        confidence: 0.90
      });
    }

    if (currentFeature === 'analytics' && culturalContext.preferences.learning === 'community-focused') {
      transitions.push({
        from: 'analytics',
        to: 'research',
        reason: 'Your insights could help improve mental health support for your community',
        culturalContext: 'Contributing to collective cultural wellness wisdom',
        confidence: 0.70
      });
    }

    return transitions;
  };

  const [suggestedTransitions, setSuggestedTransitions] = useState<FeatureTransition[]>([]);

  useEffect(() => {
    setSuggestedTransitions(generateSuggestedTransitions());
  }, [currentFeature, culturalContext]);

  const updateContext = (updates: Partial<CulturalContext>) => {
    setCulturalContext(prev => ({ ...prev, ...updates }));
  };

  const transitionTo = (feature: string, context?: string) => {
    setCurrentFeature(feature);
    setTransitionHistory(prev => [...prev, feature]);
    
    // Update cultural context based on transition
    if (context) {
      updateContext({ recentActivity: [...culturalContext.recentActivity, context] });
    }
  };

  const value: FeatureTransitionContextType = {
    currentFeature,
    culturalContext,
    suggestedTransitions,
    transitionHistory,
    updateContext,
    transitionTo
  };

  return (
    <FeatureTransitionContext.Provider value={value}>
      {children}
    </FeatureTransitionContext.Provider>
  );
};

interface TransitionSuggestionsProps {
  onTransition: (feature: string) => void;
}

export const TransitionSuggestions: React.FC<TransitionSuggestionsProps> = ({ onTransition }) => {
  const { suggestedTransitions, culturalContext } = useFeatureTransition();

  if (suggestedTransitions.length === 0) return null;

  const getCulturalTransitionStyle = () => {
    if (culturalContext.communicationStyle === 'direct') {
      return 'border-l-4 border-primary'; // Clear, direct visual cue
    } else if (culturalContext.communicationStyle === 'gentle') {
      return 'border border-primary/30 bg-primary/5'; // Soft, gentle approach
    } else {
      return 'border border-secondary bg-secondary/20'; // Balanced approach
    }
  };

  return (
    <Card className={`p-4 ${getCulturalTransitionStyle()}`}>
      <div className="flex items-center space-x-2 mb-3">
        <Sparkles className="h-4 w-4 text-primary" />
        <h3 className="font-medium text-sm">Culturally-Aware Suggestions</h3>
      </div>
      
      <div className="space-y-3">
        {suggestedTransitions.map((transition, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm text-foreground">{transition.reason}</p>
              <Badge variant="secondary" className="text-xs">
                {Math.round(transition.confidence * 100)}% match
              </Badge>
            </div>
            
            <p className="text-xs text-muted-foreground italic">
              {transition.culturalContext}
            </p>
            
            <div className="flex items-center justify-between">
              <Progress value={transition.confidence * 100} className="flex-1 mr-3" />
              <Button
                size="sm"
                onClick={() => onTransition(transition.to)}
                className="text-xs"
              >
                <ArrowRight className="h-3 w-3 mr-1" />
                Continue
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

interface CulturalContextDisplayProps {
  showDetails?: boolean;
}

export const CulturalContextDisplay: React.FC<CulturalContextDisplayProps> = ({ 
  showDetails = false 
}) => {
  const { culturalContext, currentFeature } = useFeatureTransition();

  const getContextIcon = (aspect: string) => {
    switch (aspect) {
      case 'emotional': return Heart;
      case 'cognitive': return Brain;
      case 'social': return Users;
      case 'cultural': return Globe;
      default: return Target;
    }
  };

  return (
    <Card className="p-4 bg-muted/30 border-muted">
      <div className="flex items-center space-x-2 mb-3">
        <Brain className="h-4 w-4 text-muted-foreground" />
        <h3 className="font-medium text-sm">Cultural Intelligence Active</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <span className="text-muted-foreground">Background:</span>
          <p className="font-medium">{culturalContext.background}</p>
        </div>
        <div>
          <span className="text-muted-foreground">Communication:</span>
          <p className="font-medium">{culturalContext.communicationStyle}</p>
        </div>
        <div>
          <span className="text-muted-foreground">Current State:</span>
          <p className="font-medium">{culturalContext.currentEmotionalState}</p>
        </div>
        <div>
          <span className="text-muted-foreground">Support Style:</span>
          <p className="font-medium">{culturalContext.preferences.support}</p>
        </div>
      </div>

      {showDetails && (
        <div className="mt-3 pt-3 border-t border-muted">
          <p className="text-xs text-muted-foreground">
            AI is continuously learning your cultural preferences to provide more personalized 
            and culturally-appropriate wellness support across all features.
          </p>
        </div>
      )}
    </Card>
  );
};

export default FeatureTransitionProvider;