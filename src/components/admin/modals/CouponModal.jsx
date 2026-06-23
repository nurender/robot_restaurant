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
    <div className="modal-overlay ext-cls-ba6f5ec3" >
      <div className="modal-content glass-panel animate-slide-up ext-cls-07fb66f0" >
        <div  className="ext-cls-72e6eb14">
          <h3  className="ext-cls-9e416567">{editingCouponId ? 'Refine Offer' : 'Forge New Offer'}</h3>
          <div
            onClick={() => setNewCoupon({ ...newCoupon, is_active: !newCoupon.is_active })}
            className={`status-pill ${newCoupon.is_active ? 'active' : 'inactive'}`}
            style={{ cursor: 'pointer', padding: '6px 12px', borderRadius: '20px', fontSize: '10px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase', background: newCoupon.is_active ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)', color: newCoupon.is_active ? '#10b981' : '#ef4444' }}
          >
            {newCoupon.is_active ? 'ACTIVE' : 'INACTIVE'}
          </div>
        </div>

        <div  className="ext-cls-21558a0c">
          <div>
            <label  className="ext-cls-0c40bbfd">COUPON CODE</label>
            <div  className="ext-cls-bd4ecb0b">
              <input
                type="text"
                placeholder="e.g. WELCOME50"
                value={newCoupon.code}
                onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                className="st-cls-32558def"
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

          <div  className="ext-cls-5842419a">
            <div>
              <label  className="ext-cls-0c40bbfd">DISCOUNT TYPE</label>
              <select value={newCoupon.discount_type} onChange={(e) => setNewCoupon({ ...newCoupon, discount_type: e.target.value })} className="st-cls-30e033af">
                <option value="percent">% Percentage</option>
                <option value="flat">Flat Amount (₹)</option>
              </select>
            </div>
            <div>
              <label  className="ext-cls-0c40bbfd">VALUE</label>
              <input type="number" placeholder="0.00" value={newCoupon.discount_value} onChange={(e) => setNewCoupon({ ...newCoupon, discount_value: e.target.value })} className="st-cls-30e033af" />
            </div>
          </div>

          <div  className="ext-cls-5842419a">
            <div>
              <label  className="ext-cls-0c40bbfd">MIN ORDER (₹)</label>
              <input type="number" value={newCoupon.min_order_value} onChange={(e) => setNewCoupon({ ...newCoupon, min_order_value: e.target.value })} className="st-cls-30e033af" />
            </div>
            <div>
              <label  className="ext-cls-0c40bbfd">USAGE LIMIT</label>
              <input type="number" placeholder="Unlimited" value={newCoupon.usage_limit} onChange={(e) => setNewCoupon({ ...newCoupon, usage_limit: e.target.value })} className="st-cls-30e033af" />
            </div>
          </div>

          <div>
            <label  className="ext-cls-0c40bbfd">EXPIRY DATE</label>
            <input type="date" value={newCoupon.expiry_date} onChange={(e) => setNewCoupon({ ...newCoupon, expiry_date: e.target.value })} className="st-cls-30e033af" />
          </div>

          <div  className="ext-cls-11faf9b7">
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
