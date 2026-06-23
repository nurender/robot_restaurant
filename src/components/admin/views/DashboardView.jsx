import { TrendingUp, ListTodo, Sparkles, Calendar, DollarSign, Clock, CheckCircle, ChefHat } from 'lucide-react';
import React from 'react';
import { API_URL } from '../../../config';

export default function DashboardView({ orders, menuItems, formatDate }) {
  return (
    <div className="view-container animate-slide-up view-container-deep">
      <div className="view-header-row mb-8 flex justify-between items-center">
        <div className="header-left">
          <h1 className="view-title ext-cls-8e87210c" >AI RESTO Command</h1>
          <p className="text-muted ext-cls-10e9b125" >Executive SaaS Intelligence & Network Synchronization</p>
        </div>
        <div className="header-date flex items-center gap-2 ext-cls-611d5d8e" >
          <Calendar size={18} className="text-accent" />
          <span  className="ext-cls-4c8bbc32">
            {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
      </div>

      {/* 1. KPI Cards Row */}
      <div  className="ext-cls-95b5f1d2">
        {[
          { title: 'Total Revenue', value: `₹${orders.reduce((acc, curr) => acc + (Number(curr.total) || 0), 0).toLocaleString()}`, growth: '+14.2%', icon: DollarSign, color: 'purple' },
          { title: 'Total Orders', value: orders.length, growth: '+8.5%', icon: ListTodo, color: 'blue' },
          { title: 'Pending Syncs', value: orders.filter(o => o.status === 'pending').length, growth: 'Awaiting action', icon: Clock, color: 'orange' },
          { title: 'Success Deliveries', value: orders.filter(o => o.status === 'completed').length, growth: 'Optimal speed', icon: CheckCircle, color: 'green' },
          { title: 'Avg Order Val', value: `₹${orders.length ? Math.round(orders.reduce((acc, curr) => acc + (Number(curr.total) || 0), 0) / orders.length) : 0}`, growth: '+5.2%', icon: ChefHat, color: 'purple' },
          { title: 'Network Rating', value: '4.85 ★', growth: 'Elite standard', icon: Sparkles, color: 'orange' }
        ].map((stat, i) => (
          <div key={i} className="stat-card-modern ext-cls-5de800be" >
            <div  className="ext-cls-1bdb758b">
              <span  className="ext-cls-b488a854">{stat.title}</span>
              <stat.icon size={20} className={stat.color === 'purple' ? 'text-accent' : stat.color === 'orange' ? 'text-warning' : 'text-success'} />
            </div>
            <h3  className="ext-cls-d586a20f">{stat.value}</h3>
            <span style={{ fontSize: '11px', fontWeight: '700', color: stat.growth.startsWith('+') ? 'var(--success)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              {stat.growth}
            </span>
          </div>
        ))}
      </div>

      {/* 2. Analytics Charts */}
      <div  className="ext-cls-1308f549">
        <div className="glass-panel ext-cls-096b2a3a" >
          <h4  className="ext-cls-3089fc45"><TrendingUp className="text-accent" /> Revenue Velocity</h4>
          <div  className="ext-cls-37649d0e">
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

        <div className="glass-panel ext-cls-096b2a3a" >
          <h4  className="ext-cls-3089fc45"><ListTodo className="text-accent" /> Orders Trend</h4>
          <div  className="ext-cls-077693f5">
            {[20, 45, 30, 65, 85, 40, 55].map((val, idx) => (
              <div key={idx} style={{ flex: 1, height: `${val}%`, background: 'var(--accent-primary)', borderRadius: '6px 6px 2px 2px' }} />
            ))}
          </div>
        </div>

        <div className="glass-panel ext-cls-096b2a3a" >
          <h4  className="ext-cls-3089fc45"><Sparkles className="text-accent" /> Growth Allocation</h4>
          <div  className="ext-cls-ac9c79c4">
            <div  className="ext-cls-aeba8ec7" />
          </div>
        </div>
      </div>

      {/* Recent Orders & Top Selling */}
      <div  className="ext-cls-85fa111e">
        <div className="glass-panel ext-cls-497b5214" >
          <h4  className="ext-cls-85881f09">Live Order Matrix</h4>
          <div  className="ext-cls-21315f47">
            <table className="table-styled">
              <thead>
                <tr  className="ext-cls-df7f00d1">
                  <th  className="ext-cls-a0da11e7">Order ID</th>
                  <th  className="ext-cls-a0da11e7">Amount</th>
                  <th  className="ext-cls-a0da11e7">Status</th>
                  <th  className="ext-cls-a0da11e7">Timestamp</th>
                </tr>
              </thead>
              <tbody  className="ext-cls-4c8bbc32">
                {orders.slice(0, 5).map(o => (
                  <tr key={o.id}  className="ext-cls-061d9bac">
                    <td  className="ext-cls-ca11bf0a">#{o.id}</td>
                    <td  className="ext-cls-ca11bf0a">₹{o.total}</td>
                    <td  className="ext-cls-ca11bf0a">
                      <span style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '11px', background: o.status === 'completed' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', color: o.status === 'completed' ? 'var(--success)' : 'var(--warning)' }}>{o.status}</span>
                    </td>
                    <td  className="ext-cls-b54e4417">{formatDate(o.created_at || o.timestamp)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="glass-panel ext-cls-ecb69971" >
          <h4  className="ext-cls-85881f09">Core High-Affinity Menu</h4>
          <div  className="ext-cls-73683d33">
            {menuItems.slice(0, 4).map(dish => (
              <div key={dish.id}  className="ext-cls-b68c5feb">
                <img src={dish.image_url ? (dish.image_url.startsWith('http') ? dish.image_url : `${API_URL}${dish.image_url}`) : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=100&q=80'}  alt={dish.name} className="ext-cls-83ea47d6" />
                <div  className="ext-cls-04a898f1">
                  <span  className="ext-cls-22e4bbaf">{dish.name}</span>
                  <p  className="ext-cls-b98663d3">{dish.category}</p>
                </div>
                <span  className="ext-cls-5163cb1f">₹{dish.price}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
