# Changelog

## 0.1.0 (2026-10-27)

- Initial rebuild: forwarding client for the ikeytz maps read/link service.
- Serves the captured 68-tool list locally (name, title, description and
  inputSchema verbatim from the live capture); the capture's outputSchema
  fields and annotations are not reproduced.
- Forwards every tools/call to https://maps.ikeytz.com/mcp over
  streamable-HTTP JSON-RPC (initialize, notifications/initialized,
  tools/call, honouring Mcp-Session-Id), with the endpoint overridable
  via the IKEYTZ_MAPS_MCP_URL environment variable.
- One bin serves the CLI (`areaguide <tool> '<json>'`) and the stdio
  MCP server (`areaguide mcp`).
