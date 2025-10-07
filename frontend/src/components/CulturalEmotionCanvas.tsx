import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Palette, Mic, MessageCircle, Heart, Waves, Flower } from "lucide-react";
import culturalSymbols from "@/assets/cultural-symbols.jpg";

interface EmotionSymbol {
  id: string;
  name: string;
  icon: string;
  cultural_origin: string;
  meaning: string;
  color: string;
}

const emotionSymbols: EmotionSymbol[] = [
  {
    id: "lotus",
    name: "Lotus Bloom",
    icon: "🪷",
    cultural_origin: "Buddhist/Hindu traditions",
    meaning: "Rising above challenges with grace",
    color: "text-primary"
  },
  {
    id: "waves",
    name: "Ocean Waves",
    icon: "🌊",
    cultural_origin: "East Asian philosophy",
    meaning: "Flow and adaptability",
    color: "text-secondary"
  },
  {
    id: "marigold",
    name: "Marigold Flower",
    icon: "🌼",
    cultural_origin: "Mexican traditions",
    meaning: "Remembrance and joy",
    color: "text-primary"
  },
  {
    id: "dove",
    name: "Peace Dove",
    icon: "🕊️",
    cultural_origin: "Universal symbol",
    meaning: "Inner tranquility",
    color: "text-secondary"
  },
  {
    id: "tree",
    name: "Ancient Tree",
    icon: "🌳",
    cultural_origin: "African wisdom",
    meaning: "Deep roots and growth",
    color: "text-accent"
  },
  {
    id: "hands",
    name: "Praying Hands",
    icon: "🙏",
    cultural_origin: "Spiritual traditions",
    meaning: "Gratitude and hope",
    color: "text-wisdom"
  }
];

const CulturalEmotionCanvas = () => {
  const [selectedSymbols, setSelectedSymbols] = useState<EmotionSymbol[]>([]);
  const [expressionMode, setExpressionMode] = useState<'visual' | 'voice' | 'text'>('visual');
  const [emotionalCanvas, setEmotionalCanvas] = useState<string>("");

  const toggleSymbol = (symbol: EmotionSymbol) => {
    setSelectedSymbols(prev => {
      const exists = prev.find(s => s.id === symbol.id);
      if (exists) {
        return prev.filter(s => s.id !== symbol.id);
      } else {
        return [...prev, symbol];
      }
    });
  };

  const renderExpressionInterface = () => {
    switch (expressionMode) {
      case 'visual':
        return (
          <div className="space-y-6">
            <div 
              className="relative h-64 rounded-lg bg-cover bg-center border-2 border-dashed border-secondary/30 overflow-hidden"
              style={{ backgroundImage: `url(${culturalSymbols})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-background/80 to-secondary/20"></div>
              <div className="relative z-10 h-full flex flex-wrap items-center justify-center gap-4 p-4">
                {selectedSymbols.map((symbol) => (
                  <div
                    key={symbol.id}
                    className="flex flex-col items-center gap-2 p-3 bg-white/90 rounded-lg shadow-lg transform hover:scale-105 transition-all breathe"
                  >
                    <span className="text-4xl">{symbol.icon}</span>
                    <span className="text-xs font-medium text-wisdom">{symbol.name}</span>
                  </div>
                ))}
                {selectedSymbols.length === 0 && (
                  <div className="text-center text-gentle">
                    <Palette className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Select symbols below to express your emotions</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {emotionSymbols.map((symbol) => (
                <Card
                  key={symbol.id}
                  className={`p-4 cursor-pointer transition-all card-embrace ${
                    selectedSymbols.find(s => s.id === symbol.id) 
                      ? 'ring-2 ring-primary bg-primary/5' 
                      : 'hover:shadow-[var(--shadow-gentle)]'
                  }`}
                  onClick={() => toggleSymbol(symbol)}
                >
                  <div className="text-center">
                    <div className="text-3xl mb-2">{symbol.icon}</div>
                    <h4 className="font-medium text-wisdom text-sm mb-1">{symbol.name}</h4>
                    <p className="text-xs text-gentle">{symbol.cultural_origin}</p>
                    <p className="text-xs text-primary mt-1 italic">{symbol.meaning}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );
      
      case 'voice':
        return (
          <div className="text-center space-y-6">
            <div className="card-warm p-8">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center breathe">
                <Mic className="w-12 h-12 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-wisdom mb-2">Voice Your Heart</h3>
              <p className="text-gentle mb-6">
                Speak in your native language. We understand the emotional tone in over 40 languages.
              </p>
              <Button className="btn-sunrise">
                <Mic className="w-5 h-5 mr-2" />
                Start Voice Expression
              </Button>
            </div>
          </div>
        );
      
      case 'text':
        return (
          <div className="space-y-6">
            <Card className="card-embrace p-6">
              <h3 className="text-lg font-semibold text-wisdom mb-4">Written Expression</h3>
              <textarea
                value={emotionalCanvas}
                onChange={(e) => setEmotionalCanvas(e.target.value)}
                placeholder="Express your feelings in whatever language feels most natural to you..."
                className="w-full h-32 p-4 border border-border rounded-lg bg-background/50 text-wisdom placeholder-gentle resize-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
              <div className="mt-4 flex justify-between items-center">
                <p className="text-sm text-gentle">
                  Cultural context will be honored in our response
                </p>
                <Button className="btn-gentle">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Share Expression
                </Button>
              </div>
            </Card>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-primary/5 p-4">
      <div className="max-w-4xl mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-wisdom mb-2">Cultural Emotion Canvas</h1>
          <p className="text-gentle max-w-2xl mx-auto">
            Express your feelings through symbols, voice, or words that honor your cultural heritage
          </p>
        </div>

        {/* Expression Mode Selector */}
        <div className="flex justify-center mb-8">
          <div className="card-embrace p-2 flex gap-2">
            {[
              { mode: 'visual' as const, icon: Palette, label: 'Visual Symbols' },
              { mode: 'voice' as const, icon: Mic, label: 'Voice Expression' },
              { mode: 'text' as const, icon: MessageCircle, label: 'Written Word' }
            ].map(({ mode, icon: Icon, label }) => (
              <button
                key={mode}
                onClick={() => setExpressionMode(mode)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  expressionMode === mode
                    ? 'bg-primary text-white shadow-[var(--shadow-gentle)]'
                    : 'text-gentle hover:bg-secondary/20'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Expression Interface */}
        {renderExpressionInterface()}

        {/* Cultural Sensitivity Notice */}
        <Card className="card-warm p-6 mt-8">
          <div className="flex items-start gap-4">
            <Heart className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold text-wisdom mb-2">Cultural Sensitivity Promise</h4>
              <p className="text-gentle text-sm leading-relaxed">
                Your emotional expressions are interpreted through a lens of cultural understanding. 
                We honor indirect communication styles, family-centered emotions, spiritual connections, 
                and the beautiful diversity of human emotional experience across all cultures.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CulturalEmotionCanvas;