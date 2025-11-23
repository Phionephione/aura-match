import { useState } from "react";
import Hero from "@/components/Hero";
import ProductTypeSelector from "@/components/ProductTypeSelector";
import FaceAnalysis from "@/components/FaceAnalysis";
import VirtualTryOn from "@/components/VirtualTryOn";
import ProductRecommendations from "@/components/ProductRecommendations";

const Index = () => {
  const [analyzedImage, setAnalyzedImage] = useState<string | null>(null);
  const [skinAnalysis, setSkinAnalysis] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedProductTypes, setSelectedProductTypes] = useState<string[]>([]);

  return (
    <div className="min-h-screen">
      <Hero />
      <ProductTypeSelector 
        onSelectionChange={(category, types) => {
          setSelectedCategory(category);
          setSelectedProductTypes(types);
        }}
      />
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
            selectedCategory={selectedCategory}
            selectedProductTypes={selectedProductTypes}
          />
        </>
      )}
    </div>
  );
};

export default Index;
