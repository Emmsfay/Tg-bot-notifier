# ECR repository URL
output "ecr_repository_url" {
  description = "The URL of the Docker image repository in ECR"
  value       = aws_ecr_repository.bot.repository_url
}

# ECS cluster name
output "ecs_cluster_name" {
  description = "Name of the ECS Cluster"
  value       = aws_ecs_cluster.bot.name
}

# ECS Task Definition ARN
output "ecs_task_definition_arn" {
  description = "ARN of the ECS Task Definition"
  value       = aws_ecs_task_definition.bot.arn
}

# ECS Service Name
output "ecs_service_name" {
  description = "ECS Service for the Pillsale bot"
  value       = aws_ecs_service.bot.name
}

# EFS File System ID
output "efs_filesystem_id" {
  description = "EFS File System ID used for persistent storage"
  value       = aws_efs_file_system.bot.id
}

# SSM Parameter for Telegram Bot Token
output "ssm_telegram_token" {
  description = "SSM Parameter ARN for the Telegram Bot Token"
  value       = aws_ssm_parameter.telegram_token.arn
}
