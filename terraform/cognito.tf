data "aws_iam_policy_document" "user_login_policy_document" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }

  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["cognito-idp.amazonaws.com"]
    }
  }
}

resource "aws_cognito_user_pool" "pool" {
  name = "invisibility-service-user-pool"
  tags = local.tags

  username_attributes      = ["email"]
  auto_verified_attributes = ["email"]
  user_attribute_update_settings {
    attributes_require_verification_before_update = ["email"]
  }

  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }

    recovery_mechanism {
      name     = "verified_phone_number"
      priority = 2
    }
  }

  password_policy {
    minimum_length                   = 8
    require_lowercase                = true
    require_numbers                  = true
    require_symbols                  = true
    require_uppercase                = true
    temporary_password_validity_days = 7
  }
}

resource "aws_cognito_user_pool_domain" "domain" {
  domain       = "insbility-service-domain"
  user_pool_id = aws_cognito_user_pool.pool.id
}

resource "aws_cognito_user_pool_client" "client" {
  name          = "insbility-service-client"
  user_pool_id  = aws_cognito_user_pool.pool.id
  callback_urls = ["https://localhost:3000"]
  logout_urls   = ["https://localhost:3000"]

  supported_identity_providers = ["COGNITO"]

  access_token_validity  = 60
  id_token_validity      = 60
  refresh_token_validity = 30

}


