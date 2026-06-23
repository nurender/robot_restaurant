import { Clock, DollarSign, UtensilsCrossed } from 'lucide-react';
import React from 'react';
import { ResponsiveContainer, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Area, BarChart, Bar } from 'recharts';
export default function ReportsView({ analyticsData, fetchData }) {
  return (
    <div className="view-container animate-slide-up view-container-deep">
      <div className="view-header-row mb-8">
        <div className="header-left">
          <h1 className="view-title" style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-main)' }}>Intelligence Center</h1>
          <p className="text-muted" style={{ marginTop: '4px', fontSize: '15px' }}>Neural insights and business performance analytics.</p>
        </div>
        <button className="btn-global-outline" onClick={fetchData} >
          <Clock size={18} /> Refresh Intelligence
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px', marginBottom: '32px' }}>
        <div className="glass-panel" style={{ padding: '24px', borderRadius: '24px', minHeight: '400px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <DollarSign size={20} className="text-success" /> Revenue Trend (Last 7 Days)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={analyticsData.revenueHistory}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} />
              <YAxis stroke="var(--text-muted)" fontSize={12} />
              <Tooltip contentStyle={{ background: 'var(--bg-deep)', border: '1px solid var(--card-border)', borderRadius: '12px' }} />
              <Area type="monotone" dataKey="amount" stroke="var(--accent-primary)" fillOpacity={1} fill="url(#colorRev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-panel" style={{ padding: '24px', borderRadius: '24px', minHeight: '400px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UtensilsCrossed size={20} className="text-warning" /> Top Performers
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.topItems} layout="vertical">
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" width={100} fontSize={12} stroke="var(--text-main)" />
              <Tooltip contentStyle={{ background: 'var(--bg-deep)', border: '1px solid var(--card-border)', borderRadius: '12px' }} />
              <Bar dataKey="qty" fill="var(--accent-primary)" radius={[0, 10, 10, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-panel" style={{ padding: '24px', borderRadius: '24px', gridColumn: 'span 2' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={20} className="text-info" /> Order Heatmap
          </h3>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={analyticsData.hourlyHeatmap}>
              <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={10} />
              <Tooltip contentStyle={{ background: 'var(--bg-deep)', border: '1px solid var(--card-border)', borderRadius: '12px' }} />
              <Bar dataKey="orders" fill="var(--accent-primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-panel" style={{ padding: '24px', borderRadius: '24px', gridColumn: 'span 2' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '24px' }}>Staff Performance Leaderboard</h3>
          <table className="inv-table">
            <thead>
              <tr>
                <th>STAFF</th>
                <th>TOTAL SALES</th>
                <th>ORDERS</th>
                <th style={{ textAlign: 'right' }}>EFFICIENCY</th>
              </tr>
            </thead>
            <tbody>
              {analyticsData.staffSales.map((s, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: '700' }}>{s.name}</td>
                  <td style={{ color: 'var(--success)', fontWeight: '800' }}>₹{s.sales.toLocaleString()}</td>
                  <td>{s.count}</td>
                  <td style={{ textAlign: 'right' }}>{Math.min(100, Math.round((s.sales / 10000) * 100))}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
