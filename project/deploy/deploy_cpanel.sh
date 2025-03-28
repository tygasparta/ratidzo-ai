#!/bin/bash

# Ratidzo Health AI - cPanel Deployment Script
# This script prepares the application for deployment to cPanel

# Exit on error
set -e

echo "=== Ratidzo Health AI - cPanel Deployment Script ==="
echo "Preparing files for deployment to cPanel (ratidzo.com)"

# Create a deployment directory
DEPLOY_DIR="ratidzo-health-cpanel"
DIST_DIR="../dist"
DEPLOY_TARGET="../$DEPLOY_DIR"

# Check if the deployment directory exists
if [ -d "$DEPLOY_TARGET" ]; then
    echo "Removing existing deployment directory..."
    rm -rf "$DEPLOY_TARGET"
fi

# Create the deployment directory
echo "Creating deployment directory..."
mkdir -p "$DEPLOY_TARGET"

# Copy all dist files
echo "Copying distribution files..."
cp -r "$DIST_DIR"/* "$DEPLOY_TARGET/"

# Copy deployment-specific files
echo "Copying deployment configuration files..."
cp serve-cpanel.js "$DEPLOY_TARGET/serve.js"
cp .htaccess "$DEPLOY_TARGET/"
cp package.json "$DEPLOY_TARGET/"

# Copy environment file if it exists
if [ -f ".env" ]; then
    echo "Copying .env file..."
    cp .env "$DEPLOY_TARGET/"
else
    echo "Warning: No .env file found. Copying example file instead."
    cp .env.example "$DEPLOY_TARGET/.env"
    echo "IMPORTANT: Remember to update the .env file with your actual values!"
fi

# Create the deployment archive
echo "Creating deployment archive..."
ARCHIVE_NAME="../ratidzo-health-cpanel.zip"

# Remove existing archive if it exists
if [ -f "$ARCHIVE_NAME" ]; then
    rm "$ARCHIVE_NAME"
fi

# Create the archive
cd "$DEPLOY_TARGET/.."
zip -r "ratidzo-health-cpanel.zip" "$DEPLOY_DIR"

echo "=== Deployment Preparation Complete ==="
echo "Files prepared in: $DEPLOY_TARGET"
echo "Deployment archive created: $ARCHIVE_NAME"
echo ""
echo "Next Steps:"
echo "1. Upload the archive to your cPanel hosting"
echo "2. Extract the archive in your public_html directory"
echo "3. Set up the Node.js application in cPanel"
echo "4. For detailed instructions, see deploy_instructions.md"
echo "" 