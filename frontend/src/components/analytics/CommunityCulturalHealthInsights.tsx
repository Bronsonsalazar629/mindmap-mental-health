import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
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
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { 
  Users, 
  TrendingUp, 
  Shield, 
  Heart, 
  Globe,
  Star,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Calendar,
  Eye,
  EyeOff
} from "lucide-react";

const communityTrendData = [
  { month: 'Jan', wellness: 7.2, participation: 85, resources: 12 },
  { month: 'Feb', wellness: 7.5, participation: 88, resources: 14 },
  { month: 'Mar', wellness: 7.1, participation: 82, resources: 13 },
  { month: 'Apr', wellness: 7.8, participation: 91, resources: 16 },
  { month: 'May', wellness: 8.2, participation: 94, resources: 18 },
  { month: 'Jun', wellness: 8.0, participation: 90, resources: 17 }
];

const resourceEffectivenessData = [
  { resource: 'Family Therapy', effectiveness: 92, culturalRating: 4.8, usage: 78 },
  { resource: 'Community Circles', effectiveness: 88, culturalRating: 4.9, usage: 85 },
  { resource: 'Spiritual Counseling', effectiveness: 85, culturalRating: 4.7, usage: 62 },
  { resource: 'Peer Support Groups', effectiveness: 82, culturalRating: 4.6, usage: 71 },
  { resource: 'Cultural Art Therapy', effectiveness: 89, culturalRating: 4.8, usage: 54 },
  { resource: 'Traditional Healing', effectiveness: 87, culturalRating: 4.9, usage: 48 }
];

const communityResilienceData = [
  { strength: 'Extended Family Networks', score: 94, description: 'Strong multi-generational support systems' },
  { strength: 'Cultural Celebrations', score: 89, description: 'Regular community gatherings boost collective wellness' },
  { strength: 'Spiritual Practices', score: 86, description: 'Shared religious and spiritual traditions' },
  { strength: 'Language Preservation', score: 78, description: 'Maintaining cultural identity through language' },
  { strength: 'Traditional Knowledge', score: 82, description: 'Elder wisdom and traditional healing practices' },
  { strength: 'Economic Cooperation', score: 75, description: 'Community-based mutual aid and support' }
];

const CommunityCulturalHealthInsights = () => {
  const [isContributing, setIsContributing] = useState(false);
  const [privacyLevel, setPrivacyLevel] = useState('community');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-wisdom mb-2">Community Cultural Health Insights</h2>
          <p className="text-gentle">Anonymous wisdom from your cultural community</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={isContributing ? "default" : "outline"}
            onClick={() => setIsContributing(!isContributing)}
            className={isContributing ? "bg-primary text-white" : ""}
          >
            {isContributing ? <Eye className="w-4 h-4 mr-2" /> : <EyeOff className="w-4 h-4 mr-2" />}
            {isContributing ? 'Contributing Data' : 'Contribute Anonymously'}
          </Button>
        </div>
      </div>

      {/* Community Trends Overview */}
      <Card className="card-embrace p-6">
        <h3 className="text-lg font-semibold text-wisdom mb-4">Cultural Community Wellness Trends</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={communityTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="month" 
                stroke="#6B7280"
                fontSize={12}
              />
              <YAxis 
                stroke="#6B7280"
                fontSize={12}
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
                dataKey="wellness" 
                stroke="#FBBF24" 
                fill="#FBBF2440"
                name="Community Wellness (0-10)"
              />
              <Area 
                type="monotone" 
                dataKey="participation" 
                stroke="#A8DADC" 
                fill="#A8DADC40"
                name="Cultural Participation (%)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 grid md:grid-cols-3 gap-4">
          <div className="text-center p-3 bg-primary/5 rounded-lg">
            <div className="text-2xl font-bold text-primary">8.0</div>
            <div className="text-sm text-gentle">Average Community Wellness</div>
          </div>
          <div className="text-center p-3 bg-secondary/5 rounded-lg">
            <div className="text-2xl font-bold text-secondary">89%</div>
            <div className="text-sm text-gentle">Cultural Participation Rate</div>
          </div>
          <div className="text-center p-3 bg-accent/5 rounded-lg">
            <div className="text-2xl font-bold text-accent">16</div>
            <div className="text-sm text-gentle">Active Cultural Resources</div>
          </div>
        </div>
      </Card>

      {/* Resource Effectiveness */}
      <Card className="card-embrace p-6">
        <h3 className="text-lg font-semibold text-wisdom mb-4">Cultural Resource Effectiveness</h3>
        <div className="space-y-4">
          {resourceEffectivenessData.map((resource, index) => (
            <div key={index} className="p-4 bg-gradient-to-r from-background to-primary/5 rounded-lg border border-border/50">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-wisdom">{resource.resource}</h4>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-800">
                    {resource.effectiveness}% effective
                  </Badge>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium">{resource.culturalRating}</span>
                  </div>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-gentle">Community Usage</span>
                  <div className="w-full bg-secondary/20 rounded-full h-2 mt-1">
                    <div 
                      className="h-2 rounded-full bg-primary transition-all duration-300"
                      style={{ width: `${resource.usage}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-primary font-medium">{resource.usage}% of community</span>
                </div>
                
                <div>
                  <span className="text-xs text-gentle">Cultural Competency</span>
                  <div className="w-full bg-secondary/20 rounded-full h-2 mt-1">
                    <div 
                      className="h-2 rounded-full bg-secondary transition-all duration-300"
                      style={{ width: `${resource.culturalRating * 20}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-secondary font-medium">{resource.culturalRating}/5 cultural rating</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Community Resilience Patterns */}
      <Card className="card-warm p-6">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-6 h-6 text-primary" />
          <div>
            <h3 className="font-semibold text-wisdom">Cultural Resilience Patterns</h3>
            <p className="text-gentle text-sm">Celebration of community strengths and traditional coping mechanisms</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            {communityResilienceData.slice(0, 3).map((strength, index) => (
              <div key={index} className="p-4 bg-background/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-wisdom">{strength.strength}</h4>
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-2 bg-secondary/20 rounded-full">
                      <div 
                        className="h-2 rounded-full bg-primary transition-all duration-300"
                        style={{ width: `${strength.score}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-primary">{strength.score}%</span>
                  </div>
                </div>
                <p className="text-sm text-gentle">{strength.description}</p>
              </div>
            ))}
          </div>
          
          <div className="space-y-4">
            {communityResilienceData.slice(3).map((strength, index) => (
              <div key={index} className="p-4 bg-background/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-wisdom">{strength.strength}</h4>
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-2 bg-secondary/20 rounded-full">
                      <div 
                        className="h-2 rounded-full bg-primary transition-all duration-300"
                        style={{ width: `${strength.score}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-primary">{strength.score}%</span>
                  </div>
                </div>
                <p className="text-sm text-gentle">{strength.description}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Community Event Impact */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="card-embrace p-6">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-6 h-6 text-secondary" />
            <div>
              <h3 className="font-semibold text-wisdom">Cultural Event Impact</h3>
              <p className="text-gentle text-sm">How celebrations affect community wellness</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div>
                <span className="font-medium text-green-800">Lunar New Year</span>
                <p className="text-xs text-green-600">+18% community wellness boost</p>
              </div>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div>
                <span className="font-medium text-blue-800">Día de los Muertos</span>
                <p className="text-xs text-blue-600">+22% family connection increase</p>
              </div>
              <Heart className="w-5 h-5 text-blue-600" />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <div>
                <span className="font-medium text-purple-800">Ramadan</span>
                <p className="text-xs text-purple-600">+15% spiritual wellness growth</p>
              </div>
              <Star className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="card-embrace p-6">
          <div className="flex items-center gap-3 mb-4">
            <MapPin className="w-6 h-6 text-accent" />
            <div>
              <h3 className="font-semibold text-wisdom">Resource Gap Analysis</h3>
              <p className="text-gentle text-sm">Underserved areas in our community</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div>
                <span className="font-medium text-yellow-800">Youth Mental Health</span>
                <p className="text-xs text-yellow-600">Only 3 culturally-aware providers</p>
              </div>
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
              <div>
                <span className="font-medium text-red-800">Elder Care Services</span>
                <p className="text-xs text-red-600">Wait time: 6-8 weeks average</p>
              </div>
              <Clock className="w-5 h-5 text-red-600" />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div>
                <span className="font-medium text-green-800">Family Counseling</span>
                <p className="text-xs text-green-600">Well-served with 12 providers</p>
              </div>
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Privacy and Contribution Settings */}
      <Card className="card-warm p-6">
        <div className="flex items-center gap-4 mb-4">
          <Shield className="w-6 h-6 text-primary" />
          <div>
            <h3 className="font-semibold text-wisdom">Data Sovereignty & Community Contribution</h3>
            <p className="text-gentle text-sm">Control how your cultural data helps the community</p>
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 bg-background/50 rounded-lg border border-border/50">
            <h4 className="font-medium text-wisdom mb-2">🔒 Privacy Level</h4>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input 
                  type="radio" 
                  name="privacy" 
                  value="individual"
                  checked={privacyLevel === 'individual'}
                  onChange={(e) => setPrivacyLevel(e.target.value)}
                  className="text-primary"
                />
                <span className="text-sm">Individual only</span>
              </label>
              <label className="flex items-center gap-2">
                <input 
                  type="radio" 
                  name="privacy" 
                  value="community"
                  checked={privacyLevel === 'community'}
                  onChange={(e) => setPrivacyLevel(e.target.value)}
                  className="text-primary"
                />
                <span className="text-sm">Help cultural community</span>
              </label>
              <label className="flex items-center gap-2">
                <input 
                  type="radio" 
                  name="privacy" 
                  value="research"
                  checked={privacyLevel === 'research'}
                  onChange={(e) => setPrivacyLevel(e.target.value)}
                  className="text-primary"
                />
                <span className="text-sm">Support research</span>
              </label>
            </div>
          </div>
          
          <div className="p-4 bg-background/50 rounded-lg border border-border/50">
            <h4 className="font-medium text-wisdom mb-2">👥 Community Impact</h4>
            <div className="space-y-2 text-sm text-gentle">
              <p>• Your anonymous data helps identify resource gaps</p>
              <p>• Contributes to cultural competency research</p>
              <p>• Improves community wellness programs</p>
              <p>• Guides policy for cultural mental health</p>
            </div>
          </div>
          
          <div className="p-4 bg-background/50 rounded-lg border border-border/50">
            <h4 className="font-medium text-wisdom mb-2">🛡️ Cultural Protection</h4>
            <div className="space-y-2 text-sm text-gentle">
              <p>• No individual identification possible</p>
              <p>• Cultural elders review data use</p>
              <p>• Community consent for all insights</p>
              <p>• Bias detection and prevention</p>
            </div>
          </div>
        </div>
        
        <div className="mt-4 flex justify-center">
          <Button className="btn-sunrise">
            <Shield className="w-4 h-4 mr-2" />
            Update Privacy Preferences
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default CommunityCulturalHealthInsights;