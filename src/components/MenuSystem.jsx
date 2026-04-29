import React, { useRef, useState } from 'react';
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
    setShowMenuPopup,
    getMediaUrl,
    setZoomedImage
}) => {
    const categoryScrollRef = useRef(null);
    const [vegFilter, setVegFilter] = useState('all'); // 'all', 'veg', 'nonveg'

    const handleCategoryWheel = (e) => {
        const scroller = categoryScrollRef.current;
        if (!scroller) return;

        // Convert vertical wheel into horizontal movement for desktop users.
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
            scroller.scrollLeft += e.deltaY;
            e.preventDefault();
        }
    };

    return (
        <div className="premium-menu-panel slide-up">
            <div className="menu-header">
                <div className="menu-header-top">
                    <div className="menu-title-area">
                        <h4>{textLanguage === 'en' ? 'Our Menu' : 'हमारा मेनू'}</h4>
                        <span className="menu-subtitle">{textLanguage === 'en' ? 'Select your favorite dishes' : 'अपनी पसंदीदा डिश चुनें'}</span>
                    </div>
                    <button className="close-menu-btn" onClick={() => setShowMenuPopup(false)}>×</button>
                </div>

                <div className="menu-search-wrapper">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        className="menu-search-input"
                        placeholder={textLanguage === 'en' ? 'Search for dishes or ingredients...' : 'डिश या सामग्री सर्च करें...'}
                        value={menuSearchTerm}
                        onChange={(e) => setMenuSearchTerm(e.target.value)}
                    />
                    {menuSearchTerm && (
                        <button className="clear-search-btn" onClick={() => setMenuSearchTerm('')}>×</button>
                    )}
                </div>

                <div style={{ display: 'flex', gap: '12px', padding: '0 16px 12px' }}>
                    <button
                        onClick={() => setVegFilter('all')}
                        style={{ padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', border: vegFilter === 'all' ? '2px solid var(--accent-primary)' : '1px solid var(--card-border)', background: vegFilter === 'all' ? 'rgba(124, 58, 237, 0.15)' : 'rgba(255,255,255,0.02)', color: vegFilter === 'all' ? 'var(--accent-primary)' : 'var(--text-main)' }}
                    >All</button>
                    <button
                        onClick={() => setVegFilter('veg')}
                        style={{ padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', border: vegFilter === 'veg' ? '2px solid #22c55e' : '1px solid var(--card-border)', background: vegFilter === 'veg' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255,255,255,0.02)', color: vegFilter === 'veg' ? '#22c55e' : 'var(--text-main)' }}
                    >🟢 Veg</button>
                    <button
                        onClick={() => setVegFilter('nonveg')}
                        style={{ padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', border: vegFilter === 'nonveg' ? '2px solid #ef4444' : '1px solid var(--card-border)', background: vegFilter === 'nonveg' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255,255,255,0.02)', color: vegFilter === 'nonveg' ? '#ef4444' : 'var(--text-main)' }}
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
                        {textLanguage === 'en' ? 'All' : 'सभी'}
                    </button>
                    {menuCategories.map((cat) => (
                        <button
                            key={cat.category}
                            className={`category-chip ${activeCategory === cat.category ? 'active' : ''}`}
                            onClick={() => setActiveCategory(cat.category)}
                        >
                            {cat.category}
                        </button>
                    ))}
                </div>
            </div>

            <div className="menu-content scrollbar-hidden">
                {menuCategories.map((category) => {
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
                                <h5 className="category-title">{category.category}</h5>
                                {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                            </div>

                            {isExpanded && (
                                <div className="category-items animate-fade-in">
                                    {matchingItems.map((item) => {
                                        const qty = getItemQty(item);
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
                                                        <h6 className="item-name">{item.name}</h6>
                                                        <span className="item-price">₹{item.price}</span>
                                                    </div>
                                                    <p className="item-description">{item.description || "Delicately crafted for your tech palate."}</p>
                                                    <div className="item-actions-row">
                                                        {isUnavailable ? (
                                                            <button className="add-btn-disabled" disabled>Unavailable</button>
                                                        ) : qty === 0 ? (
                                                            <button className="add-btn-primary" onClick={() => handleManualCartUpdate(item, 1)}>
                                                                <Plus size={14} /> ADD
                                                            </button>
                                                        ) : (
                                                            <div className="qty-controls-premium">
                                                                <button onClick={() => handleManualCartUpdate(item, -1)}><Minus size={14} /></button>
                                                                <span className="qty-val">{qty}</span>
                                                                <button onClick={() => handleManualCartUpdate(item, 1)}><Plus size={14} /></button>
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
            </div>
            {getCartCount() > 0 && (
                <div className="menu-cart-footer slide-up">
                    <div className="cart-total" onClick={() => setShowCartSummary(true)} style={{ cursor: 'pointer' }}>
                        <ShoppingCart size={20} />
                        <span>₹{getCartTotal()}</span>
                        <span className="cart-view-hint">View Cart</span>
                    </div>
                    <button className="confirm-btn-footer" onClick={() => completeOrderProcess()}>
                        {textLanguage === 'hi' ? 'आर्डर बुक करें' : 'Confirm Order'} <ChevronRight size={18} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default MenuSystem;
