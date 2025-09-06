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

The project uses pnpm for package management. Available scripts:
- `pnpm start` - Run the MCP weather server using tsx
- `pnpm test` - Run tests in watch mode using vitest
- `pnpm run test:run` - Run tests once

## Development Workflow

**Always create a new branch before making changes and open a pull request:**
1. Create feature branch: `git checkout -b feature-name`
2. Make changes and test locally: `pnpm test`
3. Commit changes: `git commit -m "Description"`
4. Push branch: `git push origin feature-name`
5. Open pull request to main branch
6. Wait for CI checks to pass before merging

**Never commit directly to main branch** - all changes must go through pull requests.

## Key Dependencies

- `@modelcontextprotocol/sdk`: Core MCP server functionality
- `zod`: Schema validation for tool inputs

## Running the Server

Execute using pnpm:
```bash
pnpm start
```

The server runs as a stdio-based MCP server and logs "Weather server is running..." to console.