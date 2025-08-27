import React, { useState, useEffect } from 'react';
import { useCrypto } from '../hooks/useCrypto';
import { useAlerts } from '../hooks/useAlerts';
import { useAuth } from '../contexts/AuthContext';
import { 
  TrendingUp, 
  Bell, 
  Plus, 
  Search, 
  DollarSign,
  Target,
  Clock,
  CheckCircle,
  Activity,
  Star,
  AlertCircle
} from 'lucide-react';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

import { Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const DashboardPage = () => {
  const { user } = useAuth();
  const { alerts, createAlert } = useAlerts();
  const { prices, trending, searchCoins, getPriceForCoin, coins } = useCrypto();
  const [showCreateAlert, setShowCreateAlert] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [targetPrice, setTargetPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [chartData, setChartData] = useState(null);



  const handleSearch = async (query) => {
    if (query.trim()) {
      const results = await searchCoins(query);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery) {
        handleSearch(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleCreateAlert = async (e) => {
    e.preventDefault();
    if (!selectedCoin || !targetPrice) return;
    console.log('Submitting alert creation...', selectedCoin, targetPrice);
    setLoading(true);
    setError('');

    try {
      const currentPrice = getPriceForCoin(selectedCoin.id) || 0;
      await createAlert({
        coin: selectedCoin.id,
        coinName: selectedCoin.name,
        targetPrice: parseFloat(targetPrice),
        currentPrice: currentPrice
      });
      console.log('Alert created successfully');
      setSuccess(`Alert created for ${selectedCoin.name} at $${targetPrice}`);
      setShowCreateAlert(false);
      setSelectedCoin(null);
      setTargetPrice('');
      setSearchQuery('');
      setSearchResults([]);
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Create alert error:', err);
      setError(err.message || 'Failed to create alert');
    } finally {
      setLoading(false);
    }
  };

  const activeAlerts = alerts.filter(alert => !alert.triggered);
  const triggeredAlerts = alerts.filter(alert => alert.triggered);

  const topCoins = [
    { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC' },
    { id: 'ethereum', name: 'Ethereum', symbol: 'ETH' },
    { id: 'cardano', name: 'Cardano', symbol: 'ADA' },
    { id: 'solana', name: 'Solana', symbol: 'SOL' }
  ];

    // Mock fetch historical price data (replace with real API/data source in production)
  const fetchPriceHistory = (coinId) => {
    // Example: generate last 7 days labels and random prices near current price
    const labels = [];
    const data = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      labels.push(date.toLocaleDateString());
      let basePrice = prices[coinId]?.usd || 100;
      // Randomized values +/- 5%
      const variation = basePrice * (0.05 * (Math.random() - 0.5));
      data.push(parseFloat((basePrice + variation).toFixed(2)));
    }
    setChartData({
      labels,
      datasets: [
        {
          label: `${coinId[0].toUpperCase() + coinId.slice(1)} Price (USD)`,
          data,
          fill: false,
          borderColor: 'rgba(75,192,192,1)',
          backgroundColor: 'rgba(75,192,192,0.2)',
        },
      ],
    });
  };

  // Handle coin box click
  const handleCoinClick = (coin) => {
    setSelectedCoin(coin);
    fetchPriceHistory(coin.id);
  };

  // Always default to empty array if undefined
  const safeCoins = coins || [];
  const safeAlerts = alerts || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-400">Welcome back, {user?.email}</p>
        </div>
        <button
          onClick={() => setShowCreateAlert(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
        >
          <Plus className="h-5 w-5" />
          <span>Create Alert</span>
        </button>
      </div>

        {/* Coin price boxes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {topCoins.map((coin) => {
          const price = getPriceForCoin(coin.id) || 0;
          const change24h = prices[coin.id]?.usd_24h_change || 0;
          const positive = change24h >= 0;
          return (
            <div
              key={coin.id}
              onClick={() => handleCoinClick(coin)}
              className="bg-white/10 hover:bg-white/20 cursor-pointer p-4 rounded-lg"
            >
              <h3 className="font-medium text-xl">{coin.name}</h3>
              <p className="text-sm text-gray-300">{coin.symbol.toUpperCase()}</p>
              <p className="text-2xl font-bold">${price.toLocaleString()}</p>
              <p className={`${positive ? 'text-green-400' : 'text-red-400'}`}>
                {positive ? '+' : ''}
                {change24h.toFixed(2)}%
              </p>
            </div>
          );
        })}
      </div>

      {/* Render Line Chart */}
      {selectedCoin && chartData && (
        <div className="mt-6 p-4 bg-white/10 rounded-lg">
          <h2 className="text-2xl font-semibold mb-2">{selectedCoin.name} Price Chart</h2>
          <Line data={chartData} />
        </div>
      )}

      {/* Success/Error Messages */}
      {success && (
        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center space-x-2 text-green-400">
          <CheckCircle className="h-5 w-5" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center space-x-2 text-red-400">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Bell className="h-6 w-6 text-blue-400" />
            </div>
            <span className="text-2xl font-bold text-white">{activeAlerts.length}</span>
          </div>
          <p className="text-gray-400 text-sm">Active Alerts</p>
        </div>

        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-400" />
            </div>
            <span className="text-2xl font-bold text-white">{triggeredAlerts.length}</span>
          </div>
          <p className="text-gray-400 text-sm">Triggered Alerts</p>
        </div>

        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Target className="h-6 w-6 text-purple-400" />
            </div>
            <span className="text-2xl font-bold text-white">{alerts.length}</span>
          </div>
          <p className="text-gray-400 text-sm">Total Alerts</p>
        </div>

        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <Activity className="h-6 w-6 text-yellow-400" />
            </div>
            <span className="text-2xl font-bold text-white">{Object.keys(prices).length}</span>
          </div>
          <p className="text-gray-400 text-sm">Tracked Coins</p>
        </div>
      </div>

      {/* Live Prices */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
          <DollarSign className="h-6 w-6 text-green-400" />
          <span>Live Crypto Prices</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {topCoins.map((coin) => {
            const priceData = prices[coin.id];
            const price = priceData?.usd || 0;
            const change24h = priceData?.usd_24h_change || 0;
            const isPositive = change24h >= 0;

            return (
              <div
                key={coin.id}
                className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-medium text-white">{coin.name}</h3>
                    <p className="text-gray-400 text-sm">{coin.symbol}</p>
                  </div>
                  <Activity className="h-5 w-5 text-blue-400" />
                </div>
                
                <div className="space-y-1">
                  <p className="text-xl font-bold text-white">
                    ${price.toLocaleString()}
                  </p>
                  <p className={`flex items-center space-x-1 text-sm ${
                    isPositive ? 'text-green-400' : 'text-red-400'
                  }`}>
                    <TrendingUp className={`h-4 w-4 ${isPositive ? '' : 'rotate-180'}`} />
                    <span>{Math.abs(change24h).toFixed(2)}%</span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Trending Coins */}
      {trending.length > 0 && (
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
            <Star className="h-6 w-6 text-yellow-400" />
            <span>Trending Cryptocurrencies</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {trending.slice(0, 5).map((coin, index) => (
              <div
                key={coin.id}
                className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg p-4 hover:from-yellow-500/20 hover:to-orange-500/20 transition-all duration-200"
              >
                <div className="flex items-center space-x-3 mb-2">
                  <img src={coin.thumb} alt={coin.name} className="w-6 h-6" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-white text-sm truncate">{coin.name}</h3>
                    <p className="text-gray-400 text-xs">{coin.symbol}</p>
                  </div>
                  <div className="text-yellow-400 text-xs font-bold">
                    #{index + 1}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Alerts */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
          <Clock className="h-6 w-6 text-blue-400" />
          <span>Recent Activity</span>
        </h2>
        
        {alerts.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No alerts created yet</p>
            <p className="text-gray-500 text-sm mt-1">Create your first alert to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.slice(0, 5).map((alert) => (
              <div
                key={alert.id}
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  alert.triggered
                    ? 'bg-green-500/10 border-green-500/20'
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${
                    alert.triggered ? 'bg-green-500/20' : 'bg-blue-500/20'
                  }`}>
                    {alert.triggered ? (
                      <CheckCircle className="h-4 w-4 text-green-400" />
                    ) : (
                      <Bell className="h-4 w-4 text-blue-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-white font-medium">{alert.coin_name}</p>
                    <p className="text-gray-400 text-sm">
                      Target: ${parseFloat(alert.target_price).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-sm px-2 py-1 rounded-full ${
                    alert.triggered 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {alert.triggered ? 'Triggered' : 'Active'}
                  </span>
                  <p className="text-gray-500 text-xs mt-1">
                    {new Date(alert.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Alert Modal */}
      {showCreateAlert && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 border border-white/10 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-white mb-6">Create Price Alert</h3>
            
            <form onSubmit={handleCreateAlert} className="space-y-4">
              {/* Search Coin */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Search Cryptocurrency
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for a cryptocurrency..."
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="mt-2 max-h-40 overflow-y-auto bg-gray-700 border border-white/20 rounded-lg">
                    {searchResults.map((coin) => (
                      <button
                        key={coin.id}
                        type="button"
                        onClick={() => {
                          setSelectedCoin(coin);
                          setSearchQuery(coin.name);
                          setSearchResults([]);
                        }}
                        className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-white/10 transition-colors text-left"
                      >
                        <img src={coin.thumb} alt={coin.name} className="w-6 h-6" />
                        <div>
                          <span className="text-white font-medium">{coin.name}</span>
                          <span className="text-gray-400 ml-2">{coin.symbol}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected Coin Display */}
              {selectedCoin && (
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <img src={selectedCoin.thumb} alt={selectedCoin.name} className="w-8 h-8" />
                    <div>
                      <p className="text-white font-medium">{selectedCoin.name}</p>
                      <p className="text-blue-400 text-sm">{selectedCoin.symbol}</p>
                      {prices[selectedCoin.id] && (
                        <p className="text-gray-400 text-sm">
                          Current: ${prices[selectedCoin.id].usd.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Target Price */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Target Price (USD)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="number"
                    step="0.00000001"
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(e.target.value)}
                    placeholder="Enter target price..."
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateAlert(false);
                    setSelectedCoin(null);
                    setTargetPrice('');
                    setSearchQuery('');
                    setSearchResults([]);
                    setError('');
                  }}
                  className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !selectedCoin || !targetPrice}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating...' : 'Create Alert'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <h2 className="text-2xl font-bold text-white mt-10">Your Coins</h2>
      <ul className="bg-white/5 p-4 rounded-lg border border-white/10">
        {coins.map((coin) => (
          <li key={coin.id} className="flex justify-between py-2 border-b border-white/10 last:border-b-0">
            <span className="text-white font-medium">{coin.name}</span>
            <span className="text-white">${coin.price.toFixed(2)}</span>
          </li>
        ))}
      </ul>

      <h2 className="text-2xl font-bold text-white mt-8">Your Alerts</h2>
      <ul className="bg-white/5 p-4 rounded-lg border border-white/10">
        {alerts.map((a, idx) => (
          <li key={idx} className="flex justify-between py-2 border-b border-white/10 last:border-b-0">
            <span className="text-white font-medium">{a.coin_name}</span>
            <span className={`text-sm ${a.triggered ? 'text-red-400' : 'text-green-400'}`}>
              {a.triggered ? 'Triggered' : 'Active'}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DashboardPage;