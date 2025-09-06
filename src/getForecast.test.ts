import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getForecast } from './getForecast'
import { request } from 'undici'

vi.mock('undici', () => ({
  request: vi.fn(),
}))

describe('getForecast', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should return forecast data for valid coordinates', async () => {
    const mockForecastData = {
      latitude: 40.7128,
      longitude: -74.0060,
      generationtime_ms: 0.123,
      utc_offset_seconds: -14400,
      timezone: 'America/New_York',
      timezone_abbreviation: 'EDT',
      elevation: 10,
      current_units: {
        time: 'iso8601',
        interval: 'seconds',
        temperature_2m: '°C',
        relative_humidity_2m: '%',
        apparent_temperature: '°C',
        precipitation: 'mm',
        weather_code: 'wmo code'
      },
      current: {
        time: '2024-01-01T12:00',
        interval: 900,
        temperature_2m: 20.5,
        relative_humidity_2m: 65,
        apparent_temperature: 22.1,
        precipitation: 0,
        weather_code: 1
      },
      hourly_units: {
        time: 'iso8601',
        temperature_2m: '°C',
        precipitation: 'mm'
      },
      hourly: {
        time: ['2024-01-01T00:00', '2024-01-01T01:00', '2024-01-01T02:00'],
        temperature_2m: [20.5, 21.0, 21.5],
        precipitation: [0, 0, 0.1]
      }
    }

    vi.mocked(request).mockResolvedValueOnce({
      statusCode: 200,
      body: {
        json: () => Promise.resolve(mockForecastData)
      }
    } as any)

    const result = await getForecast(40.7128, -74.0060)

    expect(request).toHaveBeenCalledWith(
      'https://api.open-meteo.com/v1/forecast?latitude=40.7128&longitude=-74.006&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code&hourly=temperature_2m,precipitation&forecast_days=1'
    )
    expect(result).toEqual(mockForecastData)
  })

  it('should return null when API returns 404 status code', async () => {
    vi.mocked(request).mockResolvedValueOnce({
      statusCode: 404,
      body: {
        json: () => Promise.resolve({})
      }
    } as any)

    const result = await getForecast(40.7128, -74.0060)

    expect(result).toBeNull()
  })

  it('should return null when API returns 500 status code', async () => {
    vi.mocked(request).mockResolvedValueOnce({
      statusCode: 500,
      body: {
        json: () => Promise.resolve({})
      }
    } as any)

    const result = await getForecast(40.7128, -74.0060)

    expect(result).toBeNull()
  })

  it('should handle edge case coordinates', async () => {
    const mockForecastData = {
      latitude: 0,
      longitude: 0,
      generationtime_ms: 0.1,
      utc_offset_seconds: 0,
      timezone: 'UTC',
      timezone_abbreviation: 'UTC',
      elevation: 0,
      current_units: {
        time: 'iso8601',
        interval: 'seconds',
        temperature_2m: '°C',
        relative_humidity_2m: '%',
        apparent_temperature: '°C',
        precipitation: 'mm',
        weather_code: 'wmo code'
      },
      current: {
        time: '2024-01-01T12:00',
        interval: 900,
        temperature_2m: 25.0,
        relative_humidity_2m: 80,
        apparent_temperature: 27.0,
        precipitation: 0,
        weather_code: 0
      },
      hourly_units: {
        time: 'iso8601',
        temperature_2m: '°C',
        precipitation: 'mm'
      },
      hourly: {
        time: ['2024-01-01T00:00'],
        temperature_2m: [25.0],
        precipitation: [0]
      }
    }

    vi.mocked(request).mockResolvedValueOnce({
      statusCode: 200,
      body: {
        json: () => Promise.resolve(mockForecastData)
      }
    } as any)

    const result = await getForecast(0, 0)

    expect(result).toEqual(mockForecastData)
  })
})
