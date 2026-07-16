const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

const projectRoot = __dirname;

// Ignore paths that churn in the background (docs, tooling, build output) and can
// trigger HMR / full-refresh reload loops during long dev sessions.
const blockList = [
  ...(Array.isArray(config.resolver.blockList)
    ? config.resolver.blockList
    : config.resolver.blockList
      ? [config.resolver.blockList]
      : []),
  new RegExp(`${escapeForRegex(path.join(projectRoot, 'docs'))}[\\\\/].*`),
  new RegExp(`${escapeForRegex(path.join(projectRoot, 'functions'))}[\\\\/].*`),
  new RegExp(`${escapeForRegex(path.join(projectRoot, 'dist'))}[\\\\/].*`),
  new RegExp(`${escapeForRegex(path.join(projectRoot, '.cursor'))}[\\\\/].*`),
  new RegExp(`${escapeForRegex(path.join(projectRoot, '.claude'))}[\\\\/].*`),
  new RegExp(`${escapeForRegex(path.join(projectRoot, 'coverage'))}[\\\\/].*`),
  /[\\/]agent-transcripts[\\/].*/,
  /[\\/]agent-tools[\\/].*/,
];

config.resolver.blockList = blockList;

config.watchFolders = [projectRoot];

config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      // Keep long-lived HMR / message sockets from being closed early by proxies.
      if (req.url?.includes('/hot') || req.url?.includes('/message')) {
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('Keep-Alive', 'timeout=120, max=1000');
      }
      return middleware(req, res, next);
    };
  },
};

config.watcher = {
  ...config.watcher,
  healthCheck: {
    enabled: true,
    interval: 30000,
    timeout: 10000,
  },
};

function escapeForRegex(filePath) {
  return filePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = config;
