import {
    LayoutDashboard,
    UtensilsCrossed,
    ListTodo,
    ChefHat,
    Users,
    Store,
    Bot,
    Send,
    LogOut,
    Package,
    BarChart2,
    Settings,
    Store as StoreIcon,
    Bike,
    CreditCard,
    Star,
    ChevronLeft,
    ChevronRight,
    QrCode,
    Shield
} from 'lucide-react';

import React from 'react';

const iconMap = {
    LayoutDashboard, UtensilsCrossed, ListTodo, ChefHat, Users, Store, Bot, Send, LogOut, Package,
    BarChart2, Settings, StoreIcon, Bike, CreditCard, Star, ChevronLeft, ChevronRight, QrCode, Shield
};

const AdminSidebar = ({ activeTab, setActiveTab, adminUser, onLogout, isCollapsed, setIsCollapsed, orderedSidebar = [] }) => {
    // Map with icons
    const filteredItems = orderedSidebar
        .filter(item => item && item.is_active)
        .map(item => ({
            ...item,
            icon: iconMap[item.icon_name] || Settings
        }));

    if (adminUser?.role === 'super_admin') {
        filteredItems.push({
            id: 'super_admin',
            label: 'Super Admin Portal',
            path: 'super_admin',
            icon: Shield
        });
    }

    return (
        <aside className={`admin-sidebar shadow-premium ${isCollapsed ? 'collapsed' : ''} ext-cls-946d012f`} >
            <div className="sidebar-brand">
                <div className="brand-logo"><ChefHat size={24} color="white" /></div>
                {!isCollapsed && <h2>AI RESTO</h2>}
                <button className="sidebar-toggle" onClick={() => setIsCollapsed(!isCollapsed)}>
                    {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                </button>
            </div>

            <nav className="sidebar-nav">
                {filteredItems.map((item) => (
                    <button
                        key={item.id}
                        className={`nav-item ext-cls-afaeec86 ${activeTab === item.path ? 'active st-cls-e137c6ab' : ''}`}
                        onClick={() => setActiveTab(item.path)}
                        title={isCollapsed ? item.label : ''}
                    >
                        <item.icon size={20} />
                        {!isCollapsed && <span>{item.label}</span>}
                        {activeTab === item.path && !isCollapsed && <div className="active-indicator" />}
                    </button>
                ))}
            </nav>
        </aside>
    );
};

export default AdminSidebar;
