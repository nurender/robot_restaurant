import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  UtensilsCrossed,
  ListTodo,
  ChefHat,
  Plus,
  Trash2,
  CheckCircle,
  Printer,
  Search,
  Settings,
  UserCircle,
  LogOut,
  Users,
  Store,
  Copy,
  DollarSign,
  TrendingUp,
  Clock,
  Image as ImageIcon,
  Film,
  Play,
  Edit2
} from 'lucide-react';
import { io } from 'socket.io-client';
import axios from 'axios';
import './AdminPanel.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const socket = io(API_URL, { autoConnect: true });

const AdminPanel = () => {
  const [adminUser, setAdminUser] = useState(JSON.parse(localStorage.getItem('admin_token')) || {});
  const [activeTab, setActiveTab] = useState('dashboard');
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [showMenuPopup, setShowMenuPopup] = useState(false);
  const [showCategoriesPopup, setShowCategoriesPopup] = useState(false);
  const [categories, setCategories] = useState([]);
  const [newCatName, setNewCatName] = useState('');
  const [selectedBranchId, setSelectedBranchId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const [newDish, setNewDish] = useState({ 
    name: '', 
    category: '', 
    price: '', 
    description: '',
    image_url: '',
    video_url: ''
  });
  const [uploading, setUploading] = useState({ image: false, video: false });
  const [editingDishId, setEditingDishId] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [restaurantsList, setRestaurantsList] = useState([]);
  const [newStaffMember, setNewStaffMember] = useState({ email: '', password: '', name: '', role: 'admin', restaurant_id: '' });
  const [newRestaurant, setNewRestaurant] = useState({ name: '', location: '' });

  const fetchOrders = async () => {
    try {
      const endpoint = adminUser.role === 'super_admin' ? '/api/orders' : `/api/orders?restaurant_id=${adminUser.restaurant_id}`;
      const response = await axios.get(`${API_URL}${endpoint}`);
      setOrders(response.data.data);
    } catch (error) { console.error("Failed to fetch orders:", error); }
  };

  const fetchMenu = async () => {
    try {
      const endpoint = adminUser.role === 'super_admin' ? '/api/menu' : `/api/menu?restaurant_id=${adminUser.restaurant_id}`;
      const response = await axios.get(`${API_URL}${endpoint}`);
      setMenuItems(response.data.data);
    } catch (error) { console.error("Failed to fetch menu:", error); }
  };

  const fetchCategories = async () => {
    try {
      const endpoint = adminUser.role === 'super_admin' ? '/api/categories' : `/api/categories?restaurant_id=${adminUser.restaurant_id}`;
      const response = await axios.get(`${API_URL}${endpoint}`);
      setCategories(response.data.data);
    } catch (error) { console.error("Failed to fetch categories:", error); }
  };

  const fetchStaff = async () => {
    try {
      const endpoint = adminUser.role === 'super_admin' ? '/api/users' : `/api/users?restaurant_id=${adminUser.restaurant_id}`;
      const response = await axios.get(`${API_URL}${endpoint}`);
      setStaffList(response.data.data);
    } catch (error) { console.error("Failed to fetch staff:", error); }
  };

  const fetchRestaurants = async () => {
    if (adminUser.role !== 'super_admin') return;
    try {
      const response = await axios.get(`${API_URL}/api/restaurants`);
      setRestaurantsList(response.data.data);
    } catch (error) { console.error("Failed to fetch restaurants:", error); }
  };

  useEffect(() => {
    fetchOrders();
    fetchMenu();
    fetchCategories();
    fetchStaff();
    fetchRestaurants();
    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));
    socket.on('new_order', (newOrder) => {
      if (newOrder.restaurant_id === adminUser.restaurant_id) {
        setOrders((prev) => [newOrder, ...prev]);
      }
    });
    socket.on('order_status_update', ({ id, status }) => {
      setOrders((prev) => prev.map(o => o.id === id ? { ...o, status } : o));
    });
    socket.on('menu_updated', () => fetchMenu());
    socket.on('categories_updated', () => fetchCategories());
    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('new_order');
      socket.off('order_status_update');
      socket.off('menu_updated');
      socket.off('categories_updated');
    };
  }, [adminUser]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await axios.put(`${API_URL}/api/orders/${orderId}/status`, { status: newStatus });
    } catch (error) { console.error("Status update failed:", error); }
  };

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading({ ...uploading, [type]: true });
    try {
      const response = await axios.post(`${API_URL}/api/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setNewDish({ ...newDish, [`${type}_url`]: response.data.url });
    } catch (error) {
      console.error("Upload failed:", error);
      alert(`${type} upload failed. Check server connection.`);
    } finally {
      setUploading({ ...uploading, [type]: false });
    }
  };

  const handleEditClick = (item) => {
    setNewDish({
      name: item.name,
      category: item.category,
      price: item.price,
      description: item.description || '',
      image_url: item.image_url || '',
      video_url: item.video_url || ''
    });
    setEditingDishId(item.id);
    setShowMenuPopup(true);
  };

  const handleAddDish = async (e) => {
    e.preventDefault();
    try {
      if (editingDishId) {
        await axios.put(`${API_URL}/api/menu/${editingDishId}`, newDish);
      } else {
        await axios.post(`${API_URL}/api/menu`, { ...newDish, restaurant_id: adminUser.restaurant_id });
      }
      setNewDish({ name: '', category: '', price: '', description: '', image_url: '', video_url: '' });
      setEditingDishId(null);
      setShowMenuPopup(false);
      fetchMenu();
    } catch (error) { console.error("Save/Update dish failed:", error); }
  };

  const handleDeleteDish = async (id) => {
    if (!window.confirm("Are you sure you want to delete this dish?")) return;
    try {
      await axios.delete(`${API_URL}/api/menu/${id}`);
      fetchMenu();
    } catch (error) { console.error("Delete failed:", error); }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      await axios.post(`${API_URL}/api/categories`, { name: newCatName, restaurant_id: adminUser.restaurant_id });
      setNewCatName('');
      fetchCategories();
    } catch (error) { console.error("Add category failed:", error); }
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...newStaffMember,
        // Force restaurant_id for admins, use selected for super_admin
        restaurant_id: adminUser.role === 'super_admin' ? newStaffMember.restaurant_id : adminUser.restaurant_id
      };
      await axios.post(`${API_URL}/api/users`, payload);
      setNewStaffMember({ email: '', password: '', name: '', role: 'kitchen_staff', restaurant_id: '' });
      fetchStaff();
    } catch (error) { console.error("Add staff failed:", error); }
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddRestaurant = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/restaurants`, newRestaurant);
      setNewRestaurant({ name: '', location: '' });
      fetchRestaurants();
    } catch (error) { console.error("Add restaurant failed:", error); }
  };

  const handleDeleteCategory = async (id, name) => {
    const hasItems = menuItems.some(i => i.category === name);
    if (hasItems) {
      alert(`Cannot delete "${name}" because it still contains dishes. Please re-assign or delete those dishes first.`);
      return;
    }
    if (!window.confirm(`Are you sure you want to delete category "${name}"?`)) return;
    try {
      await axios.delete(`${API_URL}/api/categories/${id}`);
      fetchCategories();
    } catch (error) { console.error("Delete category failed:", error); }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    window.location.href = '/admin/login';
  };

  const handlePrint = (order) => {
    setSelectedOrder(order);
    setTimeout(() => {
        window.print();
        setSelectedOrder(null);
    }, 500);
  };

  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar shadow-premium">
        <div className="sidebar-brand">
          <div className="brand-logo"><ChefHat size={28} color="white" /></div>
          <h2>AI RESTO</h2>
        </div>

        <nav className="sidebar-nav">
          {(adminUser.role === 'super_admin' || adminUser.role === 'admin') && (
            <button className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}><LayoutDashboard size={20} /> <span>Dashboard</span></button>
          )}

          <button className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
            <ListTodo size={20} />
            <span>Live Orders</span>
            {pendingOrders > 0 && <span className="nav-badge pulse">{pendingOrders}</span>}
          </button>

          {(adminUser.role === 'super_admin' || adminUser.role === 'admin') && (
            <button className={`nav-item ${activeTab === 'menu' ? 'active' : ''}`} onClick={() => setActiveTab('menu')}><UtensilsCrossed size={20} /> <span>Inventory</span></button>
          )}

          {adminUser.role === 'admin' && (
            <button className={`nav-item ${activeTab === 'staff' ? 'active' : ''}`} onClick={() => setActiveTab('staff')}><Users size={20} /> <span>Staff Management</span></button>
          )}

          {adminUser.role === 'super_admin' && (
            <button className={`nav-item ${activeTab === 'restaurants' ? 'active' : ''}`} onClick={() => setActiveTab('restaurants')}><Store size={20} /> <span>Business Management</span></button>
          )}
        </nav>

        <div className="sidebar-footer-premium">
          <div className="user-profile-plate">
            <div className="profile-avatar shadow-premium">
              <UserCircle size={24} color="var(--accent-color)" />
            </div>
            <div className="profile-info">
              <span className="user-name">{adminUser.name}</span>
              <span className="user-role">
                {adminUser.role === 'super_admin' ? 'Global Master' :
                  adminUser.role === 'admin' ? 'Restaurant Admin' : 'Orders Management'}
              </span>
            </div>
          </div>
          <button className="btn-logout-minimal" onClick={handleLogout}>
            <LogOut size={18} /> <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="main-header">
          <div className="header-search"><Search size={18} /><input type="text" placeholder="Search orders, tables, dishes..." /></div>
          <div className="header-profile-premium">
            <div className="profile-details-group">
              <span className="profile-name">{adminUser.name}</span>
              <span className="profile-role">{adminUser.role === 'super_admin' ? 'Super Admin' : 'Admin'}</span>
            </div>
            <div className="profile-avatar-glow">{adminUser.name?.charAt(0)}</div>
          </div>
        </header>

        <div className="content-scrollable scrollbar-hidden">          {/* DASHBOARD VIEW */}
          {activeTab === 'dashboard' && (
            <div className="view-container animate-fade-in dashboard-premium">
              <div className="view-header-row">
                <h2 className="view-title">Command Center</h2>
                <div className="live-pulse"><div className="pulse-dot"></div> Live Business Feed</div>
              </div>

              {/* STATS ROW */}
              <div className="stats-grid-modern">
                <div className="stat-card-modern purple shadow-premium">
                  <div className="stat-icon-main"><DollarSign size={24} /></div>
                  <div className="stat-body">
                    <p className="stat-label">Total Revenue</p>
                    <h3 className="stat-value">₹{totalRevenue.toLocaleString()}</h3>
                    <div className="stat-trend positive">+12.5% <TrendingUp size={14} /></div>
                  </div>
                </div>
                <div className="stat-card-modern blue shadow-premium">
                  <div className="stat-icon-main"><ListTodo size={24} /></div>
                  <div className="stat-body">
                    <p className="stat-label">Total Orders</p>
                    <h3 className="stat-value">{orders.length}</h3>
                    <div className="stat-trend neutral">Ongoing</div>
                  </div>
                </div>
                <div className="stat-card-modern green shadow-premium">
                  <div className="stat-icon-main"><Users size={24} /></div>
                  <div className="stat-body">
                    <p className="stat-label">Active Tables</p>
                    <h3 className="stat-value">{new Set(orders.filter(o => o.status === 'pending').map(o => o.tableNumber)).size} / 8</h3>
                    <div className="stat-trend positive">Busy</div>
                  </div>
                </div>
              </div>

              {/* MIDDLE ROW: CHART & TOP ITEMS */}
              <div className="dashboard-mid-grid mt-4">
                <div className="chart-section glass-panel shadow-premium">
                  <div className="card-header">
                    <h3>Sales Performance</h3>
                    <span>Last 6 Sessions</span>
                  </div>
                  <div className="svg-chart-container">
                    <svg viewBox="0 0 400 150" className="sales-svg">
                      <path d="M0,150 L50,120 L100,130 L150,80 L200,100 L250,50 L300,70 L350,20 L400,40" fill="none" stroke="var(--accent-color)" strokeWidth="3" strokeLinecap="round" className="chart-line-anim" />
                      <path d="M0,150 L50,120 L100,130 L150,80 L200,100 L250,50 L300,70 L350,20 L400,40 L400,150 L0,150" fill="url(#gradient-purple)" fillOpacity="0.1" />
                      <defs>
                        <linearGradient id="gradient-purple" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--accent-color)" />
                          <stop offset="100%" stopColor="white" />
                        </linearGradient>
                      </defs>
                      {/* Data Points */}
                      {[120, 130, 80, 100, 50, 70, 20].map((v, i) => (
                        <circle key={i} cx={50 * (i + 1)} cy={v} r="4" fill="white" stroke="var(--accent-color)" strokeWidth="2" />
                      ))}
                    </svg>
                    <div className="chart-labels">
                      <span>12PM</span><span>2PM</span><span>4PM</span><span>6PM</span><span>8PM</span><span>10PM</span>
                    </div>
                  </div>
                </div>

                <div className="top-items-section glass-panel shadow-premium">
                  <div className="card-header">
                    <h3>Trending Now</h3>
                    <span>Popular Dishes</span>
                  </div>
                  <div className="top-items-list mt-3">
                    {Object.entries(orders.flatMap(o => Array.isArray(o.items) ? o.items : [])
                      .reduce((acc, itm) => {
                        const key = itm.name || itm;
                        acc[key] = (acc[key] || 0) + (itm.qty || 1);
                        return acc;
                      }, {}))
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 4).map(([name, qty], idx) => (
                        <div key={idx} className="trending-item">
                          <div className="trend-rank">#{idx + 1}</div>
                          <div className="trend-info">
                            <strong>{name}</strong>
                            <span>ordered {qty} times</span>
                          </div>
                          <TrendingUp size={16} className="text-success" />
                        </div>
                      ))}
                    {orders.length === 0 && <p className="empty-text">No trending data yet.</p>}
                  </div>
                </div>
              </div>

              {/* BOTTOM ROW: TABLE MAP & RECENT */}
              <div className="dashboard-bottom-grid mt-4">
                <div className="table-map-section glass-panel shadow-premium">
                  <div className="card-header">
                    <h3>Restaurant Layout</h3>
                    <span>Live Occupancy</span>
                  </div>
                  <div className="table-map-grid mt-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(num => {
                      const isOccupied = orders.some(o => o.tableNumber == num && o.status === 'pending');
                      return (
                        <div key={num} className={`map-table-node ${isOccupied ? 'occupied' : 'vacant'}`}>
                          <span className="table-label">T{num}</span>
                          <Users size={14} />
                        </div>
                      );
                    })}
                  </div>
                  <div className="map-legend mt-4">
                    <span className="vacant"><div className="dot"></div> Vacant</span>
                    <span className="occupied"><div className="dot"></div> Occupied</span>
                  </div>
                </div>

                <div className="recent-orders-mini-section glass-panel shadow-premium">
                  <div className="card-header">
                    <h3>Live Feed</h3>
                    <span>Latest Activity</span>
                  </div>
                  <div className="mini-feed-list mt-3 scrollbar-hidden">
                    {orders.slice(0, 5).map(order => (
                      <div key={order.id} className="feed-item">
                        <div className={`status-icon ${order.status}`}></div>
                        <div className="feed-content">
                          <strong>Table {order.tableNumber}</strong>
                          <span>Placed an order for ₹{order.total}</span>
                        </div>
                        <span className="feed-time">{new Date(order.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    ))}
                    {orders.length === 0 && <p className="empty-text">Awaiting orders...</p>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="view-container animate-fade-in">
              <div className="view-header-row">
                <h2 className="view-title">Live Kitchen Feed</h2>
                <button className="btn-secondary" onClick={fetchOrders}>Refresh Feed</button>
              </div>
              {orders.length === 0 ? (
                <div className="empty-state glass-panel"><ChefHat size={64} className="mb-4 text-muted" /><h3>No Active Orders</h3><p>Real-time orders will appear here.</p></div>
              ) : (
                <div className="orders-grid-premium">
                  {orders.map((order, index) => (
                    <div key={order.id} className={`p-order-card shadow-premium ${order.status} animate-fade-in`} style={{ animationDelay: `${index * 0.1}s` }}>
                      <div className="p-card-header">
                        <div className="p-header-left">
                          <div className="table-badge">Table {order.tableNumber}</div>
                          <div className={`status-pill ${order.status}`}>
                            <span className="status-dot"></span>
                            {order.status === 'pending' ? 'Awaiting Action' : 'Served'}
                          </div>
                        </div>
                        <span className="p-time"><Clock size={14} /> {new Date(order.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className="p-card-body">
                        {(Array.isArray(order.items) ? order.items : []).map((item, idx) => (
                          <div key={idx} className="p-item-row">
                            <span className="p-qty">{item.qty || 1}x</span>
                            <div className="p-item-info">
                              <span className="p-name">{item.name || item}</span>
                              <span className="p-item-desc">High-fidelity culinary prep</span>
                            </div>
                            <span className="p-price">₹{(item.price || 0) * (item.qty || 1)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="p-card-footer">
                        <div className="p-total">
                          <span className="total-label">Total Amount</span>
                          <strong className="total-val">₹{order.total}</strong>
                        </div>
                        <div className="p-actions">
                          {order.status === 'pending' && (
                            <button className="btn-action-success animate-pulse-glow" onClick={() => handleStatusChange(order.id, 'completed')}>
                              <CheckCircle size={16} /> Serve
                            </button>
                          )}
                          <button className="btn-action-icon" onClick={() => handlePrint(order)} title="Print Reciept">
                            <Printer size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'menu' && (
            <div className="view-container animate-fade-in">
              <div className="view-header-row">
                <h2 className="view-title">Menu Management</h2>
                <div style={{ display: 'flex', gap: '12px' }}>
                  {adminUser.role === 'super_admin' && (
                    <div className="branch-selector-toolbar glass-panel">
                      <MapPin size={18} color="var(--accent-color)" />
                      <select 
                        value={selectedBranchId || ''} 
                        onChange={(e) => {
                          setSelectedBranchId(Number(e.target.value) || null);
                          fetchMenu(Number(e.target.value) || null);
                        }}
                        className="branch-select-mini"
                      >
                        <option value="">All Branches</option>
                        {branches.map(b => (
                          <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  {adminUser.role === 'super_admin' && (
                    <button className="btn-secondary" onClick={() => setShowCategoriesPopup(!showCategoriesPopup)}>
                      <Settings size={18} /> Manage Categories
                    </button>
                  )}
                  <button className="btn-primary" onClick={() => setShowMenuPopup(!showMenuPopup)}>
                    {showMenuPopup ? 'Close Form' : '+ Add New Dish'}
                  </button>
                </div>
              </div>

              {showCategoriesPopup && (
                <div className="menu-add-card glass-panel shadow-premium animate-slide-down mb-4">
                  <div className="card-header-accent mb-4"><h3><Settings size={18} /> Category Management</h3></div>
                  <form onSubmit={handleAddCategory} className="modern-form mb-4" style={{ display: 'flex', gap: '12px' }}>
                    <input
                      type="text"
                      className="flex-1"
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      placeholder="New Category Name (e.g. Seafood)"
                      required
                    />
                    <button type="submit" className="btn-primary" style={{ padding: '0 24px' }}>Add Category</button>
                  </form>
                  <div className="category-grid-mini">
                    {categories.map(cat => (
                      <div key={cat.id} className="cat-manage-item glass-panel">
                        <span>{cat.name}</span>
                        <button className="btn-icon-danger" onClick={() => handleDeleteCategory(cat.id, cat.name)}><Trash2 size={14} /></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="menu-manager-content">
                {showMenuPopup && (
                  <div className="menu-add-card glass-panel shadow-premium animate-slide-down">
                    <div className="card-header-accent mb-4"><h3><Plus size={18} /> Dish Details</h3></div>
                    <form onSubmit={handleAddDish} className="modern-form">
                      <div className="form-grid">
                        <div className="form-group full-width"><label>Dish Name</label><input type="text" value={newDish.name} onChange={(e) => setNewDish({ ...newDish, name: e.target.value })} placeholder="e.g. Garlic Naan" required /></div>
                        <div className="form-group"><label>Category</label>
                          <div className="category-select-wrapper">
                            <input
                              list="categories-list"
                              value={newDish.category}
                              onChange={(e) => setNewDish({ ...newDish, category: e.target.value })}
                              placeholder="Select or type new..."
                              required
                            />
                            <datalist id="categories-list">
                              {categories.map(cat => <option key={cat.id} value={cat.name} />)}
                            </datalist>
                          </div>
                          <div className="category-chips mt-3">
                            {categories.slice(0, 8).map(cat => (
                              <button
                                key={cat.id}
                                type="button"
                                className="cat-chip"
                                onClick={() => setNewDish({ ...newDish, category: cat.name })}
                              >
                                {cat.name}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="form-group full-width"><label>Description</label><textarea value={newDish.description} onChange={(e) => setNewDish({ ...newDish, description: e.target.value })} placeholder="Delicious description..."></textarea></div>
                        
                        <div className="form-group"><label>Dish Photography</label>
                          <div className="media-upload-zone">
                            {newDish.image_url ? (
                              <div className="media-preview-container">
                                <img src={newDish.image_url} alt="Preview" />
                                <button type="button" className="btn-remove-media" onClick={() => setNewDish({...newDish, image_url: ''})}>×</button>
                              </div>
                            ) : (
                              <label className="upload-placeholder">
                                <ImageIcon size={24} />
                                <span>{uploading.image ? 'Uploading...' : 'Select Dish Image'}</span>
                                <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'image')} hidden />
                              </label>
                            )}
                          </div>
                        </div>

                        <div className="form-group"><label>Product Video (Optional)</label>
                          <div className="media-upload-zone">
                            {newDish.video_url ? (
                              <div className="media-preview-container">
                                <Film size={24} color="var(--accent-color)" />
                                <span className="text-success" style={{fontSize: '11px'}}>Video Ready</span>
                                <button type="button" className="btn-remove-media" onClick={() => setNewDish({...newDish, video_url: ''})}>×</button>
                              </div>
                            ) : (
                              <label className="upload-placeholder">
                                <Film size={24} />
                                <span>{uploading.video ? 'Uploading...' : 'Select Promo Video'}</span>
                                <input type="file" accept="video/*" onChange={(e) => handleFileUpload(e, 'video')} hidden />
                              </label>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="form-footer mt-4"><button type="submit" className="btn-save-dish" disabled={uploading.image || uploading.video}>{editingDishId ? 'Update Dish' : 'Save Dish to Menu'}</button><button type="button" className="btn-cancel" onClick={() => { setShowMenuPopup(false); setEditingDishId(null); }}>Cancel</button></div>
                    </form>
                  </div>
                )}
                <div className="inventory-section">
                  <div className="inventory-toolbar-premium animate-fade-in">
                    <div className="search-box-integrated">
                      <Search size={18} className="search-icon-inner" />
                      <input type="text" placeholder="Search dish name or category..." />
                    </div>
                    <div className="inventory-meta-badge">
                      <ChefHat size={14} />
                      <span><strong>{menuItems.length}</strong> Dishes Available</span>
                    </div>
                  </div>
                  <div className="inventory-grid">
                    {menuItems.map(item => (
                      <div key={item.id} className="inventory-card glass-panel dish-card-premium animate-fade-in">
                        {item.image_url ? (
                          <div className="dish-banner" style={{ backgroundImage: `url("${item.image_url}")` }}>
                            {item.video_url && <div className="video-badge"><Play size={12} fill="white" /> Video</div>}
                          </div>
                        ) : (
                          <div className="inv-icon-box"><ChefHat size={20} /></div>
                        )}
                        <div className="inv-details">
                          <strong>{item.name}</strong>
                          <p className="inv-cat-tag">{item.category}</p>
                          <div className="inv-meta">
                            <span className="inv-price">₹{item.price}</span>
                            <div className="inv-actions">
                              <button className="inv-btn-edit" onClick={() => handleEditClick(item)}><Edit2 size={16} /></button>
                              <button className="inv-btn-delete" onClick={() => handleDeleteDish(item.id)}><Trash2 size={16} /></button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {menuItems.length === 0 && <div className="empty-inventory full-width"><Search size={40} /><p>No items found.</p></div>}
                  </div>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'staff' && adminUser.role === 'admin' && (
            <div className="view-container animate-fade-in dashboard-premium">
              <div className="view-header-row">
                <h2 className="view-title">Staff Management</h2>
              </div>
              <div className="menu-add-card glass-panel shadow-premium mb-4">
                <div className="card-header-accent mb-4"><h3><Plus size={18} /> Add Orders Management Staff</h3></div>
                <form onSubmit={handleAddStaff} className="modern-form">
                  <div className="form-grid">
                    <div className="form-group"><label>Full Name</label><input type="text" value={newStaffMember.name} onChange={(e) => setNewStaffMember({ ...newStaffMember, name: e.target.value })} placeholder="Staff Member Name" required /></div>
                    <div className="form-group"><label>Designation</label><input type="text" value="Orders Management" disabled className="modern-input-disabled" /></div>
                    <div className="form-group"><label>Login Email</label><input type="email" value={newStaffMember.email} onChange={(e) => setNewStaffMember({ ...newStaffMember, email: e.target.value })} placeholder="staff@resto.com" required /></div>
                    <div className="form-group"><label>Security Password</label><input type="password" value={newStaffMember.password} onChange={(e) => setNewStaffMember({ ...newStaffMember, password: e.target.value })} placeholder="••••••••" required /></div>
                  </div>
                  <div className="form-footer mt-4"><button type="submit" className="btn-primary">Register Staff Profile</button></div>
                </form>
              </div>
              <div className="inventory-grid">
                {staffList.map(staff => (
                  <div key={staff.id} className="inventory-card glass-panel animate-zoom-in staff-member-card">
                    <div className="inv-icon-box"><UserCircle size={24} color="var(--accent-color)" /></div>
                    <div className="inv-details">
                      <div className="staff-card-header">
                        <strong>{staff.name}</strong>
                        <span className={`role-badge ${staff.role}`}>{staff.role === 'admin' ? 'Admin' : 'Manager'}</span>
                      </div>
                      <p className="text-muted" style={{ fontSize: '12px' }}>
                        Local Authorized Staff
                      </p>

                      <div className="credential-copy-box mt-3">
                        <div className="cred-row">
                          <span className="cred-label">Login:</span>
                          <span className="cred-val">{staff.email}</span>
                          <button className="btn-copy-mini" title="Copy Email" onClick={() => handleCopy(staff.email, `${staff.id}-e`)}>
                            {copiedId === `${staff.id}-e` ? <CheckCircle size={14} color="#10b981" /> : <Copy size={14} />}
                          </button>
                        </div>
                        <div className="cred-row">
                          <span className="cred-label">Pass:</span>
                          <span className="cred-val">••••••••</span>
                          <button className="btn-copy-mini" title="Copy Password" onClick={() => handleCopy(staff.password, `${staff.id}-p`)}>
                            {copiedId === `${staff.id}-p` ? <CheckCircle size={14} color="#10b981" /> : <Copy size={14} />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'restaurants' && adminUser.role === 'super_admin' && (
            <div className="view-container animate-fade-in dashboard-premium">
              <div className="view-header-row">
                <h2 className="view-title">Corporate Administration</h2>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '32px' }}>
                <div className="menu-add-card glass-panel shadow-premium">
                  <div className="card-header-accent mb-4"><h3><Plus size={18} /> Create New Restaurant Branch</h3></div>
                  <form onSubmit={handleAddRestaurant} className="modern-form">
                    <div className="form-grid">
                      <div className="form-group full-width"><label>Restaurant Name</label><input type="text" value={newRestaurant.name} onChange={(e) => setNewRestaurant({ ...newRestaurant, name: e.target.value })} placeholder="e.g. Gourmet Burger Central" required /></div>
                      <div className="form-group full-width"><label>Branch Location</label><input type="text" value={newRestaurant.location} onChange={(e) => setNewRestaurant({ ...newRestaurant, location: e.target.value })} placeholder="City, Area" required /></div>
                    </div>
                    <div className="form-footer mt-4"><button type="submit" className="btn-primary">Provision Launch</button></div>
                  </form>
                </div>

                <div className="menu-add-card glass-panel shadow-premium">
                  <div className="card-header-accent mb-4"><h3><Users size={18} /> Provision Admin / Management</h3></div>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    axios.post(`${API_URL}/api/users`, newStaffMember).then(() => {
                      setNewStaffMember({ email: '', password: '', name: '', role: 'admin', restaurant_id: '' });
                      fetchStaff();
                    });
                  }} className="modern-form">
                    <div className="form-group mb-3"><label>Target Branch</label>
                      <select className="modern-select" value={newStaffMember.restaurant_id} onChange={(e) => setNewStaffMember({ ...newStaffMember, restaurant_id: e.target.value })} required>
                        <option value="">Select Branch...</option>
                        {restaurantsList.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                      </select>
                    </div>
                    <div className="form-group mb-3"><label>Full Name</label><input type="text" value={newStaffMember.name} onChange={(e) => setNewStaffMember({ ...newStaffMember, name: e.target.value })} required /></div>
                    <div className="form-group mb-3"><label>Assignment Role</label>
                      <select className="modern-select" value={newStaffMember.role} onChange={(e) => setNewStaffMember({ ...newStaffMember, role: e.target.value })}>
                        <option value="admin">Restaurant Admin</option>
                        <option value="kitchen_staff">Orders Management</option>
                      </select>
                    </div>
                    <div className="form-group mb-3"><label>Login Email</label><input type="email" value={newStaffMember.email} onChange={(e) => setNewStaffMember({ ...newStaffMember, email: e.target.value })} required /></div>
                    <div className="form-group mb-3"><label>Password</label><input type="password" value={newStaffMember.password} onChange={(e) => setNewStaffMember({ ...newStaffMember, password: e.target.value })} required /></div>
                    <button type="submit" className="btn-save-dish w-full mt-2 form-footer mt-4">Grant Credentials</button>
                  </form>
                </div>
              </div>



              <div className="view-header-row mt-4">
                <h2 className="view-title">Fleet Branches (Click to Filter Staff)</h2>
              </div>
              <div className="inventory-grid">
                {restaurantsList.map(res => {
                  const personnelCount = staffList.filter(s => String(s.restaurant_id) === String(res.id)).length;
                  return (
                    <div
                      key={res.id}
                      className={`inventory-card glass-panel clickable-card fleet-branch-card ${String(selectedBranchId) === String(res.id) ? 'active-branch-card' : ''}`}
                      onClick={() => setSelectedBranchId(selectedBranchId === res.id ? null : res.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="fleet-card-main">
                        <div className="inv-icon-box"><Store size={24} /></div>
                        <div className="inv-details">
                          <strong>{res.name}</strong>
                          <p className="text-muted">{res.location}</p>
                        </div>
                      </div>
                      <div className="fleet-card-footer">
                        <span className="branch-id-tag">ID: #{res.id}</span>
                        <div className="staff-count-badge">
                          <Users size={14} />
                          <span>{personnelCount} Personnel</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="view-header-row mt-4">
                <h2 className="view-title">
                  {selectedBranchId ? `Personnel assigned to: ${restaurantsList.find(r => String(r.id) === String(selectedBranchId))?.name || 'Branch'}` : 'All Human Infrastructure & Assignments'}
                </h2>
                {selectedBranchId && (
                  <button className="btn-secondary" style={{ padding: '4px 12px', fontSize: '12px' }} onClick={() => setSelectedBranchId(null)}>
                    View All Personnel
                  </button>
                )}
              </div>
              <div className="inventory-grid">
                {staffList.filter(emp => !selectedBranchId || String(emp.restaurant_id) === String(selectedBranchId)).map(emp => {
                  const restaurant = restaurantsList.find(r => String(r.id) === String(emp.restaurant_id));
                  return (
                    <div key={emp.id} className="inventory-card glass-panel animate-zoom-in staff-member-card">
                      <div className="inv-icon-box"><UserCircle size={24} color="var(--accent-color)" /></div>
                      <div className="inv-details">
                        <div className="staff-card-header">
                          <strong>{emp.name}</strong>
                          <span className={`role-badge ${emp.role}`}>{emp.role === 'admin' ? 'Admin' : 'Manager'}</span>
                        </div>
                        <p className="text-muted" style={{ fontSize: '12px' }}>
                          {restaurant ? `Branch: ${restaurant.name}` : 'Unassigned Branch'}
                        </p>

                        <div className="credential-copy-box mt-3">
                          <div className="cred-row">
                            <span className="cred-label">Login:</span>
                            <span className="cred-val">{emp.email}</span>
                            <button className="btn-copy-mini" title="Copy Email" onClick={() => handleCopy(emp.email, `${emp.id}-e`)}>
                              {copiedId === `${emp.id}-e` ? <CheckCircle size={14} color="#10b981" /> : <Copy size={14} />}
                            </button>
                          </div>
                          <div className="cred-row">
                            <span className="cred-label">Pass:</span>
                            <span className="cred-val">••••••••</span>
                            <button className="btn-copy-mini" title="Copy Password" onClick={() => handleCopy(emp.password, `${emp.id}-p`)}>
                              {copiedId === `${emp.id}-p` ? <CheckCircle size={14} color="#10b981" /> : <Copy size={14} />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {staffList.filter(emp => !selectedBranchId || String(emp.restaurant_id) === String(selectedBranchId)).length === 0 && (
                  <div className="empty-inventory full-width">
                    <Users size={40} />
                    <p>No personnel found for this branch.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {selectedOrder && (
        <div className="print-invoice" id="printable-invoice">
          <div className="invoice-header"><h2>AI RESTO</h2><p>Order Summary Invoice</p></div>
          <div className="invoice-meta"><p><strong>Table:</strong> {selectedOrder.tableNumber}</p><p><strong>Order:</strong> #{selectedOrder.id}</p><p><strong>Time:</strong> {new Date(selectedOrder.timestamp).toLocaleString()}</p></div>
          <table className="invoice-table">
            <thead><tr><th>Item</th><th>Qty</th><th>Price</th></tr></thead>
            <tbody>{(Array.isArray(selectedOrder.items) ? selectedOrder.items : []).map((item, i) => (<tr key={i}><td>{item.name || item}</td><td>{item.qty || 1}</td><td>₹{(item.price || 0) * (item.qty || 1)}</td></tr>))}</tbody>
          </table>
          <div className="invoice-footer"><h3>Total: ₹{selectedOrder.total}</h3></div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
