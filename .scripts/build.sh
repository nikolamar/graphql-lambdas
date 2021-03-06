#!/bin/bash

MY_DIR=$(realpath $0)
CICD_DIR=$(dirname $MY_DIR)
PROJECT_ROOT=$(dirname $CICD_DIR)

echo "Install globally esbuild"

npm install -g esbuild

echo "Building the project with sam-cli and new beta features"

sam build --beta-features