export type FrameworkVariant = "react" | "solid"
export type ComponentVariant = "heroui" | "shadcn" | "zaidan"
export type TypeReference = `${string}#${string}`

export type MutationExample = { lang?: "ts" | "tsx" } & (
  | {
      kind?: "hook" | "factory" | "options"
      client?: "import" | "context" | "provided"
      clientType?: string
      binding?: string
      args?: string
      call?: string | false
      queryHook?: "useMutation" | "createMutation"
    }
  | { code: string }
)

export interface MutationExamples {
  usage?: MutationExample | false
  options?: MutationExample | false
}

export interface MutationDefinition {
  name: string
  params: TypeReference
  plugin?: string
  react?: MutationExamples
  solid?: MutationExamples
}

export type ComponentPreview =
  | { kind: "inline"; name: string }
  | { kind: "story"; id: string; title: string; height: number }

export interface ComponentOverrides {
  demo?: string | { code: string }
  props?: TypeReference
  preview?: ComponentPreview | false
  registry?: string | false
}

export interface ComponentDefinition {
  kind?: "component" | "email"
  /** Source and exported type, relative to each platform's component directory. */
  props: TypeReference
  /** File and optional line selector, relative to each platform's demo directory. */
  demo?: string | { code: string }
  usage?: false
  preview?: false
  registry?: string | false
  installation?: "before-usage"
  story?: { id: string; title: string; height: number }
  heroui?: ComponentOverrides
  shadcn?: ComponentOverrides
  zaidan?: ComponentOverrides
}
