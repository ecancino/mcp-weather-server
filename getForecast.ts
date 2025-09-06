import { request } from "undici";

type ForecastDataResponse = {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  current_units: {
    time: string;
    interval: string;
    temperature_2m: string;
    relative_humidity_2m: string;
    apparent_temperature: string;
    precipitation: string;
    weather_code: string;
  };
  current: {
    time: string;
    interval: number;
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    precipitation: number;
    weather_code: number;
  };
  hourly_units: {
    time: string;
    temperature_2m: string;
    precipitation: string;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    precipitation: number[];
  };
};

export async function getForecast(
  latitude: number,
  longitude: number,
): Promise<ForecastDataResponse | null> {
  const { statusCode, body } = await request(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code&hourly=temperature_2m,precipitation&forecast_days=1`,
  );

  if (statusCode >= 400) {
    return null;
  }

  const data = (await body.json()) as ForecastDataResponse;

  return data;
}
