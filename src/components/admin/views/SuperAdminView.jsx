import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Shield, Users, CreditCard, Activity, Plus, Edit2, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import apiService from '../../../services/apiService';

export default function SuperAdminView({ adminUser }) {
  const [activeSubTab, setActiveSubTab] = useState('metrics'); // 'metrics', 'tenants', 'plans', 'monitor'
  
  // Tenants State
  const [tenants, setTenants] = useState([
    { id: 1, name: 'Cyber Food Court', plan: 'Enterprise', status: 'active', trialEnds: '2026-12-31', contact: 'admin@cyberfood.com' },
    { id: 2, name: 'Tandoori Junction', plan: 'Pro Monthly', status: 'active', trialEnds: '2026-09-15', contact: 'owner@tandoori.in' },
    { id: 3, name: 'Sweet Delights Cloud', plan: 'Basic Starters', status: 'disabled', trialEnds: '2026-07-01', contact: 'billing@sweets.com' }
  ]);
  const [showAddTenant, setShowAddTenant] = useState(false);
  const [newTenant, setNewTenant] = useState({ name: '', plan: 'Pro Monthly', status: 'active', trialEnds: '', contact: '' });

  // Pricing Plans State
  const [plans, setPlans] = useState([
    { id: 1, name: 'Basic Starters', price: 999, currency: '₹', duration: 'Monthly', features: ['POS Terminal', 'Digital Menu', 'Basic Analytics'] },
    { id: 2, name: 'Pro Monthly', price: 2499, currency: '₹', duration: 'Monthly', features: ['POS Terminal', 'QR ordering', 'Advanced Analytics', 'Rider Fleet Tracker'] },
    { id: 3, name: 'Enterprise', price: 4999, currency: '₹', duration: 'Monthly', features: ['Multi-Branch Control', 'KDS Terminals', 'Unified Food Court Checkout', 'Custom Branding Themes', 'Roles Hierarchy'] }
  ]);
  const [showAddPlan, setShowAddPlan] = useState(false);
  const [newPlan, setNewPlan] = useState({ name: '', price: 0, currency: '₹', duration: 'Monthly', featuresStr: '' });

  // Monitor Metrics Mock
  const [monitorStats, setMonitorStats] = useState({
    activeSessions: 142,
    apiLatency: 18, // ms
    dbConnections: 'Healthy (12/20)',
    cpuUsage: 14 // %
  });

  useEffect(() => {
    // Generate slight fluctuations in latency and sessions to simulate live stats
    const interval = setInterval(() => {
      setMonitorStats(prev => ({
        ...prev,
        activeSessions: prev.activeSessions + Math.floor(Math.random() * 5) - 2,
        apiLatency: Math.max(8, prev.apiLatency + Math.floor(Math.random() * 7) - 3),
        cpuUsage: Math.max(5, Math.min(95, prev.cpuUsage + Math.floor(Math.random() * 5) - 2))
      }));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Tenant handlers
  const handleCreateTenant = (e) => {
    e.preventDefault();
    if (!newTenant.name || !newTenant.contact) {
      toast.error('Please enter name and contact details.');
      return;
    }
    const created = {
      id: tenants.length + 1,
      ...newTenant,
      trialEnds: newTenant.trialEnds || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };
    setTenants([...tenants, created]);
    setNewTenant({ name: '', plan: 'Pro Monthly', status: 'active', trialEnds: '', contact: '' });
    setShowAddTenant(false);
    toast.success('Tenant added successfully!');
  };

  const toggleTenantStatus = (id) => {
    setTenants(tenants.map(t => t.id === id ? { ...t, status: t.status === 'active' ? 'disabled' : 'active' } : t));
    toast.success('Tenant status updated');
  };

  // Plan handlers
  const handleCreatePlan = (e) => {
    e.preventDefault();
    if (!newPlan.name || newPlan.price <= 0) {
      toast.error('Please enter valid name and pricing.');
      return;
    }
    const created = {
      id: plans.length + 1,
      name: newPlan.name,
      price: newPlan.price,
      currency: newPlan.currency,
      duration: newPlan.duration,
      features: newPlan.featuresStr.split(',').map(f => f.trim()).filter(Boolean)
    };
    setPlans([...plans, created]);
    setNewPlan({ name: '', price: 0, currency: '₹', duration: 'Monthly', featuresStr: '' });
    setShowAddPlan(false);
    toast.success('New subscription plan registered!');
  };

  return (
    <div className="view-container animate-slide-up view-container-deep">
      
      {/* Header */}
      <div className="view-header-row mb-6">
        <div>
          <h1 className="view-title flex items-center gap-2">
            <Shield size={24} className="text-[#a78bfa]" /> Super Admin Dashboard
          </h1>
          <p className="text-muted">Global controller for tenants deployment, SaaS billing plans, and nodes monitoring.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/5 mb-6 overflow-x-auto scrollbar-hidden">
        <button
          onClick={() => setActiveSubTab('metrics')}
          className={`px-4 py-3 flex items-center gap-2 border-b-2 text-xs font-semibold whitespace-nowrap transition-all ${activeSubTab === 'metrics' ? 'border-[#7c3aed] text-white bg-white/5' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          <Shield size={14} />
          Metrics Overview
        </button>
        <button
          onClick={() => setActiveSubTab('tenants')}
          className={`px-4 py-3 flex items-center gap-2 border-b-2 text-xs font-semibold whitespace-nowrap transition-all ${activeSubTab === 'tenants' ? 'border-[#7c3aed] text-white bg-white/5' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          <Users size={14} />
          Tenant Management ({tenants.length})
        </button>
        <button
          onClick={() => setActiveSubTab('plans')}
          className={`px-4 py-3 flex items-center gap-2 border-b-2 text-xs font-semibold whitespace-nowrap transition-all ${activeSubTab === 'plans' ? 'border-[#7c3aed] text-white bg-white/5' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          <CreditCard size={14} />
          Pricing & Feature Plans
        </button>
        <button
          onClick={() => setActiveSubTab('monitor')}
          className={`px-4 py-3 flex items-center gap-2 border-b-2 text-xs font-semibold whitespace-nowrap transition-all ${activeSubTab === 'monitor' ? 'border-[#7c3aed] text-white bg-white/5' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          <Activity size={14} />
          Node Health Monitor
        </button>
      </div>

      {/* --- OVERVIEW METRICS TAB --- */}
      {activeSubTab === 'metrics' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="glass-panel p-6 bg-[#1a1a24] border border-white/5 rounded-2xl flex flex-col justify-between">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total SaaS Tenants</span>
            <h2 className="text-3xl font-extrabold text-white mt-2">12 Organizations</h2>
            <p className="text-[10px] text-[#10b981] mt-1">↑ 2 new this week</p>
          </div>
          <div className="glass-panel p-6 bg-[#1a1a24] border border-white/5 rounded-2xl flex flex-col justify-between">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active Subscriptions</span>
            <h2 className="text-3xl font-extrabold text-white mt-2">10 Accounts</h2>
            <p className="text-[10px] text-[#10b981] mt-1">83% overall retention</p>
          </div>
          <div className="glass-panel p-6 bg-[#1a1a24] border border-white/5 rounded-2xl flex flex-col justify-between">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Monthly Recurring Revenue</span>
            <h2 className="text-3xl font-extrabold text-white mt-2">₹34,890</h2>
            <p className="text-[10px] text-[#10b981] mt-1">↑ 14% growth month-on-month</p>
          </div>
          <div className="glass-panel p-6 bg-[#1a1a24] border border-white/5 rounded-2xl flex flex-col justify-between">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Daily System-wide Orders</span>
            <h2 className="text-3xl font-extrabold text-white mt-2">412 Orders</h2>
            <p className="text-[10px] text-slate-400 mt-1">Across 18 branch outlets</p>
          </div>
        </div>
      )}

      {/* --- TENANTS LIST TAB --- */}
      {activeSubTab === 'tenants' && (
        <>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Deployed Tenant List</h3>
            <button 
              onClick={() => setShowAddTenant(!showAddTenant)}
              className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1 shadow-none"
            >
              <Plus size={14} /> Add Tenant Node
            </button>
          </div>

          {showAddTenant && (
            <div className="glass-panel p-4 mb-6 rounded-2xl border border-white/5 bg-[#1a1a24] text-white">
              <h4 className="text-xs font-bold uppercase text-slate-400 mb-3">Provision New Tenant</h4>
              <form onSubmit={handleCreateTenant} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-muted font-bold uppercase">Organization Name</span>
                  <input 
                    type="text" 
                    placeholder="e.g. Cyber Chef Grill" 
                    value={newTenant.name} 
                    onChange={(e) => setNewTenant({ ...newTenant, name: e.target.value })} 
                    className="bg-[#121217] border border-white/10 rounded-lg p-2 text-xs text-white" 
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-muted font-bold uppercase">Admin Email</span>
                  <input 
                    type="email" 
                    placeholder="e.g. info@chef.com" 
                    value={newTenant.contact} 
                    onChange={(e) => setNewTenant({ ...newTenant, contact: e.target.value })} 
                    className="bg-[#121217] border border-white/10 rounded-lg p-2 text-xs text-white" 
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-muted font-bold uppercase">Subscription Plan</span>
                  <select 
                    value={newTenant.plan} 
                    onChange={(e) => setNewTenant({ ...newTenant, plan: e.target.value })} 
                    className="bg-[#121217] border border-white/10 rounded-lg p-2 text-xs text-white"
                  >
                    {plans.map(p => (
                      <option key={p.id} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="btn-primary text-xs py-2 px-4 shadow-none">Provision Tenant</button>
              </form>
            </div>
          )}

          <div className="glass-panel bg-[#1a1a24] border border-white/5 rounded-2xl overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[10px] text-slate-400 uppercase font-bold">
                  <th className="p-3">Organization/Tenant</th>
                  <th className="p-3">Plan</th>
                  <th className="p-3">Trial/Expiry</th>
                  <th className="p-3">Contact</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-white/80 text-xs">
                {tenants.map(tenant => (
                  <tr key={tenant.id} className="border-b border-white/5 hover:bg-white/5 transition-all">
                    <td className="p-3 font-semibold text-white">{tenant.name}</td>
                    <td className="p-3"><span className="bg-white/5 border border-white/10 px-2 py-0.5 rounded text-[10px]">{tenant.plan}</span></td>
                    <td className="p-3 font-mono text-[10px]">{tenant.trialEnds}</td>
                    <td className="p-3 text-slate-400">{tenant.contact}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${tenant.status === 'active' ? 'bg-[#10b981]/10 text-[#10b981]' : 'bg-red-400/10 text-red-400'}`}>
                        {tenant.status}
                      </span>
                    </td>
                    <td className="p-3 text-right flex justify-end gap-2">
                      <button 
                        onClick={() => toggleTenantStatus(tenant.id)} 
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-md border ${tenant.status === 'active' ? 'border-red-400/20 text-red-400 hover:bg-red-400/10' : 'border-[#10b981]/20 text-[#10b981] hover:bg-[#10b981]/10'}`}
                      >
                        {tenant.status === 'active' ? 'Disable' : 'Enable'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* --- PLANS TAB --- */}
      {activeSubTab === 'plans' && (
        <>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Registered SaaS Billing Tiers</h3>
            <button 
              onClick={() => setShowAddPlan(!showAddPlan)}
              className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1 shadow-none"
            >
              <Plus size={14} /> Add Pricing Plan
            </button>
          </div>

          {showAddPlan && (
            <div className="glass-panel p-4 mb-6 rounded-2xl border border-white/5 bg-[#1a1a24] text-white">
              <h4 className="text-xs font-bold uppercase text-slate-400 mb-3">Define New Subscription Plan</h4>
              <form onSubmit={handleCreatePlan} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-muted font-bold uppercase">Plan Name</span>
                  <input 
                    type="text" 
                    placeholder="e.g. Starter Pack" 
                    value={newPlan.name} 
                    onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })} 
                    className="bg-[#121217] border border-white/10 rounded-lg p-2 text-xs text-white" 
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-muted font-bold uppercase">Price (INR)</span>
                  <input 
                    type="number" 
                    placeholder="e.g. 1999" 
                    value={newPlan.price} 
                    onChange={(e) => setNewPlan({ ...newPlan, price: parseInt(e.target.value) })} 
                    className="bg-[#121217] border border-white/10 rounded-lg p-2 text-xs text-white" 
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-muted font-bold uppercase">Features List (Comma-separated)</span>
                  <input 
                    type="text" 
                    placeholder="Feature 1, Feature 2" 
                    value={newPlan.featuresStr} 
                    onChange={(e) => setNewPlan({ ...newPlan, featuresStr: e.target.value })} 
                    className="bg-[#121217] border border-white/10 rounded-lg p-2 text-xs text-white" 
                  />
                </div>
                <button type="submit" className="btn-primary text-xs py-2 px-4 shadow-none">Register Plan</button>
              </form>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map(plan => (
              <div key={plan.id} className="glass-panel p-6 bg-[#1a1a24] border border-white/5 rounded-2xl flex flex-col justify-between text-white">
                <div>
                  <span className="text-[10px] text-[#a78bfa] font-extrabold uppercase tracking-wider block mb-2">{plan.name}</span>
                  <h3 className="text-3xl font-extrabold">{plan.currency}{plan.price} <span className="text-xs text-slate-400 font-normal">/ {plan.duration}</span></h3>
                  
                  <div className="mt-4 flex flex-col gap-2">
                    {plan.features.map((feat, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                        <span className="text-[#10b981] font-bold">✓</span>
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/5 flex justify-end gap-2">
                  <button className="text-[10px] text-red-400 font-bold hover:underline">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* --- MONITOR TAB --- */}
      {activeSubTab === 'monitor' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="glass-panel p-6 bg-[#1a1a24] border border-white/5 rounded-2xl text-white">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">API Node Performance</h4>
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
                <div>
                  <h5 className="text-xs font-bold">Average API Latency</h5>
                  <span className="text-[10px] text-slate-400">Response time to REST requests</span>
                </div>
                <strong className="text-base text-[#10b981]">{monitorStats.apiLatency} ms</strong>
              </div>

              <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
                <div>
                  <h5 className="text-xs font-bold">DB Transaction Engine</h5>
                  <span className="text-[10px] text-slate-400">Postgres connection pool</span>
                </div>
                <strong className="text-base text-[#10b981]">{monitorStats.dbConnections}</strong>
              </div>
            </div>
          </div>

          <div className="glass-panel p-6 bg-[#1a1a24] border border-white/5 rounded-2xl text-white">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Core Server Status</h4>
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
                <div>
                  <h5 className="text-xs font-bold">Live Active User Sessions</h5>
                  <span className="text-[10px] text-slate-400">Simultaneous ordering sessions</span>
                </div>
                <strong className="text-base text-[#a78bfa]">{monitorStats.activeSessions} online</strong>
              </div>

              <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
                <div>
                  <h5 className="text-xs font-bold">Main Server CPU Usage</h5>
                  <span className="text-[10px] text-slate-400">Web application system load</span>
                </div>
                <strong className="text-base text-[#a78bfa]">{monitorStats.cpuUsage}%</strong>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
