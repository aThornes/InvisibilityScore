terraform {
  required_version = "~>1.9.5"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~>5.65.0"
    }
  }

  backend "s3" {
    bucket = "invisibile-calc-service-state"
    key    = "terraform.tfstate"
    region = "eu-west-2"
  }
}

provider "aws" {
  region = "eu-west-2"
}

locals {
  tags = {
    application = var.application
    environment = var.environment
    deployment  = "terraform"
  }

  lambda_buid_dir = "../api/dist"
  lambda_out_dir  = "artefacts"
  openapi_file    = "../api/openapi.yaml"
  config_file     = jsondecode(file("${local.lambda_buid_dir}/config.json"))

  lambdas = [
    for k, v in fileset(local.lambda_buid_dir, "*.js") : {
      name = k
      file = trimsuffix(k, ".js")
    }
  ]
}
