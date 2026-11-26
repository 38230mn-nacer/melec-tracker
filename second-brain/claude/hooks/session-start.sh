#!/bin/bash
# Injecte l'état du second cerveau avant le premier message (survit à /clear et /compact).
cd "$CLAUDE_PROJECT_DIR" || exit 0
echo "État du second cerveau (protocole : READ > PROPOSE > PREPARE dans _AI/ > EXECUTE sur validation)."
[ -f _AI/hot.md ] && { echo "--- _AI/hot.md ---"; head -n 40 _AI/hot.md; }
echo "--- sources à intégrer ---"
python3 brain.py status 2>&1 | head -n 20
exit 0
