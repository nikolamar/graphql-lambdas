#!/bin/bash

MY_DIR=$(realpath $0)
CICD_DIR=$(dirname $MY_DIR)
PROJECT_ROOT=$(dirname $CICD_DIR)

export AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID
export AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY
export REGION=$REGION
export POOL_ID=$POOL_ID
export CLIENT_ID=$CLIENT_ID

echo "Installing dependencies"
npm run update:modules

echo "Running all the tests"
./node_modules/.bin/jest --runInBand