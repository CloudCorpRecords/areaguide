#!/usr/bin/env node
/**
 * areaguide CLI.
 *
 *   areaguide <tool> '<json>'
 *   areaguide mcp
 *   areaguide --version
 *
 * <tool> is any of the 68 forwarded tools (see
 * src/tools.ts for the full captured list, from
 * list_service_areas to compose_mailto).
 *
 * Each tool subcommand takes one JSON argument string
 * with the tool's arguments, forwards the call to the
 * upstream endpoint and prints the result as JSON.
 * Exit codes: 0 success, 1 forwarded-call error,
 * 2 usage error.
 */
import { forwardCall, VERSION } from "./upstream.js";
import { TOOL_NAMES } from "./tools.js";

function usageError(message?: string): never {
  if (message) console.error(`error: ${message}`);
  console.error(`Usage:
  areaguide <tool> '<json-args>'     one of: ${TOOL_NAMES.join(", ")}
  areaguide mcp
  areaguide --version`);
  process.exit(2);
}

async function main(): Promise<void> {
  const [cmd, ...rest] = process.argv.slice(2);
  if (cmd === "--version" || cmd === "-v") {
    console.log(VERSION);
    return;
  }
  if (cmd === "mcp") {
    if (rest.length !== 0) usageError();
    const { startMcpServer } = await import("./mcp.js");
    await startMcpServer();
    return;
  }
  if (!cmd || !TOOL_NAMES.includes(cmd)) usageError();
  if (rest.length > 1) usageError();
  let args: Record<string, unknown> = {};
  if (rest.length === 1) {
    try {
      const parsed: unknown = JSON.parse(rest[0]);
      if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
        usageError("argument must be a JSON object string");
      }
      args = parsed as Record<string, unknown>;
    } catch {
      usageError("argument must be a JSON object string");
    }
  }
  const result = await forwardCall(cmd, args);
  console.log(JSON.stringify(result));
  if (result.isError) process.exit(1);
}

void main();
