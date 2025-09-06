import { request } from "undici";

type GeoData = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  elevation: number;
  country_code: string;
  timezone: string;
  population: number;
  country_id: number;
  country: string;
};

type GeoDataResponse = {
  results?: [GeoData];
};

export async function getGeoData(city: string): Promise<GeoData | null> {
  const { statusCode, body } = await request(
    `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=en&format=json`,
  );

  if (statusCode >= 400) {
    return null;
  }

  const data = (await body.json()) as GeoDataResponse;

  const [geoData] = data?.results ?? [null];

  return geoData || null;
}
