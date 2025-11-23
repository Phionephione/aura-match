import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Heart, Droplets, Sun, Palette, Smile } from "lucide-react";
import { useState } from "react";

interface ProductTypeSelectorProps {
  onSelectionChange: (category: string, types: string[]) => void;
}

const categories = [
  {
    id: "skincare",
    name: "Skincare",
    icon: Droplets,
    types: [
      { id: "serum", name: "Serums", icon: Sparkles },
      { id: "moisturizer", name: "Moisturizers", icon: Heart },
      { id: "cleanser", name: "Cleansers", icon: Droplets },
      { id: "sunscreen", name: "Sunscreen", icon: Sun },
    ],
  },
  {
    id: "makeup",
    name: "Makeup",
    icon: Palette,
    types: [
      { id: "foundation", name: "Foundation", icon: Smile },
      { id: "lipstick", name: "Lipstick", icon: Heart },
      { id: "blush", name: "Blush", icon: Sparkles },
      { id: "eyeshadow", name: "Eyeshadow", icon: Palette },
    ],
  },
];

const ProductTypeSelector = ({ onSelectionChange }: ProductTypeSelectorProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedTypes([]);
    onSelectionChange(categoryId, []);
  };

  const handleTypeToggle = (typeId: string) => {
    const newTypes = selectedTypes.includes(typeId)
      ? selectedTypes.filter((t) => t !== typeId)
      : [...selectedTypes, typeId];
    
    setSelectedTypes(newTypes);
    if (selectedCategory) {
      onSelectionChange(selectedCategory, newTypes);
    }
  };

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-background to-rose-light/10">
      <div className="container max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            What Are You Looking For?
          </h2>
          <p className="text-lg text-muted-foreground">
            Select a category and specific products to get personalized recommendations
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {categories.map((category) => {
            const Icon = category.icon;
            const isSelected = selectedCategory === category.id;
            
            return (
              <Card
                key={category.id}
                className={`p-6 cursor-pointer transition-all hover:scale-105 hover:shadow-glow ${
                  isSelected
                    ? "border-rose shadow-elegant bg-gradient-to-br from-rose-light/20 to-warm-beige/20"
                    : "border-border hover:border-rose/50"
                }`}
                onClick={() => handleCategorySelect(category.id)}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className={`p-3 rounded-full ${
                    isSelected ? "bg-rose text-white" : "bg-muted"
                  }`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-semibold text-foreground">
                    {category.name}
                  </h3>
                </div>
                
                {isSelected && (
                  <div className="grid grid-cols-2 gap-3 mt-6 animate-in fade-in slide-in-from-top-2 duration-300">
                    {category.types.map((type) => {
                      const TypeIcon = type.icon;
                      const isTypeSelected = selectedTypes.includes(type.id);
                      
                      return (
                        <Badge
                          key={type.id}
                          variant={isTypeSelected ? "default" : "outline"}
                          className={`p-3 cursor-pointer justify-start gap-2 hover:scale-105 transition-transform ${
                            isTypeSelected
                              ? "bg-rose text-white border-rose"
                              : "hover:border-rose"
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTypeToggle(type.id);
                          }}
                        >
                          <TypeIcon className="w-4 h-4" />
                          {type.name}
                        </Badge>
                      );
                    })}
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {selectedTypes.length > 0 && (
          <Card className="p-6 bg-gradient-to-r from-rose-light/30 to-warm-beige/50 border-rose/20 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-medium text-muted-foreground">
                Selected Products:
              </span>
              {selectedTypes.map((typeId) => {
                const category = categories.find((c) => c.id === selectedCategory);
                const type = category?.types.find((t) => t.id === typeId);
                return (
                  <Badge key={typeId} className="bg-rose text-white">
                    {type?.name}
                  </Badge>
                );
              })}
            </div>
          </Card>
        )}
      </div>
    </section>
  );
};

export default ProductTypeSelector;
