import toast from 'react-hot-toast';
import { Search, Plus, Package, AlertTriangle, ArrowDownRight, ShoppingBag, ShieldAlert, Sparkles, TrendingUp, Zap, Truck, BarChart2, Layers } from 'lucide-react';
import { useState } from 'react';
const SmartInventoryView = () => {
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
    <div className="smart-inventory-system animate-slide-up ext-cls-4641fd20" >
      
      {/* Dynamic Sub-tab Selector */}
      <div  className="ext-cls-50890ebe">
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
        <div  className="ext-cls-83fb2977">
          <div  className="ext-cls-0f3a7d94">
            <Search size={18}  className="ext-cls-66a18e0f" />
            <input 
              type="text" 
              placeholder="Search assets..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="st-cls-11ac24cb"
            />
          </div>
          <button 
            onClick={() => {
              setStockActionType('in');
              setShowStockModal(true);
            }}
            className="btn-global-primary" 
            
          >
            <Plus size={18} /> Action Stock
          </button>
        </div>
      )}

      {/* DASHBOARD TAB */}
      {subTab === 'dashboard' && (
        <div  className="ext-cls-e6f83a76">
          {/* KPI Matrix */}
          <div  className="ext-cls-7e47db3c">
            <div className="glass-panel ext-cls-2fde9030" >
              <div  className="ext-cls-f657fb1e">
                <Package size={24}  className="ext-cls-507943c3" />
                <span  className="ext-cls-9c09c08b">Active</span>
              </div>
              <span  className="ext-cls-56c3801c">Total tracked items</span>
              <h3  className="ext-cls-33a0f1ad">{inventory.length} Items</h3>
            </div>

            <div className="glass-panel ext-cls-2fde9030" >
              <div  className="ext-cls-f657fb1e">
                <AlertTriangle size={24}  className="ext-cls-bd23f3d1" />
                <span  className="ext-cls-97a53a2a">Restock</span>
              </div>
              <span  className="ext-cls-56c3801c">Low Stock triggers</span>
              <h3  className="ext-cls-33a0f1ad">{inventory.filter(i => i.status === 'Low Stock' || i.status === 'Reorder').length} Items</h3>
            </div>

            <div className="glass-panel ext-cls-2fde9030" >
              <div  className="ext-cls-f657fb1e">
                <ArrowDownRight size={24}  className="ext-cls-f8bccb28" />
                <span  className="ext-cls-e9c53ece">Today</span>
              </div>
              <span  className="ext-cls-56c3801c">Wastage Value</span>
              <h3  className="ext-cls-33a0f1ad">₹{wastageLogs.reduce((acc, curr) => acc + curr.value, 0)}</h3>
            </div>

            <div className="glass-panel ext-cls-2fde9030" >
              <div  className="ext-cls-f657fb1e">
                <ShoppingBag size={24}  className="ext-cls-59c717cb" />
                <span  className="ext-cls-8965b5fc">Orders</span>
              </div>
              <span  className="ext-cls-56c3801c">Pending Supplier POs</span>
              <h3  className="ext-cls-33a0f1ad">{purchaseOrders.filter(p => p.status === 'Pending').length} POs</h3>
            </div>
          </div>

          {/* Quick Critical Stock Warning */}
          <div className="glass-panel ext-cls-8fe8223b" >
            <div  className="ext-cls-a14ff57a">
              <ShieldAlert  className="ext-cls-f8bccb28" />
              <h4  className="ext-cls-416eebbc">Critical Shortage Alerts</h4>
            </div>
            <div  className="ext-cls-6ccca837">
              {inventory.filter(i => i.status === 'Low Stock' || i.status === 'Reorder').map((item, idx) => (
                <div key={idx}  className="ext-cls-8ff40019">
                  <div  className="ext-cls-b68c5feb">
                    <div  className="ext-cls-a2dd11ad"></div>
                    <span  className="ext-cls-9f42a204">{item.name}</span>
                  </div>
                  <div  className="ext-cls-45ebfcb4">
                    <span  className="ext-cls-fe26727a">Current: <strong>{item.qty} {item.unit}</strong> (Min: {item.minQty})</span>
                    <button 
                      onClick={() => {
                        setSelectedItem(item);
                        setStockActionType('in');
                        setShowStockModal(true);
                      }}
                      className="st-cls-b580d5f7"
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
        <div className="glass-panel ext-cls-2d69be5d" >
          <h4  className="ext-cls-6aa6de90">Material Stock Registry</h4>
          <div className="overflow-x-auto">
            <table className="table-styled">
              <thead>
                <tr  className="ext-cls-df7f00d1">
                  <th  className="ext-cls-97664a11">Item Info</th>
                  <th  className="ext-cls-97664a11">Category</th>
                  <th  className="ext-cls-97664a11">Inventory Level</th>
                  <th  className="ext-cls-97664a11">Status</th>
                  <th  className="ext-cls-1bab3446">Logistics</th>
                </tr>
              </thead>
              <tbody  className="ext-cls-4c8bbc32">
                {filteredInventory.map((item, idx) => (
                  <tr key={idx}  className="ext-cls-061d9bac">
                    <td  className="ext-cls-2b40f511">
                      <div  className="ext-cls-d71cfe4a">{item.name}</div>
                      <div  className="ext-cls-66e174d2">Batch: {item.batch} | Exp: {item.expiry}</div>
                    </td>
                    <td  className="ext-cls-2cd31c28">{item.category}</td>
                    <td  className="ext-cls-2b40f511">
                      <div  className="ext-cls-fe82601c">
                        <span  className="ext-cls-0ff4d3c2">{item.qty} {item.unit}</span>
                        <div  className="ext-cls-5ae3f4b2">
                          <div style={{ width: `${Math.min(100, (item.qty / (item.minQty * 2)) * 100)}%`, height: '100%', background: getStatusColor(item.status), borderRadius: '10px' }}></div>
                        </div>
                      </div>
                    </td>
                    <td  className="ext-cls-2b40f511">
                      <span style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '10px', background: `${getStatusColor(item.status)}20`, color: getStatusColor(item.status), border: `1px solid ${getStatusColor(item.status)}40`, fontWeight: '700' }}>
                        {item.status}
                      </span>
                    </td>
                    <td  className="ext-cls-ea0b5850">
                      <div  className="ext-cls-c940980c">
                        <button 
                          onClick={() => {
                            setSelectedItem(item);
                            setStockActionType('in');
                            setShowStockModal(true);
                          }}
                          className="st-cls-e257142c"
                        >
                          Stock In
                        </button>
                        <button 
                          onClick={() => {
                            setSelectedItem(item);
                            setStockActionType('out');
                            setShowStockModal(true);
                          }}
                          className="st-cls-d1b58ff8"
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
        <div  className="ext-cls-e6f83a76">
          <div className="glass-panel ext-cls-2d69be5d" >
            <h4  className="ext-cls-6aa6de90">Vendor & Supplier Directory</h4>
            <div className="overflow-x-auto">
              <table className="table-styled">
                <thead>
                  <tr  className="ext-cls-df7f00d1">
                    <th  className="ext-cls-97664a11">Supplier Name</th>
                    <th  className="ext-cls-97664a11">Contact</th>
                    <th  className="ext-cls-97664a11">Pending Ledger</th>
                    <th  className="ext-cls-97664a11">Last Contract Price</th>
                    <th  className="ext-cls-1bab3446">Actions</th>
                  </tr>
                </thead>
                <tbody  className="ext-cls-4c8bbc32">
                  {suppliers.map((sup, idx) => (
                    <tr key={idx}  className="ext-cls-061d9bac">
                      <td  className="ext-cls-70ce42a1">{sup.name}</td>
                      <td  className="ext-cls-cbeb2f69">{sup.contact}</td>
                      <td style={{ padding: '18px 12px', color: sup.pendingPayment > 0 ? 'var(--warning)' : 'var(--success)' }}>
                        ₹{sup.pendingPayment}
                      </td>
                      <td  className="ext-cls-2b40f511">{sup.lastPrice}</td>
                      <td  className="ext-cls-ea0b5850">
                        <button 
                          onClick={() => toast(`Creating Purchase Order for ${sup.name}...`)}
                          className="btn-global-outline"
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

          <div className="glass-panel ext-cls-2d69be5d" >
            <h4  className="ext-cls-6aa6de90">Purchase Order Logs</h4>
            <div  className="ext-cls-6ccca837">
              {purchaseOrders.map((po, idx) => (
                <div key={idx}  className="ext-cls-654c95c5">
                  <div>
                    <span  className="ext-cls-64a1327f">{po.id}</span>
                    <div  className="ext-cls-0d161c89">Vendor: {po.vendor} | Issued: {po.date}</div>
                  </div>
                  <div  className="ext-cls-45ebfcb4">
                    <span  className="ext-cls-22e4bbaf">₹{po.amount}</span>
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
        <div className="glass-panel ext-cls-2d69be5d" >
          <h4  className="ext-cls-aae72edf">Recipe-Based Auto Deductions</h4>
          <p className="text-muted ext-cls-f5c20741" >Define exact parameters to deduct component items when orders clear kitchen hubs.</p>

          <div  className="ext-cls-9db28ba8">
            {recipes.map((rec, idx) => (
              <div key={idx}  className="ext-cls-4053a01b">
                <h5  className="ext-cls-f760a220">{rec.dish}</h5>
                <div  className="ext-cls-6ccca837">
                  {rec.ingredients.map((ing, i) => (
                    <div key={i}  className="ext-cls-03d57d55">
                      <span  className="ext-cls-dfa9aad7">{ing.item}</span>
                      <span  className="ext-cls-d77dc274">{ing.usage}</span>
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
        <div  className="ext-cls-e6f83a76">
          <div className="glass-panel ext-cls-68c13109" >
            <div  className="ext-cls-f7aba57e">
              <Sparkles size={28} className="text-warning" />
              <h4  className="ext-cls-26fce346">Neural Demand Forecasting</h4>
            </div>
            
            <div  className="ext-cls-e8005ec3">
              <div  className="ext-cls-f8cba76f">
                <div  className="ext-cls-cf98ab57">
                  <TrendingUp size={20}  className="ext-cls-1b7f527e" />
                  <span  className="ext-cls-ba204747">Optimal Reorder Time (AI)</span>
                </div>
                <p  className="ext-cls-c70d70fc">
                  Based on transactional histories, place order for <strong>Paneer Cubes</strong> by <strong>Wednesday morning</strong> to offset supply delays.
                </p>
              </div>

              <div  className="ext-cls-3b8b1711">
                <div  className="ext-cls-cf98ab57">
                  <Zap size={20}  className="ext-cls-507943c3" />
                  <span  className="ext-cls-ba204747">High Velocity Assets</span>
                </div>
                <p  className="ext-cls-c70d70fc">
                  <strong>Fresh Vegetables</strong> usage velocity increased by 15% over standard baselines this week. Consider bulk adjustment.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STOCK ACTION MODAL */}
      {showStockModal && (
        <div className="modal-overlay ext-cls-dd6e81bf" >
          <div className="modal-content glass-panel animate-slide-up ext-cls-64b444d9" >
            <h3  className="ext-cls-4f8693ef">
              {stockActionType === 'in' ? 'Stock In (Purchase)' : stockActionType === 'wastage' ? 'Report Wastage' : 'Usage Reduction'}
            </h3>
            <p className="text-muted ext-cls-4e062fb4" >Perform explicit logistics updates instantly.</p>

            <form onSubmit={handleStockUpdate}  className="ext-cls-21558a0c">
              <div>
                <label  className="ext-cls-66365d2b">SELECT ITEM</label>
                <select 
                  value={selectedItem ? selectedItem.id : ''} 
                  onChange={(e) => setSelectedItem(inventory.find(i => i.id === parseInt(e.target.value)))}
                  required
                  className="st-cls-c00c2d10"
                >
                  <option value="">-- Choose Ingredient --</option>
                  {inventory.map(item => (
                    <option key={item.id} value={item.id}>{item.name} ({item.qty} {item.unit})</option>
                  ))}
                </select>
              </div>

              <div>
                <label  className="ext-cls-66365d2b">
                  QUANTITY {selectedItem ? `(${selectedItem.unit})` : ''}
                </label>
                <input 
                  type="number" 
                  step="any"
                  placeholder="e.g. 10" 
                  value={actionQty} 
                  onChange={(e) => setActionQty(e.target.value)} 
                  required 
                  className="st-cls-7bb6244a"
                />
              </div>

              {stockActionType !== 'in' && (
                <div>
                  <label  className="ext-cls-66365d2b">REASON / PURPOSE</label>
                  <select 
                    value={actionReason} 
                    onChange={(e) => setActionReason(e.target.value)}
                    className="st-cls-2792e06b"
                  >
                    <option value="Daily Usage">Daily Operational Usage</option>
                    <option value="Spoilage">Spoilage / Rotten</option>
                    <option value="Damage">Accidental Damage</option>
                    <option value="Expiry">Expired Batch</option>
                  </select>
                </div>
              )}

              <div  className="ext-cls-219254d1">
                <button 
                  type="button" 
                  onClick={() => {
                    setShowStockModal(false);
                    setSelectedItem(null);
                  }}
                  className="st-cls-b046eea6"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-global-primary ext-cls-04a898f1" 
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

export default SmartInventoryView;
