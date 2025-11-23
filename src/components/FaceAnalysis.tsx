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
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please try uploading an image instead.",
        variant: "destructive",
      });
    }
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
      
      // Stop camera stream
      const stream = videoRef.current.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
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
          {!selectedImage ? (
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

              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full rounded-lg hidden"
              />
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
