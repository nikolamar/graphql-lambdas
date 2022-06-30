#!/bin/bash

echo "Building the project with sam-cli and new beta features"

npm install -g esbuild

sam build --beta-features