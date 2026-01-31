# ========================
# Create a VPC
# ========================
resource "aws_vpc" "bot_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true
  tags = {
    Name = "pillsale-vpc"
  }
}

# ========================
# Internet Gateway
# ========================
resource "aws_internet_gateway" "bot_igw" {
  vpc_id = aws_vpc.bot_vpc.id
  tags = {
    Name = "pillsale-igw"
  }
}

# ========================
# Public Subnets
# ========================
resource "aws_subnet" "bot_public_subnet_1" {
  vpc_id                  = aws_vpc.bot_vpc.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "us-east-1a"
  map_public_ip_on_launch = true
  tags = {
    Name = "pillsale-public-subnet-1"
  }
}

resource "aws_subnet" "bot_public_subnet_2" {
  vpc_id                  = aws_vpc.bot_vpc.id
  cidr_block              = "10.0.2.0/24"
  availability_zone       = "us-east-1b"
  map_public_ip_on_launch = true
  tags = {
    Name = "pillsale-public-subnet-2"
  }
}

# ========================
# Route Table
# ========================
resource "aws_route_table" "bot_public_rt" {
  vpc_id = aws_vpc.bot_vpc.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.bot_igw.id
  }

  tags = {
    Name = "pillsale-public-rt"
  }
}

# ========================
# Route Table Associations
# ========================
resource "aws_route_table_association" "bot_subnet1_assoc" {
  subnet_id      = aws_subnet.bot_public_subnet_1.id
  route_table_id = aws_route_table.bot_public_rt.id
}

resource "aws_route_table_association" "bot_subnet2_assoc" {
  subnet_id      = aws_subnet.bot_public_subnet_2.id
  route_table_id = aws_route_table.bot_public_rt.id
}

# ========================
# Security Group
# ========================
resource "aws_security_group" "ecs_sg" {
  name        = "pillsale-ecs-sg"
  description = "Allow ECS Fargate internet access"
  vpc_id      = aws_vpc.bot_vpc.id

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTPS traffic from anywhere"
  }

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTP traffic from anywhere"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "pillsale-ecs-sg"
  }
}
