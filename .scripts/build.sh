#!/bin/bash

echo "Building the project with sam-cli and new beta features"

cd connect      && npm ci && cd ..
cd default      && npm ci && cd ..
cd dependencies && npm ci && cd ..
cd disconnect   && npm ci && cd ..
cd graphql      && npm ci && cd ..

sam build --beta-features