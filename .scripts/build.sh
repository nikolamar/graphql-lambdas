#!/bin/bash

echo "Building the project with sam-cli and new beta features"

cd connect      && npm install && cd ..
cd default      && npm install && cd ..
cd dependencies && npm install && cd ..
cd disconnect   && npm install && cd ..
cd graphql      && npm install && cd ..

sam build --beta-features