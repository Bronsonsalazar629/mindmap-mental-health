import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Brain, 
  Sparkles, 
  Eye, 
  Shield, 
  TrendingUp,
  Users,
  Heart,
  MessageCircle,
  BarChart3,
  Lightbulb,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface AIInsight {
  id: string;
  type: 'cultural' | 'emotional' | 'behavioral' | 'predictive';
  confidence: number;
  insight: string;
  culturalContext: string;
  actionSuggestion?: string;
  priority: 'low' | 'medium' | 'high';
  source: string[];
}

interface CulturalPattern {
  pattern: string;
  frequency: number;
  culturalRelevance: number;
  trend: 'increasing' | 'stable' | 'decreasing';
  implications: string;
}

interface BiasMonitoring {
  culturalGroup: string;
  accuracyScore: number;
  representationScore: number;
  issues: string[];
  improvements: string[];
}

const AIIntegrationLayer: React.FC = () => {
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [culturalPatterns, setCulturalPatterns] = useState<CulturalPattern[]>([]);
  const [biasMonitoring, setBiasMonitoring] = useState<BiasMonitoring[]>([]);
  const [aiLearningProgress, setAiLearningProgress] = useState(67);
  const [culturalAccuracy, setCulturalAccuracy] = useState(89);

  useEffect(() => {
    // Simulate AI insights generation
    const generateInsights = () => {
      const insights: AIInsight[] = [
        {
          id: '1',
          type: 'cultural',
          confidence: 0.87,
          insight: 'Your communication patterns suggest a preference for indirect, relationship-focused dialogue',
          culturalContext: 'This aligns with high-context cultural communication styles',
          actionSuggestion: 'Consider voice conversations for deeper emotional expression',
          priority: 'medium',
          source: ['conversation', 'checkin', 'voice']
        },
        {
          id: '2',
          type: 'predictive',
          confidence: 0.92,
          insight: 'Based on recent patterns, you typically benefit from community-focused resources after stress',
          culturalContext: 'Reflecting collectivist cultural values in wellness seeking',
          actionSuggestion: 'Explore family integration features during challenging times',
          priority: 'high',
          source: ['analytics', 'resources', 'family']
        },
        {
          id: '3',
          type: 'emotional',
          confidence: 0.74,
          insight: 'Your emotional expression patterns show seasonal cultural celebration influences',
          culturalContext: 'Cultural holidays and traditions impact your wellness rhythms',
          actionSuggestion: 'Integrate cultural calendar with wellness tracking',
          priority: 'low',
          source: ['checkin', 'canvas', 'analytics']
        }
      ];
      setAiInsights(insights);
    };

    const generatePatterns = () => {
      const patterns: CulturalPattern[] = [
        {
          pattern: 'Family-inclusive wellness decisions',
          frequency: 0.78,
          culturalRelevance: 0.95,
          trend: 'increasing',
          implications: 'Strong cultural alignment with community-centered approach to mental health'
        },
        {
          pattern: 'Metaphorical emotional expression',
          frequency: 0.64,
          culturalRelevance: 0.88,
          trend: 'stable',
          implications: 'Preference for culturally-rich emotional communication'
        },
        {
          pattern: 'Traditional + modern resource combination',
          frequency: 0.71,
          culturalRelevance: 0.82,
          trend: 'increasing',
          implications: 'Successful integration of cultural traditions with contemporary wellness'
        }
      ];
      setCulturalPatterns(patterns);
    };

    const generateBiasMonitoring = () => {
      const monitoring: BiasMonitoring[] = [
        {
          culturalGroup: 'East Asian Cultural Communities',
          accuracyScore: 0.91,
          representationScore: 0.87,
          issues: ['Emotional expression detection needs refinement'],
          improvements: ['Added cultural metaphor recognition', 'Enhanced family context understanding']
        },
        {
          culturalGroup: 'Latin American Cultural Communities',
          accuracyScore: 0.88,
          representationScore: 0.92,
          issues: [],
          improvements: ['Improved spiritual wellness integration', 'Better family dynamics modeling']
        }
      ];
      setBiasMonitoring(monitoring);
    };

    generateInsights();
    generatePatterns();
    generateBiasMonitoring();
  }, []);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'cultural': return Users;
      case 'emotional': return Heart;
      case 'behavioral': return TrendingUp;
      case 'predictive': return Lightbulb;
      default: return Brain;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Intelligence Overview */}
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
        <div className="flex items-center space-x-3 mb-4">
          <Brain className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-lg font-semibold">Cultural AI Intelligence</h2>
            <p className="text-sm text-muted-foreground">
              Advanced AI learning your unique cultural wellness patterns
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Cultural Learning Progress</span>
              <span className="text-sm text-muted-foreground">{aiLearningProgress}%</span>
            </div>
            <Progress value={aiLearningProgress} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Cultural Accuracy</span>
              <span className="text-sm text-muted-foreground">{culturalAccuracy}%</span>
            </div>
            <Progress value={culturalAccuracy} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Active Insights</span>
              <Badge variant="secondary">{aiInsights.length}</Badge>
            </div>
            <div className="flex space-x-1">
              {aiInsights.map((_, index) => (
                <div key={index} className="h-2 w-8 bg-primary/60 rounded" />
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* AI Insights */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Cultural AI Insights</h3>
        </div>

        {aiInsights.map((insight) => {
          const Icon = getInsightIcon(insight.type);
          return (
            <Card key={insight.id} className="p-4">
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium">{insight.insight}</p>
                      <p className="text-xs text-muted-foreground italic mt-1">
                        {insight.culturalContext}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getPriorityColor(insight.priority) as any} className="text-xs">
                        {insight.priority}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {Math.round(insight.confidence * 100)}%
                      </Badge>
                    </div>
                  </div>

                  {insight.actionSuggestion && (
                    <div className="bg-secondary/20 p-3 rounded-lg">
                      <p className="text-xs font-medium mb-1">Suggested Action:</p>
                      <p className="text-xs text-muted-foreground">{insight.actionSuggestion}</p>
                    </div>
                  )}

                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <span>Sources:</span>
                    {insight.source.map((source, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {source}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Cultural Patterns */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Discovered Cultural Patterns</h3>
        </div>

        {culturalPatterns.map((pattern, index) => (
          <Card key={index} className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">{pattern.pattern}</h4>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="text-xs">
                    {pattern.trend}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {Math.round(pattern.frequency * 100)}% frequency
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Cultural Relevance</span>
                  <span>{Math.round(pattern.culturalRelevance * 100)}%</span>
                </div>
                <Progress value={pattern.culturalRelevance * 100} className="h-1" />
              </div>

              <p className="text-xs text-muted-foreground italic">
                {pattern.implications}
              </p>
            </div>
          </Card>
        ))}
      </div>

      {/* Cultural Bias Monitoring */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Shield className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Cultural Fairness Monitoring</h3>
        </div>

        {biasMonitoring.map((monitoring, index) => (
          <Card key={index} className="p-4">
            <div className="space-y-3">
              <h4 className="font-medium text-sm">{monitoring.culturalGroup}</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Accuracy Score</span>
                    <span>{Math.round(monitoring.accuracyScore * 100)}%</span>
                  </div>
                  <Progress value={monitoring.accuracyScore * 100} className="h-1" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Representation Score</span>
                    <span>{Math.round(monitoring.representationScore * 100)}%</span>
                  </div>
                  <Progress value={monitoring.representationScore * 100} className="h-1" />
                </div>
              </div>

              {monitoring.issues.length > 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    Active improvements: {monitoring.issues.join(', ')}
                  </AlertDescription>
                </Alert>
              )}

              {monitoring.improvements.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-medium">Recent Improvements:</p>
                  {monitoring.improvements.map((improvement, idx) => (
                    <div key={idx} className="flex items-center space-x-2 text-xs">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      <span className="text-muted-foreground">{improvement}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* AI Transparency */}
      <Card className="p-4 bg-muted/20 border-muted">
        <div className="flex items-center space-x-2 mb-3">
          <Eye className="h-4 w-4 text-muted-foreground" />
          <h4 className="font-medium text-sm">AI Transparency</h4>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Our AI continuously learns from your interactions across all features to provide 
          culturally-appropriate wellness support. All learning respects your privacy settings 
          and cultural data sovereignty preferences. You can review and provide feedback on 
          AI recommendations to help improve cultural accuracy for your community.
        </p>
      </Card>
    </div>
  );
};

export default AIIntegrationLayer;