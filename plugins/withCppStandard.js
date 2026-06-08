const { withDangerousMod } = require("@expo/config-plugins");
const path = require("path");
const fs = require("fs");

// Injected inside the existing post_install block
const INJECT = `
  # ── Patch fmt for Xcode 26 / Apple Clang 18 ──────────────────────────────
  require 'fileutils'
  sandbox_root = installer.sandbox.root.to_s

  # Prepend undef+define to base.h so it wins over any PCH or existing define
  %w[base.h core.h format.h format-inl.h].each do |hdr|
    hdr_path = File.join(sandbox_root, 'fmt', 'include', 'fmt', hdr)
    next unless File.exist?(hdr_path)
    content = File.read(hdr_path)
    prefix = "// fmt consteval patch\\n#undef FMT_USE_CONSTEVAL\\n#define FMT_USE_CONSTEVAL 0\\n"
    unless content.start_with?(prefix)
      File.write(hdr_path, prefix + content)
    end
  end

  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |build_config|
      build_config.build_settings['CLANG_CXX_LANGUAGE_STANDARD'] = 'c++20'

      # Disable PCH for fmt so our defines are not shadowed by precompiled state
      if target.name == 'fmt'
        build_config.build_settings['GCC_PRECOMPILE_PREFIX_HEADER'] = 'NO'
      end

      defs = build_config.build_settings['GCC_PREPROCESSOR_DEFINITIONS']
      if defs.is_a?(Array)
        defs << 'FMT_USE_CONSTEVAL=0' unless defs.include?('FMT_USE_CONSTEVAL=0')
      elsif defs.is_a?(String)
        unless defs.include?('FMT_USE_CONSTEVAL=0')
          build_config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] = defs + ' FMT_USE_CONSTEVAL=0'
        end
      else
        build_config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] = ['$(inherited)', 'FMT_USE_CONSTEVAL=0']
      end
    end
  end
  # ─────────────────────────────────────────────────────────────────────────`;

module.exports = function withCppStandard(config) {
    return withDangerousMod(config, [
        "ios",
        async (cfg) => {
            const podfilePath = path.join(
                cfg.modRequest.platformProjectRoot,
                "Podfile",
            );
            let contents = fs.readFileSync(podfilePath, "utf-8");

            if (contents.includes("fmt consteval patch")) {
                return cfg;
            }

            if (contents.includes("post_install do |installer|")) {
                contents = contents.replace(
                    "post_install do |installer|",
                    `post_install do |installer|${INJECT}`,
                );
            } else {
                contents += `\npost_install do |installer|${INJECT}\nend\n`;
            }

            fs.writeFileSync(podfilePath, contents);
            return cfg;
        },
    ]);
};
