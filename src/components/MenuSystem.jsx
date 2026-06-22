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
    const [vegFilter, setVegFilter] = useState('all'); // 'all', 'veg', 'nonveg'
    const [showVegOffConfirm, setShowVegOffConfirm] = useState(false);

    // Inject "Recommended" virtual categories (Top Picks, Today's Special, etc.)
    const extendedMenuCategories = React.useMemo(() => {
        if (!menuCategories) return [];
        let allItems = [];
        menuCategories.forEach(c => { allItems = allItems.concat(c.items) });

        // Remove duplicates just in case
        allItems = Array.from(new Map(allItems.map(i => [i.id, i])).values());

        let bestSellers = allItems.filter(i => i.is_best_seller);
        let todaySpecials = allItems.filter(i => i.is_today_special);
        let chefSpecials = allItems.filter(i => i.is_chef_special);

        let virtualCats = [];
        if (todaySpecials.length > 0) virtualCats.push({ category: "✨ Today's Special", items: todaySpecials, isVirtual: true });
        if (bestSellers.length > 0) virtualCats.push({ category: "🔥 Best Sellers", items: bestSellers, isVirtual: true });
        if (chefSpecials.length > 0) virtualCats.push({ category: "👨‍🍳 Chef's Special", items: chefSpecials, isVirtual: true });

        return [...virtualCats, ...menuCategories];
    }, [menuCategories]);
    const [selectedVariants, setSelectedVariants] = useState({}); // { itemId: variantSize }
    const [selectedAddonsMap, setSelectedAddonsMap] = useState({}); // { itemId: [addonObj] }
    const [customizingItem, setCustomizingItem] = useState(null); // the item to customize
    const [pickingCustomizationItem, setPickingCustomizationItem] = useState(null); // the item to pick which variant to edit
    const [tempVariant, setTempVariant] = useState(null);
    const [tempAddons, setTempAddons] = useState([]);
    const [tempQty, setTempQty] = useState(1);

    const handleVariantChange = (itemId, size) => {
        setSelectedVariants(prev => ({ ...prev, [itemId]: size }));
    };

    const toggleAddon = (itemId, addon) => {
        setSelectedAddonsMap(prev => {
            const current = prev[itemId] || [];
            const exists = current.find(a => a.name === addon.name);
            if (exists) return { ...prev, [itemId]: current.filter(a => a.name !== addon.name) };
            return { ...prev, [itemId]: [...current, addon] };
        });
    };

    const openCustomization = (item, options, addons, cItemToEdit = null) => {
        setCustomizingItem({ ...item, options, addons, editFromCartItem: cItemToEdit });
        if (cItemToEdit) {
            setTempVariant(cItemToEdit.selectedVariant ? cItemToEdit.selectedVariant.size : (options.length > 0 ? options[0].size : null));
            setTempAddons(cItemToEdit.selectedAddons || []);
            setTempQty(cItemToEdit.qty); // default to modifying the whole stack or 1? Let's default to 1 for precise editing
        } else {
            setTempVariant(options.length > 0 ? options[0].size : null);
            setTempAddons([]);
            setTempQty(1);
        }
        setPickingCustomizationItem(null);
    };

    const openCustomizationPicker = (item, options, addons) => {
        setPickingCustomizationItem({ ...item, options, addons });
    };

    const handleTempAddonToggle = (addon) => {
        const exists = tempAddons.find(a => a.name === addon.name);
        if (exists) setTempAddons(tempAddons.filter(a => a.name !== addon.name));
        else setTempAddons([...tempAddons, addon]);
    };

    const confirmCustomization = () => {
        if (!customizingItem) return;
        const optObj = tempVariant ? customizingItem.options.find(o => o.size === tempVariant) : null;

        if (customizingItem.editFromCartItem) {
            // Remove the exact old cart item completely (qty: -oldQty) then add new one with new qty
            handleManualCartUpdate(customizingItem.editFromCartItem, -customizingItem.editFromCartItem.qty, customizingItem.editFromCartItem.selectedVariant, customizingItem.editFromCartItem.selectedAddons);
        }

        handleManualCartUpdate(customizingItem, tempQty, optObj, tempAddons);

        // Sync back to main state so regular +/- works cleanly with last selection
        setSelectedVariants(prev => ({ ...prev, [customizingItem.id]: tempVariant }));
        setSelectedAddonsMap(prev => ({ ...prev, [customizingItem.id]: tempAddons }));

        setCustomizingItem(null);
    };

    const handleCategoryWheel = (e) => {
        if (categoryScrollRef.current) {
            categoryScrollRef.current.scrollLeft += e.deltaY;
        }
    };

    const featuredItems = (menuCategories || []).flatMap(c => c.items || []).filter(item => {
        if (!item.is_featured) return false;
        const vType = item.veg_type ? item.veg_type.toLowerCase() : '';
        return vegFilter === 'all' ||
            (vegFilter === 'veg' && vType !== 'nonveg') ||
            (vegFilter === 'nonveg' && vType === 'nonveg');
    });
    const [isActive, setIsActive] = useState(false);
    const contentRef = useRef(null);

    useEffect(() => {
        // Short delay to ensure transition triggers
        const timer = setTimeout(() => setIsActive(true), 10);
        return () => clearTimeout(timer);
    }, []);



    return (
        <div className={`premium-menu-panel ${isActive ? 'active' : ''}`}>
            <div className="menu-header">
                <div className="menu-header-top">
                    <div className="menu-title-area">
                        <h4>{restaurantName || 'AI RESTO'}</h4>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', whiteSpace: 'nowrap' }} className="scrollbar-hidden">
                    <div className="menu-search-wrapper" style={{ flex: 1, minWidth: '150px', margin: 0 }}>
                        <Search size={18} className="search-icon" />
                        <input
                            type="text"
                            className="menu-search-input"
                            placeholder="Search..."
                            value={menuSearchTerm}
                            onChange={(e) => setMenuSearchTerm(e.target.value)}
                        />
                        {menuSearchTerm && (
                            <button className="clear-search-btn" onClick={() => setMenuSearchTerm('')}>×</button>
                        )}
                    </div>

                    <div
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, padding: '0 8px' }}
                        onClick={() => {
                            if (vegFilter === 'veg') {
                                setShowVegOffConfirm(true);
                            } else {
                                setVegFilter('veg');
                            }
                        }}
                    >
                        <span style={{ fontSize: '10px', fontWeight: '900', color: vegFilter === 'veg' ? '#219653' : 'var(--text-muted)', lineHeight: '1.2', textAlign: 'center', marginBottom: '4px' }}>VEG<br />MODE</span>
                        <div style={{
                            width: '38px', height: '22px', borderRadius: '11px',
                            background: vegFilter === 'veg' ? '#219653' : '#3f3f46',
                            border: `1px solid ${vegFilter === 'veg' ? '#219653' : 'rgba(255,255,255,0.1)'}`,
                            position: 'relative', transition: 'background 0.3s'
                        }}>
                            <div style={{
                                width: '16px', height: '16px', borderRadius: '50%', background: '#fff',
                                position: 'absolute', top: '2px', left: vegFilter === 'veg' ? 'calc(100% - 18px)' : '2px',
                                transition: 'left 0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: vegFilter === 'veg' ? '0 2px 4px rgba(33,150,83,0.3)' : 'none'
                            }}>
                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: vegFilter === 'veg' ? '#219653' : '#ef4444' }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    ref={categoryScrollRef}
                    className="category-quick-links scrollbar-hidden"
                    onWheel={handleCategoryWheel}
                >
                    <button
                        className={`category-chip ${activeCategory === 'All' ? 'active' : ''}`}
                        onClick={() => setActiveCategory('All')}
                    >
                        All <span style={{ opacity: 0.7, fontSize: '0.85em', marginLeft: '4px' }}>({extendedMenuCategories.reduce((acc, cat) => cat.isVirtual ? acc : acc + cat.items.length, 0)})</span>
                    </button>
                    {extendedMenuCategories.map((cat) => (
                        <button
                            key={cat.category}
                            className={`category-chip ${activeCategory === cat.category ? 'active' : ''}`}
                            onClick={() => setActiveCategory(cat.category)}
                        >
                            {cat.category} <span style={{ opacity: 0.7, fontSize: '0.85em', marginLeft: '4px' }}>({cat.items.length})</span>
                        </button>
                    ))}
                </div>
            </div>

            <div ref={contentRef} className="menu-content scrollbar-hidden">
                {(!menuCategories || menuCategories.length === 0) ? (
                    <div className="menu-skeletons">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="premium-menu-item skeleton-item">
                                <div className="skeleton-img shimmer"></div>
                                <div className="item-details skeleton-details">
                                    <div className="item-header">
                                        <div className="skeleton-line title shimmer"></div>
                                        <div className="skeleton-line price shimmer"></div>
                                    </div>
                                    <div className="skeleton-line desc shimmer"></div>
                                    <div className="skeleton-line button shimmer"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <>
                        {activeCategory === 'All' && menuSearchTerm === '' && featuredItems.length > 0 && (
                            <div style={{ marginBottom: '24px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: '900', margin: '0 16px 12px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    ✨ Chef's Signatures
                                </h3>
                                <div className="featured-slider scrollbar-hidden" style={{ display: 'flex', gap: '16px', overflowX: 'auto', padding: '0 16px 16px 16px', scrollSnapType: 'x mandatory' }}>
                                    {featuredItems.map((fItem, idx) => {
                                        const hasDiscount = fItem.discount_type !== 'none' && fItem.discount_value > 0;
                                        const basePrice = Number(fItem.price);
                                        let currentPrice = basePrice;
                                        let discountBadge = '';
                                        if (fItem.discount_type === 'percent') {
                                            currentPrice = basePrice - (basePrice * (fItem.discount_value / 100));
                                            discountBadge = `${fItem.discount_value}% OFF`;
                                        } else if (fItem.discount_type === 'flat') {
                                            currentPrice = basePrice - fItem.discount_value;
                                            discountBadge = `₹${fItem.discount_value} OFF`;
                                        }
                                        if (currentPrice < 0) currentPrice = 0;
                                        const fQty = getItemQty(fItem, null, []);

                                        return (
                                            <div key={idx} style={{ minWidth: '160px', width: '160px', flexShrink: 0, scrollSnapAlign: 'start', background: 'var(--card-bg)', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', border: '1px solid var(--card-border)', position: 'relative' }}>
                                                {hasDiscount && (
                                                    <div style={{ position: 'absolute', top: '8px', left: '8px', background: 'linear-gradient(90deg, #ff0f7b, #f89b29)', color: 'white', fontSize: '10px', fontWeight: '900', padding: '2px 8px', borderRadius: '8px', zIndex: 10 }}>{discountBadge}</div>
                                                )}
                                                <div style={{ width: '100%', height: '120px', background: 'var(--bg-secondary)', overflow: 'hidden' }} onClick={() => fItem.image_url && setZoomedImage(getMediaUrl(fItem.image_url))}>
                                                    {fItem.image_url ? (
                                                        <img src={getMediaUrl(fItem.image_url)} alt={fItem.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    ) : (
                                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ChefHat size={32} opacity={0.2} /></div>
                                                    )}
                                                </div>
                                                <div style={{ padding: '12px' }}>
                                                    <h5 style={{ fontSize: '14px', fontWeight: '800', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{fItem.name}</h5>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                                                        <span style={{ fontSize: '14px', fontWeight: '900', color: 'var(--accent-primary)' }}>₹{Math.round(currentPrice)}</span>
                                                        {hasDiscount && <span style={{ fontSize: '11px', textDecoration: 'line-through', color: 'var(--text-muted)' }}>₹{basePrice}</span>}
                                                    </div>
                                                    {fQty === 0 ? (
                                                        <button onClick={() => handleManualCartUpdate(fItem, 1, null, [])} style={{ width: '100%', padding: '8px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-main)', border: '1px solid var(--card-border)', borderRadius: '8px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', transition: 'all 0.2s' }}><Plus size={14} /> ADD</button>
                                                    ) : (
                                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', padding: '4px', borderRadius: '8px', color: 'white' }}>
                                                            <button onClick={() => handleManualCartUpdate(fItem, -1, null, [])} style={{ border: 'none', background: 'transparent', color: 'white', padding: '4px', cursor: 'pointer' }}><Minus size={14} /></button>
                                                            <span style={{ fontWeight: '800', fontSize: '14px' }}>{fQty}</span>
                                                            <button onClick={() => handleManualCartUpdate(fItem, 1, null, [])} style={{ border: 'none', background: 'transparent', color: 'white', padding: '4px', cursor: 'pointer' }}><Plus size={14} /></button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        {extendedMenuCategories.map((category) => {
                            if (activeCategory !== 'All' && category.category !== activeCategory) return null;

                            const matchingItems = category.items.filter(item => {
                                const matchesSearch = item.name.toLowerCase().includes(menuSearchTerm.toLowerCase()) ||
                                    (item.description && item.description.toLowerCase().includes(menuSearchTerm.toLowerCase()));

                                const vType = item.veg_type ? item.veg_type.toLowerCase() : '';
                                const matchesVeg = vegFilter === 'all' ||
                                    (vegFilter === 'veg' && vType !== 'nonveg' && vType !== 'egg') ||
                                    (vegFilter === 'nonveg' && vType === 'nonveg');

                                return matchesSearch && matchesVeg;
                            });

                            if (matchingItems.length === 0) return null;

                            const isExpanded = menuSearchTerm.length > 0 || activeCategory !== 'All' || expandedCats.has(category.category);

                            return (
                                <div key={category.category} className={`menu-category ${isExpanded ? 'expanded' : 'collapsed'}`}>
                                    <div className="category-header-row" onClick={() => toggleCategory(category.category)}>
                                        <h5 className="category-title">{category.category} ({matchingItems.length})</h5>
                                        {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                                    </div>

                                    {isExpanded && (
                                        <div className="category-items animate-fade-in">
                                            {matchingItems.map((item) => {
                                                // Handle Variants logic (mocking variants if the category matches drinks/liquors)
                                                let itemOptions = item.options || [];
                                                if (typeof itemOptions === 'string') {
                                                    try { itemOptions = JSON.parse(itemOptions); } catch (e) { itemOptions = []; }
                                                }
                                                let itemAddons = item.addons || [];
                                                if (typeof itemAddons === 'string') {
                                                    try { itemAddons = JSON.parse(itemAddons); } catch (e) { itemAddons = []; }
                                                }

                                                // Mock variants for 'Whiskey', 'Beer' etc. if options are empty
                                                const catStr = category.category.toLowerCase();
                                                if (itemOptions.length === 0 && (catStr.includes('whiskey') || catStr.includes('beer') || catStr.includes('drink') || catStr.includes('liquor'))) {
                                                    itemOptions = catStr.includes('beer') ?
                                                        [{ size: 'Pint (330ml)', price: item.price || 150 }, { size: 'Mug (500ml)', price: (item.price || 150) * 1.5 }, { size: 'Bucket (6 Pints)', price: (item.price || 150) * 5 }] :
                                                        [{ size: '30ml', price: item.price || 150 }, { size: '60ml', price: (item.price || 150) * 2 }, { size: 'Pauva (180ml)', price: (item.price || 150) * 5 }, { size: 'Bottle (750ml)', price: (item.price || 150) * 18 }];
                                                }

                                                // Mock addons for Coffee to demonstrate checkbox feature
                                                const nameStr = (item.name || '').toLowerCase();
                                                if (itemAddons.length === 0 && (catStr.includes('coffee') || catStr.includes('frappe') || nameStr.includes('coffee') || nameStr.includes('frappe') || nameStr.includes('coke'))) {
                                                    itemAddons = [
                                                        { name: 'Espresso Shot', price: 40 },
                                                        { name: 'Ice Cream (Vanilla)', price: 30 },
                                                        { name: 'Chocolate Syrup', price: 40 }
                                                    ];
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
                                                    discountedPrice = baseVariantPrice - (baseVariantPrice * (dVal / 100));
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
                                                const isUnavailable = item.is_active === false;

                                                return (
                                                    <div key={item.id} className={`premium-menu-item animate-slide-up ${isUnavailable ? 'unavailable' : ''}`}>
                                                        <div className="item-media">
                                                            {item.image_url ? (
                                                                <img
                                                                    src={getMediaUrl(item.image_url)}
                                                                    alt={item.name}
                                                                    className="item-thumb"
                                                                    onClick={() => setZoomedImage(getMediaUrl(item.image_url))}
                                                                />
                                                            ) : (
                                                                <div className="item-thumb-placeholder"><ChefHat size={24} /></div>
                                                            )}
                                                            {isUnavailable && <div className="unavailable-overlay">SOLD OUT</div>}
                                                            {item.video_url && <div className="video-dot-indicator"><Play size={8} fill="white" /></div>}
                                                        </div>

                                                        <div className="item-details">
                                                            <div className="item-header">
                                                                <h6 className="item-name" style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                                                    {item.veg_type === 'veg' && (
                                                                        <div style={{ width: '12px', height: '12px', border: '1px solid #22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '2px', flexShrink: 0 }}>
                                                                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e' }}></div>
                                                                        </div>
                                                                    )}
                                                                    {item.veg_type === 'nonveg' && (
                                                                        <div style={{ width: '12px', height: '12px', border: '1px solid #ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '2px', flexShrink: 0 }}>
                                                                            <div style={{ width: '0', height: '0', borderLeft: '3px solid transparent', borderRight: '3px solid transparent', borderBottom: '6px solid #ef4444' }}></div>
                                                                        </div>
                                                                    )}
                                                                    {item.veg_type === 'egg' && (
                                                                        <div style={{ width: '12px', height: '12px', border: '1px solid #eab308', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '2px', flexShrink: 0 }}>
                                                                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#eab308' }}></div>
                                                                        </div>
                                                                    )}
                                                                    {item.name}
                                                                    {item.spice_level > 0 && (
                                                                        <span style={{ fontSize: '10px', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', padding: '1px 4px', borderRadius: '4px', letterSpacing: '1px' }}>
                                                                            {'🌶️'.repeat(Math.min(item.spice_level, 5))}
                                                                        </span>
                                                                    )}
                                                                </h6>
                                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                        <span className="item-price" style={{ color: 'var(--text-main)', fontSize: '15px' }}>₹{currentPrice}</span>
                                                                        {hasDiscount && (
                                                                            <span style={{ fontSize: '12px', textDecoration: 'line-through', color: 'var(--text-muted)', fontWeight: '500' }}>₹{Math.round(originalDisplayPrice)}</span>
                                                                        )}
                                                                    </div>
                                                                    {hasDiscount && (
                                                                        <span style={{ fontSize: '11px', color: '#3b82f6', fontWeight: '800', letterSpacing: '0.5px' }}>{discountBadge}</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
                                                                {item.is_best_seller && (
                                                                    <span style={{ fontSize: '10px', background: 'rgba(234, 179, 8, 0.15)', color: '#eab308', padding: '2px 6px', borderRadius: '4px', fontWeight: '800', letterSpacing: '0.5px' }}>🔥 BEST SELLER</span>
                                                                )}
                                                                {item.is_today_special && (
                                                                    <span style={{ fontSize: '10px', background: 'rgba(124, 58, 237, 0.15)', color: 'var(--accent-primary)', padding: '2px 6px', borderRadius: '4px', fontWeight: '800', letterSpacing: '0.5px' }}>✨ TODAY'S SPECIAL</span>
                                                                )}
                                                                {item.is_chef_special && (
                                                                    <span style={{ fontSize: '10px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '2px 6px', borderRadius: '4px', fontWeight: '800', letterSpacing: '0.5px' }}>👨‍🍳 CHEF'S SPECIAL</span>
                                                                )}
                                                            </div>
                                                            <p className="item-description" style={{ marginTop: '4px' }}>{item.description || "Delicately crafted for your tech palate."}</p>

                                                            {item.is_combo && Array.isArray(item.combo_components) && item.combo_components.length > 0 && (
                                                                <div style={{ marginTop: '6px', padding: '6px 8px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                                                                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0, fontWeight: '600' }}>
                                                                        <span style={{ color: 'var(--accent-primary)' }}>Includes:</span> {item.combo_components.map(c => `${c.qty}x ${c.name}`).join(' + ')}
                                                                    </p>
                                                                </div>
                                                            )}

                                                            {item.allow_coupons === false && (
                                                                <p style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '6px' }}>
                                                                    🚫 Not eligible for coupons
                                                                </p>
                                                            )}

                                                            {(hasVariants || hasAddons) && !item.is_combo && (
                                                                <p style={{ fontSize: '11px', color: 'var(--accent-primary)', fontWeight: '600', marginTop: '6px' }}>Customisable</p>
                                                            )}

                                                            <div className="item-actions-row">
                                                                {isUnavailable ? (
                                                                    <button className="add-btn-disabled" disabled>Unavailable</button>
                                                                ) : qty === 0 ? (
                                                                    <button className="add-btn-primary" onClick={() => (hasVariants || hasAddons) ? openCustomization(item, itemOptions, itemAddons) : handleManualCartUpdate(item, 1, selectedVariant, selectedAddons)}>
                                                                        <Plus size={14} /> ADD
                                                                    </button>
                                                                ) : (
                                                                    <div className="qty-controls-premium">
                                                                        <button onClick={() => (hasVariants || hasAddons) ? openCustomizationPicker(item, itemOptions, itemAddons) : handleManualCartUpdate(item, -1, selectedVariant, selectedAddons)}><Minus size={14} /></button>
                                                                        <span className="qty-val">{qty}</span>
                                                                        <button onClick={() => (hasVariants || hasAddons) ? openCustomizationPicker(item, itemOptions, itemAddons) : handleManualCartUpdate(item, 1, selectedVariant, selectedAddons)}><Plus size={14} /></button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </>
                )}
            </div>
            {getCartCount() > 0 && (
                <div className="menu-cart-footer slide-up">
                    <div className="cart-total">
                        <ShoppingCart size={20} />
                        <span>₹{getCartTotal()}</span>
                    </div>
                    <button className="confirm-btn-footer" onClick={() => setShowCartSummary(true)}>
                        {'Go to Cart'} <ChevronRight size={18} />
                    </button>
                </div>
            )}
            {customizingItem && (() => {
                const bVariant = tempVariant ? customizingItem.options.find(o => o.size === tempVariant) : null;
                const bPrice = bVariant ? Number(bVariant.price) : Number(customizingItem.price);
                const addonsTot = tempAddons.reduce((sum, a) => sum + Number(a.price || 0), 0);
                const custTotal = (bPrice + addonsTot) * tempQty;
                const isEditing = !!customizingItem.editFromCartItem;

                return (
                    <div className="cart-summary-overlay animate-fade-in" onClick={() => setCustomizingItem(null)} style={{ zIndex: 99999 }}>
                        <div className="cart-summary-modal zomato-modal slide-up" onClick={e => e.stopPropagation()} style={{ background: '#1c1c24', padding: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', padding: '16px', background: '#252530', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                {customizingItem.image_url ? (
                                    <img src={getMediaUrl(customizingItem.image_url)} alt="food" style={{ width: '48px', height: '48px', borderRadius: '12px', objectFit: 'cover', marginRight: '16px' }} />
                                ) : (
                                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '16px' }}><ChefHat size={20} color="#fff" /></div>
                                )}
                                <h3 style={{ fontSize: '18px', fontWeight: '800', ...{} }}>{customizingItem.name}</h3>
                                <button onClick={() => setCustomizingItem(null)} style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                            </div>

                            <div className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                {customizingItem.options.length > 0 && (
                                    <div style={{ background: '#252530', borderRadius: '16px', padding: '16px' }}>
                                        <div style={{ marginBottom: '12px' }}>
                                            <h4 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '2px' }}>Quantity / Size</h4>
                                            <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Required • Select 1 option</p>
                                        </div>
                                        {customizingItem.options.map((opt, idx) => (
                                            <div key={idx} onClick={() => setTempVariant(opt.size)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: idx !== customizingItem.options.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', cursor: 'pointer' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <span style={{ width: '12px', height: '12px', border: '1px solid #10b981', borderRadius: '2px', display: 'inline-block', position: 'relative' }}>
                                                        <span style={{ position: 'absolute', top: '15%', left: '15%', width: '70%', height: '70%', background: '#10b981', borderRadius: '50%' }}></span>
                                                    </span>
                                                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#e2e8f0' }}>{opt.size}</span>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <span style={{ fontSize: '14px', color: '#e2e8f0', fontWeight: '700' }}>₹{opt.price}</span>
                                                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: `2px solid ${tempVariant === opt.size ? '#00e676' : 'rgba(255,255,255,0.2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        {tempVariant === opt.size && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#00e676' }}></div>}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {customizingItem.addons.length > 0 && (
                                    <div style={{ background: '#252530', borderRadius: '16px', padding: '16px' }}>
                                        <div style={{ marginBottom: '12px' }}>
                                            <h4 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '2px' }}>Add Ons</h4>
                                            <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Choose optional addons</p>
                                        </div>
                                        {customizingItem.addons.map((addon, idx) => {
                                            const isSelected = tempAddons.find(a => a.name === addon.name);
                                            return (
                                                <div key={idx} onClick={() => handleTempAddonToggle(addon)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: idx !== customizingItem.addons.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', cursor: 'pointer' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <span style={{ width: '12px', height: '12px', border: '1px solid #10b981', borderRadius: '2px', display: 'inline-block', position: 'relative' }}>
                                                            <span style={{ position: 'absolute', top: '15%', left: '15%', width: '70%', height: '70%', background: '#10b981', borderRadius: '50%' }}></span>
                                                        </span>
                                                        <span style={{ fontSize: '14px', fontWeight: '600', color: '#e2e8f0' }}>{addon.name}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                        <span style={{ fontSize: '14px', color: '#e2e8f0', fontWeight: '700' }}>₹{addon.price}</span>
                                                        <div style={{ width: '20px', height: '20px', borderRadius: '4px', border: `2px solid ${isSelected ? '#00e676' : 'rgba(255,255,255,0.2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', background: isSelected ? '#00e676' : 'transparent' }}>
                                                            {isSelected && <span style={{ color: '#1a1a20', fontSize: '14px', fontWeight: '900', lineHeight: 1 }}>✓</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>

                            <div style={{ padding: '16px', background: '#1c1c24', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '4px' }}>
                                    <button onClick={() => setTempQty(Math.max(1, tempQty - 1))} style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00e676', border: 'none', background: 'transparent' }}><Minus size={18} /></button>
                                    <span style={{ width: '20px', textAlign: 'center', fontWeight: '800', color: '#fff' }}>{tempQty}</span>
                                    <button onClick={() => setTempQty(tempQty + 1)} style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00e676', border: 'none', background: 'transparent' }}><Plus size={18} /></button>
                                </div>
                                <button onClick={confirmCustomization} style={{ flex: 1, background: '#00e676', color: '#1a1a20', border: 'none', borderRadius: '12px', fontWeight: '800', fontSize: '16px', cursor: 'pointer' }}>
                                    {isEditing ? `Update item - ₹${custTotal}` : `Add item - ₹${custTotal}`}
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })()}

            {pickingCustomizationItem && (() => {
                const cartInstances = currentCart.filter(c => String(c.id) === String(pickingCustomizationItem.id));
                // Automatically close picker if no instances left
                if (cartInstances.length === 0) {
                    setTimeout(() => setPickingCustomizationItem(null), 0);
                    return null;
                }

                return (
                    <div className="cart-summary-overlay animate-fade-in" onClick={() => setPickingCustomizationItem(null)} style={{ zIndex: 99999 }}>
                        <div className="cart-summary-modal zomato-modal slide-up" onClick={e => e.stopPropagation()} style={{ background: '#1c1c24', padding: '0 0 16px 0' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: '800' }}>Choose customisation</h3>
                                <button onClick={() => setPickingCustomizationItem(null)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                            </div>

                            <div className="custom-scrollbar" style={{ maxHeight: '60vh', overflowY: 'auto', padding: '0 16px' }}>
                                {cartInstances.map((cItem, idx) => {
                                    const variantStr = cItem.selectedVariant ? cItem.selectedVariant.size : '';
                                    const addonsStr = cItem.selectedAddons && cItem.selectedAddons.length > 0 ? cItem.selectedAddons.map(a => a.name).join(', ') : '';
                                    const subText = [variantStr, addonsStr].filter(Boolean).join(', ');

                                    return (
                                        <div key={cItem.cartId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: idx !== cartInstances.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                                            <div style={{ flex: 1, paddingRight: '12px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                                    <span style={{ width: '12px', height: '12px', border: '1px solid #10b981', borderRadius: '2px', display: 'inline-block', position: 'relative' }}>
                                                        <span style={{ position: 'absolute', top: '15%', left: '15%', width: '70%', height: '70%', background: '#10b981', borderRadius: '50%' }}></span>
                                                    </span>
                                                    <span style={{ fontSize: '15px', fontWeight: '700', color: '#e2e8f0' }}>{cItem.name}</span>
                                                </div>
                                                {subText && <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px', lineHeight: '1.4' }}>{subText}</p>}
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <p style={{ fontSize: '13px', fontWeight: '800', color: '#fff' }}>₹{cItem.price}</p>
                                                    <button onClick={() => openCustomization(pickingCustomizationItem, pickingCustomizationItem.options, pickingCustomizationItem.addons, cItem)} style={{ display: 'flex', alignItems: 'center', gap: '2px', background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}>
                                                        Edit <ChevronRight size={10} style={{ opacity: 0.7 }} />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="qty-controls-premium" style={{ background: 'rgba(0, 230, 118, 0.1)', border: '1px solid #00e676' }}>
                                                <button onClick={() => handleManualCartUpdate(cItem, -1, cItem.selectedVariant, cItem.selectedAddons)} style={{ color: '#00e676' }}><Minus size={14} /></button>
                                                <span className="qty-val" style={{ color: '#fff' }}>{cItem.qty}</span>
                                                <button onClick={() => handleManualCartUpdate(cItem, 1, cItem.selectedVariant, cItem.selectedAddons)} style={{ color: '#00e676' }}><Plus size={14} /></button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div style={{ padding: '16px 16px 0 16px', display: 'flex', justifyContent: 'center' }}>
                                <button
                                    onClick={() => openCustomization(pickingCustomizationItem, pickingCustomizationItem.options, pickingCustomizationItem.addons)}
                                    style={{ background: 'transparent', color: '#00e676', border: 'none', fontWeight: '700', fontSize: '15px', padding: '8px 16px', cursor: 'pointer' }}
                                >
                                    + Add new customisation
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })()}

            {showVegOffConfirm && (
                <div className="modal-overlay" style={{ zIndex: 10005 }} onClick={() => setShowVegOffConfirm(false)}>
                    <div className="booking-modal animate-slide-up" style={{ padding: '24px', textAlign: 'center', background: '#1c1c1e', border: '1px solid rgba(255,255,255,0.1)' }} onClick={e => e.stopPropagation()}>
                        <div style={{ width: '80px', height: '80px', background: '#3b1c1c', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto', border: '4px solid rgba(239, 68, 68, 0.4)' }}>
                            <span style={{ fontSize: '36px', color: '#fff', fontWeight: '100' }}>!</span>
                        </div>
                        <h3 className="view-title" style={{ fontSize: '1.2rem', marginBottom: '8px', color: '#fff', fontWeight: '800' }}>Switch off Veg Mode?</h3>
                        <p className="text-muted" style={{ marginBottom: '24px', fontSize: '13px', color: '#a1a1aa' }}>
                            You'll see all restaurants, including those serving non-veg dishes
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <button
                                className="btn-secondary"
                                style={{ width: '100%', borderColor: 'rgba(255, 255, 255, 0.1)', color: '#ef4444', background: '#2c2c2e', padding: '14px', borderRadius: '14px', fontSize: '15px' }}
                                onClick={() => {
                                    setVegFilter('all');
                                    setShowVegOffConfirm(false);
                                }}
                            >
                                Switch off
                            </button>
                            <button
                                className="btn-primary"
                                style={{ width: '100%', background: '#2c2c2e', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '14px', borderRadius: '14px', fontSize: '15px' }}
                                onClick={() => setShowVegOffConfirm(false)}
                            >
                                Keep using this mode
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MenuSystem;
