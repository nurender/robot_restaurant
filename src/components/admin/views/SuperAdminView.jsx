import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { 
  Building2, Store, Users, DollarSign, Activity, 
  MapPin, Utensils, LayoutGrid, Clock, ShoppingBag, Shield, CheckCircle2, XCircle
} from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../../../config';
import apiService from '../../../services/apiService';
import './SuperAdminView.css';

export default function SuperAdminView({ adminUser }) {
  const [activeSubTab, setActiveSubTab] = useState('metrics'); // 'metrics', 'matrix', 'orders'
  
  // Data states
  const [organizations, setOrganizations] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [users, setUsers] = useState([]);
  const [globalOrders, setGlobalOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Stats
  const [stats, setStats] = useState({
    totalOrgs: 0,
    totalRestaurants: 0,
    totalUsers: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    fetchGlobalData();
  }, []);

  const fetchGlobalData = async () => {
    setLoading(true);
    try {
      const orgsRes = await fetch(`${API_URL}/api/food-courts`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('jwt_token')}` }
      });
      const orgsData = orgsRes.ok ? await orgsRes.json() : [];
      setOrganizations(orgsData);

      const restRes = await apiService.getRestaurants();
      const restData = restRes.data?.data || [];
      setRestaurants(restData);

      const usersRes = await apiService.getUsers();
      const usersData = usersRes.data?.data || [];
      setUsers(usersData);

      let ordersData = [];
      try {
        const ordRes = await axios.get(`${API_URL}/api/orders`, { params: { restaurant_id: 'all' }, headers: { 'Authorization': `Bearer ${localStorage.getItem('jwt_token')}` } });
        ordersData = ordRes.data?.data || [];
      } catch (err) { }
      setGlobalOrders(ordersData);

      const totalRev = ordersData.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0);
      
      setStats({
        totalOrgs: orgsData.length,
        totalRestaurants: restData.length,
        totalUsers: usersData.length,
        totalRevenue: totalRev
      });

    } catch (error) {
      console.error("Failed to load global data", error);
      toast.error("Failed to load Super Admin data");
    } finally {
      setLoading(false);
    }
  };

  const getRestaurantName = (id) => {
    const rest = restaurants.find(r => String(r.id) === String(id));
    return rest ? rest.name : 'Unknown Outlet';
  };

  if (loading) {
    return (
      <div className="view-container flex items-center justify-center min-h-[500px]">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <Activity size={40} style={{ color: 'var(--accent-color)', animation: 'pulse 2s infinite' }} />
          <span style={{ color: 'var(--text-muted)', fontWeight: 'bold', letterSpacing: '2px', fontSize: '12px' }}>INITIALIZING CORE...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="view-container animate-fade-in sa-container">
      
      {/* Header Section */}
      <div className="sa-header">
        <div className="sa-header-left">
          <div className="sa-header-icon">
            <Shield size={32} />
          </div>
          <div>
            <h1 className="sa-header-title">Master Intelligence</h1>
            <p className="sa-header-subtitle">Enterprise command center. Global overview of all operations.</p>
          </div>
        </div>
        <div className="sa-status-badge">
          <div className="sa-status-dot"></div>
          <span className="sa-status-text">All Systems Normal</span>
        </div>
      </div>

      {/* Modern Sub-Navigation */}
      <div className="sa-tabs">
        <button 
          onClick={() => setActiveSubTab('metrics')} 
          className={`sa-tab ${activeSubTab === 'metrics' ? 'active' : ''}`}
        >
          <Activity size={16} /> Metrics Overview
        </button>
        <button 
          onClick={() => setActiveSubTab('matrix')} 
          className={`sa-tab ${activeSubTab === 'matrix' ? 'active' : ''}`}
        >
          <LayoutGrid size={16} /> Network Matrix
        </button>
        <button 
          onClick={() => setActiveSubTab('orders')} 
          className={`sa-tab ${activeSubTab === 'orders' ? 'active' : ''}`}
        >
          <ShoppingBag size={16} /> Global Orders
        </button>
      </div>

      <div className="content-scrollable">
        
        {/* === METRICS TAB === */}
        {activeSubTab === 'metrics' && (
          <div className="animate-fade-in">
            <div className="sa-stats-grid">
              
              <div className="sa-stat-card">
                <div className="sa-stat-glow" style={{ background: 'rgba(139, 92, 246, 0.5)' }}></div>
                <div className="sa-stat-header">
                  <span className="sa-stat-label">Total Orgs</span>
                  <div className="sa-stat-icon-wrap" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
                    <Building2 size={20} />
                  </div>
                </div>
                <div className="sa-stat-value">{stats.totalOrgs}</div>
              </div>

              <div className="sa-stat-card">
                <div className="sa-stat-glow" style={{ background: 'rgba(16, 185, 129, 0.5)' }}></div>
                <div className="sa-stat-header">
                  <span className="sa-stat-label">Total Outlets</span>
                  <div className="sa-stat-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                    <Store size={20} />
                  </div>
                </div>
                <div className="sa-stat-value">{stats.totalRestaurants}</div>
              </div>

              <div className="sa-stat-card">
                <div className="sa-stat-glow" style={{ background: 'rgba(56, 189, 248, 0.5)' }}></div>
                <div className="sa-stat-header">
                  <span className="sa-stat-label">Active Staff</span>
                  <div className="sa-stat-icon-wrap" style={{ background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8' }}>
                    <Users size={20} />
                  </div>
                </div>
                <div className="sa-stat-value">{stats.totalUsers}</div>
              </div>

              <div className="sa-stat-card">
                <div className="sa-stat-glow" style={{ background: 'rgba(245, 158, 11, 0.5)' }}></div>
                <div className="sa-stat-header">
                  <span className="sa-stat-label">Gross Volume</span>
                  <div className="sa-stat-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                    <DollarSign size={20} />
                  </div>
                </div>
                <div className="sa-stat-value">₹{stats.totalRevenue.toLocaleString()}</div>
              </div>
              
            </div>
            
            {/* SaaS Coming Soon Tools Section */}
            <div className="sa-header" style={{ marginTop: '24px', padding: '24px' }}>
              <div style={{ width: '100%', position: 'relative', zIndex: 2 }}>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Shield size={20} style={{ color: '#c084fc' }} />
                  Enterprise Features (Beta)
                </h3>
                
                <div className="sa-stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                   <div className="sa-stat-card" style={{ opacity: 0.6, cursor: 'not-allowed', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', textAlign: 'center' }}>
                      <div className="sa-stat-icon-wrap" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', width: '48px', height: '48px' }}>
                        <Activity size={24} />
                      </div>
                      <div>
                        <h4 style={{ color: '#fff', margin: '0 0 4px 0', fontSize: '14px' }}>Advanced Analytics</h4>
                        <p style={{ color: 'var(--text-muted)', fontSize: '12px', margin: 0 }}>Cross-organization revenue forecasting.</p>
                      </div>
                   </div>
                   
                   <div className="sa-stat-card" style={{ opacity: 0.6, cursor: 'not-allowed', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', textAlign: 'center' }}>
                      <div className="sa-stat-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', width: '48px', height: '48px' }}>
                        <DollarSign size={24} />
                      </div>
                      <div>
                        <h4 style={{ color: '#fff', margin: '0 0 4px 0', fontSize: '14px' }}>Billing & Tenants</h4>
                        <p style={{ color: 'var(--text-muted)', fontSize: '12px', margin: 0 }}>Manage subscriptions for multiple tenants.</p>
                      </div>
                   </div>
  
                   <div className="sa-stat-card" style={{ opacity: 0.6, cursor: 'not-allowed', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', textAlign: 'center' }}>
                      <div className="sa-stat-icon-wrap" style={{ background: 'rgba(236, 72, 153, 0.1)', color: '#ec4899', width: '48px', height: '48px' }}>
                        <Utensils size={24} />
                      </div>
                      <div>
                        <h4 style={{ color: '#fff', margin: '0 0 4px 0', fontSize: '14px' }}>Master Menu Copier</h4>
                        <p style={{ color: 'var(--text-muted)', fontSize: '12px', margin: 0 }}>Clone full menus across branches.</p>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* === NETWORK MATRIX TAB === */}
        {activeSubTab === 'matrix' && (
          <div className="animate-fade-in">
            {organizations.map(org => {
              const orgRestaurants = restaurants.filter(r => String(r.organization_id) === String(org.id));
              return (
                <div key={org.id} className="sa-org-card">
                  <div className="sa-org-header">
                    <div className="sa-org-info">
                      <div className="sa-org-icon">
                        {org.logo_url ? <img src={org.logo_url} style={{ width: '100%', height: '100%', borderRadius: '10px', objectFit: 'cover' }} alt="org" /> : <Building2 size={24} />}
                      </div>
                      <div>
                        <h3 className="sa-org-name">{org.name}</h3>
                        <div className="sa-org-meta">
                          <span><MapPin size={10} style={{ display: 'inline', marginRight: '4px' }} /> {org.city || 'No Location'}</span>
                          <span>&bull;</span>
                          <span style={{ color: 'var(--accent-color)' }}>ORG-{org.id.toString().padStart(4, '0')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="sa-org-badge">
                      {orgRestaurants.length} Mapped Outlets
                    </div>
                  </div>

                  <div className="sa-rest-list">
                    {orgRestaurants.length === 0 ? (
                      <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', padding: '20px 0' }}>No outlets mapped to this organization yet.</div>
                    ) : (
                      orgRestaurants.map(rest => {
                        const restStaff = users.filter(u => String(u.restaurant_id) === String(rest.id));
                        return (
                          <div key={rest.id} className="sa-rest-item">
                            <div className="sa-rest-main">
                              <div className="sa-rest-icon">
                                <Store size={20} />
                              </div>
                              <div>
                                <h4 className="sa-rest-name">{rest.name}</h4>
                                <div className="sa-rest-type">{rest.branch_type || 'Restaurant'} {rest.branch_code ? `• ${rest.branch_code}` : ''}</div>
                              </div>
                            </div>
                            
                            <div className="sa-staff-group">
                              <div className="sa-avatars">
                                {restStaff.slice(0, 5).map(staff => (
                                  <div key={staff.id} className="sa-avatar" title={`${staff.name} (${staff.role})`}>
                                    {staff.name.charAt(0).toUpperCase()}
                                  </div>
                                ))}
                                {restStaff.length > 5 && (
                                  <div className="sa-avatar" style={{ background: 'var(--accent-color)', fontSize: '10px' }}>
                                    +{restStaff.length - 5}
                                  </div>
                                )}
                                {restStaff.length === 0 && (
                                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '12px' }}>No Staff</span>
                                )}
                              </div>
                              <div className="sa-staff-count">
                                <span style={{ color: 'var(--accent-color)' }}>{restStaff.length}</span> Users
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}

            {/* Unassigned Restaurants */}
            {(() => {
              const unassigned = restaurants.filter(r => !r.organization_id);
              if (unassigned.length === 0) return null;
              return (
                <div className="sa-org-card" style={{ opacity: 0.8 }}>
                  <div className="sa-org-header" style={{ background: 'transparent' }}>
                    <div className="sa-org-info">
                      <div className="sa-org-icon" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', borderColor: 'rgba(255,255,255,0.1)' }}>
                        <Store size={24} />
                      </div>
                      <div>
                        <h3 className="sa-org-name" style={{ color: 'var(--text-dim)' }}>Independent Outlets</h3>
                        <div className="sa-org-meta">Unmapped locations</div>
                      </div>
                    </div>
                  </div>
                  <div className="sa-rest-list">
                    {unassigned.map(rest => {
                      const restStaff = users.filter(u => String(u.restaurant_id) === String(rest.id));
                      return (
                        <div key={rest.id} className="sa-rest-item">
                          <div className="sa-rest-main">
                            <div className="sa-rest-icon" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', borderColor: 'rgba(255,255,255,0.1)' }}>
                              <Store size={18} />
                            </div>
                            <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main)' }}>{rest.name}</span>
                          </div>
                          <div className="sa-staff-count" style={{ background: 'transparent', border: 'none' }}>{restStaff.length} Staff</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* === GLOBAL ORDERS TAB === */}
        {activeSubTab === 'orders' && (
          <div className="animate-fade-in">
            <div className="sa-feed-header">
              <div className="sa-feed-title-wrap">
                <div className="sa-feed-icon">
                  <ShoppingBag size={24} />
                </div>
                <div>
                  <h2 className="sa-feed-title">Global Order Stream</h2>
                  <p className="sa-feed-subtitle">Real-time feed of all transactions.</p>
                </div>
              </div>
              <div className="sa-feed-sync">
                <Activity size={16} style={{ animation: 'pulse 2s infinite' }} />
                <span>{globalOrders.length} Synced</span>
              </div>
            </div>

            <div>
              {globalOrders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--card-bg)', borderRadius: '24px', border: '1px solid var(--card-border)' }}>
                  <Clock size={48} style={{ margin: '0 auto 16px auto', color: 'var(--text-muted)', opacity: 0.5 }} />
                  <p style={{ color: 'var(--text-dim)', fontSize: '15px', fontWeight: 500 }}>Awaiting incoming orders...</p>
                </div>
              ) : (
                globalOrders.map(order => {
                  let statusClass = 'text-amber bg-amber-light';
                  if (order.status === 'completed') statusClass = 'text-emerald bg-emerald-light';
                  if (order.status === 'cancelled') statusClass = 'text-red bg-red-light';
                  
                  let payClass = order.payment_status === 'paid' ? 'text-emerald bg-emerald-light' : 'text-amber bg-amber-light';

                  return (
                    <div key={order.id} className="sa-order-item">
                      <div className="sa-order-left">
                        <div className="sa-order-id">
                          <span>ID</span>
                          <span>{order.id}</span>
                        </div>
                        
                        <div className="sa-order-info">
                          <div className="sa-order-info-top">
                            <span className="sa-order-rest">{getRestaurantName(order.restaurant_id)}</span>
                            <span className={`sa-order-status ${statusClass}`}>
                              {order.status === 'completed' && <CheckCircle2 size={10} />}
                              {order.status === 'cancelled' && <XCircle size={10} />}
                              {order.status !== 'completed' && order.status !== 'cancelled' && <Activity size={10} />}
                              {order.status}
                            </span>
                          </div>
                          
                          <div className="sa-order-time">
                            <span><Clock size={10} style={{ display: 'inline', marginRight: '4px' }} /> {new Date(order.timestamp).toLocaleString()}</span>
                            {order.tableNumber && <span className="sa-order-table">Table {order.tableNumber}</span>}
                          </div>
                        </div>
                      </div>

                      <div className="sa-order-right">
                        <div className="sa-order-amount">₹{order.total_amount}</div>
                        <div className="sa-order-pay-info">
                          <span className="sa-order-pay-method">{order.payment_method}</span>
                          <span className={`sa-order-pay-status ${payClass}`}>
                            {order.payment_status}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
