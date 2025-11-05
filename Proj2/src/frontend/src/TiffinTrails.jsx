import React, { useState, useEffect } from 'react';
import { ShoppingCart, Heart, Leaf, TrendingUp, Users, Star, Search, MapPin, Clock, Award, AlertCircle, Truck, Package, Menu, X, ChevronRight, Zap, Loader } from 'lucide-react';

const TiffinTrails = () => {
  const [currentView, setCurrentView] = useState('browse');
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [cart, setCart] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCuisine, setFilterCuisine] = useState('all');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [favorites, setFavorites] = useState(new Set([1, 3]));
  const [restaurants, setRestaurants] = useState([]);
  const [rescueMeals, setRescueMeals] = useState([]);
  const [userImpact, setUserImpact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // API base URL - change this to your Flask server URL
  const API_BASE_URL = 'http://localhost:5000/api';

  // Fetch restaurants data from API
  useEffect(() => {
    fetchRestaurants();
    fetchRescueMeals();
    fetchUserImpact();
  }, []);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/restaurants`);
      if (!response.ok) throw new Error('Failed to fetch restaurants');
      const data = await response.json();
      setRestaurants(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching restaurants:', err);
      setError('Failed to load restaurants. Make sure Flask API is running on port 5000.');
      setRestaurants(getSampleRestaurants());
    } finally {
      setLoading(false);
    }
  };

  const fetchRescueMeals = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/rescue-meals`);
      if (!response.ok) throw new Error('Failed to fetch rescue meals');
      const data = await response.json();
      setRescueMeals(data);
    } catch (err) {
      console.error('Error fetching rescue meals:', err);
      setRescueMeals([]);
    }
  };

  const fetchUserImpact = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/user-impact`);
      if (!response.ok) throw new Error('Failed to fetch user impact');
      const data = await response.json();
      setUserImpact(data);
    } catch (err) {
      console.error('Error fetching user impact:', err);
      setUserImpact(getSampleUserImpact());
    }
  };

  // Sample data fallback
  const getSampleRestaurants = () => [
    {
      id: 1,
      name: "Eastside Deli",
      cuisine: "Deli",
      location: "Raleigh, Zone-1",
      rating: 4.7,
      reviews: 234,
      sustainabilityScore: 92,
      avgDeliveryTime: 18.5,
      onTimeRate: 94.3,
      avgDistance: 4.2,
      efficiencyScore: 88.5,
      weeklyWasteLbs: 12.3,
      wasteReduction: "+23%",
      carbonSaved: 5.6,
      rescueMeals: []
    }
  ];

  const getSampleUserImpact = () => ({
    mealsOrdered: 47,
    moneySaved: 156.80,
    foodWastePrevented: 23.4,
    carbonReduced: 18.7,
    localRestaurantsSupported: 8,
    impactLevel: "Sustainability Champion"
  });

  const cuisineTypes = ['all', ...new Set(restaurants.map(r => r.cuisine))].filter(Boolean);

  const filteredRestaurants = restaurants.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) || r.cuisine.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCuisine = filterCuisine === 'all' || r.cuisine === filterCuisine;
    return matchesSearch && matchesCuisine;
  });

  const addToCart = (restaurant, meal) => {
    setCart([...cart, { restaurant: restaurant.name, meal, quantity: 1 }]);
  };

  const toggleFavorite = (restaurantId) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(restaurantId)) {
      newFavorites.delete(restaurantId);
    } else {
      newFavorites.add(restaurantId);
    }
    setFavorites(newFavorites);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Leaf className="w-8 h-8" />
              <div>
                <h1 className="text-2xl font-bold">Tiffin Trails</h1>
                <p className="text-xs text-green-100">Save Food. Save Money. Save Planet.</p>
              </div>
            </div>
            
            <nav className="hidden md:flex items-center space-x-6">
              <button onClick={() => setCurrentView('browse')} className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition ${currentView === 'browse' ? 'bg-white/20' : 'hover:bg-white/10'}`}>
                <Package className="w-4 h-4" />
                <span>Browse</span>
              </button>
              <button onClick={() => setCurrentView('rescue')} className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition ${currentView === 'rescue' ? 'bg-white/20' : 'hover:bg-white/10'}`}>
                <Zap className="w-4 h-4" />
                <span>Rescue Meals</span>
              </button>
              <button onClick={() => setCurrentView('impact')} className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition ${currentView === 'impact' ? 'bg-white/20' : 'hover:bg-white/10'}`}>
                <TrendingUp className="w-4 h-4" />
                <span>My Impact</span>
              </button>
              <button onClick={() => setCurrentView('community')} className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition ${currentView === 'community' ? 'bg-white/20' : 'hover:bg-white/10'}`}>
                <Users className="w-4 h-4" />
                <span>Community</span>
              </button>
            </nav>

            <div className="flex items-center space-x-4">
              <button className="relative">
                <ShoppingCart className="w-6 h-6" />
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{cart.length}</span>
                )}
              </button>
              <button className="md:hidden" onClick={() => setShowMobileMenu(!showMobileMenu)}>
                {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {showMobileMenu && (
            <div className="md:hidden mt-4 pb-4 space-y-2">
              <button onClick={() => { setCurrentView('browse'); setShowMobileMenu(false); }} className="w-full text-left px-4 py-2 hover:bg-white/10 rounded">Browse</button>
              <button onClick={() => { setCurrentView('rescue'); setShowMobileMenu(false); }} className="w-full text-left px-4 py-2 hover:bg-white/10 rounded">Rescue Meals</button>
              <button onClick={() => { setCurrentView('impact'); setShowMobileMenu(false); }} className="w-full text-left px-4 py-2 hover:bg-white/10 rounded">My Impact</button>
              <button onClick={() => { setCurrentView('community'); setShowMobileMenu(false); }} className="w-full text-left px-4 py-2 hover:bg-white/10 rounded">Community</button>
            </div>
          )}
        </div>
      </header>

      {currentView === 'browse' && (
        <div className="max-w-7xl mx-auto px-4 py-8">
          {error && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="text-yellow-800 font-medium">API Connection Issue</p>
                <p className="text-yellow-700 text-sm">{error}</p>
                <p className="text-yellow-600 text-xs mt-1">Run: cd Proj2/src/api && python app.py</p>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader className="w-12 h-12 text-green-600 animate-spin" />
              <span className="ml-4 text-xl text-gray-600">Loading restaurants...</span>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input type="text" placeholder="Search restaurants or cuisines..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                  </div>
                  <select value={filterCuisine} onChange={(e) => setFilterCuisine(e.target.value)} className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                    {cuisineTypes.map(type => (
                      <option key={type} value={type}>{type === 'all' ? 'All Cuisines' : type}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRestaurants.map(restaurant => (
                  <div key={restaurant.id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all border border-gray-200 overflow-hidden cursor-pointer" onClick={() => { setSelectedRestaurant(restaurant); setCurrentView('restaurant'); }}>
                    <div className="relative bg-gradient-to-br from-green-50 to-emerald-50 p-6">
                      <button onClick={(e) => { e.stopPropagation(); toggleFavorite(restaurant.id); }} className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md hover:scale-110 transition">
                        <Heart className={`w-5 h-5 ${favorites.has(restaurant.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                      </button>
                      
                      <h3 className="text-xl font-bold text-gray-800 mb-1">{restaurant.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{restaurant.cuisine}</p>
                      
                      <div className="flex items-center space-x-1 mb-3">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold text-gray-800">{restaurant.rating}</span>
                        <span className="text-sm text-gray-500">({restaurant.reviews})</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-white rounded-full px-3 py-1.5 flex items-center justify-between">
                          <div className="flex items-center space-x-1">
                            <Leaf className="w-4 h-4 text-green-600" />
                            <span className="text-xs font-medium text-gray-700">Sustainability</span>
                          </div>
                          <span className="text-sm font-bold text-green-600">{restaurant.sustainabilityScore}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-1 text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>{restaurant.avgDeliveryTime} min</span>
                        </div>
                        <div className="flex items-center space-x-1 text-gray-600">
                          <Truck className="w-4 h-4" />
                          <span>{restaurant.onTimeRate}% on-time</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-1 text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span>{restaurant.avgDistance} km</span>
                        </div>
                        <div className="flex items-center space-x-1 text-green-600 font-medium">
                          <TrendingUp className="w-4 h-4" />
                          <span>{restaurant.wasteReduction}</span>
                        </div>
                      </div>

                      {restaurant.rescueMeals && restaurant.rescueMeals.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-orange-600 flex items-center space-x-1">
                              <Zap className="w-3 h-3" />
                              <span>{restaurant.rescueMeals.length} Rescue Meals</span>
                            </span>
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {currentView === 'restaurant' && selectedRestaurant && (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <button onClick={() => setCurrentView('browse')} className="mb-6 flex items-center space-x-2 text-green-600 hover:text-green-700">
            <ChevronRight className="w-5 h-5 rotate-180" />
            <span>Back to Browse</span>
          </button>

          <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{selectedRestaurant.name}</h1>
            <p className="text-gray-600 mb-6">{selectedRestaurant.cuisine} • {selectedRestaurant.location}</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Leaf className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-gray-600">Sustainability</span>
                </div>
                <p className="text-2xl font-bold text-green-600">{selectedRestaurant.sustainabilityScore}</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-gray-600">Delivery</span>
                </div>
                <p className="text-2xl font-bold text-blue-600">{selectedRestaurant.avgDeliveryTime}m</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  <span className="text-sm text-gray-600">Efficiency</span>
                </div>
                <p className="text-2xl font-bold text-purple-600">{selectedRestaurant.efficiencyScore}</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Award className="w-5 h-5 text-orange-600" />
                  <span className="text-sm text-gray-600">Waste Cut</span>
                </div>
                <p className="text-2xl font-bold text-orange-600">{selectedRestaurant.wasteReduction}</p>
              </div>
            </div>
          </div>

          {selectedRestaurant.rescueMeals && selectedRestaurant.rescueMeals.length > 0 && (
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl shadow-lg p-6 border-2 border-orange-200">
              <div className="flex items-center space-x-2 mb-4">
                <Zap className="w-6 h-6 text-orange-600" />
                <h2 className="text-2xl font-bold text-gray-800">Rescue Meals Available</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedRestaurant.rescueMeals.map(meal => (
                  <div key={meal.id} className="bg-white rounded-lg p-4 shadow-md">
                    <h3 className="font-bold text-gray-800 mb-1">{meal.name}</h3>
                    <p className="text-sm text-orange-600 mb-3">Expires: {meal.expiresIn}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-gray-400 line-through">${meal.originalPrice}</span>
                        <span className="text-2xl font-bold text-green-600 ml-2">${meal.rescuePrice}</span>
                      </div>
                      <button onClick={() => addToCart(selectedRestaurant, meal)} className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700">
                        Rescue
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {currentView === 'rescue' && (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl p-8 mb-8">
            <h1 className="text-3xl font-bold mb-2">Rescue Meals</h1>
            <p className="text-lg">Save food from waste and save up to 40% on delicious meals!</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader className="w-12 h-12 text-orange-600 animate-spin" />
              <span className="ml-4 text-xl text-gray-600">Loading rescue meals...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rescueMeals.length > 0 ? (
                rescueMeals.map((item) => (
                  <div key={item.id} className="bg-white rounded-xl shadow-lg border-2 border-orange-200">
                    <div className="bg-gradient-to-br from-orange-50 to-red-50 p-4">
                      <h3 className="text-lg font-bold text-gray-800 mb-1">{item.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{item.restaurant}</p>
                      <span className="bg-orange-600 text-white px-2 py-1 rounded text-xs">{item.expiresIn}</span>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <span className="text-gray-400 line-through">${item.originalPrice}</span>
                          <span className="text-3xl font-bold text-green-600 ml-2">${item.rescuePrice}</span>
                        </div>
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">{item.quantity} left</span>
                      </div>
                      <button 
                        onClick={() => {
                          const restaurant = restaurants.find(r => r.name === item.restaurant);
                          if (restaurant) addToCart(restaurant, item);
                        }} 
                        className="w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 font-bold"
                      >
                        Rescue This Meal
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-xl text-gray-600">No rescue meals available right now</p>
                  <p className="text-gray-500 mt-2">Check back soon for new opportunities to save food!</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {currentView === 'impact' && userImpact && (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl p-8 mb-8">
            <h1 className="text-3xl font-bold mb-2">Your Environmental Impact</h1>
            <p className="text-lg">Track the difference you're making!</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader className="w-12 h-12 text-green-600 animate-spin" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                  <Package className="w-12 h-12 text-green-600 mx-auto mb-3" />
                  <p className="text-gray-600 mb-2">Meals Rescued</p>
                  <p className="text-4xl font-bold text-green-600">{userImpact.mealsOrdered}</p>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                  <Leaf className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                  <p className="text-gray-600 mb-2">Waste Prevented</p>
                  <p className="text-4xl font-bold text-blue-600">{userImpact.foodWastePrevented} lbs</p>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                  <TrendingUp className="w-12 h-12 text-purple-600 mx-auto mb-3" />
                  <p className="text-gray-600 mb-2">Carbon Reduced</p>
                  <p className="text-4xl font-bold text-purple-600">{userImpact.carbonReduced} kg</p>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                  <Award className="w-12 h-12 text-orange-600 mx-auto mb-3" />
                  <p className="text-gray-600 mb-2">Money Saved</p>
                  <p className="text-4xl font-bold text-orange-600">${userImpact.moneySaved}</p>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-8 mt-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Impact Level: {userImpact.impactLevel}</h2>
                <p className="text-gray-600">You've supported {userImpact.localRestaurantsSupported} local restaurants in reducing food waste!</p>
              </div>
            </>
          )}
        </div>
      )}

      {currentView === 'community' && (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl p-8 mb-8">
            <h1 className="text-3xl font-bold mb-2">Community Impact</h1>
            <p className="text-lg">Together we're making a difference!</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Raleigh Community Stats</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-5xl font-bold text-green-600 mb-2">1,247</p>
                <p className="text-gray-600">Active Users</p>
              </div>
              <div className="text-center">
                <p className="text-5xl font-bold text-blue-600 mb-2">8,934</p>
                <p className="text-gray-600">Meals Rescued</p>
              </div>
              <div className="text-center">
                <p className="text-5xl font-bold text-purple-600 mb-2">4.2 tons</p>
                <p className="text-gray-600">Food Waste Prevented</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TiffinTrails;