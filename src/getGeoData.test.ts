import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { MockAgent, setGlobalDispatcher, getGlobalDispatcher } from "undici";
import { getGeoData } from "./getGeoData";

describe("getGeoData", () => {
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

  it("should return geo data for a valid city", async () => {
    const mockGeoData = {
      id: 1,
      name: "New York",
      latitude: 40.7128,
      longitude: -74.006,
      elevation: 10,
      country_code: "US",
      timezone: "America/New_York",
      population: 8175133,
      country_id: 1,
      country: "United States",
    };

    // Get a mock pool for the geocoding API domain
    const mockPool = mockAgent.get("https://geocoding-api.open-meteo.com");

    // Set up the mock response
    mockPool
      .intercept({
        path: "/v1/search?name=New%20York&count=1&language=en&format=json",
        method: "GET",
      })
      .reply(200, {
        results: [mockGeoData],
      });

    const result = await getGeoData("New York");

    expect(result).toEqual(mockGeoData);
  });

  it("should return null when city is not found", async () => {
    const mockPool = mockAgent.get("https://geocoding-api.open-meteo.com");

    mockPool
      .intercept({
        path: "/v1/search?name=NonexistentCity&count=1&language=en&format=json",
        method: "GET",
      })
      .reply(200, {
        results: [],
      });

    const result = await getGeoData("NonexistentCity");

    expect(result).toBeNull();
  });

  it("should return null when no results property exists", async () => {
    const mockPool = mockAgent.get("https://geocoding-api.open-meteo.com");

    mockPool
      .intercept({
        path: "/v1/search?name=TestCity&count=1&language=en&format=json",
        method: "GET",
      })
      .reply(200, {});

    const result = await getGeoData("TestCity");

    expect(result).toBeNull();
  });

  it("should return null when API returns 404 status code", async () => {
    const mockPool = mockAgent.get("https://geocoding-api.open-meteo.com");

    mockPool
      .intercept({
        path: "/v1/search?name=TestCity&count=1&language=en&format=json",
        method: "GET",
      })
      .reply(404, { error: "Not found" });

    const result = await getGeoData("TestCity");

    expect(result).toBeNull();
  });

  it("should return null when API returns 500 status code", async () => {
    const mockPool = mockAgent.get("https://geocoding-api.open-meteo.com");

    mockPool
      .intercept({
        path: "/v1/search?name=TestCity&count=1&language=en&format=json",
        method: "GET",
      })
      .reply(500, { error: "Internal server error" });

    const result = await getGeoData("TestCity");

    expect(result).toBeNull();
  });

  it("should handle special characters in city names", async () => {
    const mockGeoData = {
      id: 2,
      name: "São Paulo",
      latitude: -23.5505,
      longitude: -46.6333,
      elevation: 760,
      country_code: "BR",
      timezone: "America/Sao_Paulo",
      population: 12325232,
      country_id: 2,
      country: "Brazil",
    };

    const mockPool = mockAgent.get("https://geocoding-api.open-meteo.com");

    mockPool
      .intercept({
        path: "/v1/search?name=S%C3%A3o%20Paulo&count=1&language=en&format=json",
        method: "GET",
      })
      .reply(200, {
        results: [mockGeoData],
      });

    const result = await getGeoData("São Paulo");

    expect(result).toEqual(mockGeoData);
  });

  it("should handle network timeout errors", async () => {
    const mockPool = mockAgent.get("https://geocoding-api.open-meteo.com");

    mockPool
      .intercept({
        path: "/v1/search?name=TestCity&count=1&language=en&format=json",
        method: "GET",
      })
      .replyWithError(new Error("Request timeout"));

    // This should throw an error since getGeoData doesn't catch network errors
    await expect(getGeoData("TestCity")).rejects.toThrow("Request timeout");
  });

  it("should handle invalid JSON response", async () => {
    const mockPool = mockAgent.get("https://geocoding-api.open-meteo.com");

    mockPool
      .intercept({
        path: "/v1/search?name=TestCity&count=1&language=en&format=json",
        method: "GET",
      })
      .reply(200, "invalid json");

    // This should throw an error when trying to parse invalid JSON
    await expect(getGeoData("TestCity")).rejects.toThrow();
  });

  it("should handle empty city name", async () => {
    const mockPool = mockAgent.get("https://geocoding-api.open-meteo.com");

    mockPool
      .intercept({
        path: "/v1/search?name=&count=1&language=en&format=json",
        method: "GET",
      })
      .reply(200, {
        results: [],
      });

    const result = await getGeoData("");

    expect(result).toBeNull();
  });

  it("should handle malformed results array", async () => {
    const mockPool = mockAgent.get("https://geocoding-api.open-meteo.com");

    mockPool
      .intercept({
        path: "/v1/search?name=TestCity&count=1&language=en&format=json",
        method: "GET",
      })
      .reply(200, {
        results: null,
      });

    const result = await getGeoData("TestCity");

    expect(result).toBeNull();
  });
});
