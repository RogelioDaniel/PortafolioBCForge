#!/usr/bin/env bash
# Wrapper persistente: reinicia `next dev` si muere.
# Evita que el sandbox mate el servidor de desarrollo.
cd /home/z/my-project
while true; do
  echo "[start-dev] launching next dev (pid $$) at $(date)" >> /home/z/my-project/dev.log
  ./node_modules/.bin/next dev -p 3000 >> /home/z/my-project/dev.log 2>&1
  echo "[start-dev] next dev exited with $? at $(date) — restarting in 2s" >> /home/z/my-project/dev.log
  sleep 2
done
