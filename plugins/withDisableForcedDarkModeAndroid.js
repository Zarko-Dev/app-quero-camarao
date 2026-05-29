const {
    createRunOncePlugin,
    withAndroidStyles,
    AndroidConfig,
} = require("@expo/config-plugins");

function setForceDarkModeToFalse(styles) {
    // SDK 53 generates AppTheme with DayNight.NoActionBar parent (was Light in SDK 52)
    styles = AndroidConfig.Styles.assignStylesValue(styles, {
        add: true,
        parent: { name: "AppTheme", parent: "Theme.AppCompat.DayNight.NoActionBar" },
        name: `android:forceDarkAllowed`,
        value: "false",
    });

    return styles;
}

const withDisableForcedDarkModeAndroid = (config) => {
    return withAndroidStyles(config, (config) => {
        config.modResults = setForceDarkModeToFalse(config.modResults);
        return config;
    });
};

module.exports = createRunOncePlugin(
    withDisableForcedDarkModeAndroid,
    "disable-forced-dark-mode",
    "1.0.0"
);
