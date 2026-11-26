#!/bin/bash
# Après chaque écriture dans une zone vérifiée : lint déterministe. Code 2 = le message d'erreur revient à Claude dans le même tour.
f=$(python3 -c 'import sys,json; print(json.load(sys.stdin).get("tool_input",{}).get("file_path",""))' 2>/dev/null)
case "$f" in
  *.md) cd "$CLAUDE_PROJECT_DIR" && python3 brain.py lint >&2 || exit 2 ;;
esac
exit 0
