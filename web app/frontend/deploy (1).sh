#!/bin/bash

# Deployment script for Email Form System web application

# Install required packages
pip3 install gunicorn

# Copy systemd service file
sudo cp /home/ubuntu/email_form_system/web_app/email_form_system.service /etc/systemd/system/

# Reload systemd
sudo systemctl daemon-reload

# Enable and start the service
sudo systemctl enable email_form_system
sudo systemctl start email_form_system

# Check status
sudo systemctl status email_form_system

echo "Email Form System web application has been deployed!"
echo "You can access it at http://localhost:5000"
