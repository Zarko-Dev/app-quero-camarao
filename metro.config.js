const { getDefaultConfig, mergeConfig } = require("@react-native/metro-config");
const { getSentryExpoConfig } = require("@sentry/react-native/metro");

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = getSentryExpoConfig(__dirname);

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
