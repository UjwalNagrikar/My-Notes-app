terraform {
  required_providers {
    aws = {
      source = "hashicorp/aws"
      version = "6.0.0"
    }
  }
}

provider "aws" {
  # Configuration options
  region = "ap-south-1"
  profile = "default"
}

resource "aws_instance" "My-Server" {
  ami = "ami-0f918f7e67a3323f0"
  instance_type = "t2.micro"
  key_name = "Ujwal-SRE"
  associate_public_ip_address = true
  vpc_security_group_ids = [ aws_security_group.my_sg.id ]



    user_data_base64 = base64encode(<<-EOF
    #!/bin/bash
    apt update -y
    apt install -y docker.io
    systemctl start docker
    systemctl enable docker
    apt install -y unzip wget
    cd /home/ubuntu
    wget https://github.com/UjwalNagrikar/My-Notes-app/archive/refs/heads/main.zip -O main.zip
    unzip main.zip
    chown -R ubuntu:ubuntu /home/ubuntu/
    cd My-Notes-app-main
    docker build -t notes-app .
    docker run -d -p 80:5000 notes-app
  EOF
  )

}



resource "aws_security_group" "my_sg" {
  name        = "my-sg"
  description = "Allow All traffic"
  vpc_id      = "vpc-0473ebd347ec8b538"

  ingress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "Allow all outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "my-sg"
  }
}
