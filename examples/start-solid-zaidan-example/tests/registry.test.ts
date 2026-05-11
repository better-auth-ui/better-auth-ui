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

const verifyLocalRegistryCoherence = () =>
  verifySolidRegistryCoherence({
    exampleRoot: resolve(__dirname, ".."),
    manifest: solidRegistryManifest,
    repoRoot: resolve(__dirname, "../../..")
  })

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
    expect(dependencies).not.toContain("@better-auth-ui/react@latest")
    expect(dependencies).not.toContain("sonner")
    expect(
      dependencies.every((dependency) => !dependency.includes("react"))
    ).toBe(true)
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

  it("uses local Zaidan UI primitives in auth components and registry payloads", () => {
    const uiFiles = [
      "src/components/ui/button.tsx",
      "src/components/ui/input.tsx",
      "src/components/ui/label.tsx",
      "src/lib/utils.ts"
    ]
    const formAuthFiles = [
      {
        path: "src/components/auth/sign-in.tsx",
        imports: ['from "@/components/ui/button"']
      },
      {
        path: "src/components/auth/sign-up.tsx",
        imports: [
          'from "@/components/ui/button"',
          'from "@/components/ui/input"',
          'from "@/components/ui/label"'
        ]
      },
      {
        path: "src/components/auth/forgot-password.tsx",
        imports: [
          'from "@/components/ui/button"',
          'from "@/components/ui/input"',
          'from "@/components/ui/label"'
        ]
      },
      {
        path: "src/components/auth/reset-password.tsx",
        imports: [
          'from "@/components/ui/button"',
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

    expect(signUp.registryDependencies).toEqual(["solid/auth-provider"])
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
    const authProvider = readFileSync(
      resolve(__dirname, "../src/components/auth/auth-provider.tsx"),
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

    expect(authProvider).toContain("import.meta.env.SSR")
    expect(authProvider).toContain("http://localhost:5173/api/auth")
    expect(homeRoute).toContain('from "@/components/auth/auth-provider"')
    expect(homeRoute).toContain("<AuthProvider>")
    expect(homeRoute).toContain("</AuthProvider>")
    expect(authRoute).toContain('from "@/components/auth/auth-provider"')
    expect(authRoute).toContain("<AuthProvider>")
    expect(authRoute).toContain("</AuthProvider>")
    expect(rootRoute).not.toContain("<AuthProvider>")
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
    expect(resetPassword).toContain('type="password"')
    expect(resetPassword).toContain("tokenFromLocation")
    expect(signUp).toContain('from "@better-auth-ui/solid"')
    expect(signUp).toContain('from "solid-js"')
    expect(signUp).toContain("signUpEmailOptions")
    expect(signUp).toContain("createMutation")
    expect(signUp).toContain('type="email"')
    expect(signUp).toContain('autocomplete="new-password"')
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

    expect(result.files.sort()).toEqual([
      join(outputRoot, "solid/README.md"),
      join(outputRoot, "solid/auth-provider.json"),
      join(outputRoot, "solid/forgot-password.json"),
      join(outputRoot, "solid/registry.json"),
      join(outputRoot, "solid/reset-password.json"),
      join(outputRoot, "solid/sign-in.json"),
      join(outputRoot, "solid/sign-out.json"),
      join(outputRoot, "solid/sign-up.json")
    ])
    expect(readFileSync(untouchedRootRegistry, "utf8")).toBe(
      '{"name":"existing-shadcn"}\n'
    )

    const registry = readJson<{
      name: string
      namespace: string
      items: Array<{ name: string }>
    }>(join(outputRoot, "solid/registry.json"))
    expect(registry).toMatchObject({
      name: "better-auth-ui-solid",
      namespace: "solid",
      items: [
        { name: "auth-provider" },
        { name: "forgot-password" },
        { name: "reset-password" },
        { name: "sign-up" },
        { name: "sign-in" },
        { name: "sign-out" }
      ]
    })

    const signIn = readJson<{
      dependencies: string[]
      files: Array<{ content: string; path: string }>
      name: string
    }>(join(outputRoot, "solid/sign-in.json"))
    expect(signIn.name).toBe("sign-in")
    expect(signIn.dependencies).toContain("@better-auth-ui/solid@latest")
    expect(signIn.files).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          content: expect.stringContaining("export function SignIn"),
          path: "src/components/auth/sign-in.tsx"
        })
      ])
    )
    expect(signIn.files[0]?.content).not.toContain("useAuth")

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
      "Password reset successfully. You can sign in with your new password."
    )
    expect(resetPassword.files[0]?.content).toContain(
      "Reset token is required. Open the link from your email."
    )
    expect(resetPassword.files[0]?.content).toContain("Passwords do not match.")
    expect(resetPassword.files[0]?.content).toContain("tokenFromLocation")

    const signUp = readJson<{
      dependencies: string[]
      files: Array<{ content: string; path: string }>
      name: string
      registryDependencies: string[]
    }>(join(outputRoot, "solid/sign-up.json"))
    expect(signUp.name).toBe("sign-up")
    expect(signUp.dependencies).toContain("@better-auth-ui/solid@latest")
    expect(signUp.registryDependencies).toEqual(["solid/auth-provider"])
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
    expect(report.staticItemNames).toEqual([
      "auth-provider",
      "forgot-password",
      "reset-password",
      "sign-up",
      "sign-in",
      "sign-out"
    ])
    expect(report.missingStaticFiles).toEqual([])
    expect(report.missingDocsLinks).toEqual([])
  })

  it("keeps the existing shadcn registry uncoupled from Solid registry payloads", () => {
    const report = verifyLocalRegistryCoherence()

    expect(report.shadcnRegistryName).toBe("better-auth-ui")
    expect(report.shadcnCouplingFindings).toEqual([])
    expect(report.staticItemNames).toHaveLength(6)
  })
})
