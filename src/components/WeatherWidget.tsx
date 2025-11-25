import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Cloud, CloudRain, Sun, Wind, AlertTriangle } from "lucide-react";
import { Alert } from "@/components/ui/alert";

const WeatherWidget = () => {
  const [weather, setWeather] = useState({
    condition: "partly-cloudy",
    temperature: 28,
    humidity: 75,
    windSpeed: 12,
    alert: "Volcanic ash advisory in effect for Mayon Volcano area"
  });

  // Simulated weather data - in production, integrate with weather API
  useEffect(() => {
    // Mock weather update
    const interval = setInterval(() => {
      setWeather(prev => ({
        ...prev,
        temperature: 26 + Math.floor(Math.random() * 6)
      }));
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const getWeatherIcon = () => {
    switch (weather.condition) {
      case "sunny":
        return <Sun className="w-8 h-8 text-yellow-500" />;
      case "rainy":
        return <CloudRain className="w-8 h-8 text-blue-500" />;
      default:
        return <Cloud className="w-8 h-8 text-gray-400" />;
    }
  };

  return (
    <div className="mb-12 animate-fade-in">
      <h2 className="text-2xl font-bold mb-4">Current Conditions 🌤️</h2>
      
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-3xl font-bold">{weather.temperature}°C</h3>
                <p className="text-muted-foreground">Legazpi City, Albay</p>
              </div>
              {getWeatherIcon()}
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Cloud className="w-4 h-4 text-muted-foreground" />
                <span>Humidity: {weather.humidity}%</span>
              </div>
              <div className="flex items-center gap-2">
                <Wind className="w-4 h-4 text-muted-foreground" />
                <span>Wind: {weather.windSpeed} km/h</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {weather.alert && (
          <Alert className="border-yellow-500 bg-yellow-500/10">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
              <div>
                <strong className="font-semibold">Safety Alert:</strong>
                <p className="text-sm mt-1">{weather.alert}</p>
              </div>
            </div>
          </Alert>
        )}
      </div>
    </div>
  );
};

export default WeatherWidget;
