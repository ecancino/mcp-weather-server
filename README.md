# MCP Weather Server

A Model Context Protocol (MCP) server that provides weather data functionality using the Open-Meteo API. Built with TypeScript, undici, and comprehensive test coverage.

## Features

- 🌤️ **Weather Data**: Fetch current weather and hourly forecasts for any city
- 🌍 **Global Coverage**: Supports cities worldwide with geocoding
- 🔧 **MCP Integration**: Compatible with Claude Code and other MCP clients
- 📦 **TypeScript**: Fully typed with comprehensive interfaces
- 🧪 **Well Tested**: 28 test cases with realistic HTTP mocking
- ⚡ **Modern HTTP**: Uses undici for fast, reliable requests

## Installation

```bash
# Clone the repository
git clone https://github.com/ecancino/mcp-weather-server.git
cd mcp-weather-server

# Install dependencies
npm install

# Start the server
npm start
```

## Usage

### As an MCP Server

The server exposes a single tool `get-weather` that can be used by MCP clients:

```typescript
// Tool: get-weather
// Description: Tool to get the weather of a city
// Parameters: { city: string }
```

### Running the Server

```bash
# Start the MCP server
npm start

# Run tests
npm test

# Run tests once
npm run test:run
```

## API Integration

The server integrates with two Open-Meteo APIs:

### Geocoding API
- **Endpoint**: `https://geocoding-api.open-meteo.com/v1/search`
- **Purpose**: Convert city names to coordinates
- **Features**: Supports international cities and special characters

### Weather API
- **Endpoint**: `https://api.open-meteo.com/v1/forecast`
- **Purpose**: Fetch weather data using coordinates
- **Data**: Current conditions and hourly forecasts

## Architecture

The project follows a modular architecture:

```
src/
├── main.ts           # MCP server setup and tool registration
├── cityWeather.ts    # Main weather orchestration logic
├── getGeoData.ts     # Geocoding API integration
├── getForecast.ts    # Weather API integration
└── *.test.ts         # Comprehensive test suite
```

### Key Components

- **`main.ts`**: Sets up the MCP server and registers the `get-weather` tool
- **`cityWeather.ts`**: Orchestrates the complete weather flow
- **`getGeoData.ts`**: Handles city name to coordinates conversion
- **`getForecast.ts`**: Fetches weather data from coordinates

## Development

### Prerequisites

- Node.js 18+ 
- TypeScript
- Git

### Scripts

```bash
npm start        # Start the MCP server
npm test         # Run tests in watch mode
npm run test:run # Run tests once
```

### Project Structure

```
├── src/                 # Source code
│   ├── *.ts            # TypeScript modules
│   └── *.test.ts       # Test files
├── package.json        # Dependencies and scripts
├── tsconfig.json       # TypeScript configuration
├── vitest.config.ts    # Test configuration
├── CLAUDE.md          # Claude Code documentation
└── README.md          # This file
```

## Testing

The project includes comprehensive testing with:

- **28 test cases** across all modules
- **MockAgent integration** for realistic HTTP testing
- **Error scenario coverage** including network failures
- **Edge case handling** for malformed data

```bash
# Run all tests
npm run test:run

# Run tests in watch mode
npm test

# Run specific test file
npm run test:run src/getForecast.test.ts
```

### Test Coverage

- ✅ **getGeoData.ts**: 10 tests (geocoding, error handling, edge cases)
- ✅ **getForecast.ts**: 6 tests (weather API, HTTP errors, timeouts)
- ✅ **cityWeather.ts**: 7 tests (integration, error propagation)
- ✅ **main.ts**: 5 tests (MCP server setup, tool registration)

## Configuration

### TypeScript

The project uses modern TypeScript configuration:

```json
{
  "target": "ES2022",
  "module": "ESNext",
  "strict": true,
  "types": ["node", "vitest/globals"]
}
```

### Dependencies

- **`@modelcontextprotocol/sdk`**: MCP server implementation
- **`undici`**: Modern HTTP client
- **`zod`**: Runtime type validation
- **`typescript`**: TypeScript compiler
- **`vitest`**: Fast testing framework

## Error Handling

The server includes comprehensive error handling:

- **City not found**: Returns helpful error message
- **API failures**: Handles HTTP errors gracefully  
- **Network issues**: Proper timeout and connection error handling
- **Invalid data**: Validates and sanitizes API responses

## API Response Format

All responses follow the MCP content format:

```typescript
{
  content: [
    {
      type: "text",
      text: string // JSON weather data or error message
    }
  ]
}
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`npm run test:run`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Code Style

- Use TypeScript for all new code
- Follow existing naming conventions
- Add tests for new functionality
- Update documentation as needed

## License

ISC License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Open-Meteo](https://open-meteo.com/) for the free weather API
- [Model Context Protocol](https://modelcontextprotocol.io/) for the MCP specification
- [undici](https://github.com/nodejs/undici) for modern HTTP client

## Support

- 📋 [Issues](https://github.com/ecancino/mcp-weather-server/issues)
- 🔄 [Pull Requests](https://github.com/ecancino/mcp-weather-server/pulls)
- 📖 [MCP Documentation](https://modelcontextprotocol.io/)

---

**Built with ❤️ for the MCP ecosystem**