import { Plus, CreditCard, Edit2, Trash2 } from 'lucide-react';

export default function CouponsView({ coupons, setShowCouponPopup, handleEditCoupon, deleteCoupon, toggleCouponStatus }) {
  return (
    <div className="view-container animate-slide-up view-container-deep">
      <div className="view-header-row mb-8">
        <div className="header-left">
          <h1 className="view-title ext-cls-46d76c78" >Neural Promotions</h1>
          <p className="text-muted ext-cls-a6a615ae" >Manage active discount protocols and customer incentives.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowCouponPopup(true)}>
          <Plus size={20} />
          <span>Create Coupon</span>
        </button>
      </div>

      <div className="inventory-grid ext-cls-9db28ba8" >
        {coupons.map((c, i) => (
          <div key={i} className="glass-panel ext-cls-21ad1e89" >
            <div  className="ext-cls-91d58929">
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
              <div  className="ext-cls-441e8d8e">
                <button
                  onClick={() => handleEditCoupon(c)}
                  className="btn-global-outline"
                  
                  title="Edit Coupon"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => deleteCoupon(c.id)}
                  className="inv-btn-delete st-cls-f4229948"
                  
                  title="Delete Coupon"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <div>
              <div  className="ext-cls-9fdd7fb0">
                <strong  className="ext-cls-169479d7">{c.code}</strong>
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
              <div  className="ext-cls-5b6befe4">
                {c.discount_type === 'percent' ? `${c.discount_value}%` : `₹${c.discount_value}`} Off
                {c.min_order_value > 0 && <span  className="ext-cls-658a075c"> • Min order ₹{c.min_order_value}</span>}
              </div>
            </div>

            <div  className="ext-cls-9a19ac95">
              <div  className="ext-cls-e6746b1a">
                Expires: {new Date(c.expiry_date).toLocaleDateString()}
              </div>
              <div  className="ext-cls-03df007a">
                Used: {c.current_usage_count || 0} {c.usage_limit ? `/ ${c.usage_limit}` : ''}
              </div>
            </div>

            {c.usage_history && c.usage_history.length > 0 && (
              <details  className="ext-cls-074862f9">
                <summary  className="ext-cls-e3556bd5">View Usage History ({c.usage_history.length})</summary>
                <div  className="custom-scrollbar ext-cls-c67d8461">
                  {c.usage_history.map((hist, hIdx) => (
                    <div key={hIdx}  className="ext-cls-b8413c7b">
                      <div  className="ext-cls-b44ca5a7">
                        <span  className="ext-cls-642317c2">{hist.customer_name || 'Guest'}</span>
                        <span  className="ext-cls-d77dc274">{new Date(hist.timestamp).toLocaleDateString()}</span>
                      </div>
                      <div  className="ext-cls-615b4421">{hist.customer_phone || 'No Phone'}</div>
                      <div  className="ext-cls-fdbf5181">Order Total: ₹{hist.total} (Saved: ₹{hist.discount_amount || 0})</div>
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>
        ))}
        {coupons.length === 0 && (
          <div  className="ext-cls-54a9ded7">
            <CreditCard size={48}  className="ext-cls-25092ba2" />
            <p>No active neural coupons found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
