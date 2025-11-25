import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload } from "lucide-react";

interface ProfileEditorProps {
  userId: string;
  currentName: string | null;
  currentBio: string | null;
  currentAvatarUrl: string | null;
  onProfileUpdated: () => void;
}

export const ProfileEditor = ({ userId, currentName, currentBio, currentAvatarUrl, onProfileUpdated }: ProfileEditorProps) => {
  const [fullName, setFullName] = useState(currentName || "");
  const [bio, setBio] = useState(currentBio || "");
  const [avatarUrl, setAvatarUrl] = useState(currentAvatarUrl || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      toast({
        title: "Error",
        description: "Name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase
      .from("profiles")
      .update({ 
        full_name: fullName.trim(),
        bio: bio.trim() || null,
        avatar_url: avatarUrl.trim() || null
      })
      .eq("id", userId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      onProfileUpdated();
    }

    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col items-center gap-4">
        <Avatar className="w-24 h-24">
          <AvatarImage src={avatarUrl} alt={fullName} />
          <AvatarFallback className="text-2xl">
            {fullName ? fullName.charAt(0).toUpperCase() : "U"}
          </AvatarFallback>
        </Avatar>
        <div className="w-full">
          <Label htmlFor="avatarUrl">Profile Picture URL</Label>
          <div className="flex gap-2">
            <Input
              id="avatarUrl"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://example.com/avatar.jpg"
            />
            <Button type="button" variant="outline" size="icon" title="Upload image">
              <Upload className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Enter an image URL for your profile picture
          </p>
        </div>
      </div>

      <div>
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Enter your full name"
          maxLength={100}
        />
      </div>

      <div>
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell us about yourself..."
          maxLength={500}
          rows={4}
        />
        <p className="text-xs text-muted-foreground mt-1">
          {bio.length}/500 characters
        </p>
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Saving...
          </>
        ) : (
          "Save Changes"
        )}
      </Button>
    </form>
  );
};