import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, ShoppingCart, Sparkles } from "lucide-react";

interface ProductRecommendationsProps {
  skinAnalysis: any;
  searchQuery: string;
  // NEW PROP
  onTryOn?: (product: any) => void;
}

const mockProducts = [
  {
    id: 1,
    name: "Vitamin C Face Serum",
    brand: "Minimalist",
    category: "Skincare",
    type: "serum",
    price: 599,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop",
    match: 98,
  },
  {
    id: 5,
    name: "Matte Lipstick - Ruby Red",
    brand: "Sugar Cosmetics",
    category: "Makeup",
    type: "lipstick",
    price: 499,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&h=400&fit=crop",
    match: 96,
  },
  // ... (Your other mock products)
];

const ProductRecommendations = ({
  skinAnalysis,
  searchQuery,
  onTryOn
}: ProductRecommendationsProps) => {
  
  const displayProducts = mockProducts.filter((product) => {
    if (!searchQuery) return true; 
    const lowerCaseQuery = searchQuery.toLowerCase();
    return (
      product.name.toLowerCase().includes(lowerCaseQuery) ||
      product.brand.toLowerCase().includes(lowerCaseQuery)
    );
  });

  return (
    <section className="py-20 px-4">
      <div className="container max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Your Perfect Matches
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayProducts.map((product) => (
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
                  <h3 className="font-semibold text-foreground line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">{product.brand}</p>
                </div>

                <div className="flex items-center justify-between pt-2 gap-2">
                  <span className="text-xl font-bold text-rose">
                    ₹{product.price}
                  </span>
                  
                  <div className="flex gap-2">
                    {/* NEW TRY ON BUTTON */}
                    {onTryOn && product.category === "Makeup" && (
                        <Button 
                            size="sm" 
                            variant="outline"
                            className="text-xs border-rose text-rose hover:bg-rose hover:text-white"
                            onClick={() => onTryOn(product)}
                        >
                            <Sparkles className="w-3 h-3 mr-1" />
                            Try On
                        </Button>
                    )}
                    
                    <Button size="sm" className="bg-rose hover:bg-rose/90 text-white">
                      <ShoppingCart className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductRecommendations;
