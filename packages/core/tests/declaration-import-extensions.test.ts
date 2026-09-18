import { resolve } from "node:path"
import { describe, expect, it } from "vitest"
import {
  declarationSpecifiers,
  rewriteRelativeImportExtensionsInDeclarations
} from "../../../tools/vite/dts-node-import-extensions"

const entry = resolve("/declarations/index.d.ts")
const files = new Set([
  entry,
  resolve("/declarations/config.shared.d.ts"),
  resolve("/declarations/config/index.d.ts"),
  resolve("/declarations/view-paths.d.ts"),
  resolve("/declarations/helpers.d.mts"),
  resolve("/declarations/legacy.d.cts")
])

function rewrite(content: string) {
  return rewriteRelativeImportExtensionsInDeclarations(entry, content, files)
}

function specifiers(content: string) {
  return declarationSpecifiers(entry, content).specifiers.map(
    (node) => node.text
  )
}

describe("declaration module resolution", () => {
  it("resolves files, directory indexes and runtime module extensions", () => {
    expect(
      specifiers(
        rewrite(`
      export * from './config';
      import type { View } from './view-paths';
      type Helper = import('./helpers').Helper;
      import legacy = require('./legacy');
    `)
      )
    ).toEqual([
      "./config/index.js",
      "./view-paths.js",
      "./helpers.mjs",
      "./legacy.cjs"
    ])
  })

  it("rewrites augmentations and parent-directory imports", () => {
    const path = resolve("/declarations/config/index.d.ts")
    const content = `declare module '../view-paths' { interface View { custom: string } } export * from '..';`
    const output = rewriteRelativeImportExtensionsInDeclarations(
      path,
      content,
      files
    )
    expect(specifiers(output)).toEqual(["../view-paths.js", "../index.js"])
  })

  it("leaves bare imports, explicit extensions, comments and string literal types intact", () => {
    const content = `
      import type { View } from 'external';
      export * from './view-paths.js';
      export * from './types.d.ts';
      declare module 'external' { interface Extension {} }
      type Example = "export * from './missing'";
      /** import('./missing').Example */
    `
    expect(rewrite(content)).toBe(content)
  })

  it("rejects unresolved extensionless imports instead of shipping invented paths", () => {
    expect(() => rewrite(`export * from './missing';`)).toThrow()
  })

  it("resolves dotted basenames", () => {
    expect(specifiers(rewrite(`export * from './config.shared';`))).toEqual([
      "./config.shared.js"
    ])
  })

  it("is idempotent", () => {
    const once = rewrite(
      `export * from './config'; type View = import('./view-paths').View;`
    )
    expect(rewrite(once)).toBe(once)
  })
})
