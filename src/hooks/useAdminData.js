import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import { io } from 'socket.io-client';

const socket = io(API_URL, { autoConnect: true });

export const useAdminData = (adminUser, activeTab, selectedBranchId) => {
  const activeRestaurantId = selectedBranchId !== undefined ? selectedBranchId : (adminUser?.restaurant_id !== undefined ? adminUser.restaurant_id : 4);

  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [restaurantsList, setRestaurantsList] = useState([]);
  const [restaurantTables, setRestaurantTables] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [customers, setCustomers] = useState([]);

  const [feedbackList, setFeedbackList] = useState([]);
  const [dbRoles, setDbRoles] = useState([]);
  const [orderedMenu, setOrderedMenu] = useState([]);
  const [orderedSidebar, setOrderedSidebar] = useState([]);
  const [activeWaiterCalls, setActiveWaiterCalls] = useState([]);
  const [riders, setRiders] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Stats Analytics
  const [analyticsData, setAnalyticsData] = useState({
    revenueHistory: [], topItems: [], hourlyHeatmap: [], staffSales: []
  });

  const safeGetISODate = (order) => {
    try {
      const val = order.created_at || order.timestamp;
      if (!val) return "";
      const d = new Date(isNaN(val) ? val : Number(val));
      if (isNaN(d.getTime())) return "";
      return d.toISOString().split('T')[0];
    } catch (e) { return ""; }
  };

  const processAnalytics = (ordersList, menuList, staff) => {
    // 1. Revenue Trends (Last 7 Days)
    const revMap = {};
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    last7Days.forEach(date => revMap[date] = 0);
    ordersList.forEach(o => {
      const date = safeGetISODate(o);
      if (revMap[date] !== undefined) revMap[date] += parseFloat(o.total || 0);
    });
    const revenueHistory = last7Days.map(date => ({ date: date.split('-').slice(1).join('/'), amount: revMap[date] }));

    // 2. Top Performers
    const itemMap = {};
    ordersList.forEach(o => {
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
    ordersList.forEach(o => {
      const val = o.created_at || o.timestamp;
      const d = val ? new Date(isNaN(val) ? val : Number(val)) : new Date();
      if (!isNaN(d.getTime())) {
        const hour = d.getHours();
        hourMap[hour] = (hourMap[hour] || 0) + 1;
      }
    });
    const hourlyHeatmap = Object.entries(hourMap).map(([hour, count]) => ({
      time: `${hour}:00`,
      orders: count
    }));

    // 4. Staff Performance
    const staffMap = {};
    ordersList.forEach(o => {
      if (o.staff_id) {
        const matchingStaff = staff.find(s => s.id === o.staff_id);
        const name = matchingStaff ? matchingStaff.name : `Staff #${o.staff_id}`;
        if (!staffMap[name]) staffMap[name] = { name, sales: 0, count: 0 };
        staffMap[name].sales += parseFloat(o.total || 0);
        staffMap[name].count += 1;
      }
    });
    const staffSales = Object.values(staffMap).sort((a, b) => b.sales - a.sales);

    setAnalyticsData({ revenueHistory, topItems, hourlyHeatmap, staffSales });
  };

  useEffect(() => {
    if (orders.length > 0) {
      processAnalytics(orders, menuItems, staffList);
    }
  }, [orders, menuItems, staffList]);

  const isFetching = useRef(false);

  const fetchCoreData = async () => {
    if (!adminUser?.id) return;
    setIsLoading(true);
    try {
      const auth = { params: { restaurant_id: activeRestaurantId } };
      const fetchHelper = (url) => axios.get(url, auth).catch(err => {
        console.warn(`⚠️ Partial Fetch Failure for ${url}:`, err.message);
        return { data: { data: [] } };
      });

      const [ordersRes, menuRes, catRes, rolesRes] = await Promise.all([
        fetchHelper(`${API_URL}/api/orders`),
        fetchHelper(`${API_URL}/api/menu`),
        fetchHelper(`${API_URL}/api/menu/categories`),
        fetchHelper(`${API_URL}/api/mgmt/roles`)
      ]);

      setOrders(ordersRes.data.data || []);
      setMenuItems(menuRes.data.data || []);
      setCategories(catRes.data.data || []);
      setDbRoles(rolesRes.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTabData = async (tab) => {
    if (!adminUser?.id) return;
    try {
      const auth = { params: { restaurant_id: activeRestaurantId } };
      const fetchHelper = (url) => axios.get(url, auth).catch(() => ({ data: { data: [] } }));

      if (tab === 'staff' || tab === 'restaurants' || tab === 'dashboard' || tab === 'reports') {
        const staffRes = await fetchHelper(`${API_URL}/api/users`);
        setStaffList(staffRes.data.data || []);
      }
      if (tab === 'restaurants' || tab === 'staff' || tab === 'dashboard' || tab === 'reports') {
        const restRes = await axios.get(`${API_URL}/api/restaurants`).catch(() => ({ data: { data: [] } }));
        setRestaurantsList(restRes.data.data || []);
      }
      if (tab === 'feedback' || tab === 'dashboard' || tab === 'reports') {
        const fbRes = await fetchHelper(`${API_URL}/api/mgmt/feedback`);
        setFeedbackList(fbRes.data.data || []);
      }
      if (tab === 'rider_fleet') {
        const ridersRes = await fetchHelper(`${API_URL}/api/mgmt/riders`);
        setRiders(ridersRes.data.data || []);
      }
      if (['dashboard', 'orders', 'reports', 'qr_codes'].includes(tab)) {
        const tablesRes = await fetchHelper(`${API_URL}/api/tables`);
        setRestaurantTables(tablesRes.data.data || []);
      }
      if (tab === 'coupons' || tab === 'marketing') {
        const couponsRes = await fetchHelper(`${API_URL}/api/mgmt/coupons`);
        setCoupons(couponsRes.data.data || []);
      }
      if (tab === 'marketing' || tab === 'customers') {
        const custRes = await fetchHelper(`${API_URL}/api/mgmt/customers`);
        setCustomers(custRes.data.data || []);
      }
      if (tab === 8 || tab === 20) {
        const sideRes = await axios.get(`${API_URL}/api/mgmt/sidebar`).catch(() => ({ data: { data: [] } }));
        const list = sideRes.data.data || [];
        setOrderedSidebar(list.filter(item => item && item.id !== 10 && item.id !== 7));
      }
    } catch (e) { }
  };

  const fetchData = async () => {
    if (isFetching.current) return;
    isFetching.current = true;
    await fetchCoreData();
    await fetchTabData(activeTab);
    isFetching.current = false;
  };

  // Sync ordered menu state manually
  useEffect(() => {
    if (activeTab === 'menu_order') {
      setOrderedMenu([...menuItems]);
    }
  }, [activeTab, menuItems]);

  // Tab change or branch switch effect
  useEffect(() => {
    fetchData();
  }, [activeTab, adminUser?.id, activeRestaurantId]);

  // Core Data and Socket Connection on Mount
  useEffect(() => {
    if (!adminUser?.id) return;

    fetchCoreData();

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    const handleWaiterAlert = (data) => {
      const isMyRest = String(data.restaurant_id) === String(adminUser?.restaurant_id || 4);
      const isSuper = adminUser?.role === 'super_admin';
      if (isMyRest || isSuper) {
        setActiveWaiterCalls(prev => {
          const exists = prev.find(c => String(c.table_number) === String(data.table_number));
          if (exists) return prev;
          return [...prev, data];
        });
      }
    };

    const handleNewOrder = (order) => {
      const isMyRest = String(order.restaurant_id) === String(adminUser.restaurant_id);
      const isSuper = adminUser.role === 'super_admin';
      if (isMyRest || isSuper) {
        setOrders(prev => {
          if (prev.find(o => o.id === order.id)) return prev;
          return [order, ...prev];
        });
        new Audio('/order-alert.mp3').play().catch(() => { });
      }
    };

    const handleOrderUpdate = (updatedOrder) => {
      const isMyRest = String(updatedOrder.restaurant_id) === String(adminUser.restaurant_id);
      const isSuper = adminUser.role === 'super_admin';
      if (isMyRest || isSuper) {
        setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
      }
    };

    socket.on('waiter_alert', handleWaiterAlert);
    socket.on('new_order', handleNewOrder);
    socket.on('order_updated', handleOrderUpdate);

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('waiter_alert', handleWaiterAlert);
      socket.off('new_order', handleNewOrder);
      socket.off('order_updated', handleOrderUpdate);
    };
  }, [adminUser?.id, adminUser?.restaurant_id, adminUser?.role]);

  return {
    orders, setOrders, menuItems, setMenuItems, categories, setCategories,
    staffList, setStaffList, restaurantsList, setRestaurantsList, restaurantTables,
    setRestaurantTables, coupons, setCoupons, customers, setCustomers, riders,
    setRiders, feedbackList, setFeedbackList, dbRoles, setDbRoles, orderedMenu,
    setOrderedMenu, orderedSidebar, setOrderedSidebar, analyticsData,
    activeWaiterCalls, setActiveWaiterCalls, safeGetISODate, isConnected, isLoading, fetchData
  };
};
