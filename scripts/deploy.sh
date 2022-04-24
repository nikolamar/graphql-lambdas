#!/bin/bash

MY_DIR=$(realpath $0)
CICD_DIR=$(dirname $MY_DIR)
PROJECT_ROOT=$(dirname $CICD_DIR)

export PROJECT_NAME=${PROJECT_NAME:-app-designer}
export AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID
export AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY

# These vars are needed to inject into the SAM template
export STAGE=$STAGE
export REGION=$REGION
export ENVIRONMENT=${ENVIRONMENT:-production}
export DB_USER=$DB_USER
export DB_PASSWORD=$DB_PASSWORD
export HOSTED_ZONE_ID=$HOSTED_ZONE_ID
export DOMAIN_NAME=${DOMAIN_NAME:-nikolatec.com}
export SUB_DOMAIN_NAME=$SUB_DOMAIN_NAME
export VERSION=$VERSION

if [ -z "$AWS_ACCESS_KEY_ID" ] ; then
  read -p 'Enter a value for AWS_ACCESS_KEY_ID: ' AWS_ACCESS_KEY_ID
  export AWS_ACCESS_KEY_ID
fi

if [ -z "$AWS_SECRET_ACCESS_KEY" ] ; then
  read -sp 'Enter a value for AWS_SECRET_ACCESS_KEY (terminal will not echo your input): ' AWS_SECRET_ACCESS_KEY
  export AWS_SECRET_ACCESS_KEY
fi

echo "Deploying the project"
sam deploy \
  --template-file "${PROJECT_ROOT}/template.yaml" \
  --stack-name ${PROJECT_NAME}-${STAGE} \
  --region ${REGION} \
  --s3-bucket ${PROJECT_NAME}-cli-${STAGE} \
  --no-fail-on-empty-changeset \
  --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM \
  --parameter-overrides \
    "\
    ParameterKey=Stage,ParameterValue=${STAGE} \
    ParameterKey=Environment,ParameterValue=${ENVIRONMENT} \
    ParameterKey=ProjectName,ParameterValue=${PROJECT_NAME} \
    ParameterKey=DomainName,ParameterValue=${DOMAIN_NAME} \
    ParameterKey=SubDomainName,ParameterValue=${SUB_DOMAIN_NAME} \
    ParameterKey=HostedZoneId,ParameterValue=${HOSTED_ZONE_ID} \
    ParameterKey=DBUser,ParameterValue=${DB_USER} \
    ParameterKey=DBPassword,ParameterValue=${DB_PASSWORD} \
    ParameterKey=Version,ParameterValue=${VERSION} \
    "> >(tee "${PROJECT_ROOT}/deploy.out") 2>&1
if [ $? -ne 0 ] ; then
  if grep -q 'Error: No changes to deploy\. Stack [^ ]\+ is up to date$' "${PROJECT_ROOT}/deploy.out" ; then
    echo "No changes needed, stack is already up to date"
  else
    echo "Failed deploying the project to the environment. Aborting"
    exit 1
  fi
fi