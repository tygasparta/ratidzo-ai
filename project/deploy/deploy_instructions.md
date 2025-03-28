# Ratidzo Health AI - cPanel Deployment Instructions

This document provides step-by-step instructions for deploying the Ratidzo Health AI application to cPanel hosting with the domain ratidzo.com.

## Prerequisites

- cPanel hosting account with:
  - Node.js support (version 16+ recommended)
  - SSH access (preferred but optional)
  - Support for application deployment

## Deployment Steps

### 1. Prepare Your Application

1. Make sure you have updated all configuration files for production:
   - Set appropriate API keys in `.env` file
   - Update URLs to match production domain (ratidzo.com)
   - Ensure `serve.js` is configured for production

2. Run the deployment script to create a package:
   ```bash
   chmod +x deploy/deploy.sh
   ./deploy/deploy.sh
   ```

### 2. Upload to cPanel

1. Log in to your cPanel account
2. Navigate to File Manager
3. Access the `public_html` directory (or appropriate subdirectory if using a subdomain)
4. Upload the `ratidzo-health-deploy.zip` file
5. Extract the uploaded zip file

### 3. Set Up Node.js Application in cPanel

#### If using cPanel's Node.js App Setup:

1. In cPanel, find "Setup Node.js App" or similar option
2. Create a new Node.js application:
   - Application root: `/public_html` (or your deployed directory)
   - Application URL: `ratidzo.com` (or your domain)
   - Application startup file: `serve.js`
   - Node.js version: Select the latest available (16+)
   - Environment variables: Add variables from your `.env` file
   - Click "Create" or "Save"

#### If using SSH:

1. Connect to your server via SSH
2. Navigate to your application directory:
   ```bash
   cd ~/public_html
   ```
3. Install dependencies:
   ```bash
   npm install --production
   ```
4. Set up a process manager (if available, such as PM2):
   ```bash
   npm install -g pm2
   pm2 start serve.js --name "ratidzo-health"
   pm2 save
   ```

### 4. Configure Domain and HTTPS

1. Ensure your domain (ratidzo.com) is properly set up in cPanel
2. Enable HTTPS/SSL:
   - In cPanel, locate "SSL/TLS" or "Let's Encrypt SSL"
   - Follow the steps to install an SSL certificate for your domain

### 5. Test Your Deployment

1. Open your browser and navigate to your domain (ratidzo.com)
2. Test all features of the application:
   - Chat functionality
   - Health diagnosis features
   - User interface interactions

### Troubleshooting

- **Application not starting**: Check the Node.js application logs in cPanel
- **API errors**: Verify that all environment variables are correctly set
- **404 errors**: Ensure proper URL routing in your application
- **CORS issues**: Verify that your serve.js file correctly handles CORS
- **File permissions**: Make sure all files have the correct permissions (usually 644 for files, 755 for directories)

### Maintenance

- Regularly check application logs for errors
- Set up monitoring for application uptime
- Create periodic backups of your application and data

For additional support, consult your hosting provider's documentation on Node.js application deployment. 