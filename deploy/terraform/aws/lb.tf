resource "aws_alb" "ticketing_alb" {
  name            = "ticketing-alb"
  subnets         = [var.subnet_id1, var.subnet_id2]
  security_groups = [aws_security_group.ticketing-intra-app-traffic.id]
  internal        = true
}

resource "aws_alb_listener" "ticketing_alb_listener" {
  load_balancer_arn = aws_alb.ticketing_alb.arn
  port              = 8080
  protocol          = "HTTP"

  default_action {
    target_group_arn = aws_alb_target_group.ticketing_alb_target_group.arn
    type             = "forward"
  }
}

resource "aws_alb_target_group" "ticketing_alb_target_group" {
  name     = "ticketing-alb-target-group"
  port     = var.datalayer_port
  protocol = "HTTP"
  vpc_id   = var.vpc_id
  health_check {
    healthy_threshold   = 3
    unhealthy_threshold = 10
    timeout             = 5
    interval            = 10
    path                = "/tickets"
    port                = var.datalayer_port
  }
}

resource "aws_alb_target_group_attachment" "ticketing_alb_group_tg_attachment" {
  for_each = toset(local.names)
  depends_on = [
    module.ec2-instance
  ]

  target_group_arn = aws_alb_target_group.ticketing_alb_target_group.arn
  target_id        = module.ec2-instance[each.key].id
  port             = var.datalayer_port
}


output "datalayer-url" {
  value = aws_alb.ticketing_alb.dns_name
}

output "datalayer-port" {
  value = aws_alb_listener.ticketing_alb_listener.port
}
