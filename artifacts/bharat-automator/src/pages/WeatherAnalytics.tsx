import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/PageHeader";
import { useToast } from "@/hooks/use-toast";
import {
  Cloud, Droplets, Wind, Thermometer, Sun, CloudRain, CloudLightning,
  AlertTriangle, RefreshCw, Clock, MapPin, Eye, ArrowUp, Gauge, Activity,
  Search, Globe, Navigation, X, Loader2
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from "recharts";

interface CityWeather {
  city: string;
  state: string;
  lat: number;
  lng: number;
  current: {
    temperature: number;
    feelsLike: number;
    humidity: number;
    precipitation: number;
    rain: number;
    windSpeed: number;
    windGusts: number;
    windDirection: number;
    pressure: number;
    cloudCover: number;
    isDay: boolean;
    weatherCode: number;
    condition: string;
    conditionSeverity: string;
    conditionIcon: string;
    windDescription: string;
    windSeverity: string;
  };
  forecast: ForecastDay[];
  alerts: string[];
}

interface ForecastDay {
  date: string;
  maxTemp: number;
  minTemp: number;
  precipitation: number;
  rain: number;
  uvIndex: number;
  maxWind: number;
  weatherCode: number;
  condition: string;
  conditionIcon: string;
}

interface HourlyData {
  time: string;
  fullTime: string;
  temperature: number;
  precipitation: number;
  windSpeed: number;
  humidity: number;
  weatherCode: number;
  condition: string;
}

interface Earthquake {
  id: string;
  magnitude: number;
  place: string;
  time: string;
  depth: number;
  lat: number;
  lng: number;
  severity: string;
  tsunami: boolean;
  felt: number;
  significance: number;
  url: string;
}

interface NationalData {
  avgTemperature: number;
  maxWindSpeed: number;
  totalPrecipitation: number;
  stormCitiesCount: number;
  alerts: string[];
}

interface SearchResult {
  id: number;
  name: string;
  admin1: string;
  admin2: string;
  country: string;
  countryCode: string;
  lat: number;
  lng: number;
  elevation: number;
  population: number;
  timezone: string;
  label: string;
}

interface LocationWeather {
  location: { name: string; region: string; lat: number; lng: number; timezone: string; elevation: number };
  current: CityWeather["current"];
  forecast: ForecastDay[];
  hourly: HourlyData[];
  alerts: string[];
}

type TabId = "overview" | "cities" | "forecast" | "earthquakes" | "search";

export default function WeatherAnalytics() {
  const { toast } = useToast();
  const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

  const [cities, setCities] = useState<CityWeather[]>([]);
  const [national, setNational] = useState<NationalData | null>(null);
  const [earthquakes, setEarthquakes] = useState<Earthquake[]>([]);
  const [eqSummary, setEqSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [selectedCity, setSelectedCity] = useState<string>("Delhi");

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [locationWeather, setLocationWeather] = useState<LocationWeather | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [searchHistory, setSearchHistory] = useState<{ name: string; region: string; lat: number; lng: number }[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [weatherRes, eqRes] = await Promise.all([
        fetch(`${BASE}/api/weather/current`).then(r => r.ok ? r.json() : Promise.reject()),
        fetch(`${BASE}/api/weather/earthquakes`).then(r => r.ok ? r.json() : Promise.reject()),
      ]);
      setCities(weatherRes.cities || []);
      setNational(weatherRes.national || null);
      setEarthquakes(eqRes.earthquakes || []);
      setEqSummary(eqRes.summary || null);
      setLastRefresh(new Date());
    } catch {
      toast({ title: "Error", description: "Failed to fetch weather data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [BASE, toast]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => {
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSearch = useCallback(async (q: string) => {
    if (q.length < 2) { setSearchResults([]); setShowDropdown(false); return; }
    setSearching(true);
    try {
      const res = await fetch(`${BASE}/api/weather/search?q=${encodeURIComponent(q)}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSearchResults(data.results || []);
      setShowDropdown(true);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, [BASE]);

  const onSearchInput = (val: string) => {
    setSearchQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => handleSearch(val), 300);
  };

  const selectLocation = async (loc: SearchResult) => {
    setShowDropdown(false);
    setSearchQuery(loc.label);
    setLoadingLocation(true);
    try {
      const region = [loc.admin1, loc.country].filter(Boolean).join(", ");
      const res = await fetch(`${BASE}/api/weather/location?lat=${loc.lat}&lng=${loc.lng}&name=${encodeURIComponent(loc.name)}&region=${encodeURIComponent(region)}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setLocationWeather(data);
      const entry = { name: loc.name, region, lat: loc.lat, lng: loc.lng };
      setSearchHistory(prev => {
        const filtered = prev.filter(p => !(p.lat === loc.lat && p.lng === loc.lng));
        return [entry, ...filtered].slice(0, 8);
      });
    } catch {
      toast({ title: "Error", description: "Failed to fetch weather for this location", variant: "destructive" });
    } finally {
      setLoadingLocation(false);
    }
  };

  const loadFromHistory = async (h: { name: string; region: string; lat: number; lng: number }) => {
    setSearchQuery(`${h.name}, ${h.region}`);
    setLoadingLocation(true);
    try {
      const res = await fetch(`${BASE}/api/weather/location?lat=${h.lat}&lng=${h.lng}&name=${encodeURIComponent(h.name)}&region=${encodeURIComponent(h.region)}`);
      if (!res.ok) throw new Error();
      setLocationWeather(await res.json());
    } catch {
      toast({ title: "Error", description: "Failed to fetch weather", variant: "destructive" });
    } finally {
      setLoadingLocation(false);
    }
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      toast({ title: "Error", description: "Geolocation not supported", variant: "destructive" });
      return;
    }
    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude: lat, longitude: lng } = pos.coords;
          const res = await fetch(`${BASE}/api/weather/location?lat=${lat}&lng=${lng}&name=${encodeURIComponent("My Location")}&region=${encodeURIComponent("GPS Location")}`);
          if (!res.ok) throw new Error();
          const data = await res.json();
          setLocationWeather(data);
          setSearchQuery(`My Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
        } catch {
          toast({ title: "Error", description: "Failed to fetch weather", variant: "destructive" });
        } finally {
          setLoadingLocation(false);
        }
      },
      () => { setLoadingLocation(false); toast({ title: "Error", description: "Location access denied", variant: "destructive" }); }
    );
  };

  const selected = cities.find(c => c.city === selectedCity);
  const severityColor = (s: string) =>
    s === "danger" ? "text-red-400 border-red-500/30 bg-red-500/10" :
    s === "warning" ? "text-orange-400 border-orange-500/30 bg-orange-500/10" :
    s === "caution" ? "text-yellow-400 border-yellow-500/30 bg-yellow-500/10" :
    "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";

  const eqSeverityColor = (s: string) =>
    s === "catastrophic" ? "bg-red-600" : s === "severe" ? "bg-red-500" :
    s === "major" ? "bg-orange-500" : s === "moderate" ? "bg-yellow-500" : "bg-emerald-500";

  const tooltipStyle = { backgroundColor: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff" };

  const tabs = [
    { id: "overview" as const, label: "National Overview", icon: Eye },
    { id: "search" as const, label: "Search Any Location", icon: Search },
    { id: "cities" as const, label: "City Weather", icon: MapPin },
    { id: "forecast" as const, label: "7-Day Forecast", icon: Cloud },
    { id: "earthquakes" as const, label: "Earthquakes", icon: Activity },
  ];

  const allAlerts = cities.flatMap(c => c.alerts.map(a => `${c.city}: ${a}`));

  const windDirLabel = (deg: number) => {
    const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    return dirs[Math.round(deg / 45) % 8];
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader icon={Cloud} title="Weather & Disaster Analytics" description="Real-time weather for any location worldwide — village, city, state, or country. Powered by Open-Meteo & USGS." />

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2 flex-wrap">
          {tabs.map(t => (
            <Button key={t.id} variant={activeTab === t.id ? "default" : "outline"} size="sm"
              onClick={() => setActiveTab(t.id)} className={activeTab === t.id ? "bg-primary text-white" : "border-white/20 text-white hover:bg-white/10"}>
              <t.icon size={14} className="mr-1.5" /> {t.label}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px]">LIVE DATA</Badge>
          <span className="text-[10px] text-muted-foreground font-mono flex items-center gap-1">
            <Clock size={10} /> {lastRefresh.toLocaleTimeString()} (auto: 60s)
          </span>
          <Button variant="outline" size="sm" onClick={fetchData} disabled={loading} className="border-white/20 text-white hover:bg-white/10">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </Button>
        </div>
      </div>

      {allAlerts.length > 0 && (
        <Card className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border-red-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="text-red-400" size={18} />
              <span className="text-red-400 font-bold text-sm uppercase tracking-widest">Active Alerts</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {allAlerts.slice(0, 8).map((a, i) => (
                <Badge key={i} variant="outline" className="bg-red-500/10 text-red-300 border-red-500/30 text-[11px]">{a}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "search" && (
        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Globe className="text-indigo-400" size={24} />
                <div>
                  <p className="text-white font-bold text-lg">Search Any Location Worldwide</p>
                  <p className="text-sm text-muted-foreground">Village, City, State, Country — type name and get real-time weather</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-1 relative" ref={searchRef}>
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={searchQuery}
                      onChange={e => onSearchInput(e.target.value)}
                      onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
                      placeholder="Type any location... (e.g. Varanasi, London, Shimla, Tokyo)"
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-500 h-12 text-base"
                    />
                    {searching && <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground animate-spin" />}
                    {searchQuery && !searching && (
                      <button onClick={() => { setSearchQuery(""); setSearchResults([]); setShowDropdown(false); }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white">
                        <X size={16} />
                      </button>
                    )}
                  </div>

                  {showDropdown && searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-white/10 rounded-lg shadow-2xl z-50 max-h-[350px] overflow-y-auto">
                      {searchResults.map(r => (
                        <button key={r.id} onClick={() => selectLocation(r)}
                          className="w-full text-left px-4 py-3 hover:bg-white/10 border-b border-white/5 transition-colors flex items-center gap-3">
                          <MapPin size={14} className="text-indigo-400 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-white text-sm font-medium truncate">{r.name}</p>
                            <p className="text-[10px] text-muted-foreground truncate">
                              {[r.admin2, r.admin1, r.country].filter(Boolean).join(", ")}
                              {r.population > 0 && ` | Pop: ${r.population.toLocaleString()}`}
                            </p>
                          </div>
                          <span className="text-[9px] text-gray-500 shrink-0 font-mono">{r.lat.toFixed(2)}, {r.lng.toFixed(2)}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <Button onClick={useMyLocation} disabled={loadingLocation} className="bg-indigo-600 hover:bg-indigo-700 text-white h-12 px-4 shrink-0">
                  <Navigation size={16} className="mr-2" />
                  My Location
                </Button>
              </div>

              {searchHistory.length > 0 && (
                <div className="mt-3 flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Recent:</span>
                  {searchHistory.map((h, i) => (
                    <Button key={i} variant="outline" size="sm" onClick={() => loadFromHistory(h)}
                      className="border-white/10 text-white/80 hover:bg-white/10 text-[11px] h-7 px-2">
                      <MapPin size={10} className="mr-1" /> {h.name}
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {loadingLocation && (
            <div className="flex items-center justify-center py-16 gap-3">
              <Loader2 size={24} className="animate-spin text-indigo-400" />
              <span className="text-muted-foreground">Loading weather data...</span>
            </div>
          )}

          {!loadingLocation && locationWeather && (
            <div className="space-y-6">
              <Card className="bg-gradient-to-br from-blue-500/5 to-cyan-500/5 border-white/10">
                <CardHeader>
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <CardTitle className="text-2xl text-white flex items-center gap-3">
                        <span className="text-4xl">{locationWeather.current.conditionIcon}</span>
                        {locationWeather.location.name}
                      </CardTitle>
                      <CardDescription className="ml-14">
                        {locationWeather.location.region} | {locationWeather.current.condition} | {locationWeather.current.isDay ? "Daytime" : "Night"}
                        <span className="ml-2 text-[10px]">({locationWeather.location.lat.toFixed(4)}°N, {locationWeather.location.lng.toFixed(4)}°E)</span>
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-5xl font-bold text-white">{locationWeather.current.temperature}°C</p>
                      <p className="text-sm text-muted-foreground">Feels like {locationWeather.current.feelsLike}°C</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                      <div className="flex items-center gap-2 mb-1">
                        <Droplets size={14} className="text-blue-400" />
                        <span className="text-[10px] text-muted-foreground uppercase">Humidity</span>
                      </div>
                      <p className="text-xl font-bold text-white">{locationWeather.current.humidity}%</p>
                    </div>
                    <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                      <div className="flex items-center gap-2 mb-1">
                        <Wind size={14} className="text-cyan-400" />
                        <span className="text-[10px] text-muted-foreground uppercase">Wind</span>
                      </div>
                      <p className="text-xl font-bold text-white">{locationWeather.current.windSpeed} km/h</p>
                      <p className="text-[10px] text-muted-foreground">
                        Gusts: {locationWeather.current.windGusts} | {windDirLabel(locationWeather.current.windDirection)}
                      </p>
                      <Badge variant="outline" className={`text-[9px] mt-1 ${severityColor(locationWeather.current.windSeverity)}`}>
                        {locationWeather.current.windDescription}
                      </Badge>
                    </div>
                    <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                      <div className="flex items-center gap-2 mb-1">
                        <CloudRain size={14} className="text-blue-400" />
                        <span className="text-[10px] text-muted-foreground uppercase">Rain</span>
                      </div>
                      <p className="text-xl font-bold text-white">{locationWeather.current.rain} mm</p>
                      <p className="text-[10px] text-muted-foreground">Precip: {locationWeather.current.precipitation} mm</p>
                    </div>
                    <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                      <div className="flex items-center gap-2 mb-1">
                        <Gauge size={14} className="text-purple-400" />
                        <span className="text-[10px] text-muted-foreground uppercase">Pressure</span>
                      </div>
                      <p className="text-xl font-bold text-white">{locationWeather.current.pressure} hPa</p>
                    </div>
                    <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                      <div className="flex items-center gap-2 mb-1">
                        <Cloud size={14} className="text-gray-400" />
                        <span className="text-[10px] text-muted-foreground uppercase">Clouds</span>
                      </div>
                      <p className="text-xl font-bold text-white">{locationWeather.current.cloudCover}%</p>
                    </div>
                    <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                      <div className="flex items-center gap-2 mb-1">
                        <ArrowUp size={14} className="text-green-400" />
                        <span className="text-[10px] text-muted-foreground uppercase">Elevation</span>
                      </div>
                      <p className="text-xl font-bold text-white">{locationWeather.location.elevation}m</p>
                    </div>
                  </div>

                  {locationWeather.alerts.length > 0 && (
                    <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                      <p className="text-red-400 font-bold text-sm mb-2 flex items-center gap-2"><AlertTriangle size={14} /> Weather Alerts</p>
                      {locationWeather.alerts.map((a, i) => (
                        <p key={i} className="text-sm text-red-300">{a}</p>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-card/50 backdrop-blur border-white/10">
                  <CardHeader>
                    <CardTitle className="text-lg text-white">24-Hour Temperature</CardTitle>
                    <CardDescription>Hourly temperature forecast</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={locationWeather.hourly}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="time" tick={{ fill: "#94a3b8", fontSize: 9 }} interval={2} />
                        <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Line type="monotone" dataKey="temperature" stroke="#f97316" strokeWidth={2} dot={false} name="Temp °C" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="bg-card/50 backdrop-blur border-white/10">
                  <CardHeader>
                    <CardTitle className="text-lg text-white">24-Hour Wind & Rain</CardTitle>
                    <CardDescription>Hourly wind speed and precipitation</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={locationWeather.hourly}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="time" tick={{ fill: "#94a3b8", fontSize: 9 }} interval={2} />
                        <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Bar dataKey="windSpeed" fill="#06b6d4" name="Wind km/h" radius={[2, 2, 0, 0]} />
                        <Bar dataKey="precipitation" fill="#3b82f6" name="Rain mm" radius={[2, 2, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-card/50 backdrop-blur border-white/10">
                <CardHeader>
                  <CardTitle className="text-lg text-white">7-Day Forecast — {locationWeather.location.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
                    {locationWeather.forecast.map((f, i) => (
                      <div key={i} className={`p-3 rounded-lg text-center bg-white/5 border border-white/10 ${i === 0 ? "ring-1 ring-primary/50" : ""}`}>
                        <p className="text-[10px] text-muted-foreground mb-1">{new Date(f.date).toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short" })}</p>
                        <p className="text-2xl mb-1">{f.conditionIcon}</p>
                        <div className="flex justify-center gap-2 mb-1">
                          <span className="text-orange-400 font-bold">{f.maxTemp}°</span>
                          <span className="text-blue-400">{f.minTemp}°</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground">{f.condition.replace(/[^\w\s]/g, "").trim()}</p>
                        <div className="mt-2 space-y-0.5 text-[9px]">
                          <p className="text-blue-300">Rain: {f.rain} mm</p>
                          <p className="text-cyan-300">Wind: {f.maxWind} km/h</p>
                          <p className="text-yellow-300">UV: {f.uvIndex}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {!loadingLocation && !locationWeather && (
            <div className="text-center py-16 space-y-4">
              <Globe size={60} className="mx-auto text-indigo-400/30" />
              <p className="text-muted-foreground">Search any location to see real-time weather data</p>
              <div className="flex flex-wrap justify-center gap-2 max-w-xl mx-auto">
                {["Varanasi", "Shimla", "Manali", "Goa", "Darjeeling", "Jaisalmer", "London", "New York", "Tokyo", "Dubai", "Paris", "Singapore"].map(q => (
                  <Button key={q} variant="outline" size="sm" onClick={() => { setSearchQuery(q); handleSearch(q); }}
                    className="border-white/10 text-white/70 hover:bg-white/10 text-xs">
                    {q}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20">
              <CardContent className="p-5">
                <p className="text-[10px] text-orange-300/70 uppercase tracking-widest font-bold">Avg Temperature</p>
                <p className="text-3xl font-bold text-white mt-1">{national?.avgTemperature || 0}°C</p>
                <Thermometer className="text-orange-400 mt-1" size={20} />
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
              <CardContent className="p-5">
                <p className="text-[10px] text-blue-300/70 uppercase tracking-widest font-bold">Total Rainfall</p>
                <p className="text-3xl font-bold text-white mt-1">{national?.totalPrecipitation || 0} mm</p>
                <Droplets className="text-blue-400 mt-1" size={20} />
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border-cyan-500/20">
              <CardContent className="p-5">
                <p className="text-[10px] text-cyan-300/70 uppercase tracking-widest font-bold">Max Wind</p>
                <p className="text-3xl font-bold text-white mt-1">{national?.maxWindSpeed || 0} km/h</p>
                <Wind className="text-cyan-400 mt-1" size={20} />
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20">
              <CardContent className="p-5">
                <p className="text-[10px] text-red-300/70 uppercase tracking-widest font-bold">Earthquakes</p>
                <p className="text-3xl font-bold text-white mt-1">{eqSummary?.total || 0}</p>
                <p className="text-[10px] text-yellow-400 mt-0.5">{eqSummary?.significant || 0} significant (4.0+)</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-card/50 backdrop-blur border-white/10">
              <CardHeader>
                <CardTitle className="text-lg text-white">City Temperatures</CardTitle>
                <CardDescription>Current temperature across major Indian cities</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={cities.map(c => ({ city: c.city, temp: c.current.temperature, feels: c.current.feelsLike }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="city" tick={{ fill: "#94a3b8", fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
                    <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="temp" fill="#f97316" name="Temperature °C" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="feels" fill="#fb923c" name="Feels Like °C" radius={[4, 4, 0, 0]} opacity={0.5} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur border-white/10">
              <CardHeader>
                <CardTitle className="text-lg text-white">Wind & Rain</CardTitle>
                <CardDescription>Wind speed and precipitation levels</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={cities.map(c => ({ city: c.city, wind: c.current.windSpeed, rain: c.current.precipitation }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="city" tick={{ fill: "#94a3b8", fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
                    <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="wind" fill="#06b6d4" name="Wind km/h" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="rain" fill="#3b82f6" name="Rain mm" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-card/50 backdrop-blur border-white/10">
            <CardHeader>
              <CardTitle className="text-lg text-white">All Cities — Live Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {cities.map(c => (
                  <div key={c.city} onClick={() => { setSelectedCity(c.city); setActiveTab("cities"); }}
                    className="p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 cursor-pointer transition-all">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white font-bold text-sm">{c.city}</span>
                      <span className="text-lg">{c.current.conditionIcon}</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{c.current.temperature}°C</p>
                    <p className="text-[10px] text-muted-foreground">{c.current.condition.replace(/[^\w\s]/g, "").trim()}</p>
                    <div className="flex gap-2 mt-1 text-[10px]">
                      <span className="text-cyan-400">Wind: {c.current.windSpeed}</span>
                      <span className="text-blue-400">Hum: {c.current.humidity}%</span>
                    </div>
                    {c.alerts.length > 0 && (
                      <Badge variant="outline" className="mt-1 text-[8px] bg-red-500/10 text-red-400 border-red-500/30">{c.alerts.length} alert(s)</Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "cities" && selected && (
        <div className="space-y-6">
          <div className="flex gap-2 flex-wrap">
            {cities.map(c => (
              <Button key={c.city} size="sm" variant={selectedCity === c.city ? "default" : "outline"}
                onClick={() => setSelectedCity(c.city)}
                className={selectedCity === c.city ? "bg-primary text-white" : "border-white/20 text-white hover:bg-white/10 text-xs"}>
                {c.current.conditionIcon} {c.city}
              </Button>
            ))}
          </div>

          <Card className="bg-gradient-to-br from-blue-500/5 to-cyan-500/5 border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl text-white flex items-center gap-3">
                    <span className="text-4xl">{selected.current.conditionIcon}</span>
                    {selected.city}, {selected.state}
                  </CardTitle>
                  <CardDescription className="ml-14">{selected.current.condition} | {selected.current.isDay ? "Daytime" : "Night"}</CardDescription>
                </div>
                <div className="text-right">
                  <p className="text-5xl font-bold text-white">{selected.current.temperature}°C</p>
                  <p className="text-sm text-muted-foreground">Feels like {selected.current.feelsLike}°C</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 mb-1">
                    <Droplets size={14} className="text-blue-400" />
                    <span className="text-[10px] text-muted-foreground uppercase">Humidity</span>
                  </div>
                  <p className="text-xl font-bold text-white">{selected.current.humidity}%</p>
                </div>
                <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 mb-1">
                    <Wind size={14} className="text-cyan-400" />
                    <span className="text-[10px] text-muted-foreground uppercase">Wind</span>
                  </div>
                  <p className="text-xl font-bold text-white">{selected.current.windSpeed} km/h</p>
                  <p className="text-[10px] text-muted-foreground">Gusts: {selected.current.windGusts} km/h</p>
                  <Badge variant="outline" className={`text-[9px] mt-1 ${severityColor(selected.current.windSeverity)}`}>
                    {selected.current.windDescription}
                  </Badge>
                </div>
                <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 mb-1">
                    <CloudRain size={14} className="text-blue-400" />
                    <span className="text-[10px] text-muted-foreground uppercase">Precipitation</span>
                  </div>
                  <p className="text-xl font-bold text-white">{selected.current.precipitation} mm</p>
                  <p className="text-[10px] text-muted-foreground">Rain: {selected.current.rain} mm</p>
                </div>
                <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 mb-1">
                    <Gauge size={14} className="text-purple-400" />
                    <span className="text-[10px] text-muted-foreground uppercase">Pressure</span>
                  </div>
                  <p className="text-xl font-bold text-white">{selected.current.pressure} hPa</p>
                  <p className="text-[10px] text-muted-foreground">Clouds: {selected.current.cloudCover}%</p>
                </div>
              </div>

              {selected.alerts.length > 0 && (
                <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                  <p className="text-red-400 font-bold text-sm mb-2 flex items-center gap-2"><AlertTriangle size={14} /> Active Alerts</p>
                  {selected.alerts.map((a, i) => (
                    <p key={i} className="text-sm text-red-300">{a}</p>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "forecast" && selected && (
        <div className="space-y-6">
          <div className="flex gap-2 flex-wrap">
            {cities.map(c => (
              <Button key={c.city} size="sm" variant={selectedCity === c.city ? "default" : "outline"}
                onClick={() => setSelectedCity(c.city)}
                className={selectedCity === c.city ? "bg-primary text-white" : "border-white/20 text-white hover:bg-white/10 text-xs"}>
                {c.city}
              </Button>
            ))}
          </div>

          <Card className="bg-card/50 backdrop-blur border-white/10">
            <CardHeader>
              <CardTitle className="text-lg text-white">7-Day Temperature Forecast — {selected.city}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={selected.forecast.map(f => ({
                  date: new Date(f.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
                  max: f.maxTemp, min: f.minTemp
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="max" stroke="#f97316" fill="#f97316" fillOpacity={0.15} name="Max °C" />
                  <Area type="monotone" dataKey="min" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} name="Min °C" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            {selected.forecast.map((f, i) => (
              <Card key={i} className={`bg-white/5 border-white/10 ${i === 0 ? "ring-1 ring-primary/50" : ""}`}>
                <CardContent className="p-3 text-center">
                  <p className="text-[10px] text-muted-foreground mb-1">{new Date(f.date).toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short" })}</p>
                  <p className="text-2xl mb-1">{f.conditionIcon}</p>
                  <div className="flex justify-center gap-2 mb-1">
                    <span className="text-orange-400 font-bold">{f.maxTemp}°</span>
                    <span className="text-blue-400">{f.minTemp}°</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">{f.condition.replace(/[^\w\s]/g, "").trim()}</p>
                  <div className="mt-2 space-y-0.5 text-[9px]">
                    <p className="text-blue-300">Rain: {f.rain} mm</p>
                    <p className="text-cyan-300">Wind: {f.maxWind} km/h</p>
                    <p className="text-yellow-300">UV: {f.uvIndex}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === "earthquakes" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20">
              <CardContent className="p-5">
                <p className="text-[10px] text-red-300/70 uppercase tracking-widest font-bold">Total Events</p>
                <p className="text-3xl font-bold text-white mt-1">{eqSummary?.total || 0}</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20">
              <CardContent className="p-5">
                <p className="text-[10px] text-orange-300/70 uppercase tracking-widest font-bold">Significant (4.0+)</p>
                <p className="text-3xl font-bold text-white mt-1">{eqSummary?.significant || 0}</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-yellow-500/20">
              <CardContent className="p-5">
                <p className="text-[10px] text-yellow-300/70 uppercase tracking-widest font-bold">Max Magnitude</p>
                <p className="text-3xl font-bold text-white mt-1">{eqSummary?.maxMagnitude?.toFixed(1) || "0.0"}</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
              <CardContent className="p-5">
                <p className="text-[10px] text-purple-300/70 uppercase tracking-widest font-bold">Tsunami Alerts</p>
                <p className="text-3xl font-bold text-white mt-1">{eqSummary?.tsunamiAlerts || 0}</p>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-card/50 backdrop-blur border-white/10">
            <CardHeader>
              <CardTitle className="text-lg text-white">Recent Seismic Activity — Indian Subcontinent</CardTitle>
              <CardDescription>Data from USGS Earthquake Hazards Program (Real-Time)</CardDescription>
            </CardHeader>
            <CardContent>
              {earthquakes.length === 0 ? (
                <p className="text-muted-foreground text-center py-10">No recent earthquakes in the region.</p>
              ) : (
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {earthquakes.map(eq => (
                    <div key={eq.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 ${eqSeverityColor(eq.severity)}`}>
                        {eq.magnitude.toFixed(1)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{eq.place}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] text-muted-foreground">Depth: {eq.depth.toFixed(1)} km</span>
                          <Badge variant="outline" className={`text-[9px] ${severityColor(eq.severity === "moderate" || eq.severity === "major" ? "warning" : eq.severity === "severe" || eq.severity === "catastrophic" ? "danger" : "normal")}`}>
                            {eq.severity}
                          </Badge>
                          {eq.tsunami && <Badge variant="outline" className="text-[9px] bg-red-500/10 text-red-400 border-red-500/30">Tsunami</Badge>}
                          {eq.felt > 0 && <span className="text-[10px] text-purple-400">Felt by {eq.felt} people</span>}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[10px] text-muted-foreground">{new Date(eq.time).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
                        <a href={eq.url} target="_blank" rel="noreferrer" className="text-[9px] text-blue-400 hover:underline">Details</a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
