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
  Sparkles,
  ChevronDown,
  ChevronRight,
  Package,
  BarChart2
} from 'lucide-react';
import { io } from 'socket.io-client';
import axios from 'axios';
import './AdminPanel.css';
import PromptManager from './PromptManager';
import AdminSidebar from './AdminSidebar';
import ThemeToggle from './ThemeToggle';
import SmartInventory from './SmartInventory';
import { API_URL } from '../config';

const socket = io(API_URL, { autoConnect: true });

const AdminPanel = () => {
  const [adminUser, setAdminUser] = useState(JSON.parse(localStorage.getItem('admin_token')) || {});
  const [activeTab, setActiveTab] = useState(localStorage.getItem('admin_active_tab') || 'dashboard');
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    localStorage.setItem('admin_active_tab', tab);
  };
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [categories, setCategories] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [restaurantsList, setRestaurantsList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [restaurantTables, setRestaurantTables] = useState([
    { table: 'Table 1', token: 'T1-R4-SECRET' },
    { table: 'Table 2', token: 'T2-R4-SECRET' },
    { table: 'Table 3', token: 'T3-R4-SECRET' },
    { table: 'Table 4', token: 'T4-R4-SECRET' },
    { table: 'Table 5', token: 'T5-R4-SECRET' },
    { table: 'Table 6', token: 'T6-R4-SECRET' },
  ]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [collapsedCats, setCollapsedCats] = useState(new Set());

  // UI States
  const [showMenuPopup, setShowMenuPopup] = useState(false);
  const [editingDishId, setEditingDishId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formError, setFormError] = useState('');
  const [newDish, setNewDish] = useState({
    name: '',
    category: '',
    price: '',
    offer_price: '',
    description: '',
    image_url: '',
    is_active: true,
    veg_type: 'veg',
    prep_time: '',
    is_featured: false,
    variants: [],
    addons: []
  });

  // Category Management
  const [showCatPopup, setShowCatPopup] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  const [showStaffPopup, setShowStaffPopup] = useState(false);
  const [showNodePopup, setShowNodePopup] = useState(false);
  const [newStaff, setNewStaff] = useState({ name: '', email: '', password: '', role: 'admin', restaurant_id: adminUser.restaurant_id });
  const [newNode, setNewNode] = useState({ name: '', location: '' });

  // AI Menu Import States
  const [isImporting, setIsImporting] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showImportReview, setShowImportReview] = useState(false);

  const formatDate = (dateStr) => {
    try {
      const date = new Date(isNaN(dateStr) ? dateStr : Number(dateStr));
      if (isNaN(date.getTime())) return "Just now";
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) { return "Recent"; }
  };

  const safeGetISODate = (order) => {
    try {
      const val = order.created_at || order.timestamp;
      if (!val) return "";
      const d = new Date(isNaN(val) ? val : Number(val));
      if (isNaN(d.getTime())) return "";
      return d.toISOString().split('T')[0];
    } catch (e) {
      return "";
    }
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
      new Audio('/order-alert.mp3').play().catch(() => { });
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
      const [ordersRes, menuRes, catRes, staffRes, restRes, tablesRes] = await Promise.all([
        axios.get(`${API_URL}/api/orders`, auth),
        axios.get(`${API_URL}/api/menu`, auth),
        axios.get(`${API_URL}/api/menu/categories`, auth),
        axios.get(`${API_URL}/api/users`, auth),
        axios.get(`${API_URL}/api/restaurants`),
        axios.get(`${API_URL}/api/tables`, auth)
      ]);
      setOrders(ordersRes.data.data || []);
      setMenuItems(menuRes.data.data || []);
      setCategories(catRes.data.data || []);
      setStaffList(staffRes.data.data || []);
      setRestaurantsList(restRes.data.data || []);
      if (tablesRes.data && tablesRes.data.length > 0) {
        setRestaurantTables(tablesRes.data.map(t => ({ table: `Table ${t.table_number}`, token: t.secret_token })));
      }
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
  const handlePrintBill = (order) => {
    const printWindow = window.open('', '_blank');
    const itemsHtml = (order.items || []).map(item => `
      <tr>
        <td>${item.name}</td>
        <td style="text-align: center;">${item.qty || 1}</td>
        <td style="text-align: right;">₹${item.price * (item.qty || 1)}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - Table ${order.table_number || order.tableNumber}</title>
          <style>
            body { font-family: 'Courier New', monospace; padding: 20px; color: #000; }
            .header { text-align: center; border-bottom: 1px dashed #000; padding-bottom: 10px; margin-bottom: 10px; }
            .title { font-size: 18px; font-weight: bold; margin: 0; }
            table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            th, td { padding: 5px; font-size: 14px; }
            .total { font-size: 16px; font-weight: bold; border-top: 1px dashed #000; padding-top: 10px; text-align: right; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; border-top: 1px dashed #000; padding-top: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <p class="title">AI RESTO</p>
            <p>Table: ${order.table_number || order.tableNumber}</p>
            <p>Order ID: #${order.id}</p>
          </div>
          <table>
            <thead>
              <tr style="border-bottom: 1px dashed #000;">
                <th style="text-align: left;">Item</th>
                <th>Qty</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          <div class="total">Grand Total: ₹${order.total}</div>
          <div class="footer">
            <p>Thank you for dining with us!</p>
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.close();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
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

  const toggleDishActive = async (item) => {
    try {
      await axios.put(`${API_URL}/api/menu/${item.id}`, { ...item, is_active: !item.is_active });
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
        /* smooth transitions for all themed elements */
        .admin-layout, .admin-main, .admin-sidebar,
        .glass-panel, .inventory-card, .stat-card-modern,
        .main-header, .modal-content, input, select, textarea,
        .pulse-item, .nav-item, .view-container {
          transition: background 0.25s ease, color 0.25s ease,
                      border-color 0.25s ease, box-shadow 0.25s ease !important;
        }
        /* Ensure view areas use theme tokens */
        .content-scrollable { background: var(--bg-deep) !important; }
        .view-title   { color: var(--text-main)  !important; }
        .text-muted   { color: var(--text-muted) !important; }
        .glass-panel  { background: var(--card-bg) !important; border-color: var(--card-border) !important; }
        .modal-content{ background: var(--modal-bg) !important; }
        /* Accent stays purple */
        .text-accent, .inv-price { color: var(--accent-primary) !important; }
        .btn-primary {
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary)) !important;
          box-shadow: 0 4px 20px var(--accent-glow) !important;
          color: #fff !important;
        }
        /* Input theming */
        input, textarea, select {
          background: var(--input-bg) !important;
          border-color: var(--input-border) !important;
          color: var(--input-text) !important;
        }
        /* Status pills */
        .status-pill.active   { background: var(--success-bg);  color: var(--success);  border: 1px solid var(--success); }
        .status-pill.inactive { background: var(--bg-tertiary); color: var(--text-muted); }
        /* Role badges */
        .role-badge.super_admin { background: var(--accent-light); color: var(--accent-secondary); }
        .role-badge.admin       { background: rgba(59,130,246,0.1); color: #60a5fa; }
        /* Filter dropdown */
        .filter-input {
          background: var(--input-bg) !important;
          border: 1px solid var(--input-border) !important;
          color: var(--text-main) !important;
        }
      `}</style>
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
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
            <ThemeToggle />
            <div className="profile-details-group">
              <span className="profile-name">{adminUser.name}</span>
              <span className="profile-role">{adminUser.role === 'super_admin' ? 'Master Intelligence' : 'Branch Node'}</span>
            </div>
            <div className="profile-avatar-glow">{adminUser.name?.charAt(0)}</div>
          </div>
        </header>

        <div className="content-scrollable scrollbar-hidden">
          {activeTab === 'dashboard' && (
            <div className="view-container animate-slide-up" style={{ padding: '32px', background: 'var(--bg-deep)', minHeight: '100vh' }}>
              <div className="view-header-row mb-8 flex justify-between items-center">
                <div className="header-left">
                  <h1 className="view-title" style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-1px' }}>AI RESTO Command</h1>
                  <p className="text-muted" style={{ fontSize: '15px', marginTop: '4px' }}>Executive SaaS Intelligence & Network Synchronization</p>
                </div>
                <div className="header-date flex items-center gap-2" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', padding: '10px 18px', borderRadius: '14px', boxShadow: 'var(--shadow-sm)' }}>
                  <Calendar size={18} className="text-accent" />
                  <span style={{ fontWeight: '600', fontSize: '14px' }}>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                </div>
              </div>

              {/* 1. KPI Cards Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                {[
                  { title: 'Total Revenue', value: `₹${orders.reduce((acc, curr) => acc + (Number(curr.total) || 0), 0).toLocaleString()}`, growth: '+14.2%', icon: DollarSign, color: 'purple' },
                  { title: 'Total Orders', value: orders.length, growth: '+8.5%', icon: ListTodo, color: 'blue' },
                  { title: 'Pending Syncs', value: orders.filter(o => o.status === 'pending').length, growth: 'Awaiting action', icon: Clock, color: 'orange' },
                  { title: 'Success Deliveries', value: orders.filter(o => o.status === 'completed').length, growth: 'Optimal speed', icon: CheckCircle, color: 'green' },
                  { title: 'Avg Order Val', value: `₹${orders.length ? Math.round(orders.reduce((acc, curr) => acc + (Number(curr.total) || 0), 0) / orders.length) : 0}`, growth: '+5.2%', icon: ChefHat, color: 'purple' },
                  { title: 'Network Rating', value: '4.85 ★', growth: 'Elite standard', icon: Sparkles, color: 'orange' }
                ].map((stat, i) => (
                  <div key={i} className="stat-card-modern" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '20px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px', boxShadow: 'var(--shadow-sm)', transition: 'all 0.3s ease', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>{stat.title}</span>
                      <stat.icon size={20} className={stat.color === 'purple' ? 'text-accent' : stat.color === 'orange' ? 'text-warning' : 'text-success'} />
                    </div>
                    <h3 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', margin: '4px 0 0 0' }}>{stat.value}</h3>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: stat.growth.startsWith('+') ? 'var(--success)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {stat.growth}
                    </span>
                  </div>
                ))}
              </div>

              {/* 2. Analytics Charts */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                <div className="glass-panel" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '24px', padding: '28px', boxShadow: 'var(--shadow-md)' }}>
                  <h4 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}><TrendingUp className="text-accent" /> Revenue Velocity</h4>
                  <div style={{ height: '180px', position: 'relative' }}>
                    <svg className="w-full h-full" viewBox="0 0 500 200" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path d="M 40,160 Q 120,40 200,100 T 360,60 T 460,20 L 460,160 L 40,160 Z" fill="url(#revGrad)" />
                      <path d="M 40,160 Q 120,40 200,100 T 360,60 T 460,20" fill="none" stroke="#7c3aed" strokeWidth="4" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>

                <div className="glass-panel" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '24px', padding: '28px', boxShadow: 'var(--shadow-md)' }}>
                  <h4 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}><ListTodo className="text-accent" /> Orders Trend</h4>
                  <div style={{ height: '180px', display: 'flex', alignItems: 'flex-end', gap: '12px', padding: '10px' }}>
                    {[20, 45, 30, 65, 85, 40, 55].map((val, idx) => (
                      <div key={idx} style={{ flex: 1, height: `${val}%`, background: 'var(--accent-primary)', borderRadius: '6px 6px 2px 2px' }} />
                    ))}
                  </div>
                </div>

                <div className="glass-panel" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '24px', padding: '28px', boxShadow: 'var(--shadow-md)' }}>
                  <h4 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}><Sparkles className="text-accent" /> Growth Allocation</h4>
                  <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: '120px', height: '120px', borderRadius: '50%', border: '16px solid var(--accent-primary)', borderRightColor: 'var(--bg-deep)', transform: 'rotate(45deg)' }} />
                  </div>
                </div>
              </div>

              {/* Recent Orders & Top Selling */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '32px' }}>
                <div className="lg:col-span-2 glass-panel" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '24px', padding: '28px', boxShadow: 'var(--shadow-md)', overflow: 'hidden' }}>
                  <h4 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '24px' }}>Live Order Matrix</h4>
                  <div className="overflow-x-auto">
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--card-border)', color: 'var(--text-muted)', fontSize: '13px' }}>
                          <th style={{ padding: '12px' }}>Order ID</th>
                          <th style={{ padding: '12px' }}>Amount</th>
                          <th style={{ padding: '12px' }}>Status</th>
                          <th style={{ padding: '12px' }}>Timestamp</th>
                        </tr>
                      </thead>
                      <tbody style={{ fontWeight: '600', fontSize: '14px' }}>
                        {orders.slice(0, 5).map(o => (
                          <tr key={o.id} style={{ borderBottom: '1px solid var(--card-border)' }}>
                            <td style={{ padding: '16px 12px' }}>#{o.id}</td>
                            <td style={{ padding: '16px 12px' }}>₹{o.total}</td>
                            <td style={{ padding: '16px 12px' }}>
                              <span style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '11px', background: o.status === 'completed' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', color: o.status === 'completed' ? 'var(--success)' : 'var(--warning)' }}>{o.status}</span>
                            </td>
                            <td style={{ padding: '16px 12px', color: 'var(--text-muted)' }}>{formatDate(o.created_at || o.timestamp)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="glass-panel" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '24px', padding: '28px', boxShadow: 'var(--shadow-md)' }}>
                  <h4 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '24px' }}>Core High-Affinity Menu</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {menuItems.slice(0, 4).map(dish => (
                      <div key={dish.id} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <img src={dish.image_url ? (dish.image_url.startsWith('http') ? dish.image_url : `${API_URL}${dish.image_url}`) : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=100&q=80'} style={{ width: '50px', height: '50px', borderRadius: '12px', objectFit: 'cover' }} alt={dish.name} />
                        <div style={{ flex: 1 }}>
                          <span style={{ fontWeight: '700', fontSize: '14px' }}>{dish.name}</span>
                          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{dish.category}</p>
                        </div>
                        <span style={{ fontWeight: '800', color: 'var(--accent-primary)' }}>₹{dish.price}</span>
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
                    <label><Calendar size={14} /> Filter Date</label>
                    <input 
                      type="date" 
                      className="filter-input" 
                      value={selectedDate} 
                      onChange={(e) => setSelectedDate(e.target.value)} 
                      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--card-border)', borderRadius: '12px', color: 'var(--text-main)', padding: '6px 12px', fontSize: '14px', outline: 'none' }}
                    />
                  </div>
                  <div className="filter-stats">
                    Total Pending: <strong>{orders.filter(o => o.status === 'pending' && safeGetISODate(o) === selectedDate).length}</strong>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', alignItems: 'start', marginTop: '24px' }}>
                {['pending', 'preparing', 'completed'].map(columnStatus => (
                  <div key={columnStatus} style={{ background: 'var(--bg-deep)', border: '1px solid var(--card-border)', borderRadius: '24px', padding: '20px', minHeight: '600px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '2px solid var(--card-border)' }}>
                      <h3 style={{ textTransform: 'uppercase', fontSize: '14px', fontWeight: '800', color: columnStatus === 'pending' ? 'var(--warning)' : columnStatus === 'preparing' ? 'var(--accent-primary)' : 'var(--success)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: columnStatus === 'pending' ? 'var(--warning)' : columnStatus === 'preparing' ? 'var(--accent-primary)' : 'var(--success)' }} />
                        {columnStatus === 'pending' ? 'Waiting' : columnStatus === 'preparing' ? 'In Progress' : 'Success'}
                      </h3>
                      <span style={{ fontSize: '12px', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '10px', color: 'var(--text-dim)', fontWeight: '700' }}>
                        {orders.filter(o => o.status === columnStatus && safeGetISODate(o) === selectedDate).length}
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', maxHeight: 'calc(100vh - 280px)' }} className="scrollbar-hidden">
                      {orders.filter(o => o.status === columnStatus && safeGetISODate(o) === selectedDate).map(order => (
                        <div key={order.id} style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '16px', padding: '16px', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ fontSize: '13px', fontWeight: '800', background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '8px', color: 'var(--text-main)' }}>
                              Table {order.table_number || order.tableNumber}
                            </div>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Clock size={12} /> {formatDate(order.created_at || order.timestamp)}
                            </span>
                          </div>
                          
                          {(order.customerName || order.customer_name || order.customerPhone || order.customer_phone) && (
                            <div style={{ fontSize: '12px', color: 'var(--text-dim)', display: 'flex', flexDirection: 'column', gap: '4px', padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.02)' }}>
                              {(order.customerName || order.customer_name) && <div><span style={{ color: 'var(--text-muted)' }}>Customer:</span> <strong style={{ color: 'var(--text-main)' }}>{order.customerName || order.customer_name}</strong></div>}
                              {(order.customerPhone || order.customer_phone) && <div><span style={{ color: 'var(--text-muted)' }}>Phone:</span> <strong style={{ color: 'var(--text-main)' }}>{order.customerPhone || order.customer_phone}</strong></div>}
                            </div>
                          )}

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '10px 0', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            {(order.items || []).map((item, idx) => (
                              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span style={{ fontWeight: '800', color: 'var(--accent-primary)', background: 'rgba(124, 58, 237, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>{item.qty || 1}</span>
                                  <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>{item.name}</span>
                                </div>
                                <span style={{ color: 'var(--text-dim)' }}>₹{item.price * (item.qty || 1)}</span>
                              </div>
                            ))}
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>Total: <strong>₹{order.total}</strong></span>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <button 
                                onClick={() => handlePrintBill(order)}
                                style={{ padding: '6px 10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', borderRadius: '8px', color: 'var(--text-dim)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                title="Print Bill"
                              >
                                <Printer size={16} />
                              </button>

                              {columnStatus === 'pending' && (
                                <button 
                                  onClick={() => updateOrderStatus(order.id, 'preparing')}
                                  style={{ padding: '6px 12px', background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)', border: 'none', borderRadius: '8px', color: 'white', fontWeight: '700', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                >
                                  Commit
                                </button>
                              )}
                              {columnStatus === 'preparing' && (
                                <button 
                                  onClick={() => updateOrderStatus(order.id, 'completed')}
                                  style={{ padding: '6px 12px', background: 'linear-gradient(135deg, var(--success) 0%, #059669 100%)', border: 'none', borderRadius: '8px', color: 'white', fontWeight: '700', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                >
                                  Finalize
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
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
                <div className="flex gap-4 items-center">
                  <label className="btn-secondary" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sparkles size={20} className="text-warning" />
                    <span>{isImporting ? 'Analyzing...' : 'AI Import Menu'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        setIsImporting(true);
                        const formData = new FormData();
                        formData.append('file', file);
                        try {
                          const res = await axios.post(`${API_URL}/api/menu/import-ai`, formData, {
                            headers: { 'Content-Type': 'multipart/form-data' }
                          });
                          setExtractedReviewData(res.data.data);
                          setShowImportReview(true);
                        } catch (err) {
                          alert("AI Import failed: " + err.message);
                        } finally {
                          setIsImporting(false);
                        }
                      }}
                    />
                  </label>
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

              <div className="inventory-toolbar-premium shadow-premium" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', gap: '20px' }}>
                  <div className="search-box-integrated" style={{ flex: 1 }}>
                    <Search size={18} className="search-icon-inner" />
                    <input
                      type="text"
                      placeholder="Filter neural items by name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-main)', fontSize: '15px' }}
                    />
                  </div>
                  <div className="inventory-meta-badge">
                    <span>Active coverage:</span>
                    <strong>{menuItems.filter(i => i.is_active).length}</strong>
                    <span>/ {menuItems.length} items</span>
                  </div>
                </div>

                <div className="category-quick-filters" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', width: '100%', paddingTop: '12px', borderTop: '1px solid var(--card-border)' }}>
                  {['All', ...categories.map(c => c.name)].map((cat) => (
                    <button
                      key={cat}
                      className={`filter-pill-btn ${selectedCategory === cat ? 'active' : ''}`}
                      onClick={() => setSelectedCategory(cat)}
                      style={{
                        padding: '8px 18px',
                        borderRadius: '12px',
                        border: '1px solid var(--card-border)',
                        background: selectedCategory === cat ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                        color: selectedCategory === cat ? '#fff' : 'var(--text-muted)',
                        cursor: 'pointer',
                        fontWeight: '700',
                        fontSize: '13px',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="category-grouped-container" style={{ display: 'flex', flexDirection: 'column', gap: '40px', width: '100%', marginTop: '24px' }}>
                {['All', ...categories.map(c => c.name)].filter(c => selectedCategory === 'All' || c === selectedCategory).map((catName) => {
                  if (catName === 'All') return null;
                  const catItems = menuItems.filter(item => item.category === catName && item.name.toLowerCase().includes(searchTerm.toLowerCase()));
                  if (catItems.length === 0) return null;
                  const isCollapsed = collapsedCats.has(catName);
                  return (
                    <div key={catName} className="category-group-block" style={{ width: '100%' }}>
                      <h2
                        className="text-xl font-bold mb-4 flex items-center justify-between text-white"
                        style={{ paddingLeft: '12px', borderLeft: '4px solid var(--accent-primary)', cursor: 'pointer', userSelect: 'none' }}
                        onClick={() => {
                          setCollapsedCats(prev => {
                            const next = new Set(prev);
                            if (next.has(catName)) next.delete(catName);
                            else next.add(catName);
                            return next;
                          });
                        }}
                      >
                        <div className="flex items-center gap-2">
                          {catName}
                          <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '20px' }}>{catItems.length} items</span>
                        </div>
                        {isCollapsed ? <ChevronRight size={20} className="text-muted" /> : <ChevronDown size={20} className="text-muted" />}
                      </h2>
                      {!isCollapsed && (
                        <div className="inventory-grid">
                          {catItems.map(item => (
                            <div key={item.id} className={`inventory-card glass-panel dish-card-premium shadow-premium ${!item.is_active ? 'dish-card-hidden' : ''}`}>
                              <div className="dish-banner" style={{ position: 'relative', height: '120px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: !item.image_url ? 'linear-gradient(135deg, var(--bg-secondary), var(--bg-tertiary))' : 'rgba(0,0,0,0.05)' }}>
                                {item.image_url ? (
                                  <img
                                    src={item.image_url.startsWith('http') ? item.image_url : `${API_URL}${item.image_url}`}
                                    alt={item.name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                  />
                                ) : (
                                  <div className="flex flex-col items-center gap-2 opacity-40">
                                    <UtensilsCrossed size={36} className="text-accent" />
                                    <span className="text-xs font-bold uppercase tracking-widest text-muted">No Image</span>
                                  </div>
                                )}
                              </div>
                              <div className="inv-details">
                                <div className="inv-main">
                                  <div className="flex justify-between items-start">
                                    <strong className="text-lg">{item.name}</strong>
                                    {/* <span className="inv-cat-tag shadow-sm">{item.category}</span> */}
                                  </div>
                                </div>
                                <p className="inv-desc text-muted truncate-2-lines mt-2">{item.description}</p>
                                <div className="inv-meta">
                                  <div className="inv-price text-xl">₹{item.price}</div>
                                </div>
                              </div>
                              <div className="inv-actions">
                                <button
                                  className={`inv-btn-toggle ${item.is_active ? 'active' : 'inactive'}`}
                                  onClick={() => toggleDishActive(item)}
                                  title={item.is_active ? "Deactivate / Hide from Menu" : "Activate / Show in Menu"}
                                >
                                  {item.is_active ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
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
                      )}
                    </div>
                  );
                })}

                {selectedCategory === 'All' && (() => {
                  const unassignedItems = menuItems.filter(item =>
                    (!item.category || !categories.some(c => c.name === item.category)) &&
                    item.name.toLowerCase().includes(searchTerm.toLowerCase())
                  );
                  if (unassignedItems.length === 0) return null;
                  const isUnassignedCollapsed = collapsedCats.has('Unassigned');
                  return (
                    <div className="category-group-block" style={{ width: '100%' }}>
                      <h2
                        className="text-xl font-bold mb-4 flex items-center justify-between text-white"
                        style={{ paddingLeft: '12px', borderLeft: '4px solid var(--accent-primary)', cursor: 'pointer', userSelect: 'none' }}
                        onClick={() => {
                          setCollapsedCats(prev => {
                            const next = new Set(prev);
                            if (next.has('Unassigned')) next.delete('Unassigned');
                            else next.add('Unassigned');
                            return next;
                          });
                        }}
                      >
                        <div className="flex items-center gap-2">
                          Unassigned Items
                          <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '20px' }}>{unassignedItems.length} items</span>
                        </div>
                        {isUnassignedCollapsed ? <ChevronRight size={20} className="text-muted" /> : <ChevronDown size={20} className="text-muted" />}
                      </h2>
                      {!isUnassignedCollapsed && (
                        <div className="inventory-grid">
                          {unassignedItems.map(item => (
                            <div key={item.id} className={`inventory-card glass-panel dish-card-premium shadow-premium ${!item.is_active ? 'dish-card-hidden' : ''}`}>
                              <div className="dish-banner" style={{ position: 'relative', height: '120px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: !item.image_url ? 'linear-gradient(135deg, var(--bg-secondary), var(--bg-tertiary))' : 'rgba(0,0,0,0.05)' }}>
                                {item.image_url ? (
                                  <img
                                    src={item.image_url.startsWith('http') ? item.image_url : `${API_URL}${item.image_url}`}
                                    alt={item.name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                  />
                                ) : (
                                  <div className="flex flex-col items-center gap-2 opacity-40">
                                    <UtensilsCrossed size={36} className="text-accent" />
                                    <span className="text-xs font-bold uppercase tracking-widest text-muted">No Image</span>
                                  </div>
                                )}
                              </div>
                              <div className="inv-details">
                                <div className="inv-main">
                                  <div className="flex justify-between items-start">
                                    <strong className="text-lg">{item.name}</strong>
                                    <span className="inv-cat-tag shadow-sm">{item.category || 'Unassigned'}</span>
                                  </div>
                                </div>
                                <p className="inv-desc text-muted truncate-2-lines mt-2">{item.description}</p>
                                <div className="inv-meta">
                                  <div className="inv-price text-xl">₹{item.price}</div>
                                </div>
                              </div>
                              <div className="inv-actions">
                                <button
                                  className={`inv-btn-toggle ${item.is_active ? 'active' : 'inactive'}`}
                                  onClick={() => toggleDishActive(item)}
                                  title={item.is_active ? "Deactivate / Hide from Menu" : "Activate / Show in Menu"}
                                >
                                  {item.is_active ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
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
                      )}
                    </div>
                  );
                })()}
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

          {activeTab === 'inventory' && (
            <div className="view-container animate-slide-up" style={{ padding: '32px', background: 'var(--bg-deep)', minHeight: '100vh' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h1 className="view-title" style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-main)' }}>Smart Inventory Hub</h1>
                  <p className="text-muted" style={{ marginTop: '4px', fontSize: '15px' }}>Automated restaurant stock operations.</p>
                </div>
              </div>

              <SmartInventory />
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="view-container animate-slide-up" style={{ padding: '32px', background: 'var(--bg-deep)', minHeight: '100vh' }}>
              <h1 className="view-title" style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-main)' }}>Network Yield Analytics</h1>
              <p className="text-muted" style={{ marginTop: '4px', fontSize: '15px' }}>Financial oversight modules.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                <div className="glass-panel" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', padding: '28px', borderRadius: '24px', boxShadow: 'var(--shadow-md)' }}>
                  <h4 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '16px' }}>Aggregate Taxation</h4>
                  <div style={{ padding: '20px', background: 'var(--bg-deep)', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '700', color: 'var(--text-dim)' }}>Calculated GST (18%)</span>
                    <span style={{ fontWeight: '800', color: 'var(--accent-primary)', fontSize: '20px' }}>₹12,052.98</span>
                  </div>
                </div>

                <div className="glass-panel" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', padding: '28px', borderRadius: '24px', boxShadow: 'var(--shadow-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <button className="btn-primary" style={{ padding: '12px 24px', borderRadius: '14px', fontWeight: '700', fontSize: '14px', border: 'none', cursor: 'pointer' }}>
                    Download Q2 Financial PDF
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'qr_codes' && (
            <div className="view-container animate-slide-up" style={{ padding: '32px', background: 'var(--bg-deep)', minHeight: '100vh' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h1 className="view-title" style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-main)' }}>Tables & QR Codes</h1>
                  <p className="text-muted" style={{ marginTop: '4px', fontSize: '15px' }}>Dine-in Customer ordering entry endpoints.</p>
                </div>
                <button 
                  onClick={async () => {
                     const nextId = restaurantTables.length + 1;
                     const randomSecret = `T${nextId}-R4-DINE${Math.floor(1000 + Math.random() * 9000)}`;
                     try {
                        await axios.post(`${API_URL}/api/tables`, {
                           table_number: nextId,
                           secret_token: randomSecret,
                           restaurant_id: adminUser.restaurant_id || 4
                        });
                        setRestaurantTables([...restaurantTables, { table: `Table ${nextId}`, token: randomSecret }]);
                     } catch(err) { alert("Persistence failed"); }
                  }}
                  className="btn-primary" 
                  style={{ padding: '12px 24px', borderRadius: '14px', fontWeight: '700', fontSize: '14px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <Plus size={18} /> Add New Table
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                {restaurantTables.map((t, idx) => {
                  const liveUrl = `${window.location.origin}/?s=${t.token}`;
                  return (
                    <div key={idx} className="glass-panel" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', padding: '24px', borderRadius: '20px', boxShadow: 'var(--shadow-md)', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', textAlign: 'center' }}>
                      <div style={{ padding: '16px', background: 'white', borderRadius: '16px', width: '160px', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         <img 
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(liveUrl)}`} 
                            alt="Scannable QR Code" 
                            style={{ width: '130px', height: '130px', objectFit: 'contain' }}
                         />
                      </div>
                      <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-main)' }}>{t.table}</h3>
                      <div style={{ fontSize: '12px', background: 'var(--bg-deep)', padding: '8px 12px', borderRadius: '8px', color: 'var(--accent-primary)', fontWeight: '700', wordBreak: 'break-all' }}>{t.token}</div>
                      
                      <button 
                         onClick={() => {
                           navigator.clipboard.writeText(liveUrl);
                           alert("Table URL copied to clipboard!");
                         }} 
                         className="btn-primary" 
                         style={{ padding: '10px 16px', borderRadius: '12px', fontWeight: '700', fontSize: '13px', width: '100%', border: 'none', cursor: 'pointer' }}
                      >
                        Copy Dine-In Link
                      </button>

                      <button 
                          onClick={() => {
                            fetch(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(liveUrl)}`)
                              .then(response => response.blob())
                              .then(blob => {
                                const blobUrl = window.URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = blobUrl;
                                a.download = `${t.table}_QR.png`;
                                document.body.appendChild(a);
                                a.click();
                                a.remove();
                                window.URL.revokeObjectURL(blobUrl);
                              })
                              .catch(() => alert("Download failed"));
                          }} 
                         style={{ padding: '10px 16px', borderRadius: '12px', fontWeight: '700', fontSize: '13px', width: '100%', border: '1px solid var(--card-border)', background: 'transparent', color: 'var(--text-main)', cursor: 'pointer', marginTop: '-8px' }}
                      >
                        Download QR
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="view-container animate-slide-up" style={{ padding: '32px', background: 'var(--bg-deep)', minHeight: '100vh' }}>
              <h1 className="view-title" style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-main)' }}>System Configurations</h1>
              <p className="text-muted" style={{ marginTop: '4px', fontSize: '15px' }}>Communication protocols settings.</p>

              <div className="glass-panel mt-8" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', padding: '28px', borderRadius: '24px', boxShadow: 'var(--shadow-md)', maxWidth: '600px' }}>
                <h4 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '24px' }}>Profile Verification</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Administrator Name</label>
                    <input type="text" value={adminUser.name || ''} readOnly style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--card-border)', background: 'var(--bg-deep)', color: 'var(--text-main)', fontWeight: '600', marginTop: '6px' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Designated Role</label>
                    <input type="text" value={adminUser.role || ''} readOnly style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--card-border)', background: 'var(--bg-deep)', color: 'var(--text-main)', fontWeight: '600', marginTop: '6px' }} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Menu Modal */}
      {showMenuPopup && (
        <div className="modal-overlay" style={{ zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)' }}>
          <div className="modal-content glass-panel animate-slide-up" style={{ maxWidth: '900px', width: '95%', maxHeight: '90vh', overflowY: 'auto', padding: '40px', borderRadius: '28px', background: 'var(--card-bg)', border: '1px solid var(--card-border)', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', borderBottom: '1px solid var(--card-border)', paddingBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '28px', fontWeight: '900', background: 'linear-gradient(135deg, #fff 0%, var(--text-muted) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{editingDishId ? '✏️ Edit Menu Item' : '➕ Add New Menu Item'}</h2>
                <p className="text-muted" style={{ fontSize: '14px', marginTop: '4px' }}>Fill out item specifications mapped to your SaaS metrics.</p>
              </div>
              <button className="text-muted hover:text-white" onClick={() => setShowMenuPopup(false)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', width: '36px', height: '36px', borderRadius: '50%', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>✕</button>
            </div>

            {formError && (
              <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--danger)', color: 'var(--danger)', padding: '16px 20px', borderRadius: '16px', marginBottom: '32px', fontWeight: '700', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <AlertCircle size={20} />
                <span>{formError}</span>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
              {/* Left Column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div>
                  <label style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '10px', display: 'block' }}>Item Name *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Premium Paneer Tikka"
                    value={newDish.name} 
                    onChange={(e) => setNewDish({ ...newDish, name: e.target.value })}
                    style={{ width: '100%', height: '52px', padding: '16px', borderRadius: '14px', background: 'var(--bg-deep)', color: 'var(--text-main)', border: '1px solid var(--card-border)', fontSize: '15px', transition: 'border 0.2s', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '10px', display: 'block' }}>Category *</label>
                  <select 
                    value={newDish.category} 
                    onChange={(e) => setNewDish({ ...newDish, category: e.target.value })}
                    style={{ width: '100%', height: '52px', padding: '0 16px', borderRadius: '14px', background: 'var(--bg-deep)', color: 'var(--text-main)', border: '1px solid var(--card-border)', fontSize: '15px', cursor: 'pointer', outline: 'none' }}
                  >
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '10px', display: 'block' }}>Price (₹) *</label>
                    <input 
                      type="number" 
                      placeholder="0.00"
                      value={newDish.price} 
                      onChange={(e) => setNewDish({ ...newDish, price: e.target.value })}
                      style={{ width: '100%', height: '52px', padding: '16px', borderRadius: '14px', background: 'var(--bg-deep)', color: 'var(--accent-primary)', fontWeight: '800', border: '1px solid var(--card-border)', fontSize: '16px', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '10px', display: 'block' }}>Offer Price (₹)</label>
                    <input 
                      type="number" 
                      placeholder="Promo value"
                      value={newDish.offer_price || ''} 
                      onChange={(e) => setNewDish({ ...newDish, offer_price: e.target.value })}
                      style={{ width: '100%', height: '52px', padding: '16px', borderRadius: '14px', background: 'var(--bg-deep)', color: 'var(--success)', fontWeight: '800', border: '1px solid var(--card-border)', fontSize: '16px', outline: 'none' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '10px', display: 'block' }}>Food Classification</label>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    {[
                      { type: 'veg', color: 'rgba(34, 197, 94, 0.2)', text: '#22c55e' },
                      { type: 'nonveg', color: 'rgba(239, 68, 68, 0.2)', text: '#ef4444' },
                      { type: 'egg', color: 'rgba(234, 179, 8, 0.2)', text: '#eab308' }
                    ].map(item => (
                      <button 
                        key={item.type}
                        type="button"
                        onClick={() => setNewDish({ ...newDish, veg_type: item.type })}
                        style={{ 
                          flex: 1, 
                          padding: '14px', 
                          borderRadius: '14px', 
                          background: newDish.veg_type === item.type ? item.color : 'var(--bg-deep)', 
                          color: newDish.veg_type === item.type ? item.text : 'var(--text-main)', 
                          border: newDish.veg_type === item.type ? `2px solid ${item.text}` : '1px solid var(--card-border)', 
                          fontWeight: '800', 
                          textTransform: 'uppercase', 
                          letterSpacing: '1px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        {item.type}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div>
                  <label style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '10px', display: 'block' }}>Upload Food Image</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <label 
                      style={{ 
                        height: '140px', 
                        border: '2px dashed var(--card-border)', 
                        borderRadius: '20px', 
                        display: 'flex', 
                        flexDirection: 'column',
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        cursor: 'pointer', 
                        gap: '12px', 
                        background: 'var(--bg-deep)',
                        transition: 'all 0.2s',
                        color: 'var(--text-muted)'
                      }}
                      onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--accent-primary)'; }}
                      onDragLeave={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--card-border)'; }}
                      onDrop={async (e) => {
                        e.preventDefault();
                        const file = e.dataTransfer.files[0];
                        if (file) {
                          const formData = new FormData();
                          formData.append('file', file);
                          setUploading(true);
                          try {
                            const res = await axios.post(`${API_URL}/api/upload`, formData);
                            setNewDish({ ...newDish, image_url: res.data.url });
                          } catch (err) { alert("Upload failed"); } finally { setUploading(false); }
                        }
                      }}
                    >
                      {uploading ? (
                        <div className="animate-spin h-6 w-6 border-2 border-accent border-t-transparent rounded-full"></div>
                      ) : (
                        <>
                          <ImageIcon size={28} className="text-muted" />
                          <span style={{ fontWeight: '700', fontSize: '14px' }}>Drag & drop or Click to Browse</span>
                        </>
                      )}
                      <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileUpload} />
                    </label>

                    {newDish.image_url && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '16px', border: '1px solid var(--card-border)' }}>
                        <img src={newDish.image_url.startsWith('http') ? newDish.image_url : `${API_URL}${newDish.image_url}`} alt="Preview" style={{ width: '60px', height: '60px', borderRadius: '12px', objectFit: 'cover' }} />
                        <span style={{ fontSize: '13px', color: 'var(--text-dim)', fontWeight: '600', flex: 1, wordBreak: 'break-all' }}>{newDish.image_url}</span>
                        <button type="button" onClick={() => setNewDish({ ...newDish, image_url: '' })} style={{ background: 'none', border: 'none', color: 'var(--danger)', fontWeight: '700', cursor: 'pointer' }}>Remove</button>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '10px', display: 'block' }}>Description</label>
                  <textarea 
                    placeholder="Briefly describe dish ingredients and taste..."
                    value={newDish.description} 
                    onChange={(e) => setNewDish({ ...newDish, description: e.target.value })}
                    style={{ width: '100%', minHeight: '94px', padding: '16px', borderRadius: '14px', background: 'var(--bg-deep)', color: 'var(--text-main)', border: '1px solid var(--card-border)', fontSize: '14px', resize: 'none', outline: 'none' }}
                  />
                </div>
              </div>
            </div>

            {/* Advanced Metrics */}
            <div style={{ marginTop: '32px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', background: 'rgba(255,255,255,0.02)', padding: '24px', borderRadius: '20px', border: '1px solid var(--card-border)' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>Prep Time (mins)</label>
                <input 
                  type="number" 
                  placeholder="e.g. 15"
                  value={newDish.prep_time || ''} 
                  onChange={(e) => setNewDish({ ...newDish, prep_time: e.target.value })}
                  style={{ width: '100%', height: '48px', padding: '12px', borderRadius: '12px', background: 'var(--bg-deep)', color: 'var(--text-main)', border: '1px solid var(--card-border)', fontSize: '14px' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>Spice Level (1-5)</label>
                <input 
                  type="number" 
                  min="1" max="5"
                  placeholder="🌶️ 1 to 5"
                  value={newDish.spice_level || ''} 
                  onChange={(e) => setNewDish({ ...newDish, spice_level: e.target.value })}
                  style={{ width: '100%', height: '48px', padding: '12px', borderRadius: '12px', background: 'var(--bg-deep)', color: 'var(--text-main)', border: '1px solid var(--card-border)', fontSize: '14px' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>SKU Code</label>
                <input 
                  type="text" 
                  placeholder="SKU-XXX"
                  value={newDish.sku || ''} 
                  onChange={(e) => setNewDish({ ...newDish, sku: e.target.value })}
                  style={{ width: '100%', height: '48px', padding: '12px', borderRadius: '12px', background: 'var(--bg-deep)', color: 'var(--text-main)', border: '1px solid var(--card-border)', fontSize: '14px' }}
                />
              </div>
            </div>

            {/* Toggle Switches */}
            <div style={{ display: 'flex', gap: '32px', marginTop: '24px', background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '20px', border: '1px solid var(--card-border)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', flex: 1 }}>
                <div style={{ position: 'relative', width: '50px', height: '26px', background: newDish.is_active ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)', borderRadius: '20px', transition: 'all 0.3s' }}>
                  <div style={{ position: 'absolute', top: '3px', left: newDish.is_active ? '27px' : '3px', width: '20px', height: '20px', borderRadius: '50%', background: 'white', transition: 'all 0.3s' }}></div>
                </div>
                <input type="checkbox" checked={newDish.is_active} onChange={(e) => setNewDish({ ...newDish, is_active: e.target.checked })} style={{ display: 'none' }} />
                <span style={{ fontSize: '14px', fontWeight: '700' }}>Available for Orders</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', flex: 1 }}>
                <div style={{ position: 'relative', width: '50px', height: '26px', background: newDish.is_featured ? 'var(--success)' : 'rgba(255,255,255,0.1)', borderRadius: '20px', transition: 'all 0.3s' }}>
                  <div style={{ position: 'absolute', top: '3px', left: newDish.is_featured ? '27px' : '3px', width: '20px', height: '20px', borderRadius: '50%', background: 'white', transition: 'all 0.3s' }}></div>
                </div>
                <input type="checkbox" checked={newDish.is_featured} onChange={(e) => setNewDish({ ...newDish, is_featured: e.target.checked })} style={{ display: 'none' }} />
                <span style={{ fontSize: '14px', fontWeight: '700' }}>Featured Dish</span>
              </label>
            </div>

            {/* Sticky/Fixed Footer Controls */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '40px', borderTop: '1px solid var(--card-border)', paddingTop: '24px' }}>
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={() => setShowMenuPopup(false)} 
                style={{ padding: '14px 28px', borderRadius: '14px', background: 'transparent', border: '1px solid var(--card-border)', color: 'var(--text-muted)', fontWeight: '700', fontSize: '15px', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.borderColor = 'white'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--card-border)'}
              >
                Cancel
              </button>
              <button 
                type="button"
                className="btn-primary" 
                onClick={handleSaveDish} 
                disabled={uploading}
                style={{ padding: '14px 40px', borderRadius: '14px', fontWeight: '800', fontSize: '15px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)', color: 'white', boxShadow: '0 10px 20px -5px rgba(124, 58, 237, 0.4)', transition: 'all 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                {uploading ? 'Processing...' : 'Save Menu Item'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Menu Review Overlay */}
      {showImportReview && extractedReviewData && (
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
          <div className="modal-content glass-panel animate-slide-down" style={{ maxWidth: '800px', width: '90%', maxHeight: '85vh', overflowY: 'auto', padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Sparkles className="text-warning" size={24} />
                <h3 style={{ fontSize: '24px', fontWeight: '800' }}>Review Extracted AI Menu</h3>
              </div>
              <button className="text-muted hover:text-white" onClick={() => setShowImportReview(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✕</button>
            </div>

            <p className="text-muted mb-6" style={{ fontSize: '14px' }}>Please verify and edit the item details parsed by optical scanning models below.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {extractedReviewData.categories && extractedReviewData.categories.map((cat, catIdx) => (
                <div key={catIdx} style={{ background: 'var(--bg-deep)', borderRadius: '20px', padding: '24px', border: '1px solid var(--card-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--accent-primary)' }}>Category:</span>
                    <input 
                      type="text" 
                      value={cat.name} 
                      onChange={(e) => {
                        const updated = { ...extractedReviewData };
                        updated.categories[catIdx].name = e.target.value;
                        setExtractedReviewData(updated);
                      }}
                      style={{ background: 'transparent', border: '1px solid var(--card-border)', padding: '6px 12px', borderRadius: '10px', color: 'var(--text-main)', fontWeight: '700', fontSize: '16px' }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {cat.items && cat.items.map((item, itemIdx) => (
                      <div key={itemIdx} style={{ background: 'var(--card-bg)', borderRadius: '14px', padding: '16px', border: '1px solid var(--card-border)', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '16px', alignItems: 'center' }}>
                        <div>
                          <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700' }}>ITEM NAME</label>
                          <input 
                            type="text" 
                            value={item.name} 
                            onChange={(e) => {
                              const updated = { ...extractedReviewData };
                              updated.categories[catIdx].items[itemIdx].name = e.target.value;
                              setExtractedReviewData(updated);
                            }}
                            style={{ width: '100%', background: 'transparent', border: 'none', color: 'var(--text-main)', fontWeight: '600', padding: '4px 0', borderBottom: '1px solid var(--card-border)' }}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700' }}>HINDI NAME</label>
                          <input 
                            type="text" 
                            value={item.name_hindi || ''} 
                            onChange={(e) => {
                              const updated = { ...extractedReviewData };
                              updated.categories[catIdx].items[itemIdx].name_hindi = e.target.value;
                              setExtractedReviewData(updated);
                            }}
                            style={{ width: '100%', background: 'transparent', border: 'none', color: 'var(--text-dim)', fontWeight: '600', padding: '4px 0', borderBottom: '1px solid var(--card-border)' }}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700' }}>PRICE (₹)</label>
                          <input 
                            type="number" 
                            value={item.base_price || item.price || ''} 
                            onChange={(e) => {
                              const updated = { ...extractedReviewData };
                              updated.categories[catIdx].items[itemIdx].price = Number(e.target.value);
                              updated.categories[catIdx].items[itemIdx].base_price = Number(e.target.value);
                              setExtractedReviewData(updated);
                            }}
                            style={{ width: '100%', background: 'transparent', border: 'none', color: 'var(--accent-primary)', fontWeight: '700', padding: '4px 0', borderBottom: '1px solid var(--card-border)' }}
                          />
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                          <select 
                            value={item.veg_type || 'veg'} 
                            onChange={(e) => {
                              const updated = { ...extractedReviewData };
                              updated.categories[catIdx].items[itemIdx].veg_type = e.target.value;
                              setExtractedReviewData(updated);
                            }}
                            style={{ padding: '6px 12px', borderRadius: '10px', fontSize: '12px', background: 'var(--bg-deep)', color: 'var(--text-main)', border: '1px solid var(--card-border)', fontWeight: '600' }}
                          >
                            <option value="veg">Veg</option>
                            <option value="nonveg">Non-Veg</option>
                            <option value="egg">Egg</option>
                          </select>
                          <button 
                            onClick={() => {
                              const updated = { ...extractedReviewData };
                              updated.categories[catIdx].items.splice(itemIdx, 1);
                              setExtractedReviewData(updated);
                            }}
                            style={{ background: 'rgba(239, 68, 68, 0.12)', border: 'none', color: 'var(--danger)', borderRadius: '10px', padding: '6px 10px', cursor: 'pointer' }}
                          >✕</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '32px' }}>
              <button className="btn-secondary" onClick={() => setShowImportReview(false)} style={{ padding: '12px 24px', borderRadius: '14px' }}>Abort</button>
              <button 
                className="btn-primary" 
                style={{ padding: '12px 32px', borderRadius: '14px', border: 'none', fontWeight: '700', cursor: 'pointer' }}
                onClick={async () => {
                  try {
                    // Bulk publish extraction variables 
                    for (const cat of extractedReviewData.categories) {
                      // 1. Create or Check Category mapping
                      let catName = cat.name;
                      let existingCat = categories.find(c => c.name.toLowerCase() === catName.toLowerCase());
                      if (!existingCat) {
                        const catRes = await axios.post(`${API_URL}/api/menu/categories`, { name: catName, restaurant_id: adminUser.restaurant_id });
                        categories.push({ id: catRes.data.id, name: catName });
                      }
                      
                      // 2. Publish items
                      for (const itm of cat.items) {
                        await axios.post(`${API_URL}/api/menu`, {
                          restaurant_id: adminUser.restaurant_id,
                          name: itm.name,
                          category: catName,
                          price: itm.base_price || itm.price || 0,
                          description: itm.description || `${itm.name_hindi || itm.name} freshly served.`,
                          is_active: true
                        });
                      }
                    }
                    alert("Menu populated successfully!");
                    setShowImportReview(false);
                    fetchData();
                  } catch (err) {
                    alert("Publish failed: " + err.message);
                  }
                }}
              >
                Publish Live Menu
              </button>
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
                      if (window.confirm("Delete category?")) {
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
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
          <div className="modal-content glass-panel animate-slide-up" style={{ maxWidth: '500px', width: '90%', padding: '32px', borderRadius: '24px', background: 'var(--card-bg)', border: '1px solid var(--card-border)', boxShadow: 'var(--shadow-xl)' }}>
            <h3 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '4px' }}>Add New Staff Member</h3>
            <p className="text-muted" style={{ fontSize: '14px', marginBottom: '24px' }}>Onboard elite operators to manage branch endpoints.</p>
            
            <form onSubmit={handleAddStaff} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '8px', display: 'block', textTransform: 'uppercase' }}>Full Name *</label>
                <input 
                  type="text" 
                  placeholder="e.g. John Doe" 
                  value={newStaff.name} 
                  onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })} 
                  required 
                  style={{ width: '100%', height: '48px', padding: '12px 16px', borderRadius: '12px', background: 'var(--bg-deep)', color: 'var(--text-main)', border: '1px solid var(--card-border)', fontSize: '14px', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '8px', display: 'block', textTransform: 'uppercase' }}>Email Address *</label>
                <input 
                  type="email" 
                  placeholder="e.g. john@swiggy.com" 
                  value={newStaff.email} 
                  onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })} 
                  required 
                  style={{ width: '100%', height: '48px', padding: '12px 16px', borderRadius: '12px', background: 'var(--bg-deep)', color: 'var(--text-main)', border: '1px solid var(--card-border)', fontSize: '14px', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '8px', display: 'block', textTransform: 'uppercase' }}>Secure Password *</label>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={newStaff.password} 
                  onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })} 
                  required 
                  style={{ width: '100%', height: '48px', padding: '12px 16px', borderRadius: '12px', background: 'var(--bg-deep)', color: 'var(--text-main)', border: '1px solid var(--card-border)', fontSize: '14px', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '8px', display: 'block', textTransform: 'uppercase' }}>Operational Role *</label>
                <select 
                  value={newStaff.role} 
                  onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                  style={{ width: '100%', height: '48px', padding: '12px 16px', borderRadius: '12px', background: 'var(--bg-deep)', color: 'var(--text-main)', border: '1px solid var(--card-border)', fontSize: '14px', outline: 'none', cursor: 'pointer' }}
                >
                  <option value="admin">Branch Admin</option>
                  <option value="super_admin">Master Admin</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={() => setShowStaffPopup(false)}
                  style={{ flex: 1, padding: '12px', borderRadius: '12px', background: 'transparent', border: '1px solid var(--card-border)', color: 'var(--text-muted)', fontWeight: '700', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)', color: 'white', fontWeight: '800', cursor: 'pointer', boxShadow: '0 8px 16px -4px rgba(124, 58, 237, 0.3)' }}
                >
                  Save Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Node Modal */}
      {showNodePopup && (
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
          <div className="modal-content glass-panel animate-slide-up" style={{ maxWidth: '500px', width: '90%', padding: '32px', borderRadius: '24px', background: 'var(--card-bg)', border: '1px solid var(--card-border)', boxShadow: 'var(--shadow-xl)' }}>
            <h3 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '4px' }}>Deploy New Node</h3>
            <p className="text-muted" style={{ fontSize: '14px', marginBottom: '24px' }}>Initialize operational backend endpoints across regional networks.</p>
            
            <form onSubmit={handleAddNode} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '8px', display: 'block', textTransform: 'uppercase' }}>Node Name *</label>
                <input 
                  type="text" 
                  placeholder="e.g. Robo Branch 1" 
                  value={newNode.name} 
                  onChange={(e) => setNewNode({ ...newNode, name: e.target.value })} 
                  required 
                  style={{ width: '100%', height: '48px', padding: '12px 16px', borderRadius: '12px', background: 'var(--bg-deep)', color: 'var(--text-main)', border: '1px solid var(--card-border)', fontSize: '14px', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '8px', display: 'block', textTransform: 'uppercase' }}>Physical Location *</label>
                <input 
                  type="text" 
                  placeholder="e.g. Jaipur, Rajasthan" 
                  value={newNode.location} 
                  onChange={(e) => setNewNode({ ...newNode, location: e.target.value })} 
                  required 
                  style={{ width: '100%', height: '48px', padding: '12px 16px', borderRadius: '12px', background: 'var(--bg-deep)', color: 'var(--text-main)', border: '1px solid var(--card-border)', fontSize: '14px', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={() => setShowNodePopup(false)}
                  style={{ flex: 1, padding: '12px', borderRadius: '12px', background: 'transparent', border: '1px solid var(--card-border)', color: 'var(--text-muted)', fontWeight: '700', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)', color: 'white', fontWeight: '800', cursor: 'pointer', boxShadow: '0 8px 16px -4px rgba(124, 58, 237, 0.3)' }}
                >
                  Deploy Node
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
