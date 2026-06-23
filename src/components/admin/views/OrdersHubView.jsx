import { RefreshCw, Plus, Calendar, Search, Phone, Users, Edit2, Edit, Printer } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../../../config';

export default function OrdersHubView({
  orders,
  selectedDate,
  setSelectedDate,
  tableSearch,
  setTableSearch,
  phoneSearch,
  setPhoneSearch,
  nameSearch,
  setNameSearch,
  safeGetISODate,
  restaurantTables,
  fetchData,
  isLoading,
  editingOrderId,
  setEditingOrderId,
  editFormData,
  setEditFormData,
  handleOrderUpdate,
  setShowManualOrderPopup,
  setManualOrderData,
  setIsEditingOrder,
  handlePrintBill,
  updateOrderStatus,
  loadingStates,
  setActionLoading,
  riders
}) {
  return (
    <div className="view-container animate-slide-up">
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 className="view-title">Orders Hub</h1>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div className="filter-stats" style={{ background: 'var(--bg-deep)', border: '1px solid var(--card-border)', padding: '6px 12px', borderRadius: '10px', fontSize: '13px', fontWeight: '700', color: 'var(--text-muted)' }}>
              Matches: <strong style={{ color: 'var(--text-main)' }}>{orders.filter(o => {
                const matchDate = safeGetISODate(o) === selectedDate;
                const matchTable = tableSearch ? (o.table_number || o.tableNumber || '').toString() === tableSearch.toString() : true;
                const matchPhone = phoneSearch ? (o.customer_phone || '').includes(phoneSearch) : true;
                const matchName = nameSearch ? (o.customer_name || '').toLowerCase().includes(nameSearch.toLowerCase()) : true;
                return matchDate && matchTable && matchPhone && matchName;
              }).length}</strong>
            </div>
            <button
              onClick={fetchData}
              className="btn-icon"
              disabled={isLoading}
              title="Manual Refresh"
              style={{
                background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)',
                padding: '8px', borderRadius: '10px', color: 'var(--text-muted)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
            </button>
            <button className="btn-primary" onClick={() => setShowManualOrderPopup(true)} style={{ padding: '8px 16px', borderRadius: '12px', background: 'linear-gradient(135deg, #10b981, #059669)', height: '34px', border: 'none', color: 'white', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: '800' }}>
              <Plus size={18} /> New Order
            </button>
          </div>
        </div>
      </div>
      <div className="orders-filter-bar " style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', margin: '24px 0' }}>
        <div className="filter-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={14} /> Filter Date</label>
          <input
            type="date"
            className="filter-input"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '10px', background: 'var(--bg-deep)', border: '1px solid var(--card-border)', color: 'var(--text-main)', fontSize: '13px' }}
          />
        </div>
        <div className="filter-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}><Search size={14} /> Table #</label>
          <select
            className="filter-input"
            value={tableSearch}
            onChange={(e) => setTableSearch(e.target.value)}
            style={{ width: '130px', padding: '8px 12px', borderRadius: '10px', background: 'var(--bg-deep)', border: '1px solid var(--card-border)', color: 'var(--text-main)', fontSize: '13px' }}
          >
            <option value="">All Tables</option>
            {restaurantTables.map((t, idx) => (
              <option key={idx} value={t.table_number || (idx + 1)}>
                {t.name || t.table || `Table ${t.table_number || (idx + 1)}`}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}><Phone size={14} /> Phone</label>
          <input
            type="text"
            placeholder="9876..."
            className="filter-input"
            value={phoneSearch}
            onChange={(e) => setPhoneSearch(e.target.value)}
            style={{ width: '120px', padding: '8px 12px', borderRadius: '10px', background: 'var(--bg-deep)', border: '1px solid var(--card-border)', color: 'var(--text-main)', fontSize: '13px' }}
          />
        </div>
        <div className="filter-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}><Users size={14} /> Name</label>
          <input
            type="text"
            placeholder="Customer Name..."
            className="filter-input"
            value={nameSearch}
            onChange={(e) => setNameSearch(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '10px', background: 'var(--bg-deep)', border: '1px solid var(--card-border)', color: 'var(--text-main)', fontSize: '13px' }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '24px', alignItems: 'start', overflowX: 'auto', paddingBottom: '20px' }}>
        {['pending', 'accepted', 'preparing', 'out_for_delivery', 'completed', 'cancelled'].map(columnStatus => (
          <div key={columnStatus} style={{ minWidth: '320px', width: '320px', background: 'var(--bg-deep)', border: '1px solid var(--card-border)', borderRadius: '24px', padding: '20px', minHeight: '600px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '2px solid var(--card-border)' }}>
              <h3 style={{ textTransform: 'uppercase', fontSize: '13px', fontWeight: '800', color: columnStatus === 'pending' ? 'var(--warning)' : columnStatus === 'completed' ? 'var(--success)' : columnStatus === 'cancelled' ? 'var(--error)' : 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: columnStatus === 'pending' ? 'var(--warning)' : columnStatus === 'completed' ? 'var(--success)' : columnStatus === 'cancelled' ? 'var(--error)' : 'var(--accent-primary)' }} />
                {columnStatus.replace(/_/g, ' ')}
              </h3>
              <span style={{ fontSize: '12px', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '10px', color: 'var(--text-dim)', fontWeight: '700' }}>
                {orders.filter(o => {
                  const matchStatus = o.status === columnStatus;
                  const matchDate = safeGetISODate(o) === selectedDate;
                  const matchTable = tableSearch ? (o.table_number || o.tableNumber || '').toString().toLowerCase().includes(tableSearch.toLowerCase()) : true;
                  const matchPhone = phoneSearch ? (o.customer_phone || '').includes(phoneSearch) : true;
                  return matchStatus && matchDate && matchTable && matchPhone;
                }).length}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', maxHeight: 'calc(100vh - 280px)' }} className="scrollbar-hidden">
              {orders.filter(o => {
                const matchStatus = o.status === columnStatus;
                const matchDate = safeGetISODate(o) === selectedDate;
                const matchTable = tableSearch ? (o.table_number || o.tableNumber || '').toString() === tableSearch.toString() : true;
                const matchPhone = phoneSearch ? (o.customer_phone || '').includes(phoneSearch) : true;
                const matchName = nameSearch ? (o.customer_name || '').toLowerCase().includes(nameSearch.toLowerCase()) : true;
                return matchStatus && matchDate && matchTable && matchPhone && matchName;
              }).map(order => (
                <div key={order.id} style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '16px', padding: '16px', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '13px', fontWeight: '800', background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '8px', color: 'var(--text-main)' }}>
                      Table {order.table_number || order.tableNumber}
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-dim)', border: '1px solid var(--card-border)', padding: '4px 8px', fontSize: '12px', borderRadius: '8px', fontWeight: '700' }}>#{order.id}</span>
                    </span>
                  </div>

                  {(order.customerName || order.customer_name || order.customerPhone || order.customer_phone) && (
                    <div style={{ fontSize: '12px', color: 'var(--text-dim)', display: 'flex', flexDirection: 'column', gap: '4px', padding: '6px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.02)', position: 'relative' }}>
                      {editingOrderId === order.id ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <input
                            style={{ width: '100%', padding: '4px 8px', borderRadius: '6px', background: 'var(--bg-deep)', border: '1px solid var(--card-border)', color: 'var(--text-main)', fontSize: '11px' }}
                            value={editFormData.name}
                            onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                            placeholder="Name"
                          />
                          <input
                            style={{ width: '100%', padding: '4px 8px', borderRadius: '6px', background: 'var(--bg-deep)', border: '1px solid var(--card-border)', color: 'var(--text-main)', fontSize: '11px' }}
                            value={editFormData.phone}
                            onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                            placeholder="Phone"
                          />
                          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                            <button onClick={() => handleOrderUpdate(order.id)} style={{ padding: '4px 8px', background: 'var(--success)', border: 'none', borderRadius: '4px', color: 'white', cursor: 'pointer', fontSize: '10px', fontWeight: '700' }}>Save</button>
                            <button onClick={() => setEditingOrderId(null)} style={{ padding: '4px 8px', background: 'var(--danger)', border: 'none', borderRadius: '4px', color: 'white', cursor: 'pointer', fontSize: '10px', fontWeight: '700' }}>Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setEditingOrderId(order.id);
                              setEditFormData({
                                name: order.customerName || order.customer_name || '',
                                phone: order.customerPhone || order.customer_phone || ''
                              });
                            }}
                            style={{ position: 'absolute', top: '8px', right: '8px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', opacity: 0.5 }}
                          >
                            <Edit2 size={11} />
                          </button>
                          {(order.customerName || order.customer_name) && <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ color: 'var(--text-muted)' }}>Customer:</span> <strong style={{ color: 'var(--text-main)' }}>{order.customerName || order.customer_name}</strong>
                            {order.customerSeat && <span style={{ marginLeft: '4px', background: 'rgba(124, 58, 237, 0.2)', padding: '2px 6px', borderRadius: '4px', color: 'var(--accent-primary)', fontSize: '11px', fontWeight: '800' }}>🪑 {order.customerSeat}</span>}
                          </div>}
                          {!order.customerName && !order.customer_name && order.customerSeat && <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ color: 'var(--text-muted)' }}>Seat:</span> <strong style={{ background: 'rgba(124, 58, 237, 0.2)', padding: '2px 6px', borderRadius: '4px', color: 'var(--accent-primary)', fontSize: '11px', fontWeight: '800' }}>🪑 {order.customerSeat}</strong></div>}
                          {(order.customerPhone || order.customer_phone) && <div><span style={{ color: 'var(--text-muted)' }}>Phone:</span> <strong style={{ color: 'var(--text-main)' }}>{order.customerPhone || order.customer_phone}</strong></div>}
                        </>
                      )}
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--card-border)', borderBottom: '1px solid var(--card-border)', padding: '12px 0' }}>
                    {(order.items || []).map((item, idx) => {
                      let hasDiscount = item.discount_value > 0 && item.discount_type && item.discount_type !== 'none';
                      let dVal = Number(item.discount_value || 0);
                      let displayDVal = Number.isInteger(dVal) ? dVal : dVal.toFixed(2);
                      let discountBadgeText = item.discount_type === 'percent' ? `${displayDVal}% OFF` : `₹${displayDVal} OFF`;

                      return (
                        <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', fontSize: '13px' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', flex: 1 }}>
                              <span style={{ fontWeight: '800', color: 'var(--accent-primary)', background: 'rgba(124, 58, 237, 0.1)', padding: '2px 6px', borderRadius: '4px', marginTop: '2px' }}>{item.qty || 1}</span>
                              <span style={{ color: 'var(--text-main)', fontWeight: '600', lineHeight: '1.4' }}>
                                {item.name}
                                {item.selectedVariant && <span style={{ opacity: 0.7, fontSize: '11px', color: 'var(--warning)', marginLeft: '4px' }}>({item.selectedVariant.size})</span>}
                                {item.selectedAddons && item.selectedAddons.length > 0 && <span style={{ opacity: 0.6, fontSize: '10px', marginLeft: '4px' }}>[+{item.selectedAddons.map(a => a.name).join(', ')}]</span>}
                              </span>
                            </div>
                            <span style={{ color: 'var(--text-dim)', fontWeight: '700', marginTop: '2px' }}>₹{(item.price || 0) * (item.qty || 1)}</span>
                          </div>
                          {hasDiscount && (
                            <div style={{ paddingLeft: '32px', fontSize: '10px' }}>
                              <span style={{ color: '#3b82f6', fontWeight: '800', background: 'rgba(59, 130, 246, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                                {discountBadgeText}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {order.notes && (
                      <div style={{ marginTop: '4px', padding: '8px 12px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', borderLeft: '4px solid #ef4444', fontSize: '12px', color: '#fca5a5' }}>
                        <strong style={{ color: '#ef4444' }}>Notes:</strong> {order.notes}
                      </div>
                    )}
                    <button
                      onClick={() => {
                        setIsEditingOrder(true);
                        const initialItems = [...(order.items || [])];
                        const initialTotal = initialItems.reduce((acc, curr) => {
                          const price = parseFloat(curr.price || curr.unit_price || 0);
                          const qty = parseInt(curr.qty || curr.quantity || 1);
                          return acc + (price * qty);
                        }, 0);

                        setManualOrderData({
                          id: order.id,
                          tableNumber: (order.table_number || order.tableNumber || '1').toString(),
                          customerName: order.customerName || order.customer_name || '',
                          customerPhone: order.customerPhone || order.customer_phone || '',
                          items: initialItems,
                          total: initialTotal
                        });
                        setShowManualOrderPopup(true);
                      }}
                      style={{ marginTop: '8px', background: 'rgba(124, 58, 237, 0.05)', border: '1px dashed var(--accent-primary)', color: 'var(--accent-primary)', borderRadius: '8px', padding: '6px', fontSize: '11px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                    >
                      <Edit size={12} /> Edit Items
                    </button>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      {order.applied_coupon && order.discount_amount > 0 && (
                        <span style={{ fontSize: '11px', color: 'var(--success)', fontWeight: '800' }}>
                          {order.applied_coupon} (-₹{order.discount_amount})
                        </span>
                      )}
                      <span style={{ fontSize: '14px', color: 'var(--text-main)', fontWeight: '800' }}>Total: ₹{order.total}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button
                        onClick={() => handlePrintBill(order)}
                        className="btn-global-icon-sm"
                        title="Print Bill"
                      >
                        <Printer size={16} />
                      </button>

                      {order.status === 'pending' && (
                        <button onClick={() => updateOrderStatus(order.id, 'accepted')} className="btn-global-primary-sm"  disabled={loadingStates[order.id]}>
                          {loadingStates[order.id] ? <div className="spinner-small" /> : 'Accept'}
                        </button>
                      )}
                      {order.status === 'accepted' && (
                        <button onClick={() => updateOrderStatus(order.id, 'preparing')} className="btn-global-primary-sm"  disabled={loadingStates[order.id]}>
                          {loadingStates[order.id] ? <div className="spinner-small" /> : 'Start Preparing'}
                        </button>
                      )}
                      {order.status === 'preparing' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <select
                            className="rider-select"
                            disabled={loadingStates[order.id]}
                            onChange={async (e) => {
                              const rId = e.target.value;
                              if (!rId) return;
                              setActionLoading(order.id, true);
                              try {
                                await axios.post(`${API_URL}/api/mgmt/orders/assign-rider`, { order_id: order.id, rider_id: rId });
                                fetchData();
                              } catch (e) { alert("Assignment failed"); }
                              finally { setActionLoading(order.id, false); }
                            }}
                            style={{ padding: '6px 10px', borderRadius: '8px', background: 'var(--bg-deep)', color: 'var(--text-main)', border: '1px solid var(--card-border)', fontSize: '11px', outline: 'none' }}
                          >
                            <option value="">Assign Rider</option>
                            {riders.filter(r => r.status !== 'offline').map(r => (
                              <option key={r.id} value={r.id}>{r.name} ({r.status})</option>
                            ))}
                          </select>
                          <button onClick={() => updateOrderStatus(order.id, 'out_for_delivery')} className="btn-global-primary-sm"  disabled={loadingStates[order.id]}>
                            {loadingStates[order.id] ? <div className="spinner-small" /> : 'Dispatch'}
                          </button>
                        </div>
                      )}
                      {order.status === 'out_for_delivery' && (
                        <button onClick={() => updateOrderStatus(order.id, 'completed')} className="btn-global-primary-sm"  disabled={loadingStates[order.id]}>
                          {loadingStates[order.id] ? <div className="spinner-small" /> : 'Mark Delivered'}
                        </button>
                      )}
                      {order.status !== 'completed' && order.status !== 'cancelled' && (
                        <button onClick={() => updateOrderStatus(order.id, 'cancelled')} className="btn-global-danger-sm" disabled={loadingStates[order.id]}>
                          {loadingStates[order.id] ? <div className="spinner-small" /> : 'Cancel'}
                        </button>
                      )}
                    </div>
                  </div>
                  {(order.customerPhone || order.customer_phone) && (
                    <a href={`tel:${order.customerPhone || order.customer_phone}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', fontSize: '12px', fontWeight: '700', marginTop: '4px' }}>
                      <Phone size={14} /> Call Customer
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
