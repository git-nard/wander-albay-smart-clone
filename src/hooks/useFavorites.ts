import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FavoritesData {
  favorite_spots: string[];
  visited_spots: string[];
}

export const useFavorites = (userId: string | undefined) => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [visited, setVisited] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchFavorites();
    }
  }, [userId]);

  const fetchFavorites = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("user_preferences")
        .eq("id", userId)
        .single();

      if (error) throw error;

      if (data?.user_preferences) {
        const prefs = data.user_preferences as any;
        setFavorites(prefs.favorite_spots || []);
        setVisited(prefs.visited_spots || []);
      }
    } catch (error) {
      console.error("Error fetching favorites:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (spotId: string) => {
    if (!userId) {
      toast.error("Please log in to save favorites");
      return;
    }

    const isFavorite = favorites.includes(spotId);
    const newFavorites = isFavorite
      ? favorites.filter(id => id !== spotId)
      : [...favorites, spotId];

    setFavorites(newFavorites);

    try {
      // Get current preferences
      const { data: currentData } = await supabase
        .from("profiles")
        .select("user_preferences")
        .eq("id", userId)
        .single();

      const currentPrefs = (currentData?.user_preferences as Record<string, any>) || {};

      // Update with new favorites
      const { error } = await supabase
        .from("profiles")
        .update({
          user_preferences: {
            ...(currentPrefs as object),
            favorite_spots: newFavorites,
            visited_spots: visited
          }
        })
        .eq("id", userId);

      if (error) throw error;

      toast.success(isFavorite ? "Removed from favorites" : "Added to favorites");
    } catch (error) {
      console.error("Error updating favorites:", error);
      toast.error("Failed to update favorites");
      // Revert on error
      setFavorites(favorites);
    }
  };

  const markAsVisited = async (spotId: string) => {
    if (!userId) {
      toast.error("Please log in to track visited spots");
      return;
    }

    if (visited.includes(spotId)) return;

    const newVisited = [...visited, spotId];
    setVisited(newVisited);

    try {
      const { data: currentData } = await supabase
        .from("profiles")
        .select("user_preferences")
        .eq("id", userId)
        .single();

      const currentPrefs = (currentData?.user_preferences as Record<string, any>) || {};

      const { error } = await supabase
        .from("profiles")
        .update({
          user_preferences: {
            ...(currentPrefs as object),
            favorite_spots: favorites,
            visited_spots: newVisited
          }
        })
        .eq("id", userId);

      if (error) throw error;

      toast.success("Marked as visited");
    } catch (error) {
      console.error("Error marking as visited:", error);
      toast.error("Failed to update visited status");
      setVisited(visited);
    }
  };

  return {
    favorites,
    visited,
    loading,
    toggleFavorite,
    markAsVisited,
    isFavorite: (spotId: string) => favorites.includes(spotId),
    isVisited: (spotId: string) => visited.includes(spotId)
  };
};
