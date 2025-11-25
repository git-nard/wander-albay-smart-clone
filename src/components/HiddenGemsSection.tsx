import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Gem, MapPin, ArrowRight } from "lucide-react";

interface HiddenGem {
  id: string;
  name: string;
  description: string;
  location: string;
  municipality: string;
  category: string[];
  image_url: string;
}

const HiddenGemsSection = () => {
  const navigate = useNavigate();
  const [hiddenGems, setHiddenGems] = useState<HiddenGem[]>([]);

  useEffect(() => {
    fetchHiddenGems();
  }, []);

  const fetchHiddenGems = async () => {
    const { data, error } = await supabase
      .from("tourist_spots")
      .select("*")
      .eq("is_hidden_gem", true)
      .limit(3);

    if (!error && data) {
      setHiddenGems(data);
    }
  };

  if (hiddenGems.length === 0) return null;

  return (
    <section className="py-20 bg-gradient-to-br from-accent/10 to-background">
      <div className="container">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Gem className="w-10 h-10 text-accent" />
            <h2 className="text-3xl md:text-4xl font-bold">
              Hidden Gems of <span className="text-accent">Albay</span>
            </h2>
            <Gem className="w-10 h-10 text-accent" />
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover secret treasures and authentic experiences off the beaten path
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {hiddenGems.map((gem) => (
            <Card
              key={gem.id}
              className="group cursor-pointer transition-all hover:shadow-2xl hover:-translate-y-2 overflow-hidden"
              onClick={() => navigate(`/spot/${gem.id}`)}
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={gem.image_url || "/placeholder.svg"}
                  alt={gem.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute top-3 right-3">
                  <Badge className="bg-accent text-accent-foreground gap-1">
                    <Gem className="w-3 h-3" />
                    Hidden Gem
                  </Badge>
                </div>
              </div>
              <CardContent className="p-6">
                <h3 className="font-bold text-xl mb-2 group-hover:text-accent transition-colors">
                  {gem.name}
                </h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                  <MapPin className="w-4 h-4" />
                  {gem.location}, {gem.municipality}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                  {gem.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {gem.category.slice(0, 2).map((cat) => (
                    <Badge key={cat} variant="secondary">
                      {cat}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-8">
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate("/explore")}
            className="gap-2"
          >
            Discover More Hidden Gems
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HiddenGemsSection;
