const { withDangerousMod } = require("@expo/config-plugins");
const path = require("path");
const fs = require("fs");

// React Native Firebase v26 resolve o Firebase iOS SDK via SPM por padrão.
// Com `use_frameworks! :linkage => :static` (configurado em expo-build-properties),
// cada pod embutiria sua própria cópia dos produtos SPM do Firebase e geraria
// erros de duplicate-symbol no link. Este plugin injeta
// `$RNFirebaseDisableSPM = true` no Podfile gerado para forçar resolução
// exclusiva via CocoaPods (compatível com linkage estático).
module.exports = function withRNFirebasePodfile(config) {
    return withDangerousMod(config, [
        "ios",
        async (cfg) => {
            const podfilePath = path.join(
                cfg.modRequest.platformProjectRoot,
                "Podfile",
            );
            let contents = fs.readFileSync(podfilePath, "utf-8");

            if (contents.includes("$RNFirebaseDisableSPM")) {
                return cfg;
            }

            contents = `$RNFirebaseDisableSPM = true\n${contents}`;

            fs.writeFileSync(podfilePath, contents);
            return cfg;
        },
    ]);
};