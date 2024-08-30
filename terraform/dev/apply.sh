#!/bin/sh

. "$(dirname $0)/profile.sh"

terraform apply TerraformPlan
