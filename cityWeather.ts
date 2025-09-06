import { getGeoData } from "./getGeoData";
import { getForecast } from "./getForecast";

export async function getWeatherForCity(city: string) {
  try {
    const geoData = await getGeoData(city);

    const { latitude, longitude } = geoData ?? {};

    if (!latitude || !longitude) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Sorry, I couldn't find a city named "${city}". Please check the spelling and try again.`,
          },
        ],
      };
    }

    const forecast = await getForecast(latitude, longitude);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(forecast, null, 2),
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
