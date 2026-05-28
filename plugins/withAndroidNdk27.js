const {
    createRunOncePlugin,
    withProjectBuildGradle,
} = require("@expo/config-plugins");

const NDK_VERSION = "27.1.12297006";

const withAndroidNdk27 = (config) => {
    return withProjectBuildGradle(config, (config) => {
        if (config.modResults.language !== "groovy") {
            throw new Error(
                "withAndroidNdk27: project build.gradle must be groovy"
            );
        }
        config.modResults.contents = config.modResults.contents.replace(
            /ndkVersion\s*=\s*"[^"]*"/,
            `ndkVersion = "${NDK_VERSION}"`
        );
        return config;
    });
};

module.exports = createRunOncePlugin(
    withAndroidNdk27,
    "android-ndk-27",
    "1.0.0"
);
