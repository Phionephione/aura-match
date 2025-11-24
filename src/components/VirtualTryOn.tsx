import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { detectFaceLandmarks, LIP_INDICES, CHEEK_INDICES, EYE_INDICES } from "@/lib/faceDetection";
import { useToast } from "@/hooks/use-toast";
import { Palette } from "lucide-react";

interface VirtualTryOnProps {
  imageUrl: string;
  skinTone?: string;
}

const makeupFilters = [
  {
    id: "lipstick-red",
    name: "Bold Red Lips",
    color: "rgba(220, 20, 60, 0.8)",
    type: "lipstick",
  },
  {
    id: "lipstick-nude",
    name: "Nude Lips",
    color: "rgba(210, 140, 130, 0.7)",
    type: "lipstick",
  },
  {
    id: "lipstick-pink",
    name: "Pink Gloss",
    color: "rgba(255, 105, 180, 0.7)",
    type: "lipstick",
  },
  {
    id: "foundation-light",
    name: "Light Foundation",
    color: "rgba(255, 220, 200, 0.4)",
    type: "foundation",
  },
  {
    id: "foundation-medium",
    name: "Medium Foundation",
    color: "rgba(205, 170, 140, 0.4)",
    type: "foundation",
  },
  {
    id: "blush-pink",
    name: "Pink Blush",
    color: "rgba(255, 182, 193, 0.6)",
    type: "blush",
  },
  {
    id: "eyeshadow-bronze",
    name: "Bronze Eyeshadow",
    color: "rgba(205, 127, 50, 0.5)",
    type: "eyeshadow",
  },
  {
    id: "eyeshadow-purple",
    name: "Purple Eyeshadow",
    color: "rgba(147, 112, 219, 0.5)",
    type: "eyeshadow",
  },
];

const VirtualTryOn = ({ imageUrl, skinTone }: VirtualTryOnProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
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
          description: "Virtual try-on filters will be applied to your facial features.",
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
    color: string,
    width: number,
    height: number
  ) => {
    if (!landmarks) return;

    ctx.fillStyle = color;
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
    ctx.fill();
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
        // Fallback: apply to entire image
        ctx.fillStyle = filter.color;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        return;
      }

      // Apply makeup to specific regions based on type
      switch (filter.type) {
        case "lipstick":
          applyMakeupToRegion(ctx, LIP_INDICES.outer, filter.color, canvas.width, canvas.height);
          break;
        case "blush":
          applyMakeupToRegion(ctx, CHEEK_INDICES.left, filter.color, canvas.width, canvas.height);
          applyMakeupToRegion(ctx, CHEEK_INDICES.right, filter.color, canvas.width, canvas.height);
          break;
        case "eyeshadow":
          applyMakeupToRegion(ctx, EYE_INDICES.left, filter.color, canvas.width, canvas.height);
          applyMakeupToRegion(ctx, EYE_INDICES.right, filter.color, canvas.width, canvas.height);
          break;
        case "foundation":
          // For foundation, apply a lighter overlay to face area
          ctx.fillStyle = filter.color;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          break;
      }
    };
  }, [selectedFilter, imageUrl, landmarks]);

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-background to-warm-beige/30">
      <div className="container max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Virtual Try-On
          </h2>
          <p className="text-lg text-muted-foreground">
            See how different makeup looks suit you
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
            {selectedFilter && (
              <p className="text-center mt-4 text-sm text-muted-foreground">
                Current: {makeupFilters.find((f) => f.id === selectedFilter)?.name}
              </p>
            )}
          </Card>

          {/* Filter Selection */}
          <div className="space-y-6">
            <Card className="p-6 shadow-medium bg-card">
              <div className="flex items-center gap-2 mb-6">
                <Palette className="w-5 h-5 text-rose" />
                <h3 className="text-xl font-semibold">Choose Your Look</h3>
              </div>

              <div className="space-y-4">
                {/* Group by type */}
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Lipsticks</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {makeupFilters.filter(f => f.type === "lipstick").map((filter) => (
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
                          style={{ backgroundColor: filter.color }}
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
                          style={{ backgroundColor: filter.color }}
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
                          style={{ backgroundColor: filter.color }}
                        />
                        <span className="text-xs font-medium">{filter.name}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              {selectedFilter && (
                <Button
                  onClick={() => setSelectedFilter(null)}
                  variant="ghost"
                  className="w-full mt-4 text-muted-foreground hover:text-foreground"
                >
                  Clear Filter
                </Button>
              )}
            </Card>

            <Card className="p-6 shadow-medium bg-gradient-to-br from-rose-light to-warm-beige">
              <h4 className="font-semibold mb-3 text-foreground">Pro Tip</h4>
              <p className="text-sm text-foreground/80">
                Our AI detects your facial features to apply makeup only where it belongs - 
                lipstick on lips, blush on cheeks, and eyeshadow on eyelids for realistic results.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VirtualTryOn;
