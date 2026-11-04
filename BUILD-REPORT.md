# BUILD REPORT — areaguide (rebuild of com.ikeytz/maps)

Built 2026-10-27 from the spec
`~/workspace/mcp-rebuild-100/specs-batch27/areaguide.md`,
following TEMPLATE.md factory mechanics and the brief
for this build.

## What it is

A forwarding client to the ikeytz maps MCP at
`https://maps.ikeytz.com/mcp` (overridable via
`IKEYTZ_MAPS_MCP_URL`, a labelled reconstruction):
no maps logic, no computation. `tools/list` is served
locally from the captured literals; every `tools/call`
is forwarded over streamable-HTTP JSON-RPC
(initialize with protocolVersion `2025-03-26` and
clientInfo `areaguide`/`0.1.0` →
notifications/initialized → tools/call, honouring the
`Mcp-Session-Id` header when the server issues one)
and its result returned unchanged, including any
upstream `isError` flag.

## Tool list (68, verbatim from the live capture)

`list_service_areas`, `get_service_area`,
`get_ort_datetime`, `get_geo_office`, `get_contact`,
`get_discovery`, `get_llms_mcp_server`,
`get_llms_mcp_web`, `find_by_keyword`, `find_by_serp`,
`get_serp_snippet`, `find_by_plz`, `find_by_geo`,
`find_by_icbm`, `find_by_gebiet`, `find_by_area`,
`list_slugs`, `list_plz`, `get_hub`, `get_embed_map`,
`get_geo_api`, `get_grenze`, `get_grenze_koordinaten`,
`get_lage`, `get_geschichte`, `distance_to_office`,
`resolve_maps_url`, `find_by_google_maps`, `get_legal`,
`get_urheberrecht`, `get_copyright`, `get_impressum`,
`get_agb`, `get_nutzungsbedingungen`, `get_datenschutz`,
`get_widerruf`, `site_overview`, `get_business_identity`,
`list_nav`, `list_footer`, `list_locales`,
`resolve_locale_url`, `get_prices`,
`get_invoice_line_items`, `list_services`,
`get_emergency`, `list_auswahl`, `get_auswahl_item`,
`get_about`, `get_partner_info`, `get_links`,
`get_review_url`, `list_faq`, `get_faq`, `list_wissen`,
`get_wissen_entry`, `list_ratgeber`, `get_ratgeber`,
`get_page_summary`, `get_ai_page`, `get_llms_txt`,
`get_ai_txt`, `get_sitemap_txt`,
`list_whatsapp_options`, `compose_tel_mobile`,
`compose_tel_landline`, `compose_whatsapp`,
`compose_mailto`.

Names, titles, descriptions and inputSchemas are
reproduced verbatim from
`harness/fixtures/ikeytz-maps-tools-original.json`
in `src/tools.ts`, generated from the fixture by a
small script (not hand-typed). The capture's
`outputSchema` fields and annotations are NOT
reproduced: parity compares inputSchema, and the
omission is recorded here, in the spec, and in the
fixture `_source`.

## Files created (19-file factory set + report + parity-out)

- `package.json` — `@reneturcios/areaguide` 0.1.0,
  one bin `dist/cli.js`, mcpName
  `io.github.CloudCorpRecords/areaguide`.
- `server.json` — description exactly as the brief
  gives it (94 chars, verified by count):
  "Forwarding client for the ikeytz maps read/link
  service: service areas, places and site pages."
  npm entry carries `"version": "0.1.0"`; the OCI
  entry (registryType `oci`) has identifier
  `ghcr.io/cloudcorprecords/areaguide:0.1.0` and
  carries NO `version` field.
- `Dockerfile` — two-stage `node:20-alpine`,
  ENTRYPOINT `node /app/dist/cli.js`, CMD `mcp`,
  label `io.modelcontextprotocol.server.name="io.github.CloudCorpRecords/areaguide"`.
- `tsconfig.json` (fleet-identical), `.gitignore`.
- `package-lock.json` — see Lockfile below.
- `README.md`, `LICENSE` (MIT, Copyright (c) 2026
  Rene Turcios), `CHANGELOG.md` (single 0.1.0 entry,
  2026-10-27).
- `src/types.ts` — ToolDef, FetchFn / FetchResponseLike,
  UpstreamDeps (injectable fetch, env, url, timeout).
- `src/tools.ts` — the captured tool literals,
  generated from the fixture.
- `src/upstream.ts` — core: VERSION 0.1.0, default URL,
  handshake and forwarding, SSE/plain-JSON reply
  parsing, session header handling; hop failures are
  returned as isError results carrying an
  `areaguide error: ...` text.
- `src/mcp.ts` — low-level Server + StdioServerTransport
  (NOT McpServer/zod), captured literals for tools/list,
  forwarding for tools/call; unknown tool names and
  non-object arguments are rejected with an McpError
  carrying InvalidParams before any fetch. Exports
  `createServer` / `startMcpServer` / `handleCallTool`
  so the handler can be tested without a transport;
  `cli.ts` starts the server via `startMcpServer()`.
- `src/cli.ts` — one bin (shebang, exec bit): 68 tool
  subcommands (one JSON argument string, forwarded
  result printed as JSON), `mcp` subcommand,
  `--version` → `0.1.0`; exit codes 0 / 1 / 2.
- `src/index.ts` — re-exports types + upstream.
- `test/upstream.test.ts` — see Tests.
- `.github/workflows/` — ci.yml, publish.yml,
  publish-container.yml (IMAGE
  `ghcr.io/cloudcorprecords/areaguide`, smoke test
  asserts server name `areaguide`), registry-publish.yml.
- `parity-out/` — tools-rebuild.json, parity.json,
  parity.md.

## Tests actually run

`npm test` (tsx --test test/*.test.ts), fake fetch
only — no live calls anywhere:

- Observed: **18 tests, 18 pass, 0 fail** (5 suites).
- Coverage: 68-tool registration deep-equality vs the
  fixture (and name order, and absence of
  outputSchema/annotations); handshake order and
  payloads (protocolVersion 2025-03-26, clientInfo
  areaguide/0.1.0); session header honoured on both
  later requests and absent when not issued; default
  endpoint and `IKEYTZ_MAPS_MCP_URL` env override;
  forwarding of a representative tool with path-like
  arguments (`get_page_summary` with
  `path: "/pattonville"`) and of `get_service_area`
  by slug; passthrough of upstream content/isError
  verbatim; SSE-framed reply parsing; upstream HTTP
  500, throwing fetch and upstream JSON-RPC error all
  rendering as `areaguide error: ...` isError results;
  unknown tool and non-object arguments rejected with
  McpError InvalidParams before any fetch;
  parseRpcBody plain/SSE/malformed.
- Build verification: `npx tsc --noEmit` exit 0;
  `npm run build` emitted `dist/`; `node dist/cli.js
  --version` prints `0.1.0`; no-args and unknown-tool
  CLI invocations exit 2.
- Stdio smoke (built server, no upstream call): an
  `initialize` + `tools/list` exchange over
  `node dist/cli.js mcp` returned serverInfo
  `areaguide`/`0.1.0` and a tools/list that deep-equals
  the fixture's 68 tools; an unknown-tool `tools/call`
  over the wire returned code -32602 (InvalidParams).

## Parity

Command:

```
python3 harness/parity.py \
  --original harness/fixtures/ikeytz-maps-tools-original.json \
  --rebuild builds/areaguide/parity-out/tools-rebuild.json \
  --out builds/areaguide/parity-out
```

(`tools-rebuild.json` was generated from the built
`dist/tools.js` export.)

Result: **PASS, parity 100.0, 68/68 identical**,
no missing, no extra, no schema diffs.

## Lockfile

Generated clean in the build dir (no `node_modules`
present) via Route 3 of LOCKFILE-ROUTE.md:
`npm install --package-lock-only --ignore-scripts
--offline`. Verified: parses,
`name == @reneturcios/areaguide`, **128 entries**
(`packages` keys), md5
`700d108bc94d154b4851c41ad9edeb34` (unchanged after
the dependency install used for build/test;
`node_modules` was removed again afterwards).

## Reconstructions and gaps (labelled)

- **Env override is a reconstruction.** The endpoint
  `https://maps.ikeytz.com/mcp` is pinned by the spec;
  the `IKEYTZ_MAPS_MCP_URL` override is this rebuild's
  own, labelled as such in code and README.
- **Error text is a reconstruction.** Upstream hop
  failures render as an isError result with
  `areaguide error: ...` text (spec-labelled family);
  upstream results and upstream isError results pass
  through verbatim, while an upstream JSON-RPC error
  object is rendered under the same prefix with the
  upstream message.
- **outputSchema / annotations not reproduced.**
  Every captured tool also carries an `outputSchema`
  and annotations upstream; neither is reproduced
  (parity compares inputSchema). Recorded here, in
  the spec, and in the fixture `_source`.
- **No live tools/call is claimed.** The only live
  interaction behind this build is the coordinator's
  tools/list capture of 2026-10-27; all tests use a
  stubbed upstream via fake fetch.

## Ambiguities flagged

- **The brief's example tool `get_place` does not
  exist** in the fixture's 68 tools. The
  path-like-arguments forwarding test therefore uses
  `get_page_summary` (`path: "/pattonville"`) and
  `get_service_area` (slug), and `get_place` is used
  as the unknown-tool example in the InvalidParams
  test, where it correctly rejects.
- **Wire-level non-object arguments:** the handler
  throws McpError InvalidParams for non-object
  arguments, but over stdio the SDK's own
  CallToolRequestSchema validation rejects a
  non-record `arguments` value before the handler
  runs (observed: code -32603 with a schema message).
  The call is rejected either way; only the code
  differs by entry path. Unknown-tool calls do reach
  the handler and return -32602 over the wire.
- **TEMPLATE.md §2 item 12** describes the
  McpServer/zod registration path, but the brief for
  this build explicitly directs the low-level Server
  API with captured literals, which is what was
  built — the zod path would inject keys and break
  verbatim parity.
