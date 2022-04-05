#!/bin/bash
set -euio pipefail

if [ ! -d tickets ]; then
    echo "must run from root of repository"
    exit 1
fi

source ./scripts/shared.sh

# build
log "running tickets build"
(cd tickets && npm ci && npm run build)
log "complete"

# create archive
log "compressing"
test -d artifacts || mkdir artifacts
(cd artifacts && tar -zcvf tickets.tgz -C ../tickets/dist .)
log "done"
