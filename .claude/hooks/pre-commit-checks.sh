#!/usr/bin/env bash
# Antes de `git commit`: lint + typecheck + gitleaks. Exit 2 bloquea la acción y devuelve el error a Claude.
input="$(cat)"
command="$(printf '%s' "$input" | python3 -c 'import json,sys; print(json.load(sys.stdin).get("tool_input",{}).get("command",""))' 2>/dev/null)"
case "$command" in
  *"git commit"*) ;;
  *) exit 0 ;;
esac
cd "$CLAUDE_PROJECT_DIR" || exit 0
npx expo lint >/tmp/petites-lint.log 2>&1 || { echo "ESLint falló:" >&2; tail -30 /tmp/petites-lint.log >&2; exit 2; }
npx tsc --noEmit >/tmp/petites-tsc.log 2>&1 || { echo "tsc --noEmit falló:" >&2; tail -30 /tmp/petites-tsc.log >&2; exit 2; }
if command -v gitleaks >/dev/null 2>&1; then
  gitleaks protect --staged --no-banner --redact >/tmp/petites-leaks.log 2>&1 || { echo "gitleaks detectó posibles secretos:" >&2; tail -20 /tmp/petites-leaks.log >&2; exit 2; }
fi
exit 0
