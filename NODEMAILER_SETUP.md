# Nodemailer Setup Guide for Cryptocurrency Alerts

This guide explains how to set up email notifications using Nodemailer with a backend server.

## 🚀 **Quick Start**

### **1. Install Backend Dependencies**
```bash
cd server
npm install
```

### **2. Configure Environment Variables**
Copy `env-backend.example` to `.env` and fill in your values:
```bash
cp env-backend.example .env
```

### **3. Start the Backend Server**
```bash
npm run dev
```

### **4. Configure Frontend**
Copy `env-template.txt` to `.env` in your project root:
```bash
cp env-template.txt .env
```

## 📧 **Email Service Options**

### **Option 1: Gmail (Recommended for beginners)**

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. **Configure environment variables**:
   ```bash
   EMAIL_SERVICE=gmail
   EMAIL_USER=your_email@gmail.com
   EMAIL_APP_PASSWORD=your_16_character_app_password
   ```

### **Option 2: Outlook/Hotmail**

1. **Configure environment variables**:
   ```bash
   EMAIL_SERVICE=outlook
   EMAIL_USER=your_email@outlook.com
   EMAIL_PASSWORD=your_password
   ```

### **Option 3: Custom SMTP Server**

1. **Configure environment variables**:
   ```bash
   EMAIL_SERVICE=custom
   SMTP_HOST=your_smtp_host
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your_username
   SMTP_PASS=your_password
   ```

## 🔧 **Testing the System**

### **1. Test Backend Connection**
- Start the backend server
- Go to `http://localhost:5000/api/health`
- Should return: `{"status":"OK","timestamp":"..."}`

### **2. Test Email Sending**
- Go to Alerts page in your frontend
- Click "Test Email" button
- Check console for results
- Check your email inbox

## 📁 **Project Structure**

```
project/
├── src/                          # Frontend React app
│   ├── services/
│   │   └── emailService.js      # Frontend email service
│   └── ...
├── server/                       # Backend Node.js server
│   ├── server.js                # Main server file
│   ├── package.json             # Backend dependencies
│   └── .env                     # Backend environment variables
└── .env                         # Frontend environment variables
```

## 🚀 **Running Both Servers**

### **Terminal 1: Frontend (Vite)**
```bash
npm run dev
# Runs on http://localhost:5176
```

### **Terminal 2: Backend (Node.js)**
```bash
cd server
npm run dev
# Runs on http://localhost:5000
```

## 📧 **Email Templates**

The backend includes beautiful HTML email templates:

- **Alert Triggered**: When price reaches target
- **Price Update**: When price gets close to target (90%+)

Both templates include:
- Responsive design
- Progress indicators
- Action buttons
- Professional styling

## 🔒 **Security Features**

- **Rate Limiting**: 10 requests per minute per IP
- **CORS Protection**: Only allows requests from frontend
- **Input Validation**: Validates all email data
- **Error Handling**: Graceful error responses
- **Helmet Security**: Additional security headers

## 🛠 **Troubleshooting**

### **Backend won't start?**
- Check if port 5000 is available
- Verify all dependencies are installed
- Check environment variable syntax

### **Emails not sending?**
- Verify email credentials
- Check Gmail App Password (not regular password)
- Ensure 2FA is enabled for Gmail
- Check firewall/antivirus settings

### **Frontend can't connect to backend?**
- Ensure backend is running on port 5000
- Check CORS configuration
- Verify `VITE_EMAIL_API_URL` in frontend `.env`

### **Gmail App Password issues?**
- Make sure 2FA is enabled
- Generate new App Password
- Use 16-character password (no spaces)

## 📊 **Monitoring**

### **Backend Logs**
```bash
cd server
npm run dev
# Watch console for email sending logs
```

### **Frontend Console**
- Open browser DevTools
- Check Console tab for email results
- Network tab shows API calls

## 🎯 **Next Steps**

1. **Set up your email service** (Gmail recommended)
2. **Configure environment variables**
3. **Start both servers**
4. **Test email functionality**
5. **Create real alerts** to trigger emails

## 🔄 **Development vs Production**

### **Development**
- Backend runs locally on port 5000
- Frontend connects to local backend
- Emails sent from your email account

### **Production**
- Deploy backend to hosting service (Heroku, DigitalOcean, etc.)
- Update `VITE_EMAIL_API_URL` to production URL
- Use production email service (SendGrid, Mailgun, etc.)

## 💡 **Pro Tips**

- **Gmail App Passwords** are more secure than regular passwords
- **Test with your own email** before sending to others
- **Monitor email delivery** in your email provider's dashboard
- **Use environment variables** for all sensitive data
- **Keep backend logs** for debugging email issues

Your cryptocurrency alert system now uses Nodemailer for professional email notifications! 🚀📧
