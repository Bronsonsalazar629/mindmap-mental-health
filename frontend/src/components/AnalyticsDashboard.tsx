import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Brain,
  Activity,
  ArrowLeft
} from "lucide-react";
import PersonalCulturalDashboard, { 
  PredictiveIntelligenceCenter, 
  EnvironmentalWellnessInsights 
} from "./analytics/PersonalCulturalDashboard";
import CommunityCulturalHealthInsights from "./analytics/CommunityCulturalHealthInsights";
import HealthcareProviderInsights from "./analytics/HealthcareProviderInsights";

const AnalyticsDashboard = () => {
  const [activeView, setActiveView] = useState<'overview' | 'personal' | 'predictive' | 'environmental' | 'community' | 'provider'>('overview');

  const handleBackToOverview = () => {
    setActiveView('overview');
  };

  if (activeView === 'personal') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-primary/5 p-4">
        <div className="max-w-7xl mx-auto py-8">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="outline" onClick={handleBackToOverview}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Analytics
            </Button>
          </div>
          <PersonalCulturalDashboard />
        </div>
      </div>
    );
  }

  if (activeView === 'predictive') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-primary/5 p-4">
        <div className="max-w-7xl mx-auto py-8">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="outline" onClick={handleBackToOverview}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Analytics
            </Button>
          </div>
          <PredictiveIntelligenceCenter />
        </div>
      </div>
    );
  }

  if (activeView === 'environmental') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-primary/5 p-4">
        <div className="max-w-7xl mx-auto py-8">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="outline" onClick={handleBackToOverview}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Analytics
            </Button>
          </div>
          <EnvironmentalWellnessInsights />
        </div>
      </div>
    );
  }

  if (activeView === 'community') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-primary/5 p-4">
        <div className="max-w-7xl mx-auto py-8">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="outline" onClick={handleBackToOverview}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Analytics
            </Button>
          </div>
          <CommunityCulturalHealthInsights />
        </div>
      </div>
    );
  }

  if (activeView === 'provider') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-primary/5 p-4">
        <div className="max-w-7xl mx-auto py-8">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="outline" onClick={handleBackToOverview}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Analytics
            </Button>
          </div>
          <HealthcareProviderInsights />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-primary/5">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-wisdom">Wisdom Through Beautiful Data</h1>
                <p className="text-sm text-gentle">Cultural analytics that feel like gentle wisdom</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <Card className="card-warm p-8 mb-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-wisdom mb-4">
              Transform Data Into Cultural Wisdom
            </h2>
            <p className="text-gentle text-lg max-w-3xl mx-auto leading-relaxed">
              Discover insights that honor your cultural journey, predict wellness patterns with respect, 
              and guide your path with the wisdom of both tradition and technology.
            </p>
          </div>
        </Card>

        {/* Analytics Categories */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Personal Analytics */}
          <Card 
            className="card-embrace p-6 cursor-pointer hover:scale-[1.02] transition-transform group"
            onClick={() => setActiveView('personal')}
          >
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center group-hover:scale-110 transition-transform">
                <Activity className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-wisdom mb-2">Personal Cultural Wellness</h3>
                <p className="text-gentle mb-4">
                  Your unique journey visualized through culturally-meaningful metaphors. 
                  Track 48 emotional dimensions with beautiful, respectful insights.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">Cultural Visualization</span>
                  <span className="text-xs px-2 py-1 bg-secondary/10 text-secondary rounded-full">48-Dimensional Analysis</span>
                  <span className="text-xs px-2 py-1 bg-accent/10 text-accent rounded-full">Personal Insights</span>
                </div>
              </div>
            </div>
          </Card>

          <Card 
            className="card-embrace p-6 cursor-pointer hover:scale-[1.02] transition-transform group"
            onClick={() => setActiveView('predictive')}
          >
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-secondary to-accent flex items-center justify-center group-hover:scale-110 transition-transform">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-wisdom mb-2">Predictive Intelligence</h3>
                <p className="text-gentle mb-4">
                  Gentle foresight for better wellness. AI-powered predictions that respect 
                  your cultural patterns and help-seeking preferences.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">Early Warning</span>
                  <span className="text-xs px-2 py-1 bg-secondary/10 text-secondary rounded-full">Cultural Sensitivity</span>
                  <span className="text-xs px-2 py-1 bg-accent/10 text-accent rounded-full">Gentle Predictions</span>
                </div>
              </div>
            </div>
          </Card>

          <Card 
            className="card-embrace p-6 cursor-pointer hover:scale-[1.02] transition-transform group"
            onClick={() => setActiveView('environmental')}
          >
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-accent to-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-wisdom mb-2">Environmental Wellness</h3>
                <p className="text-gentle mb-4">
                  How your surroundings affect your cultural well-being. Discover wellness 
                  patterns across spaces, times, and cultural environments.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">Spatial Analysis</span>
                  <span className="text-xs px-2 py-1 bg-secondary/10 text-secondary rounded-full">Time Patterns</span>
                  <span className="text-xs px-2 py-1 bg-accent/10 text-accent rounded-full">Cultural Spaces</span>
                </div>
              </div>
            </div>
          </Card>

          <Card 
            className="card-embrace p-6 cursor-pointer hover:scale-[1.02] transition-transform group"
            onClick={() => setActiveView('community')}
          >
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary/80 to-secondary/80 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-wisdom mb-2">Community Cultural Health</h3>
                <p className="text-gentle mb-4">
                  Anonymous wisdom from your cultural community. Discover shared resilience 
                  patterns and contribute to collective understanding.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">Community Trends</span>
                  <span className="text-xs px-2 py-1 bg-secondary/10 text-secondary rounded-full">Anonymous Insights</span>
                  <span className="text-xs px-2 py-1 bg-accent/10 text-accent rounded-full">Cultural Resilience</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Provider Portal */}
        <Card className="card-warm p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-accent to-wisdom flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-wisdom">Healthcare Provider Portal</h3>
                <p className="text-gentle">Professional insights for culturally-competent care</p>
              </div>
            </div>
            
            <Button 
              onClick={() => setActiveView('provider')}
              className="btn-sunrise"
            >
              Access Provider Insights
            </Button>
          </div>
        </Card>

        {/* Cultural Ethics Notice */}
        <Card className="card-embrace p-6 mt-8">
          <div className="text-center">
            <h4 className="font-semibold text-wisdom mb-3">🛡️ Cultural Data Sovereignty & Ethics</h4>
            <p className="text-gentle text-sm max-w-4xl mx-auto leading-relaxed">
              Every insight is generated with deep respect for cultural dignity and privacy. Your data remains 
              yours, community elders review cultural representations, and all analytics honor the beautiful 
              diversity of human emotional expression. We never stereotype—we celebrate the unique ways 
              cultures approach wellness and healing.
            </p>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default AnalyticsDashboard;