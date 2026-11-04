/**
 * areaguide upstream client: a forwarding client for
 * the ikeytz maps MCP endpoint.
 *
 * Architecture: this module contains no maps logic and
 * computes nothing. tools/list is served locally from
 * the captured literals in tools.ts; a tools/call is
 * forwarded to the upstream endpoint and its result is
 * returned unchanged.
 *
 * Wire (streamable HTTP JSON-RPC, in order):
 *   1. POST an `initialize` JSON-RPC request
 *      (protocolVersion "2025-03-26", clientInfo
 *      areaguide/0.1.0);
 *   2. POST a `notifications/initialized` notification;
 *   3. POST the `tools/call` JSON-RPC request.
 * When a response carries an `Mcp-Session-Id` header,
 * that value is sent back as `Mcp-Session-Id` on every
 * later request in the same call sequence.
 *
 * Endpoint: `https://maps.ikeytz.com/mcp` by default,
 * overridable via the `IKEYTZ_MAPS_MCP_URL` environment
 * variable (a labelled reconstruction) or the
 * injectable deps. No account and no API key.
 *
 * Failure rule (labelled reconstruction): when the hop
 * to the upstream server fails — the fetch throws or
 * times out, the endpoint answers a non-2xx status,
 * the reply is not a usable JSON-RPC message, or the
 * upstream sends a JSON-RPC error — the call returns
 * an isError result whose text is
 * `areaguide error: <detail>`, rather than letting the
 * caller hang. Successful upstream results, including
 * upstream isError results, pass through verbatim.
 *
 * Replies may arrive either as plain JSON or framed as
 * server-sent events (`data:` lines); both are parsed.
 * Upstream access goes through the injectable fetch in
 * deps, so tests run against a fake fetch only.
 */
import type {
  FetchFn,
  FetchResponseLike,
  ToolResultLike,
  UpstreamDeps,
} from "./types.js";
import { TOOLS } from "./tools.js";

export const VERSION = "0.1.0";

export const DEFAULT_URL = "https://maps.ikeytz.com/mcp";

export const DEFAULT_TIMEOUT_MS = 30000;

export const PROTOCOL_VERSION = "2025-03-26";

export { TOOLS, TOOL_NAMES } from "./tools.js";

/** Internal hop failure; converted to an areaguide error result. */
class UpstreamError extends Error {
  constructor(detail: string) {
    super(detail);
    this.name = "UpstreamError";
  }
}

function errorResult(detail: string): ToolResultLike {
  return {
    content: [{ type: "text", text: `areaguide error: ${detail}` }],
    isError: true,
  };
}

function endpoint(deps: UpstreamDeps): string {
  if (deps.url && deps.url.trim() !== "") return deps.url.trim();
  const raw = (deps.env ?? process.env).IKEYTZ_MAPS_MCP_URL;
  return raw && raw.trim() !== "" ? raw.trim() : DEFAULT_URL;
}

async function defaultFetch(
  url: string,
  init?: {
    method?: string;
    headers?: Record<string, string>;
    body?: string;
    signal?: AbortSignal;
  },
): Promise<FetchResponseLike> {
  return fetch(url, init);
}

function fetchFn(deps: UpstreamDeps): FetchFn {
  return deps.fetchFn ?? defaultFetch;
}

export function isKnownTool(name: string): boolean {
  return TOOLS.some((t) => t.name === name);
}

/** Read one header from a fetch response, however it is shaped. */
function responseHeader(res: FetchResponseLike, name: string): string | undefined {
  const headers = res.headers;
  if (!headers) return undefined;
  if (typeof (headers as { get?: unknown }).get === "function") {
    const value = (headers as { get(n: string): string | null }).get(name);
    return value ?? undefined;
  }
  const record = headers as Record<string, string>;
  for (const key of Object.keys(record)) {
    if (key.toLowerCase() === name.toLowerCase()) return record[key];
  }
  return undefined;
}

/**
 * Parse a JSON-RPC reply body. Plain JSON is parsed
 * directly; a server-sent-events body contributes its
 * `data:` payloads, of which the last parseable object
 * is the message. Anything else is a hop failure.
 */
export function parseRpcBody(text: string): Record<string, unknown> {
  const trimmed = text.trim();
  if (trimmed === "") throw new UpstreamError("upstream returned an empty reply");
  const candidates: string[] = [];
  if (trimmed.includes("data:")) {
    for (const line of trimmed.split(/\r?\n/)) {
      const lineTrimmed = line.trim();
      if (lineTrimmed.startsWith("data:")) {
        candidates.push(lineTrimmed.slice("data:".length).trim());
      }
    }
  } else {
    candidates.push(trimmed);
  }
  let parsed: unknown;
  for (const candidate of candidates) {
    if (candidate === "") continue;
    try {
      parsed = JSON.parse(candidate);
    } catch {
      // Keep trying later SSE events; a plain-JSON body
      // that does not parse falls through to the error.
    }
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new UpstreamError("upstream returned a malformed reply");
  }
  return parsed as Record<string, unknown>;
}

interface RpcReply {
  message: Record<string, unknown> | null;
  sessionId?: string;
}

/** POST one JSON-RPC payload and return its parsed reply (null for an empty 2xx). */
async function postRpc(
  deps: UpstreamDeps,
  url: string,
  payload: Record<string, unknown>,
  sessionId: string | undefined,
  step: string,
): Promise<RpcReply> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json, text/event-stream",
  };
  if (sessionId !== undefined) headers["Mcp-Session-Id"] = sessionId;
  const ms = deps.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_resolve, reject) => {
    timer = setTimeout(() => {
      controller.abort();
      reject(new Error("request timed out"));
    }, ms);
  });
  let res: FetchResponseLike;
  try {
    res = await Promise.race([
      fetchFn(deps)(url, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
        signal: controller.signal,
      }),
      timeout,
    ]);
  } catch (err) {
    throw new UpstreamError(
      `upstream unreachable during ${step}: ${err instanceof Error ? err.message : String(err)}`,
    );
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }
  const nextSession = responseHeader(res, "Mcp-Session-Id") ?? sessionId;
  const body = await res.text();
  if (!(res.status >= 200 && res.status < 300)) {
    throw new UpstreamError(`upstream answered HTTP ${res.status} during ${step}`);
  }
  if (body.trim() === "") return { message: null, sessionId: nextSession };
  return { message: parseRpcBody(body), sessionId: nextSession };
}

function rpcErrorDetail(message: Record<string, unknown>, step: string): string | null {
  const error = message.error;
  if (error === undefined || error === null) return null;
  if (typeof error === "object" && !Array.isArray(error)) {
    const record = error as Record<string, unknown>;
    return typeof record.message === "string"
      ? record.message
      : `upstream error during ${step}`;
  }
  return `upstream error during ${step}`;
}

/**
 * Forward one tools/call to the upstream endpoint.
 * A successful upstream result is returned verbatim
 * (including any isError flag). Any hop failure is
 * returned as an isError result carrying an
 * `areaguide error: ...` text.
 */
export async function forwardCall(
  name: string,
  args: Record<string, unknown> = {},
  deps: UpstreamDeps = {},
): Promise<ToolResultLike> {
  try {
    if (!isKnownTool(name)) {
      throw new UpstreamError(`unknown tool: ${name}`);
    }
    const url = endpoint(deps);

    const init = await postRpc(
      deps,
      url,
      {
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {
          protocolVersion: PROTOCOL_VERSION,
          capabilities: {},
          clientInfo: { name: "areaguide", version: VERSION },
        },
      },
      undefined,
      "initialize",
    );
    if (init.message === null) {
      throw new UpstreamError("upstream returned an empty reply during initialize");
    }
    const initError = rpcErrorDetail(init.message, "initialize");
    if (initError !== null) throw new UpstreamError(initError);
    let sessionId = init.sessionId;

    const note = await postRpc(
      deps,
      url,
      { jsonrpc: "2.0", method: "notifications/initialized" },
      sessionId,
      "notifications/initialized",
    );
    sessionId = note.sessionId ?? sessionId;
    if (note.message !== null) {
      const noteError = rpcErrorDetail(note.message, "notifications/initialized");
      if (noteError !== null) throw new UpstreamError(noteError);
    }

    const call = await postRpc(
      deps,
      url,
      {
        jsonrpc: "2.0",
        id: 2,
        method: "tools/call",
        params: { name, arguments: args ?? {} },
      },
      sessionId,
      "tools/call",
    );
    if (call.message === null) {
      throw new UpstreamError("upstream returned an empty reply during tools/call");
    }
    const callError = rpcErrorDetail(call.message, "tools/call");
    if (callError !== null) throw new UpstreamError(callError);
    const result = call.message.result;
    if (typeof result !== "object" || result === null || Array.isArray(result)) {
      throw new UpstreamError("upstream returned a malformed reply during tools/call");
    }
    return result as ToolResultLike;
  } catch (err) {
    if (err instanceof UpstreamError) return errorResult(err.message);
    return errorResult(err instanceof Error ? err.message : String(err));
  }
}

/**
 * Forward one tools/call and return its result object
 * serialised as JSON text (the CLI's output shape).
 */
export async function callTool(
  name: string,
  args: Record<string, unknown> = {},
  deps: UpstreamDeps = {},
): Promise<string> {
  return JSON.stringify(await forwardCall(name, args, deps));
}

// Barrel re-exports folded in from the former src/index.ts
// (Ruling 2 tree consolidation: behavior-preserving merge).
export * from "./types.js";
