import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

const Hero = () => {
  const scrollToAnalysis = () => {
    document.getElementById("analysis-section")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-cream via-warm-beige to-rose-light">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-72 h-72 bg-rose rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gold rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="container relative z-10 px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm shadow-soft mb-6">
            <Sparkles className="w-4 h-4 text-rose" />
            <span className="text-sm font-medium text-foreground">AI-Powered Beauty Analysis</span>
          </div>

          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold leading-tight">
            Discover Your
            <span className="block bg-gradient-to-r from-rose to-gold bg-clip-text text-transparent">
              Perfect Look
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-light">
            Upload your photo and let AI find the perfect skincare and makeup products for your unique skin tone. Try on different looks virtually before you buy.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button 
              onClick={scrollToAnalysis}
              size="lg"
              className="bg-rose hover:bg-rose/90 text-white shadow-glow text-lg px-8 py-6 rounded-full transition-all hover:scale-105"
            >
              Start Your Analysis
            </Button>
            <Button 
              variant="outline"
              size="lg"
              className="border-2 border-rose text-rose hover:bg-rose hover:text-white text-lg px-8 py-6 rounded-full transition-all"
            >
              Learn More
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-8 pt-12 max-w-2xl mx-auto">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-rose">AI</div>
              <div className="text-sm text-muted-foreground">Powered Analysis</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-rose">AR</div>
              <div className="text-sm text-muted-foreground">Virtual Try-On</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-rose">Smart</div>
              <div className="text-sm text-muted-foreground">Recommendations</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 0L60 8C120 16 240 32 360 37.3C480 43 600 37 720 32C840 27 960 21 1080 24C1200 27 1320 37 1380 42.7L1440 48V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z" fill="hsl(var(--background))" />
        </svg>
      </div>
    </section>
  );
};

export default Hero;
