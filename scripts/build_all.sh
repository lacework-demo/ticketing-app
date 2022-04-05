#!/bin/bash
set -euio pipefail

if [ ! -d assets ]; then
    echo "must run from root of repository"
    exit 1
fi

source ./scripts/shared.sh

# build
log "running all builds"
sh ./scripts/build_contacts.sh
sh ./scripts/build_assets.sh
sh ./scripts/build_tickets.sh
sh ./scripts/build_frontend.sh
log "complete all builds"
