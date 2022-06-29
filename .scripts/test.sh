#!/bin/bash

MY_DIR=$(realpath $0)
CICD_DIR=$(dirname $MY_DIR)
PROJECT_ROOT=$(dirname $CICD_DIR)

export AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID
export AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY
export REGION=$REGION
export POOL_ID=$POOL_ID
export CLIENT_ID=$CLIENT_ID

if [ -z "$AWS_ACCESS_KEY_ID" ] ; then
  read -rep "Enter a value for AWS_ACCESS_KEY_ID: " AWS_ACCESS_KEY_ID
  export AWS_ACCESS_KEY_ID
fi

if [ -z "$AWS_SECRET_ACCESS_KEY" ] ; then
  read -rep  "Enter a value for AWS_SECRET_ACCESS_KEY: " AWS_SECRET_ACCESS_KEY
  export AWS_SECRET_ACCESS_KEY
fi

if [ -z "$REGION" ] ; then
  read -rep  "Enter a value for REGION: " REGION
  export REGION
fi

if [ -z "$POOL_ID" ] ; then
  read -rep  "Enter a value for POOL_ID: " POOL_ID
  export POOL_ID
fi

if [ -z "$CLIENT_ID" ] ; then
  read -rep  "Enter a value for CLIENT_ID: " CLIENT_ID
  export CLIENT_ID
fi

echo "Installing dependencies"
npm run update:modules

echo "Running all the tests"
./node_modules/.bin/jest --runInBand