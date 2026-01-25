resource "aws_ecr_repository" "bot" {
  name = "pillsale-bot"

  image_scanning_configuration {
    scan_on_push = true
  }
}
