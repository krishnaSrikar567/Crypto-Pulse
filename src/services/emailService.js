// Email service for sending alert notifications
// This service communicates with the backend API that uses Nodemailer

class EmailService {
  constructor() {
    this.apiUrl = import.meta.env.VITE_EMAIL_API_URL || 'http://localhost:5000/api';
    this.emailService = import.meta.env.VITE_EMAIL_SERVICE || 'backend';
  }

  // Send email notification for triggered alert
  async sendAlertNotification(userEmail, alert) {
    try {
      if (this.emailService === 'backend') {
        // Use backend API with Nodemailer
        const response = await fetch(`${this.apiUrl}/email/alert-triggered`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userEmail,
            alert
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to send email');
        }

        const result = await response.json();
        return result;
      } else {
        // Fallback to console logging for development
        console.log('📧 Email would be sent via backend:', {
          to: userEmail,
          subject: `🚨 Alert Triggered: ${alert.coin_name} reached target price!`,
          alert
        });
        return { success: true, message: 'Email sent via backend API' };
      }
    } catch (error) {
      console.error('Failed to send alert email:', error);
      throw error;
    }
  }

  // Send price update notification
  async sendPriceUpdateNotification(userEmail, coinName, currentPrice, targetPrice) {
    try {
      if (this.emailService === 'backend') {
        // Use backend API with Nodemailer
        const response = await fetch(`${this.apiUrl}/email/price-update`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userEmail,
            coinName,
            currentPrice,
            targetPrice
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to send email');
        }

        const result = await response.json();
        return result;
      } else {
        // Fallback to console logging for development
        console.log('📧 Price update email would be sent via backend:', {
          to: userEmail,
          subject: `📈 Price Update: ${coinName} getting close to target!`,
          coinName,
          currentPrice,
          targetPrice
        });
        return { success: true, message: 'Price update email sent via backend API' };
      }
    } catch (error) {
      console.error('Failed to send price update email:', error);
      throw error;
    }
  }

  // Test the backend connection
  async testBackendConnection() {
    try {
      const response = await fetch(`${this.apiUrl}/health`);
      if (response.ok) {
        const data = await response.json();
        return { success: true, message: 'Backend connected successfully', data };
      } else {
        return { success: false, message: 'Backend health check failed' };
      }
    } catch (error) {
      return { success: false, message: 'Backend connection failed', error: error.message };
    }
  }
}

export const emailService = new EmailService();
export default emailService;
