# areaguide

A forwarding client for the ikeytz maps read/link service — the public,
read-only service behind a Ludwigsburg locksmith's service-area site.
It covers service areas, places, geo and page data, and link composers
for that site.

areaguide contains no maps logic of its own. It serves `tools/list`
locally from a verbatim capture of the upstream server's 68 tools
(name, title, description and inputSchema; the capture's outputSchema
fields and annotations are not reproduced), and forwards every
`tools/call` to the upstream endpoint. Upstream results pass through
unchanged; a failed hop comes back as an `areaguide error: ...` text
result with `isError` set.

## Upstream

- Default endpoint: `https://maps.ikeytz.com/mcp`
- Override: set `IKEYTZ_MAPS_MCP_URL` to another streamable-HTTP MCP
  endpoint. (The override is a reconstruction; the default endpoint is
  the pinned one.)
- No account and no API key are needed.
- The forwarding hop runs `initialize` (protocolVersion `2025-03-26`,
  clientInfo `areaguide` / `0.1.0`), then
  `notifications/initialized`, then `tools/call`, and honours an
  `Mcp-Session-Id` header when the upstream issues one. Replies may be
  plain JSON or server-sent events.

## CLI usage

```bash
npx @reneturcios/areaguide get_service_area '{"slug":"ludwigsburg"}'
npx @reneturcios/areaguide list_service_areas '{}'
npx @reneturcios/areaguide --version
```

Each tool subcommand takes a single JSON argument string, forwards the
call and prints the result as JSON. Exit codes: 0 success, 1 a
forwarded-call error, 2 usage error.

## MCP usage

```bash
npx @reneturcios/areaguide mcp
```

MCP client config:

```json
{
  "mcpServers": {
    "areaguide": {
      "command": "npx",
      "args": ["-y", "@reneturcios/areaguide", "mcp"]
    }
  }
}
```

Unknown tool names, and arguments that are not a JSON object, are
rejected locally with `InvalidParams` before any network hop.

## Docker

```bash
docker run -i ghcr.io/cloudcorprecords/areaguide          # stdio MCP server (CMD defaults to "mcp")
docker run --rm ghcr.io/cloudcorprecords/areaguide get_service_area '{"slug":"ludwigsburg"}'
```

## Tools (68)

`list_service_areas`, `get_service_area`, `get_ort_datetime`,
`get_geo_office`, `get_contact`, `get_discovery`, `get_llms_mcp_server`,
`get_llms_mcp_web`, `find_by_keyword`, `find_by_serp`,
`get_serp_snippet`, `find_by_plz`, `find_by_geo`, `find_by_icbm`,
`find_by_gebiet`, `find_by_area`, `list_slugs`, `list_plz`, `get_hub`,
`get_embed_map`, `get_geo_api`, `get_grenze`, `get_grenze_koordinaten`,
`get_lage`, `get_geschichte`, `distance_to_office`, `resolve_maps_url`,
`find_by_google_maps`, `get_legal`, `get_urheberrecht`, `get_copyright`,
`get_impressum`, `get_agb`, `get_nutzungsbedingungen`, `get_datenschutz`,
`get_widerruf`, `site_overview`, `get_business_identity`, `list_nav`,
`list_footer`, `list_locales`, `resolve_locale_url`, `get_prices`,
`get_invoice_line_items`, `list_services`, `get_emergency`,
`list_auswahl`, `get_auswahl_item`, `get_about`, `get_partner_info`,
`get_links`, `get_review_url`, `list_faq`, `get_faq`, `list_wissen`,
`get_wissen_entry`, `list_ratgeber`, `get_ratgeber`, `get_page_summary`,
`get_ai_page`, `get_llms_txt`, `get_ai_txt`, `get_sitemap_txt`,
`list_whatsapp_options`, `compose_tel_mobile`, `compose_tel_landline`,
`compose_whatsapp`, `compose_mailto`.

## Development

```bash
npm install
npm run build   # tsc -> dist/ (dist/cli.js is the bin)
npm test        # tsx --test test/*.test.ts (fake fetch only, no network)
npm run dev     # tsx src/cli.ts
```

## License

MIT — Copyright (c) 2026 Rene Turcios.
