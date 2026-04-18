const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.assetExts = [...config.resolver.assetExts, 'glb'];

config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules || {}),
  stream: path.resolve(__dirname, 'polyfills/stream.js'),
  buffer: path.resolve(__dirname, 'node_modules/buffer'),
  events: path.resolve(__dirname, 'node_modules/events'),
  string_decoder: path.resolve(__dirname, 'node_modules/string_decoder'),
};

module.exports = config;
