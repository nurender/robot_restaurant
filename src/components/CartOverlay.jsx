import React, { useState } from 'react';
import { ChefHat, Minus, Plus, Users, ChevronDown, ChevronUp } from 'lucide-react';

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
    getDiscountAmount
}) => {
    const [splitCount, setSplitCount] = useState(1);
    const [showBillDetails, setShowBillDetails] = useState(false);
    const { cgst, sgst } = getCartTax();
    const subtotal = getCartSubtotal();

    const finalTotal = getCartTotal();
    const splitAmount = splitCount > 1 ? (finalTotal / splitCount).toFixed(2) : finalTotal;

    return (
        <div className="cart-summary-overlay animate-fade-in" onClick={() => setShowCartSummary(false)}>
            <div className="cart-summary-modal slide-up" onClick={e => e.stopPropagation()}>
                <div className="cart-summary-header">
                    <h3 style={{ fontSize: '20px', margin: 0, letterSpacing: '-0.5px' }}>Review Your Order</h3>
                    <button className="close-cart-btn" onClick={() => setShowCartSummary(false)}>×</button>
                </div>

                <div className="cart-summary-items custom-scrollbar">
                    {currentCart.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-dim)' }}>
                            <ChefHat size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                            <p>Your cart is empty</p>
                        </div>
                    ) : (
                        currentCart.map((item, idx) => (
                            <div key={item.cartId || `${item.id}-${idx}`} className="cart-summary-item">
                                <div className="cart-item-photo" onClick={() => item.image_url && setZoomedImage(getMediaUrl(item.image_url))}>
                                    {item.image_url ? (
                                        <img src={getMediaUrl(item.image_url)} alt={item.name} />
                                    ) : (
                                        <div className="cart-item-placeholder" style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-secondary)' }}>
                                            <ChefHat size={24} color="var(--text-dim)" />
                                        </div>
                                    )}
                                </div>
                                <div className="cart-item-info">
                                    <span className="cart-item-name" style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                        {item.name}
                                        {item.selectedVariant && (
                                            <span style={{ fontSize: '11px', background: 'var(--bg-secondary)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border-default)' }}>
                                                {item.selectedVariant.size}
                                            </span>
                                        )}
                                        {item.selectedAddons && item.selectedAddons.length > 0 && (
                                            <span style={{ fontSize: '10px', color: '#f1c40f', background: 'rgba(241, 196, 15, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                                                + {item.selectedAddons.map(a => a.name).join(', ')}
                                            </span>
                                        )}
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
                            </div>
                        ))
                    )}
                </div>

                {/* <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border-default)', borderBottom: '1px solid var(--border-default)' }}>
                    <textarea
                        value={orderNote || ''}
                        onChange={(e) => setOrderNote(e.target.value)}
                        placeholder="Any special cooking instructions? (e.g. Less spicy, Extra cheese)"
                        style={{ width: '100%', height: '64px', borderRadius: '12px', padding: '12px', border: '1px solid var(--border-default)', background: 'var(--bg-deep)', color: 'var(--text-main)', fontSize: '13px', resize: 'none', outline: 'none' }}
                    ></textarea>
                </div> */}

                <div className="cart-summary-footer" style={{ gap: '12px' }}>
                    <div style={{ padding: '4px 8px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--border-default)' }}>
                        {!activeCoupon ? (
                            <form 
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    const code = e.target.couponCode.value.toUpperCase();
                                    if (!code) return;
                                    const found = (availableCoupons || []).find(c => c.code.toUpperCase() === code);
                                    if (found) {
                                        if (found.min_order_value && subtotal < found.min_order_value) {
                                            alert(`Order value must be at least ₹${found.min_order_value} to apply this coupon.`);
                                        } else if (found.usage_limit && Number(found.current_usage_count) >= found.usage_limit) {
                                            alert("This coupon has reached its maximum usage limit.");
                                        } else if (found.expiry_date && new Date(found.expiry_date) < new Date(new Date().setHours(0,0,0,0))) {
                                            alert("This coupon has expired.");
                                        } else {
                                            setActiveCoupon(found);
                                        }
                                    } else {
                                        alert("Invalid or expired coupon code.");
                                    }
                                }} 
                                style={{ display: 'flex', gap: '8px' }}
                            >
                                <input name="couponCode" type="text" placeholder="Got a Neural Promotion Code?" style={{ flex: 1, padding: '8px', background: 'transparent', border: 'none', color: 'white', outline: 'none', fontSize: '13px' }} />
                                <button type="submit" style={{ padding: '6px 12px', borderRadius: '8px', background: 'rgba(124, 58, 237, 0.2)', color: '#a78bfa', fontWeight: '800', fontSize: '12px', cursor: 'pointer', border: 'none' }}>Apply</button>
                            </form>
                        ) : (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px' }}>
                                <span style={{ color: '#10b981', fontSize: '13px', fontWeight: '800' }}>✓ {activeCoupon.code} Applied</span>
                                <button onClick={() => setActiveCoupon(null)} style={{ background: 'transparent', border: 'none', color: '#ef4444', fontSize: '12px', cursor: 'pointer', fontWeight: '800' }}>Remove</button>
                            </div>
                        )}
                    </div>

                    {/* Space reserved for bill details to be moved down */}
                    <div style={{ padding: '4px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--border-default)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '13px' }}>
                            <Users size={16} /> Split the Bill?
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <button onClick={() => setSplitCount(Math.max(1, splitCount - 1))} style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--bg-deep)', border: '1px solid var(--border-default)', color: 'var(--text-main)', cursor: 'pointer' }}>-</button>
                            <span style={{ fontWeight: '800', width: '12px', textAlign: 'center' }}>{splitCount}</span>
                            <button onClick={() => setSplitCount(Math.min(10, splitCount + 1))} style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--bg-deep)', border: '1px solid var(--border-default)', color: 'var(--text-main)', cursor: 'pointer' }}>+</button>
                        </div>
                    </div>

                    <div className="cart-final-total" style={{ cursor: 'pointer', padding: '8px 4px', borderRadius: '12px', transition: 'all 0.2s', borderBottom: showBillDetails ? '1px dashed var(--border-default)' : 'none', marginBottom: showBillDetails ? '8px' : '0' }} onClick={() => setShowBillDetails(!showBillDetails)}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-main)', userSelect: 'none' }}>
                                {splitCount > 1 ? `Grand Total (₹${splitAmount} x ${splitCount})` : 'Grand Total'}
                            </span>
                            {restaurantData?.is_round_off && <span style={{ fontSize: '10px', color: 'var(--success)', fontWeight: '700', marginTop: '2px' }}>Rounded Off</span>}
                        </div>
                        <strong style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            ₹{finalTotal}
                            {showBillDetails ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </strong>
                    </div>

                    {showBillDetails && (
                        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-muted)' }}>
                                <span>Item Total</span>
                                <span>₹{subtotal.toFixed(2)}</span>
                            </div>
                            {activeCoupon && getDiscountAmount() > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#10b981', fontWeight: '800' }}>
                                    <span>Discount ({activeCoupon.code})</span>
                                    <span>-₹{getDiscountAmount().toFixed(2)}</span>
                                </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-muted)' }}>
                                <span>Taxes (CGST {restaurantData?.cgst || 0}%)</span>
                                <span>₹{cgst.toFixed(2)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-muted)' }}>
                                <span>Taxes (SGST {restaurantData?.sgst || 0}%)</span>
                                <span>₹{sgst.toFixed(2)}</span>
                            </div>
                        </div>
                    )}
                    <button className="final-checkout-btn" onClick={() => {
                        completeOrderProcess();
                        setShowCartSummary(false);
                    }}>
                        Finalize & Book Order
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CartOverlay;
