import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Users, 
  Shield, 
  TrendingUp, 
  Heart,
  Globe,
  Award,
  CheckCircle,
  Info
} from "lucide-react";

const AcademicResearchInterface = () => {
  const [researchConsent, setResearchConsent] = useState({
    basic_wellness: false,
    cultural_patterns: false,
    community_insights: false,
    intervention_feedback: false
  });

  const [contributionLevel, setContributionLevel] = useState<'minimal' | 'moderate' | 'full'>('minimal');

  const researchImpacts = [
    {
      title: "Cultural Therapy Adaptations",
      description: "Your community's data helped develop culturally-adapted therapy protocols",
      impact: "Used by 47 healthcare providers",
      icon: Heart
    },
    {
      title: "Community Resilience Study",
      description: "Contributing to understanding of cultural coping mechanisms",
      impact: "Supporting 3 active research papers",
      icon: Users
    },
    {
      title: "Mental Health Policy",
      description: "Anonymous insights inform cultural competency training requirements",
      impact: "Influenced 12 state policies",
      icon: Shield
    }
  ];

  const academicPartners = [
    "Stanford Cultural Psychology Lab",
    "Harvard T.H. Chan School of Public Health",
    "UCLA Center for Culture and Health",
    "University of Michigan Multicultural Psychology"
  ];

  const getContributionDescription = (level: string) => {
    switch (level) {
      case 'minimal':
        return "Basic wellness patterns only - no cultural identifiers";
      case 'moderate':
        return "General cultural background + wellness patterns";
      case 'full':
        return "Detailed cultural context + intervention effectiveness";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-primary/5">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-accent to-secondary flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-wisdom">Academic Research Platform</h1>
              <p className="text-sm text-gentle">Contributing to Cultural Mental Health Wisdom</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Introduction */}
        <Card className="card-warm p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <Globe className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-semibold text-wisdom mb-2">
                Help Build a More Culturally-Aware World
              </h2>
              <p className="text-gentle mb-4">
                Your anonymous contributions help researchers understand how different cultures approach 
                mental wellness, leading to better support for everyone.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  100% Anonymous
                </Badge>
                <Badge variant="secondary" className="bg-secondary/10 text-secondary">
                  Community Controlled
                </Badge>
                <Badge variant="secondary" className="bg-accent/10 text-accent">
                  Ethically Reviewed
                </Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* Research Contribution Settings */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <Card className="card-embrace p-6">
            <h3 className="text-lg font-semibold text-wisdom mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Your Research Contribution Preferences
            </h3>

            <div className="space-y-4">
              {/* Contribution Level Selector */}
              <div className="p-4 bg-background/50 rounded-lg">
                <h4 className="font-medium text-wisdom mb-3">Contribution Level</h4>
                <div className="space-y-3">
                  {[
                    { value: 'minimal', label: 'Minimal', color: 'bg-accent' },
                    { value: 'moderate', label: 'Moderate', color: 'bg-secondary' },
                    { value: 'full', label: 'Full', color: 'bg-primary' }
                  ].map((level) => (
                    <div 
                      key={level.value}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        contributionLevel === level.value 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setContributionLevel(level.value as any)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full ${level.color} ${
                          contributionLevel === level.value ? 'ring-2 ring-primary ring-offset-2' : ''
                        }`} />
                        <div className="flex-1">
                          <div className="font-medium text-wisdom">{level.label} Contribution</div>
                          <div className="text-sm text-gentle">
                            {getContributionDescription(level.value)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Specific Consent Toggles */}
              <div className="space-y-3">
                <h4 className="font-medium text-wisdom">Specific Research Areas</h4>
                
                {Object.entries({
                  basic_wellness: "Basic wellness patterns (mood, stress levels)",
                  cultural_patterns: "Cultural background and wellness correlations",
                  community_insights: "Anonymous community mental health trends",
                  intervention_feedback: "Effectiveness of cultural interventions"
                }).map(([key, description]) => (
                  <div key={key} className="flex items-center justify-between p-3 bg-background/30 rounded-lg">
                    <div className="flex-1">
                      <p className="text-wisdom text-sm">{description}</p>
                    </div>
                    <Switch 
                      checked={researchConsent[key as keyof typeof researchConsent]}
                      onCheckedChange={(checked) => 
                        setResearchConsent(prev => ({ ...prev, [key]: checked }))
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card className="card-embrace p-6">
            <h3 className="text-lg font-semibold text-wisdom mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-secondary" />
              Research Impact Visualization
            </h3>

            <div className="space-y-4">
              {researchImpacts.map((impact, index) => (
                <div key={index} className="p-4 bg-background/30 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <impact.icon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-wisdom text-sm mb-1">{impact.title}</h4>
                      <p className="text-gentle text-xs mb-2">{impact.description}</p>
                      <Badge variant="outline" className="text-xs">
                        {impact.impact}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Community Contribution Progress */}
            <div className="mt-6 p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-wisdom">Your Community's Impact</span>
              </div>
              <Progress value={78} className="mb-2" />
              <p className="text-xs text-gentle">
                Your cultural community has contributed to 12 research studies
              </p>
            </div>
          </Card>
        </div>

        {/* Academic Partners */}
        <Card className="card-warm p-6 mb-8">
          <h3 className="text-lg font-semibold text-wisdom mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-accent" />
            Trusted Academic Partners
          </h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            {academicPartners.map((partner, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-background/30 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span className="text-gentle text-sm">{partner}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Ethical Commitment */}
        <Card className="card-embrace p-6">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
              <Info className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-wisdom mb-2">Our Ethical Commitment</h3>
            <p className="text-gentle text-sm max-w-3xl mx-auto mb-4">
              All research using SunPath AI data is reviewed by Institutional Review Boards (IRBs) 
              and follows the highest ethical standards for cultural research. Your data remains 
              anonymous and is used only to improve mental health support for cultural communities.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Badge variant="outline">IRB Approved</Badge>
              <Badge variant="outline">HIPAA Compliant</Badge>
              <Badge variant="outline">Cultural Ethics Board Reviewed</Badge>
              <Badge variant="outline">Community Benefit Sharing</Badge>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default AcademicResearchInterface;