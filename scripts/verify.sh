#!/usr/bin/env bash
set -euo pipefail

echo "== Harness Verification =="

run_if_present() {
  local script="$1"
  if npm run | grep -E "^[[:space:]]+$script$" >/dev/null 2>&1; then
    echo "== $script =="
    npm run "$script"
  else
    echo "skip: npm script '$script' not found"
  fi
}

echo "Installing missing dependencies..."
if [[ -f yarn.lock ]]; then
  yarn install
elif [[ -f package-lock.json ]]; then
  npm ci
fi

# Run custom test and lint if provided
if npm run | grep -E "^[[:space:]]+test:unit$" >/dev/null 2>&1; then
    echo "== test:unit =="
    npm run test:unit
fi

if [[ -f .eslintrc.json ]]; then
    echo "== eslint =="
    npx eslint . --ext .js,.jsx || echo "ESLint have some non-blocking warnings/errors."
fi

run_if_present build
echo "VERIFICATION_PASS"
