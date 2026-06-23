import { RefreshCw, Edit2, Check, ChefHat } from 'lucide-react';

export default function KitchenSystemView({
  kitchenOrders,
  fetchData,
  isLoading,
  editingOrderId,
  setEditingOrderId,
  editFormData,
  setEditFormData,
  handleOrderUpdate,
  kitchenItemChecked,
  setKitchenItemChecked,
  updateOrderStatus
}) {
  return (
    <div className="view-container animate-slide-up view-container-deep">
      <div className="view-header-row mb-8">
        <div className="header-left">
          <div  className="ext-cls-b68c5feb">
            <h1 className="view-title ext-cls-c2ccc5b9" >Kitchen Display System</h1>
            <button
              onClick={fetchData}
              className="kitchen-btn-icon-soft"
              disabled={isLoading}
              title="Manual Refresh"
            >
              <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
            </button>
          </div>
          <p className="text-muted ext-cls-ff97204e" >Live order orchestration for culinary excellence.</p>
        </div>
        <div  className="ext-cls-bd132a27">
          <div className="status-pill active ext-cls-290b570e" >
            KITCHEN LIVE: {kitchenOrders.length} ACTIVE
          </div>
        </div>
      </div>

      <div  className="ext-cls-fe74b496">
        {['accepted', 'preparing'].map(columnStatus => (
          <div key={columnStatus} className="kitchen-column">
            <div  className="ext-cls-753948c1">
              <h3 className="kitchen-column-header" style={{ color: columnStatus === 'accepted' ? 'var(--warning)' : 'var(--accent-primary)' }}>
                <div className="kitchen-status-dot" style={{ background: columnStatus === 'accepted' ? 'var(--warning)' : 'var(--accent-primary)' }} />
                {columnStatus === 'accepted' ? 'TO PREPARE' : 'COOKING'}
              </h3>
              <span  className="ext-cls-5014c5f8">
                {kitchenOrders.filter(o => o.status === columnStatus).length}
              </span>
            </div>

            <div  className="scrollbar-hidden ext-cls-a03ccd5b">
              {kitchenOrders.filter(order => order.status === columnStatus).map((order, idx) => (
                <div key={idx} className="kitchen-order-card glass-panel animate-scale-in">
                  <div  className="ext-cls-91d58929">
                    <div>
                      <div  className="ext-cls-88c63709">
                        Table {order.tableNumber || order.table_number}
                      </div>
                      <h2  className="ext-cls-4f137d5f">Order #{order.id}</h2>
                      <div  className="ext-cls-120d0e09">
                        {editingOrderId === order.id ? (
                          <div  className="ext-cls-48fd353c">
                            <input
                              className="filter-input st-cls-bd50a668"
                              value={editFormData.name}
                              onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                              placeholder="Name"
                              
                            />
                            <input
                              className="filter-input st-cls-bd50a668"
                              value={editFormData.phone}
                              onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                              placeholder="Phone"
                              
                            />
                            <div  className="ext-cls-441e8d8e">
                              <button onClick={() => handleOrderUpdate(order.id)} className="st-cls-d9bea4a2">Save</button>
                              <button onClick={() => setEditingOrderId(null)} className="st-cls-75408e34">Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div  className="ext-cls-9fdd7fb0">
                              {order.customer_name || order.customerName || 'Guest'}
                              <button
                                onClick={() => {
                                  setEditingOrderId(order.id);
                                  setEditFormData({ name: order.customer_name || order.customerName || '', phone: order.customer_phone || order.customerPhone || '' });
                                }}
                                className="st-cls-3a5c7a2b"
                              >
                                <Edit2 size={12} />
                              </button>
                            </div>
                            <div  className="ext-cls-f29d563f">{order.customer_phone || order.customerPhone}</div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div  className="ext-cls-c513bbaf">
                    {(order.items || []).map((item, i) => {
                      const isChecked = kitchenItemChecked[`${order.id}-${i}`];
                      return (
                        <div key={i} onClick={() => { setKitchenItemChecked(prev => ({ ...prev, [`${order.id}-${i}`]: !prev[`${order.id}-${i}`] })) }} className={`kitchen-item-row ${isChecked ? 'checked' : ''}`} style={{ opacity: isChecked ? 0.4 : 1, textDecoration: isChecked ? 'line-through' : 'none', background: isChecked ? 'rgba(0,255,100,0.02)' : 'transparent' }}>
                          <div  className="ext-cls-31f021bc">
                            <div className="kitchen-item-qty" style={{ background: isChecked ? 'rgba(255,255,255,0.05)' : 'var(--bg-deep)', color: isChecked ? 'var(--text-muted)' : 'var(--accent-primary)' }}>
                              {isChecked ? <Check size={16} /> : `${item.qty || item.quantity}x`}
                            </div>
                            <span  className="ext-cls-1d480576">{item.name} {item.selectedVariant && <span  className="ext-cls-212b8eed">({item.selectedVariant.size})</span>} {item.selectedAddons && item.selectedAddons.length > 0 && <span  className="ext-cls-af91b662">[+{item.selectedAddons.map(a => a.name).join(', ')}]</span>}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {order.notes && (
                    <div className="kitchen-alert-box">
                      <span  className="ext-cls-b88446c9">COOKING INSTRUCTIONS:</span>
                      {order.notes}
                    </div>
                  )}

                  <div  className="ext-cls-ea859b14">
                    {order.status === 'accepted' ? (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'preparing')}
                        className="btn-global-primary-sm"
                      >
                        START PREPARING
                      </button>
                    ) : (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'out_for_delivery')}
                        className="btn-global-primary-sm"
                      >
                        MARK AS READY
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {kitchenOrders.filter(order => order.status === columnStatus).length === 0 && (
                <div  className="ext-cls-7b1fe41a">
                  <ChefHat size={40}  className="ext-cls-3b9659e9" />
                  <h3  className="ext-cls-922dd8af">Empty Queue</h3>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
