import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, X, Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Event {
  id: string;
  name: string;
  description: string;
  event_date: string;
  municipality: string;
  location: string;
  event_type: string;
  image_url: string;
}

interface EventNotificationsProps {
  userDistricts: string[];
}

const EventNotifications = ({ userDistricts }: EventNotificationsProps) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchUpcomingEvents();
  }, [userDistricts]);

  const fetchUpcomingEvents = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const thirtyDaysLater = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const { data, error } = await supabase
        .from("events")
        .select("*")
        .gte("event_date", today)
        .lte("event_date", thirtyDaysLater)
        .order("event_date", { ascending: true });

      if (error) throw error;

      if (data) {
        // Filter events by user's districts
        const districtMunicipalities = getDistrictMunicipalities(userDistricts);
        const filteredEvents = data.filter(event => 
          districtMunicipalities.some(m => event.municipality?.includes(m))
        );

        setEvents(filteredEvents);
        
        // Show toast for new events
        if (filteredEvents.length > 0) {
          toast.success(`🎉 ${filteredEvents.length} upcoming event${filteredEvents.length > 1 ? 's' : ''} in your area!`);
        }
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const getDistrictMunicipalities = (districts: string[]): string[] => {
    const municipalities: string[] = [];
    
    districts.forEach(district => {
      if (district === "District 1") {
        municipalities.push("Bacacay", "Malilipot", "Malinao", "Santo Domingo", "Tiwi", "Tabaco");
      } else if (district === "District 2") {
        municipalities.push("Camalig", "Guinobatan", "Ligao", "Jovellar");
      } else if (district === "District 3") {
        municipalities.push("Legazpi", "Daraga", "Manito", "Rapu-Rapu");
      }
    });
    
    return municipalities;
  };

  const dismissEvent = (eventId: string) => {
    setDismissed(new Set(dismissed).add(eventId));
  };

  const visibleEvents = events.filter(event => !dismissed.has(event.id));

  if (visibleEvents.length === 0) return null;

  return (
    <div className="mb-12 animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <Bell className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold">Upcoming Events in Your Area 🎊</h2>
      </div>
      
      <div className="grid md:grid-cols-2 gap-4">
        {visibleEvents.map((event) => (
          <Card key={event.id} className="relative overflow-hidden hover:shadow-lg transition-shadow">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 z-10"
              onClick={() => dismissEvent(event.id)}
            >
              <X className="w-4 h-4" />
            </Button>
            
            <div className="flex gap-4 p-4">
              {event.image_url && (
                <img
                  src={event.image_url}
                  alt={event.name}
                  className="w-24 h-24 object-cover rounded"
                />
              )}
              <CardContent className="p-0 flex-1">
                <Badge variant="secondary" className="mb-2">
                  {event.event_type || "Event"}
                </Badge>
                <h3 className="font-semibold text-lg mb-2">{event.name}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(event.event_date).toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{event.municipality || event.location}</span>
                </div>
                {event.description && (
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {event.description}
                  </p>
                )}
              </CardContent>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default EventNotifications;
