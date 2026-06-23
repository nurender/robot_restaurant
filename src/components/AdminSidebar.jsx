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
    QrCode
} from 'lucide-react';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';

const iconMap = {
    LayoutDashboard, UtensilsCrossed, ListTodo, ChefHat, Users, Store, Bot, Send, LogOut, Package,
    BarChart2, Settings, StoreIcon, Bike, CreditCard, Star, ChevronLeft, ChevronRight, QrCode
};

const AdminSidebar = ({ activeTab, setActiveTab, adminUser, onLogout, isCollapsed, setIsCollapsed }) => {
    const [menuItems, setMenuItems] = useState([]);

    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const res = await axios.get(`${API_URL}/api/mgmt/sidebar`);
                if (res.data.success) {
                    const mapped = res.data.data.map(item => ({
                        ...item,
                        icon: iconMap[item.icon_name] || Settings
                    }));
                    setMenuItems(mapped);
                }
            } catch (e) { console.error("Sidebar Load Error:", e); }
        };
        fetchMenu();
    }, []);

    const filteredItems = menuItems.filter(item => {
        if (item.id === 'monitor' || item.id === 'customers' || item.id === 'menu_order') return false;
        // Ensure roles is an array (sometimes PG arrays come as strings depending on config)
        let rolesArray = item.roles;
        if (typeof rolesArray === 'string') {
            rolesArray = rolesArray.replace(/[{}]/g, '').split(',');
        }

        const isPermitted = Array.isArray(rolesArray) && rolesArray.includes(adminUser.role);
        const isActive = item.is_active;

        if (item.id === 'roles') {
            console.log(`[Sidebar Debug] Item: ${item.label}, UserRole: ${adminUser.role}, Permitted: ${isPermitted}, Active: ${isActive}`);
        }

        return isPermitted && isActive;
    });

    return (
        <aside className={`admin-sidebar shadow-premium ${isCollapsed ? 'collapsed' : ''} ext-cls-946d012f`} >
            <div className="sidebar-brand">
                <div className="brand-logo"><ChefHat size={24} color="white" /></div>
                {!isCollapsed && <h2>AI RESTO</h2>}
                <button className="sidebar-toggle" onClick={() => setIsCollapsed(!isCollapsed)}>
                    {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                </button>
            </div>

            <nav className="sidebar-nav scrollbar-hidden ext-cls-a3dcb368" >
                {filteredItems.map((item) => (
                    <button
                        key={item.id}
                        className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(item.id)}
                        title={isCollapsed ? item.label : ''}
                    >
                        <item.icon size={20} />
                        {!isCollapsed && <span>{item.label}</span>}
                        {activeTab === item.id && !isCollapsed && <div className="active-indicator" />}
                    </button>
                ))}
            </nav>

            <div className="sidebar-footer-premium">
                <div className="user-profile-plate">
                    <div className="profile-avatar">{adminUser.name?.charAt(0) || 'A'}</div>
                    {!isCollapsed && (
                        <div className="profile-info">
                            <span className="user-name">{adminUser.name}</span>
                            <span className="user-role">{adminUser.role === 'super_admin' ? 'Master Admin' : adminUser.role === 'chef' ? 'Kitchen Lead' : 'Branch Manager'}</span>
                        </div>
                    )}
                </div>
                <button className="btn-logout-minimal" onClick={onLogout}>
                    <LogOut size={18} />
                    {!isCollapsed && <span>Sign Out</span>}
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;
