variable "region" {}
variable "project" {}
variable "network" {}
variable "subnet" {}
variable "labels" {
  type = map(string)
  default = {}
}
variable "disk_labels" {
  type = map(string)
  default = {}
}

variable "datalayer_instances" {
  default = 1
}

terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "3.52.0"
    }
  }

  required_version = "> 0.14"
}

provider "google" {
  project = var.project
  region  = var.region
}

resource "tls_private_key" "keypair" {
  algorithm = "RSA"
}


locals {
  names = [
    for s in range(var.datalayer_instances) : "datalayer${s}"
  ]
  ssh_user = "ubuntu"
}

resource "google_compute_firewall" "enable-4999-all" {
  name    = "ticketing-firewall-4999-all"
  network = var.network

  allow {
    protocol = "tcp"
    ports    = ["4999"]
  }

  source_ranges = toset(["0.0.0.0/0"])
}

resource "google_compute_firewall" "enable-ssh-all" {
  name    = "ticketing-firewall-ssh-all"
  network = var.network

  allow {
    protocol = "tcp"
    ports    = ["22"]
  }

  source_ranges = toset(["0.0.0.0/0"])
}

resource "google_compute_firewall" "enable-all-private-cluster-ip-ranges" {
  name    = "ticketing-firewall-internal"
  network = var.network

  allow {
    protocol = "all"
  }
  source_ranges = toset(["10.0.0.0/22","192.168.0.0/22","192.168.64.0/22"])
}

module "gcp-instance" {
  source   = "./modules/gcpcompute"
  for_each = toset(local.names)

  instance_name          = each.key
  ssh_key                = tls_private_key.keypair.public_key_openssh
  ssh_user               = local.ssh_user
  network                = var.network
  subnet                 = var.subnet
  project                = var.project
  region                 = var.region
  labels                 = var.labels
  disk_labels            = var.disk_labels
  enable_service_account = true
}

module "mongodb-instance" {
  source        = "./modules/gcpcompute"
  instance_name = "mongodb"
  ssh_key       = tls_private_key.keypair.public_key_openssh
  ssh_user      = local.ssh_user
  network       = var.network
  subnet        = var.subnet
  project       = var.project
  region        = var.region
  labels        = var.labels
  disk_labels   = var.disk_labels
}

module "utility-instance" {
  source        = "./modules/gcpcompute"
  instance_name = "ticketing-utilty"
  ssh_key       = tls_private_key.keypair.public_key_openssh
  ssh_user      = local.ssh_user
  network       = var.network
  subnet        = var.subnet
  project       = var.project
  region        = var.region
  labels        = var.labels
  disk_labels   = var.disk_labels
}

output "pem" {
  value     = tls_private_key.keypair.private_key_pem
  sensitive = true
}

output "ips" {
  value = tolist([for key in toset(local.names) : module.gcp-instance[key].ip])
}

output "utility_ip" {
  value = module.utility-instance.ip
}

output "private_ips" {
  value = tolist([for key in toset(local.names) : module.gcp-instance[key].private_ip])
}

output "mongodb_ip" {
  value = module.mongodb-instance.ip
}

output "mongodb_private_ip" {
  value = module.mongodb-instance.private_ip
}
