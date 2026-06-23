import { Clock, Settings, Plus, Search, ChevronRight, ChevronDown, UtensilsCrossed, EyeOff, Eye, Edit2, Trash2 } from 'lucide-react';
import { API_URL } from '../../../config';

export default function NeuralInventoryView({
  menuItems,
  categories,
  selectedCategory,
  setSelectedCategory,
  searchTerm,
  setSearchTerm,
  collapsedCats,
  setCollapsedCats,
  fetchData,
  setShowCatPopup,
  setNewDish,
  setEditingDishId,
  setFormError,
  setShowMenuPopup,
  toggleDishActive,
  deleteDish,
  loadingStates
}) {
  return (
    <div className="view-container animate-slide-up">
      <div className="view-header-row">
        <div className="header-left">
          <h1 className="view-title">Neural Inventory</h1>
          <p className="text-muted">Manage your digital menu items and system parameters.</p>
        </div>
        <div className="flex gap-4 items-center flex-wrap ext-cls-1f258d28" >
          <button className="btn-secondary" onClick={fetchData}>
            <Clock size={18} /> Refresh Hub
          </button>
          <button className="btn-secondary" onClick={() => setShowCatPopup(true)}>
            <Settings size={20} />
            <span>Manage Categories</span>
          </button>
          <button className="btn-primary" onClick={() => {
            setNewDish({ name: '', category: '', price: '', description: '', image_url: '', is_active: true, veg_type: 'veg', options: [], available_from: '', available_to: '' });
            setEditingDishId(null);
            setFormError('');
            setShowMenuPopup(true);
          }}>
            <Plus size={20} />
            <span>Add New Dish</span>
          </button>
        </div>
      </div>

      <div className="inventory-toolbar-premium shadow-premium ext-cls-6fb77c85" >
        <div  className="ext-cls-591c8413">
          <div className="search-box-integrated ext-cls-04a898f1" >
            <Search size={18} className="search-icon-inner" />
            <input
              type="text"
              placeholder="Filter neural items by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="st-cls-69764522"
            />
          </div>
          <div className="inventory-meta-badge">
            <span>Active coverage:</span>
            <strong>{menuItems.filter(i => i.is_active).length}</strong>
            <span>/ {menuItems.length} items</span>
          </div>
        </div>

        <div className="category-quick-filters ext-cls-8223b1f4" >
          {['All', ...categories.map(c => c.name)].map((cat) => (
            <button
              key={cat}
              className={`filter-pill-btn ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '8px 18px',
                borderRadius: '12px',
                border: '1px solid var(--card-border)',
                background: selectedCategory === cat ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                color: selectedCategory === cat ? '#fff' : 'var(--text-muted)',
                cursor: 'pointer',
                fontWeight: '700',
                fontSize: '13px',
                transition: 'all 0.2s ease',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="category-grouped-container ext-cls-a66d859e" >
        {['All', ...categories.map(c => c.name)].filter(c => selectedCategory === 'All' || c === selectedCategory).map((catName) => {
          if (catName === 'All') return null;
          const catItems = menuItems.filter(item => item.category === catName && item.name.toLowerCase().includes(searchTerm.toLowerCase()));
          if (catItems.length === 0) return null;
          const isCollapsed = collapsedCats.has(catName);
          return (
            <div key={catName} className="category-group-block ext-cls-e3f1dc98" >
              <h2
                className="text-xl font-bold mb-4 flex items-center justify-between text-white ext-cls-1c197b64"
                
                onClick={() => {
                  setCollapsedCats(prev => {
                    const next = new Set(prev);
                    if (next.has(catName)) next.delete(catName);
                    else next.add(catName);
                    return next;
                  });
                }}
              >
                <div className="flex items-center gap-2">
                  {catName}
                  <span  className="ext-cls-24613b77">{catItems.length} items</span>
                </div>
                {isCollapsed ? <ChevronRight size={20} className="text-muted" /> : <ChevronDown size={20} className="text-muted" />}
              </h2>
              {!isCollapsed && (
                <div className="inventory-grid">
                  {catItems.map(item => (
                    <div key={item.id} className={`inventory-card glass-panel dish-card-premium shadow-premium ${!item.is_active ? 'dish-card-hidden' : ''}`}>
                      <div className="dish-banner" style={{ position: 'relative', height: '120px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: !item.image_url ? 'linear-gradient(135deg, var(--bg-secondary), var(--bg-tertiary))' : 'rgba(0,0,0,0.05)' }}>
                        {item.image_url ? (
                          <img
                            src={item.image_url.startsWith('http') ? item.image_url : `${API_URL}${item.image_url}`}
                            alt={item.name}
                            
                          className="ext-cls-80fb12aa" />
                        ) : (
                          <div className="flex flex-col items-center gap-2 opacity-40">
                            <UtensilsCrossed size={36} className="text-accent" />
                            <span className="text-xs font-bold uppercase tracking-widest text-muted">No Image</span>
                          </div>
                        )}
                      </div>
                      <div className="inv-details">
                        <div className="inv-main">
                          <div className="flex justify-between items-start">
                            <strong className="text-lg ext-cls-cd210fb4" >
                              {item.veg_type === 'veg' && (
                                <div  className="ext-cls-ae45e9ff">
                                  <div  className="ext-cls-43522f59"></div>
                                </div>
                              )}
                              {item.veg_type === 'nonveg' && (
                                <div  className="ext-cls-8bce84d5">
                                  <div  className="ext-cls-1d88b8d6"></div>
                                </div>
                              )}
                              {item.veg_type === 'egg' && (
                                <div  className="ext-cls-68d4df2e">
                                  <div  className="ext-cls-8882b236"></div>
                                </div>
                              )}
                              {item.name}
                            </strong>
                          </div>
                        </div>
                        <p className="inv-desc text-muted truncate-2-lines mt-2">{item.description}</p>
                        <div className="inv-meta ext-cls-0399e01d" >
                          <div className="inv-price text-xl">₹{item.price}</div>
                        </div>
                      </div>
                      <div className="inv-actions">
                        <button
                          className={`inv-btn-toggle ${item.is_active ? 'active' : 'inactive'}`}
                          onClick={() => toggleDishActive(item)}
                          title={item.is_active ? "Deactivate / Hide from Menu" : "Activate / Show in Menu"}
                        >
                          {item.is_active ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                        <button className="inv-btn-edit" onClick={() => {
                          setNewDish({
                            ...item,
                            available_from: item.available_from ? item.available_from.substring(0, 5) : '',
                            available_to: item.available_to ? item.available_to.substring(0, 5) : ''
                          });
                          setEditingDishId(item.id);
                          setFormError('');
                          setShowMenuPopup(true);
                        }}><Edit2 size={16} /></button>
                        <button onClick={() => deleteDish(item.id)} className="inv-btn-delete" title="Purge Dish" disabled={loadingStates[`delete_dish_${item.id}`]}>
                          {loadingStates[`delete_dish_${item.id}`] ? <div className="spinner-small ext-cls-3edb750d"  /> : <Trash2 size={16} />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {selectedCategory === 'All' && (() => {
          const unassignedItems = menuItems.filter(item =>
            (!item.category || !categories.some(c => c.name === item.category)) &&
            item.name.toLowerCase().includes(searchTerm.toLowerCase())
          );
          if (unassignedItems.length === 0) return null;
          const isUnassignedCollapsed = collapsedCats.has('Unassigned');
          return (
            <div className="category-group-block ext-cls-e3f1dc98" >
              <h2
                className="text-xl font-bold mb-4 flex items-center justify-between text-white ext-cls-b8842304"
                
                onClick={() => {
                  setCollapsedCats(prev => {
                    const next = new Set(prev);
                    if (next.has('Unassigned')) next.delete('Unassigned');
                    else next.add('Unassigned');
                    return next;
                  });
                }}
              >
                <div className="flex items-center gap-2">
                  Unassigned Items
                  <span  className="ext-cls-24613b77">{unassignedItems.length} items</span>
                </div>
                {isUnassignedCollapsed ? <ChevronRight size={20} className="text-muted" /> : <ChevronDown size={20} className="text-muted" />}
              </h2>
              {!isUnassignedCollapsed && (
                <div className="inventory-grid">
                  {unassignedItems.map(item => (
                    <div key={item.id} className={`inventory-card glass-panel dish-card-premium shadow-premium ${!item.is_active ? 'dish-card-hidden' : ''}`}>
                      <div className="dish-banner" style={{ position: 'relative', height: '120px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: !item.image_url ? 'linear-gradient(135deg, var(--bg-secondary), var(--bg-tertiary))' : 'rgba(0,0,0,0.05)' }}>
                        {item.image_url ? (
                          <img
                            src={item.image_url.startsWith('http') ? item.image_url : `${API_URL}${item.image_url}`}
                            alt={item.name}
                            
                          className="ext-cls-80fb12aa" />
                        ) : (
                          <div className="flex flex-col items-center gap-2 opacity-40">
                            <UtensilsCrossed size={36} className="text-accent" />
                            <span className="text-xs font-bold uppercase tracking-widest text-muted">No Image</span>
                          </div>
                        )}
                      </div>
                      <div className="inv-details">
                        <div className="flex justify-between items-start">
                          <div className="flex flex-col">
                            <strong className="text-lg">{item.name}</strong>
                            <div className="flex items-center gap-2 mt-1">
                              <div style={{ width: '12px', height: '12px', border: `1px solid ${item.veg_type === 'nonveg' ? '#ef4444' : item.veg_type === 'egg' ? '#f59e0b' : '#10b981'}`, padding: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: item.veg_type === 'nonveg' ? '#ef4444' : item.veg_type === 'egg' ? '#f59e0b' : '#10b981' }} />
                              </div>
                              {item.is_featured && <span  className="ext-cls-44895d1d">BESTSELLER</span>}
                            </div>
                          </div>
                          <span className="inv-cat-tag shadow-sm">{item.category || 'Unassigned'}</span>
                        </div>
                        <p className="inv-desc text-muted truncate-2-lines mt-2">{item.description}</p>
                        <div className="inv-meta ext-cls-0399e01d" >
                          <div className="inv-price text-xl">₹{item.price}</div>
                        </div>
                      </div>
                      <div className="inv-actions">
                        <button
                          className={`inv-btn-toggle ${item.is_active ? 'active' : 'inactive'}`}
                          onClick={() => toggleDishActive(item)}
                          title={item.is_active ? "Deactivate / Hide from Menu" : "Activate / Show in Menu"}
                        >
                          {item.is_active ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                        <button className="inv-btn-edit" onClick={() => {
                          setNewDish({
                            ...item,
                            available_from: item.available_from ? item.available_from.substring(0, 5) : '',
                            available_to: item.available_to ? item.available_to.substring(0, 5) : ''
                          });
                          setEditingDishId(item.id);
                          setFormError('');
                          setShowMenuPopup(true);
                        }}><Edit2 size={16} /></button>
                        <button onClick={() => deleteDish(item.id)} className="inv-btn-delete" title="Purge Dish" disabled={loadingStates[`delete_dish_${item.id}`]}>
                          {loadingStates[`delete_dish_${item.id}`] ? <div className="spinner-small ext-cls-3edb750d"  /> : <Trash2 size={16} />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })()}
      </div>
    </div>
  );
}
