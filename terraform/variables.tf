variable "application" {
  description = "The name of the application"
  type        = string
  default     = "InvisbilityCalculator"
}

variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "dev"
}