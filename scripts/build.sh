#!/bin/bash

echo "Installing dependencies"
npm run update:modules

echo "Building the project"
npm run delete:build
npm run graphql:gen
npm run build:esbuild
npm run format:dist
npm run copy:schemas
npm run copy:modules