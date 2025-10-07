import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Brain, 
  Shield, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  Target,
  BarChart3,
  Activity,
  Users,
  Eye,
  Settings
} from "lucide-react";

const MLInsightsVisualization = () => {
  const [selectedModel, setSelectedModel] = useState<string>("cultural_wellness");

  const featureImportance = [
    {
      feature: "Cultural Identity Strength",
      importance: 89,
      description: "Connection to cultural heritage and traditions",
      bias_score: 92,
      cultural_groups: ["All cultures equally weighted"]
    },
    {
      feature: "Family Support Network",
      importance: 84,
      description: "Quality and frequency of family interactions",
      bias_score: 78,
      cultural_groups: ["May favor collectivist cultures"]
    },
    {
      feature: "Community Participation",
      importance: 76,
      description: "Involvement in cultural community activities",
      bias_score: 81,
      cultural_groups: ["Weighted for cultural context"]
    },
    {
      feature: "Traditional Practices",
      importance: 71,
      description: "Use of traditional wellness and spiritual practices",
      bias_score: 67,
      cultural_groups: ["Needs improvement for secular approaches"]
    },
    {
      feature: "Language Comfort",
      importance: 68,
      description: "Comfort level with native vs. dominant language",
      bias_score: 85,
      cultural_groups: ["Well-balanced across language groups"]
    }
  ];

  const biasDetection = [
    {
      bias_type: "Cultural Representation",
      severity: "low",
      score: 91,
      description: "Model performs consistently across cultural groups",
      action_taken: "Continuous monitoring with cultural advisory board"
    },
    {
      bias_type: "Socioeconomic Factors",
      severity: "moderate", 
      score: 76,
      description: "Some variance in predictions based on socioeconomic status",
      action_taken: "Additional training data from diverse economic backgrounds"
    },
    {
      bias_type: "Age Group Representation",
      severity: "low",
      score: 88,
      description: "Good performance across all age groups",
      action_taken: "Regular model updates with intergenerational data"
    },
    {
      bias_type: "Gender Expression",
      severity: "very_low",
      score: 94,
      description: "Excellent performance across gender identities",
      action_taken: "Ongoing inclusive data collection practices"
    }
  ];

  const modelPerformance = [
    {
      culture: "East Asian",
      accuracy: 89,
      precision: 87,
      recall: 91,
      f1_score: 89,
      sample_size: "2,847",
      cultural_adaptations: ["Indirect communication patterns", "Family hierarchy consideration"]
    },
    {
      culture: "Latin American",
      accuracy: 92,
      precision: 90,
      recall: 94,
      f1_score: 92,
      sample_size: "3,156",
      cultural_adaptations: ["Familismo integration", "Religious context awareness"]
    },
    {
      culture: "African American",
      accuracy: 87,
      precision: 85,
      recall: 89,
      f1_score: 87,
      sample_size: "2,634",
      cultural_adaptations: ["Historical trauma awareness", "Community strength focus"]
    },
    {
      culture: "Indigenous",
      accuracy: 84,
      precision: 82,
      recall: 86,
      f1_score: 84,
      sample_size: "1,923",
      cultural_adaptations: ["Traditional healing integration", "Land connection factors"]
    },
    {
      culture: "Middle Eastern",
      accuracy: 86,
      precision: 84,
      recall: 88,
      f1_score: 86,
      sample_size: "2,145",
      cultural_adaptations: ["Religious practice integration", "Extended family dynamics"]
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'very_low': return 'bg-green-100 text-green-800 border-green-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-primary/5">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-wisdom">ML Insights & Transparency</h1>
              <p className="text-sm text-gentle">Understanding Cultural AI Performance</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Transparency Notice */}
        <Alert className="mb-6 bg-primary/5 border-primary/20">
          <Eye className="h-4 w-4 text-primary" />
          <AlertDescription className="text-wisdom">
            <strong>Algorithmic Transparency:</strong> SunPath AI is committed to explainable and fair AI. 
            All cultural adaptations are reviewed by cultural advisory boards and bias is continuously monitored.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="features" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="features">Feature Importance</TabsTrigger>
            <TabsTrigger value="bias">Bias Detection</TabsTrigger>
            <TabsTrigger value="performance">Cultural Performance</TabsTrigger>
            <TabsTrigger value="feedback">Community Feedback</TabsTrigger>
          </TabsList>

          {/* Feature Importance Tab */}
          <TabsContent value="features" className="space-y-6">
            <Card className="card-warm p-6">
              <h2 className="text-xl font-semibold text-wisdom mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Cultural Feature Importance Analysis
              </h2>
              
              <div className="space-y-4">
                {featureImportance.map((feature, index) => (
                  <Card key={index} className="card-embrace p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-wisdom mb-1">{feature.feature}</h3>
                        <p className="text-gentle text-sm mb-2">{feature.description}</p>
                        
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs text-gentle">Importance Score</span>
                              <span className="text-xs font-medium text-primary">{feature.importance}%</span>
                            </div>
                            <Progress value={feature.importance} className="h-2" />
                          </div>
                          
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs text-gentle">Bias-Free Score</span>
                              <span className="text-xs font-medium text-secondary">{feature.bias_score}%</span>
                            </div>
                            <Progress value={feature.bias_score} className="h-2" />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3 p-2 bg-background/30 rounded-lg">
                      <span className="text-xs text-gentle">Cultural Considerations: </span>
                      <span className="text-xs text-wisdom">{feature.cultural_groups[0]}</span>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Bias Detection Tab */}
          <TabsContent value="bias" className="space-y-6">
            <Card className="card-warm p-6">
              <h2 className="text-xl font-semibold text-wisdom mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-secondary" />
                Algorithmic Bias Detection & Mitigation
              </h2>
              
              <div className="space-y-4">
                {biasDetection.map((bias, index) => (
                  <Card key={index} className="card-embrace p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-wisdom">{bias.bias_type}</h3>
                          <Badge className={`text-xs ${getSeverityColor(bias.severity)}`}>
                            {bias.severity.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-gentle text-sm mb-2">{bias.description}</p>
                        
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-xs text-gentle">Fairness Score:</span>
                          <Progress value={bias.score} className="flex-1 h-2" />
                          <span className="text-xs font-medium text-primary">{bias.score}%</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-background/30 rounded-lg">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="text-xs text-gentle">Action Taken: </span>
                          <span className="text-xs text-wisdom">{bias.action_taken}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>

            {/* Bias Monitoring Dashboard */}
            <Card className="card-embrace p-6">
              <h3 className="text-lg font-semibold text-wisdom mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-accent" />
                Real-Time Bias Monitoring
              </h3>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 mb-1">94.2%</div>
                  <div className="text-sm text-wisdom">Overall Fairness</div>
                  <div className="text-xs text-gentle">Across all cultural groups</div>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 mb-1">23</div>
                  <div className="text-sm text-wisdom">Active Monitors</div>
                  <div className="text-xs text-gentle">Continuous bias detection</div>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 mb-1">7 days</div>
                  <div className="text-sm text-wisdom">Detection Time</div>
                  <div className="text-xs text-gentle">Average time to identify bias</div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Cultural Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <Card className="card-warm p-6">
              <h2 className="text-xl font-semibold text-wisdom mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-accent" />
                Model Performance Across Cultures
              </h2>
              
              <div className="space-y-4">
                {modelPerformance.map((performance, index) => (
                  <Card key={index} className="card-embrace p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-wisdom mb-2">{performance.culture}</h3>
                        
                        <div className="grid md:grid-cols-4 gap-4 mb-3">
                          <div className="text-center p-2 bg-background/30 rounded">
                            <div className="text-lg font-bold text-primary">{performance.accuracy}%</div>
                            <div className="text-xs text-gentle">Accuracy</div>
                          </div>
                          <div className="text-center p-2 bg-background/30 rounded">
                            <div className="text-lg font-bold text-secondary">{performance.precision}%</div>
                            <div className="text-xs text-gentle">Precision</div>
                          </div>
                          <div className="text-center p-2 bg-background/30 rounded">
                            <div className="text-lg font-bold text-accent">{performance.recall}%</div>
                            <div className="text-xs text-gentle">Recall</div>
                          </div>
                          <div className="text-center p-2 bg-background/30 rounded">
                            <div className="text-lg font-bold text-wisdom">{performance.f1_score}%</div>
                            <div className="text-xs text-gentle">F1 Score</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gentle">Sample Size: {performance.sample_size} participants</span>
                      </div>
                      
                      <div className="p-2 bg-background/30 rounded-lg">
                        <span className="text-xs text-gentle">Cultural Adaptations: </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {performance.cultural_adaptations.map((adaptation, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {adaptation}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Community Feedback Tab */}
          <TabsContent value="feedback" className="space-y-6">
            <Card className="card-warm p-6">
              <h2 className="text-xl font-semibold text-wisdom mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Community Feedback & Model Improvement
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="card-embrace p-4">
                  <h3 className="font-semibold text-wisdom mb-3">Cultural Accuracy Reports</h3>
                  <div className="space-y-3">
                    {[
                      {
                        feedback: "Model recommendations feel culturally appropriate",
                        score: 91,
                        responses: "1,247"
                      },
                      {
                        feedback: "AI understands my cultural context",
                        score: 87,
                        responses: "934"
                      },
                      {
                        feedback: "Suggestions respect my family values",
                        score: 89,
                        responses: "1,156"
                      }
                    ].map((item, index) => (
                      <div key={index} className="p-3 bg-background/30 rounded-lg">
                        <p className="text-sm text-wisdom mb-2">{item.feedback}</p>
                        <div className="flex items-center gap-2">
                          <Progress value={item.score} className="flex-1 h-2" />
                          <span className="text-xs font-medium text-primary">{item.score}%</span>
                        </div>
                        <p className="text-xs text-gentle mt-1">{item.responses} responses</p>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="card-embrace p-4">
                  <h3 className="font-semibold text-wisdom mb-3">Model Improvement Actions</h3>
                  <div className="space-y-3">
                    {[
                      {
                        issue: "Better recognition of indirect communication",
                        status: "implemented",
                        impact: "+12% accuracy for East Asian users"
                      },
                      {
                        issue: "Family dynamics in recommendations",
                        status: "in_progress",
                        impact: "Testing with 500 Latino families"
                      },
                      {
                        issue: "Traditional healing integration",
                        status: "planned",
                        impact: "Partnership with Indigenous healers"
                      }
                    ].map((action, index) => (
                      <div key={index} className="p-3 bg-background/30 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge 
                            variant={action.status === 'implemented' ? 'default' : 'secondary'} 
                            className="text-xs"
                          >
                            {action.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-sm text-wisdom mb-1">{action.issue}</p>
                        <p className="text-xs text-gentle">{action.impact}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default MLInsightsVisualization;