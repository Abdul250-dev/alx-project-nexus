const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add resolver configuration for victory-native
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Add specific resolver for victory-native
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

module.exports = config; 