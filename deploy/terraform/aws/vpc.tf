# Utility VPC
resource "aws_vpc" "utility_vpc" {
  cidr_block = "10.0.0.0/16"
  tags = {
    Name = "utility_vpc"
  }
}

resource "aws_subnet" "utility_subnet" {
  vpc_id                  = aws_vpc.utility_vpc.id
  cidr_block              = "10.0.5.0/24"
  availability_zone       = "${var.region}a"
  map_public_ip_on_launch = "true"
  tags = {
    Name = "utility_subnet"
  }
}

resource "aws_subnet" "utility_subnet1" {
  vpc_id                  = aws_vpc.utility_vpc.id
  cidr_block              = "10.0.6.0/24"
  map_public_ip_on_launch = false
  availability_zone       = "${var.region}b"
  tags = {
    Name = "utility_subnet1"
  }
}

resource "aws_internet_gateway" "utility_igw" {
  vpc_id = aws_vpc.utility_vpc.id
  tags = {
    Name = "utility_igw"
  }
}

resource "aws_default_route_table" "utility_route_table" {
  default_route_table_id = aws_vpc.utility_vpc.default_route_table_id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.utility_igw.id
  }
  tags = {
    Name = "default route table"
  }
}

output "utility_vpc_id" {
  value = aws_vpc.utility_vpc.id
}

output "utility_vpc_subnet_id1" {
  value = aws_subnet.utility_subnet.id
}

output "utility_vpc_subnet_id2" {
  value = aws_subnet.utility_subnet1.id
}
