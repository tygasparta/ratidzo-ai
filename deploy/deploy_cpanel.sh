#!/bin/bash

# Ratidzo Health AI - cPanel Deployment Script
# This script prepares the application for deployment to cPanel

# Exit on error
set -e

echo "=== Ratidzo Health AI - cPanel Deployment Script ==="
echo "Preparing files for deployment to cPanel (ratidzo.com)"

# Define directories
DEPLOY_DIR="ratidzo-health-cpanel"
DIST_DIR="../dist"
CURRENT_DIR="$(pwd)"
DEPLOY_TARGET="../$DEPLOY_DIR"

# Check if the deployment directory exists
if [ -d "$DEPLOY_TARGET" ]; then
    echo "Removing existing deployment directory..."
    rm -rf "$DEPLOY_TARGET"
fi

# Create the deployment directory
echo "Creating deployment directory..."
mkdir -p "$DEPLOY_TARGET"

# Copy all dist files if dist exists
if [ -d "$DIST_DIR" ]; then
    echo "Copying distribution files from $DIST_DIR..."
    cp -r "$DIST_DIR"/* "$DEPLOY_TARGET/"
else
    # If no dist directory, copy files from current directory
    echo "No dist directory found, copying files from current directory..."
    cp -r ./* "$DEPLOY_TARGET/"
    # Exclude this script and some directories
    rm -f "$DEPLOY_TARGET/deploy_cpanel.sh"
    rm -rf "$DEPLOY_TARGET/node_modules" "$DEPLOY_TARGET/src" "$DEPLOY_TARGET/logs" 2>/dev/null || true
fi

# Copy server files
echo "Copying server configuration files..."
cp serve.js "$DEPLOY_TARGET/"
cp chat-integration.js "$DEPLOY_TARGET/"
cp deepseek-integration.js "$DEPLOY_TARGET/"

# Create necessary files for cPanel
echo "Creating cPanel configuration files..."

# Create .htaccess file
cat > "$DEPLOY_TARGET/.htaccess" << 'EOL'
# Ratidzo Health AI - .htaccess Configuration for cPanel

# Enable Rewrite Engine
RewriteEngine On

# If a file or directory exists, serve it directly
RewriteCond %{REQUEST_FILENAME} -f [OR]
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule ^ - [L]

# For Node.js proxy with cPanel
# Uncomment and modify these lines if using cPanel's Node.js Application Manager
# RewriteRule ^api/(.*) http://localhost:8080/api/$1 [P,L]
# RewriteRule ^socket.io/(.*) http://localhost:8080/socket.io/$1 [P,L]

# Otherwise, serve index.html (for SPA routing)
RewriteRule ^ index.html [L]

# Security headers
<IfModule mod_headers.c>
    Header set X-Content-Type-Options "nosniff"
    Header set X-XSS-Protection "1; mode=block"
    Header set X-Frame-Options "SAMEORIGIN"
    Header set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; img-src 'self' data:; connect-src 'self' https://api.deepseek.com;"
</IfModule>

# Set caching headers for static assets
<FilesMatch "\.(css|js|jpg|jpeg|png|gif|ico|svg|woff|woff2|ttf)$">
    Header set Cache-Control "max-age=31536000, public"
</FilesMatch>

# Custom error pages
ErrorDocument 404 /index.html
ErrorDocument 500 /index.html
EOL

# Create package.json
cat > "$DEPLOY_TARGET/package.json" << 'EOL'
{
  "name": "ratidzo-health-ai",
  "version": "1.0.0",
  "description": "Ratidzo Health AI - Medical diagnosis and chat assistant",
  "main": "serve.js",
  "scripts": {
    "start": "node serve.js",
    "start:prod": "NODE_ENV=production node serve.js"
  },
  "engines": {
    "node": ">=16.0.0"
  },
  "dependencies": {
    "axios": "^1.6.0",
    "dotenv": "^16.3.1",
    "node-fetch": "^3.3.2"
  },
  "type": "module",
  "author": "Ratidzo Health",
  "license": "UNLICENSED",
  "private": true
}
EOL

# Create .env file or copy existing one
if [ -f ".env" ]; then
    cp .env "$DEPLOY_TARGET/"
else
    # Create an example .env file
    cat > "$DEPLOY_TARGET/.env" << 'EOL'
# Ratidzo Health AI - Environment Variables

# DeepSeek API Configuration
DEEPSEEK_API_KEY=sk-b2685fbe1ad44eebbc6193148a31dade
# Set to true to use DeepSeek AI API for diagnosis, false to use local rule-based diagnosis
USE_DEEPSEEK_API=true

# Server configuration
PORT=8080
NODE_ENV=production
EOL
fi

# Create deployment instructions
cat > "$DEPLOY_TARGET/README.md" << 'EOL'
# Ratidzo Health AI - cPanel Deployment

This package contains all the files needed to deploy the Ratidzo Health AI application to a cPanel hosting environment.

## Quick Setup Guide

1. **Upload to cPanel**:
   - Log into your cPanel account
   - Navigate to File Manager
   - Access the `public_html` directory
   - Upload all files from this package

2. **Set Up Node.js Application**:
   - In cPanel, find "Setup Node.js App" or similar option
   - Create a new Node.js application:
     - Application root: `/public_html` (or your deployed directory)
     - Application URL: Your domain name
     - Application startup file: `serve.js`
     - Node.js version: Select the latest available (16+)
     - Environment variables: Use the values from your `.env` file
     - Click "Create" or "Save"

3. **Verify Installation**:
   - Visit your website to test the application
   - Try the health diagnosis feature
   - Test the chat functionality

## Troubleshooting

- If you encounter issues, check the Node.js application logs in cPanel
- Ensure your DeepSeek API key is correctly set in the .env file
- Make sure your server supports Node.js v16 or higher

For additional assistance, please refer to the detailed documentation.
EOL

# Create the deployment archive
echo "Creating deployment archive..."
ARCHIVE_NAME="../ratidzo-health-cpanel.zip"

# Remove existing archive if it exists
if [ -f "$ARCHIVE_NAME" ]; then
    rm "$ARCHIVE_NAME"
fi

# Create the archive
cd ..
zip -r "ratidzo-health-cpanel.zip" "$DEPLOY_DIR" -x "*/node_modules/*" "*/logs/*"

echo "=== Deployment Preparation Complete ==="
echo "Files prepared in: $DEPLOY_DIR"
echo "Deployment archive created: ratidzo-health-cpanel.zip"
echo ""
echo "Next Steps:"
echo "1. Upload the archive to your cPanel hosting"
echo "2. Extract the archive in your public_html directory"
echo "3. Set up the Node.js application in cPanel"
echo "" 