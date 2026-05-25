export interface WeatherSnapshot {
  locationName: string;
  tempC: number;
  humidity: number;
  windMs: number;
  condition: string;
}

const DHAKA = { lat: 23.8103, lon: 90.4125, name: "ঢাকা" };

const staticFallback: WeatherSnapshot = {
  locationName: DHAKA.name,
  tempC: 30,
  humidity: 70,
  windMs: 3,
  condition: "Clear",
};

export async function getWeatherSnapshot(): Promise<WeatherSnapshot> {
  const apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY;

  if (!apiKey) {
    return staticFallback;
  }

  try {
    const url = new URL("https://api.openweathermap.org/data/2.5/weather");
    url.searchParams.set("lat", String(DHAKA.lat));
    url.searchParams.set("lon", String(DHAKA.lon));
    url.searchParams.set("appid", apiKey);
    url.searchParams.set("units", "metric");

    const res = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) return staticFallback;

    const json = (await res.json()) as {
      name?: string;
      main?: { temp?: number; humidity?: number };
      wind?: { speed?: number };
      weather?: Array<{ main?: string }>;
    };

    return {
      locationName: json.name || DHAKA.name,
      tempC: Math.round(json.main?.temp ?? 30),
      humidity: Math.round(json.main?.humidity ?? 70),
      windMs: Number(json.wind?.speed ?? 3),
      condition: json.weather?.[0]?.main ?? "Clear",
    };
  } catch (error) {
    console.error("Weather API Error:", error);
    return staticFallback;
  }
}