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
  // New prop to receive data from the bottom component
  externalSelection?: {
    color: { r: number; g: number; b: number };
    type: string;
    productName: string;
  } | null;
}

interface Recommendation {
  productName: string;
  brand: string;
  shade: string;
  price: number;
  whyItSuits: string;
  category: string;
  type: string;
  rgbColor?: {
    r: number;
    g: number;
    b: number;
  };
}

const makeupFilters = [
  { id: "lipstick-red", name: "Bold Red", baseColor: { r: 220, g: 20, b: 60 }, type: "lipstick" },
  { id: "lipstick-nude", name: "Nude", baseColor: { r: 210, g: 140, b: 130 }, type: "lipstick" },
  { id: "lipstick-pink", name: "Pink Gloss", baseColor: { r: 255, g: 105, b: 180 }, type: "lipstick" },
  { id: "lipstick-coral", name: "Coral", baseColor: { r: 255, g: 127, b: 80 }, type: "lipstick" },
  { id: "lipstick-berry", name: "Berry", baseColor: { r: 135, g: 38, b: 87 }, type: "lipstick" },
  { id: "lipstick-mauve", name: "Mauve", baseColor: { r: 224, g: 176, b: 255 }, type: "lipstick" },
  { id: "lipstick-brown", name: "Brown", baseColor: { r: 160, g: 82, b: 45 }, type: "lipstick" },
  { id: "foundation-light", name: "Light Foundation", baseColor: { r: 255, g: 220, b: 200 }, type: "foundation" },
  { id: "foundation-medium", name: "Medium Foundation", baseColor: { r: 205, g: 170, b: 140 }, type: "foundation" },
  { id: "blush-pink", name: "Pink Blush", baseColor: { r: 255, g: 182, b: 193 }, type: "blush" },
  { id: "eyeshadow-bronze", name: "Bronze", baseColor: { r: 205, g: 127, b: 50 }, type: "eyeshadow" },
  { id: "eyeshadow-purple", name: "Purple", baseColor: { r: 147, g: 112, b: 219 }, type: "eyeshadow" },
];

const VirtualTryOn = ({ imageUrl, skinAnalysis, externalSelection }: VirtualTryOnProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [customColor, setCustomColor] = useState<{ r: number; g: number; b: number } | null>(null);
  const [customType, setCustomType] = useState<string | null>(null);
  const [intensity, setIntensity] = useState<number>(50);
  const [landmarks, setLandmarks] = useState<any>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const { toast } = useToast();

  // Listen for external selection changes (from ProductRecommendations)
  useEffect(() => {
    if (externalSelection) {
      setSelectedFilter(null);
      setCustomColor(externalSelection.color);
      setCustomType(externalSelection.type);
      setIntensity(75); // Set a good default intensity
      toast({
        title: "Trying on Product",
        description: `Applied shade for ${externalSelection.productName}`,
      });
    }
  }, [externalSelection, toast]);

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
        const detectedLandmarks = await detectFaceLandmarks(img);
        setLandmarks(detectedLandmarks);
        toast({
          title: "Face Detected!",
          description: "Virtual try-on and AI recommendations ready.",
        });
      } catch (error) {
        toast({
          title: "Face Detection Failed",
          description: "Please try a photo with your face clearly visible.",
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
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.filter = `blur(${blur}px)`;
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, ${opacity})`;
    ctx.fill();
    ctx.restore();
  };

  useEffect(() => {
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
      
      // LOGIC: Use either customColor OR the selectedFilter color
      let colorToApply = customColor;
      let typeToApply = customType;
      
      // If no custom color, check if a preset filter is selected
      if (!colorToApply && selectedFilter) {
        const filter = makeupFilters.find((f) => f.id === selectedFilter);
        if (filter) {
          colorToApply = filter.baseColor;
          typeToApply = filter.type;
        }
      }

      if (colorToApply && typeToApply) {
         if (!landmarks) {
           // Fallback if landmarks failed
            const fallbackOpacity = (intensity / 100) * 0.5;
            ctx.fillStyle = `rgba(${colorToApply.r}, ${colorToApply.g}, ${colorToApply.b}, ${fallbackOpacity})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
         } else {
            // Apply based on type
            switch (typeToApply) {
              case "lipstick":
                applyMakeupToRegion(ctx, LIP_INDICES.outer, colorToApply, canvas.width, canvas.height, 4, 0.5);
                break;
              case "blush":
                applyMakeupToRegion(ctx, CHEEK_INDICES.left, colorToApply, canvas.width, canvas.height, 12, 0.35);
                applyMakeupToRegion(ctx, CHEEK_INDICES.right, colorToApply, canvas.width, canvas.height, 12, 0.35);
                break;
              case "eyeshadow":
                applyMakeupToRegion(ctx, EYE_INDICES.left, colorToApply, canvas.width, canvas.height, 8, 0.3);
                applyMakeupToRegion(ctx, EYE_INDICES.right, colorToApply, canvas.width, canvas.height, 8, 0.3);
                break;
              case "foundation":
                const foundationOpacity = (intensity / 100) * 0.2;
                ctx.save();
                ctx.globalCompositeOperation = 'overlay';
                ctx.filter = 'blur(15px)';
                ctx.fillStyle = `rgba(${colorToApply.r}, ${colorToApply.g}, ${colorToApply.b}, ${foundationOpacity})`;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.restore();
                break;
            }
         }
      }
    };
  }, [selectedFilter, customColor, customType, imageUrl, landmarks, intensity]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({ title: "Enter a search query", variant: "destructive" });
      return;
    }
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-shade-recommendations', {
        body: { skinAnalysis, searchQuery: searchQuery.trim() }
      });
      if (error) throw error;
      if (data?.recommendations) {
        setRecommendations(data.recommendations);
        toast({ title: "Recommendations Ready!", description: `Found ${data.recommendations.length} matches` });
      }
    } catch (error) {
      toast({ title: "Search Failed", description: "Could not fetch AI recommendations.", variant: "destructive" });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleTryOnRecommendation = (rec: Recommendation) => {
    if (!rec.rgbColor) {
      toast({ title: "Cannot apply this shade", variant: "destructive" });
      return;
    }
    setSelectedFilter(null);
    setCustomColor(rec.rgbColor);
    setCustomType(rec.type);
    setIntensity(75); // Reset intensity on click
    toast({ title: "Shade Applied!", description: `Trying on ${rec.shade}` });
  };

  const clearAllFilters = () => {
    setSelectedFilter(null);
    setCustomColor(null);
    setCustomType(null);
  };

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-background to-warm-beige/30">
      <div className="container max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 flex items-center justify-center gap-2">
            <Sparkles className="w-8 h-8 text-rose" />
            AI Virtual Try-On
          </h2>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Preview Area */}
          <Card className="p-6 shadow-medium bg-card lg:col-span-1">
            <div className="relative aspect-square rounded-lg overflow-hidden shadow-soft">
              <canvas ref={canvasRef} className="w-full h-full object-cover" />
            </div>
            
            {/* Show info if something is applied */}
            {(selectedFilter || customColor) && (
              <div className="mt-4 space-y-2">
                {selectedFilter && <p className="text-center text-sm text-muted-foreground">Filter Active</p>}
                {customColor && <p className="text-center text-sm text-rose font-medium">AI Shade Applied</p>}
                <Button onClick={clearAllFilters} variant="outline" size="sm" className="w-full">
                  Clear All
                </Button>
              </div>
            )}
          </Card>

          {/* Virtual Try-On Filters & Slider */}
          <Card className="p-6 shadow-medium bg-card lg:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <Palette className="w-5 h-5 text-rose" />
              <h3 className="text-xl font-semibold">Try Makeup Filters</h3>
            </div>

            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {/* Preset Buttons */}
              <div className="grid grid-cols-3 gap-2">
                 {makeupFilters.filter(f => f.type === "lipstick").slice(0, 3).map(f => (
                   <Button key={f.id} onClick={() => setSelectedFilter(f.id)} 
                     className={`text-xs h-8 ${selectedFilter === f.id ? "bg-rose text-white" : "bg-gray-100 text-black"}`}>
                     {f.name}
                   </Button>
                 ))}
                 {/* ... (Keep your existing map loops for buttons here) ... */}
              </div>

              {/* MODIFIED CONDITION: Show slider if filter OR custom color is active */}
              {(selectedFilter || customColor) && (
                <div className="space-y-3 pt-4 border-t animate-in fade-in slide-in-from-top-2">
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
                </div>
              )}
            </div>
          </Card>

          {/* AI Recommendations (Right Side) */}
          <Card className="p-6 shadow-medium bg-card lg:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <Search className="w-5 h-5 text-rose" />
              <h3 className="text-xl font-semibold">AI Recommendations</h3>
            </div>
            <div className="flex gap-2 mb-4">
              <Input
                placeholder="red lipstick..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleSearch} disabled={isAnalyzing}>
                {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin"/> : <Search className="w-4 h-4"/>}
              </Button>
            </div>
            
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
               {recommendations.map((rec, i) => (
                 <Card key={i} className="p-3">
                    <div className="flex justify-between">
                       <span className="font-bold text-sm">{rec.productName}</span>
                       <Button size="sm" className="h-6 text-xs bg-rose" onClick={() => handleTryOnRecommendation(rec)}>
                         Try On
                       </Button>
                    </div>
                 </Card>
               ))}
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default VirtualTryOn;
