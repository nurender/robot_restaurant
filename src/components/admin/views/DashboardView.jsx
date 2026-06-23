import { TrendingUp, ListTodo, Sparkles, Calendar, DollarSign, Clock, CheckCircle, ChefHat } from 'lucide-react';
import React from 'react';
import { API_URL } from '../../../config';

export default function DashboardView({ orders, menuItems, formatDate }) {
  return (
    <div className="view-container animate-slide-up view-container-deep">
      <div className="view-header-row mb-8 flex justify-between items-center">
        <div className="header-left">
          <h1 className="view-title" style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-1px' }}>AI RESTO Command</h1>
          <p className="text-muted" style={{ fontSize: '15px', marginTop: '4px' }}>Executive SaaS Intelligence & Network Synchronization</p>
        </div>
        <div className="header-date flex items-center gap-2" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', padding: '10px 18px', borderRadius: '14px', boxShadow: 'var(--shadow-sm)' }}>
          <Calendar size={18} className="text-accent" />
          <span style={{ fontWeight: '600', fontSize: '14px', color: 'var(--text-main)' }}>
            {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
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
          <h4 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)' }}><TrendingUp className="text-accent" /> Revenue Velocity</h4>
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
          <h4 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)' }}><ListTodo className="text-accent" /> Orders Trend</h4>
          <div style={{ height: '180px', display: 'flex', alignItems: 'flex-end', gap: '12px', padding: '10px' }}>
            {[20, 45, 30, 65, 85, 40, 55].map((val, idx) => (
              <div key={idx} style={{ flex: 1, height: `${val}%`, background: 'var(--accent-primary)', borderRadius: '6px 6px 2px 2px' }} />
            ))}
          </div>
        </div>

        <div className="glass-panel" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '24px', padding: '28px', boxShadow: 'var(--shadow-md)' }}>
          <h4 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)' }}><Sparkles className="text-accent" /> Growth Allocation</h4>
          <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '120px', height: '120px', borderRadius: '50%', border: '16px solid var(--accent-primary)', borderRightColor: 'var(--bg-deep)', transform: 'rotate(45deg)' }} />
          </div>
        </div>
      </div>

      {/* Recent Orders & Top Selling */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '32px' }}>
        <div className="glass-panel" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '24px', padding: '28px', boxShadow: 'var(--shadow-md)', gridColumn: 'span 2' }}>
          <h4 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '24px', color: 'var(--text-main)' }}>Live Order Matrix</h4>
          <div style={{ overflowX: 'auto' }}>
            <table className="table-styled">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--card-border)', color: 'var(--text-muted)', fontSize: '13px' }}>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Order ID</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Amount</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Timestamp</th>
                </tr>
              </thead>
              <tbody style={{ fontWeight: '600', fontSize: '14px', color: 'var(--text-main)' }}>
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

        <div className="glass-panel" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '24px', padding: '28px', boxShadow: 'var(--shadow-md)', gridColumn: 'span 1' }}>
          <h4 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '24px', color: 'var(--text-main)' }}>Core High-Affinity Menu</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {menuItems.slice(0, 4).map(dish => (
              <div key={dish.id} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <img src={dish.image_url ? (dish.image_url.startsWith('http') ? dish.image_url : `${API_URL}${dish.image_url}`) : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=100&q=80'} style={{ width: '50px', height: '50px', borderRadius: '12px', objectFit: 'cover' }} alt={dish.name} />
                <div style={{ flex: 1 }}>
                  <span style={{ fontWeight: '700', fontSize: '14px', color: 'var(--text-main)' }}>{dish.name}</span>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{dish.category}</p>
                </div>
                <span style={{ fontWeight: '800', color: 'var(--accent-primary)' }}>₹{dish.price}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
