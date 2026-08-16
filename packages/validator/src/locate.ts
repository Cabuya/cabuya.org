/**
 * JSON parsing that preserves line/column for error locations (message rule
 * M1: locate precisely). Hand-rolled rather than dependency-added — the core
 * keeps its dependency count to one (Ajv), because every dependency is
 * supply-chain surface on a tool other people run against their own
 * infrastructure.
 */

export interface ParseResult<T = unknown> {
  ok: boolean;
  value?: T;
  error?: string;
  /** Line/column of the parse error, 1-indexed. */
  location?: { line: number; column: number };
}

/** Convert a character offset into a 1-indexed line/column. */
function offsetToLocation(
  text: string,
  offset: number
): { line: number; column: number } {
  const upto = text.slice(0, offset);
  const lines = upto.split('\n');
  return {
    line: lines.length,
    column: (lines[lines.length - 1]?.length ?? 0) + 1,
  };
}

/**
 * Locate a JSON parse failure.
 *
 * V8's message format is not stable across versions: older engines emit
 * `at position N`, some emit `line N column M`, and Node 24 emits a quoted
 * snippet instead (`Unexpected token ',', ..."b": ,..." is not valid JSON`).
 * All three are handled, snippet-search last, so a location is reported
 * wherever the runtime makes one recoverable — and `undefined` (rather than
 * a wrong line) when it does not.
 */
function locateParseError(
  text: string,
  message: string
): { line: number; column: number } | undefined {
  const position = /position (\d+)/.exec(message)?.[1];
  if (position !== undefined) return offsetToLocation(text, Number(position));

  const lineCol = /line (\d+) column (\d+)/.exec(message);
  if (lineCol?.[1] && lineCol[2]) {
    return { line: Number(lineCol[1]), column: Number(lineCol[2]) };
  }

  // Node 24 snippet form: the quoted fragment appears verbatim in the input.
  const snippet = /"((?:[^"\\]|\\.)*)"(?:\.\.\.)? is not valid JSON/.exec(
    message
  )?.[1];
  if (snippet) {
    const cleaned = snippet
      .replace(/^\.\.\./, '')
      .replace(/\.\.\.$/, '')
      .replace(/\\n/g, '\n')
      .replace(/\\"/g, '"');
    const index = text.indexOf(cleaned);
    if (index !== -1) return offsetToLocation(text, index);
  }

  return undefined;
}

export function parseJson<T = unknown>(text: string): ParseResult<T> {
  try {
    return { ok: true, value: JSON.parse(text) as T };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      ok: false,
      error: message,
      location: locateParseError(text, message),
    };
  }
}

/**
 * Resolve a JSON Pointer (RFC 6901) to a line/column in the original text.
 *
 * Best-effort and documented as such: it walks the raw text looking for the
 * pointer's terminal key at the right nesting depth. Good enough to put a
 * developer's cursor on the right line; never used for anything semantic.
 */
export function locatePointer(
  text: string,
  pointer: string
): { line: number; column: number } | undefined {
  const segments = pointer.split('/').filter(Boolean);
  const key = segments[segments.length - 1];
  if (!key || /^\d+$/.test(key)) return undefined;
  const needle = `"${key.replace(/~1/g, '/').replace(/~0/g, '~')}"`;
  const index = text.indexOf(needle);
  if (index === -1) return undefined;
  const upto = text.slice(0, index);
  const lines = upto.split('\n');
  return {
    line: lines.length,
    column: (lines[lines.length - 1]?.length ?? 0) + 1,
  };
}

/** Build a JSON Pointer from path segments, escaping per RFC 6901. */
export function pointer(...segments: (string | number)[]): string {
  if (segments.length === 0) return '';
  return `/${segments
    .map((s) => String(s).replace(/~/g, '~0').replace(/\//g, '~1'))
    .join('/')}`;
}
