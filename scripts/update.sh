#!/bin/bash

MY_DIR=$(realpath $0)
CICD_DIR=$(dirname $MY_DIR)
PROJECT_ROOT=$(dirname $CICD_DIR)

echo "Project root"
echo $PROJECT_ROOT

echo "Updating modules"
cd "${PROJECT_ROOT}/src/dependencies/nodejs"
npm install
if [ $? -ne 0 ] ; then
    echo "Failed installing dependencies in layer lambda. Aborting"
    exit 1
fi

echo "Going back to the project root"
cd ${PROJECT_ROOT}

echo "Installing node dependencies in the project root"
npm install -D
if [ $? -ne 0 ] ; then
    echo "Failed installing dependencies in the project root. Aborting"
    exit 1
fi