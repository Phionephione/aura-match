import { useState } from "react";
import Hero from "@/components/Hero";
import FaceAnalysis from "@/components/FaceAnalysis";
import VirtualTryOn from "@/components/VirtualTryOn";
import ProductRecommendations from "@/components/ProductRecommendations";

const Index = () => {
  const [analyzedImage, setAnalyzedImage] = useState<string | null>(null);
  const [skinAnalysis, setSkinAnalysis] = useState<any>(null);

  return (
    <div className="min-h-screen">
      <Hero />
      <FaceAnalysis 
        onAnalysisComplete={(imageUrl, analysis) => {
          setAnalyzedImage(imageUrl);
          setSkinAnalysis(analysis);
        }} 
      />
      {analyzedImage && (
        <>
          <VirtualTryOn imageUrl={analyzedImage} skinTone={skinAnalysis?.skinTone} />
          <ProductRecommendations skinAnalysis={skinAnalysis} />
        </>
      )}
    </div>
  );
};

export default Index;
