/**
 * areaguide tests. Fake fetch only — no live calls.
 * The registration-integrity test deep-equals the
 * served tool literals against the coordinator's
 * verbatim fixture capture (68 tools).
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import { TOOLS, TOOL_NAMES } from "../src/tools.js";
import {
  callTool,
  forwardCall,
  parseRpcBody,
  PROTOCOL_VERSION,
  VERSION,
} from "../src/upstream.js";
import { handleCallTool } from "../src/mcp.js";
import type {
  FetchFn,
  FetchResponseLike,
  ToolDef,
} from "../src/types.js";

const FIXTURE_URL = new URL(
  "../../../harness/fixtures/ikeytz-maps-tools-original.json",
  import.meta.url,
);
const FIXTURE_AVAILABLE = existsSync(FIXTURE_URL);
const fixture = (
  FIXTURE_AVAILABLE
    ? JSON.parse(readFileSync(FIXTURE_URL, "utf-8"))
    : { tools: [] }
) as {
  tools: ToolDef[];
};

/**
 * Publish-survival guard (Wave 25 preflight, proven Wave 24 pattern):
 * the parity fixture lives in the build harness, outside the published
 * repo tree, so fixture-dependent tests skip cleanly when it is absent;
 * with the fixture present they run in full, with no skips.
 */
function skipWithoutFixture(t: {
  skip: (message: string) => void;
}): boolean {
  if (FIXTURE_AVAILABLE) return false;
  t.skip("parity fixture lives in the build harness, not the repo tree");
  return true;
}

const RESULT = {
  content: [{ type: "text", text: '{"ok":true,"slug":"pattonville"}' }],
};

interface CapturedRequest {
  url: string;
  method?: string;
  headers?: Record<string, string>;
  body?: string;
}

function jsonResponse(
  payload: unknown,
  opts: { status?: number; sessionId?: string; sse?: boolean } = {},
): FetchResponseLike {
  const raw = JSON.stringify(payload);
  const text = opts.sse ? `event: message\ndata: ${raw}\n\n` : raw;
  return {
    ok: (opts.status ?? 200) >= 200 && (opts.status ?? 200) < 300,
    status: opts.status ?? 200,
    headers: {
      get(name: string) {
        if (name.toLowerCase() === "mcp-session-id") return opts.sessionId ?? null;
        return null;
      },
    },
    text: async () => text,
  };
}

/**
 * A fake upstream: answers initialize, accepts the
 * initialized notification with an empty 200, and
 * answers tools/call with `callResponder`'s response
 * (or the default RESULT).
 */
function fakeUpstream(
  captured: CapturedRequest[],
  callResponder?: () => FetchResponseLike,
  opts: { sessionId?: string } = {},
): FetchFn {
  return async (url, init) => {
    captured.push({
      url,
      method: init?.method,
      headers: init?.headers,
      body: init?.body,
    });
    const payload = JSON.parse(init?.body ?? "{}") as { method?: string };
    if (payload.method === "initialize") {
      return jsonResponse(
        {
          jsonrpc: "2.0",
          id: 1,
          result: {
            protocolVersion: PROTOCOL_VERSION,
            capabilities: {},
            serverInfo: { name: "ikeytz-maps", version: "1.0.0" },
          },
        },
        { sessionId: opts.sessionId },
      );
    }
    if (payload.method === "notifications/initialized") {
      return {
        ok: true,
        status: 200,
        headers: { get: () => null },
        text: async () => "",
      };
    }
    if (payload.method === "tools/call") {
      if (callResponder) return callResponder();
      return jsonResponse({ jsonrpc: "2.0", id: 2, result: RESULT });
    }
    throw new Error(`unexpected method ${String(payload.method)}`);
  };
}

function requestPayloads(captured: CapturedRequest[]): Array<Record<string, never>> {
  return captured.map((r) => JSON.parse(r.body ?? "{}"));
}

describe("registration integrity (captured surface)", () => {
  it("serves exactly the fixture's 68 tools, deep-equal", (t) => {
    if (skipWithoutFixture(t)) return;
    assert.equal(fixture.tools.length, 68);
    assert.deepEqual(TOOLS, fixture.tools);
  });

  it("tool names are in fixture order, first and last as captured", (t) => {
    if (skipWithoutFixture(t)) return;
    assert.deepEqual(
      TOOL_NAMES,
      fixture.tools.map((t) => t.name),
    );
    assert.equal(TOOL_NAMES[0], "list_service_areas");
    assert.equal(TOOL_NAMES[TOOL_NAMES.length - 1], "compose_mailto");
  });

  it("does not reproduce outputSchema or annotations", () => {
    for (const tool of TOOLS) {
      assert.equal("outputSchema" in tool, false, tool.name);
      assert.equal("annotations" in tool, false, tool.name);
      assert.equal(typeof tool.description, "string", tool.name);
      assert.equal(typeof tool.inputSchema, "object", tool.name);
    }
  });
});

describe("forwarding", () => {
  it("handshakes in order, then forwards a path-like call verbatim", async () => {
    const captured: CapturedRequest[] = [];
    const out = await forwardCall(
      "get_page_summary",
      { path: "/pattonville" },
      { fetchFn: fakeUpstream(captured, undefined, { sessionId: "sess-42" }) },
    );
    assert.deepEqual(out, RESULT);

    const payloads = requestPayloads(captured) as Array<{
      method: string;
      params?: Record<string, unknown>;
    }>;
    assert.deepEqual(
      payloads.map((p) => p.method),
      ["initialize", "notifications/initialized", "tools/call"],
    );
    assert.equal(payloads[0].params?.protocolVersion, "2025-03-26");
    assert.deepEqual(payloads[0].params?.clientInfo, {
      name: "areaguide",
      version: "0.1.0",
    });
    assert.deepEqual(payloads[2].params, {
      name: "get_page_summary",
      arguments: { path: "/pattonville" },
    });
    // Default endpoint, and the issued session id is
    // honoured on both later requests.
    assert.equal(captured[0].url, "https://maps.ikeytz.com/mcp");
    assert.equal(captured[0].headers?.["Mcp-Session-Id"], undefined);
    assert.equal(captured[1].headers?.["Mcp-Session-Id"], "sess-42");
    assert.equal(captured[2].headers?.["Mcp-Session-Id"], "sess-42");
  });

  it("forwards a representative slug call (get_service_area)", async () => {
    const captured: CapturedRequest[] = [];
    const out = await forwardCall(
      "get_service_area",
      { slug: "bietigheim-bissingen" },
      { fetchFn: fakeUpstream(captured) },
    );
    assert.deepEqual(out, RESULT);
    const call = requestPayloads(captured)[2] as unknown as {
      params: { name: string; arguments: Record<string, unknown> };
    };
    assert.equal(call.params.name, "get_service_area");
    assert.deepEqual(call.params.arguments, { slug: "bietigheim-bissingen" });
    // No session id issued -> none sent back.
    assert.equal(captured[2].headers?.["Mcp-Session-Id"], undefined);
  });

  it("passes upstream content and isError through verbatim", async () => {
    const errResult = {
      content: [{ type: "text", text: '{"ok":false,"error":"unknown_place"}' }],
      isError: true,
    };
    const captured: CapturedRequest[] = [];
    const out = await forwardCall(
      "get_service_area",
      { slug: "nowhere" },
      {
        fetchFn: fakeUpstream(captured, () =>
          jsonResponse({ jsonrpc: "2.0", id: 2, result: errResult }),
        ),
      },
    );
    assert.deepEqual(out, errResult);
  });

  it("parses an SSE-framed tools/call reply", async () => {
    const captured: CapturedRequest[] = [];
    const out = await forwardCall(
      "list_service_areas",
      {},
      {
        fetchFn: fakeUpstream(captured, () =>
          jsonResponse({ jsonrpc: "2.0", id: 2, result: RESULT }, { sse: true }),
        ),
      },
    );
    assert.deepEqual(out, RESULT);
  });

  it("honours the IKEYTZ_MAPS_MCP_URL env override", async () => {
    const captured: CapturedRequest[] = [];
    await forwardCall(
      "list_plz",
      {},
      {
        fetchFn: fakeUpstream(captured),
        env: { IKEYTZ_MAPS_MCP_URL: "https://example.invalid/custom-mcp" },
      },
    );
    assert.equal(captured[0].url, "https://example.invalid/custom-mcp");
  });

  it("callTool serialises the forwarded result as JSON", async () => {
    const captured: CapturedRequest[] = [];
    const out = await callTool(
      "list_slugs",
      {},
      { fetchFn: fakeUpstream(captured) },
    );
    assert.deepEqual(JSON.parse(out), RESULT);
    assert.equal(VERSION, "0.1.0");
  });
});

describe("failure rendering", () => {
  it("upstream HTTP failure becomes an areaguide error result", async () => {
    const captured: CapturedRequest[] = [];
    const out = await forwardCall(
      "get_service_area",
      { slug: "walheim" },
      {
        fetchFn: fakeUpstream(captured, () =>
          jsonResponse("nope", { status: 500 }),
        ),
      },
    );
    assert.equal(out.isError, true);
    const text = out.content?.[0]?.text ?? "";
    assert.ok(text.startsWith("areaguide error:"), text);
    assert.ok(text.includes("HTTP 500"), text);
  });

  it("a throwing fetch becomes an areaguide error result", async () => {
    const throwing: FetchFn = async () => {
      throw new Error("connection refused");
    };
    const out = await forwardCall("list_plz", {}, { fetchFn: throwing });
    assert.equal(out.isError, true);
    assert.ok(
      (out.content?.[0]?.text ?? "").startsWith("areaguide error:"),
    );
    assert.ok((out.content?.[0]?.text ?? "").includes("connection refused"));
  });

  it("an upstream JSON-RPC error becomes an areaguide error result", async () => {
    const captured: CapturedRequest[] = [];
    const out = await forwardCall(
      "get_faq",
      {},
      {
        fetchFn: fakeUpstream(captured, () =>
          jsonResponse({
            jsonrpc: "2.0",
            id: 2,
            error: { code: -32603, message: "upstream boom" },
          }),
        ),
      },
    );
    assert.equal(out.isError, true);
    assert.ok((out.content?.[0]?.text ?? "").includes("upstream boom"));
  });
});

describe("MCP-layer validation", () => {
  it("unknown tool => McpError InvalidParams, before any fetch", async () => {
    let fetched = false;
    const fetchFn: FetchFn = async () => {
      fetched = true;
      throw new Error("must not be called");
    };
    await assert.rejects(
      () => handleCallTool("get_place", {}, { fetchFn }),
      (err: unknown) => {
        assert.ok(err instanceof McpError);
        assert.equal((err as McpError).code, ErrorCode.InvalidParams);
        return true;
      },
    );
    assert.equal(fetched, false);
  });

  it("non-object arguments => McpError InvalidParams", async () => {
    for (const bad of ["nope", 42, ["x"], null]) {
      await assert.rejects(
        () => handleCallTool("get_service_area", bad, {}),
        (err: unknown) => {
          assert.ok(err instanceof McpError);
          assert.equal((err as McpError).code, ErrorCode.InvalidParams);
          return true;
        },
      );
    }
  });

  it("valid call through the MCP layer forwards and passes through", async () => {
    const captured: CapturedRequest[] = [];
    const out = await handleCallTool(
      "resolve_maps_url",
      { path: "/pattonville" },
      { fetchFn: fakeUpstream(captured) },
    );
    assert.deepEqual(out, RESULT);
  });
});

describe("parseRpcBody", () => {
  it("parses plain JSON", () => {
    assert.deepEqual(parseRpcBody('{"jsonrpc":"2.0","id":1,"result":{}}'), {
      jsonrpc: "2.0",
      id: 1,
      result: {},
    });
  });

  it("parses SSE data lines", () => {
    const body =
      'event: message\ndata: {"jsonrpc":"2.0","id":2,"result":{"ok":true}}\n\n';
    assert.deepEqual(parseRpcBody(body), {
      jsonrpc: "2.0",
      id: 2,
      result: { ok: true },
    });
  });

  it("rejects empty and malformed bodies", () => {
    assert.throws(() => parseRpcBody(""));
    assert.throws(() => parseRpcBody("not json at all"));
  });
});
