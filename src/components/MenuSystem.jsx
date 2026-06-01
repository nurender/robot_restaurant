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

    const [touchStart, setTouchStart] = useState(null);
    const [isActive, setIsActive] = useState(false);
    const contentRef = useRef(null);

    useEffect(() => {
        // Short delay to ensure transition triggers
        const timer = setTimeout(() => setIsActive(true), 10);
        return () => clearTimeout(timer);
    }, []);

    const handleClose = () => {
        setIsActive(false);
        setTimeout(() => {
            setShowMenuPopup(false);
        }, 400); // match transition duration
    };

    const handleTouchStart = (e) => {
        setTouchStart(e.targetTouches[0].clientY);
    };

    const handleTouchMove = (e) => {
        if (touchStart === null || !isActive) return;
        const currentTouch = e.targetTouches[0].clientY;
        const diff = currentTouch - touchStart;

        // If swiping down and at the top of the content
        if (diff > 0 && contentRef.current.scrollTop === 0) {
            // Prevent browser pull-to-refresh
            if (e.cancelable) e.preventDefault();

            if (diff > 100) {
                handleClose();
                setTouchStart(null);
            }
        }
    };

    const handleTouchEnd = () => {
        setTouchStart(null);
    };

    return (
        <div
            className={`premium-menu-panel ${isActive ? 'active' : ''}`}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            <div className="menu-header">
                <div className="menu-header-top">
                    <div className="menu-title-area">
                        <h4>{textLanguage === 'en' ? 'Our Menu' : 'हमारा मेनू'}</h4>
                        <span className="menu-subtitle">{textLanguage === 'en' ? 'What are you craving today?' : 'आज आप क्या खाना चाहेंगे?'}</span>
                    </div>
                </div>

                <div className="menu-search-wrapper">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        className="menu-search-input"
                        placeholder={textLanguage === 'en' ? 'Search...' : 'खोजें...'}
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
                }))}
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
