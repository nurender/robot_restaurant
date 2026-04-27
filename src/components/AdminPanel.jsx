import React, { useState, useEffect } from 'react';
import {
  Search,
  Settings,
  ChefHat,
  Calendar,
  DollarSign,
  TrendingUp,
  ListTodo,
  UtensilsCrossed,
  Clock,
  Printer,
  CheckCircle,
  Plus,
  Trash2,
  Edit2,
  Users,
  Store,
  Bot,
  Filter,
  Eye,
  EyeOff,
  LogOut,
  Image as ImageIcon,
  AlertCircle,
  Check,
  Sparkles
} from 'lucide-react';
import { io } from 'socket.io-client';
import axios from 'axios';
import './AdminPanel.css';
import PromptManager from './PromptManager';
import AdminSidebar from './AdminSidebar';
import { API_URL } from '../config';

const socket = io(API_URL, { autoConnect: true });

const AdminPanel = () => {
  const [adminUser, setAdminUser] = useState(JSON.parse(localStorage.getItem('admin_token')) || {});
  const [activeTab, setActiveTab] = useState('dashboard');
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [categories, setCategories] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [restaurantsList, setRestaurantsList] = useState([]);
  
  // UI States
  const [showMenuPopup, setShowMenuPopup] = useState(false);
  const [editingDishId, setEditingDishId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formError, setFormError] = useState('');
  const [newDish, setNewDish] = useState({
    name: '',
    category: '',
    price: '',
    description: '',
    image_url: '',
    is_active: true
  });

  // Category Management
  const [showCatPopup, setShowCatPopup] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  // Staff & Node Management
  const [showStaffPopup, setShowStaffPopup] = useState(false);
  const [showNodePopup, setShowNodePopup] = useState(false);
  const [newStaff, setNewStaff] = useState({ name: '', email: '', password: '', role: 'admin', restaurant_id: adminUser.restaurant_id });
  const [newNode, setNewNode] = useState({ name: '', location: '' });

  const formatDate = (dateStr) => {
    try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return "Just now";
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) { return "Recent"; }
  };

  useEffect(() => {
    if (!adminUser.id) {
        window.location.href = '/admin/login';
        return;
    }
    fetchData();
    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));
    socket.on('new_order', (order) => {
        setOrders(prev => [order, ...prev]);
        new Audio('/order-alert.mp3').play().catch(() => {});
    });
    return () => {
        socket.off('connect');
        socket.off('disconnect');
        socket.off('new_order');
    };
  }, []);

  const fetchData = async () => {
    try {
        const auth = { params: { restaurant_id: adminUser.restaurant_id } };
        const [ordersRes, menuRes, catRes, staffRes, restRes] = await Promise.all([
            axios.get(`${API_URL}/api/orders`, auth),
            axios.get(`${API_URL}/api/menu`, auth),
            axios.get(`${API_URL}/api/menu/categories`, auth),
            axios.get(`${API_URL}/api/users`, auth),
            axios.get(`${API_URL}/api/restaurants`)
        ]);
        setOrders(ordersRes.data.data || []);
        setMenuItems(menuRes.data.data || []);
        setCategories(catRes.data.data || []);
        setStaffList(staffRes.data.data || []);
        setRestaurantsList(restRes.data.data || []);
    } catch (e) { console.error("Fetch Error:", e); }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    window.location.href = '/admin/login';
  };

  const updateOrderStatus = async (id, status) => {
    try {
        await axios.put(`${API_URL}/api/orders/${id}/status`, { status });
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    } catch (e) { console.error(e); }
  };

  const validateForm = () => {
    if (!newDish.name) return "Dish name is required";
    if (!newDish.category) return "Please select a category";
    if (!newDish.price || isNaN(newDish.price)) return "Valid price is required";
    if (!newDish.description) return "Description is required";
    return null;
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('file', file);
    
    setUploading(true);
    try {
      const res = await axios.post(`${API_URL}/api/upload`, formData);
      setNewDish({ ...newDish, image_url: res.data.url });
    } catch (err) {
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveDish = async () => {
    const error = validateForm();
    if (error) {
      setFormError(error);
      return;
    }
    setFormError('');

    try {
      if (editingDishId) {
        await axios.put(`${API_URL}/api/menu/${editingDishId}`, newDish);
      } else {
        await axios.post(`${API_URL}/api/menu`, { ...newDish, restaurant_id: adminUser.restaurant_id });
      }
      setShowMenuPopup(false);
      fetchData();
    } catch (e) { console.error(e); }
  };

  const deleteDish = async (id) => {
    if (!window.confirm("Are you sure you want to delete this neural dish?")) return;
    try {
      await axios.delete(`${API_URL}/api/menu/${id}`);
      fetchData();
    } catch (e) { console.error(e); }
  };

  const handleAddCategory = async () => {
    if (!newCatName) return;
    try {
      await axios.post(`${API_URL}/api/menu/categories`, { name: newCatName, restaurant_id: adminUser.restaurant_id });
      setNewCatName('');
      setShowCatPopup(false);
      fetchData();
    } catch (e) { console.error(e); }
  };
  const handleAddStaff = async (e) => {
    e.preventDefault();
    try {
        await axios.post(`${API_URL}/api/users`, newStaff);
        setShowStaffPopup(false);
        setNewStaff({ name: '', email: '', password: '', role: 'admin', restaurant_id: adminUser.restaurant_id });
        fetchData();
    } catch (e) { console.error(e); }
  };

  const handleAddNode = async (e) => {
    e.preventDefault();
    try {
        await axios.post(`${API_URL}/api/restaurants`, newNode);
        setShowNodePopup(false);
        setNewNode({ name: '', location: '' });
        fetchData();
    } catch (e) { console.error(e); }
  };

  return (
    <div className="admin-layout animate-fade-in">
      <style>{`
        .admin-main, .view-container, .dashboard-view, .orders-view, .menu-view, .team-view {
          background: #050508 !important;
          color: #ffffff !important;
        }
        h1, h2, h3, h4, h5, h6, .view-title, strong, .profile-name, .profile-role {
          color: #ffffff !important;
        }
        p, span, .text-muted, label {
          color: #94a3b8 !important;
        }
        .pulse-item, .glass-panel, .inventory-card, .stat-card-modern, .order-card {
          background: #12121a !important;
          border: 1px solid rgba(255, 255, 255, 0.05) !important;
        }
        .filter-input {
          background: rgba(255, 255, 255, 0.03) !important;
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
          color: white !important;
        }
        .empty-state p, .text-accent {
          color: #00d2ff !important;
        }
        .main-header {
          background: rgba(10, 10, 15, 0.8) !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
        }
      `}</style>
      <AdminSidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        adminUser={adminUser} 
        onLogout={handleLogout} 
      />

      <main className="admin-main">
        <header className="main-header">
          <div className="header-search">
            <Search size={20} color="var(--text-muted)" />
            <input type="text" placeholder="Neural Search Engine..." />
          </div>
          <div className="header-profile-premium">
            <div className="profile-details-group">
                <span className="profile-name">{adminUser.name}</span>
                <span className="profile-role">{adminUser.role === 'super_admin' ? 'Master Intelligence' : 'Branch Node'}</span>
            </div>
            <div className="profile-avatar-glow">{adminUser.name?.charAt(0)}</div>
          </div>
        </header>

        <div className="content-scrollable scrollbar-hidden">
          {activeTab === 'dashboard' && (
            <div className="view-container animate-slide-up">
              <div className="view-header-row">
                <div className="header-left">
                  <h1 className="view-title">Command Center</h1>
                  <p className="text-muted">Real-time neural monitoring active for {adminUser.role === 'super_admin' ? 'Global Network' : 'Branch Node'}.</p>
                </div>
                <div className="header-date">
                  <Calendar size={18} />
                  <span>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                </div>
              </div>

              <div className="stats-grid-modern">
                <div className="stat-card-modern purple">
                  <div className="stat-icon-main"><DollarSign size={32} /></div>
                  <div className="stat-body">
                    <span className="stat-label">Neural Revenue</span>
                    <h3>₹{orders.reduce((acc, curr) => acc + (Number(curr.total) || 0), 0).toLocaleString()}</h3>
                    <span className="trend up"><TrendingUp size={14} /> +12.5%</span>
                  </div>
                </div>
                <div className="stat-card-modern blue">
                  <div className="stat-icon-main"><ListTodo size={32} /></div>
                  <div className="stat-body">
                    <span className="stat-label">Total Syncs</span>
                    <h3>{orders.length}</h3>
                    <span className="trend up"><TrendingUp size={14} /> +8.2%</span>
                  </div>
                </div>
                <div className="stat-card-modern green">
                  <div className="stat-icon-main"><ChefHat size={32} /></div>
                  <div className="stat-body">
                    <span className="stat-label">Menu Stability</span>
                    <h3>{menuItems.length} items</h3>
                    <span className="trend">Optimized</span>
                  </div>
                </div>
              </div>

              <div className="inventory-grid mt-4">
                <div className="glass-panel p-8">
                  <div className="view-header-row mb-6">
                    <h3 className="font-bold text-xl flex items-center gap-3"><Clock size={20} className="text-accent"/> Recent Pulse</h3>
                    <button className="btn-text" onClick={() => setActiveTab('orders')}>Explore Hub</button>
                  </div>
                  <div className="pulse-container flex flex-col gap-4">
                    {orders.slice(0, 5).map(order => (
                      <div key={order.id} className="pulse-item flex items-center justify-between p-4 bg-white/[0.03] border border-white/[0.05] rounded-2xl hover:bg-white/[0.06] transition-all">
                        <div className="flex items-center gap-4">
                          <div className={`w-3 h-3 rounded-full ${order.status === 'completed' ? 'bg-green-500' : 'bg-amber-500 animate-pulse'}`}></div>
                          <div>
                            <p className="font-bold text-white">Table {order.table_number || order.tableNumber}</p>
                            <span className="text-xs text-muted">Packet #{order.id}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-accent">₹{order.total}</p>
                          <span className="text-xs text-muted">{formatDate(order.created_at || order.timestamp)}</span>
                        </div>
                      </div>
                    ))}
                    {orders.length === 0 && <p className="text-muted text-center py-8">No neural activity detected.</p>}
                  </div>
                </div>

                <div className="glass-panel p-8">
                    <div className="view-header-row mb-6">
                        <h3 className="font-bold text-xl flex items-center gap-3"><Sparkles size={20} className="text-accent"/> High Affinity Items</h3>
                        <button className="btn-text" onClick={() => setActiveTab('menu')}>Modify Inventory</button>
                    </div>
                    <div className="pulse-container flex flex-col gap-4">
                        {menuItems.slice(0, 5).map(item => (
                            <div key={item.id} className="pulse-item flex items-center gap-4 p-3 bg-white/[0.03] border border-white/[0.05] rounded-2xl hover:bg-white/[0.06] transition-all">
                                <img 
                                    src={item.image_url ? (item.image_url.startsWith('http') ? item.image_url : `${API_URL}${item.image_url}`) : '/dish-placeholder.png'} 
                                    className="w-14 h-14 rounded-xl object-cover shadow-lg border border-white/10" 
                                    alt={item.name} 
                                />
                                <div className="flex-1">
                                    <p className="font-bold text-white text-sm">{item.name}</p>
                                    <span className="text-xs text-muted">{item.category}</span>
                                </div>
                                <div className="font-bold text-accent">₹{item.price}</div>
                            </div>
                        ))}
                    </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="view-container animate-slide-up">
              <div className="view-header-row">
                <div className="header-left">
                  <h1 className="view-title">Orders Hub</h1>
                  <p className="text-muted">Real-time neural order synchronization across the network.</p>
                </div>
                <div className="orders-filter-bar shadow-premium">
                    <div className="filter-group">
                        <label><Filter size={14} /> Filter Status</label>
                        <select className="filter-input" onChange={(e) => {/* Filter logic here if needed */}}>
                            <option value="all">All Syncs</option>
                            <option value="pending">Waiting</option>
                            <option value="preparing">In Progress</option>
                            <option value="completed">Success</option>
                        </select>
                    </div>
                    <div className="filter-stats">
                        Total Pending: <strong>{orders.filter(o => o.status === 'pending').length}</strong>
                    </div>
                </div>
              </div>

              <div className="orders-grid-premium">
                {orders.map(order => (
                  <div key={order.id} className={`p-order-card ${order.status}`}>
                    <div className="p-card-header">
                      <div className="p-header-left">
                        <div className="table-badge shadow-lg">Table {order.table_number || order.tableNumber}</div>
                        <span className={`status-pill ${order.status}`}>
                          <div className="status-dot"></div>
                          {order.status}
                        </span>
                      </div>
                      <div className="p-time">
                        <Clock size={14} />
                        {formatDate(order.created_at || order.timestamp)}
                      </div>
                    </div>

                    <div className="p-card-body scrollbar-hidden">
                      {(order.items || []).map((item, idx) => (
                        <div key={idx} className="p-item-row">
                          <div className="p-qty">{item.qty || 1}</div>
                          <div className="p-item-info">
                            <span className="p-name">{item.name}</span>
                            <span className="p-item-desc text-xs">Neural ID: #{item.menu_id || item.id}</span>
                          </div>
                          <div className="p-price">₹{item.price * (item.qty || 1)}</div>
                        </div>
                      ))}
                    </div>

                    <div className="p-card-footer">
                      <div className="p-total">
                        <span className="total-label">Sync Amount</span>
                        <span className="total-val">₹{order.total}</span>
                      </div>
                      <div className="p-actions">
                        {order.status === 'pending' && (
                          <button className="btn-action-success animate-pulse-glow" onClick={() => updateOrderStatus(order.id, 'preparing')}>
                            <Check size={18} />
                            Commit Sync
                          </button>
                        )}
                        {order.status === 'preparing' && (
                          <button className="btn-action-success" onClick={() => updateOrderStatus(order.id, 'completed')}>
                            <Check size={18} />
                            Finalize Sync
                          </button>
                        )}
                        <button className="btn-action-icon" title="Print Invoice"><Printer size={18} /></button>
                      </div>
                    </div>
                  </div>
                ))}
                {orders.length === 0 && (
                  <div className="full-width p-20 text-center glass-panel">
                    <AlertCircle size={48} className="mx-auto mb-4 text-muted" />
                    <h3 className="text-xl font-bold">No Syncs Found</h3>
                    <p className="text-muted">Wait for neural input from the kiosk.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'menu' && (
            <div className="view-container animate-slide-up">
              <div className="view-header-row">
                <div className="header-left">
                  <h1 className="view-title">Neural Inventory</h1>
                  <p className="text-muted">Manage your digital menu items and system parameters.</p>
                </div>
                <div className="flex gap-4">
                    <button className="btn-secondary" onClick={() => setShowCatPopup(true)}>
                        <Settings size={20} />
                        <span>Manage Categories</span>
                    </button>
                    <button className="btn-primary" onClick={() => {
                        setNewDish({ name: '', category: '', price: '', description: '', image_url: '', is_active: true });
                        setEditingDishId(null);
                        setFormError('');
                        setShowMenuPopup(true);
                    }}>
                        <Plus size={20} />
                        <span>Add New Dish</span>
                    </button>
                </div>
              </div>

              <div className="inventory-toolbar-premium shadow-premium">
                <div className="search-box-integrated">
                    <Search size={18} className="search-icon-inner" />
                    <input type="text" placeholder="Filter neural items..." />
                </div>
                <div className="inventory-meta-badge">
                    <span>Active coverage:</span>
                    <strong>{menuItems.filter(i => i.is_active).length}</strong>
                    <span>/ {menuItems.length} items</span>
                </div>
              </div>

              <div className="inventory-grid">
                {menuItems.map(item => (
                  <div key={item.id} className="inventory-card glass-panel dish-card-premium shadow-premium">
                    <div className="dish-banner" style={{ backgroundImage: `url(${item.image_url ? (item.image_url.startsWith('http') ? item.image_url : `${API_URL}${item.image_url}`) : '/dish-placeholder.png'})` }}>
                    </div>
                    <div className="inv-details">
                      <div className="inv-main">
                        <div className="flex justify-between items-start">
                            <strong className="text-lg">{item.name}</strong>
                            <span className="inv-cat-tag shadow-sm">{item.category}</span>
                        </div>
                      </div>
                      <p className="inv-desc text-muted truncate-2-lines mt-2">{item.description}</p>
                      <div className="inv-meta">
                        <div className="inv-price text-xl">₹{item.price}</div>
                        <div className={`status-pill ${item.is_active ? 'active' : 'inactive'}`}>
                            <div className="status-dot"></div>
                            {item.is_active ? 'Active' : 'Hidden'}
                        </div>
                      </div>
                    </div>
                    <div className="inv-actions">
                      <button className="inv-btn-edit" onClick={() => {
                        setNewDish(item);
                        setEditingDishId(item.id);
                        setFormError('');
                        setShowMenuPopup(true);
                      }}><Edit2 size={16} /></button>
                      <button className="inv-btn-delete" onClick={() => deleteDish(item.id)}><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'staff' && adminUser.role === 'super_admin' && (
            <div className="view-container animate-slide-up">
              <div className="view-header-row">
                <div className="header-left">
                  <h1 className="view-title">Team Hierarchy</h1>
                  <p className="text-muted">Manage system access and neural permissions across nodes.</p>
                </div>
                <button className="btn-primary" onClick={() => setShowStaffPopup(true)}>
                    <Plus size={20} />
                    <span>Recruit Member</span>
                </button>
              </div>
              <div className="inventory-grid">
                {staffList.map(staff => (
                    <div key={staff.id} className="inventory-card glass-panel shadow-premium">
                        <div className="inv-icon-box shadow-lg">
                            <Users size={28} />
                        </div>
                        <div className="inv-details">
                            <div className="staff-card-header mb-2">
                                <span className={`role-badge ${staff.role} shadow-sm`}>{staff.role.replace('_', ' ')}</span>
                            </div>
                            <div className="inv-main">
                                <strong className="text-lg">{staff.name}</strong>
                                <span className="text-sm text-muted block mt-1">{staff.email}</span>
                            </div>
                        </div>
                        <div className="inv-actions">
                            <button className="inv-btn-edit"><Edit2 size={16} /></button>
                            <button className="inv-btn-delete"><Trash2 size={16} /></button>
                        </div>
                    </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'restaurants' && adminUser.role === 'super_admin' && (
            <div className="view-container animate-slide-up">
              <div className="view-header-row">
                <div className="header-left">
                  <h1 className="view-title">Node Network</h1>
                  <p className="text-muted">Overview of all active neural nodes in the cluster.</p>
                </div>
                <button className="btn-primary" onClick={() => setShowNodePopup(true)}>
                    <Plus size={20} />
                    <span>Deploy New Node</span>
                </button>
              </div>
              <div className="inventory-grid">
                {restaurantsList.map(res => (
                  <div key={res.id} className="inventory-card glass-panel fleet-branch-card shadow-premium clickable-card">
                    <div className="fleet-card-main">
                        <div className="inv-icon-box shadow-lg">
                            <Store size={28} />
                        </div>
                        <div className="inv-details">
                          <div className="inv-main">
                            <strong className="text-lg">{res.name}</strong>
                            <p className="text-sm text-muted mt-1 flex items-center gap-2">
                                <TrendingUp size={14} className="text-green-500" />
                                {res.location}
                            </p>
                          </div>
                        </div>
                    </div>
                    <div className="fleet-card-footer">
                        <span className="branch-id-tag">NODE ID: {res.id.toString().padStart(3, '0')}</span>
                        <div className="staff-count-badge">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            <span>Active Sync</span>
                        </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'ai_prompt' && adminUser.role === 'super_admin' && (
            <PromptManager />
          )}
        </div>
      </main>

      {/* Menu Modal */}
      {showMenuPopup && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel animate-slide-down menu-add-card shadow-2xl">
            <div className="card-header-accent">
                <div className="brand-logo shadow-lg"><UtensilsCrossed size={20} color="white" /></div>
                <h3>{editingDishId ? 'Modify Neural Dish' : 'Deploy New Neural Dish'}</h3>
                <button className="ml-auto text-muted hover:text-white" onClick={() => setShowMenuPopup(false)}>✕</button>
            </div>
            
            {formError && (
              <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-xl mb-6 flex items-center gap-3 text-red-500 animate-shake">
                <AlertCircle size={20} />
                <span className="font-bold">{formError}</span>
              </div>
            )}

            <div className="modern-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Identified Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Neural Masala Chai"
                    value={newDish.name} 
                    onChange={(e) => setNewDish({...newDish, name: e.target.value})} 
                  />
                </div>
                <div className="form-group">
                  <label>Cluster Category</label>
                  <select 
                    className="modern-select"
                    value={newDish.category} 
                    onChange={(e) => setNewDish({...newDish, category: e.target.value})}
                  >
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Sync price (₹)</label>
                  <input 
                    type="number" 
                    placeholder="0.00"
                    value={newDish.price} 
                    onChange={(e) => setNewDish({...newDish, price: e.target.value})} 
                  />
                </div>
                <div className="form-group">
                  <label>Visual Hash (Image)</label>
                  <div className="flex gap-4">
                    <div className="relative flex-1">
                        <input 
                            type="text" 
                            placeholder="URL or Upload..."
                            value={newDish.image_url} 
                            onChange={(e) => setNewDish({...newDish, image_url: e.target.value})} 
                            className="w-full"
                        />
                    </div>
                    <label className="btn-secondary cursor-pointer flex items-center justify-center p-0 w-14 h-14">
                        {uploading ? <div className="animate-spin h-5 w-5 border-2 border-accent border-t-transparent rounded-full"></div> : <ImageIcon size={20} />}
                        <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" />
                    </label>
                  </div>
                </div>
                <div className="form-group full-width">
                  <label>Neural context (Description)</label>
                  <textarea 
                    placeholder="Explain the essence of this dish to the AI..."
                    value={newDish.description} 
                    onChange={(e) => setNewDish({...newDish, description: e.target.value})} 
                  />
                </div>
              </div>
              <div className="form-footer mt-10">
                <button className="btn-secondary px-10" onClick={() => setShowMenuPopup(false)}>Abort</button>
                <button className="btn-primary flex-1 flex items-center justify-center gap-3" onClick={handleSaveDish} disabled={uploading}>
                  <CheckCircle size={20} />
                  <span>{editingDishId ? 'Commit Update' : 'Finalize Deployment'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCatPopup && (
          <div className="modal-overlay">
              <div className="modal-content glass-panel animate-slide-down p-10 max-w-md shadow-2xl">
                  <h3 className="text-2xl font-bold mb-6">Neural Categories</h3>
                  <div className="flex flex-col gap-6">
                      <div className="flex gap-4">
                          <input 
                            type="text" 
                            className="flex-1 bg-black/20 border-none p-4 rounded-xl"
                            placeholder="New cluster name..."
                            value={newCatName}
                            onChange={(e) => setNewCatName(e.target.value)}
                          />
                          <button className="btn-primary p-4 rounded-xl" onClick={handleAddCategory}>
                              <Plus size={24} />
                          </button>
                      </div>
                      <div className="flex flex-wrap gap-3">
                          {categories.map(cat => (
                              <div key={cat.id} className="bg-accent/10 text-accent px-4 py-2 rounded-full flex items-center gap-3 font-bold border border-accent/20">
                                  {cat.name}
                                  <button className="hover:text-red-500" onClick={async () => {
                                      if(window.confirm("Delete category?")) {
                                          await axios.delete(`${API_URL}/api/menu/categories/${cat.id}`);
                                          fetchData();
                                      }
                                  }}>✕</button>
                              </div>
                          ))}
                      </div>
                      <button className="btn-secondary mt-4" onClick={() => setShowCatPopup(false)}>Close</button>
                  </div>
              </div>
          </div>
      )}
       {/* Staff Modal */}
       {showStaffPopup && (
         <div className="modal-overlay">
           <div className="modal-content glass-panel animate-slide-down p-10 max-w-lg shadow-2xl">
             <h3 className="text-2xl font-bold mb-6 text-white">Recruit New Member</h3>
             <form onSubmit={handleAddStaff} className="modern-form flex flex-col gap-5">
               <div className="form-group">
                 <label>Name</label>
                 <input type="text" placeholder="John Doe" value={newStaff.name} onChange={(e) => setNewStaff({...newStaff, name: e.target.value})} required />
               </div>
               <div className="form-group">
                 <label>Email</label>
                 <input type="email" placeholder="john@resto.com" value={newStaff.email} onChange={(e) => setNewStaff({...newStaff, email: e.target.value})} required />
               </div>
               <div className="form-group">
                 <label>Password</label>
                 <input type="password" placeholder="••••••••" value={newStaff.password} onChange={(e) => setNewStaff({...newStaff, password: e.target.value})} required />
               </div>
               <div className="form-group">
                 <label>Role</label>
                 <select className="modern-select" value={newStaff.role} onChange={(e) => setNewStaff({...newStaff, role: e.target.value})}>
                   <option value="admin">Admin</option>
                   <option value="super_admin">Super Admin</option>
                 </select>
               </div>
               <div className="flex gap-4 mt-6">
                 <button type="button" className="btn-secondary flex-1" onClick={() => setShowStaffPopup(false)}>Cancel</button>
                 <button type="submit" className="btn-primary flex-1">Finalize Recruit</button>
               </div>
             </form>
           </div>
         </div>
       )}

       {/* Node Modal */}
       {showNodePopup && (
         <div className="modal-overlay">
           <div className="modal-content glass-panel animate-slide-down p-10 max-w-lg shadow-2xl">
             <h3 className="text-2xl font-bold mb-6 text-white">Deploy New Node</h3>
             <form onSubmit={handleAddNode} className="modern-form flex flex-col gap-5">
               <div className="form-group">
                 <label>Node Name</label>
                 <input type="text" placeholder="Robo Branch 1" value={newNode.name} onChange={(e) => setNewNode({...newNode, name: e.target.value})} required />
               </div>
               <div className="form-group">
                 <label>Location</label>
                 <input type="text" placeholder="Jaipur, Rajasthan" value={newNode.location} onChange={(e) => setNewNode({...newNode, location: e.target.value})} required />
               </div>
               <div className="flex gap-4 mt-6">
                 <button type="button" className="btn-secondary flex-1" onClick={() => setShowNodePopup(false)}>Cancel</button>
                 <button type="submit" className="btn-primary flex-1">Deploy Node</button>
               </div>
             </form>
           </div>
         </div>
       )}
    </div>
  );
};

export default AdminPanel;
