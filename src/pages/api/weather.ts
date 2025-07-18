import type { NextApiRequest, NextApiResponse } from 'next';

const API_KEY = process.env.OPENWEATHERMAP_API_KEY;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { city, lat, lon } = req.query;

  if (!API_KEY) {
    return res.status(500).json({ error: 'API key not configured.' });
  }

  let url = '';

  if (lat && lon) {
    // Coordinates-based request/geolocation
    url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
  } else if (city) {
    // City-based request
    const encodedCity = encodeURIComponent(city as string);
    url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodedCity}&appid=${API_KEY}&units=metric`;
  } else {
    return res.status(400).json({ error: 'City or coordinates are required.' });
  }

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.message || 'Failed to fetch weather data.' });
    }

    return res.status(200).json(data);
  } catch (error: unknown) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}
