import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Building, 
  TrendingUp, 
  Users, 
  MapPin,
  AlertTriangle,
  Target,
  FileText,
  Award,
  BarChart3,
  PieChart,
  Calendar,
  DollarSign
} from "lucide-react";

const PolicySupportInterface = () => {
  const [selectedRegion, setSelectedRegion] = useState<string>("national");

  const policyMetrics = [
    {
      title: "Cultural Competency Requirements",
      current_coverage: 67,
      target_coverage: 95,
      affected_providers: "12,450",
      trend: "up",
      icon: Award
    },
    {
      title: "Bilingual Service Availability",
      current_coverage: 43,
      target_coverage: 80,
      affected_providers: "8,920",
      trend: "up",
      icon: Users
    },
    {
      title: "Community-Based Programs",
      current_coverage: 34,
      target_coverage: 70,
      affected_providers: "5,680",
      trend: "stable",
      icon: MapPin
    },
    {
      title: "Cultural Crisis Protocols",
      current_coverage: 28,
      target_coverage: 85,
      affected_providers: "3,240",
      trend: "up",
      icon: AlertTriangle
    }
  ];

  const resourceGaps = [
    {
      region: "Rural Southwest",
      population: "Latino/Hispanic Communities",
      gap_type: "Spanish-speaking therapists",
      severity: "critical",
      estimated_need: "2,400 additional providers",
      current_ratio: "1:15,000"
    },
    {
      region: "Urban Northeast",
      population: "East Asian Communities",
      gap_type: "Culturally-adapted anxiety treatment",
      severity: "high",
      estimated_need: "45 specialized programs",
      current_ratio: "1:8,500"
    },
    {
      region: "Great Plains",
      population: "Native American Communities",
      gap_type: "Traditional healing integration",
      severity: "critical",
      estimated_need: "Traditional healer partnerships",
      current_ratio: "1:12,000"
    },
    {
      region: "Urban West Coast",
      population: "South Asian Communities",
      gap_type: "Family-inclusive therapy",
      severity: "moderate",
      estimated_need: "28 family therapy specialists",
      current_ratio: "1:6,200"
    }
  ];

  const policyRecommendations = [
    {
      title: "Mandatory Cultural Competency Certification",
      description: "Require all mental health providers to complete cultural competency training",
      impact: "High",
      timeline: "18 months",
      cost: "$4.2M",
      affected_providers: "25,000+",
      states_interested: 8
    },
    {
      title: "Community Health Worker Integration",
      description: "Fund community health workers from cultural communities",
      impact: "Very High",
      timeline: "12 months",
      cost: "$12.8M",
      affected_providers: "8,500+",
      states_interested: 15
    },
    {
      title: "Bilingual Crisis Intervention",
      description: "24/7 crisis support in multiple languages",
      impact: "Critical",
      timeline: "6 months",
      cost: "$8.9M",
      affected_providers: "Crisis centers",
      states_interested: 22
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-primary/5">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center">
              <Building className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-wisdom">Public Policy Support Interface</h1>
              <p className="text-sm text-gentle">Data-Driven Cultural Mental Health Policy</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Policy Overview</TabsTrigger>
            <TabsTrigger value="gaps">Resource Gaps</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="impact">Impact Tracking</TabsTrigger>
          </TabsList>

          {/* Policy Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card className="card-warm p-6">
              <h2 className="text-xl font-semibold text-wisdom mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Cultural Mental Health Policy Coverage
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                {policyMetrics.map((metric, index) => (
                  <Card key={index} className="card-embrace p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <metric.icon className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-wisdom text-sm mb-2">{metric.title}</h3>
                        
                        <div className="space-y-2 mb-3">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-gentle">Current Coverage</span>
                            <span className="text-primary font-medium">{metric.current_coverage}%</span>
                          </div>
                          <Progress value={metric.current_coverage} className="h-2" />
                          
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-gentle">Target Coverage</span>
                            <span className="text-secondary font-medium">{metric.target_coverage}%</span>
                          </div>
                          <Progress value={metric.target_coverage} className="h-1 opacity-50" />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gentle">{metric.affected_providers} providers</span>
                          <Badge variant={metric.trend === 'up' ? 'default' : 'secondary'} className="text-xs">
                            {metric.trend === 'up' ? '↗ Improving' : '→ Stable'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>

            {/* National Summary */}
            <Card className="card-embrace p-6">
              <h3 className="text-lg font-semibold text-wisdom mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-secondary" />
                National Policy Summary
              </h3>
              
              <div className="grid md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg">
                  <div className="text-2xl font-bold text-primary mb-1">34</div>
                  <div className="text-sm text-wisdom">States</div>
                  <div className="text-xs text-gentle">With cultural competency requirements</div>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-br from-secondary/10 to-secondary/5 rounded-lg">
                  <div className="text-2xl font-bold text-secondary mb-1">67%</div>
                  <div className="text-sm text-wisdom">Average Coverage</div>
                  <div className="text-xs text-gentle">Across all cultural policies</div>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-br from-accent/10 to-accent/5 rounded-lg">
                  <div className="text-2xl font-bold text-accent mb-1">$18.4M</div>
                  <div className="text-sm text-wisdom">Allocated Funding</div>
                  <div className="text-xs text-gentle">For cultural mental health</div>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 mb-1">+23%</div>
                  <div className="text-sm text-wisdom">Improvement</div>
                  <div className="text-xs text-gentle">From last year</div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Resource Gaps Tab */}
          <TabsContent value="gaps" className="space-y-6">
            <Card className="card-warm p-6">
              <h2 className="text-xl font-semibold text-wisdom mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                Critical Resource Gap Analysis
              </h2>
              
              <div className="space-y-4">
                {resourceGaps.map((gap, index) => (
                  <Card key={index} className="card-embrace p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <MapPin className="w-4 h-4 text-primary" />
                          <h3 className="font-semibold text-wisdom text-sm">{gap.region}</h3>
                          <Badge className={`text-xs ${getSeverityColor(gap.severity)}`}>
                            {gap.severity}
                          </Badge>
                        </div>
                        <p className="text-gentle text-sm mb-1">{gap.population}</p>
                        <p className="text-wisdom text-sm font-medium">{gap.gap_type}</p>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4 mt-3 p-3 bg-background/30 rounded-lg">
                      <div>
                        <span className="text-xs text-gentle">Estimated Need:</span>
                        <p className="text-sm text-wisdom font-medium">{gap.estimated_need}</p>
                      </div>
                      <div>
                        <span className="text-xs text-gentle">Current Provider Ratio:</span>
                        <p className="text-sm text-wisdom font-medium">{gap.current_ratio}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations" className="space-y-6">
            <Card className="card-warm p-6">
              <h2 className="text-xl font-semibold text-wisdom mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-secondary" />
                Data-Driven Policy Recommendations
              </h2>
              
              <div className="space-y-6">
                {policyRecommendations.map((rec, index) => (
                  <Card key={index} className="card-embrace p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-wisdom mb-2">{rec.title}</h3>
                        <p className="text-gentle text-sm mb-3">{rec.description}</p>
                        
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="p-2 bg-background/30 rounded">
                            <div className="text-xs text-gentle">Impact Level</div>
                            <div className="text-sm font-medium text-primary">{rec.impact}</div>
                          </div>
                          <div className="p-2 bg-background/30 rounded">
                            <div className="text-xs text-gentle">Timeline</div>
                            <div className="text-sm font-medium text-wisdom">{rec.timeline}</div>
                          </div>
                          <div className="p-2 bg-background/30 rounded">
                            <div className="text-xs text-gentle">Estimated Cost</div>
                            <div className="text-sm font-medium text-accent">{rec.cost}</div>
                          </div>
                          <div className="p-2 bg-background/30 rounded">
                            <div className="text-xs text-gentle">States Interested</div>
                            <div className="text-sm font-medium text-secondary">{rec.states_interested}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/30">
                      <span className="text-sm text-gentle">Affects {rec.affected_providers} providers</span>
                      <Button size="sm" className="btn-gentle">
                        View Full Proposal
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Impact Tracking Tab */}
          <TabsContent value="impact" className="space-y-6">
            <Card className="card-warm p-6">
              <h2 className="text-xl font-semibold text-wisdom mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-accent" />
                Policy Impact Tracking
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="card-embrace p-4">
                  <h3 className="font-semibold text-wisdom mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    Recent Policy Wins
                  </h3>
                  <div className="space-y-3">
                    {[
                      {
                        date: "Mar 2024",
                        policy: "California Cultural Competency Mandate",
                        impact: "All licensed therapists require training"
                      },
                      {
                        date: "Feb 2024", 
                        policy: "Texas Bilingual Crisis Line",
                        impact: "24/7 Spanish crisis support statewide"
                      },
                      {
                        date: "Jan 2024",
                        policy: "New York Community Health Investment",
                        impact: "$2.3M for cultural mental health programs"
                      }
                    ].map((win, index) => (
                      <div key={index} className="p-3 bg-background/30 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">{win.date}</Badge>
                        </div>
                        <h4 className="text-sm font-medium text-wisdom">{win.policy}</h4>
                        <p className="text-xs text-gentle">{win.impact}</p>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="card-embrace p-4">
                  <h3 className="font-semibold text-wisdom mb-3 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-secondary" />
                    Funding Impact
                  </h3>
                  <div className="space-y-4">
                    <div className="p-3 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg">
                      <div className="text-lg font-bold text-primary">$47.8M</div>
                      <div className="text-sm text-wisdom">Total Funding Secured</div>
                      <div className="text-xs text-gentle">Through research-informed advocacy</div>
                    </div>
                    <div className="p-3 bg-gradient-to-r from-secondary/10 to-secondary/5 rounded-lg">
                      <div className="text-lg font-bold text-secondary">156,000</div>
                      <div className="text-sm text-wisdom">People Served</div>
                      <div className="text-xs text-gentle">Through improved cultural programs</div>
                    </div>
                    <div className="p-3 bg-gradient-to-r from-accent/10 to-accent/5 rounded-lg">
                      <div className="text-lg font-bold text-accent">89%</div>
                      <div className="text-sm text-wisdom">Provider Satisfaction</div>
                      <div className="text-xs text-gentle">With new cultural competency training</div>
                    </div>
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

export default PolicySupportInterface;