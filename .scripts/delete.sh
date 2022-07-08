#!/bin/bash

MY_DIR=$(realpath $0)
CICD_DIR=$(dirname $MY_DIR)
PROJECT_ROOT=$(dirname $CICD_DIR)

export PROJECT_NAME=${PROJECT_NAME:-app-name}

# These vars are needed to inject into the SAM template
export STAGE=$STAGE
export REGION=$REGION

if [ -z "$STAGE" ] ; then
  read -rep "Enter a value for STAGE: " STAGE
  export STAGE
fi

if [ -z "$REGION" ] ; then
  read -rep "Enter a value for REGION: " REGION
  export REGION
fi

echo "Deleting the project"
sam delete \
  --stack-name ${PROJECT_NAME}-${STAGE} \
  --region ${REGION} \
  > >(tee "${PROJECT_ROOT}/deploy.out") 2>&1
if [ $? -ne 0 ] ; then
  if grep -q "Error: Stack [^ ]\+ is deleted" "${PROJECT_ROOT}/delete.out" ; then
    echo "Project is deleted"
  else
    echo "Failed deleting the project to the environment. Aborting"
    exit 1
  fi
fi