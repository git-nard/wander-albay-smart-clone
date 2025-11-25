import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Users, MapPin, BookOpen, Star } from "lucide-react";

const Analytics = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSpots: 0,
    totalItineraries: 0,
    totalReviews: 0,
  });
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [municipalityData, setMunicipalityData] = useState<any[]>([]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    // Fetch total counts
    const { count: usersCount } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    const { count: spotsCount } = await supabase
      .from("tourist_spots")
      .select("*", { count: "exact", head: true });

    const { count: itinerariesCount } = await supabase
      .from("itineraries")
      .select("*", { count: "exact", head: true });

    const { count: reviewsCount } = await supabase
      .from("reviews")
      .select("*", { count: "exact", head: true });

    setStats({
      totalUsers: usersCount || 0,
      totalSpots: spotsCount || 0,
      totalItineraries: itinerariesCount || 0,
      totalReviews: reviewsCount || 0,
    });

    // Fetch category distribution
    const { data: spots } = await supabase
      .from("tourist_spots")
      .select("category");

    if (spots) {
      const categoryCount: Record<string, number> = {};
      spots.forEach((spot) => {
        spot.category.forEach((cat: string) => {
          categoryCount[cat] = (categoryCount[cat] || 0) + 1;
        });
      });

      const categoryChartData = Object.entries(categoryCount).map(([name, value]) => ({
        name,
        count: value,
      }));

      setCategoryData(categoryChartData);
    }

    // Fetch municipality distribution
    const { data: municipalitySpots } = await supabase
      .from("tourist_spots")
      .select("municipality");

    if (municipalitySpots) {
      const municipalityCount: Record<string, number> = {};
      municipalitySpots.forEach((spot) => {
        if (spot.municipality) {
          municipalityCount[spot.municipality] = (municipalityCount[spot.municipality] || 0) + 1;
        }
      });

      const municipalityChartData = Object.entries(municipalityCount)
        .map(([name, value]) => ({
          name,
          spots: value,
        }))
        .sort((a, b) => b.spots - a.spots)
        .slice(0, 10);

      setMunicipalityData(municipalityChartData);
    }
  };

  const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--secondary))", "#fbbf24", "#3b82f6", "#8b5cf6"];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Analytics Dashboard</h2>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tourist Spots</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSpots}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Saved Itineraries</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalItineraries}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReviews}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Spots by Municipality</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={municipalityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="spots" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Category Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;