import { Router, type IRouter } from "express";

const router: IRouter = Router();

interface CityConfig {
  name: string;
  state: string;
  lat: number;
  lng: number;
}

const INDIAN_CITIES: CityConfig[] = [
  { name: "Delhi", state: "Delhi", lat: 28.6139, lng: 77.2090 },
  { name: "Mumbai", state: "Maharashtra", lat: 19.0760, lng: 72.8777 },
  { name: "Bangalore", state: "Karnataka", lat: 12.9716, lng: 77.5946 },
  { name: "Chennai", state: "Tamil Nadu", lat: 13.0827, lng: 80.2707 },
  { name: "Kolkata", state: "West Bengal", lat: 22.5726, lng: 88.3639 },
  { name: "Hyderabad", state: "Telangana", lat: 17.3850, lng: 78.4867 },
  { name: "Ahmedabad", state: "Gujarat", lat: 23.0225, lng: 72.5714 },
  { name: "Pune", state: "Maharashtra", lat: 18.5204, lng: 73.8567 },
  { name: "Jaipur", state: "Rajasthan", lat: 26.9124, lng: 75.7873 },
  { name: "Lucknow", state: "Uttar Pradesh", lat: 26.8467, lng: 80.9462 },
  { name: "Bhopal", state: "Madhya Pradesh", lat: 23.2599, lng: 77.4126 },
  { name: "Patna", state: "Bihar", lat: 25.6093, lng: 85.1376 },
];

function getWeatherCondition(code: number): { condition: string; severity: string; icon: string } {
  if (code === 0) return { condition: "Clear Sky ☀️", severity: "normal", icon: "☀️" };
  if (code <= 3) return { condition: "Partly Cloudy ⛅", severity: "normal", icon: "⛅" };
  if (code <= 48) return { condition: "Fog 🌫️", severity: "caution", icon: "🌫️" };
  if (code <= 55) return { condition: "Drizzle 🌦️", severity: "normal", icon: "🌦️" };
  if (code <= 57) return { condition: "Freezing Drizzle 🥶", severity: "warning", icon: "🥶" };
  if (code <= 65) return { condition: "Rain 🌧️", severity: "caution", icon: "🌧️" };
  if (code <= 67) return { condition: "Freezing Rain ❄️🌧️", severity: "warning", icon: "❄️" };
  if (code <= 77) return { condition: "Snowfall ❄️", severity: "warning", icon: "❄️" };
  if (code <= 82) return { condition: "Heavy Rain Showers 🌧️⚡", severity: "warning", icon: "🌧️" };
  if (code <= 86) return { condition: "Snow Showers ❄️", severity: "warning", icon: "❄️" };
  if (code === 95) return { condition: "Thunderstorm ⛈️", severity: "danger", icon: "⛈️" };
  if (code <= 99) return { condition: "Thunderstorm with Hail ⛈️🧊", severity: "danger", icon: "⛈️" };
  return { condition: "Unknown", severity: "normal", icon: "❓" };
}

function getWindDescription(speed: number): { description: string; severity: string } {
  if (speed < 12) return { description: "Calm", severity: "normal" };
  if (speed < 30) return { description: "Breeze", severity: "normal" };
  if (speed < 50) return { description: "Strong Wind", severity: "caution" };
  if (speed < 75) return { description: "Gale Force", severity: "warning" };
  if (speed < 100) return { description: "Storm", severity: "danger" };
  return { description: "Cyclone/Hurricane", severity: "danger" };
}

router.get("/current", async (_req, res) => {
  try {
    const latitudes = INDIAN_CITIES.map(c => c.lat).join(",");
    const longitudes = INDIAN_CITIES.map(c => c.lng).join(",");

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitudes}&longitude=${longitudes}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m,surface_pressure,cloud_cover,is_day&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,rain_sum,uv_index_max,wind_speed_10m_max,weather_code&timezone=Asia/Kolkata&forecast_days=7`;

    const response = await fetch(url);
    if (!response.ok) throw new Error(`Open-Meteo API error: ${response.status}`);
    const data = await response.json();

    const results = Array.isArray(data) ? data : [data];

    const cities = results.map((d: any, i: number) => {
      const city = INDIAN_CITIES[i]!;
      const current = d.current;
      const daily = d.daily;
      const weatherInfo = getWeatherCondition(current.weather_code);
      const windInfo = getWindDescription(current.wind_speed_10m);

      const alerts: string[] = [];
      if (current.temperature_2m > 42) alerts.push("🔴 Extreme Heat Alert");
      if (current.temperature_2m > 38) alerts.push("🟠 Heat Wave Warning");
      if (current.wind_speed_10m > 60) alerts.push("🔴 Storm/Cyclone Warning");
      if (current.wind_gusts_10m > 80) alerts.push("🔴 Severe Wind Alert");
      if (current.precipitation > 30) alerts.push("🔴 Heavy Rain Alert");
      if (current.precipitation > 15) alerts.push("🟠 Moderate Rain Warning");
      if (current.relative_humidity_2m > 90) alerts.push("🟡 High Humidity");

      return {
        city: city.name,
        state: city.state,
        lat: city.lat,
        lng: city.lng,
        current: {
          temperature: current.temperature_2m,
          feelsLike: current.apparent_temperature,
          humidity: current.relative_humidity_2m,
          precipitation: current.precipitation,
          rain: current.rain,
          windSpeed: current.wind_speed_10m,
          windGusts: current.wind_gusts_10m,
          windDirection: current.wind_direction_10m,
          pressure: current.surface_pressure,
          cloudCover: current.cloud_cover,
          isDay: current.is_day === 1,
          weatherCode: current.weather_code,
          condition: weatherInfo.condition,
          conditionSeverity: weatherInfo.severity,
          conditionIcon: weatherInfo.icon,
          windDescription: windInfo.description,
          windSeverity: windInfo.severity,
        },
        forecast: daily.time.map((date: string, idx: number) => ({
          date,
          maxTemp: daily.temperature_2m_max[idx],
          minTemp: daily.temperature_2m_min[idx],
          precipitation: daily.precipitation_sum[idx],
          rain: daily.rain_sum[idx],
          uvIndex: daily.uv_index_max[idx],
          maxWind: daily.wind_speed_10m_max[idx],
          weatherCode: daily.weather_code[idx],
          condition: getWeatherCondition(daily.weather_code[idx]).condition,
          conditionIcon: getWeatherCondition(daily.weather_code[idx]).icon,
        })),
        alerts,
      };
    });

    const nationalAlerts: string[] = [];
    const avgTemp = cities.reduce((s: number, c: any) => s + c.current.temperature, 0) / cities.length;
    const maxWind = Math.max(...cities.map((c: any) => c.current.windSpeed));
    const totalRain = cities.reduce((s: number, c: any) => s + c.current.precipitation, 0);
    const stormCities = cities.filter((c: any) => c.current.conditionSeverity === "danger");

    if (stormCities.length > 0) nationalAlerts.push(`⛈️ Storm/Thunderstorm active in ${stormCities.map((c: any) => c.city).join(", ")}`);
    if (avgTemp > 38) nationalAlerts.push("🌡️ Heat wave conditions across India");
    if (maxWind > 70) nationalAlerts.push("🌪️ Cyclone-level winds detected");
    if (totalRain > 100) nationalAlerts.push("🌊 Heavy rainfall across multiple regions");

    res.json({
      cities,
      national: {
        avgTemperature: Math.round(avgTemp * 10) / 10,
        maxWindSpeed: maxWind,
        totalPrecipitation: Math.round(totalRain * 10) / 10,
        stormCitiesCount: stormCities.length,
        alerts: nationalAlerts,
      },
      fetchedAt: new Date().toISOString(),
      source: "Open-Meteo (Real-Time)",
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch weather data." });
  }
});

router.get("/earthquakes", async (_req, res) => {
  try {
    const url = "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&minlatitude=6&maxlatitude=37&minlongitude=68&maxlongitude=98&limit=50&orderby=time&minmagnitude=2";
    
    const response = await fetch(url);
    if (!response.ok) throw new Error(`USGS API error: ${response.status}`);
    const data = await response.json();

    const earthquakes = data.features.map((f: any) => {
      const p = f.properties;
      const [lng, lat, depth] = f.geometry.coordinates;

      let severity = "minor";
      if (p.mag >= 7) severity = "catastrophic";
      else if (p.mag >= 6) severity = "severe";
      else if (p.mag >= 5) severity = "major";
      else if (p.mag >= 4) severity = "moderate";
      else if (p.mag >= 3) severity = "minor";

      return {
        id: f.id,
        magnitude: p.mag,
        place: p.place,
        time: new Date(p.time).toISOString(),
        depth,
        lat,
        lng,
        severity,
        tsunami: p.tsunami === 1,
        felt: p.felt || 0,
        significance: p.sig,
        url: p.url,
      };
    });

    const significant = earthquakes.filter((e: any) => e.magnitude >= 4);

    res.json({
      earthquakes,
      summary: {
        total: earthquakes.length,
        significant: significant.length,
        maxMagnitude: earthquakes.length > 0 ? Math.max(...earthquakes.map((e: any) => e.magnitude)) : 0,
        tsunamiAlerts: earthquakes.filter((e: any) => e.tsunami).length,
      },
      region: "Indian Subcontinent (6°N-37°N, 68°E-98°E)",
      fetchedAt: new Date().toISOString(),
      source: "USGS Earthquake Hazards Program (Real-Time)",
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch earthquake data." });
  }
});

export default router;
