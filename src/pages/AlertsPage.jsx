import React, { useState, useEffect, useRef } from 'react';
import { useAlerts } from '../hooks/useAlerts';
import { useCrypto } from '../hooks/useCrypto';
import { useNotifications } from '../contexts/NotificationContext';
import { 
  Bell, 
  Trash2, 
  CheckCircle, 
  Clock, 
  DollarSign,
  TrendingUp,
  AlertCircle,
  Filter,
  Search,
  Plus,
  X
} from 'lucide-react';

const AlertsPage = () => {
  const { alerts, deleteAlert, loading, createAlert } = useAlerts();
  const { prices, searchCoins, getPriceForCoin } = useCrypto();
  const { addNotification } = useNotifications();
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'triggered'
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(null);
  
  // Create alert form state
  const [showCreateAlert, setShowCreateAlert] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [targetPrice, setTargetPrice] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');

  // --- Notification for triggered alerts ---
  const prevTriggeredIds = useRef(new Set());
  useEffect(() => {
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
  // --- End notification section ---

  // Handle search for coins
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

  // Handle creating alert
  const handleCreateAlert = async (e) => {
    e.preventDefault();
    if (!selectedCoin || !targetPrice) return;
    
    setCreateLoading(true);
    setCreateError('');

    try {
      const currentPrice = getPriceForCoin(selectedCoin.id) || 0;
      await createAlert({
        coin: selectedCoin.id,
        coinName: selectedCoin.name,
        targetPrice: parseFloat(targetPrice),
        currentPrice: currentPrice
      });
      
      setCreateSuccess(`Alert created for ${selectedCoin.name} at $${targetPrice}`);
      setShowCreateAlert(false);
      setSelectedCoin(null);
      setTargetPrice('');
      setSearchQuery('');
      setSearchResults([]);
      
      setTimeout(() => setCreateSuccess(''), 3000);
    } catch (err) {
      setCreateError(err.message || 'Failed to create alert');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDeleteAlert = async (alertId) => {
    if (window.confirm('Are you sure you want to delete this alert?')) {
      setDeleteLoading(alertId);
      try {
        await deleteAlert(alertId);
      } catch (error) {
        console.error('Failed to delete alert:', error);
      } finally {
        setDeleteLoading(null);
      }
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.coin_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.coin.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filter === 'all' || 
                         (filter === 'active' && !alert.triggered) ||
                         (filter === 'triggered' && alert.triggered);
    
    return matchesSearch && matchesFilter;
  });

  const activeAlerts = alerts.filter(alert => !alert.triggered);
  const triggeredAlerts = alerts.filter(alert => alert.triggered);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 8
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Price Alerts</h1>
          <p className="text-gray-400">Manage your cryptocurrency price alerts</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowCreateAlert(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
          >
            <Plus className="h-5 w-5" />
            <span>Create Alert</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <Bell className="h-6 w-6 text-blue-400" />
            </div>
            <span className="text-2xl font-bold text-white">{activeAlerts.length}</span>
          </div>
          <p className="text-gray-400">Active Alerts</p>
          <p className="text-blue-400 text-sm mt-1">Monitoring prices</p>
        </div>

        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-500/20 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-400" />
            </div>
            <span className="text-2xl font-bold text-white">{triggeredAlerts.length}</span>
          </div>
          <p className="text-gray-400">Triggered Alerts</p>
          <p className="text-green-400 text-sm mt-1">Goals reached</p>
        </div>

        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-500/20 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-400" />
            </div>
            <span className="text-2xl font-bold text-white">{alerts.length}</span>
          </div>
          <p className="text-gray-400">Total Alerts</p>
          <p className="text-purple-400 text-sm mt-1">All time</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search alerts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Alerts</option>
              <option value="active">Active Only</option>
              <option value="triggered">Triggered Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden">
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-12">
            {alerts.length === 0 ? (
              <>
                <Bell className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No alerts yet</h3>
                <p className="text-gray-400 mb-6">Create your first price alert to get started</p>
                <button 
                  onClick={() => setShowCreateAlert(true)}
                  className="flex items-center space-x-2 mx-auto px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
                >
                  <Plus className="h-5 w-5" />
                  <span>Create Alert</span>
                </button>
              </>
            ) : (
              <>
                <AlertCircle className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No alerts found</h3>
                <p className="text-gray-400">Try adjusting your search or filter criteria</p>
              </>
            )}
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {filteredAlerts.map((alert) => {
              const currentPrice = getPriceForCoin(alert.coin) || alert.current_price || 0;
              const targetPrice = parseFloat(alert.target_price);
              const priceProgress = currentPrice / targetPrice;
              const isClose = priceProgress >= 0.95 && priceProgress < 1;

              return (
                <div
                  key={alert.id}
                  className={`p-6 hover:bg-white/5 transition-all duration-200 ${
                    alert.triggered ? 'bg-green-500/5' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-start space-x-4">
                      {/* Status Icon */}
                      <div className={`p-2 rounded-full ${
                        alert.triggered 
                          ? 'bg-green-500/20' 
                          : isClose 
                            ? 'bg-yellow-500/20' 
                            : 'bg-blue-500/20'
                      }`}>
                        {alert.triggered ? (
                          <CheckCircle className="h-5 w-5 text-green-400" />
                        ) : isClose ? (
                          <AlertCircle className="h-5 w-5 text-yellow-400" />
                        ) : (
                          <Bell className="h-5 w-5 text-blue-400" />
                        )}
                      </div>

                      {/* Alert Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-white">{alert.coin_name}</h3>
                          <span className="text-gray-400 text-sm uppercase">{alert.coin}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            alert.triggered
                              ? 'bg-green-500/20 text-green-400'
                              : isClose
                                ? 'bg-yellow-500/20 text-yellow-400'
                                : 'bg-blue-500/20 text-blue-400'
                          }`}>
                            {alert.triggered ? 'Triggered' : isClose ? 'Close' : 'Active'}
                          </span>
                        </div>

                        {/* Price Info */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-gray-400 text-sm">Target Price</p>
                            <p className="text-white font-semibold">{formatPrice(targetPrice)}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm">Current Price</p>
                            <p className="text-white font-semibold">{formatPrice(currentPrice)}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm">Progress</p>
                            <div className="flex items-center space-x-2">
                              <div className="flex-1 bg-gray-700 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full transition-all duration-300 ${
                                    alert.triggered 
                                      ? 'bg-green-500' 
                                      : isClose 
                                        ? 'bg-yellow-500' 
                                        : 'bg-blue-500'
                                  }`}
                                  style={{ width: `${Math.min(priceProgress * 100, 100)}%` }}
                                ></div>
                              </div>
                              <span className="text-sm text-gray-400 min-w-0">
                                {(priceProgress * 100).toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Metadata */}
                        <div className="flex items-center space-x-6 mt-4 text-sm text-gray-400">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>Created {new Date(alert.created_at).toLocaleDateString()}</span>
                          </div>
                          {alert.triggered && alert.triggered_at && (
                            <div className="flex items-center space-x-1">
                              <CheckCircle className="h-4 w-4 text-green-400" />
                              <span className="text-green-400">
                                Triggered {new Date(alert.triggered_at).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleDeleteAlert(alert.id)}
                        disabled={deleteLoading === alert.id}
                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200 disabled:opacity-50"
                        title="Delete alert"
                      >
                        {deleteLoading === alert.id ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-400"></div>
                        ) : (
                          <Trash2 className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Alert Modal */}
      {showCreateAlert && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 border border-white/10 rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Create Price Alert</h3>
              <button
                onClick={() => setShowCreateAlert(false)}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {createError && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                {createError}
              </div>
            )}

            {createSuccess && (
              <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm">
                {createSuccess}
              </div>
            )}
            
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
                  <div className="mt-2 max-h-40 overflow-y-auto bg-white/5 border border-white/20 rounded-lg">
                    {searchResults.map((coin) => (
                      <div
                        key={coin.id}
                        onClick={() => {
                          setSelectedCoin(coin);
                          setSearchQuery(coin.name);
                          setSearchResults([]);
                        }}
                        className="p-3 hover:bg-white/10 cursor-pointer border-b border-white/10 last:border-b-0"
                      >
                        <div className="flex items-center space-x-3">
                          <img src={coin.thumb} alt={coin.name} className="w-6 h-6 rounded-full" />
                          <div>
                            <p className="text-white font-medium">{coin.name}</p>
                            <p className="text-gray-400 text-sm">{coin.symbol}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Show current price if coin is selected */}
              {selectedCoin && (
                <div className="mb-2 text-sm text-gray-400">
                  Current price: <span className="text-white font-semibold">
                    {formatPrice(getPriceForCoin(selectedCoin.id) || 0)}
                  </span>
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
                    setCreateError('');
                  }}
                  className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading || !selectedCoin || !targetPrice}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createLoading ? 'Creating...' : 'Create Alert'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertsPage;