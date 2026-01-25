# Pillsale Monitor Bot (AWS ECS Deployment)

A production-ready Telegram bot that monitors **pillsale.fun** and notifies subscribers when the site goes live.

This repository contains both:

- The **application code** (originally by Rehk Mansa)
- A **full AWS ECS + Terraform infrastructure** built and deployed by **Emmanuel Chukwudi**

---

## 🚀 What This Project Does

- Monitors https://www.pillsale.fun every 5 minutes
- Detects when the "Coming Soon" text disappears
- Notifies all subscribed Telegram users instantly
- Runs **24/7 on AWS ECS (Fargate)**

---

## 🧱 Architecture Overview

**AWS Services Used**

- **ECS (Fargate)** – runs the bot container
- **ECR** – stores the Docker image
- **VPC** – private networking
- **CloudWatch Logs** – application logging
- **IAM** – task execution & logging permissions
- **Terraform** – Infrastructure as Code
  
### Project Structure
```
.
├── src/ # Telegram bot source code
├── infra/ # Terraform infrastructure
│ ├── ecs.tf
│ ├── ecr.tf
│ ├── iam.tf
│ ├── vpc.tf
│ ├── variables.tf
│ └── outputs.tf
├── Dockerfile
├── .env.example
├── .gitignore
└── README.md
```
---

## 🛠 Infrastructure (Terraform)

All AWS resources are provisioned using Terraform.

### Create Infrastructure

```bash
cd infra
terraform init
terraform plan
terraform apply
```

This creates:

- ECS cluster
- ECS task definition
- ECS service
- ECR repository
- CloudWatch log group
- IAM roles
- VPC + subnets

### 🐳 Container Build & Push (ECR)

```
aws ecr get-login-password --region us-east-1 \
 | docker login --username AWS --password-stdin <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com

docker build -t pillsale-bot .
docker tag pillsale-bot:latest <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/pillsale-bot:latest
docker push <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/pillsale-bot:latest
```

Verifying the Bot Is Running
Check ECS Service

```
aws ecs list-services --cluster infinite_loop-cluster
```

### Check Running Tasks

```
aws ecs list-tasks \
  --cluster infinite_loop-cluster \
  --service-name app-test-service-g6kdm271
```

### View Logs

```
aws logs tail /ecs/pillsale-bot --follow
```

<img width="1890" height="879" alt="Screenshot (59)" src="https://github.com/user-attachments/assets/69c7e640-9a92-4ba6-9019-ea8bf2475647" />

If logs show polling and Telegram startup messages → ✅ bot is live.

### How to Test

```
Open the bot on Telegram
Send /start
Send /notify
```

Wait for site status change (or simulate locally)

```
🔐 Environment Variables
TELEGRAM_BOT_TOKEN=xxxx
TARGET_URL=https://www.pillsale.fun/
MONITOR_TEXT=Coming Soon
CHECK_INTERVAL_MS=300000
```

### Key DevOps Lessons Demonstrated

- ECS Fargate production deployment
- Terraform state & modular infra
- Container image lifecycle (build → push → deploy)
- CloudWatch log debugging
- IAM least-privilege roles
- Git hygiene (.terraform excluded)

### Credits

Original application code:
Rehk Mansa – Telegram Pillsale Monitor Bot

AWS Infrastructure, Deployment & DevOps:
Emmanuel Chukwudi

###📜 License
MIT

```
---

## Why this README is 🔥 for recruiters

- Shows **real AWS usage**
- Shows **Terraform**
- Shows **production verification**
- Gives **proper credit**
- Makes you look like a **DevOps engineer**, not just a bot runner
```
---

<img width="1536" height="1024" alt="ChatGPT Image Jan 25, 2026, 11_09_02 AM" src="https://github.com/user-attachments/assets/52e77846-196d-442d-9daa-459dcb3e4fa7" />


