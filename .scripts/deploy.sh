#!/bin/bash

MY_DIR=$(realpath $0)
CICD_DIR=$(dirname $MY_DIR)
PROJECT_ROOT=$(dirname $CICD_DIR)

export PROJECT_NAME=${PROJECT_NAME:-app-designer}
export AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID:-AKIASWTZ5BFC7DHMZPNI}
export AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY:-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}
export GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID:-482732927679-88t4d4g8tmb25au15rp1vbv71ap54nml.apps.googleusercontent.com}
export GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET:-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}

# These vars are needed to inject into the SAM template
export STAGE=${STAGE:-dev}
export REGION=${REGION:-us-east-1}
export DB_USER=${DB_USER:-admin}
export DB_PASSWORD=${DB_PASSWORD:-HyZUpaAf8bdpJBJ8}
export HOSTED_ZONE_ID=${HOSTED_ZONE_ID:-Z06649791VM8K30QX3WDR}
export DOMAIN_NAME=${DOMAIN_NAME:-nikolatec.com}
export SUB_DOMAIN_NAME=${SUB_DOMAIN_NAME:-app-designer-backend.dev}
export VERSION=${VERSION:-v0.2.3}

if [ -z "$AWS_ACCESS_KEY_ID" ] ; then
  read -rep "Enter a value for AWS_ACCESS_KEY_ID: " AWS_ACCESS_KEY_ID
  export AWS_ACCESS_KEY_ID
fi

if [ -z "$AWS_SECRET_ACCESS_KEY" ] ; then
  read -rep  "Enter a value for AWS_SECRET_ACCESS_KEY: " AWS_SECRET_ACCESS_KEY
  export AWS_SECRET_ACCESS_KEY
fi

if [ -z "$GOOGLE_CLIENT_ID" ] ; then
  read -rep "Enter a value for GOOGLE_CLIENT_ID: " GOOGLE_CLIENT_ID
  export GOOGLE_CLIENT_ID
fi

if [ -z "$GOOGLE_CLIENT_SECRET" ] ; then
  read -rep  "Enter a value for GOOGLE_CLIENT_SECRET: " GOOGLE_CLIENT_SECRET
  export GOOGLE_CLIENT_SECRET
fi

if [ -z "$STAGE" ] ; then
  read -rep  "Enter a value for STAGE: " STAGE
  export STAGE
fi

if [ -z "$REGION" ] ; then
  read -rep  "Enter a value for REGION: " REGION
  export REGION
fi

if [ -z "$DB_USER" ] ; then
  read -rep  "Enter a value for DB_USER: " DB_USER
  export DB_USER
fi

if [ -z "$DB_PASSWORD" ] ; then
  read -rep  "Enter a value for DB_PASSWORD: " DB_PASSWORD
  export DB_PASSWORD
fi

if [ -z "$HOSTED_ZONE_ID" ] ; then
  read -rep  "Enter a value for HOSTED_ZONE_ID: " HOSTED_ZONE_ID
  export HOSTED_ZONE_ID
fi

if [ -z "$SUB_DOMAIN_NAME" ] ; then
  read -rep  "Enter a value for SUB_DOMAIN_NAME: " SUB_DOMAIN_NAME
  export SUB_DOMAIN_NAME
fi

echo "Deploying the project"
sam deploy \
  --template-file "${PROJECT_ROOT}/.aws-sam/build/template.yaml" \
  --stack-name ${PROJECT_NAME}-${STAGE} \
  --region ${REGION} \
  --s3-bucket ${PROJECT_NAME}-cli-${STAGE} \
  --no-fail-on-empty-changeset \
  --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM \
  --parameter-overrides \
    "\
    ParameterKey=Stage,ParameterValue=${STAGE} \
    ParameterKey=ProjectName,ParameterValue=${PROJECT_NAME} \
    ParameterKey=DomainName,ParameterValue=${DOMAIN_NAME} \
    ParameterKey=SubDomainName,ParameterValue=${SUB_DOMAIN_NAME} \
    ParameterKey=HostedZoneId,ParameterValue=${HOSTED_ZONE_ID} \
    ParameterKey=DBUser,ParameterValue=${DB_USER} \
    ParameterKey=DBPassword,ParameterValue=${DB_PASSWORD} \
    ParameterKey=GoogleClientId,ParameterValue=${GOOGLE_CLIENT_ID} \
    ParameterKey=GoogleClientSecret,ParameterValue=${GOOGLE_CLIENT_SECRET} \
    ParameterKey=Version,ParameterValue=${VERSION} \
    "> >(tee "${PROJECT_ROOT}/deploy.out") 2>&1
if [ $? -ne 0 ] ; then
  if grep -q "Error: No changes to deploy\. Stack [^ ]\+ is up to date$" "${PROJECT_ROOT}/deploy.out" ; then
    echo "No changes needed, stack is already up to date"
  else
    echo "Failed deploying the project to the environment. Aborting"
    exit 1
  fi
fi