# Cryptocurrency Price Alert System

A fully functional cryptocurrency price alert system built with React, JavaScript, and Supabase.

## Features

### 🚨 **Complete Alert System**
- **Create Alerts**: Set target prices for any cryptocurrency
- **Real-time Monitoring**: Automatically checks prices every 30 seconds
- **Smart Triggering**: Alerts automatically trigger when target prices are reached
- **Price Progress Tracking**: Visual progress bars show how close prices are to targets

### 🔔 **Notification System**
- **In-app Notifications**: Beautiful toast notifications when alerts are triggered
- **Browser Notifications**: Desktop notifications for important alerts
- **Price Updates**: Notifications when prices get close to targets (80%+ progress)

### 💰 **Price Data**
- **Live Prices**: Real-time cryptocurrency prices from CoinGecko API
- **Multiple Coins**: Support for thousands of cryptocurrencies
- **Search Functionality**: Easy coin search and selection

### 🎯 **Alert Management**
- **Create/Delete**: Full CRUD operations for alerts
- **Filtering**: Filter by active, triggered, or all alerts
- **Search**: Search alerts by coin name or symbol
- **Status Tracking**: Clear visual indicators for alert status

## How It Works

### 1. **Price Monitoring**
- Background service runs continuously
- Fetches prices from CoinGecko API every 30 seconds
- Automatically checks all active alerts against current prices

### 2. **Alert Triggering**
- When a price reaches or exceeds the target, the alert is automatically triggered
- Database is updated with trigger timestamp
- Multiple notifications are sent (in-app + browser)

### 3. **Real-time Updates**
- UI updates automatically when alerts are triggered
- Progress bars show current price vs target price
- Status indicators change from "Active" to "Triggered"

## Technical Architecture

### **Frontend**
- React with JavaScript (no TypeScript)
- Tailwind CSS for styling
- Lucide React for icons
- React Router for navigation

### **Backend**
- Supabase for database and authentication
- PostgreSQL database with proper indexing
- Row Level Security (RLS) for user data isolation

### **APIs**
- CoinGecko API for cryptocurrency prices
- Supabase client for database operations

### **Key Hooks**
- `useAlerts`: Manages alert CRUD operations and triggering
- `useCrypto`: Handles cryptocurrency price data
- `usePriceMonitor`: Background price monitoring service
- `useNotifications`: In-app notification system

## Database Schema

```sql
CREATE TABLE alerts (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    coin VARCHAR(50) NOT NULL,
    coin_name VARCHAR(100) NOT NULL,
    target_price NUMERIC(20,8) NOT NULL,
    current_price NUMERIC(20,8),
    triggered BOOLEAN DEFAULT FALSE,
    triggered_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);
```

## Getting Started

1. **Clone the repository**
2. **Install dependencies**: `npm install`
3. **Set up Supabase**:
   - Create a new Supabase project
   - Run the migration files in `supabase/migrations/`
   - Add your Supabase credentials to `src/lib/supabase.js`
4. **Start the development server**: `npm run dev`

## Usage

### Creating an Alert
1. Navigate to the Alerts page
2. Click "Create Alert"
3. Search for a cryptocurrency
4. Set your target price
5. Click "Create Alert"

### Monitoring Alerts
- Active alerts are automatically monitored
- Progress bars show how close prices are to targets
- Notifications appear when alerts are triggered
- Dashboard shows overview of all alerts

### Managing Alerts
- View all alerts with filtering and search
- Delete alerts you no longer need
- See triggered alerts with timestamps
- Monitor price progress in real-time

## Security Features

- **User Authentication**: Supabase Auth integration
- **Data Isolation**: Row Level Security ensures users only see their alerts
- **Input Validation**: Proper validation for all user inputs
- **API Rate Limiting**: Respects CoinGecko API limits

## Performance Optimizations

- **Efficient Polling**: 30-second intervals for price updates
- **Database Indexing**: Optimized queries with proper indexes
- **Lazy Loading**: Components load only when needed
- **Memory Management**: Proper cleanup of intervals and listeners

## Browser Support

- **Notifications**: Modern browsers with notification API support
- **Responsive Design**: Works on desktop and mobile devices
- **Progressive Web App**: Can be installed as a PWA

## Future Enhancements

- **Email Notifications**: Send alerts via email
- **SMS Alerts**: Text message notifications
- **Advanced Filters**: More sophisticated alert filtering
- **Price Charts**: Historical price data visualization
- **Portfolio Tracking**: Track multiple cryptocurrencies

## Contributing

This is a complete, production-ready alert system. Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

## License

MIT License - feel free to use this project for your own cryptocurrency alert needs!
