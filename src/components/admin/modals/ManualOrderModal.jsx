import { Search, X, UtensilsCrossed } from 'lucide-react';

export default function ManualOrderModal({
  isOpen,
  onClose,
  isEditingOrder,
  setIsEditingOrder,
  manualOrderData,
  setManualOrderData,
  manualOrderSearch,
  setManualOrderSearch,
  manualOrderCategory,
  setManualOrderCategory,
  menuItems,
  categories,
  restaurantTables,
  addToManualOrder,
  updateManualQty,
  submitManualOrder
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{ zIndex: 10000 }}>
      <div className="modal-content glass-panel animate-slide-up manual-order-modal">
        {/* Left Side: Menu Search */}
        <div className="manual-order-left">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '24px', fontWeight: '900', margin: 0 }}>Select Items</h3>
              <div style={{ position: 'relative', flex: 0.8 }}>
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search menu items..."
                  value={manualOrderSearch}
                  onChange={(e) => setManualOrderSearch(e.target.value)}
                  className="manual-order-search"
                />
              </div>
            </div>

            {/* Category Pills */}
            <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '8px' }}>
              <button
                onClick={() => setManualOrderCategory('All')}
                className={`status-pill ${manualOrderCategory === 'All' ? 'active' : 'inactive'}`}
                style={{ padding: '8px 16px', borderRadius: '20px', fontSize: '12px', cursor: 'pointer', whiteSpace: 'nowrap' }}
              >
                All Items
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setManualOrderCategory(cat.name)}
                  className={`status-pill ${manualOrderCategory === cat.name ? 'active' : 'inactive'}`}
                  style={{ padding: '8px 16px', borderRadius: '20px', fontSize: '12px', cursor: 'pointer', whiteSpace: 'nowrap' }}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px', paddingRight: '8px' }}>
            {menuItems.filter(item => {
              const matchesSearch = item.name.toLowerCase().includes(manualOrderSearch.toLowerCase());
              const matchesCat = manualOrderCategory === 'All' || item.category === manualOrderCategory;
              return matchesSearch && matchesCat;
            }).map(item => {
              let discountedPrice = Number(item.price || 0);
              let hasDiscount = false;
              let discountBadge = '';
              let dVal = Number(item.discount_value || 0);
              let displayDVal = Number.isInteger(dVal) ? dVal : dVal.toFixed(2);

              if (item.discount_type === 'percent' && dVal > 0) {
                hasDiscount = true;
                discountedPrice = item.price - (item.price * (dVal / 100));
                discountBadge = `${displayDVal}% OFF`;
              } else if (item.discount_type === 'flat' && dVal > 0) {
                hasDiscount = true;
                discountedPrice = item.price - dVal;
                discountBadge = `₹${displayDVal} OFF`;
              }
              if (discountedPrice < 0) discountedPrice = 0;
              discountedPrice = Math.round(discountedPrice);

              return (
                <div
                  key={item.id}
                  onClick={() => addToManualOrder({ ...item, price: discountedPrice })}
                  className="manual-order-card"
                >
                  <div style={{ width: '100%', height: '100px', borderRadius: '12px', overflow: 'hidden', background: '#222' }}>
                    <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <strong style={{ fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {item.veg_type === 'veg' && (
                      <div style={{ width: '10px', height: '10px', border: '1px solid #22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '2px', flexShrink: 0 }}>
                        <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#22c55e' }}></div>
                      </div>
                    )}
                    {item.veg_type === 'nonveg' && (
                      <div style={{ width: '10px', height: '10px', border: '1px solid #ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '2px', flexShrink: 0 }}>
                        <div style={{ width: '0', height: '0', borderLeft: '2px solid transparent', borderRight: '2px solid transparent', borderBottom: '4px solid #ef4444' }}></div>
                      </div>
                    )}
                    {item.veg_type === 'egg' && (
                      <div style={{ width: '10px', height: '10px', border: '1px solid #eab308', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '2px', flexShrink: 0 }}>
                        <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#eab308' }}></div>
                      </div>
                    )}
                    {item.name}
                  </strong>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-main)' }}>₹{discountedPrice}</span>
                      {hasDiscount && (
                        <span style={{ fontSize: '11px', textDecoration: 'line-through', color: 'var(--text-muted)', fontWeight: '500' }}>₹{Math.round(item.price)}</span>
                      )}
                    </div>
                    {hasDiscount && (
                      <span style={{ fontSize: '10px', color: '#3b82f6', fontWeight: '800', letterSpacing: '0.5px' }}>{discountBadge}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Order Summary */}
        <div className="manual-order-right">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '24px', fontWeight: '900', margin: 0 }}>Order Summary</h3>
            <button
              onClick={() => {
                if (isEditingOrder) {
                  setIsEditingOrder(false);
                  setManualOrderData({ tableNumber: '1', items: [], customerName: '', customerPhone: '', total: 0 });
                }
                onClose();
              }}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={24} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '0.8fr 1.2fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)' }}>TABLE</label>
              <select
                value={manualOrderData.tableNumber}
                onChange={(e) => setManualOrderData({ ...manualOrderData, tableNumber: e.target.value })}
                className="manual-order-input"
              >
                {restaurantTables.map((t, idx) => (
                  <option key={idx} value={t.table_number || (idx + 1)}>
                    {t.name || t.table || `Table ${t.table_number || (idx + 1)}`}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)' }}>CUSTOMER NAME</label>
              <input
                type="text"
                placeholder="Name"
                value={manualOrderData.customerName}
                onChange={(e) => setManualOrderData({ ...manualOrderData, customerName: e.target.value })}
                className="manual-order-input"
              />
            </div>
            <div>
              <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)' }}>PHONE NUMBER</label>
              <input
                type="text"
                placeholder="+91..."
                value={manualOrderData.customerPhone}
                onChange={(e) => setManualOrderData({ ...manualOrderData, customerPhone: e.target.value })}
                className="manual-order-input"
              />
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {manualOrderData.items.map(item => {
              let hasDiscount = item.discount_value > 0 && item.discount_type && item.discount_type !== 'none';
              let dVal = Number(item.discount_value || 0);
              let displayDVal = Number.isInteger(dVal) ? dVal : dVal.toFixed(2);
              let discountBadgeText = item.discount_type === 'percent' ? `${displayDVal}% OFF` : `₹${displayDVal} OFF`;

              return (
                <div key={item.id} className="manual-order-item">
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '700', fontSize: '14px' }}>{item.name} {item.selectedVariant && <span style={{ opacity: 0.7, color: 'var(--warning)' }}>({item.selectedVariant.size})</span>} {item.selectedAddons && item.selectedAddons.length > 0 && <span style={{ opacity: 0.6, fontSize: '12px' }}>[+{item.selectedAddons.map(a => a.name).join(', ')}]</span>}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                      <div style={{ fontSize: '12px', color: 'var(--accent-primary)', fontWeight: '800' }}>₹{item.price}</div>
                      {hasDiscount && (
                        <span style={{ fontSize: '10px', color: '#3b82f6', fontWeight: '800', background: 'rgba(59, 130, 246, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                          {discountBadgeText}
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-primary)', padding: '4px 12px', borderRadius: '10px' }}>
                    <button onClick={() => updateManualQty(item.id, -1)} style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer', fontWeight: 'bold' }}>-</button>
                    <span style={{ fontWeight: '900', fontSize: '15px' }}>{item.qty}</span>
                    <button onClick={() => updateManualQty(item.id, 1)} style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer', fontWeight: 'bold' }}>+</button>
                  </div>
                </div>
              )
            })}
            {manualOrderData.items.length === 0 && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.3 }}>
                <UtensilsCrossed size={48} />
                <p style={{ fontWeight: '700' }}>Your basket is empty</p>
              </div>
            )}
          </div>

          <div style={{ borderTop: '2px solid var(--card-border)', paddingTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <span style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-muted)' }}>Grand Total</span>
              <span style={{ fontSize: '24px', fontWeight: '900', color: 'var(--success)' }}>₹{manualOrderData.total}</span>
            </div>
            <button
              onClick={submitManualOrder}
              className="btn-global-primary"
              
            >
              {isEditingOrder ? 'Update Order' : 'Confirm & Place Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
