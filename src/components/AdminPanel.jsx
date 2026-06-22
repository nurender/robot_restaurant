import React, { useState, useEffect, useRef } from 'react';
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
  Edit,
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
  ChevronUp,
  ChevronRight,
  Package,
  BarChart2,
  Bike,
  CreditCard,
  Phone,
  Star,
  Send,
  RefreshCw,
  X,
  Bell
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { io } from 'socket.io-client';
import axios from 'axios';
import './AdminPanel.css';
import AdminSidebar from './AdminSidebar';
import ThemeToggle from './ThemeToggle';
import SmartInventory from './SmartInventory';
import CombosManager from './CombosManager';
import { API_URL } from '../config';

const socket = io(API_URL, { autoConnect: true });

const AdminPanel = () => {
  const renderCount = useRef(0);
  useEffect(() => {
    renderCount.current += 1;
    console.log(`🎨 AdminPanel Render #${renderCount.current} (Tab: ${activeTab})`);
  });

  const [adminUser, setAdminUser] = useState(() => {
    try {
      const saved = localStorage.getItem('admin_token');
      if (!saved || saved === 'undefined') return {};
      return JSON.parse(saved) || {};
    } catch (e) {
      return {};
    }
  });
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
  const [restaurantTables, setRestaurantTables] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [collapsedCats, setCollapsedCats] = useState(new Set());
  const [chatLogs, setChatLogs] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [riders, setRiders] = useState([]);
  const [feedbackList, setFeedbackList] = useState([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [orderedMenu, setOrderedMenu] = useState([]);
  const [orderedSidebar, setOrderedSidebar] = useState([]);
  const [dragItemIndex, setDragItemIndex] = useState(null);
  const [dbRoles, setDbRoles] = useState([]);
  const [currentRoleData, setCurrentRoleData] = useState({ name: '', permissions: [] });
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

  // Authentication & Initial Fetch
  const [roboSettings, setRoboSettings] = useState({
    ai_tone: 'friendly',
    voice_enabled: true,
    language_mode: 'hinglish',
    upsell_enabled: true,
    theme_color: '#7c3aed'
  });
  const [advancedStats, setAdvancedStats] = useState({
    totalRevenue: 0,
    avgOrderValue: 0,
    conversionRate: 0,
    popularItems: []
  });

  const [isLoading, setIsLoading] = useState(false);
  const [loadingStates, setLoadingStates] = useState({});

  const setActionLoading = (id, state) => {
    setLoadingStates(prev => ({ ...prev, [id]: state }));
  };

  // UI States
  const [extractedReviewData, setExtractedReviewData] = useState(null);

  const [showMenuPopup, setShowMenuPopup] = useState(false);
  const [editingDishId, setEditingDishId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formError, setFormError] = useState('');
  const [newDish, setNewDish] = useState({
    name: '',
    category: '',
    price: '',
    discount_type: 'none',
    discount_value: 0,
    description: '',
    image_url: '',
    is_active: true,
    veg_type: 'veg',
    prep_time: '',
    is_featured: false,
    spice_level: 0,
    sku: '',
    options: [],
    addons: []
  });

  // Category Management
  const [showCatPopup, setShowCatPopup] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  const [showStaffPopup, setShowStaffPopup] = useState(false);
  const [showStaffPassword, setShowStaffPassword] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState(null);
  const [showNodePopup, setShowNodePopup] = useState(false);
  const [editingNodeId, setEditingNodeId] = useState(null);
  const [nodeActiveTab, setNodeActiveTab] = useState('basic');
  const [kitchenItemChecked, setKitchenItemChecked] = useState({});
  const [newStaff, setNewStaff] = useState({ name: '', email: '', password: '', role: 'admin', restaurant_id: adminUser.restaurant_id });
  const [newNode, setNewNode] = useState({
    name: '', branch_code: '', brand_name: '', description: '', branch_type: 'dine_in',
    address: '', landmark: '', city: '', state: '', country: 'India', pincode: '', latitude: '', longitude: '',
    phone: '', whatsapp_number: '', email: '', manager_name: '', emergency_contact: '',
    working_hours: {
      mon: { open: '10:00', close: '22:00' },
      tue: { open: '10:00', close: '22:00' },
      wed: { open: '10:00', close: '22:00' },
      thu: { open: '10:00', close: '22:00' },
      fri: { open: '10:00', close: '22:00' },
      sat: { open: '10:00', close: '23:00' },
      sun: { open: '10:00', close: '23:00' }
    },
    is_24x7: false, is_temp_closed: false,
    delivery_available: true, pickup_available: true, dine_in_available: true,
    cgst: 2.5, sgst: 2.5, is_round_off: true,
    gst_number: '', currency: '₹', invoice_prefix: 'INV-', bill_footer: 'Thank you for dining with us!',
    ai_enabled: true, ai_greeting: 'Welcome to Cyber Chef! Kya khilayein?', ai_language: 'Hinglish', ai_upsell_enabled: true, ai_tone: 'friendly',
    logo_url: '', cover_url: ''
  });

  const [kitchenOrders, setKitchenOrders] = useState([]);
  useEffect(() => {
    // Filter orders for KDS (Accepted or Preparing)
    const filtered = orders.filter(o => ['accepted', 'preparing'].includes(o.status));
    setKitchenOrders(filtered);
  }, [orders]);

  useEffect(() => {
    if (activeTab === 'menu_order') {
      setOrderedMenu([...menuItems]);
    }
    if (activeTab === 'sidebar_order') {
      axios.get(`${API_URL}/api/mgmt/sidebar`)
        .then(res => setOrderedSidebar(res.data.data))
        .catch(e => console.error(e));
    }
    if (activeTab === 'roles') {
      axios.get(`${API_URL}/api/mgmt/roles`)
        .then(res => setDbRoles(res.data.data))
        .catch(e => console.error(e));
    }
  }, [activeTab, menuItems]);

  // AI Menu Import States
  const [isImporting, setIsImporting] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [tableSearch, setTableSearch] = useState('');
  const [phoneSearch, setPhoneSearch] = useState('');
  const [nameSearch, setNameSearch] = useState('');
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [isEditingOrder, setIsEditingOrder] = useState(false);
  const [editFormData, setEditFormData] = useState({ name: '', phone: '' });
  const [showImportReview, setShowImportReview] = useState(false);
  const [showCouponPopup, setShowCouponPopup] = useState(false);
  const [showRiderPopup, setShowRiderPopup] = useState(false);
  const [editingRiderId, setEditingRiderId] = useState(null);
  const [newRider, setNewRider] = useState({
    name: '', phone: '', status: 'online',
    vehicle_number: '', license_number: '',
    address: '', emergency_contact: ''
  });
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    discount_type: 'percent',
    discount_value: '',
    min_order_value: '',
    usage_limit: '',
    expiry_date: '',
    is_active: true
  });
  const [editingCouponId, setEditingCouponId] = useState(null);
  const [activeWaiterCalls, setActiveWaiterCalls] = useState([]);

  const [analyticsData, setAnalyticsData] = useState({
    revenueHistory: [],
    topItems: [],
    hourlyHeatmap: [],
    staffSales: []
  });

  useEffect(() => {
    if (orders.length > 0) {
      processAnalytics();
    }
  }, [orders, menuItems]);

  const processAnalytics = () => {
    // 1. Revenue Trends (Last 7 Days)
    const revMap = {};
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    last7Days.forEach(date => revMap[date] = 0);
    orders.forEach(o => {
      const date = safeGetISODate(o);
      if (revMap[date] !== undefined) revMap[date] += parseFloat(o.total || 0);
    });
    const revenueHistory = last7Days.map(date => ({ date: date.split('-').slice(1).join('/'), amount: revMap[date] }));

    // 2. Top Performers
    const itemMap = {};
    orders.forEach(o => {
      const items = typeof o.items === 'string' ? JSON.parse(o.items) : o.items;
      (items || []).forEach(item => {
        itemMap[item.name] = (itemMap[item.name] || 0) + (item.qty || item.quantity || 1);
      });
    });
    const topItems = Object.entries(itemMap)
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    // 3. Hourly Heatmap
    const hourMap = {};
    [...Array(24)].forEach((_, i) => hourMap[i] = 0);
    orders.forEach(o => {
      const hour = new Date(o.created_at || parseInt(o.timestamp)).getHours();
      hourMap[hour] = (hourMap[hour] || 0) + 1;
    });
    const hourlyHeatmap = Object.entries(hourMap).map(([hour, count]) => ({
      time: `${hour}:00`,
      orders: count
    }));

    // 4. Staff Performance
    const staffMap = {};
    orders.forEach(o => {
      if (o.staff_id) {
        const staff = staffList.find(s => s.id === o.staff_id);
        const name = staff ? staff.name : `Staff #${o.staff_id}`;
        if (!staffMap[name]) staffMap[name] = { name, sales: 0, count: 0 };
        staffMap[name].sales += parseFloat(o.total || 0);
        staffMap[name].count += 1;
      }
    });
    const staffSales = Object.values(staffMap).sort((a, b) => b.sales - a.sales);

    setAnalyticsData({ revenueHistory, topItems, hourlyHeatmap, staffSales });
  };

  const [showManualOrderPopup, setShowManualOrderPopup] = useState(false);
  const [manualOrderSearch, setManualOrderSearch] = useState('');
  const [manualOrderData, setManualOrderData] = useState({
    tableNumber: '1',
    items: [],
    customerName: '',
    customerPhone: '',
    total: 0
  });
  const [manualOrderCategory, setManualOrderCategory] = useState('All');

  const addToManualOrder = (item) => {
    const existing = manualOrderData.items.find(i => i.id === item.id);
    let newItems;
    if (existing) {
      newItems = manualOrderData.items.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
    } else {
      newItems = [...manualOrderData.items, { ...item, qty: 1 }];
    }
    const newTotal = newItems.reduce((acc, curr) => {
      const price = parseFloat(curr.price || curr.unit_price || 0);
      const qty = parseInt(curr.qty || curr.quantity || 0);
      return acc + (price * qty);
    }, 0);
    setManualOrderData({ ...manualOrderData, items: newItems, total: newTotal });
  };

  const updateManualQty = (id, delta) => {
    const newItems = manualOrderData.items.map(i => {
      if (i.id === id) {
        const newQty = Math.max(0, i.qty + delta);
        return { ...i, qty: newQty };
      }
      return i;
    }).filter(i => i.qty > 0);
    const newTotal = newItems.reduce((acc, curr) => {
      const price = parseFloat(curr.price || curr.unit_price || 0);
      const qty = parseInt(curr.qty || curr.quantity || 0);
      return acc + (price * qty);
    }, 0);
    setManualOrderData({ ...manualOrderData, items: newItems, total: newTotal });
  };

  const submitManualOrder = async () => {
    if (manualOrderData.items.length === 0) return alert("Please add at least one item");
    try {
      if (isEditingOrder) {
        await axios.put(`${API_URL}/api/orders/${manualOrderData.id}`, {
          customer_name: manualOrderData.customerName,
          customer_phone: manualOrderData.customerPhone,
          items: manualOrderData.items,
          tablenumber: manualOrderData.tableNumber,
          total: manualOrderData.total
        });
      } else {
        await axios.post(`${API_URL}/api/orders`, {
          ...manualOrderData,
          restaurant_id: adminUser.restaurant_id,
          status: 'pending'
        });
      }
      setShowManualOrderPopup(false);
      setIsEditingOrder(false);
      setManualOrderData({ tableNumber: '1', items: [], customerName: '', customerPhone: '', total: 0 });
      fetchData();
    } catch (e) { alert(isEditingOrder ? "Failed to update order" : "Failed to place order"); }
  };

  const generateCouponCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const prefix = ['OFFER', 'DEAL', 'SAVE', 'RESTO', 'CYBER'][Math.floor(Math.random() * 5)];
    let code = prefix;
    for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
    setNewCoupon({ ...newCoupon, code });
  };

  const toggleCouponStatus = async (coupon) => {
    try {
      await axios.put(`${API_URL}/api/mgmt/coupons/${coupon.id}`, { ...coupon, is_active: !coupon.is_active });
      fetchData();
    } catch (e) { alert("Failed to toggle status"); }
  };

  const handleEditCoupon = (coupon) => {
    setEditingCouponId(coupon.id);
    setNewCoupon({ ...coupon, expiry_date: coupon.expiry_date ? coupon.expiry_date.split('T')[0] : '' });
    setShowCouponPopup(true);
  };

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
    axios.get(`${API_URL}/api/mgmt/roles`)
      .then(res => setDbRoles(res.data.data))
      .catch(e => console.error(e));
    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));
    socket.on('waiter_alert', (data) => {
      const isMyRest = String(data.restaurant_id) === String(adminUser?.restaurant_id || 4);
      const isSuper = adminUser?.role === 'super_admin';

      if (isMyRest || isSuper) {
        setActiveWaiterCalls(prev => {
          const exists = prev.find(c => String(c.table_number) === String(data.table_number));
          if (exists) return prev;
          return [...prev, data];
        });
      }
    });
    socket.on('new_order', (order) => {
      console.log("📥 Admin Socket: new_order received", order);
      const isMyRest = String(order.restaurant_id) === String(adminUser.restaurant_id);
      const isSuper = adminUser.role === 'super_admin';

      if (isMyRest || isSuper) {
        setOrders(prev => {
          if (prev.find(o => o.id === order.id)) return prev;
          return [order, ...prev];
        });
        new Audio('/order-alert.mp3').play().catch(() => { });
      }
    });

    socket.on('order_updated', (updatedOrder) => {
      console.log("📥 Admin Socket: order_updated received", updatedOrder);
      const isMyRest = String(updatedOrder.restaurant_id) === String(adminUser.restaurant_id);
      const isSuper = adminUser.role === 'super_admin';

      if (isMyRest || isSuper) {
        setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
      }
    });

    // Removed fallback polling to prevent frequent API calls
    // Polling was at 60s, but user reported much more frequent calls

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('new_order');
      socket.off('order_updated');
    };
  }, [adminUser.id, adminUser.restaurant_id, activeTab]);

  useEffect(() => {
    if (activeTab === 'feedback') {
      fetchData();
    }
  }, [activeTab]);

  const isFetching = useRef(false);
  const fetchData = async (reason = 'Manual/Initial') => {
    if (!adminUser.id || isFetching.current) return;
    isFetching.current = true;
    setIsLoading(true);
    try {
      const auth = { params: { restaurant_id: adminUser.restaurant_id } };
      const fetchHelper = (url) => axios.get(url, auth).catch(err => {
        console.warn(`⚠️ Partial Fetch Failure for ${url}:`, err.message);
        return { data: { data: [] } };
      });

      // 1. Core Data (Always needed)
      const [ordersRes, menuRes, catRes] = await Promise.all([
        fetchHelper(`${API_URL}/api/orders`),
        fetchHelper(`${API_URL}/api/menu`),
        fetchHelper(`${API_URL}/api/menu/categories`)
      ]);

      setOrders(ordersRes.data.data || []);
      setMenuItems(menuRes.data.data || []);
      setCategories(catRes.data.data || []);

      // 2. Tab Specific Data
      if (activeTab === 'dashboard' || activeTab === 'reports') {
        // Stats already fetched or handled via orders analytics in frontend
      }

      if (activeTab === 'staff') {
        const staffRes = await fetchHelper(`${API_URL}/api/users`);
        setStaffList(staffRes.data.data || []);
      }

      if (activeTab === 'restaurants') {
        const restRes = await axios.get(`${API_URL}/api/mgmt/restaurants`).catch(() => ({ data: { data: [] } }));
        setRestaurantsList(restRes.data.data || []);
      }

      if (activeTab === 'feedback') {
        const fbRes = await fetchHelper(`${API_URL}/api/mgmt/feedback`);
        setFeedbackList(fbRes.data.data || []);
      }

      if (activeTab === 'rider_fleet') {
        const ridersRes = await fetchHelper(`${API_URL}/api/mgmt/riders`);
        setRidersList(ridersRes.data.data || []);
      }

      if (activeTab === 'dashboard' || activeTab === 'orders' || activeTab === 'reports' || activeTab === 'qr_codes') {
        const tablesRes = await fetchHelper(`${API_URL}/api/tables`);
        setRestaurantTables(tablesRes.data.data || []);
      }

      if (activeTab === 'coupons') {
        const couponsRes = await fetchHelper(`${API_URL}/api/mgmt/coupons`);
        setCoupons(couponsRes.data.data || []);
      }

    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setIsLoading(false);
      isFetching.current = false;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    window.location.href = '/admin/login';
  };

  const updateOrderStatus = async (id, status) => {
    setActionLoading(id, true);
    try {
      await axios.put(`${API_URL}/api/orders/${id}/status`, { status });
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    } catch (e) {
      console.error(e);
      alert("Failed to update status");
    } finally {
      setActionLoading(id, false);
    }
  };

  const handleOrderUpdate = async (orderId) => {
    try {
      await axios.put(`${API_URL}/api/orders/${orderId}`, {
        customer_name: editFormData.name,
        customer_phone: editFormData.phone,
        items: editFormData.items
      });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, customer_name: editFormData.name, customer_phone: editFormData.phone, customerName: editFormData.name, customerPhone: editFormData.phone, items: editFormData.items } : o));
      setEditingOrderId(null);
    } catch (err) {
      console.error("Update failed:", err);
      alert("Failed to update order");
    }
  };
  const handlePrintBill = (order) => {
    try {
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      if (!printWindow) {
        alert("🚨 Popup Blocked! Please allow popups for this site to print bills.");
        return;
      }

      const itemsHtml = (order.items || []).map(item => `
        <tr>
          <td style="padding: 5px; font-size: 14px;">${item.name} ${item.selectedVariant ? '(' + item.selectedVariant.size + ')' : ''} ${item.selectedAddons && item.selectedAddons.length > 0 ? '[+' + item.selectedAddons.map(a => a.name).join(', ') + ']' : ''}</td>
          <td style="padding: 5px; font-size: 14px; text-align: center;">${item.qty || 1}</td>
          <td style="padding: 5px; font-size: 14px; text-align: right;">₹${item.price * (item.qty || 1)}</td>
        </tr>
      `).join('');

      const html = `
        <html>
          <head>
            <title>Invoice - Table ${order.table_number || order.tableNumber}</title>
            <style>
              body { font-family: 'Courier New', monospace; padding: 20px; color: #000; }
              .header { text-align: center; border-bottom: 1px dashed #000; padding-bottom: 10px; margin-bottom: 10px; }
              .title { font-size: 18px; font-weight: bold; margin: 0; }
              table { width: 100%; border-collapse: collapse; margin: 15px 0; }
              .total { font-size: 16px; font-weight: bold; border-top: 1px dashed #000; padding-top: 10px; text-align: right; }
              .footer { text-align: center; margin-top: 20px; font-size: 12px; border-top: 1px dashed #000; padding-top: 10px; }
              @media print {
                body { padding: 0; margin: 0; }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <p class="title">AI RESTO</p>
              <p>Table: ${order.table_number || order.tableNumber}</p>
              <p>Order ID: #${order.id}</p>
              <p>Date: ${new Date().toLocaleString()}</p>
            </div>
            <table>
              <thead>
                <tr style="border-bottom: 1px dashed #000;">
                  <th style="text-align: left; padding: 5px;">Item</th>
                  <th style="padding: 5px;">Qty</th>
                  <th style="text-align: right; padding: 5px;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
            ${order.applied_coupon && order.discount_amount > 0 ? `<div style="text-align: right; padding-right: 5px; font-size: 14px; color: #10b981; border-top: 1px dashed #000; padding-top: 5px;">Discount (${order.applied_coupon}): -₹${order.discount_amount}</div>` : ''}
            <div class="total">Grand Total: ₹${order.total}</div>
            <div class="footer">
              <p>Thank you for dining with us!</p>
              <p>Visit again soon!</p>
            </div>
            <script>
              window.onload = function() {
                setTimeout(() => {
                  window.print();
                  window.close();
                }, 500);
              };
            </script>
          </body>
        </html>
      `;

      printWindow.document.write(html);
      printWindow.document.close();
    } catch (e) {
      console.error("Print Error:", e);
      alert("Failed to initiate print process: " + e.message);
    }
  };

  const printTableQR = (tableUrl, tableName) => {
    try {
      const printWindow = window.open('', '', 'width=600,height=800');
      if (!printWindow) throw new Error("Popup blocker prevented printing.");

      const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(tableUrl)}`;

      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Print QR - ${tableName}</title>
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #fff; color: #000; }
              .card { border: 4px solid #000; padding: 40px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); max-width: 400px; width: 100%; }
              h1 { font-size: 42px; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 2px; }
              img { width: 300px; height: 300px; margin: 20px 0; border: 8px solid #000; border-radius: 10px; }
              p { font-size: 24px; font-weight: bold; margin-top: 10px; color: #444; }
              .scan-text { font-size: 32px; font-weight: 900; margin-top: 20px; background: #000; color: #fff; padding: 10px 20px; border-radius: 10px; display: inline-block; }
            </style>
          </head>
          <body>
            <div class="card">
              <h1>${tableName}</h1>
              <p>Scan to Order & Pay</p>
              <img src="${qrImageUrl}" alt="QR" onload="window.print(); window.close();" />
              <div class="scan-text">SCAN ME</div>
            </div>
          </body>
        </html>
      `;

      printWindow.document.write(html);
      printWindow.document.close();
    } catch (e) {
      alert("Print failed: " + e.message);
    }
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

    setActionLoading('save_dish', true);
    try {
      if (editingDishId) {
        await axios.put(`${API_URL}/api/menu/${editingDishId}`, newDish);
      } else {
        await axios.post(`${API_URL}/api/menu`, { ...newDish, restaurant_id: adminUser.restaurant_id });
      }
      setShowMenuPopup(false);
      fetchData();
    } catch (e) {
      console.error(e);
      alert("Failed to save dish");
    } finally {
      setActionLoading('save_dish', false);
    }
  };

  const deleteDish = async (id) => {
    if (!window.confirm("Are you sure you want to delete this neural dish?")) return;
    setActionLoading(`delete_dish_${id}`, true);
    try {
      await axios.delete(`${API_URL}/api/menu/${id}`);
      fetchData();
    } catch (e) {
      console.error(e);
      alert("Failed to delete dish");
    } finally {
      setActionLoading(`delete_dish_${id}`, false);
    }
  };

  const toggleDishActive = async (item) => {
    setActionLoading(`toggle_dish_${item.id}`, true);
    try {
      await axios.put(`${API_URL}/api/menu/${item.id}`, { ...item, is_active: !item.is_active });
      fetchData();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(`toggle_dish_${item.id}`, false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCatName) return;
    setActionLoading('add_category', true);
    try {
      await axios.post(`${API_URL}/api/menu/categories`, { name: newCatName, restaurant_id: adminUser.restaurant_id });
      setNewCatName('');
      setShowCatPopup(false);
      fetchData();
    } catch (e) {
      console.error(e);
      alert("Failed to add category");
    } finally {
      setActionLoading('add_category', false);
    }
  };
  const handleAddStaff = async (e) => {
    e.preventDefault();
    setActionLoading('save_staff', true);
    try {
      if (editingStaffId) {
        await axios.put(`${API_URL}/api/users/${editingStaffId}`, newStaff);
        alert("Staff updated successfully!");
      } else {
        await axios.post(`${API_URL}/api/users`, newStaff);
        alert("Staff recruited successfully!");
      }
      setShowStaffPopup(false);
      setEditingStaffId(null);
      setNewStaff({ name: '', email: '', password: '', role: 'admin', restaurant_id: adminUser.restaurant_id });
      fetchData();
    } catch (e) {
      console.error(e);
      alert("Action failed: " + e.message);
    } finally {
      setActionLoading('save_staff', false);
    }
  };

  const handleAddNode = async (e) => {
    e.preventDefault();
    setActionLoading('save_node', true);
    try {
      if (editingNodeId) {
        await axios.put(`${API_URL}/api/restaurants/${editingNodeId}`, newNode);
        alert("Node updated successfully!");
      } else {
        await axios.post(`${API_URL}/api/restaurants`, newNode);
        alert("Node deployed successfully!");
      }
      setShowNodePopup(false);
      setEditingNodeId(null);
      setNewNode({
        name: '', branch_code: '', brand_name: '', description: '', branch_type: 'dine_in',
        address: '', landmark: '', city: '', state: '', country: 'India', pincode: '', latitude: '', longitude: '',
        phone: '', whatsapp_number: '', email: '', manager_name: '', emergency_contact: '',
        working_hours: {
          mon: { open: '10:00', close: '22:00' },
          tue: { open: '10:00', close: '22:00' },
          wed: { open: '10:00', close: '22:00' },
          thu: { open: '10:00', close: '22:00' },
          fri: { open: '10:00', close: '22:00' },
          sat: { open: '10:00', close: '23:00' },
          sun: { open: '10:00', close: '23:00' }
        },
        is_24x7: false, is_temp_closed: false,
        delivery_available: true, pickup_available: true, dine_in_available: true,
        delivery_radius: 5, min_order_amount: 149, delivery_charges: 29, free_delivery_above: 499, avg_delivery_time: 30,
        cgst: 2.5, sgst: 2.5, is_round_off: true,
        gst_number: '', currency: '₹', invoice_prefix: 'INV-', bill_footer: 'Thank you for dining with us!',
        ai_enabled: true, ai_greeting: 'Welcome to Cyber Chef! Kya khilayein?', ai_language: 'Hinglish', ai_upsell_enabled: true, ai_tone: 'friendly',
        logo_url: '', cover_url: ''
      });
      fetchData();
    } catch (e) {
      console.error(e);
      alert("Action failed: " + e.message);
    } finally {
      setActionLoading('save_node', false);
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to terminate this neural contract?")) return;
    setActionLoading(`delete_user_${id}`, true);
    try {
      await axios.delete(`${API_URL}/api/users/${id}`);
      fetchData();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(`delete_user_${id}`, false);
    }
  };

  const deleteRestaurant = async (id) => {
    if (!window.confirm("WARNING: Deleting this restaurant will wipe all associated data. Proceed?")) return;
    setActionLoading(`delete_restaurant_${id}`, true);
    try {
      await axios.delete(`${API_URL}/api/restaurants/${id}`);
      fetchData();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(`delete_restaurant_${id}`, false);
    }
  };

  const handleEditRider = (rider) => {
    setEditingRiderId(rider.id);
    setNewRider({
      name: rider.name,
      phone: rider.phone,
      status: rider.status || 'online',
      vehicle_number: rider.vehicle_number || '',
      license_number: rider.license_number || '',
      address: rider.address || '',
      emergency_contact: rider.emergency_contact || ''
    });
    setShowRiderPopup(true);
  };

  const handleDeleteRider = async (id) => {
    if (window.confirm("Are you sure you want to remove this rider from the fleet?")) {
      try {
        await axios.delete(`${API_URL}/api/mgmt/riders/${id}`);
        fetchData();
      } catch (err) { alert("Failed to remove rider"); }
    }
  };

  const handleSaveRider = async () => {
    try {
      if (editingRiderId) {
        await axios.put(`${API_URL}/api/mgmt/riders/${editingRiderId}`, { ...newRider });
      } else {
        await axios.post(`${API_URL}/api/mgmt/riders`, { ...newRider, restaurant_id: adminUser.restaurant_id });
      }
      setShowRiderPopup(false);
      setEditingRiderId(null);
      setNewRider({
        name: '', phone: '', status: 'online',
        vehicle_number: '', license_number: '',
        address: '', emergency_contact: ''
      });
      fetchData();
    } catch (e) { alert(editingRiderId ? "Failed to update rider" : "Failed to recruit rider"); }
  };

  const deleteCoupon = async (id) => {
    if (!window.confirm("Are you sure you want to deactivate this neural promotion?")) return;
    try {
      await axios.delete(`${API_URL}/api/mgmt/coupons/${id}`);
      fetchData();
    } catch (e) { alert("Failed to delete coupon"); }
  };

  const getPermittedTabs = (roleName) => {
    // Priority 1: Dynamic Roles from Database
    const matchedDbRole = dbRoles.find(r => r.name.toLowerCase() === roleName?.toLowerCase());
    if (matchedDbRole) return matchedDbRole.permissions;

    // Priority 2: Hardcoded Defaults (Fallback)
    const permissions = {
      super_admin: ['dashboard', 'orders', 'kitchen', 'marketing', 'menu', 'menu_order', 'sidebar_order', 'coupons', 'customers', 'rider_fleet', 'inventory', 'reports', 'qr_codes', 'feedback', 'settings', 'staff', 'restaurants', 'roles', 'combos'],
      manager: ['dashboard', 'orders', 'kitchen', 'marketing', 'menu', 'menu_order', 'coupons', 'customers', 'rider_fleet', 'inventory', 'reports', 'qr_codes', 'feedback', 'settings', 'combos'],
      staff: ['orders'],
      chef: ['kitchen', 'orders']
    };
    return permissions[roleName] || ['orders'];
  };

  if (!getPermittedTabs(adminUser.role).includes(activeTab)) {
    return (
      <div className="admin-layout" style={{ background: 'var(--bg-deep)', color: 'white', display: 'flex', minHeight: '100vh' }}>
        <AdminSidebar activeTab={activeTab} setActiveTab={handleTabChange} adminUser={adminUser} onLogout={handleLogout} />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
          <div className="glass-panel text-center animate-slide-up" style={{ maxWidth: '440px', padding: '60px', background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '32px' }}>
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <AlertCircle size={40} style={{ color: '#ef4444' }} />
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '12px', color: 'white' }}>ACCESS RESTRICTED</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '15px', lineHeight: '1.6' }}>Your role (<strong>{adminUser.role}</strong>) does not have permission to access the <strong style={{ color: 'var(--accent-primary)' }}>{activeTab}</strong> module.</p>
            <button className="btn-primary" onClick={() => handleTabChange('orders')} style={{ width: '100%', padding: '14px', borderRadius: '14px' }}>Return to Safety</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout animate-fade-in">
      {isLoading && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(10, 10, 11, 0.8)', backdropFilter: 'blur(8px)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          zIndex: 10000, color: 'white', fontFamily: 'Inter, sans-serif'
        }}>
          <div className="premium-loader" style={{
            width: '60px', height: '60px', border: '3px solid rgba(124, 58, 237, 0.1)',
            borderTop: '3px solid #7c3aed', borderRadius: '50%', animation: 'spin 1s linear infinite',
            boxShadow: '0 0 20px rgba(124, 58, 237, 0.3)'
          }}></div>
          <h2 style={{ marginTop: '24px', fontWeight: '300', letterSpacing: '4px', fontSize: '14px', animation: 'pulse 2s infinite' }}>
            NEURAL HUB SYNCHRONIZING
          </h2>
        </div>
      )}
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
          // background: var(--input-bg) !important;
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
          // background: var(--input-bg) !important;
          border: 1px solid var(--input-border) !important;
          color: var(--text-main) !important;
        }
        .scrollbar-hidden::-webkit-scrollbar { display: none; }
        .scrollbar-hidden { -ms-overflow-style: none; scrollbar-width: none; }
        
        .spinner-small {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255,255,255,0.2);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        adminUser={adminUser}
        onLogout={handleLogout}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      <main className={`admin-main ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <header className="main-header">
          <div className="header-search">
            <Search size={20} color="var(--text-muted)" />
            <input type="text" placeholder="Neural Search Engine..." />
          </div>
          <div className="header-profile-premium">
            <div style={{ position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center' }} onClick={() => {
              if (activeWaiterCalls.length > 0) setActiveWaiterCalls([]); // temp clear all
            }}>
              <Bell size={22} color={activeWaiterCalls.length > 0 ? '#ef4444' : 'var(--text-muted)'} className={activeWaiterCalls.length > 0 ? 'pulse' : ''} />
              {activeWaiterCalls.length > 0 && (
                <span style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#ef4444', color: 'white', fontSize: '10px', fontWeight: '900', padding: '2px 6px', borderRadius: '10px', border: '2px solid var(--bg-deep)' }}>
                  {activeWaiterCalls.length}
                </span>
              )}
              {activeWaiterCalls.length > 0 && (
                <div className="animate-fade-in" style={{ position: 'absolute', top: '35px', right: '-10px', background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '12px', padding: '12px', width: '220px', boxShadow: 'rgba(0, 0, 0, 0.4) 0px 10px 20px', zIndex: 100 }}>
                  <div style={{ fontSize: '12px', fontWeight: '800', marginBottom: '8px', color: 'var(--text-muted)' }}>SERVICE ALERTS</div>
                  {activeWaiterCalls.map((c, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: 'var(--bg-secondary)', borderRadius: '8px', marginBottom: '4px' }}>
                      <span style={{ fontWeight: '700', fontSize: '13px', color: 'var(--text-main)' }}>Table {c.table_number}</span>
                      <span style={{ fontSize: '11px', color: 'var(--accent-primary)' }}>{new Date(c.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  ))}
                  <div style={{ fontSize: '11px', textAlign: 'center', marginTop: '8px', color: '#ef4444' }}>Click bell to dismiss all</div>
                </div>
              )}
            </div>

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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <h1 className="view-title">Orders Hub</h1>
                    <button
                      onClick={fetchData}
                      className="btn-icon"
                      disabled={isLoading}
                      title="Manual Refresh"
                      style={{
                        background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)',
                        padding: '8px', borderRadius: '10px', color: 'var(--text-muted)',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}
                    >
                      <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
                    </button>
                  </div>
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
                    />
                  </div>
                  <div className="filter-group">
                    <label><Search size={14} /> Table #</label>
                    <select
                      className="filter-input"
                      value={tableSearch}
                      onChange={(e) => setTableSearch(e.target.value)}
                      style={{ width: '130px' }}
                    >
                      <option value="">All Tables</option>
                      {restaurantTables.map((t, idx) => (
                        <option key={idx} value={t.table_number || (idx + 1)}>
                          {t.name || t.table || `Table ${t.table_number || (idx + 1)}`}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="filter-group">
                    <label><Phone size={14} /> Phone</label>
                    <input
                      type="text"
                      placeholder="9876..."
                      className="filter-input"
                      value={phoneSearch}
                      onChange={(e) => setPhoneSearch(e.target.value)}
                      style={{ width: '120px' }}
                    />
                  </div>
                  <div className="filter-group">
                    <label><Users size={14} /> Name</label>
                    <input
                      type="text"
                      placeholder="Customer Name..."
                      className="filter-input"
                      value={nameSearch}
                      onChange={(e) => setNameSearch(e.target.value)}
                      style={{ width: '150px' }}
                    />
                  </div>
                  <div className="filter-stats">
                    Matches: <strong>{orders.filter(o => {
                      const matchDate = safeGetISODate(o) === selectedDate;
                      const matchTable = tableSearch ? (o.table_number || o.tableNumber || '').toString() === tableSearch.toString() : true;
                      const matchPhone = phoneSearch ? (o.customer_phone || '').includes(phoneSearch) : true;
                      const matchName = nameSearch ? (o.customer_name || '').toLowerCase().includes(nameSearch.toLowerCase()) : true;
                      return matchDate && matchTable && matchPhone && matchName;
                    }).length}</strong>
                  </div>
                  <button className="btn-primary" onClick={() => setShowManualOrderPopup(true)} style={{ padding: '8px 16px', borderRadius: '12px', background: 'linear-gradient(135deg, #10b981, #059669)', marginLeft: '12px', height: '40px' }}>
                    <Plus size={18} /> New Order
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '24px', alignItems: 'start', marginTop: '24px', overflowX: 'auto', paddingBottom: '20px' }}>
                {['pending', 'accepted', 'preparing', 'out_for_delivery', 'completed', 'cancelled'].map(columnStatus => (
                  <div key={columnStatus} style={{ minWidth: '320px', background: 'var(--bg-deep)', border: '1px solid var(--card-border)', borderRadius: '24px', padding: '20px', minHeight: '600px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '2px solid var(--card-border)' }}>
                      <h3 style={{ textTransform: 'uppercase', fontSize: '13px', fontWeight: '800', color: columnStatus === 'pending' ? 'var(--warning)' : columnStatus === 'completed' ? 'var(--success)' : columnStatus === 'cancelled' ? 'var(--error)' : 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: columnStatus === 'pending' ? 'var(--warning)' : columnStatus === 'completed' ? 'var(--success)' : columnStatus === 'cancelled' ? 'var(--error)' : 'var(--accent-primary)' }} />
                        {columnStatus.replace(/_/g, ' ')}
                      </h3>
                      <span style={{ fontSize: '12px', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '10px', color: 'var(--text-dim)', fontWeight: '700' }}>
                        {orders.filter(o => {
                          const matchStatus = o.status === columnStatus;
                          const matchDate = safeGetISODate(o) === selectedDate;
                          const matchTable = tableSearch ? (o.table_number || o.tableNumber || '').toString().toLowerCase().includes(tableSearch.toLowerCase()) : true;
                          const matchPhone = phoneSearch ? (o.customer_phone || '').includes(phoneSearch) : true;
                          return matchStatus && matchDate && matchTable && matchPhone;
                        }).length}
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', maxHeight: 'calc(100vh - 280px)' }} className="scrollbar-hidden">
                      {orders.filter(o => {
                        const matchStatus = o.status === columnStatus;
                        const matchDate = safeGetISODate(o) === selectedDate;
                        const matchTable = tableSearch ? (o.table_number || o.tableNumber || '').toString() === tableSearch.toString() : true;
                        const matchPhone = phoneSearch ? (o.customer_phone || '').includes(phoneSearch) : true;
                        const matchName = nameSearch ? (o.customer_name || '').toLowerCase().includes(nameSearch.toLowerCase()) : true;
                        return matchStatus && matchDate && matchTable && matchPhone && matchName;
                      }).map(order => (
                        <div key={order.id} style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '16px', padding: '16px', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ fontSize: '13px', fontWeight: '800', background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '8px', color: 'var(--text-main)' }}>
                              Table {order.table_number || order.tableNumber}
                            </div>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-dim)', border: '1px solid var(--card-border)', padding: '4px 8px', fontSize: '12px', borderRadius: '8px', fontWeight: '700' }}>#{order.id}</span>
                            </span>
                          </div>

                          {(order.customerName || order.customer_name || order.customerPhone || order.customer_phone) && (
                            <div style={{ fontSize: '12px', color: 'var(--text-dim)', display: 'flex', flexDirection: 'column', gap: '4px', padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.02)', position: 'relative' }}>
                              {editingOrderId === order.id ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                  <input
                                    className="filter-input"
                                    value={editFormData.name}
                                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                                    placeholder="Name"
                                    style={{ padding: '2px 8px', fontSize: '11px', height: '28px' }}
                                  />
                                  <input
                                    className="filter-input"
                                    value={editFormData.phone}
                                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                                    placeholder="Phone"
                                    style={{ padding: '2px 8px', fontSize: '11px', height: '28px' }}
                                  />
                                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                                    <button onClick={() => handleOrderUpdate(order.id)} style={{ padding: '2px 8px', background: 'var(--success)', border: 'none', borderRadius: '4px', color: 'white', cursor: 'pointer', fontSize: '10px' }}>Save</button>
                                    <button onClick={() => setEditingOrderId(null)} style={{ padding: '2px 8px', background: 'var(--danger)', border: 'none', borderRadius: '4px', color: 'white', cursor: 'pointer', fontSize: '10px' }}>Cancel</button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <button
                                    onClick={() => {
                                      setEditingOrderId(order.id);
                                      setEditFormData({
                                        name: order.customerName || order.customer_name || '',
                                        phone: order.customerPhone || order.customer_phone || ''
                                      });
                                    }}
                                    style={{ position: 'absolute', top: '8px', right: '8px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', opacity: 0.5 }}
                                  >
                                    <Edit2 size={11} />
                                  </button>
                                  {(order.customerName || order.customer_name) && <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ color: 'var(--text-muted)' }}>Customer:</span> <strong style={{ color: 'var(--text-main)' }}>{order.customerName || order.customer_name}</strong>
                                    {order.customerSeat && <span style={{ marginLeft: '4px', background: 'rgba(124, 58, 237, 0.2)', padding: '2px 6px', borderRadius: '4px', color: 'var(--accent-primary)', fontSize: '11px', fontWeight: '800' }}>🪑 {order.customerSeat}</span>}
                                  </div>}
                                  {!order.customerName && !order.customer_name && order.customerSeat && <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ color: 'var(--text-muted)' }}>Seat:</span> <strong style={{ background: 'rgba(124, 58, 237, 0.2)', padding: '2px 6px', borderRadius: '4px', color: 'var(--accent-primary)', fontSize: '11px', fontWeight: '800' }}>🪑 {order.customerSeat}</strong></div>}
                                  {(order.customerPhone || order.customer_phone) && <div><span style={{ color: 'var(--text-muted)' }}>Phone:</span> <strong style={{ color: 'var(--text-main)' }}>{order.customerPhone || order.customer_phone}</strong></div>}
                                </>
                              )}
                            </div>
                          )}

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '10px 0', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            {(order.items || []).map((item, idx) => {
                              let hasDiscount = item.discount_value > 0 && item.discount_type && item.discount_type !== 'none';
                              let dVal = Number(item.discount_value || 0);
                              let displayDVal = Number.isInteger(dVal) ? dVal : dVal.toFixed(2);
                              let discountBadgeText = item.discount_type === 'percent' ? `${displayDVal}% OFF` : `₹${displayDVal} OFF`;

                              return (
                                <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      <span style={{ fontWeight: '800', color: 'var(--accent-primary)', background: 'rgba(124, 58, 237, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>{item.qty || 1}</span>
                                      <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>
                                        {item.name}
                                        {item.selectedVariant && <span style={{ opacity: 0.7, fontSize: '11px', color: 'var(--warning)', marginLeft: '4px' }}>({item.selectedVariant.size})</span>}
                                        {item.selectedAddons && item.selectedAddons.length > 0 && <span style={{ opacity: 0.6, fontSize: '10px', marginLeft: '4px' }}>[+{item.selectedAddons.map(a => a.name).join(', ')}]</span>}
                                      </span>
                                    </div>
                                    <span style={{ color: 'var(--text-dim)' }}>₹{(item.price || 0) * (item.qty || 1)}</span>
                                  </div>
                                  {hasDiscount && (
                                    <div style={{ paddingLeft: '32px', fontSize: '10px' }}>
                                      <span style={{ color: '#3b82f6', fontWeight: '800', background: 'rgba(59, 130, 246, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                                        {discountBadgeText}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                            {order.notes && (
                              <div style={{ marginTop: '12px', padding: '8px 12px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', borderLeft: '4px solid #ef4444', fontSize: '13px', color: '#fca5a5' }}>
                                <strong style={{ color: '#ef4444' }}>Notes:</strong> {order.notes}
                              </div>
                            )}
                            <button
                              onClick={() => {
                                setIsEditingOrder(true);
                                const initialItems = [...(order.items || [])];
                                const initialTotal = initialItems.reduce((acc, curr) => {
                                  const price = parseFloat(curr.price || curr.unit_price || 0);
                                  const qty = parseInt(curr.qty || curr.quantity || 1);
                                  return acc + (price * qty);
                                }, 0);

                                setManualOrderData({
                                  id: order.id,
                                  tableNumber: (order.table_number || order.tableNumber || '1').toString(),
                                  customerName: order.customerName || order.customer_name || '',
                                  customerPhone: order.customerPhone || order.customer_phone || '',
                                  items: initialItems,
                                  total: initialTotal
                                });
                                setShowManualOrderPopup(true);
                              }}
                              style={{ marginTop: '8px', background: 'rgba(124, 58, 237, 0.05)', border: '1px dashed var(--accent-primary)', color: 'var(--accent-primary)', borderRadius: '8px', padding: '6px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}
                            >
                              <Edit size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Edit Items
                            </button>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              {order.applied_coupon && order.discount_amount > 0 && (
                                <span style={{ fontSize: '11px', color: '#10b981', fontWeight: '800' }}>
                                  {order.applied_coupon} Applied (-₹{order.discount_amount})
                                </span>
                              )}
                              <span style={{ fontSize: '13px', color: 'var(--text-main)', fontWeight: '800' }}>Total: <strong>₹{order.total}</strong></span>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <button
                                onClick={() => handlePrintBill(order)}
                                style={{ padding: '6px 10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', borderRadius: '8px', color: 'var(--text-dim)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                title="Print Bill"
                              >
                                <Printer size={16} />
                              </button>

                              {order.status === 'pending' && (
                                <button onClick={() => updateOrderStatus(order.id, 'accepted')} className="btn-primary" style={{ padding: '6px 12px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }} disabled={loadingStates[order.id]}>
                                  {loadingStates[order.id] ? <div className="spinner-small" /> : 'Accept'}
                                </button>
                              )}
                              {order.status === 'accepted' && (
                                <button onClick={() => updateOrderStatus(order.id, 'preparing')} className="btn-primary" style={{ padding: '6px 12px', fontSize: '11px', background: 'var(--accent-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }} disabled={loadingStates[order.id]}>
                                  {loadingStates[order.id] ? <div className="spinner-small" /> : 'Start Preparing'}
                                </button>
                              )}
                              {order.status === 'preparing' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                  <select
                                    className="rider-select"
                                    disabled={loadingStates[order.id]}
                                    onChange={async (e) => {
                                      const rId = e.target.value;
                                      if (!rId) return;
                                      setActionLoading(order.id, true);
                                      try {
                                        await axios.post(`${API_URL}/api/mgmt/orders/assign-rider`, { order_id: order.id, rider_id: rId });
                                        fetchData();
                                      } catch (e) { alert("Assignment failed"); }
                                      finally { setActionLoading(order.id, false); }
                                    }}
                                    style={{ padding: '6px 10px', borderRadius: '8px', background: 'var(--bg-deep)', color: 'white', border: '1px solid var(--card-border)', fontSize: '11px', outline: 'none' }}
                                  >
                                    <option value="">Assign Rider</option>
                                    {riders.filter(r => r.status !== 'offline').map(r => (
                                      <option key={r.id} value={r.id}>{r.name} ({r.status})</option>
                                    ))}
                                  </select>
                                  <button onClick={() => updateOrderStatus(order.id, 'out_for_delivery')} className="btn-primary" style={{ padding: '6px 12px', fontSize: '11px', background: '#3b82f6', display: 'flex', alignItems: 'center', gap: '6px' }} disabled={loadingStates[order.id]}>
                                    {loadingStates[order.id] ? <div className="spinner-small" /> : 'Dispatch'}
                                  </button>
                                </div>
                              )}
                              {order.status === 'out_for_delivery' && (
                                <button onClick={() => updateOrderStatus(order.id, 'completed')} className="btn-primary" style={{ padding: '6px 12px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }} disabled={loadingStates[order.id]}>
                                  {loadingStates[order.id] ? <div className="spinner-small" /> : 'Mark Delivered'}
                                </button>
                              )}
                              {order.status !== 'completed' && order.status !== 'cancelled' && (
                                <button onClick={() => updateOrderStatus(order.id, 'cancelled')} style={{ padding: '6px 12px', fontSize: '11px', borderRadius: '8px', border: '1px solid var(--error)', color: 'var(--error)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }} disabled={loadingStates[order.id]}>
                                  {loadingStates[order.id] ? <div className="spinner-small" /> : 'Cancel'}
                                </button>
                              )}
                            </div>
                          </div>
                          {(order.customerPhone || order.customer_phone) && (
                            <a href={`tel:${order.customerPhone || order.customer_phone}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', fontSize: '12px', fontWeight: '700', marginTop: '10px' }}>
                              <Phone size={14} /> Call Customer
                            </a>
                          )}
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
                <div className="flex gap-4 items-center flex-wrap" style={{ justifyContent: 'flex-end', display: 'flex', gap: '8px' }}>
                  {/* <label className="btn-secondary" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                  </label> */}
                  <button className="btn-secondary" onClick={fetchData}>
                    <Clock size={18} /> Refresh Hub
                  </button>
                  {/* <button className="btn-primary" style={{ borderRadius: '14px', background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
                    <Bot size={18} /> AI Menu Insights
                  </button> */}
                  <button className="btn-secondary" onClick={() => setShowCatPopup(true)}>
                    <Settings size={20} />
                    <span>Manage Categories</span>
                  </button>
                  <button className="btn-primary" onClick={() => {
                    setNewDish({ name: '', category: '', price: '', description: '', image_url: '', is_active: true, veg_type: 'veg', options: [], available_from: '', available_to: '' });
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
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingLeft: '12px', borderLeft: '4px solid var(--accent-primary)', cursor: 'pointer', userSelect: 'none' }}
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
                                    <strong className="text-lg" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                      {item.veg_type === 'veg' && (
                                        <div style={{ width: '12px', height: '12px', border: '1px solid #22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '2px', flexShrink: 0 }}>
                                          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e' }}></div>
                                        </div>
                                      )}
                                      {item.veg_type === 'nonveg' && (
                                        <div style={{ width: '12px', height: '12px', border: '1px solid #ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '2px', flexShrink: 0 }}>
                                          <div style={{ width: '0', height: '0', borderLeft: '3px solid transparent', borderRight: '3px solid transparent', borderBottom: '6px solid #ef4444' }}></div>
                                        </div>
                                      )}
                                      {item.veg_type === 'egg' && (
                                        <div style={{ width: '12px', height: '12px', border: '1px solid #eab308', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '2px', flexShrink: 0 }}>
                                          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#eab308' }}></div>
                                        </div>
                                      )}
                                      {item.name}
                                    </strong>
                                    {/* <span className="inv-cat-tag shadow-sm">{item.category}</span> */}
                                  </div>
                                </div>
                                <p className="inv-desc text-muted truncate-2-lines mt-2">{item.description}</p>
                                <div className="inv-meta" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                                  <div className="inv-price text-xl">₹{item.price}</div>
                                  {/* <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Package size={14} className={item.stock_quantity <= item.low_stock_threshold ? 'text-error animate-pulse' : 'text-muted'} />
                                    <span style={{ fontSize: '13px', fontWeight: '800', color: item.stock_quantity <= item.low_stock_threshold ? '#ef4444' : 'var(--text-dim)' }}>
                                      {item.stock_quantity} Left
                                    </span>
                                  </div> */}
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
                                  setNewDish({
                                    ...item,
                                    available_from: item.available_from ? item.available_from.substring(0, 5) : '',
                                    available_to: item.available_to ? item.available_to.substring(0, 5) : ''
                                  });
                                  setEditingDishId(item.id);
                                  setFormError('');
                                  setShowMenuPopup(true);
                                }}><Edit2 size={16} /></button>
                                <button onClick={() => deleteDish(item.id)} className="inv-btn-delete" title="Purge Dish" disabled={loadingStates[`delete_dish_${item.id}`]}>
                                  {loadingStates[`delete_dish_${item.id}`] ? <div className="spinner-small" style={{ borderTopColor: 'currentColor' }} /> : <Trash2 size={16} />}
                                </button>
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
                                <div className="flex justify-between items-start">
                                  <div className="flex flex-col">
                                    <strong className="text-lg">{item.name}</strong>
                                    <div className="flex items-center gap-2 mt-1">
                                      <div style={{ width: '12px', height: '12px', border: `1px solid ${item.veg_type === 'nonveg' ? '#ef4444' : item.veg_type === 'egg' ? '#f59e0b' : '#10b981'}`, padding: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: item.veg_type === 'nonveg' ? '#ef4444' : item.veg_type === 'egg' ? '#f59e0b' : '#10b981' }} />
                                      </div>
                                      {item.is_featured && <span style={{ fontSize: '10px', fontWeight: '800', color: '#f59e0b', background: 'rgba(245,158,11,0.1)', padding: '2px 6px', borderRadius: '4px' }}>BESTSELLER</span>}
                                    </div>
                                  </div>
                                  <span className="inv-cat-tag shadow-sm">{item.category || 'Unassigned'}</span>
                                </div>
                                <p className="inv-desc text-muted truncate-2-lines mt-2">{item.description}</p>
                                <div className="inv-meta" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                                  <div className="inv-price text-xl">₹{item.price}</div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Package size={14} className={item.stock_quantity <= item.low_stock_threshold ? 'text-error animate-pulse' : 'text-muted'} />
                                    <span style={{ fontSize: '13px', fontWeight: '800', color: item.stock_quantity <= item.low_stock_threshold ? '#ef4444' : 'var(--text-dim)' }}>
                                      {item.stock_quantity} Left
                                    </span>
                                  </div>
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
                                  setNewDish({
                                    ...item,
                                    available_from: item.available_from ? item.available_from.substring(0, 5) : '',
                                    available_to: item.available_to ? item.available_to.substring(0, 5) : ''
                                  });
                                  setEditingDishId(item.id);
                                  setFormError('');
                                  setShowMenuPopup(true);
                                }}><Edit2 size={16} /></button>
                                <button onClick={() => deleteDish(item.id)} className="inv-btn-delete" title="Purge Dish" disabled={loadingStates[`delete_dish_${item.id}`]}>
                                  {loadingStates[`delete_dish_${item.id}`] ? <div className="spinner-small" style={{ borderTopColor: 'currentColor' }} /> : <Trash2 size={16} />}
                                </button>
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

          {activeTab === 'combos' && (
            <CombosManager adminUser={adminUser} restaurantId={adminUser.restaurant_id || 4} />
          )}

          {activeTab === 'staff' && adminUser.role === 'super_admin' && (
            <div className="view-container animate-slide-up">
              <div className="view-header-row">
                <div className="header-left">
                  <h1 className="view-title">Team Hierarchy</h1>
                  <p className="text-muted">Manage system access and personnel across your restaurant network.</p>
                </div>
                {/* <button className="btn-primary" onClick={() => {
                  setEditingStaffId(null);
                  setNewStaff({ name: '', email: '', password: '', role: 'admin', restaurant_id: adminUser.restaurant_id });
                  setShowStaffPopup(true);
                }}>
                  <Plus size={20} />
                  <span>Recruit Member</span>
                </button> */}
              </div>

              {restaurantsList.map(resto => {
                const restoStaff = staffList.filter(s => s.restaurant_id === resto.id);
                return (
                  <div key={resto.id} style={{ marginBottom: '44px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', paddingBottom: '12px', borderBottom: '1px solid var(--card-border)' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(124, 58, 237, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)' }}>
                        <Store size={20} />
                      </div>
                      <div>
                        <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-main)' }}>{resto.name}</h2>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{restoStaff.length} Members Assigned</p>
                      </div>
                      <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px' }}>
                        <button
                          onClick={() => {
                            setNewNode({ ...resto });
                            setEditingNodeId(resto.id);
                            setShowNodePopup(true);
                          }}
                          style={{ background: 'none', border: '1px solid var(--card-border)', color: 'var(--text-dim)', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                          <Edit2 size={12} /> EDIT RESTO
                        </button>
                        <button
                          onClick={() => deleteRestaurant(resto.id)}
                          style={{ background: 'none', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                          <Trash2 size={12} /> DELETE
                        </button>
                      </div>
                    </div>
                    <div className="inventory-grid">
                      {restoStaff.length > 0 ? restoStaff.map(staff => (
                        <div key={staff.id} className="inventory-card glass-panel shadow-premium">
                          <div className="inv-icon-box shadow-lg">
                            <Users size={28} />
                          </div>
                          <div className="inv-details">
                            <div className="staff-card-header mb-2">
                              <span className={`role-badge ${staff.role} shadow-sm`}>{(staff.role || 'user').replace('_', ' ')}</span>
                            </div>
                            <div className="inv-main">
                              <strong className="text-lg">{staff.name}</strong>
                              <span className="text-sm text-muted block mt-1">{staff.email}</span>
                            </div>
                          </div>
                          <div className="inv-actions">
                            <button className="inv-btn-edit" onClick={() => {
                              setNewStaff({ ...staff });
                              setEditingStaffId(staff.id);
                              setShowStaffPopup(true);
                            }}><Edit2 size={16} /></button>
                            <button className="inv-btn-delete" onClick={() => deleteUser(staff.id)} disabled={loadingStates[`delete_user_${staff.id}`]}>
                              {loadingStates[`delete_user_${staff.id}`] ? <div className="spinner-small" style={{ borderTopColor: 'var(--error)' }} /> : <Trash2 size={16} />}
                            </button>
                          </div>
                        </div>
                      )) : (
                        <div style={{ gridColumn: '1 / -1', padding: '32px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px dashed var(--card-border)', color: 'var(--text-muted)', fontSize: '14px' }}>
                          No members found in this restaurant.
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Staff without restaurant (Global Admins) */}
              {(() => {
                const globalStaff = staffList.filter(s => !s.restaurant_id || !restaurantsList.find(r => r.id === s.restaurant_id));
                if (globalStaff.length === 0) return null;
                return (
                  <div style={{ marginBottom: '44px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', paddingBottom: '12px', borderBottom: '1px solid var(--card-border)' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(124, 58, 237, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)' }}>
                        <Sparkles size={20} />
                      </div>
                      <div>
                        <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-main)' }}>Global Administrators</h2>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Unassigned or Master Accounts</p>
                      </div>
                    </div>
                    <div className="inventory-grid">
                      {globalStaff.map(staff => (
                        <div key={staff.id} className="inventory-card glass-panel shadow-premium">
                          <div className="inv-icon-box shadow-lg">
                            <Users size={28} />
                          </div>
                          <div className="inv-details">
                            <div className="staff-card-header mb-2">
                              <span className={`role-badge ${staff.role} shadow-sm`}>{(staff.role || 'user').replace('_', ' ')}</span>
                            </div>
                            <div className="inv-main">
                              <strong className="text-lg">{staff.name}</strong>
                              <span className="text-sm text-muted block mt-1">{staff.email}</span>
                            </div>
                          </div>
                          <div className="inv-actions">
                            <button className="inv-btn-edit" onClick={() => {
                              setNewStaff({ ...staff });
                              setEditingStaffId(staff.id);
                              setShowStaffPopup(true);
                            }}><Edit2 size={16} /></button>
                            <button className="inv-btn-delete" onClick={() => deleteUser(staff.id)} disabled={loadingStates[`delete_user_${staff.id}`]}>
                              {loadingStates[`delete_user_${staff.id}`] ? <div className="spinner-small" style={{ borderTopColor: 'var(--error)' }} /> : <Trash2 size={16} />}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {activeTab === 'restaurants' && adminUser.role === 'super_admin' && (
            <div className="view-container animate-slide-up">
              <div className="view-header-row">
                <div className="header-left">
                  <h1 className="view-title">Restaurant Network</h1>
                  <p className="text-muted">Overview of all active restaurants in the cluster.</p>
                </div>
                <button className="btn-primary" onClick={() => setShowNodePopup(true)}>
                  <Plus size={20} />
                  <span>Add New Restaurant</span>
                </button>
              </div>
              <div className="inventory-grid">
                {restaurantsList.map(res => {
                  const nodeStaff = staffList.filter(s => s.restaurant_id === res.id);
                  return (
                    <div key={res.id} className="inventory-card glass-panel fleet-branch-card shadow-premium" style={{ display: 'flex', flexDirection: 'column', gap: '0', padding: '0', overflow: 'hidden', border: '1px solid var(--card-border)' }}>
                      {/* Card Content */}
                      <div style={{ padding: '24px', width: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                          <div className="inv-icon-box shadow-lg" style={{ background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)', color: 'white' }}>
                            <Store size={24} />
                          </div>
                          <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
                            <button className="inv-btn-edit" title="Edit Restaurant" onClick={() => {
                              setNewNode({ ...res });
                              setEditingNodeId(res.id);
                              setShowNodePopup(true);
                            }} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', borderRadius: '10px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-main)', cursor: 'pointer', transition: 'all 0.2s' }}><Edit2 size={14} /></button>
                            <button className="inv-btn-delete" title="Delete Restaurant" onClick={() => deleteRestaurant(res.id)} disabled={loadingStates[`delete_restaurant_${res.id}`]} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', cursor: loadingStates[`delete_restaurant_${res.id}`] ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}>
                              {loadingStates[`delete_restaurant_${res.id}`] ? <div className="spinner-small" style={{ borderTopColor: 'var(--error)' }} /> : <Trash2 size={14} />}
                            </button>
                          </div>
                        </div>
                        <div style={{ marginTop: '20px' }}>
                          <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-main)' }}>{res.name}</h3>
                          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <TrendingUp size={14} style={{ color: '#22c55e' }} />
                            {res.city || 'Active Restaurant'} • {res.branch_code || 'ID: ' + res.id}
                          </p>
                        </div>

                        {/* Team Section */}
                        <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--card-border)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Team Members ({nodeStaff.length})</span>
                            <button onClick={() => {
                              setNewStaff({ ...newStaff, restaurant_id: res.id });
                              setShowStaffPopup(true);
                            }} style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontWeight: '700', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Plus size={12} /> ADD MEMBER
                            </button>
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {nodeStaff.length > 0 ? nodeStaff.slice(0, 3).map(s => (
                              <div key={s.id}
                                onClick={() => {
                                  setNewStaff({ ...s });
                                  setEditingStaffId(s.id);
                                  setShowStaffPopup(true);
                                }}
                                className="staff-tag-hover"
                                style={{
                                  display: 'flex', alignItems: 'center', gap: '6px',
                                  background: 'rgba(255,255,255,0.03)', padding: '4px 10px',
                                  borderRadius: '20px', border: '1px solid var(--card-border)',
                                  cursor: 'pointer', transition: 'all 0.2s'
                                }}
                              >
                                <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'var(--accent-primary)', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', color: 'white' }}>{s.name[0]}</div>
                                <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-dim)' }}>{s.name.split(' ')[0]}</span>
                                <Edit2 size={10} style={{ color: 'var(--text-muted)', marginLeft: '2px' }} />
                              </div>
                            )) : (
                              <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>No staff assigned</span>
                            )}
                            {nodeStaff.length > 3 && <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700' }}>+{nodeStaff.length - 3} more</span>}
                          </div>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="fleet-card-footer" style={{ background: 'rgba(255,255,255,0.02)', padding: '16px 24px', borderTop: '1px solid var(--card-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="branch-id-tag" style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-muted)' }}>RESTO ID: {res.branch_code || res.id}</span>
                        <div className="staff-count-badge" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: '#22c55e', fontWeight: '800', textTransform: 'uppercase' }}>
                          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                          <span>Active Live Sync</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}


          {activeTab === 'inventory' && (
            <div className="view-container animate-slide-up" style={{ padding: '32px', background: 'var(--bg-deep)', minHeight: '100vh' }}>
              <div className="view-header-row mb-8">
                <div className="header-left">
                  <h1 className="view-title">Smart Inventory Hub</h1>
                  <p className="text-muted">Real-time resource tracking and replenishment forecasting.</p>
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <button className="btn-primary" style={{ padding: '12px 24px', borderRadius: '14px' }}>
                    <Plus size={18} /> Add Stock
                  </button>
                </div>
              </div>

              {/* Stock Forecast Section */}
              <div className="glass-panel mb-8" style={{ padding: '24px', borderRadius: '24px', border: '1.5px solid var(--accent-primary)', background: 'rgba(124, 58, 237, 0.05)' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Bot size={20} className="text-accent" /> AI Stock Forecast
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                  {[
                    { item: 'Burger Buns', status: 'CRITICAL', days: '2 Days Left', color: 'var(--error)' },
                    { item: 'Chicken Breast', status: 'STABLE', days: '8 Days Left', color: 'var(--success)' },
                    { item: 'Coffee Beans', status: 'WARNING', days: '4 Days Left', color: 'var(--warning)' }
                  ].map((f, i) => (
                    <div key={i} style={{ padding: '16px', background: 'var(--bg-deep)', borderRadius: '16px', border: '1px solid var(--card-border)' }}>
                      <div style={{ fontSize: '13px', fontWeight: '700', marginBottom: '4px' }}>{f.item}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', fontWeight: '800', color: f.color }}>{f.status}</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{f.days}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'marketing' && (
            <div className="view-container animate-slide-up" style={{ padding: '32px', background: 'var(--bg-deep)', minHeight: '100vh' }}>
              <div className="view-header-row mb-10">
                <div className="header-left">
                  <h1 className="view-title" style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-main)' }}>Marketing Hub</h1>
                  <p className="text-muted" style={{ marginTop: '4px', fontSize: '15px' }}>Automated engagement and loyalty orchestration.</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '32px' }}>
                <div className="glass-panel" style={{ padding: '32px', borderRadius: '28px' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '24px' }}>Launch Campaign</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)' }}>SELECT AUDIENCE</label>
                      <select style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--bg-deep)', border: '1px solid var(--card-border)', color: 'white', marginTop: '8px' }}>
                        <option>Top 10% High Spenders</option>
                        <option>Inactive (Last 30 Days)</option>
                        <option>All Neural Profiles</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)' }}>COUPON CODE</label>
                      <select style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--bg-deep)', border: '1px solid var(--card-border)', color: 'white', marginTop: '8px' }}>
                        {coupons.map(c => <option key={c.id}>{c.code} - {c.discount_value}% Off</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)' }}>MESSAGE PRESET</label>
                      <textarea
                        rows="4"
                        style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--bg-deep)', border: '1px solid var(--card-border)', color: 'white', marginTop: '8px' }}
                        defaultValue="Hi {name}, we miss you! Here is a special 20% discount for your next visit. Use code {code}."
                      />
                    </div>
                    <button className="btn-primary" style={{ padding: '16px', borderRadius: '16px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                      <Send size={18} /> Blast Campaign via WhatsApp
                    </button>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center' }}>Note: Real-time API integration required for actual delivery.</p>
                  </div>
                </div>

                <div className="glass-panel" style={{ padding: '32px', borderRadius: '28px' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '24px' }}>Top Target Leads</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {customers.slice(0, 5).map((c, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid var(--card-border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900' }}>{c.name.charAt(0)}</div>
                          <div>
                            <div style={{ fontWeight: '700' }}>{c.name}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Spent: ₹{c.total_spend}</div>
                          </div>
                        </div>
                        <div className="status-pill active" style={{ fontSize: '10px' }}>HIGH VALUE</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'customers' && (
            <div className="view-container animate-slide-up" style={{ padding: '32px', background: 'var(--bg-deep)', minHeight: '100vh' }}>
              <div className="view-header-row mb-8">
                <div className="header-left">
                  <h1 className="view-title" style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-main)' }}>Customer Directory</h1>
                  <p className="text-muted" style={{ marginTop: '4px', fontSize: '15px' }}>Database of neural network customer profiles and behavior.</p>
                </div>
              </div>

              <div className="glass-panel" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '24px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--card-border)', color: 'var(--text-muted)', fontSize: '12px', textAlign: 'left' }}>
                      <th style={{ padding: '20px' }}>NAME</th>
                      <th style={{ padding: '20px' }}>PHONE</th>
                      <th style={{ padding: '20px' }}>ORDERS</th>
                      <th style={{ padding: '20px' }}>TOTAL SPEND</th>
                      <th style={{ padding: '20px' }}>LAST ORDER</th>
                      <th style={{ padding: '20px' }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((c, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid var(--card-border)', color: 'var(--text-main)', transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ padding: '20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '800', fontSize: '12px' }}>
                              {c.name?.charAt(0) || 'U'}
                            </div>
                            <span style={{ fontWeight: '700' }}>{c.name || 'Anonymous'}</span>
                          </div>
                        </td>
                        <td style={{ padding: '20px', color: 'var(--text-dim)' }}>{c.phone}</td>
                        <td style={{ padding: '20px' }}>
                          <span style={{ background: 'rgba(59,130,246,0.1)', color: '#60a5fa', padding: '4px 10px', borderRadius: '8px', fontWeight: '800', fontSize: '12px' }}>{c.total_orders || 1}</span>
                        </td>
                        <td style={{ padding: '20px', fontWeight: '800', color: 'var(--success)' }}>₹{Number(c.total_spend || 0).toLocaleString()}</td>
                        <td style={{ padding: '20px', fontSize: '13px', color: 'var(--text-muted)' }}>{c.last_order_date ? new Date(c.last_order_date).toLocaleDateString() : 'Recent'}</td>
                        <td style={{ padding: '20px' }}>
                          <button
                            className="inv-btn-edit"
                            onClick={() => alert(`Customer Insights for ${c.name || 'Anonymous'}\nPhone: ${c.phone}\nTotal Orders: ${c.total_orders || 1}\nTotal Spend: ₹${c.total_spend || 0}`)}
                            style={{
                              padding: '8px 16px',
                              fontSize: '11px',
                              borderRadius: '12px',
                              whiteSpace: 'nowrap',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              fontWeight: '700',
                              letterSpacing: '0.5px',
                              background: 'rgba(124, 58, 237, 0.1)',
                              color: 'var(--accent-primary)',
                              border: '1px solid rgba(124, 58, 237, 0.2)',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                              transition: 'all 0.2s',
                              width: 'auto',
                              height: 'auto'
                            }}
                          >
                            <BarChart2 size={14} /> View Insights
                          </button>
                        </td>
                      </tr>
                    ))}
                    {customers.length === 0 && (
                      <tr>
                        <td colSpan="4" style={{ padding: '80px', textAlign: 'center', color: 'var(--text-muted)' }}>
                          <Users size={48} style={{ opacity: 0.1, marginBottom: '16px' }} />
                          <p>No neural profiles found in this node.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'kitchen' && (
            <div className="view-container animate-slide-up" style={{ padding: '32px', background: 'var(--bg-deep)', minHeight: '100vh' }}>
              <div className="view-header-row mb-8">
                <div className="header-left">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <h1 className="view-title" style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>Kitchen Display System</h1>
                    <button
                      onClick={fetchData}
                      className="btn-icon"
                      disabled={isLoading}
                      title="Manual Refresh"
                      style={{
                        background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)',
                        padding: '8px', borderRadius: '10px', color: 'var(--text-muted)',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}
                    >
                      <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
                    </button>
                  </div>
                  <p className="text-muted" style={{ marginTop: '8px', fontSize: '15px' }}>Live order orchestration for culinary excellence.</p>
                </div>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div className="status-pill active" style={{ padding: '8px 16px', fontSize: '12px' }}>
                    KITCHEN LIVE: {kitchenOrders.length} ACTIVE
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '24px', alignItems: 'start', marginTop: '24px', overflowX: 'auto', paddingBottom: '20px' }}>
                {['accepted', 'preparing'].map(columnStatus => (
                  <div key={columnStatus} style={{ minWidth: '400px', flex: 1, background: 'var(--bg-deep)', border: '1px solid var(--card-border)', borderRadius: '24px', padding: '20px', minHeight: '600px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '2px solid var(--card-border)' }}>
                      <h3 style={{ textTransform: 'uppercase', fontSize: '13px', fontWeight: '800', color: columnStatus === 'accepted' ? 'var(--warning)' : 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: columnStatus === 'accepted' ? 'var(--warning)' : 'var(--accent-primary)' }} />
                        {columnStatus === 'accepted' ? 'TO PREPARE' : 'COOKING'}
                      </h3>
                      <span style={{ fontSize: '12px', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '10px', color: 'var(--text-dim)', fontWeight: '700' }}>
                        {kitchenOrders.filter(o => o.status === columnStatus).length}
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', overflowY: 'auto', maxHeight: 'calc(100vh - 280px)' }} className="scrollbar-hidden">
                      {kitchenOrders.filter(order => order.status === columnStatus).map((order, idx) => (
                        <div key={idx} className="glass-panel animate-scale-in" style={{
                          padding: '24px',
                          borderRadius: '28px',
                          border: '2px solid var(--card-border)',
                          background: 'var(--card-bg)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '20px',
                          boxShadow: '0 15px 40px rgba(0,0,0,0.1)'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                              <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                Table {order.tableNumber || order.table_number}
                              </div>
                              <h2 style={{ fontSize: '24px', fontWeight: '900', marginTop: '4px' }}>Order #{order.id}</h2>
                              <div style={{ fontSize: '14px', fontWeight: '700', position: 'relative' }}>
                                {editingOrderId === order.id ? (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <input
                                      className="filter-input"
                                      value={editFormData.name}
                                      onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                                      placeholder="Name"
                                      style={{ padding: '4px 8px', fontSize: '12px' }}
                                    />
                                    <input
                                      className="filter-input"
                                      value={editFormData.phone}
                                      onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                                      placeholder="Phone"
                                      style={{ padding: '4px 8px', fontSize: '12px' }}
                                    />
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                      <button onClick={() => handleOrderUpdate(order.id)} style={{ padding: '4px 8px', background: 'var(--success)', border: 'none', borderRadius: '4px', color: 'white', cursor: 'pointer', fontSize: '11px' }}>Save</button>
                                      <button onClick={() => setEditingOrderId(null)} style={{ padding: '4px 8px', background: 'var(--danger)', border: 'none', borderRadius: '4px', color: 'white', cursor: 'pointer', fontSize: '11px' }}>Cancel</button>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      {order.customer_name || order.customerName || 'Guest'}
                                      <button
                                        onClick={() => {
                                          setEditingOrderId(order.id);
                                          setEditFormData({ name: order.customer_name || order.customerName || '', phone: order.customer_phone || order.customerPhone || '' });
                                        }}
                                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
                                      >
                                        <Edit2 size={12} />
                                      </button>
                                    </div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '500' }}>{order.customer_phone || order.customerPhone}</div>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid var(--card-border)' }}>
                            {(order.items || []).map((item, i) => {
                              const isChecked = kitchenItemChecked[`${order.id}-${i}`];
                              return (
                                <div key={i} onClick={() => { setKitchenItemChecked(prev => ({ ...prev, [`${order.id}-${i}`]: !prev[`${order.id}-${i}`] })) }} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: i === (order.items || []).length - 1 ? 'none' : '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', transition: 'all 0.2s', opacity: isChecked ? 0.4 : 1, textDecoration: isChecked ? 'line-through' : 'none', background: isChecked ? 'rgba(0,255,100,0.02)' : 'transparent', borderRadius: '8px', margin: '2px 0', padding: '10px' }}>
                                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                    <div style={{ width: '32px', height: '32px', background: isChecked ? 'rgba(255,255,255,0.05)' : 'var(--bg-deep)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', color: isChecked ? 'var(--text-muted)' : 'var(--accent-primary)', fontSize: '14px' }}>
                                      {isChecked ? <Check size={16} /> : `${item.qty || item.quantity}x`}
                                    </div>
                                    <span style={{ fontSize: '16px', fontWeight: '700' }}>{item.name} {item.selectedVariant && <span style={{ fontSize: '13px', opacity: 0.8, color: 'var(--warning)' }}>({item.selectedVariant.size})</span>} {item.selectedAddons && item.selectedAddons.length > 0 && <span style={{ fontSize: '12px', opacity: 0.6 }}>[+{item.selectedAddons.map(a => a.name).join(', ')}]</span>}</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {order.notes && (
                            <div style={{ padding: '12px 16px', background: 'rgba(245, 158, 11, 0.1)', borderLeft: '4px solid #f59e0b', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', color: '#fcd34d' }}>
                              <span style={{ fontWeight: '800', color: '#f59e0b', marginRight: '6px' }}>COOKING INSTRUCTIONS:</span>
                              {order.notes}
                            </div>
                          )}

                          <div style={{ display: 'flex', gap: '12px' }}>
                            {order.status === 'accepted' ? (
                              <button
                                onClick={() => updateOrderStatus(order.id, 'preparing')}
                                className="btn-primary"
                                style={{ flex: 1, padding: '16px', borderRadius: '16px', background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', fontWeight: '800' }}
                              >
                                START PREPARING
                              </button>
                            ) : (
                              <button
                                onClick={() => updateOrderStatus(order.id, 'out_for_delivery')}
                                className="btn-primary"
                                style={{ flex: 1, padding: '16px', borderRadius: '16px', background: 'linear-gradient(135deg, #10b981, #059669)', fontWeight: '800' }}
                              >
                                MARK AS READY
                              </button>
                            )}
                          </div>
                        </div>
                      ))}

                      {kitchenOrders.filter(order => order.status === columnStatus).length === 0 && (
                        <div style={{ padding: '60px', textAlign: 'center', opacity: 0.3 }}>
                          <ChefHat size={40} style={{ margin: '0 auto 10px' }} />
                          <h3 style={{ fontSize: '16px', fontWeight: '800' }}>Empty Queue</h3>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'coupons' && (
            <div className="view-container animate-slide-up" style={{ padding: '32px', background: 'var(--bg-deep)', minHeight: '100vh' }}>
              <div className="view-header-row mb-8">
                <div className="header-left">
                  <h1 className="view-title" style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-main)' }}>Neural Promotions</h1>
                  <p className="text-muted" style={{ marginTop: '4px', fontSize: '15px' }}>Manage active discount protocols and customer incentives.</p>
                </div>
                <button className="btn-primary" onClick={() => setShowCouponPopup(true)}>
                  <Plus size={20} />
                  <span>Create Coupon</span>
                </button>
              </div>

              <div className="inventory-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                {coupons.map((c, i) => (
                  <div key={i} className="glass-panel" style={{
                    padding: '24px',
                    borderRadius: '24px',
                    position: 'relative',
                    border: '1px solid var(--card-border)',
                    background: 'var(--card-bg)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div className="inv-icon-box" style={{
                        background: c.is_active ? 'rgba(124, 58, 237, 0.1)' : 'rgba(100, 116, 139, 0.1)',
                        color: c.is_active ? 'var(--accent-primary)' : 'var(--text-muted)',
                        width: '56px',
                        height: '56px',
                        borderRadius: '16px'
                      }}>
                        <CreditCard size={28} />
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => handleEditCoupon(c)}
                          className="inv-btn-edit"
                          style={{ width: '32px', height: '32px', borderRadius: '8px' }}
                          title="Edit Coupon"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => deleteCoupon(c.id)}
                          className="inv-btn-delete"
                          style={{ width: '32px', height: '32px', borderRadius: '8px' }}
                          title="Delete Coupon"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <strong style={{ fontSize: '20px', fontWeight: '900', letterSpacing: '1px' }}>{c.code}</strong>
                        <div
                          onClick={(e) => { e.stopPropagation(); toggleCouponStatus(c); }}
                          className={`status-pill ${c.is_active ? 'active' : 'inactive'}`}
                          style={{
                            cursor: 'pointer',
                            fontSize: '10px',
                            padding: '4px 12px',
                            borderRadius: '20px',
                            border: `1.5px solid ${c.is_active ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            boxShadow: c.is_active ? '0 4px 12px rgba(34, 197, 94, 0.2)' : 'none'
                          }}
                        >
                          <div style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: c.is_active ? '#22c55e' : '#ef4444',
                            boxShadow: c.is_active ? '0 0 8px #22c55e' : 'none'
                          }} />
                          {c.is_active ? 'ACTIVE' : 'DISABLED'}
                        </div>
                      </div>
                      <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px', fontWeight: '600' }}>
                        {c.discount_type === 'percent' ? `${c.discount_value}%` : `₹${c.discount_value}`} Off
                        {c.min_order_value > 0 && <span style={{ opacity: 0.6 }}> • Min order ₹{c.min_order_value}</span>}
                      </div>
                    </div>

                    <div style={{
                      marginTop: 'auto',
                      paddingTop: '16px',
                      borderTop: '1px dashed var(--border-default)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                        Expires: {new Date(c.expiry_date).toLocaleDateString()}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--accent-primary)', fontWeight: '700' }}>
                        Used: {c.current_usage_count || 0} {c.usage_limit ? `/ ${c.usage_limit}` : ''}
                      </div>
                    </div>

                    {c.usage_history && c.usage_history.length > 0 && (
                      <details style={{ marginTop: '8px', cursor: 'pointer', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-default)' }}>
                        <summary style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-main)', outline: 'none' }}>View Usage History ({c.usage_history.length})</summary>
                        <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '150px', overflowY: 'auto', paddingRight: '4px' }} className="custom-scrollbar">
                          {c.usage_history.map((hist, hIdx) => (
                            <div key={hIdx} style={{ fontSize: '12px', background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '8px', borderLeft: '2px solid var(--accent-primary)' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                <span style={{ color: 'var(--text-main)', fontWeight: '700' }}>{hist.customer_name || 'Guest'}</span>
                                <span style={{ color: 'var(--text-muted)' }}>{new Date(hist.timestamp).toLocaleDateString()}</span>
                              </div>
                              <div style={{ color: 'var(--text-dim)', marginBottom: '2px' }}>{hist.customer_phone || 'No Phone'}</div>
                              <div style={{ color: '#10b981', fontWeight: '700' }}>Order Total: ₹{hist.total} (Saved: ₹{hist.discount_amount || 0})</div>
                            </div>
                          ))}
                        </div>
                      </details>
                    )}
                  </div>
                ))}
                {coupons.length === 0 && (
                  <div style={{ gridColumn: '1/-1', padding: '80px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <CreditCard size={48} style={{ opacity: 0.1, marginBottom: '16px' }} />
                    <p>No active neural coupons found.</p>
                  </div>
                )}
              </div>
            </div>
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


          {activeTab === 'rider_fleet' && (
            <div className="view-container animate-slide-up" style={{ padding: '32px', background: 'var(--bg-deep)', minHeight: '100vh' }}>
              <div className="view-header-row mb-8">
                <div className="header-left">
                  <h1 className="view-title" style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-main)' }}>Rider Fleet</h1>
                  <p className="text-muted" style={{ marginTop: '4px', fontSize: '15px' }}>Manage your delivery force and real-time logistics.</p>
                </div>
                <button className="btn-primary" onClick={() => { setEditingRiderId(null); setNewRider({ name: '', phone: '', status: 'online' }); setShowRiderPopup(true); }}>
                  <Plus size={20} />
                  <span>Recruit Rider</span>
                </button>
              </div>

              <div className="inventory-grid">
                {riders.map(rider => (
                  <div key={rider.id} className="glass-panel" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', padding: '24px', borderRadius: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '18px', background: 'var(--bg-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                      <Bike size={32} className="text-accent" />
                      <div style={{ position: 'absolute', bottom: '-4px', right: '-4px', width: '16px', height: '16px', borderRadius: '50%', background: rider.status === 'online' ? 'var(--success)' : rider.status === 'busy' ? 'var(--warning)' : 'var(--text-muted)', border: '3px solid var(--card-bg)' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-main)' }}>{rider.name}</div>
                      <div style={{ fontSize: '13px', color: 'var(--text-dim)', marginTop: '2px' }}>{rider.phone}</div>
                      <div
                        onClick={() => {
                          const nextStatus = rider.status === 'online' ? 'offline' : 'online';
                          axios.put(`${API_URL}/api/mgmt/riders/${rider.id}`, { ...rider, status: nextStatus }).then(() => fetchData());
                        }}
                        className={`status-pill clickable-status ${rider.status === 'online' ? 'active' : 'inactive'}`}
                        style={{ cursor: 'pointer', fontSize: '10px', padding: '4px 10px', display: 'inline-flex', marginTop: '8px' }}
                      >
                        <div className="status-dot" />
                        {rider.status.toUpperCase()}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        className="inv-btn-edit"
                        onClick={() => handleEditRider(rider)}
                        style={{ background: 'rgba(124, 58, 237, 0.1)', color: 'var(--accent-primary)', border: 'none', padding: '10px', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s' }}
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        className="inv-btn-delete"
                        onClick={() => handleDeleteRider(rider.id)}
                        style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: 'none', padding: '10px', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s' }}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
                {riders.length === 0 && (
                  <div style={{ gridColumn: '1/-1', padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <Bike size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
                    <p>No riders in your fleet. Recruit your first rider to enable delivery.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="view-container animate-slide-up" style={{ padding: '32px', background: 'var(--bg-deep)', minHeight: '100vh' }}>
              <div className="view-header-row mb-8">
                <div className="header-left">
                  <h1 className="view-title" style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-main)' }}>Intelligence Center</h1>
                  <p className="text-muted" style={{ marginTop: '4px', fontSize: '15px' }}>Neural insights and business performance analytics.</p>
                </div>
                <button className="btn-secondary" onClick={fetchData} style={{ borderRadius: '14px' }}>
                  <Clock size={18} /> Refresh Intelligence
                </button>
              </div>

              {/* Analytics Dashboard Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px', marginBottom: '32px' }}>
                {/* Revenue Trend Chart */}
                <div className="glass-panel" style={{ padding: '24px', borderRadius: '24px', minHeight: '400px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <DollarSign size={20} className="text-success" /> Revenue Trend (Last 7 Days)
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={analyticsData.revenueHistory}>
                      <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} />
                      <YAxis stroke="var(--text-muted)" fontSize={12} />
                      <Tooltip contentStyle={{ background: 'var(--bg-deep)', border: '1px solid var(--card-border)', borderRadius: '12px' }} />
                      <Area type="monotone" dataKey="amount" stroke="var(--accent-primary)" fillOpacity={1} fill="url(#colorRev)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Top Items Bar Chart */}
                <div className="glass-panel" style={{ padding: '24px', borderRadius: '24px', minHeight: '400px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <UtensilsCrossed size={20} className="text-warning" /> Top Performers
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analyticsData.topItems} layout="vertical">
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" width={100} fontSize={12} stroke="var(--text-main)" />
                      <Tooltip contentStyle={{ background: 'var(--bg-deep)', border: '1px solid var(--card-border)', borderRadius: '12px' }} />
                      <Bar dataKey="qty" fill="var(--accent-primary)" radius={[0, 10, 10, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Hourly Heatmap */}
                <div className="glass-panel" style={{ padding: '24px', borderRadius: '24px', gridColumn: 'span 2' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={20} className="text-info" /> Order Heatmap
                  </h3>
                  <ResponsiveContainer width="100%" height={150}>
                    <BarChart data={analyticsData.hourlyHeatmap}>
                      <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={10} />
                      <Tooltip contentStyle={{ background: 'var(--bg-deep)', border: '1px solid var(--card-border)', borderRadius: '12px' }} />
                      <Bar dataKey="orders" fill="var(--accent-primary)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Staff Performance Table */}
                <div className="glass-panel" style={{ padding: '24px', borderRadius: '24px', gridColumn: 'span 2' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '24px' }}>Staff Performance Leaderboard</h3>
                  <table className="inv-table">
                    <thead>
                      <tr>
                        <th>STAFF</th>
                        <th>TOTAL SALES</th>
                        <th>ORDERS</th>
                        <th style={{ textAlign: 'right' }}>EFFICIENCY</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analyticsData.staffSales.map((s, i) => (
                        <tr key={i}>
                          <td style={{ fontWeight: '700' }}>{s.name}</td>
                          <td style={{ color: 'var(--success)', fontWeight: '800' }}>₹{s.sales.toLocaleString()}</td>
                          <td>{s.count}</td>
                          <td style={{ textAlign: 'right' }}>{Math.min(100, Math.round((s.sales / 10000) * 100))}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
                    const tableName = prompt("Enter Table Name/Label:", `Table ${nextId}`);
                    if (!tableName) return;

                    const randomSecret = `T${nextId}-DINE${Math.floor(1000 + Math.random() * 9000)}`;
                    try {
                      const res = await axios.post(`${API_URL}/api/tables`, {
                        table_number: nextId,
                        secret_token: randomSecret,
                        restaurant_id: adminUser.restaurant_id || 4,
                        name: tableName
                      });
                      fetchData('New Table Added');
                    } catch (err) { alert("Persistence failed"); }
                  }}
                  className="btn-primary"
                  style={{ padding: '12px 24px', borderRadius: '14px', fontWeight: '700', fontSize: '14px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <Plus size={18} /> Add New Table
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                {restaurantTables.map((t, idx) => {
                  const tokenVal = t.secret_token || t.token;
                  const liveUrl = `${window.location.origin}/?s=${tokenVal}`;
                  return (
                    <div key={idx} className="glass-panel" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', padding: '24px', borderRadius: '20px', boxShadow: 'var(--shadow-md)', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', textAlign: 'center' }}>
                      <div style={{ padding: '16px', background: 'white', borderRadius: '16px', width: '160px', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(liveUrl)}`}
                          alt="Scannable QR Code"
                          style={{ width: '130px', height: '130px', objectFit: 'contain' }}
                        />
                      </div>
                      <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {t.name || t.table || `Table ${t.table_number}`}
                        <button
                          onClick={() => {
                            const newName = prompt("Edit Table Name:", t.name || t.table);
                            if (newName) {
                              axios.put(`${API_URL}/api/tables/${t.id}`, { name: newName, table_number: t.table_number })
                                .then(() => fetchData('Table Updated'));
                            }
                          }}
                          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px', borderRadius: '4px', display: 'flex', alignItems: 'center', transition: 'all 0.2s' }}
                        >
                          <Edit2 size={14} />
                        </button>
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-deep)', padding: '6px 12px', borderRadius: '8px', width: '100%', justifyContent: 'center' }}>
                        <div style={{ fontSize: '12px', color: 'var(--accent-primary)', fontWeight: '700', wordBreak: 'break-all' }}>{tokenVal}</div>
                        <button
                          onClick={() => {
                            const newKey = prompt("Edit Secret Key (Token):", tokenVal);
                            if (newKey) {
                              axios.put(`${API_URL}/api/tables/${t.id}`, { name: t.name || t.table, table_number: t.table_number, secret_token: newKey })
                                .then(() => fetchData('Key Updated'));
                            }
                          }}
                          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}
                        >
                          <Edit2 size={12} />
                        </button>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(liveUrl);
                            alert("Table URL copied to clipboard!");
                          }}
                          className="btn-primary"
                          style={{ padding: '10px 16px', borderRadius: '12px', fontWeight: '700', fontSize: '13px', flex: 1, border: 'none', cursor: 'pointer' }}
                        >
                          Copy Link
                        </button>
                        <button
                          onClick={() => printTableQR(liveUrl, t.name || t.table || `Table ${t.table_number}`)}
                          style={{ padding: '10px 16px', borderRadius: '12px', fontWeight: '800', fontSize: '13px', flex: 1, border: 'none', cursor: 'pointer', background: 'var(--success)', color: 'white' }}
                        >
                          Print QR
                        </button>
                        <button
                          onClick={async () => {
                            if (window.confirm("Are you sure you want to delete this table?")) {
                              try {
                                await axios.delete(`${API_URL}/api/tables/${t.id}`);
                                fetchData('Table Deleted');
                              } catch (err) { alert("Delete failed"); }
                            }
                          }}
                          style={{ padding: '10px', borderRadius: '12px', border: '1px solid var(--danger)', color: 'var(--danger)', background: 'transparent', cursor: 'pointer' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

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

              {/* Table List Section */}
              <div className="glass-panel" style={{ marginTop: '48px', background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '24px', padding: '28px', boxShadow: 'var(--shadow-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                  <ListTodo size={24} className="text-accent" />
                  <h2 style={{ fontSize: '20px', fontWeight: '800', margin: 0 }}>Dine-In Hub: Master Table List</h2>
                </div>
                <div className="overflow-x-auto">
                  <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                    <thead>
                      <tr style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'left' }}>
                        <th style={{ padding: '12px 20px' }}>Table #</th>
                        <th style={{ padding: '12px 20px' }}>Name/Label</th>
                        <th style={{ padding: '12px 20px' }}>Secret Token</th>
                        <th style={{ padding: '12px 20px', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {restaurantTables.map((t, idx) => (
                        <tr key={idx} style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                          <td style={{ padding: '16px 20px', fontWeight: '800', color: 'var(--accent-primary)', borderTopLeftRadius: '12px', borderBottomLeftRadius: '12px' }}>
                            #{t.table_number || (idx + 1)}
                          </td>
                          <td style={{ padding: '16px 20px', fontWeight: '700' }}>{t.name || t.table}</td>
                          <td style={{ padding: '16px 20px', fontFamily: 'monospace', fontSize: '12px', color: 'var(--text-dim)' }}>{t.token}</td>
                          <td style={{ padding: '16px 20px', textAlign: 'right', borderTopRightRadius: '12px', borderBottomRightRadius: '12px' }}>
                            <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/?s=${t.token}`); alert("Copied!"); }} style={{ background: 'transparent', border: '1px solid var(--card-border)', color: 'var(--text-main)', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '11px', fontWeight: '700' }}>Copy URL</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'menu_order' && (
            <div className="view-container animate-slide-up" style={{ padding: '32px', background: 'var(--bg-deep)', minHeight: '100vh' }}>
              <div className="view-header-row mb-8">
                <div className="header-left">
                  <h1 className="view-title" style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-main)' }}>Menu Ordering</h1>
                  <p className="text-muted" style={{ marginTop: '4px', fontSize: '15px' }}>Arrange the sequence of dishes in your digital menu.</p>
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <button
                    className="btn-primary"
                    onClick={async () => {
                      try {
                        const payload = orderedMenu.map((item, index) => ({ id: item.id, sort_order: index }));
                        await axios.post(`${API_URL}/api/menu/reorder`, { orders: payload });
                        alert("Menu sequence synchronized!");
                        fetchData('Menu Reordered');
                      } catch (e) { alert("Save failed"); }
                    }}
                    style={{ background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', padding: '12px 24px', borderRadius: '14px', fontWeight: '800' }}
                  >
                    Save Sequence
                  </button>
                </div>
              </div>

              <div className="glass-panel" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '24px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <tr style={{ textAlign: 'left', color: 'var(--text-muted)', fontSize: '13px' }}>
                      <th style={{ padding: '20px' }}>ORDER</th>
                      <th style={{ padding: '20px' }}>DISH NAME</th>
                      <th style={{ padding: '20px' }}>CATEGORY</th>
                      <th style={{ padding: '20px', textAlign: 'right' }}>CONTROLS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderedMenu.map((item, idx) => (
                      <tr
                        key={item.id}
                        draggable
                        onDragStart={() => setDragItemIndex(idx)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => {
                          const newArr = [...orderedMenu];
                          const draggedItem = newArr.splice(dragItemIndex, 1)[0];
                          newArr.splice(idx, 0, draggedItem);
                          setOrderedMenu(newArr);
                          setDragItemIndex(null);
                        }}
                        style={{
                          borderBottom: '1px solid var(--card-border)',
                          background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                          cursor: 'grab'
                        }}
                      >
                        <td style={{ padding: '20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ color: 'var(--text-muted)', cursor: 'grab' }}>⠿</span>
                            <span style={{ background: 'var(--bg-deep)', padding: '4px 12px', borderRadius: '8px', fontWeight: '800', color: 'var(--accent-primary)' }}>{idx + 1}</span>
                          </div>
                        </td>
                        <td style={{ padding: '20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {item.image_url && <img src={item.image_url} alt="" style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />}
                            <span style={{ fontWeight: '700' }}>{item.name}</span>
                          </div>
                        </td>
                        <td style={{ padding: '20px' }}>
                          <span style={{ fontSize: '12px', background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '20px', fontWeight: '600' }}>{item.category}</span>
                        </td>
                        <td style={{ padding: '20px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button
                              disabled={idx === 0}
                              onClick={() => {
                                const newArr = [...orderedMenu];
                                [newArr[idx - 1], newArr[idx]] = [newArr[idx], newArr[idx - 1]];
                                setOrderedMenu(newArr);
                              }}
                              style={{ padding: '8px', borderRadius: '10px', border: '1px solid var(--card-border)', background: 'var(--bg-deep)', color: 'var(--text-main)', cursor: idx === 0 ? 'not-allowed' : 'pointer', opacity: idx === 0 ? 0.2 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                              <ChevronUp size={16} />
                            </button>
                            <button
                              disabled={idx === orderedMenu.length - 1}
                              onClick={() => {
                                const newArr = [...orderedMenu];
                                [newArr[idx], newArr[idx + 1]] = [newArr[idx + 1], newArr[idx]];
                                setOrderedMenu(newArr);
                              }}
                              style={{ padding: '8px', borderRadius: '10px', border: '1px solid var(--card-border)', background: 'var(--bg-deep)', color: 'var(--text-main)', cursor: idx === orderedMenu.length - 1 ? 'not-allowed' : 'pointer', opacity: idx === orderedMenu.length - 1 ? 0.2 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                              <ChevronDown size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {activeTab === 'sidebar_order' && (
            <div className="view-container animate-slide-up" style={{ padding: '32px', background: 'var(--bg-deep)', minHeight: '100vh' }}>
              <div className="view-header-row mb-8">
                <div className="header-left">
                  <h1 className="view-title" style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-main)' }}>Sidebar Ordering</h1>
                  <p className="text-muted" style={{ marginTop: '4px', fontSize: '15px' }}>Customize the sequence of modules in your admin navigation bar.</p>
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <button
                    className="btn-primary"
                    onClick={async () => {
                      try {
                        const payload = orderedSidebar.map((item, index) => ({ id: item.id, sort_order: index }));
                        await axios.post(`${API_URL}/api/mgmt/sidebar/reorder`, { orders: payload });
                        alert("Sidebar layout updated! Refresh to see changes.");
                        window.location.reload(); // Reload to refresh sidebar
                      } catch (e) { alert("Save failed"); }
                    }}
                    style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', border: 'none', padding: '12px 24px', borderRadius: '14px', fontWeight: '800' }}
                  >
                    Apply Sidebar Layout
                  </button>
                </div>
              </div>

              <div className="glass-panel" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '24px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <tr style={{ textAlign: 'left', color: 'var(--text-muted)', fontSize: '13px' }}>
                      <th style={{ padding: '20px' }}>POS</th>
                      <th style={{ padding: '20px' }}>MODULE LABEL</th>
                      <th style={{ padding: '20px' }}>ID</th>
                      <th style={{ padding: '20px', textAlign: 'center' }}>VISIBILITY</th>
                      <th style={{ padding: '20px', textAlign: 'right' }}>REORDER</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderedSidebar.map((item, idx) => (
                      <tr
                        key={item.id}
                        draggable
                        onDragStart={() => setDragItemIndex(idx)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => {
                          const newArr = [...orderedSidebar];
                          const draggedItem = newArr.splice(dragItemIndex, 1)[0];
                          newArr.splice(idx, 0, draggedItem);
                          setOrderedSidebar(newArr);
                          setDragItemIndex(null);
                        }}
                        style={{
                          borderBottom: '1px solid var(--card-border)',
                          background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                          cursor: 'grab',
                          opacity: item.is_active ? 1 : 0.5
                        }}
                      >
                        <td style={{ padding: '20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ color: 'var(--text-muted)', cursor: 'grab' }}>⠿</span>
                            <span style={{ background: 'var(--bg-deep)', padding: '4px 12px', borderRadius: '8px', fontWeight: '800', color: 'var(--accent-primary)' }}>{idx + 1}</span>
                          </div>
                        </td>
                        <td style={{ padding: '20px' }}>
                          <span style={{ fontWeight: '700', color: 'white' }}>{item.label}</span>
                        </td>
                        <td style={{ padding: '20px' }}>
                          <code style={{ fontSize: '12px', background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '8px', color: 'var(--text-muted)' }}>{item.id}</code>
                        </td>
                        <td style={{ padding: '20px', textAlign: 'center' }}>
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              try {
                                const newStatus = !item.is_active;
                                await axios.post(`${API_URL}/api/mgmt/sidebar/toggle`, { id: item.id, is_active: newStatus });
                                const newArr = [...orderedSidebar];
                                newArr[idx].is_active = newStatus;
                                setOrderedSidebar(newArr);
                                // Refresh sidebar live if possible or alert
                              } catch (err) { alert("Failed to toggle visibility"); }
                            }}
                            style={{
                              background: 'none', border: 'none', cursor: 'pointer',
                              color: item.is_active ? 'var(--accent-primary)' : 'var(--text-muted)',
                              transition: 'all 0.3s'
                            }}
                          >
                            {item.is_active ? <Eye size={20} /> : <EyeOff size={20} />}
                          </button>
                        </td>
                        <td style={{ padding: '20px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button
                              disabled={idx === 0}
                              onClick={() => {
                                const newArr = [...orderedSidebar];
                                [newArr[idx - 1], newArr[idx]] = [newArr[idx], newArr[idx - 1]];
                                setOrderedSidebar(newArr);
                              }}
                              style={{ padding: '8px', borderRadius: '10px', border: '1px solid var(--card-border)', background: 'var(--bg-deep)', color: 'var(--text-main)', cursor: idx === 0 ? 'not-allowed' : 'pointer', opacity: idx === 0 ? 0.2 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                              <ChevronUp size={16} />
                            </button>
                            <button
                              disabled={idx === orderedSidebar.length - 1}
                              onClick={() => {
                                const newArr = [...orderedSidebar];
                                [newArr[idx], newArr[idx + 1]] = [newArr[idx + 1], newArr[idx]];
                                setOrderedSidebar(newArr);
                              }}
                              style={{ padding: '8px', borderRadius: '10px', border: '1px solid var(--card-border)', background: 'var(--bg-deep)', color: 'var(--text-main)', cursor: idx === orderedSidebar.length - 1 ? 'not-allowed' : 'pointer', opacity: idx === orderedSidebar.length - 1 ? 0.2 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                              <ChevronDown size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {activeTab === 'roles' && (
            <div className="view-container animate-slide-up" style={{ padding: '32px', background: 'var(--bg-deep)', minHeight: '100vh' }}>
              <div className="view-header-row mb-8" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div className="header-left">
                  <h1 className="view-title" style={{ fontSize: '32px', fontWeight: '800', color: 'white' }}>Role Management</h1>
                  <p className="text-muted" style={{ marginTop: '4px', fontSize: '15px' }}>Configure system-wide administrative privileges and module access.</p>
                </div>
                <button
                  className="btn-primary"
                  onClick={() => {
                    setCurrentRoleData({ name: '', permissions: [] });
                    setIsRoleModalOpen(true);
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 28px', borderRadius: '14px',
                    background: 'var(--accent-primary)', border: 'none', color: 'white', fontWeight: '700', cursor: 'pointer'
                  }}
                >
                  <Plus size={20} /> Add New Role
                </button>
              </div>

              <div className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--card-border)', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', background: 'rgba(255,255,255,0.03)' }}>
                      <th style={{ padding: '20px 24px', color: 'var(--text-muted)', fontSize: '12px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>IDENTITY / ROLE NAME</th>
                      <th style={{ padding: '20px 24px', color: 'var(--text-muted)', fontSize: '12px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>ACCESS SCOPE</th>
                      <th style={{ padding: '20px 24px', color: 'var(--text-muted)', fontSize: '12px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>MODULES</th>
                      <th style={{ padding: '20px 24px', color: 'var(--text-muted)', fontSize: '12px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase', textAlign: 'right' }}>CONTROL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dbRoles.map((role) => (
                      <tr key={role.id} style={{ borderBottom: '1px solid var(--card-border)', transition: 'background 0.2s' }} className="table-row-hover">
                        <td style={{ padding: '20px 24px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: role.name === 'super_admin' ? '#10b981' : 'var(--accent-primary)' }} />
                            <span style={{ fontWeight: '700', color: 'white', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{(role.name || '').replace('_', ' ')}</span>
                          </div>
                        </td>
                        <td style={{ padding: '20px 24px' }}>
                          <span style={{ background: 'rgba(124, 58, 237, 0.1)', color: '#a78bfa', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '800', border: '1px solid rgba(124, 58, 237, 0.2)' }}>
                            {role.permissions.length} Active Modules
                          </span>
                        </td>
                        <td style={{ padding: '20px 24px' }}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxWidth: '400px' }}>
                            {role.permissions.slice(0, 4).map(p => (
                              <span key={p} style={{ fontSize: '11px', background: 'rgba(255,255,255,0.05)', padding: '3px 10px', borderRadius: '6px', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.05)' }}>{(p || '').replace('_', ' ')}</span>
                            ))}
                            {role.permissions.length > 4 && <span style={{ fontSize: '11px', color: 'var(--text-muted)', padding: '3px' }}>+{role.permissions.length - 4} more</span>}
                          </div>
                        </td>
                        <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button
                              onClick={() => {
                                setCurrentRoleData(role);
                                setIsRoleModalOpen(true);
                              }}
                              style={{
                                background: 'rgba(124, 58, 237, 0.15)', border: '1px solid rgba(124, 58, 237, 0.2)',
                                color: '#a78bfa', cursor: 'pointer', padding: '10px 18px', borderRadius: '12px',
                                transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', fontSize: '13px'
                              }}
                            >
                              <Edit size={16} /> Edit Role
                            </button>
                            <button
                              onClick={async () => {
                                if (window.confirm(`Delete role ${role.name}?`)) {
                                  await axios.delete(`${API_URL}/api/mgmt/roles/${role.id}`);
                                  axios.get(`${API_URL}/api/mgmt/roles`).then(res => setDbRoles(res.data.data));
                                }
                              }}
                              style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '10px', borderRadius: '12px', transition: 'all 0.2s' }}
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Polished Modern Modal */}
              {isRoleModalOpen && (
                <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, padding: '20px' }}>
                  <div className="glass-panel" style={{ width: '100%', maxWidth: '750px', maxHeight: '90vh', overflowY: 'hidden', background: 'var(--card-bg)', borderRadius: '32px', border: '1px solid var(--card-border)', boxShadow: '0 40px 80px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '40px 40px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h2 style={{ fontSize: '24px', fontWeight: '900', color: 'white' }}>{currentRoleData.id ? 'Edit Access Role' : 'Initialize New Role'}</h2>
                        <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>Modify the security parameters and permitted system modules.</p>
                      </div>
                      <button
                        onClick={() => setIsRoleModalOpen(false)}
                        style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', width: '40px', height: '40px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <Plus size={20} style={{ transform: 'rotate(45deg)' }} />
                      </button>
                    </div>

                    <div style={{ padding: '30px 40px', overflowY: 'auto', flex: 1 }}>
                      <div style={{ marginBottom: '32px' }}>
                        <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '12px', marginBottom: '10px', fontWeight: '800', letterSpacing: '1px' }}>ROLE IDENTIFIER</label>
                        <input
                          type="text"
                          value={currentRoleData.name}
                          onChange={(e) => setCurrentRoleData({ ...currentRoleData, name: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                          placeholder="e.g. store_manager"
                          style={{ width: '100%', padding: '16px 20px', borderRadius: '14px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--card-border)', color: 'white', outline: 'none', fontSize: '16px', fontWeight: '600' }}
                        />
                      </div>

                      <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '12px', marginBottom: '15px', fontWeight: '800', letterSpacing: '1px' }}>ACCESS MATRIX</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '12px' }}>
                          {[
                            'dashboard', 'orders', 'kitchen', 'marketing', 'menu', 'menu_order',
                            'sidebar_order', 'coupons', 'customers', 'rider_fleet', 'inventory', 'reports', 'qr_codes',
                            'feedback', 'settings', 'staff', 'restaurants', 'roles'
                          ].map(mod => {
                            const isSelected = currentRoleData.permissions.includes(mod);
                            return (
                              <div
                                key={mod}
                                onClick={() => {
                                  let newPerms = [...currentRoleData.permissions];
                                  if (isSelected) newPerms = newPerms.filter(p => p !== mod);
                                  else newPerms.push(mod);
                                  setCurrentRoleData({ ...currentRoleData, permissions: newPerms });
                                }}
                                style={{
                                  display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 18px',
                                  background: isSelected ? 'rgba(124, 58, 237, 0.15)' : 'rgba(255,255,255,0.03)',
                                  borderRadius: '16px', cursor: 'pointer', border: '1px solid',
                                  borderColor: isSelected ? 'var(--accent-primary)' : 'transparent',
                                  transition: 'all 0.2s'
                                }}
                              >
                                <div style={{ width: '18px', height: '18px', borderRadius: '5px', border: '2px solid', borderColor: isSelected ? 'var(--accent-primary)' : 'rgba(255,255,255,0.2)', background: isSelected ? 'var(--accent-primary)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  {isSelected && <Check size={12} color="white" strokeWidth={4} />}
                                </div>
                                <span style={{ fontSize: '14px', color: isSelected ? 'white' : 'rgba(255,255,255,0.5)', fontWeight: '700', textTransform: 'capitalize' }}>{(mod || '').replace('_', ' ')}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div style={{ padding: '30px 40px', borderTop: '1px solid var(--border-default)', display: 'flex', gap: '16px', background: 'var(--bg-secondary)' }}>
                      <button
                        className="btn-secondary"
                        onClick={() => setIsRoleModalOpen(false)}
                        style={{ flex: 1, padding: '16px', borderRadius: '16px', fontWeight: '700' }}
                      >
                        Discard
                      </button>
                      <button
                        className="btn-primary"
                        onClick={async () => {
                          if (!currentRoleData.name) return alert("Role name is required");
                          try {
                            await axios.post(`${API_URL}/api/mgmt/roles`, currentRoleData);
                            axios.get(`${API_URL}/api/mgmt/roles`).then(res => setDbRoles(res.data.data));
                            setIsRoleModalOpen(false);
                          } catch (e) { alert("Failed to save role"); }
                        }}
                        style={{ flex: 2, padding: '16px', borderRadius: '16px', background: 'var(--accent-primary)', color: 'white', border: 'none', fontWeight: '800', cursor: 'pointer', boxShadow: '0 10px 20px rgba(124, 58, 237, 0.3)' }}
                      >
                        Confirm & Deploy
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          {activeTab === 'sidebar_order' && (
            <div className="view-container animate-slide-up" style={{ padding: '32px', background: 'var(--bg-deep)', minHeight: '100vh' }}>
              <div className="view-header-row mb-8">
                <div className="header-left">
                  <h1 className="view-title" style={{ fontSize: '32px', fontWeight: '800', color: 'white' }}>Sidebar Configurator</h1>
                  <p className="text-muted" style={{ marginTop: '4px', fontSize: '15px' }}>Drag to reorder your navigation menu or toggle module visibility.</p>
                </div>
              </div>

              <div className="glass-panel" style={{ maxWidth: '700px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--card-border)', borderRadius: '28px', padding: '10px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {orderedSidebar.map((item, index) => (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={() => setDragItemIndex(index)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={async () => {
                        const items = [...orderedSidebar];
                        const draggedItem = items[dragItemIndex];
                        items.splice(dragItemIndex, 1);
                        items.splice(index, 0, draggedItem);
                        setOrderedSidebar(items);
                        try {
                          await axios.post(`${API_URL}/api/mgmt/sidebar/reorder`, {
                            order: items.map(it => it.id)
                          });
                        } catch (err) { alert("Failed to save new order"); }
                      }}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '16px 24px', background: 'rgba(255,255,255,0.03)', borderRadius: '18px',
                        border: '1px solid rgba(255,255,255,0.05)', cursor: 'grab',
                        transition: 'transform 0.2s, background 0.2s',
                        opacity: item.is_active ? 1 : 0.4
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ color: 'rgba(255,255,255,0.2)' }}><ListTodo size={18} /></div>
                        <div>
                          <p style={{ fontWeight: '800', color: 'white', fontSize: '15px', textTransform: 'capitalize' }}>{item.label}</p>
                          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Module: {item.module_name}</p>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                          <span style={{ fontSize: '10px', fontWeight: '900', color: item.is_active ? 'var(--accent-primary)' : '#666', letterSpacing: '1px' }}>{item.is_active ? 'VISIBLE' : 'HIDDEN'}</span>
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              try {
                                await axios.post(`${API_URL}/api/mgmt/sidebar/toggle/${item.id}`, {
                                  is_active: !item.is_active
                                });
                                const updated = [...orderedSidebar];
                                updated[index].is_active = !item.is_active;
                                setOrderedSidebar(updated);
                              } catch (err) { alert("Failed to toggle visibility"); }
                            }}
                            style={{
                              width: '48px', height: '24px', borderRadius: '12px',
                              background: item.is_active ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)',
                              border: 'none', cursor: 'pointer', position: 'relative', marginTop: '6px',
                              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                          >
                            <div style={{
                              width: '18px', height: '18px', borderRadius: '50%', background: 'white',
                              position: 'absolute', top: '3px', left: item.is_active ? '27px' : '3px',
                              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                              boxShadow: '0 2px 5px rgba(0,0,0,0.3)'
                            }} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'feedback' && (
            <div className="view-container animate-slide-up" style={{ padding: '32px', background: 'var(--bg-deep)', minHeight: '100vh' }}>
              <div className="view-header-row mb-8">
                <div className="header-left">
                  <h1 className="view-title" style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-main)' }}>Customer Sentiments</h1>
                  <p className="text-muted" style={{ marginTop: '4px', fontSize: '15px' }}>Direct qualitative feedback from neural session endpoints.</p>
                </div>
              </div>

              <div className="glass-panel" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '24px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--card-border)', color: 'var(--text-muted)', fontSize: '12px', textAlign: 'left' }}>
                      <th style={{ padding: '20px' }}>TIMESTAMP</th>
                      <th style={{ padding: '20px' }}>CUSTOMER</th>
                      <th style={{ padding: '20px' }}>TABLE</th>
                      <th style={{ padding: '20px' }}>RATING</th>
                      <th style={{ padding: '20px' }}>COMMENT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feedbackList.map((f, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid var(--card-border)', color: 'var(--text-main)' }}>
                        <td style={{ padding: '20px', fontSize: '13px' }}>{new Date(f.created_at).toLocaleString()}</td>
                        <td style={{ padding: '20px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: '700', fontSize: '14px' }}>{f.customer_name || 'Anonymous'}</span>
                            <span style={{ fontSize: '12px', opacity: 0.6 }}>{f.customer_phone || 'N/A'}</span>
                          </div>
                        </td>
                        <td style={{ padding: '20px' }}><span className="branch-id-tag">TABLE {f.table_number}</span></td>
                        <td style={{ padding: '20px' }}>
                          <div style={{ display: 'flex', gap: '2px' }}>
                            {[1, 2, 3, 4, 5].map(s => (
                              <Star key={s} size={14} fill={s <= f.rating ? '#f1c40f' : 'none'} color={s <= f.rating ? '#f1c40f' : 'var(--text-muted)'} />
                            ))}
                          </div>
                        </td>
                        <td style={{ padding: '20px', fontSize: '14px', maxWidth: '400px' }}>{f.comment || <span style={{ opacity: 0.3 }}>No verbal feedback provided.</span>}</td>
                      </tr>
                    ))}
                    {feedbackList.length === 0 && (
                      <tr>
                        <td colSpan="5" style={{ padding: '80px', textAlign: 'center', color: 'var(--text-muted)' }}>
                          <Star size={48} style={{ opacity: 0.1, marginBottom: '16px' }} />
                          <p>No customer sentiments recorded yet.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
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
          <div className="modal-content glass-panel animate-slide-up" style={{ maxWidth: '900px', width: '95%', maxHeight: '90vh', overflowY: 'auto', padding: '19px', borderRadius: '28px', background: 'var(--card-bg)', border: '1px solid var(--card-border)', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
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
                    <label style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '10px', display: 'block' }}>Discount Config</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <select
                        value={newDish.discount_type || 'none'}
                        onChange={(e) => setNewDish({ ...newDish, discount_type: e.target.value })}
                        style={{ flex: 1, height: '52px', padding: '0 12px', borderRadius: '14px', background: 'var(--bg-deep)', color: 'var(--text-main)', border: '1px solid var(--card-border)', fontSize: '14px', outline: 'none' }}
                      >
                        <option value="none">No Discount</option>
                        <option value="percent">% Percent OFF</option>
                        <option value="flat">₹ Flat OFF</option>
                      </select>
                      {newDish.discount_type !== 'none' && (
                        <input
                          type="number"
                          placeholder="Value"
                          value={newDish.discount_value || ''}
                          onChange={(e) => setNewDish({ ...newDish, discount_value: e.target.value })}
                          style={{ width: '90px', height: '52px', padding: '0 12px', borderRadius: '14px', background: 'var(--bg-deep)', color: 'var(--success)', fontWeight: '800', border: '1px solid var(--card-border)', fontSize: '14px', outline: 'none' }}
                        />
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ padding: '20px', background: 'var(--bg-deep)', borderRadius: '16px', border: '1px solid var(--card-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ display: 'block', color: 'var(--text-main)', fontSize: '15px' }}>Eligible for Global Coupons?</strong>
                    <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Can cart level coupons (like Neural Promotions) be applied on top of this item?</span>
                  </div>
                  <label className="switch">
                    <input type="checkbox" checked={newDish.allow_coupons !== false} onChange={(e) => setNewDish({ ...newDish, allow_coupons: e.target.checked })} />
                    <span className="slider round"></span>
                  </label>
                </div>

                <div style={{ padding: '20px', background: 'var(--bg-deep)', borderRadius: '16px', border: '1px solid var(--card-border)' }}>
                  <div style={{ marginBottom: '16px' }}>
                    <strong style={{ display: 'block', color: 'var(--text-main)', fontSize: '15px' }}>⏳ Time Restriction (Optional)</strong>
                    <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Set specific hours this item is available (e.g. Breakfast from 8am to 12pm). Leave empty for 24/7 availability.</span>
                  </div>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>Start Time</label>
                      <input
                        type="time"
                        value={newDish.available_from || ''}
                        onChange={(e) => setNewDish({ ...newDish, available_from: e.target.value })}
                        style={{ width: '100%', height: '48px', padding: '0 16px', borderRadius: '12px', background: 'var(--bg-primary)', color: 'var(--text-main)', border: '1px solid var(--card-border)', fontSize: '15px', outline: 'none' }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>End Time</label>
                      <input
                        type="time"
                        value={newDish.available_to || ''}
                        onChange={(e) => setNewDish({ ...newDish, available_to: e.target.value })}
                        style={{ width: '100%', height: '48px', padding: '0 16px', borderRadius: '12px', background: 'var(--bg-primary)', color: 'var(--text-main)', border: '1px solid var(--card-border)', fontSize: '15px', outline: 'none' }}
                      />
                    </div>
                  </div>
                </div>


                <div style={{ padding: '20px', background: 'var(--bg-deep)', borderRadius: '16px', border: '1px solid var(--card-border)', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '16px' }}>🔥</span>
                      <strong style={{ color: 'var(--text-main)', fontSize: '14px' }}>Best Seller</strong>
                    </div>
                    <label className="switch">
                      <input type="checkbox" checked={newDish.is_best_seller || false} onChange={(e) => setNewDish({ ...newDish, is_best_seller: e.target.checked })} />
                      <span className="slider round"></span>
                    </label>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '16px' }}>✨</span>
                      <strong style={{ color: 'var(--text-main)', fontSize: '14px' }}>Today's Special</strong>
                    </div>
                    <label className="switch">
                      <input type="checkbox" checked={newDish.is_today_special || false} onChange={(e) => setNewDish({ ...newDish, is_today_special: e.target.checked })} />
                      <span className="slider round"></span>
                    </label>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '16px' }}>👨‍🍳</span>
                      <strong style={{ color: 'var(--text-main)', fontSize: '14px' }}>Chef's Special</strong>
                    </div>
                    <label className="switch">
                      <input type="checkbox" checked={newDish.is_chef_special || false} onChange={(e) => setNewDish({ ...newDish, is_chef_special: e.target.checked })} />
                      <span className="slider round"></span>
                    </label>
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

            {/* Advanced Metrics removed */}
            {/* Sizes & Variants */}
            <div style={{ marginTop: '32px', background: 'rgba(255,255,255,0.02)', padding: '24px', borderRadius: '20px', border: '1px solid var(--card-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <label style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-main)', display: 'block' }}>Size Variants & Dynamic Pricing</label>
                <button
                  type="button"
                  onClick={() => setNewDish({ ...newDish, options: [...(newDish.options || []), { size: '', price: '' }] })}
                  style={{ padding: '6px 12px', background: 'rgba(124, 58, 237, 0.1)', color: 'var(--accent-primary)', borderRadius: '10px', fontSize: '12px', fontWeight: '700', border: '1px solid rgba(124, 58, 237, 0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Plus size={14} /> Add Variant Size
                </button>
              </div>

              {(!newDish.options || newDish.options.length === 0) ? (
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No variants active. Standard item price will be used.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {newDish.options.map((opt, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <input
                        type="text"
                        placeholder="e.g. 30ml, Glass, Half"
                        value={opt.size}
                        onChange={(e) => {
                          const newOpts = [...newDish.options];
                          newOpts[idx].size = e.target.value;
                          setNewDish({ ...newDish, options: newOpts });
                        }}
                        style={{ flex: 1, height: '44px', padding: '12px', borderRadius: '12px', background: 'var(--bg-deep)', color: 'var(--text-main)', border: '1px solid var(--card-border)', fontSize: '14px', outline: 'none' }}
                      />
                      <input
                        type="number"
                        placeholder="Price (₹)"
                        value={opt.price}
                        onChange={(e) => {
                          const newOpts = [...newDish.options];
                          newOpts[idx].price = e.target.value;
                          setNewDish({ ...newDish, options: newOpts });
                        }}
                        style={{ flex: 1, height: '44px', padding: '12px', borderRadius: '12px', background: 'var(--bg-deep)', color: 'var(--accent-primary)', fontWeight: '800', border: '1px solid var(--card-border)', fontSize: '14px', outline: 'none' }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newOpts = [...newDish.options];
                          newOpts.splice(idx, 1);
                          setNewDish({ ...newDish, options: newOpts });
                        }}
                        style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: 'var(--danger)', width: '44px', height: '44px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add-ons & Mixers */}
            <div style={{ marginTop: '24px', background: 'rgba(255,255,255,0.02)', padding: '24px', borderRadius: '20px', border: '1px solid var(--card-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <label style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-main)', display: 'block' }}>Modifiers, Mixers & Add-ons</label>
                <button
                  type="button"
                  onClick={() => setNewDish({ ...newDish, addons: [...(newDish.addons || []), { name: '', price: '' }] })}
                  style={{ padding: '6px 12px', background: 'rgba(124, 58, 237, 0.1)', color: 'var(--accent-primary)', borderRadius: '10px', fontSize: '12px', fontWeight: '700', border: '1px solid rgba(124, 58, 237, 0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Plus size={14} /> Add Modifier
                </button>
              </div>

              {(!newDish.addons || newDish.addons.length === 0) ? (
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No add-ons active for this item.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {newDish.addons.map((addon, idx) => (
                    <div key={'addon-' + idx} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <input
                        type="text"
                        placeholder="e.g. Soda, Extra Cheese, Peanuts"
                        value={addon.name}
                        onChange={(e) => {
                          const newAddons = [...newDish.addons];
                          newAddons[idx].name = e.target.value;
                          setNewDish({ ...newDish, addons: newAddons });
                        }}
                        style={{ flex: 1, height: '44px', padding: '12px', borderRadius: '12px', background: 'var(--bg-deep)', color: 'var(--text-main)', border: '1px solid var(--card-border)', fontSize: '14px', outline: 'none' }}
                      />
                      <input
                        type="number"
                        placeholder="Price (+₹)"
                        value={addon.price}
                        onChange={(e) => {
                          const newAddons = [...newDish.addons];
                          newAddons[idx].price = e.target.value;
                          setNewDish({ ...newDish, addons: newAddons });
                        }}
                        style={{ flex: 1, height: '44px', padding: '12px', borderRadius: '12px', background: 'var(--bg-deep)', color: 'var(--accent-primary)', fontWeight: '800', border: '1px solid var(--card-border)', fontSize: '14px', outline: 'none' }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newAddons = [...newDish.addons];
                          newAddons.splice(idx, 1);
                          setNewDish({ ...newDish, addons: newAddons });
                        }}
                        style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: 'var(--danger)', width: '44px', height: '44px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
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

              {/* <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', flex: 1 }}>
                <div style={{ position: 'relative', width: '50px', height: '26px', background: newDish.is_featured ? 'var(--success)' : 'rgba(255,255,255,0.1)', borderRadius: '20px', transition: 'all 0.3s' }}>
                  <div style={{ position: 'absolute', top: '3px', left: newDish.is_featured ? '27px' : '3px', width: '20px', height: '20px', borderRadius: '50%', background: 'white', transition: 'all 0.3s' }}></div>
                </div>
                <input type="checkbox" checked={newDish.is_featured} onChange={(e) => setNewDish({ ...newDish, is_featured: e.target.checked })} style={{ display: 'none' }} />
                <span style={{ fontSize: '14px', fontWeight: '700' }}>Featured Dish</span>
              </label> */}
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
                disabled={uploading || loadingStates['save_dish']}
                style={{ padding: '14px 40px', borderRadius: '14px', fontWeight: '800', fontSize: '15px', border: 'none', cursor: (uploading || loadingStates['save_dish']) ? 'not-allowed' : 'pointer', background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)', color: 'white', boxShadow: '0 10px 20px -5px rgba(124, 58, 237, 0.4)', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px' }}
                onMouseOver={(e) => !(uploading || loadingStates['save_dish']) && (e.currentTarget.style.transform = 'translateY(-2px)')}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                {(uploading || loadingStates['save_dish']) ? <div className="spinner-small" /> : 'Save Menu Item'}
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
        <div className="modal-overlay" style={{ zIndex: 10000 }}>
          <div className="modal-content glass-panel animate-slide-up" style={{ maxWidth: '600px', width: '95%', padding: '40px', borderRadius: '32px', background: 'var(--card-bg)', border: '1px solid var(--card-border)', boxShadow: 'var(--shadow-2xl)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <div>
                <h3 style={{ fontSize: '28px', fontWeight: '900', color: 'var(--text-main)', letterSpacing: '-0.5px' }}>Neural Categories</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Manage your menu clusters and taxonomies.</p>
              </div>
              <button onClick={() => setShowCatPopup(false)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', width: '40px', height: '40px', borderRadius: '50%', color: 'var(--text-main)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              <div style={{ display: 'flex', gap: '12px', background: 'var(--bg-deep)', padding: '8px', borderRadius: '20px', border: '1px solid var(--card-border)' }}>
                <input
                  type="text"
                  style={{ flex: 1, background: 'transparent', border: 'none', padding: '12px 16px', color: 'var(--text-main)', fontSize: '15px', fontWeight: '600', outline: 'none' }}
                  placeholder="Enter new cluster name..."
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                />
                <button
                  onClick={handleAddCategory}
                  disabled={loadingStates['add_category']}
                  style={{ background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)', border: 'none', padding: '12px 24px', borderRadius: '14px', color: 'white', fontWeight: '800', cursor: loadingStates['add_category'] ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 15px rgba(124, 58, 237, 0.3)' }}
                >
                  {loadingStates['add_category'] ? <div className="spinner-small" /> : <><Plus size={20} /> Add</>}
                </button>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', maxHeight: '350px', overflowY: 'auto', paddingRight: '8px' }} className="custom-scrollbar">
                {categories.length === 0 ? (
                  <div style={{ width: '100%', textAlign: 'center', padding: '40px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px dashed var(--card-border)' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No categories defined yet.</p>
                  </div>
                ) : (
                  categories.map(cat => (
                    <div
                      key={cat.id}
                      style={{
                        background: 'rgba(124, 58, 237, 0.08)',
                        color: 'var(--accent-primary)',
                        padding: '10px 18px',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        fontWeight: '700',
                        fontSize: '14px',
                        border: '1px solid rgba(124, 58, 237, 0.15)',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        cursor: 'default'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(124, 58, 237, 0.15)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(124, 58, 237, 0.08)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      {cat.name}
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (window.confirm(`Are you sure you want to delete "${cat.name}"?`)) {
                            try {
                              await axios.delete(`${API_URL}/api/menu/categories/${cat.id}`);
                              fetchData();
                            } catch (err) {
                              alert("Failed to delete category. It might have items assigned to it.");
                            }
                          }
                        }}
                        style={{
                          background: 'rgba(239, 68, 68, 0.1)',
                          border: 'none',
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          color: '#ef4444',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                      >
                        ✕
                      </button>
                    </div>
                  ))
                )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button
                  className="btn-secondary"
                  onClick={() => setShowCatPopup(false)}
                  style={{ padding: '12px 32px', borderRadius: '14px', fontWeight: '700' }}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Staff Modal */}
      {showStaffPopup && (
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
          <div className="modal-content glass-panel animate-slide-up" style={{ maxWidth: '500px', width: '90%', padding: '32px', borderRadius: '24px', background: 'var(--card-bg)', border: '1px solid var(--card-border)', boxShadow: 'var(--shadow-xl)' }}>
            <h3 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '4px' }}>{editingStaffId ? 'Edit Neural Member' : 'Recruit New Member'}</h3>
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
                <div style={{ position: 'relative' }}>
                  <input
                    type={showStaffPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={newStaff.password}
                    onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                    required
                    style={{ width: '100%', height: '48px', padding: '12px 48px 12px 16px', borderRadius: '12px', background: 'var(--bg-deep)', color: 'var(--text-main)', border: '1px solid var(--card-border)', fontSize: '14px', outline: 'none' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowStaffPassword(!showStaffPassword)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  >
                    {showStaffPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
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

              <div>
                <label style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '8px', display: 'block', textTransform: 'uppercase' }}>Assign to Restaurant *</label>
                <select
                  value={newStaff.restaurant_id || ''}
                  onChange={(e) => setNewStaff({ ...newStaff, restaurant_id: e.target.value || null })}
                  style={{ width: '100%', height: '48px', padding: '12px 16px', borderRadius: '12px', background: 'var(--bg-deep)', color: 'var(--text-main)', border: '1px solid var(--card-border)', fontSize: '14px', outline: 'none', cursor: 'pointer' }}
                >
                  <option value="">No Specific Restaurant (Global)</option>
                  {restaurantsList.map(r => (
                    <option key={r.id} value={r.id}>{r.name} ({r.city})</option>
                  ))}
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
                  disabled={loadingStates['save_staff']}
                  style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)', color: 'white', fontWeight: '800', cursor: loadingStates['save_staff'] ? 'not-allowed' : 'pointer', boxShadow: '0 8px 16px -4px rgba(124, 58, 237, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  {loadingStates['save_staff'] ? <div className="spinner-small" /> : 'Save Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Node Modal */}
      {showNodePopup && (
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
          <div className="modal-content glass-panel animate-slide-up" style={{ maxWidth: '800px', width: '95%', padding: '40px', borderRadius: '32px', background: 'var(--card-bg)', border: '1px solid var(--card-border)', boxShadow: 'var(--shadow-xl)' }}>
            <h3 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '4px' }}>{editingNodeId ? 'Edit Restaurant' : 'Add New Restaurant'}</h3>
            <p className="text-muted" style={{ fontSize: '14px', marginBottom: '24px' }}>Initialize operational backend for your restaurant network.</p>

            <div style={{ display: 'flex', borderBottom: '1px solid var(--card-border)', marginBottom: '24px', overflowX: 'auto', gap: '20px' }} className="scrollbar-hidden">
              {[
                { id: 'basic', label: 'Basic Info' },
                { id: 'location', label: 'Location' },
                { id: 'contact', label: 'Contact' },
                { id: 'timings', label: 'Timings' },
                { id: 'delivery', label: 'Delivery' },
                { id: 'billing', label: 'Billing' },
                { id: 'ai', label: 'AI Settings' },
                { id: 'branding', label: 'Branding' }
              ].map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setNodeActiveTab(t.id)}
                  style={{
                    padding: '10px 16px',
                    border: 'none',
                    borderBottom: nodeActiveTab === t.id ? '3px solid var(--accent-primary)' : '3px solid transparent',
                    color: nodeActiveTab === t.id ? 'var(--accent-primary)' : 'var(--text-muted)',
                    fontWeight: '800',
                    fontSize: '12px',
                    background: nodeActiveTab === t.id ? 'rgba(124, 58, 237, 0.05)' : 'none',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    transition: 'all 0.2s ease',
                    borderRadius: '8px 8px 0 0'
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleAddNode} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {nodeActiveTab === 'basic' && (
                <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)' }}>BRANCH NAME *</label>
                      <input type="text" value={newNode.name} onChange={(e) => setNewNode({ ...newNode, name: e.target.value })} required style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--bg-deep)', border: '1px solid var(--card-border)', color: 'white', marginTop: '4px' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)' }}>BRANCH CODE (UNIQUE) *</label>
                      <input type="text" placeholder="e.g. CC-JP-01" value={newNode.branch_code} onChange={(e) => setNewNode({ ...newNode, branch_code: e.target.value })} required style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--bg-deep)', border: '1px solid var(--card-border)', color: 'white', marginTop: '4px' }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)' }}>RESTAURANT BRAND NAME</label>
                    <input type="text" value={newNode.brand_name} onChange={(e) => setNewNode({ ...newNode, brand_name: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--bg-deep)', border: '1px solid var(--card-border)', color: 'white', marginTop: '4px' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)' }}>BRANCH TYPE</label>
                    <select value={newNode.branch_type} onChange={(e) => setNewNode({ ...newNode, branch_type: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--bg-deep)', border: '1px solid var(--card-border)', color: 'white', marginTop: '4px' }}>
                      <option value="dine_in">Dine-in</option>
                      <option value="delivery">Delivery Only</option>
                      <option value="pickup">Pickup Only</option>
                      <option value="cloud_kitchen">Cloud Kitchen</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)' }}>DESCRIPTION</label>
                    <textarea value={newNode.description} onChange={(e) => setNewNode({ ...newNode, description: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--bg-deep)', border: '1px solid var(--card-border)', color: 'white', marginTop: '4px', minHeight: '80px' }} />
                  </div>
                </div>
              )}

              {nodeActiveTab === 'location' && (
                <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)' }}>FULL ADDRESS *</label>
                    <textarea value={newNode.address} onChange={(e) => setNewNode({ ...newNode, address: e.target.value })} required style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--bg-deep)', border: '1px solid var(--card-border)', color: 'white', marginTop: '4px', minHeight: '60px' }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)' }}>CITY</label>
                      <input type="text" value={newNode.city} onChange={(e) => setNewNode({ ...newNode, city: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--bg-deep)', border: '1px solid var(--card-border)', color: 'white', marginTop: '4px' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)' }}>PINCODE</label>
                      <input type="text" value={newNode.pincode} onChange={(e) => setNewNode({ ...newNode, pincode: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--bg-deep)', border: '1px solid var(--card-border)', color: 'white', marginTop: '4px' }} />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)' }}>LATITUDE</label>
                      <input type="number" step="any" placeholder="26.9124" value={newNode.latitude} onChange={(e) => setNewNode({ ...newNode, latitude: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--bg-deep)', border: '1px solid var(--card-border)', color: 'white', marginTop: '4px' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)' }}>LONGITUDE</label>
                      <input type="number" step="any" placeholder="75.7873" value={newNode.longitude} onChange={(e) => setNewNode({ ...newNode, longitude: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--bg-deep)', border: '1px solid var(--card-border)', color: 'white', marginTop: '4px' }} />
                    </div>
                  </div>
                </div>
              )}

              {nodeActiveTab === 'contact' && (
                <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)' }}>PHONE NUMBER *</label>
                      <input type="tel" value={newNode.phone} onChange={(e) => setNewNode({ ...newNode, phone: e.target.value })} required style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--bg-deep)', border: '1px solid var(--card-border)', color: 'white', marginTop: '4px' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)' }}>WHATSAPP NUMBER</label>
                      <input type="tel" value={newNode.whatsapp_number} onChange={(e) => setNewNode({ ...newNode, whatsapp_number: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--bg-deep)', border: '1px solid var(--card-border)', color: 'white', marginTop: '4px' }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)' }}>MANAGER NAME</label>
                    <input type="text" value={newNode.manager_name} onChange={(e) => setNewNode({ ...newNode, manager_name: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--bg-deep)', border: '1px solid var(--card-border)', color: 'white', marginTop: '4px' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)' }}>BRANCH EMAIL</label>
                    <input type="email" value={newNode.email} onChange={(e) => setNewNode({ ...newNode, email: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--bg-deep)', border: '1px solid var(--card-border)', color: 'white', marginTop: '4px' }} />
                  </div>
                </div>
              )}

              {nodeActiveTab === 'timings' && (
                <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                    <span style={{ fontWeight: '700' }}>24x7 Operational</span>
                    <input type="checkbox" checked={newNode.is_24x7} onChange={(e) => setNewNode({ ...newNode, is_24x7: e.target.checked })} />
                  </div>
                  {!newNode.is_24x7 && Object.keys(newNode.working_hours || {}).map(day => (
                    <div key={day} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', alignItems: 'center' }}>
                      <span style={{ textTransform: 'capitalize', fontWeight: '700', fontSize: '13px' }}>{day}</span>
                      <input type="time" value={newNode.working_hours[day].open} onChange={(e) => {
                        const wh = { ...newNode.working_hours };
                        wh[day].open = e.target.value;
                        setNewNode({ ...newNode, working_hours: wh });
                      }} style={{ padding: '8px', borderRadius: '8px', background: 'var(--bg-deep)', border: '1px solid var(--card-border)', color: 'white' }} />
                      <input type="time" value={newNode.working_hours[day].close} onChange={(e) => {
                        const wh = { ...newNode.working_hours };
                        wh[day].close = e.target.value;
                        setNewNode({ ...newNode, working_hours: wh });
                      }} style={{ padding: '8px', borderRadius: '8px', background: 'var(--bg-deep)', border: '1px solid var(--card-border)', color: 'white' }} />
                    </div>
                  ))}
                </div>
              )}

              {nodeActiveTab === 'delivery' && (
                <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)' }}>DELIVERY RADIUS (KM)</label>
                      <input type="number" value={newNode.delivery_radius} onChange={(e) => setNewNode({ ...newNode, delivery_radius: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--bg-deep)', border: '1px solid var(--card-border)', color: 'white', marginTop: '4px' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)' }}>MIN ORDER (₹)</label>
                      <input type="number" value={newNode.min_order_amount} onChange={(e) => setNewNode({ ...newNode, min_order_amount: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--bg-deep)', border: '1px solid var(--card-border)', color: 'white', marginTop: '4px' }} />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)' }}>DELIVERY CHARGES (₹)</label>
                      <input type="number" value={newNode.delivery_charges} onChange={(e) => setNewNode({ ...newNode, delivery_charges: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--bg-deep)', border: '1px solid var(--card-border)', color: 'white', marginTop: '4px' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)' }}>FREE DELIVERY ABOVE (₹)</label>
                      <input type="number" value={newNode.free_delivery_above} onChange={(e) => setNewNode({ ...newNode, free_delivery_above: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--bg-deep)', border: '1px solid var(--card-border)', color: 'white', marginTop: '4px' }} />
                    </div>
                  </div>
                </div>
              )}

              {nodeActiveTab === 'billing' && (
                <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)' }}>GST NUMBER</label>
                    <input type="text" placeholder="22AAAAA0000A1Z5" value={newNode.gst_number} onChange={(e) => setNewNode({ ...newNode, gst_number: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--bg-deep)', border: '1px solid var(--card-border)', color: 'white', marginTop: '4px' }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)' }}>CGST (%)</label>
                      <input type="number" value={newNode.cgst} onChange={(e) => setNewNode({ ...newNode, cgst: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--bg-deep)', border: '1px solid var(--card-border)', color: 'white', marginTop: '4px' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)' }}>SGST (%)</label>
                      <input type="number" value={newNode.sgst} onChange={(e) => setNewNode({ ...newNode, sgst: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--bg-deep)', border: '1px solid var(--card-border)', color: 'white', marginTop: '4px' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)' }}>ROUND OFF BILL</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                        <input type="checkbox" checked={newNode.is_round_off} onChange={(e) => setNewNode({ ...newNode, is_round_off: e.target.checked })} style={{ width: '20px', height: '20px' }} />
                        <span style={{ fontSize: '13px', fontWeight: '700' }}>Enabled</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)' }}>INVOICE PREFIX</label>
                      <input type="text" value={newNode.invoice_prefix} onChange={(e) => setNewNode({ ...newNode, invoice_prefix: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--bg-deep)', border: '1px solid var(--card-border)', color: 'white', marginTop: '4px' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)' }}>BILL FOOTER NOTE</label>
                      <input type="text" value={newNode.bill_footer} onChange={(e) => setNewNode({ ...newNode, bill_footer: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--bg-deep)', border: '1px solid var(--card-border)', color: 'white', marginTop: '4px' }} />
                    </div>
                  </div>
                </div>
              )}

              {nodeActiveTab === 'ai' && (
                <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)' }}>AI GREETING MESSAGE</label>
                    <textarea value={newNode.ai_greeting} onChange={(e) => setNewNode({ ...newNode, ai_greeting: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--bg-deep)', border: '1px solid var(--card-border)', color: 'white', marginTop: '4px', minHeight: '80px' }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)' }}>LANGUAGE</label>
                      <select value={newNode.ai_language} onChange={(e) => setNewNode({ ...newNode, ai_language: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--bg-deep)', border: '1px solid var(--card-border)', color: 'white', marginTop: '4px' }}>
                        <option value="English">English Only</option>
                        <option value="Hindi">Hindi Only</option>
                        <option value="Hinglish">Hinglish (Mix)</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)' }}>TONE</label>
                      <select value={newNode.ai_tone} onChange={(e) => setNewNode({ ...newNode, ai_tone: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--bg-deep)', border: '1px solid var(--card-border)', color: 'white', marginTop: '4px' }}>
                        <option value="friendly">Friendly</option>
                        <option value="professional">Professional</option>
                        <option value="funny">Funny / Witty</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {nodeActiveTab === 'branding' && (
                <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)' }}>BRANCH LOGO URL</label>
                    <input type="text" value={newNode.logo_url} onChange={(e) => setNewNode({ ...newNode, logo_url: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--bg-deep)', border: '1px solid var(--card-border)', color: 'white', marginTop: '4px' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)' }}>COVER IMAGE URL</label>
                    <input type="text" value={newNode.cover_url} onChange={(e) => setNewNode({ ...newNode, cover_url: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--bg-deep)', border: '1px solid var(--card-border)', color: 'white', marginTop: '4px' }} />
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '16px', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--card-border)' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowNodePopup(false)}
                  style={{ flex: 1, padding: '14px', borderRadius: '14px', background: 'transparent', border: '1px solid var(--card-border)', color: 'var(--text-muted)', fontWeight: '700', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loadingStates['save_node']}
                  style={{ flex: 1, padding: '14px', borderRadius: '14px', border: 'none', background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)', color: 'white', fontWeight: '800', cursor: loadingStates['save_node'] ? 'not-allowed' : 'pointer', boxShadow: '0 8px 24px -6px rgba(124, 58, 237, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  {loadingStates['save_node'] ? <div className="spinner-small" /> : (nodeActiveTab === 'branding' ? 'Deploy Node 🚀' : 'Next Step →')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Coupon Modal */}
      {showCouponPopup && (
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
          <div className="modal-content glass-panel animate-slide-up" style={{ maxWidth: '500px', width: '90%', padding: '32px', borderRadius: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '24px', fontWeight: '800' }}>{editingCouponId ? 'Refine Offer' : 'Forge New Offer'}</h3>
              <div
                onClick={() => setNewCoupon({ ...newCoupon, is_active: !newCoupon.is_active })}
                className={`status-pill ${newCoupon.is_active ? 'active' : 'inactive'}`}
                style={{ cursor: 'pointer' }}
              >
                {newCoupon.is_active ? 'ACTIVE' : 'INACTIVE'}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)' }}>COUPON CODE</label>
                <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                  <input
                    type="text"
                    placeholder="e.g. WELCOME50"
                    value={newCoupon.code}
                    onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                    style={{ flex: 1, padding: '12px', borderRadius: '12px', background: 'var(--bg-deep)', border: '1px solid var(--card-border)', color: 'white' }}
                  />
                  <button
                    onClick={generateCouponCode}
                    className="btn-secondary"
                    style={{ width: '48px', padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    title="Auto-generate Code"
                  >
                    <Sparkles size={18} />
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)' }}>DISCOUNT TYPE</label>
                  <select value={newCoupon.discount_type} onChange={(e) => setNewCoupon({ ...newCoupon, discount_type: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--bg-deep)', border: '1px solid var(--card-border)', color: 'white', marginTop: '4px' }}>
                    <option value="percent">% Percentage</option>
                    <option value="flat">Flat Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)' }}>VALUE</label>
                  <input type="number" placeholder="0.00" value={newCoupon.discount_value} onChange={(e) => setNewCoupon({ ...newCoupon, discount_value: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--bg-deep)', border: '1px solid var(--card-border)', color: 'white', marginTop: '4px' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)' }}>MIN ORDER (₹)</label>
                  <input type="number" value={newCoupon.min_order_value} onChange={(e) => setNewCoupon({ ...newCoupon, min_order_value: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--bg-deep)', border: '1px solid var(--card-border)', color: 'white', marginTop: '4px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)' }}>USAGE LIMIT</label>
                  <input type="number" placeholder="Unlimited" value={newCoupon.usage_limit} onChange={(e) => setNewCoupon({ ...newCoupon, usage_limit: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--bg-deep)', border: '1px solid var(--card-border)', color: 'white', marginTop: '4px' }} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)' }}>EXPIRY DATE</label>
                <input type="date" value={newCoupon.expiry_date} onChange={(e) => setNewCoupon({ ...newCoupon, expiry_date: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--bg-deep)', border: '1px solid var(--card-border)', color: 'white', marginTop: '4px' }} />
              </div>

              <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
                <button className="btn-secondary" onClick={() => { setShowCouponPopup(false); setEditingCouponId(null); }} style={{ flex: 1 }}>Cancel</button>
                <button
                  className="btn-primary"
                  disabled={loadingStates['save_coupon']}
                  onClick={async () => {
                    setActionLoading('save_coupon', true);
                    try {
                      const payload = { ...newCoupon, restaurant_id: adminUser.restaurant_id };
                      if (editingCouponId) {
                        await axios.put(`${API_URL}/api/mgmt/coupons/${editingCouponId}`, payload);
                      } else {
                        await axios.post(`${API_URL}/api/mgmt/coupons`, payload);
                      }
                      setShowCouponPopup(false);
                      setEditingCouponId(null);
                      setNewCoupon({ code: '', discount_type: 'percent', discount_value: '', min_order_value: '', usage_limit: '', expiry_date: '', is_active: true });
                      fetchData();
                    } catch (e) { alert("Failed to save coupon"); }
                    finally { setActionLoading('save_coupon', false); }
                  }}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  {loadingStates['save_coupon'] ? <div className="spinner-small" /> : (editingCouponId ? 'Update Promotion' : 'Publish Offer')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rider Modal */}
      {showRiderPopup && (
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
          <div className="modal-content glass-panel animate-slide-up" style={{ maxWidth: '650px', width: '90%', padding: '32px', borderRadius: '32px', background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h3 style={{ fontSize: '24px', fontWeight: '900', color: 'var(--text-main)' }}>{editingRiderId ? 'Update Rider Profile' : 'Recruit New Rider'}</h3>
                <p className="text-muted" style={{ fontSize: '14px', marginTop: '4px' }}>Onboard delivery agents to your fleet network.</p>
              </div>
              {editingRiderId && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <label style={{ fontSize: '10px', fontWeight: '900', color: 'var(--text-muted)', marginBottom: '4px' }}>CURRENT STATUS</label>
                  <select
                    value={newRider.status}
                    onChange={(e) => setNewRider({ ...newRider, status: e.target.value })}
                    style={{ padding: '6px 12px', borderRadius: '10px', background: 'var(--bg-deep)', border: '1px solid var(--card-border)', color: 'white', fontSize: '12px' }}
                  >
                    <option value="online">Online</option>
                    <option value="busy">Busy</option>
                    <option value="offline">Offline</option>
                  </select>
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={{ gridColumn: 'span 1' }}>
                <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Full Name *</label>
                <input type="text" placeholder="e.g. Rahul Kumar" value={newRider.name} onChange={(e) => setNewRider({ ...newRider, name: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--bg-deep)', border: '1px solid var(--card-border)', color: 'white', marginTop: '6px' }} />
              </div>
              <div style={{ gridColumn: 'span 1' }}>
                <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Phone Number *</label>
                <input type="text" placeholder="+91 XXXXX XXXXX" value={newRider.phone} onChange={(e) => setNewRider({ ...newRider, phone: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--bg-deep)', border: '1px solid var(--card-border)', color: 'white', marginTop: '6px' }} />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Vehicle Number</label>
                <input type="text" placeholder="e.g. DL 01 AB 1234" value={newRider.vehicle_number} onChange={(e) => setNewRider({ ...newRider, vehicle_number: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--bg-deep)', border: '1px solid var(--card-border)', color: 'white', marginTop: '6px' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>License Number</label>
                <input type="text" placeholder="e.g. DLXXXXXXXXXXXXX" value={newRider.license_number} onChange={(e) => setNewRider({ ...newRider, license_number: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--bg-deep)', border: '1px solid var(--card-border)', color: 'white', marginTop: '6px' }} />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Residential Address</label>
                <textarea placeholder="Complete address..." value={newRider.address} onChange={(e) => setNewRider({ ...newRider, address: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--bg-deep)', border: '1px solid var(--card-border)', color: 'white', marginTop: '6px', minHeight: '60px' }} />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Emergency Contact (Name/Phone)</label>
                <input type="text" placeholder="e.g. Brother: 98XXXXXXXX" value={newRider.emergency_contact} onChange={(e) => setNewRider({ ...newRider, emergency_contact: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--bg-deep)', border: '1px solid var(--card-border)', color: 'white', marginTop: '6px' }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--card-border)' }}>
              <button className="btn-secondary" onClick={() => setShowRiderPopup(false)} style={{ flex: 1, padding: '14px', borderRadius: '14px' }}>Cancel</button>
              <button
                className="btn-primary"
                disabled={loadingStates['save_rider']}
                onClick={async () => {
                  setActionLoading('save_rider', true);
                  try { await handleSaveRider(); }
                  finally { setActionLoading('save_rider', false); }
                }}
                style={{ flex: 2, padding: '14px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                {loadingStates['save_rider'] ? <div className="spinner-small" /> : (editingRiderId ? 'Synchronize Profile' : 'Confirm Recruitment')}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Manual Order Modal */}
      {showManualOrderPopup && (
        <div className="modal-overlay" style={{ zIndex: 10000 }}>
          <div className="modal-content glass-panel animate-slide-up" style={{ maxWidth: '1200px', width: '98%', padding: '0', borderRadius: '28px', overflow: 'hidden', display: 'flex', flexDirection: 'row', height: '92vh', background: 'var(--bg-deep)' }}>
            {/* Left Side: Menu Search */}
            <div style={{ flex: 1.5, padding: '32px', borderRight: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'hidden' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '24px', fontWeight: '900', margin: 0 }}>Select Items</h3>
                  <div style={{ position: 'relative', flex: 0.8 }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type="text"
                      placeholder="Search menu items..."
                      value={manualOrderSearch}
                      onChange={(e) => setManualOrderSearch(e.target.value)}
                      style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '14px', background: 'var(--bg-primary)', border: '1px solid var(--card-border)', color: 'white' }}
                    />
                  </div>
                </div>

                {/* Category Pills */}
                <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '8px' }}>
                  <button
                    onClick={() => setManualOrderCategory('All')}
                    className={`status-pill ${manualOrderCategory === 'All' ? 'active' : 'inactive'}`}
                    style={{ padding: '8px 16px', borderRadius: '20px', fontSize: '12px', cursor: 'pointer', whiteSpace: 'nowrap' }}
                  >
                    All Items
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setManualOrderCategory(cat.name)}
                      className={`status-pill ${manualOrderCategory === cat.name ? 'active' : 'inactive'}`}
                      style={{ padding: '8px 16px', borderRadius: '20px', fontSize: '12px', cursor: 'pointer', whiteSpace: 'nowrap' }}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px', paddingRight: '8px' }}>
                {menuItems.filter(item => {
                  const matchesSearch = item.name.toLowerCase().includes(manualOrderSearch.toLowerCase());
                  const matchesCat = manualOrderCategory === 'All' || item.category === manualOrderCategory;
                  return matchesSearch && matchesCat;
                }).map(item => {
                  let discountedPrice = Number(item.price || 0);
                  let hasDiscount = false;
                  let discountBadge = '';
                  let dVal = Number(item.discount_value || 0);
                  let displayDVal = Number.isInteger(dVal) ? dVal : dVal.toFixed(2);

                  if (item.discount_type === 'percent' && dVal > 0) {
                    hasDiscount = true;
                    discountedPrice = item.price - (item.price * (dVal / 100));
                    discountBadge = `${displayDVal}% OFF`;
                  } else if (item.discount_type === 'flat' && dVal > 0) {
                    hasDiscount = true;
                    discountedPrice = item.price - dVal;
                    discountBadge = `₹${displayDVal} OFF`;
                  }
                  if (discountedPrice < 0) discountedPrice = 0;
                  discountedPrice = Math.round(discountedPrice);

                  return (
                    <div
                      key={item.id}
                      onClick={() => addToManualOrder({ ...item, price: discountedPrice })}
                      style={{
                        padding: '16px',
                        borderRadius: '20px',
                        background: 'var(--card-bg)',
                        border: '1.5px solid var(--card-border)',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'var(--accent-primary)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--card-border)'; }}
                    >
                      <div style={{ width: '100%', height: '100px', borderRadius: '12px', overflow: 'hidden', background: '#222' }}>
                        <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <strong style={{ fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {item.veg_type === 'veg' && (
                          <div style={{ width: '10px', height: '10px', border: '1px solid #22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '2px', flexShrink: 0 }}>
                            <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#22c55e' }}></div>
                          </div>
                        )}
                        {item.veg_type === 'nonveg' && (
                          <div style={{ width: '10px', height: '10px', border: '1px solid #ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '2px', flexShrink: 0 }}>
                            <div style={{ width: '0', height: '0', borderLeft: '2px solid transparent', borderRight: '2px solid transparent', borderBottom: '4px solid #ef4444' }}></div>
                          </div>
                        )}
                        {item.veg_type === 'egg' && (
                          <div style={{ width: '10px', height: '10px', border: '1px solid #eab308', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '2px', flexShrink: 0 }}>
                            <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#eab308' }}></div>
                          </div>
                        )}
                        {item.name}
                      </strong>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-main)' }}>₹{discountedPrice}</span>
                          {hasDiscount && (
                            <span style={{ fontSize: '11px', textDecoration: 'line-through', color: 'var(--text-muted)', fontWeight: '500' }}>₹{Math.round(item.price)}</span>
                          )}
                        </div>
                        {hasDiscount && (
                          <span style={{ fontSize: '10px', color: '#3b82f6', fontWeight: '800', letterSpacing: '0.5px' }}>{discountBadge}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Side: Order Summary */}
            <div style={{ flex: 1, padding: '32px', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '24px', fontWeight: '900', margin: 0 }}>Order Summary</h3>
                <button
                  onClick={() => {
                    if (isEditingOrder) {
                      setIsEditingOrder(false);
                      setManualOrderData({ tableNumber: '1', items: [], customerName: '', customerPhone: '', total: 0 });
                    }
                    setShowManualOrderPopup(false);
                  }}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  <X size={24} />
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '0.8fr 1.2fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)' }}>TABLE</label>
                  <select
                    value={manualOrderData.tableNumber}
                    onChange={(e) => setManualOrderData({ ...manualOrderData, tableNumber: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', background: 'var(--bg-deep)', border: '1px solid var(--card-border)', color: 'white', marginTop: '4px' }}
                  >
                    {restaurantTables.map((t, idx) => (
                      <option key={idx} value={t.table_number || (idx + 1)}>
                        {t.name || t.table || `Table ${t.table_number || (idx + 1)}`}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)' }}>CUSTOMER NAME</label>
                  <input
                    type="text"
                    placeholder="Name"
                    value={manualOrderData.customerName}
                    onChange={(e) => setManualOrderData({ ...manualOrderData, customerName: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', background: 'var(--bg-deep)', border: '1px solid var(--card-border)', color: 'white', marginTop: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)' }}>PHONE NUMBER</label>
                  <input
                    type="text"
                    placeholder="+91..."
                    value={manualOrderData.customerPhone}
                    onChange={(e) => setManualOrderData({ ...manualOrderData, customerPhone: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', background: 'var(--bg-deep)', border: '1px solid var(--card-border)', color: 'white', marginTop: '4px' }}
                  />
                </div>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {manualOrderData.items.map(item => {
                  let hasDiscount = item.discount_value > 0 && item.discount_type && item.discount_type !== 'none';
                  let dVal = Number(item.discount_value || 0);
                  let displayDVal = Number.isInteger(dVal) ? dVal : dVal.toFixed(2);
                  let discountBadgeText = item.discount_type === 'percent' ? `${displayDVal}% OFF` : `₹${displayDVal} OFF`;

                  return (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-deep)', padding: '12px', borderRadius: '16px', border: '1px solid var(--card-border)' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '700', fontSize: '14px' }}>{item.name} {item.selectedVariant && <span style={{ opacity: 0.7, color: 'var(--warning)' }}>({item.selectedVariant.size})</span>} {item.selectedAddons && item.selectedAddons.length > 0 && <span style={{ opacity: 0.6, fontSize: '12px' }}>[+{item.selectedAddons.map(a => a.name).join(', ')}]</span>}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                          <div style={{ fontSize: '12px', color: 'var(--accent-primary)', fontWeight: '800' }}>₹{item.price}</div>
                          {hasDiscount && (
                            <span style={{ fontSize: '10px', color: '#3b82f6', fontWeight: '800', background: 'rgba(59, 130, 246, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                              {discountBadgeText}
                            </span>
                          )}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-primary)', padding: '4px 12px', borderRadius: '10px' }}>
                        <button onClick={() => updateManualQty(item.id, -1)} style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer', fontWeight: 'bold' }}>-</button>
                        <span style={{ fontWeight: '900', fontSize: '15px' }}>{item.qty}</span>
                        <button onClick={() => updateManualQty(item.id, 1)} style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer', fontWeight: 'bold' }}>+</button>
                      </div>
                    </div>
                  )
                })}
                {manualOrderData.items.length === 0 && (
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.3 }}>
                    <UtensilsCrossed size={48} />
                    <p style={{ fontWeight: '700' }}>Your basket is empty</p>
                  </div>
                )}
              </div>

              <div style={{ borderTop: '2px solid var(--card-border)', paddingTop: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <span style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-muted)' }}>Grand Total</span>
                  <span style={{ fontSize: '24px', fontWeight: '900', color: 'var(--success)' }}>₹{manualOrderData.total}</span>
                </div>
                <button
                  onClick={submitManualOrder}
                  className="btn-primary"
                  style={{ width: '100%', padding: '16px', borderRadius: '16px', fontSize: '18px', fontWeight: '800', background: 'linear-gradient(135deg, var(--accent-primary), #4f46e5)' }}
                >
                  {isEditingOrder ? 'Update Order' : 'Confirm & Place Order'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
