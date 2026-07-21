import apiService from '../services/apiService';
import toast from 'react-hot-toast';
import React, { useState, useEffect, useRef } from 'react';
import { AlertCircle, Bell, Search, LogOut } from 'lucide-react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAdminData } from '../hooks/useAdminData';
import './AdminPanel.css';
import AdminSidebar from './AdminSidebar';
import ThemeToggle from './ThemeToggle';
import RobotChat from './RobotChat';
import SmartInventoryView from './admin/views/SmartInventoryView';
import CombosManagerView from './admin/views/CombosManagerView';
import RoleEditorModal from './admin/modals/RoleEditorModal';
import StaffMemberModal from './admin/modals/StaffMemberModal';
import RestaurantNodeModal from './admin/modals/RestaurantNodeModal';
import CouponModal from './admin/modals/CouponModal';
import RiderModal from './admin/modals/RiderModal';
import MenuEditorModal from './admin/modals/MenuEditorModal';
import MenuImportReviewModal from './admin/modals/MenuImportReviewModal';
import CategoryManagerModal from './admin/modals/CategoryManagerModal';
import ManualOrderModal from './admin/modals/ManualOrderModal';
import DashboardView from './admin/views/DashboardView';
import OrdersHubView from './admin/views/OrdersHubView';
import NeuralInventoryView from './admin/views/NeuralInventoryView';

import RestaurantNetworkView from './admin/views/RestaurantNetworkView';

import MarketingHubView from './admin/views/MarketingHubView';

import KitchenSystemView from './admin/views/KitchenSystemView';
import CouponsView from './admin/views/CouponsView';
import RiderFleetView from './admin/views/RiderFleetView';
import ReportsView from './admin/views/ReportsView';
import QrCodesView from './admin/views/QrCodesView';
import QrConfigView from './admin/views/QrConfigView';

import SidebarConfiguratorView from './admin/views/SidebarConfiguratorView';
import RolesManagementView from './admin/views/RolesManagementView';
import FeedbackView from './admin/views/FeedbackView';
import SystemSettingsView from './admin/views/SystemSettingsView';
import SuperAdminView from './admin/views/SuperAdminView';
import { API_URL } from '../config';

const AdminPanel = () => {
  const renderCount = useRef(0);
  useEffect(() => {
    renderCount.current += 1;
    console.log(`🎨 AdminPanel Render #${renderCount.current} (Tab: ${activeTab})`);
  });

  const [adminUser] = useState(() => {
    try {
      const saved = localStorage.getItem('admin_token');
      if (!saved || saved === 'undefined') return {};
      return JSON.parse(saved) || {};
    } catch {
      return {};
    }
  });

  const navigate = useNavigate();
  const location = useLocation();

  const pathParts = location.pathname.split('/');
  const tabFromUrl = (pathParts.length > 2 && pathParts[2]) ? pathParts[2] : null;
  const activeTab = tabFromUrl || localStorage.getItem('admin_active_tab') || 'dashboard';

  const [selectedBranchId, setSelectedBranchId] = useState(adminUser?.restaurant_id || 4);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const {
    orders, setOrders, menuItems, setMenuItems, categories, setCategories,
    staffList, setStaffList, restaurantsList, setRestaurantsList, restaurantTables,
    setRestaurantTables, coupons, setCoupons, customers, setCustomers, riders,
    setRiders, feedbackList, setFeedbackList, dbRoles, setDbRoles, orderedMenu,
    setOrderedMenu, orderedSidebar, setOrderedSidebar, analyticsData,
    activeWaiterCalls, setActiveWaiterCalls, safeGetISODate, isConnected, isLoading, fetchData
  } = useAdminData(adminUser, activeTab, selectedBranchId);

  useEffect(() => {
    const ensureValidRoute = async () => {
      let targetTab = activeTab;

      try {
        const sideRes = await apiService.getSidebar();
        const validList = sideRes.data?.data || [];

        if (validList.length > 0) {
          const sorted = [...validList].sort((a, b) => a.sort_order - b.sort_order);
          setOrderedSidebar(sorted);
          const validPaths = sorted.map(item => item.path);

          // Force base route mapping
          if (!tabFromUrl || !validPaths.includes(targetTab)) {
            targetTab = sorted[0].path;
          }
        }
      } catch (err) {
        console.error("Failed to verify active routing", err);
      }

      if (!tabFromUrl || tabFromUrl !== targetTab) {
        navigate(`/admin/${targetTab}`, { replace: true });
      } else {
        localStorage.setItem('admin_active_tab', targetTab);
      }
    };

    // Only intercept when explicitly visiting root or if no ordered sidebar exists yet
    if (!tabFromUrl || !orderedSidebar || orderedSidebar.length === 0) {
      ensureValidRoute();
    } else {
      // Fast bypass using fetched hook data
      const validPaths = orderedSidebar.map(i => i.path);
      if (!validPaths.includes(activeTab)) {
        ensureValidRoute();
      }
    }
  }, [tabFromUrl, activeTab, navigate, location.pathname, orderedSidebar]);

  const handleTabChange = (tab) => {
    localStorage.setItem('admin_active_tab', tab);
    navigate(`/admin/${tab}`);
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [collapsedCats, setCollapsedCats] = useState(new Set());
  const [chatLogs, setChatLogs] = useState([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [dragItemIndex, setDragItemIndex] = useState(null);
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
    name: '', branch_code: '', brand_name: '', description: '', branch_type: 'standalone',
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
    if (manualOrderData.items.length === 0) return toast("Please add at least one item");
    try {
      if (isEditingOrder) {
        await apiService.updateOrder(manualOrderData.id, {
          customer_name: manualOrderData.customerName,
          customer_phone: manualOrderData.customerPhone,
          items: manualOrderData.items,
          tablenumber: manualOrderData.tableNumber,
          total: manualOrderData.total
        });
      } else {
        await apiService.createOrder({
          ...manualOrderData,
          restaurant_id: adminUser.restaurant_id,
          status: 'pending'
        });
      }
      setShowManualOrderPopup(false);
      setIsEditingOrder(false);
      setManualOrderData({ tableNumber: '1', items: [], customerName: '', customerPhone: '', total: 0 });
      fetchData();
    } catch (e) { toast(isEditingOrder ? "Failed to update order" : "Failed to place order"); }
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
      await apiService.updateCoupon(coupon.id, { ...coupon, is_active: !coupon.is_active });
      fetchData();
    } catch (e) { toast.error("Failed to toggle status"); }
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



  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    window.location.href = '/admin/login';
  };

  const updateOrderStatus = async (id, status) => {
    setActionLoading(id, true);
    try {
      await apiService.updateOrderStatus(id, status);
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    } catch (e) {
      console.error(e);
      toast.error("Failed to update status");
    } finally {
      setActionLoading(id, false);
    }
  };

  const handleOrderUpdate = async (orderId) => {
    try {
      await apiService.updateOrder(orderId, {
        customer_name: editFormData.name,
        customer_phone: editFormData.phone,
        items: editFormData.items
      });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, customer_name: editFormData.name, customer_phone: editFormData.phone, customerName: editFormData.name, customerPhone: editFormData.phone, items: editFormData.items } : o));
      setEditingOrderId(null);
    } catch (err) {
      console.error("Update failed:", err);
      toast.error("Failed to update order");
    }
  };
  const handlePrintBill = (order) => {
    try {
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      if (!printWindow) {
        toast("🚨 Popup Blocked! Please allow popups for this site to print bills.");
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
      toast("Failed to initiate print process: " + e.message);
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
      toast("Print failed: " + e.message);
    }
  };

  const validateForm = () => {
    if (!newDish.name) return "Dish name is required";
    if (!newDish.category) return "Please select a category";
    if (!newDish.price || isNaN(newDish.price)) return "Valid price is required";
    if (!newDish.description) return "Description is required";
    return null;
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
        await apiService.updateDish(editingDishId, newDish);
      } else {
        await apiService.createDish({ ...newDish, restaurant_id: adminUser.restaurant_id });
      }
      setShowMenuPopup(false);
      fetchData();
    } catch (e) {
      console.error(e);
      toast.error("Failed to save dish");
    } finally {
      setActionLoading('save_dish', false);
    }
  };

  const deleteDish = async (id) => {
    if (!(await window.customConfirm("Are you sure you want to delete this neural dish?"))) return;
    setActionLoading(`delete_dish_${id}`, true);
    try {
      await apiService.deleteDish(id);
      fetchData();
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete dish");
    } finally {
      setActionLoading(`delete_dish_${id}`, false);
    }
  };

  const toggleDishActive = async (item) => {
    setActionLoading(`toggle_dish_${item.id}`, true);
    try {
      await apiService.updateDish(item.id, { ...item, is_active: !item.is_active });
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
      await apiService.createCategory({ name: newCatName, restaurant_id: adminUser.restaurant_id });
      setNewCatName('');
      setShowCatPopup(false);
      fetchData();
    } catch (e) {
      console.error(e);
      toast.error("Failed to add category");
    } finally {
      setActionLoading('add_category', false);
    }
  };
  const handleAddStaff = async (e) => {
    e.preventDefault();
    setActionLoading('save_staff', true);
    try {
      if (editingStaffId) {
        await apiService.updateUser(editingStaffId, newStaff);
        toast("Staff updated successfully!");
      } else {
        await apiService.createUser(newStaff);
        toast("Staff recruited successfully!");
      }
      setShowStaffPopup(false);
      setEditingStaffId(null);
      setNewStaff({ name: '', email: '', password: '', role: 'admin', restaurant_id: adminUser.restaurant_id });
      fetchData();
    } catch (e) {
      console.error(e);
      toast("Action failed: " + e.message);
    } finally {
      setActionLoading('save_staff', false);
    }
  };

  const handleAddNode = async (e) => {
    e.preventDefault();
    setActionLoading('save_node', true);
    try {
      if (editingNodeId) {
        await apiService.updateRestaurant(editingNodeId, newNode);
        toast("Node updated successfully!");
      } else {
        await apiService.createRestaurant(newNode);
        toast("Node deployed successfully!");
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
      toast("Action failed: " + e.message);
    } finally {
      setActionLoading('save_node', false);
    }
  };

  const deleteUser = async (id) => {
    if (!(await window.customConfirm("Are you sure you want to terminate this neural contract?"))) return;
    setActionLoading(`delete_user_${id}`, true);
    try {
      await apiService.deleteUser(id);
      fetchData();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(`delete_user_${id}`, false);
    }
  };

  const deleteRestaurant = async (id) => {
    if (!(await window.customConfirm("WARNING: Deleting this restaurant will wipe all associated data. Proceed?"))) return;
    setActionLoading(`delete_restaurant_${id}`, true);
    try {
      await apiService.deleteRestaurant(id);
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
    if (await window.customConfirm("Are you sure you want to remove this rider from the fleet?")) {
      try {
        await apiService.deleteRider(id);
        fetchData();
      } catch (err) { toast.error("Failed to remove rider"); }
    }
  };

  const handleSaveRider = async () => {
    try {
      if (editingRiderId) {
        await apiService.updateRider(editingRiderId, { ...newRider });
      } else {
        await apiService.createRider({ ...newRider, restaurant_id: adminUser.restaurant_id });
      }
      setShowRiderPopup(false);
      setEditingRiderId(null);
      setNewRider({
        name: '', phone: '', status: 'online',
        vehicle_number: '', license_number: '',
        address: '', emergency_contact: ''
      });
      fetchData();
    } catch (e) { toast(editingRiderId ? "Failed to update rider" : "Failed to recruit rider"); }
  };

  const deleteCoupon = async (id) => {
    if (!(await window.customConfirm("Are you sure you want to deactivate this neural promotion?"))) return;
    try {
      await apiService.deleteCoupon(id);
      fetchData();
    } catch (e) { toast.error("Failed to delete coupon"); }
  };

  // Display ACCESS RESTRICTED ONLY if sidebar has loaded and path is decidedly unauthorized
  const validPaths = orderedSidebar?.map(item => item.path) || [];
  if (orderedSidebar && orderedSidebar.length > 0 && !validPaths.includes(activeTab)) {
    return (
      <div className="admin-layout ext-cls-42d9d60a" >
        <AdminSidebar activeTab={activeTab} setActiveTab={handleTabChange} adminUser={adminUser} onLogout={handleLogout} orderedSidebar={orderedSidebar} />
        <div className="ext-cls-f9cd9043">
          <div className="glass-panel text-center animate-slide-up ext-cls-df783c22" >
            <div className="ext-cls-05ae1608">
              <AlertCircle size={40} className="ext-cls-ec836744" />
            </div>
            <h2 className="ext-cls-b9b33734">ACCESS RESTRICTED</h2>
            <p className="ext-cls-b061dfa4">Your role (<strong>{adminUser.role}</strong>) does not have permission to access the <strong className="ext-cls-507943c3">{activeTab}</strong> module.</p>
            <button className="btn-primary st-cls-ff40caf4" onClick={() => handleTabChange('orders')} >Return to Safety</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout animate-fade-in">
      {isLoading && (
        <div className="ext-cls-0fabc89b">
          <div className="premium-loader ext-cls-82a1a47f" ></div>
          <h2 className="ext-cls-a47fb471">
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
        orderedSidebar={orderedSidebar}
      />

      <main className={`admin-main ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <header className="main-header">
          <div className="flex items-center gap-2 mr-auto pl-4">
            {(adminUser.role === 'super_admin' || adminUser.role === 'org_admin') && restaurantsList.length > 1 && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted font-bold uppercase tracking-wider">Active Stall/Branch:</span>
                <select
                  value={selectedBranchId}
                  onChange={(e) => setSelectedBranchId(parseInt(e.target.value))}
                  style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-default)',
                    borderRadius: '8px',
                    padding: '4px 12px',
                    fontSize: '12px',
                    color: 'var(--text-main)',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    outline: 'none'
                  }}
                >
                  {restaurantsList.map(r => (
                    <option key={r.id} value={r.id} style={{ background: 'var(--bg-primary)', color: 'var(--text-main)' }}>{r.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <div className="header-profile-premium">
            <ThemeToggle />
            <div className="ext-cls-e63b8a15" onClick={() => {
              if (activeWaiterCalls.length > 0) setActiveWaiterCalls([]); // temp clear all
            }}>
              <Bell size={22} color={activeWaiterCalls.length > 0 ? '#ef4444' : 'var(--text-muted)'} className={activeWaiterCalls.length > 0 ? 'pulse' : ''} />
              {activeWaiterCalls.length > 0 && (
                <span className="ext-cls-b5652ddf">
                  {activeWaiterCalls.length}
                </span>
              )}
              {activeWaiterCalls.length > 0 && (
                <div className="animate-fade-in ext-cls-624612c0" >
                  <div className="ext-cls-ca2f2f26">SERVICE ALERTS</div>
                  {activeWaiterCalls.map((c, i) => (
                    <div key={i} className="ext-cls-2eed4490">
                      <span className="ext-cls-c5e63a58">Table {c.table_number}</span>
                      <span className="ext-cls-2388e344">{new Date(c.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  ))}
                  <div className="ext-cls-f0f48cb7">Click bell to dismiss all</div>
                </div>
              )}
            </div>

            <div className="profile-details-group">
              <span className="profile-name">{adminUser.name}</span>
              <span className="profile-role">{adminUser.role === 'super_admin' ? 'Master Intelligence' : 'Branch Node'}</span>
            </div>
            <div
              className="profile-avatar-glow"
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              style={{ cursor: 'pointer' }}
            >
              {adminUser.name?.charAt(0)}
            </div>

            {showProfileDropdown && (
              <div
                style={{
                  position: 'absolute',
                  top: '55px',
                  right: '16px',
                  backgroundColor: '#1a1a24',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  padding: '8px',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
                  zIndex: 9999,
                  display: 'flex',
                  flexDirection: 'column',
                  minWidth: '160px',
                  animation: 'fadeIn 0.2s ease'
                }}
              >
                <div style={{ padding: '6px 8px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', marginBottom: '6px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#fff' }}>{adminUser.name}</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{adminUser.role === 'super_admin' ? 'Master Intelligence' : 'Branch Node'}</div>
                </div>
                <button
                  onClick={handleLogout}
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '11px',
                    color: '#f87171',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    width: '100%',
                    transition: 'all 0.2s',
                    outline: 'none'
                  }}
                >
                  <LogOut size={12} />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </header>

        <div className="content-scrollable scrollbar-hidden">
          {activeTab === 'dashboard' && (
            <DashboardView
              orders={orders}
              menuItems={menuItems}
              formatDate={formatDate}
              feedbackList={feedbackList}
              restaurantsList={restaurantsList}
              fetchData={fetchData}
            />
          )}

          {activeTab === 'orders' && (
            <OrdersHubView
              orders={orders}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              tableSearch={tableSearch}
              setTableSearch={setTableSearch}
              phoneSearch={phoneSearch}
              setPhoneSearch={setPhoneSearch}
              nameSearch={nameSearch}
              setNameSearch={setNameSearch}
              safeGetISODate={safeGetISODate}
              restaurantTables={restaurantTables}
              fetchData={fetchData}
              isLoading={isLoading}
              editingOrderId={editingOrderId}
              setEditingOrderId={setEditingOrderId}
              editFormData={editFormData}
              setEditFormData={setEditFormData}
              handleOrderUpdate={handleOrderUpdate}
              setShowManualOrderPopup={setShowManualOrderPopup}
              setManualOrderData={setManualOrderData}
              setIsEditingOrder={setIsEditingOrder}
              handlePrintBill={handlePrintBill}
              updateOrderStatus={updateOrderStatus}
              loadingStates={loadingStates}
              setActionLoading={setActionLoading}
              riders={riders}
            />
          )}

          {activeTab === 'menu' && (
            <NeuralInventoryView
              menuItems={menuItems}
              categories={categories}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              collapsedCats={collapsedCats}
              setCollapsedCats={setCollapsedCats}
              fetchData={fetchData}
              setShowCatPopup={setShowCatPopup}
              setNewDish={setNewDish}
              setEditingDishId={setEditingDishId}
              setFormError={setFormError}
              setShowMenuPopup={setShowMenuPopup}
              toggleDishActive={toggleDishActive}
              deleteDish={deleteDish}
              loadingStates={loadingStates}
            />
          )}

          {activeTab === 'combos' && (
            <CombosManagerView adminUser={adminUser} restaurantId={adminUser.restaurant_id || 4} menuItems={menuItems} refreshData={fetchData} />
          )}



          {activeTab === 'restaurants' && (adminUser.role === 'super_admin') && (
            <RestaurantNetworkView
              restaurantsList={restaurantsList}
              staffList={staffList}
              newStaff={newStaff}
              setNewStaff={setNewStaff}
              setShowStaffPopup={setShowStaffPopup}
              setNewNode={setNewNode}
              setEditingNodeId={setEditingNodeId}
              setShowNodePopup={setShowNodePopup}
              deleteRestaurant={deleteRestaurant}
              loadingStates={loadingStates}
              setEditingStaffId={setEditingStaffId}
              deleteUser={deleteUser}
            />
          )}

          {activeTab === 'marketing' && <MarketingHubView coupons={coupons} customers={customers} />}

          {activeTab === 'kitchen' && (
            <KitchenSystemView
              kitchenOrders={kitchenOrders}
              fetchData={fetchData}
              isLoading={isLoading}
              editingOrderId={editingOrderId}
              setEditingOrderId={setEditingOrderId}
              editFormData={editFormData}
              setEditFormData={setEditFormData}
              handleOrderUpdate={handleOrderUpdate}
              kitchenItemChecked={kitchenItemChecked}
              setKitchenItemChecked={setKitchenItemChecked}
              updateOrderStatus={updateOrderStatus}
            />
          )}

          {activeTab === 'coupons' && (
            <CouponsView
              coupons={coupons}
              setShowCouponPopup={setShowCouponPopup}
              handleEditCoupon={handleEditCoupon}
              deleteCoupon={deleteCoupon}
              toggleCouponStatus={toggleCouponStatus}
            />
          )}



          {activeTab === 'inventory' && (
            <div className="view-container animate-slide-up ext-cls-40bdd684" >
              <div className="ext-cls-bb123862">
                <div>
                  <h1 className="view-title ext-cls-46d76c78" >Smart Inventory Hub</h1>
                  <p className="text-muted ext-cls-a6a615ae" >Automated restaurant stock operations.</p>
                </div>
              </div>
              <SmartInventoryView />
            </div>
          )}


          {activeTab === 'rider_fleet' && (
            <RiderFleetView
              riders={riders}
              setEditingRiderId={setEditingRiderId}
              setNewRider={setNewRider}
              setShowRiderPopup={setShowRiderPopup}
              fetchData={fetchData}
              handleEditRider={handleEditRider}
              handleDeleteRider={handleDeleteRider}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView
              orders={orders}
              menuItems={menuItems}
              categories={categories}
              restaurantsList={restaurantsList}
              customers={customers}
              feedbackList={feedbackList}
              fetchData={fetchData}
              formatDate={formatDate}
            />
          )}

          {activeTab === 'qr_codes' && (
            <QrCodesView
              restaurantTables={restaurantTables}
              adminUser={adminUser}
              fetchData={fetchData}
              printTableQR={printTableQR}
            />
          )}

          {activeTab === 'qr_config' && (
            <QrConfigView
              adminUser={adminUser}
            />
          )}
          {activeTab === 'roles' && (
            <RolesManagementView
              dbRoles={dbRoles}
              setDbRoles={setDbRoles}
              currentRoleData={currentRoleData}
              setCurrentRoleData={setCurrentRoleData}
              isRoleModalOpen={isRoleModalOpen}
              setIsRoleModalOpen={setIsRoleModalOpen}
              orderedSidebar={orderedSidebar}
            />
          )}

          {activeTab === 'sidebar_order' && (
            <SidebarConfiguratorView
              orderedSidebar={orderedSidebar}
              setOrderedSidebar={setOrderedSidebar}
              dragItemIndex={dragItemIndex}
              setDragItemIndex={setDragItemIndex}
            />
          )}

          {activeTab === 'feedback' && (
            <FeedbackView feedbackList={feedbackList} />
          )}

          {activeTab === 'settings' && (
            <SystemSettingsView adminUser={adminUser} restaurantsList={restaurantsList} />
          )}

          {activeTab === 'super_admin' && (
            <SuperAdminView adminUser={adminUser} />
          )}
        </div>
      </main>
      {/* Menu Modal */}
      <MenuEditorModal
        isOpen={showMenuPopup}
        onClose={() => setShowMenuPopup(false)}
        editingDishId={editingDishId}
        newDish={newDish}
        setNewDish={setNewDish}
        categories={categories}
        uploading={uploading}
        setUploading={setUploading}
        formError={formError}
        handleSaveDish={handleSaveDish}
        isSaving={loadingStates['save_dish']}
      />

      {/* AI Menu Review Overlay */}
      <MenuImportReviewModal
        isOpen={showImportReview}
        onClose={() => setShowImportReview(false)}
        extractedReviewData={extractedReviewData}
        setExtractedReviewData={setExtractedReviewData}
        adminUser={adminUser}
        categories={categories}
        fetchData={fetchData}
      />

      {/* Category Modal */}
      {showCatPopup && (
        <CategoryManagerModal
          isOpen={showCatPopup}
          onClose={() => setShowCatPopup(false)}
          categories={categories}
          newCatName={newCatName}
          setNewCatName={setNewCatName}
          handleAddCategory={handleAddCategory}
          isAdding={loadingStates['add_category']}
          fetchData={fetchData}
        />
      )}
      {/* Staff Modal */}
      <StaffMemberModal
        isOpen={showStaffPopup}
        onClose={() => setShowStaffPopup(false)}
        newStaff={newStaff}
        setNewStaff={setNewStaff}
        handleAddStaff={handleAddStaff}
        editingStaffId={editingStaffId}
        restaurantsList={restaurantsList}
        isLoading={loadingStates['save_staff']}
        dbRoles={dbRoles}
      />

      {/* Node Modal */}
      <RestaurantNodeModal
        isOpen={showNodePopup}
        onClose={() => setShowNodePopup(false)}
        editingNodeId={editingNodeId}
        newNode={newNode}
        setNewNode={setNewNode}
        handleAddNode={handleAddNode}
        nodeActiveTab={nodeActiveTab}
        setNodeActiveTab={setNodeActiveTab}
        isLoading={loadingStates['save_node']}
      />
      {/* Coupon Modal */}
      <CouponModal
        isOpen={showCouponPopup}
        onClose={() => { setShowCouponPopup(false); setEditingCouponId(null); }}
        editingCouponId={editingCouponId}
        newCoupon={newCoupon}
        setNewCoupon={setNewCoupon}
        generateCouponCode={generateCouponCode}
        isLoading={loadingStates['save_coupon']}
        handleSaveCoupon={async () => {
          setActionLoading('save_coupon', true);
          try {
            const payload = { ...newCoupon, restaurant_id: adminUser.restaurant_id };
            if (editingCouponId) {
              await apiService.updateCoupon(editingCouponId, payload);
            } else {
              await apiService.createCoupon(payload);
            }
            setShowCouponPopup(false);
            setEditingCouponId(null);
            setNewCoupon({ code: '', discount_type: 'percent', discount_value: '', min_order_value: '', usage_limit: '', expiry_date: '', is_active: true });
            fetchData();
          } catch (e) { toast.error("Failed to save coupon"); }
          finally { setActionLoading('save_coupon', false); }
        }}
      />

      {/* Rider Modal */}
      <RiderModal
        isOpen={showRiderPopup}
        onClose={() => setShowRiderPopup(false)}
        editingRiderId={editingRiderId}
        newRider={newRider}
        setNewRider={setNewRider}
        isLoading={loadingStates['save_rider']}
        handleSaveRider={async () => {
          setActionLoading('save_rider', true);
          try { await handleSaveRider(); }
          finally { setActionLoading('save_rider', false); }
        }}
      />
      {/* Manual Order Modal */}
      <ManualOrderModal
        isOpen={showManualOrderPopup}
        onClose={() => setShowManualOrderPopup(false)}
        isEditingOrder={isEditingOrder}
        setIsEditingOrder={setIsEditingOrder}
        manualOrderData={manualOrderData}
        setManualOrderData={setManualOrderData}
        manualOrderSearch={manualOrderSearch}
        setManualOrderSearch={setManualOrderSearch}
        manualOrderCategory={manualOrderCategory}
        setManualOrderCategory={setManualOrderCategory}
        menuItems={menuItems}
        categories={categories}
        restaurantTables={restaurantTables}
        addToManualOrder={addToManualOrder}
        updateManualQty={updateManualQty}
        submitManualOrder={submitManualOrder}
      />
    </div>
  );
};

export default AdminPanel;
