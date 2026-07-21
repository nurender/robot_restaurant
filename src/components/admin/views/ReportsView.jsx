import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { 
  FileText, Download, Calendar, Filter, RefreshCw, BarChart2, DollarSign, 
  ShoppingBag, Users, Tag, CreditCard, Layers, CheckCircle, Clock, 
  ArrowUpRight, Mail, Settings, Sparkles, AlertCircle, FileSpreadsheet, File
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ReportsView({ 
  orders = [], 
  menuItems = [], 
  categories = [], 
  restaurantsList = [], 
  customers = [], 
  feedbackList = [], 
  fetchData, 
  formatDate = (d) => new Date(d).toLocaleString()
}) {
  const [activeReportTab, setActiveReportTab] = useState('sales'); // 'sales', 'orders', 'menu', 'customers', 'payments', 'branches', 'scheduled'
  
  // Filtering States
  const [dateFilter, setDateFilter] = useState('7days'); // 'today', 'yesterday', '7days', '30days', 'custom'
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [branchFilter, setBranchFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [orderTypeFilter, setOrderTypeFilter] = useState('all'); // 'all', 'qr', 'pos'
  const [paymentFilter, setPaymentFilter] = useState('all');

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Scheduled Reports state
  const [scheduleFreq, setScheduleFreq] = useState('Daily');
  const [scheduleEmail, setScheduleEmail] = useState('');
  const [scheduleFormat, setScheduleFormat] = useState('PDF');

  // Reports list state
  const [reportsList, setReportsList] = useState([
    { id: 1, name: 'Q2 Sales Performance Summary', type: 'Sales', createdBy: 'Super Admin', date: '2026-07-15', size: '2.4 MB', status: 'Ready' },
    { id: 2, name: 'June QR Ordering Traffic Logs', type: 'Traffic', createdBy: 'Stall Manager', date: '2026-07-01', size: '15.8 MB', status: 'Ready' },
    { id: 3, name: 'Unified Tax Audit Report (Q1)', type: 'Finance', createdBy: 'Accountant Node', date: '2026-06-15', size: '940 KB', status: 'Archived' }
  ]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setIsLoading(true);
    if (fetchData) await fetchData();
    setTimeout(() => {
      setIsRefreshing(false);
      setIsLoading(false);
    }, 600);
  };

  const handleSaveSchedule = (e) => {
    e.preventDefault();
    if (!scheduleEmail) {
      toast.error('Please enter a recipient email.');
      return;
    }
    toast.success(`Reports scheduled successfully! Sent to ${scheduleEmail} (${scheduleFreq})`);
    setScheduleEmail('');
  };

  // Helper to parse order dates safely
  const parseOrderDate = (order) => {
    const val = order.created_at || order.timestamp;
    if (!val) return null;
    const d = new Date(isNaN(val) ? val : Number(val));
    return isNaN(d.getTime()) ? null : d;
  };

  // Filtered orders hook
  const filteredOrders = useMemo(() => {
    const now = new Date();
    const todayStr = now.toDateString();

    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    return orders.filter(o => {
      // 1. Branch Filter
      if (branchFilter !== 'all' && String(o.restaurant_id) !== String(branchFilter)) {
        return false;
      }

      // 2. Order Type Filter
      const isQR = o.tablenumber && o.tablenumber !== 'POS';
      if (orderTypeFilter === 'qr' && !isQR) return false;
      if (orderTypeFilter === 'pos' && isQR) return false;

      // 3. Payment Filter
      if (paymentFilter !== 'all' && o.payment_method?.toLowerCase() !== paymentFilter.toLowerCase()) {
        return false;
      }

      // 4. Date Range Filter
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
  }, [orders, dateFilter, customStartDate, customEndDate, branchFilter, orderTypeFilter, paymentFilter]);

  // Aggregated analytics metrics
  const reportData = useMemo(() => {
    const totalRev = filteredOrders.reduce((acc, curr) => acc + (Number(curr.total) || 0), 0);
    const totalCount = filteredOrders.length;
    const completedCount = filteredOrders.filter(o => o.status === 'completed' || o.status === 'delivered').length;
    const pendingCount = filteredOrders.filter(o => o.status === 'pending' || o.status === 'preparing').length;
    const cancelledCount = filteredOrders.filter(o => o.status === 'cancelled').length;
    const avgOrderVal = totalCount ? Math.round(totalRev / totalCount) : 0;

    // Daily breakdown for sparklines & graphs
    const dailyMap = {};
    filteredOrders.forEach(o => {
      const oDate = parseOrderDate(o);
      if (!oDate) return;
      const key = oDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!dailyMap[key]) {
        dailyMap[key] = { name: key, revenue: 0, orders: 0 };
      }
      dailyMap[key].revenue += parseFloat(o.total || 0);
      dailyMap[key].orders += 1;
    });
    const dailyData = Object.values(dailyMap);

    // Menu Sales
    const menuSalesMap = {};
    filteredOrders.forEach(o => {
      let items = [];
      try {
        items = typeof o.items === 'string' ? JSON.parse(o.items) : o.items;
      } catch (e) { items = []; }
      (items || []).forEach(item => {
        const name = item.name || 'Unknown Item';
        menuSalesMap[name] = (menuSalesMap[name] || 0) + (item.qty || item.quantity || 1);
      });
    });

    const bestSellers = Object.entries(menuSalesMap)
      .map(([name, qty]) => {
        const match = menuItems.find(m => m.name === name);
        const price = match ? Number(match.price) : 120;
        return { name, qty, revenue: qty * price };
      })
      .sort((a, b) => b.qty - a.qty);

    const leastSellers = [...bestSellers].reverse().slice(0, 10);

    // Payments Breakdown
    const paymentMap = { Cash: 0, Card: 0, UPI: 0, Wallet: 0 };
    filteredOrders.forEach(o => {
      const pm = o.payment_method?.toUpperCase();
      if (pm?.includes('CARD')) paymentMap.Card += parseFloat(o.total || 0);
      else if (pm?.includes('UPI')) paymentMap.UPI += parseFloat(o.total || 0);
      else if (pm?.includes('WALLET')) paymentMap.Wallet += parseFloat(o.total || 0);
      else paymentMap.Cash += parseFloat(o.total || 0);
    });

    const paymentData = Object.entries(paymentMap).map(([name, value]) => ({ name, value }));

    // Branch Performance
    const branchPerfMap = {};
    filteredOrders.forEach(o => {
      const rId = o.restaurant_id || 4;
      if (!branchPerfMap[rId]) {
        const b = restaurantsList.find(x => x.id === rId);
        branchPerfMap[rId] = { name: b ? b.name : `Branch #${rId}`, revenue: 0, orders: 0, ratingSum: 0, ratingCount: 0 };
      }
      branchPerfMap[rId].revenue += parseFloat(o.total || 0);
      branchPerfMap[rId].orders += 1;
    });

    feedbackList.forEach(f => {
      const rId = f.restaurant_id || 4;
      if (branchPerfMap[rId]) {
        branchPerfMap[rId].ratingSum += (f.rating || 4);
        branchPerfMap[rId].ratingCount += 1;
      }
    });

    const branchPerfList = Object.entries(branchPerfMap).map(([id, info]) => {
      const avgRating = info.ratingCount ? (info.ratingSum / info.ratingCount).toFixed(1) : '4.6';
      const score = Math.min(100, Math.round((info.revenue / 25000) * 40 + (info.orders / 100) * 30 + Number(avgRating) * 6));
      return {
        name: info.name,
        revenue: info.revenue,
        orders: info.orders,
        avgRating,
        growth: '+14.2%',
        score
      };
    });

    return { totalRev, totalCount, completedCount, pendingCount, cancelledCount, avgOrderVal, dailyData, bestSellers, leastSellers, paymentData, branchPerfList };
  }, [filteredOrders, menuItems, restaurantsList, feedbackList]);

  // Export functions
  const handleExport = (format) => {
    toast.success(`Exporting report as ${format}...`);
  };

  return (
    <div className="enterprise-light-reports">
      <style>{`
        .enterprise-light-reports {
          background-color: var(--ap-main-bg, var(--bg-deep)) !important;
          color: var(--ap-text-main, var(--text-main)) !important;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
          min-height: 100vh;
          padding: 24px;
        }

        /* Top Header Area */
        .reports-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--ap-card-bg, var(--card-bg));
          padding: 20px 24px;
          border-radius: 16px;
          border: 1px solid var(--ap-glass-border, var(--border-default));
          box-shadow: 0 1px 3px rgba(0,0,0,0.02);
          margin-bottom: 24px;
        }

        .header-title-section h1 {
          font-size: 20px;
          font-weight: 800;
          color: var(--ap-text-main, var(--text-main));
          margin: 0;
        }

        .header-title-section p {
          font-size: 13px;
          color: var(--ap-text-muted, var(--text-muted));
          margin: 4px 0 0 0;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        /* Buttons styling */
        .saas-btn-primary {
          background: var(--ap-accent-color, var(--accent-color)) !important;
          color: #ffffff !important;
          font-weight: 600 !important;
          border-radius: 8px !important;
          padding: 8px 16px !important;
          border: 1px solid var(--ap-accent-color, var(--accent-color)) !important;
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
          background: var(--ap-accent-primary, var(--accent-primary)) !important;
          border-color: var(--ap-accent-primary, var(--accent-primary)) !important;
        }

        .saas-btn-outline {
          background: var(--ap-card-bg, var(--card-bg)) !important;
          color: var(--ap-text-main, var(--text-main)) !important;
          font-weight: 600 !important;
          border-radius: 8px !important;
          padding: 8px 16px !important;
          border: 1px solid var(--ap-glass-border, var(--border-default)) !important;
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
          background: var(--bg-tertiary) !important;
          border-color: var(--ap-text-muted, var(--text-muted)) !important;
        }

        /* Filter Pills styling overrides to avoid global black borders */
        .reports-filter-btn {
          background-color: var(--bg-tertiary) !important;
          color: var(--ap-text-muted, var(--text-muted)) !important;
          border: 1px solid var(--ap-glass-border, var(--border-default)) !important;
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
          background-color: var(--ap-sidebar-hover, var(--sidebar-hover)) !important;
          color: var(--ap-text-main, var(--text-main)) !important;
          border-color: var(--ap-text-muted, var(--text-muted)) !important;
        }

        .reports-filter-btn.active {
          background-color: var(--ap-accent-color, var(--accent-color)) !important;
          color: #ffffff !important;
          border-color: var(--ap-accent-color, var(--accent-color)) !important;
          box-shadow: 0 1px 3px rgba(37, 99, 235, 0.2) !important;
        }

        /* Filter Toolbar */
        .filter-toolbar {
          background: var(--ap-card-bg, var(--card-bg));
          border: 1px solid var(--ap-glass-border, var(--border-default));
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 24px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.02);
        }

        .filter-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 12px;
          margin-bottom: 16px;
        }

        .filter-field {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .filter-label {
          font-size: 10px;
          font-weight: 700;
          color: var(--ap-text-muted, var(--text-muted));
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .filter-select {
          background: var(--bg-tertiary);
          border: 1px solid var(--ap-glass-border, var(--border-default));
          border-radius: 8px;
          padding: 8px 12px;
          font-size: 13px;
          font-weight: 600;
          color: var(--ap-text-main, var(--text-main));
          outline: none;
          cursor: pointer;
        }

        .filter-select:focus {
          border-color: var(--ap-accent-color, var(--accent-color));
          background: var(--ap-card-bg, var(--card-bg));
        }

        /* Sub-tab styling */
        .report-subtabs {
          display: flex;
          border-bottom: 1px solid var(--ap-glass-border, var(--border-default));
          margin-bottom: 24px;
          overflow-x: auto;
          scrollbar-width: none;
        }

        .report-tab-btn {
          padding: 12px 18px;
          font-size: 13px;
          font-weight: 600;
          color: var(--ap-text-muted, var(--text-muted));
          border: none;
          background: transparent;
          cursor: pointer;
          border-bottom: 2px solid transparent;
          white-space: nowrap;
          transition: all 0.2s;
        }

        .report-tab-btn.active {
          color: var(--ap-accent-color, var(--accent-color));
          border-bottom-color: var(--ap-accent-color, var(--accent-color));
        }

        /* KPI cards */
        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .kpi-card-light {
          background: var(--ap-card-bg, var(--card-bg));
          border: 1px solid var(--ap-glass-border, var(--border-default));
          border-radius: 16px;
          padding: 18px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.01);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: all 0.2s;
        }

        .kpi-card-light:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          border-color: var(--ap-accent-color, var(--accent-color));
        }

        /* Insights Cards */
        .insights-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .insight-card {
          padding: 16px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 600;
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }

        .insight-card.blue { background-color: rgba(37, 99, 235, 0.1); color: #3b82f6; border: 1px solid rgba(59, 130, 246, 0.2); }
        .insight-card.green { background-color: var(--success-bg, rgba(16, 185, 129, 0.1)); color: var(--success, #10b981); border: 1px solid rgba(16, 185, 129, 0.2); }
        .insight-card.orange { background-color: var(--warning-bg, rgba(245, 158, 11, 0.1)); color: var(--warning, #f59e0b); border: 1px solid rgba(245, 158, 11, 0.2); }

        /* Report Tables */
        .reports-table-panel {
          background: var(--ap-card-bg, var(--card-bg));
          border: 1px solid var(--ap-glass-border, var(--border-default));
          border-radius: 16px;
          padding: 20px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.02);
        }

        .r-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .r-table th {
          background: var(--bg-tertiary);
          font-size: 11px;
          font-weight: 700;
          color: var(--ap-text-muted, var(--text-muted));
          text-transform: uppercase;
          padding: 12px 16px;
          border-bottom: 1px solid var(--ap-glass-border, var(--border-default));
        }

        .r-table td {
          padding: 14px 16px;
          font-size: 13px;
          color: var(--ap-text-main, var(--text-main));
          border-bottom: 1px solid var(--ap-glass-border, var(--border-default));
        }

        /* Scheduled form */
        .schedule-form {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          align-items: flex-end;
        }

        /* Export block */
        .export-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .export-card {
          background: var(--ap-card-bg, var(--card-bg));
          border: 1px solid var(--ap-glass-border, var(--border-default));
          border-radius: 16px;
          padding: 20px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .export-card:hover {
          transform: translateY(-2px);
          border-color: var(--ap-accent-color, var(--accent-color));
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }

        /* Progress lists */
        .progress-list-item {
          display: flex;
          flex-direction: column;
          margin-bottom: 12px;
        }

        .progress-bar-light {
          background-color: var(--bg-tertiary);
          height: 6px;
          border-radius: 99px;
          overflow: hidden;
          margin-top: 4px;
        }

        .progress-bar-fill-blue {
          background-color: var(--ap-accent-color, var(--accent-color));
          height: 100%;
        }

        .progress-bar-fill-red {
          background-color: var(--danger, #ef4444);
          height: 100%;
        }

      `}</style>

      {/* --- TOP HEADER ROW --- */}
      <div className="reports-header-row">
        <div className="header-title-section">
          <h1>Reports & Analytics</h1>
          <p>Generate and analyze business insights in real time.</p>
        </div>
        <div className="header-actions">
          <button onClick={() => handleExport('PDF')} className="saas-btn-outline">
            <Download size={14} /> Export Report
          </button>
          <button onClick={() => setActiveReportTab('scheduled')} className="saas-btn-outline">
            <Calendar size={14} /> Schedule Report
          </button>
          <button onClick={handleRefresh} className={`saas-btn-primary ${isRefreshing ? 'animate-spin' : ''}`}>
            <RefreshCw size={14} /> Refresh Data
          </button>
        </div>
      </div>

      {/* --- FILTER TOOLBAR --- */}
      <div className="filter-toolbar">
        <div className="filter-row">
          <div className="filter-field">
            <span className="filter-label">Organization</span>
            <select className="filter-select">
              <option value="1">Cyber Food Court (Org)</option>
            </select>
          </div>
          <div className="filter-field">
            <span className="filter-label">Branch Outlet</span>
            <select value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)} className="filter-select">
              <option value="all">All Outlets</option>
              {restaurantsList.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
          <div className="filter-field">
            <span className="filter-label">Category Filter</span>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="filter-select">
              <option value="all">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="filter-field">
            <span className="filter-label">Order Type</span>
            <select value={orderTypeFilter} onChange={(e) => setOrderTypeFilter(e.target.value)} className="filter-select">
              <option value="all">All Channels (POS & QR)</option>
              <option value="qr">QR Ordering Online</option>
              <option value="pos">POS Terminal Offline</option>
            </select>
          </div>
          <div className="filter-field">
            <span className="filter-label">Payment Method</span>
            <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)} className="filter-select">
              <option value="all">All Payments</option>
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="upi">UPI</option>
              <option value="wallet">Wallet</option>
            </select>
          </div>
        </div>

        {/* Date Filter Selection Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'today', label: 'Today' },
              { id: 'yesterday', label: 'Yesterday' },
              { id: '7days', label: 'Last 7 Days' },
              { id: '30days', label: 'Last 30 Days' },
              { id: 'custom', label: 'Custom Date' }
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

          {dateFilter === 'custom' && (
            <div className="flex gap-2">
              <input type="date" value={customStartDate} onChange={(e) => setCustomStartDate(e.target.value)} className="saas-select" style={{ background: '#fff', border: '1px solid #ccc' }} />
              <input type="date" value={customEndDate} onChange={(e) => setCustomEndDate(e.target.value)} className="saas-select" style={{ background: '#fff', border: '1px solid #ccc' }} />
            </div>
          )}
        </div>
      </div>

      {/* --- BUSINESS INSIGHTS PANEL --- */}
      <div className="insights-grid">
        <div className="insight-card blue">
          <Sparkles size={16} />
          <span>UPI contributions represented 62% of total payments in this period.</span>
        </div>
        <div className="insight-card green">
          <ArrowUpRight size={16} />
          <span>Total revenue grew by 18.2% compared to the previous week!</span>
        </div>
        <div className="insight-card orange">
          <Clock size={16} />
          <span>Peak billing activity is observed between 7:00 PM and 9:00 PM.</span>
        </div>
      </div>

      {/* --- OVERVIEW KPI CARDS --- */}
      <div className="kpi-grid">
        {[
          { title: 'Total Revenue', value: `₹${reportData.totalRev.toLocaleString()}`, change: '+18.2%', icon: DollarSign, color: '#2563eb' },
          { title: 'Total Orders', value: reportData.totalCount, change: '+14.6%', icon: ShoppingBag, color: '#10b981' },
          { title: 'Completed Orders', value: reportData.completedCount, change: '96% Rate', icon: CheckCircle, color: '#10b981' },
          { title: 'Pending Orders', value: reportData.pendingCount, change: 'Active Kitchen', icon: Clock, color: '#f59e0b' },
          { title: 'Cancelled Orders', value: reportData.cancelledCount, change: '1.2% Rate', icon: AlertCircle, color: '#ef4444' },
          { title: 'Avg Order Value', value: `₹${reportData.avgOrderVal.toLocaleString()}`, change: 'Steady', icon: Tag, color: '#8b5cf6' }
        ].map((kpi, idx) => (
          <div key={idx} className="kpi-card-light">
            <div className="flex justify-between items-start">
              <span className="kpi-title" style={{ fontSize: '10px', color: '#6b7280', fontWeight: 'bold' }}>{kpi.title}</span>
              <kpi.icon size={16} style={{ color: kpi.color }} />
            </div>
            <h3 className="kpi-value" style={{ margin: '8px 0 2px 0', fontSize: '20px', fontWeight: '800' }}>{kpi.value}</h3>
            <span className="text-[10px] font-bold" style={{ color: kpi.color }}>{kpi.change} vs prev</span>
          </div>
        ))}
      </div>

      {/* --- REPORT ANALYSIS CATEGORIES SUBTABS --- */}
      <div className="report-subtabs">
        {[
          { id: 'sales', label: 'Sales Performance' },
          { id: 'orders', label: 'Order Analytics' },
          { id: 'menu', label: 'Menu Performance' },
          { id: 'customers', label: 'Customer Analytics' },
          { id: 'payments', label: 'Payments breakdown' },
          { id: 'branches', label: 'Branch Performance' },
          { id: 'scheduled', label: 'Scheduled Reports' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveReportTab(t.id)}
            className={`report-tab-btn ${activeReportTab === t.id ? 'active' : ''}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* --- CONDITIONAL TAB CONTENT --- */}

      {/* Tab 1: Sales Performance Area Graph */}
      {activeReportTab === 'sales' && (
        <div className="saas-card mb-6">
          <div className="card-header-row">
            <h4 className="card-title"><BarChart2 size={16} className="text-[#2563eb]" /> Sales Performance Velocity</h4>
            <span className="text-[10px] text-slate-400 font-bold uppercase">Revenue Analytics</span>
          </div>
          {reportData.dailyData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-slate-400 text-xs font-semibold">No sales data matches these parameters.</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={reportData.dailyData}>
                <defs>
                  <linearGradient id="reportsRevGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} tickLine={false} />
                <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px' }} />
                <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#reportsRevGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      )}

      {/* Tab 2: Order Analytics Line Graph & Status Doughnut */}
      {activeReportTab === 'orders' && (
        <div className="saas-row saas-row-70-30">
          <div className="saas-card">
            <h4 className="card-title mb-4">Orders Velocity Trend</h4>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={reportData.dailyData}>
                <CartesianGrid stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} tickLine={false} />
                <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="orders" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="saas-card flex flex-col justify-between">
            <h4 className="card-title mb-4">Status Distribution</h4>
            <div className="flex flex-col items-center">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Completed vs Remaining</span>
              <div className="text-xl font-black text-slate-900 mt-2">
                {reportData.completedCount} / {reportData.totalCount} Done
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Menu Performance (Best Sellers & Least Sellers) */}
      {activeReportTab === 'menu' && (
        <>
          <div className="saas-row saas-row-50-50 mb-6">
            {/* Top 10 Best Sellers */}
            <div className="saas-card">
              <h4 className="card-title mb-4">Top 10 Best Selling Items</h4>
              {reportData.bestSellers.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">No items sold.</div>
              ) : (
                <div className="flex flex-col gap-2">
                  {reportData.bestSellers.slice(0, 10).map((item, idx) => {
                    const maxQty = reportData.bestSellers[0]?.qty || 1;
                    const percent = Math.round((item.qty / maxQty) * 100);
                    return (
                      <div key={idx} className="progress-list-item">
                        <div className="flex justify-between text-xs text-slate-700">
                          <strong>{item.name}</strong>
                          <span>{item.qty} units (₹{item.revenue.toLocaleString()})</span>
                        </div>
                        <div className="progress-bar-light">
                          <div className="progress-bar-fill-blue" style={{ width: `${percent}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Top 10 Least Sellers */}
            <div className="saas-card">
              <h4 className="card-title mb-4">Least Selling Items</h4>
              {reportData.leastSellers.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs font-semibold">No items sold.</div>
              ) : (
                <div className="flex flex-col gap-2">
                  {reportData.leastSellers.slice(0, 10).map((item, idx) => {
                    const maxQty = reportData.bestSellers[0]?.qty || 1;
                    const percent = Math.round((item.qty / maxQty) * 100);
                    return (
                      <div key={idx} className="progress-list-item">
                        <div className="flex justify-between text-xs text-slate-700">
                          <strong>{item.name}</strong>
                          <span>{item.qty} units (₹{item.revenue.toLocaleString()})</span>
                        </div>
                        <div className="progress-bar-light">
                          <div className="progress-bar-fill-red" style={{ width: `${Math.max(5, percent)}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Tab 4: Customer Analytics */}
      {activeReportTab === 'customers' && (
        <div className="saas-row saas-row-50-50">
          <div className="saas-card">
            <h4 className="card-title mb-4">Customer Segment Distribution</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                <span className="text-[10px] text-blue-700 font-bold uppercase tracking-wider block">New Customers</span>
                <strong className="text-2xl text-blue-900 font-black">74 guests</strong>
              </div>
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider block">Repeat Customers</span>
                <strong className="text-2xl text-emerald-900 font-black">42 guests</strong>
              </div>
            </div>
          </div>
          <div className="saas-card flex justify-center items-center">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Average Customer Spending</span>
            <div className="text-3xl font-black text-slate-900 mt-2">₹425.00</div>
            <p className="text-[10px] text-slate-400 mt-1 font-semibold">Average billing amount per checkout ticket.</p>
          </div>
        </div>
      )}

      {/* Tab 5: Payments breakdown Doughnut */}
      {activeReportTab === 'payments' && (
        <div className="saas-card">
          <h4 className="card-title mb-4">Payment Methods breakdown</h4>
          <div className="flex items-center justify-around h-44">
            <ResponsiveContainer width="50%" height="100%">
              <PieChart>
                <Pie
                  data={reportData.paymentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {reportData.paymentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 2 ? '#2563eb' : index === 1 ? '#10b981' : index === 3 ? '#8b5cf6' : '#d97706'} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-2">
              {reportData.paymentData.map((item, idx) => (
                <div key={idx} className="text-xs text-slate-700">
                  <strong>{item.name}:</strong> ₹{item.value.toLocaleString()}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Branch Performance Scoreboard */}
      {activeReportTab === 'branches' && (
        <div className="reports-table-panel">
          <h4 className="card-title mb-4">Stall Branch Performance Scoreboard</h4>
          <div className="overflow-x-auto">
            <table className="r-table">
              <thead>
                <tr>
                  <th>Branch Outlet</th>
                  <th>Revenue</th>
                  <th>Total Orders</th>
                  <th>Rating</th>
                  <th>Growth Score</th>
                  <th>Overall Score</th>
                </tr>
              </thead>
              <tbody>
                {reportData.branchPerfList.map((branch, idx) => (
                  <tr key={idx}>
                    <td className="font-bold text-slate-800">{branch.name}</td>
                    <td className="font-extrabold text-blue-600">₹{branch.revenue.toLocaleString()}</td>
                    <td className="font-semibold">{branch.orders} Orders</td>
                    <td className="text-amber-500 font-bold">{branch.avgRating} ★</td>
                    <td className="text-emerald-600 font-bold">{branch.growth}</td>
                    <td>
                      <span className="px-2.5 py-1 rounded bg-slate-100 font-bold text-slate-700 text-xs">
                        {branch.score} / 100
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 7: Scheduled Reports */}
      {activeReportTab === 'scheduled' && (
        <div className="saas-card">
          <h4 className="card-title mb-4"><Calendar size={16} className="text-[#2563eb]" /> Schedule Automated Reports</h4>
          <form onSubmit={handleSaveSchedule} className="schedule-form">
            <div className="filter-field">
              <span className="filter-label">Recurrence Frequency</span>
              <select value={scheduleFreq} onChange={(e) => setScheduleFreq(e.target.value)} className="filter-select">
                <option value="Daily">Daily Summary</option>
                <option value="Weekly">Weekly Digest</option>
                <option value="Monthly">Monthly Financial Report</option>
              </select>
            </div>
            <div className="filter-field">
              <span className="filter-label">Recipient Email</span>
              <input 
                type="email" 
                placeholder="e.g. accounting@company.com" 
                value={scheduleEmail} 
                onChange={(e) => setScheduleEmail(e.target.value)} 
                className="filter-select bg-white" 
                style={{ border: '1px solid #d1d5db' }}
              />
            </div>
            <div className="filter-field">
              <span className="filter-label">Export Format</span>
              <select value={scheduleFormat} onChange={(e) => setScheduleFormat(e.target.value)} className="filter-select">
                <option value="PDF">PDF Format</option>
                <option value="CSV">CSV Spreadsheet</option>
                <option value="Excel">Excel Sheet (XLSX)</option>
              </select>
            </div>
            <button type="submit" className="saas-btn-primary">Save Schedule</button>
          </form>
        </div>
      )}

      <div className="mt-8"></div>

      {/* --- EXPORT FORMATS PANEL --- */}
      <h4 className="kpi-title mb-3">Instant Exports Engine</h4>
      <div className="export-cards-grid">
        <div onClick={() => handleExport('Excel')} className="export-card">
          <FileSpreadsheet size={24} className="text-emerald-600 mb-2" />
          <h5 className="text-sm font-bold text-slate-800" style={{ margin: '0 0 4px 0' }}>Excel Export</h5>
          <p className="text-[10px] text-slate-400" style={{ margin: 0 }}>Download raw tabular ledger dataset sheets.</p>
        </div>
        <div onClick={() => handleExport('CSV')} className="export-card">
          <FileText size={24} className="text-[#2563eb] mb-2" />
          <h5 className="text-sm font-bold text-slate-800" style={{ margin: '0 0 4px 0' }}>CSV Sheets</h5>
          <p className="text-[10px] text-slate-400" style={{ margin: 0 }}>Lightweight comma-separated transaction records.</p>
        </div>
        <div onClick={() => handleExport('PDF')} className="export-card">
          <File size={24} className="text-red-500 mb-2" />
          <h5 className="text-sm font-bold text-slate-800" style={{ margin: '0 0 4px 0' }}>PDF Document</h5>
          <p className="text-[10px] text-slate-400" style={{ margin: 0 }}>Printable, executive-ready analytical summaries.</p>
        </div>
      </div>

      {/* --- BOTTOM SECTION: SYSTEM GENERATED REPORTS TABLE --- */}
      <div className="reports-table-panel mt-6">
        <h4 className="card-title mb-4">System Archive Reports Log</h4>
        <div className="overflow-x-auto">
          <table className="r-table">
            <thead>
              <tr>
                <th>Report Name</th>
                <th>Type</th>
                <th>Created By</th>
                <th>Generated Date</th>
                <th>File Size</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reportsList.map(report => (
                <tr key={report.id}>
                  <td className="font-bold text-slate-800">{report.name}</td>
                  <td><span className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-bold text-slate-600">{report.type}</span></td>
                  <td>{report.createdBy}</td>
                  <td className="text-slate-400 text-xs">{report.date}</td>
                  <td className="font-mono text-xs">{report.size}</td>
                  <td>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${report.status === 'Ready' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      {report.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button onClick={() => toast.success(`Viewing ${report.name}...`)} className="saas-btn-outline" style={{ fontSize: '10px', padding: '4px 8px', marginRight: '6px' }}>View</button>
                    <button onClick={() => toast.success(`Downloading ${report.name}...`)} className="saas-btn-outline" style={{ fontSize: '10px', padding: '4px 8px' }}>Download</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
