/**
 * areaguide types.
 *
 * areaguide is a forwarding client: it holds no maps
 * logic. The captured tool surface is data (ToolDef
 * entries served verbatim for tools/list) and every
 * tools/call is forwarded to the upstream endpoint
 * through an injectable fetch, so tests never touch
 * the live network.
 */

/** One captured tool definition, served verbatim for tools/list. */
export interface ToolDef {
  name: string;
  title?: string;
  description: string;
  inputSchema: Record<string, unknown>;
  [key: string]: unknown;
}

/** The slice of a fetch Response's headers this client reads. */
export type FetchHeadersLike =
  | { get(name: string): string | null }
  | Record<string, string>;

/** The minimal slice of a fetch Response this client relies on. */
export interface FetchResponseLike {
  ok: boolean;
  status: number;
  text(): Promise<string>;
  headers?: FetchHeadersLike;
}

/** Injectable fetch, so tests never touch the live network. */
export type FetchFn = (
  url: string,
  init?: {
    method?: string;
    headers?: Record<string, string>;
    body?: string;
    signal?: AbortSignal;
  },
) => Promise<FetchResponseLike>;

/** Runtime dependencies for the upstream client, all injectable in tests. */
export interface UpstreamDeps {
  /** Fetch implementation. Defaults to the global fetch. */
  fetchFn?: FetchFn;
  /** Environment (IKEYTZ_MAPS_MCP_URL). Defaults to process.env. */
  env?: Record<string, string | undefined>;
  /** Endpoint override. Defaults to env IKEYTZ_MAPS_MCP_URL or the default URL. */
  url?: string;
  /** Per-request timeout in ms. Defaults to 30000. */
  timeoutMs?: number;
}

/** A tools/call result: upstream results pass through; failures use this shape. */
export interface ToolResultLike {
  content?: Array<{ type: string; text?: string; [key: string]: unknown }>;
  isError?: boolean;
  [key: string]: unknown;
}
