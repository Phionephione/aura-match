import { useState } from "react";
import Hero from "@/components/Hero";
import FaceAnalysis from "@/components/FaceAnalysis";
import VirtualTryOn from "@/components/VirtualTryOn";
import ProductRecommendations from "@/components/ProductRecommendations";
import { Input } from "@/components/ui/input"; // Assuming you have an Input component

const Index = () => {
  const [analyzedImage, setAnalyzedImage] = useState<string | null>(null);
  const [skinAnalysis, setSkinAnalysis] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

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
          <VirtualTryOn imageUrl={analyzedImage} skinTone={skinAnalysis?.skinTone} />
          <ProductRecommendations 
            skinAnalysis={skinAnalysis}
            searchQuery={searchQuery}
          />
        </>
      )}
    </div>
  );
};

export default Index;
