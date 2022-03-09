#!/bin/bash
set -euio pipefail

if [ ! -d datalayer ]; then
    echo "must run from root of repository"
    exit 1
fi

source ./scripts/shared.sh

# build
log "running datalayer build"
(cd datalayer && npm ci && npm run build)
log "complete"

# create archive
log "compressing"
test -d artifacts || mkdir artifacts
(cd artifacts && tar -zcvf datalayer.tgz -C ../datalayer/dist .)
log "done"
