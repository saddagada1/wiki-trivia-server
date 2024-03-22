#!/bin/bash

# Read environment variables from .env file and substitute them in the template
env $(cat .env | grep -v '^#' | sed 's/\([^=]*\)=\(.*\)/\1="\2"/' | xargs) envsubst < kustomization-template.yaml > kustomization.yaml

echo "Kustomization file generated successfully."