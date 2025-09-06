import { request } from "undici";

export async function getWeatherForCity(city: string) {
  try {
    const geoResponse = await request(
      `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=en&format=json`,
    );
    const geoData = await geoResponse.body.json();

    if (!geoData.results || geoData.results.length === 0) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Sorry, I couldn't find a city named "${city}". Please check the spelling and try again.`,
          },
        ],
      };
    }

    const { latitude, longitude } = geoData.results[0];
    const weatherResponse = await request(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code&hourly=temperature_2m,precipitation&forecast_days=1`,
    );

    const weatherData = await weatherResponse.body.json();

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(weatherData, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text" as const,
          text: `Error fetching weather data: ${(error as Error).message}`,
        },
      ],
    };
  }
}
