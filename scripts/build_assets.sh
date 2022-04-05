#!/bin/bash
set -eu

if [ ! -d assets ]; then
    echo "must run from root of repository"
    exit 1
fi

source ./scripts/shared.sh

# build
log "running assets build"
(cd assets && npm ci && npm run build)
log "complete"

# create archive
log "compressing"
test -d artifacts || mkdir artifacts
(cd artifacts && tar -zcvf assets.tgz -C ../assets/dist .)
log "done"
