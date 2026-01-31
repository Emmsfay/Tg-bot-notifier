# ECS Cluster
resource "aws_ecs_cluster" "bot" {
  name = "pillsale-cluster"
}

# CloudWatch Log Group (prevents runtime crash)
resource "aws_cloudwatch_log_group" "pillsale_bot" {
  name              = "/ecs/pillsale-bot"
  retention_in_days = 7
}

# ECS Task Definition
resource "aws_ecs_task_definition" "bot" {
  family                   = "pillsale-task"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]

  cpu    = "1024"
  memory = "2048"

  execution_role_arn = aws_iam_role.ecs_task_execution.arn
  task_role_arn      = aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([
    {
      name      = "pillsale-bot"
      image     = "757760338065.dkr.ecr.us-east-1.amazonaws.com/pillsale-bot:latest"
      essential = true

      portMappings = [
        {
          containerPort = 3000
          protocol      = "tcp"
        }
      ]

      environment = [
        { name = "TARGET_URL",        value = "https://www.pillsale.fun/" },
        { name = "MONITOR_TEXT",      value = "Coming Soon" },
        { name = "CHECK_INTERVAL_MS", value = "300000" },
        { name = "DATA_DIR",          value = "/app/data" }
      ]

      secrets = [
        {
          name      = "TELEGRAM_BOT_TOKEN"
          valueFrom = aws_ssm_parameter.telegram_token.arn
        }
      ]

      mountPoints = [
        {
          sourceVolume  = "bot-data"
          containerPath = "/app/data"
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.pillsale_bot.name
          awslogs-region        = "us-east-1"
          awslogs-stream-prefix = "ecs"
        }
      }
    }
  ])

  volume {
    name = "bot-data"

    efs_volume_configuration {
      file_system_id     = aws_efs_file_system.bot.id
      transit_encryption = "ENABLED"
    }
  }
}

# ECS Service
resource "aws_ecs_service" "pillsale_bot" {
  name            = "pillsale-bot-service"
  cluster         = aws_ecs_cluster.bot.id
  task_definition = aws_ecs_task_definition.bot.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = aws_subnet.private[*].id
    security_groups  = [aws_security_group.ecs.id]
    assign_public_ip = false
  }

  depends_on = [
    aws_efs_file_system.bot,
    aws_cloudwatch_log_group.pillsale_bot
  ]
}
