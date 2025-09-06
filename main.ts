import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio";

import { getWeatherForCity } from "./cityWeather";

const citySchema = z
  .string()
  .describe("The name of the city to get the weather for");

const server = new McpServer({
  name: "Weather Server",
  version: "1.0.0",
});

server.tool(
  "get-weather",
  "Tool to get the weather of a city",
  { city: citySchema },
  async ({ city }) => {
    return await getWeatherForCity(city);
  },
);

const transport = new StdioServerTransport();
server.connect(transport);
console.log("Weather server is running...");
