# Profile: Core

The conformance floor for L2. A `Core` feed is the manifest (§2) plus at
least one `places` feed whose every record carries the required set:

| Field | Why it is required (§ ref) |
|---|---|
| `id` (`{publisher_id}:{local_id}` resolvable) | Zero-coordination global identity (§5.1) |
| `publisher_id` | Provenance root (§5.1) |
| `name` | Human identity — with **no operational-state tokens** (CR-2, §3.1) |
| `place_kind` | The shared vocabulary the crosswalks target (vocab/) |
| Locator: `address_text` OR `lat`+`lon` | A place you cannot locate directs no one (§3.1); both RECOMMENDED |
| `public_url` | Link-out is the contact mechanism (§7.2) |
| `source{}` with `source_id` | Attribution and chains (§4.3) |
| `last_confirmed_at` **key** (null legal) | The honest freshness floor (§6.1) |

Envelope requirements: `last_updated`, `ttl`, `version`, `publisher_id`,
`license` (+ CORS `*` on the transport). See §3.1.

Everything in Core is validator-checkable — that is the §8.2 editorial rule
working as intended.
