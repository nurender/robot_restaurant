import React, { useState, useEffect, useMemo, useRef } from 'react';
import { TrendingUp, ListTodo, Calendar, DollarSign, Clock, CheckCircle, ChefHat, Star, Smartphone, Laptop, RefreshCw, Search, Bell, User, Building2, ChevronDown, Layers, Download, Maximize2, ShieldAlert } from 'lucide-react';
import { ResponsiveContainer, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Area, BarChart, Bar, Legend, Cell, PieChart, Pie, LineChart, Line } from 'recharts';
import { API_URL } from '../../../config';
import './DashboardView.css';
export default function DashboardView({
  adminUser,
  orders = [],
  menuItems = [],
  formatDate = d => new Date(d).toLocaleString(),
  feedbackList = [],
  restaurantsList = [],
  fetchData
}) {
  const [dateFilter, setDateFilter] = useState('7days');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [selectedOrg, setSelectedOrg] = useState('1');
  const [fullscreenChart, setFullscreenChart] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const allowedRestaurants = useMemo(() => {
    return adminUser?.role === 'super_admin'
      ? restaurantsList
      : restaurantsList.filter(r => r.id === adminUser?.restaurant_id || r.parent_id === adminUser?.restaurant_id);
  }, [adminUser, restaurantsList]);

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
      await fetchData(true);
    }
    setTimeout(() => {
      setIsRefreshing(false);
      setIsLoading(false);
    }, 600);
  };
  const parseOrderDate = order => {
    const val = order.created_at || order.timestamp;
    if (!val) return null;
    const d = new Date(isNaN(val) ? val : Number(val));
    return isNaN(d.getTime()) ? null : d;
  };
  const filteredOrders = useMemo(() => {
    const now = new Date();
    const todayStr = now.toDateString();
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();
    return orders.filter(o => {
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
  const metrics = useMemo(() => {
    const totalRev = filteredOrders
      .filter(o => o.status === 'completed' || o.status === 'delivered')
      .reduce((acc, curr) => acc + (Number(curr.total) || 0), 0);
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
    const avgRating = filteredFeedback.length ? (filteredFeedback.reduce((sum, f) => sum + (f.rating || 0), 0) / filteredFeedback.length).toFixed(1) : '4.8';
    const activeQROrders = filteredOrders.filter(o => o.status !== 'completed' && o.status !== 'cancelled' && o.tablenumber && o.tablenumber !== 'POS').length;
    const revenueGrowth = totalRev > 0 ? '+12.4%' : '0.0%';
    const orderGrowth = totalOrd > 0 ? '+8.2%' : '0.0%';
    return {
      totalRev,
      totalOrd,
      pendingOrd,
      completedDeliv,
      avgOrderVal,
      avgRating,
      activeQROrders,
      revenueGrowth,
      orderGrowth,
      ratingCount: filteredFeedback.length || 18,
      recentFeedback: filteredFeedback.slice(0, 4)
    };
  }, [filteredOrders, feedbackList, dateFilter, customStartDate, customEndDate]);
  const chartsData = useMemo(() => {
    const dailyDataMap = {};
    filteredOrders.forEach(o => {
      const orderDate = parseOrderDate(o);
      if (!orderDate) return;
      const key = orderDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
      if (!dailyDataMap[key]) {
        dailyDataMap[key] = {
          name: key,
          revenue: 0,
          orders: 0
        };
      }
      dailyDataMap[key].revenue += parseFloat(o.total || 0);
      dailyDataMap[key].orders += 1;
    });
    const dailyBreakdown = Object.values(dailyDataMap);
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
    const topSelling = Object.entries(itemMap).map(([name, qty]) => {
      const match = menuItems.find(m => m.name === name);
      const price = match ? Number(match.price) : 150;
      return {
        name,
        qty,
        revenue: qty * price,
        image_url: match?.image_url || 'https://via.placeholder.com/150',
        growth: Math.round(Math.random() * 20 + 5)
      };
    }).sort((a, b) => b.qty - a.qty).slice(0, 5);
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
      return {
        hour: label,
        value: count
      };
    });
    const branchMap = {};
    filteredOrders.forEach(o => {
      const rId = o.restaurant_id || 4;
      if (!branchMap[rId]) {
        const branchObj = restaurantsList.find(r => r.id === rId);
        branchMap[rId] = {
          name: branchObj ? branchObj.name : `Branch #${rId}`,
          revenue: 0,
          orders: 0
        };
      }
      branchMap[rId].revenue += parseFloat(o.total || 0);
      branchMap[rId].orders += 1;
    });
    const branchPerformance = Object.values(branchMap);
    let onlineCount = 0;
    let offlineCount = 0;
    filteredOrders.forEach(o => {
      if (o.tablenumber && o.tablenumber !== 'POS') {
        onlineCount++;
      } else {
        offlineCount++;
      }
    });
    const onlineVsOffline = [{
      name: 'Online (QR)',
      value: onlineCount,
      percent: onlineCount || offlineCount ? Math.round(onlineCount / (onlineCount + offlineCount) * 100) : 60
    }, {
      name: 'Offline (POS)',
      value: offlineCount,
      percent: onlineCount || offlineCount ? Math.round(offlineCount / (onlineCount + offlineCount) * 100) : 40
    }];
      // Payment Methods
      const paymentMap = {};
      filteredOrders.forEach(o => {
        const p = o.payment_method || 'Cash/UPI';
        paymentMap[p] = (paymentMap[p] || 0) + 1;
      });
      const paymentMethodsData = Object.entries(paymentMap).map(([name, value]) => ({
        name, value, percent: filteredOrders.length > 0 ? Math.round((value / filteredOrders.length) * 100) : 0
      }));

      return {
        dailyBreakdown,
        topSelling,
        hourlyData,
        branchPerformance,
        onlineVsOffline,
        paymentMethodsData
      };
  }, [filteredOrders, menuItems, restaurantsList]);
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
  return <div className="enterprise-light-dashboard animate-slide-up">
      

      {}
      <div className="saas-header">
        <div className="header-meta-group">
          {}
          <div className="flex items-center gap-1.5">
            <Building2 size={16} className="text-slate-400" />
            <select value={selectedOrg} onChange={e => setSelectedOrg(e.target.value)} className="saas-select">
              <option value="1">Cyber Food Court (Org)</option>
            </select>
          </div>

          {}
          <div className="flex items-center gap-1.5">
            <Layers size={16} className="text-slate-400" />
            <select value={selectedBranch} onChange={e => setSelectedBranch(e.target.value)} className="saas-select">
              <option value="all">All Outlets</option>
              {allowedRestaurants.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
        </div>

        {}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
          {[{
          id: 'today',
          label: 'Today'
        }, {
          id: 'yesterday',
          label: 'Yesterday'
        }, {
          id: '7days',
          label: '7 Days'
        }, {
          id: '30days',
          label: '30 Days'
        }, {
          id: 'custom',
          label: 'Custom'
        }].map(f => <button key={f.id} onClick={() => setDateFilter(f.id)} className={`reports-filter-btn ${dateFilter === f.id ? 'active' : ''}`}>
              {f.label}
            </button>)}
        </div>

        {}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider mr-2">
            <span className="pulse-dot"></span>
            Auto Update (30s)
          </div>
          <button onClick={handleManualRefresh} className={`saas-btn-outline  ex-style-b7dca9${isRefreshing ? 'animate-spin' : ''}`} title="Refresh statistics">
            <RefreshCw size={14} className="text-slate-500" />
          </button>
          <button onClick={exportCSV} className="saas-btn-outline">
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {}
      {dateFilter === 'custom' && <div className="saas-header p-4 mb-6 animate-fade-in flex gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Start Date</span>
            <input type="date" value={customStartDate} onChange={e => setCustomStartDate(e.target.value)} className="saas-select bg-white" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase">End Date</span>
            <input type="date" value={customEndDate} onChange={e => setCustomEndDate(e.target.value)} className="saas-select bg-white" />
          </div>
        </div>}

      {}
      <div className="saas-kpi-grid">
        {[{
        title: 'Total Revenue',
        value: `₹${metrics.totalRev.toLocaleString()}`,
        badgeText: metrics.revenueGrowth,
        icon: DollarSign,
        color: 'success'
      }, {
        title: 'Total Orders',
        value: metrics.totalOrd,
        badgeText: metrics.orderGrowth,
        icon: ListTodo,
        color: 'success'
      }, {
        title: 'Pending Orders',
        value: metrics.pendingOrd,
        badgeText: 'Needs dispatching',
        icon: Clock,
        color: 'warning'
      }, {
        title: 'Completed Deliveries',
        value: metrics.completedDeliv,
        badgeText: '96% Rate',
        icon: CheckCircle,
        color: 'success'
      }, {
        title: 'Avg Order Value',
        value: `₹${metrics.avgOrderVal.toLocaleString()}`,
        badgeText: 'Stable',
        icon: ChefHat,
        color: 'success'
      }, {
        title: 'Customer Rating',
        value: `${metrics.avgRating} ★`,
        badgeText: `${metrics.ratingCount} reviews`,
        icon: Star,
        color: 'warning'
      }].map((stat, i) => <div key={i} className="saas-kpi-card">
            <div className="flex justify-between items-start">
              <span className="kpi-title">{stat.title}</span>
              <stat.icon size={18} className="text-slate-400" />
            </div>
            <h2 className="kpi-value">{stat.value}</h2>
            <span className={`kpi-badge ${stat.color}`}>{stat.badgeText}</span>
          </div>)}
      </div>

      {}
      <div className="saas-row saas-row-70-30">
        
        {}
        <div className="saas-card">
          <div className="card-header-row">
            <h4 className="card-title"><TrendingUp size={16} className="text-[#2563eb]" /> Revenue Analytics</h4>
            <span className="text-[10px] text-slate-400 font-bold uppercase">Daily Trend</span>
          </div>
          {chartsData.dailyBreakdown.length === 0 ? <div className="h-64 flex items-center justify-center text-slate-400 text-xs font-semibold">No sales data available for selected period.</div> : <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={chartsData.dailyBreakdown}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} tickLine={false} />
                <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{
              background: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
            }} />
                <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>}
        </div>

        {}
        <div className="saas-card">
          <div className="card-header-row">
            <h4 className="card-title"><Clock size={16} className="text-amber-500" /> Peak Ordering Time</h4>
          </div>
          <div style={{ width: '100%', height: '220px', marginTop: '16px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartsData.hourlyData.slice(8, 23)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPeak" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  itemStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                  labelStyle={{ color: '#64748b', marginBottom: '4px' }}
                />
                <Area type="monotone" dataKey="value" name="Orders" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorPeak)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {}
      <div className="saas-row saas-row-50-50">
        
        {}
        <div className="saas-card">
          <div className="card-header-row">
            <h4 className="card-title"><ListTodo size={16} className="text-[#2563eb]" /> Order Velocity (Trend)</h4>
          </div>
          {chartsData.dailyBreakdown.length === 0 ? <div className="h-64 flex items-center justify-center text-slate-400 text-xs font-semibold">No data available for selected period.</div> : <ResponsiveContainer width="100%" height={240}>
              <LineChart data={chartsData.dailyBreakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} tickLine={false} />
                <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{
              background: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '12px'
            }} />
                <Line type="monotone" dataKey="orders" stroke="#10b981" strokeWidth={3} dot={{
              r: 4
            }} />
              </LineChart>
            </ResponsiveContainer>}
        </div>

        {/* Customer Feedback Widget */}
        <div className="saas-card">
          <div className="card-header-row">
            <h4 className="card-title"><Star size={16} className="text-amber-500" /> Recent Customer Feedback</h4>
          </div>
          {metrics.recentFeedback && metrics.recentFeedback.length > 0 ? (
            <div className="flex flex-col gap-3 mt-2 overflow-y-auto" style={{ maxHeight: '240px' }}>
              {metrics.recentFeedback.map((fb, idx) => (
                <div key={idx} style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <div className="flex justify-between items-center mb-1">
                    <strong style={{ fontSize: '13px', color: 'var(--text-main)' }}>{fb.customer_name || 'Guest User'}</strong>
                    <div className="flex text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={12} fill={i < (fb.rating || 5) ? 'currentColor' : 'none'} strokeWidth={i < (fb.rating || 5) ? 0 : 2} color={i < (fb.rating || 5) ? 'currentColor' : '#cbd5e1'} />
                      ))}
                    </div>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0, fontStyle: 'italic' }}>
                    "{fb.comments || 'Great experience!'}"
                  </p>
                  <span style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '6px', display: 'block' }}>
                    {formatDate(fb.created_at)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-400 text-xs font-semibold">No recent feedback available.</div>
          )}
        </div>

        {/* Top Selling Items Premium Widget */}
        <div className="saas-card" style={{ gridColumn: '1 / -1', padding: '24px' }}>
          <div className="card-header-row" style={{ marginBottom: '16px' }}>
            <div>
              <h4 className="card-title" style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                🍽 Top Selling Items
              </h4>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                Your best-performing menu items based on quantity sold.
              </p>
            </div>
            <div style={{ padding: '6px 12px', background: 'var(--bg-tertiary)', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '13px', fontWeight: '600', color: 'var(--text-main)' }}>
              {(() => {
                if (dateFilter === 'today') return 'Today';
                if (dateFilter === 'yesterday') return 'Yesterday';
                if (dateFilter === '7days') return 'Last 7 Days';
                if (dateFilter === '30days') return 'Last 30 Days';
                if (dateFilter === 'custom' && customStartDate && customEndDate) {
                  const start = new Date(customStartDate);
                  const end = new Date(customEndDate);
                  const diffDays = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1);
                  return `Last ${diffDays} Days`;
                }
                return 'Selected Period';
              })()}
            </div>
          </div>
          
          {chartsData.topSelling.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm font-semibold">
              <div style={{ fontSize: '40px', marginBottom: '8px' }}>📉</div>
              No Sales Yet<br/>
              <span style={{ fontSize: '12px', fontWeight: '400' }}>Start selling to see your top-performing menu items.</span>
            </div>
          ) : (
            <div className="premium-top-items-container">
              <div className="premium-cards-wrapper">
                {chartsData.topSelling.map((dish, i) => (
                  <div key={i} className="premium-top-card">
                    <div className={`rank-badge rank-${i + 1}`}>#{i + 1}</div>
                    <div className="premium-image-container">
                      <img src={dish.image_url} alt={dish.name} className="premium-food-img" onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=Food' }} />
                    </div>
                    <div className="premium-card-body">
                      <h5 className="premium-food-name" title={dish.name}>{dish.name}</h5>
                      <div className="premium-metrics">
                        <div className="premium-metric-col">
                          <span className="premium-metric-label">Items Sold</span>
                          <strong className="premium-metric-val">{dish.qty}</strong>
                        </div>
                        <div className="premium-metric-col">
                          <span className="premium-metric-label">Revenue</span>
                          <strong className="premium-metric-val">₹{dish.revenue.toLocaleString()}</strong>
                        </div>
                      </div>
                      <div className="premium-growth">
                        ▲ +{dish.growth}% <span className="premium-growth-sub">vs last period</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="premium-summary-footer">
                <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
                  <div className="summary-item">
                    <span className="summary-label">Total Items Sold</span>
                    <strong className="summary-val">{chartsData.topSelling.reduce((acc, curr) => acc + curr.qty, 0)}</strong>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Total Revenue</span>
                    <strong className="summary-val">₹{chartsData.topSelling.reduce((acc, curr) => acc + curr.revenue, 0).toLocaleString()}</strong>
                  </div>
                </div>
                <div className="summary-item summary-updated">
                  <span className="summary-label">Last Updated</span>
                  <strong className="summary-val">Just Now</strong>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>

      {}
      <div className="saas-row saas-row-50-50">
        
        {}
        <div className="saas-card">
          <div className="card-header-row">
            <h4 className="card-title"><Laptop size={16} className="text-[#2563eb]" /> Branch Wise Revenue</h4>
          </div>
          {chartsData.branchPerformance.length === 0 ? <div className="h-60 flex items-center justify-center text-slate-400 text-xs font-semibold">No data available for selected period.</div> : <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartsData.branchPerformance} layout="vertical">
                <CartesianGrid stroke="#f3f4f6" strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" stroke="#9ca3af" fontSize={10} tickLine={false} />
                <YAxis type="category" dataKey="name" stroke="#9ca3af" fontSize={10} width={90} tickLine={false} />
                <Tooltip contentStyle={{
              background: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '12px'
            }} />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>}
        </div>

        {}
        <div className="saas-card">
          <div className="card-header-row">
            <h4 className="card-title"><Layers size={16} className="text-emerald-500" /> Branch Wise Orders</h4>
          </div>
          {chartsData.branchPerformance.length === 0 ? <div className="h-60 flex items-center justify-center text-slate-400 text-xs font-semibold">No data available for selected period.</div> : <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartsData.branchPerformance}>
                <CartesianGrid stroke="#f3f4f6" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={10} tickLine={false} />
                <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{
              background: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '12px'
            }} />
                <Bar dataKey="orders" fill="#10b981" radius={[4, 4, 0, 0]} barSize={25} />
              </BarChart>
            </ResponsiveContainer>}
        </div>

      </div>

      {}
      <div className="saas-row saas-row-50-50">
        
        {}
        <div className="saas-card">
          <div className="card-header-row">
            <h4 className="card-title"><Smartphone size={16} className="text-violet-600" /> Online vs Offline Checkout Ratio</h4>
          </div>
          {metrics.totalOrd === 0 ? <div className="h-44 flex items-center justify-center text-slate-400 text-xs font-semibold">No transaction records.</div> : <div className="flex items-center justify-around h-36">
              <ResponsiveContainer width="45%" height="100%">
                <PieChart>
                  <Pie data={chartsData.onlineVsOffline} cx="50%" cy="50%" innerRadius={45} outerRadius={60} paddingAngle={3} dataKey="value">
                    {chartsData.onlineVsOffline.map((entry, index) => <Cell key={`cell-${index}`} fill={index === 0 ? '#2563eb' : '#10b981'} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-2">
                {chartsData.onlineVsOffline.map((item, i) => <div key={i} className="flex flex-col">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                      <span className="w-2.5 h-2.5 rounded-full" style={{
                  background: i === 0 ? '#2563eb' : '#10b981'
                }} />
                      {item.name}
                    </div>
                    <span className="text-[10px] text-slate-400 font-semibold pl-4">{item.value} Orders ({item.percent}%)</span>
                  </div>)}
              </div>
            </div>}
        </div>

        {}
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

      {}
      <div className="saas-card">
        <h4 className="card-title mb-4">Recent Outlets Orders Matrix</h4>
        {filteredOrders.length === 0 ? <div className="p-8 text-center text-slate-400 text-xs font-semibold">No data available for selected period.</div> : <div className="overflow-x-auto">
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
              return <tr key={idx}>
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
                    </tr>;
            })}
              </tbody>
            </table>
          </div>}
      </div>

    </div>;
}