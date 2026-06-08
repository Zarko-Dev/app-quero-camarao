const { withDangerousMod } = require("@expo/config-plugins");
const path = require("path");
const fs = require("fs");

// Injected inside the existing post_install block
const INJECT = `
  # ── Patch fmt for Xcode 26 / Apple Clang 18 consteval regression ─────────
  require 'fileutils'
  sandbox_root = installer.sandbox.root.to_s
  fmt_root = File.join(sandbox_root, 'fmt')

  # Replace ALL 'consteval' with 'constexpr' in every fmt header and source.
  # Apple Clang 18 (Xcode 26) has a consteval regression bug — this makes fmt
  # fall back to constexpr semantics which compile correctly.
  files_to_patch = Dir.glob(File.join(fmt_root, 'include', 'fmt', '*.h')) +
                   Dir.glob(File.join(fmt_root, 'src', '*.{h,cc}'))

  files_to_patch.each do |file_path|
    next unless File.exist?(file_path)
    content = File.read(file_path)
    patched = content.gsub(/\\bconsteval\\b/, 'constexpr')
    File.write(file_path, patched) if patched != content
  end

  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |build_config|
      build_config.build_settings['CLANG_CXX_LANGUAGE_STANDARD'] = 'c++20'

      if target.name == 'fmt'
        build_config.build_settings['GCC_PRECOMPILE_PREFIX_HEADER'] = 'NO'
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

            if (contents.includes("Apple Clang 18 consteval regression")) {
                return cfg;
            }

            // Remove old guard if present
            if (contents.includes("fmt consteval patch")) {
                // Will be replaced naturally since guard string changed
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
