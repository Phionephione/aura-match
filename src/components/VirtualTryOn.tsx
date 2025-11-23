import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Palette } from "lucide-react";

interface VirtualTryOnProps {
  imageUrl: string;
  skinTone?: string;
}

const makeupFilters = [
  { id: "natural", name: "Natural Glow", color: "rgba(255, 200, 180, 0.3)" },
  { id: "rose", name: "Rose Blush", color: "rgba(255, 150, 180, 0.4)" },
  { id: "bronze", name: "Bronze Glow", color: "rgba(200, 140, 100, 0.35)" },
  { id: "peach", name: "Peach Perfect", color: "rgba(255, 180, 150, 0.35)" },
  { id: "berry", name: "Berry Kiss", color: "rgba(180, 100, 140, 0.4)" },
  { id: "coral", name: "Coral Dream", color: "rgba(255, 127, 80, 0.35)" },
];

const VirtualTryOn = ({ imageUrl, skinTone }: VirtualTryOnProps) => {
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-background to-warm-beige/30">
      <div className="container max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Virtual Try-On
          </h2>
          <p className="text-lg text-muted-foreground">
            See how different makeup tones look on you instantly
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Preview Area */}
          <Card className="p-6 shadow-medium bg-card">
            <div className="relative aspect-square rounded-lg overflow-hidden shadow-soft">
              <img
                src={imageUrl}
                alt="Your face"
                className="w-full h-full object-cover"
              />
              {selectedFilter && (
                <div
                  className="absolute inset-0 mix-blend-overlay transition-all duration-500"
                  style={{
                    backgroundColor: makeupFilters.find(f => f.id === selectedFilter)?.color,
                  }}
                />
              )}
            </div>
            {selectedFilter && (
              <p className="text-center mt-4 text-sm text-muted-foreground">
                Current: {makeupFilters.find(f => f.id === selectedFilter)?.name}
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

              <div className="grid grid-cols-2 gap-4">
                {makeupFilters.map((filter) => (
                  <Button
                    key={filter.id}
                    onClick={() => setSelectedFilter(filter.id)}
                    variant={selectedFilter === filter.id ? "default" : "outline"}
                    className={`h-auto py-6 flex flex-col gap-2 ${
                      selectedFilter === filter.id
                        ? "bg-rose hover:bg-rose/90 text-white"
                        : "border-rose/30 hover:border-rose hover:bg-rose/5"
                    }`}
                  >
                    <div
                      className="w-12 h-12 rounded-full shadow-soft border-2 border-white"
                      style={{ backgroundColor: filter.color }}
                    />
                    <span className="text-sm font-medium">{filter.name}</span>
                  </Button>
                ))}
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
                These virtual filters give you a preview of how different tones complement your skin. 
                For the most accurate results, try them in natural lighting.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VirtualTryOn;
