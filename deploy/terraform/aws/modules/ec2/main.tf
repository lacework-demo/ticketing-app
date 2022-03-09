variable "vpc_id" {}
variable "subnet" {}
variable "instance_name" {}
variable "ports" {
  default = "22"
}
variable "extra_sg" {}
variable "key_name" {}

data "aws_ami" "ubuntu" {
  most_recent = true
  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-focal-20.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }

  owners = ["099720109477"] # Canonical
}

locals {
  split_ports = split(",", var.ports)
}

resource "aws_security_group" "ingress-from-all" {
  name   = "${var.instance_name}-ingress-sg"
  vpc_id = var.vpc_id

  dynamic "ingress" {
    for_each = local.split_ports
    content {
      description = "open port ${ingress.value}"
      from_port   = tonumber(ingress.value)
      to_port     = tonumber(ingress.value)
      protocol    = "tcp"
      cidr_blocks = ["0.0.0.0/0"]
    }
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_instance" "instance-server" {
  tags = {
    "Hostname" = "${var.instance_name}"
  }
  ami                         = data.aws_ami.ubuntu.id
  instance_type               = "t2.micro"
  associate_public_ip_address = true
  subnet_id                   = var.subnet
  vpc_security_group_ids      = compact([aws_security_group.ingress-from-all.id, var.extra_sg])

  key_name   = var.key_name
  depends_on = [aws_security_group.ingress-from-all]
}

output "id" {
  value = aws_instance.instance-server.id
}

output "ip" {
  value = aws_instance.instance-server.public_ip
}

output "private_ip" {
  value = aws_instance.instance-server.private_ip
}
