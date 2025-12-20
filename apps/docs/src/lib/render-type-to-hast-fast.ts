type HastNode =
  | { type: "text"; value: string }
  | {
      type: "element"
      tagName: string
      properties?: Record<string, unknown>
      children?: HastNode[]
    }

function hastText(value: string): HastNode {
  return { type: "text", value }
}

function hastShikiSpan(value: string, light: string, dark: string): HastNode {
  return {
    type: "element",
    tagName: "span",
    // Fumadocs styles `.shiki code span { color: var(--shiki-light) }`
    // and `.dark .shiki code span { color: var(--shiki-dark) }`
    properties: { style: `--shiki-light: ${light}; --shiki-dark: ${dark};` },
    children: [hastText(value)]
  }
}

/**
 * Fast-ish TypeScript type "highlighting".
 *
 * This is intentionally not Shiki-level accurate; it's built to be:
 * - fast (no WASM / grammars / themes)
 * - readable (basic token coloring)
 * - stable (deterministic output)
 *
 * IMPORTANT: This renderer must keep memory usage low because the MDX compiler
 * embeds its output into an ESTree object literal for `TypeTable` props.
 */
export async function renderTypeToHastFast(type: string): Promise<HastNode> {
  const keywords = new Set([
    "type",
    "interface",
    "extends",
    "keyof",
    "infer",
    "readonly",
    "in",
    "as",
    "is",
    "asserts",
    "never",
    "unknown",
    "any",
    "void",
    "object"
  ])

  const builtins = new Set([
    "string",
    "number",
    "boolean",
    "null",
    "undefined",
    "bigint",
    "symbol",
    "Date",
    "RegExp",
    "Promise",
    "Array",
    "ReadonlyArray",
    "Record",
    "Partial",
    "Required",
    "Pick",
    "Omit",
    "Exclude",
    "Extract",
    "NonNullable",
    "Parameters",
    "ReturnType",
    "InstanceType",
    "Awaited",
    "Map",
    "Set",
    "ReadonlyMap",
    "ReadonlySet"
  ])

  // Only wrap "interesting" tokens to keep the AST tiny (memory-safe).
  // Everything else stays as plain text.
  const tokenRe =
    /"([^"\\]|\\.)*"|'([^'\\]|\\.)*'|`([^`\\]|\\.)*`|\||&|\b\d+(?:\.\d+)?\b|\b[A-Za-z_$][A-Za-z0-9_$]*\b/g

  const out: HastNode[] = []
  let last = 0

  for (const match of type.matchAll(tokenRe)) {
    const index = match.index ?? 0
    if (index > last) out.push(hastText(type.slice(last, index)))

    const tok = match[0]
    if (tok[0] === '"' || tok[0] === "'" || tok[0] === "`") {
      // GitHub-like Shiki colors (light/dark)
      out.push(hastShikiSpan(tok, "#032F62", "#9ECBFF"))
    } else if (tok === "|" || tok === "&") {
      out.push(hastShikiSpan(tok, "#D73A49", "#F97583"))
    } else if (/^\d/.test(tok)) {
      out.push(hastShikiSpan(tok, "#005CC5", "#79B8FF"))
    } else if (tok === "true" || tok === "false") {
      out.push(hastShikiSpan(tok, "#005CC5", "#79B8FF"))
    } else if (keywords.has(tok)) {
      out.push(hastShikiSpan(tok, "#D73A49", "#F97583"))
    } else if (builtins.has(tok)) {
      out.push(hastShikiSpan(tok, "#005CC5", "#79B8FF"))
    } else {
      // leave identifiers as plain text (saves a *lot* of nodes)
      out.push(hastText(tok))
    }

    last = index + tok.length
  }

  if (last < type.length) out.push(hastText(type.slice(last)))

  return {
    type: "element",
    tagName: "span",
    properties: { className: "shiki" },
    children: [
      {
        type: "element",
        tagName: "code",
        properties: { style: "font-variant-ligatures:none" },
        children: out
      }
    ]
  }
}
