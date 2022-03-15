variable "datalayer_instances" {
  default = 1
}

variable "datalayer_port" {
  default = 8889
}

# variable "k8s_worker_sg" {}
variable "vpc_id" {}
variable "subnet_id1" {}
variable "subnet_id2" {}
variable "region" {}
variable "cluster_worker_security_group" {}

provider "aws" {
  region = var.region
}

locals {
  names = [
    for s in range(var.datalayer_instances) : "datalayer_${s}"
  ]
}

resource "aws_security_group" "ticketing-intra-app-traffic" {
  name   = "ticket-intra-app-traffic"
  vpc_id = var.vpc_id
}

resource "aws_security_group_rule" "ticketing-intra-app-traffic-mongodb-sg" {
  type                     = "ingress"
  from_port                = 27017
  to_port                  = 27017
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.ticketing-intra-app-traffic.id
  security_group_id        = aws_security_group.ticketing-intra-app-traffic.id
}

resource "aws_security_group_rule" "ticketing-intra-app-traffic-datalayer-sg" {
  type              = "ingress"
  from_port         = var.datalayer_port
  to_port           = var.datalayer_port
  protocol          = "tcp"
  cidr_blocks       = ["10.0.0.0/16"]
  security_group_id = aws_security_group.ticketing-intra-app-traffic.id
}

resource "aws_security_group_rule" "traffic-to-from-k8s-worker-security-group" {
  type                     = "egress"
  from_port                = var.datalayer_port
  to_port                  = var.datalayer_port
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.ticketing-intra-app-traffic.id
  security_group_id        = var.cluster_worker_security_group
}

# resource "aws_security_group_rule" "ticketing-intra-app-traffic-datalayer-sg-from-k8s" {
#   type                     = "ingress"
#   from_port                = var.datalayer_port
#   to_port                  = var.datalayer_port
#   protocol                 = "tcp"
#   source_security_group_id = var.k8s_worker_sg
#   security_group_id        = aws_security_group.ticketing-intra-app-traffic.id
# }

resource "aws_security_group_rule" "ticketing-intra-app-traffic-datalayer-sg-egress" {
  type                     = "egress"
  from_port                = var.datalayer_port
  to_port                  = var.datalayer_port
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.ticketing-intra-app-traffic.id
  security_group_id        = aws_security_group.ticketing-intra-app-traffic.id
}

resource "aws_security_group_rule" "ticketing-intra-app-traffic-ingress-lb" {
  type              = "ingress"
  from_port         = 8080
  to_port           = 8080
  protocol          = "tcp"
  cidr_blocks       = ["0.0.0.0/0"]
  security_group_id = aws_security_group.ticketing-intra-app-traffic.id
}
resource "tls_private_key" "keypair" {
  algorithm = "RSA"
}

resource "aws_key_pair" "server-key" {
  key_name   = "ticketing-server-key"
  public_key = tls_private_key.keypair.public_key_openssh
}

module "ec2-instance" {
  source   = "./modules/ec2"
  for_each = toset(local.names)

  instance_name = each.key
  key_name      = aws_key_pair.server-key.key_name
  vpc_id        = var.vpc_id
  subnet        = var.subnet_id1
  extra_sg      = aws_security_group.ticketing-intra-app-traffic.id
}

module "mongodb-instance" {
  source        = "./modules/ec2"
  instance_name = "mongodb"
  key_name      = aws_key_pair.server-key.key_name
  vpc_id        = var.vpc_id
  subnet        = var.subnet_id1
  extra_sg      = aws_security_group.ticketing-intra-app-traffic.id
}

module "utility-instance" {
  source        = "./modules/ec2"
  instance_name = "ticketing-utilty"
  key_name      = aws_key_pair.server-key.key_name
  vpc_id        = aws_vpc.utility_vpc.id
  subnet        = aws_subnet.utility_subnet.id
  extra_sg      = ""
}


output "pem" {
  value     = tls_private_key.keypair.private_key_pem
  sensitive = true
}

output "ips" {
  value = tolist([for key in toset(local.names) : module.ec2-instance[key].ip])
}

output "utility_ip" {
  value = module.utility-instance.ip
}

output "private_ips" {
  value = tolist([for key in toset(local.names) : module.ec2-instance[key].private_ip])
}

output "mongodb_ip" {
  value = module.mongodb-instance.ip
}

output "mongodb_private_ip" {
  value = module.mongodb-instance.private_ip
}
