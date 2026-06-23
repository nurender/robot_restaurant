import { BarChart2, Users } from 'lucide-react';

export default function CustomerDirectoryView({ customers }) {
  return (
    <div className="view-container animate-slide-up view-container-deep">
      <div className="view-header-row mb-8">
        <div className="header-left">
          <h1 className="view-title" style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-main)' }}>Customer Directory</h1>
          <p className="text-muted" style={{ marginTop: '4px', fontSize: '15px' }}>Database of neural network customer profiles and behavior.</p>
        </div>
      </div>

      <div className="glass-panel glass-panel-styled">
        <table className="table-styled">
          <thead>
            <tr className="table-header-row">
              <th style={{ padding: '20px' }}>NAME</th>
              <th style={{ padding: '20px' }}>PHONE</th>
              <th style={{ padding: '20px' }}>ORDERS</th>
              <th style={{ padding: '20px' }}>TOTAL SPEND</th>
              <th style={{ padding: '20px' }}>LAST ORDER</th>
              <th style={{ padding: '20px' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c, i) => (
              <tr key={i} className="table-body-row hover-row">
                <td style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '800', fontSize: '12px' }}>
                      {c.name?.charAt(0) || 'U'}
                    </div>
                    <span style={{ fontWeight: '700' }}>{c.name || 'Anonymous'}</span>
                  </div>
                </td>
                <td style={{ padding: '20px', color: 'var(--text-dim)' }}>{c.phone}</td>
                <td style={{ padding: '20px' }}>
                  <span style={{ background: 'rgba(59,130,246,0.1)', color: '#60a5fa', padding: '4px 10px', borderRadius: '8px', fontWeight: '800', fontSize: '12px' }}>{c.total_orders || 1}</span>
                </td>
                <td style={{ padding: '20px', fontWeight: '800', color: 'var(--success)' }}>₹{Number(c.total_spend || 0).toLocaleString()}</td>
                <td style={{ padding: '20px', fontSize: '13px', color: 'var(--text-muted)' }}>{c.last_order_date ? new Date(c.last_order_date).toLocaleDateString() : 'Recent'}</td>
                <td style={{ padding: '20px' }}>
                  <button
                    className="btn-global-outline"
                    onClick={() => alert(`Customer Insights for ${c.name || 'Anonymous'}\nPhone: ${c.phone}\nTotal Orders: ${c.total_orders || 1}\nTotal Spend: ₹${c.total_spend || 0}`)}
                  >
                    <BarChart2 size={14} /> View Insights
                  </button>
                </td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td colSpan="4" style={{ padding: '80px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <Users size={48} style={{ opacity: 0.1, marginBottom: '16px' }} />
                  <p>No neural profiles found in this node.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
