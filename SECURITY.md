# Security policy

How to report a vulnerability in the Cabuya Protocol, its validator, its website
or its agent skill — and what we will do with it.

The engineering detail behind these commitments is in
[`docs/SECURITY.md`](docs/SECURITY.md): the threat model, the SSRF control set
on `/api/validate`, and the secret inventory. This file is the part you need in
order to report something.

---

## Reporting

**Open a [private security advisory](https://github.com/Cabuya/cabuya.org/security/advisories/new)
on the affected repository.** It is visible only to repository administrators,
it does not create a public issue, and it gives us a place to answer you.

Do not open a public issue for a vulnerability. Do not post it in a chat
channel. Both are understandable instincts and both publish the problem before
there is a fix.

Write in Spanish or English — whichever you think in. Both get the same
response.

## What we commit to

| | |
|---|---|
| **Acknowledgement** | Within **48 hours**, naming who is handling it |
| **First assessment** | Within **7 days** — severity, whether we can reproduce it, and what we intend to do |
| **Disclosure window** | **90 days** from acknowledgement, or sooner if a fix ships sooner |
| **Credit** | Named in the advisory if you want it, anonymous if you prefer |

**Coordinated disclosure.** We will not ask you to stay quiet indefinitely. If
we have not fixed something in 90 days, publish — the window exists to give a
fix time to reach adopters, not to bury a finding. If a fix needs longer for a
reason we can explain, we will ask, and you are free to say no.

## What is in scope

- **`/api/validate`** — the one endpoint that fetches URLs a stranger supplies.
  This is the highest-value target in the project and the place to look first.
  Its controls, and their documented limits, are in
  [`docs/SECURITY.md`](docs/SECURITY.md).
- **The badge and registry endpoints** — anything that lets a party write or
  influence a measured conformance state they do not own.
- **The validator package** (`@cabuya/validator`) — including anything that
  makes it unsafe to run against a hostile document.
- **The agent skill** — anything that makes it write, exfiltrate or execute
  something the adopter did not consent to.
- **The website** — injection, and anything that turns a static site into a
  vector.

### Especially interesting

Two classes of finding matter more here than the CVSS score suggests:

**Anything that gets person-level data into the protocol.** The join prohibition
is the project's central promise, and a path that lets place data be combined
with person-level data — in the reference tooling, in the schema, in the MCP
mapping — is a serious finding even if it requires unusual conditions.

**Anything that lets a false conformance state be published.** The badge's only
value is that it cannot flatter anybody. A way to make it say `conforming` for a
feed that is not is a security bug, not a cosmetic one.

## What is out of scope

- **Findings against a publisher's own application.** The registry lists
  independent teams; their software is theirs. Report it to them. If you cannot
  find a channel, tell us and we will pass it on.
- **Missing headers with no demonstrated impact**, and scanner output without a
  reproduction.
- **Denial of service through volume.** The endpoints are rate-limited and
  cached; a report that they can be overwhelmed by enough traffic is not
  actionable here.
- **Social engineering of maintainers**, and physical access.

## Supported versions

The specification supports up to two MAJOR versions at a time, and producers get
180 days on a MAJOR bump. For the code: **only the latest release is
supported.** There is no backport branch, and pretending otherwise would be a
maintenance promise the project cannot keep.

## Our own commitments

Three properties this project holds itself to, so a reviewer can check them
rather than trust them:

1. **The validator endpoint retains nothing.** No document body, no URL logged,
   no analytics event carrying anything a publisher submitted. Enforced by a
   build gate that greps for the ways state escapes, not only by design.
2. **No secret is ever required by a conforming implementation.** Nothing in the
   protocol needs an API key, a callback or a central lookup. A feed is valid
   whether or not anything of ours is running.
3. **Everything that could be a security decision is documented as one** —
   including the limits. The SSRF guard cannot resolve DNS from a Cloudflare
   Worker, that residual risk is real, and it is written down rather than
   implied.
