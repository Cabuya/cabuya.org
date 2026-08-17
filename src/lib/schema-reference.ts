/**
 * Turns a JSON Schema into a field-by-field reference table.
 *
 * Generated, never hand-written. A reference page maintained by hand drifts
 * from the schema the validator actually enforces, and the drift is invisible
 * until someone builds against the page and the validator rejects them — at
 * which point the documentation has cost them more than it saved.
 *
 * The generator is deliberately unclever. It walks `properties`, follows
 * `items` for arrays, resolves local `$ref`s into `$defs`, and stops. Anything
 * it cannot express — `oneOf` branches, conditional subschemas — is surfaced as
 * a note rather than silently flattened, because a table that quietly omits a
 * constraint is worse than a table that says it cannot show one.
 */

export interface SchemaField {
  /** Dotted path as an implementer would write it: `data.places[].name`. */
  path: string;
  /** Leaf name, for display emphasis. */
  name: string;
  /** Nesting depth, for indentation. */
  depth: number;
  type: string;
  required: boolean;
  description?: string;
  enumValues?: string[];
  format?: string;
  pattern?: string;
  /** `core` when the field is required or in the core profile; else `extended`. */
  profile: 'core' | 'extended';
  /** Anything the table cannot express, stated rather than dropped. */
  notes: string[];
}

type Json = Record<string, unknown>;

const isObject = (value: unknown): value is Json =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** Render a JSON Schema `type` for a human: `string`, `string | null`, `object`. */
function renderType(node: Json): string {
  const type = node.type;
  if (Array.isArray(type)) return type.join(' | ');
  if (typeof type === 'string') return type;
  if (node.enum) return 'enum';
  if (node.$ref) return 'object';
  return 'any';
}

/** Follow a local `#/$defs/Name` reference. Remote refs are left alone. */
function resolveRef(root: Json, node: Json): Json {
  const ref = node.$ref;
  if (typeof ref !== 'string' || !ref.startsWith('#/')) return node;
  const path = ref.slice(2).split('/');
  let current: unknown = root;
  for (const segment of path) {
    if (!isObject(current)) return node;
    current = current[segment];
  }
  return isObject(current) ? { ...current, ...node, $ref: undefined } : node;
}

function collectNotes(node: Json): string[] {
  const notes: string[] = [];
  if (node.oneOf) notes.push('One of several shapes — see the schema source.');
  if (node.anyOf) notes.push('Any of several shapes — see the schema source.');
  if (node.allOf) notes.push('Composed of several schemas.');
  if (node.if || node.then)
    notes.push('Conditional: constraints depend on other fields.');
  if (node.additionalProperties === false) {
    notes.push('No additional properties: unknown keys are rejected.');
  }
  if (typeof node.minimum === 'number') notes.push(`Minimum ${node.minimum}.`);
  if (typeof node.maxItems === 'number')
    notes.push(`At most ${node.maxItems} items.`);
  if (typeof node.minItems === 'number')
    notes.push(`At least ${node.minItems} items.`);
  return notes;
}

/**
 * Walk a schema into a flat, ordered field list.
 *
 * Depth is capped because a reference table deeper than three levels stops
 * being a table. Beyond it, the entry says so and points at the schema.
 */
export function schemaFields(
  schema: Json,
  { maxDepth = 3 }: { maxDepth?: number } = {}
): SchemaField[] {
  const out: SchemaField[] = [];

  const walk = (node: Json, path: string, depth: number): void => {
    const resolved = resolveRef(schema, node);

    if (resolved.type === 'array' && isObject(resolved.items)) {
      walk(resolved.items, `${path}[]`, depth);
      return;
    }

    const properties = resolved.properties;
    if (!isObject(properties)) return;
    const required = new Set(
      Array.isArray(resolved.required) ? (resolved.required as string[]) : []
    );

    for (const [name, rawChild] of Object.entries(properties)) {
      if (!isObject(rawChild)) continue;
      const child = resolveRef(schema, rawChild);
      const childPath = path ? `${path}.${name}` : name;
      const isRequired = required.has(name);

      const notes = collectNotes(child);
      const goesDeeper =
        isObject(child.properties) ||
        (child.type === 'array' && isObject(child.items));
      if (goesDeeper && depth + 1 > maxDepth) {
        notes.push('Nested further — see the schema source.');
      }

      out.push({
        path: childPath,
        name,
        depth,
        type: renderType(child),
        required: isRequired,
        description:
          typeof child.description === 'string' ? child.description : undefined,
        enumValues: Array.isArray(child.enum)
          ? (child.enum as unknown[]).map(String)
          : undefined,
        format: typeof child.format === 'string' ? child.format : undefined,
        pattern: typeof child.pattern === 'string' ? child.pattern : undefined,
        // Required fields are core by definition. Optional ones are extended
        // unless the schema says otherwise — a conservative default, since
        // over-claiming "core" would tell an implementer to build more than
        // conformance needs.
        profile: isRequired ? 'core' : 'extended',
        notes,
      });

      if (goesDeeper && depth + 1 <= maxDepth) {
        walk(child, childPath, depth + 1);
      }
    }
  };

  walk(schema, '', 0);
  return out;
}

/** An example value for a field, pulled from a real example document. */
export function exampleValueFor(
  example: unknown,
  path: string
): string | undefined {
  const segments = path.split('.');
  let current: unknown = example;

  for (const segment of segments) {
    const isArray = segment.endsWith('[]');
    const key = isArray ? segment.slice(0, -2) : segment;
    if (!isObject(current)) return undefined;
    current = current[key];
    if (isArray) {
      if (!Array.isArray(current) || current.length === 0) return undefined;
      current = current[0];
    }
  }

  if (current === undefined) return undefined;
  if (current === null) return 'null';
  if (typeof current === 'object') {
    // An object or array value is shown as its shape, not its contents: the
    // point of the column is "what does one look like", and a nested blob
    // pushes the useful columns off the screen.
    return Array.isArray(current) ? `[…${current.length}]` : '{…}';
  }
  return JSON.stringify(current);
}
