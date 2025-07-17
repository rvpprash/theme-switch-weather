import { useEffect, useState } from "react";

interface ForecastResponse {
  list: {
    dt_txt: string;
    main: { temp: number };
    weather: { id: number; icon: string; main: string; description: string }[];
  }[];
  city: { name: string };
}

const weatherEmoji: Record<string, string> = {
  "01d": "☀️",
  "01n": "🌙",
  "02d": "🌤️",
  "02n": "🌥️",
  "03d": "☁️",
  "03n": "☁️",
  "04d": "☁️",
  "04n": "☁️",
  "09d": "🌧️",
  "09n": "🌧️",
  "10d": "🌦️",
  "10n": "🌧️",
  "11d": "⛈️",
  "11n": "⛈️",
  "13d": "❄️",
  "13n": "❄️",
  "50d": "🌫️",
  "50n": "🌫️",
};

export default function Weather() {
  const [city, setCity] = useState("");
  const [data, setData] = useState<ForecastResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const res = await fetch(
            `/api/weather?lat=${coords.latitude}&lon=${coords.longitude}`
          );
          const json = await res.json();
          if (!res.ok) throw new Error(json.error || "Failed to fetch");
          setData(json);
        } catch (err: any) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      },
      () => {
        setError("Geolocation permission denied");
        setLoading(false);
      }
    );
  }, []);

  const handleSearch = async () => {
    if (!city) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "City not found");
      setData(json);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const daily =
    data?.list.filter((entry) => entry.dt_txt.includes("12:00")) ?? [];

  return (
    <div className="weather-container">
      <div className="search-header">
        <h2>{data?.city.name ?? "Weather Forecast"}</h2>
        <div className="search-bar">
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Enter city"
          />
          <button onClick={handleSearch}>Search</button>
        </div>
      </div>

      {error && <p className="error">{error}</p>}
      {loading && <p>Loading...</p>}

      {!loading && daily.length > 0 && (
        <>
          <h3 className="forecast-label">5-Day Forecast</h3>
          <div className="forecast-grid">
            {daily.map((entry) => {
              const iconCode = entry.weather[0].icon;
              const emoji = weatherEmoji[iconCode];
              return (
                <div key={entry.dt_txt} className="forecast-card">
                  <p>
                    {new Date(entry.dt_txt).toLocaleDateString(undefined, {
                      weekday: "short",
                      day: "numeric",
                    })}
                  </p>
                  {emoji ? (
                    <span style={{ fontSize: "2.2rem" }}>{emoji}</span>
                  ) : (
                    <img
                      src={`https://openweathermap.org/img/wn/${iconCode}@2x.png`}
                      alt={entry.weather[0].description}
                      width={60}
                      height={60}
                    />
                  )}
                  <p>{Math.round(entry.main.temp)}°C</p>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
