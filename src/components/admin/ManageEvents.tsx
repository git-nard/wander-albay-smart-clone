import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Calendar, Loader2 } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

interface Event {
  id: string;
  name: string;
  event_type: string | null;
  location: string;
  municipality: string | null;
  description: string | null;
  event_date: string | null;
  image_url: string | null;
}

interface Municipality {
  code: string;
  name: string;
}

interface Barangay {
  code: string;
  name: string;
}

const ManageEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [barangays, setBarangays] = useState<Barangay[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    event_type: [] as string[],
    location: "",
    municipality: "",
    description: "",
    event_date: "",
    image_url: "",
  });

  useEffect(() => {
    fetchEvents();
    fetchMunicipalities();
  }, []);

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("event_date", { ascending: true });

    if (!error && data) {
      setEvents(data);
    }
  };

  const fetchMunicipalities = async () => {
    try {
      const [muniRes, cityRes] = await Promise.all([
        fetch("https://psgc.gitlab.io/api/provinces/050500000/municipalities/"),
        fetch("https://psgc.gitlab.io/api/provinces/050500000/cities/"),
      ]);

      const [muniData, cityData] = await Promise.all([
        muniRes.json(),
        cityRes.json(),
      ]);

      const merged = [...(muniData || []), ...(cityData || [])];

      if (Array.isArray(merged)) {
        const sorted = merged
          .map((m: any) => ({ code: m.code, name: m.name }))
          .sort((a: Municipality, b: Municipality) =>
            a.name.localeCompare(b.name)
          );
        setMunicipalities(sorted);
      } else {
        toast.error("Unexpected data format for municipalities/cities");
      }
    } catch (error) {
      console.error("Error fetching municipalities and cities:", error);
      toast.error("Failed to load municipalities and cities");
    }
  };

  const fetchBarangays = async (code: string) => {
    try {
      let response = await fetch(
        `https://psgc.gitlab.io/api/municipalities/${code}/barangays/`
      );
      if (!response.ok) {
        response = await fetch(`https://psgc.gitlab.io/api/cities/${code}/barangays/`);
      }
      const data = await response.json();

      if (Array.isArray(data)) {
        const sorted = data
          .map((b: any) => ({ code: b.code, name: b.name }))
          .sort((a: Barangay, b: Barangay) => a.name.localeCompare(b.name));
        setBarangays(sorted);
      } else {
        toast.error("Unexpected data format for barangays");
      }
    } catch (error) {
      console.error("Error fetching barangays:", error);
      toast.error("Failed to load barangays");
    }
  };

  const handleMunicipalityChange = (code: string) => {
    const selectedMunicipality = municipalities.find((m) => m.code === code);
    setFormData((prev) => ({
      ...prev,
      municipality: selectedMunicipality?.name || "",
      location: "",
    }));
    setBarangays([]);
    if (code) fetchBarangays(code);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const eventData = {
      name: formData.name,
      event_type: formData.event_type.length
        ? formData.event_type.join(", ")
        : null,
      location: formData.location,
      municipality: formData.municipality || null,
      description: formData.description || null,
      event_date: formData.event_date || null,
      image_url: formData.image_url || null,
    };

    if (editingEvent) {
      const { error } = await supabase
        .from("events")
        .update(eventData)
        .eq("id", editingEvent.id);

      if (error) {
        toast.error("Failed to update event");
      } else {
        toast.success("Event updated successfully");
        resetForm();
        fetchEvents();
      }
    } else {
      const { error } = await supabase.from("events").insert([eventData]);

      if (error) {
        toast.error("Failed to add event");
      } else {
        toast.success("Event added successfully");
        resetForm();
        fetchEvents();
      }
    }

    setIsLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;

    const { error } = await supabase.from("events").delete().eq("id", id);

    if (error) {
      toast.error("Failed to delete event");
    } else {
      toast.success("Event deleted successfully");
      fetchEvents();
    }
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      name: event.name,
      event_type: event.event_type
        ? event.event_type.split(", ").map((t) => t.trim())
        : [],
      location: event.location,
      municipality: event.municipality || "",
      description: event.description || "",
      event_date: event.event_date || "",
      image_url: event.image_url || "",
    });

    const muni = municipalities.find((m) => m.name === event.municipality);
    if (muni?.code) {
      fetchBarangays(muni.code);
    } else {
      fetchMunicipalities().then(() => {
        const found = municipalities.find((m) => m.name === event.municipality);
        if (found?.code) fetchBarangays(found.code);
      });
    }

    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      event_type: [],
      location: "",
      municipality: "",
      description: "",
      event_date: "",
      image_url: "",
    });
    setEditingEvent(null);
    setBarangays([]);
    setIsDialogOpen(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">
          Events & Festivals ({events.length})
        </h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="w-4 h-4 mr-2" />
              Add Event
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingEvent ? "Edit" : "Add"} Event/Festival
              </DialogTitle>
              <DialogDescription>Fill in the event details</DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              {/* Multi-select Event Type Dropdown (same UI logic as other dropdowns) */}
<div>
  <Label htmlFor="event_type">Event Type</Label>
  <Select
    onValueChange={(value) => {
      setFormData((prev) => {
        const alreadySelected = prev.event_type.includes(value);
        const updated = alreadySelected
          ? prev.event_type.filter((t) => t !== value)
          : [...prev.event_type, value];
        return { ...prev, event_type: updated };
      });
    }}
    value=""
  >
    <SelectTrigger>
      <SelectValue
        placeholder={
          formData.event_type.length > 0
            ? formData.event_type.join(", ")
            : "Select event types"
        }
      />
    </SelectTrigger>
    <SelectContent>
      {[
        "Festival",
        "Exhibition",
        "Parade",
        "Local Event",
        "Regional Event",
        "Public",
        "Private",
      ].map((type) => (
        <SelectItem key={type} value={type}>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.event_type.includes(type)}
              readOnly
            />
            <span>{type}</span>
          </div>
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>



              {/* Municipality/City Dropdown */}
              <div>
                <Label>Municipality or City</Label>
                <Select
                  onValueChange={handleMunicipalityChange}
                  value={
                    municipalities.find(
                      (m) => m.name === formData.municipality
                    )?.code || ""
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select municipality or city" />
                  </SelectTrigger>
                  <SelectContent>
                    {municipalities.map((m) => (
                      <SelectItem key={m.code} value={m.code}>
                        {m.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Barangay (Location) Dropdown */}
              <div>
                <Label>Location (Barangay) *</Label>
                <Select
                  onValueChange={(code) => {
                    const barangay = barangays.find((b) => b.code === code);
                    setFormData((prev) => ({
                      ...prev,
                      location: barangay?.name || "",
                    }));
                  }}
                  value={
                    barangays.find((b) => b.name === formData.location)?.code ||
                    ""
                  }
                  disabled={!barangays.length}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        barangays.length
                          ? "Select a barangay"
                          : "Select municipality first"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {barangays.map((b) => (
                      <SelectItem key={b.code} value={b.code}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="event_date">Event Date</Label>
                <Input
                  id="event_date"
                  type="date"
                  value={formData.event_date}
                  onChange={(e) =>
                    setFormData({ ...formData, event_date: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="image">Image URL</Label>
                <Input
                  id="image"
                  value={formData.image_url}
                  onChange={(e) =>
                    setFormData({ ...formData, image_url: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>{editingEvent ? "Update" : "Add"} Event</>
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {events.map((event) => (
          <Card key={event.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="mb-2">{event.name}</CardTitle>
                  {event.event_type && (
                    <p className="text-sm font-medium text-primary mb-2">
                      {event.event_type}
                    </p>
                  )}
                  {event.event_date && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(event.event_date).toLocaleDateString()}
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground mb-2">
                    {event.location}
                  </p>
                  {event.description && (
                    <p className="text-sm text-muted-foreground">
                      {event.description}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(event)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(event.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ManageEvents;
