const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Support @app/packages/* path alias
config.resolver.extraNodeModules = {
  '@app/packages': path.resolve(__dirname, 'src/packages'),
};

module.exports = config;
