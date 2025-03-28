RATIDZO HEALTH AI - EASY CPANEL DEPLOYMENT
=============================================

DEPLOYMENT INSTRUCTIONS:

1. UPLOAD FILES
   - Log into your cPanel account
   - Navigate to File Manager
   - Go to public_html (or your desired directory)
   - Upload all these files, preserving the directory structure

2. VERIFY PERMISSIONS
   - Make sure api-proxy.php has execute permissions (644 or 755)
   - Ensure the directories have correct permissions (755)

3. THAT'S IT!
   - Your Ratidzo Health AI website should now be running
   - Visit your domain to verify it's working correctly

TROUBLESHOOTING:

- If chat functionality isn't working, ensure your DeepSeek API key is correctly set in api-proxy.php
- If you see 500 errors, check your PHP version (PHP 7.0+ is recommended)
- If pages are not loading, verify that mod_rewrite is enabled in your cPanel

For additional support, please contact us at support@ratidzo.com 