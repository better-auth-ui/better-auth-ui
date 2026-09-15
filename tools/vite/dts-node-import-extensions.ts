import type { PluginOptions } from "vite-plugin-dts"

const RELATIVE_SPECIFIER = /(?<=(?:from|import)\s+['"])(\.\.?\/[^'"]+)(?=['"])/g

const INLINE_TYPE_IMPORT = /(?<=\bimport\()['"](\.\.?\/[^'"]+)(?=['"]\))/g

const EXTENSIONLESS_RELATIVE_PATTERNS = [
  RELATIVE_SPECIFIER,
  INLINE_TYPE_IMPORT
] as const

const HAS_DECLARATION_EXTENSION = /\.(?:js|json|css|mjs|cjs)$/

function appendJsExtension(specifier: string): string {
  if (HAS_DECLARATION_EXTENSION.test(specifier)) {
    return specifier
  }

  return `${specifier}.js`
}

/** Ensure NodeNext/nodenext consumers can resolve relative paths in .d.ts files. */
export function rewriteRelativeImportExtensionsInDeclarations(
  content: string
): string {
  return content
    .replace(RELATIVE_SPECIFIER, appendJsExtension)
    .replace(INLINE_TYPE_IMPORT, appendJsExtension)
}

export function findExtensionlessRelativeSpecifiers(content: string): string[] {
  return EXTENSIONLESS_RELATIVE_PATTERNS.flatMap((pattern) =>
    [...content.matchAll(pattern)]
      .map((match) => match[1])
      .filter((specifier) => !HAS_DECLARATION_EXTENSION.test(specifier))
  )
}

export function createDtsPluginOptions(
  options: PluginOptions = {}
): PluginOptions {
  const { beforeWriteFile, ...rest } = options

  return {
    ...rest,
    beforeWriteFile: async (_filePath, content) => {
      const userResult = beforeWriteFile
        ? await beforeWriteFile(_filePath, content)
        : undefined

      if (userResult === false) {
        return false
      }

      const baseContent =
        typeof userResult === "object" && userResult.content != null
          ? userResult.content
          : content

      const rewritten =
        rewriteRelativeImportExtensionsInDeclarations(baseContent)

      if (typeof userResult === "object") {
        return { ...userResult, content: rewritten }
      }

      return { content: rewritten }
    }
  }
}
