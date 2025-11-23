import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, ShoppingCart } from "lucide-react";

interface ProductRecommendationsProps {
  skinAnalysis: any;
}

const mockProducts = [
  {
    id: 1,
    name: "Vitamin C Face Serum",
    brand: "Minimalist",
    category: "Skincare",
    price: 599,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop",
    match: 98,
  },
  {
    id: 2,
    name: "HD Perfecting Foundation",
    brand: "Sugar Cosmetics",
    category: "Makeup",
    price: 899,
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1631214524020-7e18db9a8f92?w=400&h=400&fit=crop",
    match: 95,
  },
  {
    id: 3,
    name: "Ubtan Glow Face Cream",
    brand: "Mamaearth",
    category: "Skincare",
    price: 449,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1556228994-4a1a8e1d6c68?w=400&h=400&fit=crop",
    match: 94,
  },
  {
    id: 4,
    name: "Blusher Palette - Rosy Glow",
    brand: "Lakme",
    category: "Makeup",
    price: 650,
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1583241800698-2d5e5e0bc60c?w=400&h=400&fit=crop",
    match: 92,
  },
];

const ProductRecommendations = ({ skinAnalysis }: ProductRecommendationsProps) => {
  return (
    <section className="py-20 px-4">
      <div className="container max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Your Perfect Matches
          </h2>
          <p className="text-lg text-muted-foreground">
            Personalized recommendations based on your unique skin analysis
          </p>
        </div>

        {skinAnalysis && (
          <Card className="p-6 mb-12 shadow-medium bg-gradient-to-r from-rose-light/30 to-warm-beige/50 border-rose/20">
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Skin Tone</div>
                <div className="text-xl font-semibold text-foreground capitalize">
                  {skinAnalysis.skinTone?.replace("-", " ")}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Undertone</div>
                <div className="text-xl font-semibold text-foreground capitalize">
                  {skinAnalysis.undertone}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Key Concerns</div>
                <div className="flex flex-wrap gap-2 justify-center">
                  {skinAnalysis.concerns?.map((concern: string) => (
                    <Badge key={concern} variant="secondary" className="capitalize">
                      {concern}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {mockProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden shadow-medium hover:shadow-glow transition-all hover:scale-105 duration-300 bg-card">
              <div className="relative">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full aspect-square object-cover"
                />
                <Badge className="absolute top-3 right-3 bg-rose text-white">
                  {product.match}% Match
                </Badge>
              </div>
              
              <div className="p-4 space-y-3">
                <div>
                  <Badge variant="secondary" className="mb-2 text-xs">
                    {product.category}
                  </Badge>
                  <h3 className="font-semibold text-foreground line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">{product.brand}</p>
                </div>

                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-gold text-gold" />
                  <span className="text-sm font-medium text-foreground">{product.rating}</span>
                  <span className="text-sm text-muted-foreground ml-1">(240 reviews)</span>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xl font-bold text-rose">
                    ₹{product.price}
                  </span>
                  <Button size="sm" className="bg-rose hover:bg-rose/90 text-white">
                    <ShoppingCart className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button 
            size="lg"
            variant="outline"
            className="border-rose text-rose hover:bg-rose hover:text-white"
          >
            View All Recommendations
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ProductRecommendations;
