import type { RootContent } from "mdast"
import { remark } from "remark"
import remarkMdx from "remark-mdx"

import type {
  ComponentDefinition,
  ComponentVariant,
  FrameworkVariant,
  MutationDefinition,
  MutationExample,
  TypeReference
} from "./types.ts"

const parser = remark().use(remarkMdx)

function element(
  name: string,
  attributes: Record<string, string | number>
): RootContent {
  const props = Object.entries(attributes)
    .map(
      ([key, value]) =>
        `${key}=${typeof value === "number" ? `{${value}}` : JSON.stringify(value)}`
    )
    .join(" ")
  return parser.parse(`<${name} ${props} />`).children[0]
}

function heading(value: string): RootContent {
  return { type: "heading", depth: 2, children: [{ type: "text", value }] }
}

function code(
  value: string,
  lang = "tsx",
  meta: string | null = null
): RootContent {
  return { type: "code", lang, meta, value }
}

function typeTable(reference: TypeReference): RootContent {
  const separator = reference.lastIndexOf("#")
  if (separator <= 0 || separator === reference.length - 1) {
    throw new Error(`Invalid type reference: ${reference}`)
  }
  return element("type-table", {
    path: reference.slice(0, separator),
    name: reference.slice(separator + 1)
  })
}

export function mutationExample(
  definition: MutationDefinition,
  variant: FrameworkVariant,
  section: "usage" | "options",
  example: MutationExample = {}
): string {
  if ("code" in example) return example.code
  const kind = example.kind ?? (section === "usage" ? "hook" : "factory")
  const binding = example.binding ?? "mutation"
  const args =
    example.args ??
    (example.clientType
      ? `\n  authClient as ${example.clientType}\n`
      : "authClient")
  const suffix = definition.plugin ? `/plugins/${definition.plugin}` : ""
  const queryHook = example.queryHook ?? "useMutation"
  const client = example.client ?? (variant === "react" ? "import" : "provided")
  const action = definition.name
  const hook = `use${action[0].toUpperCase()}${action.slice(1)}`
  const call =
    example.call ??
    (kind === "hook" && /^[A-Za-z_$][\w$]*$/.test(binding)
      ? `${binding}.mutate(/* params */)`
      : false)
  const imports =
    kind === "hook"
      ? [
          ...(example.clientType
            ? [
                `import type { ${example.clientType} } from "@better-auth-ui/core${suffix}"`
              ]
            : []),
          ...(client === "import"
            ? ['import { authClient } from "@/lib/auth-client"']
            : []),
          ...(client === "context"
            ? [`import { useAuth } from "@better-auth-ui/${variant}"`]
            : []),
          `import { ${hook} } from "@better-auth-ui/${variant}${suffix}"`
        ]
      : [
          `import { ${action}Options } from "@better-auth-ui/core${suffix}"`,
          ...(kind === "factory"
            ? [`import { ${queryHook} } from "@tanstack/${variant}-query"`]
            : [])
        ]
  const expression =
    kind === "hook"
      ? `${hook}(${args})`
      : kind === "options"
        ? `${action}Options(${args})`
        : `${queryHook}(${variant === "solid" ? "() => " : ""}${action}Options(${args}))`
  const setup =
    kind === "hook" && client === "context"
      ? "const { authClient } = useAuth()\n"
      : ""
  return `${imports.join("\n")}\n\n${setup}const ${binding} = ${expression}${call ? `\n\n${call}` : ""}`
}

export type ReadSlot = (name: string) => RootContent[]

export function mutationPage(
  definition: MutationDefinition,
  variant: FrameworkVariant,
  slot: ReadSlot
): RootContent[] {
  const nodes: RootContent[] = []
  const examples = definition[variant] ?? {}
  for (const section of ["usage", "options"] as const) {
    const example = examples[section]
    if (example === false) continue
    nodes.push(
      heading(section === "usage" ? "Usage" : "Options factory"),
      ...slot(`${section}:before`),
      code(
        mutationExample(definition, variant, section, example),
        example?.lang ?? "tsx"
      ),
      ...slot(section)
    )
  }
  nodes.push(
    heading("Params"),
    ...slot("params:before"),
    typeTable(definition.params),
    ...slot("params")
  )
  return nodes
}

const componentRoots: Record<
  ComponentVariant,
  { demo: string; props: string }
> = {
  heroui: {
    demo: "<rootDir>/src/demos/heroui/",
    props: "packages/heroui/src/components/"
  },
  shadcn: {
    demo: "<rootDir>/src/demos/shadcn/",
    props: "examples/start-shadcn-example/src/components/"
  },
  zaidan: {
    demo: "<rootDir>/../../examples/start-solid-zaidan-example/src/demos/",
    props: "examples/start-solid-zaidan-example/src/components/"
  }
}

export function componentPage(
  id: string,
  definition: ComponentDefinition,
  variant: ComponentVariant,
  slot: ReadSlot
): RootContent[] {
  const overrides = definition[variant] ?? {}
  const item = id.slice(id.lastIndexOf("/") + 1)
  const email = definition.kind === "email"
  const roots = email
    ? {
        demo: `<rootDir>/src/demos/${variant}/`,
        props: `packages/${variant === "zaidan" ? "solid" : "react"}/src/components/`
      }
    : componentRoots[variant]
  const nodes: RootContent[] = []
  if (definition.usage !== false) {
    const demo =
      overrides.demo ??
      (typeof definition.demo === "string"
        ? `${roots.demo}${definition.demo}`
        : definition.demo)
    if (!demo) throw new Error(`${id}: missing ${variant} demo`)
    const preview =
      overrides.preview ??
      (definition.preview === false
        ? false
        : variant === "zaidan" && !email
          ? definition.story && { kind: "story" as const, ...definition.story }
          : { kind: "inline" as const, name: `${variant}-${item}` })
    if (preview === undefined)
      throw new Error(`${id}: missing ${variant} preview`)
    nodes.push(heading("Usage"), ...slot("usage:before"))
    if (preview)
      nodes.push(
        preview.kind === "inline"
          ? element("ComponentPreview", { name: preview.name })
          : element("ZaidanStory", {
              storyId: preview.id,
              title: preview.title,
              height: preview.height
            })
      )
    nodes.push(
      ...slot("example:before"),
      typeof demo === "string"
        ? code("", "tsx", `file=${demo}`)
        : code(demo.code),
      ...slot("usage")
    )
  }
  const registry = overrides.registry ?? definition.registry ?? item
  if (variant !== "heroui" && registry !== false) {
    const target =
      variant === "shadcn"
        ? `@better-auth-ui/${registry}`
        : `https://better-auth-ui.com/r/solid/${registry}.json`
    const installation = [
      heading("Installation"),
      ...slot("installation:before"),
      code(`npx shadcn@latest add ${target}`, "npm"),
      ...slot("installation")
    ]
    if (definition.installation === "before-usage")
      nodes.unshift(...installation)
    else nodes.push(...installation)
  }
  const props = overrides.props ?? `${roots.props}${definition.props}`
  nodes.push(
    ...slot("beforeProps"),
    heading("Props"),
    ...slot("props:before"),
    typeTable(props),
    ...slot("props")
  )
  return nodes
}
