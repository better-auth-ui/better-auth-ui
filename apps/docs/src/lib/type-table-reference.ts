import { isAbsolute, relative, resolve } from "node:path"
import type { MdxJsxFlowElement } from "mdast-util-mdx-jsx"
import type { VFile } from "vfile"

export function getTypeTableReference(
  node: MdxJsxFlowElement,
  file: VFile,
  workspaceRoot: string
) {
  function attribute(name: string): string {
    const value = node.attributes.find(
      (item) => item.type === "mdxJsxAttribute" && item.name === name
    )?.value
    if (typeof value !== "string" || !value.trim()) {
      file.fail(`<type-table> requires a string ${name}`, node)
    }
    return value
  }

  const path = attribute("path")
  const name = attribute("name")
  const sourcePath = resolve(workspaceRoot, path)
  const source = relative(workspaceRoot, sourcePath).replaceAll("\\", "/")
  if (isAbsolute(path) || source.startsWith("../") || path !== source) {
    file.fail("Type-table paths must be relative to the workspace root", node)
  }
  return { key: `${source}#${name}`, name, sourcePath }
}
