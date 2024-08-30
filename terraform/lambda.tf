data "archive_file" "lambda_zip" {
  for_each    = local.lambdas
  type        = "zip"
  source_file = "${local.lambda_buid_dir}/${each.value["filename"]}"
  output_path = "${local.lambda_out_dir}/${each.value["name"]}.zip"
}

resource "aws_lambda_function" "my_lambda" {
  for_each = local.lambdas
  tags     = local.tags

  role = aws_iam_role.basic_lambda_execution.arn

  function_name = each.value["name"]
  filename      = "${local.lambda_out_dir}/${each.value["name"]}.zip"

  handler          = "${each.value["file"]}.handler"
  source_code_hash = data.archive_file.lambda_zip[each.key].output_base64sha256
  runtime          = "nodejs20.x"
  publish          = true

  timeout = try(local.config_file[each.value["timeout"]], 5)

  vpc_config {
    subnet_ids         = [aws_subnet.private_subnet.id]
    security_group_ids = [aws_vpc.main.default_security_group_id]
  }

  depends_on = [aws_iam_role.lambda_basic_role, aws_subnet.private_subnet]
}

