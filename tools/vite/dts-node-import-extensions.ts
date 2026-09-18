import { writeFile } from "node:fs/promises"
import { dirname, extname, resolve } from "node:path"
import ts from "typescript"
import type { PluginOptions } from "vite-plugin-dts"

const declarationExtension = /\.d\.(ts|mts|cts)$/

/** Visit module specifiers without touching comments or ordinary string literals. */
export function declarationSpecifiers(filePath: string, content: string) {
  const source = ts.createSourceFile(
    filePath,
    content,
    ts.ScriptTarget.Latest,
    true
  )
  const specifiers: ts.StringLiteralLike[] = []
  const visit = (node: ts.Node) => {
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier &&
      ts.isStringLiteralLike(node.moduleSpecifier)
    )
      specifiers.push(node.moduleSpecifier)
    else if (
      ts.isImportTypeNode(node) &&
      ts.isLiteralTypeNode(node.argument) &&
      ts.isStringLiteralLike(node.argument.literal)
    )
      specifiers.push(node.argument.literal)
    else if (ts.isModuleDeclaration(node) && ts.isStringLiteral(node.name))
      specifiers.push(node.name)
    else if (
      ts.isExternalModuleReference(node) &&
      node.expression &&
      ts.isStringLiteralLike(node.expression)
    )
      specifiers.push(node.expression)
    ts.forEachChild(node, visit)
  }
  visit(source)
  return { source, specifiers }
}

function resolveSpecifier(
  filePath: string,
  specifier: string,
  files: ReadonlySet<string>
) {
  if (
    !(
      specifier.startsWith("./") ||
      specifier.startsWith("../") ||
      specifier === "." ||
      specifier === ".."
    )
  )
    return specifier
  // Already explicit runtime/declaration/asset paths retain their meaning.
  if (/\.(?:[cm]?js|jsx|[cm]?ts|tsx|json)$/.test(specifier)) return specifier
  const target = resolve(dirname(filePath), specifier)
  const extensions = [
    [".d.ts", ".js"],
    [".d.mts", ".mjs"],
    [".d.cts", ".cjs"]
  ] as const
  for (const [declaration, runtime] of extensions) {
    if (files.has(`${target}${declaration}`)) return `${specifier}${runtime}`
  }
  for (const [declaration, runtime] of extensions) {
    if (files.has(resolve(target, `index${declaration}`)))
      return `${specifier.replace(/\/$/, "")}/index${runtime}`
  }
  if (extname(specifier)) return specifier
  throw new Error(
    `Cannot resolve declaration import ${JSON.stringify(specifier)} in ${filePath}`
  )
}

export function rewriteRelativeImportExtensionsInDeclarations(
  filePath: string,
  content: string,
  files: ReadonlySet<string>
): string {
  const { source, specifiers } = declarationSpecifiers(filePath, content)
  // Replace from right to left so original source positions stay valid.
  for (const node of specifiers.sort(
    (a, b) => b.getStart(source) - a.getStart(source)
  )) {
    const replacement = resolveSpecifier(filePath, node.text, files)
    if (replacement !== node.text) {
      content =
        content.slice(0, node.getStart(source) + 1) +
        replacement +
        content.slice(node.getEnd() - 1)
    }
  }
  return content
}

export function createDtsPluginOptions(
  options: PluginOptions = {}
): PluginOptions {
  const { afterBuild, ...rest } = options
  return {
    ...rest,
    // All declarations must exist before resolving directory imports. A per-file
    // beforeWriteFile hook runs while other files are still being emitted.
    afterBuild: async (emittedFiles) => {
      const files = new Set(
        [...emittedFiles.keys()].map((path) => resolve(path))
      )
      for (const [filePath, content] of emittedFiles) {
        if (!declarationExtension.test(filePath)) continue
        const rewritten = rewriteRelativeImportExtensionsInDeclarations(
          filePath,
          content,
          files
        )
        if (rewritten === content) continue
        await writeFile(filePath, rewritten)
        emittedFiles.set(filePath, rewritten)
      }
      await afterBuild?.(emittedFiles)
    }
  }
}
