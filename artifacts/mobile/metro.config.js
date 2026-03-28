const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

config.watchFolders = [monorepoRoot];

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(monorepoRoot, "node_modules"),
];

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function blockPath(dir) {
  return new RegExp(escapeRegExp(path.resolve(monorepoRoot, dir)) + "[/\\\\].*");
}

const defaultBlockList = Array.isArray(config.resolver.blockList)
  ? config.resolver.blockList
  : config.resolver.blockList
    ? [config.resolver.blockList]
    : [];

config.resolver.blockList = [
  ...defaultBlockList,
  blockPath(".local"),
  blockPath(".git"),
  blockPath("artifacts/admin"),
  blockPath("artifacts/mockup-sandbox"),
  blockPath("artifacts/api-server"),
];

module.exports = config;
