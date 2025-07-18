import type { NextApiRequest, NextApiResponse } from "next";

import fetchWithTimeout from "@/utils/fetchWithTimeout";

const API_KEY = process.env.OPENWEATHERMAP_API_KEY;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { city, lat, lon } = req.query;

  if (!API_KEY) {
    console.error("Missing API key");
    return res.status(500).json({ error: "API key not configured." });
  }

  let url = "";

  if (lat && lon) {
    // Coordinates-based request/geolocation
    url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
  } else if (city) {
    // City-based request
    const encodedCity = encodeURIComponent(city as string);
    url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodedCity}&appid=${API_KEY}&units=metric`;
  } else {
    return res.status(400).json({ error: "City or coordinates are required." });
  }

  try {
    const response = await fetchWithTimeout(url, {}, 15000);

    const text = await response.text();
    if (!response.ok) {
      console.error(`OpenWeatherMap error: ${response.status} - ${text}`);
      let errorMessage = "Failed to fetch weather data.";

      if (text && text.startsWith("{")) {
        const errorData = JSON.parse(text);
        errorMessage = errorData.message || errorMessage;
      }
      return res.status(response.status).json({ error: errorMessage });
    }
    const data = JSON.parse(text);
    return res.status(200).json(data);
  } catch (error: unknown) {
    console.error("Unexpected error in /api/weather:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
