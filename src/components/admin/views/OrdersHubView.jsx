import apiService from '../../../services/apiService';
import toast from 'react-hot-toast';
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
  const handleAssignRider = async (orderId, riderId) => {
    if (!riderId) return;
    setActionLoading(orderId, true);
    try {
      await apiService.assignRider(orderId, riderId);
      fetchData();
    } catch (err) {
      toast.error("Assignment failed");
    } finally {
      setActionLoading(orderId, false);
    }
  };
  return <div className="view-container animate-slide-up">
      <div>
        <div className="ext-cls-9b34172b">
          <div>
            <h1 className="view-title">Orders Hub</h1>
          </div>
          <div className="ext-cls-9b34172b">
            <div className="filter-stats ext-cls-80f7a9d6">
              Matches: <strong className="ext-cls-dfa9aad7">{orders.filter(o => {
                const matchDate = safeGetISODate(o) === selectedDate;
                const matchTable = tableSearch ? (o.table_number || o.tableNumber || '').toString() === tableSearch.toString() : true;
                const matchPhone = phoneSearch ? (o.customer_phone || '').includes(phoneSearch) : true;
                const matchName = nameSearch ? (o.customer_name || '').toLowerCase().includes(nameSearch.toLowerCase()) : true;
                return matchDate && matchTable && matchPhone && matchName;
              }).length}</strong>
            </div>
            <button onClick={fetchData} className="btn-icon ext-cls-875dc67d" disabled={isLoading} title="Manual Refresh">
              <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
            </button>
            <button className="btn-primary st-cls-58e71f89" onClick={() => setShowManualOrderPopup(true)}>
              <Plus size={18} /> New Order
            </button>
          </div>
        </div>
      </div>
      <div className="orders-filter-bar  ext-cls-51907fc0">
        <div className="filter-group ext-cls-290ff1ad">
          <label className="ext-cls-8540da69"><Calendar size={14} /> Filter Date</label>
          <input type="date" className="filter-input st-cls-5ce7a7e8" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
        </div>
        <div className="filter-group ext-cls-290ff1ad">
          <label className="ext-cls-8540da69"><Search size={14} /> Table #</label>
          <select className="filter-input st-cls-e88547a5" value={tableSearch} onChange={e => setTableSearch(e.target.value)}>
            <option value="">All Tables</option>
            {restaurantTables.map((t, idx) => <option key={idx} value={t.table_number || idx + 1}>
                {t.name || t.table || `Table ${t.table_number || idx + 1}`}
              </option>)}
          </select>
        </div>
        <div className="filter-group ext-cls-290ff1ad">
          <label className="ext-cls-8540da69"><Phone size={14} /> Phone</label>
          <input type="text" placeholder="9876..." className="filter-input st-cls-766b101b" value={phoneSearch} onChange={e => setPhoneSearch(e.target.value)} />
        </div>
        <div className="filter-group ext-cls-290ff1ad">
          <label className="ext-cls-8540da69"><Users size={14} /> Name</label>
          <input type="text" placeholder="Customer Name..." className="filter-input st-cls-5ce7a7e8" value={nameSearch} onChange={e => setNameSearch(e.target.value)} />
        </div>
      </div>

      <div className="ext-cls-438074a2">
        {['pending', 'accepted', 'preparing', 'out_for_delivery', 'completed', 'cancelled'].map(columnStatus => <div key={columnStatus} className="ext-cls-d698504b">
            <div className="ex-style-b101ba">
              <h3 className="orders-hub-column-header" style={{
            color: columnStatus === 'pending' ? 'var(--warning)' : columnStatus === 'completed' ? 'var(--success)' : columnStatus === 'cancelled' ? 'var(--error)' : 'var(--accent-primary)'
          }}>
                <div className="orders-hub-status-dot" style={{
              background: columnStatus === 'pending' ? 'var(--warning)' : columnStatus === 'completed' ? 'var(--success)' : columnStatus === 'cancelled' ? 'var(--error)' : 'var(--accent-primary)'
            }} />
                {columnStatus.replace(/_/g, ' ')}
              </h3>
              <span className="ext-cls-5014c5f8">
                {orders.filter(o => {
              const matchStatus = o.status === columnStatus;
              const matchDate = safeGetISODate(o) === selectedDate;
              const matchTable = tableSearch ? (o.table_number || o.tableNumber || '').toString().toLowerCase().includes(tableSearch.toLowerCase()) : true;
              const matchPhone = phoneSearch ? (o.customer_phone || '').includes(phoneSearch) : true;
              return matchStatus && matchDate && matchTable && matchPhone;
            }).length}
              </span>
            </div>

            <div className="scrollbar-hidden ext-cls-5e00ecff">
              {orders.filter(o => {
            const matchStatus = o.status === columnStatus;
            const matchDate = safeGetISODate(o) === selectedDate;
            const matchTable = tableSearch ? (o.table_number || o.tableNumber || '').toString() === tableSearch.toString() : true;
            const matchPhone = phoneSearch ? (o.customer_phone || '').includes(phoneSearch) : true;
            const matchName = nameSearch ? (o.customer_name || '').toLowerCase().includes(nameSearch.toLowerCase()) : true;
            return matchStatus && matchDate && matchTable && matchPhone && matchName;
          }).map(order => <div key={order.id} className="ext-cls-27ab32b9">
                  <div className="ext-cls-1bdb758b">
                    <div className="ext-cls-01cf5469">
                      Table {order.table_number || order.tableNumber}
                    </div>
                    <span className="ext-cls-df0b0965">
                      <span className="ext-cls-887cbc20">#{order.id}</span>
                    </span>
                  </div>

                  {(order.customerName || order.customer_name || order.customerPhone || order.customer_phone) && <div className="ext-cls-eba3a085">
                      {editingOrderId === order.id ? <div className="ext-cls-290ff1ad">
                          <input className="ext-cls-11be9d5b" value={editFormData.name} onChange={e => setEditFormData({
                  ...editFormData,
                  name: e.target.value
                })} placeholder="Name" />
                          <input className="ext-cls-11be9d5b" value={editFormData.phone} onChange={e => setEditFormData({
                  ...editFormData,
                  phone: e.target.value
                })} placeholder="Phone" />
                          <div className="ext-cls-3c2e4bad">
                            <button onClick={() => handleOrderUpdate(order.id)} className="st-cls-1a343fb9">Save</button>
                            <button onClick={() => setEditingOrderId(null)} className="st-cls-835f8d89">Cancel</button>
                          </div>
                        </div> : <>
                          <button onClick={() => {
                  setEditingOrderId(order.id);
                  setEditFormData({
                    name: order.customerName || order.customer_name || '',
                    phone: order.customerPhone || order.customer_phone || ''
                  });
                }} className="st-cls-67ec94c7">
                            <Edit2 size={11} />
                          </button>
                          {(order.customerName || order.customer_name) && <div className="ext-cls-cd210fb4"><span className="ext-cls-d77dc274">Customer:</span> <strong className="ext-cls-dfa9aad7">{order.customerName || order.customer_name}</strong>
                            {order.customerSeat && <span className="ext-cls-745c913a">🪑 {order.customerSeat}</span>}
                          </div>}
                          {!order.customerName && !order.customer_name && order.customerSeat && <div className="ext-cls-cd210fb4"><span className="ext-cls-d77dc274">Seat:</span> <strong className="ext-cls-be7e70ee">🪑 {order.customerSeat}</strong></div>}
                          {(order.customerPhone || order.customer_phone) && <div><span className="ext-cls-d77dc274">Phone:</span> <strong className="ext-cls-dfa9aad7">{order.customerPhone || order.customer_phone}</strong></div>}
                        </>}
                    </div>}

                  <div className="ext-cls-ae9ad221">
                    {(order.items || []).map((item, idx) => {
                let hasDiscount = item.discount_value > 0 && item.discount_type && item.discount_type !== 'none';
                let dVal = Number(item.discount_value || 0);
                let displayDVal = Number.isInteger(dVal) ? dVal : dVal.toFixed(2);
                let discountBadgeText = item.discount_type === 'percent' ? `${displayDVal}% OFF` : `₹${displayDVal} OFF`;
                return <div key={idx} className="ext-cls-b7ba349f">
                          <div className="ext-cls-aa73a98b">
                            <div className="ext-cls-a65acd87">
                              <span className="ext-cls-18ce1f44">{item.qty || 1}</span>
                              <span className="ext-cls-86d05979">
                                {item.name}
                                {item.selectedVariant && <span className="ext-cls-f19b7dea">({item.selectedVariant.size})</span>}
                                {item.selectedAddons && item.selectedAddons.length > 0 && <span className="ext-cls-e3917211">[+{item.selectedAddons.map(a => a.name).join(', ')}]</span>}
                              </span>
                            </div>
                            <span className="ext-cls-9aaba2e0">₹{(item.price || 0) * (item.qty || 1)}</span>
                          </div>
                          {hasDiscount && <div className="ext-cls-ff5efbc4">
                              <span className="ext-cls-1c369535">
                                {discountBadgeText}
                              </span>
                            </div>}
                        </div>;
              })}
                    {order.notes && <div className="ext-cls-8204d57c">
                        <strong className="ext-cls-ec836744">Notes:</strong> {order.notes}
                      </div>}
                    <button onClick={() => {
                setIsEditingOrder(true);
                const initialItems = [...(order.items || [])];
                const initialTotal = initialItems.reduce((acc, curr) => {
                  const price = parseFloat(curr.price || curr.unit_price || 0);
                  const qty = parseInt(curr.qty || curr.quantity || 1);
                  return acc + price * qty;
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
              }} className="st-cls-b0f3f10d">
                      <Edit size={12} /> Edit Items
                    </button>
                  </div>

                  <div className="ext-cls-12fe41b4">
                    <div className="ext-cls-1c9ad180">
                      {order.applied_coupon && order.discount_amount > 0 && <span className="ext-cls-f5e1b95d">
                          {order.applied_coupon} (-₹{order.discount_amount})
                        </span>}
                      <span className="ext-cls-7b1935a4">Total: ₹{order.total}</span>
                    </div>
                    <div className="ext-cls-73a2bc67">
                      <button onClick={() => handlePrintBill(order)} className="btn-global-icon-sm" title="Print Bill">
                        <Printer size={16} />
                      </button>

                      {order.status === 'pending' && <button onClick={() => updateOrderStatus(order.id, 'accepted')} className="btn-global-primary-sm" disabled={loadingStates[order.id]}>
                          {loadingStates[order.id] ? <div className="spinner-small" /> : 'Accept'}
                        </button>}
                      {order.status === 'accepted' && <button onClick={() => updateOrderStatus(order.id, 'preparing')} className="btn-global-primary-sm" disabled={loadingStates[order.id]}>
                          {loadingStates[order.id] ? <div className="spinner-small" /> : 'Start Preparing'}
                        </button>}
                      {order.status === 'preparing' && <div className="ext-cls-290ff1ad">
                          <select className="rider-select st-cls-c25152fd" disabled={loadingStates[order.id]} onChange={e => handleAssignRider(order.id, e.target.value)}>
                            <option value="">Assign Rider</option>
                            {riders.filter(r => r.status !== 'offline').map(r => <option key={r.id} value={r.id}>{r.name} ({r.status})</option>)}
                          </select>
                          <button onClick={() => updateOrderStatus(order.id, 'out_for_delivery')} className="btn-global-primary-sm" disabled={loadingStates[order.id]}>
                            {loadingStates[order.id] ? <div className="spinner-small" /> : 'Dispatch'}
                          </button>
                        </div>}
                      {order.status === 'out_for_delivery' && <button onClick={() => updateOrderStatus(order.id, 'completed')} className="btn-global-primary-sm" disabled={loadingStates[order.id]}>
                          {loadingStates[order.id] ? <div className="spinner-small" /> : 'Mark Delivered'}
                        </button>}
                      {order.status !== 'completed' && order.status !== 'cancelled' && <button onClick={() => updateOrderStatus(order.id, 'cancelled')} className="btn-global-danger-sm" disabled={loadingStates[order.id]}>
                          {loadingStates[order.id] ? <div className="spinner-small" /> : 'Cancel'}
                        </button>}
                    </div>
                  </div>
                  {(order.customerPhone || order.customer_phone) && <a href={`tel:${order.customerPhone || order.customer_phone}`} className="ext-cls-84ccd3f0">
                      <Phone size={14} /> Call Customer
                    </a>}
                </div>)}
            </div>
          </div>)}
      </div>
    </div>;
}