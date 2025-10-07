import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  MapPin, 
  Filter, 
  Star, 
  Clock, 
  Phone, 
  Languages, 
  Heart, 
  Users,
  Shield,
  Search,
  Navigation,
  AlertTriangle
} from "lucide-react";

// Mock data for cultural providers
interface Provider {
  id: string;
  name: string;
  type: 'therapist' | 'clinic' | 'community' | 'spiritual' | 'crisis';
  culturalCompetency: 'high' | 'medium' | 'standard';
  languages: string[];
  culturalSpecialties: string[];
  location: { lat: number; lng: number };
  address: string;
  phone: string;
  availability: 'available' | 'busy' | 'unavailable';
  rating: number;
  culturalRating: number;
  insuranceAccepted: string[];
  familyInclusive: boolean;
  genderPreference?: 'male' | 'female' | 'any';
  religiousAffiliation?: string;
  approachStyle: 'formal' | 'informal' | 'mixed';
}

const mockProviders: Provider[] = [
  {
    id: '1',
    name: 'Dr. Maria Gonzalez-Chen',
    type: 'therapist',
    culturalCompetency: 'high',
    languages: ['Spanish', 'English', 'Portuguese'],
    culturalSpecialties: ['Familismo', 'Immigration trauma', 'Bicultural identity'],
    location: { lat: 37.7749, lng: -122.4194 },
    address: '123 Mission St, San Francisco, CA',
    phone: '(415) 555-0123',
    availability: 'available',
    rating: 4.8,
    culturalRating: 4.9,
    insuranceAccepted: ['Medi-Cal', 'Blue Cross', 'United'],
    familyInclusive: true,
    genderPreference: 'any',
    approachStyle: 'mixed'
  },
  {
    id: '2',
    name: 'Healing Circles Community Center',
    type: 'community',
    culturalCompetency: 'high',
    languages: ['English', 'Mandarin', 'Cantonese'],
    culturalSpecialties: ['Collective healing', 'Elder wisdom', 'Family harmony'],
    location: { lat: 37.7849, lng: -122.4094 },
    address: '456 Chinatown Ave, San Francisco, CA',
    phone: '(415) 555-0124',
    availability: 'available',
    rating: 4.7,
    culturalRating: 4.8,
    insuranceAccepted: ['Sliding scale', 'Community funded'],
    familyInclusive: true,
    approachStyle: 'informal'
  },
  {
    id: '3',
    name: 'Imam Abdullah - Spiritual Counselor',
    type: 'spiritual',
    culturalCompetency: 'high',
    languages: ['Arabic', 'English', 'Urdu'],
    culturalSpecialties: ['Islamic counseling', 'Cultural integration', 'Family mediation'],
    location: { lat: 37.7649, lng: -122.4394 },
    address: '789 Peace Mosque, San Francisco, CA',
    phone: '(415) 555-0125',
    availability: 'busy',
    rating: 4.9,
    culturalRating: 5.0,
    insuranceAccepted: ['Donation based'],
    familyInclusive: true,
    religiousAffiliation: 'Islamic',
    approachStyle: 'formal'
  }
];

const ResourceDiscoveryMap = () => {
  const [providers, setProviders] = useState<Provider[]>(mockProviders);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<{
    culturalCompetency: string[];
    languages: string[];
    providerType: string[];
    familyInclusive: boolean;
  }>({
    culturalCompetency: [],
    languages: [],
    providerType: [],
    familyInclusive: false
  });
  const [showCrisis, setShowCrisis] = useState(false);
  const mapContainer = useRef<HTMLDivElement>(null);

  const getCulturalCompetencyColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-primary bg-primary/10 border-primary/30';
      case 'medium': return 'text-secondary bg-secondary/10 border-secondary/30';
      default: return 'text-accent bg-accent/10 border-accent/30';
    }
  };

  const getCulturalCompetencyIcon = (level: string) => {
    switch (level) {
      case 'high': return '⭐';
      case 'medium': return '🔵';
      default: return '⚪';
    }
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available': return 'text-green-600 bg-green-50';
      case 'busy': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-red-600 bg-red-50';
    }
  };

  if (showCrisis) {
    return <CulturalCrisisInterface onBack={() => setShowCrisis(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-primary/5">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-wisdom">Cultural Mental Health Resources</h1>
                <p className="text-sm text-gentle">Find culturally-competent care in your community</p>
              </div>
            </div>
            
            <Button 
              onClick={() => setShowCrisis(true)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Crisis Resources
            </Button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <div className="w-96 bg-card border-r border-border overflow-y-auto">
          {/* Search & Filters */}
          <div className="p-4 border-b border-border">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gentle" />
              <Input
                placeholder="Search by specialty, language, or cultural background..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge className="bg-primary/10 text-primary border-primary/30">
                <Filter className="w-3 h-3 mr-1" />
                Smart Cultural Matching
              </Badge>
              <Badge className="bg-secondary/10 text-secondary border-secondary/30">
                Family-Inclusive Care
              </Badge>
            </div>

            {/* Quick Filters */}
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" className="text-xs">
                <Languages className="w-3 h-3 mr-1" />
                Spanish
              </Button>
              <Button variant="outline" size="sm" className="text-xs">
                <Users className="w-3 h-3 mr-1" />
                Family Therapy
              </Button>
              <Button variant="outline" size="sm" className="text-xs">
                <Heart className="w-3 h-3 mr-1" />
                Trauma-Informed
              </Button>
              <Button variant="outline" size="sm" className="text-xs">
                <Shield className="w-3 h-3 mr-1" />
                LGBTQ+ Affirming
              </Button>
            </div>
          </div>

          {/* Provider List */}
          <div className="p-4 space-y-4">
            {providers.map((provider) => (
              <Card 
                key={provider.id}
                className={`p-4 cursor-pointer transition-all card-embrace hover:shadow-[var(--shadow-embrace)] ${
                  selectedProvider?.id === provider.id ? 'ring-2 ring-primary bg-primary/5' : ''
                }`}
                onClick={() => setSelectedProvider(provider)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-wisdom mb-1">{provider.name}</h3>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className={getCulturalCompetencyColor(provider.culturalCompetency)}>
                        {getCulturalCompetencyIcon(provider.culturalCompetency)} 
                        {provider.culturalCompetency} cultural competency
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium">{provider.culturalRating}</span>
                    </div>
                    <Badge className={getAvailabilityColor(provider.availability)}>
                      <Clock className="w-3 h-3 mr-1" />
                      {provider.availability}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gentle mb-1">Languages:</p>
                    <div className="flex flex-wrap gap-1">
                      {provider.languages.slice(0, 2).map((lang) => (
                        <Badge key={lang} variant="secondary" className="text-xs">
                          {lang}
                        </Badge>
                      ))}
                      {provider.languages.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{provider.languages.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gentle mb-1">Cultural Specialties:</p>
                    <p className="text-sm text-wisdom leading-relaxed">
                      {provider.culturalSpecialties.slice(0, 2).join(', ')}
                      {provider.culturalSpecialties.length > 2 && '...'}
                    </p>
                  </div>

                  {provider.familyInclusive && (
                    <div className="flex items-center gap-1 text-primary">
                      <Users className="w-3 h-3" />
                      <span className="text-xs">Family-inclusive care</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                  <Button size="sm" variant="outline">
                    <Phone className="w-3 h-3 mr-1" />
                    Contact
                  </Button>
                  <Button size="sm" className="btn-gentle">
                    <Navigation className="w-3 h-3 mr-1" />
                    Directions
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Map Area */}
        <div className="flex-1 relative">
          <div 
            ref={mapContainer} 
            className="w-full h-full bg-gradient-to-br from-secondary/20 to-primary/20 flex items-center justify-center"
          >
            {/* Placeholder for actual map */}
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center breathe">
                <MapPin className="w-12 h-12 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-wisdom mb-2">Interactive Cultural Map</h3>
              <p className="text-gentle max-w-md">
                Map integration will show provider locations with cultural competency indicators.
                Click providers in the sidebar to see their location.
              </p>
              <div className="mt-6 flex justify-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">⭐</span>
                  <span className="text-sm text-gentle">High Cultural Competency</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🔵</span>
                  <span className="text-sm text-gentle">Medium Cultural Awareness</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">⚪</span>
                  <span className="text-sm text-gentle">Standard Providers</span>
                </div>
              </div>
            </div>
          </div>

          {/* Selected Provider Details Overlay */}
          {selectedProvider && (
            <div className="absolute bottom-4 left-4 right-4">
              <Card className="card-embrace p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-wisdom mb-1">{selectedProvider.name}</h3>
                    <p className="text-gentle">{selectedProvider.address}</p>
                  </div>
                  <button 
                    onClick={() => setSelectedProvider(null)}
                    className="text-gentle hover:text-wisdom"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-wisdom mb-2">Cultural Competency</h4>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < selectedProvider.culturalRating
                                ? 'text-primary fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-medium">{selectedProvider.culturalRating}/5</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {selectedProvider.culturalSpecialties.map((specialty) => (
                        <Badge key={specialty} variant="secondary" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-wisdom mb-2">Languages & Approach</h4>
                    <p className="text-sm text-gentle mb-2">
                      <strong>Languages:</strong> {selectedProvider.languages.join(', ')}
                    </p>
                    <p className="text-sm text-gentle mb-2">
                      <strong>Approach:</strong> {selectedProvider.approachStyle} style
                    </p>
                    {selectedProvider.religiousAffiliation && (
                      <p className="text-sm text-gentle">
                        <strong>Religious affiliation:</strong> {selectedProvider.religiousAffiliation}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 mt-4">
                  <Button className="btn-sunrise flex-1">
                    <Phone className="w-4 h-4 mr-2" />
                    Contact Provider
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Navigation className="w-4 h-4 mr-2" />
                    Get Directions
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const CulturalCrisisInterface = ({ onBack }: { onBack: () => void }) => {
  const crisisResources = [
    {
      type: 'immediate',
      title: 'Immediate Professional Crisis Support',
      resources: [
        { name: '988 Suicide & Crisis Lifeline', number: '988', languages: ['English', 'Spanish'], available: '24/7' },
        { name: 'Crisis Text Line', number: 'Text HOME to 741741', languages: ['English', 'Spanish'], available: '24/7' },
        { name: 'SAMHSA National Helpline', number: '1-800-662-4357', languages: ['English', 'Spanish'], available: '24/7' }
      ]
    },
    {
      type: 'cultural',
      title: 'Culturally-Specific Crisis Support',
      resources: [
        { name: 'National Suicide Prevention Lifeline (Spanish)', number: '1-888-628-9454', languages: ['Spanish'], available: '24/7' },
        { name: 'LGBT National Hotline', number: '1-888-843-4564', languages: ['English'], available: '4pm-12am EST' },
        { name: 'RAINN National Sexual Assault Hotline', number: '1-800-656-4673', languages: ['English', 'Spanish'], available: '24/7' }
      ]
    },
    {
      type: 'community',
      title: 'Community & Family Support',
      resources: [
        { name: 'Family Elder/Trusted Relative', description: 'Contact your designated family support person', cultural: 'Family-centered approach' },
        { name: 'Community Religious Leader', description: 'Spiritual guidance and community support', cultural: 'Faith-based support' },
        { name: 'Cultural Community Center', description: 'Local cultural center crisis support', cultural: 'Community-based care' }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/10 p-4">
      <div className="max-w-4xl mx-auto py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" onClick={onBack}>
            ← Back to Resources
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-wisdom mb-2">Cultural Crisis Resources</h1>
            <p className="text-gentle">Immediate help that respects your cultural comfort zones</p>
          </div>
        </div>

        {/* Emergency Notice */}
        <Card className="card-embrace p-6 mb-8 border-red-200 bg-red-50">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-red-800 mb-2">If you are in immediate danger:</h3>
              <p className="text-red-700 mb-4">
                Call 911 or go to your nearest emergency room. Your safety is the most important thing.
              </p>
              <div className="flex gap-2">
                <Button className="bg-red-600 hover:bg-red-700 text-white">
                  <Phone className="w-4 h-4 mr-2" />
                  Call 911
                </Button>
                <Button variant="outline" className="border-red-300 text-red-700">
                  Find Emergency Room
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Crisis Resources */}
        <div className="space-y-8">
          {crisisResources.map((category) => (
            <div key={category.type}>
              <h2 className="text-xl font-semibold text-wisdom mb-4">{category.title}</h2>
              <div className="grid gap-4">
                {category.resources.map((resource, index) => (
                  <Card key={index} className="card-embrace p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-wisdom mb-2">{resource.name}</h3>
                        {resource.number && (
                          <div className="flex items-center gap-2 mb-2">
                            <Phone className="w-4 h-4 text-primary" />
                            <span className="font-mono text-lg text-primary">{resource.number}</span>
                          </div>
                        )}
                        {resource.description && (
                          <p className="text-gentle mb-2">{resource.description}</p>
                        )}
                        {resource.cultural && (
                          <div className="flex items-center gap-2 mb-2">
                            <Heart className="w-4 h-4 text-secondary" />
                            <span className="text-sm text-secondary">{resource.cultural}</span>
                          </div>
                        )}
                        {resource.languages && (
                          <div className="flex items-center gap-2 mb-2">
                            <Languages className="w-4 h-4 text-accent" />
                            <span className="text-sm text-accent">
                              {resource.languages.join(', ')}
                            </span>
                          </div>
                        )}
                        {resource.available && (
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-green-600" />
                            <span className="text-sm text-green-600">{resource.available}</span>
                          </div>
                        )}
                      </div>
                      
                      {resource.number && (
                        <Button className="btn-sunrise ml-4">
                          <Phone className="w-4 h-4 mr-2" />
                          Call Now
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Cultural Support Notice */}
        <Card className="card-warm p-6 mt-8">
          <div className="text-center">
            <Heart className="w-8 h-8 text-primary mx-auto mb-3" />
            <h4 className="font-semibold text-wisdom mb-2">Your Cultural Values Matter</h4>
            <p className="text-gentle text-sm max-w-2xl mx-auto leading-relaxed">
              We understand that different cultures have different approaches to crisis and healing. 
              Whether you prefer family involvement, community support, spiritual guidance, or professional help - 
              choose the path that feels right for your heart and your heritage.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ResourceDiscoveryMap;