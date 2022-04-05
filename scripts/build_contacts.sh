#!/bin/bash
set -euio pipefail

if [ ! -d contacts ]; then
    echo "must run from root of repository"
    exit 1
fi

source ./scripts/shared.sh

# build
log "running contacts build"
(cd contacts && npm ci && npm run build)
log "complete"

# create archive
log "compressing"
test -d artifacts || mkdir artifacts
(cd artifacts && tar -zcvf contacts.tgz -C ../contacts/dist .)
log "done"
