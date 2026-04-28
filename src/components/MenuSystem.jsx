import React, { useRef } from 'react';
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

                    const matchingItems = category.items.filter(item =>
                        item.name.toLowerCase().includes(menuSearchTerm.toLowerCase()) ||
                        (item.description && item.description.toLowerCase().includes(menuSearchTerm.toLowerCase()))
                    );

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
