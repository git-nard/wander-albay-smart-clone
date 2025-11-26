import React, { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import { useLocation } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Marker icon
const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Fly to a location on the map
const FlyToLocation = ({ coords }: { coords: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    if (coords) map.flyTo(coords, 14);
  }, [coords]);
  return null;
};

const Map = () => {
  const location = useLocation();
  const state = location.state as {
    destination?: { name: string; lat?: number; lon?: number };
  };

  const [position, setPosition] = useState<[number, number] | null>(null);
  const [destination, setDestination] = useState<[number, number] | null>(null);
  const [destinationName, setDestinationName] = useState<string>("");
  const [route, setRoute] = useState<[number, number][]>([]);
  const [distance, setDistance] = useState<number | null>(null);
  const [duration, setDuration] = useState<number | null>(null);

  const [destinationInput, setDestinationInput] = useState("");
  const [recommendation, setRecommendation] = useState("");

  // Get user location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setPosition([pos.coords.latitude, pos.coords.longitude]),
      () => alert("Failed to get your location. Please enable location services.")
    );
  }, []);

  // Fetch coordinates only within Albay, Philippines
  const fetchAlbayCoordinates = async (query: string) => {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query + ", Albay, Philippines"
      )}&countrycodes=ph&viewbox=123.0,12.9,124.0,13.5&bounded=1&limit=1`
    );
    const data = await res.json();
    if (data && data[0]) {
      return [parseFloat(data[0].lat), parseFloat(data[0].lon)] as [number, number];
    }
    return null;
  };

  // If navigating from another page with a destination
  useEffect(() => {
    if (!state?.destination) return;

    if (state.destination.lat && state.destination.lon) {
      setDestination([state.destination.lat, state.destination.lon]);
      setDestinationName(state.destination.name);
    } else {
      fetchAlbayCoordinates(state.destination.name).then((coords) => {
        if (coords) setDestination(coords);
        setDestinationName(state.destination.name);
      });
    }
  }, [state]);

  // Manual search for Albay destinations
  const handleSearch = async () => {
    if (!destinationInput) return;

    const coords = await fetchAlbayCoordinates(destinationInput);
    if (coords) {
      setDestination(coords);
      setDestinationName(destinationInput);
    } else {
      alert("Destination not found in Albay.");
    }
  };

  // Generate route when position + destination exist
  useEffect(() => {
    if (!position || !destination) return;

    const fetchRoute = async () => {
      const url = `https://router.project-osrm.org/route/v1/driving/${position[1]},${position[0]};${destination[1]},${destination[0]}?overview=full&geometries=geojson`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.routes && data.routes.length > 0) {
        const routeCoords = data.routes[0].geometry.coordinates.map(
          (c: number[]) => [c[1], c[0]] as [number, number]
        );
        setRoute(routeCoords);
        const km = data.routes[0].distance / 1000;
        const min = data.routes[0].duration / 60;
        setDistance(km);
        setDuration(min);

        if (km < 10)
          setRecommendation("🚌 Take a tricycle, jeepney, or walk if nearby.");
        else if (km < 80) setRecommendation("🚐 Take a bus or van.");
        else setRecommendation("🚗 Drive or rent a vehicle for comfort.");
      }
    };

    fetchRoute();
  }, [position, destination]);

  return (
    <div style={{ display: "flex", justifyContent: "center", padding: 16 }}>
      <div
        style={{
          display: "flex",
          width: "100%",
          maxWidth: 1200,
          height: "80vh",
          background: "#1e293b",
          borderRadius: 16,
          overflow: "hidden",
        }}
      >
        {/* Sidebar */}
        <div
          style={{
            width: 320,
            padding: 16,
            display: "flex",
            flexDirection: "column",
            gap: 16,
            color: "#fff",
          }}
        >
          <h3 style={{ color: "#38bdf8" }}>Search Destination</h3>
          <input
            type="text"
            placeholder="Enter destination..."
            value={destinationInput}
            onChange={(e) => setDestinationInput(e.target.value)}
            style={{ padding: 8, borderRadius: 8 }}
          />
          <button
            onClick={handleSearch}
            style={{
              padding: 10,
              borderRadius: 8,
              background: "#3b82f6",
              color: "#fff",
              border: "none",
            }}
          >
            🔍 Search
          </button>

          {distance && duration && (
            <div style={{ background: "#334155", borderRadius: 10, padding: 12 }}>
              <div>🚗 {distance.toFixed(2)} km</div>
              <div>⏱ {Math.round(duration)} min</div>
              <div>{recommendation}</div>
            </div>
          )}

          <button
            onClick={() =>
              navigator.geolocation.getCurrentPosition(
                (pos) => setPosition([pos.coords.latitude, pos.coords.longitude]),
                () => alert("Unable to get location")
              )
            }
            style={{
              marginTop: 16,
              padding: 10,
              borderRadius: 8,
              background: "#f43f5e",
              color: "#fff",
              border: "none",
            }}
          >
            📍 Use My Location
          </button>
        </div>

        {/* Map */}
        <div style={{ flex: 1 }}>
          <MapContainer
            center={position || [13.143, 123.735]}
            zoom={12}
            style={{ width: "100%", height: "100%" }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {position && (
              <Marker position={position} icon={markerIcon}>
                <Popup>Your location</Popup>
              </Marker>
            )}
            {destination && (
              <Marker position={destination} icon={markerIcon}>
                <Popup>{destinationName}</Popup>
              </Marker>
            )}
            {route.length > 0 && <Polyline positions={route} color="#38bdf8" />}
            {destination && <FlyToLocation coords={destination} />}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default Map;