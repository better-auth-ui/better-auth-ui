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
import { solidRegistryManifest } from "../registry.manifest"
import {
  buildSolidRegistry,
  verifySolidRegistryCoherence
} from "../scripts/build-registry"

const tempRoots: string[] = []

const makeTempRoot = () => {
  const root = join(tmpdir(), `solid-registry-${crypto.randomUUID()}`)
  tempRoots.push(root)
  mkdirSync(root, { recursive: true })
  return root
}

const readJson = <T>(path: string) =>
  JSON.parse(readFileSync(path, "utf8")) as T

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
  "delete-user",
  "multi-session",
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

  it("uses local Zaidan UI primitives in auth components and registry payloads", () => {
    const uiFiles = [
      "src/components/ui/button.tsx",
      "src/components/ui/card.tsx",
      "src/components/ui/input.tsx",
      "src/components/ui/label.tsx",
      "src/lib/utils.ts"
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
      "solid/auth-provider",
      "solid/additional-field"
    ])
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
      ...uiFiles
    ])
    expect(signUp.files.map((file) => file.type)).toContain("registry:ui")
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
    expect(forgotPassword).toContain("requestPasswordResetOptions")
    expect(forgotPassword).toContain("createMutation")
    expect(forgotPassword).toContain('type="email"')
    expect(resetPassword).toContain('from "@better-auth-ui/solid"')
    expect(resetPassword).toContain('from "solid-js"')
    expect(resetPassword).toContain("resetPasswordOptions")
    expect(resetPassword).toContain("createMutation")
    expect(resetPassword).toContain(
      'type={isPasswordVisible() ? "text" : "password"}'
    )
    expect(resetPassword).toContain("tokenFromLocation")
    expect(signUp).toContain('from "@better-auth-ui/solid"')
    expect(signUp).toContain('from "solid-js"')
    expect(signUp).toContain("signUpEmailOptions")
    expect(signUp).toContain("createMutation")
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
    expect(signIn).toContain("signInEmailOptions")
    expect(signIn).toContain("createMutation")
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
    expect(signUp).toContain("usernamePlaceholder")
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

    for (const [name, content] of Object.entries(pages)) {
      expect(content, name).not.toMatch(/does not expose public props/i)
      expect(content, name).toContain("Parity classification")
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
      expect(content, name).toContain("`class`")
    }

    expect(pages.userAvatar).toContain("intentional-difference")
    expect(pages.userView).toContain("intentional-difference")
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
    expect(authConfig).toContain("apiKey()")
    expect(authConfig).toContain("magicLink({")

    expect(authClient).toContain('from "@better-auth/api-key/client"')
    expect(authClient).toContain('from "@better-auth/passkey/client"')
    expect(authClient).toContain('from "better-auth/client/plugins"')
    expect(authClient).toContain("multiSessionClient()")
    expect(authClient).toContain("apiKeyClient()")
    expect(authClient).toContain("passkeyClient()")
    expect(authClient).toContain("usernameClient()")

    expect(signIn).toContain("signInUsernameOptions")
    expect(signIn).toContain("usernameOrEmailPlaceholder")
    expect(signIn).toContain("resolveSubmittedSignIn")
    expect(signIn).toContain("new FormData(event.currentTarget)")
    expect(signIn).toContain("username: signInPath.username")
    expect(signIn).toContain("email: signInPath.email")
    expect(signIn).toContain(
      'autocomplete={usernameAuth ? "username" : "email"}'
    )

    expect(signUp).toContain("usernamePlaceholder")
    expect(signUp).toContain('name="username"')
    expect(signUp).toContain("username: username()")
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
    const tabs = readFileSync(
      resolve(__dirname, "../src/components/ui/tabs.tsx"),
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

    expect(tabs).toContain('from "@kobalte/core/tabs"')
    expect(tabs).toContain('data-slot="tabs-list"')
    expect(tabs).toContain('data-slot="tabs-trigger"')
    expect(tabs).toContain("rounded-lg p-[3px]")
    expect(tabs).toContain("data-[selected]:bg-background")
    expect(tabs).toContain("data-[selected]:text-foreground")
    expect(tabs).toContain("data-[selected]:shadow-sm")

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
    expect(userButton).toContain("ThemeToggleItem")
    expect(themeToggleItem).toContain('from "@/components/ui/tabs"')
    expect(themeToggleItem).toContain("PaletteIcon")
    expect(themeToggleItem).toContain("<Tabs")
    expect(themeToggleItem).toContain("<TabsList")
    expect(themeToggleItem).toContain("<TabsTrigger")
    expect(themeToggleItem).toContain('aria-label="System"')
    expect(themeToggleItem).toContain('aria-label="Light"')
    expect(themeToggleItem).toContain('aria-label="Dark"')
    expect(themeToggleItem).toContain('from "@/lib/theme"')
    expect(themeToggleItem).toContain("readStoredThemePreference")
    expect(themeToggleItem).toContain("saveThemePreference")
    expect(themeToggleItem).toContain("applyThemePreference")
    expect(shadcnThemeToggleItem).toContain('[role="tab"][data-state="active"]')
    expect(themeToggleItem).toContain('[role="tab"][data-selected]')
    expect(themeToggleItem).toContain("focusActiveTab")
    expect(themeToggleItem).toContain("onFocus")
    expect(userButton).toContain("isUserButtonHydrated")
    expect(userButton).toContain("setIsUserButtonHydrated(true)")
    expect(userButton).toContain("when={isUserButtonHydrated()}")
    expect(userButton).toContain("<UserButtonPendingView")
    expect(userButton).toContain("useSession(auth.authClient, {")
    expect(userButton).toContain("enabled: !import.meta.env.SSR")
    expect(userButton).toContain("<Skeleton")
    expect(userButton).toContain('class="size-8 rounded-full"')
    expect(userButton).toContain('class="h-4 w-24"')
    expect(userButton).toContain('class="h-3 w-32"')
    expect(userButton).toContain(
      '"py-2.5 h-auto font-normal justify-between gap-3 rounded-full"'
    )
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
      userButton.indexOf("<ThemeToggleItem />")
    )
    expect(userButton).not.toContain("needToCreateAnAccount")

    expect(header).toContain('from "./auth/user/user-button"')
    expect(header).toContain('<UserButton size="icon" align="end" />')

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

    const signOut = readJson<{
      files: Array<{ content: string; path: string }>
      name: string
      registryDependencies: string[]
    }>(join(outputRoot, "solid/sign-out.json"))
    expect(signOut.name).toBe("sign-out")
    expect(signOut.registryDependencies).toEqual(["solid/auth-provider"])
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
    }>(join(outputRoot, "solid/auth-provider.json"))
    expect(authProvider.dependencies).toContain("solid-sonner")
    expect(authProvider.dependencies).toContain("lucide-solid")
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
          content: expect.stringContaining("Toaster as Sonner"),
          path: "src/components/ui/sonner.tsx"
        }),
        expect.objectContaining({
          content: expect.stringContaining("themeScript"),
          path: "src/lib/theme.ts"
        })
      ])
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
    expect(forgotPassword.registryDependencies).toEqual(["solid/auth-provider"])
    expect(forgotPassword.files).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          content: expect.stringContaining("export function ForgotPassword"),
          path: "src/components/auth/forgot-password.tsx"
        })
      ])
    )
    expect(forgotPassword.files[0]?.content).toContain(
      "requestPasswordResetOptions"
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
    expect(resetPassword.registryDependencies).toEqual(["solid/auth-provider"])
    expect(resetPassword.files).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          content: expect.stringContaining("export function ResetPassword"),
          path: "src/components/auth/reset-password.tsx"
        })
      ])
    )
    expect(resetPassword.files[0]?.content).toContain("resetPasswordOptions")
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
      "solid/auth-provider",
      "solid/additional-field"
    ])
    expect(signUp.files).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          content: expect.stringContaining("export function SignUp"),
          path: "src/components/auth/sign-up.tsx"
        })
      ])
    )
    expect(signUp.files[0]?.content).toContain("signUpEmailOptions")
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
        manifest: unsafeManifest,
        outputRoot
      })
    ).toThrow("outside the Solid example src directory")
    expect(existsSync(join(outputRoot, "solid/auth-provider.json"))).toBe(false)
  })

  it("keeps the package, example, static registry, and docs links coherent", () => {
    const report = verifyLocalRegistryCoherence()

    expect(report.packageName).toBe("@better-auth-ui/solid")
    expect(report.packageExports).toEqual([".", "./server", "./plugins"])
    expect(report.exampleSolidDependency).toBe("*")
    expect(report.staticItemNames).toEqual(expectedSolidRegistryPayloadNames)
    expect(report.missingStaticFiles).toEqual([])
    expect(report.missingDocsLinks).toEqual([])
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
    expect(solidSsrDoc).toContain("@better-auth-ui/solid/server")
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
      "list-api-keys"
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
      "delete-api-key"
    ])
    expect(zaidanMeta).toMatchObject({
      title: "Zaidan",
      description: "Solid registry components and installable payloads",
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
      "delete-user",
      "magic-link",
      "multi-session",
      "passkey",
      "theme",
      "username"
    ])
    expect(zaidanComponentsMeta.pages).toEqual([
      "---Provider---",
      "auth-provider",
      "---Auth---",
      "auth",
      "sign-in",
      "sign-up",
      "forgot-password",
      "reset-password",
      "sign-out",
      "---User---",
      "user-button",
      "user-avatar",
      "user-view",
      "---Settings---",
      "settings",
      "account-settings",
      "user-profile",
      "change-email",
      "security-settings",
      "active-sessions",
      "linked-accounts",
      "change-password"
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
      "zaidan add https://better-auth-ui.com/r/solid/sign-up.json"
    )
    expect(zaidanOverview).toContain("/docs/zaidan/integrations/tanstack-start")
    expect(zaidanOverview).not.toContain("title: Overview")
    expect(zaidanAdditionalFields).toContain("title: Additional Fields")
    expect(zaidanAdditionalFields).toContain("AdditionalFieldProps")
    expect(zaidanTanstackStart).toContain("title: TanStack Start")
    expect(zaidanTanstackStart).not.toContain("Solid Start")
    expect(zaidanTanstackStart).not.toContain("SPA")
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
      "@better-auth-ui/solid owns provider wiring, Solid Query factories, mutation factories, and server helpers."
    )
    expect(combinedSolidPackageDocs).toContain("ensureSession")
    expect(combinedSolidPackageDocs).toContain("prefetchSession")
    expect(combinedSolidPackageDocs).toContain("fetchSession")
    expect(combinedSolidPackageDocs).toContain("useSession")
    expect(combinedSolidPackageDocs).toContain("listAccountsOptions")
    expect(combinedSolidPackageDocs).toContain("listPasskeysOptions")
    expect(combinedSolidPackageDocs).toContain("createApiKeyOptions")
    expect(combinedSolidPackageDocs).toContain("signInUsernameOptions")
    expect(combinedSolidPackageDocs).toContain("@better-auth-ui/solid/server")
    expect(combinedSolidPackageDocs).not.toContain(
      "@better-auth-ui/solid/plugins"
    )

    for (const { name, content } of solidPackageDocs) {
      expect(
        content,
        `${name} should not duplicate Zaidan CLI commands`
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

      expect(
        content,
        `${docsPath} should not claim live Solid previews`
      ).not.toContain("ComponentPreview")
      expect(
        content,
        `${docsPath} should not claim live Solid previews`
      ).not.toContain("live Solid preview")
      expect(
        content,
        `${docsPath} should not claim captcha UI support`
      ).not.toContain("Captcha is supported")
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
    const componentPayloadNames = solidRegistryManifest.items
      .map((item) => item.name)
      .filter((name) => !pluginPayloadNames.includes(name))

    expect(quickStart).toContain("title: Quick Start")
    expect(quickStart).toContain("## Prerequisites")
    expect(quickStart).toContain("## Installation")
    expect(quickStart).toContain(
      "zaidan add https://better-auth-ui.com/r/solid/auth-provider.json"
    )
    expect(quickStart).toContain(
      "zaidan add https://better-auth-ui.com/r/solid/sign-in.json"
    )
    expect(quickStart).toContain("/docs/zaidan/integrations/tanstack-start")
    expect(quickStart).not.toContain("title: Overview")

    expect(integrations).toContain("## Quick path")
    expect(integrations).toContain("title: TanStack Start")
    expect(integrations).toContain("components.json")
    expect(integrations).toContain(
      '"@zaidan": "https://zaidan.carere.dev/r/{style}/{name}.json"'
    )
    expect(integrations).toContain("src/styles/globals.css")
    expect(integrations).toContain("@tanstack/solid-start")
    expect(integrations).not.toContain("Solid Start")
    expect(integrations).not.toContain("SPA")

    expect(additionalFields).toContain("title: Additional Fields")
    expect(additionalFields).toContain("## Configure fields")
    expect(additionalFields).toContain("## Renderer behavior")
    expect(additionalFields).toContain("AdditionalFieldProps")
    expect(additionalFields).toContain("class")
    expect(additionalFields).toContain(
      "zaidan add https://better-auth-ui.com/r/solid/additional-field.json"
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
      "user-view": "<UserView />"
    }

    for (const [name, title] of Object.entries(expectedComponentTitles)) {
      expect(
        extractFrontmatterTitle(componentDoc(name)),
        `Zaidan component docs should use shadcn-style JSX title for ${name}`
      ).toBe(title)
    }

    for (const name of componentPayloadNames) {
      const page =
        name === "additional-field" ? additionalFields : componentDoc(name)
      const item = solidRegistryManifest.items.find(
        (entry) => entry.name === name
      )

      expect(page, `component ${name} should link its payload`).toContain(
        `/r/solid/${name}.json`
      )
      expect(
        page,
        `component ${name} should include install command`
      ).toContain(`zaidan add https://better-auth-ui.com/r/solid/${name}.json`)
      expect(page, `component ${name} should identify copied files`).toContain(
        item?.files[0]?.path
      )
      expect(page, `component ${name} should explain ownership`).toContain(
        "After install"
      )
    }

    for (const name of pluginPayloadNames) {
      const page = pluginDoc(name)

      expect(page, `plugin ${name} should link its payload`).toContain(
        `/r/solid/${name}.json`
      )
      expect(page, `plugin ${name} should state prerequisites`).toContain(
        "## Runtime prerequisites"
      )
      expect(page, `plugin ${name} should state copied files`).toContain(
        "## Copied files"
      )
      expect(page, `plugin ${name} should link Solid runtime docs`).toContain(
        "/docs/solid"
      )
      expect(page).not.toContain("/docs/solid/plugins")
    }

    expect(pluginDoc("magic-link")).toContain("real email provider")
    expect(pluginDoc("passkey")).toContain("WebAuthn origin")
    expect(pluginDoc("api-key")).toContain("@better-auth/api-key")
    expect(pluginDoc("theme")).toContain("src/lib/theme.ts")
    expect(componentDoc("sign-in")).toContain("username-aware")
    expect(componentDoc("user-button")).toContain("theme")
    expect(componentDoc("security-settings")).toContain("passkey")

    const authProviderDoc = componentDoc("auth-provider")
    const authProviderHeadings = extractLevelTwoHeadings(authProviderDoc)

    expect(authProviderDoc).toContain("Solid Query")
    expect(authProviderHeadings).toEqual(
      expect.arrayContaining(["Usage", "Props"])
    )
    expect(authProviderHeadings).not.toContain("What it copies")
    expect(authProviderDoc).toContain("authClient")
    expect(authProviderDoc).toContain("queryClient")
    expect(authProviderDoc).toContain("navigate")

    const authFlowDocs: Record<
      string,
      {
        importExample: string
        props: string[]
        usageExample: string
      }
    > = {
      auth: {
        importExample: 'import { Auth } from "@/components/auth/auth"',
        props: ["path"],
        usageExample: "<Auth path={params.path} />"
      },
      "sign-in": {
        importExample: 'import { SignIn } from "@/components/auth/sign-in"',
        props: [],
        usageExample: "<SignIn />"
      },
      "sign-up": {
        importExample: 'import { SignUp } from "@/components/auth/sign-up"',
        props: [],
        usageExample: "<SignUp />"
      },
      "sign-out": {
        importExample: 'import { SignOut } from "@/components/auth/sign-out"',
        props: ["class", "label"],
        usageExample: '<SignOut label="Signing you out…" />'
      },
      "forgot-password": {
        importExample:
          'import { ForgotPassword } from "@/components/auth/forgot-password"',
        props: ["class", "redirectTo"],
        usageExample: '<ForgotPassword redirectTo="/auth/reset-password" />'
      },
      "reset-password": {
        importExample:
          'import { ResetPassword } from "@/components/auth/reset-password"',
        props: ["class", "token"],
        usageExample: "<ResetPassword token={token} />"
      }
    }

    for (const [name, expectation] of Object.entries(authFlowDocs)) {
      const page = componentDoc(name)
      const headings = extractLevelTwoHeadings(page)

      expect(headings, `${name} should lead with usage`).toEqual(
        expect.arrayContaining(["Usage", "Installation", "Props"])
      )
      expect(
        headings,
        `${name} should not lead with copied files`
      ).not.toContain("What it copies")
      expect(page, `${name} should show Solid/Zaidan import`).toContain(
        expectation.importExample
      )
      expect(page, `${name} should show practical usage`).toContain(
        expectation.usageExample
      )
      expect(page, `${name} should keep files as secondary content`).toContain(
        "## Installed files"
      )

      expect(page, `${name} should derive props from source types`).toContain(
        "<auto-type-table"
      )
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
      expect(page, `${name} should show Solid/Zaidan import`).toContain(
        expectation.importExample
      )
      expect(page, `${name} should show practical usage`).toContain(
        expectation.usageExample
      )
      expect(page, `${name} should keep files as secondary content`).toContain(
        "## Installed files"
      )

      expect(page, `${name} should derive props from source types`).toContain(
        "<auto-type-table"
      )
    }

    expect(componentDoc("user-button")).toContain("theme")
    expect(componentDoc("user-button")).toContain("session")
    expect(componentDoc("user-button")).toContain("multi-session")
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
        pluginGates: ["changeEmailOptions", "email verification", "session"],
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
        pluginGates: ["session", "listSessionsOptions", "revokeSessionOptions"],
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
          "requestPasswordResetOptions"
        ],
        props: ["class", "confirmPassword"],
        usageExample: "<ChangePasswordSettings confirmPassword />"
      }
    }

    for (const [name, expectation] of Object.entries(settingsDocs)) {
      const page = componentDoc(name)
      const headings = extractLevelTwoHeadings(page)

      expect(headings, `${name} should lead with usage`).toEqual(
        expect.arrayContaining(["Usage", "Installation", "Props"])
      )
      expect(
        headings,
        `${name} should not lead with copied files`
      ).not.toContain("What it copies")
      expect(page, `${name} should show Solid/Zaidan import`).toContain(
        expectation.importExample
      )
      expect(page, `${name} should show practical usage`).toContain(
        expectation.usageExample
      )
      expect(page, `${name} should keep files as secondary content`).toContain(
        "## Installed files"
      )

      expect(page, `${name} should derive props from source types`).toContain(
        "<auto-type-table"
      )

      for (const gate of expectation.pluginGates) {
        expect(page, `${name} should document gate ${gate}`).toContain(gate)
      }
    }

    for (const docsPath of zaidanDocs) {
      const content = readFileSync(docsPath, "utf8")
      expect(content).not.toContain("Initial IA")
      expect(content).not.toContain("should explain")
      expect(content).not.toContain("placeholder")
      expect(content).not.toContain("TODO")
      expect(content).not.toContain("skeleton")
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
