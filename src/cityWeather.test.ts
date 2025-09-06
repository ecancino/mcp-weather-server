import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getWeatherForCity } from './cityWeather'
import { getGeoData } from './getGeoData'
import { getForecast } from './getForecast'

vi.mock('./getGeoData')
vi.mock('./getForecast')

describe('getWeatherForCity', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should return weather data for a valid city', async () => {
    const mockGeoData = {
      id: 1,
      name: 'New York',
      latitude: 40.7128,
      longitude: -74.0060,
      elevation: 10,
      country_code: 'US',
      timezone: 'America/New_York',
      population: 8175133,
      country_id: 1,
      country: 'United States'
    }

    const mockForecastData = {
      latitude: 40.7128,
      longitude: -74.0060,
      current: {
        temperature_2m: 20.5,
        relative_humidity_2m: 65,
        apparent_temperature: 22.1,
        precipitation: 0,
        weather_code: 1
      },
      hourly: {
        temperature_2m: [20.5, 21.0, 21.5],
        precipitation: [0, 0, 0.1]
      }
    }

    vi.mocked(getGeoData).mockResolvedValueOnce(mockGeoData)
    vi.mocked(getForecast).mockResolvedValueOnce(mockForecastData as any)

    const result = await getWeatherForCity('New York')

    expect(getGeoData).toHaveBeenCalledWith('New York')
    expect(getForecast).toHaveBeenCalledWith(40.7128, -74.0060)
    expect(result).toEqual({
      content: [
        {
          type: "text",
          text: JSON.stringify(mockForecastData, null, 2),
        },
      ],
    })
  })

  it('should return error message when city is not found', async () => {
    vi.mocked(getGeoData).mockResolvedValueOnce(null)

    const result = await getWeatherForCity('NonexistentCity')

    expect(getGeoData).toHaveBeenCalledWith('NonexistentCity')
    expect(getForecast).not.toHaveBeenCalled()
    expect(result).toEqual({
      content: [
        {
          type: "text",
          text: 'Sorry, I couldn\'t find a city named "NonexistentCity". Please check the spelling and try again.',
        },
      ],
    })
  })

  it('should return error message when geo data has no latitude', async () => {
    const mockGeoDataWithoutCoords = {
      id: 1,
      name: 'TestCity',
      latitude: null as any,
      longitude: -74.0060,
      elevation: 10,
      country_code: 'US',
      timezone: 'America/New_York',
      population: 100000,
      country_id: 1,
      country: 'United States'
    }

    vi.mocked(getGeoData).mockResolvedValueOnce(mockGeoDataWithoutCoords)

    const result = await getWeatherForCity('TestCity')

    expect(getGeoData).toHaveBeenCalledWith('TestCity')
    expect(getForecast).not.toHaveBeenCalled()
    expect(result).toEqual({
      content: [
        {
          type: "text",
          text: 'Sorry, I couldn\'t find a city named "TestCity". Please check the spelling and try again.',
        },
      ],
    })
  })

  it('should return error message when geo data has no longitude', async () => {
    const mockGeoDataWithoutCoords = {
      id: 1,
      name: 'TestCity',
      latitude: 40.7128,
      longitude: null as any,
      elevation: 10,
      country_code: 'US',
      timezone: 'America/New_York',
      population: 100000,
      country_id: 1,
      country: 'United States'
    }

    vi.mocked(getGeoData).mockResolvedValueOnce(mockGeoDataWithoutCoords)

    const result = await getWeatherForCity('TestCity')

    expect(result).toEqual({
      content: [
        {
          type: "text",
          text: 'Sorry, I couldn\'t find a city named "TestCity". Please check the spelling and try again.',
        },
      ],
    })
  })

  it('should handle errors from getGeoData gracefully', async () => {
    vi.mocked(getGeoData).mockRejectedValueOnce(new Error('Network error'))

    const result = await getWeatherForCity('TestCity')

    expect(result).toEqual({
      content: [
        {
          type: "text",
          text: "Error fetching weather data: Network error",
        },
      ],
    })
  })

  it('should handle errors from getForecast gracefully', async () => {
    const mockGeoData = {
      id: 1,
      name: 'New York',
      latitude: 40.7128,
      longitude: -74.0060,
      elevation: 10,
      country_code: 'US',
      timezone: 'America/New_York',
      population: 8175133,
      country_id: 1,
      country: 'United States'
    }

    vi.mocked(getGeoData).mockResolvedValueOnce(mockGeoData)
    vi.mocked(getForecast).mockRejectedValueOnce(new Error('API error'))

    const result = await getWeatherForCity('New York')

    expect(result).toEqual({
      content: [
        {
          type: "text",
          text: "Error fetching weather data: API error",
        },
      ],
    })
  })

  it('should handle null forecast data', async () => {
    const mockGeoData = {
      id: 1,
      name: 'New York',
      latitude: 40.7128,
      longitude: -74.0060,
      elevation: 10,
      country_code: 'US',
      timezone: 'America/New_York',
      population: 8175133,
      country_id: 1,
      country: 'United States'
    }

    vi.mocked(getGeoData).mockResolvedValueOnce(mockGeoData)
    vi.mocked(getForecast).mockResolvedValueOnce(null)

    const result = await getWeatherForCity('New York')

    expect(result).toEqual({
      content: [
        {
          type: "text",
          text: "null",
        },
      ],
    })
  })
})
