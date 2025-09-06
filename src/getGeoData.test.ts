import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getGeoData } from "./getGeoData";
import { request } from "undici";

vi.mock("undici", () => ({
  request: vi.fn(),
}));

describe("getGeoData", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
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

    vi.mocked(request).mockResolvedValueOnce({
      statusCode: 200,
      body: {
        json: () =>
          Promise.resolve({
            results: [mockGeoData],
          }),
      },
    } as any);

    const result = await getGeoData("New York");

    expect(request).toHaveBeenCalledWith(
      "https://geocoding-api.open-meteo.com/v1/search?name=New York&count=1&language=en&format=json",
    );
    expect(result).toEqual(mockGeoData);
  });

  it("should return null when city is not found", async () => {
    vi.mocked(request).mockResolvedValueOnce({
      statusCode: 200,
      body: {
        json: () =>
          Promise.resolve({
            results: [],
          }),
      },
    } as any);

    const result = await getGeoData("NonexistentCity");

    expect(result).toBeNull();
  });

  it("should return null when no results property exists", async () => {
    vi.mocked(request).mockResolvedValueOnce({
      statusCode: 200,
      body: {
        json: () => Promise.resolve({}),
      },
    } as any);

    const result = await getGeoData("TestCity");

    expect(result).toBeNull();
  });

  it("should return null when API returns error status code", async () => {
    vi.mocked(request).mockResolvedValueOnce({
      statusCode: 404,
      body: {
        json: () => Promise.resolve({}),
      },
    } as any);

    const result = await getGeoData("TestCity");

    expect(result).toBeNull();
  });

  it("should return null when API returns 500 status code", async () => {
    vi.mocked(request).mockResolvedValueOnce({
      statusCode: 500,
      body: {
        json: () => Promise.resolve({}),
      },
    } as any);

    const result = await getGeoData("TestCity");

    expect(result).toBeNull();
  });
});
