#!/bin/bash

set -e

repos=(
    stig/json-framework
    Alexhuszagh/json
    amamchur/jsonlite
    eloraiby/rl-json-parser
)

for repo in ${repos[@]}; do
    git clone --depth 1 --single-branch "https://github.com/${repo}.git" "test/data/realworld/${repo}"
done
