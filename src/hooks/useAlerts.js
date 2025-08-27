import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { emailService } from '../services/emailService';
import { CheckCircle } from 'lucide-react';

export const useAlerts = () => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Add cooldown tracking to prevent infinite notifications
  const notificationCooldowns = useRef(new Map());
  // Track alerts triggered in this session to avoid duplicate popups before DB update propagates
  const recentlyTriggeredAlertIds = useRef(new Set());
  const prevTriggeredIds = useRef(new Set());

  const fetchAlerts = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAlerts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createAlert = async (alertData) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase
        .from('alerts')
        .insert([{
          user_id: user.id,
          coin: alertData.coin,
          coin_name: alertData.coinName,
          target_price: alertData.targetPrice,
          current_price: alertData.currentPrice,
          triggered: false
        }])
        .select()
        .single();

      if (error) throw error;
      
      const newAlert = data;
      setAlerts(prev => [newAlert, ...prev]);
      return newAlert;
    } catch (err) {
      throw new Error(err.message);
    }
  };

  const deleteAlert = async (alertId) => {
    try {
      const { error } = await supabase
        .from('alerts')
        .delete()
        .eq('id', alertId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    } catch (err) {
      throw new Error(err.message);
    }
  };

  const checkAndTriggerAlerts = async (currentPrices) => {
    if (!user || !currentPrices) return;

    try {
      // Get all active alerts for the user
      const { data: activeAlerts, error } = await supabase
        .from('alerts')
        .select('*')
        .eq('user_id', user.id)
        .eq('triggered', false);

      if (error) throw error;

      const alertsToUpdate = [];

      // Check each alert against current prices
      activeAlerts.forEach(alert => {
        const currentPrice = currentPrices[alert.coin]?.usd;
        if (currentPrice && currentPrice >= parseFloat(alert.target_price)) {
          if (recentlyTriggeredAlertIds.current.has(alert.id)) {
            return; // already shown locally; wait for DB update
          }
          alertsToUpdate.push({
            id: alert.id,
            triggered: true,
            triggered_at: new Date().toISOString()
          });
          
          // Show notification for triggered alert (sticky, single-fire)
          addNotification({
            type: 'success',
            title: 'Alert Triggered!',
            message: `${alert.coin_name} has reached your target price of $${alert.target_price}`,
            icon: CheckCircle,
          });

          // Mark as shown locally and auto-clear after 60s
          recentlyTriggeredAlertIds.current.add(alert.id);
          setTimeout(() => {
            recentlyTriggeredAlertIds.current.delete(alert.id);
          }, 60000);
          
          // Send email notification
          if (user.email) {
            emailService.sendAlertNotification(user.email, {
              ...alert,
              current_price: currentPrice
            }).catch(err => {
              console.error('Failed to send alert email:', err);
            });
          }
          
          // Show browser notification if supported
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Alert Triggered! 🎯', {
              body: `${alert.coin_name} has reached your target price of $${parseFloat(alert.target_price).toLocaleString()}`,
              icon: '/favicon.ico',
              badge: '/favicon.ico',
              tag: `alert-${alert.id}`
            });
          }
        } else if (currentPrice) {
          // Show price update notification for alerts close to target
          const targetPrice = parseFloat(alert.target_price);
          const progress = currentPrice / targetPrice;
          if (progress >= 0.8 && progress < 1) {
            // Add cooldown to prevent infinite notifications
            const cooldownKey = `price-update-${alert.id}`;
            const now = Date.now();
            const lastNotification = notificationCooldowns.current.get(cooldownKey);
            
            // Only show notification if 30 seconds have passed since last one
            if (!lastNotification || (now - lastNotification) > 30000) {
              notificationCooldowns.current.set(cooldownKey, now);
              
              // Send email for price updates (optional - can be disabled)
              if (user.email && progress >= 0.9) { // Only send email when very close
                emailService.sendPriceUpdateNotification(user.email, alert.coin_name, currentPrice, targetPrice)
                  .catch(err => {
                    console.error('Failed to send price update email:', err);
                  });
              }
            }
          }
        }
      });

      // Update triggered alerts in batch
      if (alertsToUpdate.length > 0) {
        for (const alertUpdate of alertsToUpdate) {
          const { error: updateError } = await supabase
            .from('alerts')
            .update({
              triggered: true,
              triggered_at: alertUpdate.triggered_at
            })
            .eq('id', alertUpdate.id)
            .eq('user_id', user.id);

          if (updateError) {
            console.error('Failed to update alert:', updateError);
          }
        }

        // Refresh alerts to show updated state
        await fetchAlerts();
      }
    } catch (err) {
      console.error('Error checking alerts:', err);
    }
  };

  const updateAlertCurrentPrice = async (alertId, currentPrice) => {
    try {
      const { error } = await supabase
        .from('alerts')
        .update({ current_price: currentPrice })
        .eq('id', alertId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update local state
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, current_price: currentPrice }
          : alert
      ));
    } catch (err) {
      console.error('Error updating alert current price:', err);
    }
  };

  const refreshAlerts = async () => {
    await fetchAlerts();
  };

  useEffect(() => {
    if (user) {
      fetchAlerts();
    }
  }, [user]);

  // Notification for triggered alerts
  useEffect(() => {
    if (!alerts) return;
    const newlyTriggered = alerts.filter(
      (a) => a.triggered && !prevTriggeredIds.current.has(a.id)
    );
    if (newlyTriggered.length > 0) {
      newlyTriggered.forEach((alert) => {
        addNotification({
          type: 'success',
          title: 'Alert Triggered!',
          message: `${alert.coin_name} has reached your target price of $${alert.target_price}`,
          icon: CheckCircle,
        });
      });
    }
    prevTriggeredIds.current = new Set(alerts.filter(a => a.triggered).map(a => a.id));
  }, [alerts, addNotification]);

  return {
    alerts,
    loading,
    error,
    createAlert,
    deleteAlert,
    checkAndTriggerAlerts,
    updateAlertCurrentPrice,
    refreshAlerts,
  };
};