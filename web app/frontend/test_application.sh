#!/bin/bash

# Script to build and test the Email Form System web application

echo "===== Building and Testing Email Form System Web Application ====="

# Create build directory
mkdir -p /home/ubuntu/email_form_system/web_app/frontend/build

# Create test data directories if they don't exist
mkdir -p /home/ubuntu/email_form_system/data/{forms,returned_forms,extracted,results}

# Copy sample form for testing
cp /home/ubuntu/email_form_system/forms/sample_form.pdf /home/ubuntu/email_form_system/data/forms/

# Create test config file
cat > /home/ubuntu/email_form_system/data/config.json << EOL
{
  "client_id": "test-client-id",
  "client_secret": "test-client-secret",
  "sharepoint_site": "test-sharepoint-site",
  "token_path": "/home/ubuntu/email_form_system/data/o365_token",
  "users": {
    "admin@example.com": {
      "password": "pbkdf2:sha256:150000$test$hash",
      "name": "Admin User",
      "role": "admin"
    },
    "user@example.com": {
      "password": "pbkdf2:sha256:150000$test$hash",
      "name": "Test User",
      "role": "user"
    }
  },
  "email_templates": {
    "default_subject": "Please complete the attached form",
    "default_body": "Hello {Name},\n\nPlease complete the attached form and return it at your earliest convenience.\n\nThank you.",
    "signature": "Best regards,\nAdmin User\nEmail Form System"
  }
}
EOL

# Create test tracking file
python3 /home/ubuntu/email_form_system/scripts/create_sample_tracking.py

# Start backend server for testing
echo "Starting backend server..."
cd /home/ubuntu/email_form_system/web_app/backend
python3 app.py > /home/ubuntu/email_form_system/web_app/backend_test.log 2>&1 &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Test backend API endpoints
echo "Testing backend API endpoints..."

# Test login endpoint
echo "Testing login endpoint..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}')

if [[ $LOGIN_RESPONSE == *"access_token"* ]]; then
  echo "✅ Login endpoint test passed"
else
  echo "❌ Login endpoint test failed"
  echo "Response: $LOGIN_RESPONSE"
fi

# Extract token for authenticated requests
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

# Test forms endpoint
echo "Testing forms endpoint..."
FORMS_RESPONSE=$(curl -s -X GET http://localhost:5000/api/forms \
  -H "Authorization: Bearer $TOKEN")

if [[ $FORMS_RESPONSE == *"["* ]]; then
  echo "✅ Forms endpoint test passed"
else
  echo "❌ Forms endpoint test failed"
  echo "Response: $FORMS_RESPONSE"
fi

# Test recipients endpoint
echo "Testing recipients endpoint..."
RECIPIENTS_RESPONSE=$(curl -s -X GET http://localhost:5000/api/recipients \
  -H "Authorization: Bearer $TOKEN")

if [[ $RECIPIENTS_RESPONSE == *"["* ]]; then
  echo "✅ Recipients endpoint test passed"
else
  echo "❌ Recipients endpoint test failed"
  echo "Response: $RECIPIENTS_RESPONSE"
fi

# Test tracking endpoint
echo "Testing tracking endpoint..."
TRACKING_RESPONSE=$(curl -s -X GET http://localhost:5000/api/tracking \
  -H "Authorization: Bearer $TOKEN")

if [[ $TRACKING_RESPONSE == *"["* ]]; then
  echo "✅ Tracking endpoint test passed"
else
  echo "❌ Tracking endpoint test failed"
  echo "Response: $TRACKING_RESPONSE"
fi

# Test settings endpoint
echo "Testing settings endpoint..."
SETTINGS_RESPONSE=$(curl -s -X GET http://localhost:5000/api/settings \
  -H "Authorization: Bearer $TOKEN")

if [[ $SETTINGS_RESPONSE == *"email_templates"* ]]; then
  echo "✅ Settings endpoint test passed"
else
  echo "❌ Settings endpoint test failed"
  echo "Response: $SETTINGS_RESPONSE"
fi

# Kill backend server
echo "Stopping backend server..."
kill $BACKEND_PID

# Create frontend build directory structure
mkdir -p /home/ubuntu/email_form_system/web_app/frontend/build/static/{css,js,media}

# Create mock frontend build files for testing
echo "Creating mock frontend build files..."
cat > /home/ubuntu/email_form_system/web_app/frontend/build/index.html << EOL
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Email Form System</title>
  <link rel="stylesheet" href="/static/css/main.css">
</head>
<body>
  <div id="root">
    <h1>Email Form System</h1>
    <p>This is a test build of the Email Form System web application.</p>
  </div>
  <script src="/static/js/main.js"></script>
</body>
</html>
EOL

cat > /home/ubuntu/email_form_system/web_app/frontend/build/static/css/main.css << EOL
body {
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 20px;
}
h1 {
  color: #3f51b5;
}
EOL

cat > /home/ubuntu/email_form_system/web_app/frontend/build/static/js/main.js << EOL
console.log('Email Form System web application loaded');
EOL

# Test full stack deployment
echo "Testing full stack deployment..."
cd /home/ubuntu/email_form_system/web_app/backend
python3 app.py > /home/ubuntu/email_form_system/web_app/fullstack_test.log 2>&1 &
FULLSTACK_PID=$!

# Wait for server to start
sleep 3

# Test if server is running
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/)
if [[ $RESPONSE == "200" ]]; then
  echo "✅ Full stack deployment test passed"
else
  echo "❌ Full stack deployment test failed"
  echo "Response code: $RESPONSE"
fi

# Kill server
kill $FULLSTACK_PID

echo "===== Testing Complete ====="
echo "All tests have been executed. Check the logs for details."
