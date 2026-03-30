import React, { useState, useEffect } from 'react';
import { fetchMenus, placeOrder, fetchOrderById, addItemsToOrder, downloadReceipt } from '../services/api';
import MenuCard from '../components/MenuCard';
import { Utensils, Search, Filter, Sparkles, ChevronDown, ShoppingBag, X, Plus, Minus, CheckCircle2, Download } from 'lucide-react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000'); // Connect to our backend

const Dashboard = () => {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Cart State
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderStatus, setOrderStatus] = useState({ loading: false, success: false, generatedOrderId: null, isAdding: false });

  // My Order State
  const [isMyOrderOpen, setIsMyOrderOpen] = useState(false);
  const [myOrderInputId, setMyOrderInputId] = useState('');
  const [myOrderData, setMyOrderData] = useState(null);
  const [myOrderLoading, setMyOrderLoading] = useState(false);
  const [myOrderError, setMyOrderError] = useState('');
  const [cartOrderIdInput, setCartOrderIdInput] = useState('');

  // Customization States
  const [customizingItem, setCustomizingItem] = useState(null);
  const [selectedPreferences, setSelectedPreferences] = useState(['Standard']);
  const [customDescription, setCustomDescription] = useState('');

  const preferenceOptions = [
    'Standard', 'Mild', 'Medium', 'Hot & Spicy', 'Extra Spicy', 
    'Less Salt', 'Extra Salt', 'No Onion', 'No Garlic', 'Well Done'
  ];

  useEffect(() => {
    const loadMenus = async () => {
      try {
        const data = await fetchMenus();
        setMenus(data);
        setLoading(false);
      } catch (err) {
        setError('Connection interrupted. Please check your Atlas instance.');
        setLoading(false);
      }
    };
    loadMenus();

    // Socket.io listeners
    socket.on('menuUpdated', (update) => {
      console.log('📡 Menu Update Received:', update);
      if (update.action === 'create') {
        setMenus(prev => [...prev, update.data]);
      } else if (update.action === 'update') {
        setMenus(prev => prev.map(m => m._id === update.data._id ? update.data : m));
      } else if (update.action === 'delete') {
        setMenus(prev => prev.filter(m => m._id !== update.id));
      }
    });

    socket.on('orderCompleted', (completedOrder) => {
      console.log('📡 Order Completed Received:', completedOrder);
      setMyOrderData(prev => {
        if (prev && prev.orderId === completedOrder.orderId) return completedOrder;
        return prev;
      });
    });

    socket.on('orderUpdated', (updatedOrder) => {
      console.log('📡 Order Update Received:', updatedOrder);
      setMyOrderData(prev => {
        if (prev && prev.orderId === updatedOrder.orderId) return updatedOrder;
        return prev;
      });
    });

    return () => {
      socket.off('menuUpdated');
      socket.off('orderCompleted');
      socket.off('orderUpdated');
    };
  }, []);

  const getCurrentSlot = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 16) return 'morning';
    if (hour >= 16 && hour < 21) return 'evening';
    return 'night';
  };

  const currentSlot = getCurrentSlot();

  const categories = ['All', ...new Set(menus.map(item => item.category))];
  
  const filteredMenus = menus.filter(item => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Case-insensitive matching for time slots
    const matchesTime = !item.timeSlots || item.timeSlots.length === 0 || 
      item.timeSlots.some(slot => slot.toLowerCase() === currentSlot.toLowerCase());
    
    return matchesCategory && matchesSearch && matchesTime;
  });

  const addToCart = (item) => {
    setCustomizingItem(item);
    setSelectedPreferences(['Standard']);
    setCustomDescription('');
  };

  const togglePreference = (opt) => {
    setSelectedPreferences(prev => {
      // If 'Standard' is selected and we click another option, remove 'Standard'
      if (opt !== 'Standard' && prev.includes('Standard')) {
        return [opt];
      }
      // If we click 'Standard', clear others and just have 'Standard'
      if (opt === 'Standard') {
        return ['Standard'];
      }
      
      // Toggle logic
      if (prev.includes(opt)) {
        const next = prev.filter(p => p !== opt);
        return next.length === 0 ? ['Standard'] : next;
      } else {
        return [...prev, opt];
      }
    });
  };

  const confirmAddToCart = () => {
    if (!customizingItem) return;

    setCart(prev => {
      return [...prev, { 
        ...customizingItem, 
        quantity: 1, 
        preference: selectedPreferences.join(', '), 
        customDescription: customDescription,
        cartId: Date.now()
      }];
    });
    
    setCustomizingItem(null);
    setIsCartOpen(true);
  };

  const removeFromCart = (cartId) => {
    setCart(prev => prev.filter(i => i.cartId !== cartId));
  };

  const updateQuantity = (cartId, delta) => {
    setCart(prev => prev.map(i => {
      if (i.cartId === cartId) {
        const newQty = Math.max(1, i.quantity + delta);
        return { ...i, quantity: newQty };
      }
      return i;
    }));
  };

  const cartTotal = cart.reduce((sum, item) => {
    const price = item.offerPercent > 0 
      ? item.price - (item.price * item.offerPercent / 100) 
      : item.price;
    return sum + (price * item.quantity);
  }, 0);

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    
    setOrderStatus({ loading: true, success: false, generatedOrderId: null, isAdding: false });
    try {
      const orderData = {
        items: cart.map(item => ({
          menuItemId: item._id,
          name: item.name,
          price: item.offerPercent > 0 
            ? item.price - (item.price * item.offerPercent / 100) 
            : item.price,
          quantity: item.quantity,
          preference: item.preference,
          customDescription: item.customDescription
        })),
        totalAmount: cartTotal,
        status: 'waiting'
      };
      
      let res;
      if (cartOrderIdInput.trim() !== '') {
        res = await addItemsToOrder(cartOrderIdInput.trim(), orderData);
        setOrderStatus({ loading: false, success: true, generatedOrderId: res.orderId, isAdding: true });
      } else {
        res = await placeOrder(orderData);
        setOrderStatus({ loading: false, success: true, generatedOrderId: res.orderId, isAdding: false });
      }

      setCart([]);
      setTimeout(() => {
        setOrderStatus({ loading: false, success: false, generatedOrderId: null, isAdding: false });
        setIsCartOpen(false);
        setCartOrderIdInput('');
      }, 6000); // Give user more time to copy ID
    } catch (err) {
      console.error('Order placement failed:', err);
      setOrderStatus({ loading: false, success: false, generatedOrderId: null, isAdding: false });
      alert('Failed to place order. Database connection error or invalid Order ID.');
    }
  };

  const handleFetchMyOrder = async () => {
    if (!myOrderInputId) return;
    setMyOrderLoading(true);
    setMyOrderError('');
    setMyOrderData(null);
    try {
      const data = await fetchOrderById(myOrderInputId);
      setMyOrderData(data);
    } catch (err) {
      setMyOrderError('Order not found. Please check your Order ID.');
    } finally {
      setMyOrderLoading(false);
    }
  };

  const handleDownloadReceipt = async () => {
    if (!myOrderData) return;
    try {
      setMyOrderLoading(true);
      const blob = await downloadReceipt(myOrderData.orderId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `receipt-${myOrderData.orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      // Order is removed from DB, so clear it from view
      setMyOrderData(null);
      setMyOrderInputId('');
      alert('Receipt downloaded successfully. Order has been completed and removed from our active system.');
      setIsMyOrderOpen(false);
    } catch (err) {
      alert('Failed to download receipt.');
    } finally {
      setMyOrderLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-orange-200 border-t-accent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium animate-pulse">Syncing with Atlas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6 text-center">
        <div className="max-w-md bg-white p-8 rounded-3xl shadow-2xl">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops! Connectivity Issue</h2>
          <p className="text-gray-600 mb-8">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full py-3 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all"
          >
            Reconnect To Cluster
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background selection:bg-orange-100 selection:text-orange-600 relative">
      
      {/* Navigation / Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-accent p-1.5 rounded-lg text-white">
              <Utensils className="w-5 h-5" />
            </div>
            <span className="text-xl font-black tracking-tighter uppercase text-gray-900">
              Dine_Elite
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-500">
            <a href="#" className="text-gray-900 hover:text-accent font-bold">Menu</a>
            <a href="#" className="hover:text-accent">Ordering</a>
            <a href="#" className="hover:text-accent font-bold text-green-500">Orders Connected</a>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMyOrderOpen(true)}
              className="px-4 py-2 bg-gray-100 text-gray-900 border border-gray-200 text-sm font-bold rounded-full hover:bg-gray-200 transition-all shadow-sm"
            >
              View My Order
            </button>
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-gray-700 hover:text-accent transition-colors"
            >
              <ShoppingBag className="w-6 h-6" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center border-2 border-white">
                  {cart.reduce((s, i) => s + i.quantity, 0)}
                </span>
              )}
            </button>
            <button 
              onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
              }}
              className="px-4 py-2 bg-red-600 text-white text-sm font-bold rounded-full hover:bg-red-700 transition-all shadow-md"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-white pt-12 pb-20 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-4 mb-6 transition-all animate-in fade-in slide-in-from-bottom-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-accent text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3 h-3" /> Chef's Signature Menu
              </div>
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-white text-xs font-bold uppercase tracking-wider ${
                currentSlot === 'morning' ? 'bg-blue-500' : currentSlot === 'evening' ? 'bg-orange-500' : 'bg-indigo-900'
              }`}>
                {currentSlot.charAt(0).toUpperCase() + currentSlot.slice(1)} Favorites Active
              </div>
            </div>
            <h1 className="text-5xl lg:text-7xl font-black text-gray-900 mb-6 leading-[1.05] tracking-tighter">
              Experience <span className="text-accent underline decoration-orange-200">The Art</span> Of Taste.
            </h1>
            <p className="text-lg text-gray-500 max-w-lg mb-10 leading-relaxed font-medium">
              Explore our curated selection of signature dishes, crafted with the freshest ingredients and culinary passion to elevate your dining experience.
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-md group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-gray-400 group-focus-within:text-accent transition-colors" />
              </div>
              <input 
                type="text" 
                placeholder="Search your favorite dish..."
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-accent focus:bg-white rounded-2xl outline-none text-gray-900 transition-all font-medium text-lg shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="hidden lg:block relative">
             <div className="absolute -inset-4 bg-orange-500/10 rounded-[3rem] blur-3xl"></div>
             <img 
               src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
               alt="Gourmet Food" 
               className="relative rounded-[2.5rem] shadow-2xl border-8 border-white object-cover aspect-[4/3]"
             />
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Filter Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-3 overflow-x-auto pb-4 md:pb-0 no-scrollbar">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300 ${
                  activeCategory === cat 
                    ? 'bg-accent text-white shadow-lg shadow-orange-500/30' 
                    : 'bg-white border border-gray-100 text-gray-500 hover:border-accent hover:text-accent'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-4 text-sm font-bold text-gray-400">
            <span className="flex items-center gap-2">
              <Filter className="w-4 h-4" /> Filtered
            </span>
            <span className="text-gray-900 underline decoration-accent underline-offset-4">
              {filteredMenus.length} Items Found
            </span>
          </div>
        </div>

        {/* Grid Display */}
        {filteredMenus.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredMenus.map((item, idx) => (
              <MenuCard key={item._id} item={item} index={idx} onAdd={addToCart} />
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-white rounded-[3rem] border-4 border-dashed border-gray-100">
            <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Matches Found</h3>
            <p className="text-gray-500 max-w-xs mx-auto">
              We couldn't find any dishes matching your current selection.
            </p>
            <button 
              onClick={() => { setActiveCategory('All'); setSearchQuery(''); }}
              className="mt-8 px-8 py-3 bg-gray-900 text-white rounded-full font-bold hover:scale-105 transition-transform"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </main>

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></div>
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-6 h-6 text-accent" />
                <h2 className="text-xl font-bold text-gray-900">Your Cart</h2>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cart.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                    <ShoppingBag className="w-10 h-10" />
                  </div>
                  <p className="text-gray-500 font-medium lowercase">your cart is currently empty_</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.cartId} className="flex gap-4 p-4 bg-white rounded-2xl border border-gray-50 shadow-sm relative group overflow-hidden">
                    <div className="absolute top-0 right-0 w-1 h-full bg-accent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <img 
                      src={item.imageUrl} 
                      alt={item.name} 
                      className="w-20 h-20 rounded-xl object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-gray-900 text-lg truncate pr-2">{item.name}</h4>
                        <button 
                          onClick={() => removeFromCart(item.cartId)}
                          className="p-1 hover:text-red-500 text-gray-400 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-orange-50 text-accent border border-orange-100 uppercase">
                          {item.preference}
                        </span>
                        {item.customDescription && (
                          <span className="text-[10px] text-gray-500 italic max-w-full truncate block">
                            "{item.customDescription}"
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-auto">
                        <span className="font-bold text-gray-900">
                          ₹{(item.offerPercent > 0 
                            ? item.price - (item.price * item.offerPercent / 100) 
                            : item.price).toFixed(0)}
                        </span>
                        
                        <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-0.5 border border-gray-100">
                          <button 
                            onClick={() => updateQuantity(item.cartId, -1)}
                            className="w-6 h-6 flex items-center justify-center hover:bg-white rounded-md shadow-sm transition-all"
                          >
                            <Minus className="w-3 h-3 text-gray-600" />
                          </button>
                          <span className="text-xs font-bold min-w-[16px] text-center">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.cartId, 1)}
                            className="w-6 h-6 flex items-center justify-center hover:bg-white rounded-md shadow-sm transition-all"
                          >
                            <Plus className="w-3 h-3 text-gray-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="p-6 border-t border-gray-100 bg-gray-50/50">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-500 font-bold uppercase text-xs tracking-widest">Grand Total</span>
                <span className="text-2xl font-black text-gray-900">₹{cartTotal.toFixed(0)}</span>
              </div>
              
              {!orderStatus.success && cart.length > 0 && (
                <div className="mb-4">
                  <label className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Add to Existing Order?</label>
                  <input 
                    type="text" 
                    placeholder="Enter Order ID"
                    value={cartOrderIdInput}
                    onChange={(e) => setCartOrderIdInput(e.target.value)}
                    className="w-full bg-white border border-gray-200 focus:border-accent p-2.5 rounded-xl outline-none text-gray-800 transition-all font-medium text-sm shadow-sm placeholder:text-gray-300"
                  />
                </div>
              )}

              {orderStatus.success ? (
                <div className="w-full py-4 bg-green-500 text-white rounded-2xl font-bold flex flex-col items-center justify-center gap-1 shadow-lg shadow-green-500/20 text-center">
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5" /> {orderStatus.isAdding ? 'Items Added!' : 'Order Placed!'}</div>
                  <div className="text-xs font-medium bg-black/20 px-3 py-1 rounded-full mt-2">
                    Your Order ID: <span className="font-black text-white">{orderStatus.generatedOrderId}</span>
                  </div>
                  <div className="text-[9px] mt-1 opacity-80">Do not refresh. Please save this ID.</div>
                </div>
              ) : (
                <button 
                  onClick={handlePlaceOrder}
                  disabled={cart.length === 0 || orderStatus.loading}
                  className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-gray-200 flex items-center justify-center gap-2 active:scale-95"
                >
                  {orderStatus.loading ? 'Syncing Order...' : (cartOrderIdInput.trim() ? 'Add Items to Order' : 'Place My Order')}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Customization Modal */}
      {customizingItem && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setCustomizingItem(null)}></div>
          <div className="relative w-full max-w-lg bg-white rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh]">
            
            {/* Modal Header/Image */}
            <div className="h-20 sm:h-24 shrink-0 relative">
              <img 
                src={customizingItem.imageUrl} 
                alt={customizingItem.name} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
              <button 
                onClick={() => setCustomizingItem(null)}
                className="absolute top-4 right-4 p-2 bg-black/20 backdrop-blur-md hover:bg-black/40 rounded-full transition-colors text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Scrollable Content Area */}
            <div className="overflow-y-auto px-6 sm:px-8 pb-4 pt-1 custom-scrollbar">
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 mb-0.5 leading-tight">How Would You Like It?</h2>
              <p className="text-[10px] sm:text-xs text-gray-500 mb-4 font-medium italic">Customizing: {customizingItem.name}</p>
              
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <label className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2 sm:mb-3">Choose Your Preferences</label>
                  <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                    {preferenceOptions.map(opt => (
                      <button
                        key={opt}
                        onClick={() => togglePreference(opt)}
                        className={`py-2 sm:py-2.5 px-3 rounded-xl text-xs font-bold transition-all border-2 ${
                          selectedPreferences.includes(opt) 
                            ? 'bg-accent border-accent text-white shadow-lg shadow-orange-500/10' 
                            : 'bg-gray-50 border-transparent text-gray-600 hover:bg-white hover:border-accent/20'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2 sm:mb-3">Describe how the dish should be</label>
                  <textarea 
                    value={customDescription}
                    onChange={(e) => setCustomDescription(e.target.value)}
                    placeholder="e.g. Make it extra hot, no salt on the side..."
                    className="w-full bg-gray-50 border-2 border-transparent focus:border-accent focus:bg-white p-3 rounded-xl outline-none text-gray-800 transition-all font-medium h-16 sm:h-20 resize-none text-xs"
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Sticky Action Footer */}
            <div className="p-4 border-t border-gray-50 bg-white shrink-0">
              <button 
                onClick={confirmAddToCart}
                className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold text-sm sm:text-base hover:bg-black transition-all shadow-xl shadow-gray-200 flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <Plus className="w-4 h-4" /> Add Customized Dish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* My Order Modal */}
      {isMyOrderOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMyOrderOpen(false)}></div>
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h2 className="text-xl font-black text-gray-900">My Order Details</h2>
              <button onClick={() => setIsMyOrderOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
              <div className="mb-6 flex gap-2">
                <input 
                  type="text" 
                  placeholder="Enter your Order ID..."
                  value={myOrderInputId}
                  onChange={(e) => setMyOrderInputId(e.target.value)}
                  className="flex-1 bg-gray-50 border-2 border-transparent focus:border-accent focus:bg-white px-4 py-3 rounded-xl outline-none text-gray-900 font-bold shadow-sm placeholder:text-gray-400 placeholder:font-medium"
                />
                <button 
                  onClick={handleFetchMyOrder}
                  disabled={myOrderLoading || !myOrderInputId}
                  className="px-6 py-3 bg-accent text-white font-bold rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-50 shadow-md shadow-orange-500/20"
                >
                  {myOrderLoading && !myOrderData ? 'Load...' : 'View'}
                </button>
              </div>

              {myOrderError && (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-bold border border-red-100 mb-4">
                  {myOrderError}
                </div>
              )}

              {myOrderData && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex justify-between items-center text-sm font-medium border-b border-gray-100 pb-2">
                    <span className="text-gray-500">Order ID: <span className="text-gray-900 font-bold ml-1">{myOrderData.orderId}</span></span>
                    <span className={`px-2.5 py-1 font-bold rounded-lg text-xs uppercase tracking-wide ${
                      myOrderData.status === 'waiting' ? 'bg-orange-100 text-orange-600' :
                      myOrderData.status === 'pending' ? 'bg-red-100 text-red-600' :
                      myOrderData.status === 'preparing' ? 'bg-blue-100 text-blue-600' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {myOrderData.status}
                    </span>
                  </div>
                  
                  <div className="space-y-3 mt-4">
                    {myOrderData.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-start bg-gray-50 p-3 rounded-xl">
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 text-sm">{item.quantity}x {item.name}</h4>
                          <div className="text-[10px] text-gray-500 mt-1 flex gap-2 font-medium">
                            {item.preference && item.preference !== 'Standard' && (
                              <span className="bg-white border border-gray-200 px-1.5 py-0.5 rounded text-gray-600">{item.preference}</span>
                            )}
                          </div>
                        </div>
                        <span className="font-bold text-gray-900 whitespace-nowrap ml-4">₹{(item.price * item.quantity).toFixed(0)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center bg-gray-900 text-white p-4 rounded-2xl mt-6 shadow-md">
                    <span className="font-bold tracking-wide">Total Bill</span>
                    <span className="text-xl font-black">₹{myOrderData.totalAmount.toFixed(0)}</span>
                  </div>

                  <button 
                    onClick={handleDownloadReceipt}
                    disabled={myOrderLoading}
                    className="w-full mt-4 py-4 bg-green-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-600 transition-all shadow-lg shadow-green-500/20 active:scale-[0.98]"
                  >
                    <Download className="w-5 h-5" /> Download Receipt
                  </button>
                  <p className="text-center text-[10px] text-gray-400 font-medium italic mt-2">
                    Downloading the receipt will mark the order as completed.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer / Contact */}
      <footer className="bg-white border-t border-gray-100 pt-20 pb-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
           <div className="flex items-center gap-2">
            <div className="bg-gray-100 p-2 rounded-lg text-gray-900">
              <Utensils className="w-6 h-6" />
            </div>
            <span className="text-2xl font-black tracking-tighter uppercase text-gray-900">
              Dine_Elite
            </span>
          </div>
          <div className="text-gray-400 text-sm font-medium">
            © 2026 Crafted for Premium Experiences. Powered by Atlas.
          </div>
          <div className="flex gap-6">
             <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center hover:bg-orange-50 transition-colors cursor-pointer">
               <ChevronDown className="w-5 h-5 text-gray-400 rotate-180" />
             </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
