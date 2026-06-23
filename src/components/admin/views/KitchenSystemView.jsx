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
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <h1 className="view-title" style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>Kitchen Display System</h1>
            <button
              onClick={fetchData}
              className="kitchen-btn-icon-soft"
              disabled={isLoading}
              title="Manual Refresh"
            >
              <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
            </button>
          </div>
          <p className="text-muted" style={{ marginTop: '8px', fontSize: '15px' }}>Live order orchestration for culinary excellence.</p>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div className="status-pill active" style={{ padding: '8px 16px', fontSize: '12px' }}>
            KITCHEN LIVE: {kitchenOrders.length} ACTIVE
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '24px', alignItems: 'start', marginTop: '24px', overflowX: 'auto', paddingBottom: '20px' }}>
        {['accepted', 'preparing'].map(columnStatus => (
          <div key={columnStatus} className="kitchen-column">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '2px solid var(--card-border)' }}>
              <h3 style={{ textTransform: 'uppercase', fontSize: '13px', fontWeight: '800', color: columnStatus === 'accepted' ? 'var(--warning)' : 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: columnStatus === 'accepted' ? 'var(--warning)' : 'var(--accent-primary)' }} />
                {columnStatus === 'accepted' ? 'TO PREPARE' : 'COOKING'}
              </h3>
              <span style={{ fontSize: '12px', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '10px', color: 'var(--text-dim)', fontWeight: '700' }}>
                {kitchenOrders.filter(o => o.status === columnStatus).length}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', overflowY: 'auto', maxHeight: 'calc(100vh - 280px)' }} className="scrollbar-hidden">
              {kitchenOrders.filter(order => order.status === columnStatus).map((order, idx) => (
                <div key={idx} className="kitchen-order-card glass-panel animate-scale-in">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        Table {order.tableNumber || order.table_number}
                      </div>
                      <h2 style={{ fontSize: '24px', fontWeight: '900', marginTop: '4px' }}>Order #{order.id}</h2>
                      <div style={{ fontSize: '14px', fontWeight: '700', position: 'relative' }}>
                        {editingOrderId === order.id ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <input
                              className="filter-input"
                              value={editFormData.name}
                              onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                              placeholder="Name"
                              style={{ padding: '4px 8px', fontSize: '12px' }}
                            />
                            <input
                              className="filter-input"
                              value={editFormData.phone}
                              onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                              placeholder="Phone"
                              style={{ padding: '4px 8px', fontSize: '12px' }}
                            />
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button onClick={() => handleOrderUpdate(order.id)} style={{ padding: '4px 8px', background: 'var(--success)', border: 'none', borderRadius: '4px', color: 'white', cursor: 'pointer', fontSize: '11px' }}>Save</button>
                              <button onClick={() => setEditingOrderId(null)} style={{ padding: '4px 8px', background: 'var(--danger)', border: 'none', borderRadius: '4px', color: 'white', cursor: 'pointer', fontSize: '11px' }}>Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {order.customer_name || order.customerName || 'Guest'}
                              <button
                                onClick={() => {
                                  setEditingOrderId(order.id);
                                  setEditFormData({ name: order.customer_name || order.customerName || '', phone: order.customer_phone || order.customerPhone || '' });
                                }}
                                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
                              >
                                <Edit2 size={12} />
                              </button>
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '500' }}>{order.customer_phone || order.customerPhone}</div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid var(--card-border)' }}>
                    {(order.items || []).map((item, i) => {
                      const isChecked = kitchenItemChecked[`${order.id}-${i}`];
                      return (
                        <div key={i} onClick={() => { setKitchenItemChecked(prev => ({ ...prev, [`${order.id}-${i}`]: !prev[`${order.id}-${i}`] })) }} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: i === (order.items || []).length - 1 ? 'none' : '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', transition: 'all 0.2s', opacity: isChecked ? 0.4 : 1, textDecoration: isChecked ? 'line-through' : 'none', background: isChecked ? 'rgba(0,255,100,0.02)' : 'transparent', borderRadius: '8px', margin: '2px 0', padding: '10px' }}>
                          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <div style={{ width: '32px', height: '32px', background: isChecked ? 'rgba(255,255,255,0.05)' : 'var(--bg-deep)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', color: isChecked ? 'var(--text-muted)' : 'var(--accent-primary)', fontSize: '14px' }}>
                              {isChecked ? <Check size={16} /> : `${item.qty || item.quantity}x`}
                            </div>
                            <span style={{ fontSize: '16px', fontWeight: '700' }}>{item.name} {item.selectedVariant && <span style={{ fontSize: '13px', opacity: 0.8, color: 'var(--warning)' }}>({item.selectedVariant.size})</span>} {item.selectedAddons && item.selectedAddons.length > 0 && <span style={{ fontSize: '12px', opacity: 0.6 }}>[+{item.selectedAddons.map(a => a.name).join(', ')}]</span>}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {order.notes && (
                    <div className="kitchen-alert-box">
                      <span style={{ fontWeight: '800', color: '#f59e0b', marginRight: '6px' }}>COOKING INSTRUCTIONS:</span>
                      {order.notes}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '12px' }}>
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
                <div style={{ padding: '60px', textAlign: 'center', opacity: 0.3 }}>
                  <ChefHat size={40} style={{ margin: '0 auto 10px' }} />
                  <h3 style={{ fontSize: '16px', fontWeight: '800' }}>Empty Queue</h3>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
