import { Send } from 'lucide-react';

export default function MarketingHubView({ coupons, customers }) {
  return (
    <div className="view-container animate-slide-up view-container-deep">
      <div className="view-header-row mb-10">
        <div className="header-left">
          <h1 className="view-title" style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-main)' }}>Marketing Hub</h1>
          <p className="text-muted" style={{ marginTop: '4px', fontSize: '15px' }}>Automated engagement and loyalty orchestration.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '32px' }}>
        <div className="glass-panel" style={{ padding: '32px', borderRadius: '28px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '24px' }}>Launch Campaign</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)' }}>SELECT AUDIENCE</label>
              <select style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--bg-deep)', border: '1px solid var(--card-border)', color: 'white', marginTop: '8px' }}>
                <option>Top 10% High Spenders</option>
                <option>Inactive (Last 30 Days)</option>
                <option>All Neural Profiles</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)' }}>COUPON CODE</label>
              <select style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--bg-deep)', border: '1px solid var(--card-border)', color: 'white', marginTop: '8px' }}>
                {coupons.map(c => <option key={c.id}>{c.code} - {c.discount_value}% Off</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)' }}>MESSAGE PRESET</label>
              <textarea
                rows="4"
                style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--bg-deep)', border: '1px solid var(--card-border)', color: 'white', marginTop: '8px' }}
                defaultValue="Hi {name}, we miss you! Here is a special 20% discount for your next visit. Use code {code}."
              />
            </div>
            <button className="btn-global-primary" >
              <Send size={18} /> Blast Campaign via WhatsApp
            </button>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center' }}>Note: Real-time API integration required for actual delivery.</p>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '32px', borderRadius: '28px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '24px' }}>Top Target Leads</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {customers.slice(0, 5).map((c, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid var(--card-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900' }}>{c.name.charAt(0)}</div>
                  <div>
                    <div style={{ fontWeight: '700' }}>{c.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Spent: ₹{c.total_spend}</div>
                  </div>
                </div>
                <div className="status-pill active" style={{ fontSize: '10px' }}>HIGH VALUE</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
