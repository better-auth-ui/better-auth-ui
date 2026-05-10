export type SolidRegistryFile = {
  path: `src/${string}`
  type: "registry:component" | "registry:lib" | "registry:file"
}

export type SolidRegistryItem = {
  name: string
  type: "registry:component" | "registry:lib"
  title: string
  description: string
  dependencies: string[]
  registryDependencies: string[]
  files: SolidRegistryFile[]
}

export type SolidRegistryManifest = {
  name: string
  namespace: "solid"
  homepage: string
  items: SolidRegistryItem[]
}

const solidDependencies = [
  "@better-auth-ui/solid@latest",
  "@better-auth-ui/core@latest",
  "@tanstack/solid-query",
  "better-auth",
  "solid-js"
]

export const solidRegistryManifest = {
  name: "better-auth-ui-solid",
  namespace: "solid",
  homepage: "https://better-auth-ui.com",
  items: [
    {
      name: "auth-provider",
      type: "registry:component",
      title: "Solid Auth Provider",
      description:
        "Solid provider wrapper for Better Auth UI using Solid Query and the Solid package surface.",
      dependencies: solidDependencies,
      registryDependencies: [],
      files: [
        {
          path: "src/components/auth/auth-provider.tsx",
          type: "registry:component"
        }
      ]
    },
    {
      name: "sign-in",
      type: "registry:component",
      title: "Solid Sign In",
      description:
        "Minimal Solid sign-in component wired to the Solid Better Auth UI provider.",
      dependencies: solidDependencies,
      registryDependencies: ["solid/auth-provider"],
      files: [
        {
          path: "src/components/auth/sign-in.tsx",
          type: "registry:component"
        }
      ]
    }
  ]
} satisfies SolidRegistryManifest
