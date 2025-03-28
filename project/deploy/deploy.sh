#!/bin/bash

# Ratidzo Health AI Deployment Script
# This script prepares the application for deployment to cPanel

echo "=== Ratidzo Health AI Deployment Script ==="
echo "Preparing files for deployment to cPanel (ratidzo.com)"

# Check if zip command is available
if ! command -v zip &> /dev/null; then
    echo "Error: zip command not found. Please install zip."
    exit 1
fi

# Create deployment zip
echo "Creating deployment package..."
cd "$(dirname "$0")"
ZIP_FILE="../ratidzo-health-deploy.zip"

# Remove existing zip if present
if [ -f "$ZIP_FILE" ]; then
    rm "$ZIP_FILE"
fi

# Create a new zip with all files
zip -r "$ZIP_FILE" * .env

# Finalize
echo "=== Deployment Package Created ==="
echo "Package saved to: $ZIP_FILE"
echo ""
echo "To deploy to cPanel:"
echo "1. Log in to your cPanel account"
echo "2. Upload and extract $ZIP_FILE to your public_html directory"
echo "3. Set up Node.js application in cPanel (if available)"
echo "4. Configure the application as per deploy_instructions.md"
echo ""
echo "For detailed instructions, please refer to deploy_instructions.md" 