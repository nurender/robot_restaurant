import React from 'react';
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
    Star
} from 'lucide-react';

const AdminSidebar = ({ activeTab, setActiveTab, adminUser, onLogout }) => {
    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['super_admin', 'manager'] },
        { id: 'orders', label: 'Order Management', icon: ListTodo, roles: ['super_admin', 'manager', 'staff'] },
        { id: 'kitchen', label: 'Kitchen Hub', icon: ChefHat, roles: ['super_admin', 'manager', 'chef'] },
        { id: 'marketing', label: 'Marketing Hub', icon: Send, roles: ['super_admin', 'manager'] },
        { id: 'monitor', label: 'Neural Live Feed', icon: Bot, roles: ['super_admin', 'manager', 'staff'] },
        { id: 'robo_control', label: 'AI Robo Control', icon: Settings, roles: ['super_admin', 'manager'] },
        { id: 'menu', label: 'Menu Management', icon: UtensilsCrossed, roles: ['super_admin', 'manager'] },
        { id: 'coupons', label: 'Offers & Coupons', icon: StoreIcon, roles: ['super_admin', 'manager'] },
        { id: 'customers', label: 'Customer Insights', icon: Users, roles: ['super_admin', 'manager'] },
        { id: 'rider_fleet', label: 'Rider Fleet', icon: Bike, roles: ['super_admin', 'manager'] },
        { id: 'inventory', label: 'Smart Inventory', icon: Package, roles: ['super_admin', 'manager'] },
        { id: 'reports', label: 'Reports & Analytics', icon: BarChart2, roles: ['super_admin', 'manager'] },
        { id: 'qr_codes', label: 'Tables & QR Codes', icon: StoreIcon, roles: ['super_admin', 'manager'] },
        { id: 'feedback', label: 'Customer Feedback', icon: Star, roles: ['super_admin', 'manager'] },
        { id: 'ai_prompt', label: 'Prompt Engineer', icon: Bot, roles: ['super_admin'] },
        { id: 'settings', label: 'General Settings', icon: Settings, roles: ['super_admin', 'manager'] },
        { id: 'restaurants', label: 'Our Restaurants', icon: StoreIcon, roles: ['super_admin'] },
        { id: 'staff', label: 'Team Members', icon: Users, roles: ['super_admin'] },
    ];

    const filteredItems = menuItems.filter(item => item.roles.includes(adminUser.role));

    return (
        <aside className="admin-sidebar shadow-premium" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <div className="sidebar-brand">
                <div className="brand-logo"><ChefHat size={28} color="white" /></div>
                <h2>AI RESTO</h2>
            </div>

            <nav className="sidebar-nav" style={{ flex: 1, overflowY: 'auto', padding: '10px 0' }} className="scrollbar-hidden">
                {filteredItems.map((item) => (
                    <button
                        key={item.id}
                        className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(item.id)}
                    >
                        <item.icon size={20} />
                        <span>{item.label}</span>
                        {activeTab === item.id && <div className="active-indicator" />}
                    </button>
                ))}
            </nav>

            <div className="sidebar-footer-premium">
                <div className="user-profile-plate">
                    <div className="profile-avatar">{adminUser.name?.charAt(0) || 'A'}</div>
                    <div className="profile-info">
                        <span className="user-name">{adminUser.name}</span>
                        <span class="user-role">{adminUser.role === 'super_admin' ? 'Master Admin' : adminUser.role === 'chef' ? 'Kitchen Lead' : 'Branch Manager'}</span>
                    </div>
                </div>
                <button className="btn-logout-minimal" onClick={onLogout}>
                    <LogOut size={18} />
                    <span>Sign Out</span>
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;
