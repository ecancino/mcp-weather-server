import { describe, it, expect, vi, beforeAll } from "vitest";

// Mock console.log to capture it
const mockConsoleLog = vi.fn();
vi.stubGlobal("console", { log: mockConsoleLog });

// Mock the MCP SDK modules
const mockServerTool = vi.fn();
const mockServerConnect = vi.fn();

vi.mock("@modelcontextprotocol/sdk/server/mcp", () => ({
  McpServer: vi.fn().mockImplementation(() => ({
    tool: mockServerTool,
    connect: mockServerConnect,
  })),
}));

vi.mock("@modelcontextprotocol/sdk/server/stdio", () => ({
  StdioServerTransport: vi.fn(),
}));

// Mock getWeatherForCity
const mockGetWeatherForCity = vi.fn();
vi.mock("./cityWeather", () => ({
  getWeatherForCity: mockGetWeatherForCity,
}));

describe("main.ts server setup", () => {
  beforeAll(async () => {
    // Import the module once to trigger initialization
    await import("./main");
  });

  it("should register get-weather tool with correct parameters", () => {
    expect(mockServerTool).toHaveBeenCalledWith(
      "get-weather",
      "Tool to get the weather of a city",
      expect.objectContaining({
        city: expect.any(Object), // Zod schema
      }),
      expect.any(Function),
    );
  });

  it("should log server running message", () => {
    expect(mockConsoleLog).toHaveBeenCalledWith("Weather server is running...");
  });

  it("should call getWeatherForCity when tool is invoked", async () => {
    const mockWeatherResult = {
      content: [{ type: "text", text: "Mock weather data" }],
    };
    mockGetWeatherForCity.mockResolvedValue(mockWeatherResult);

    // Get the tool handler and test it
    const toolHandler = mockServerTool.mock.calls[0][3];
    const result = await toolHandler({ city: "New York" });

    expect(mockGetWeatherForCity).toHaveBeenCalledWith("New York");
    expect(result).toEqual(mockWeatherResult);
  });

  it("should handle empty city name in tool invocation", async () => {
    const mockWeatherResult = {
      content: [{ type: "text", text: "Error: city required" }],
    };
    mockGetWeatherForCity.mockResolvedValue(mockWeatherResult);

    const toolHandler = mockServerTool.mock.calls[0][3];
    const result = await toolHandler({ city: "" });

    expect(mockGetWeatherForCity).toHaveBeenCalledWith("");
    expect(result).toEqual(mockWeatherResult);
  });

  it("should propagate errors from getWeatherForCity", async () => {
    const mockError = new Error("Weather service error");
    mockGetWeatherForCity.mockRejectedValue(mockError);

    const toolHandler = mockServerTool.mock.calls[0][3];

    await expect(toolHandler({ city: "TestCity" })).rejects.toThrow(
      "Weather service error",
    );
  });
});
