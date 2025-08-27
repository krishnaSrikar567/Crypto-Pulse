import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCrypto } from '../hooks/useCrypto';
import { useAuth } from '../contexts/AuthContext';
import { 
  TrendingUp, 
  Bell, 
  Shield, 
  Mail, 
  Search, 
  ArrowRight,
  Star,
  Activity,
  Zap,
  Globe
} from 'lucide-react';

const HomePage = () => {
  const { prices, trending, loading, searchCoins } = useCrypto();
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (query) => {
    if (query.trim()) {
      setIsSearching(true);
      const results = await searchCoins(query);
      setSearchResults(results);
      setIsSearching(false);
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

  const topCoins = [
    { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC' },
    { id: 'ethereum', name: 'Ethereum', symbol: 'ETH' },
    { id: 'cardano', name: 'Cardano', symbol: 'ADA' },
    { id: 'solana', name: 'Solana', symbol: 'SOL' },
    { id: 'polkadot', name: 'Polkadot', symbol: 'DOT' }
  ];

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center space-y-8 py-16">
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Crypto Price Alerts
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Never miss a crypto opportunity again. Set personalized price alerts and get notified instantly when your targets are reached.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto relative">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search cryptocurrencies (e.g., Bitcoin, Ethereum...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800/95 backdrop-blur-md border border-white/20 rounded-xl overflow-hidden z-10">
              {searchResults.map((coin) => (
                <div
                  key={coin.id}
                  className="flex items-center space-x-3 px-4 py-3 hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <img src={coin.thumb} alt={coin.name} className="w-6 h-6" />
                  <div>
                    <span className="text-white font-medium">{coin.name}</span>
                    <span className="text-gray-400 ml-2">{coin.symbol}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 hover:shadow-xl"
            >
              <span className="font-semibold">Go to Dashboard</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          ) : (
            <>
              <Link
                to="/signup"
                className="flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 hover:shadow-xl"
              >
                <span className="font-semibold">Get Started Free</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                to="/login"
                className="flex items-center space-x-2 px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-xl hover:bg-white/20 transition-all duration-200"
              >
                <span className="font-semibold">Login</span>
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          {
            icon: <Bell className="h-8 w-8" />,
            title: "Smart Alerts",
            description: "Set custom price targets and get instant notifications via email when reached."
          },
          {
            icon: <Shield className="h-8 w-8" />,
            title: "Secure & Private",
            description: "Your data is protected with JWT authentication and encrypted storage."
          },
          {
            icon: <Zap className="h-8 w-8" />,
            title: "Real-time Updates",
            description: "Live price monitoring with data from CoinGecko API updated every 30 seconds."
          },
          {
            icon: <Globe className="h-8 w-8" />,
            title: "Multi-Device",
            description: "Access your alerts from anywhere. Fully responsive design for all devices."
          }
        ].map((feature, index) => (
          <div
            key={index}
            className="group p-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-xl"
          >
            <div className="text-blue-400 mb-4 group-hover:text-purple-400 transition-colors duration-300">
              {feature.icon}
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
            <p className="text-gray-400 leading-relaxed">{feature.description}</p>
          </div>
        ))}
      </section>

      {/* Live Prices Section */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Live Crypto Prices</h2>
          <p className="text-gray-400 text-lg">Real-time cryptocurrency prices updated every 30 seconds</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 animate-pulse">
                <div className="h-6 bg-gray-600 rounded mb-4"></div>
                <div className="h-8 bg-gray-600 rounded mb-2"></div>
                <div className="h-4 bg-gray-600 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {topCoins.map((coin) => {
              const priceData = prices[coin.id];
              const price = priceData?.usd || 0;
              const change24h = priceData?.usd_24h_change || 0;
              const isPositive = change24h >= 0;

              return (
                <div
                  key={coin.id}
                  className="group bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-white">{coin.name}</h3>
                      <p className="text-gray-400 text-sm">{coin.symbol}</p>
                    </div>
                    <Activity className="h-5 w-5 text-blue-400 group-hover:text-purple-400 transition-colors" />
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-2xl font-bold text-white">
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
        )}
      </section>

      {/* Trending Section */}
      {trending.length > 0 && (
        <section className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Trending Now</h2>
            <p className="text-gray-400 text-lg">Most searched cryptocurrencies today</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {trending.slice(0, 5).map((coin, index) => (
              <div
                key={coin.id}
                className="group bg-gradient-to-br from-yellow-500/10 to-orange-500/10 backdrop-blur-md border border-yellow-500/20 rounded-xl p-6 hover:from-yellow-500/20 hover:to-orange-500/20 hover:border-yellow-500/30 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <img src={coin.thumb} alt={coin.name} className="w-8 h-8" />
                    <div>
                      <h3 className="font-semibold text-white text-sm">{coin.name}</h3>
                      <p className="text-gray-400 text-xs">{coin.symbol}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 text-yellow-400">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="text-xs font-medium">#{index + 1}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="text-center py-16 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-2xl border border-white/10">
        <div className="space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold text-white">Ready to Get Started?</h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Join thousands of crypto traders who never miss their price targets
          </p>
          {!isAuthenticated && (
            <Link
              to="/signup"
              className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 hover:shadow-xl font-semibold text-lg"
            >
              <span>Create Your Free Account</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;