import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Trash2, Star } from "lucide-react";
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

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  spot_id: string;
  user_id: string;
}

interface ReviewWithDetails extends Review {
  spot_name: string;
  user_name: string;
}

const ReviewManagement = () => {
  const [reviews, setReviews] = useState<ReviewWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setIsLoading(true);

    const { data: reviewsData, error } = await supabase
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch reviews",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Fetch spot names and user names
    const enrichedReviews: ReviewWithDetails[] = [];
    
    for (const review of reviewsData || []) {
      const { data: spot } = await supabase
        .from("tourist_spots")
        .select("name")
        .eq("id", review.spot_id)
        .single();

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", review.user_id)
        .single();

      enrichedReviews.push({
        ...review,
        spot_name: spot?.name || "Unknown Spot",
        user_name: profile?.full_name || "Anonymous",
      });
    }

    setReviews(enrichedReviews);
    setIsLoading(false);
  };

  const handleDeleteReview = async (reviewId: string) => {
    const { error } = await supabase
      .from("reviews")
      .delete()
      .eq("id", reviewId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete review",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Review has been deleted",
      });
      fetchReviews();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Review Management</h2>
        <Badge variant="outline" className="text-lg px-4 py-2">
          Total Reviews: {reviews.length}
        </Badge>
      </div>

      <div className="grid gap-4">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <Card key={review.id}>
              <CardHeader>
                <CardTitle className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="font-semibold text-lg">{review.spot_name}</div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-muted-foreground"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        by {review.user_name}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground font-normal">
                      {new Date(review.created_at).toLocaleDateString()} at{" "}
                      {new Date(review.created_at).toLocaleTimeString()}
                    </div>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Review?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the review.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteReview(review.id)}
                          className="bg-destructive text-destructive-foreground"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardTitle>
              </CardHeader>
              {review.comment && (
                <CardContent>
                  <p className="text-sm text-muted-foreground">{review.comment}</p>
                </CardContent>
              )}
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No reviews yet</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ReviewManagement;