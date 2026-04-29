import React from 'react';
import { 
    LayoutDashboard, 
    UtensilsCrossed, 
    ListTodo, 
    ChefHat, 
    Users, 
    Store, 
    Bot, 
    LogOut,
    Package,
    BarChart2,
    Settings,
    Store as StoreIcon
} from 'lucide-react';

const AdminSidebar = ({ activeTab, setActiveTab, adminUser, onLogout }) => {
    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'orders', label: 'Orders Hub', icon: ListTodo },
        { id: 'menu', label: 'Menu Management', icon: UtensilsCrossed },
        { id: 'ai_prompt', label: 'AI Intelligence', icon: Bot },
        { id: 'inventory', label: 'Inventory', icon: Package },
        { id: 'reports', label: 'Reports', icon: BarChart2 },
        { id: 'qr_codes', label: 'Tables & QR Codes', icon: StoreIcon },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    if (adminUser.role === 'super_admin') {
        menuItems.push({ id: 'restaurants', label: 'Our Branches', icon: StoreIcon });
        menuItems.push({ id: 'staff', label: 'Team Members', icon: Users });
    }

    return (
        <aside className="admin-sidebar shadow-premium">
            <div className="sidebar-brand">
                <div className="brand-logo"><ChefHat size={28} color="white" /></div>
                <h2>AI RESTO</h2>
            </div>

            <nav className="sidebar-nav">
                {menuItems.map((item) => (
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
                        <span className="user-role">{adminUser.role === 'super_admin' ? 'Master Admin' : 'Branch Manager'}</span>
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
