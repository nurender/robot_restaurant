import { Plus, CreditCard, Edit2, Trash2 } from 'lucide-react';

export default function CouponsView({ coupons, setShowCouponPopup, handleEditCoupon, deleteCoupon, toggleCouponStatus }) {
  return (
    <div className="view-container animate-slide-up view-container-deep">
      <div className="view-header-row mb-8">
        <div className="header-left">
          <h1 className="view-title" style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-main)' }}>Neural Promotions</h1>
          <p className="text-muted" style={{ marginTop: '4px', fontSize: '15px' }}>Manage active discount protocols and customer incentives.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowCouponPopup(true)}>
          <Plus size={20} />
          <span>Create Coupon</span>
        </button>
      </div>

      <div className="inventory-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
        {coupons.map((c, i) => (
          <div key={i} className="glass-panel" style={{
            padding: '24px',
            borderRadius: '24px',
            position: 'relative',
            border: '1px solid var(--card-border)',
            background: 'var(--card-bg)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div className="inv-icon-box" style={{
                background: c.is_active ? 'rgba(124, 58, 237, 0.1)' : 'rgba(100, 116, 139, 0.1)',
                color: c.is_active ? 'var(--accent-primary)' : 'var(--text-muted)',
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <CreditCard size={28} />
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => handleEditCoupon(c)}
                  className="btn-global-outline"
                  
                  title="Edit Coupon"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => deleteCoupon(c.id)}
                  className="inv-btn-delete"
                  style={{ width: '32px', height: '32px', borderRadius: '8px' }}
                  title="Delete Coupon"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <strong style={{ fontSize: '20px', fontWeight: '900', letterSpacing: '1px' }}>{c.code}</strong>
                <div
                  onClick={(e) => { e.stopPropagation(); toggleCouponStatus(c); }}
                  className={`status-pill ${c.is_active ? 'active' : 'inactive'}`}
                  style={{
                    cursor: 'pointer',
                    fontSize: '10px',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    border: `1.5px solid ${c.is_active ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: c.is_active ? '0 4px 12px rgba(34, 197, 94, 0.2)' : 'none'
                  }}
                >
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: c.is_active ? '#22c55e' : '#ef4444',
                    boxShadow: c.is_active ? '0 0 8px #22c55e' : 'none'
                  }} />
                  {c.is_active ? 'ACTIVE' : 'DISABLED'}
                </div>
              </div>
              <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px', fontWeight: '600' }}>
                {c.discount_type === 'percent' ? `${c.discount_value}%` : `₹${c.discount_value}`} Off
                {c.min_order_value > 0 && <span style={{ opacity: 0.6 }}> • Min order ₹{c.min_order_value}</span>}
              </div>
            </div>

            <div style={{
              marginTop: 'auto',
              paddingTop: '16px',
              borderTop: '1px dashed var(--border-default)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                Expires: {new Date(c.expiry_date).toLocaleDateString()}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--accent-primary)', fontWeight: '700' }}>
                Used: {c.current_usage_count || 0} {c.usage_limit ? `/ ${c.usage_limit}` : ''}
              </div>
            </div>

            {c.usage_history && c.usage_history.length > 0 && (
              <details style={{ marginTop: '8px', cursor: 'pointer', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-default)' }}>
                <summary style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-main)', outline: 'none' }}>View Usage History ({c.usage_history.length})</summary>
                <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '150px', overflowY: 'auto', paddingRight: '4px' }} className="custom-scrollbar">
                  {c.usage_history.map((hist, hIdx) => (
                    <div key={hIdx} style={{ fontSize: '12px', background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '8px', borderLeft: '2px solid var(--accent-primary)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ color: 'var(--text-main)', fontWeight: '700' }}>{hist.customer_name || 'Guest'}</span>
                        <span style={{ color: 'var(--text-muted)' }}>{new Date(hist.timestamp).toLocaleDateString()}</span>
                      </div>
                      <div style={{ color: 'var(--text-dim)', marginBottom: '2px' }}>{hist.customer_phone || 'No Phone'}</div>
                      <div style={{ color: '#10b981', fontWeight: '700' }}>Order Total: ₹{hist.total} (Saved: ₹{hist.discount_amount || 0})</div>
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>
        ))}
        {coupons.length === 0 && (
          <div style={{ gridColumn: '1/-1', padding: '80px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <CreditCard size={48} style={{ opacity: 0.1, margin: '0 auto 16px' }} />
            <p>No active neural coupons found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
