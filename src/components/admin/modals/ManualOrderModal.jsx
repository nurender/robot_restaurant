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
    <div className="modal-overlay ext-cls-e0b4af75" >
      <div className="modal-content glass-panel animate-slide-up manual-order-modal">
        {/* Left Side: Menu Search */}
        <div className="manual-order-left">
          <div  className="ext-cls-73683d33">
            <div  className="ext-cls-1bdb758b">
              <h3  className="ext-cls-313b8eae">Select Items</h3>
              <div  className="ext-cls-822372e8">
                <Search size={18}  className="ext-cls-7fcf830c" />
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
            <div  className="ext-cls-ad4fac02">
              <button
                onClick={() => setManualOrderCategory('All')}
                className="status-pill ${manualOrderCategory === 'All' ? 'active' : 'inactive'} st-cls-2a1d4313"
                
              >
                All Items
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setManualOrderCategory(cat.name)}
                  className="status-pill ${manualOrderCategory === cat.name ? 'active' : 'inactive'} st-cls-2a1d4313"
                  
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div  className="ext-cls-5e828653">
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
                  <div  className="ext-cls-944ef08c">
                    <img src={item.image_url} alt={item.name}  className="ext-cls-80fb12aa" />
                  </div>
                  <strong  className="ext-cls-be00bd65">
                    {item.veg_type === 'veg' && (
                      <div  className="ext-cls-2dee9030">
                        <div  className="ext-cls-bbc11080"></div>
                      </div>
                    )}
                    {item.veg_type === 'nonveg' && (
                      <div  className="ext-cls-a6504993">
                        <div  className="ext-cls-456a33ee"></div>
                      </div>
                    )}
                    {item.veg_type === 'egg' && (
                      <div  className="ext-cls-744f3000">
                        <div  className="ext-cls-05db53a8"></div>
                      </div>
                    )}
                    {item.name}
                  </strong>
                  <div  className="ext-cls-e59acaf8">
                    <div  className="ext-cls-cd210fb4">
                      <span  className="ext-cls-44977362">₹{discountedPrice}</span>
                      {hasDiscount && (
                        <span  className="ext-cls-e0735ae4">₹{Math.round(item.price)}</span>
                      )}
                    </div>
                    {hasDiscount && (
                      <span  className="ext-cls-80ecf3a5">{discountBadge}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Order Summary */}
        <div className="manual-order-right">
          <div  className="ext-cls-1bdb758b">
            <h3  className="ext-cls-313b8eae">Order Summary</h3>
            <button
              onClick={() => {
                if (isEditingOrder) {
                  setIsEditingOrder(false);
                  setManualOrderData({ tableNumber: '1', items: [], customerName: '', customerPhone: '', total: 0 });
                }
                onClose();
              }}
              className="st-cls-411ef6fd"
            >
              <X size={24} />
            </button>
          </div>

          <div  className="ext-cls-23458d97">
            <div>
              <label  className="ext-cls-9ceb2f47">TABLE</label>
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
              <label  className="ext-cls-9ceb2f47">CUSTOMER NAME</label>
              <input
                type="text"
                placeholder="Name"
                value={manualOrderData.customerName}
                onChange={(e) => setManualOrderData({ ...manualOrderData, customerName: e.target.value })}
                className="manual-order-input"
              />
            </div>
            <div>
              <label  className="ext-cls-9ceb2f47">PHONE NUMBER</label>
              <input
                type="text"
                placeholder="+91..."
                value={manualOrderData.customerPhone}
                onChange={(e) => setManualOrderData({ ...manualOrderData, customerPhone: e.target.value })}
                className="manual-order-input"
              />
            </div>
          </div>

          <div  className="ext-cls-a1500451">
            {manualOrderData.items.map(item => {
              let hasDiscount = item.discount_value > 0 && item.discount_type && item.discount_type !== 'none';
              let dVal = Number(item.discount_value || 0);
              let displayDVal = Number.isInteger(dVal) ? dVal : dVal.toFixed(2);
              let discountBadgeText = item.discount_type === 'percent' ? `${displayDVal}% OFF` : `₹${displayDVal} OFF`;

              return (
                <div key={item.id} className="manual-order-item">
                  <div  className="ext-cls-04a898f1">
                    <div  className="ext-cls-9f42a204">{item.name} {item.selectedVariant && <span  className="ext-cls-8a5d9ead">({item.selectedVariant.size})</span>} {item.selectedAddons && item.selectedAddons.length > 0 && <span  className="ext-cls-f8826bb7">[+{item.selectedAddons.map(a => a.name).join(', ')}]</span>}</div>
                    <div  className="ext-cls-371aafc7">
                      <div  className="ext-cls-76ed6512">₹{item.price}</div>
                      {hasDiscount && (
                        <span  className="ext-cls-e0c019b0">
                          {discountBadgeText}
                        </span>
                      )}
                    </div>
                  </div>
                  <div  className="ext-cls-8f2b6101">
                    <button onClick={() => updateManualQty(item.id, -1)} className="st-cls-38e5fe4f">-</button>
                    <span  className="ext-cls-03d68524">{item.qty}</span>
                    <button onClick={() => updateManualQty(item.id, 1)} className="st-cls-38e5fe4f">+</button>
                  </div>
                </div>
              )
            })}
            {manualOrderData.items.length === 0 && (
              <div  className="ext-cls-d91f80f5">
                <UtensilsCrossed size={48} />
                <p  className="ext-cls-d71cfe4a">Your basket is empty</p>
              </div>
            )}
          </div>

          <div  className="ext-cls-91f0bbfd">
            <div  className="ext-cls-84d72deb">
              <span  className="ext-cls-4dbf288f">Grand Total</span>
              <span  className="ext-cls-ea846f22">₹{manualOrderData.total}</span>
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
