import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Building2, Store, Users, DollarSign, Activity, MapPin, Utensils, LayoutGrid, Clock, ShoppingBag, Shield, CheckCircle2, XCircle } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../../../config';
import apiService from '../../../services/apiService';
export default function SuperAdminView({
  adminUser
}) {
  const [activeSubTab, setActiveSubTab] = useState('metrics');
  const [organizations, setOrganizations] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [users, setUsers] = useState([]);
  const [globalOrders, setGlobalOrders] = useState([]);
  const [loading, setLoading] = useState(true);
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
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
        }
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
        const ordRes = await axios.get(`${API_URL}/api/orders`, {
          params: {
            restaurant_id: 'all'
          },
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
          }
        });
        ordersData = ordRes.data?.data || [];
      } catch (err) {}
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
  const getRestaurantName = id => {
    const rest = restaurants.find(r => String(r.id) === String(id));
    return rest ? rest.name : 'Unknown Outlet';
  };
  if (loading) {
    return <div className="view-container flex items-center justify-center min-h-[500px]">
        <div className="ex-style-32a3e4">
          <Activity size={40} className="ex-style-b41de6" />
          <span className="ex-style-04bfa8">INITIALIZING CORE...</span>
        </div>
      </div>;
  }
  return <div className="view-container animate-fade-in sa-container">
      
      {}
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

      {}
      <div className="sa-tabs">
        <button onClick={() => setActiveSubTab('metrics')} className={`sa-tab ${activeSubTab === 'metrics' ? 'active' : ''}`}>
          <Activity size={16} /> Metrics Overview
        </button>
        <button onClick={() => setActiveSubTab('matrix')} className={`sa-tab ${activeSubTab === 'matrix' ? 'active' : ''}`}>
          <LayoutGrid size={16} /> Network Matrix
        </button>
        <button onClick={() => setActiveSubTab('orders')} className={`sa-tab ${activeSubTab === 'orders' ? 'active' : ''}`}>
          <ShoppingBag size={16} /> Global Orders
        </button>
      </div>

      <div className="content-scrollable">
        
        {}
        {activeSubTab === 'metrics' && <div className="animate-fade-in">
            <div className="sa-stats-grid">
              
              <div className="sa-stat-card">
                <div className="sa-stat-glow ex-style-d45da1"></div>
                <div className="sa-stat-header">
                  <span className="sa-stat-label">Total Orgs</span>
                  <div className="sa-stat-icon-wrap ex-style-dc3c41">
                    <Building2 size={20} />
                  </div>
                </div>
                <div className="sa-stat-value">{stats.totalOrgs}</div>
              </div>

              <div className="sa-stat-card">
                <div className="sa-stat-glow ex-style-17df4c"></div>
                <div className="sa-stat-header">
                  <span className="sa-stat-label">Total Outlets</span>
                  <div className="sa-stat-icon-wrap ex-style-f142e3">
                    <Store size={20} />
                  </div>
                </div>
                <div className="sa-stat-value">{stats.totalRestaurants}</div>
              </div>

              <div className="sa-stat-card">
                <div className="sa-stat-glow ex-style-c5b696"></div>
                <div className="sa-stat-header">
                  <span className="sa-stat-label">Active Staff</span>
                  <div className="sa-stat-icon-wrap ex-style-f18413">
                    <Users size={20} />
                  </div>
                </div>
                <div className="sa-stat-value">{stats.totalUsers}</div>
              </div>

              <div className="sa-stat-card">
                <div className="sa-stat-glow ex-style-c5b8a3"></div>
                <div className="sa-stat-header">
                  <span className="sa-stat-label">Gross Volume</span>
                  <div className="sa-stat-icon-wrap ex-style-e5e31e">
                    <DollarSign size={20} />
                  </div>
                </div>
                <div className="sa-stat-value">₹{stats.totalRevenue.toLocaleString()}</div>
              </div>
              
            </div>
            
            {}
            <div className="sa-header ex-style-d8e7ab">
              <div className="ex-style-15a6a1">
                <h3 className="ex-style-773080">
                  <Shield size={20} className="ex-style-9457ca" />
                  Enterprise Features (Beta)
                </h3>
                
                <div className="sa-stats-grid ex-style-32d799">
                   <div className="sa-stat-card ex-style-eed5b1">
                      <div className="sa-stat-icon-wrap ex-style-0a4c1a">
                        <Activity size={24} />
                      </div>
                      <div>
                        <h4 className="ex-style-f2069c">Advanced Analytics</h4>
                        <p className="ex-style-2d14d0">Cross-organization revenue forecasting.</p>
                      </div>
                   </div>
                   
                   <div className="sa-stat-card ex-style-eed5b1">
                      <div className="sa-stat-icon-wrap ex-style-1be745">
                        <DollarSign size={24} />
                      </div>
                      <div>
                        <h4 className="ex-style-f2069c">Billing & Tenants</h4>
                        <p className="ex-style-2d14d0">Manage subscriptions for multiple tenants.</p>
                      </div>
                   </div>
  
                   <div className="sa-stat-card ex-style-eed5b1">
                      <div className="sa-stat-icon-wrap ex-style-fad2d4">
                        <Utensils size={24} />
                      </div>
                      <div>
                        <h4 className="ex-style-f2069c">Master Menu Copier</h4>
                        <p className="ex-style-2d14d0">Clone full menus across branches.</p>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </div>}

        {}
        {activeSubTab === 'matrix' && <div className="animate-fade-in">
            {organizations.map(org => {
          const orgRestaurants = restaurants.filter(r => String(r.organization_id) === String(org.id));
          return <div key={org.id} className="sa-org-card">
                  <div className="sa-org-header">
                    <div className="sa-org-info">
                      <div className="sa-org-icon">
                        {org.logo_url ? <img src={org.logo_url} alt="org" className="ex-style-60dea8" /> : <Building2 size={24} />}
                      </div>
                      <div>
                        <h3 className="sa-org-name">{org.name}</h3>
                        <div className="sa-org-meta">
                          <span><MapPin size={10} className="ex-style-5120ec" /> {org.city || 'No Location'}</span>
                          <span>&bull;</span>
                          <span className="ex-style-ef1330">ORG-{org.id.toString().padStart(4, '0')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="sa-org-badge">
                      {orgRestaurants.length} Mapped Outlets
                    </div>
                  </div>

                  <div className="sa-rest-list">
                    {orgRestaurants.length === 0 ? <div className="ex-style-344d23">No outlets mapped to this organization yet.</div> : orgRestaurants.map(rest => {
                const restStaff = users.filter(u => String(u.restaurant_id) === String(rest.id));
                return <div key={rest.id} className="sa-rest-item">
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
                                {restStaff.slice(0, 5).map(staff => <div key={staff.id} className="sa-avatar" title={`${staff.name} (${staff.role})`}>
                                    {staff.name.charAt(0).toUpperCase()}
                                  </div>)}
                                {restStaff.length > 5 && <div className="sa-avatar ex-style-0350d5">
                                    +{restStaff.length - 5}
                                  </div>}
                                {restStaff.length === 0 && <span className="ex-style-fc25f0">No Staff</span>}
                              </div>
                              <div className="sa-staff-count">
                                <span className="ex-style-ef1330">{restStaff.length}</span> Users
                              </div>
                            </div>
                          </div>;
              })}
                  </div>
                </div>;
        })}

            {}
            {(() => {
          const unassigned = restaurants.filter(r => !r.organization_id);
          if (unassigned.length === 0) return null;
          return <div className="sa-org-card ex-style-c509a5">
                  <div className="sa-org-header ex-style-e23483">
                    <div className="sa-org-info">
                      <div className="sa-org-icon ex-style-4898ad">
                        <Store size={24} />
                      </div>
                      <div>
                        <h3 className="sa-org-name ex-style-8039c8">Independent Outlets</h3>
                        <div className="sa-org-meta">Unmapped locations</div>
                      </div>
                    </div>
                  </div>
                  <div className="sa-rest-list">
                    {unassigned.map(rest => {
                const restStaff = users.filter(u => String(u.restaurant_id) === String(rest.id));
                return <div key={rest.id} className="sa-rest-item">
                          <div className="sa-rest-main">
                            <div className="sa-rest-icon ex-style-4898ad">
                              <Store size={18} />
                            </div>
                            <span className="ex-style-3c49f3">{rest.name}</span>
                          </div>
                          <div className="sa-staff-count ex-style-642bed">{restStaff.length} Staff</div>
                        </div>;
              })}
                  </div>
                </div>;
        })()}
          </div>}

        {}
        {activeSubTab === 'orders' && <div className="animate-fade-in">
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
                <Activity size={16} className="ex-style-cdf8ad" />
                <span>{globalOrders.length} Synced</span>
              </div>
            </div>

            <div>
              {globalOrders.length === 0 ? <div className="ex-style-3075b8">
                  <Clock size={48} className="ex-style-1de35f" />
                  <p className="ex-style-49fc9e">Awaiting incoming orders...</p>
                </div> : globalOrders.map(order => {
            let statusClass = 'text-amber bg-amber-light';
            if (order.status === 'completed') statusClass = 'text-emerald bg-emerald-light';
            if (order.status === 'cancelled') statusClass = 'text-red bg-red-light';
            let payClass = order.payment_status === 'paid' ? 'text-emerald bg-emerald-light' : 'text-amber bg-amber-light';
            return <div key={order.id} className="sa-order-item">
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
                            <span><Clock size={10} className="ex-style-5120ec" /> {new Date(order.timestamp).toLocaleString()}</span>
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
                    </div>;
          })}
            </div>
          </div>}

      </div>
    </div>;
}