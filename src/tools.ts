/**
 * areaguide captured tool surface.
 *
 * These literals are the upstream server's own served
 * tools/list, captured live on 2026-10-27 (see
 * harness/fixtures/ikeytz-maps-tools-original.json) and
 * reproduced verbatim for name, title, description and
 * inputSchema so tools/list can be served locally
 * without a network hop. The capture's outputSchema
 * fields and annotations are NOT reproduced (parity
 * compares inputSchema; the omission is recorded in
 * the spec and BUILD-REPORT.md). They are data, not
 * logic: every tools/call is forwarded upstream.
 *
 * Generated from the fixture by a small script; do not
 * hand-edit individual entries.
 */
import type { ToolDef } from "./types.js";

export const TOOLS: ToolDef[] = [
  {
    "name": "list_service_areas",
    "title": "List Service Areas",
    "description": "WHAT: List all 52 ikeytz Einsatzgebiete on maps.ikeytz.com as point cards (slug, name, plz, lat/lng, embed_map, geo_api, grenze_api, punkt_api) — not polygons. Also public Sammel: /api/v1/embed/orte · /orte/grenzen · /orte/punkte. RETURNS items[], count, total, offset, limit. Optional fields= comma filter; limit/offset page the list. USE to enumerate the service area or build a picker. DOES NOT return OSM boundaries in the list (use get_grenze or GET grenze_api per slug) or prices. NEXT: get_service_area, get_embed_map, get_grenze, find_by_plz.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "locale": {
          "type": "string",
          "enum": [
            "de"
          ],
          "default": "de",
          "description": "maps is German-only (de). Omit or pass de. Other values are ignored; URLs stay https://maps.ikeytz.com/… with no locale prefix. Not a www multi-locale switch — use @ikeytz/mcp list_locales on www for en|fr|ru|fa|ar|tr."
        },
        "limit": {
          "type": "integer",
          "minimum": 1,
          "description": "Maximum items or lines to return after offset. Omit = all remaining in the window (subject to tool-specific clamps). For geo near-search default is often 5 without radius_km, up to 52 with radius."
        },
        "offset": {
          "type": "integer",
          "minimum": 0,
          "default": 0,
          "description": "0-based index into a list or discovery file lines (split on \\n). 0 = first. Omit = 0. Combine with limit to page. Use nextOffset / offset+limit from a previous result when present."
        },
        "fields": {
          "type": "string",
          "description": "Optional field filter: comma-separated names or array. Keeps envelope keys (ok, tool, summary, canonicalUrl, attribution, locale, related, count, total, offset, limit, compact) plus listed fields. Example: slug,name,plz,lat,lng."
        }
      }
    }
  },
  {
    "name": "get_service_area",
    "title": "Get Service Area",
    "description": "WHAT: One Einsatzgebiet by slug → plz (first match) → name substring. RETURNS point card + maps_nav (hub/buero/mcp-hub) + neighbors (5 nearest by airline, MAPS-IL2) + optional Lage texts (h1, kicker, blurb, lage, geschichte) unless compact=true. fields= filters keys. USE when the user names a town/district in Landkreis Ludwigsburg. DOES NOT geocode free addresses outside the 52; unknown → ok=false unknown_place. NEXT: get_lage, get_geschichte, get_grenze, get_embed_map, distance_to_office.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "slug": {
          "type": "string",
          "description": "URL slug of one of the 52 Einsatzgebiete, e.g. pattonville, bietigheim-bissingen, walheim, gruenbuehl. Matches https://maps.ikeytz.com/{slug}. Lookup order when combined with plz/name: slug first."
        },
        "plz": {
          "type": "string",
          "description": "German postcode (PLZ). Several Gebiete can share one PLZ (e.g. 71638). For single lookup first match wins; use find_by_plz for all matches."
        },
        "name": {
          "type": "string",
          "description": "German place name substring (case-insensitive, umlauts ok), e.g. Grünbühl, Pattonville. Used when slug/plz omitted."
        },
        "locale": {
          "type": "string",
          "enum": [
            "de"
          ],
          "default": "de",
          "description": "maps is German-only (de). Omit or pass de. Other values are ignored; URLs stay https://maps.ikeytz.com/… with no locale prefix. Not a www multi-locale switch — use @ikeytz/mcp list_locales on www for en|fr|ru|fa|ar|tr."
        },
        "compact": {
          "type": "boolean",
          "description": "If true, omit h1/kicker/blurb/lage/geschichte — coords + URLs + neighbors still present."
        },
        "fields": {
          "type": "string",
          "description": "Optional field filter: comma-separated names or array. Keeps envelope keys (ok, tool, summary, canonicalUrl, attribution, locale, related, count, total, offset, limit, compact) plus listed fields. Example: slug,name,plz,lat,lng."
        }
      }
    }
  },
  {
    "name": "get_ort_datetime",
    "title": "Get Ort Datetime",
    "description": "WHAT: Europe/Berlin wall clock to the second (stand YYYY-MM-DD HH:MM:SS CEST|CET) for pricing whenKey context. Optional slug|plz|name like get_service_area; omit = all 52 places with the same clock. RETURNS timezone, stand, iso, unix, date, time, tz, and whenKey day|night for www invoicing. USE before quoting via www get_invoice_line_items. DOES NOT return euro amounts (no price matrix on maps). NEXT: www @ikeytz/mcp get_invoice_line_items({situationKey, whenKey}) or get_prices.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "slug": {
          "type": "string",
          "description": "URL slug of one of the 52 Einsatzgebiete, e.g. pattonville, bietigheim-bissingen, walheim, gruenbuehl. Matches https://maps.ikeytz.com/{slug}. Lookup order when combined with plz/name: slug first."
        },
        "plz": {
          "type": "string",
          "description": "German postcode (PLZ). Several Gebiete can share one PLZ (e.g. 71638). For single lookup first match wins; use find_by_plz for all matches."
        },
        "name": {
          "type": "string",
          "description": "German place name substring (case-insensitive, umlauts ok), e.g. Grünbühl, Pattonville. Used when slug/plz omitted."
        }
      }
    }
  },
  {
    "name": "get_geo_office",
    "title": "Get Geo Office",
    "description": "WHO/WHAT: Gewerbesitz (registered office) pin on maps.ikeytz.com/buero. walkIn=false always — mobile locksmith, not a shop counter. RETURNS street, postal, city, lat, lng, google_maps/icbm (same 'lat, lng' string), embed_map, geo_api (/api/v1/embed/office), note, walkIn, and einsatzgebiete (the same 52 name/slug/url links as the HTML list on /buero). USE for NAP/schema or Footer iframe. DOES NOT accept walk-in customers or bookings. The office is not a 53rd place. NEXT: get_contact, distance_to_office, get_business_identity, list_service_areas.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "locale": {
          "type": "string",
          "enum": [
            "de"
          ],
          "default": "de",
          "description": "maps is German-only (de). Omit or pass de. Other values are ignored; URLs stay https://maps.ikeytz.com/… with no locale prefix. Not a www multi-locale switch — use @ikeytz/mcp list_locales on www for en|fr|ru|fa|ar|tr."
        }
      }
    }
  },
  {
    "name": "get_contact",
    "title": "Get Contact",
    "description": "WHAT: Public NAP — mobile, landline, fax, email, mapsEmail (info@maps.ikeytz.com), WhatsApp, address, office coords. walkIn=false. USE for call/WhatsApp/mail CTAs. DOES NOT open tickets or send messages. NEXT: compose_tel_mobile, compose_whatsapp, compose_mailto, list_whatsapp_options.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "locale": {
          "type": "string",
          "enum": [
            "de"
          ],
          "default": "de",
          "description": "maps is German-only (de). Omit or pass de. Other values are ignored; URLs stay https://maps.ikeytz.com/… with no locale prefix. Not a www multi-locale switch — use @ikeytz/mcp list_locales on www for en|fr|ru|fa|ar|tr."
        }
      }
    }
  },
  {
    "name": "get_discovery",
    "title": "Get Discovery",
    "description": "WHAT: 1:1 mirror of a maps discovery file (UTF-8 text/JSON). summary ≡ line window + trailing # MCP-META (truncated, totalUrls, nextOffset) — not a one-line stub. which is required — common ids: ard, ai-catalog, ai-txt, ai-plugin, answer-engine, agent-skills, llms, llms-full, llms-index, llms-keywords, llms-serp, llms-jsonld, llms-navigation, llms-impressum-kontakt, llms-orte-geo, llms-grenzen-koordinaten, llms-urheberrecht, llms-copyright, llms-mcp-server, llms-mcp-web, robots, sitemap-txt, sitemap-xml. Omit limit: if remaining >~30KB → first ~30KB window + nextOffset (O9); explicit limit keeps line window 1..10000 (not forced to 30KB). USE for agent-ready catalogs and robots/sitemap. DOES NOT invent missing files (missing=true). NEXT: find_by_keyword / find_by_serp for structured search; get_llms_txt / get_ai_txt aliases.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "which": {
          "type": "string",
          "description": "Required discovery id. Examples: ard, ai-catalog, ai-txt, ai-plugin, answer-engine, agent-skills, llms, llms-full, llms-index, llms-keywords, llms-serp, llms-jsonld, llms-navigation, llms-impressum-kontakt, llms-orte-geo, llms-grenzen-koordinaten, llms-urheberrecht, llms-copyright, llms-mcp-server, llms-mcp-web, robots, sitemap-txt, sitemap-xml."
        },
        "offset": {
          "type": "integer",
          "minimum": 0,
          "default": 0,
          "description": "0-based index into a list or discovery file lines (split on \\n). 0 = first. Omit = 0. Combine with limit to page. Use nextOffset / offset+limit from a previous result when present."
        },
        "limit": {
          "type": "integer",
          "minimum": 1,
          "maximum": 10000,
          "description": "Maximum number of lines to return after offset. Omit or null = if remaining payload ≤~30KB return all remaining lines; if larger, return first ~30KB window + nextOffset (O9). Explicit limit keeps 1..10000 line window (MCP caps unchanged — not forced to 30KB). Meta also as trailing # MCP-META lines in summary."
        }
      },
      "required": [
        "which"
      ]
    }
  },
  {
    "name": "get_llms_mcp_server",
    "title": "Get Llms Mcp Server",
    "description": "WHAT: Alias of get_discovery(which=llms-mcp-server) — machine/catalog text for the maps MCP server. Optional offset/limit. USE when an agent needs the server-side llms MCP catalog. NEXT: get_llms_mcp_web, get_links.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "offset": {
          "type": "integer",
          "minimum": 0,
          "default": 0,
          "description": "0-based index into a list or discovery file lines (split on \\n). 0 = first. Omit = 0. Combine with limit to page. Use nextOffset / offset+limit from a previous result when present."
        },
        "limit": {
          "type": "integer",
          "minimum": 1,
          "maximum": 10000,
          "description": "Maximum number of lines to return after offset. Omit or null = if remaining payload ≤~30KB return all remaining lines; if larger, return first ~30KB window + nextOffset (O9). Explicit limit keeps 1..10000 line window (MCP caps unchanged — not forced to 30KB). Meta also as trailing # MCP-META lines in summary."
        }
      }
    }
  },
  {
    "name": "get_llms_mcp_web",
    "title": "Get Llms Mcp Web",
    "description": "WHAT: Returns the web/UI-oriented MCP catalog text on maps (alias of get_discovery(which=llms-mcp-web)). Optional offset/limit. USE for browser/agent web discovery copy. Prefer get_llms_mcp_server for the server-side catalog; prefer get_llms_txt for the primary maps index. DOES NOT replace the live /mcp tools/list.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "offset": {
          "type": "integer",
          "minimum": 0,
          "default": 0,
          "description": "0-based index into a list or discovery file lines (split on \\n). 0 = first. Omit = 0. Combine with limit to page. Use nextOffset / offset+limit from a previous result when present."
        },
        "limit": {
          "type": "integer",
          "minimum": 1,
          "maximum": 10000,
          "description": "Maximum number of lines to return after offset. Omit or null = if remaining payload ≤~30KB return all remaining lines; if larger, return first ~30KB window + nextOffset (O9). Explicit limit keeps 1..10000 line window (MCP caps unchanged — not forced to 30KB). Meta also as trailing # MCP-META lines in summary."
        }
      }
    }
  },
  {
    "name": "find_by_keyword",
    "title": "Find By Keyword",
    "description": "WHAT: Search maps llms-keywords.txt (keyword → maps URL). q required. RETURNS matching keyword/url rows (clamped limit). USE for SEO/keyword → Gebiet page. DOES NOT search www keywords. NEXT: get_service_area / get_embed_map with the slug from the URL.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "q": {
          "type": "string",
          "description": "Required search string matched against keyword and URL (substring, case-insensitive)."
        },
        "limit": {
          "type": "integer",
          "minimum": 1,
          "description": "Maximum items or lines to return after offset. Omit = all remaining in the window (subject to tool-specific clamps). For geo near-search default is often 5 without radius_km, up to 52 with radius."
        },
        "locale": {
          "type": "string",
          "enum": [
            "de"
          ],
          "default": "de",
          "description": "maps is German-only (de). Omit or pass de. Other values are ignored; URLs stay https://maps.ikeytz.com/… with no locale prefix. Not a www multi-locale switch — use @ikeytz/mcp list_locales on www for en|fr|ru|fa|ar|tr."
        }
      },
      "required": [
        "q"
      ]
    }
  },
  {
    "name": "find_by_serp",
    "title": "Find By Serp",
    "description": "WHAT: Search maps llms-serp.txt blocks by q, path, url, or slug. RETURNS path/url/snippet items. DOCS/API: https://maps.ikeytz.com/llms-serp.txt (source catalog). USE for title/H1/description SERP cards on maps. DOES NOT scrape live HTML. NEXT: get_serp_snippet for one full block.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "q": {
          "type": "string",
          "description": "Free-text search in SERP blocks"
        },
        "path": {
          "type": "string",
          "description": "maps path fragment, e.g. /pattonville"
        },
        "url": {
          "type": "string",
          "description": "Full https://maps.ikeytz.com/… URL"
        },
        "slug": {
          "type": "string",
          "description": "Gebiet slug"
        },
        "limit": {
          "type": "integer",
          "minimum": 1,
          "description": "Maximum items or lines to return after offset. Omit = all remaining in the window (subject to tool-specific clamps). For geo near-search default is often 5 without radius_km, up to 52 with radius."
        }
      }
    }
  },
  {
    "name": "get_serp_snippet",
    "title": "Get Serp Snippet",
    "description": "WHAT: One SERP block from maps llms-serp.txt via path, url, slug, or q. RETURNS path, url, matchContext (full block). DOCS/API: https://maps.ikeytz.com/llms-serp.txt (one block from that file). USE for a single page's SERP copy. DOES NOT invent meta tags. NEXT: get_ai_page or get_page_summary for body.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "path": {
          "type": "string",
          "description": "maps path, e.g. /pattonville"
        },
        "url": {
          "type": "string",
          "description": "Full maps URL"
        },
        "slug": {
          "type": "string",
          "description": "Gebiet slug"
        },
        "q": {
          "type": "string",
          "description": "Fallback search string"
        }
      }
    }
  },
  {
    "name": "find_by_plz",
    "title": "Find By Plz",
    "description": "WHAT: All Einsatzgebiete with this PLZ (not only the first). plz required (or q as PLZ). RETURNS items[] point cards + count. USE when several Stadtteile share a postcode. NEXT: get_service_area(slug) for one card.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "plz": {
          "type": "string",
          "description": "Required German postcode."
        },
        "q": {
          "type": "string",
          "description": "Alias for plz if plz omitted"
        }
      },
      "required": [
        "plz"
      ]
    }
  },
  {
    "name": "find_by_geo",
    "title": "Find By Geo",
    "description": "WHAT: Rank Einsatzgebiete by lat/lng (or icbm). Optional radius_km; else nearest N (limit, default 5). (0,0) and far points → ok=false outside_service_area. RETURNS items with distance_km. USE for 'near this coordinate'. DOES NOT route or drive-time. NEXT: get_service_area, get_grenze, distance_to_office.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "lat": {
          "type": "number",
          "description": "WGS84 latitude. Required with lng unless icbm is set. (0,0) → outside_service_area."
        },
        "lng": {
          "type": "number",
          "description": "WGS84 longitude. Required with lat unless icbm is set."
        },
        "icbm": {
          "type": "string",
          "description": "ICBM or paste 'lat, lng' (comma-separated). Alternative to lat+lng."
        },
        "radius_km": {
          "type": "number",
          "description": "Optional air-radius filter in km. Omit = return nearest N (limit). Far points / (0,0) → outside_service_area."
        },
        "limit": {
          "type": "integer",
          "minimum": 1,
          "description": "Maximum items or lines to return after offset. Omit = all remaining in the window (subject to tool-specific clamps). For geo near-search default is often 5 without radius_km, up to 52 with radius."
        }
      }
    }
  },
  {
    "name": "find_by_icbm",
    "title": "Find By Icbm",
    "description": "WHAT: Rank Einsatzgebiete by an ICBM 'lat, lng' string (optional lat/lng, radius_km, limit). RETURNS items with distance_km. USE when the user pastes ICBM metadata. Prefer find_by_geo instead for plain lat/lng without an ICBM string. (0,0) and far points → ok=false outside_service_area. DOES NOT route or drive-time. NEXT: get_service_area, get_embed_map, get_grenze.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "icbm": {
          "type": "string",
          "description": "ICBM or paste 'lat, lng' (comma-separated). Alternative to lat+lng."
        },
        "lat": {
          "type": "number",
          "description": "WGS84 latitude. Required with lng unless icbm is set. (0,0) → outside_service_area."
        },
        "lng": {
          "type": "number",
          "description": "WGS84 longitude. Required with lat unless icbm is set."
        },
        "radius_km": {
          "type": "number",
          "description": "Optional air-radius filter in km. Omit = return nearest N (limit). Far points / (0,0) → outside_service_area."
        },
        "limit": {
          "type": "integer",
          "minimum": 1,
          "description": "Maximum items or lines to return after offset. Omit = all remaining in the window (subject to tool-specific clamps). For geo near-search default is often 5 without radius_km, up to 52 with radius."
        }
      }
    }
  },
  {
    "name": "find_by_gebiet",
    "title": "Find By Gebiet",
    "description": "WHAT: Multi-match Gebiete by q, name, or slug (substring, umlauts ok). RETURNS all matching point cards. USE for fuzzy place names. DOES NOT require exact slug. NEXT: get_service_area for one, or get_grenze.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "q": {
          "type": "string",
          "description": "Name or slug query (preferred)"
        },
        "name": {
          "type": "string",
          "description": "German place name substring (case-insensitive, umlauts ok), e.g. Grünbühl, Pattonville. Used when slug/plz omitted."
        },
        "slug": {
          "type": "string",
          "description": "URL slug of one of the 52 Einsatzgebiete, e.g. pattonville, bietigheim-bissingen, walheim, gruenbuehl. Matches https://maps.ikeytz.com/{slug}. Lookup order when combined with plz/name: slug first."
        }
      }
    }
  },
  {
    "name": "find_by_area",
    "title": "Find By Area",
    "description": "WHAT: Multi-match Einsatzgebiete by q, name, or slug (substring, umlauts ok). RETURNS all matching point cards. Same match rules as find_by_gebiet — prefer this name when the agent thinks in 'area' wording. USE for fuzzy place names. DOES NOT require an exact slug. Prefer find_by_plz for postcode-only queries. NEXT: get_service_area, get_embed_map.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "q": {
          "type": "string",
          "description": "Name or slug query"
        },
        "name": {
          "type": "string",
          "description": "German place name substring (case-insensitive, umlauts ok), e.g. Grünbühl, Pattonville. Used when slug/plz omitted."
        },
        "slug": {
          "type": "string",
          "description": "URL slug of one of the 52 Einsatzgebiete, e.g. pattonville, bietigheim-bissingen, walheim, gruenbuehl. Matches https://maps.ikeytz.com/{slug}. Lookup order when combined with plz/name: slug first."
        }
      }
    }
  },
  {
    "name": "list_slugs",
    "title": "List Slugs",
    "description": "WHAT: All 52 maps slugs as a flat string array. Call with {}. USE for validation or autocomplete. NEXT: get_service_area(slug), get_embed_map(slug).",
    "inputSchema": {
      "type": "object",
      "additionalProperties": false,
      "description": "This tool takes no arguments. Call tools/call with arguments: {}. Extra keys are ignored.",
      "properties": {}
    }
  },
  {
    "name": "list_plz",
    "title": "List Plz",
    "description": "WHAT: PLZ → slugs map for the 52 Gebiete (shared postcodes visible). Call with {}. RETURNS items[{plz,count,slugs}]. USE to see multi-Gebiet PLZ. NEXT: find_by_plz.",
    "inputSchema": {
      "type": "object",
      "additionalProperties": false,
      "description": "This tool takes no arguments. Call tools/call with arguments: {}. Extra keys are ignored.",
      "properties": {}
    }
  },
  {
    "name": "get_hub",
    "title": "Get Hub",
    "description": "WHAT: maps hub card https://maps.ikeytz.com/ — title/h1 + 52 Gebiet links (not a single Visitenkarte). Call with {}. USE as the maps landing overview. DOES NOT include www prices. NEXT: get_service_area, list_service_areas.",
    "inputSchema": {
      "type": "object",
      "additionalProperties": false,
      "description": "This tool takes no arguments. Call tools/call with arguments: {}. Extra keys are ignored.",
      "properties": {}
    }
  },
  {
    "name": "get_embed_map",
    "title": "Get Embed Map",
    "description": "WHAT: Canonical map page URL https://maps.ikeytz.com/{slug} for iframe/src and Visitenkarte. Lookup slug|plz|name. RETURNS area card + maps_nav + neighbors (MAPS-IL1/IL2) + canonicalUrl. USE for embedding or linking a Gebiet map. NEXT: get_geo_api, get_grenze, get_lage, get_service_area.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "slug": {
          "type": "string",
          "description": "URL slug of one of the 52 Einsatzgebiete, e.g. pattonville, bietigheim-bissingen, walheim, gruenbuehl. Matches https://maps.ikeytz.com/{slug}. Lookup order when combined with plz/name: slug first."
        },
        "plz": {
          "type": "string",
          "description": "German postcode (PLZ). Several Gebiete can share one PLZ (e.g. 71638). For single lookup first match wins; use find_by_plz for all matches."
        },
        "name": {
          "type": "string",
          "description": "German place name substring (case-insensitive, umlauts ok), e.g. Grünbühl, Pattonville. Used when slug/plz omitted."
        }
      }
    }
  },
  {
    "name": "get_geo_api",
    "title": "Get Geo Api",
    "description": "WHAT: Public Geo-API URL pointers for one Einsatzgebiet. Ort JSON: https://maps.ikeytz.com/api/v1/embed/ort/{slug}. Grenze GeoJSON: …/grenze. Punkt GeoJSON: …/punkt. Sammel: /api/v1/embed/orte · /orte/grenzen · /orte/punkte. Lookup slug|plz|name. RETURNS geo_api, grenze_api, punkt_api, Sammel URLs + area card; MCP payload is not the polygon. USE to fetch/open public JSON/GeoJSON. NEXT: get_grenze for polygon inside MCP, or GET grenze_api / punkt_api.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "slug": {
          "type": "string",
          "description": "URL slug of one of the 52 Einsatzgebiete, e.g. pattonville, bietigheim-bissingen, walheim, gruenbuehl. Matches https://maps.ikeytz.com/{slug}. Lookup order when combined with plz/name: slug first."
        },
        "plz": {
          "type": "string",
          "description": "German postcode (PLZ). Several Gebiete can share one PLZ (e.g. 71638). For single lookup first match wins; use find_by_plz for all matches."
        },
        "name": {
          "type": "string",
          "description": "German place name substring (case-insensitive, umlauts ok), e.g. Grünbühl, Pattonville. Used when slug/plz omitted."
        }
      }
    }
  },
  {
    "name": "get_grenze",
    "title": "Get Grenze",
    "description": "WHAT: OSM Gebietspolygon for one Einsatzgebiet as GeoJSON FeatureCollection inside the MCP result. Same geometry as public GET https://maps.ikeytz.com/api/v1/embed/ort/{slug}/grenze (application/geo+json). Lookup slug|plz|name. RETURNS hasPolygon, polygon, point, osmRelationId/osmWayId, via, grenze_api, punkt_api. USE when the agent needs the boundary geometry. DOES NOT replace get_geo_api (URL pointers) or get_grenze_koordinaten (full embed blob). NEXT: get_grenze_koordinaten, get_lage, get_embed_map.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "slug": {
          "type": "string",
          "description": "URL slug of one of the 52 Einsatzgebiete, e.g. pattonville, bietigheim-bissingen, walheim, gruenbuehl. Matches https://maps.ikeytz.com/{slug}. Lookup order when combined with plz/name: slug first."
        },
        "plz": {
          "type": "string",
          "description": "German postcode (PLZ). Several Gebiete can share one PLZ (e.g. 71638). For single lookup first match wins; use find_by_plz for all matches."
        },
        "name": {
          "type": "string",
          "description": "German place name substring (case-insensitive, umlauts ok), e.g. Grünbühl, Pattonville. Used when slug/plz omitted."
        }
      }
    }
  },
  {
    "name": "get_grenze_koordinaten",
    "title": "Get Grenze Koordinaten",
    "description": "WHAT: Full public Ort-Embed JSON for one Einsatzgebiet — same fields as GET https://maps.ikeytz.com/api/v1/embed/ort/{slug} (part=full): phone/NAP, style, point, featureCollection (Polygon+Punkt), OSM ids, embed paths (ort/grenze/punkt), iframe. Separate GeoJSON also at …/grenze and …/punkt; Sammel /api/v1/embed/orte/grenzen and /orte/punkte. No separate polygon/points keys (L-16). Lookup slug|plz|name. USE when the agent needs coordinates+boundary+NAP in one MCP call. DOES NOT change the HTTP embed API. DOES NOT replace slim get_grenze (polygon-only) or get_geo_api (URL pointers). NEXT: get_grenze, get_contact, get_embed_map.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "slug": {
          "type": "string",
          "description": "URL slug of one of the 52 Einsatzgebiete, e.g. pattonville, bietigheim-bissingen, walheim, gruenbuehl. Matches https://maps.ikeytz.com/{slug}. Lookup order when combined with plz/name: slug first."
        },
        "plz": {
          "type": "string",
          "description": "German postcode (PLZ). Several Gebiete can share one PLZ (e.g. 71638). For single lookup first match wins; use find_by_plz for all matches."
        },
        "name": {
          "type": "string",
          "description": "German place name substring (case-insensitive, umlauts ok), e.g. Grünbühl, Pattonville. Used when slug/plz omitted."
        }
      }
    }
  },
  {
    "name": "get_lage",
    "title": "Get Lage",
    "description": "WHAT: Returns Lage (location description) prose for one Einsatzgebiet Visitenkarte. Lookup slug|plz|name. RETURNS slug, name, lage. USE for human-readable geography prose. Prefer get_geschichte for place history; prefer get_service_area for the full point card/embed. DOES NOT return polygons.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "slug": {
          "type": "string",
          "description": "URL slug of one of the 52 Einsatzgebiete, e.g. pattonville, bietigheim-bissingen, walheim, gruenbuehl. Matches https://maps.ikeytz.com/{slug}. Lookup order when combined with plz/name: slug first."
        },
        "plz": {
          "type": "string",
          "description": "German postcode (PLZ). Several Gebiete can share one PLZ (e.g. 71638). For single lookup first match wins; use find_by_plz for all matches."
        },
        "name": {
          "type": "string",
          "description": "German place name substring (case-insensitive, umlauts ok), e.g. Grünbühl, Pattonville. Used when slug/plz omitted."
        }
      }
    }
  },
  {
    "name": "get_geschichte",
    "title": "Get Geschichte",
    "description": "WHAT: Geschichte (history) text for one Einsatzgebiet Visitenkarte. Lookup slug|plz|name. RETURNS slug, name, geschichte. USE for place history prose on the map page. NEXT: get_lage, get_ai_page.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "slug": {
          "type": "string",
          "description": "URL slug of one of the 52 Einsatzgebiete, e.g. pattonville, bietigheim-bissingen, walheim, gruenbuehl. Matches https://maps.ikeytz.com/{slug}. Lookup order when combined with plz/name: slug first."
        },
        "plz": {
          "type": "string",
          "description": "German postcode (PLZ). Several Gebiete can share one PLZ (e.g. 71638). For single lookup first match wins; use find_by_plz for all matches."
        },
        "name": {
          "type": "string",
          "description": "German place name substring (case-insensitive, umlauts ok), e.g. Grünbühl, Pattonville. Used when slug/plz omitted."
        }
      }
    }
  },
  {
    "name": "distance_to_office",
    "title": "Distance To Office",
    "description": "WHAT: Air distance (km) from a Gebiet (slug|plz|name) or lat/lng/icbm to the Gewerbesitz. walkIn=false. RETURNS from, office, distance_km. USE for rough proximity — not driving time. DOES NOT route via OSRM. NEXT: get_geo_office, find_by_geo.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "slug": {
          "type": "string",
          "description": "URL slug of one of the 52 Einsatzgebiete, e.g. pattonville, bietigheim-bissingen, walheim, gruenbuehl. Matches https://maps.ikeytz.com/{slug}. Lookup order when combined with plz/name: slug first."
        },
        "plz": {
          "type": "string",
          "description": "German postcode (PLZ). Several Gebiete can share one PLZ (e.g. 71638). For single lookup first match wins; use find_by_plz for all matches."
        },
        "name": {
          "type": "string",
          "description": "German place name substring (case-insensitive, umlauts ok), e.g. Grünbühl, Pattonville. Used when slug/plz omitted."
        },
        "lat": {
          "type": "number",
          "description": "Optional query latitude instead of place lookup"
        },
        "lng": {
          "type": "number",
          "description": "Optional query longitude"
        },
        "icbm": {
          "type": "string",
          "description": "Optional 'lat, lng' instead of place lookup"
        }
      }
    }
  },
  {
    "name": "resolve_maps_url",
    "title": "Resolve Maps Url",
    "description": "WHAT: Resolve a maps.ikeytz.com url/path/q to hub or Gebiet. RETURNS kind=hub|ort (+ area fields when ort). DOCS/API: https://maps.ikeytz.com/sitemap.txt (public URL list) and https://maps.ikeytz.com/{slug} (Gebiet pages). USE to normalize pasted maps links. Prefer get_service_area when you already have a known slug; prefer resolve_locale_url for locale rewriting. DOES NOT accept www hosts (not_maps_host). When multiple of url/path/q are set, url wins then path then q.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "url": {
          "type": "string",
          "description": "Full https://maps.ikeytz.com/… URL"
        },
        "path": {
          "type": "string",
          "description": "Path e.g. /pattonville"
        },
        "q": {
          "type": "string",
          "description": "URL or path alias"
        }
      }
    }
  },
  {
    "name": "find_by_google_maps",
    "title": "Find By Google Maps",
    "description": "WHAT: Paste Google Maps / ICBM coordinates (q or icbm or lat/lng) → nearest ikeytz Gebiete (same ranking as find_by_geo). (0,0) → outside_service_area. USE when the user pastes a Maps pin. NEXT: get_service_area, get_embed_map.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "q": {
          "type": "string",
          "description": "Paste string containing 'lat, lng'"
        },
        "icbm": {
          "type": "string",
          "description": "ICBM or paste 'lat, lng' (comma-separated). Alternative to lat+lng."
        },
        "lat": {
          "type": "number",
          "description": "WGS84 latitude. Required with lng unless icbm is set. (0,0) → outside_service_area."
        },
        "lng": {
          "type": "number",
          "description": "WGS84 longitude. Required with lat unless icbm is set."
        },
        "radius_km": {
          "type": "number",
          "description": "Optional air-radius filter in km. Omit = return nearest N (limit). Far points / (0,0) → outside_service_area."
        },
        "limit": {
          "type": "integer",
          "minimum": 1,
          "description": "Maximum items or lines to return after offset. Omit = all remaining in the window (subject to tool-specific clamps). For geo near-search default is often 5 without radius_km, up to 52 with radius."
        }
      }
    }
  },
  {
    "name": "get_legal",
    "title": "Get Legal",
    "description": "WHAT: Legal doc router. doc enum: urheberrecht|copyright|impressum (maps text via discovery) or agb|nutzungsbedingungen|datenschutz|widerruf (www URL pointer only). Optional offset/limit for maps text. USE for citations. DOES NOT serve www legal HTML body on maps. NEXT: get_urheberrecht / get_impressum shortcuts; www for AGB body.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "doc": {
          "type": "string",
          "enum": [
            "urheberrecht",
            "copyright",
            "impressum",
            "agb",
            "nutzungsbedingungen",
            "datenschutz",
            "widerruf"
          ],
          "description": "Required. maps corpus: urheberrecht|copyright|impressum. www links only: agb|nutzungsbedingungen|datenschutz|widerruf."
        },
        "offset": {
          "type": "integer",
          "minimum": 0,
          "default": 0,
          "description": "0-based index into a list or discovery file lines (split on \\n). 0 = first. Omit = 0. Combine with limit to page. Use nextOffset / offset+limit from a previous result when present."
        },
        "limit": {
          "type": "integer",
          "minimum": 1,
          "description": "Maximum items or lines to return after offset. Omit = all remaining in the window (subject to tool-specific clamps). For geo near-search default is often 5 without radius_km, up to 52 with radius."
        },
        "locale": {
          "type": "string",
          "enum": [
            "de"
          ],
          "default": "de",
          "description": "maps is German-only (de). Omit or pass de. Other values are ignored; URLs stay https://maps.ikeytz.com/… with no locale prefix. Not a www multi-locale switch — use @ikeytz/mcp list_locales on www for en|fr|ru|fa|ar|tr."
        }
      },
      "required": [
        "doc"
      ]
    }
  },
  {
    "name": "get_urheberrecht",
    "title": "Get Urheberrecht",
    "description": "WHAT: Returns Karten-Urheberrecht plain text from maps /llms-urheberrecht.txt (attribution: Mahmud Reza Kashani · ikeytz). Optional offset/limit. USE when citing map copyright in German. Prefer get_copyright for the English citation file; prefer get_legal(doc=urheberrecht) for the legal-doc router. DOES NOT return www HTML body.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "offset": {
          "type": "integer",
          "minimum": 0,
          "default": 0,
          "description": "0-based index into a list or discovery file lines (split on \\n). 0 = first. Omit = 0. Combine with limit to page. Use nextOffset / offset+limit from a previous result when present."
        },
        "limit": {
          "type": "integer",
          "minimum": 1,
          "maximum": 10000,
          "description": "Maximum number of lines to return after offset. Omit or null = if remaining payload ≤~30KB return all remaining lines; if larger, return first ~30KB window + nextOffset (O9). Explicit limit keeps 1..10000 line window (MCP caps unchanged — not forced to 30KB). Meta also as trailing # MCP-META lines in summary."
        }
      }
    }
  },
  {
    "name": "get_copyright",
    "title": "Get Copyright",
    "description": "WHAT: English map copyright text from maps /llms-copyright.txt. Optional offset/limit. USE for EN citations of map authorship. NEXT: get_urheberrecht.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "offset": {
          "type": "integer",
          "minimum": 0,
          "default": 0,
          "description": "0-based index into a list or discovery file lines (split on \\n). 0 = first. Omit = 0. Combine with limit to page. Use nextOffset / offset+limit from a previous result when present."
        },
        "limit": {
          "type": "integer",
          "minimum": 1,
          "maximum": 10000,
          "description": "Maximum number of lines to return after offset. Omit or null = if remaining payload ≤~30KB return all remaining lines; if larger, return first ~30KB window + nextOffset (O9). Explicit limit keeps 1..10000 line window (MCP caps unchanged — not forced to 30KB). Meta also as trailing # MCP-META lines in summary."
        }
      }
    }
  },
  {
    "name": "get_impressum",
    "title": "Get Impressum",
    "description": "WHAT: Impressum/Kontakt text from maps /llms-impressum-kontakt.txt. Optional offset/limit. USE for NAP/legal imprint on maps. NEXT: get_contact, get_business_identity; www /impressum for HTML.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "offset": {
          "type": "integer",
          "minimum": 0,
          "default": 0,
          "description": "0-based index into a list or discovery file lines (split on \\n). 0 = first. Omit = 0. Combine with limit to page. Use nextOffset / offset+limit from a previous result when present."
        },
        "limit": {
          "type": "integer",
          "minimum": 1,
          "maximum": 10000,
          "description": "Maximum number of lines to return after offset. Omit or null = if remaining payload ≤~30KB return all remaining lines; if larger, return first ~30KB window + nextOffset (O9). Explicit limit keeps 1..10000 line window (MCP caps unchanged — not forced to 30KB). Meta also as trailing # MCP-META lines in summary."
        }
      }
    }
  },
  {
    "name": "get_agb",
    "title": "Get Agb",
    "description": "WHAT: Returns only a URL to www.ikeytz.com/agb — not AGB clause text. USE when the user asks for AGB while on maps and you only need the link. Prefer www MCP get_legal(doc=agb) or www get_agb when you need the legal corpus. DOES NOT invent legal clauses.",
    "inputSchema": {
      "type": "object",
      "additionalProperties": false,
      "description": "This tool takes no arguments. Call tools/call with arguments: {}. Extra keys are ignored.",
      "properties": {}
    }
  },
  {
    "name": "get_nutzungsbedingungen",
    "title": "Get Nutzungsbedingungen",
    "description": "Returns only a maps HTML hand-off to www Nutzungsbedingungen. Does not return the terms body. USE when the user asks for Nutzungsbedingungen on maps; prefer www MCP for the corpus. DOES NOT invent clauses. NEXT: www get_nutzungsbedingungen / get_legal.",
    "inputSchema": {
      "type": "object",
      "additionalProperties": false,
      "description": "This tool takes no arguments. Call tools/call with arguments: {}. Extra keys are ignored.",
      "properties": {}
    }
  },
  {
    "name": "get_datenschutz",
    "title": "Get Datenschutz",
    "description": "WHAT: Returns only a URL to www Datenschutz — not the privacy-policy body. USE when the user asks for Datenschutz while on maps and you only need the link. Prefer www MCP get_datenschutz or get_legal for the corpus. DOES NOT invent privacy clauses.",
    "inputSchema": {
      "type": "object",
      "additionalProperties": false,
      "description": "This tool takes no arguments. Call tools/call with arguments: {}. Extra keys are ignored.",
      "properties": {}
    }
  },
  {
    "name": "get_widerruf",
    "title": "Get Widerruf",
    "description": "WHAT: Returns only a URL to www Widerruf — not withdrawal-policy text. USE when the user asks for Widerruf while on maps and you only need the link. Prefer www MCP get_widerruf or get_legal for the corpus. DOES NOT invent clauses.",
    "inputSchema": {
      "type": "object",
      "additionalProperties": false,
      "description": "This tool takes no arguments. Call tools/call with arguments: {}. Extra keys are ignored.",
      "properties": {}
    }
  },
  {
    "name": "site_overview",
    "title": "Site Overview",
    "description": "WHO/WHAT: What maps.ikeytz.com is — 52 Einsatzgebiet maps for Schlüsseldienst Ludwigsburg ikeytz, not the www price site. RETURNS brand, owner, count, mcp, registry, walkIn=false, sister www MCP note. USE as the maps brand card. DOES NOT quote euro. NEXT: get_business_identity, list_service_areas, get_links.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "locale": {
          "type": "string",
          "enum": [
            "de"
          ],
          "default": "de",
          "description": "maps is German-only (de). Omit or pass de. Other values are ignored; URLs stay https://maps.ikeytz.com/… with no locale prefix. Not a www multi-locale switch — use @ikeytz/mcp list_locales on www for en|fr|ru|fa|ar|tr."
        }
      }
    }
  },
  {
    "name": "get_business_identity",
    "title": "Get Business Identity",
    "description": "WHAT: Returns Inhaber, brand, legalName, hours, NAP, and office coords for LocalBusiness / impressum-grade facts on maps. Call with {} or locale=de. walkIn=false — mobile locksmith only. USE when you need the identity card (who owns the business, hours, legal name). Prefer get_contact for phone/email/WhatsApp CTAs; prefer get_geo_office for the /buero pin and embed; prefer get_impressum for the full imprint text file. DOES NOT update records or accept walk-in bookings.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "locale": {
          "type": "string",
          "enum": [
            "de"
          ],
          "default": "de",
          "description": "maps is German-only (de). Omit or pass de. Other values are ignored; URLs stay https://maps.ikeytz.com/… with no locale prefix. Not a www multi-locale switch — use @ikeytz/mcp list_locales on www for en|fr|ru|fa|ar|tr."
        }
      }
    }
  },
  {
    "name": "list_nav",
    "title": "List Nav",
    "description": "WHAT: maps navigation links — Hub, MCP, Urheberrecht, plus all 52 Gebiet URLs. USE to pick a maps page. DOES NOT include www header hubs (Preise/FAQ). NEXT: get_embed_map, get_page_summary.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "locale": {
          "type": "string",
          "enum": [
            "de"
          ],
          "default": "de",
          "description": "maps is German-only (de). Omit or pass de. Other values are ignored; URLs stay https://maps.ikeytz.com/… with no locale prefix. Not a www multi-locale switch — use @ikeytz/mcp list_locales on www for en|fr|ru|fa|ar|tr."
        }
      }
    }
  },
  {
    "name": "list_footer",
    "title": "List Footer",
    "description": "WHAT: maps footer links (Hub, MCP-Hub, MCP, mapsEmail mailto, Urheberrecht, Copyright, Impressum-Kontakt) plus www HTML legal links (no price corpus). RETURNS maps[], html_www[], email, mapsEmail. USE for footer/legal discovery. NEXT: get_legal, compose_mailto.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "locale": {
          "type": "string",
          "enum": [
            "de"
          ],
          "default": "de",
          "description": "maps is German-only (de). Omit or pass de. Other values are ignored; URLs stay https://maps.ikeytz.com/… with no locale prefix. Not a www multi-locale switch — use @ikeytz/mcp list_locales on www for en|fr|ru|fa|ar|tr."
        }
      }
    }
  },
  {
    "name": "list_locales",
    "title": "List Locales",
    "description": "WHAT: Locales on maps — only de (MAPS-E8: no /en). Call with {}. RETURNS items[{locale,url}]. USE before resolve_locale_url. DOES NOT list www's seven locales — use @ikeytz/mcp list_locales for those.",
    "inputSchema": {
      "type": "object",
      "additionalProperties": false,
      "description": "This tool takes no arguments. Call tools/call with arguments: {}. Extra keys are ignored.",
      "properties": {}
    }
  },
  {
    "name": "resolve_locale_url",
    "title": "Resolve Locale Url",
    "description": "WHAT: path + locale → maps URL. maps is de-only: non-de requested still yields https://maps.ikeytz.com{path} with locale=de. Known Gebiet paths resolve to maps; unknown paths may www-pointer. REQUIRED path and locale. DOES NOT create /en on maps. NEXT: get_embed_map, www resolve_locale_url for marketing locales.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "path": {
          "type": "string",
          "description": "Required. Path starting with / (e.g. /pattonville) or a maps URL."
        },
        "locale": {
          "type": "string",
          "description": "Required. Only de is meaningful on maps; others ignored with a note."
        }
      },
      "required": [
        "path",
        "locale"
      ]
    }
  },
  {
    "name": "get_prices",
    "title": "Get Prices",
    "description": "WHAT: Returns only a URL/note pointing to the Festpreis matrix on www.ikeytz.com/preise — no euro rows. USE to hand the agent from maps to www pricing. Prefer www MCP get_prices for the real matrix; call maps get_ort_datetime first if you need whenKey (day|night) for a later www invoice. DOES NOT invent prices or return totalEur.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "locale": {
          "type": "string",
          "enum": [
            "de"
          ],
          "default": "de",
          "description": "maps is German-only (de). Omit or pass de. Other values are ignored; URLs stay https://maps.ikeytz.com/… with no locale prefix. Not a www multi-locale switch — use @ikeytz/mcp list_locales on www for en|fr|ru|fa|ar|tr."
        }
      }
    }
  },
  {
    "name": "get_invoice_line_items",
    "title": "Get Invoice Line Items",
    "description": "WHAT: www pointer only — invoice line items are computed on www MCP. maps accepts situationKey/whenKey/breakdown for symmetry but returns html link to /preise, not totals. DOES NOT return totalEur. NEXT: @ikeytz/mcp get_invoice_line_items; get_ort_datetime here for Berlin clock/whenKey.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "situationKey": {
          "type": "string",
          "description": "Required for www. Situation id (opening_slam, opening_locked, pkg_key_*, cylinder_only, cylinder_mount, aliases)."
        },
        "whenKey": {
          "type": "string",
          "description": "day|night|now — used on www; maps only points."
        },
        "breakdown": {
          "type": "boolean",
          "description": "www flag; ignored for maps pointer payload."
        },
        "locale": {
          "type": "string",
          "enum": [
            "de"
          ],
          "default": "de",
          "description": "maps is German-only (de). Omit or pass de. Other values are ignored; URLs stay https://maps.ikeytz.com/… with no locale prefix. Not a www multi-locale switch — use @ikeytz/mcp list_locales on www for en|fr|ru|fa|ar|tr."
        }
      },
      "required": [
        "situationKey"
      ]
    }
  },
  {
    "name": "list_services",
    "title": "List Services",
    "description": "WHAT: Returns only a URL to www /leistungen — not Leistungs rows or prices. USE when the user asks for services while on maps and you only need the link. Prefer www MCP list_services for the real catalog. Optional locale (de|en|fr|ru|fa|ar|tr, default de) selects the www URL language only — it does not load service rows. DOES NOT invent service rows.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "locale": {
          "type": "string",
          "enum": [
            "de"
          ],
          "default": "de",
          "description": "maps is German-only (de). Omit or pass de. Other values are ignored; URLs stay https://maps.ikeytz.com/… with no locale prefix. Not a www multi-locale switch — use @ikeytz/mcp list_locales on www for en|fr|ru|fa|ar|tr."
        }
      }
    }
  },
  {
    "name": "get_emergency",
    "title": "Get Emergency",
    "description": "WHAT: Returns only a URL to the www Notfall-Türöffnung page — not a dispatch. USE for emergency lockout context on maps when you only need the link. Prefer maps get_contact or compose_tel_mobile for phone CTAs here; prefer www MCP get_emergency for the full Notfall body. Optional locale selects the www URL language only. DOES NOT dispatch technicians or claim a van was sent.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "locale": {
          "type": "string",
          "enum": [
            "de"
          ],
          "default": "de",
          "description": "maps is German-only (de). Omit or pass de. Other values are ignored; URLs stay https://maps.ikeytz.com/… with no locale prefix. Not a www multi-locale switch — use @ikeytz/mcp list_locales on www for en|fr|ru|fa|ar|tr."
        }
      }
    }
  },
  {
    "name": "list_auswahl",
    "title": "List Auswahl",
    "description": "WHAT: Returns only a URL to the www Auswahl hub (/auswahl) — not Auswahl items. USE when the user asks for the Auswahl overview on maps. Prefer www MCP list_auswahl for the real item list; prefer maps get_auswahl_item({slug}) only when a slug is known (still URL-only). Optional locale (de|en|fr|ru|fa|ar|tr, default de) selects the www URL language only — it does not list items. DOES NOT list items.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "locale": {
          "type": "string",
          "enum": [
            "de"
          ],
          "default": "de",
          "description": "maps is German-only (de). Omit or pass de. Other values are ignored; URLs stay https://maps.ikeytz.com/… with no locale prefix. Not a www multi-locale switch — use @ikeytz/mcp list_locales on www for en|fr|ru|fa|ar|tr."
        }
      }
    }
  },
  {
    "name": "get_auswahl_item",
    "title": "Get Auswahl Item",
    "description": "WHAT: Returns only a URL to www /auswahl/{slug} — not the Auswahl article body. slug required. USE when the user names a specific Auswahl slug on maps. Prefer list_auswahl for the hub link; prefer www MCP get_auswahl_item({slug}) when you need the full article. DOES NOT return article text.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "slug": {
          "type": "string",
          "description": "Required Auswahl slug on www"
        },
        "locale": {
          "type": "string",
          "enum": [
            "de"
          ],
          "default": "de",
          "description": "maps is German-only (de). Omit or pass de. Other values are ignored; URLs stay https://maps.ikeytz.com/… with no locale prefix. Not a www multi-locale switch — use @ikeytz/mcp list_locales on www for en|fr|ru|fa|ar|tr."
        }
      },
      "required": [
        "slug"
      ]
    }
  },
  {
    "name": "get_about",
    "title": "Get About",
    "description": "WHAT: About maps.ikeytz.com (same core card as site_overview — 52 maps, not www Über-uns corpus). USE for 'what is this host'. DOES NOT return www about body. NEXT: site_overview, get_links, get_business_identity.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "locale": {
          "type": "string",
          "enum": [
            "de"
          ],
          "default": "de",
          "description": "maps is German-only (de). Omit or pass de. Other values are ignored; URLs stay https://maps.ikeytz.com/… with no locale prefix. Not a www multi-locale switch — use @ikeytz/mcp list_locales on www for en|fr|ru|fa|ar|tr."
        }
      }
    }
  },
  {
    "name": "get_partner_info",
    "title": "Get Partner Info",
    "description": "Returns only a maps HTML hand-off to www Partner-werden (/partner-werden). Does not return partnerEmail corpus or submit the partner form. USE when the user asks about becoming a partner while on maps. Prefer www MCP get_partner_info if already connected to www. formSubmit=false — never claim a form was sent. NEXT: www get_partner_info; or maps compose_mailto after opening www.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "locale": {
          "type": "string",
          "enum": [
            "de"
          ],
          "default": "de",
          "description": "maps is German-only (de). Omit or pass de. Other values are ignored; URLs stay https://maps.ikeytz.com/… with no locale prefix. Not a www multi-locale switch — use @ikeytz/mcp list_locales on www for en|fr|ru|fa|ar|tr."
        }
      }
    }
  },
  {
    "name": "get_links",
    "title": "Get Links",
    "description": "WHAT: Returns the maps machine bookmark set of discovery URLs (hub, mcp, server-card, agent-skills, llms, registry search, npm @ikeytz/maps-mcp). USE to open known well-known endpoints by URL. Prefer get_discovery when you need file contents or line windows; prefer get_llms_txt for the primary llms index body. DOES NOT fetch discovery file bodies.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "locale": {
          "type": "string",
          "enum": [
            "de"
          ],
          "default": "de",
          "description": "maps is German-only (de). Omit or pass de. Other values are ignored; URLs stay https://maps.ikeytz.com/… with no locale prefix. Not a www multi-locale switch — use @ikeytz/mcp list_locales on www for en|fr|ru|fa|ar|tr."
        }
      }
    }
  },
  {
    "name": "get_review_url",
    "title": "Get Review Url",
    "description": "WHAT: Returns only a URL to www.ikeytz.com/review (Google-review entry page) — not a review payload. USE when the user asks where to leave a Google review while already on maps. Prefer www MCP get_review_url when connected to www for the canonical review-link payload. DOES NOT post a review.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "locale": {
          "type": "string",
          "enum": [
            "de"
          ],
          "default": "de",
          "description": "maps is German-only (de). Omit or pass de. Other values are ignored; URLs stay https://maps.ikeytz.com/… with no locale prefix. Not a www multi-locale switch — use @ikeytz/mcp list_locales on www for en|fr|ru|fa|ar|tr."
        }
      }
    }
  },
  {
    "name": "list_faq",
    "title": "List Faq",
    "description": "Returns only a maps HTML hand-off to www /faq. Does not return FAQ question rows or answers. USE for the FAQ hub on maps; use get_faq when an id/q is known (still a hand-off). Prefer www MCP list_faq / get_faq for real FAQ data. NEXT: www list_faq; maps get_faq.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "locale": {
          "type": "string",
          "enum": [
            "de"
          ],
          "default": "de",
          "description": "maps is German-only (de). Omit or pass de. Other values are ignored; URLs stay https://maps.ikeytz.com/… with no locale prefix. Not a www multi-locale switch — use @ikeytz/mcp list_locales on www for en|fr|ru|fa|ar|tr."
        }
      }
    }
  },
  {
    "name": "get_faq",
    "title": "Get Faq",
    "description": "Returns only a maps HTML hand-off to www /faq (optional id/q are for www symmetry, not answered here). Does not return the FAQ answer body. USE when the user asks one FAQ while on maps; use list_faq for the hub. Prefer www MCP get_faq({id}|{q}) for the real answer. NEXT: www get_faq.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "description": "FAQ id on www"
        },
        "q": {
          "type": "string",
          "description": "FAQ question search on www"
        },
        "locale": {
          "type": "string",
          "enum": [
            "de"
          ],
          "default": "de",
          "description": "maps is German-only (de). Omit or pass de. Other values are ignored; URLs stay https://maps.ikeytz.com/… with no locale prefix. Not a www multi-locale switch — use @ikeytz/mcp list_locales on www for en|fr|ru|fa|ar|tr."
        }
      }
    }
  },
  {
    "name": "list_wissen",
    "title": "List Wissen",
    "description": "WHAT: Returns only a URL to the www Wissen hub (/wissen) — not lexicon entries or article text. USE when the user asks for the Wissen overview on maps. Prefer www MCP list_wissen for the real index; prefer maps get_wissen_entry({id}) only as a URL hand-off for one id. DOES NOT list entries.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "locale": {
          "type": "string",
          "enum": [
            "de"
          ],
          "default": "de",
          "description": "maps is German-only (de). Omit or pass de. Other values are ignored; URLs stay https://maps.ikeytz.com/… with no locale prefix. Not a www multi-locale switch — use @ikeytz/mcp list_locales on www for en|fr|ru|fa|ar|tr."
        }
      }
    }
  },
  {
    "name": "get_wissen_entry",
    "title": "Get Wissen Entry",
    "description": "Returns only a maps HTML hand-off to www /wissen/{id}. id required. Does not return the Wissen article body. USE when the user names a Wissen id on maps; use list_wissen for the hub. Prefer www MCP get_wissen_entry for fulltext. NEXT: www get_wissen_entry({id}).",
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "description": "Required Wissen entry id"
        },
        "locale": {
          "type": "string",
          "enum": [
            "de"
          ],
          "default": "de",
          "description": "maps is German-only (de). Omit or pass de. Other values are ignored; URLs stay https://maps.ikeytz.com/… with no locale prefix. Not a www multi-locale switch — use @ikeytz/mcp list_locales on www for en|fr|ru|fa|ar|tr."
        }
      },
      "required": [
        "id"
      ]
    }
  },
  {
    "name": "list_ratgeber",
    "title": "List Ratgeber",
    "description": "WHAT: Returns only a URL to the www Ratgeber hub (/ratgeber) — not titles or article bodies. USE when the user asks for the Ratgeber overview on maps. Prefer www MCP list_ratgeber for the real list; prefer maps get_ratgeber({slug}) only when a slug is known (still URL-only). Optional locale (de|en|fr|ru|fa|ar|tr, default de) selects the www URL language only. DOES NOT list Ratgeber entries.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "locale": {
          "type": "string",
          "enum": [
            "de"
          ],
          "default": "de",
          "description": "maps is German-only (de). Omit or pass de. Other values are ignored; URLs stay https://maps.ikeytz.com/… with no locale prefix. Not a www multi-locale switch — use @ikeytz/mcp list_locales on www for en|fr|ru|fa|ar|tr."
        }
      }
    }
  },
  {
    "name": "get_ratgeber",
    "title": "Get Ratgeber",
    "description": "WHAT: Returns only a URL to www /ratgeber/{slug} — not the article body. slug required. USE when the user names a Ratgeber slug on maps. Prefer list_ratgeber for the hub link when the slug is unknown; prefer www MCP get_ratgeber for fulltext. DOES NOT return article text.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "slug": {
          "type": "string",
          "description": "Required Ratgeber slug"
        },
        "locale": {
          "type": "string",
          "enum": [
            "de"
          ],
          "default": "de",
          "description": "maps is German-only (de). Omit or pass de. Other values are ignored; URLs stay https://maps.ikeytz.com/… with no locale prefix. Not a www multi-locale switch — use @ikeytz/mcp list_locales on www for en|fr|ru|fa|ar|tr."
        }
      },
      "required": [
        "slug"
      ]
    }
  },
  {
    "name": "get_page_summary",
    "title": "Get Page Summary",
    "description": "WHAT: Short summary for a maps Gebiet (path/slug → area card) or www pointer for non-maps paths. path required (or slug). DOCS/API: https://maps.ikeytz.com/{slug} (HTML Visitenkarte) and https://maps.ikeytz.com/api/v1/embed/ort/{slug} (public embed JSON). USE to decide maps vs www. NEXT: get_ai_page, get_service_area.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "path": {
          "type": "string",
          "description": "Required. maps path (/pattonville) or www path for pointer fallback."
        },
        "slug": {
          "type": "string",
          "description": "Alias for path/slug"
        },
        "locale": {
          "type": "string",
          "enum": [
            "de"
          ],
          "default": "de",
          "description": "maps is German-only (de). Omit or pass de. Other values are ignored; URLs stay https://maps.ikeytz.com/… with no locale prefix. Not a www multi-locale switch — use @ikeytz/mcp list_locales on www for en|fr|ru|fa|ar|tr."
        }
      },
      "required": [
        "path"
      ]
    }
  },
  {
    "name": "get_ai_page",
    "title": "Get Ai Page",
    "description": "WHAT: Reads maps /ai-pages/de/{slug}.txt when the path is a maps Gebiet/ai-page; otherwise returns a www HTML hand-off for non-maps paths. path or slug. DOCS/API: https://maps.ikeytz.com/ai-pages/de/{slug}.txt (plain text corpus) and https://maps.ikeytz.com/{slug} (HTML). USE for agent-ready maps Gebiet prose — not for site-wide crawl policy (that is get_ai_txt). DOES NOT invent page bodies. NEXT: get_service_area, get_lage, get_ai_txt.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "path": {
          "type": "string",
          "description": "Path or ai-pages path fragment"
        },
        "slug": {
          "type": "string",
          "description": "Gebiet or ai-page slug"
        },
        "locale": {
          "type": "string",
          "enum": [
            "de"
          ],
          "default": "de",
          "description": "maps is German-only (de). Omit or pass de. Other values are ignored; URLs stay https://maps.ikeytz.com/… with no locale prefix. Not a www multi-locale switch — use @ikeytz/mcp list_locales on www for en|fr|ru|fa|ar|tr."
        }
      }
    }
  },
  {
    "name": "get_llms_txt",
    "title": "Get Llms Txt",
    "description": "WHAT: Alias get_discovery(which=llms) — maps /llms.txt 1:1 with optional offset/limit. USE as the primary maps machine index. NEXT: get_ai_txt, get_sitemap_txt, get_links.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "offset": {
          "type": "integer",
          "minimum": 0,
          "default": 0,
          "description": "0-based index into a list or discovery file lines (split on \\n). 0 = first. Omit = 0. Combine with limit to page. Use nextOffset / offset+limit from a previous result when present."
        },
        "limit": {
          "type": "integer",
          "minimum": 1,
          "maximum": 10000,
          "description": "Maximum number of lines to return after offset. Omit or null = if remaining payload ≤~30KB return all remaining lines; if larger, return first ~30KB window + nextOffset (O9). Explicit limit keeps 1..10000 line window (MCP caps unchanged — not forced to 30KB). Meta also as trailing # MCP-META lines in summary."
        }
      }
    }
  },
  {
    "name": "get_ai_txt",
    "title": "Get Ai Txt",
    "description": "WHAT: Alias get_discovery(which=ai-txt) — maps /.well-known/ai.txt 1:1. USE for crawl/train policy (ai-train=no). NEXT: get_llms_txt.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "offset": {
          "type": "integer",
          "minimum": 0,
          "default": 0,
          "description": "0-based index into a list or discovery file lines (split on \\n). 0 = first. Omit = 0. Combine with limit to page. Use nextOffset / offset+limit from a previous result when present."
        },
        "limit": {
          "type": "integer",
          "minimum": 1,
          "maximum": 10000,
          "description": "Maximum number of lines to return after offset. Omit or null = if remaining payload ≤~30KB return all remaining lines; if larger, return first ~30KB window + nextOffset (O9). Explicit limit keeps 1..10000 line window (MCP caps unchanged — not forced to 30KB). Meta also as trailing # MCP-META lines in summary."
        }
      }
    }
  },
  {
    "name": "get_sitemap_txt",
    "title": "Get Sitemap Txt",
    "description": "WHAT: Reads maps /sitemap.txt 1:1 (alias of get_discovery(which=sitemap-txt)); summary is a line window plus trailing # MCP-META. Optional offset/limit. USE to list public maps embed URLs including /buero. Prefer get_discovery for other discovery ids; prefer site_overview for the brand card, not a URL list. NEXT: resolve_maps_url, get_embed_map, get_geo_office.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "offset": {
          "type": "integer",
          "minimum": 0,
          "default": 0,
          "description": "0-based index into a list or discovery file lines (split on \\n). 0 = first. Omit = 0. Combine with limit to page. Use nextOffset / offset+limit from a previous result when present."
        },
        "limit": {
          "type": "integer",
          "minimum": 1,
          "maximum": 10000,
          "description": "Maximum number of lines to return after offset. Omit or null = if remaining payload ≤~30KB return all remaining lines; if larger, return first ~30KB window + nextOffset (O9). Explicit limit keeps 1..10000 line window (MCP caps unchanged — not forced to 30KB). Meta also as trailing # MCP-META lines in summary."
        }
      }
    }
  },
  {
    "name": "list_whatsapp_options",
    "title": "List Whatsapp Options",
    "description": "WHAT: WhatsApp situation options (link only). Same 12 contactOption ids as www: opening_slam_day|opening_slam_night|opening_locked_day|opening_locked_night|pkg_key_slam_day|pkg_key_slam_night|pkg_key_locked_day|pkg_key_locked_night|cylinder_only_day|cylinder_only_night|cylinder_mount|beratung. Deprecated aliases zugefallen|abgeschlossen|zylinder → *day* invoices. No form submit. USE before compose_whatsapp. DOES NOT send a message. NEXT: compose_whatsapp(option), compose_tel_mobile.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "locale": {
          "type": "string",
          "enum": [
            "de"
          ],
          "default": "de",
          "description": "maps is German-only (de). Omit or pass de. Other values are ignored; URLs stay https://maps.ikeytz.com/… with no locale prefix. Not a www multi-locale switch — use @ikeytz/mcp list_locales on www for en|fr|ru|fa|ar|tr."
        }
      }
    }
  },
  {
    "name": "compose_tel_mobile",
    "title": "Compose Tel Mobile",
    "description": "WHAT: tel: href for the public mobile number. Call with {}. RETURNS href + display. USE as the primary call CTA. DOES NOT place the call. NEXT: compose_tel_landline, list_whatsapp_options.",
    "inputSchema": {
      "type": "object",
      "additionalProperties": false,
      "description": "This tool takes no arguments. Call tools/call with arguments: {}. Extra keys are ignored.",
      "properties": {}
    }
  },
  {
    "name": "compose_tel_landline",
    "title": "Compose Tel Landline",
    "description": "WHAT: tel: href for the public landline. Call with {}. RETURNS href + display. USE as secondary call CTA. NEXT: compose_tel_mobile.",
    "inputSchema": {
      "type": "object",
      "additionalProperties": false,
      "description": "This tool takes no arguments. Call tools/call with arguments: {}. Extra keys are ignored.",
      "properties": {}
    }
  },
  {
    "name": "compose_whatsapp",
    "title": "Compose Whatsapp",
    "description": "WHAT: wa.me link with prefab. option = one of 12 www contactOption ids (opening_slam_day … cylinder_only_night, cylinder_mount, beratung). Deprecated aliases zugefallen|abgeschlossen|zylinder map to *day* and set ambiguous=true — prefer explicit day/night ids. Omit → bare wa.me. Unknown → ok:false unknown_option + hint ids. Link only — no form. USE to open WhatsApp with a prefab. NEXT: compose_mailto, get_contact.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "option": {
          "type": "string",
          "description": "Optional situation id from list_whatsapp_options (12 www ids; aliases deprecated). Unknown → ok:false."
        }
      }
    }
  },
  {
    "name": "compose_mailto",
    "title": "Compose Mailto",
    "description": "WHAT: Returns mailto:info@ikeytz.com and mapsEmail info@maps.ikeytz.com (mapsHref). Call with {}. USE for email CTAs. Prefer compose_whatsapp or compose_tel_mobile when the user wants chat or a phone call instead. DOES NOT send mail.",
    "inputSchema": {
      "type": "object",
      "additionalProperties": false,
      "description": "This tool takes no arguments. Call tools/call with arguments: {}. Extra keys are ignored.",
      "properties": {}
    }
  }
];

export const TOOL_NAMES: string[] = TOOLS.map((t) => t.name);
