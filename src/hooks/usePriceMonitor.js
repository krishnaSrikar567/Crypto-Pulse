import { useEffect, useRef, useCallback } from 'react';
import { useCrypto } from './useCrypto';
import { useAlerts } from './useAlerts';

export const usePriceMonitor = () => {
  const { checkAndTriggerAlerts } = useAlerts();
  const { prices, refreshPrices } = useCrypto();
  const intervalRef = useRef(null);
  const isMonitoring = useRef(false);

  const startMonitoring = useCallback(() => {
    if (isMonitoring.current) return;
    
    isMonitoring.current = true;
    
    // Check prices every 30 seconds
    intervalRef.current = setInterval(async () => {
      try {
        await refreshPrices();
      } catch (error) {
        console.error('Error refreshing prices:', error);
      }
    }, 30000);

    console.log('Price monitoring started');
  }, [refreshPrices]);

  const stopMonitoring = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    isMonitoring.current = false;
    console.log('Price monitoring stopped');
  }, []);

  // Start monitoring when component mounts
  useEffect(() => {
    startMonitoring();

    // Cleanup on unmount
    return () => {
      stopMonitoring();
    };
  }, [startMonitoring, stopMonitoring]);

  // Check alerts whenever prices update
  useEffect(() => {
    if (prices && Object.keys(prices).length > 0) {
      checkAndTriggerAlerts(prices);
    }
  }, [prices, checkAndTriggerAlerts]);

  return {
    isMonitoring: isMonitoring.current,
    startMonitoring,
    stopMonitoring
  };
};
