import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { MockAgent, setGlobalDispatcher, getGlobalDispatcher } from "undici";
import { getForecast } from "./getForecast";

describe("getForecast", () => {
  let mockAgent: MockAgent;
  let originalDispatcher: any;

  beforeEach(() => {
    // Store original dispatcher
    originalDispatcher = getGlobalDispatcher();

    // Create and set mock agent
    mockAgent = new MockAgent();
    setGlobalDispatcher(mockAgent);

    // Disable network connections to ensure we're using mocks
    mockAgent.disableNetConnect();
  });

  afterEach(() => {
    // Restore original dispatcher
    setGlobalDispatcher(originalDispatcher);
  });

  it("should return forecast data for valid coordinates", async () => {
    const mockForecastData = {
      latitude: 40.7128,
      longitude: -74.006,
      generationtime_ms: 0.123,
      utc_offset_seconds: -14400,
      timezone: "America/New_York",
      timezone_abbreviation: "EDT",
      elevation: 10,
      current_units: {
        time: "iso8601",
        interval: "seconds",
        temperature_2m: "°C",
        relative_humidity_2m: "%",
        apparent_temperature: "°C",
        precipitation: "mm",
        weather_code: "wmo code",
      },
      current: {
        time: "2024-01-01T12:00",
        interval: 900,
        temperature_2m: 20.5,
        relative_humidity_2m: 65,
        apparent_temperature: 22.1,
        precipitation: 0,
        weather_code: 1,
      },
      hourly_units: {
        time: "iso8601",
        temperature_2m: "°C",
        precipitation: "mm",
      },
      hourly: {
        time: ["2024-01-01T00:00", "2024-01-01T01:00", "2024-01-01T02:00"],
        temperature_2m: [20.5, 21.0, 21.5],
        precipitation: [0, 0, 0.1],
      },
    };

    // Get a mock pool for the API domain
    const mockPool = mockAgent.get("https://api.open-meteo.com");

    // Set up the mock response
    mockPool
      .intercept({
        path: "/v1/forecast?latitude=40.7128&longitude=-74.006&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code&hourly=temperature_2m,precipitation&forecast_days=1",
        method: "GET",
      })
      .reply(200, mockForecastData);

    const result = await getForecast(40.7128, -74.006);

    expect(result).toEqual(mockForecastData);
  });

  it("should return null when API returns 404 status code", async () => {
    const mockPool = mockAgent.get("https://api.open-meteo.com");

    mockPool
      .intercept({
        path: "/v1/forecast?latitude=40.7128&longitude=-74.006&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code&hourly=temperature_2m,precipitation&forecast_days=1",
        method: "GET",
      })
      .reply(404, { error: "Not found" });

    const result = await getForecast(40.7128, -74.006);

    expect(result).toBeNull();
  });

  it("should return null when API returns 500 status code", async () => {
    const mockPool = mockAgent.get("https://api.open-meteo.com");

    mockPool
      .intercept({
        path: "/v1/forecast?latitude=40.7128&longitude=-74.006&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code&hourly=temperature_2m,precipitation&forecast_days=1",
        method: "GET",
      })
      .reply(500, { error: "Internal server error" });

    const result = await getForecast(40.7128, -74.006);

    expect(result).toBeNull();
  });

  it("should handle edge case coordinates", async () => {
    const mockForecastData = {
      latitude: 0,
      longitude: 0,
      generationtime_ms: 0.1,
      utc_offset_seconds: 0,
      timezone: "UTC",
      timezone_abbreviation: "UTC",
      elevation: 0,
      current_units: {
        time: "iso8601",
        interval: "seconds",
        temperature_2m: "°C",
        relative_humidity_2m: "%",
        apparent_temperature: "°C",
        precipitation: "mm",
        weather_code: "wmo code",
      },
      current: {
        time: "2024-01-01T12:00",
        interval: 900,
        temperature_2m: 25.0,
        relative_humidity_2m: 80,
        apparent_temperature: 27.0,
        precipitation: 0,
        weather_code: 0,
      },
      hourly_units: {
        time: "iso8601",
        temperature_2m: "°C",
        precipitation: "mm",
      },
      hourly: {
        time: ["2024-01-01T00:00"],
        temperature_2m: [25.0],
        precipitation: [0],
      },
    };

    const mockPool = mockAgent.get("https://api.open-meteo.com");

    mockPool
      .intercept({
        path: "/v1/forecast?latitude=0&longitude=0&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code&hourly=temperature_2m,precipitation&forecast_days=1",
        method: "GET",
      })
      .reply(200, mockForecastData);

    const result = await getForecast(0, 0);

    expect(result).toEqual(mockForecastData);
  });

  it("should handle network timeout errors", async () => {
    const mockPool = mockAgent.get("https://api.open-meteo.com");

    mockPool
      .intercept({
        path: "/v1/forecast?latitude=40.7128&longitude=-74.006&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code&hourly=temperature_2m,precipitation&forecast_days=1",
        method: "GET",
      })
      .replyWithError(new Error("Request timeout"));

    // This should throw an error since getForecast doesn't catch network errors
    await expect(getForecast(40.7128, -74.006)).rejects.toThrow(
      "Request timeout",
    );
  });

  it("should handle invalid JSON response", async () => {
    const mockPool = mockAgent.get("https://api.open-meteo.com");

    mockPool
      .intercept({
        path: "/v1/forecast?latitude=40.7128&longitude=-74.006&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code&hourly=temperature_2m,precipitation&forecast_days=1",
        method: "GET",
      })
      .reply(200, "invalid json");

    // This should throw an error when trying to parse invalid JSON
    await expect(getForecast(40.7128, -74.006)).rejects.toThrow();
  });
});
