import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  RadialBarChart,
  RadialBar,
  PieChart,
  Pie,
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { 
  Stethoscope, 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  BookOpen,
  MessageCircle,
  Calendar,
  Clock,
  Globe,
  Heart,
  Star,
  Shield,
  FileText,
  Search,
  Filter
} from "lucide-react";

const patientCulturalData = [
  { culture: 'Latino/Hispanic', patients: 245, satisfaction: 4.2, culturalMatch: 78 },
  { culture: 'East Asian', patients: 189, satisfaction: 4.0, culturalMatch: 65 },
  { culture: 'African American', patients: 156, satisfaction: 4.3, culturalMatch: 82 },
  { culture: 'Middle Eastern', patients: 98, satisfaction: 3.8, culturalMatch: 58 },
  { culture: 'European', patients: 203, satisfaction: 4.1, culturalMatch: 75 },
  { culture: 'Indigenous', patients: 67, satisfaction: 4.5, culturalMatch: 89 }
];

const culturalAdaptationData = [
  { month: 'Jan', directCommunication: 65, indirectCommunication: 35, familyInvolvement: 78 },
  { month: 'Feb', directCommunication: 68, indirectCommunication: 32, familyInvolvement: 80 },
  { month: 'Mar', directCommunication: 62, indirectCommunication: 38, familyInvolvement: 75 },
  { month: 'Apr', directCommunication: 70, indirectCommunication: 30, familyInvolvement: 83 },
  { month: 'May', directCommunication: 67, indirectCommunication: 33, familyInvolvement: 79 },
  { month: 'Jun', directCommunication: 71, indirectCommunication: 29, familyInvolvement: 85 }
];

const treatmentOutcomesData = [
  { treatment: 'Individual Therapy', standard: 72, culturallyAdapted: 89, improvement: '+17%' },
  { treatment: 'Family Therapy', standard: 78, culturallyAdapted: 94, improvement: '+16%' },
  { treatment: 'Group Support', standard: 65, culturallyAdapted: 82, improvement: '+17%' },
  { treatment: 'Crisis Intervention', standard: 68, culturallyAdapted: 85, improvement: '+17%' },
  { treatment: 'Medication Management', standard: 74, culturallyAdapted: 88, improvement: '+14%' },
  { treatment: 'Spiritual Counseling', standard: 69, culturallyAdapted: 92, improvement: '+23%' }
];

const culturalCompetencyMetrics = [
  { provider: 'Dr. Sarah Chen', score: 4.8, patients: 125, specialties: ['East Asian', 'Bicultural identity'] },
  { provider: 'Dr. Maria Rodriguez', score: 4.9, patients: 142, specialties: ['Latino/Hispanic', 'Familismo'] },
  { provider: 'Dr. Kwame Asante', score: 4.7, patients: 98, specialties: ['African diaspora', 'Community healing'] },
  { provider: 'Dr. Fatima Al-Zahra', score: 4.6, patients: 87, specialties: ['Middle Eastern', 'Islamic counseling'] }
];

const HealthcareProviderInsights = () => {
  const [selectedCulture, setSelectedCulture] = useState('all');
  const [viewMode, setViewMode] = useState<'overview' | 'cultural' | 'outcomes' | 'guidance'>('overview');

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="card-embrace p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="text-xl font-bold text-wisdom">958</div>
              <div className="text-sm text-gentle">Total Patients</div>
            </div>
          </div>
        </Card>
        
        <Card className="card-embrace p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
              <Star className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <div className="text-xl font-bold text-wisdom">4.3</div>
              <div className="text-sm text-gentle">Avg Cultural Satisfaction</div>
            </div>
          </div>
        </Card>
        
        <Card className="card-embrace p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-accent" />
            </div>
            <div>
              <div className="text-xl font-bold text-wisdom">+18%</div>
              <div className="text-sm text-gentle">Cultural Adaptation Impact</div>
            </div>
          </div>
        </Card>
        
        <Card className="card-embrace p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <Shield className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-xl font-bold text-wisdom">76%</div>
              <div className="text-sm text-gentle">Cultural Match Success</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Patient Cultural Distribution */}
      <Card className="card-embrace p-6">
        <h3 className="text-lg font-semibold text-wisdom mb-4">Patient Cultural Distribution & Satisfaction</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={patientCulturalData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="culture" 
                stroke="#6B7280"
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                stroke="#6B7280"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Bar 
                dataKey="patients" 
                fill="#FBBF24" 
                name="Number of Patients"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Cultural Competency Leaderboard */}
      <Card className="card-embrace p-6">
        <h3 className="text-lg font-semibold text-wisdom mb-4">Cultural Competency Leadership</h3>
        <div className="space-y-4">
          {culturalCompetencyMetrics.map((provider, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-background to-primary/5 rounded-lg border border-border/50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-semibold text-primary">
                  {index + 1}
                </div>
                <div>
                  <h4 className="font-medium text-wisdom">{provider.provider}</h4>
                  <div className="flex gap-2 mt-1">
                    {provider.specialties.map((specialty, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="font-semibold text-wisdom">{provider.patients}</div>
                  <div className="text-xs text-gentle">patients</div>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="font-semibold text-wisdom">{provider.score}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderCulturalAnalysis = () => (
    <div className="space-y-6">
      {/* Communication Style Adaptation */}
      <Card className="card-embrace p-6">
        <h3 className="text-lg font-semibold text-wisdom mb-4">Cultural Communication Adaptation Trends</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={culturalAdaptationData}>
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
                  borderRadius: '8px'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="directCommunication" 
                stackId="1" 
                stroke="#FBBF24" 
                fill="#FBBF2440"
                name="Direct Communication Style"
              />
              <Area 
                type="monotone" 
                dataKey="indirectCommunication" 
                stackId="1" 
                stroke="#A8DADC" 
                fill="#A8DADC40"
                name="Indirect Communication Style"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Cultural Context Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="card-warm p-6">
          <div className="flex items-center gap-3 mb-4">
            <MessageCircle className="w-6 h-6 text-primary" />
            <h3 className="font-semibold text-wisdom">Communication Patterns</h3>
          </div>
          <div className="space-y-3">
            <div className="p-3 bg-background/50 rounded-lg">
              <h4 className="text-sm font-medium text-wisdom mb-1">High-Context Cultures</h4>
              <p className="text-xs text-gentle">Use metaphors, listen for unspoken needs, respect silence</p>
            </div>
            <div className="p-3 bg-background/50 rounded-lg">
              <h4 className="text-sm font-medium text-wisdom mb-1">Low-Context Cultures</h4>
              <p className="text-xs text-gentle">Direct questioning, explicit goal-setting, clear timelines</p>
            </div>
          </div>
        </Card>

        <Card className="card-warm p-6">
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-6 h-6 text-secondary" />
            <h3 className="font-semibold text-wisdom">Family Involvement</h3>
          </div>
          <div className="space-y-3">
            <div className="p-3 bg-background/50 rounded-lg">
              <h4 className="text-sm font-medium text-wisdom mb-1">Collectivist Approach</h4>
              <p className="text-xs text-gentle">Include family in treatment planning, respect hierarchy</p>
            </div>
            <div className="p-3 bg-background/50 rounded-lg">
              <h4 className="text-sm font-medium text-wisdom mb-1">Individual Focus</h4>
              <p className="text-xs text-gentle">Personal autonomy, private sessions, self-determination</p>
            </div>
          </div>
        </Card>

        <Card className="card-warm p-6">
          <div className="flex items-center gap-3 mb-4">
            <Heart className="w-6 h-6 text-accent" />
            <h3 className="font-semibold text-wisdom">Spiritual Integration</h3>
          </div>
          <div className="space-y-3">
            <div className="p-3 bg-background/50 rounded-lg">
              <h4 className="text-sm font-medium text-wisdom mb-1">Faith-Based Healing</h4>
              <p className="text-xs text-gentle">Integrate prayer, spiritual practices, religious leaders</p>
            </div>
            <div className="p-3 bg-background/50 rounded-lg">
              <h4 className="text-sm font-medium text-wisdom mb-1">Secular Approach</h4>
              <p className="text-xs text-gentle">Focus on evidence-based practices, scientific methods</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );

  const renderOutcomes = () => (
    <div className="space-y-6">
      <Card className="card-embrace p-6">
        <h3 className="text-lg font-semibold text-wisdom mb-4">Treatment Outcomes: Standard vs Culturally-Adapted</h3>
        <div className="space-y-4">
          {treatmentOutcomesData.map((treatment, index) => (
            <div key={index} className="p-4 bg-gradient-to-r from-background to-secondary/5 rounded-lg border border-border/50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-wisdom">{treatment.treatment}</h4>
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  {treatment.improvement} improvement
                </Badge>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-gentle">Standard Approach</span>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-gray-400 transition-all duration-300"
                        style={{ width: `${treatment.standard}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-600">{treatment.standard}%</span>
                  </div>
                </div>
                
                <div>
                  <span className="text-xs text-gentle">Culturally-Adapted</span>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-full bg-primary/20 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-primary transition-all duration-300"
                        style={{ width: `${treatment.culturallyAdapted}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-primary">{treatment.culturallyAdapted}%</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderGuidance = () => (
    <div className="space-y-6">
      <Card className="card-warm p-6">
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="w-6 h-6 text-primary" />
          <div>
            <h3 className="font-semibold text-wisdom">Cultural Treatment Adaptation Guide</h3>
            <p className="text-gentle text-sm">Evidence-based guidance for culturally-sensitive care</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="p-4 bg-background/50 rounded-lg border border-primary/20">
              <h4 className="font-medium text-wisdom mb-2 flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-primary" />
                Communication Adaptations
              </h4>
              <ul className="text-sm text-gentle space-y-1">
                <li>• Use cultural metaphors and storytelling</li>
                <li>• Allow for longer relationship-building</li>
                <li>• Respect indirect communication styles</li>
                <li>• Include cultural context in assessments</li>
              </ul>
            </div>

            <div className="p-4 bg-background/50 rounded-lg border border-secondary/20">
              <h4 className="font-medium text-wisdom mb-2 flex items-center gap-2">
                <Users className="w-4 h-4 text-secondary" />
                Family System Integration
              </h4>
              <ul className="text-sm text-gentle space-y-1">
                <li>• Assess family hierarchy and roles</li>
                <li>• Include appropriate family members</li>
                <li>• Respect cultural gender dynamics</li>
                <li>• Honor intergenerational wisdom</li>
              </ul>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-background/50 rounded-lg border border-accent/20">
              <h4 className="font-medium text-wisdom mb-2 flex items-center gap-2">
                <Heart className="w-4 h-4 text-accent" />
                Spiritual & Traditional Healing
              </h4>
              <ul className="text-sm text-gentle space-y-1">
                <li>• Integrate traditional healing practices</li>
                <li>• Collaborate with spiritual leaders</li>
                <li>• Respect religious beliefs and practices</li>
                <li>• Use culturally-meaningful interventions</li>
              </ul>
            </div>

            <div className="p-4 bg-background/50 rounded-lg border border-green-200">
              <h4 className="font-medium text-wisdom mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-green-600" />
                Crisis Intervention Protocols
              </h4>
              <ul className="text-sm text-gentle space-y-1">
                <li>• Consider cultural help-seeking patterns</li>
                <li>• Involve appropriate community leaders</li>
                <li>• Respect cultural crisis expressions</li>
                <li>• Adapt safety planning culturally</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>

      {/* Cultural Competency Resources */}
      <Card className="card-embrace p-6">
        <h3 className="text-lg font-semibold text-wisdom mb-4">Professional Development Resources</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
            <h4 className="font-medium text-wisdom mb-2">📚 Cultural Competency Training</h4>
            <p className="text-sm text-gentle mb-3">Ongoing education modules for diverse populations</p>
            <Button size="sm" className="btn-gentle">Start Training</Button>
          </div>

          <div className="p-4 bg-secondary/5 rounded-lg border border-secondary/20">
            <h4 className="font-medium text-wisdom mb-2">🤝 Cultural Consultation</h4>
            <p className="text-sm text-gentle mb-3">Connect with cultural liaisons and community leaders</p>
            <Button size="sm" className="btn-gentle">Request Consultation</Button>
          </div>

          <div className="p-4 bg-accent/5 rounded-lg border border-accent/20">
            <h4 className="font-medium text-wisdom mb-2">📊 Outcome Tracking</h4>
            <p className="text-sm text-gentle mb-3">Monitor cultural adaptation effectiveness</p>
            <Button size="sm" className="btn-gentle">View Analytics</Button>
          </div>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-wisdom mb-2">Healthcare Provider Cultural Insights</h2>
          <p className="text-gentle">Helping providers understand and honor cultural context in care</p>
        </div>
        
        <div className="flex gap-2">
          {[
            { key: 'overview', label: 'Overview', icon: TrendingUp },
            { key: 'cultural', label: 'Cultural Analysis', icon: Globe },
            { key: 'outcomes', label: 'Outcomes', icon: Star },
            { key: 'guidance', label: 'Guidance', icon: BookOpen }
          ].map(({ key, label, icon: Icon }) => (
            <Button
              key={key}
              variant={viewMode === key ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode(key as any)}
              className={viewMode === key ? "bg-primary text-white" : ""}
            >
              <Icon className="w-4 h-4 mr-1" />
              {label}
            </Button>
          ))}
        </div>
      </div>

      {/* Content based on view mode */}
      {viewMode === 'overview' && renderOverview()}
      {viewMode === 'cultural' && renderCulturalAnalysis()}
      {viewMode === 'outcomes' && renderOutcomes()}
      {viewMode === 'guidance' && renderGuidance()}

      {/* Cultural Respect Notice */}
      <Card className="card-warm p-6">
        <div className="flex items-start gap-4">
          <Shield className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
          <div>
            <h4 className="font-semibold text-wisdom mb-2">Cultural Respect & HIPAA Compliance</h4>
            <p className="text-gentle text-sm leading-relaxed">
              All cultural insights are presented with deep respect for patient privacy and cultural dignity. 
              Data is anonymized and aggregated to protect individual identities while providing meaningful 
              insights for culturally-competent care. Community leaders review all cultural representations 
              to ensure accuracy and respect.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default HealthcareProviderInsights;