import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getWeatherForCity } from "./weather.js";

global.fetch = vi.fn();

describe("getWeatherForCity", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should return weather data for a valid city", async () => {
    const mockGeoData = {
      results: [
        {
          latitude: 40.7128,
          longitude: -74.006,
        },
      ],
    };

    const mockWeatherData = {
      current: {
        temperature_2m: 20.5,
        relative_humidity_2m: 65,
        apparent_temperature: 22.1,
        precipitation: 0,
        weather_code: 1,
      },
      hourly: {
        temperature_2m: [20.5, 21.0, 21.5],
        precipitation: [0, 0, 0.1],
      },
    };

    vi.mocked(fetch)
      .mockResolvedValueOnce({
        json: () => Promise.resolve(mockGeoData),
      } as Response)
      .mockResolvedValueOnce({
        json: () => Promise.resolve(mockWeatherData),
      } as Response);

    const result = await getWeatherForCity("New York");

    expect(fetch).toHaveBeenCalledTimes(2);
    expect(fetch).toHaveBeenNthCalledWith(
      1,
      "https://geocoding-api.open-meteo.com/v1/search?name=New York&count=1&language=en&format=json",
    );
    expect(fetch).toHaveBeenNthCalledWith(
      2,
      "https://api.open-meteo.com/v1/forecast?latitude=40.7128&longitude=-74.006&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code&hourly=temperature_2m,precipitation&forecast_days=1",
    );

    expect(result).toEqual({
      content: [
        {
          type: "text",
          text: JSON.stringify(mockWeatherData, null, 2),
        },
      ],
    });
  });

  it("should return error message for city not found", async () => {
    const mockGeoData = {
      results: [],
    };

    vi.mocked(fetch).mockResolvedValueOnce({
      json: () => Promise.resolve(mockGeoData),
    } as Response);

    const result = await getWeatherForCity("NonexistentCity");

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      content: [
        {
          type: "text",
          text: 'Sorry, I couldn\'t find a city named "NonexistentCity". Please check the spelling and try again.',
        },
      ],
    });
  });

  it("should handle fetch errors gracefully", async () => {
    const mockError = new Error("Network error");
    vi.mocked(fetch).mockRejectedValueOnce(mockError);

    const result = await getWeatherForCity("TestCity");

    expect(result).toEqual({
      content: [
        {
          type: "text",
          text: "Error fetching weather data: Network error",
        },
      ],
    });
  });

  it("should handle missing results property", async () => {
    const mockGeoData = {};

    vi.mocked(fetch).mockResolvedValueOnce({
      json: () => Promise.resolve(mockGeoData),
    } as Response);

    const result = await getWeatherForCity("TestCity");

    expect(result).toEqual({
      content: [
        {
          type: "text",
          text: 'Sorry, I couldn\'t find a city named "TestCity". Please check the spelling and try again.',
        },
      ],
    });
  });
});
