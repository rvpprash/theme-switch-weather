import type { NextApiRequest, NextApiResponse } from "next";

import { Redis } from "@upstash/redis";
import fetchWithTimeout from "@/utils/fetchWithTimeout";

const API_KEY = process.env.OPENWEATHERMAP_API_KEY;

// const weatherCache = new Map<string, { data: any; timestamp: number }>();

const CACHE_TTL = 60 * 1000;

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

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
  let cacheKey = "";

  if (lat && lon) {
    url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
    cacheKey = `lat:${lat}-lon:${lon}`;
  } else if (city) {
    const encodedCity = encodeURIComponent(city as string);
    url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodedCity}&appid=${API_KEY}&units=metric`;
    cacheKey = `city:${(city as string).toLowerCase()}`;
  } else {
    return res.status(400).json({ error: "City or coordinates are required." });
  }

  // const cachedData = weatherCache.get(cacheKey);

  const cachedData = await redis.get(cacheKey);

  // if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {

  if (cachedData) {
    console.log(`Serving cached weather data for ${cacheKey}`);
    return res.status(200).json(cachedData);
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
    // weatherCache.set(cacheKey, { data, timestamp: Date.now() });
    await redis.set(cacheKey, JSON.stringify(data), { ex: CACHE_TTL });

    return res.status(200).json(data);
  } catch (error: unknown) {
    console.error("Unexpected error in /api/weather:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
