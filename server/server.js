const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const nodemailer = require('nodemailer');
const { RateLimiterMemory } = require('rate-limiter-flexible');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5176',
    'http://localhost:5173',
    'http://localhost:5174'
  ],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const rateLimiter = new RateLimiterMemory({
  keyGenerator: (req) => req.ip,
  points: 10,
  duration: 60,
});

const rateLimiterMiddleware = (req, res, next) => {
  rateLimiter.consume(req.ip)
    .then(() => next())
    .catch(() => {
      res.status(429).json({ error: 'Too many requests. Please try again later.' });
    });
};

// Email validation regex
const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// In-memory store for user alerts and triggered status
const userAlerts = {}; // { userEmail: [ { alert, triggered: false, triggeredAt: null } ] }

// Email configuration
const createTransporter = () => {
  const emailService = process.env.EMAIL_SERVICE || 'gmail';

  if (emailService === 'gmail') {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
      throw new Error('Missing EMAIL_USER or EMAIL_APP_PASSWORD for Gmail');
    }
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
      }
    });
  } else if (emailService === 'outlook') {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      throw new Error('Missing EMAIL_USER or EMAIL_PASSWORD for Outlook');
    }
    return nodemailer.createTransport({
      service: 'outlook',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  } else if (emailService === 'custom') {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      throw new Error('Missing SMTP_HOST, SMTP_USER, or SMTP_PASS for custom SMTP');
    }
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }
  throw new Error(`Unsupported email service: ${emailService}`);
};

// Email templates
const createAlertEmailHTML = (alert) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>🚨 Alert Triggered!</title>
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
      .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
      .alert-box { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 20px; margin: 20px 0; }
      .price-info { background: #e3f2fd; border: 1px solid #bbdefb; border-radius: 5px; padding: 20px; margin: 20px 0; }
      .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
    </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎯 Price Alert Triggered!</h1>
      <p>Your cryptocurrency alert has been activated</p>
    </div>
    <div class="content">
      <div class="alert-box">
        <h2>🚨 Alert Details</h2>
        <p><strong>Cryptocurrency:</strong> ${alert.coin_name} (${alert.coin.toUpperCase()})</p>
        <p><strong>Target Price:</strong> $${parseFloat(alert.target_price).toLocaleString()}</p>
        <p><strong>Current Price:</strong> $${alert.current_price ? parseFloat(alert.current_price).toLocaleString() : 'N/A'}</p>
        <p><strong>Triggered At:</strong> ${new Date().toLocaleString()}</p>
      </div>
      <div class="price-info">
        <h3>📊 What This Means</h3>
        <p>Your price alert has been triggered! The cryptocurrency has reached or exceeded your target price.</p>
        <p>This is a great opportunity to review your investment strategy and make informed decisions.</p>
      </div>
      <div class="footer">
        <p>Best regards,<br /><strong>CryptoAlerts Team</strong></p>
        <p>This is an automated notification. Please do not reply to this email.</p>
      </div>
    </div>
  </div>
</body>
</html>
`;

// Add or update an alert for a user
app.post('/api/alerts', rateLimiterMiddleware, (req, res) => {
  const { userEmail, alert } = req.body;
  if (!userEmail || !alert) {
    return res.status(400).json({ error: 'Missing required fields: userEmail or alert' });
  }
  if (!validateEmail(userEmail)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }
  if (!alert.coin_name || !alert.coin || !alert.target_price) {
    return res.status(400).json({ error: 'Alert object missing required fields' });
  }
  if (!userAlerts[userEmail]) userAlerts[userEmail] = [];
  // Prevent duplicate alerts for same coin and price
  const exists = userAlerts[userEmail].some(
    a => a.alert.coin === alert.coin && a.alert.target_price === alert.target_price
  );
  if (!exists) {
    userAlerts[userEmail].push({ alert, triggered: false, triggeredAt: null });
  }
  res.json({ success: true });
});

// Trigger an alert (mark as triggered, send email)
app.post('/api/email/alert-triggered', rateLimiterMiddleware, async (req, res) => {
  try {
    const { userEmail, alert } = req.body;

    if (!userEmail || !alert) {
      return res.status(400).json({ error: 'Missing required fields: userEmail or alert' });
    }
    if (!validateEmail(userEmail)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }
    if (!alert.coin_name || !alert.coin || !alert.target_price) {
      return res.status(400).json({ error: 'Alert object missing required fields' });
    }

    // Mark alert as triggered
    if (!userAlerts[userEmail]) userAlerts[userEmail] = [];
    let found = false;
    userAlerts[userEmail] = userAlerts[userEmail].map(a => {
      if (
        !a.triggered &&
        a.alert.coin === alert.coin &&
        a.alert.target_price === alert.target_price
      ) {
        found = true;
        return { ...a, triggered: true, triggeredAt: new Date().toISOString() };
      }
      return a;
    });
    if (!found) {
      // If not found, add as triggered
      userAlerts[userEmail].push({
        alert,
        triggered: true,
        triggeredAt: new Date().toISOString()
      });
    }

    // Send email
    const transporter = createTransporter();
    const htmlContent = createAlertEmailHTML(alert);

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: userEmail,
      subject: `🚨 Alert Triggered: ${alert.coin_name} reached target price!`,
      html: htmlContent
    };

    await transporter.sendMail(mailOptions);

    console.log(`[EMAIL] Alert triggered email sent to ${userEmail} for ${alert.coin_name}`);
    res.json({ success: true, message: 'Alert email sent successfully' });
  } catch (error) {
    console.error('Error sending alert email:', error);
    res.status(500).json({ error: 'Failed to send email', details: error.message });
  }
});

// Get all alerts for a user (for notification page)
app.get('/api/notifications', rateLimiterMiddleware, (req, res) => {
  const userEmail = req.query.userEmail;
  if (!userEmail) {
    return res.status(400).json({ error: 'Missing userEmail query parameter' });
  }
  // Only return alerts, with triggered status, never duplicate triggered alerts
  const alerts = (userAlerts[userEmail] || []).map(a => ({
    alert: a.alert,
    triggered: a.triggered,
    triggeredAt: a.triggeredAt
  }));
  res.json({ alerts });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Email server running on port ${PORT}`);
  console.log(`📧 Email service: ${process.env.EMAIL_SERVICE || 'gmail'}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5176'}`);
});
