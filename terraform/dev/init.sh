#!/bin/sh

. "$(dirname $0)/profile.sh"

rm -rf .terraform/
terraform init