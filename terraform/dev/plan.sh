#!/bin/sh

. "$(dirname $0)/profile.sh"

terraform plan -var-file="dev/values.tfvars" -out TerraformPlan

