import { defineConfig, defineDocs } from "fumadocs-mdx/config"
import lastModified from "fumadocs-mdx/plugins/last-modified"
import { createGenerator, remarkAutoTypeTable } from "fumadocs-typescript"
import remarkCodeImport from "remark-code-import"

const generator = createGenerator()

export const docs = defineDocs({
  dir: "content/docs",
  docs: {
    postprocess: {
      includeProcessedMarkdown: true
    }
  }
})

export default defineConfig({
  plugins: [lastModified()],
  mdxOptions: {
    remarkPlugins: [
      [remarkCodeImport, { allowImportingFromOutside: true }],
      [remarkAutoTypeTable, { generator }]
    ],
    remarkNpmOptions: {
      persist: {
        id: "package-manager"
      }
      // packageManagers: [
      //   {
      //     name: "bun",
      //     command: (command) => command.replace("npm install", "bun add")
      //   },
      //   {
      //     name: "npm",
      //     command: (command) => command
      //   },
      //   {
      //     name: "pnpm",
      //     command: (command) => command.replace("npm install", "pnpm add")
      //   },
      //   {
      //     name: "yarn",
      //     command: (command) => command.replace("npm install", "yarn add")
      //   }
      // ]
    }
  }
})
