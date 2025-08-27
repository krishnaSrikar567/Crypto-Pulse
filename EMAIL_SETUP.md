# Email Notifications Setup Guide

This guide explains how to set up email notifications for your cryptocurrency alert system.

## 🚀 **Quick Start (Development Mode)**

By default, the system runs in development mode where:
- ✅ **In-app notifications work immediately**
- ✅ **Browser notifications work** (if permitted)
- ✅ **Email notifications are logged to console** (for testing)

## 📧 **Setting Up Real Email Notifications**

### **Option 1: EmailJS (Recommended for beginners)**

1. **Sign up for EmailJS**:
   - Go to [EmailJS.com](https://www.emailjs.com/)
   - Create a free account (100 emails/month free)

2. **Install EmailJS**:
   ```bash
   npm install @emailjs/browser
   ```

3. **Configure EmailJS**:
   - Create an email service in EmailJS dashboard
   - Create an email template
   - Get your Public Key, Service ID, and Template ID

4. **Set environment variables**:
   ```bash
   VITE_EMAIL_SERVICE=emailjs
   VITE_EMAILJS_PUBLIC_KEY=your_public_key
   VITE_EMAILJS_SERVICE_ID=your_service_id
   VITE_EMAILJS_TEMPLATE_ID=your_template_id
   ```

### **Option 2: SendGrid (Professional)**

1. **Sign up for SendGrid**:
   - Go to [SendGrid.com](https://sendgrid.com/)
   - Create a free account (100 emails/day free)

2. **Install SendGrid**:
   ```bash
   npm install @sendgrid/mail
   ```

3. **Configure SendGrid**:
   - Verify your sender email
   - Get your API key
   - Set up domain authentication (optional)

4. **Set environment variables**:
   ```bash
   VITE_EMAIL_SERVICE=sendgrid
   VITE_SENDGRID_API_KEY=your_api_key
   VITE_FROM_EMAIL=alerts@yourdomain.com
   ```

### **Option 3: Custom SMTP Server**

1. **Configure your SMTP server**:
   - Set up your own email server
   - Or use services like Gmail, Outlook, etc.

2. **Set environment variables**:
   ```bash
   VITE_EMAIL_SERVICE=smtp
   VITE_SMTP_HOST=your_smtp_host
   VITE_SMTP_PORT=587
   VITE_SMTP_USER=your_email
   VITE_SMTP_PASS=your_password
   ```

## 🔧 **Testing Email System**

1. **Go to Alerts page**
2. **Click "Test Email" button**
3. **Check console for results**
4. **Verify email delivery** (if configured)

## 📱 **Notification Types**

### **Alert Triggered** 🎯
- Sent when price reaches/exceeds target
- Includes coin details, target price, current price
- Sent immediately upon trigger

### **Price Update** 📈
- Sent when price gets close to target (90%+ progress)
- Helps users monitor progress
- Sent only when very close to avoid spam

## 🛠 **Troubleshooting**

### **Emails not sending?**
- Check console for error messages
- Verify environment variables are set
- Ensure email service is properly configured
- Check API key permissions

### **Too many emails?**
- Adjust the progress threshold in `useAlerts.js`
- Change from 90% to 95% for price updates
- Disable price update emails entirely

### **Email formatting issues?**
- Check HTML template in email service
- Verify special characters are properly escaped
- Test with simple text first

## 🔒 **Security Considerations**

- **Never commit API keys** to version control
- **Use environment variables** for sensitive data
- **Implement rate limiting** to prevent abuse
- **Validate email addresses** before sending
- **Respect user preferences** for notification types

## 📊 **Monitoring & Analytics**

- **Track email delivery rates**
- **Monitor bounce rates**
- **Log failed email attempts**
- **Set up alerts for email service issues**

## 🎯 **Next Steps**

1. **Choose your email service**
2. **Set up environment variables**
3. **Test the system**
4. **Monitor delivery rates**
5. **Customize email templates**

Your cryptocurrency alert system will now send real email notifications when alerts are triggered! 🚀
