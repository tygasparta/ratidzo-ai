# Ratidzo Health AI - cPanel Deployment Guide

This package contains all the files needed to deploy the Ratidzo Health AI application to cPanel. Follow the steps below to get your site up and running.

## Quick Setup Guide

### 1. Upload Files to cPanel

1. Log in to your cPanel account
2. Navigate to **File Manager**
3. Access your **public_html** directory (or create a subdomain if desired)
4. Upload all files from this package
5. Make sure to preserve the directory structure

### 2. Set Up Node.js Application in cPanel

Most cPanel installations have a Node.js Application Manager. If yours does:

1. In cPanel, find **Setup Node.js App** or similar option
2. Create a new Node.js application:
   - **Application root**: `/public_html` (or your upload directory)
   - **Application URL**: Your domain name (e.g., ratidzo.com)
   - **Application startup file**: `serve.js`
   - **Node.js version**: Select the latest available (16+)
   - **Environment variables**: Copy from the `.env` file
   - Click "Create" or "Save"

If your cPanel doesn't have Node.js support:

1. Contact your hosting provider to enable Node.js support
2. Or consider using a different hosting provider that supports Node.js applications

### 3. Set Environment Variables

Ensure these environment variables are set in your Node.js application:

```
PORT=8080
NODE_ENV=production
DEEPSEEK_API_KEY=sk-b2685fbe1ad44eebbc6193148a31dade
USE_DEEPSEEK_API=true
```

### 4. Start the Application

1. Once your Node.js application is configured, start it through the cPanel interface
2. The application should now be running on port 8080 (or your configured port)

### 5. Configure .htaccess

The provided `.htaccess` file contains rules to route API requests to your Node.js application. If you encounter issues:

1. Check if your cPanel supports Apache mod_proxy
2. If needed, modify the RewriteRule in `.htaccess` to match your actual Node.js application URL

### 6. Test Your Deployment

1. Visit your domain in a web browser
2. Test the health diagnosis feature
3. Try the chat functionality
4. Verify all other features are working properly

## Troubleshooting

If you encounter issues with your deployment:

1. **Server not starting**: Check your Node.js application logs in cPanel
2. **API errors**: Verify your DeepSeek API key is correctly configured
3. **404 errors on API requests**: Check the .htaccess proxy configuration
4. **General errors**: Review server logs for specific error messages

## Maintenance

To update your application:

1. Make changes to your local files
2. Upload the modified files to cPanel, overwriting the existing ones
3. Restart your Node.js application in cPanel

For more detailed documentation, visit the official Ratidzo Health AI repository. 