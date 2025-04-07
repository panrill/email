#!/bin/bash

# Deployment script for Email Form System HTML/JS Application
# This script prepares and deploys the application to a production environment

echo "📦 Starting deployment process for Email Form System..."

# Create deployment directory
DEPLOY_DIR="./deploy"
mkdir -p $DEPLOY_DIR

echo "🔍 Checking for required files..."

# Check if all required files exist
REQUIRED_FILES=(
  "index.html"
  "css/base.css"
  "css/layout.css"
  "css/components.css"
  "js/core/app.js"
  "js/core/router.js"
  "js/core/api.js"
  "js/core/auth.js"
  "js/core/store.js"
  "js/core/ui.js"
  "js/core/templates.js"
  "js/auth-implementation.js"
)

MISSING_FILES=0
for file in "${REQUIRED_FILES[@]}"; do
  if [ ! -f "$file" ]; then
    echo "❌ Missing required file: $file"
    MISSING_FILES=$((MISSING_FILES+1))
  else
    echo "✅ Found required file: $file"
  fi
done

if [ $MISSING_FILES -gt 0 ]; then
  echo "❌ Deployment failed: $MISSING_FILES required files are missing."
  exit 1
fi

echo "📂 Creating directory structure for deployment..."

# Create directory structure in deployment folder
mkdir -p $DEPLOY_DIR/css
mkdir -p $DEPLOY_DIR/js/core
mkdir -p $DEPLOY_DIR/js/pages
mkdir -p $DEPLOY_DIR/backend

echo "📋 Copying frontend files to deployment directory..."

# Copy HTML files
cp index.html $DEPLOY_DIR/

# Copy CSS files
cp css/*.css $DEPLOY_DIR/css/

# Copy JS files
cp js/core/*.js $DEPLOY_DIR/js/core/
cp js/*.js $DEPLOY_DIR/js/
if [ -d "js/pages" ]; then
  cp js/pages/*.js $DEPLOY_DIR/js/pages/
fi

echo "🔧 Copying backend files to deployment directory..."

# Copy backend files
cp ../backend/*.py $DEPLOY_DIR/backend/

echo "📝 Creating deployment configuration files..."

# Create .env file for backend configuration
cat > $DEPLOY_DIR/backend/.env << EOL
# Email Form System Production Configuration
DEBUG=False
SECRET_KEY=$(openssl rand -hex 24)
JWT_SECRET_KEY=$(openssl rand -hex 24)
ALLOWED_HOSTS=*
EOL

# Create systemd service file for backend
cat > $DEPLOY_DIR/email-form-system.service << EOL
[Unit]
Description=Email Form System
After=network.target

[Service]
User=www-data
WorkingDirectory=/var/www/email-form-system
ExecStart=/usr/bin/python3 /var/www/email-form-system/backend/app.py
Restart=always
Environment="PYTHONPATH=/var/www/email-form-system"

[Install]
WantedBy=multi-user.target
EOL

# Create nginx configuration file
cat > $DEPLOY_DIR/email-form-system.nginx << EOL
server {
    listen 80;
    server_name _;

    root /var/www/email-form-system;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOL

# Create deployment instructions
cat > $DEPLOY_DIR/README.md << EOL
# Email Form System Deployment

This directory contains all the files needed to deploy the Email Form System to a production environment.

## Deployment Instructions

### Prerequisites

- Ubuntu 20.04 or newer
- Python 3.8 or newer
- Nginx
- Systemd

### Installation Steps

1. Copy the contents of this directory to /var/www/email-form-system:

\`\`\`bash
sudo mkdir -p /var/www/email-form-system
sudo cp -r * /var/www/email-form-system
\`\`\`

2. Install required Python packages:

\`\`\`bash
sudo pip3 install flask flask-cors flask-jwt-extended python-dotenv gunicorn
\`\`\`

3. Set up the systemd service:

\`\`\`bash
sudo cp email-form-system.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable email-form-system
sudo systemctl start email-form-system
\`\`\`

4. Set up Nginx:

\`\`\`bash
sudo cp email-form-system.nginx /etc/nginx/sites-available/email-form-system
sudo ln -s /etc/nginx/sites-available/email-form-system /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
\`\`\`

5. Verify the installation:

\`\`\`bash
sudo systemctl status email-form-system
curl http://localhost
\`\`\`

## Default Login Credentials

- Email: admin@example.com
- Password: admin123

**Important**: Change the default password after first login!

## Troubleshooting

Check the logs for any issues:

\`\`\`bash
sudo journalctl -u email-form-system
\`\`\`

## Backup and Restore

To backup the application data:

\`\`\`bash
sudo tar -czvf email-form-system-backup.tar.gz /var/www/email-form-system/data
\`\`\`

To restore from backup:

\`\`\`bash
sudo tar -xzvf email-form-system-backup.tar.gz -C /
\`\`\`
EOL

# Create deployment script
cat > $DEPLOY_DIR/deploy.sh << EOL
#!/bin/bash

echo "🚀 Deploying Email Form System to production..."

# Check if running as root
if [ "\$(id -u)" -ne 0 ]; then
    echo "❌ This script must be run as root. Please use sudo."
    exit 1
fi

# Install required packages
echo "📦 Installing required packages..."
apt-get update
apt-get install -y python3 python3-pip nginx

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip3 install flask flask-cors flask-jwt-extended python-dotenv gunicorn

# Create application directory
echo "📂 Creating application directory..."
mkdir -p /var/www/email-form-system
cp -r * /var/www/email-form-system

# Set up systemd service
echo "🔧 Setting up systemd service..."
cp email-form-system.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable email-form-system
systemctl start email-form-system

# Set up Nginx
echo "🔧 Setting up Nginx..."
cp email-form-system.nginx /etc/nginx/sites-available/email-form-system
ln -sf /etc/nginx/sites-available/email-form-system /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx

echo "✅ Deployment complete! The application is now available at http://your-server-ip"
echo "   Default login: admin@example.com / admin123"
echo "   Please change the default password after first login."
EOL

# Make deployment script executable
chmod +x $DEPLOY_DIR/deploy.sh

echo "📦 Creating deployment package..."

# Create a deployment package
PACKAGE_NAME="email-form-system-$(date +%Y%m%d).zip"
cd $DEPLOY_DIR
zip -r ../$PACKAGE_NAME *
cd ..

echo "✅ Deployment preparation complete!"
echo "📦 Deployment package created: $PACKAGE_NAME"
echo "🚀 To deploy the application, copy the package to your server and run:"
echo "   unzip $PACKAGE_NAME && cd email-form-system && sudo ./deploy.sh"

# Test deployment locally
echo "🧪 Would you like to test the deployment locally? (y/n)"
read -p "> " TEST_LOCALLY

if [ "$TEST_LOCALLY" = "y" ]; then
  echo "🧪 Starting local deployment test..."
  
  # Start the backend server
  echo "🔧 Starting backend server..."
  cd $DEPLOY_DIR/backend
  python3 app.py &
  BACKEND_PID=$!
  cd ../..
  
  # Wait for backend to start
  sleep 3
  
  # Open the application in a browser
  echo "🌐 Opening application in browser..."
  if command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:5000
  elif command -v open &> /dev/null; then
    open http://localhost:5000
  else
    echo "🌐 Please open http://localhost:5000 in your browser"
  fi
  
  echo "🧪 Local test server running. Press Ctrl+C to stop."
  
  # Wait for user to stop the test
  trap "kill $BACKEND_PID; echo '🛑 Local test stopped.'" INT
  wait $BACKEND_PID
fi

echo "🎉 Deployment process completed successfully!"
