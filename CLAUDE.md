# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an MCP (Model Context Protocol) server that provides weather data functionality. The server exposes a single tool `get-weather` that fetches weather information for cities using the Open-Meteo API.

## Architecture

- **Single file structure**: The entire server implementation is contained in `main.ts`
- **MCP Server**: Built using `@modelcontextprotocol/sdk` with stdio transport
- **Weather API Integration**: 
  - Uses Open-Meteo geocoding API to resolve city names to coordinates
  - Fetches weather data from Open-Meteo forecast API
- **Schema Validation**: Uses Zod for input validation

## Development Commands

The project uses npm with minimal scripts defined in package.json:
- `npm test` - Currently returns an error (no tests implemented)

Note: This project has no build process, linting, or testing configured. The TypeScript file runs directly.

## Key Dependencies

- `@modelcontextprotocol/sdk`: Core MCP server functionality
- `zod`: Schema validation for tool inputs

## Running the Server

Execute directly with a TypeScript runtime:
```bash
npx tsx main.ts
```

The server runs as a stdio-based MCP server and logs "Weather server is running..." to console.