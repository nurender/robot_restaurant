import React, { useState } from 'react';
import { 
  Package, AlertTriangle, ArrowDownRight, ArrowUpRight, 
  Truck, Clipboard, Zap, TrendingUp, Sparkles, BarChart2,
  Plus, Search, Download, FileText, ShoppingBag, ShieldAlert,
  Calendar, Layers, CheckCircle, Clock, Trash2, Edit3
} from 'lucide-react';

const SmartInventory = () => {
  const [subTab, setSubTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Mock State Variables representing persistence
  const [inventory, setInventory] = useState([
    { id: 1, name: 'Basmati Rice', category: 'Dry Goods', qty: 45, unit: 'Kg', minQty: 10, cost: 65, supplier: 'Anand Grains', expiry: '2027-02-14', batch: 'B-112', status: 'Optimal' },
    { id: 2, name: 'Paneer Cubes', category: 'Dairy', qty: 8, unit: 'Kg', minQty: 15, cost: 220, supplier: 'Krishna Dairy', expiry: '2026-05-01', batch: 'B-098', status: 'Low Stock' },
    { id: 3, name: 'Spices Mix', category: 'Spices', qty: 2.4, unit: 'Kg', minQty: 5, cost: 450, supplier: 'Masala Mart', expiry: '2026-11-20', batch: 'B-001', status: 'Reorder' },
    { id: 4, name: 'Fresh Vegetables', category: 'Produce', qty: 22, unit: 'Kg', minQty: 12, cost: 40, supplier: 'Green Agro', expiry: '2026-04-30', batch: 'B-771', status: 'Optimal' },
    { id: 5, name: 'Dairy & Milk', category: 'Dairy', qty: 15, unit: 'Ltr', minQty: 10, cost: 58, supplier: 'Krishna Dairy', expiry: '2026-05-02', batch: 'B-992', status: 'Optimal' },
    { id: 6, name: 'Cooking Oil', category: 'Fats', qty: 5, unit: 'Ltr', minQty: 20, cost: 135, supplier: 'Fortune Dist.', expiry: '2026-10-15', batch: 'B-004', status: 'Low Stock' }
  ]);

  const [suppliers, setSuppliers] = useState([
    { id: 1, name: 'Anand Grains', contact: '+91 98765 43210', pendingPayment: 12400, lastPrice: '₹65/Kg' },
    { id: 2, name: 'Krishna Dairy', contact: '+91 88776 65544', pendingPayment: 4500, lastPrice: '₹220/Kg' },
    { id: 3, name: 'Masala Mart', contact: '+91 99988 87777', pendingPayment: 0, lastPrice: '₹450/Kg' },
    { id: 4, name: 'Green Agro', contact: '+91 77665 54433', pendingPayment: 2100, lastPrice: '₹40/Kg' }
  ]);

  const [wastageLogs, setWastageLogs] = useState([
    { id: 1, item: 'Paneer Cubes', qty: '1.5 Kg', reason: 'Spoilage', date: '2026-04-26', value: 330 },
    { id: 2, item: 'Fresh Vegetables', qty: '3 Kg', reason: 'Damage', date: '2026-04-27', value: 120 }
  ]);

  const [recipes, setRecipes] = useState([
    { id: 1, dish: 'Paneer Butter Masala', ingredients: [{ item: 'Paneer Cubes', usage: '200g' }, { item: 'Dairy & Milk', usage: '50ml' }] },
    { id: 2, dish: 'Jeera Rice', ingredients: [{ item: 'Basmati Rice', usage: '150g' }, { item: 'Cooking Oil', usage: '10ml' }] }
  ]);

  const [purchaseOrders, setPurchaseOrders] = useState([
    { id: 'PO-2026-001', vendor: 'Krishna Dairy', date: '2026-04-27', amount: 3500, status: 'Pending' },
    { id: 'PO-2026-002', vendor: 'Anand Grains', date: '2026-04-25', amount: 8400, status: 'Received' }
  ]);

  // Modals management
  const [showStockModal, setShowStockModal] = useState(false);
  const [stockActionType, setStockActionType] = useState('in'); // 'in', 'out', 'wastage'
  const [selectedItem, setSelectedItem] = useState(null);
  const [actionQty, setActionQty] = useState('');
  const [actionReason, setActionReason] = useState('Daily Usage');

  const handleStockUpdate = (e) => {
    e.preventDefault();
    if (!selectedItem || !actionQty) return;

    const qtyVal = parseFloat(actionQty);
    setInventory(inventory.map(item => {
      if (item.id === selectedItem.id) {
        let newQty = item.qty;
        if (stockActionType === 'in') newQty += qtyVal;
        else newQty = Math.max(0, newQty - qtyVal);
        
        let status = 'Optimal';
        if (newQty === 0) status = 'Out of Stock';
        else if (newQty <= item.minQty) status = 'Low Stock';

        return { ...item, qty: newQty, status };
      }
      return item;
    }));

    if (stockActionType === 'wastage') {
      setWastageLogs([...wastageLogs, {
        id: wastageLogs.length + 1,
        item: selectedItem.name,
        qty: `${actionQty} ${selectedItem.unit}`,
        reason: actionReason,
        date: new Date().toISOString().split('T')[0],
        value: qtyVal * selectedItem.cost
      }]);
    }

    setShowStockModal(false);
    setActionQty('');
    setSelectedItem(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Optimal': return 'var(--success)';
      case 'Low Stock': return 'var(--warning)';
      case 'Reorder': return '#f59e0b';
      case 'Out of Stock': return 'var(--danger)';
      default: return 'var(--text-muted)';
    }
  };

  const filteredInventory = inventory.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="smart-inventory-system animate-slide-up" style={{ color: 'var(--text-main)', paddingBottom: '40px' }}>
      
      {/* Dynamic Sub-tab Selector */}
      <div style={{ display: 'flex', gap: '16px', background: 'var(--bg-deep)', padding: '6px', borderRadius: '14px', marginBottom: '32px', width: 'fit-content', border: '1px solid var(--card-border)' }}>
        {[
          { id: 'dashboard', label: 'Overview', icon: BarChart2 },
          { id: 'stock', label: 'Stock Operations', icon: Package },
          { id: 'suppliers', label: 'Suppliers & POs', icon: Truck },
          { id: 'recipes', label: 'Recipes Mapping', icon: Layers },
          { id: 'ai', label: 'AI Forecasting', icon: Sparkles }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setSubTab(tab.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '10px',
              border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '13px', transition: 'all 0.2s',
              background: subTab === tab.id ? 'var(--card-bg)' : 'transparent',
              color: subTab === tab.id ? 'var(--text-main)' : 'var(--text-muted)',
              boxShadow: subTab === tab.id ? 'var(--shadow-sm)' : 'none'
            }}
          >
            <tab.icon size={16} color={subTab === tab.id ? 'var(--accent-primary)' : 'currentColor'} /> {tab.label}
          </button>
        ))}
      </div>

      {/* SEARCH BAR / GLOBAL CONTROLS */}
      {subTab !== 'dashboard' && subTab !== 'ai' && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '320px' }}>
            <Search size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search assets..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', height: '46px', padding: '12px 16px 12px 42px', borderRadius: '12px', background: 'var(--card-bg)', border: '1px solid var(--card-border)', color: 'var(--text-main)', fontSize: '14px', outline: 'none' }}
            />
          </div>
          <button 
            onClick={() => {
              setStockActionType('in');
              setShowStockModal(true);
            }}
            className="btn-primary" 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: '800' }}
          >
            <Plus size={18} /> Action Stock
          </button>
        </div>
      )}

      {/* DASHBOARD TAB */}
      {subTab === 'dashboard' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* KPI Matrix */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
            <div className="glass-panel" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', padding: '24px', borderRadius: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <Package size={24} style={{ color: 'var(--accent-primary)' }} />
                <span style={{ fontSize: '12px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-primary)', padding: '4px 10px', borderRadius: '10px', fontWeight: '700' }}>Active</span>
              </div>
              <span style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: '600' }}>Total tracked items</span>
              <h3 style={{ fontSize: '32px', fontWeight: '800', marginTop: '6px' }}>{inventory.length} Items</h3>
            </div>

            <div className="glass-panel" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', padding: '24px', borderRadius: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <AlertTriangle size={24} style={{ color: 'var(--warning)' }} />
                <span style={{ fontSize: '12px', background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)', padding: '4px 10px', borderRadius: '10px', fontWeight: '700' }}>Restock</span>
              </div>
              <span style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: '600' }}>Low Stock triggers</span>
              <h3 style={{ fontSize: '32px', fontWeight: '800', marginTop: '6px' }}>{inventory.filter(i => i.status === 'Low Stock' || i.status === 'Reorder').length} Items</h3>
            </div>

            <div className="glass-panel" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', padding: '24px', borderRadius: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <ArrowDownRight size={24} style={{ color: 'var(--danger)' }} />
                <span style={{ fontSize: '12px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '4px 10px', borderRadius: '10px', fontWeight: '700' }}>Today</span>
              </div>
              <span style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: '600' }}>Wastage Value</span>
              <h3 style={{ fontSize: '32px', fontWeight: '800', marginTop: '6px' }}>₹{wastageLogs.reduce((acc, curr) => acc + curr.value, 0)}</h3>
            </div>

            <div className="glass-panel" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', padding: '24px', borderRadius: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <ShoppingBag size={24} style={{ color: 'var(--success)' }} />
                <span style={{ fontSize: '12px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '4px 10px', borderRadius: '10px', fontWeight: '700' }}>Orders</span>
              </div>
              <span style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: '600' }}>Pending Supplier POs</span>
              <h3 style={{ fontSize: '32px', fontWeight: '800', marginTop: '6px' }}>{purchaseOrders.filter(p => p.status === 'Pending').length} POs</h3>
            </div>
          </div>

          {/* Quick Critical Stock Warning */}
          <div className="glass-panel" style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.15)', padding: '24px', borderRadius: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <ShieldAlert style={{ color: 'var(--danger)' }} />
              <h4 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--danger)' }}>Critical Shortage Alerts</h4>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {inventory.filter(i => i.status === 'Low Stock' || i.status === 'Reorder').map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--card-bg)', padding: '14px 20px', borderRadius: '12px', border: '1px solid var(--card-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: getStatusColor(item.status) }}></div>
                    <span style={{ fontWeight: '700', fontSize: '14px' }}>{item.name}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Current: <strong>{item.qty} {item.unit}</strong> (Min: {item.minQty})</span>
                    <button 
                      onClick={() => {
                        setSelectedItem(item);
                        setStockActionType('in');
                        setShowStockModal(true);
                      }}
                      style={{ background: 'var(--bg-deep)', border: '1px solid var(--card-border)', padding: '6px 14px', borderRadius: '8px', color: 'var(--accent-primary)', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}
                    >
                      Refill
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* STOCK OPERATIONS TAB */}
      {subTab === 'stock' && (
        <div className="glass-panel" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', padding: '28px', borderRadius: '24px' }}>
          <h4 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '24px' }}>Material Stock Registry</h4>
          <div className="overflow-x-auto">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--card-border)', color: 'var(--text-muted)', fontSize: '13px' }}>
                  <th style={{ padding: '16px 12px', textAlign: 'left' }}>Item Info</th>
                  <th style={{ padding: '16px 12px', textAlign: 'left' }}>Category</th>
                  <th style={{ padding: '16px 12px', textAlign: 'left' }}>Inventory Level</th>
                  <th style={{ padding: '16px 12px', textAlign: 'left' }}>Status</th>
                  <th style={{ padding: '16px 12px', textAlign: 'center' }}>Logistics</th>
                </tr>
              </thead>
              <tbody style={{ fontWeight: '600', fontSize: '14px', color: 'var(--text-main)' }}>
                {filteredInventory.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--card-border)' }}>
                    <td style={{ padding: '18px 12px' }}>
                      <div style={{ fontWeight: '700' }}>{item.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Batch: {item.batch} | Exp: {item.expiry}</div>
                    </td>
                    <td style={{ padding: '18px 12px', color: 'var(--text-dim)' }}>{item.category}</td>
                    <td style={{ padding: '18px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ minWidth: '60px' }}>{item.qty} {item.unit}</span>
                        <div style={{ width: '100px', height: '6px', background: 'var(--bg-deep)', borderRadius: '10px', overflow: 'hidden' }}>
                          <div style={{ width: `${Math.min(100, (item.qty / (item.minQty * 2)) * 100)}%`, height: '100%', background: getStatusColor(item.status), borderRadius: '10px' }}></div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '18px 12px' }}>
                      <span style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '10px', background: `${getStatusColor(item.status)}20`, color: getStatusColor(item.status), border: `1px solid ${getStatusColor(item.status)}40`, fontWeight: '700' }}>
                        {item.status}
                      </span>
                    </td>
                    <td style={{ padding: '18px 12px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button 
                          onClick={() => {
                            setSelectedItem(item);
                            setStockActionType('in');
                            setShowStockModal(true);
                          }}
                          style={{ background: 'var(--success)15', border: '1px solid var(--success)40', color: 'var(--success)', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', fontWeight: '800' }}
                        >
                          Stock In
                        </button>
                        <button 
                          onClick={() => {
                            setSelectedItem(item);
                            setStockActionType('out');
                            setShowStockModal(true);
                          }}
                          style={{ background: 'var(--warning)15', border: '1px solid var(--warning)40', color: 'var(--warning)', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', fontWeight: '800' }}
                        >
                          Usage
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUPPLIERS TAB */}
      {subTab === 'suppliers' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div className="glass-panel" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', padding: '28px', borderRadius: '24px' }}>
            <h4 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '24px' }}>Vendor & Supplier Directory</h4>
            <div className="overflow-x-auto">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--card-border)', color: 'var(--text-muted)', fontSize: '13px' }}>
                    <th style={{ padding: '16px 12px', textAlign: 'left' }}>Supplier Name</th>
                    <th style={{ padding: '16px 12px', textAlign: 'left' }}>Contact</th>
                    <th style={{ padding: '16px 12px', textAlign: 'left' }}>Pending Ledger</th>
                    <th style={{ padding: '16px 12px', textAlign: 'left' }}>Last Contract Price</th>
                    <th style={{ padding: '16px 12px', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody style={{ fontWeight: '600', fontSize: '14px', color: 'var(--text-main)' }}>
                  {suppliers.map((sup, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--card-border)' }}>
                      <td style={{ padding: '18px 12px', fontWeight: '700' }}>{sup.name}</td>
                      <td style={{ padding: '18px 12px', color: 'var(--text-muted)' }}>{sup.contact}</td>
                      <td style={{ padding: '18px 12px', color: sup.pendingPayment > 0 ? 'var(--warning)' : 'var(--success)' }}>
                        ₹{sup.pendingPayment}
                      </td>
                      <td style={{ padding: '18px 12px' }}>{sup.lastPrice}</td>
                      <td style={{ padding: '18px 12px', textAlign: 'center' }}>
                        <button 
                          onClick={() => alert(`Creating Purchase Order for ${sup.name}...`)}
                          style={{ background: 'var(--accent-primary)15', border: '1px solid var(--accent-primary)40', color: 'var(--accent-primary)', padding: '6px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                        >
                          Issue PO
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="glass-panel" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', padding: '28px', borderRadius: '24px' }}>
            <h4 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '24px' }}>Purchase Order Logs</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {purchaseOrders.map((po, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-deep)', padding: '16px 20px', borderRadius: '14px', border: '1px solid var(--card-border)' }}>
                  <div>
                    <span style={{ fontWeight: '800', fontSize: '14px' }}>{po.id}</span>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>Vendor: {po.vendor} | Issued: {po.date}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <span style={{ fontWeight: '700', fontSize: '14px', color: 'var(--text-main)' }}>₹{po.amount}</span>
                    <span style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '10px', background: po.status === 'Received' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', color: po.status === 'Received' ? 'var(--success)' : 'var(--warning)', fontWeight: '700' }}>
                      {po.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* RECIPES MAPPING TAB */}
      {subTab === 'recipes' && (
        <div className="glass-panel" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', padding: '28px', borderRadius: '24px' }}>
          <h4 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '12px' }}>Recipe-Based Auto Deductions</h4>
          <p className="text-muted" style={{ fontSize: '14px', marginBottom: '32px' }}>Define exact parameters to deduct component items when orders clear kitchen hubs.</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
            {recipes.map((rec, idx) => (
              <div key={idx} style={{ background: 'var(--bg-deep)', border: '1px solid var(--card-border)', padding: '24px', borderRadius: '18px' }}>
                <h5 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--accent-primary)', marginBottom: '16px', borderBottom: '1px solid var(--card-border)', paddingBottom: '10px' }}>{rec.dish}</h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {rec.ingredients.map((ing, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '600' }}>
                      <span style={{ color: 'var(--text-main)' }}>{ing.item}</span>
                      <span style={{ color: 'var(--text-muted)' }}>{ing.usage}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI FORECASTING TAB */}
      {subTab === 'ai' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div className="glass-panel" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', padding: '32px', borderRadius: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <Sparkles size={28} className="text-warning" />
              <h4 style={{ fontSize: '22px', fontWeight: '800' }}>Neural Demand Forecasting</h4>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', flexWrap: 'wrap' }}>
              <div style={{ background: 'var(--bg-deep)', padding: '24px', borderRadius: '18px', borderLeft: '4px solid #f59e0b' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <TrendingUp size={20} style={{ color: '#f59e0b' }} />
                  <span style={{ fontWeight: '800', fontSize: '15px' }}>Optimal Reorder Time (AI)</span>
                </div>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                  Based on transactional histories, place order for <strong>Paneer Cubes</strong> by <strong>Wednesday morning</strong> to offset supply delays.
                </p>
              </div>

              <div style={{ background: 'var(--bg-deep)', padding: '24px', borderRadius: '18px', borderLeft: '4px solid var(--accent-primary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <Zap size={20} style={{ color: 'var(--accent-primary)' }} />
                  <span style={{ fontWeight: '800', fontSize: '15px' }}>High Velocity Assets</span>
                </div>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                  <strong>Fresh Vegetables</strong> usage velocity increased by 15% over standard baselines this week. Consider bulk adjustment.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STOCK ACTION MODAL */}
      {showStockModal && (
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
          <div className="modal-content glass-panel animate-slide-up" style={{ maxWidth: '450px', width: '90%', padding: '32px', borderRadius: '24px', background: 'var(--card-bg)', border: '1px solid var(--card-border)', boxShadow: 'var(--shadow-xl)' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '4px' }}>
              {stockActionType === 'in' ? 'Stock In (Purchase)' : stockActionType === 'wastage' ? 'Report Wastage' : 'Usage Reduction'}
            </h3>
            <p className="text-muted" style={{ fontSize: '13px', marginBottom: '24px' }}>Perform explicit logistics updates instantly.</p>

            <form onSubmit={handleStockUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>SELECT ITEM</label>
                <select 
                  value={selectedItem ? selectedItem.id : ''} 
                  onChange={(e) => setSelectedItem(inventory.find(i => i.id === parseInt(e.target.value)))}
                  required
                  style={{ width: '100%', height: '46px', padding: '10px 16px', borderRadius: '10px', background: 'var(--bg-deep)', color: 'var(--text-main)', border: '1px solid var(--card-border)', fontSize: '14px', cursor: 'pointer' }}
                >
                  <option value="">-- Choose Ingredient --</option>
                  {inventory.map(item => (
                    <option key={item.id} value={item.id}>{item.name} ({item.qty} {item.unit})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>
                  QUANTITY {selectedItem ? `(${selectedItem.unit})` : ''}
                </label>
                <input 
                  type="number" 
                  step="any"
                  placeholder="e.g. 10" 
                  value={actionQty} 
                  onChange={(e) => setActionQty(e.target.value)} 
                  required 
                  style={{ width: '100%', height: '46px', padding: '12px 16px', borderRadius: '10px', background: 'var(--bg-deep)', color: 'var(--text-main)', border: '1px solid var(--card-border)', fontSize: '14px', outline: 'none' }}
                />
              </div>

              {stockActionType !== 'in' && (
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>REASON / PURPOSE</label>
                  <select 
                    value={actionReason} 
                    onChange={(e) => setActionReason(e.target.value)}
                    style={{ width: '100%', height: '46px', padding: '10px 16px', borderRadius: '10px', background: 'var(--bg-deep)', color: 'var(--text-main)', border: '1px solid var(--card-border)', fontSize: '14px' }}
                  >
                    <option value="Daily Usage">Daily Operational Usage</option>
                    <option value="Spoilage">Spoilage / Rotten</option>
                    <option value="Damage">Accidental Damage</option>
                    <option value="Expiry">Expired Batch</option>
                  </select>
                </div>
              )}

              <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
                <button 
                  type="button" 
                  onClick={() => {
                    setShowStockModal(false);
                    setSelectedItem(null);
                  }}
                  style={{ flex: 1, padding: '12px', borderRadius: '12px', background: 'transparent', border: '1px solid var(--card-border)', color: 'var(--text-muted)', fontWeight: '700', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)', color: 'white', fontWeight: '800', cursor: 'pointer', boxShadow: '0 8px 16px -4px rgba(124, 58, 237, 0.3)' }}
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default SmartInventory;
