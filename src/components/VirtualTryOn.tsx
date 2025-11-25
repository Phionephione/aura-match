import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useRef, useState } from "react";
import { detectFaceLandmarks } from "@/lib/faceDetection";
import { useToast } from "@/hooks/use-toast";
import { Search, Loader2, Sparkles } from "lucide-react";
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

const VirtualTryOn = ({ imageUrl, skinAnalysis }: VirtualTryOnProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
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

      // Give the image a moment to fully render
      await new Promise(resolve => setTimeout(resolve, 100));

      // Detect face landmarks
      setIsDetecting(true);
      try {
        console.log("Starting face detection...");
        const detectedLandmarks = await detectFaceLandmarks(img);
        console.log("Face detected successfully!");
        setLandmarks(detectedLandmarks);
        toast({
          title: "Face Detected!",
          description: "Ready to find personalized shade recommendations.",
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
      <div className="container max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 flex items-center justify-center gap-2">
            <Sparkles className="w-8 h-8 text-rose" />
            AI Shade Finder
          </h2>
          <p className="text-lg text-muted-foreground">
            Tell us what you're looking for and get personalized recommendations
          </p>
          {isDetecting && (
            <p className="text-sm text-rose mt-2 animate-pulse">
              Detecting facial features...
            </p>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Preview Area */}
          <Card className="p-6 shadow-medium bg-card">
            <div className="relative aspect-square rounded-lg overflow-hidden shadow-soft">
              <canvas
                ref={canvasRef}
                className="w-full h-full object-cover"
              />
            </div>
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

          {/* Search and Recommendations */}
          <div className="space-y-6">
            <Card className="p-6 shadow-medium bg-card">
              <h3 className="text-xl font-semibold mb-4">What are you looking for?</h3>
              
              <div className="flex gap-2 mb-4">
                <Input
                  type="text"
                  placeholder="e.g., red lipstick, foundation for oily skin, coral blush..."
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
                <div className="space-y-4">
                  <h4 className="font-semibold text-sm text-muted-foreground">
                    Personalized for Your Skin ({recommendations.length} matches)
                  </h4>
                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                    {recommendations.map((rec, index) => (
                      <Card key={index} className="p-4 border-rose/20 hover:border-rose/40 transition-colors">
                        <div className="space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <h5 className="font-semibold text-foreground">{rec.productName}</h5>
                              <p className="text-sm text-muted-foreground">{rec.brand}</p>
                            </div>
                            <span className="text-rose font-bold">₹{rec.price}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-muted-foreground">Shade:</span>
                            <span className="text-sm font-semibold text-rose">{rec.shade}</span>
                          </div>

                          <p className="text-sm text-foreground/80 leading-relaxed">
                            {rec.whyItSuits}
                          </p>

                          <div className="flex gap-2">
                            <span className="text-xs px-2 py-1 rounded-full bg-rose/10 text-rose capitalize">
                              {rec.type}
                            </span>
                            <span className="text-xs px-2 py-1 rounded-full bg-warm-beige/30 capitalize">
                              {rec.category}
                            </span>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {!isAnalyzing && recommendations.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">
                    Enter a search query to get AI-powered shade recommendations
                  </p>
                </div>
              )}
            </Card>

            <Card className="p-6 shadow-medium bg-gradient-to-br from-rose-light to-warm-beige">
              <h4 className="font-semibold mb-3 text-foreground">How it works</h4>
              <p className="text-sm text-foreground/80">
                Our AI analyzes your skin tone, undertone, and concerns to recommend shades that perfectly match you. 
                Just describe what you're looking for, and we'll find the best Indian brands for you!
              </p>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VirtualTryOn;
