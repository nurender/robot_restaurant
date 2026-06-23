import { Sparkles } from 'lucide-react';
import React from 'react';

export default function CouponModal({
  isOpen,
  onClose,
  editingCouponId,
  newCoupon,
  setNewCoupon,
  generateCouponCode,
  handleSaveCoupon,
  isLoading
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{ zIndex: 9999, position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="modal-content glass-panel animate-slide-up" style={{ maxWidth: '500px', width: '90%', padding: '32px', borderRadius: '24px', background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)' }}>{editingCouponId ? 'Refine Offer' : 'Forge New Offer'}</h3>
          <div
            onClick={() => setNewCoupon({ ...newCoupon, is_active: !newCoupon.is_active })}
            className={`status-pill ${newCoupon.is_active ? 'active' : 'inactive'}`}
            style={{ cursor: 'pointer', padding: '6px 12px', borderRadius: '20px', fontSize: '10px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase', background: newCoupon.is_active ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)', color: newCoupon.is_active ? '#10b981' : '#ef4444' }}
          >
            {newCoupon.is_active ? 'ACTIVE' : 'INACTIVE'}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)' }}>COUPON CODE</label>
            <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
              <input
                type="text"
                placeholder="e.g. WELCOME50"
                value={newCoupon.code}
                onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                style={{ flex: 1, padding: '12px', borderRadius: '12px', background: 'var(--bg-deep)', border: '1px solid var(--card-border)', color: 'var(--text-main)' }}
              />
              <button
                onClick={generateCouponCode}
                className="btn-global-outline"
                
                title="Auto-generate Code"
              >
                <Sparkles size={18} />
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)' }}>DISCOUNT TYPE</label>
              <select value={newCoupon.discount_type} onChange={(e) => setNewCoupon({ ...newCoupon, discount_type: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--bg-deep)', border: '1px solid var(--card-border)', color: 'var(--text-main)', marginTop: '4px' }}>
                <option value="percent">% Percentage</option>
                <option value="flat">Flat Amount (₹)</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)' }}>VALUE</label>
              <input type="number" placeholder="0.00" value={newCoupon.discount_value} onChange={(e) => setNewCoupon({ ...newCoupon, discount_value: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--bg-deep)', border: '1px solid var(--card-border)', color: 'var(--text-main)', marginTop: '4px' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)' }}>MIN ORDER (₹)</label>
              <input type="number" value={newCoupon.min_order_value} onChange={(e) => setNewCoupon({ ...newCoupon, min_order_value: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--bg-deep)', border: '1px solid var(--card-border)', color: 'var(--text-main)', marginTop: '4px' }} />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)' }}>USAGE LIMIT</label>
              <input type="number" placeholder="Unlimited" value={newCoupon.usage_limit} onChange={(e) => setNewCoupon({ ...newCoupon, usage_limit: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--bg-deep)', border: '1px solid var(--card-border)', color: 'var(--text-main)', marginTop: '4px' }} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)' }}>EXPIRY DATE</label>
            <input type="date" value={newCoupon.expiry_date} onChange={(e) => setNewCoupon({ ...newCoupon, expiry_date: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--bg-deep)', border: '1px solid var(--card-border)', color: 'var(--text-main)', marginTop: '4px' }} />
          </div>

          <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
            <button className="btn-global-outline" onClick={onClose} >Cancel</button>
            <button
              className="btn-global-primary"
              disabled={isLoading}
              onClick={handleSaveCoupon}
              
            >
              {isLoading ? <div className="spinner-small" /> : (editingCouponId ? 'Update Promotion' : 'Publish Offer')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
