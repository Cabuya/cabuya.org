# Profile: Extended

Everything in Core, plus the optional depth fields reserved in the schema:
capacity (`capacity`, `occupancy`), needs summaries, opening hours, media,
and `institutional_contact` (org-owned numbers ONLY — §7.2 still binds;
personal contact never travels under any profile).

A publisher declares its profile per feed in the manifest (`feeds[].profile`).
The validator measures Extended fields only when declared — an absent
Extended field is never a Core failure.

## How a shared extension set becomes a profile

1. Publishers converge on `x_{publisher}_{field}` extensions in the wild
   (§8.4 guarantees they validate).
2. When ≥ 2 publishers ship the same shape, an RFC proposes it as a named
   profile with a versioned public URI.
3. Acceptance follows the standard RFC rules; the fields move from `x_`
   namespace to the profile's schema in the next MINOR.
