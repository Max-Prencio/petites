#!/usr/bin/env bash
# Bloquea escribir claves privadas en el código: service role, EXPO_PUBLIC_*SERVICE*, llaves PEM.
input="$(cat)"
printf '%s' "$input" | python3 -c '
import json, re, sys
data = json.load(sys.stdin)
ti = data.get("tool_input", {})
path = ti.get("file_path", "")
text = " ".join(str(ti.get(k, "")) for k in ("content", "new_string", "new_str"))
for e in ti.get("edits", []) or []:
    text += " " + str(e.get("new_string", "")) + " " + str(e.get("new_str", ""))
if path.endswith(".env.example") or "/supabase/functions/" in path:
    sys.exit(0)
patterns = [
    (r"EXPO_PUBLIC_[A-Z_]*SERVICE", "Una clave de servicio nunca puede ir en una variable EXPO_PUBLIC_*"),
    (r"SUPABASE_SERVICE_ROLE_KEY\s*[=:]\s*[\"\x27]?eyJ", "No escribas la SUPABASE_SERVICE_ROLE_KEY en el repositorio"),
    (r"\bsb_secret_[A-Za-z0-9_-]{10,}", "No escribas claves secretas de Supabase en el repositorio"),
    (r"-----BEGIN (RSA |EC )?PRIVATE KEY-----", "No escribas llaves privadas en el repositorio"),
]
for pat, msg in patterns:
    if re.search(pat, text):
        print(msg, file=sys.stderr)
        sys.exit(2)
'
