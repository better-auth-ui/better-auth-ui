// Expo Metro config for a bun/nx monorepo — NO nativewind (the
// @better-auth-ui/react-native package styles itself with plain RN styles).
const { getDefaultConfig } = require("expo/metro-config")
const path = require("node:path")

const projectRoot = __dirname
const workspaceRoot = path.resolve(projectRoot, "../..")

const config = getDefaultConfig(projectRoot)

// Watch the workspace so edits to the @better-auth-ui/* packages are picked up.
config.watchFolders = [workspaceRoot]
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules")
]

// Resolve the workspace `react-native`/`src` export condition so @better-auth-ui/*
// load from source.
config.resolver.unstable_enablePackageExports = true
config.resolver.unstable_conditionNames = [
  "react-native",
  "src",
  "require",
  "import"
]

module.exports = config
