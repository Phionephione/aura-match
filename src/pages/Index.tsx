import { useState } from "react";
import Hero from "@/components/Hero";
import FaceAnalysis from "@/components/FaceAnalysis";
import VirtualTryOn from "@/components/VirtualTryOn";
import ProductRecommendations from "@/components/ProductRecommendations";
import { Input } from "@/components/ui/input";

const Index = () => {
  const [analyzedImage, setAnalyzedImage] = useState<string | null>(null);
  const [skinAnalysis, setSkinAnalysis] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // STATE: Track the product selected from the bottom list
  const [externalTryOn, setExternalTryOn] = useState<{
    color: { r: number; g: number; b: number };
    type: string;
    productName: string;
  } | null>(null);

  // HANDLER: Convert product data to a try-onable format
  const handleProductTryOn = (product: any) => {
    // Scroll to Try-On section
    document.getElementById("virtual-try-on-section")?.scrollIntoView({ behavior: "smooth" });

    // Mocking RGB values based on product names for the demo
    // In a real app, your database should return hex/rgb values
    let mockColor = { r: 200, g: 100, b: 100 }; // Default reddish

    if (product.name.includes("Red")) mockColor = { r: 220, g: 20, b: 60 };
    if (product.name.includes("Nude")) mockColor = { r: 210, g: 140, b: 130 };
    if (product.name.includes("Pink")) mockColor = { r: 255, g: 105, b: 180 };
    if (product.name.includes("Brown")) mockColor = { r: 139, g: 69, b: 19 };
    
    setExternalTryOn({
      color: mockColor,
      type: product.type || "lipstick", // default to lipstick if type missing
      productName: product.name
    });
  };

  return (
    <div className="min-h-screen">
      <Hero />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Input
            type="text"
            placeholder="What are you looking for? (e.g., 'red lipstick for warm skin tone')"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full max-w-xl mx-auto"
          />
        </div>
      </div>
      
      <FaceAnalysis 
        onAnalysisComplete={(imageUrl, analysis) => {
          setAnalyzedImage(imageUrl);
          setSkinAnalysis(analysis);
        }} 
      />
      
      {analyzedImage && (
        <>
          <div id="virtual-try-on-section">
            <VirtualTryOn 
              imageUrl={analyzedImage} 
              skinAnalysis={skinAnalysis}
              externalSelection={externalTryOn} // Passing the selection down
            />
          </div>

          <ProductRecommendations 
            skinAnalysis={skinAnalysis}
            searchQuery={searchQuery}
            onTryOn={handleProductTryOn} // Passing the handler down
          />
        </>
      )}
    </div>
  );
};

export default Index;
