resource "aws_efs_file_system" "bot" {
  tags = {
    Name = "pillsale-efs"
  }
}
