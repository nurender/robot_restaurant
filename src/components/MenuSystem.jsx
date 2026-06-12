import React, { useRef, useState, useEffect } from 'react';
import { Search, ChevronDown, ChevronRight, ChefHat, Plus, Minus, ShoppingCart, Play } from 'lucide-react';

const MenuSystem = ({
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
    setZoomedImage
}) => {
    const categoryScrollRef = useRef(null);
    const [vegFilter, setVegFilter] = useState('all'); // 'all', 'veg', 'nonveg'
    const [selectedVariants, setSelectedVariants] = useState({}); // { itemId: variantSize }
    const [selectedAddonsMap, setSelectedAddonsMap] = useState({}); // { itemId: [addonObj] }

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

    const handleCategoryWheel = (e) => {
        const scroller = categoryScrollRef.current;
        if (!scroller) return;

        // Convert vertical wheel into horizontal movement for desktop users.
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
            scroller.scrollLeft += e.deltaY;
            e.preventDefault();
        }
    };


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
                        <h4>Our Menu</h4>
                        <span className="menu-subtitle">What are you craving today?</span>
                    </div>
                </div>

                <div className="menu-search-wrapper">
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

                <div className="veg-filters-row">
                    <button
                        onClick={() => setVegFilter('all')}
                        className={`veg-btn ${vegFilter === 'all' ? 'active all' : ''}`}
                    >All</button>
                    <button
                        onClick={() => setVegFilter('veg')}
                        className={`veg-btn ${vegFilter === 'veg' ? 'active veg' : ''}`}
                    >🟢 Veg</button>
                    <button
                        onClick={() => setVegFilter('nonveg')}
                        className={`veg-btn ${vegFilter === 'nonveg' ? 'active nonveg' : ''}`}
                    >🔴 Non-Veg</button>
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
                        All <span style={{ opacity: 0.7, fontSize: '0.85em', marginLeft: '4px' }}>({menuCategories.reduce((acc, cat) => acc + cat.items.length, 0)})</span>
                    </button>
                    {menuCategories.map((cat) => (
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
                    menuCategories.map((category) => {
                    if (activeCategory !== 'All' && category.category !== activeCategory) return null;

                    const matchingItems = category.items.filter(item => {
                        const matchesSearch = item.name.toLowerCase().includes(menuSearchTerm.toLowerCase()) ||
                            (item.description && item.description.toLowerCase().includes(menuSearchTerm.toLowerCase()));

                        const matchesVeg = vegFilter === 'all' ||
                            (vegFilter === 'veg' && (item.veg_type === 'veg' || !item.veg_type)) ||
                            (vegFilter === 'nonveg' && item.veg_type === 'nonveg');

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
                                                try { itemOptions = JSON.parse(itemOptions); } catch(e) { itemOptions = []; }
                                            }
                                            let itemAddons = item.addons || [];
                                            if (typeof itemAddons === 'string') {
                                                try { itemAddons = JSON.parse(itemAddons); } catch(e) { itemAddons = []; }
                                            }
                                            
                                            // Mock variants for 'Whiskey', 'Beer' etc. if options are empty
                                            const catStr = category.category.toLowerCase();
                                            if (itemOptions.length === 0 && (catStr.includes('whiskey') || catStr.includes('beer') || catStr.includes('drink') || catStr.includes('liquor'))) {
                                                 itemOptions = catStr.includes('beer') ? 
                                                     [ {size: 'Pint (330ml)', price: item.price || 150}, {size: 'Mug (500ml)', price: (item.price || 150) * 1.5}, {size: 'Bucket (6 Pints)', price: (item.price || 150) * 5} ] :
                                                     [ {size: '30ml', price: item.price || 150}, {size: '60ml', price: (item.price || 150) * 2}, {size: 'Pauva (180ml)', price: (item.price || 150) * 5}, {size: 'Bottle (750ml)', price: (item.price || 150) * 18} ];
                                            }

                                            const hasVariants = itemOptions.length > 0;
                                            const hasAddons = itemAddons.length > 0;
                                            const selectedVariantSize = selectedVariants[item.id] || (hasVariants ? itemOptions[0].size : null);
                                            const selectedVariant = hasVariants ? itemOptions.find(o => o.size === selectedVariantSize) : null;
                                            const selectedAddons = selectedAddonsMap[item.id] || [];
                                            
                                            const basePrice = selectedVariant ? Number(selectedVariant.price) : Number(item.price);
                                            const addonsPrice = selectedAddons.reduce((sum, a) => sum + Number(a.price || 0), 0);
                                            const currentPrice = basePrice + addonsPrice;
                                            const qty = getItemQty(item, selectedVariant, selectedAddons);
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
                                                                {item.name}
                                                                {item.spice_level > 0 && (
                                                                    <span style={{ fontSize: '10px', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', padding: '1px 4px', borderRadius: '4px', letterSpacing: '1px' }}>
                                                                        {'🌶️'.repeat(Math.min(item.spice_level, 5))}
                                                                    </span>
                                                                )}
                                                            </h6>
                                                            <span className="item-price">₹{currentPrice}</span>
                                                        </div>
                                                        <p className="item-description">{item.description || "Delicately crafted for your tech palate."}</p>
                                                        
                                                        {hasVariants && (
                                                            <div className="variants-selector" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', margin: '8px 0' }}>
                                                                {itemOptions.map((opt, idx) => (
                                                                    <button 
                                                                        key={idx} 
                                                                        onClick={() => handleVariantChange(item.id, opt.size)}
                                                                        style={{
                                                                            padding: '4px 8px', fontSize: '12px', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s',
                                                                            border: selectedVariantSize === opt.size ? '1px solid #00e676' : '1px solid var(--border-default)', 
                                                                            background: selectedVariantSize === opt.size ? 'rgba(0, 230, 118, 0.1)' : 'transparent',
                                                                            color: selectedVariantSize === opt.size ? '#00e676' : 'var(--text-secondary)'
                                                                        }}
                                                                    >
                                                                        {opt.size}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        )}
                                                        
                                                        {hasAddons && (
                                                            <div className="addons-selector" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', margin: '8px 0' }}>
                                                                {itemAddons.map((addon, idx) => {
                                                                    const isActive = selectedAddons.find(a => a.name === addon.name);
                                                                    return (
                                                                        <button 
                                                                            key={'addon'+idx} 
                                                                            onClick={() => toggleAddon(item.id, addon)}
                                                                            style={{
                                                                                padding: '4px 8px', fontSize: '12px', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s',
                                                                                border: isActive ? '1px solid #f1c40f' : '1px solid var(--border-default)', 
                                                                                background: isActive ? 'rgba(241, 196, 15, 0.1)' : 'transparent',
                                                                                color: isActive ? '#f1c40f' : 'var(--text-secondary)'
                                                                            }}
                                                                        >
                                                                            {addon.name} <span style={{opacity: 0.7}}>+₹{addon.price}</span>
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                        )}

                                                        <div className="item-actions-row">
                                                            {isUnavailable ? (
                                                                <button className="add-btn-disabled" disabled>Unavailable</button>
                                                            ) : qty === 0 ? (
                                                                <button className="add-btn-primary" onClick={() => handleManualCartUpdate(item, 1, selectedVariant, selectedAddons)}>
                                                                    <Plus size={14} /> ADD
                                                                </button>
                                                            ) : (
                                                                <div className="qty-controls-premium">
                                                                    <button onClick={() => handleManualCartUpdate(item, -1, selectedVariant, selectedAddons)}><Minus size={14} /></button>
                                                                    <span className="qty-val">{qty}</span>
                                                                    <button onClick={() => handleManualCartUpdate(item, 1, selectedVariant, selectedAddons)}><Plus size={14} /></button>
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
                }))}
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
        </div>
    );
};

export default MenuSystem;
