import React, { useState } from 'react';
import { ChefHat, Minus, Plus, Users, ChevronDown, ChevronUp, Loader } from 'lucide-react';
import { API_URL } from '../config';
const CartOverlay = ({
  currentCart,
  textLanguage,
  setShowCartSummary,
  getMediaUrl,
  setZoomedImage,
  handleManualCartUpdate,
  getCartTotal,
  getCartSubtotal,
  getCartTax,
  restaurantData,
  completeOrderProcess,
  orderNote,
  setOrderNote,
  availableCoupons,
  activeCoupon,
  setActiveCoupon,
  getDiscountAmount,
  isSubmittingOrder,
  qrSettings,
  tipAmount,
  setTipAmount,
  deliveryInstruction,
  setDeliveryInstruction
}) => {
  const [splitCount, setSplitCount] = useState(1);
  const [showBillDetails, setShowBillDetails] = useState(false);
  const [couponMessage, setCouponMessage] = useState(null);
  const {
    cgst,
    sgst
  } = getCartTax();
  const subtotal = getCartSubtotal();
  const finalTotal = getCartTotal() + (tipAmount || 0);
  const splitAmount = splitCount > 1 ? (finalTotal / splitCount).toFixed(2) : finalTotal;
  const handleApplyCoupon = async e => {
    e.preventDefault();
    const code = e.target.couponCode.value.toUpperCase();
    if (!code) return;
    try {
      const res = await fetch(`${API_URL}/api/mgmt/coupons/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          code,
          restaurant_id: restaurantData?.id || 4
        })
      });
      const data = await res.json();
      if (data.success && data.data) {
        const found = data.data;
        if (found.min_order_value && subtotal < found.min_order_value) {
          setCouponMessage({
            text: `Order value must be at least ₹${found.min_order_value}`,
            type: 'error'
          });
        } else if (found.usage_limit && Number(found.current_usage_count || 0) >= found.usage_limit) {
          setCouponMessage({
            text: "This coupon has reached its maximum usage limit.",
            type: 'error'
          });
        } else if (found.expiry_date && new Date(found.expiry_date) < new Date(new Date().setHours(0, 0, 0, 0))) {
          setCouponMessage({
            text: "This coupon has expired.",
            type: 'error'
          });
        } else {
          setActiveCoupon(found);
          setCouponMessage(null);
        }
      } else {
        setCouponMessage({
          text: "Invalid or inactive coupon code.",
          type: 'error'
        });
      }
    } catch (err) {
      setCouponMessage({
        text: "Network error parsing coupon.",
        type: 'error'
      });
    }
    setTimeout(() => setCouponMessage(null), 3000);
  };
  return <div className="cart-summary-overlay animate-fade-in" onClick={() => setShowCartSummary(false)}>
            <div className="cart-summary-modal slide-up" onClick={e => e.stopPropagation()}>
                <div className="cart-summary-header">
                    <h3 className="ext-cls-847f26d6">Review Your Order</h3>
                    <button className="close-cart-btn" onClick={() => setShowCartSummary(false)}>×</button>
                </div>

                <div className="custom-scrollbar ex-style-1743a9">
                    <div className="cart-summary-items ex-style-661519">
                        {currentCart.length === 0 ? <div className="ext-cls-6395e718">
                                <ChefHat size={48} className="ext-cls-b70a18fb" />
                                <p>Your cart is empty</p>
                            </div> : currentCart.map((item, idx) => <div key={item.cartId || `${item.id}-${idx}`} className="cart-summary-item">
                                    <div className="cart-item-photo" onClick={() => item.image_url && setZoomedImage(getMediaUrl(item.image_url))}>
                                        {item.image_url ? <img src={getMediaUrl(item.image_url)} alt={item.name} /> : <div className="cart-item-placeholder ext-cls-2cdddd2c">
                                                <ChefHat size={24} color="var(--text-dim)" />
                                            </div>}
                                    </div>
                                    <div className="cart-item-info">
                                        <span className="cart-item-name ext-cls-afade7f3">
                                            {item.name}
                                            {item.selectedVariant && <span className="ext-cls-763e0ad5">
                                                    {item.selectedVariant.size}
                                                </span>}
                                            {item.selectedAddons && item.selectedAddons.length > 0 && <span className="ext-cls-e874b837">
                                                    + {item.selectedAddons.map(a => a.name).join(', ')}
                                                </span>}
                                        </span>
                                        <span className="cart-item-price">₹{item.price} per unit</span>
                                    </div>
                                    <div className="cart-item-actions">
                                        <div className="qty-controls-premium">
                                            <button onClick={() => handleManualCartUpdate(item, -1, item.selectedVariant, item.selectedAddons)}><Minus size={14} /></button>
                                            <span className="qty-val">{item.qty}</span>
                                            <button onClick={() => handleManualCartUpdate(item, 1, item.selectedVariant, item.selectedAddons)}><Plus size={14} /></button>
                                        </div>
                                        <span className="cart-item-subtotal">₹{item.price * item.qty}</span>
                                    </div>
                                </div>)}
                    </div>

                    <div className="ex-style-70ea1a">
                        {(qrSettings === null || qrSettings.qr_special_note !== false) && <div className="ex-style-7f2176">
                                <label className="ex-style-8d08e4">Cooking Notes</label>
                                <textarea value={orderNote || ''} onChange={e => setOrderNote(e.target.value)} placeholder="e.g. Less spicy, Extra cheese..." onFocus={e => e.target.style.borderColor = 'var(--accent-primary)'} onBlur={e => e.target.style.borderColor = 'var(--border-default)'} className="ex-style-760bbe"></textarea>
                            </div>}

                        {}

                        {(qrSettings === null || qrSettings.qr_tip_option !== false) && <div className="ex-style-d14f4c">
                                <label className="ex-style-8d08e4">Support Staff Tip</label>
                                <div className="ex-style-3c37f6">
                                    {[0, 10, 20, 30, 50].map(amt => <button key={amt} onClick={() => setTipAmount(amt)} style={{
                flex: 1,
                padding: '10px 0',
                border: `1px solid ${tipAmount === amt ? 'var(--accent-primary)' : 'var(--border-default)'}`,
                background: tipAmount === amt ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                borderRadius: '8px',
                color: tipAmount === amt ? '#fff' : 'var(--text-main)',
                fontSize: '12px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}>
                                            {amt === 0 ? 'No Tip' : `₹${amt}`}
                                        </button>)}
                                </div>
                            </div>}
                    </div>
                </div>

                <div className="cart-summary-footer ext-cls-beb1d5f4">
                    <div className="ext-cls-a230f5c5">
                        {!activeCoupon ? <>
                                <form onSubmit={handleApplyCoupon} className="st-cls-441e8d8e">
                                    <input name="couponCode" type="text" placeholder="Got a Promotion Code?" className="ext-cls-3ebffb37" />
                                    <button type="submit" className="ext-cls-ae2a67f1">Apply</button>
                                </form>
                                {couponMessage && <div style={{
              backgroundColor: couponMessage.type === 'error' ? '#fef2f2' : '#ecfdf5',
              color: couponMessage.type === 'error' ? '#ef4444' : '#10b981',
              border: `1px solid ${couponMessage.type === 'error' ? '#fca5a5' : '#6ee7b7'}`,
              borderRadius: '6px',
              fontSize: '13px',
              marginTop: '8px',
              padding: '6px 10px',
              display: 'flex',
              alignItems: 'center',
              fontWeight: '500',
              gap: '6px'
            }}>
                                        {couponMessage.type === 'error' ? '⚠️' : '✅'} {couponMessage.text}
                                    </div>}
                            </> : <div className="ext-cls-f0fb0a20">
                                <span className="ext-cls-b634164c">✓ {activeCoupon.code} Applied</span>
                                <button onClick={() => setActiveCoupon(null)} className="st-cls-0be79454">Remove</button>
                            </div>}
                    </div>

                    {}
                    <div className="ext-cls-a62da7ea">
                        <div className="ext-cls-b95895ae">
                            <Users size={16} /> Split the Bill?
                        </div>
                        <div className="ext-cls-cc0ebbd6">
                            <button onClick={() => setSplitCount(Math.max(1, splitCount - 1))} className="st-cls-b60b47af">-</button>
                            <span className="ext-cls-b2d9cfd1">{splitCount}</span>
                            <button onClick={() => setSplitCount(Math.min(10, splitCount + 1))} className="st-cls-b60b47af">+</button>
                        </div>
                    </div>

                    <div className="cart-final-total" style={{
          cursor: 'pointer',
          padding: '8px 4px',
          borderRadius: '12px',
          transition: 'all 0.2s',
          borderBottom: showBillDetails ? '1px dashed var(--border-default)' : 'none',
          marginBottom: showBillDetails ? '8px' : '0'
        }} onClick={() => setShowBillDetails(!showBillDetails)}>
                        <div className="ext-cls-dc3bece4">
                            <span className="ext-cls-1d97b50c">
                                {splitCount > 1 ? `Grand Total (₹${splitAmount} x ${splitCount})` : 'Grand Total'}
                            </span>
                            {restaurantData?.is_round_off && <span className="ext-cls-c5b5a8ab">Rounded Off</span>}
                        </div>
                        <strong className="ext-cls-3656d0f4">
                            ₹{finalTotal}
                            {showBillDetails ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </strong>
                    </div>

                    {showBillDetails && <div className="animate-fade-in ext-cls-14aec927">
                            <div className="ext-cls-f71f3a0f">
                                <span>Item Total</span>
                                <span>₹{subtotal.toFixed(2)}</span>
                            </div>
                            {activeCoupon && getDiscountAmount() > 0 && <div className="ext-cls-2a7a3077">
                                    <span>Discount ({activeCoupon.code})</span>
                                    <span>-₹{getDiscountAmount().toFixed(2)}</span>
                                </div>}
                            <div className="ext-cls-f71f3a0f">
                                <span>Taxes (CGST {restaurantData?.cgst || 0}%)</span>
                                <span>₹{cgst.toFixed(2)}</span>
                            </div>
                            <div className="ext-cls-f71f3a0f">
                                <span>Taxes (SGST {restaurantData?.sgst || 0}%)</span>
                                <span>₹{sgst.toFixed(2)}</span>
                            </div>
                        </div>}
                    <button className="final-checkout-btn" disabled={isSubmittingOrder} onClick={() => {
          completeOrderProcess();
        }}>
                        {isSubmittingOrder ? <Loader size={20} className="spin" /> : qrSettings?.payBeforeConfirm ? 'Pay & Confirm Order' : 'Place Order (Postpaid)'}
                    </button>
                </div>
            </div>
        </div>;
};
export default CartOverlay;