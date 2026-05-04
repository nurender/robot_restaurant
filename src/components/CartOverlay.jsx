import React from 'react';
import { ChefHat, Minus, Plus } from 'lucide-react';

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
    completeOrderProcess
}) => {
    const { cgst, sgst } = getCartTax();
    const subtotal = getCartSubtotal();
    return (
        <div className="cart-summary-overlay animate-fade-in" onClick={() => setShowCartSummary(false)}>
            <div className="cart-summary-modal slide-up" onClick={e => e.stopPropagation()}>
                <div className="cart-summary-header">
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <h3>{textLanguage === 'en' ? 'Review Your Order' : 'आपका आर्डर'}</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00e676', boxShadow: '0 0 10px #00e676' }}></div>
                            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>Neural Selection</span>
                        </div>
                    </div>
                    <button className="close-cart-btn" onClick={() => setShowCartSummary(false)}>×</button>
                </div>

                <div className="cart-summary-items custom-scrollbar">
                    {currentCart.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.3)' }}>
                            <ChefHat size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                            <p>Your cart is empty</p>
                        </div>
                    ) : (
                        currentCart.map((item) => (
                            <div key={item.id} className="cart-summary-item">
                                <div className="cart-item-photo" onClick={() => item.image_url && setZoomedImage(getMediaUrl(item.image_url))}>
                                    {item.image_url ? (
                                        <img src={getMediaUrl(item.image_url)} alt={item.name} />
                                    ) : (
                                        <div className="cart-item-placeholder" style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.05)' }}>
                                            <ChefHat size={24} color="rgba(255,255,255,0.2)" />
                                        </div>
                                    )}
                                </div>
                                <div className="cart-item-info">
                                    <span className="cart-item-name">{item.name}</span>
                                    <span className="cart-item-price">₹{item.price} per unit</span>
                                </div>
                                <div className="cart-item-actions">
                                    <div className="qty-controls-premium">
                                        <button onClick={() => handleManualCartUpdate(item, -1)}><Minus size={14} /></button>
                                        <span className="qty-val">{item.qty}</span>
                                        <button onClick={() => handleManualCartUpdate(item, 1)}><Plus size={14} /></button>
                                    </div>
                                    <span className="cart-item-subtotal">₹{item.price * item.qty}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="cart-summary-footer" style={{ gap: '12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>
                            <span>Subtotal</span>
                            <span>₹{subtotal.toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>
                            <span>CGST ({restaurantData?.cgst || 0}%)</span>
                            <span>₹{cgst.toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>
                            <span>SGST ({restaurantData?.sgst || 0}%)</span>
                            <span>₹{sgst.toFixed(2)}</span>
                        </div>
                    </div>
                    <div className="cart-final-total">
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span>{textLanguage === 'en' ? 'Total Amount' : 'कुल राशि'}</span>
                            {restaurantData?.is_round_off && <span style={{ fontSize: '10px', color: 'var(--success)', fontWeight: '700' }}>Rounded Off</span>}
                        </div>
                        <strong>₹{getCartTotal()}</strong>
                    </div>
                    <button className="final-checkout-btn" onClick={() => {
                        completeOrderProcess();
                        setShowCartSummary(false);
                    }}>
                        {textLanguage === 'en' ? 'Finalize & Book Order' : 'आर्डर बुक करें'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CartOverlay;
