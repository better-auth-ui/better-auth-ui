// Expo Metro config for a bun/nx monorepo, without nativewind (the
// @better-auth-ui/react-native package styles itself with plain RN styles).
import path from "node:path"

import { getDefaultConfig } from "expo/metro-config.js"

const projectRoot = import.meta.dirname
const workspaceRoot = path.resolve(projectRoot, "../..")

const defaultConfig = getDefaultConfig(projectRoot)

const config = {
  ...defaultConfig,
  // Watch the workspace so edits to the @better-auth-ui/* packages are picked
  // up.
  watchFolders: [workspaceRoot],
  resolver: {
    ...defaultConfig.resolver,
    nodeModulesPaths: [
      path.resolve(projectRoot, "node_modules"),
      path.resolve(workspaceRoot, "node_modules")
    ],
    // Resolve the workspace `react-native`/`src` export condition so
    // @better-auth-ui/* load from source.
    unstable_enablePackageExports: true,
    unstable_conditionNames: ["react-native", "src", "require", "import"]
  }
}

export default config
