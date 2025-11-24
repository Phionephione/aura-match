import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Camera, Upload, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FaceAnalysisProps {
  onAnalysisComplete: (imageUrl: string, analysis: any) => void;
}

const FaceAnalysis = ({ onAnalysisComplete }: FaceAnalysisProps) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user" } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (error) {
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please try uploading an image instead.",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (videoRef.current) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(videoRef.current, 0, 0);
      const imageUrl = canvas.toDataURL("image/jpeg");
      setSelectedImage(imageUrl);
      stopCamera();
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage) return;
    
    setIsAnalyzing(true);
    
    // Simulate AI analysis (in production, this would call an AI service)
    setTimeout(() => {
      const mockAnalysis = {
        skinTone: "medium-warm",
        undertone: "warm",
        concerns: ["dryness", "uneven texture"],
        recommendations: ["hydrating serum", "vitamin C", "gentle exfoliant"],
      };
      
      onAnalysisComplete(selectedImage, mockAnalysis);
      setIsAnalyzing(false);
      
      toast({
        title: "Analysis Complete!",
        description: "We've analyzed your skin and generated personalized recommendations.",
      });
    }, 2000);
  };

  return (
    <section id="analysis-section" className="py-20 px-4">
      <div className="container max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Upload Your Photo
          </h2>
          <p className="text-lg text-muted-foreground">
            Take a selfie or upload a photo to get started with your personalized analysis
          </p>
        </div>

        <Card className="p-8 shadow-medium bg-card">
          {!selectedImage && !isCameraActive ? (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  size="lg"
                  className="bg-rose hover:bg-rose/90 text-white gap-2"
                >
                  <Upload className="w-5 h-5" />
                  Upload Photo
                </Button>
                <Button
                  onClick={startCamera}
                  variant="outline"
                  size="lg"
                  className="gap-2 border-rose text-rose hover:bg-rose hover:text-white"
                >
                  <Camera className="w-5 h-5" />
                  Use Camera
                </Button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          ) : isCameraActive ? (
            <div className="space-y-6">
              <div className="relative aspect-[3/4] max-w-md mx-auto rounded-lg overflow-hidden bg-black">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                
                {/* Face Guide Overlay */}
                <div className="absolute inset-0 pointer-events-none">
                  {/* Frame corners */}
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    {/* Top left corner */}
                    <path d="M 10 20 L 10 10 L 20 10" stroke="#10b981" strokeWidth="0.8" fill="none" strokeLinecap="round"/>
                    {/* Top right corner */}
                    <path d="M 80 10 L 90 10 L 90 20" stroke="#10b981" strokeWidth="0.8" fill="none" strokeLinecap="round"/>
                    {/* Bottom left corner */}
                    <path d="M 10 80 L 10 90 L 20 90" stroke="#10b981" strokeWidth="0.8" fill="none" strokeLinecap="round"/>
                    {/* Bottom right corner */}
                    <path d="M 80 90 L 90 90 L 90 80" stroke="#10b981" strokeWidth="0.8" fill="none" strokeLinecap="round"/>
                  </svg>
                  
                  {/* Face oval guide */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-64">
                    <svg className="w-full h-full" viewBox="0 0 100 140">
                      <ellipse cx="50" cy="70" rx="45" ry="60" stroke="#10b981" strokeWidth="2" fill="none" strokeDasharray="5,5" opacity="0.8"/>
                    </svg>
                  </div>
                  
                  {/* Instruction text */}
                  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/70 px-6 py-3 rounded-full">
                    <p className="text-white text-sm font-medium text-center">
                      Place your face within the oval
                    </p>
                  </div>
                </div>

                {/* Close button */}
                <button
                  onClick={stopCamera}
                  className="absolute top-4 right-4 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors z-10"
                >
                  <span className="text-2xl font-light">×</span>
                </button>
              </div>

              <div className="flex justify-center">
                <Button
                  onClick={capturePhoto}
                  size="lg"
                  className="bg-rose hover:bg-rose/90 text-white"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  Capture Photo
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="relative aspect-square max-w-md mx-auto rounded-lg overflow-hidden shadow-medium">
                <img
                  src={selectedImage}
                  alt="Selected face"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={analyzeImage}
                  disabled={isAnalyzing}
                  size="lg"
                  className="bg-rose hover:bg-rose/90 text-white"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    "Analyze My Skin"
                  )}
                </Button>
                <Button
                  onClick={() => setSelectedImage(null)}
                  variant="outline"
                  size="lg"
                  className="border-rose text-rose hover:bg-rose hover:text-white"
                >
                  Choose Different Photo
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </section>
  );
};

export default FaceAnalysis;
