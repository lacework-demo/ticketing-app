#!/bin/bash
set -eu

if [ ! -d frontend ]; then
    echo "must run from root of repository"
    exit 1
fi

source ./scripts/shared.sh

# build
log "running frontend build"
(cd frontend && npm ci && npm run build)
log "complete"

# create archive
log "compressing"
test -d artifacts || mkdir artifacts
(cd artifacts && tar -zcvf frontend.tgz -C ../frontend/build .)
log "done"

