import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  RadialBarChart,
  RadialBar
} from 'recharts';
import { 
  TrendingUp, 
  Heart, 
  Sun, 
  Moon, 
  Flower2, 
  Waves, 
  TreePine, 
  Star,
  Users,
  Shield,
  Calendar,
  MapPin,
  AlertCircle,
  Sparkles
} from "lucide-react";

// Mock data for wellness analytics
const emotionalTrendData = [
  { date: '2024-01-01', joy: 7.2, peace: 6.8, connection: 8.1, family: 7.9, purpose: 6.5, environment: 7.3 },
  { date: '2024-01-02', joy: 7.8, peace: 7.2, connection: 8.3, family: 8.2, purpose: 7.1, environment: 7.8 },
  { date: '2024-01-03', joy: 6.9, peace: 6.5, connection: 7.8, family: 7.6, purpose: 6.8, environment: 7.1 },
  { date: '2024-01-04', joy: 8.2, peace: 7.9, connection: 8.7, family: 8.5, purpose: 7.8, environment: 8.2 },
  { date: '2024-01-05', joy: 7.5, peace: 7.3, connection: 8.0, family: 7.8, purpose: 7.2, environment: 7.6 },
  { date: '2024-01-06', joy: 8.5, peace: 8.1, connection: 9.0, family: 8.8, purpose: 8.2, environment: 8.5 },
  { date: '2024-01-07', joy: 7.9, peace: 7.7, connection: 8.4, family: 8.1, purpose: 7.6, environment: 7.9 },
];

const culturalInfluenceData = [
  { factor: 'Family Harmony', impact: 85, color: '#FBBF24' },
  { factor: 'Community Connection', impact: 78, color: '#A8DADC' },
  { factor: 'Spiritual Practice', impact: 72, color: '#6B7280' },
  { factor: 'Cultural Celebrations', impact: 68, color: '#1E3A8A' },
  { factor: 'Traditional Foods', impact: 65, color: '#FBBF24' },
  { factor: 'Language Use', impact: 62, color: '#A8DADC' }
];

const wellnessInsightData = [
  { category: 'Morning Routines', improvement: '+15%', cultural: 'Traditional practices boost wellness' },
  { category: 'Family Time', improvement: '+23%', cultural: 'Collective activities enhance joy' },
  { category: 'Community Events', improvement: '+18%', cultural: 'Cultural gatherings increase connection' },
  { category: 'Spiritual Practice', improvement: '+12%', cultural: 'Regular practice improves peace' }
];

const PersonalCulturalDashboard = () => {
  const [selectedCulture, setSelectedCulture] = useState('mexican');
  const [timeRange, setTimeRange] = useState('week');

  const culturalVisualizations = {
    mexican: {
      title: 'Jardín del Alma (Garden of the Soul)',
      description: 'Your emotions bloom like seasonal flowers in a traditional Mexican garden',
      primaryColor: '#FBBF24',
      secondaryColor: '#F59E0B',
      icon: Flower2,
      metaphor: 'Flowering patterns show your emotional seasons'
    },
    eastasian: {
      title: '心水平衡 (Heart-Water Balance)',
      description: 'Your emotional flow moves like peaceful water through seasons',
      primaryColor: '#A8DADC',
      secondaryColor: '#67E8F9',
      icon: Waves,
      metaphor: 'Water flow represents your emotional balance and harmony'
    },
    african: {
      title: 'Ubuntu Tree of Strength',
      description: 'Your growth reflects individual and community resilience',
      primaryColor: '#6B7280',
      secondaryColor: '#9CA3AF',
      icon: TreePine,
      metaphor: 'Tree growth shows individual and collective strength'
    },
    arab: {
      title: 'رحلة الواحة (Oasis Journey)',
      description: 'Your resilience journey from desert challenges to oasis peace',
      primaryColor: '#1E3A8A',
      secondaryColor: '#3B82F6',
      icon: Star,
      metaphor: 'Desert to oasis journey represents resilience and growth'
    }
  };

  const currentVisualization = culturalVisualizations[selectedCulture as keyof typeof culturalVisualizations];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-wisdom mb-2">Personal Cultural Wellness Dashboard</h2>
          <p className="text-gentle">Your unique journey visualized with love and cultural understanding</p>
        </div>
        
        <div className="flex gap-2">
          {Object.entries(culturalVisualizations).map(([key, viz]) => (
            <Button
              key={key}
              variant={selectedCulture === key ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCulture(key)}
              className={selectedCulture === key ? "bg-primary text-white" : ""}
            >
              <viz.icon className="w-4 h-4 mr-1" />
              {viz.title.split(' ')[0]}
            </Button>
          ))}
        </div>
      </div>

      {/* Cultural Metaphor Card */}
      <Card className="card-warm p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: `${currentVisualization.primaryColor}20` }}>
            <currentVisualization.icon className="w-6 h-6" style={{ color: currentVisualization.primaryColor }} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-wisdom">{currentVisualization.title}</h3>
            <p className="text-gentle text-sm">{currentVisualization.description}</p>
          </div>
        </div>
        <div className="p-4 bg-background/50 rounded-lg">
          <p className="text-sm text-gentle italic">{currentVisualization.metaphor}</p>
        </div>
      </Card>

      {/* Emotional Trends Chart */}
      <Card className="card-embrace p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-wisdom">48-Dimensional Emotional Journey</h3>
          <div className="flex gap-2">
            {['week', 'month', 'quarter'].map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeRange(range)}
              >
                {range}
              </Button>
            ))}
          </div>
        </div>
        
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={emotionalTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                stroke="#6B7280"
                fontSize={12}
                tick={{ fill: '#6B7280' }}
              />
              <YAxis 
                stroke="#6B7280"
                fontSize={12}
                tick={{ fill: '#6B7280' }}
                domain={[0, 10]}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="joy" 
                stackId="1" 
                stroke={currentVisualization.primaryColor} 
                fill={`${currentVisualization.primaryColor}40`}
                name="Joy & Gratitude"
              />
              <Area 
                type="monotone" 
                dataKey="peace" 
                stackId="1" 
                stroke="#A8DADC" 
                fill="#A8DADC40"
                name="Inner Peace"
              />
              <Area 
                type="monotone" 
                dataKey="connection" 
                stackId="1" 
                stroke="#6B7280" 
                fill="#6B728040"
                name="Social Connection"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Cultural Factors Impact */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="card-embrace p-6">
          <h3 className="text-lg font-semibold text-wisdom mb-4">Cultural Influence on Wellness</h3>
          <div className="space-y-4">
            {culturalInfluenceData.map((factor, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-wisdom">{factor.factor}</span>
                  <span className="text-sm text-primary font-semibold">{factor.impact}%</span>
                </div>
                <div className="w-full bg-secondary/20 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${factor.impact}%`, 
                      backgroundColor: factor.color 
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="card-embrace p-6">
          <h3 className="text-lg font-semibold text-wisdom mb-4">Wellness Insights</h3>
          <div className="space-y-4">
            {wellnessInsightData.map((insight, index) => (
              <div key={index} className="p-4 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-wisdom">{insight.category}</span>
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    {insight.improvement}
                  </Badge>
                </div>
                <p className="text-sm text-gentle">{insight.cultural}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

const PredictiveIntelligenceCenter = () => {
  const predictionData = [
    {
      timeframe: 'Next 3 Days',
      prediction: 'Gentle emotional dip expected',
      confidence: 78,
      culturalContext: 'Family gathering stress (common pattern)',
      suggestions: [
        'Schedule quiet time before family events',
        'Practice traditional breathing exercises',
        'Connect with supportive family member early'
      ],
      severity: 'low'
    },
    {
      timeframe: 'Next Week',
      prediction: 'Wellness upturn likely',
      confidence: 85,
      culturalContext: 'Cultural celebration approaching',
      suggestions: [
        'Plan meaningful participation in festivities',
        'Prepare traditional foods mindfully',
        'Invite community connection opportunities'
      ],
      severity: 'positive'
    },
    {
      timeframe: 'Next Month',
      prediction: 'Seasonal adjustment period',
      confidence: 72,
      culturalContext: 'Weather change affects cultural routines',
      suggestions: [
        'Adapt cultural practices for season',
        'Maintain community connections indoors',
        'Explore seasonal traditional activities'
      ],
      severity: 'medium'
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'positive': return 'border-green-300 bg-green-50';
      case 'low': return 'border-yellow-300 bg-yellow-50';
      case 'medium': return 'border-orange-300 bg-orange-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'positive': return <Sparkles className="w-5 h-5 text-green-600" />;
      case 'low': return <Sun className="w-5 h-5 text-yellow-600" />;
      case 'medium': return <AlertCircle className="w-5 h-5 text-orange-600" />;
      default: return <Heart className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-wisdom mb-2">Predictive Intelligence Center</h2>
        <p className="text-gentle">Gentle foresight for better wellness, honoring your cultural patterns</p>
      </div>

      {/* Predictive Cards */}
      <div className="grid gap-6">
        {predictionData.map((prediction, index) => (
          <Card key={index} className={`p-6 border-l-4 ${getSeverityColor(prediction.severity)}`}>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-1">
                {getSeverityIcon(prediction.severity)}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-wisdom">{prediction.prediction}</h3>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{prediction.timeframe}</Badge>
                    <Badge className="bg-primary/10 text-primary border-primary/30">
                      {prediction.confidence}% confidence
                    </Badge>
                  </div>
                </div>

                <p className="text-gentle mb-4 italic">{prediction.culturalContext}</p>

                <div>
                  <h4 className="font-medium text-wisdom mb-2">Culturally-Informed Suggestions:</h4>
                  <ul className="space-y-2">
                    {prediction.suggestions.map((suggestion, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                        <span className="text-sm text-gentle">{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Prediction Settings */}
      <Card className="card-warm p-6">
        <div className="flex items-center gap-4 mb-4">
          <Shield className="w-6 h-6 text-primary" />
          <div>
            <h3 className="font-semibold text-wisdom">Cultural Privacy & Prediction Settings</h3>
            <p className="text-gentle text-sm">Control how your cultural data informs predictions</p>
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 bg-background/50 rounded-lg">
            <h4 className="font-medium text-wisdom mb-2">Family Involvement</h4>
            <p className="text-sm text-gentle">Include family patterns in predictions</p>
            <Button size="sm" variant="outline" className="mt-2">Configure</Button>
          </div>
          
          <div className="p-4 bg-background/50 rounded-lg">
            <h4 className="font-medium text-wisdom mb-2">Cultural Events</h4>
            <p className="text-sm text-gentle">Factor in cultural calendar events</p>
            <Button size="sm" variant="outline" className="mt-2">Configure</Button>
          </div>
          
          <div className="p-4 bg-background/50 rounded-lg">
            <h4 className="font-medium text-wisdom mb-2">Community Trends</h4>
            <p className="text-sm text-gentle">Learn from community patterns</p>
            <Button size="sm" variant="outline" className="mt-2">Configure</Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

const EnvironmentalWellnessInsights = () => {
  const environmentalData = [
    { environment: 'Home', wellness: 8.5, cultural: 'Traditional family space' },
    { environment: 'Community Center', wellness: 7.8, cultural: 'Cultural gathering place' },
    { environment: 'Workplace', wellness: 6.2, cultural: 'Professional environment' },
    { environment: 'Nature/Park', wellness: 8.9, cultural: 'Spiritual connection space' },
    { environment: 'Religious/Spiritual', wellness: 9.1, cultural: 'Sacred cultural space' },
    { environment: 'Shopping/Market', wellness: 6.8, cultural: 'Community interaction' }
  ];

  const timePatternData = [
    { time: '6 AM', wellness: 7.2, activity: 'Morning prayers/meditation' },
    { time: '9 AM', wellness: 6.8, activity: 'Work transition' },
    { time: '12 PM', wellness: 7.5, activity: 'Family meal time' },
    { time: '3 PM', wellness: 6.9, activity: 'Afternoon focus' },
    { time: '6 PM', wellness: 8.2, activity: 'Family gathering' },
    { time: '9 PM', wellness: 7.8, activity: 'Evening reflection' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-wisdom mb-2">Environmental Wellness Insights</h2>
        <p className="text-gentle">How your surroundings affect your cultural well-being</p>
      </div>

      {/* Spatial Wellness Map */}
      <Card className="card-embrace p-6">
        <h3 className="text-lg font-semibold text-wisdom mb-4">Spatial Wellness Mapping</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-wisdom mb-3">Wellness by Environment</h4>
            <div className="space-y-3">
              {environmentalData.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-background to-secondary/5 rounded-lg">
                  <div>
                    <span className="font-medium text-wisdom">{item.environment}</span>
                    <p className="text-xs text-gentle">{item.cultural}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-secondary/20 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-primary transition-all duration-300"
                        style={{ width: `${item.wellness * 10}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-primary">{item.wellness}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-wisdom mb-3">Daily Rhythm Patterns</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timePatternData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="time" 
                    stroke="#6B7280"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#6B7280"
                    fontSize={12}
                    domain={[5, 10]}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="wellness" 
                    stroke="#FBBF24" 
                    strokeWidth={3}
                    dot={{ fill: '#FBBF24', strokeWidth: 2, r: 4 }}
                    name="Wellness Level"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </Card>

      {/* Cultural Activity Recommendations */}
      <Card className="card-warm p-6">
        <div className="flex items-center gap-3 mb-4">
          <MapPin className="w-6 h-6 text-primary" />
          <div>
            <h3 className="font-semibold text-wisdom">Cultural Activity Recommendations</h3>
            <p className="text-gentle text-sm">Environment-based suggestions that honor your cultural practices</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 bg-background/50 rounded-lg border border-primary/20">
            <h4 className="font-medium text-wisdom mb-2">🏡 Home Environment</h4>
            <ul className="text-sm text-gentle space-y-1">
              <li>• Create traditional altar/sacred space</li>
              <li>• Cook ancestral recipes mindfully</li>
              <li>• Display cultural artifacts</li>
              <li>• Practice family meditation</li>
            </ul>
          </div>

          <div className="p-4 bg-background/50 rounded-lg border border-secondary/20">
            <h4 className="font-medium text-wisdom mb-2">🌳 Nature Spaces</h4>
            <ul className="text-sm text-gentle space-y-1">
              <li>• Traditional walking meditation</li>
              <li>• Seasonal cultural ceremonies</li>
              <li>• Collect meaningful natural items</li>
              <li>• Community outdoor gatherings</li>
            </ul>
          </div>

          <div className="p-4 bg-background/50 rounded-lg border border-accent/20">
            <h4 className="font-medium text-wisdom mb-2">🏛️ Community Spaces</h4>
            <ul className="text-sm text-gentle space-y-1">
              <li>• Join cultural celebration planning</li>
              <li>• Participate in traditional arts</li>
              <li>• Share stories with elders</li>
              <li>• Volunteer for community events</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Seasonal Cultural Patterns */}
      <Card className="card-embrace p-6">
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="w-6 h-6 text-secondary" />
          <div>
            <h3 className="font-semibold text-wisdom">Seasonal Cultural Wellness Patterns</h3>
            <p className="text-gentle text-sm">How time and environment interact with your cultural background</p>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          {['Spring', 'Summer', 'Fall', 'Winter'].map((season, index) => (
            <div key={season} className="text-center p-4 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg">
              <div className="text-2xl mb-2">
                {index === 0 && '🌸'}
                {index === 1 && '☀️'}
                {index === 2 && '🍂'}
                {index === 3 && '❄️'}
              </div>
              <h4 className="font-medium text-wisdom mb-2">{season}</h4>
              <div className="text-sm text-gentle">
                {index === 0 && 'New beginnings, family renewal'}
                {index === 1 && 'Community celebrations, outdoor traditions'}
                {index === 2 && 'Gratitude practices, harvest customs'}
                {index === 3 && 'Reflection time, indoor family bonds'}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default PersonalCulturalDashboard;
export { PredictiveIntelligenceCenter, EnvironmentalWellnessInsights };