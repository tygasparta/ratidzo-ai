# Ratidzo Health AI - cPanel Deployment

This folder contains all the files needed to deploy the Ratidzo Health AI application to a cPanel hosting environment with the domain ratidzo.com.

## Files Included

- `serve-cpanel.js` - The optimized server file for cPanel deployment
- `deploy.sh` - Deployment script to package the application
- `deploy_instructions.md` - Detailed deployment instructions
- `.htaccess` - Apache configuration for URL routing
- `package.json` - Node.js package configuration
- `.env.example` - Example environment variables (rename to .env and update)

## Quick Start Guide

1. **Prepare Your Environment Variables**:
   - Copy `.env.example` to `.env`
   - Update the values with your actual API keys and settings

2. **Package the Application**:
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

3. **Upload to cPanel**:
   - Log in to your cPanel account
   - Navigate to File Manager
   - Upload and extract the deployment package to your public_html directory

4. **Set Up Node.js Application**:
   - Use cPanel's Node.js Application feature (if available)
   - Configure the application to use `serve-cpanel.js` as the entry point
   - Set the appropriate environment variables

5. **Test the Deployment**:
   - Visit your domain (ratidzo.com) to test the application
   - Test the chat and diagnosis features
   - Check the server logs for any errors

## Important Notes

- The server uses port 3000 by default, which may need to be adjusted for your cPanel environment
- Ensure that your server supports Node.js v16 or higher
- The `.htaccess` file contains important rules for URL routing and security
- Configure CORS settings in the `.env` file to match your production domain

For detailed deployment instructions, please refer to `deploy_instructions.md`

## Troubleshooting

If you encounter issues during deployment:

1. Check the server logs for error messages
2. Verify that all environment variables are set correctly
3. Ensure that all required dependencies are installed
4. Check if the cPanel server supports running Node.js applications

## Contact and Support

For additional support, please contact the development team at support@ratidzo.com 