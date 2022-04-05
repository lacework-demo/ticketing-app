#!/bin/bash
set -eu

if [ ! -d assets ]; then
    echo "must run from root of repository"
    exit 1
fi

source ./scripts/shared.sh

# build
log "running all builds"
./scripts/build_contacts.sh
./scripts/build_assets.sh
./scripts/build_tickets.sh
./scripts/build_frontend.sh
log "complete all builds"
