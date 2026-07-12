// Expo + nativewind Metro config for a bun/nx monorepo.
const { getDefaultConfig } = require("expo/metro-config")
const { withNativeWind } = require("nativewind/metro")
const path = require("path")

const projectRoot = __dirname
const workspaceRoot = path.resolve(projectRoot, "../..")

const config = getDefaultConfig(projectRoot)

// Watch the workspace so edits to the @better-auth-ui/* packages are picked up.
config.watchFolders = [workspaceRoot]
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules")
]

// Resolve the workspace `src` export condition so @better-auth-ui/* load from
// source — then nativewind's babel transform processes their className props.
config.resolver.unstable_enablePackageExports = true
config.resolver.unstable_conditionNames = [
  "src",
  "react-native",
  "require",
  "import"
]

module.exports = withNativeWind(config, { input: "./global.css" })
