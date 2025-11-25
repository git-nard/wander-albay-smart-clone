import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react"; // optional icon for location button

const WEATHER_API_KEY = "025726ae353d8aafa5f04c4cf8f38747"; // replace with your own key
const alertVariants = cva(
  "relative w-full rounded-lg border bg-background text-foreground shadow-md p-6 flex flex-col items-center justify-center text-center",
  {
    variants: {
      variant: {
        default: "",
        destructive:
          "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => {
  const [location, setLocation] = React.useState("Legazpi");
  const [weather, setWeather] = React.useState<any>(null);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchWeather = async (
    city?: string,
    coords?: { lat: number; lon: number }
  ) => {
    setLoading(true);
    setError(null);
    setWeather(null);

    try {
      let url = "";

      if (coords) {
        url = `https://api.openweathermap.org/data/2.5/weather?lat=${coords.lat}&lon=${coords.lon}&appid=${WEATHER_API_KEY}&units=metric`;
      } else if (city) {
        url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
          city
        )},PH&appid=${WEATHER_API_KEY}&units=metric`;
      } else {
        throw new Error("No location provided");
      }

      const res = await axios.get(url);
      setWeather(res.data);
      setLocation(res.data.name); // update input with actual city
    } catch {
      setError("⚠️ Unable to fetch weather data. Please check the city or try again.");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchWeather(undefined, { lat: latitude, lon: longitude });
        },
        () => {
          fetchWeather(location);
        }
      );
    } else {
      fetchWeather(location);
    }
  }, []);

  const getWeatherIcon = (condition: string) => {
    const desc = condition.toLowerCase();
    if (desc.includes("cloud")) return "☁️";
    if (desc.includes("rain")) return "🌧️";
    if (desc.includes("clear")) return "☀️";
    if (desc.includes("thunderstorm")) return "⛈️";
    if (desc.includes("drizzle")) return "🌦️";
    if (desc.includes("mist") || desc.includes("fog")) return "🌫️";
    return "🌡️";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchWeather(location);
  };

  const handleUseMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchWeather(undefined, { lat: latitude, lon: longitude });
        },
        () => {
          setError(
            "⚠️ Unable to access your location. Please enter a city manually."
          );
        }
      );
    } else {
      setError("⚠️ Geolocation is not supported by your browser.");
    }
  };

  return (
    <div
      ref={ref}
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      {/* Form with input and search button */}
      <form
        onSubmit={handleSubmit}
        className="flex flex-col sm:flex-row gap-2 w-full max-w-sm mb-2"
      >
        <Input
          type="text"
          placeholder="Enter city (e.g., Tabaco, Bacacay)"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="flex-1 min-w-[150px]"
        />
        <Button type="submit" disabled={loading}>
          {loading ? "Loading..." : "Search"}
        </Button>
      </form>

      {/* Use My Location button below */}
      <Button
  type="button"
  variant="secondary"
  onClick={handleUseMyLocation}
  disabled={loading}
  className="flex items-center justify-center gap-2 w-full max-w-sm sm:max-w-md mb-4"
>
  <MapPin className="w-4 h-4" />
  Use My Location
</Button>


      {/* Weather Display */}
      {loading ? (
        <div className="flex flex-col items-center space-y-2 animate-pulse">
          <div className="h-8 w-8 rounded-full border-2 border-muted-foreground border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">Fetching weather data...</p>
        </div>
      ) : error ? (
        <p className="text-red-500 font-medium">{error}</p>
      ) : weather ? (
        <>
          <div className="text-6xl mb-3">{getWeatherIcon(weather.weather[0].main)}</div>
          <h5 className="text-lg font-semibold">{weather.name}, Philippines</h5>
          <p className="capitalize text-muted-foreground mb-2">
            {weather.weather[0].description}
          </p>

          <div className="w-full flex flex-col gap-1 text-sm text-foreground/80">
            <div className="flex items-center justify-center gap-2">
              <span>🌡️</span>
              <span>Temperature: {weather.main.temp.toFixed(1)}°C</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <span>💧</span>
              <span>Humidity: {weather.main.humidity}%</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <span>🌬️</span>
              <span>Wind Speed: {weather.wind.speed} m/s</span>
            </div>
          </div>
        </>
      ) : (
        <p className="text-muted-foreground text-sm">
          Enter a location to view its weather.
        </p>
      )}
    </div>
  );
});

Alert.displayName = "Alert";

export { Alert };
