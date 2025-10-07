import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Globe, 
  TrendingUp, 
  Users, 
  Heart,
  BookOpen,
  Award,
  Target,
  Lightbulb,
  BarChart3,
  PieChart,
  Map
} from "lucide-react";

const CrossCulturalDashboard = () => {
  const [selectedCulture, setSelectedCulture] = useState<string>("all");
  const [activeMetric, setActiveMetric] = useState<string>("wellness_patterns");

  const culturalGroups = [
    { value: "all", label: "All Cultures" },
    { value: "east_asian", label: "East Asian" },
    { value: "latin_american", label: "Latin American" },
    { value: "african_american", label: "African American" },
    { value: "middle_eastern", label: "Middle Eastern" },
    { value: "south_asian", label: "South Asian" },
    { value: "indigenous", label: "Indigenous" }
  ];

  const crossCulturalPatterns = [
    {
      title: "Family-Centered Healing",
      cultures: ["Latin American", "East Asian", "South Asian"],
      effectiveness: 89,
      description: "Interventions involving family show higher success rates",
      sample_size: "2,847 participants"
    },
    {
      title: "Spiritual Integration",
      cultures: ["Indigenous", "Middle Eastern", "African American"],
      effectiveness: 76,
      description: "Mental health approaches that honor spiritual practices",
      sample_size: "1,923 participants"
    },
    {
      title: "Community-Based Support",
      cultures: ["African American", "Indigenous", "Latin American"],
      effectiveness: 82,
      description: "Group and community interventions show strong outcomes",
      sample_size: "3,156 participants"
    },
    {
      title: "Indirect Communication Styles",
      cultures: ["East Asian", "Indigenous", "Middle Eastern"],
      effectiveness: 71,
      description: "Non-direct therapeutic approaches more culturally acceptable",
      sample_size: "2,234 participants"
    }
  ];

  const interventionEffectiveness = [
    {
      intervention: "Culturally-Adapted CBT",
      overall: 78,
      by_culture: {
        "East Asian": 82,
        "Latin American": 84,
        "African American": 76,
        "Indigenous": 71,
        "Middle Eastern": 79
      }
    },
    {
      intervention: "Family Therapy Integration",
      overall: 85,
      by_culture: {
        "East Asian": 91,
        "Latin American": 89,
        "African American": 83,
        "Indigenous": 88,
        "Middle Eastern": 86
      }
    },
    {
      intervention: "Mindfulness-Based Approaches",
      overall: 73,
      by_culture: {
        "East Asian": 89,
        "Latin American": 67,
        "African American": 71,
        "Indigenous": 85,
        "Middle Eastern": 74
      }
    }
  ];

  const resilienceFactors = [
    {
      factor: "Cultural Identity Strength",
      description: "Strong connection to cultural heritage and identity",
      protection_level: 92,
      icon: Award
    },
    {
      factor: "Community Support Networks",
      description: "Active participation in cultural community",
      protection_level: 87,
      icon: Users
    },
    {
      factor: "Traditional Coping Practices",
      description: "Use of cultural traditional wellness practices",
      protection_level: 79,
      icon: Heart
    },
    {
      factor: "Intergenerational Connection",
      description: "Strong bonds with elders and cultural wisdom",
      protection_level: 83,
      icon: BookOpen
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-primary/5">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-secondary to-accent flex items-center justify-center">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-wisdom">Cross-Cultural Research Dashboard</h1>
                <p className="text-sm text-gentle">Understanding Patterns Across Cultures</p>
              </div>
            </div>
            
            <Select value={selectedCulture} onValueChange={setSelectedCulture}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {culturalGroups.map((group) => (
                  <SelectItem key={group.value} value={group.value}>
                    {group.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <Tabs defaultValue="patterns" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="patterns">Cultural Patterns</TabsTrigger>
            <TabsTrigger value="interventions">Intervention Effectiveness</TabsTrigger>
            <TabsTrigger value="resilience">Resilience Factors</TabsTrigger>
            <TabsTrigger value="policy">Policy Impact</TabsTrigger>
          </TabsList>

          {/* Cultural Patterns Tab */}
          <TabsContent value="patterns" className="space-y-6">
            <Card className="card-warm p-6">
              <h2 className="text-xl font-semibold text-wisdom mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Cross-Cultural Wellness Patterns
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                {crossCulturalPatterns.map((pattern, index) => (
                  <Card key={index} className="card-embrace p-4">
                    <div className="mb-3">
                      <h3 className="font-semibold text-wisdom text-sm mb-1">{pattern.title}</h3>
                      <p className="text-gentle text-xs mb-2">{pattern.description}</p>
                      
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs text-gentle">Effectiveness:</span>
                        <Progress value={pattern.effectiveness} className="flex-1 h-2" />
                        <span className="text-xs font-medium text-primary">{pattern.effectiveness}%</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mb-2">
                        {pattern.cultures.map((culture, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {culture}
                          </Badge>
                        ))}
                      </div>
                      
                      <p className="text-xs text-gentle">{pattern.sample_size}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Intervention Effectiveness Tab */}
          <TabsContent value="interventions" className="space-y-6">
            <Card className="card-warm p-6">
              <h2 className="text-xl font-semibold text-wisdom mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-secondary" />
                Intervention Effectiveness by Culture
              </h2>
              
              <div className="space-y-6">
                {interventionEffectiveness.map((intervention, index) => (
                  <Card key={index} className="card-embrace p-4">
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-wisdom">{intervention.intervention}</h3>
                        <Badge variant="outline" className="bg-primary/10 text-primary">
                          Overall: {intervention.overall}%
                        </Badge>
                      </div>
                      
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                        {Object.entries(intervention.by_culture).map(([culture, effectiveness]) => (
                          <div key={culture} className="p-3 bg-background/30 rounded-lg">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm text-wisdom">{culture}</span>
                              <span className="text-sm font-medium text-primary">{effectiveness}%</span>
                            </div>
                            <Progress value={effectiveness} className="h-2" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Resilience Factors Tab */}
          <TabsContent value="resilience" className="space-y-6">
            <Card className="card-warm p-6">
              <h2 className="text-xl font-semibold text-wisdom mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-accent" />
                Cultural Resilience & Protective Factors
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                {resilienceFactors.map((factor, index) => (
                  <Card key={index} className="card-embrace p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <factor.icon className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-wisdom text-sm mb-1">{factor.factor}</h3>
                        <p className="text-gentle text-xs mb-3">{factor.description}</p>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gentle">Protection Level:</span>
                          <Progress value={factor.protection_level} className="flex-1 h-2" />
                          <span className="text-xs font-medium text-primary">{factor.protection_level}%</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>

            {/* Cultural Strengths Celebration */}
            <Card className="card-embrace p-6">
              <h3 className="text-lg font-semibold text-wisdom mb-4 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-primary" />
                Celebrating Cultural Mental Health Strengths
              </h3>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg">
                  <h4 className="font-medium text-wisdom text-sm mb-2">Traditional Healing Wisdom</h4>
                  <p className="text-gentle text-xs">
                    Indigenous and traditional practices show remarkable effectiveness when integrated respectfully
                  </p>
                </div>
                
                <div className="p-4 bg-gradient-to-br from-secondary/10 to-secondary/5 rounded-lg">
                  <h4 className="font-medium text-wisdom text-sm mb-2">Collective Support Systems</h4>
                  <p className="text-gentle text-xs">
                    Communities with strong cultural bonds show higher resilience and recovery rates
                  </p>
                </div>
                
                <div className="p-4 bg-gradient-to-br from-accent/10 to-accent/5 rounded-lg">
                  <h4 className="font-medium text-wisdom text-sm mb-2">Intergenerational Wisdom</h4>
                  <p className="text-gentle text-xs">
                    Cultural knowledge passed through generations provides powerful coping mechanisms
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Policy Impact Tab */}
          <TabsContent value="policy" className="space-y-6">
            <Card className="card-warm p-6">
              <h2 className="text-xl font-semibold text-wisdom mb-4 flex items-center gap-2">
                <Map className="w-5 h-5 text-secondary" />
                Policy Impact & Resource Allocation
              </h2>
              
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg">
                    <div className="text-2xl font-bold text-primary mb-1">47</div>
                    <div className="text-sm text-wisdom">Healthcare Providers</div>
                    <div className="text-xs text-gentle">Using cultural protocols</div>
                  </div>
                  
                  <div className="text-center p-4 bg-gradient-to-br from-secondary/10 to-secondary/5 rounded-lg">
                    <div className="text-2xl font-bold text-secondary mb-1">12</div>
                    <div className="text-sm text-wisdom">State Policies</div>
                    <div className="text-xs text-gentle">Influenced by our research</div>
                  </div>
                  
                  <div className="text-center p-4 bg-gradient-to-br from-accent/10 to-accent/5 rounded-lg">
                    <div className="text-2xl font-bold text-accent mb-1">$2.3M</div>
                    <div className="text-sm text-wisdom">Funding Allocated</div>
                    <div className="text-xs text-gentle">For cultural competency</div>
                  </div>
                  
                  <div className="text-center p-4 bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 mb-1">89%</div>
                    <div className="text-sm text-wisdom">Provider Satisfaction</div>
                    <div className="text-xs text-gentle">With cultural training</div>
                  </div>
                </div>

                <Card className="card-embrace p-4">
                  <h3 className="font-semibold text-wisdom mb-3">Recent Policy Achievements</h3>
                  <div className="space-y-3">
                    {[
                      "California mandates cultural competency training for mental health providers",
                      "New York allocates funding for culturally-adapted therapy programs",
                      "Texas implements bilingual crisis intervention protocols",
                      "Washington expands community-based mental health services"
                    ].map((achievement, index) => (
                      <div key={index} className="flex items-start gap-3 p-2">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                        <p className="text-gentle text-sm">{achievement}</p>
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

export default CrossCulturalDashboard;