#!/bin/bash

if [ ! -d frontend ]; then
    log "must run from root of repository"
    exit 1
fi

function log() {
    echo "---> ${1}"
}
