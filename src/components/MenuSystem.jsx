import React, { useRef, useState, useEffect } from 'react';
import { Search, ChevronDown, ChevronRight, ChefHat, Plus, Minus, ShoppingCart, Play } from 'lucide-react';
const MenuSystem = ({
  restaurantName,
  menuCategories,
  textLanguage,
  menuSearchTerm,
  setMenuSearchTerm,
  activeCategory,
  setActiveCategory,
  toggleCategory,
  expandedCats,
  getItemQty,
  handleManualCartUpdate,
  getCartTotal,
  getCartCount,
  setShowCartSummary,
  completeOrderProcess,
  getMediaUrl,
  setZoomedImage,
  currentCart,
  availableCoupons,
  activeCoupon,
  setActiveCoupon,
  getDiscountAmount
}) => {
  const categoryScrollRef = useRef(null);
  const [vegFilter, setVegFilter] = useState('all');
  const [showVegOffConfirm, setShowVegOffConfirm] = useState(false);
  const extendedMenuCategories = React.useMemo(() => {
    if (!menuCategories) return [];
    let allItems = [];
    menuCategories.forEach(c => {
      allItems = allItems.concat(c.items);
    });
    allItems = Array.from(new Map(allItems.map(i => [i.id, i])).values());
    let bestSellers = allItems.filter(i => i.is_best_seller);
    let todaySpecials = allItems.filter(i => i.is_today_special);
    let chefSpecials = allItems.filter(i => i.is_chef_special);
    let virtualCats = [];
    if (todaySpecials.length > 0) virtualCats.push({
      category: "✨ Today's Special",
      items: todaySpecials,
      isVirtual: true
    });
    if (bestSellers.length > 0) virtualCats.push({
      category: "🔥 Best Sellers",
      items: bestSellers,
      isVirtual: true
    });
    if (chefSpecials.length > 0) virtualCats.push({
      category: "👨‍🍳 Chef's Special",
      items: chefSpecials,
      isVirtual: true
    });
    return [...virtualCats, ...menuCategories];
  }, [menuCategories]);
  const [selectedVariants, setSelectedVariants] = useState({});
  const [selectedAddonsMap, setSelectedAddonsMap] = useState({});
  const [customizingItem, setCustomizingItem] = useState(null);
  const [pickingCustomizationItem, setPickingCustomizationItem] = useState(null);
  const [tempVariant, setTempVariant] = useState(null);
  const [tempAddons, setTempAddons] = useState([]);
  const [tempQty, setTempQty] = useState(1);
  const handleVariantChange = (itemId, size) => {
    setSelectedVariants(prev => ({
      ...prev,
      [itemId]: size
    }));
  };
  const toggleAddon = (itemId, addon) => {
    setSelectedAddonsMap(prev => {
      const current = prev[itemId] || [];
      const exists = current.find(a => a.name === addon.name);
      if (exists) return {
        ...prev,
        [itemId]: current.filter(a => a.name !== addon.name)
      };
      return {
        ...prev,
        [itemId]: [...current, addon]
      };
    });
  };
  const openCustomization = (item, options, addons, cItemToEdit = null) => {
    setCustomizingItem({
      ...item,
      options,
      addons,
      editFromCartItem: cItemToEdit
    });
    if (cItemToEdit) {
      setTempVariant(cItemToEdit.selectedVariant ? cItemToEdit.selectedVariant.size : options.length > 0 ? options[0].size : null);
      setTempAddons(cItemToEdit.selectedAddons || []);
      setTempQty(cItemToEdit.qty);
    } else {
      setTempVariant(options.length > 0 ? options[0].size : null);
      setTempAddons([]);
      setTempQty(1);
    }
    setPickingCustomizationItem(null);
  };
  const openCustomizationPicker = (item, options, addons) => {
    setPickingCustomizationItem({
      ...item,
      options,
      addons
    });
  };
  const handleTempAddonToggle = addon => {
    const exists = tempAddons.find(a => a.name === addon.name);
    if (exists) setTempAddons(tempAddons.filter(a => a.name !== addon.name));else setTempAddons([...tempAddons, addon]);
  };
  const confirmCustomization = () => {
    if (!customizingItem) return;
    const optObj = tempVariant ? customizingItem.options.find(o => o.size === tempVariant) : null;
    if (customizingItem.editFromCartItem) {
      handleManualCartUpdate(customizingItem.editFromCartItem, -customizingItem.editFromCartItem.qty, customizingItem.editFromCartItem.selectedVariant, customizingItem.editFromCartItem.selectedAddons);
    }
    handleManualCartUpdate(customizingItem, tempQty, optObj, tempAddons);
    setSelectedVariants(prev => ({
      ...prev,
      [customizingItem.id]: tempVariant
    }));
    setSelectedAddonsMap(prev => ({
      ...prev,
      [customizingItem.id]: tempAddons
    }));
    setCustomizingItem(null);
  };
  const handleCategoryWheel = e => {
    if (categoryScrollRef.current) {
      categoryScrollRef.current.scrollLeft += e.deltaY;
    }
  };
  const featuredItems = (menuCategories || []).flatMap(c => c.items || []).filter(item => {
    if (!item.is_featured) return false;
    const vType = item.veg_type ? item.veg_type.toLowerCase() : '';
    return vegFilter === 'all' || vegFilter === 'veg' && vType !== 'nonveg' || vegFilter === 'nonveg' && vType === 'nonveg';
  });
  const [isActive, setIsActive] = useState(false);
  const contentRef = useRef(null);
  useEffect(() => {
    const timer = setTimeout(() => setIsActive(true), 10);
    return () => clearTimeout(timer);
  }, []);
  return <div className={`premium-menu-panel ${isActive ? 'active' : ''}`}>
            <div className="menu-header">
                <div className="menu-header-top">
                    <div className="menu-title-area">
                        <h4>{restaurantName || 'AI RESTO'}</h4>
                    </div>
                </div>

                <div className="scrollbar-hidden ext-cls-c4246a82">
                    <div className="menu-search-wrapper ext-cls-59edb03f">
                        <Search size={18} className="search-icon" />
                        <input type="text" className="menu-search-input" placeholder="Search..." value={menuSearchTerm} onChange={e => setMenuSearchTerm(e.target.value)} />
                        {menuSearchTerm && <button className="clear-search-btn" onClick={() => setMenuSearchTerm('')}>×</button>}
                    </div>

                    <div className="ext-cls-aaab078c" onClick={() => {
          if (vegFilter === 'veg') {
            setShowVegOffConfirm(true);
          } else {
            setVegFilter('veg');
          }
        }}>
                        <span style={{
            fontSize: '10px',
            fontWeight: '900',
            color: vegFilter === 'veg' ? '#219653' : 'var(--text-muted)',
            lineHeight: '1.2',
            textAlign: 'center',
            marginBottom: '4px'
          }}>VEG<br />MODE</span>
                        <div style={{
            width: '38px',
            height: '22px',
            borderRadius: '11px',
            background: vegFilter === 'veg' ? '#219653' : '#3f3f46',
            border: `1px solid ${vegFilter === 'veg' ? '#219653' : 'rgba(255,255,255,0.1)'}`,
            position: 'relative',
            transition: 'background 0.3s'
          }}>
                            <div style={{
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              background: '#fff',
              position: 'absolute',
              top: '2px',
              left: vegFilter === 'veg' ? 'calc(100% - 18px)' : '2px',
              transition: 'left 0.3s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: vegFilter === 'veg' ? '0 2px 4px rgba(33,150,83,0.3)' : 'none'
            }}>
                                <div style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: vegFilter === 'veg' ? '#219653' : '#ef4444'
              }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div ref={categoryScrollRef} className="category-quick-links scrollbar-hidden" onWheel={handleCategoryWheel}>
                    <button className={`category-chip ${activeCategory === 'All' ? 'active' : ''}`} onClick={() => setActiveCategory('All')}>
                        All <span className="ext-cls-cddc1c99">({extendedMenuCategories.reduce((acc, cat) => cat.isVirtual ? acc : acc + cat.items.length, 0)})</span>
                    </button>
                    {extendedMenuCategories.map(cat => <button key={cat.category} className={`category-chip ${activeCategory === cat.category ? 'active' : ''}`} onClick={() => setActiveCategory(cat.category)}>
                            {cat.category} <span className="ext-cls-cddc1c99">({cat.items.length})</span>
                        </button>)}
                </div>
            </div>

            <div ref={contentRef} className="menu-content scrollbar-hidden">
                {!menuCategories || menuCategories.length === 0 ? <div className="menu-skeletons">
                        {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="premium-menu-item skeleton-item">
                                <div className="skeleton-img shimmer"></div>
                                <div className="item-details skeleton-details">
                                    <div className="item-header">
                                        <div className="skeleton-line title shimmer"></div>
                                        <div className="skeleton-line price shimmer"></div>
                                    </div>
                                    <div className="skeleton-line desc shimmer"></div>
                                    <div className="skeleton-line button shimmer"></div>
                                </div>
                            </div>)}
                    </div> : <>
                        {activeCategory === 'All' && menuSearchTerm === '' && featuredItems.length > 0 && <div className="ext-cls-16d93ac1">
                                <h3 className="ext-cls-57765f60">
                                    ✨ Chef's Signatures
                                </h3>
                                <div className="featured-slider scrollbar-hidden ext-cls-07e83c7e">
                                    {featuredItems.map((fItem, idx) => {
              const hasDiscount = fItem.discount_type !== 'none' && fItem.discount_value > 0;
              const basePrice = Number(fItem.price);
              let currentPrice = basePrice;
              let discountBadge = '';
              if (fItem.discount_type === 'percent') {
                currentPrice = basePrice - basePrice * (fItem.discount_value / 100);
                discountBadge = `${fItem.discount_value}% OFF`;
              } else if (fItem.discount_type === 'flat') {
                currentPrice = basePrice - fItem.discount_value;
                discountBadge = `₹${fItem.discount_value} OFF`;
              }
              if (currentPrice < 0) currentPrice = 0;
              const fQty = getItemQty(fItem, null, []);
              return <div key={idx} className="ext-cls-6ac2b390">
                                                {hasDiscount && <div className="ext-cls-76cfc67f">{discountBadge}</div>}
                                                <div className="ext-cls-8035aa17" onClick={() => fItem.image_url && setZoomedImage(getMediaUrl(fItem.image_url))}>
                                                    {fItem.image_url ? <img src={getMediaUrl(fItem.image_url)} alt={fItem.name} className="ext-cls-80fb12aa" /> : <div className="ext-cls-a3801a46"><ChefHat size={32} opacity={0.2} /></div>}
                                                </div>
                                                <div className="ext-cls-8478a686">
                                                    <h5 className="ext-cls-864c90f1">{fItem.name}</h5>
                                                    <div className="ext-cls-ab4ba23a">
                                                        <span className="ext-cls-f26f28a1">₹{Math.round(currentPrice)}</span>
                                                        {hasDiscount && <span className="ext-cls-3df6096d">₹{basePrice}</span>}
                                                    </div>
                                                    {fQty === 0 ? <button onClick={() => handleManualCartUpdate(fItem, 1, null, [])} className="st-cls-a85d508c"><Plus size={14} /> ADD</button> : <div className="ext-cls-e0f712ee">
                                                            <button onClick={() => handleManualCartUpdate(fItem, -1, null, [])} className="st-cls-f69098dc"><Minus size={14} /></button>
                                                            <span className="ext-cls-64a1327f">{fQty}</span>
                                                            <button onClick={() => handleManualCartUpdate(fItem, 1, null, [])} className="st-cls-f69098dc"><Plus size={14} /></button>
                                                        </div>}
                                                </div>
                                            </div>;
            })}
                                </div>
                            </div>}

                        {extendedMenuCategories.map(category => {
          if (activeCategory !== 'All' && category.category !== activeCategory) return null;
          const matchingItems = category.items.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(menuSearchTerm.toLowerCase()) || item.description && item.description.toLowerCase().includes(menuSearchTerm.toLowerCase());
            const vType = item.veg_type ? item.veg_type.toLowerCase() : '';
            const matchesVeg = vegFilter === 'all' || vegFilter === 'veg' && vType !== 'nonveg' && vType !== 'egg' || vegFilter === 'nonveg' && vType === 'nonveg';
            return matchesSearch && matchesVeg;
          });
          if (matchingItems.length === 0) return null;
          const isExpanded = menuSearchTerm.length > 0 || activeCategory !== 'All' || expandedCats.has(category.category);
          return <div key={category.category} className={`menu-category ${isExpanded ? 'expanded' : 'collapsed'}`}>
                                    <div className="category-header-row" onClick={() => toggleCategory(category.category)}>
                                        <h5 className="category-title">{category.category} ({matchingItems.length})</h5>
                                        {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                                    </div>

                                    {isExpanded && <div className="category-items animate-fade-in">
                                            {matchingItems.map(item => {
                let itemOptions = item.options || [];
                if (typeof itemOptions === 'string') {
                  try {
                    itemOptions = JSON.parse(itemOptions);
                  } catch (e) {
                    itemOptions = [];
                  }
                }
                let itemAddons = item.addons || [];
                if (typeof itemAddons === 'string') {
                  try {
                    itemAddons = JSON.parse(itemAddons);
                  } catch (e) {
                    itemAddons = [];
                  }
                }
                const catStr = category.category.toLowerCase();
                if (itemOptions.length === 0 && (catStr.includes('whiskey') || catStr.includes('beer') || catStr.includes('drink') || catStr.includes('liquor'))) {
                  itemOptions = catStr.includes('beer') ? [{
                    size: 'Pint (330ml)',
                    price: item.price || 150
                  }, {
                    size: 'Mug (500ml)',
                    price: (item.price || 150) * 1.5
                  }, {
                    size: 'Bucket (6 Pints)',
                    price: (item.price || 150) * 5
                  }] : [{
                    size: '30ml',
                    price: item.price || 150
                  }, {
                    size: '60ml',
                    price: (item.price || 150) * 2
                  }, {
                    size: 'Pauva (180ml)',
                    price: (item.price || 150) * 5
                  }, {
                    size: 'Bottle (750ml)',
                    price: (item.price || 150) * 18
                  }];
                }
                const nameStr = (item.name || '').toLowerCase();
                if (itemAddons.length === 0 && (catStr.includes('coffee') || catStr.includes('frappe') || nameStr.includes('coffee') || nameStr.includes('frappe') || nameStr.includes('coke'))) {
                  itemAddons = [{
                    name: 'Espresso Shot',
                    price: 40
                  }, {
                    name: 'Ice Cream (Vanilla)',
                    price: 30
                  }, {
                    name: 'Chocolate Syrup',
                    price: 40
                  }];
                }
                const hasVariants = itemOptions.length > 0;
                const hasAddons = itemAddons.length > 0;
                const selectedVariantSize = selectedVariants[item.id] || (hasVariants ? itemOptions[0].size : null);
                const selectedVariant = hasVariants ? itemOptions.find(o => o.size === selectedVariantSize) : null;
                const selectedAddons = selectedAddonsMap[item.id] || [];
                const baseVariantPrice = selectedVariant ? Number(selectedVariant.price) : Number(item.price);
                let discountedPrice = baseVariantPrice;
                let hasDiscount = false;
                let discountBadge = '';
                let dVal = Number(item.discount_value || 0);
                let displayDVal = Number.isInteger(dVal) ? dVal : dVal.toFixed(2);
                if (item.discount_type === 'percent' && dVal > 0) {
                  hasDiscount = true;
                  discountedPrice = baseVariantPrice - baseVariantPrice * (dVal / 100);
                  discountBadge = `${displayDVal}% OFF`;
                } else if (item.discount_type === 'flat' && dVal > 0) {
                  hasDiscount = true;
                  discountedPrice = baseVariantPrice - dVal;
                  discountBadge = `₹${displayDVal} OFF`;
                }
                if (discountedPrice < 0) discountedPrice = 0;
                const addonsPrice = selectedAddons.reduce((sum, a) => sum + Number(a.price || 0), 0);
                const currentPrice = Math.round(discountedPrice) + addonsPrice;
                const originalDisplayPrice = baseVariantPrice + addonsPrice;
                const qty = getItemQty(item, null, []);
                let outOfTime = false;
                let timeMsg = '';
                if (item.available_from && item.available_to) {
                  const now = new Date();
                  const currVal = now.getHours() * 60 + now.getMinutes();
                  let [fH, fM] = item.available_from.split(':').map(Number);
                  let [tH, tM] = item.available_to.split(':').map(Number);
                  const fromVal = fH * 60 + (fM || 0);
                  const toVal = tH * 60 + (tM || 0);
                  if (fromVal <= toVal) {
                    if (currVal < fromVal || currVal > toVal) outOfTime = true;
                  } else {
                    if (currVal < fromVal && currVal > toVal) outOfTime = true;
                  }
                  if (outOfTime) {
                    const formatAMPM = (h, m) => `${h % 12 || 12}:${String(m || 0).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
                    timeMsg = `Available ${formatAMPM(fH, fM)} - ${formatAMPM(tH, tM)}`;
                  }
                }
                const isUnavailable = item.is_active === false || outOfTime;
                return <div key={item.id} className={`premium-menu-item animate-slide-up ${isUnavailable ? 'unavailable' : ''}`}>
                                                        <div className="item-media">
                                                            {item.image_url ? <img src={getMediaUrl(item.image_url)} alt={item.name} className="item-thumb" onClick={() => setZoomedImage(getMediaUrl(item.image_url))} /> : <div className="item-thumb-placeholder"><ChefHat size={24} /></div>}
                                                            {isUnavailable && <div className="unavailable-overlay" style={timeMsg ? {
                      background: 'rgba(0,0,0,0.8)',
                      color: '#eab308'
                    } : {}}>
                                                                    {timeMsg ? <span className="ext-cls-93b55857">{timeMsg}</span> : 'SOLD OUT'}
                                                                </div>}
                                                            {item.video_url && <div className="video-dot-indicator"><Play size={8} fill="white" /></div>}
                                                        </div>

                                                        <div className="item-details">
                                                            <div className="item-header">
                                                                <h6 className="item-name ext-cls-afade7f3">
                                                                    {item.veg_type === 'veg' && <div className="ext-cls-ae45e9ff">
                                                                            <div className="ext-cls-43522f59"></div>
                                                                        </div>}
                                                                    {item.veg_type === 'nonveg' && <div className="ext-cls-8bce84d5">
                                                                            <div className="ext-cls-1d88b8d6"></div>
                                                                        </div>}
                                                                    {item.veg_type === 'egg' && <div className="ext-cls-68d4df2e">
                                                                            <div className="ext-cls-8882b236"></div>
                                                                        </div>}
                                                                    {item.name}
                                                                    {item.stall_name && <span className="ex-style-13ab78">
                                                                            {item.stall_name}
                                                                        </span>}
                                                                    {item.spice_level > 0 && <span className="ext-cls-90e26b58">
                                                                            {'🌶️'.repeat(Math.min(item.spice_level, 5))}
                                                                        </span>}
                                                                </h6>
                                                                <div className="ext-cls-7dd8456c">
                                                                    <div className="ext-cls-cd210fb4">
                                                                        <span className="item-price ext-cls-5e0c7af4">₹{currentPrice}</span>
                                                                        {hasDiscount && <span className="ext-cls-9cd9d24f">₹{Math.round(originalDisplayPrice)}</span>}
                                                                    </div>
                                                                    {hasDiscount && <span className="ext-cls-483d84ed">{discountBadge}</span>}
                                                                </div>
                                                            </div>
                                                            <div className="ext-cls-9c3ab494">
                                                                {item.is_best_seller && <span className="ext-cls-2df3e3a1">🔥 BEST SELLER</span>}
                                                                {item.is_today_special && <span className="ext-cls-bf76c169">✨ TODAY'S SPECIAL</span>}
                                                                {item.is_chef_special && <span className="ext-cls-3b3a0ae6">👨‍🍳 CHEF'S SPECIAL</span>}
                                                            </div>
                                                            <p className="item-description ext-cls-8221376a">{item.description || "Delicately crafted for your tech palate."}</p>

                                                            {item.is_combo && Array.isArray(item.combo_components) && item.combo_components.length > 0 && <div className="ext-cls-eefe7a74">
                                                                    <p className="ext-cls-b2705f46">
                                                                        <span className="ext-cls-507943c3">Includes:</span> {item.combo_components.map(c => `${c.qty}x ${c.name}`).join(' + ')}
                                                                    </p>
                                                                </div>}

                                                            {item.allow_coupons === false && <p className="ext-cls-3f3408fb">
                                                                    🚫 Not eligible for coupons
                                                                </p>}

                                                            {(hasVariants || hasAddons) && !item.is_combo && <p className="ext-cls-9a7565e0">Customisable</p>}

                                                            <div className="item-actions-row">
                                                                {isUnavailable ? <button className="add-btn-disabled" disabled>Unavailable</button> : qty === 0 ? <button className="add-btn-primary" onClick={() => hasVariants || hasAddons ? openCustomization(item, itemOptions, itemAddons) : handleManualCartUpdate(item, 1, selectedVariant, selectedAddons)}>
                                                                        <Plus size={14} /> ADD
                                                                    </button> : <div className="qty-controls-premium">
                                                                        <button onClick={() => hasVariants || hasAddons ? openCustomizationPicker(item, itemOptions, itemAddons) : handleManualCartUpdate(item, -1, selectedVariant, selectedAddons)}><Minus size={14} /></button>
                                                                        <span className="qty-val">{qty}</span>
                                                                        <button onClick={() => hasVariants || hasAddons ? openCustomizationPicker(item, itemOptions, itemAddons) : handleManualCartUpdate(item, 1, selectedVariant, selectedAddons)}><Plus size={14} /></button>
                                                                    </div>}
                                                            </div>
                                                        </div>
                                                    </div>;
              })}
                                        </div>}
                                </div>;
        })}
                    </>}
            </div>
            {getCartCount() > 0 && <div className="menu-cart-footer slide-up">
                    <div className="cart-total">
                        <ShoppingCart size={20} />
                        <span>₹{getCartTotal()}</span>
                    </div>
                    <button className="confirm-btn-footer" onClick={() => setShowCartSummary(true)}>
                        {'Go to Cart'} <ChevronRight size={18} />
                    </button>
                </div>}
            {customizingItem && (() => {
      const bVariant = tempVariant ? customizingItem.options.find(o => o.size === tempVariant) : null;
      const bPrice = bVariant ? Number(bVariant.price) : Number(customizingItem.price);
      const addonsTot = tempAddons.reduce((sum, a) => sum + Number(a.price || 0), 0);
      const custTotal = (bPrice + addonsTot) * tempQty;
      const isEditing = !!customizingItem.editFromCartItem;
      return <div className="cart-summary-overlay animate-fade-in st-cls-579dd541" onClick={() => setCustomizingItem(null)}>
                        <div className="cart-summary-modal zomato-modal slide-up st-cls-2f5f82af" onClick={e => e.stopPropagation()}>
                            <div className="ext-cls-6daf4a30">
                                {customizingItem.image_url ? <img src={getMediaUrl(customizingItem.image_url)} alt="food" className="ext-cls-91e3328d" /> : <div className="ext-cls-a9bf037a"><ChefHat size={20} color="#fff" /></div>}
                                <h3 style={{
              fontSize: '18px',
              fontWeight: '800',
              ...{}
            }}>{customizingItem.name}</h3>
                                <button onClick={() => setCustomizingItem(null)} className="st-cls-04465236">×</button>
                            </div>

                            <div className="custom-scrollbar ext-cls-89472074">
                                {customizingItem.options.length > 0 && <div className="ext-cls-45aa22f3">
                                        <div className="ext-cls-3664c5f4">
                                            <h4 className="ext-cls-b10f50c6">Quantity / Size</h4>
                                            <p className="ext-cls-76847ffc">Required • Select 1 option</p>
                                        </div>
                                        {customizingItem.options.map((opt, idx) => <div key={idx} onClick={() => setTempVariant(opt.size)} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 0',
                borderBottom: idx !== customizingItem.options.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                cursor: 'pointer'
              }}>
                                                <div className="ext-cls-9fdd7fb0">
                                                    <span className="ext-cls-69f8da27">
                                                        <span className="ext-cls-14782637"></span>
                                                    </span>
                                                    <span className="ext-cls-c72e1af6">{opt.size}</span>
                                                </div>
                                                <div className="ext-cls-cc0ebbd6">
                                                    <span className="ext-cls-0f578bd7">₹{opt.price}</span>
                                                    <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    border: `2px solid ${tempVariant === opt.size ? '#00e676' : 'rgba(255,255,255,0.2)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                                                        {tempVariant === opt.size && <div className="ext-cls-4b752971"></div>}
                                                    </div>
                                                </div>
                                            </div>)}
                                    </div>}

                                {customizingItem.addons.length > 0 && <div className="ext-cls-45aa22f3">
                                        <div className="ext-cls-3664c5f4">
                                            <h4 className="ext-cls-b10f50c6">Add Ons</h4>
                                            <p className="ext-cls-76847ffc">Choose optional addons</p>
                                        </div>
                                        {customizingItem.addons.map((addon, idx) => {
                const isSelected = tempAddons.find(a => a.name === addon.name);
                return <div key={idx} onClick={() => handleTempAddonToggle(addon)} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 0',
                  borderBottom: idx !== customizingItem.addons.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                  cursor: 'pointer'
                }}>
                                                    <div className="ext-cls-9fdd7fb0">
                                                        <span className="ext-cls-69f8da27">
                                                            <span className="ext-cls-14782637"></span>
                                                        </span>
                                                        <span className="ext-cls-c72e1af6">{addon.name}</span>
                                                    </div>
                                                    <div className="ext-cls-cc0ebbd6">
                                                        <span className="ext-cls-0f578bd7">₹{addon.price}</span>
                                                        <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '4px',
                      border: `2px solid ${isSelected ? '#00e676' : 'rgba(255,255,255,0.2)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: isSelected ? '#00e676' : 'transparent'
                    }}>
                                                            {isSelected && <span className="ext-cls-38d4f7cb">✓</span>}
                                                        </div>
                                                    </div>
                                                </div>;
              })}
                                    </div>}
                            </div>

                            <div className="ext-cls-0fdf5fd9">
                                <div className="ext-cls-3cf8e96a">
                                    <button onClick={() => setTempQty(Math.max(1, tempQty - 1))} className="st-cls-ea861532"><Minus size={18} /></button>
                                    <span className="ext-cls-6add94a1">{tempQty}</span>
                                    <button onClick={() => setTempQty(tempQty + 1)} className="st-cls-ea861532"><Plus size={18} /></button>
                                </div>
                                <button onClick={confirmCustomization} className="ext-cls-6d5c6501">
                                    {isEditing ? `Update item - ₹${custTotal}` : `Add item - ₹${custTotal}`}
                                </button>
                            </div>
                        </div>
                    </div>;
    })()}

            {pickingCustomizationItem && (() => {
      const cartInstances = currentCart.filter(c => String(c.id) === String(pickingCustomizationItem.id));
      if (cartInstances.length === 0) {
        setTimeout(() => setPickingCustomizationItem(null), 0);
        return null;
      }
      return <div className="cart-summary-overlay animate-fade-in st-cls-579dd541" onClick={() => setPickingCustomizationItem(null)}>
                        <div className="cart-summary-modal zomato-modal slide-up st-cls-413bb026" onClick={e => e.stopPropagation()}>
                            <div className="ext-cls-4b4d85b2">
                                <h3 className="ext-cls-4a7d9268">Choose customisation</h3>
                                <button onClick={() => setPickingCustomizationItem(null)} className="st-cls-1743ee84">×</button>
                            </div>

                            <div className="custom-scrollbar ext-cls-256d43e1">
                                {cartInstances.map((cItem, idx) => {
              const variantStr = cItem.selectedVariant ? cItem.selectedVariant.size : '';
              const addonsStr = cItem.selectedAddons && cItem.selectedAddons.length > 0 ? cItem.selectedAddons.map(a => a.name).join(', ') : '';
              const subText = [variantStr, addonsStr].filter(Boolean).join(', ');
              return <div key={cItem.cartId} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px 0',
                borderBottom: idx !== cartInstances.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none'
              }}>
                                            <div className="ext-cls-294e1bbe">
                                                <div className="ext-cls-a9d65680">
                                                    <span className="ext-cls-69f8da27">
                                                        <span className="ext-cls-14782637"></span>
                                                    </span>
                                                    <span className="ext-cls-d64fb5fc">{cItem.name}</span>
                                                </div>
                                                {subText && <p className="ext-cls-369bd971">{subText}</p>}
                                                <div className="ext-cls-cc0ebbd6">
                                                    <p className="ext-cls-fb310a2d">₹{cItem.price}</p>
                                                    <button onClick={() => openCustomization(pickingCustomizationItem, pickingCustomizationItem.options, pickingCustomizationItem.addons, cItem)} className="st-cls-2484a034">
                                                        Edit <ChevronRight size={10} className="ext-cls-b72ed605" />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="qty-controls-premium ext-cls-b4959e99">
                                                <button onClick={() => handleManualCartUpdate(cItem, -1, cItem.selectedVariant, cItem.selectedAddons)} className="st-cls-524b4cd3"><Minus size={14} /></button>
                                                <span className="qty-val ext-cls-4c4f402a">{cItem.qty}</span>
                                                <button onClick={() => handleManualCartUpdate(cItem, 1, cItem.selectedVariant, cItem.selectedAddons)} className="st-cls-524b4cd3"><Plus size={14} /></button>
                                            </div>
                                        </div>;
            })}
                            </div>

                            <div className="ext-cls-c56449a7">
                                <button onClick={() => openCustomization(pickingCustomizationItem, pickingCustomizationItem.options, pickingCustomizationItem.addons)} className="st-cls-20bbbbd1">
                                    + Add new customisation
                                </button>
                            </div>
                        </div>
                    </div>;
    })()}

            {showVegOffConfirm && <div className="modal-overlay ext-cls-02b1ca14" onClick={() => setShowVegOffConfirm(false)}>
                    <div className="booking-modal animate-slide-up ext-cls-ea70d64e" onClick={e => e.stopPropagation()}>
                        <div className="ext-cls-89dd369b">
                            <span className="ext-cls-16d9dd3f">!</span>
                        </div>
                        <h3 className="view-title ext-cls-3ddb7e52">Switch off Veg Mode?</h3>
                        <p className="text-muted ext-cls-e54a5860">
                            You'll see all restaurants, including those serving non-veg dishes
                        </p>
                        <div className="ext-cls-6ccca837">
                            <button className="btn-secondary ext-cls-a5042d5a" onClick={() => {
            setVegFilter('all');
            setShowVegOffConfirm(false);
          }}>
                                Switch off
                            </button>
                            <button className="btn-primary ext-cls-2339886a" onClick={() => setShowVegOffConfirm(false)}>
                                Keep using this mode
                            </button>
                        </div>
                    </div>
                </div>}
        </div>;
};
export default MenuSystem;