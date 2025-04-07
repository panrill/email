#!/bin/bash

# Package script for Email Form System HTML/JS Application
# This script packages all the necessary files for distribution

echo "📦 Starting packaging process for Email Form System..."

# Create distribution directory
DIST_DIR="./dist"
mkdir -p $DIST_DIR

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
  "js/pages/dashboard.js"
  "js/pages/forms.js"
  "js/pages/recipients.js"
  "js/pages/tracking.js"
  "js/pages/extraction.js"
  "js/pages/settings.js"
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
  echo "❌ Packaging failed: $MISSING_FILES required files are missing."
  exit 1
fi

echo "📂 Creating directory structure for distribution..."

# Create directory structure in distribution folder
mkdir -p $DIST_DIR/css
mkdir -p $DIST_DIR/js/core
mkdir -p $DIST_DIR/js/pages
mkdir -p $DIST_DIR/backend

echo "📋 Copying frontend files to distribution directory..."

# Copy HTML files
cp index.html $DIST_DIR/

# Copy CSS files
cp css/*.css $DIST_DIR/css/

# Copy JS files
cp js/core/*.js $DIST_DIR/js/core/
cp js/*.js $DIST_DIR/js/
cp js/pages/*.js $DIST_DIR/js/pages/

echo "🔧 Copying backend files to distribution directory..."

# Copy backend files
cp ../backend/*.py $DIST_DIR/backend/

echo "📝 Copying documentation files..."

# Copy documentation files
cp user_guide.md $DIST_DIR/
cp technical_documentation.md $DIST_DIR/
cp ../README.md $DIST_DIR/

echo "📦 Creating distribution package..."

# Create a distribution package
PACKAGE_NAME="email-form-system-html-js-$(date +%Y%m%d).zip"
cd $DIST_DIR
zip -r ../$PACKAGE_NAME *
cd ..

echo "✅ Packaging complete!"
echo "📦 Distribution package created: $PACKAGE_NAME"
echo "🚀 To deploy the application, extract the package and follow the instructions in README.md"
