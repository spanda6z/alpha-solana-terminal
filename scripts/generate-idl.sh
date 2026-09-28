#!/usr/bin/env bash
# After anchor build, copy IDLs into the frontend
set -euo pipefail
mkdir -p app/src/idl
cp -v target/idl/*.json app/src/idl/ 2>/dev/null || echo "Run anchor build first"
echo "IDLs ready for the frontend"
