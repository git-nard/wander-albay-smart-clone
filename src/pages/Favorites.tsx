import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Heart, MapPin, Trash2, Loader2, Star, Eye, Hotel, Calendar } from "lucide-react";
import Navbar from "@/components/Navbar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface FavoriteItem {
  id: string;
  item_id: string;
  item_type: string;
  created_at: string;
  item_details?: any;
}

export default function Favorites() {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchFavorites();
    }
  }, [userId]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/auth');
      return;
    }
    setUserId(session.user.id);
  };

  const fetchFavorites = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch details for each favorite
      const favoritesWithDetails = await Promise.all(
        (data || []).map(async (fav) => {
          let details = null;
          
          if (fav.item_type === 'spot') {
            const { data: spotData } = await supabase
              .from('tourist_spots')
              .select('*')
              .eq('id', fav.item_id)
              .single();
            details = spotData;
          } else if (fav.item_type === 'restaurant') {
            const { data: restaurantData } = await supabase
              .from('restaurants')
              .select('*')
              .eq('id', fav.item_id)
              .single();
            details = restaurantData;
          } else if (fav.item_type === 'event') {
            const { data: eventData } = await supabase
              .from('events')
              .select('*')
              .eq('id', fav.item_id)
              .single();
            details = eventData;
          } else if (fav.item_type === 'accommodation') {
            const { data: accommodationData } = await supabase
              .from('accommodations')
              .select('*')
              .eq('id', fav.item_id)
              .single();
            details = accommodationData;
          }

          return { ...fav, item_details: details };
        })
      );

      setFavorites(favoritesWithDetails);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      toast.error('Failed to load favorites');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (favoriteId: string) => {
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('id', favoriteId);

      if (error) throw error;

      setFavorites(favorites.filter(fav => fav.id !== favoriteId));
      toast.success('Removed from favorites ❤️');
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast.error('Failed to remove favorite');
    }
  };

  const filteredFavorites = activeTab === 'all' 
    ? favorites 
    : favorites.filter(fav => fav.item_type === activeTab);

  const getItemIcon = (type: string) => {
    switch(type) {
      case 'spot': return MapPin;
      case 'accommodation': return Hotel;
      case 'event': return Calendar;
      default: return MapPin;
    }
  };

  const renderFavoriteCard = (favorite: FavoriteItem) => {
    const item = favorite.item_details;
    if (!item) return null;

    const ItemIcon = getItemIcon(favorite.item_type);

    return (
      <Card key={favorite.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
        {item.image_url && (
          <div className="relative aspect-video w-full overflow-hidden">
            <img
              src={item.image_url}
              alt={item.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute top-2 right-2">
              <Badge variant="secondary" className="capitalize backdrop-blur-sm bg-background/80">
                <ItemIcon className="w-3 h-3 mr-1" />
                {favorite.item_type}
              </Badge>
            </div>
          </div>
        )}
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <CardTitle className="text-lg group-hover:text-primary transition-colors">
                {item.name}
              </CardTitle>
              <CardDescription className="flex items-center gap-1 mt-2">
                <MapPin className="h-3 w-3 flex-shrink-0" />
                <span className="line-clamp-1">{item.location || item.municipality}</span>
              </CardDescription>
            </div>
          </div>
          
          {/* Additional metadata */}
          <div className="flex items-center gap-3 mt-3">
            {item.rating > 0 && (
              <div className="flex items-center gap-1 text-sm">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{item.rating.toFixed(1)}</span>
              </div>
            )}
            {item.category && Array.isArray(item.category) && item.category.length > 0 && (
              <Badge variant="outline" className="text-xs">
                {item.category[0]}
              </Badge>
            )}
            {item.is_hidden_gem && (
              <Badge variant="outline" className="text-xs">
                💎 Hidden Gem
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {item.description && (
            <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
              {item.description}
            </p>
          )}
          
          {/* Amenities for accommodations */}
          {favorite.item_type === 'accommodation' && item.amenities && item.amenities.length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-1">
                {item.amenities.slice(0, 3).map((amenity: string, idx: number) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {amenity}
                  </Badge>
                ))}
                {item.amenities.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{item.amenities.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                if (favorite.item_type === 'spot') {
                  navigate(`/spot/${item.id}`);
                } else if (item.latitude && item.longitude) {
                  navigate(`/map?lat=${item.latitude}&lng=${item.longitude}&name=${encodeURIComponent(item.name)}`);
                } else {
                  navigate('/explore');
                }
              }}
            >
              <Eye className="h-4 w-4 mr-2" />
              View
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="hover:bg-destructive hover:text-destructive-foreground"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Remove from favorites?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to remove "{item.name}" from your favorites?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleRemoveFavorite(favorite.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Remove
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 flex items-center justify-center gap-3">
            <Heart className="h-10 w-10 fill-red-500 text-red-500 animate-pulse" />
            My Favorites
          </h1>
          <p className="text-lg text-muted-foreground mb-2">
            Your saved destinations and experiences in Albay
          </p>
          {!loading && favorites.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {favorites.length} {favorites.length === 1 ? 'item' : 'items'} saved
            </p>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="spot">Spots</TabsTrigger>
            <TabsTrigger value="restaurant">Restaurants</TabsTrigger>
            <TabsTrigger value="event">Events</TabsTrigger>
            <TabsTrigger value="accommodation">Hotels</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : filteredFavorites.length === 0 ? (
              <Card className="p-12 text-center">
                <div className="text-6xl mb-4">💔</div>
                <h3 className="text-xl font-semibold mb-2">No favorites yet</h3>
                <p className="text-muted-foreground mb-6">
                  Start exploring and save your favorite places!
                </p>
                <Button onClick={() => navigate('/explore')}>
                  Explore Destinations
                </Button>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredFavorites.map(renderFavoriteCard)}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
