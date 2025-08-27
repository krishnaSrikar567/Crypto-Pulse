import { useState, useEffect } from 'react';

export function useCrypto() {
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPrices = async () => {
    const url = `/coingecko/api/v3/simple/price?ids=bitcoin,ethereum,cardano,solana,polkadot&vs_currencies=usd&include_24hr_change=true&include_market_cap=true`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch prices');
    return await res.json();
  };

  useEffect(() => {
    let interval;
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await fetchPrices();
        setPrices(data);
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
    interval = setInterval(loadData, 60000); // 60 seconds
    return () => clearInterval(interval);
  }, []);

  const searchCoins = async (query) => {
    const url = `/coingecko/api/v3/search?query=${encodeURIComponent(query)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to search coins');
    const data = await res.json();
    return data.coins || [];
  };

  const getPriceForCoin = (coinId) => {
    return prices[coinId]?.usd;
  };

  return { prices, loading, error, searchCoins, getPriceForCoin };
}