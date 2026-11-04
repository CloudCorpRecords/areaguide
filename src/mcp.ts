/**
 * areaguide MCP server. Tools: the 68 captured ikeytz
 * maps tools (see tools.ts).
 *
 * Why the low-level Server instead of McpServer: the
 * high-level helper converts zod schemas to JSON Schema
 * and injects keys that are not in the captured surface,
 * which breaks exact tool-list/schema parity. This file
 * serves tools/list locally from the captured literals,
 * exactly as captured, and forwards every tools/call
 * to the upstream endpoint through the upstream client.
 *
 * A forwarded result is returned unchanged (including
 * any upstream isError flag). An upstream hop failure
 * comes back as an isError result carrying an
 * `areaguide error: ...` text, synthesised locally by
 * the upstream client. An unknown tool name, or
 * arguments that are not a JSON object, are rejected
 * locally with an McpError carrying InvalidParams
 * before any network hop.
 */
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import { forwardCall, isKnownTool, VERSION } from "./upstream.js";
import { TOOLS } from "./tools.js";
import type { ToolResultLike, UpstreamDeps } from "./types.js";

/**
 * Validate and forward one tools/call. Exported so the
 * validation and forwarding behaviour can be tested
 * directly without a stdio transport.
 */
export async function handleCallTool(
  name: string,
  args: unknown,
  deps: UpstreamDeps = {},
): Promise<ToolResultLike> {
  if (!isKnownTool(name)) {
    throw new McpError(ErrorCode.InvalidParams, `Unknown tool: ${name}`);
  }
  if (
    args !== undefined &&
    (typeof args !== "object" || args === null || Array.isArray(args))
  ) {
    throw new McpError(
      ErrorCode.InvalidParams,
      `Arguments for tool ${name} must be a JSON object`,
    );
  }
  return forwardCall(name, (args ?? {}) as Record<string, unknown>, deps);
}

/** Build the stdio MCP server (transport not yet connected). */
export function createServer(deps: UpstreamDeps = {}): Server {
  const server = new Server(
    { name: "areaguide", version: VERSION },
    { capabilities: { tools: {} } },
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    const result = await handleCallTool(name, args, deps);
    return result as never;
  });

  return server;
}

/** Connect the MCP server over stdio. */
export async function startMcpServer(deps: UpstreamDeps = {}): Promise<void> {
  await createServer(deps).connect(new StdioServerTransport());
}
