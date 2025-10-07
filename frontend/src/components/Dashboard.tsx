import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Sun, 
  Heart, 
  Palette, 
  Calendar, 
  TrendingUp, 
  Users, 
  Globe,
  Sparkles,
  Moon,
  Star,
  BookOpen,
  MessageCircle
} from "lucide-react";
import MorningSunCheckIn from "./MorningSunCheckIn";
import CulturalEmotionCanvas from "./CulturalEmotionCanvas";
import ResourceDiscoveryMap from "./ResourceDiscoveryMap";
import AnalyticsDashboard from "./AnalyticsDashboard";
import ResearchPlatform from "./ResearchPlatform";
import { ConversationFoundation } from "./conversation/ConversationFoundation";

interface WellnessMetric {
  label: string;
  value: number;
  trend: 'up' | 'down' | 'stable';
  cultural_context: string;
}

const Dashboard = () => {
  const [activeView, setActiveView] = useState<'dashboard' | 'checkin' | 'canvas' | 'conversation' | 'resources' | 'analytics' | 'research'>('dashboard');
  const [currentTime, setCurrentTime] = useState(new Date());

  const wellnessMetrics: WellnessMetric[] = [
    {
      label: "Heart Harmony",
      value: 8.2,
      trend: 'up',
      cultural_context: "Overall emotional balance"
    },
    {
      label: "Community Connection",
      value: 7.5,
      trend: 'stable',
      cultural_context: "Social and family bonds"
    },
    {
      label: "Inner Peace",
      value: 6.8,
      trend: 'up',
      cultural_context: "Spiritual alignment"
    },
    {
      label: "Cultural Pride",
      value: 9.1,
      trend: 'up',
      cultural_context: "Heritage appreciation"
    }
  ];

  const getGreetingByTime = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return { text: "Good morning, beautiful soul", icon: Sun };
    if (hour < 17) return { text: "Good afternoon, cherished one", icon: Sparkles };
    if (hour < 21) return { text: "Good evening, peaceful heart", icon: Star };
    return { text: "Good night, beloved spirit", icon: Moon };
  };

  const greeting = getGreetingByTime();

  if (activeView === 'checkin') {
    return <MorningSunCheckIn />;
  }

  if (activeView === 'canvas') {
    return <CulturalEmotionCanvas />;
  }

  if (activeView === 'conversation') {
    return <ConversationFoundation />;
  }

  if (activeView === 'resources') {
    return <ResourceDiscoveryMap />;
  }

  if (activeView === 'analytics') {
    return <AnalyticsDashboard />;
  }

  if (activeView === 'research') {
    return <ResearchPlatform onBack={() => setActiveView('dashboard')} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-primary/5">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
                <Sun className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-wisdom">SunPath AI</h1>
                <p className="text-sm text-gentle">Your Cultural Wellness Companion</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-gentle text-sm">
              <Globe className="w-4 h-4" />
              <span>Culturally Aware</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Personal Greeting */}
        <Card className="card-warm p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center breathe">
              <greeting.icon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-wisdom mb-1">{greeting.text}</h2>
              <p className="text-gentle">How can we nurture your heart today?</p>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card 
            className="card-embrace p-6 cursor-pointer hover:scale-[1.02] transition-transform"
            onClick={() => setActiveView('checkin')}
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
                <Sun className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-wisdom mb-1">Morning Sun Check-In</h3>
                <p className="text-gentle text-sm">
                  Begin your day with culturally-aware emotional assessment
                </p>
              </div>
            </div>
          </Card>

          <Card 
            className="card-embrace p-6 cursor-pointer hover:scale-[1.02] transition-transform"
            onClick={() => setActiveView('canvas')}
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-secondary to-accent flex items-center justify-center">
                <Palette className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-wisdom mb-1">Cultural Emotion Canvas</h3>
                <p className="text-gentle text-sm">
                  Express feelings through culturally meaningful symbols
                </p>
              </div>
            </div>
          </Card>

          <Card 
            className="card-embrace p-6 cursor-pointer hover:scale-[1.02] transition-transform"
            onClick={() => setActiveView('conversation')}
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-wisdom mb-1">AI Conversation</h3>
                <p className="text-gentle text-sm">
                  Culturally-intelligent conversation interface
                </p>
              </div>
            </div>
          </Card>

          <Card 
            className="card-embrace p-6 cursor-pointer hover:scale-[1.02] transition-transform"
            onClick={() => setActiveView('resources')}
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-accent to-primary flex items-center justify-center">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-wisdom mb-1">Cultural Resource Map</h3>
                <p className="text-gentle text-sm">
                  Find culturally-competent mental health providers
                </p>
              </div>
            </div>
          </Card>

          <Card 
            className="card-embrace p-6 cursor-pointer hover:scale-[1.02] transition-transform"
            onClick={() => setActiveView('analytics')}
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary/80 to-secondary/80 flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-wisdom mb-1">Wisdom Analytics</h3>
                <p className="text-gentle text-sm">
                  Beautiful insights that honor your cultural journey
                </p>
              </div>
            </div>
          </Card>

          <Card 
            className="card-embrace p-6 cursor-pointer hover:scale-[1.02] transition-transform"
            onClick={() => setActiveView('research')}
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-accent to-primary flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-wisdom mb-1">Research Platform</h3>
                <p className="text-gentle text-sm">
                  Contribute to cultural mental health wisdom
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Wellness Metrics */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-wisdom mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Your Wellness Journey
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {wellnessMetrics.map((metric, index) => (
              <Card key={index} className="card-embrace p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary mb-1">
                    {metric.value}/10
                  </div>
                  <h4 className="font-medium text-wisdom text-sm mb-1">{metric.label}</h4>
                  <p className="text-xs text-gentle">{metric.cultural_context}</p>
                  
                  {/* Trend Indicator */}
                  <div className="mt-2">
                    {metric.trend === 'up' && (
                      <span className="text-xs text-green-600 flex items-center justify-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        Growing
                      </span>
                    )}
                    {metric.trend === 'stable' && (
                      <span className="text-xs text-secondary flex items-center justify-center gap-1">
                        <span className="w-3 h-1 bg-secondary rounded"></span>
                        Stable
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Cultural Features */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="card-warm p-6">
            <div className="flex items-start gap-4">
              <Users className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-wisdom mb-2">Community Support</h4>
                <p className="text-gentle text-sm mb-4">
                  Connect with others who share similar cultural backgrounds and experiences.
                </p>
                <Button className="btn-gentle">
                  Join Cultural Communities
                </Button>
              </div>
            </div>
          </Card>

          <Card className="card-warm p-6">
            <div className="flex items-start gap-4">
              <Calendar className="w-6 h-6 text-secondary flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-wisdom mb-2">Cultural Calendar</h4>
                <p className="text-gentle text-sm mb-4">
                  Mindful wellness practices aligned with your cultural holidays and traditions.
                </p>
                <Button className="btn-gentle">
                  View Sacred Days
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Cultural Sensitivity Notice */}
        <Card className="card-embrace p-6 mt-8">
          <div className="text-center">
            <Heart className="w-8 h-8 text-primary mx-auto mb-3" />
            <h4 className="font-semibold text-wisdom mb-2">A Space for Every Heart</h4>
            <p className="text-gentle text-sm max-w-2xl mx-auto">
              SunPath AI honors the beautiful diversity of human emotional expression. Whether you come from 
              collectivist or individualist cultures, practice direct or indirect communication, or hold 
              different spiritual beliefs - your heart is welcomed here exactly as it is.
            </p>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;