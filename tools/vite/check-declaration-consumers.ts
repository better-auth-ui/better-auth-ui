import assert from "node:assert/strict"
import { mkdir, mkdtemp, rm, symlink, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { resolve } from "node:path"
import ts from "typescript"

const root = resolve(import.meta.dirname, "../..")
const packages = ["core", "react", "solid", "heroui", "locales"]
const fixtures = {
  core: `
    import { resolveAuthConfig } from '@better-auth-ui/core';
    import { ensureSessionServer } from '@better-auth-ui/core/server';
    void resolveAuthConfig; void ensureSessionServer;
  `,
  builtin: `
    import '@better-auth-ui/core/plugins/organization';
    import type { SettingsView, AuthView } from '@better-auth-ui/core';
    const settings: SettingsView = 'organizations';
    const auth: AuthView = 'acceptInvitation';
  `,
  external: `
    import type { SettingsView } from '@better-auth-ui/core';
    import '@better-auth-ui/core/lib/view-paths';
    declare module '@better-auth-ui/core/lib/view-paths' {
      interface SettingsViewPaths { cart?: string }
    }
    const view: SettingsView = 'cart';
  `,
  isolation: `
    import type { SettingsView } from '@better-auth-ui/core';
    // @ts-expect-error Organization views require the plugin import.
    const view: SettingsView = 'organizations';
  `,
  react: `
    import { AuthProvider, useSession } from '@better-auth-ui/react';
    import { ResetPasswordEmail } from '@better-auth-ui/react/email';
    import { useOrganization } from '@better-auth-ui/react/plugins/organization';
    void AuthProvider; void useSession; void ResetPasswordEmail; void useOrganization;
  `,
  solid: `
    import { AuthProvider, useSession } from '@better-auth-ui/solid';
    import { ResetPasswordEmail } from '@better-auth-ui/solid/email';
    import { useOrganization } from '@better-auth-ui/solid/plugins/organization';
    void AuthProvider; void useSession; void ResetPasswordEmail; void useOrganization;
  `,
  heroui: `
    import { AuthProvider } from '@better-auth-ui/heroui';
    import { ResetPasswordEmail } from '@better-auth-ui/heroui/email';
    void AuthProvider; void ResetPasswordEmail;
  `,
  locales: `
    import { defineAuthLocale } from '@better-auth-ui/locales';
    import { deDE } from '@better-auth-ui/locales/de-DE';
    import { enUS } from '@better-auth-ui/locales/en-US';
    import { esES } from '@better-auth-ui/locales/es-ES';
    void defineAuthLocale; void deDE; void enUS; void esES;
  `
}
const modes = [
  ["node16", ts.ModuleKind.Node16, ts.ModuleResolutionKind.Node16],
  ["nodenext", ts.ModuleKind.NodeNext, ts.ModuleResolutionKind.NodeNext],
  ["bundler", ts.ModuleKind.ESNext, ts.ModuleResolutionKind.Bundler]
] as const
const directory = await mkdtemp(resolve(tmpdir(), "auth-declaration-consumer-"))
try {
  await mkdir(resolve(directory, "node_modules/@better-auth-ui"), {
    recursive: true
  })
  for (const name of packages) {
    assert(
      ts.sys.fileExists(resolve(root, `packages/${name}/dist/index.d.ts`)),
      `Build ${name} before checking consumers`
    )
    await symlink(
      resolve(root, `packages/${name}`),
      resolve(directory, `node_modules/@better-auth-ui/${name}`),
      "dir"
    )
  }
  for (const [name, content] of Object.entries(fixtures)) {
    const path = resolve(directory, `${name}.mts`)
    await writeFile(path, content)
    for (const [mode, module, moduleResolution] of modes) {
      const program = ts.createProgram([path], {
        module,
        moduleResolution,
        noEmit: true,
        strict: true,
        // Match typical consumers; explicit symbol and augmentation assignments
        // above must still typecheck, even when dependency checking is skipped.
        skipLibCheck: true,
        types: [],
        target: ts.ScriptTarget.ESNext,
        jsx: ts.JsxEmit.ReactJSX
      })
      const diagnostics = ts.getPreEmitDiagnostics(program)
      assert.equal(
        diagnostics.length,
        0,
        `${name} (${mode}):\n${ts.formatDiagnosticsWithColorAndContext(
          diagnostics,
          {
            getCurrentDirectory: () => directory,
            getCanonicalFileName: (file) => file,
            getNewLine: () => "\n"
          }
        )}`
      )
    }
  }
  console.log(
    `Declaration consumers passed: ${Object.keys(fixtures).length} fixtures across ${modes.length} resolution modes.`
  )
} finally {
  await rm(directory, { recursive: true, force: true })
}
