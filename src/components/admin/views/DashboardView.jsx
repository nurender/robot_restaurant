import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  TrendingUp, ListTodo, Calendar, DollarSign, Clock, CheckCircle, 
  ChefHat, Star, Smartphone, Laptop, RefreshCw, Search, Bell, 
  User, Building2, ChevronDown, Layers, Download, Maximize2, ShieldAlert
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Area, 
  BarChart, Bar, Legend, Cell, PieChart, Pie, LineChart, Line 
} from 'recharts';
import { API_URL } from '../../../config';

export default function DashboardView({ 
  orders = [], 
  menuItems = [], 
  formatDate = (d) => new Date(d).toLocaleString(), 
  feedbackList = [], 
  restaurantsList = [], 
  fetchData 
}) {
  const [dateFilter, setDateFilter] = useState('7days'); // 'today', 'yesterday', '7days', '30days', 'custom'
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [selectedOrg, setSelectedOrg] = useState('1');
  const [fullscreenChart, setFullscreenChart] = useState(null); // null, 'revenue', 'trend', 'branch'
  const [isLoading, setIsLoading] = useState(false);

  // Auto-refresh hook (Polls every 30 seconds as requested)
  useEffect(() => {
    if (autoRefresh && fetchData) {
      const interval = setInterval(() => {
        handleManualRefresh();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, fetchData]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    setIsLoading(true);
    if (fetchData) {
      await fetchData();
    }
    setTimeout(() => {
      setIsRefreshing(false);
      setIsLoading(false);
    }, 600);
  };

  // Helper to parse order dates safely
  const parseOrderDate = (order) => {
    const val = order.created_at || order.timestamp;
    if (!val) return null;
    const d = new Date(isNaN(val) ? val : Number(val));
    return isNaN(d.getTime()) ? null : d;
  };

  // Filter orders by date range and selected branch
  const filteredOrders = useMemo(() => {
    const now = new Date();
    const todayStr = now.toDateString();

    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    return orders.filter(o => {
      // Branch filter
      if (selectedBranch !== 'all' && String(o.restaurant_id) !== String(selectedBranch)) {
        return false;
      }

      const orderDate = parseOrderDate(o);
      if (!orderDate) return false;

      if (dateFilter === 'today') {
        return orderDate.toDateString() === todayStr;
      }
      if (dateFilter === 'yesterday') {
        return orderDate.toDateString() === yesterdayStr;
      }
      if (dateFilter === '7days') {
        const diffDays = Math.ceil(Math.abs(now - orderDate) / (1000 * 60 * 60 * 24));
        return diffDays <= 7;
      }
      if (dateFilter === '30days') {
        const diffDays = Math.ceil(Math.abs(now - orderDate) / (1000 * 60 * 60 * 24));
        return diffDays <= 30;
      }
      if (dateFilter === 'custom') {
        if (!customStartDate || !customEndDate) return true;
        const start = new Date(customStartDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(customEndDate);
        end.setHours(23, 59, 59, 999);
        return orderDate >= start && orderDate <= end;
      }
      return true;
    });
  }, [orders, dateFilter, customStartDate, customEndDate, selectedBranch]);

  // Aggregate Key metrics
  const metrics = useMemo(() => {
    const totalRev = filteredOrders.reduce((acc, curr) => acc + (Number(curr.total) || 0), 0);
    const totalOrd = filteredOrders.length;
    const pendingOrd = filteredOrders.filter(o => o.status === 'pending' || o.status === 'preparing').length;
    const completedDeliv = filteredOrders.filter(o => o.status === 'completed' || o.status === 'delivered').length;
    const avgOrderVal = totalOrd ? Math.round(totalRev / totalOrd) : 0;

    const filteredFeedback = feedbackList.filter(f => {
      const fDate = new Date(f.created_at);
      if (isNaN(fDate.getTime())) return false;
      const now = new Date();

      if (dateFilter === 'today') return fDate.toDateString() === now.toDateString();
      if (dateFilter === 'yesterday') {
        const yesterday = new Date();
        yesterday.setDate(now.getDate() - 1);
        return fDate.toDateString() === yesterday.toDateString();
      }
      if (dateFilter === '7days') return Math.ceil(Math.abs(now - fDate) / (1000 * 60 * 60 * 24)) <= 7;
      if (dateFilter === '30days') return Math.ceil(Math.abs(now - fDate) / (1000 * 60 * 60 * 24)) <= 30;
      if (dateFilter === 'custom') {
        if (!customStartDate || !customEndDate) return true;
        return fDate >= new Date(customStartDate) && fDate <= new Date(customEndDate);
      }
      return true;
    });

    const avgRating = filteredFeedback.length
      ? (filteredFeedback.reduce((sum, f) => sum + (f.rating || 0), 0) / filteredFeedback.length).toFixed(1)
      : '4.8';

    const activeQROrders = filteredOrders.filter(o => 
      o.status !== 'completed' && 
      o.status !== 'cancelled' && 
      o.tablenumber && 
      o.tablenumber !== 'POS'
    ).length;

    // Growth rates mock
    const revenueGrowth = totalRev > 0 ? '+12.4%' : '0.0%';
    const orderGrowth = totalOrd > 0 ? '+8.2%' : '0.0%';

    return { totalRev, totalOrd, pendingOrd, completedDeliv, avgOrderVal, avgRating, activeQROrders, revenueGrowth, orderGrowth, ratingCount: filteredFeedback.length || 18 };
  }, [filteredOrders, feedbackList, dateFilter, customStartDate, customEndDate]);

  // Aggregate charts data
  const chartsData = useMemo(() => {
    // 1. Daily breakdown (Revenue Graph & Order Trend)
    const dailyDataMap = {};
    filteredOrders.forEach(o => {
      const orderDate = parseOrderDate(o);
      if (!orderDate) return;
      const key = orderDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!dailyDataMap[key]) {
        dailyDataMap[key] = { name: key, revenue: 0, orders: 0 };
      }
      dailyDataMap[key].revenue += parseFloat(o.total || 0);
      dailyDataMap[key].orders += 1;
    });

    const dailyBreakdown = Object.values(dailyDataMap);

    // 2. Top Selling Items (Progress bars details)
    const itemMap = {};
    filteredOrders.forEach(o => {
      let items = [];
      try {
        items = typeof o.items === 'string' ? JSON.parse(o.items) : o.items;
      } catch (e) {
        items = [];
      }
      (items || []).forEach(item => {
        const name = item.name || 'Unknown Item';
        itemMap[name] = (itemMap[name] || 0) + (item.qty || item.quantity || 1);
      });
    });

    const topSelling = Object.entries(itemMap)
      .map(([name, qty]) => {
        const match = menuItems.find(m => m.name === name);
        const price = match ? Number(match.price) : 150;
        return { 
          name, 
          qty, 
          revenue: qty * price
        };
      })
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 10);

    // 3. Peak Ordering Time (Heatmap hourly mock breakdown)
    const hourMap = {};
    [...Array(24)].forEach((_, i) => hourMap[i] = 0);
    filteredOrders.forEach(o => {
      const orderDate = parseOrderDate(o);
      if (!orderDate) return;
      const hour = orderDate.getHours();
      hourMap[hour] = (hourMap[hour] || 0) + 1;
    });

    const hourlyData = Object.entries(hourMap).map(([hour, count]) => {
      const hNum = parseInt(hour);
      const label = hNum === 0 ? '12 AM' : hNum === 12 ? '12 PM' : hNum > 12 ? `${hNum - 12} PM` : `${hNum} AM`;
      return { hour: label, value: count };
    });

    // 4. Branch wise performance
    const branchMap = {};
    filteredOrders.forEach(o => {
      const rId = o.restaurant_id || 4;
      if (!branchMap[rId]) {
        const branchObj = restaurantsList.find(r => r.id === rId);
        branchMap[rId] = { name: branchObj ? branchObj.name : `Branch #${rId}`, revenue: 0, orders: 0 };
      }
      branchMap[rId].revenue += parseFloat(o.total || 0);
      branchMap[rId].orders += 1;
    });
    const branchPerformance = Object.values(branchMap);

    // 5. Online vs Offline Pie Data
    let onlineCount = 0;
    let offlineCount = 0;
    filteredOrders.forEach(o => {
      if (o.tablenumber && o.tablenumber !== 'POS') {
        onlineCount++;
      } else {
        offlineCount++;
      }
    });

    const onlineVsOffline = [
      { name: 'Online (QR)', value: onlineCount, percent: onlineCount || offlineCount ? Math.round((onlineCount / (onlineCount + offlineCount)) * 100) : 60 },
      { name: 'Offline (POS)', value: offlineCount, percent: onlineCount || offlineCount ? Math.round((offlineCount / (onlineCount + offlineCount)) * 100) : 40 }
    ];

    return { dailyBreakdown, topSelling, hourlyData, branchPerformance, onlineVsOffline };
  }, [filteredOrders, menuItems, restaurantsList]);

  // Export functions
  const exportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Order ID,Customer Name,Branch,Amount,Status,Payment,Time\n";
    filteredOrders.forEach(o => {
      csvContent += `${o.id},${o.customer_name || 'Guest'},${o.restaurant_id},${o.total},${o.status},${o.payment_method || 'Cash'},${o.timestamp || o.created_at}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `RESTO_Dashboard_Orders.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="enterprise-light-dashboard animate-slide-up">
      <style>{`
        .enterprise-light-dashboard {
          background-color: transparent !important;
          color: var(--text-main) !important;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
          min-height: 100vh;
          padding: 24px;
        }

        /* Top SaaS Header */
        .saas-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--card-bg);
          padding: 16px 24px;
          border-radius: 16px;
          border: 1px solid var(--card-border);
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          margin-bottom: 24px;
        }

        .header-meta-group {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .saas-select {
          background: var(--bg-tertiary);
          border: 1px solid var(--border-default);
          border-radius: 8px;
          padding: 6px 12px;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-main);
          outline: none;
          cursor: pointer;
        }

        .saas-btn-primary {
          background-color: var(--accent-color) !important;
          color: #ffffff !important;
          font-weight: 600 !important;
          border-radius: 8px !important;
          padding: 8px 16px !important;
          border: 1px solid var(--accent-color) !important;
          font-size: 13px !important;
          cursor: pointer !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 6px !important;
          transition: all 0.2s !important;
          height: 36px !important;
          line-height: 1 !important;
          box-shadow: 0 1px 2px rgba(37, 99, 235, 0.05) !important;
        }

        .saas-btn-primary:hover {
          filter: brightness(1.1) !important;
        }

        .saas-btn-outline {
          background-color: var(--bg-primary) !important;
          color: var(--text-main) !important;
          font-weight: 600 !important;
          border-radius: 8px !important;
          padding: 8px 16px !important;
          border: 1px solid var(--border-default) !important;
          font-size: 13px !important;
          cursor: pointer !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 6px !important;
          transition: all 0.2s !important;
          height: 36px !important;
          line-height: 1 !important;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05) !important;
        }

        .saas-btn-outline:hover {
          background-color: var(--bg-tertiary) !important;
          border-color: var(--border-default) !important;
        }

        /* Filter Pills styling overrides */
        .reports-filter-btn {
          background-color: var(--bg-tertiary) !important;
          color: var(--text-muted) !important;
          border: 1px solid var(--border-default) !important;
          border-radius: 8px !important;
          padding: 6px 14px !important;
          font-size: 12px !important;
          font-weight: 600 !important;
          cursor: pointer !important;
          transition: all 0.2s !important;
          outline: none !important;
          box-shadow: none !important;
          line-height: 1.5 !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
        }

        .reports-filter-btn:hover {
          background-color: var(--bg-primary) !important;
          color: var(--text-main) !important;
          border-color: var(--border-default) !important;
        }

        .reports-filter-btn.active {
          background-color: var(--accent-color) !important;
          color: #ffffff !important;
          border-color: var(--accent-color) !important;
          box-shadow: 0 1px 3px rgba(37, 99, 235, 0.2) !important;
        }

        /* KPI Card styling */
        .saas-kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 24px;
        }

        .saas-kpi-card {
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          border-radius: 16px;
          padding: 20px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.02);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .saas-kpi-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--premium-shadow);
        }

        .kpi-title {
          font-size: 11px;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .kpi-value {
          font-size: 24px;
          font-weight: 800;
          color: var(--text-main);
          margin-top: 8px;
        }

        .kpi-badge {
          display: inline-flex;
          align-items: center;
          font-size: 11px;
          font-weight: 600;
          padding: 2px 6px;
          border-radius: 6px;
          margin-top: 8px;
          width: fit-content;
        }

        .kpi-badge.success { background: rgba(16, 185, 129, 0.1); color: #10b981; }
        .kpi-badge.warning { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
        .kpi-badge.danger { background: rgba(239, 68, 68, 0.1); color: #ef4444; }

        /* Dashboard Rows */
        .saas-row {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
          margin-bottom: 24px;
        }

        @media (min-width: 1024px) {
          .saas-row-70-30 { grid-template-columns: 70% 30% !important; }
          .saas-row-50-50 { grid-template-columns: 50% 50% !important; }
        }

        .saas-card {
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.02);
          display: flex;
          flex-direction: column;
        }

        .card-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .card-title {
          font-size: 14px;
          font-weight: 700;
          color: var(--text-main);
          display: flex;
          align-items: center;
          gap: 8px;
        }

        /* Heatmap Grid */
        .heatmap-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 8px;
        }

        .heatmap-cell {
          background: var(--bg-tertiary);
          border-radius: 8px;
          padding: 10px 4px;
          text-align: center;
          font-size: 10px;
          font-weight: 600;
          color: var(--text-muted);
        }

        .heatmap-cell.level-1 { background-color: rgba(59, 130, 246, 0.2) !important; color: #60a5fa !important; }
        .heatmap-cell.level-2 { background-color: rgba(59, 130, 246, 0.4) !important; color: #ffffff !important; }
        .heatmap-cell.level-3 { background-color: rgba(59, 130, 246, 0.7) !important; color: #ffffff !important; }
        .heatmap-cell.level-4 { background-color: rgba(59, 130, 246, 1) !important; color: #ffffff !important; }

        /* Progress Bars */
        .progress-bar-container {
          background-color: var(--bg-tertiary);
          height: 8px;
          border-radius: 99px;
          overflow: hidden;
          width: 100%;
          margin-top: 6px;
        }

        .progress-bar-fill {
          background-color: var(--accent-color);
          height: 100%;
          border-radius: 99px;
        }

        /* Pulse indicator */
        .pulse-dot {
          width: 8px;
          height: 8px;
          background: #10b981;
          border-radius: 50%;
          display: inline-block;
          position: relative;
        }

        .pulse-dot::after {
          content: '';
          width: 100%;
          height: 100%;
          background: #10b981;
          border-radius: 50%;
          position: absolute;
          top: 0;
          left: 0;
          animation: pulse 1.5s infinite;
          opacity: 0.6;
        }

        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(2.8); opacity: 0; }
        }

        /* Tables */
        .saas-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .saas-table th {
          background: var(--bg-tertiary);
          font-size: 11px;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 12px 16px;
          border-bottom: 1px solid var(--border-default);
        }

        .saas-table td {
          padding: 14px 16px;
          font-size: 13px;
          color: var(--text-main);
          border-bottom: 1px solid var(--border-default);
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          font-size: 10px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 99px;
          text-transform: uppercase;
        }

        .status-badge.completed { background: rgba(16, 185, 129, 0.1); color: #10b981; }
        .status-badge.pending { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
        .status-badge.preparing { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
        .status-badge.cancelled { background: rgba(239, 68, 68, 0.1); color: #ef4444; }

      `}</style>

      {/* Top SaaS Header Panel */}
      <div className="saas-header">
        <div className="header-meta-group">
          {/* Org Selector */}
          <div className="flex items-center gap-1.5">
            <Building2 size={16} className="text-slate-400" />
            <select 
              value={selectedOrg} 
              onChange={(e) => setSelectedOrg(e.target.value)} 
              className="saas-select"
            >
              <option value="1">Cyber Food Court (Org)</option>
            </select>
          </div>

          {/* Branch Selector */}
          <div className="flex items-center gap-1.5">
            <Layers size={16} className="text-slate-400" />
            <select 
              value={selectedBranch} 
              onChange={(e) => setSelectedBranch(e.target.value)} 
              className="saas-select"
            >
              <option value="all">All Outlets</option>
              {restaurantsList.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Date Filter Pills */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
          {[
            { id: 'today', label: 'Today' },
            { id: 'yesterday', label: 'Yesterday' },
            { id: '7days', label: '7 Days' },
            { id: '30days', label: '30 Days' },
            { id: 'custom', label: 'Custom' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setDateFilter(f.id)}
              className={`reports-filter-btn ${dateFilter === f.id ? 'active' : ''}`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* System Operations (Refresh, Export) */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider mr-2">
            <span className="pulse-dot"></span>
            Auto Update (30s)
          </div>
          <button 
            onClick={handleManualRefresh} 
            className={`saas-btn-outline ${isRefreshing ? 'animate-spin' : ''}`}
            style={{ padding: '8px', minWidth: '36px', height: '36px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
            title="Refresh statistics"
          >
            <RefreshCw size={14} className="text-slate-500" />
          </button>
          <button 
            onClick={exportCSV} 
            className="saas-btn-outline"
          >
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* Custom range panel */}
      {dateFilter === 'custom' && (
        <div className="saas-header p-4 mb-6 animate-fade-in flex gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Start Date</span>
            <input type="date" value={customStartDate} onChange={(e) => setCustomStartDate(e.target.value)} className="saas-select bg-white" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase">End Date</span>
            <input type="date" value={customEndDate} onChange={(e) => setCustomEndDate(e.target.value)} className="saas-select bg-white" />
          </div>
        </div>
      )}

      {/* --- FIRST ROW: SUMMARY KPI CARDS --- */}
      <div className="saas-kpi-grid">
        {[
          { title: 'Total Revenue', value: `₹${metrics.totalRev.toLocaleString()}`, badgeText: metrics.revenueGrowth, icon: DollarSign, color: 'success' },
          { title: 'Total Orders', value: metrics.totalOrd, badgeText: metrics.orderGrowth, icon: ListTodo, color: 'success' },
          { title: 'Pending Orders', value: metrics.pendingOrd, badgeText: 'Needs dispatching', icon: Clock, color: 'warning' },
          { title: 'Completed Deliveries', value: metrics.completedDeliv, badgeText: '96% Rate', icon: CheckCircle, color: 'success' },
          { title: 'Avg Order Value', value: `₹${metrics.avgOrderVal.toLocaleString()}`, badgeText: 'Stable', icon: ChefHat, color: 'success' },
          { title: 'Customer Rating', value: `${metrics.avgRating} ★`, badgeText: `${metrics.ratingCount} reviews`, icon: Star, color: 'warning' }
        ].map((stat, i) => (
          <div key={i} className="saas-kpi-card">
            <div className="flex justify-between items-start">
              <span className="kpi-title">{stat.title}</span>
              <stat.icon size={18} className="text-slate-400" />
            </div>
            <h2 className="kpi-value">{stat.value}</h2>
            <span className={`kpi-badge ${stat.color}`}>{stat.badgeText}</span>
          </div>
        ))}
      </div>

      {/* --- SECOND ROW: AREA CHART & PEAK TIME --- */}
      <div className="saas-row saas-row-70-30">
        
        {/* Revenue Area Chart */}
        <div className="saas-card">
          <div className="card-header-row">
            <h4 className="card-title"><TrendingUp size={16} className="text-[#2563eb]" /> Revenue Analytics</h4>
            <span className="text-[10px] text-slate-400 font-bold uppercase">Daily Trend</span>
          </div>
          {chartsData.dailyBreakdown.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-slate-400 text-xs font-semibold">No sales data available for selected period.</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={chartsData.dailyBreakdown}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} tickLine={false} />
                <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} />
                <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Peak Ordering Heatmap Grid */}
        <div className="saas-card">
          <div className="card-header-row">
            <h4 className="card-title"><Clock size={16} className="text-amber-500" /> Peak Ordering Time</h4>
          </div>
          <div className="flex flex-col gap-4">
            <div className="heatmap-grid">
              {chartsData.hourlyData.slice(10, 22).map((item, idx) => {
                const val = item.value;
                const level = val === 0 ? '' : val < 2 ? 'level-1' : val < 5 ? 'level-2' : val < 10 ? 'level-3' : 'level-4';
                return (
                  <div key={idx} className={`heatmap-cell ${level}`} title={`${item.hour}: ${val} orders`}>
                    <span>{item.hour.split(' ')[0]}</span>
                    <strong className="block text-[9px] mt-0.5">{val}</strong>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-400 uppercase font-bold border-t border-slate-100 pt-3">
              <span>Idle</span>
              <div className="flex gap-1">
                <span className="w-2.5 h-2.5 rounded bg-blue-100 block"></span>
                <span className="w-2.5 h-2.5 rounded bg-blue-200 block"></span>
                <span className="w-2.5 h-2.5 rounded bg-blue-500 block"></span>
                <span className="w-2.5 h-2.5 rounded bg-blue-800 block"></span>
              </div>
              <span>Peak</span>
            </div>
          </div>
        </div>

      </div>

      {/* --- THIRD ROW: LINE CHART & TOP SELLING ITEMS --- */}
      <div className="saas-row saas-row-50-50">
        
        {/* Order Trend Line Chart */}
        <div className="saas-card">
          <div className="card-header-row">
            <h4 className="card-title"><ListTodo size={16} className="text-[#2563eb]" /> Order Velocity (Trend)</h4>
          </div>
          {chartsData.dailyBreakdown.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-slate-400 text-xs font-semibold">No data available for selected period.</div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={chartsData.dailyBreakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} tickLine={false} />
                <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px' }} />
                <Line type="monotone" dataKey="orders" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top Selling Items Progress list */}
        <div className="saas-card">
          <div className="card-header-row">
            <h4 className="card-title"><ChefHat size={16} className="text-amber-500" /> Top Selling Items</h4>
            <span className="text-[10px] text-slate-400 font-bold uppercase">Qty & Revenue</span>
          </div>
          {chartsData.topSelling.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs font-semibold">No data available for selected period.</div>
          ) : (
            <div className="flex flex-col gap-3 custom-scrollbar" style={{ overflowY: 'auto', maxHeight: '240px' }}>
              {chartsData.topSelling.map((dish, i) => {
                const maxQty = chartsData.topSelling[0]?.qty || 1;
                const ratio = Math.round((dish.qty / maxQty) * 100);
                return (
                  <div key={i} className="flex flex-col p-1">
                    <div className="flex justify-between items-center text-xs">
                      <strong className="text-slate-800">{dish.name}</strong>
                      <span className="text-slate-500 font-semibold">{dish.qty} sold (₹{dish.revenue.toLocaleString()})</span>
                    </div>
                    <div className="progress-bar-container">
                      <div className="progress-bar-fill" style={{ width: `${ratio}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* --- FOURTH ROW: BRANCH WISE REVENUE & ORDERS --- */}
      <div className="saas-row saas-row-50-50">
        
        {/* Branch Revenue */}
        <div className="saas-card">
          <div className="card-header-row">
            <h4 className="card-title"><Laptop size={16} className="text-[#2563eb]" /> Branch Wise Revenue</h4>
          </div>
          {chartsData.branchPerformance.length === 0 ? (
            <div className="h-60 flex items-center justify-center text-slate-400 text-xs font-semibold">No data available for selected period.</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartsData.branchPerformance} layout="vertical">
                <CartesianGrid stroke="#f3f4f6" strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" stroke="#9ca3af" fontSize={10} tickLine={false} />
                <YAxis type="category" dataKey="name" stroke="#9ca3af" fontSize={10} width={90} tickLine={false} />
                <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px' }} />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Branch Orders */}
        <div className="saas-card">
          <div className="card-header-row">
            <h4 className="card-title"><Layers size={16} className="text-emerald-500" /> Branch Wise Orders</h4>
          </div>
          {chartsData.branchPerformance.length === 0 ? (
            <div className="h-60 flex items-center justify-center text-slate-400 text-xs font-semibold">No data available for selected period.</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartsData.branchPerformance}>
                <CartesianGrid stroke="#f3f4f6" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={10} tickLine={false} />
                <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px' }} />
                <Bar dataKey="orders" fill="#10b981" radius={[4, 4, 0, 0]} barSize={25} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

      </div>

      {/* --- FIFTH ROW: ONLINE VS OFFLINE & ACTIVE QR SESSIONS --- */}
      <div className="saas-row saas-row-50-50">
        
        {/* Online vs Offline */}
        <div className="saas-card">
          <div className="card-header-row">
            <h4 className="card-title"><Smartphone size={16} className="text-violet-600" /> Online vs Offline Checkout Ratio</h4>
          </div>
          {metrics.totalOrd === 0 ? (
            <div className="h-44 flex items-center justify-center text-slate-400 text-xs font-semibold">No transaction records.</div>
          ) : (
            <div className="flex items-center justify-around h-36">
              <ResponsiveContainer width="45%" height="100%">
                <PieChart>
                  <Pie
                    data={chartsData.onlineVsOffline}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={60}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {chartsData.onlineVsOffline.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#2563eb' : '#10b981'} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-2">
                {chartsData.onlineVsOffline.map((item, i) => (
                  <div key={i} className="flex flex-col">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: i === 0 ? '#2563eb' : '#10b981' }} />
                      {item.name}
                    </div>
                    <span className="text-[10px] text-slate-400 font-semibold pl-4">{item.value} Orders ({item.percent}%)</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Active QR Counter */}
        <div className="saas-card flex justify-center items-center">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-2">Active QR Sessions Counter</span>
          <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 py-3 px-6 rounded-2xl">
            <span className="pulse-dot"></span>
            <span className="text-3xl font-black text-blue-600 font-mono">{metrics.activeQROrders}</span>
            <span className="text-xs text-blue-700 font-bold">Guests Ordering Live</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2 font-semibold text-center">Simultaneous room & tables QR connections active on SaaS nodes.</p>
        </div>

      </div>

      {/* --- BOTTOM SECTION: RECENT ORDERS TABLE --- */}
      <div className="saas-card">
        <h4 className="card-title mb-4">Recent Outlets Orders Matrix</h4>
        {filteredOrders.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs font-semibold">No data available for selected period.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="saas-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Branch Outlet</th>
                  <th>Order Type</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.slice(0, 10).map((o, idx) => {
                  const type = o.tablenumber && o.tablenumber !== 'POS' ? 'QR Ordering' : 'POS Terminal';
                  const isPending = o.status === 'pending';
                  const isPreparing = o.status === 'preparing';
                  const isCompleted = o.status === 'completed' || o.status === 'delivered';
                  const isCancelled = o.status === 'cancelled';
                  
                  const statusClass = isCompleted ? 'completed' : isPreparing ? 'preparing' : isCancelled ? 'cancelled' : 'pending';

                  return (
                    <tr key={idx}>
                      <td className="font-extrabold text-blue-600">#{o.id}</td>
                      <td className="font-bold">{o.customer_name || 'Anonymous Guest'}</td>
                      <td>Branch {o.restaurant_id}</td>
                      <td>{type}</td>
                      <td className="font-bold text-slate-900">₹{Number(o.total).toLocaleString()}</td>
                      <td>
                        <span className={`status-badge ${statusClass}`}>{o.status}</span>
                      </td>
                      <td className="font-semibold text-slate-500">{o.payment_method || 'UPI / Card'}</td>
                      <td className="text-slate-400 text-xs">{formatDate(o.created_at || o.timestamp)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
