import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { useEffect, useRef, useState } from "react";
import { detectFaceLandmarks, LIP_INDICES, CHEEK_INDICES, EYE_INDICES } from "@/lib/faceDetection";
import { useToast } from "@/hooks/use-toast";
import { Search, Loader2, Sparkles, Palette } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface VirtualTryOnProps {
  imageUrl: string;
  skinAnalysis: any;
}

interface Recommendation {
  productName: string;
  brand: string;
  shade: string;
  price: number;
  whyItSuits: string;
  category: string;
  type: string;
}

const makeupFilters = [
  {
    id: "lipstick-red",
    name: "Bold Red",
    baseColor: { r: 220, g: 20, b: 60 },
    type: "lipstick",
  },
  {
    id: "lipstick-nude",
    name: "Nude",
    baseColor: { r: 210, g: 140, b: 130 },
    type: "lipstick",
  },
  {
    id: "lipstick-pink",
    name: "Pink Gloss",
    baseColor: { r: 255, g: 105, b: 180 },
    type: "lipstick",
  },
  {
    id: "lipstick-coral",
    name: "Coral",
    baseColor: { r: 255, g: 127, b: 80 },
    type: "lipstick",
  },
  {
    id: "lipstick-berry",
    name: "Berry",
    baseColor: { r: 135, g: 38, b: 87 },
    type: "lipstick",
  },
  {
    id: "lipstick-mauve",
    name: "Mauve",
    baseColor: { r: 224, g: 176, b: 255 },
    type: "lipstick",
  },
  {
    id: "lipstick-brown",
    name: "Brown",
    baseColor: { r: 160, g: 82, b: 45 },
    type: "lipstick",
  },
  {
    id: "foundation-light",
    name: "Light Foundation",
    baseColor: { r: 255, g: 220, b: 200 },
    type: "foundation",
  },
  {
    id: "foundation-medium",
    name: "Medium Foundation",
    baseColor: { r: 205, g: 170, b: 140 },
    type: "foundation",
  },
  {
    id: "blush-pink",
    name: "Pink Blush",
    baseColor: { r: 255, g: 182, b: 193 },
    type: "blush",
  },
  {
    id: "eyeshadow-bronze",
    name: "Bronze",
    baseColor: { r: 205, g: 127, b: 50 },
    type: "eyeshadow",
  },
  {
    id: "eyeshadow-purple",
    name: "Purple",
    baseColor: { r: 147, g: 112, b: 219 },
    type: "eyeshadow",
  },
];

const VirtualTryOn = ({ imageUrl, skinAnalysis }: VirtualTryOnProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [intensity, setIntensity] = useState<number>(50);
  const [landmarks, setLandmarks] = useState<any>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;
    
    img.onload = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      await new Promise(resolve => setTimeout(resolve, 100));

      setIsDetecting(true);
      try {
        console.log("Starting face detection...");
        const detectedLandmarks = await detectFaceLandmarks(img);
        console.log("Face detected successfully!");
        setLandmarks(detectedLandmarks);
        toast({
          title: "Face Detected!",
          description: "Virtual try-on and AI recommendations ready.",
        });
      } catch (error) {
        console.error("Face detection error:", error);
        toast({
          title: "Face Detection Failed",
          description: error instanceof Error ? error.message : "Please try a photo with your face clearly visible and well-lit.",
          variant: "destructive",
        });
      } finally {
        setIsDetecting(false);
      }
    };
  }, [imageUrl, toast]);

  const applyMakeupToRegion = (
    ctx: CanvasRenderingContext2D,
    indices: number[],
    baseColor: { r: number; g: number; b: number },
    width: number,
    height: number,
    blur: number = 8,
    intensityMultiplier: number = 1
  ) => {
    if (!landmarks) return;

    const opacity = (intensity / 100) * intensityMultiplier;

    ctx.save();
    
    ctx.beginPath();
    indices.forEach((index, i) => {
      const point = landmarks[index];
      const x = point.x * width;
      const y = point.y * height;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.closePath();

    ctx.filter = `blur(${blur}px)`;
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, ${opacity})`;
    ctx.fill();
    
    ctx.restore();
  };

  useEffect(() => {
    if (!selectedFilter) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;
    
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      
      const filter = makeupFilters.find((f) => f.id === selectedFilter);
      if (!filter) return;

      if (!landmarks) {
        const fallbackOpacity = (intensity / 100) * 0.5;
        ctx.fillStyle = `rgba(${filter.baseColor.r}, ${filter.baseColor.g}, ${filter.baseColor.b}, ${fallbackOpacity})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        return;
      }

      switch (filter.type) {
        case "lipstick":
          applyMakeupToRegion(ctx, LIP_INDICES.outer, filter.baseColor, canvas.width, canvas.height, 4, 0.5);
          break;
        case "blush":
          applyMakeupToRegion(ctx, CHEEK_INDICES.left, filter.baseColor, canvas.width, canvas.height, 12, 0.35);
          applyMakeupToRegion(ctx, CHEEK_INDICES.right, filter.baseColor, canvas.width, canvas.height, 12, 0.35);
          break;
        case "eyeshadow":
          applyMakeupToRegion(ctx, EYE_INDICES.left, filter.baseColor, canvas.width, canvas.height, 8, 0.3);
          applyMakeupToRegion(ctx, EYE_INDICES.right, filter.baseColor, canvas.width, canvas.height, 8, 0.3);
          break;
        case "foundation":
          const foundationOpacity = (intensity / 100) * 0.2;
          ctx.save();
          ctx.globalCompositeOperation = 'overlay';
          ctx.filter = 'blur(15px)';
          ctx.fillStyle = `rgba(${filter.baseColor.r}, ${filter.baseColor.g}, ${filter.baseColor.b}, ${foundationOpacity})`;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.restore();
          break;
      }
    };
  }, [selectedFilter, imageUrl, landmarks, intensity]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Enter a search query",
        description: "Please describe what product you're looking for",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-shade-recommendations', {
        body: { 
          skinAnalysis,
          searchQuery: searchQuery.trim()
        }
      });

      if (error) throw error;

      if (data?.error) {
        throw new Error(data.error);
      }

      if (data?.recommendations && Array.isArray(data.recommendations)) {
        setRecommendations(data.recommendations);
        toast({
          title: "Personalized Recommendations Ready!",
          description: `Found ${data.recommendations.length} perfect matches for you`,
        });
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search Failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-background to-warm-beige/30">
      <div className="container max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 flex items-center justify-center gap-2">
            <Sparkles className="w-8 h-8 text-rose" />
            AI Virtual Try-On
          </h2>
          <p className="text-lg text-muted-foreground">
            Try makeup filters and get AI-powered shade recommendations
          </p>
          {isDetecting && (
            <p className="text-sm text-rose mt-2 animate-pulse">
              Detecting facial features...
            </p>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Preview Area */}
          <Card className="p-6 shadow-medium bg-card lg:col-span-1">
            <div className="relative aspect-square rounded-lg overflow-hidden shadow-soft">
              <canvas
                ref={canvasRef}
                className="w-full h-full object-cover"
              />
            </div>
            {selectedFilter && (
              <p className="text-center mt-4 text-sm text-muted-foreground">
                Current: {makeupFilters.find((f) => f.id === selectedFilter)?.name}
              </p>
            )}
            {skinAnalysis && (
              <div className="mt-4 p-4 bg-gradient-to-r from-rose-light/20 to-warm-beige/30 rounded-lg">
                <h4 className="font-semibold mb-2 text-sm">Your Analysis</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">Skin Tone:</span>
                    <p className="font-medium capitalize">{skinAnalysis.skinTone}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Undertone:</span>
                    <p className="font-medium capitalize">{skinAnalysis.undertone}</p>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Virtual Try-On Filters */}
          <Card className="p-6 shadow-medium bg-card lg:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <Palette className="w-5 h-5 text-rose" />
              <h3 className="text-xl font-semibold">Try Makeup Filters</h3>
            </div>

            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Lipsticks</h4>
                <div className="grid grid-cols-3 gap-2">
                  {makeupFilters.filter(f => f.type === "lipstick").map((filter) => (
                    <Button
                      key={filter.id}
                      onClick={() => setSelectedFilter(filter.id)}
                      variant={selectedFilter === filter.id ? "default" : "outline"}
                      className={`h-auto py-3 flex flex-col gap-2 ${
                        selectedFilter === filter.id
                          ? "bg-rose hover:bg-rose/90 text-white"
                          : "border-rose/30 hover:border-rose hover:bg-rose/5"
                      }`}
                    >
                      <div
                        className="w-8 h-8 rounded-full shadow-soft border-2 border-white"
                        style={{ backgroundColor: `rgb(${filter.baseColor.r}, ${filter.baseColor.g}, ${filter.baseColor.b})` }}
                      />
                      <span className="text-xs font-medium">{filter.name}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Foundation</h4>
                <div className="grid grid-cols-2 gap-3">
                  {makeupFilters.filter(f => f.type === "foundation").map((filter) => (
                    <Button
                      key={filter.id}
                      onClick={() => setSelectedFilter(filter.id)}
                      variant={selectedFilter === filter.id ? "default" : "outline"}
                      className={`h-auto py-4 flex flex-col gap-2 ${
                        selectedFilter === filter.id
                          ? "bg-rose hover:bg-rose/90 text-white"
                          : "border-rose/30 hover:border-rose hover:bg-rose/5"
                      }`}
                    >
                      <div
                        className="w-10 h-10 rounded-full shadow-soft border-2 border-white"
                        style={{ backgroundColor: `rgb(${filter.baseColor.r}, ${filter.baseColor.g}, ${filter.baseColor.b})` }}
                      />
                      <span className="text-xs font-medium">{filter.name}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Blush & Eyeshadow</h4>
                <div className="grid grid-cols-2 gap-3">
                  {makeupFilters.filter(f => f.type === "blush" || f.type === "eyeshadow").map((filter) => (
                    <Button
                      key={filter.id}
                      onClick={() => setSelectedFilter(filter.id)}
                      variant={selectedFilter === filter.id ? "default" : "outline"}
                      className={`h-auto py-4 flex flex-col gap-2 ${
                        selectedFilter === filter.id
                          ? "bg-rose hover:bg-rose/90 text-white"
                          : "border-rose/30 hover:border-rose hover:bg-rose/5"
                      }`}
                    >
                      <div
                        className="w-10 h-10 rounded-full shadow-soft border-2 border-white"
                        style={{ backgroundColor: `rgb(${filter.baseColor.r}, ${filter.baseColor.g}, ${filter.baseColor.b})` }}
                      />
                      <span className="text-xs font-medium">{filter.name}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {selectedFilter && (
                <div className="space-y-3 pt-4 border-t">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-foreground">
                        Intensity
                      </label>
                      <span className="text-sm text-muted-foreground">{intensity}%</span>
                    </div>
                    <Slider
                      value={[intensity]}
                      onValueChange={(value) => setIntensity(value[0])}
                      min={0}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                  </div>
                  <Button
                    onClick={() => setSelectedFilter(null)}
                    variant="ghost"
                    className="w-full text-muted-foreground hover:text-foreground"
                  >
                    Clear Filter
                  </Button>
                </div>
              )}
            </div>
          </Card>

          {/* AI Recommendations */}
          <Card className="p-6 shadow-medium bg-card lg:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <Search className="w-5 h-5 text-rose" />
              <h3 className="text-xl font-semibold">AI Recommendations</h3>
            </div>
            
            <div className="flex gap-2 mb-4">
              <Input
                type="text"
                placeholder="e.g., red lipstick, foundation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1"
              />
              <Button 
                onClick={handleSearch} 
                disabled={isAnalyzing}
                className="bg-rose hover:bg-rose/90"
              >
                {isAnalyzing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </Button>
            </div>

            {recommendations.length > 0 && (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {recommendations.map((rec, index) => (
                  <Card key={index} className="p-4 border-rose/20 hover:border-rose/40 transition-colors">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-semibold text-foreground text-sm">{rec.productName}</h5>
                          <p className="text-xs text-muted-foreground">{rec.brand}</p>
                        </div>
                        <span className="text-rose font-bold text-sm">₹{rec.price}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-muted-foreground">Shade:</span>
                        <span className="text-xs font-semibold text-rose">{rec.shade}</span>
                      </div>

                      <p className="text-xs text-foreground/80 leading-relaxed">
                        {rec.whyItSuits}
                      </p>

                      <div className="flex gap-2">
                        <span className="text-xs px-2 py-1 rounded-full bg-rose/10 text-rose capitalize">
                          {rec.type}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {!isAnalyzing && recommendations.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">
                  Search for products to get AI-powered recommendations
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </section>
  );
};

export default VirtualTryOn;
