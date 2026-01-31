resource "aws_ssm_parameter" "telegram_token" {
  name  = "/pillsale/telegram_bot_token"
  type  = "SecureString"
  value = "REPLACE_ME"
}
