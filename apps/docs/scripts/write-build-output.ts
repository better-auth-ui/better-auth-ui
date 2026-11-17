// Packages the prerendered docs in dist/client as Cloudflare Build Output, so
// `cf deploy --prebuilt` can upload them as an assets-only Worker.
import { fileURLToPath } from "node:url"
import {
  cleanBuildOutputDir,
  writeAssets,
  writeRootConfig,
  writeWorkerConfig
} from "@cloudflare/build-output-utils"
import { resolveAndParseConfig } from "@cloudflare/config"
import config from "../cloudflare.config.ts"

const root = fileURLToPath(new URL("..", import.meta.url))
const context = { isPreview: false, mode: "production" }

const result = await resolveAndParseConfig(config, context)
if (!result.success) throw result.error
const { worker, containers: _containers, ...settings } = result.data
if (!worker) throw new Error("cloudflare.config.ts must define a Worker")

await cleanBuildOutputDir(root)
await writeRootConfig({ root, settings, buildContext: context })
await writeWorkerConfig({ root, config: worker })
await writeAssets({
  root,
  sourceDirectory: fileURLToPath(new URL("../dist/client", import.meta.url))
})
