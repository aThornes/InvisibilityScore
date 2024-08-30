locals {
  api_gw = merge({ for k, v in local.lambdas : "${v["name"]}_arn" => aws_lambda_function.lambda[k].arn }, { userPoolArn = aws_cognito_user_pool.pool.arn })

  depends_on = [aws_cognito_user_pool.pool]
}

resource "aws_api_gateway_rest_api" "gateway_api" {
  name = "invsibility-score-api-gateway"

  body = templatefile(local.openapi_file, local.api_gw)
}

resource "aws_api_gateway_deployment" "gateway_api_deployment" {
  rest_api_id = aws_api_gateway_rest_api.gateway_api.id

  triggers = {
    redeployment = sha1(join(",", [jsonencode(aws_api_gateway_rest_api.gateway_api.body)]))
  }

  lifecycle {
    create_before_destroy = true
  }

  depends_on = [aws_lambda_function.lambda]
}

resource "aws_api_gateway_stage" "deploy_stage" {
  deployment_id = aws_api_gateway_deployment.gateway_api_deployment.id
  rest_api_id   = aws_api_gateway_rest_api.gateway_api.id
  stage_name    = var.environment

  # More detailed logging can be enabled if required
  # xray_tracing_enabled = true

  lifecycle {
    ignore_changes = [cache_cluster_size]
  }
}

resource "aws_api_gateway_method_settings" "gateway_settings" {
  rest_api_id = aws_api_gateway_rest_api.gateway_api.id
  stage_name  = aws_api_gateway_stage.deploy_stage.stage_name
  method_path = "*/*"

  settings {
    logging_level        = "INFO"
    cache_data_encrypted = true

    metrics_enabled    = false
    data_trace_enabled = false
  }
}

resource "aws_lambda_permission" "gateway_permission" {
  for_each      = local.lambdas
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.lambda[each.key].function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_api_gateway_rest_api.gateway_api.execution_arn}/*/*/*"
}
