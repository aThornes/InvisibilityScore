# The Invisibility Score Service - Terraform

Terraform, IaaC, is used to deploy this service to AWS

## Deployment

Before running terraform, first authenticate with AWS using the AWS CLi

And ensure the latest lambda code has been built using `yarn webpack`

Once done run the following scripts

1.  `./dev/init.sh`
2.  `./dev/plan.sh`

Review the changes listed from the plan and once everything looks good run

3. `./dev/apply.sh`
