variable "instance_name" {}
variable "ssh_key" {}
variable "ssh_user" {}
variable "project" {}
variable "region" {}
variable "network" {}
variable "subnet" {}
variable "labels" {}
variable "disk_labels" {}
variable "enable_service_account" {
  default = false
}

resource "google_compute_address" "static" {
  name = "${var.instance_name}-static-ip"
}

resource "google_compute_instance" "instance-server" {
  name                      = var.instance_name
  machine_type              = "e2-small"
  zone                      = "${var.region}-b"
  allow_stopping_for_update = true

  dynamic "service_account" {
    for_each = var.enable_service_account == false ? [] : [true]

    content {
      scopes = ["cloud-platform"]
    }
  }

  labels = var.labels

  boot_disk {
    initialize_params {
      image = "ubuntu-os-cloud/ubuntu-2004-lts"
      labels = var.disk_labels
    }
  }

  metadata = {
    ssh-keys = "${var.ssh_user}:${var.ssh_key}"
  }


  network_interface {
    network    = var.network
    subnetwork = var.subnet

    access_config {
      nat_ip = google_compute_address.static.address
    }
  }
}

output "private_ip" {
  value = google_compute_instance.instance-server.network_interface.0.network_ip
}

output "ip" {
  value = google_compute_address.static.address
}

output "ssh_key" {
  value     = "${var.ssh_user}:${var.ssh_key}"
  sensitive = true
}
