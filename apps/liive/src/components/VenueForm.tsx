import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Upload } from "lucide-react";

interface VenueFormProps {
  venue?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export function VenueForm({ venue, onSuccess, onCancel }: VenueFormProps) {
  const [formData, setFormData] = useState({
    name: venue?.name || "",
    type: venue?.type || "",
    category: venue?.category || "nightclub",
    description: venue?.description || "",
    address: venue?.address || "",
    phone: venue?.phone || "",
    website: venue?.website || "",
    is_live: venue?.is_live || false,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Error",
          description: "You must be logged in",
          variant: "destructive",
        });
        return;
      }

      let imageUrl = venue?.image_url;

      // Upload image if provided
      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { error: uploadError, data } = await supabase.storage
          .from("venue-images")
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("venue-images")
          .getPublicUrl(fileName);
        
        imageUrl = publicUrl;
      }

      const venueData = {
        ...formData,
        image_url: imageUrl,
        owner_id: session.user.id,
      };

      if (venue) {
        // Update existing venue
        const { error } = await supabase
          .from("venues")
          .update(venueData)
          .eq("id", venue.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Venue updated successfully",
        });
      } else {
        // Create new venue
        const { error } = await supabase
          .from("venues")
          .insert([venueData]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Venue created successfully",
        });
      }

      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Venue Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Type *</Label>
          <Select
            value={formData.type}
            onValueChange={(value) => setFormData({ ...formData, type: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select venue type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Live Music Venue">Live Music Venue</SelectItem>
              <SelectItem value="Sports Bar">Sports Bar</SelectItem>
              <SelectItem value="Cocktail Bar">Cocktail Bar</SelectItem>
              <SelectItem value="Wine Bar">Wine Bar</SelectItem>
              <SelectItem value="Nightclub">Nightclub</SelectItem>
              <SelectItem value="Dance Club">Dance Club</SelectItem>
              <SelectItem value="Lounge">Lounge</SelectItem>
              <SelectItem value="Restaurant & Bar">Restaurant & Bar</SelectItem>
              <SelectItem value="Concert Hall">Concert Hall</SelectItem>
              <SelectItem value="Comedy Club">Comedy Club</SelectItem>
              <SelectItem value="Theater">Theater</SelectItem>
              <SelectItem value="Event Space">Event Space</SelectItem>
              <SelectItem value="Rooftop Bar">Rooftop Bar</SelectItem>
              <SelectItem value="Pub">Pub</SelectItem>
              <SelectItem value="Beer Garden">Beer Garden</SelectItem>
              <SelectItem value="Karaoke Bar">Karaoke Bar</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category *</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => setFormData({ ...formData, category: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="nightclub">Nightclub</SelectItem>
              <SelectItem value="bar">Bar</SelectItem>
              <SelectItem value="lounge">Lounge</SelectItem>
              <SelectItem value="restaurant">Restaurant</SelectItem>
              <SelectItem value="concert_venue">Concert Venue</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="website">Website</Label>
        <Input
          id="website"
          type="url"
          value={formData.website}
          onChange={(e) => setFormData({ ...formData, website: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="image">Venue Image</Label>
        <div className="flex items-center gap-2">
          <Input
            id="image"
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
          />
          <Upload className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="is_live"
          checked={formData.is_live}
          onCheckedChange={(checked) => setFormData({ ...formData, is_live: checked })}
        />
        <Label htmlFor="is_live">Set venue as live</Label>
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : venue ? "Update Venue" : "Create Venue"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
