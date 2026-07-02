/// <reference types="node" />

import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync
} from "node:fs"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"
import { afterEach, describe, expect, it } from "vitest"
import {
  type SolidRegistryManifest,
  solidRegistryManifest
} from "../registry.manifest"
import {
  buildSolidRegistry,
  verifySolidRegistryCoherence
} from "../scripts/build-registry"

const tempRoots: string[] = []

const solidRegistryUrl = (name: string) =>
  `https://better-auth-ui.com/r/solid/${name}.json`

const makeTempRoot = () => {
  const root = join(tmpdir(), `solid-registry-${crypto.randomUUID()}`)
  tempRoots.push(root)
  mkdirSync(root, { recursive: true })
  return root
}

const parseJson = <T>(source: string, path: string) => {
  try {
    return JSON.parse(source) as T
  } catch (error) {
    throw new Error(`Invalid JSON in ${path}`, { cause: error })
  }
}

const readJson = <T>(path: string) =>
  parseJson<T>(readFileSync(path, "utf8"), path)

const collectFiles = (root: string): string[] =>
  readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const path = join(root, entry.name)

    return entry.isDirectory() ? collectFiles(path) : [path]
  })

const expectDocsPagesExist = (sectionRoot: string, pages: string[]) => {
  for (const page of pages) {
    if (page.startsWith("---")) {
      continue
    }

    const mdxPath = resolve(sectionRoot, `${page}.mdx`)
    const indexPath = resolve(sectionRoot, page, "index.mdx")
    const metaPath = resolve(sectionRoot, page, "meta.json")

    expect(
      existsSync(mdxPath) || existsSync(indexPath) || existsSync(metaPath),
      `Expected docs page for ${page} under ${sectionRoot}`
    ).toBe(true)
  }
}

const docsRouteToFileCandidates = (docsRoot: string, route: string) => {
  const cleanRoute = route.split("#")[0]?.replace(/\/$/, "") ?? route
  const relativeRoute = cleanRoute.replace(/^\/docs\/?/, "") || "index"

  return [
    resolve(docsRoot, `${relativeRoute}.mdx`),
    resolve(docsRoot, relativeRoute, "index.mdx"),
    resolve(docsRoot, relativeRoute, "meta.json")
  ]
}

const extractLocalDocsLinks = (content: string) => {
  const markdownLinks = [
    ...content.matchAll(/\[[^\]]+\]\((\/docs\/[^)\s]+)\)/g)
  ].map(([, href]) => href)
  const hrefLinks = [...content.matchAll(/href="(\/docs\/[^"]+)"/g)].map(
    ([, href]) => href
  )

  return [...markdownLinks, ...hrefLinks]
}

const extractSolidRegistryLinks = (content: string) =>
  [
    ...content.matchAll(
      /https:\/\/better-auth-ui\.com\/r\/solid\/([a-z0-9-]+\.json)/g
    )
  ].map(([, item]) => item)

const extractFrontmatterTitle = (content: string) =>
  content.match(/^title:\s*(.+)$/m)?.[1]

const extractLevelTwoHeadings = (content: string) =>
  [...content.matchAll(/^##\s+(.+)$/gm)].map(([, heading]) => heading)

const expectedSolidRegistryPayloadNames = [
  "auth-provider",
  "additional-field",
  "sign-in",
  "sign-up",
  "magic-link",
  "username",
  "passkey",
  "api-key",
  "forgot-password",
  "reset-password",
  "verify-email",
  "sign-out",
  "auth",
  "user-button",
  "user-avatar",
  "user-view",
  "user-profile",
  "account-settings",
  "security-settings",
  "settings",
  "active-sessions",
  "linked-accounts",
  "change-password",
  "change-email",
  "email-verification-email",
  "magic-link-email",
  "reset-password-email",
  "password-changed-email",
  "email-changed-email",
  "otp-email",
  "new-device-email",
  "organization-invitation-email",
  "delete-user",
  "multi-session",
  "organization",
  "theme"
]

const verifyLocalRegistryCoherence = () =>
  verifySolidRegistryCoherence({
    exampleRoot: resolve(__dirname, ".."),
    manifest: solidRegistryManifest,
    repoRoot: resolve(__dirname, "../../..")
  })

const extractCssBlock = (css: string, selector: string) => {
  const start = css.indexOf(`${selector} {`)
  expect(start, `Expected ${selector} block`).toBeGreaterThanOrEqual(0)

  const bodyStart = css.indexOf("{", start) + 1
  const end = css.indexOf("\n}", bodyStart)
  expect(end, `Expected ${selector} block end`).toBeGreaterThan(bodyStart)

  return css.slice(bodyStart, end).trim()
}

const extractCssDeclarations = (css: string, selector: string) =>
  extractCssBlock(css, selector)
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("--"))

const extractCssImports = (css: string) =>
  css
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("@import"))

describe("Solid registry isolation", () => {
  afterEach(() => {
    for (const root of tempRoots.splice(0)) {
      rmSync(root, { force: true, recursive: true })
    }
  })

  it("declares Solid-only registry metadata without React or shadcn dependencies", () => {
    expect(solidRegistryManifest.name).toBe("better-auth-ui-solid")
    expect(solidRegistryManifest.namespace).toBe("solid")

    const dependencies = solidRegistryManifest.items.flatMap(
      (item) => item.dependencies
    )
    expect(dependencies).toContain("@better-auth-ui/solid@latest")
    expect(dependencies).toContain("solid-js")
    expect(dependencies).toContain("@tanstack/solid-query")
    expect(dependencies).toContain("lucide-solid")
    expect(dependencies).not.toContain("@better-auth-ui/react@latest")
    expect(dependencies).toContain("solid-sonner")
    expect(dependencies).not.toContain("sonner")
    expect(
      dependencies.every((dependency) => !dependency.includes("react"))
    ).toBe(true)
  })

  it("exposes registry payloads for implemented Solid auth surfaces", () => {
    expect(solidRegistryManifest.items.map((item) => item.name)).toEqual(
      expectedSolidRegistryPayloadNames
    )

    const signInPayload = solidRegistryManifest.items.find(
      (item) => item.name === "sign-in"
    )
    expect(signInPayload?.files.map((file) => file.path)).toEqual(
      expect.arrayContaining([
        "src/components/auth/sign-in.tsx",
        "src/components/auth/username/sign-in-username.tsx",
        "src/components/auth/sign-in-path.ts",
        "src/components/auth/provider-button.tsx",
        "src/components/auth/provider-buttons.tsx"
      ])
    )
  })

  it("keeps the example scaffold on TanStack Start Solid instead of React Start", () => {
    const packageJson = readJson<{
      dependencies: Record<string, string>
      devDependencies: Record<string, string>
      scripts: Record<string, string>
    }>(resolve(__dirname, "../package.json"))
    const viteConfig = readFileSync(
      resolve(__dirname, "../vite.config.ts"),
      "utf8"
    )

    expect(packageJson.dependencies).toMatchObject({
      "@tanstack/solid-query": expect.any(String),
      "@tanstack/solid-router": expect.any(String),
      "@tanstack/solid-start": expect.any(String),
      "solid-js": expect.any(String)
    })
    expect(packageJson.dependencies).not.toHaveProperty("@tanstack/react-start")
    expect(packageJson.dependencies).not.toHaveProperty("react")
    expect(packageJson.dependencies).not.toHaveProperty("react-dom")
    expect(packageJson.scripts).toMatchObject({
      build: "vite build",
      dev: "vite dev",
      registry: "bun run registry:build",
      "registry:build": "bun scripts/build-registry.ts"
    })

    expect(viteConfig).toContain("@tanstack/solid-start/plugin/vite")
    expect(viteConfig).toContain("vite-plugin-solid")
    expect(viteConfig).toContain(
      'dedupe: ["solid-js", "solid-js/store", "solid-js/web"]'
    )
    expect(viteConfig).toContain('noExternal: ["@better-auth-ui/solid"]')
    expect(viteConfig).not.toContain("@tanstack/react-start")
    expect(viteConfig).not.toContain("@vitejs/plugin-react")
  })

  it("declares the Zaidan shadcn setup and Tailwind v4 globals", () => {
    const componentsJson = readJson<{
      aliases: Record<string, string>
      registries: Record<string, string>
      rsc: boolean
      style: string
      tailwind: {
        baseColor: string
        config: string
        css: string
        cssVariables: boolean
        prefix: string
      }
      iconLibrary: string
      menuAccent: string
      menuColor: string
      rtl: boolean
      tsx: boolean
    }>(resolve(__dirname, "../components.json"))
    const packageJson = readJson<{
      dependencies: Record<string, string>
      devDependencies: Record<string, string>
    }>(resolve(__dirname, "../package.json"))
    const viteConfig = readFileSync(
      resolve(__dirname, "../vite.config.ts"),
      "utf8"
    )
    const rootRoute = readFileSync(
      resolve(__dirname, "../src/routes/__root.tsx"),
      "utf8"
    )
    const globals = readFileSync(
      resolve(__dirname, "../src/styles/globals.css"),
      "utf8"
    )

    expect(componentsJson).toMatchObject({
      style: "kobalte",
      rsc: false,
      tsx: true,
      tailwind: {
        config: "",
        css: "src/styles/globals.css",
        baseColor: "neutral",
        cssVariables: true,
        prefix: ""
      },
      iconLibrary: "lucide",
      rtl: false,
      aliases: {
        components: "@/components",
        utils: "@/lib/utils",
        ui: "@/components/ui",
        lib: "@/lib",
        hooks: "@/hooks"
      },
      menuColor: "default",
      menuAccent: "subtle",
      registries: {
        "@zaidan": "https://zaidan.carere.dev/r/{style}/{name}.json"
      }
    })
    expect(packageJson.dependencies).toMatchObject({
      "@kobalte/core": expect.any(String),
      "class-variance-authority": expect.any(String),
      clsx: expect.any(String),
      "tailwind-merge": expect.any(String)
    })
    expect(packageJson.devDependencies).toMatchObject({
      "@tailwindcss/vite": expect.any(String),
      tailwindcss: expect.any(String)
    })
    expect(viteConfig).toContain('import tailwindcss from "@tailwindcss/vite"')
    expect(viteConfig).toContain("tailwindcss()")
    expect(rootRoute).toContain('import "../styles/globals.css"')
    expect(globals).toContain('@import "tailwindcss"')
  })

  it("sets up Zaidan Sonner as the Solid toast surface", () => {
    const packageJson = readJson<{
      dependencies: Record<string, string>
    }>(resolve(__dirname, "../package.json"))
    const manifestDependencies = solidRegistryManifest.items.flatMap(
      (item) => item.dependencies
    )
    const toaster = readFileSync(
      resolve(__dirname, "../src/components/ui/sonner.tsx"),
      "utf8"
    )
    const providers = readFileSync(
      resolve(__dirname, "../src/components/providers.tsx"),
      "utf8"
    )
    const authProvider = readFileSync(
      resolve(__dirname, "../src/components/auth/auth-provider.tsx"),
      "utf8"
    )
    const errorToaster = readFileSync(
      resolve(__dirname, "../src/components/auth/error-toaster.tsx"),
      "utf8"
    )

    expect(packageJson.dependencies).toHaveProperty("solid-sonner")
    expect(manifestDependencies).toContain("solid-sonner")
    expect(manifestDependencies).toContain("lucide-solid")
    expect(toaster).toContain('from "solid-sonner"')
    expect(toaster).toContain('position="top-center"')
    expect(toaster).toContain('class="toaster group"')
    expect(toaster).toContain('"--normal-bg": "var(--popover)"')
    expect(toaster).toContain("CircleCheck")
    expect(toaster).toContain("LoaderCircle")
    expect(providers).toContain('from "./ui/sonner"')
    expect(providers).toContain("<Toaster />")
    expect(authProvider).toContain('from "./error-toaster"')
    expect(authProvider).toContain("<ErrorToaster />")
    expect(errorToaster).toContain('import { toast } from "solid-sonner"')
    expect(errorToaster).toContain("useQueryClient")
    expect(errorToaster).toContain("toast.error")
  })

  it("keeps auth children evaluation inside the Solid auth provider context", () => {
    const authProvider = readFileSync(
      resolve(__dirname, "../src/components/auth/auth-provider.tsx"),
      "utf8"
    )

    expect(authProvider).toContain("const resolveProviderChildren")
    expect(authProvider).toContain("const { children, ...config } = props")
    expect(authProvider).toContain("resolveProviderChildren(children)")
    expect(authProvider).toContain("{() => (")
    expect(authProvider).toContain("<ErrorToaster />")
  })

  it("shares the shadcn token and global CSS contract", () => {
    const shadcnGlobals = readFileSync(
      resolve(__dirname, "../../start-shadcn-example/src/styles/app.css"),
      "utf8"
    )
    const solidGlobals = readFileSync(
      resolve(__dirname, "../src/styles/globals.css"),
      "utf8"
    )
    const packageJson = readJson<{
      dependencies: Record<string, string>
    }>(resolve(__dirname, "../package.json"))

    expect(extractCssImports(solidGlobals).slice(0, 5)).toEqual(
      extractCssImports(shadcnGlobals).slice(0, 5)
    )
    expect(extractCssBlock(solidGlobals, "@theme inline")).toBe(
      extractCssBlock(shadcnGlobals, "@theme inline")
    )
    expect(extractCssDeclarations(solidGlobals, ":root")).toEqual(
      extractCssDeclarations(shadcnGlobals, ":root")
    )
    expect(extractCssDeclarations(solidGlobals, ".dark")).toEqual(
      extractCssDeclarations(shadcnGlobals, ".dark")
    )
    expect(solidGlobals).toContain("@layer base")
    expect(solidGlobals).toContain("@apply border-border outline-ring/50")
    expect(solidGlobals).toContain("@apply bg-background text-foreground")
    expect(solidGlobals).toContain("@apply font-sans")
    expect(packageJson.dependencies).toMatchObject({
      "@fontsource-variable/geist": expect.any(String),
      "@fontsource-variable/inter": expect.any(String),
      shadcn: expect.any(String)
    })
  })

  it("keeps Solid primitive metrics aligned with the shadcn class contract", () => {
    const solidBase = readFileSync(
      resolve(__dirname, "../src/styles/base.css"),
      "utf8"
    )
    const shadcnButton = readFileSync(
      resolve(
        __dirname,
        "../../start-shadcn-example/src/components/ui/button.tsx"
      ),
      "utf8"
    )
    const shadcnInput = readFileSync(
      resolve(
        __dirname,
        "../../start-shadcn-example/src/components/ui/input.tsx"
      ),
      "utf8"
    )
    const shadcnCard = readFileSync(
      resolve(
        __dirname,
        "../../start-shadcn-example/src/components/ui/card.tsx"
      ),
      "utf8"
    )
    const shadcnSeparator = readFileSync(
      resolve(
        __dirname,
        "../../start-shadcn-example/src/components/ui/separator.tsx"
      ),
      "utf8"
    )
    const solidButton = readFileSync(
      resolve(__dirname, "../src/components/ui/button.tsx"),
      "utf8"
    )
    const solidInput = readFileSync(
      resolve(__dirname, "../src/components/ui/input.tsx"),
      "utf8"
    )
    const solidCard = readFileSync(
      resolve(__dirname, "../src/components/ui/card.tsx"),
      "utf8"
    )
    const solidDropdown = readFileSync(
      resolve(__dirname, "../src/components/ui/dropdown-menu.tsx"),
      "utf8"
    )
    const solidSeparator = readFileSync(
      resolve(__dirname, "../src/components/ui/separator.tsx"),
      "utf8"
    )

    expect(solidButton).toContain('data-slot="button"')
    expect(solidButton).toContain("z-button-size-default")
    expect(shadcnButton).toContain("rounded-lg border border-transparent")
    expect(solidBase).toContain("rounded-lg border border-transparent")
    expect(solidBase).toContain(".z-button-size-default")
    expect(solidBase).toContain("@apply h-8 gap-1.5 px-2.5")
    expect(solidBase).toContain(".z-button-size-lg")
    expect(solidBase).toContain("@apply h-9 gap-1.5 px-2.5")
    expect(solidBase).toContain(".z-button-user-icon-trigger")
    expect(solidBase).toContain("rounded-full border-0")
    expect(shadcnButton).toContain(
      "border-border bg-background hover:bg-muted hover:text-foreground"
    )
    expect(solidBase).toContain(
      "border-border bg-background hover:bg-muted hover:text-foreground"
    )
    expect(
      extractCssBlock(solidBase, ".z-button-variant-outline")
    ).not.toContain("shadow-xs")

    expect(solidInput).toContain('data-slot="input"')
    expect(solidBase).toContain(".z-input")
    expect(shadcnInput).toContain(
      "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1"
    )
    expect(solidBase).toContain(
      "h-8 rounded-lg border bg-transparent px-2.5 py-1 text-base transition-colors"
    )
    expect(solidBase).toContain(
      "file:h-6 file:text-sm file:font-medium file:text-foreground"
    )
    expect(solidBase).toContain(
      "disabled:bg-input/50 dark:disabled:bg-input/80"
    )
    expect(solidBase).not.toContain(
      "h-9 rounded-md border bg-transparent px-2.5 py-1 text-base shadow-xs"
    )

    expect(solidCard).toContain('data-slot="card"')
    expect(solidBase).toContain(".z-card")
    expect(shadcnCard).toContain(
      "gap-4 overflow-hidden rounded-xl bg-card py-4 text-sm"
    )
    expect(solidBase).toContain("gap-4 overflow-hidden rounded-xl py-4 text-sm")
    expect(solidBase).toContain("data-[size=sm]:gap-3")
    expect(solidBase).toContain(".z-card-header")
    expect(solidBase).toContain("gap-1 rounded-t-xl px-4")
    expect(solidBase).toContain(".z-card-content")
    expect(solidBase).toContain("px-4 group-data-[size=sm]/card:px-3")

    expect(solidSeparator).toContain('data-slot="separator"')
    expect(shadcnSeparator).toContain("shrink-0 bg-border")
    expect(solidSeparator).toContain("bg-border")
    expect(solidSeparator).toContain("data-[orientation=horizontal]:h-px")
    expect(solidSeparator).toContain("data-[orientation=vertical]:self-stretch")
    expect(solidSeparator).not.toContain("data-[orientation=vertical]:h-full")

    expect(solidDropdown).toContain('data-slot="dropdown-menu-content"')
    expect(solidBase).toContain(".z-dropdown-menu-content")
    expect(solidBase).toContain("min-w-32 rounded-lg p-1 shadow-md")
    expect(solidBase).toContain(".z-dropdown-menu-item")
    expect(solidBase).toContain("gap-1.5 rounded-md px-1.5 py-1 text-sm")
    expect(solidBase).toContain(".z-dropdown-menu-item-auth")
    expect(solidBase).toContain("gap-2 px-2.5 py-2")
    expect(solidBase).toContain(".z-dropdown-menu-label")
    expect(solidBase).toContain("px-1.5 py-1 text-xs font-medium")
    expect(solidBase).toContain(".z-dropdown-menu-separator")
    expect(solidBase).toContain("bg-border -mx-1 my-1 h-px")

    const solidUserButton = readFileSync(
      resolve(__dirname, "../src/components/auth/user/user-button.tsx"),
      "utf8"
    )
    expect(solidUserButton).toContain(
      '"w-[--kb-popper-anchor-width] min-w-40 md:min-w-56 max-w-[48svw] rounded-lg bg-popover p-1 text-popover-foreground shadow-md"'
    )
    expect(solidUserButton).not.toContain("rounded-lg border bg-popover")
  })

  it("guards existing Zaidan auth styling important modifiers", () => {
    const authRoot = resolve(__dirname, "../src/components/auth")
    const expectedImportantClassTokens = {} satisfies Record<string, string[]>
    const extractStringLiteralValues = (content: string) => {
      const values: string[] = []
      let index = 0

      while (index < content.length) {
        const quote = content[index]

        if (quote !== '"' && quote !== "'" && quote !== "`") {
          index += 1
          continue
        }

        let value = ""
        index += 1

        while (index < content.length) {
          const character = content[index]

          if (character === "\\") {
            value += content.slice(index, index + 2)
            index += 2
            continue
          }

          if (character === quote) break

          value += character
          index += 1
        }

        values.push(value)
        index += 1
      }

      return values
    }
    const isImportantClassToken = (token: string) => {
      if (/[={}()?;]/.test(token)) return false
      if (token === "!important") return false
      if (token.startsWith("!")) return token.slice(1).includes("-")
      if (token.includes(":!")) return token.includes("-")
      if (token.endsWith("!")) return token.slice(0, -1).includes("-")

      return false
    }
    const actualImportantClassTokens = Object.fromEntries(
      collectFiles(authRoot)
        .filter((path) => path.endsWith(".tsx"))
        .map((path) => {
          const relativePath = path
            .replace(resolve(__dirname, ".."), "")
            .replace(/^\//, "")
          const tokens = extractStringLiteralValues(
            readFileSync(path, "utf8")
          ).flatMap((value) =>
            value
              .trim()
              .split(/\s+/)
              .filter((token) => isImportantClassToken(token))
          )

          return [relativePath, tokens] as const
        })
        .filter(([, tokens]) => tokens.length > 0)
    )

    expect(actualImportantClassTokens).toEqual(expectedImportantClassTokens)
  })

  it("uses upstream Zaidan UI primitive dependencies in registry payloads", () => {
    const uiFiles = [
      "src/components/ui/button.tsx",
      "src/components/ui/card.tsx",
      "src/components/ui/input.tsx",
      "src/components/ui/label.tsx",
      "src/lib/utils.ts"
    ]
    const upstreamFormUiDependencies = [
      "@zaidan/button",
      "@zaidan/card",
      "@zaidan/input",
      "@zaidan/label"
    ]
    const formAuthFiles = [
      {
        path: "src/components/auth/username/sign-in-username.tsx",
        imports: [
          'from "@/components/ui/button"',
          'from "@/components/ui/card"'
        ]
      },
      {
        path: "src/components/auth/sign-up.tsx",
        imports: [
          'from "@/components/ui/button"',
          'from "@/components/ui/card"',
          'from "@/components/ui/input"',
          'from "@/components/ui/label"'
        ]
      },
      {
        path: "src/components/auth/forgot-password.tsx",
        imports: [
          'from "@/components/ui/button"',
          'from "@/components/ui/card"',
          'from "@/components/ui/input"',
          'from "@/components/ui/label"'
        ]
      },
      {
        path: "src/components/auth/reset-password.tsx",
        imports: [
          'from "@/components/ui/button"',
          'from "@/components/ui/card"',
          'from "@/components/ui/input"',
          'from "@/components/ui/label"'
        ]
      }
    ]

    for (const file of uiFiles) {
      expect(existsSync(resolve(__dirname, "..", file))).toBe(true)
    }

    for (const file of formAuthFiles) {
      const content = readFileSync(resolve(__dirname, "..", file.path), "utf8")

      for (const expectedImport of file.imports) {
        expect(content).toContain(expectedImport)
      }
      expect(content).not.toContain("<button")
      expect(content).not.toContain("<input")
      expect(content).not.toContain("<label")
    }

    const outputRoot = makeTempRoot()
    buildSolidRegistry({
      exampleRoot: resolve(__dirname, ".."),
      manifest: solidRegistryManifest,
      outputRoot
    })

    const signUp = readJson<{
      dependencies: string[]
      files: Array<{ path: string; type: string }>
      registryDependencies: string[]
    }>(join(outputRoot, "solid/sign-up.json"))

    expect(signUp.registryDependencies).toEqual([
      solidRegistryUrl("auth-provider"),
      solidRegistryUrl("additional-field")
    ])
    const authProvider = readJson<{
      registryDependencies: string[]
    }>(join(outputRoot, "solid/auth-provider.json"))
    expect(authProvider.registryDependencies).toEqual(
      expect.arrayContaining([
        "@zaidan/font-inter",
        "@zaidan/neutral",
        "@zaidan/style-mira",
        ...upstreamFormUiDependencies
      ])
    )
    expect(signUp.dependencies).toEqual(
      expect.arrayContaining([
        "@kobalte/core",
        "class-variance-authority",
        "clsx",
        "tailwind-merge"
      ])
    )
    expect(signUp.files.map((file) => file.path)).toEqual([
      "src/components/auth/sign-up.tsx",
      "src/components/auth/provider-button.tsx",
      "src/components/auth/provider-buttons.tsx",
      "src/lib/utils.ts"
    ])
    expect(signUp.files.map((file) => file.path)).not.toEqual(
      expect.arrayContaining(uiFiles.filter((file) => file.includes("/ui/")))
    )
    expect(signUp.files.map((file) => file.type)).not.toContain("registry:ui")
  })

  it("uses direct hosted URLs for Better Auth UI-owned registry dependencies", () => {
    const outputRoot = makeTempRoot()

    buildSolidRegistry({
      exampleRoot: resolve(__dirname, ".."),
      manifest: solidRegistryManifest,
      outputRoot
    })

    const registryFiles = readdirSync(join(outputRoot, "solid")).filter(
      (file) => file.endsWith(".json") && file !== "registry.json"
    )

    for (const registryFile of registryFiles) {
      const registryItem = readJson<{
        registryDependencies?: string[]
      }>(join(outputRoot, "solid", registryFile))

      for (const registryDependency of registryItem.registryDependencies ??
        []) {
        expect(
          registryDependency,
          `${registryFile} has a bare Solid dep`
        ).not.toMatch(/^solid\//)
      }
    }
  })

  it("requires upstream Zaidan dependencies for generated UI primitive imports", () => {
    const uiPrimitiveDependencies = {
      avatar: "@zaidan/avatar",
      badge: "@zaidan/badge",
      button: "@zaidan/button",
      card: "@zaidan/card",
      dialog: "@zaidan/dialog",
      "dropdown-menu": "@zaidan/dropdown-menu",
      "input-group": "@zaidan/input-group",
      input: "@zaidan/input",
      item: "@zaidan/item",
      label: "@zaidan/label",
      separator: "@zaidan/separator",
      skeleton: "@zaidan/skeleton",
      sonner: "@zaidan/sonner",
      spinner: "@zaidan/spinner",
      table: "@zaidan/table",
      tabs: "@zaidan/tabs",
      textarea: "@zaidan/textarea"
    }
    const outputRoot = makeTempRoot()

    buildSolidRegistry({
      exampleRoot: resolve(__dirname, ".."),
      manifest: solidRegistryManifest,
      outputRoot
    })

    const registryFiles = readdirSync(join(outputRoot, "solid"))
      .filter((file) => file.endsWith(".json") && file !== "registry.json")
      .sort()
    const registryPayloads = Object.fromEntries(
      registryFiles.map((registryFile) => [
        registryFile.replace(/\.json$/, ""),
        readJson<{
          files: Array<{ content?: string }>
          registryDependencies: string[]
        }>(join(outputRoot, "solid", registryFile))
      ])
    )
    const localSolidRegistryDependencyName = (dependency: string) => {
      const solidPrefixMatch = dependency.match(/^solid\/(.+)$/)
      if (solidPrefixMatch?.[1]) return solidPrefixMatch[1]

      const directUrlMatch = dependency.match(
        /^https:\/\/better-auth-ui\.com\/r\/solid\/(.+)\.json$/
      )

      return directUrlMatch?.[1]
    }
    const collectRegistryDependencies = (
      name: string,
      seen = new Set<string>()
    ): Set<string> => {
      if (seen.has(name)) return seen
      seen.add(name)

      for (const dependency of registryPayloads[name]?.registryDependencies ??
        []) {
        seen.add(dependency)

        const localDependencyName = localSolidRegistryDependencyName(dependency)
        if (localDependencyName) {
          collectRegistryDependencies(localDependencyName, seen)
        }
      }

      return seen
    }

    for (const [name, payload] of Object.entries(registryPayloads)) {
      const importedUiPrimitives = new Set<string>()

      for (const file of payload.files) {
        for (const [, primitive] of file.content?.matchAll(
          /@\/components\/ui\/([a-z-]+)/g
        ) ?? []) {
          if (primitive) importedUiPrimitives.add(primitive)
        }
      }

      if (importedUiPrimitives.size === 0) continue

      const registryDependencies = collectRegistryDependencies(name)

      for (const primitive of importedUiPrimitives) {
        const dependency =
          uiPrimitiveDependencies[
            primitive as keyof typeof uiPrimitiveDependencies
          ]

        expect(
          registryDependencies,
          `${name}.json imports @/components/ui/${primitive}`
        ).toContain(dependency)
      }
    }
  })

  it("documents apps/docs/public/r/solid as static asset hosting only", () => {
    const staticHostReadme = readFileSync(
      resolve(__dirname, "../../../apps/docs/public/r/solid/README.md"),
      "utf8"
    )
    const docsRuntimeFiles = collectFiles(
      resolve(__dirname, "../../../apps/docs/src")
    ).filter((path) => /\.(ts|tsx)$/.test(path))

    expect(staticHostReadme).toContain("Static asset host only")
    expect(staticHostReadme).toContain(
      "must not import or execute Solid components"
    )
    expect(docsRuntimeFiles.length).toBeGreaterThan(0)
    expect(
      docsRuntimeFiles.every(
        (path) => !readFileSync(path, "utf8").includes("/r/solid")
      )
    ).toBe(true)
  })

  it("keeps Start auth and route source in the Solid example tree", () => {
    const expectedFiles = [
      "src/lib/auth.ts",
      "src/components/auth/forgot-password.tsx",
      "src/components/auth/reset-password.tsx",
      "src/components/auth/sign-up.tsx",
      "src/components/auth/sign-out.tsx",
      "src/components/auth/user-button.tsx",
      "src/routes/__root.tsx",
      "src/routes/index.tsx",
      "src/routes/auth/$path.tsx",
      "src/routes/api/auth/$.ts"
    ]

    for (const file of expectedFiles) {
      const content = readFileSync(resolve(__dirname, "..", file), "utf8")

      expect(content).not.toContain("@tanstack/react")
      expect(content).not.toContain("@better-auth-ui/react")
      expect(content).not.toContain('from "react"')
    }

    const signOut = readFileSync(
      resolve(__dirname, "../src/components/auth/sign-out.tsx"),
      "utf8"
    )
    const forgotPassword = readFileSync(
      resolve(__dirname, "../src/components/auth/forgot-password.tsx"),
      "utf8"
    )
    const resetPassword = readFileSync(
      resolve(__dirname, "../src/components/auth/reset-password.tsx"),
      "utf8"
    )
    const signUp = readFileSync(
      resolve(__dirname, "../src/components/auth/sign-up.tsx"),
      "utf8"
    )
    const authClient = readFileSync(
      resolve(__dirname, "../src/lib/auth-client.ts"),
      "utf8"
    )
    const providers = readFileSync(
      resolve(__dirname, "../src/components/providers.tsx"),
      "utf8"
    )
    const rootRoute = readFileSync(
      resolve(__dirname, "../src/routes/__root.tsx"),
      "utf8"
    )
    const homeRoute = readFileSync(
      resolve(__dirname, "../src/routes/index.tsx"),
      "utf8"
    )
    const authRoute = readFileSync(
      resolve(__dirname, "../src/routes/auth/$path.tsx"),
      "utf8"
    )

    expect(authClient).toContain("import.meta.env.SSR")
    expect(authClient).toContain("http://localhost:5173/api/auth")
    expect(authClient).toContain("resolveAuthBaseURL")
    expect(authClient).toContain("window.location.origin")
    expect(authClient).not.toContain(': "/api/auth"')
    expect(homeRoute).toContain('from "@/components/auth/user/user-button"')
    expect(homeRoute).toContain("<UserButton />")
    expect(homeRoute).not.toContain("<SignIn />")
    expect(authRoute).not.toContain('from "@/components/auth/auth-provider"')
    expect(authRoute).not.toContain("<AuthProvider>")
    expect(rootRoute).toContain('from "@/components/providers"')
    expect(rootRoute).toContain(
      "<Providers queryClient={routeContext().queryClient}>"
    )
    expect(rootRoute).toContain("</Providers>")
    expect(providers).toContain('from "./auth/auth-provider"')
    expect(providers).toContain("authClient={authClient}")
    expect(signOut).toContain('from "@better-auth-ui/solid"')
    expect(signOut).toContain('from "solid-js"')
    expect(signOut).toContain("auth.authClient.signOut")
    expect(forgotPassword).toContain('from "@better-auth-ui/solid"')
    expect(forgotPassword).toContain('from "solid-js"')
    expect(forgotPassword).toContain("useRequestPasswordReset")
    expect(forgotPassword).toContain("useRequestPasswordReset")
    expect(forgotPassword).toContain('type="email"')
    expect(resetPassword).toContain('from "@better-auth-ui/solid"')
    expect(resetPassword).toContain('from "solid-js"')
    expect(resetPassword).toContain("useResetPassword")
    expect(resetPassword).toContain("useResetPassword")
    expect(resetPassword).toContain(
      'type={isPasswordVisible() ? "text" : "password"}'
    )
    expect(resetPassword).toContain("tokenFromLocation")
    expect(signUp).toContain('from "@better-auth-ui/solid"')
    expect(signUp).toContain('from "solid-js"')
    expect(signUp).toContain("useSignUpEmail")
    expect(signUp).toContain("useSignUpEmail")
    expect(signUp).toContain('type="email"')
    expect(signUp).toContain('autocomplete="new-password"')
  })

  it("matches the shadcn example route shell for layout parity", () => {
    const rootRoute = readFileSync(
      resolve(__dirname, "../src/routes/__root.tsx"),
      "utf8"
    )
    const homeRoute = readFileSync(
      resolve(__dirname, "../src/routes/index.tsx"),
      "utf8"
    )
    const authRoute = readFileSync(
      resolve(__dirname, "../src/routes/auth/$path.tsx"),
      "utf8"
    )
    const header = readFileSync(
      resolve(__dirname, "../src/components/header.tsx"),
      "utf8"
    )

    expect(rootRoute).toContain('from "@/components/header"')
    expect(rootRoute).toContain("shellComponent: RootDocument")
    expect(rootRoute).toContain(
      'import { HydrationScript } from "solid-js/web"'
    )
    expect(rootRoute).toContain("<HydrationScript />")
    expect(rootRoute).toContain(
      "<head>\n        <script>{themeScript}</script>\n        <HydrationScript />\n      </head>"
    )
    expect(rootRoute).toContain(
      '<body class="antialiased min-h-svh flex flex-col bg-background text-foreground">\n        <HeadContent />'
    )
    expect(rootRoute).toContain("<Header />")
    expect(rootRoute).toContain('<main class="grow flex flex-col">')
    expect(homeRoute).toContain(
      'class="grow flex items-center justify-center flex-col gap-4"'
    )
    expect(authRoute).toContain(
      'class="flex justify-center my-auto p-4 md:p-6"'
    )
    expect(header).toContain(
      '<header class="sticky top-0 z-10 bg-background border-b">'
    )
    expect(header).toContain(
      'class="py-3 px-4 md:px-6 mx-auto justify-between flex items-center"'
    )
    expect(header).toContain("BETTER-AUTH. UI")
  })

  it("uses card slots around auth forms like the shadcn example", () => {
    const card = readFileSync(
      resolve(__dirname, "../src/components/ui/card.tsx"),
      "utf8"
    )
    const authForms = [
      "src/components/auth/username/sign-in-username.tsx",
      "src/components/auth/sign-up.tsx",
      "src/components/auth/forgot-password.tsx",
      "src/components/auth/reset-password.tsx"
    ]

    expect(card).toContain('data-slot="card"')
    expect(card).toContain('data-slot="card-header"')
    expect(card).toContain('data-slot="card-title"')
    expect(card).toContain('data-slot="card-content"')

    for (const formPath of authForms) {
      const content = readFileSync(resolve(__dirname, "..", formPath), "utf8")

      expect(content).toContain('from "@/components/ui/card"')
      expect(content).toContain("<Card")
      expect(content).toContain("<CardHeader>")
      expect(content).toContain("<CardTitle")
      expect(content).toContain("<CardContent>")
      expect(content).toContain('"w-full max-w-sm"')
    }
  })

  it("moves auth forms closer to the shadcn field and footer structure", () => {
    const signIn = readFileSync(
      resolve(
        __dirname,
        "../src/components/auth/username/sign-in-username.tsx"
      ),
      "utf8"
    )
    const signUp = readFileSync(
      resolve(__dirname, "../src/components/auth/sign-up.tsx"),
      "utf8"
    )
    const forgotPassword = readFileSync(
      resolve(__dirname, "../src/components/auth/forgot-password.tsx"),
      "utf8"
    )
    const resetPassword = readFileSync(
      resolve(__dirname, "../src/components/auth/reset-password.tsx"),
      "utf8"
    )

    expect(signIn).toContain('from "@better-auth-ui/solid"')
    expect(signIn).toContain("useSignInEmail")
    expect(signIn).toContain("useSignInEmail")
    expect(signIn).toContain("usernameOrEmailPlaceholder")
    expect(signIn).toContain(
      "placeholder={auth.localization.auth.passwordPlaceholder}"
    )
    expect(signIn).toContain("auth.localization.auth.forgotPasswordLink")
    expect(signIn).toContain("auth.localization.auth.needToCreateAnAccount")
    expect(signIn).toContain("auth.viewPaths.auth.forgotPassword")
    expect(signIn).toContain("auth.viewPaths.auth.signUp")

    expect(signUp).toContain(
      "placeholder={auth.localization.auth.namePlaceholder}"
    )
    expect(signUp).toContain("signUpFieldsAbove")
    expect(signUp).toContain("signUpFieldsBelow")
    expect(signUp).toContain("parseAdditionalFieldValue")
    expect(signUp).toContain(
      "placeholder={auth.localization.auth.emailPlaceholder}"
    )
    expect(signUp).toContain(
      "placeholder={auth.localization.auth.passwordPlaceholder}"
    )
    expect(signUp).toContain("auth.emailAndPassword.confirmPassword")
    expect(signUp).toContain(
      "auth.localization.auth.confirmPasswordPlaceholder"
    )
    expect(signUp).toContain("auth.localization.auth.alreadyHaveAnAccount")
    expect(signUp).toContain("auth.viewPaths.auth.signIn")

    expect(forgotPassword).toContain(
      "placeholder={auth.localization.auth.emailPlaceholder}"
    )
    expect(forgotPassword).toContain(
      "auth.localization.auth.rememberYourPassword"
    )
    expect(forgotPassword).toContain("auth.viewPaths.auth.signIn")

    expect(resetPassword).toContain(
      "placeholder={auth.localization.auth.newPasswordPlaceholder}"
    )
    expect(resetPassword).toContain(
      "auth.localization.auth.confirmPasswordPlaceholder"
    )
    expect(resetPassword).toContain(
      "auth.localization.auth.rememberYourPassword"
    )
    expect(resetPassword).toContain("auth.viewPaths.auth.signIn")
  })

  it("documents Zaidan auth, settings, and user props instead of claiming false no-props surfaces", () => {
    const docsRoot = resolve(
      __dirname,
      "../../../apps/docs/content/docs/zaidan/components"
    )
    const pages = {
      accountSettings: readFileSync(
        resolve(docsRoot, "account-settings.mdx"),
        "utf8"
      ),
      activeSessions: readFileSync(
        resolve(docsRoot, "active-sessions.mdx"),
        "utf8"
      ),
      auth: readFileSync(resolve(docsRoot, "auth.mdx"), "utf8"),
      changeEmail: readFileSync(resolve(docsRoot, "change-email.mdx"), "utf8"),
      changePassword: readFileSync(
        resolve(docsRoot, "change-password.mdx"),
        "utf8"
      ),
      forgotPassword: readFileSync(
        resolve(docsRoot, "forgot-password.mdx"),
        "utf8"
      ),
      linkedAccounts: readFileSync(
        resolve(docsRoot, "linked-accounts.mdx"),
        "utf8"
      ),
      resetPassword: readFileSync(
        resolve(docsRoot, "reset-password.mdx"),
        "utf8"
      ),
      securitySettings: readFileSync(
        resolve(docsRoot, "security-settings.mdx"),
        "utf8"
      ),
      settings: readFileSync(resolve(docsRoot, "settings.mdx"), "utf8"),
      signIn: readFileSync(resolve(docsRoot, "sign-in.mdx"), "utf8"),
      signOut: readFileSync(resolve(docsRoot, "sign-out.mdx"), "utf8"),
      signUp: readFileSync(resolve(docsRoot, "sign-up.mdx"), "utf8"),
      userAvatar: readFileSync(resolve(docsRoot, "user-avatar.mdx"), "utf8"),
      userButton: readFileSync(resolve(docsRoot, "user-button.mdx"), "utf8"),
      userProfile: readFileSync(resolve(docsRoot, "user-profile.mdx"), "utf8"),
      userView: readFileSync(resolve(docsRoot, "user-view.mdx"), "utf8")
    }

    const shadcnModelDocs = new Set([
      "accountSettings",
      "activeSessions",
      "auth",
      "changeEmail",
      "changePassword",
      "forgotPassword",
      "linkedAccounts",
      "resetPassword",
      "securitySettings",
      "settings",
      "signIn",
      "signOut",
      "signUp",
      "userAvatar",
      "userButton",
      "userProfile",
      "userView"
    ])

    for (const [name, content] of Object.entries(pages)) {
      expect(content, name).not.toMatch(/does not expose public props/i)
      if (!shadcnModelDocs.has(name)) {
        expect(content, name).toContain("Parity classification")
      }
      expect(content, name).toContain("<auto-type-table")
      expect(content, name).not.toContain("| Prop | Type")
    }

    expect(pages.auth).toContain('name="AuthProps"')
    expect(pages.signIn).toContain('name="SignInProps"')
    expect(pages.signUp).toContain('name="SignUpProps"')
    expect(pages.settings).toContain('name="SettingsProps"')
    expect(pages.accountSettings).toContain('name="AccountSettingsProps"')
    expect(pages.activeSessions).toContain('name="ActiveSessionsSettingsProps"')
    expect(pages.changeEmail).toContain('name="ChangeEmailProps"')
    expect(pages.changePassword).toContain('name="ChangePasswordSettingsProps"')
    expect(pages.forgotPassword).toContain('name="ForgotPasswordProps"')
    expect(pages.linkedAccounts).toContain('name="LinkedAccountsSettingsProps"')
    expect(pages.resetPassword).toContain('name="ResetPasswordProps"')
    expect(pages.securitySettings).toContain('name="SecuritySettingsProps"')
    expect(pages.signOut).toContain('name="SignOutProps"')
    expect(pages.userAvatar).toContain('name="UserAvatarProps"')
    expect(pages.userButton).toContain('name="UserButtonProps"')
    expect(pages.userProfile).toContain('name="UserProfileProps"')
    expect(pages.userView).toContain('name="UserViewProps"')

    for (const [name, content] of Object.entries(pages)) {
      if (!shadcnModelDocs.has(name)) {
        expect(content, name).toContain("`class`")
      }
    }

    const settingsFlowDocs: Record<
      string,
      {
        content: string
        headings: string[]
        install?: boolean
        propsName: string
        storyId: string
        usageFence: string
      }
    > = {
      settings: {
        content: pages.settings,
        headings: ["Usage", "Installation", "Props"],
        install: true,
        propsName: "SettingsProps",
        storyId: "zaidan-components-settings--settings-preview",
        usageFence:
          "examples/start-solid-zaidan-example/src/demos/settings/settings.tsx"
      },
      "account-settings": {
        content: pages.accountSettings,
        headings: ["Usage", "Installation", "Props"],
        install: true,
        propsName: "AccountSettingsProps",
        storyId: "zaidan-components-settings--account-settings-preview",
        usageFence:
          "examples/start-solid-zaidan-example/src/demos/settings/account/account-settings.tsx"
      },
      "user-profile": {
        content: pages.userProfile,
        headings: ["Usage", "Installation", "Props"],
        install: true,
        propsName: "UserProfileProps",
        storyId: "zaidan-components-settings--user-profile-preview",
        usageFence:
          "examples/start-solid-zaidan-example/src/demos/settings/account/user-profile.tsx"
      },
      "change-email": {
        content: pages.changeEmail,
        headings: ["Usage", "Installation", "Props"],
        install: true,
        propsName: "ChangeEmailProps",
        storyId: "zaidan-components-settings--change-email-preview",
        usageFence:
          "examples/start-solid-zaidan-example/src/demos/settings/account/change-email.tsx"
      },
      "security-settings": {
        content: pages.securitySettings,
        headings: ["Usage", "Installation", "Props"],
        install: true,
        propsName: "SecuritySettingsProps",
        storyId: "zaidan-components-settings--security-settings-preview",
        usageFence:
          "examples/start-solid-zaidan-example/src/demos/settings/security/security-settings.tsx"
      },
      "change-password": {
        content: pages.changePassword,
        headings: ["Usage", "Installation", "Props"],
        install: true,
        propsName: "ChangePasswordSettingsProps",
        storyId: "zaidan-components-settings--change-password-preview",
        usageFence:
          "examples/start-solid-zaidan-example/src/demos/settings/security/change-password.tsx"
      },
      "linked-accounts": {
        content: pages.linkedAccounts,
        headings: ["Usage", "Installation", "Props"],
        install: true,
        propsName: "LinkedAccountsSettingsProps",
        storyId: "zaidan-components-settings--linked-accounts-preview",
        usageFence:
          "examples/start-solid-zaidan-example/src/demos/settings/security/linked-accounts.tsx"
      },
      "active-sessions": {
        content: pages.activeSessions,
        headings: ["Usage", "Installation", "Props"],
        install: true,
        propsName: "ActiveSessionsSettingsProps",
        storyId: "zaidan-components-settings--active-sessions-preview",
        usageFence:
          "examples/start-solid-zaidan-example/src/demos/settings/security/active-sessions.tsx"
      }
    }

    for (const [name, expectation] of Object.entries(settingsFlowDocs)) {
      expect(extractLevelTwoHeadings(expectation.content), name).toEqual(
        expectation.headings
      )
      expect(
        expectation.content,
        `${name} should show Zaidan preview`
      ).toContain(`storyId="${expectation.storyId}"`)
      expect(
        expectation.content,
        `${name} should use file-backed Solid demo`
      ).toContain(`tsx file=<rootDir>/../../${expectation.usageFence}`)
      expect(
        expectation.content,
        `${name} should derive props from Solid source`
      ).toContain(`name="${expectation.propsName}"`)
      if (expectation.install) {
        expect(
          expectation.content,
          `${name} should include install command`
        ).toContain(
          `npx shadcn@latest add https://better-auth-ui.com/r/solid/${name}.json`
        )
      } else {
        expect(
          expectation.content,
          `${name} should match shadcn no-install model`
        ).not.toContain("## Installation")
      }
      expect(
        expectation.content,
        `${name} should not keep plugin gates`
      ).not.toContain("## Plugin gates")
      expect(
        expectation.content,
        `${name} should not keep installed files`
      ).not.toContain("## Installed files")
      expect(
        expectation.content,
        `${name} should not keep parity prose`
      ).not.toContain("Parity classification")
    }

    const settingsStories = readFileSync(
      resolve(__dirname, "../src/stories/settings.stories.tsx"),
      "utf8"
    )
    expect(settingsStories).toContain("h-screen")
    expect(settingsStories).toContain("overflow-hidden")
    expect(settingsStories).toContain("createStoryQueryClient")
    expect(settingsStories).not.toContain("navigator.credentials")
    expect(settingsStories).not.toContain("fetch(")

    expect(pages.userAvatar).not.toContain("intentional-difference")
    expect(pages.userView).not.toContain("intentional-difference")
  })

  it("adds password visibility toggles and inline field feedback parity", () => {
    const signIn = readFileSync(
      resolve(
        __dirname,
        "../src/components/auth/username/sign-in-username.tsx"
      ),
      "utf8"
    )
    const signUp = readFileSync(
      resolve(__dirname, "../src/components/auth/sign-up.tsx"),
      "utf8"
    )
    const forgotPassword = readFileSync(
      resolve(__dirname, "../src/components/auth/forgot-password.tsx"),
      "utf8"
    )
    const resetPassword = readFileSync(
      resolve(__dirname, "../src/components/auth/reset-password.tsx"),
      "utf8"
    )

    expect(signIn).toContain("validationMessage")
    expect(signIn).toContain("aria-invalid")
    expect(signIn).toContain("auth.localization.auth.showPassword")
    expect(signIn).toContain("auth.localization.auth.hidePassword")
    expect(signIn).toContain('import { Eye, EyeOff } from "lucide-solid"')
    expect(signIn).toContain('type={isPasswordVisible() ? "text" : "password"}')
    expect(signIn).toContain('type="button"')
    expect(signIn).toContain(
      "onClick={() => setIsPasswordVisible((visible) => !visible)}"
    )
    expect(signIn).toContain("<EyeOff aria-hidden")
    expect(signIn).toContain("<Eye aria-hidden")
    expect(signIn).not.toContain('isPasswordVisible() ? "Hide" : "Show"')

    expect(signUp).toContain("auth.localization.auth.showPassword")
    expect(signUp).toContain("auth.localization.auth.hidePassword")
    expect(signUp).toContain('import { Eye, EyeOff } from "lucide-solid"')
    expect(signUp).toContain('type={isPasswordVisible() ? "text" : "password"}')
    expect(signUp).toContain('type="button"')
    expect(signUp).toContain(
      "onClick={() => setIsPasswordVisible((visible) => !visible)}"
    )
    expect(signUp).toContain(
      "setIsConfirmPasswordVisible((visible) => !visible)"
    )
    expect(signUp).toContain("auth.localization.auth.passwordsDoNotMatch")
    expect(signUp).toContain("validationMessage")
    expect(signUp).toContain("aria-invalid")
    expect(signUp).toContain("<EyeOff aria-hidden")
    expect(signUp).toContain("<Eye aria-hidden")
    expect(signUp).not.toContain('isPasswordVisible() ? "Hide" : "Show"')
    expect(signUp).not.toContain('isConfirmPasswordVisible() ? "Hide" : "Show"')

    expect(forgotPassword).toContain("validationMessage")
    expect(forgotPassword).toContain("aria-invalid")

    expect(resetPassword).toContain("auth.localization.auth.showPassword")
    expect(resetPassword).toContain("auth.localization.auth.hidePassword")
    expect(resetPassword).toContain(
      'import { Eye, EyeOff } from "lucide-solid"'
    )
    expect(resetPassword).toContain(
      'type={isPasswordVisible() ? "text" : "password"}'
    )
    expect(resetPassword).toContain('type="button"')
    expect(resetPassword).toContain(
      "onClick={() => setIsPasswordVisible((visible) => !visible)}"
    )
    expect(resetPassword).toContain(
      "setIsConfirmPasswordVisible((visible) => !visible)"
    )
    expect(resetPassword).toContain(
      "auth.localization.auth.passwordsDoNotMatch"
    )
    expect(resetPassword).toContain("validationMessage")
    expect(resetPassword).toContain("aria-invalid")
    expect(resetPassword).toContain("<EyeOff aria-hidden")
    expect(resetPassword).toContain("<Eye aria-hidden")
    expect(resetPassword).not.toContain('isPasswordVisible() ? "Hide" : "Show"')
    expect(resetPassword).not.toContain(
      'isConfirmPasswordVisible() ? "Hide" : "Show"'
    )
  })

  it("adds username auth parity to the Solid sign-in surface", () => {
    const authConfig = readFileSync(
      resolve(__dirname, "../src/lib/auth.ts"),
      "utf8"
    )
    const authClient = readFileSync(
      resolve(__dirname, "../src/lib/auth-client.ts"),
      "utf8"
    )
    const signIn = readFileSync(
      resolve(
        __dirname,
        "../src/components/auth/username/sign-in-username.tsx"
      ),
      "utf8"
    )
    const signUp = readFileSync(
      resolve(__dirname, "../src/components/auth/sign-up.tsx"),
      "utf8"
    )

    expect(authConfig).toContain('from "better-auth/plugins"')
    expect(authConfig).toContain("multiSession()")
    expect(authConfig).toContain("passkey()")
    expect(authConfig).toContain("username()")
    expect(authConfig).toContain("apiKey([")
    expect(authConfig).toContain('{ configId: "default", references: "user" }')
    expect(authConfig).toContain(
      '{ configId: "organization", references: "organization" }'
    )
    expect(authConfig).toContain("magicLink({")

    expect(authClient).toContain('from "@better-auth/api-key/client"')
    expect(authClient).toContain('from "@better-auth/passkey/client"')
    expect(authClient).toContain('from "better-auth/client/plugins"')
    expect(authClient).toContain("multiSessionClient()")
    expect(authClient).toContain("apiKeyClient()")
    expect(authClient).toContain("passkeyClient()")
    expect(authClient).toContain("usernameClient()")

    expect(signIn).toContain("useSignInUsername")
    expect(signIn).toContain("usernameOrEmailPlaceholder")
    expect(signIn).toContain("resolveSubmittedSignIn")
    expect(signIn).toContain("new FormData(event.currentTarget)")
    expect(signIn).toContain("username: signInPath.username")
    expect(signIn).toContain("email: signInPath.email")
    expect(signIn).toContain(
      'autocomplete={usernameAuth ? "username" : "email"}'
    )

    expect(signUp).toContain("parseAdditionalFieldValue")
    expect(signUp).toContain("additionalFieldValues")
    expect(signUp).not.toContain('name="username"')
    expect(signUp).not.toContain("username: username()")
  })

  it("uses a root user trigger surface instead of rendering the sign-in form directly", () => {
    const homeRoute = readFileSync(
      resolve(__dirname, "../src/routes/index.tsx"),
      "utf8"
    )
    const userButton = readFileSync(
      resolve(__dirname, "../src/components/auth/user/user-button.tsx"),
      "utf8"
    )
    const theme = readFileSync(
      resolve(__dirname, "../src/lib/theme.ts"),
      "utf8"
    )
    const header = readFileSync(
      resolve(__dirname, "../src/components/header.tsx"),
      "utf8"
    )
    const organizationSwitcher = readFileSync(
      resolve(
        __dirname,
        "../src/components/auth/organization/organization-switcher.tsx"
      ),
      "utf8"
    )
    const rootRoute = readFileSync(
      resolve(__dirname, "../src/routes/__root.tsx"),
      "utf8"
    )
    const providers = readFileSync(
      resolve(__dirname, "../src/components/providers.tsx"),
      "utf8"
    )
    const avatar = readFileSync(
      resolve(__dirname, "../src/components/ui/avatar.tsx"),
      "utf8"
    )
    const dropdownMenu = readFileSync(
      resolve(__dirname, "../src/components/ui/dropdown-menu.tsx"),
      "utf8"
    )
    const separator = readFileSync(
      resolve(__dirname, "../src/components/ui/separator.tsx"),
      "utf8"
    )
    const skeleton = readFileSync(
      resolve(__dirname, "../src/components/ui/skeleton.tsx"),
      "utf8"
    )
    const item = readFileSync(
      resolve(__dirname, "../src/components/ui/item.tsx"),
      "utf8"
    )
    const tabs = readFileSync(
      resolve(__dirname, "../src/components/ui/tabs.tsx"),
      "utf8"
    )
    const baseCss = readFileSync(
      resolve(__dirname, "../src/styles/base.css"),
      "utf8"
    )
    const shadcnThemeToggleItem = readFileSync(
      resolve(
        __dirname,
        "../../start-shadcn-example/src/components/auth/theme/theme-toggle-item.tsx"
      ),
      "utf8"
    )
    const themeToggleItem = readFileSync(
      resolve(__dirname, "../src/components/auth/theme/theme-toggle-item.tsx"),
      "utf8"
    )
    const packageJson = readJson<{
      dependencies: Record<string, string>
    }>(resolve(__dirname, "../package.json"))

    expect(homeRoute).toContain('from "@/components/auth/user/user-button"')
    expect(homeRoute).toContain("<UserButton />")
    expect(homeRoute).not.toContain("<SignIn />")

    expect(packageJson.dependencies).toHaveProperty("lucide-solid")

    expect(avatar).toContain('from "@kobalte/core/image"')
    expect(avatar).toContain('data-slot="avatar"')
    expect(avatar).toContain("AvatarFallback")
    expect(avatar).toContain("AvatarImage")

    expect(dropdownMenu).toContain('from "@kobalte/core/dropdown-menu"')
    expect(dropdownMenu).toContain('from "lucide-solid"')
    expect(dropdownMenu).toContain('data-slot="dropdown-menu-content"')
    expect(dropdownMenu).toContain("DropdownMenuSeparator")
    expect(dropdownMenu).toContain('data-slot="dropdown-menu-label"')
    expect(dropdownMenu).not.toContain("GroupLabel")

    expect(separator).toContain('from "@kobalte/core/separator"')
    expect(separator).toContain('data-slot="separator"')
    expect(separator).toContain("SeparatorPrimitive")

    expect(skeleton).toContain('data-slot="skeleton"')
    expect(skeleton).toContain("z-skeleton animate-pulse")

    expect(item).toContain("z-item flex")
    expect(item).toContain("z-item-variant-default")
    expect(item).toContain("z-item-size-default")
    expect(item).toContain("z-item-media-variant-icon")
    expect(item).toContain("z-item-separator")
    expect(item).toContain(
      "export type { ItemMediaVariant, ItemSize, ItemVariant }"
    )

    expect(tabs).toContain('from "@kobalte/core/tabs"')
    expect(tabs).toContain('data-slot="tabs-list"')
    expect(tabs).toContain('data-slot="tabs-trigger"')
    expect(tabs).toContain("z-tabs-list")
    expect(tabs).toContain("z-tabs-trigger")
    expect(tabs).toContain("data-selected:bg-background")
    expect(tabs).toContain("data-selected:text-foreground")
    expect(tabs).not.toContain("data-[selected]:")
    const tabsListBlock = extractCssBlock(baseCss, ".z-tabs-list")
    const tabsTriggerBlock = extractCssBlock(baseCss, ".z-tabs-trigger")
    expect(baseCss).toContain(".z-tabs-list")
    expect(tabsListBlock).toContain("rounded-lg p-[3px]")
    expect(baseCss).toContain(".z-tabs-list-theme-toggle")
    expect(baseCss).toContain("h-6")
    expect(tabsTriggerBlock).toContain("data-selected:shadow-sm")
    expect(tabsTriggerBlock).not.toContain("data-[selected=true]")

    expect(userButton).toContain('from "@better-auth-ui/solid"')
    expect(userButton).toContain("useSession")
    expect(userButton).toContain('from "@/components/auth/user/user-avatar"')
    expect(userButton).toContain('from "@/components/auth/user/user-view"')
    expect(userButton).toContain('from "@/components/ui/button"')
    expect(userButton).toContain('from "@/components/ui/dropdown-menu"')
    expect(userButton).toContain('from "@/components/ui/separator"')
    expect(userButton).toContain('from "@/components/ui/skeleton"')
    expect(userButton).toContain("<DropdownMenu")
    expect(userButton).toContain("modal={false}")
    expect(userButton).toContain("<UserAvatar")
    expect(userButton).toContain("<DropdownMenuTrigger")
    expect(userButton).toContain("<DropdownMenuContent")
    expect(userButton).toContain("<DropdownMenuSeparator")
    expect(userButton).toContain("auth.localization.auth.signIn")
    expect(userButton).toContain("auth.localization.auth.signUp")
    expect(userButton).toContain("auth.localization.auth.signOut")
    expect(userButton).toContain("auth.localization.settings.settings")
    expect(userButton).toContain("type UserButtonProps")
    expect(userButton).toContain('size?: "default" | "icon"')
    expect(userButton).toContain('align?: "center" | "end" | "start"')
    expect(userButton).toContain('size: "default" as const')
    expect(userButton).toContain('size() === "icon"')
    expect(userButton).not.toContain("ThemeToggleItem")
    expect(themeToggleItem).toContain('from "@/components/ui/tabs"')
    expect(themeToggleItem).toContain("PaletteIcon")
    expect(themeToggleItem).toContain("<Tabs")
    expect(themeToggleItem).toContain("<TabsList")
    expect(themeToggleItem).toContain("z-tabs-list-theme-toggle")
    expect(themeToggleItem).toContain("<TabsTrigger")
    expect(themeToggleItem).toContain("ThemeToggleItemProps")
    expect(themeToggleItem).toContain("resolveThemePluginState")
    expect(themeToggleItem).toContain("themeState().themes")
    expect(themeToggleItem).toContain("aria-label={themeLabel")
    expect(themeToggleItem).not.toContain('aria-label="System"')
    expect(themeToggleItem).not.toContain('aria-label="Light"')
    expect(themeToggleItem).not.toContain('aria-label="Dark"')
    expect(themeToggleItem).toContain('from "@/lib/theme"')
    expect(themeToggleItem).toContain("applyThemePreference")
    expect(shadcnThemeToggleItem).toContain('[role="tab"][data-state="active"]')
    expect(themeToggleItem).toContain('[role="tab"][data-selected]')
    expect(themeToggleItem).toContain("focusActiveTab")
    expect(themeToggleItem).toContain("onFocus")
    expect(userButton).toContain("function MountedUserButton")
    expect(userButton).toContain("function UserButtonHydrationFallback")
    expect(userButton).toContain("export function UserButton")
    expect(userButton).toContain("setIsMounted(true)")
    expect(userButton).toContain("<MountedUserButton {...props} />")
    expect(userButton).toContain("<UserButtonHydrationFallback {...props} />")
    expect(userButton).toContain("<UserButtonPendingView")
    expect(userButton).toContain("useSession(auth.authClient, () => ({")
    expect(userButton).toContain("enabled: !import.meta.env.SSR")
    expect(userButton).toContain("<Skeleton")
    expect(userButton).toContain('class="size-8 rounded-full"')
    expect(userButton).toContain('class="h-4 w-24"')
    expect(userButton).toContain('class="h-3 w-32"')
    expect(userButton).toContain("z-button-user-icon-trigger")
    expect(userButton).toContain("px-3.5 py-3")
    expect(userButton).toContain("hover:bg-white/10 hover:text-foreground")
    expect(userButton).not.toContain("w-full max-w-sm")
    expect(userButton).toContain(
      '"w-[--kb-popper-anchor-width] min-w-40 md:min-w-56 max-w-[48svw] rounded-lg bg-popover p-1 text-popover-foreground shadow-md"'
    )
    expect(userButton).toContain('"min-width": "min(14rem, 48svw)"')
    expect(userButton).toContain('"max-width": "48svw"')
    expect(userButton).toContain('width: "max-content"')
    expect(userButton).toContain("<Show when={session.data}>")
    expect(userButton).toContain("when={!session.isPending}")
    expect(userButton).toContain(
      'import { Link } from "@tanstack/solid-router"'
    )
    expect(userButton).toContain('to="/settings/$path"')
    expect(userButton).toContain("params={{ path: settingsPath }}")
    expect(userButton).not.toContain('as="a"')
    expect(userButton).not.toContain(
      "disabled\n            >\n              <Settings"
    )
    expect(userButton.indexOf("{auth.localization.auth.signUp}")).toBeLessThan(
      userButton.indexOf("<For each={pluginUserMenuItems()}")
    )
    expect(
      userButton.indexOf("<For each={pluginUserMenuItems()}")
    ).toBeLessThan(userButton.indexOf("{auth.localization.auth.signOut}"))
    expect(userButton).not.toContain("needToCreateAnAccount")

    expect(header).toContain('from "./auth/user/user-button"')
    expect(header).toContain('<UserButton size="icon" align="end" />')
    expect(header).toContain('from "./auth/organization/organization-switcher"')
    expect(header).toContain("<OrganizationSwitcher />")
    expect(organizationSwitcher).toContain(
      "function MountedOrganizationSwitcher"
    )
    expect(organizationSwitcher).toContain(
      "function OrganizationSwitcherTrigger"
    )
    expect(organizationSwitcher).toContain(
      "export function OrganizationSwitcher"
    )
    expect(organizationSwitcher).toContain("setIsMounted(true)")
    expect(organizationSwitcher).toContain(
      "<MountedOrganizationSwitcher {...props} />"
    )
    expect(organizationSwitcher).toContain(
      "<OrganizationSwitcherTrigger {...props} />"
    )

    expect(theme).toContain("export const themeStorageKey")
    expect(theme).toContain('"start-solid-zaidan-theme"')
    expect(theme).toContain("export const themeScript")
    expect(theme).toContain("document.documentElement.classList.remove")
    expect(theme).toContain("document.documentElement.classList.add")
    expect(theme).toContain("localStorage.getItem(themeStorageKey)")
    expect(theme).toContain("matchMedia")
    expect(theme).toContain('addEventListener("storage"')

    expect(rootRoute).toContain('from "@/lib/theme"')
    expect(rootRoute).toContain("themeScript")
    expect(rootRoute).toContain("<script>{themeScript}</script>")
    expect(providers).toContain("syncDocumentThemePreference()")
  })

  it("writes registry index and item snapshots only inside the solid namespace", () => {
    const outputRoot = makeTempRoot()
    const untouchedRootRegistry = join(outputRoot, "registry.json")
    writeFileSync(untouchedRootRegistry, '{"name":"existing-shadcn"}\n')

    const result = buildSolidRegistry({
      exampleRoot: resolve(__dirname, ".."),
      manifest: solidRegistryManifest,
      outputRoot
    })

    expect(result.files.sort()).toEqual(
      [
        join(outputRoot, "solid/README.md"),
        join(outputRoot, "solid/registry.json"),
        ...expectedSolidRegistryPayloadNames.map((name) =>
          join(outputRoot, `solid/${name}.json`)
        )
      ].sort()
    )
    expect(readFileSync(untouchedRootRegistry, "utf8")).toBe(
      '{"name":"existing-shadcn"}\n'
    )

    const registry = readJson<{
      name: string
      namespace: string
      items: Array<{ name: string }>
    }>(join(outputRoot, "solid/registry.json"))
    expect(registry.name).toBe("better-auth-ui-solid")
    expect(registry.namespace).toBe("solid")
    expect(registry.items.map((item) => item.name)).toEqual(
      expectedSolidRegistryPayloadNames
    )

    const auth = readJson<{
      files: Array<{ content: string; path: string }>
      name: string
      registryDependencies: string[]
    }>(join(outputRoot, "solid/auth.json"))
    expect(auth.name).toBe("auth")
    expect(auth.registryDependencies).toEqual([
      solidRegistryUrl("auth-provider"),
      solidRegistryUrl("sign-in"),
      solidRegistryUrl("sign-up"),
      solidRegistryUrl("forgot-password"),
      solidRegistryUrl("reset-password"),
      solidRegistryUrl("verify-email"),
      solidRegistryUrl("sign-out")
    ])
    expect(auth.files).toEqual([
      expect.objectContaining({
        content: expect.stringContaining("export function Auth"),
        path: "src/components/auth/auth.tsx"
      })
    ])

    const settings = readJson<{
      name: string
      registryDependencies: string[]
    }>(join(outputRoot, "solid/settings.json"))
    expect(settings.name).toBe("settings")
    expect(settings.registryDependencies).toEqual([
      solidRegistryUrl("account-settings"),
      solidRegistryUrl("security-settings")
    ])
    expect(settings.registryDependencies).not.toContain(
      solidRegistryUrl("organization")
    )

    const userButton = readJson<{
      files: Array<{ content: string; path: string }>
      name: string
      registryDependencies: string[]
    }>(join(outputRoot, "solid/user-button.json"))
    expect(userButton.name).toBe("user-button")
    expect(userButton.registryDependencies).toEqual([
      solidRegistryUrl("user-view")
    ])
    expect(userButton.registryDependencies).not.toContain(
      solidRegistryUrl("auth-provider")
    )
    expect(userButton.registryDependencies).not.toContain(
      solidRegistryUrl("theme")
    )

    const signIn = readJson<{
      dependencies: string[]
      files: Array<{ content: string; path: string }>
      name: string
    }>(join(outputRoot, "solid/sign-in.json"))
    expect(signIn.name).toBe("sign-in")
    expect(signIn.dependencies).toContain("@better-auth-ui/solid@latest")
    expect(signIn.dependencies).toContain("lucide-solid")
    expect(signIn.dependencies).toContain("solid-sonner")
    expect(signIn.files).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          content: expect.stringContaining("<SignInUsername"),
          path: "src/components/auth/sign-in.tsx"
        }),
        expect.objectContaining({
          content: expect.stringContaining(
            "export function resolveSubmittedSignIn"
          ),
          path: "src/components/auth/sign-in-path.ts"
        })
      ])
    )
    expect(signIn.files[0]?.content).toContain(
      'from "./username/sign-in-username"'
    )

    const magicLink = readJson<{
      description: string
      files: Array<{ content: string; path: string }>
      name: string
    }>(join(outputRoot, "solid/magic-link.json"))
    expect(magicLink.name).toBe("magic-link")
    expect(magicLink.description).toContain("magic-link sign-in")
    expect(magicLink.files).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: "src/lib/auth/magic-link-plugin.ts"
        }),
        expect.objectContaining({ path: "src/components/auth/magic-link.tsx" }),
        expect.objectContaining({
          path: "src/components/auth/magic-link-button.tsx"
        })
      ])
    )
    const generatedMagicLinkSource = magicLink.files.find(
      (file) => file.path === "src/components/auth/magic-link.tsx"
    )?.content
    const generatedMagicLinkButtonSource = magicLink.files.find(
      (file) => file.path === "src/components/auth/magic-link-button.tsx"
    )?.content
    expect(generatedMagicLinkSource).toContain("class?: string")
    expect(generatedMagicLinkSource).not.toContain("className?: string")
    expect(generatedMagicLinkSource).toContain("magicLinkLocalization")
    expect(generatedMagicLinkSource).toContain('view="magicLink"')
    expect(generatedMagicLinkButtonSource).toContain(
      "coreMagicLinkPlugin().viewPaths.auth.magicLink"
    )
    expect(generatedMagicLinkButtonSource).toContain(
      "magicLinkLabels().magicLink"
    )
    expect(generatedMagicLinkButtonSource).toContain("useIsMutating")
    expect(generatedMagicLinkButtonSource).toContain(
      "authMutationKeys.signIn.all"
    )
    expect(generatedMagicLinkButtonSource).toContain("aria-disabled")
    expect(generatedMagicLinkButtonSource).toContain("event.preventDefault()")
    expect(generatedMagicLinkButtonSource).not.toContain('"Magic Link"')

    const multiSession = readJson<{
      files: Array<{ content: string; path: string }>
      name: string
      registryDependencies: string[]
    }>(join(outputRoot, "solid/multi-session.json"))
    expect(multiSession.name).toBe("multi-session")
    expect(multiSession.registryDependencies).toEqual([
      solidRegistryUrl("auth-provider"),
      solidRegistryUrl("user-view")
    ])
    expect(multiSession.files).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: "src/lib/auth/multi-session-plugin.ts"
        }),
        expect.objectContaining({
          path: "src/components/auth/multi-session/manage-account.tsx"
        }),
        expect.objectContaining({
          path: "src/components/auth/multi-session/manage-accounts.tsx"
        }),
        expect.objectContaining({
          path: "src/components/auth/multi-session/switch-account-submenu.tsx"
        }),
        expect.objectContaining({
          path: "src/components/auth/multi-session/switch-account-submenu-content.tsx"
        }),
        expect.objectContaining({
          path: "src/components/auth/multi-session/switch-account-submenu-item.tsx"
        }),
        expect.objectContaining({
          path: "src/components/auth/settings/shared/helpers.ts"
        }),
        expect.objectContaining({
          path: "src/components/auth/settings/shared/types.ts"
        })
      ])
    )
    const generatedMultiSessionWrapperSource = multiSession.files.find(
      (file) => file.path === "src/lib/auth/multi-session-plugin.ts"
    )?.content
    const generatedSwitchAccountSubmenuSource = multiSession.files.find(
      (file) =>
        file.path ===
        "src/components/auth/multi-session/switch-account-submenu.tsx"
    )?.content
    const generatedSwitchAccountSubmenuContentSource = multiSession.files.find(
      (file) =>
        file.path ===
        "src/components/auth/multi-session/switch-account-submenu-content.tsx"
    )?.content
    const generatedSwitchAccountSubmenuItemSource = multiSession.files.find(
      (file) =>
        file.path ===
        "src/components/auth/multi-session/switch-account-submenu-item.tsx"
    )?.content
    expect(generatedMultiSessionWrapperSource).toContain(
      "accountCards: [ManageAccounts]"
    )
    expect(generatedMultiSessionWrapperSource).toContain(
      "userMenuItems: [SwitchAccountSubmenu]"
    )
    expect(generatedSwitchAccountSubmenuSource).toContain(
      'from "./switch-account-submenu-content"'
    )
    expect(generatedSwitchAccountSubmenuContentSource).not.toContain(
      'from "@/components/auth/settings/shared/helpers"'
    )
    expect(generatedSwitchAccountSubmenuContentSource).toContain(
      'from "@/components/auth/user/user-view"'
    )
    expect(generatedSwitchAccountSubmenuItemSource).toContain(
      'from "@/components/auth/user/user-view"'
    )

    const accountSettingsRegistry = readJson<{
      files: Array<{ content: string; path: string }>
      name: string
      registryDependencies: string[]
    }>(join(outputRoot, "solid/account-settings.json"))
    expect(accountSettingsRegistry.name).toBe("account-settings")
    expect(accountSettingsRegistry.registryDependencies).toEqual([
      solidRegistryUrl("user-profile"),
      solidRegistryUrl("change-email"),
      solidRegistryUrl("delete-user")
    ])
    expect(accountSettingsRegistry.registryDependencies).not.toContain(
      solidRegistryUrl("theme")
    )
    expect(accountSettingsRegistry.files).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: "src/components/auth/settings/account/manage-account-row.tsx"
        }),
        expect.objectContaining({
          path: "src/components/auth/settings/account/appearance-settings.tsx"
        })
      ])
    )
    const generatedAccountSettingsSource = accountSettingsRegistry.files.find(
      (file) =>
        file.path ===
        "src/components/auth/settings/account/account-settings.tsx"
    )?.content
    expect(generatedAccountSettingsSource).toContain("plugin.accountCards")
    expect(generatedAccountSettingsSource).not.toContain(
      'from "@/components/auth/multi-session/manage-accounts"'
    )

    const generatedUserButtonSource = userButton.files.find(
      (file) => file.path === "src/components/auth/user/user-button.tsx"
    )?.content
    expect(generatedUserButtonSource).toContain("pluginUserMenuItems")
    expect(generatedUserButtonSource).toContain("plugin.userMenuItems")
    expect(generatedUserButtonSource).not.toContain("<ThemeToggleItem />")

    const themeRegistry = readJson<{
      files: Array<{ content: string; path: string }>
      name: string
    }>(join(outputRoot, "solid/theme.json"))
    expect(themeRegistry.name).toBe("theme")
    expect(themeRegistry.files).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: "src/lib/auth/theme-plugin.ts" }),
        expect.objectContaining({ path: "src/lib/theme.ts" }),
        expect.objectContaining({
          path: "src/components/auth/theme/appearance.tsx"
        }),
        expect.objectContaining({
          path: "src/components/auth/theme/theme-toggle-item.tsx"
        })
      ])
    )
    const generatedThemePluginSource = themeRegistry.files.find(
      (file) => file.path === "src/lib/auth/theme-plugin.ts"
    )?.content
    expect(generatedThemePluginSource).toContain("ThemePluginOptions")
    expect(generatedThemePluginSource).toContain("ThemeLocalization")
    expect(generatedThemePluginSource).toContain(
      "userMenuItems: [ThemeToggleItem]"
    )
    expect(generatedThemePluginSource).toContain("accountCards: [Appearance]")

    const signOut = readJson<{
      files: Array<{ content: string; path: string }>
      name: string
      registryDependencies: string[]
    }>(join(outputRoot, "solid/sign-out.json"))
    expect(signOut.name).toBe("sign-out")
    expect(signOut.registryDependencies).toEqual([
      solidRegistryUrl("auth-provider")
    ])
    expect(signOut.files).toEqual([
      expect.objectContaining({
        content: expect.stringContaining("export function SignOut"),
        path: "src/components/auth/sign-out.tsx"
      })
    ])

    const authProvider = readJson<{
      dependencies: string[]
      files: Array<{ content: string; path: string }>
      name: string
      registryDependencies: string[]
    }>(join(outputRoot, "solid/auth-provider.json"))
    expect(authProvider.dependencies).toContain("solid-sonner")
    expect(authProvider.dependencies).toContain("lucide-solid")
    expect(authProvider.registryDependencies).toEqual(
      expect.arrayContaining([
        "@zaidan/font-inter",
        "@zaidan/neutral",
        "@zaidan/style-mira",
        "@zaidan/sonner"
      ])
    )
    expect(authProvider.files).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          content: expect.stringContaining("<ErrorToaster />"),
          path: "src/components/auth/auth-provider.tsx"
        }),
        expect.objectContaining({
          content: expect.stringContaining('from "solid-sonner"'),
          path: "src/components/auth/error-toaster.tsx"
        }),
        expect.objectContaining({
          content: expect.stringContaining("themeScript"),
          path: "src/lib/theme.ts"
        })
      ])
    )
    expect(authProvider.files.map((file) => file.path)).not.toContain(
      "src/components/ui/sonner.tsx"
    )

    const forgotPassword = readJson<{
      dependencies: string[]
      files: Array<{ content: string; path: string }>
      name: string
      registryDependencies: string[]
    }>(join(outputRoot, "solid/forgot-password.json"))
    expect(forgotPassword.name).toBe("forgot-password")
    expect(forgotPassword.dependencies).toContain(
      "@better-auth-ui/solid@latest"
    )
    expect(forgotPassword.registryDependencies).toEqual([
      solidRegistryUrl("auth-provider")
    ])
    expect(forgotPassword.files).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          content: expect.stringContaining("export function ForgotPassword"),
          path: "src/components/auth/forgot-password.tsx"
        })
      ])
    )
    expect(forgotPassword.files[0]?.content).toContain(
      "useRequestPasswordReset"
    )
    expect(forgotPassword.files[0]?.content).toContain(
      "Check your email for the reset link."
    )
    expect(forgotPassword.files[0]?.content).toContain(
      "Unable to send a reset link. Try again."
    )

    const resetPassword = readJson<{
      dependencies: string[]
      files: Array<{ content: string; path: string }>
      name: string
      registryDependencies: string[]
    }>(join(outputRoot, "solid/reset-password.json"))
    expect(resetPassword.name).toBe("reset-password")
    expect(resetPassword.dependencies).toContain("@better-auth-ui/solid@latest")
    expect(resetPassword.registryDependencies).toEqual([
      solidRegistryUrl("auth-provider")
    ])
    expect(resetPassword.files).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          content: expect.stringContaining("export function ResetPassword"),
          path: "src/components/auth/reset-password.tsx"
        })
      ])
    )
    expect(resetPassword.files[0]?.content).toContain("useResetPassword")
    expect(resetPassword.files[0]?.content).toContain(
      "Password reset successfully. You can sign in with your new"
    )
    expect(resetPassword.files[0]?.content).toContain("password.")
    expect(resetPassword.files[0]?.content).toContain(
      "auth.localization.auth.invalidResetPasswordToken"
    )
    expect(resetPassword.files[0]?.content).toContain(
      "auth.localization.auth.passwordsDoNotMatch"
    )
    expect(resetPassword.files[0]?.content).toContain("tokenFromLocation")

    const signUp = readJson<{
      dependencies: string[]
      files: Array<{ content: string; path: string }>
      name: string
      registryDependencies: string[]
    }>(join(outputRoot, "solid/sign-up.json"))
    expect(signUp.name).toBe("sign-up")
    expect(signUp.dependencies).toContain("@better-auth-ui/solid@latest")
    expect(signUp.registryDependencies).toEqual([
      solidRegistryUrl("auth-provider"),
      solidRegistryUrl("additional-field")
    ])
    expect(signUp.files).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          content: expect.stringContaining("export function SignUp"),
          path: "src/components/auth/sign-up.tsx"
        })
      ])
    )
    expect(signUp.files[0]?.content).toContain("useSignUpEmail")
    expect(signUp.files[0]?.content).toContain(
      "Account created. Check your email if verification is required."
    )
    expect(signUp.files[0]?.content).toContain(
      "Unable to create an account. Try again."
    )
    expect(signUp.files[0]?.content).toContain("auth.emailAndPassword.name")
  })

  it("rejects manifest files that escape the Solid example source tree", () => {
    const outputRoot = makeTempRoot()
    const unsafeManifest = {
      ...solidRegistryManifest,
      items: [
        {
          ...solidRegistryManifest.items[0],
          files: [
            {
              path: "../start-shadcn-example/registry.json",
              type: "registry:file" as const
            }
          ]
        }
      ]
    }

    expect(() =>
      buildSolidRegistry({
        exampleRoot: resolve(__dirname, ".."),
        manifest: unsafeManifest as SolidRegistryManifest,
        outputRoot
      })
    ).toThrow("outside the Solid example src directory")
    expect(existsSync(join(outputRoot, "solid/auth-provider.json"))).toBe(false)
  })

  it("keeps the package, example, static registry, and docs links coherent", () => {
    const report = verifyLocalRegistryCoherence()

    expect(report.packageName).toBe("@better-auth-ui/solid")
    expect(report.packageExports).toEqual([
      ".",
      "./email",
      "./plugins/api-key",
      "./plugins/captcha",
      "./plugins/magic-link",
      "./plugins/multi-session",
      "./plugins/organization",
      "./plugins/passkey",
      "./plugins/username"
    ])
    expect(report.exampleSolidDependency).toBe("*")
    expect(report.staticItemNames).toEqual(expectedSolidRegistryPayloadNames)
    expect(report.missingStaticFiles).toEqual([])
    expect(report.missingDocsLinks).toEqual([])
  })

  it("documents Zaidan registry installs through shadcn direct URLs", () => {
    const zaidanDocs = collectFiles(
      resolve(__dirname, "../../../apps/docs/content/docs/zaidan")
    )
      .filter((path) => path.endsWith(".mdx"))
      .map((path) => readFileSync(path, "utf8"))
      .join("\n")

    expect(zaidanDocs).not.toContain("npx zaidan add")
    expect(zaidanDocs).not.toContain("zaidan add https://")
    expect(zaidanDocs).toContain(
      "npx shadcn@latest add https://better-auth-ui.com/r/solid/auth.json"
    )
  })

  it("keeps Zaidan plugin docs linked to the focused Solid runtime track", () => {
    const solidQueriesDoc = collectFiles(
      resolve(__dirname, "../../../apps/docs/content/docs/solid/queries")
    )
      .filter((path) => path.endsWith(".mdx"))
      .map((path) => readFileSync(path, "utf8"))
      .join("\n")
    const solidMutationsDoc = collectFiles(
      resolve(__dirname, "../../../apps/docs/content/docs/solid/mutations")
    )
      .filter((path) => path.endsWith(".mdx"))
      .map((path) => readFileSync(path, "utf8"))
      .join("\n")
    const solidSsrDoc = readFileSync(
      resolve(__dirname, "../../../apps/docs/content/docs/solid/ssr.mdx"),
      "utf8"
    )
    const zaidanPluginDocs = collectFiles(
      resolve(__dirname, "../../../apps/docs/content/docs/zaidan/plugins")
    )
      .filter((path) => path.endsWith(".mdx"))
      .map((path) => readFileSync(path, "utf8"))
      .join("\n")
    const providers = readFileSync(
      resolve(__dirname, "../src/components/providers.tsx"),
      "utf8"
    )

    const implementedPluginPayloads = [
      "username",
      "passkey",
      "multi-session",
      "api-key",
      "delete-user",
      "magic-link",
      "theme"
    ]

    for (const payload of implementedPluginPayloads) {
      expect(solidRegistryManifest.items.map((item) => item.name)).toContain(
        payload
      )
      expect(zaidanPluginDocs).toContain(`/r/solid/${payload}.json`)
      expect(solidQueriesDoc).not.toContain(`/r/solid/${payload}.json`)
      expect(solidMutationsDoc).not.toContain(`/r/solid/${payload}.json`)
      expect(solidSsrDoc).not.toContain(`/r/solid/${payload}.json`)
    }

    const stalePendingClaims = [
      "dialogs still pending",
      "actions still pending",
      "create/delete dialogs still pending",
      "Not shown in the current Solid registry"
    ]

    for (const staleClaim of stalePendingClaims) {
      expect(zaidanPluginDocs).not.toContain(staleClaim)
    }

    expect(providers).toContain("github")
    expect(zaidanPluginDocs).not.toContain("/docs/solid/plugins")
    expect(zaidanPluginDocs).toContain("/docs/solid")
    expect(solidMutationsDoc).toContain("signInMagicLinkOptions")
    expect(solidMutationsDoc).toContain("createApiKeyOptions")
    expect(solidQueriesDoc).toContain("listPasskeysOptions")
    expect(solidQueriesDoc).toContain("listApiKeysOptions")
    expect(solidSsrDoc).toContain("@better-auth-ui/core/server")
  })

  it("keeps the top-level Solid and Zaidan docs IA ownership explicit", () => {
    const rootMeta = readJson<{
      pages: string[]
    }>(resolve(__dirname, "../../../apps/docs/content/docs/meta.json"))
    const solidMeta = readJson<{
      description: string
      pages: string[]
      root: boolean
      title: string
    }>(resolve(__dirname, "../../../apps/docs/content/docs/solid/meta.json"))
    const solidQueriesMeta = readJson<{
      pages: string[]
    }>(
      resolve(
        __dirname,
        "../../../apps/docs/content/docs/solid/queries/meta.json"
      )
    )
    const solidMutationsMeta = readJson<{
      pages: string[]
    }>(
      resolve(
        __dirname,
        "../../../apps/docs/content/docs/solid/mutations/meta.json"
      )
    )
    const zaidanMeta = readJson<{
      description: string
      pages: string[]
      root: boolean
      title: string
    }>(resolve(__dirname, "../../../apps/docs/content/docs/zaidan/meta.json"))
    const zaidanPluginsMeta = readJson<{
      pages: string[]
    }>(
      resolve(
        __dirname,
        "../../../apps/docs/content/docs/zaidan/plugins/meta.json"
      )
    )
    const zaidanComponentsMeta = readJson<{
      pages: string[]
    }>(
      resolve(
        __dirname,
        "../../../apps/docs/content/docs/zaidan/components/meta.json"
      )
    )
    const zaidanConceptsMeta = readJson<{
      pages: string[]
    }>(
      resolve(
        __dirname,
        "../../../apps/docs/content/docs/zaidan/concepts/meta.json"
      )
    )
    const zaidanIntegrationsMeta = readJson<{
      pages: string[]
    }>(
      resolve(
        __dirname,
        "../../../apps/docs/content/docs/zaidan/integrations/meta.json"
      )
    )
    const solidOverview = readFileSync(
      resolve(__dirname, "../../../apps/docs/content/docs/solid/index.mdx"),
      "utf8"
    )
    const zaidanOverview = readFileSync(
      resolve(__dirname, "../../../apps/docs/content/docs/zaidan/index.mdx"),
      "utf8"
    )
    const zaidanAdditionalFields = readFileSync(
      resolve(
        __dirname,
        "../../../apps/docs/content/docs/zaidan/concepts/additional-fields.mdx"
      ),
      "utf8"
    )
    const zaidanTanstackStart = readFileSync(
      resolve(
        __dirname,
        "../../../apps/docs/content/docs/zaidan/integrations/tanstack-start.mdx"
      ),
      "utf8"
    )
    const solidAndZaidanDocs = collectFiles(
      resolve(__dirname, "../../../apps/docs/content/docs")
    ).filter(
      (path) =>
        /\/docs\/(solid|zaidan)\//.test(path) && /\.(mdx|json)$/.test(path)
    )

    expect(rootMeta.pages).toEqual([
      "index",
      "shadcn",
      "heroui",
      "react",
      "solid",
      "zaidan"
    ])
    expect(solidMeta).toMatchObject({
      title: "Solid",
      description: "Solid package and runtime APIs",
      root: true
    })
    expect(solidMeta.pages).toEqual(["index", "queries", "mutations", "ssr"])
    expect(solidQueriesMeta.pages).toEqual([
      "index",
      "---Auth---",
      "session",
      "user",
      "authenticate",
      "---Settings---",
      "list-accounts",
      "account-info",
      "list-sessions",
      "list-device-sessions",
      "list-passkeys",
      "list-api-keys",
      "---Organization---",
      "active-organization",
      "full-organization",
      "list-organizations",
      "list-members",
      "list-invitations",
      "list-user-invitations",
      "has-permission"
    ])
    expect(solidMutationsMeta.pages).toEqual([
      "index",
      "---Auth---",
      "sign-in-email",
      "sign-in-username",
      "sign-in-magic-link",
      "sign-in-passkey",
      "sign-in-social",
      "sign-up-email",
      "sign-out",
      "request-password-reset",
      "reset-password",
      "send-verification-email",
      "is-username-available",
      "---Settings---",
      "update-user",
      "change-email",
      "change-password",
      "delete-user",
      "link-social",
      "unlink-account",
      "add-passkey",
      "delete-passkey",
      "revoke-session",
      "revoke-multi-session",
      "set-active-session",
      "create-api-key",
      "delete-api-key",
      "---Organization---",
      "create-organization",
      "update-organization",
      "delete-organization",
      "set-active-organization",
      "invite-member",
      "remove-member",
      "update-member-role",
      "leave-organization",
      "accept-invitation",
      "cancel-invitation",
      "reject-invitation",
      "check-organization-slug"
    ])
    expect(zaidanMeta).toMatchObject({
      title: "Zaidan",
      description: "Solid/Zaidan components",
      root: true
    })
    expect(zaidanMeta.pages).toEqual([
      "index",
      "integrations",
      "concepts",
      "plugins",
      "components"
    ])
    expect(zaidanPluginsMeta.pages).toEqual([
      "api-key",
      "captcha",
      "delete-user",
      "magic-link",
      "multi-session",
      "organization",
      "passkey",
      "theme",
      "username"
    ])
    expect(zaidanComponentsMeta.pages).toEqual([
      "---Provider---",
      "auth-provider",
      "---User---",
      "user-avatar",
      "user-button",
      "user-view",
      "---Auth---",
      "auth",
      "sign-in",
      "sign-up",
      "sign-out",
      "forgot-password",
      "reset-password",
      "verify-email",
      "---Settings---",
      "settings",
      "account-settings",
      "user-profile",
      "change-email",
      "security-settings",
      "change-password",
      "linked-accounts",
      "active-sessions",
      "---Email---",
      "email/email-verification-email",
      "email/magic-link-email",
      "email/reset-password-email",
      "email/password-changed-email",
      "email/email-changed-email",
      "email/otp-email",
      "email/new-device-email",
      "email/organization-invitation-email"
    ])
    expect(zaidanConceptsMeta.pages).toEqual(["additional-fields"])
    expect(zaidanIntegrationsMeta.pages).toEqual(["tanstack-start"])
    expect(solidOverview).toContain("Solid package/runtime track")
    expect(solidOverview).toContain("/docs/zaidan")
    expect(solidOverview).toContain("/docs/zaidan/integrations/tanstack-start")
    expect(solidOverview).not.toContain("/docs/solid/integrations")
    expect(solidOverview).not.toContain("Solid Start")
    expect(solidOverview).not.toContain("Zaidan registry entry points")
    expect(zaidanOverview).toContain("title: Quick Start")
    expect(zaidanOverview).toContain(
      "npx shadcn@latest add https://better-auth-ui.com/r/solid/auth.json"
    )
    expect(zaidanOverview).toContain(
      "npx shadcn@latest add https://better-auth-ui.com/r/solid/settings.json https://better-auth-ui.com/r/solid/user-button.json"
    )
    expect(zaidanOverview).toContain("/docs/zaidan/integrations/tanstack-start")
    expect(zaidanOverview).not.toContain("title: Overview")
    expect(zaidanAdditionalFields).toContain("title: Additional Fields")
    expect(zaidanAdditionalFields).toContain("AdditionalFieldProps")
    expect(zaidanTanstackStart).toContain("title: TanStack Start")
    expect(zaidanTanstackStart).toContain("## Protecting Routes")
    expect(zaidanTanstackStart).toContain("useAuthenticate")
    expect(zaidanTanstackStart).not.toContain("Solid Start")
    expect(zaidanOverview).toContain(
      "https://better-auth-ui.com/r/solid/registry.json"
    )
    expectDocsPagesExist(
      resolve(__dirname, "../../../apps/docs/content/docs/solid"),
      solidMeta.pages
    )
    expectDocsPagesExist(
      resolve(__dirname, "../../../apps/docs/content/docs/zaidan"),
      zaidanMeta.pages
    )
    expectDocsPagesExist(
      resolve(__dirname, "../../../apps/docs/content/docs/zaidan/plugins"),
      zaidanPluginsMeta.pages
    )
    expectDocsPagesExist(
      resolve(__dirname, "../../../apps/docs/content/docs/zaidan/components"),
      zaidanComponentsMeta.pages
    )
    expectDocsPagesExist(
      resolve(__dirname, "../../../apps/docs/content/docs/zaidan/concepts"),
      zaidanConceptsMeta.pages
    )
    expectDocsPagesExist(
      resolve(__dirname, "../../../apps/docs/content/docs/zaidan/integrations"),
      zaidanIntegrationsMeta.pages
    )
    expect(
      existsSync(
        resolve(
          __dirname,
          "../../../apps/docs/content/docs/zaidan/plugins/index.mdx"
        )
      )
    ).toBe(false)
    expect(
      existsSync(
        resolve(
          __dirname,
          "../../../apps/docs/content/docs/solid/integrations.mdx"
        )
      )
    ).toBe(false)
    expect(
      existsSync(
        resolve(__dirname, "../../../apps/docs/content/docs/solid/plugins.mdx")
      )
    ).toBe(false)
    expect(
      existsSync(
        resolve(__dirname, "../../../apps/docs/content/docs/solid/gaps.mdx")
      )
    ).toBe(false)
    expect(
      existsSync(
        resolve(__dirname, "../../../apps/docs/content/docs/solid/registry.mdx")
      )
    ).toBe(false)
    expect(
      existsSync(
        resolve(__dirname, "../../../apps/docs/content/docs/solid/server.mdx")
      )
    ).toBe(false)
    expect(
      existsSync(
        resolve(
          __dirname,
          "../../../apps/docs/content/docs/zaidan/components/index.mdx"
        )
      )
    ).toBe(false)
    expect(solidAndZaidanDocs.length).toBeGreaterThan(0)

    for (const docsPath of solidAndZaidanDocs) {
      const content = readFileSync(docsPath, "utf8")

      expect(content).not.toContain("coverage table")
      expect(content).not.toContain("Coverage table")
      expect(content).not.toContain("coverage matrix")
      expect(content).not.toContain("Coverage matrix")
    }
  })

  it("keeps Solid package docs focused on runtime APIs instead of registry installation", () => {
    const solidDocsRoot = resolve(
      __dirname,
      "../../../apps/docs/content/docs/solid"
    )
    const packageDocPaths = [
      "index.mdx",
      "queries/index.mdx",
      "queries/list-accounts.mdx",
      "queries/list-passkeys.mdx",
      "mutations/index.mdx",
      "mutations/create-api-key.mdx",
      "mutations/sign-in-username.mdx",
      "ssr.mdx"
    ]
    const solidPackageDocs = packageDocPaths.map((path) => ({
      name: path,
      content: readFileSync(resolve(solidDocsRoot, path), "utf8")
    }))
    const combinedSolidPackageDocs = solidPackageDocs
      .map(({ content }) => content)
      .join("\n")

    expect(combinedSolidPackageDocs).toContain(
      "`@better-auth-ui/solid` owns provider wiring and Solid hooks; core owns shared option factories/helpers"
    )
    expect(combinedSolidPackageDocs).toContain("ensureSession")
    expect(combinedSolidPackageDocs).toContain("prefetchSession")
    expect(combinedSolidPackageDocs).toContain("fetchSession")
    expect(combinedSolidPackageDocs).toContain("useSession")
    expect(combinedSolidPackageDocs).toContain("listAccountsOptions")
    expect(combinedSolidPackageDocs).toContain("listPasskeysOptions")
    expect(combinedSolidPackageDocs).toContain("createApiKeyOptions")
    expect(combinedSolidPackageDocs).toContain("signInUsernameOptions")
    expect(combinedSolidPackageDocs).toContain("@better-auth-ui/core/server")
    expect(combinedSolidPackageDocs).toContain(
      "@better-auth-ui/solid/plugins/api-key"
    )

    for (const { name, content } of solidPackageDocs) {
      expect(
        content,
        `${name} should not duplicate install commands`
      ).not.toContain("zaidan add")
      expect(
        content,
        `${name} should not own registry payload URLs`
      ).not.toContain("/r/solid/")
    }
  })

  it("keeps Solid and Zaidan docs cross-links resolvable without stale registry ownership", () => {
    const docsRoot = resolve(__dirname, "../../../apps/docs/content/docs")
    const solidAndZaidanDocs = collectFiles(docsRoot).filter(
      (path) =>
        /\/docs\/(solid|zaidan)\//.test(path) && /\.(mdx|json)$/.test(path)
    )
    const registryPayloadNames = new Set([
      "registry.json",
      ...solidRegistryManifest.items.map((item) => `${item.name}.json`)
    ])

    for (const docsPath of solidAndZaidanDocs) {
      const content = readFileSync(docsPath, "utf8")

      if (!docsPath.includes("/zaidan/components/email/")) {
        expect(
          content,
          `${docsPath} should not claim live Solid previews`
        ).not.toContain("ComponentPreview")
        expect(
          content,
          `${docsPath} should not claim live Solid previews`
        ).not.toContain("live Solid preview")
      }
      expect(
        content,
        `${docsPath} should not keep stale pending claims`
      ).not.toContain("Not shown in the current Solid registry")
      expect(
        content,
        `${docsPath} should not keep stale pending claims`
      ).not.toContain("dialogs still pending")

      for (const link of extractLocalDocsLinks(content)) {
        const candidates = docsRouteToFileCandidates(docsRoot, link)
        expect(
          candidates.some((candidate) => existsSync(candidate)),
          `Expected ${docsPath} to link to an existing docs route: ${link}`
        ).toBe(true)
      }

      for (const payload of extractSolidRegistryLinks(content)) {
        expect(
          registryPayloadNames.has(payload),
          `Expected ${docsPath} to link to an existing Solid registry payload: ${payload}`
        ).toBe(true)
      }
    }
  })

  it("documents Zaidan quickstart, registry ownership, plugins, and component payloads without skeleton language", () => {
    const zaidanDocsRoot = resolve(
      __dirname,
      "../../../apps/docs/content/docs/zaidan"
    )
    const zaidanDocs = collectFiles(zaidanDocsRoot).filter((path) =>
      /\.(mdx|json)$/.test(path)
    )
    const readZaidanDoc = (relativePath: string) =>
      readFileSync(resolve(zaidanDocsRoot, relativePath), "utf8")
    const componentDoc = (name: string) =>
      readZaidanDoc(`components/${name}.mdx`)
    const pluginDoc = (name: string) => readZaidanDoc(`plugins/${name}.mdx`)

    const quickStart = readZaidanDoc("index.mdx")
    const integrations = readZaidanDoc("integrations/tanstack-start.mdx")
    const additionalFields = readZaidanDoc("concepts/additional-fields.mdx")
    const pluginPayloadNames = [
      "username",
      "passkey",
      "multi-session",
      "api-key",
      "delete-user",
      "magic-link",
      "theme"
    ]
    const runtimeOnlyPluginNames = ["captcha"]
    const hiddenComponentDocNames = ["organization"]
    const emailPayloadNames = [
      "email-verification-email",
      "magic-link-email",
      "reset-password-email",
      "password-changed-email",
      "email-changed-email",
      "otp-email",
      "new-device-email",
      "organization-invitation-email"
    ]
    const componentPayloadNames = solidRegistryManifest.items
      .map((item) => item.name)
      .filter(
        (name) =>
          !pluginPayloadNames.includes(name) &&
          !hiddenComponentDocNames.includes(name)
      )

    expect(quickStart).toContain("title: Quick Start")
    expect(quickStart).toContain("## Prerequisites")
    expect(quickStart).toContain("## Installation")
    expect(quickStart).toContain(
      "npx shadcn@latest add https://better-auth-ui.com/r/solid/auth.json"
    )
    expect(quickStart).toContain(
      "npx shadcn@latest add https://better-auth-ui.com/r/solid/settings.json https://better-auth-ui.com/r/solid/user-button.json"
    )
    expect(quickStart).not.toContain(
      "npx shadcn@latest add https://better-auth-ui.com/r/solid/auth-provider.json"
    )
    expect(quickStart).toContain("/docs/zaidan/integrations/tanstack-start")
    expect(quickStart).not.toContain("title: Overview")

    expect(integrations).toContain("## Integration")
    expect(integrations).toContain("title: TanStack Start")
    expect(integrations).toContain("## Protecting Routes")
    expect(integrations).toContain("createIsomorphicFn")
    expect(integrations).toContain("useAuthenticate")
    expect(integrations).toContain("@tanstack/solid-start")
    expect(integrations).not.toContain("Solid Start")

    expect(additionalFields).toContain("title: Additional Fields")
    expect(additionalFields).toContain("## Usage")
    expect(additionalFields).toContain("## Field types")
    expect(additionalFields).toContain("## Input types")
    expect(additionalFields).toContain("AdditionalFieldProps")
    expect(additionalFields).toContain("class")
    expect(additionalFields).toContain(
      "npx shadcn@latest add https://better-auth-ui.com/r/solid/additional-field.json"
    )

    expect(existsSync(resolve(zaidanDocsRoot, "registry.mdx"))).toBe(false)

    expect(existsSync(resolve(zaidanDocsRoot, "components/index.mdx"))).toBe(
      false
    )
    expect(existsSync(resolve(zaidanDocsRoot, "plugins/index.mdx"))).toBe(false)

    const expectedComponentTitles: Record<string, string> = {
      "account-settings": "<AccountSettings />",
      "active-sessions": "<ActiveSessions />",
      auth: "<Auth />",
      "auth-provider": "<AuthProvider />",
      "change-email": "<ChangeEmail />",
      "change-password": "<ChangePassword />",
      "forgot-password": "<ForgotPassword />",
      "linked-accounts": "<LinkedAccounts />",
      "reset-password": "<ResetPassword />",
      "security-settings": "<SecuritySettings />",
      settings: "<Settings />",
      "sign-in": "<SignIn />",
      "sign-out": "<SignOut />",
      "sign-up": "<SignUp />",
      "user-avatar": "<UserAvatar />",
      "user-button": "<UserButton />",
      "user-profile": "<UserProfile />",
      "user-view": "<UserView />",
      "verify-email": "<VerifyEmail />"
    }

    for (const [name, title] of Object.entries(expectedComponentTitles)) {
      expect(
        extractFrontmatterTitle(componentDoc(name)),
        `Zaidan component docs should use shadcn-style JSX title for ${name}`
      ).toBe(title)
    }

    for (const name of componentPayloadNames) {
      const isEmailPayload = emailPayloadNames.includes(name)
      const page =
        name === "additional-field"
          ? additionalFields
          : isEmailPayload
            ? componentDoc(`email/${name}`)
            : componentDoc(name)
      const item = solidRegistryManifest.items.find(
        (entry) => entry.name === name
      )

      expect(page, `component ${name} should link its payload`).toContain(
        `/r/solid/${name}.json`
      )
      expect(
        page,
        `component ${name} should include install command`
      ).toContain(
        `npx shadcn@latest add https://better-auth-ui.com/r/solid/${name}.json`
      )

      if (!isEmailPayload) {
        expect(
          page,
          `component ${name} should identify copied files`
        ).toContain(item?.files[0]?.path)
        expect(page, `component ${name} should explain ownership`).toContain(
          "After install"
        )
      }
    }

    for (const name of pluginPayloadNames) {
      const page = pluginDoc(name)

      expect(page, `plugin ${name} should link its registry entry`).toContain(
        `/r/solid/${name}.json`
      )

      if (name === "api-key") {
        expect(page, "api-key should keep copied files inside setup").toContain(
          "This drops the following into your codebase:"
        )
      } else if (
        name === "delete-user" ||
        name === "magic-link" ||
        name === "multi-session" ||
        name === "theme" ||
        name === "username"
      ) {
        expect(page, `${name} should keep setup-driven structure`).toContain(
          "## Setup"
        )
      } else {
        expect(page, `plugin ${name} should state prerequisites`).toContain(
          "## Runtime prerequisites"
        )
        expect(page, `plugin ${name} should state copied files`).toContain(
          "## Copied files"
        )
      }

      if (name !== "delete-user" && name !== "theme" && name !== "username") {
        expect(page, `plugin ${name} should link Solid runtime docs`).toContain(
          "/docs/solid"
        )
      }
      expect(page).not.toContain("/docs/solid/plugins")
    }

    for (const name of runtimeOnlyPluginNames) {
      const page = pluginDoc(name)

      expect(
        page,
        `runtime-only plugin ${name} should not require registry`
      ).not.toContain(`/r/solid/${name}.json`)
      expect(
        page,
        `runtime-only plugin ${name} should link Solid runtime`
      ).toContain("@better-auth-ui/solid/plugins/captcha")
      expect(
        page,
        `runtime-only plugin ${name} should explain setup`
      ).toContain("## Setup")
    }

    for (const name of ["sign-in", "sign-up", "forgot-password"]) {
      const registryEntry = readFileSync(
        resolve(__dirname, `../../../apps/docs/public/r/solid/${name}.json`),
        "utf8"
      )

      expect(
        registryEntry,
        `${name} should publish captcha slot support`
      ).toContain("useFetchOptions")
      expect(
        registryEntry,
        `${name} should publish captcha slot support`
      ).toContain("captchaComponent")
      expect(
        registryEntry,
        `${name} should publish captcha header forwarding`
      ).toContain("fetchOptions: fetchOptions()")
    }

    const deleteUserPluginDoc = pluginDoc("delete-user")
    const deleteUserRegistryEntry = readFileSync(
      resolve(__dirname, "../../../apps/docs/public/r/solid/delete-user.json"),
      "utf8"
    )

    expect(deleteUserPluginDoc).toContain("## Setup")
    expect(deleteUserPluginDoc).toContain("## Components")
    expect(deleteUserPluginDoc).toContain("## Options")
    expect(deleteUserPluginDoc).toContain("## Localization")
    expect(deleteUserPluginDoc).toContain("<ZaidanStory")
    expect(deleteUserPluginDoc).toContain(
      'storyId="zaidan-plugins-delete-user--danger-zone-preview"'
    )
    expect(deleteUserPluginDoc).toContain("user: {")
    expect(deleteUserPluginDoc).toContain("deleteUser: {")
    expect(deleteUserPluginDoc).toContain(
      "npx shadcn@latest add https://better-auth-ui.com/r/solid/delete-user.json"
    )
    expect(deleteUserPluginDoc).toContain(
      'import { deleteUserPlugin } from "@better-auth-ui/core/plugins/delete-user"'
    )
    expect(deleteUserPluginDoc).toContain("plugins={[deleteUserPlugin()]}")
    expect(deleteUserPluginDoc).toContain('name="DangerZoneProps"')
    expect(deleteUserPluginDoc).toContain('name="DeleteAccountProps"')
    expect(deleteUserPluginDoc).toContain('name="DeleteUserPluginOptions"')
    expect(deleteUserPluginDoc).toContain('name="DeleteUserLocalization"')
    expect(deleteUserPluginDoc).not.toContain("## Runtime prerequisites")
    expect(deleteUserPluginDoc).not.toContain("## Runtime API references")
    expect(deleteUserPluginDoc).not.toContain('name="DeleteUserParams"')
    expect(deleteUserPluginDoc).not.toContain("payload")
    expect(deleteUserPluginDoc).not.toContain("@/lib/auth/delete-user-plugin")
    expect(deleteUserPluginDoc).not.toContain(
      "src/lib/auth/delete-user-plugin.ts"
    )
    expect(deleteUserPluginDoc).not.toContain("className")
    expect(deleteUserPluginDoc).not.toContain("ComponentPreview")
    expect(deleteUserRegistryEntry).toContain("export type DangerZoneProps")
    expect(deleteUserRegistryEntry).toContain("export type DeleteAccountProps")
    expect(deleteUserRegistryEntry).toContain(
      'class={cn(\\"flex w-full flex-col\\", props.class)}'
    )
    expect(deleteUserRegistryEntry).toContain(
      'class={cn(\\"z-card-padding-none border-destructive\\", props.class)}'
    )

    const magicLinkPluginDoc = pluginDoc("magic-link")
    const multiSessionPluginDoc = pluginDoc("multi-session")
    const multiSessionStory = readFileSync(
      resolve(__dirname, "../src/stories/multi-session.stories.tsx"),
      "utf8"
    )
    const organizationStory = readFileSync(
      resolve(__dirname, "../src/stories/organization.stories.tsx"),
      "utf8"
    )

    expect(magicLinkPluginDoc).toContain("## Setup")
    expect(magicLinkPluginDoc).toContain("## Components")
    expect(magicLinkPluginDoc).toContain("## Options")
    expect(magicLinkPluginDoc).toContain("## Localization")
    expect(magicLinkPluginDoc).toContain("## Email template")
    expect(magicLinkPluginDoc).toContain("## Passwordless-only")
    expect(magicLinkPluginDoc).toContain(
      "npx shadcn@latest add https://better-auth-ui.com/r/solid/magic-link.json"
    )
    expect(magicLinkPluginDoc).toContain("magicLink({")
    expect(magicLinkPluginDoc).toContain("sendMagicLink")
    expect(magicLinkPluginDoc).toContain("magicLinkClient()")
    expect(magicLinkPluginDoc).toContain(
      'import { magicLinkPlugin } from "@/lib/auth/magic-link-plugin"'
    )
    expect(magicLinkPluginDoc).toContain("plugins={[magicLinkPlugin()]}")
    expect(magicLinkPluginDoc).toContain(
      "Object.values(magicLinkPlugin().viewPaths.auth)"
    )
    expect(magicLinkPluginDoc).toContain("src/lib/auth/magic-link-plugin.ts")
    expect(magicLinkPluginDoc).toContain("src/components/auth/magic-link.tsx")
    expect(magicLinkPluginDoc).toContain(
      "src/components/auth/magic-link-button.tsx"
    )
    expect(magicLinkPluginDoc).toContain("<ZaidanStory")
    expect(magicLinkPluginDoc).toContain(
      'storyId="zaidan-plugins-magic-link--preview"'
    )
    expect(magicLinkPluginDoc).toContain('name="MagicLinkProps"')
    expect(magicLinkPluginDoc).toContain('name="MagicLinkPluginOptions"')
    expect(magicLinkPluginDoc).toContain('name="MagicLinkLocalization"')
    expect(magicLinkPluginDoc).toContain("real email provider")
    expect(magicLinkPluginDoc).not.toContain("payload")
    expect(magicLinkPluginDoc).not.toContain("ComponentPreview")
    expect(magicLinkPluginDoc).not.toContain("className")
    expect(magicLinkPluginDoc).not.toContain("better-auth/react")
    expect(magicLinkPluginDoc).not.toContain("@tanstack/react-router")
    expect(magicLinkPluginDoc).not.toContain("useAuthPlugin")
    expect(multiSessionPluginDoc).toContain("## Setup")
    expect(multiSessionPluginDoc).toContain("## Components")
    expect(multiSessionPluginDoc).toContain("## Options")
    expect(multiSessionPluginDoc).toContain("## Localization")
    expect(multiSessionPluginDoc).toContain("## Session management")
    expect(multiSessionPluginDoc).toContain(
      "npx shadcn@latest add https://better-auth-ui.com/r/solid/multi-session.json"
    )
    expect(multiSessionPluginDoc).toContain("multiSession()")
    expect(multiSessionPluginDoc).toContain("multiSessionClient()")
    expect(multiSessionPluginDoc).toContain(
      'import { multiSessionPlugin } from "@/lib/auth/multi-session-plugin"'
    )
    expect(multiSessionPluginDoc).toContain("plugins={[multiSessionPlugin()]}")
    expect(multiSessionPluginDoc).toContain(
      "src/lib/auth/multi-session-plugin.ts"
    )
    expect(multiSessionPluginDoc).toContain(
      "src/components/auth/multi-session/manage-account.tsx"
    )
    expect(multiSessionPluginDoc).toContain(
      "src/components/auth/multi-session/manage-accounts.tsx"
    )
    expect(multiSessionPluginDoc).toContain(
      "src/components/auth/multi-session/switch-account-submenu.tsx"
    )
    expect(multiSessionPluginDoc).toContain(
      "src/components/auth/multi-session/switch-account-submenu-content.tsx"
    )
    expect(multiSessionPluginDoc).toContain(
      "src/components/auth/multi-session/switch-account-submenu-item.tsx"
    )
    expect(multiSessionPluginDoc).toContain("<ZaidanStory")
    expect(multiSessionPluginDoc).toContain(
      'storyId="zaidan-plugins-multi-session--manage-accounts-preview"'
    )
    expect(multiSessionPluginDoc).toContain(
      'storyId="zaidan-plugins-multi-session--switch-account-preview"'
    )
    expect(multiSessionPluginDoc).toContain('name="ManageAccountsProps"')
    expect(multiSessionPluginDoc).toContain('name="SwitchAccountSubmenuProps"')
    expect(multiSessionPluginDoc).toContain('name="MultiSessionPluginOptions"')
    expect(multiSessionPluginDoc).toContain('name="MultiSessionLocalization"')
    expect(multiSessionPluginDoc).toContain("listDeviceSessionsOptions")
    expect(multiSessionPluginDoc).toContain("setActiveSessionOptions")
    expect(multiSessionPluginDoc).toContain("revokeMultiSessionOptions")
    expect(multiSessionPluginDoc).not.toContain("payload")
    expect(multiSessionPluginDoc).not.toContain("ComponentPreview")
    expect(multiSessionPluginDoc).not.toContain("className")
    expect(multiSessionPluginDoc).not.toContain("better-auth/react")
    expect(multiSessionPluginDoc).not.toContain("@tanstack/react-router")
    expect(multiSessionStory).toContain('title: "Zaidan/Plugins/Multi Session"')
    expect(multiSessionStory).toContain("export const ManageAccountsPreview")
    expect(multiSessionStory).toContain("export const SwitchAccountPreview")
    expect(multiSessionStory).toContain("plugins={[multiSessionPlugin()]}")
    expect(multiSessionStory).toContain("multiSessionQueryKeys.list")
    expect(multiSessionStory).toContain("RouterProvider")
    expect(multiSessionStory).toContain("createMemoryHistory")

    const organizationPluginDoc = pluginDoc("organization")
    const organizationRegistry = readFileSync(
      resolve(__dirname, "../../../apps/docs/public/r/solid/organization.json"),
      "utf8"
    )
    const organizationPayload = parseJson<{
      registryDependencies: string[]
    }>(organizationRegistry, "apps/docs/public/r/solid/organization.json")
    const solidRegistry = readFileSync(
      resolve(__dirname, "../../../apps/docs/public/r/solid/registry.json"),
      "utf8"
    )

    expect(organizationPluginDoc).toContain("## Setup")
    expect(organizationPluginDoc).toContain("### Install the server plugin")
    expect(organizationPluginDoc).toContain(
      "### Install the matching client plugin"
    )
    expect(organizationPluginDoc).toContain("### Install the UI plugin")
    expect(organizationPluginDoc).toContain("### Register the UI plugin")
    expect(organizationPluginDoc).toContain(
      "### Mount the organization switcher"
    )
    expect(organizationPluginDoc).toContain(
      "### Allow the `organizations` settings path"
    )
    expect(organizationPluginDoc).toContain("### Create the organization page")
    expect(organizationPluginDoc).toContain("## Slug-based routes")
    expect(organizationPluginDoc).toContain(
      "### Customize where the switcher navigates"
    )
    expect(organizationPluginDoc).toContain("## Options")
    expect(organizationPluginDoc).toContain("## Localization")
    expect(organizationPluginDoc).toContain("## Solid Hooks")
    expect(organizationPluginDoc).toContain("### Queries")
    expect(organizationPluginDoc).toContain("### Mutations")
    expect(organizationPluginDoc).toContain("## Components")
    expect(organizationPluginDoc).toContain("<ZaidanStory")
    expect(organizationPluginDoc).toContain(
      'storyId="zaidan-plugins-organization--organization-switcher-preview"'
    )
    expect(organizationPluginDoc).toContain(
      'storyId="zaidan-plugins-organization--organization-preview"'
    )
    expect(organizationPluginDoc).toContain(
      'storyId="zaidan-plugins-organization--organization-settings-preview"'
    )
    expect(organizationPluginDoc).toContain(
      'storyId="zaidan-plugins-organization--organization-profile-preview"'
    )
    expect(organizationPluginDoc).toContain(
      'storyId="zaidan-plugins-organization--organization-danger-zone-preview"'
    )
    expect(organizationPluginDoc).toContain(
      'storyId="zaidan-plugins-organization--organization-people-preview"'
    )
    expect(organizationPluginDoc).toContain(
      'storyId="zaidan-plugins-organization--organization-members-preview"'
    )
    expect(organizationPluginDoc).toContain(
      'storyId="zaidan-plugins-organization--organization-invitations-preview"'
    )
    expect(organizationPluginDoc).toContain(
      'storyId="zaidan-plugins-organization--organizations-settings-preview"'
    )
    expect(organizationPluginDoc).toContain(
      'storyId="zaidan-plugins-organization--user-invitations-preview"'
    )
    expect(organizationPluginDoc).toContain(
      "file=<rootDir>/../../examples/start-solid-zaidan-example/src/demos/organization/organization-switcher.tsx"
    )
    expect(organizationPluginDoc).toContain(
      "file=<rootDir>/../../examples/start-solid-zaidan-example/src/demos/organization/organization.tsx"
    )
    expect(organizationPluginDoc).toContain(
      "file=<rootDir>/../../examples/start-solid-zaidan-example/src/demos/organization/organization-settings.tsx"
    )
    expect(organizationPluginDoc).toContain(
      "file=<rootDir>/../../examples/start-solid-zaidan-example/src/demos/organization/organization-profile.tsx"
    )
    expect(organizationPluginDoc).toContain(
      "file=<rootDir>/../../examples/start-solid-zaidan-example/src/demos/organization/organization-danger-zone.tsx"
    )
    expect(organizationPluginDoc).toContain(
      "file=<rootDir>/../../examples/start-solid-zaidan-example/src/demos/organization/organization-people.tsx"
    )
    expect(organizationPluginDoc).toContain(
      "file=<rootDir>/../../examples/start-solid-zaidan-example/src/demos/organization/organization-members.tsx"
    )
    expect(organizationPluginDoc).toContain(
      "file=<rootDir>/../../examples/start-solid-zaidan-example/src/demos/organization/organization-invitations.tsx"
    )
    expect(organizationPluginDoc).toContain(
      "file=<rootDir>/../../examples/start-solid-zaidan-example/src/demos/organization/organizations-settings.tsx"
    )
    expect(organizationPluginDoc).toContain(
      "file=<rootDir>/../../examples/start-solid-zaidan-example/src/demos/organization/user-invitations.tsx"
    )
    expect(organizationPluginDoc).toContain('name="OrganizationProfileProps"')
    expect(organizationPluginDoc).toContain(
      'name="OrganizationDangerZoneProps"'
    )
    expect(organizationPluginDoc).toContain('name="OrganizationPeopleProps"')
    expect(organizationPluginDoc).toContain('name="OrganizationMembersProps"')
    expect(organizationPluginDoc).toContain(
      'name="OrganizationInvitationsProps"'
    )
    expect(organizationPluginDoc).toContain('name="OrganizationsSettingsProps"')
    expect(organizationPluginDoc).toContain('name="UserInvitationsProps"')
    expect(organizationPluginDoc).toContain('name="OrganizationsProps"')
    expect(organizationPluginDoc).toContain(
      'name="CreateOrganizationDialogProps"'
    )
    expect(organizationPluginDoc).toContain('name="InviteMemberDialogProps"')
    expect(organizationPluginDoc).toContain(
      'name="DeleteOrganizationDialogProps"'
    )
    expect(organizationPluginDoc).toContain("useParams({ strict: false })")
    expect(organizationPluginDoc).toContain(
      'Show keyed when={organizationSlug() ?? "personal"}'
    )
    expect(organizationPluginDoc).toContain("authClient={authClient}")
    expect(organizationPluginDoc).toContain("queryClient={props.queryClient}")
    expect(organizationPluginDoc).toContain("organizationPlugin({ slug")
    expect(organizationPluginDoc).toContain(
      'createFileRoute("/organization/$slug/$path")'
    )
    expect(organizationPluginDoc).toContain(
      "ensureSessionServer(queryClient, auth"
    )
    expect(organizationPluginDoc).toContain(
      "ensureSession(queryClient, authClient)"
    )
    expect(organizationPluginDoc).toContain(
      "validOrganizationPaths.includes(path)"
    )
    expect(organizationPluginDoc).toContain("/organization/$slug/$path")
    expect(organizationPluginDoc).toContain("non-slug page")
    expect(organizationPluginDoc).toContain("`null`")
    expect(organizationPluginDoc).toContain(
      "Copied Zaidan components are wired through `<AuthProvider>`"
    )
    expect(organizationPluginDoc).not.toContain("useAuth()")
    expect(organizationPluginDoc).toContain(
      "low-level `@better-auth-ui/solid` hooks"
    )
    expect(organizationPluginDoc).toContain("useActiveOrganization()")
    expect(organizationPluginDoc).toContain("useHasPermission()")
    expect(organizationPluginDoc).toContain("useCreateOrganization()")
    expect(organizationPluginDoc).toContain("useCheckSlug()")
    expect(organizationPluginDoc).not.toContain(
      "useCreateOrganization(authClient)"
    )
    expect(organizationPluginDoc).not.toContain("Server-side prefetching")
    expect(organizationPluginDoc).not.toContain("Deferred UI parity")
    expect(organizationPluginDoc).not.toContain(
      "Advanced invitation status actions"
    )
    expect(organizationPluginDoc).not.toContain(
      "remaining copied organization UI polish"
    )
    expect(organizationPluginDoc).toContain("members")
    expect(organizationPluginDoc).toContain("invitations")
    expect(organizationPluginDoc).toContain("profile")
    expect(organizationPluginDoc).toContain("delete")
    expect(organizationPluginDoc).toContain("organization-profile.tsx")
    expect(organizationPluginDoc).toContain("change-organization-logo.tsx")
    expect(organizationPluginDoc).toContain("organization-people.tsx")
    expect(organizationPluginDoc).toContain("user-invitations.tsx")
    expect(organizationPluginDoc).toContain("Accept / Reject actions")
    expect(organizationPluginDoc).not.toContain(
      "profile, role editing, logo upload"
    )
    expect(organizationPluginDoc).not.toContain("full Organization UI parity")
    expect(organizationPluginDoc).not.toContain(
      "organization API keys are deferred"
    )
    for (const removedComponentDoc of [
      "organizations-settings",
      "organization-people",
      "organization",
      "organization-switcher"
    ]) {
      expect(
        existsSync(
          resolve(zaidanDocsRoot, `components/${removedComponentDoc}.mdx`)
        ),
        `${removedComponentDoc} should not be published under Zaidan Components`
      ).toBe(false)
    }
    expect(organizationStory).toContain('title: "Zaidan/Plugins/Organization"')
    expect(organizationStory).toContain(
      "export const OrganizationSwitcherPreview"
    )
    expect(organizationStory).toContain(
      "export const OrganizationsSettingsPreview"
    )
    expect(organizationStory).toContain("organizationQueryKeys.list")
    expect(organizationStory).toContain(
      "organizationQueryKeys.activeOrganization"
    )
    expect(organizationStory).toContain(
      "organizationQueryKeys.userInvitations.list"
    )
    expect(organizationStory).toContain("RouterProvider")
    expect(organizationStory).toContain("createMemoryHistory")
    expect(organizationRegistry).toContain("organization-switcher.tsx")
    expect(organizationRegistry).toContain("create-organization-dialog.tsx")
    expect(organizationRegistry).toContain("slug-field.tsx")
    expect(organizationRegistry).toContain("trigger?: JSX.Element")
    expect(organizationRegistry).toContain(
      "setActive?: (organization: Organization | null) => void"
    )
    expect(organizationRegistry).toContain("hidePersonal?: boolean")
    expect(organizationRegistry).toContain("hideSettings?: boolean")
    expect(organizationRegistry).toContain("hideSlug?: boolean")
    expect(organizationRegistry).toContain("hideCreate?: boolean")
    expect(organizationRegistry).toContain("CreateOrganizationDialog")
    expect(organizationRegistry).toContain("useCheckSlug")
    expect(organizationRegistry).toContain("organization-row.tsx")
    expect(organizationPayload.registryDependencies).toEqual([
      solidRegistryUrl("user-view")
    ])
    const authProviderPayload = readJson<{
      registryDependencies: string[]
    }>(
      resolve(__dirname, "../../../apps/docs/public/r/solid/auth-provider.json")
    )
    expect(authProviderPayload.registryDependencies).toEqual(
      expect.arrayContaining([
        "@zaidan/badge",
        "@zaidan/input-group",
        "@zaidan/spinner",
        "@zaidan/table",
        "@zaidan/textarea"
      ])
    )
    expect(organizationRegistry).not.toContain("src/components/ui/table.tsx")
    expect(organizationRegistry).not.toContain("src/components/ui/badge.tsx")
    expect(organizationRegistry).not.toContain("src/components/ui/spinner.tsx")
    expect(organizationRegistry).not.toContain(
      "src/components/ui/input-group.tsx"
    )
    expect(organizationRegistry).not.toContain("src/components/ui/textarea.tsx")
    expect(organizationRegistry).toContain("InputGroupInput")
    expect(organizationRegistry).toContain("SortableTableHead")
    expect(organizationRegistry).toContain("SortDescriptor")
    expect(organizationRegistry).toContain("SortDirection")
    expect(organizationRegistry).toContain("sortDescriptor")
    expect(organizationRegistry).toContain("toggleSort")
    expect(organizationRegistry).toContain("descending")
    expect(organizationRegistry).toContain("TableHeader")
    expect(organizationRegistry).toContain("TableBody")
    expect(organizationRegistry).toContain("TableHead")
    expect(organizationRegistry).toContain("TableCell")
    expect(organizationRegistry).toContain("organization-members.tsx")
    expect(organizationRegistry).toContain("organization-member-row.tsx")
    expect(organizationRegistry).toContain(
      "organization-member-row-skeleton.tsx"
    )
    expect(organizationRegistry).toContain("organization-invitations.tsx")
    expect(organizationRegistry).toContain("organization-invitation-row.tsx")
    expect(organizationRegistry).toContain(
      "organization-invitation-row-skeleton.tsx"
    )
    expect(organizationRegistry).toContain("organization-invitations-empty.tsx")
    expect(organizationRegistry).toContain("organization-settings.tsx")
    expect(organizationRegistry).toContain("user-invitations.tsx")
    expect(organizationRegistry).toContain("user-invitation-row.tsx")
    expect(organizationRegistry).toContain("user-invitation-row-skeleton.tsx")
    expect(organizationRegistry).toContain("user-invitations-empty.tsx")
    expect(organizationRegistry).toContain("UserInvitations")
    expect(organizationRegistry).toContain("useListUserInvitations")
    expect(organizationRegistry).toContain("useAcceptInvitation")
    expect(organizationRegistry).toContain("useRejectInvitation")
    expect(organizationRegistry).toContain("acceptInvitation.mutate")
    expect(organizationRegistry).toContain("rejectInvitation.mutate")
    expect(organizationRegistry).toContain("organization-profile.tsx")
    expect(organizationRegistry).toContain("organization-logo.tsx")
    expect(organizationRegistry).toContain("change-organization-logo.tsx")
    expect(organizationRegistry).toContain("organization-danger-zone.tsx")
    expect(organizationRegistry).toContain("delete-organization.tsx")
    expect(organizationRegistry).toContain("delete-organization-dialog.tsx")
    expect(organizationRegistry).toContain("OrganizationDangerZone")
    expect(organizationRegistry).toContain("useDeleteOrganization")
    expect(organizationRegistry).toContain("DeleteOrganizationParams")
    expect(organizationRegistry).toContain("permissions: { organization:")
    expect(organizationRegistry).toContain("organizationDeleted")
    expect(organizationRegistry).toContain("auth.basePaths.settings")
    expect(organizationRegistry).toContain("replace: true")
    expect(organizationRegistry).toContain("invite-member-dialog.tsx")
    expect(organizationRegistry).toContain("organization-people.tsx")
    expect(organizationRegistry).toContain("OrganizationPeopleProps")
    expect(organizationRegistry).toContain("OrganizationMembersProps")
    expect(organizationRegistry).toContain("useListOrganizationMembers")
    expect(organizationRegistry).toContain("OrganizationMemberRow")
    expect(organizationRegistry).toContain("OrganizationMemberRowSkeleton")
    expect(organizationRegistry).toContain("memberSearch")
    expect(organizationRegistry).toContain("memberRoleFilter")
    expect(organizationRegistry).toContain("filteredMemberRows")
    expect(organizationRegistry).toContain("sortedMemberRows")
    expect(organizationRegistry).toContain("memberSort")
    expect(organizationRegistry).toContain("sortMembers")
    expect(organizationRegistry).toContain("DropdownMenuRadioGroup")
    expect(organizationRegistry).toContain("DropdownMenuRadioItem")
    expect(organizationRegistry).toContain("localization().search")
    expect(organizationRegistry).toContain("localization().clear")
    expect(organizationRegistry).toContain("useListOrganizationInvitations")
    expect(organizationRegistry).toContain("OrganizationInvitationsProps")
    expect(organizationRegistry).toContain("OrganizationInvitationRow")
    expect(organizationRegistry).toContain("OrganizationInvitationRowSkeleton")
    expect(organizationRegistry).toContain("OrganizationInvitationsEmpty")
    expect(organizationRegistry).toContain("invitationSearch")
    expect(organizationRegistry).toContain("invitationRoleFilter")
    expect(organizationRegistry).toContain("invitationStatusFilter")
    expect(organizationRegistry).toContain("filteredInvitationRows")
    expect(organizationRegistry).toContain("InvitationSort")
    expect(organizationRegistry).toContain("invitationSort")
    expect(organizationRegistry).toContain("sortInvitations")
    expect(organizationRegistry).toContain("sortedInvitationRows")
    expect(organizationRegistry).toContain("normalizedInvitationSearch")
    expect(organizationRegistry).toContain("localization().status")
    expect(organizationRegistry).toContain("useCancelInvitation")
    expect(organizationRegistry).toContain("useHasPermission")
    expect(organizationRegistry).toContain("permissions: { invitation:")
    expect(organizationRegistry).toContain("useUpdateMemberRole")
    expect(organizationRegistry).toContain("permissions: { member:")
    expect(organizationRegistry).toContain("changeMemberRole")
    expect(organizationRegistry).toContain("memberRoleUpdated")
    expect(organizationRegistry).toContain("useRemoveMember")
    expect(organizationRegistry).toContain("memberIdOrEmail: props.member.id")
    expect(organizationRegistry).toContain(
      "organizationId: props.member.organizationId"
    )
    expect(organizationRegistry).toContain("memberRemoved")
    expect(organizationRegistry).toContain("removeMemberWarning")
    expect(organizationRegistry).toContain("useLeaveOrganization")
    expect(organizationRegistry).toContain("useActiveOrganization")
    expect(organizationRegistry).toContain("leftOrganization")
    expect(organizationRegistry).toContain("leaveOrganizationDescription")
    expect(organizationRegistry).toContain("auth.basePaths.settings")
    expect(organizationRegistry).toContain("InviteMemberDialogProps")
    expect(organizationRegistry).toContain("useInviteMember")
    expect(organizationRegistry).toContain("pickDefaultRole")
    expect(organizationRegistry).toContain("inviteMemberSuccess")
    expect(organizationRegistry).toContain("useUpdateOrganization")
    expect(organizationRegistry).toContain(
      "data: { name: name(), slug: slug() }"
    )
    expect(organizationRegistry).toContain("organization.tsx")
    expect(organizationRegistry).toContain("plugin.slug !== undefined")
    expect(solidRegistry).toContain('"name": "organization"')
    expect(solidRegistry).toContain(
      '"path": "src/lib/auth/organization-plugin.tsx"'
    )

    const passkeyPluginDoc = pluginDoc("passkey")
    const passkeyStoryPath = resolve(
      __dirname,
      "../src/stories/passkey.stories.tsx"
    )
    const solidPasskeyRegistry = readFileSync(
      resolve(__dirname, "../../../apps/docs/public/r/solid/passkey.json"),
      "utf8"
    )

    expect(passkeyPluginDoc).toContain("WebAuthn origin")
    expect(passkeyPluginDoc).toContain("## Setup")
    expect(passkeyPluginDoc).toContain("## Components")
    expect(passkeyPluginDoc).toContain("## Options")
    expect(passkeyPluginDoc).toContain("## Localization")
    expect(passkeyPluginDoc).toContain(
      "npx shadcn@latest add https://better-auth-ui.com/r/solid/passkey.json"
    )
    expect(passkeyPluginDoc).toContain("passkey()")
    expect(passkeyPluginDoc).toContain("passkeyClient()")
    expect(passkeyPluginDoc).toContain("passkeyPlugin()")
    for (const filePath of [
      "src/lib/auth/passkey-plugin.ts",
      "src/components/auth/passkey/passkey-button.tsx",
      "src/components/auth/passkey/passkeys.tsx",
      "src/components/auth/passkey/passkey.tsx",
      "src/components/auth/passkey/passkey-skeleton.tsx",
      "src/components/auth/passkey/passkeys-empty.tsx",
      "src/components/auth/passkey/add-passkey-dialog.tsx",
      "src/components/auth/passkey/delete-passkey-dialog.tsx"
    ]) {
      expect(passkeyPluginDoc).toContain(filePath)
      expect(solidPasskeyRegistry).toContain(filePath)
    }
    expect(passkeyPluginDoc).toContain('name="PasskeyButtonProps"')
    expect(passkeyPluginDoc).toContain('name="PasskeysSettingsProps"')
    expect(passkeyPluginDoc).toContain('name="PasskeyPluginOptions"')
    expect(passkeyPluginDoc).toContain('name="PasskeyLocalization"')
    expect(passkeyPluginDoc).toContain(
      'storyId="zaidan-plugins-passkey--passkey-sign-in-preview"'
    )
    expect(passkeyPluginDoc).toContain(
      'storyId="zaidan-plugins-passkey--passkeys-preview"'
    )
    expect(passkeyPluginDoc).not.toContain("ComponentPreview")
    expect(passkeyPluginDoc).not.toContain("className")
    expect(passkeyPluginDoc).not.toContain("better-auth/react")
    expect(passkeyPluginDoc).not.toContain("@tanstack/react-router")
    expect(passkeyPluginDoc).not.toContain("payload")
    expect(existsSync(passkeyStoryPath)).toBe(true)
    if (existsSync(passkeyStoryPath)) {
      const passkeyStories = readFileSync(passkeyStoryPath, "utf8")

      expect(passkeyStories).toContain('title: "Zaidan/Plugins/Passkey"')
      expect(passkeyStories).toContain("export const PasskeySignInPreview")
      expect(passkeyStories).toContain("export const PasskeysPreview")
      expect(passkeyStories).toContain("signIn")
      expect(passkeyStories).toContain("passkey")
      expect(passkeyStories).toContain("listPasskeys")
      expect(passkeyStories).toContain("addPasskey")
      expect(passkeyStories).toContain("deletePasskey")
      expect(passkeyStories).not.toContain("navigator.credentials")
    }
    expect(pluginDoc("api-key")).toContain("@better-auth/api-key")
    expect(pluginDoc("captcha")).toContain("captchaPlugin")
    expect(pluginDoc("captcha")).toContain("better-auth/plugins")
    expect(pluginDoc("captcha")).toContain("x-captcha-response")
    expect(pluginDoc("captcha")).toContain("## Providers")
    expect(pluginDoc("captcha")).toContain("@better-captcha/solidjs")
    expect(pluginDoc("captcha")).toContain("@marsidev/react-turnstile")
    expect(pluginDoc("captcha")).toContain(
      "@better-captcha/solidjs/provider/turnstile"
    )
    expect(pluginDoc("captcha")).not.toContain("Captcha is supported")
    const themeDoc = pluginDoc("theme")
    expect(themeDoc).toContain("## Setup")
    expect(themeDoc).toContain("## Components")
    expect(themeDoc).toContain("### Register the UI plugin")
    expect(themeDoc).toContain("### Or pass static theme state")
    expect(themeDoc).not.toContain("### Add the theme script before hydration")
    expect(themeDoc).not.toContain(
      "### Sync theme preference in your provider shell"
    )
    expect(themeDoc).toContain("## Options")
    expect(themeDoc).toContain("## Localization")
    expect(themeDoc).not.toContain("It contributes:")
    expect(themeDoc).not.toContain("## Runtime prerequisites")
    expect(themeDoc).not.toContain("## Copied files")
    expect(themeDoc).not.toContain("Local tabs and dropdown primitives")
    expect(themeDoc).toContain(
      "npx shadcn@latest add https://better-auth-ui.com/r/solid/theme.json"
    )
    expect(themeDoc).toContain("<ZaidanStory")
    expect(themeDoc).toContain(
      'storyId="zaidan-plugins-theme--user-button-preview"'
    )
    expect(themeDoc).toContain(
      'storyId="zaidan-plugins-theme--appearance-preview"'
    )
    expect(themeDoc).toContain(
      "examples/start-solid-zaidan-example/src/demos/theme/user-button.tsx"
    )
    expect(themeDoc).toContain(
      "examples/start-solid-zaidan-example/src/demos/theme/appearance.tsx"
    )
    expect(themeDoc).toContain("src/lib/auth/theme-plugin.ts")
    expect(themeDoc).toContain("src/lib/theme.ts")
    expect(themeDoc).toContain("themeScript")
    expect(themeDoc).toContain("syncDocumentThemePreference")
    expect(themeDoc).toContain("themePlugin() // [!code highlight]")
    expect(themeDoc).toContain(
      "setTheme: (nextTheme) => setTheme(nextTheme as ThemeMode)"
    )
    expect(themeDoc).toContain("AppearanceProps")
    expect(themeDoc).not.toContain("AppearanceSettingsProps")
    expect(themeDoc).not.toContain("ThemeToggleItemProps")
    expect(themeDoc).not.toContain('appearance: "Display"')
    expect(themeDoc).toContain("ThemePluginOptions")
    expect(themeDoc).toContain("ThemeLocalization")
    expect(themeDoc).not.toContain("<ComponentPreview")
    expect(themeDoc).not.toContain("className")
    expect(themeDoc).not.toContain('from "react"')
    expect(themeDoc).not.toContain("@tanstack/react-router")
    expect(componentDoc("sign-in")).toContain("username-aware")
    expect(componentDoc("user-button")).toContain("plugin-contributed")
    expect(componentDoc("user-button")).toContain("userMenuItems")
    expect(componentDoc("user-button")).not.toContain("ThemeToggleItem")
    expect(componentDoc("account-settings")).toContain("plugin-contributed")
    expect(componentDoc("account-settings")).toContain("accountCards")
    expect(componentDoc("security-settings")).toContain("passkey")

    const authProviderDoc = componentDoc("auth-provider")
    const authProviderHeadings = extractLevelTwoHeadings(authProviderDoc)

    expect(authProviderDoc).toContain("Solid Query")
    expect(authProviderHeadings).toEqual(["Usage", "Props"])
    expect(authProviderDoc).toContain(
      "```tsx file=<rootDir>/../../examples/start-solid-zaidan-example/src/components/providers.tsx"
    )
    expect(authProviderDoc).toContain(
      '<auto-type-table path="../../../../../../packages/solid/src/lib/auth-provider.tsx" name="AuthProviderProps" />'
    )
    expect(authProviderHeadings).not.toContain("Installation")
    expect(authProviderHeadings).not.toContain("Installed files")
    expect(authProviderDoc).not.toContain("| Prop | Type | Description |")
    expect(authProviderDoc).not.toContain(
      '```tsx title="src/components/providers.tsx"'
    )
    expect(authProviderDoc).not.toContain("What it copies")

    const userDocs: Record<
      string,
      {
        headings: string[]
        propsName: string
        usageFences: string[]
      }
    > = {
      "user-avatar": {
        headings: ["Usage", "Installation", "Props"],
        propsName: "UserAvatarProps",
        usageFences: [
          "examples/start-solid-zaidan-example/src/demos/user/user-avatar.tsx"
        ]
      },
      "user-button": {
        headings: ["Usage", "Icon", "Custom links", "Installation", "Props"],
        propsName: "UserButtonProps",
        usageFences: [
          "examples/start-solid-zaidan-example/src/demos/user/user-button.tsx",
          "examples/start-solid-zaidan-example/src/demos/user/user-button-icon.tsx",
          "examples/start-solid-zaidan-example/src/demos/user/user-button-links.tsx"
        ]
      },
      "user-view": {
        headings: ["Usage", "Installation", "Props"],
        propsName: "UserViewProps",
        usageFences: [
          "examples/start-solid-zaidan-example/src/demos/user/user-view.tsx"
        ]
      }
    }

    for (const [name, expectations] of Object.entries(userDocs)) {
      const page = componentDoc(name)
      expect(extractLevelTwoHeadings(page), name).toEqual(expectations.headings)
      expect(page, name).toContain(
        `npx shadcn@latest add https://better-auth-ui.com/r/solid/${name}.json`
      )
      expect(page, name).toContain("After install")
      for (const usageFence of expectations.usageFences) {
        expect(page, `${name} usage fence ${usageFence}`).toContain(
          `tsx file=<rootDir>/../../${usageFence}`
        )
      }
      expect(page, name).toContain(`name="${expectations.propsName}"`)
      expect(page, name).not.toContain("Parity classification")
      expect(page, name).not.toContain("Installed files")
    }

    const userButtonDoc = componentDoc("user-button")
    expect(userButtonDoc).toContain("userMenuItems")
    expect(userButtonDoc).toContain("links")
    expect(userButtonDoc).not.toContain("ThemeToggleItem")
    expect(userButtonDoc).not.toContain(
      "src/components/auth/theme/theme-toggle-item.tsx"
    )

    const authFlowDocs: Record<
      string,
      {
        propsName: string
        storyId: string
        usageFence: string
      }
    > = {
      auth: {
        propsName: "AuthProps",
        storyId: "zaidan-components-auth--auth-preview",
        usageFence:
          "examples/start-solid-zaidan-example/src/demos/auth/auth.tsx"
      },
      "sign-in": {
        propsName: "SignInProps",
        storyId: "zaidan-components-auth--sign-in-preview",
        usageFence:
          "examples/start-solid-zaidan-example/src/demos/auth/sign-in.tsx"
      },
      "sign-up": {
        propsName: "SignUpProps",
        storyId: "zaidan-components-auth--sign-up-preview",
        usageFence:
          "examples/start-solid-zaidan-example/src/demos/auth/sign-up.tsx"
      },
      "sign-out": {
        propsName: "SignOutProps",
        storyId: "zaidan-components-auth--sign-out-preview",
        usageFence:
          "examples/start-solid-zaidan-example/src/demos/auth/sign-out.tsx"
      },
      "forgot-password": {
        propsName: "ForgotPasswordProps",
        storyId: "zaidan-components-auth--forgot-password-preview",
        usageFence:
          "examples/start-solid-zaidan-example/src/demos/auth/forgot-password.tsx"
      },
      "reset-password": {
        propsName: "ResetPasswordProps",
        storyId: "zaidan-components-auth--reset-password-preview",
        usageFence:
          "examples/start-solid-zaidan-example/src/demos/auth/reset-password.tsx"
      }
    }

    const metaPath = resolve(zaidanDocsRoot, "components/meta.json")
    const meta = parseJson<{ pages: string[] }>(
      readFileSync(metaPath, "utf8"),
      metaPath
    )
    const authStart = meta.pages.indexOf("---Auth---")
    expect(meta.pages.slice(authStart + 1, authStart + 7)).toEqual([
      "auth",
      "sign-in",
      "sign-up",
      "sign-out",
      "forgot-password",
      "reset-password"
    ])

    const authStories = readFileSync(
      resolve(__dirname, "../src/stories/auth.stories.tsx"),
      "utf8"
    )
    expect(authStories).toContain('socialProviders={["github", "google"]}')
    expect(authStories).toContain("social: async () =>")
    expect(authStories).toContain("navigate={() => undefined}")
    expect(authStories).toContain("overflow-hidden")
    expect(authStories).toContain("h-screen")

    const providerButton = readFileSync(
      resolve(__dirname, "../src/components/auth/provider-button.tsx"),
      "utf8"
    )
    expect(providerButton).toContain("function GitHubIcon")
    expect(providerButton).toContain("function GoogleIcon")
    expect(providerButton).toContain("<Spinner />")
    expect(providerButton).not.toContain("providerName().slice(0, 1)")

    const signOut = readFileSync(
      resolve(__dirname, "../src/components/auth/sign-out.tsx"),
      "utf8"
    )
    expect(signOut).toContain(
      'import { Spinner } from "@/components/ui/spinner"'
    )
    expect(signOut).toContain(
      '<Spinner class={cn("mx-auto my-auto", props.class)} />'
    )
    expect(signOut).not.toContain("label?: string")
    expect(signOut).not.toContain("Signing out")

    for (const [name, expectation] of Object.entries(authFlowDocs)) {
      const page = componentDoc(name)
      const headings = extractLevelTwoHeadings(page)

      expect(headings, `${name} should match shadcn model`).toEqual([
        "Usage",
        "Installation",
        "Props"
      ])
      expect(page, `${name} should show Zaidan preview`).toContain(
        `storyId="${expectation.storyId}"`
      )
      expect(page, `${name} should use file-backed Solid demo`).toContain(
        `tsx file=<rootDir>/../../${expectation.usageFence}`
      )
      expect(page, `${name} should include install command`).toContain(
        `npx shadcn@latest add https://better-auth-ui.com/r/solid/${name}.json`
      )
      expect(page, `${name} should explain ownership`).toContain(
        "After install"
      )
      expect(page, `${name} should derive props from source types`).toContain(
        `name="${expectation.propsName}"`
      )
      expect(page, `${name} should not keep parity section`).not.toContain(
        "Parity classification"
      )
      expect(
        page,
        `${name} should not keep installed-files section`
      ).not.toContain("## Installed files")
    }

    const userSurfaceDocs: Record<
      string,
      {
        importExample: string
        props: string[]
        usageExample: string
      }
    > = {
      "user-button": {
        importExample:
          'import { UserButton } from "@/components/auth/user/user-button"',
        props: [
          "class",
          "align",
          "sideOffset",
          "size",
          "variant",
          "links",
          "hideSettings"
        ],
        usageExample: '<UserButton size="icon" align="end" />'
      },
      "user-view": {
        importExample:
          'import { UserView } from "@/components/auth/user/user-view"',
        props: [
          "class",
          "image",
          "initials",
          "isPending",
          "label",
          "secondaryLabel",
          "user"
        ],
        usageExample:
          '<UserView label="Ada Lovelace" secondaryLabel="ada@example.com" />'
      },
      "user-avatar": {
        importExample:
          'import { UserAvatar } from "@/components/auth/user/user-avatar"',
        props: [
          "class",
          "fallback",
          "image",
          "initials",
          "isPending",
          "label",
          "user"
        ],
        usageExample: '<UserAvatar label="Ada Lovelace" initials="AL" />'
      }
    }

    for (const [name, expectation] of Object.entries(userSurfaceDocs)) {
      const page = componentDoc(name)
      const headings = extractLevelTwoHeadings(page)

      expect(headings, `${name} should lead with usage`).toEqual(
        expect.arrayContaining(["Usage", "Installation", "Props"])
      )
      expect(
        headings,
        `${name} should not lead with copied files`
      ).not.toContain("What it copies")
      expect(page, `${name} should not use inline imports`).not.toContain(
        expectation.importExample
      )
      expect(page, `${name} should not use inline examples`).not.toContain(
        expectation.usageExample
      )
      expect(
        page,
        `${name} should not keep installed-files sections`
      ).not.toContain("## Installed files")

      expect(page, `${name} should derive props from source types`).toContain(
        "<auto-type-table"
      )
    }

    expect(componentDoc("user-button")).toContain("session")
    expect(componentDoc("user-button")).toContain("userMenuItems")
    expect(componentDoc("user-avatar")).toContain("session user")

    const settingsDocs: Record<
      string,
      {
        importExample: string
        pluginGates: string[]
        props: string[]
        usageExample: string
      }
    > = {
      settings: {
        importExample:
          'import { Settings } from "@/components/auth/settings/settings"',
        pluginGates: ["session", "account", "security"],
        props: ["class", "path"],
        usageExample: "<Settings path={path()} />"
      },
      "account-settings": {
        importExample:
          'import { AccountSettings } from "@/components/auth/settings/account/account-settings"',
        pluginGates: ["theme", "multi-session", "delete-user"],
        props: ["class"],
        usageExample: "<AccountSettings />"
      },
      "user-profile": {
        importExample:
          'import { UserProfile } from "@/components/auth/settings/account/user-profile"',
        pluginGates: ["username", "session user", "avatar"],
        props: ["class"],
        usageExample: "<UserProfile />"
      },
      "change-email": {
        importExample:
          'import { ChangeEmail } from "@/components/auth/settings/account/change-email"',
        pluginGates: ["useChangeEmail", "email verification", "session"],
        props: ["class"],
        usageExample: "<ChangeEmail />"
      },
      "security-settings": {
        importExample:
          'import { SecuritySettings } from "@/components/auth/settings/security/security-settings"',
        pluginGates: [
          "emailAndPassword",
          "socialProviders",
          "apiKey",
          "passkey",
          "deleteUser"
        ],
        props: ["class"],
        usageExample: "<SecuritySettings />"
      },
      "active-sessions": {
        importExample:
          'import { ActiveSessionsSettings } from "@/components/auth/settings/security/active-sessions"',
        pluginGates: ["session", "listSessionsOptions", "useRevokeSession"],
        props: ["class"],
        usageExample: "<ActiveSessionsSettings />"
      },
      "linked-accounts": {
        importExample:
          'import { LinkedAccountsSettings } from "@/components/auth/settings/security/linked-accounts"',
        pluginGates: ["socialProviders", "listAccountsOptions", "GitHub"],
        props: ["class"],
        usageExample: "<LinkedAccountsSettings />"
      },
      "change-password": {
        importExample:
          'import { ChangePasswordSettings } from "@/components/auth/settings/security/change-password"',
        pluginGates: [
          "emailAndPassword",
          "credential",
          "useRequestPasswordReset"
        ],
        props: ["class", "confirmPassword"],
        usageExample: "<ChangePasswordSettings confirmPassword />"
      }
    }

    for (const name of Object.keys(settingsDocs)) {
      const page = componentDoc(name)
      const headings = extractLevelTwoHeadings(page)

      expect(headings, `${name} should lead with usage`).toEqual(
        expect.arrayContaining(["Usage", "Installation", "Props"])
      )
      expect(
        headings,
        `${name} should not lead with copied files`
      ).not.toContain("What it copies")
      expect(page, `${name} should show a Zaidan story preview`).toContain(
        "<ZaidanStory"
      )
      expect(page, `${name} should use file-backed Solid demos`).toContain(
        "tsx file=<rootDir>/../../examples/start-solid-zaidan-example/src/demos/settings"
      )
      expect(
        page,
        `${name} should not keep installed files prose`
      ).not.toContain("## Installed files")
      expect(page, `${name} should derive props from source types`).toContain(
        "<auto-type-table"
      )
    }

    for (const docsPath of zaidanDocs) {
      const content = readFileSync(docsPath, "utf8")
      expect(content).not.toContain("Initial IA")
      expect(content).not.toContain("should explain")
      expect(content).not.toContain("TODO placeholder")
      expect(content).not.toContain("TODO")
      expect(
        content
          .replaceAll("api-key-skeleton.tsx", "")
          .replaceAll("passkey-skeleton.tsx", "")
          .replaceAll("user-invitation-row-skeleton.tsx", "")
      ).not.toContain("skeleton")
    }
  })

  it("keeps the existing shadcn registry uncoupled from Solid registry payloads", () => {
    const report = verifyLocalRegistryCoherence()

    expect(report.shadcnRegistryName).toBe("better-auth-ui")
    expect(report.shadcnCouplingFindings).toEqual([])
    expect(report.staticItemNames).toHaveLength(
      expectedSolidRegistryPayloadNames.length
    )
  })
})
