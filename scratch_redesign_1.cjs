const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'components', 'AdminPanel.jsx');

let code = fs.readFileSync(file, 'utf8');

// 1. Sidebar Nav Updates
// Replace basic nav lists with the new AI SaaS sections
code = code.replace(
    /const renderSidebar = \(\) => \{\s*return \([\s\S]*?<\/aside>\s*\);/g,
    `const renderSidebar = () => {
    return (
      <aside className="admin-sidebar" style={{ backgroundColor: 'var(--ap-bg-panel)', borderRight: '1px solid var(--ap-border-color)' }}>
        <div className="sidebar-header">
          <div className="sidebar-logo">AI RESTO OS</div>
          <button className="minimize-btn" onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}>
            {isSidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>
        
        <nav className="sidebar-nav">
          <div className={\`nav-item \${activeTab === 'dashboard' ? 'active' : ''}\`} onClick={() => handleTabChange('dashboard')}>
            <BarChart2 className="nav-icon" size={20} />
            {!isSidebarCollapsed && <span>Live Dashboard</span>}
          </div>
          
          <div className={\`nav-item \${activeTab === 'orders' ? 'active' : ''}\`} onClick={() => handleTabChange('orders')}>
            <UtensilsCrossed className="nav-icon" size={20} />
            {!isSidebarCollapsed && <span>Order Intelligence</span>}
          </div>
          
          <div className={\`nav-item \${activeTab === 'menu' ? 'active' : ''}\`} onClick={() => handleTabChange('menu')}>
            <BookOpen className="nav-icon" size={20} />
            {!isSidebarCollapsed && <span>Menu AI</span>}
          </div>
          
          <div className={\`nav-item \${activeTab === 'inventory' ? 'active' : ''}\`} onClick={() => handleTabChange('inventory')}>
            <Package className="nav-icon" size={20} />
            {!isSidebarCollapsed && <span>Smart Inventory</span>}
          </div>

          <div className={\`nav-item \${activeTab === 'staff' ? 'active' : ''}\`} onClick={() => handleTabChange('staff')}>
            <Users className="nav-icon" size={20} />
            {!isSidebarCollapsed && <span>Rider Fleet</span>}
          </div>

          <div className={\`nav-item \${activeTab === 'settings' ? 'active' : ''}\`} onClick={() => handleTabChange('settings')}>
            <Settings className="nav-icon" size={20} />
            {!isSidebarCollapsed && <span>Settings</span>}
          </div>
        </nav>

        {!isSidebarCollapsed && (
          <div style={{ marginTop: 'auto', background: 'rgba(159,122,234,0.1)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(159,122,234,0.2)' }}>
            <h4 style={{ color: 'var(--ap-neon-purple)', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '8px' }}>Pro Intelligence</h4>
            <p style={{ color: 'var(--ap-text-secondary)', fontSize: '12px', marginBottom: '12px' }}>AI running smoothly. Network latency 12ms.</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '4px', background: '#38a169', boxShadow: '0 0 8px #38a169' }}></div>
              <span style={{ fontSize: '11px', color: '#68d391', fontWeight: 'bold' }}>SYSTEM ONLINE</span>
            </div>
          </div>
        )}
      </aside>
    );`
);

// 2. Top Header Updates
code = code.replace(
    /<header className="main-header">[\s\S]*?<\/header>/g,
    `<header className="main-header" style={{ background: 'rgba(13, 13, 26, 0.7)', backdropFilter: 'blur(20px)' }}>
          <div className="header-search">
            <Search size={18} style={{ color: 'var(--ap-text-muted)', marginRight: '10px' }} />
            <input type="text" placeholder="Neural Search / Ask AI..." />
          </div>

          <div className="header-profile-premium flex items-center gap-6">
            <div className="flex gap-4 items-center">
               <div style={{ background: 'rgba(255,255,255,0.05)', padding: '8px', borderRadius: '50%', cursor: 'pointer' }}><Bell size={18} color="var(--ap-text-secondary)" /></div>
               <div style={{ background: 'rgba(159,122,234,0.1)', padding: '8px', borderRadius: '50%', cursor: 'pointer', border: '1px solid rgba(159,122,234,0.3)' }}><Zap size={18} color="var(--ap-neon-purple)" /></div>
            </div>
            <div className="profile-details-group text-right" style={{ display: 'flex', flexDirection: 'column' }}>
              <span className="profile-name" style={{ fontWeight: '600', fontSize: '14px', color: '#fff' }}>{adminUser.name}</span>
              <span className="profile-role" style={{ fontSize: '11px', color: 'var(--ap-neon-purple)', textTransform: 'uppercase', letterSpacing: '1px' }}>Master Intelligence</span>
            </div>
            <div className="profile-avatar-glow" style={{ width: '40px', height:'40px', borderRadius:'12px', background:'var(--ap-deep-indigo)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'bold', boxShadow:'0 0 15px rgba(159,122,234,0.4)', color: '#fff' }}>
              A
            </div>
          </div>
        </header>`
);

// Remove specific legacy style hardcodes for `.view-header-row` etc
code = code.replace(/style=\{\{\s*padding:\s*'32px',\s*background:\s*'var\(--bg-deep\)',\s*minHeight:\s*'100vh'\s*\}\}/g, 
    "style={{ padding: '32px', background: 'transparent' }}");
code = code.replace(/style=\{\{\s*fontSize:\s*'32px',\s*fontWeight:\s*'800',\s*color:\s*'var\(--text-main\)',\s*letterSpacing:\s*'-1px'\s*\}\}/g, 
    "style={{ fontSize: '36px', fontWeight: '800', color: '#fff', letterSpacing: '-1px' }}");
code = code.replace(/background:\s*'var\(--card-bg\)'/g, "background: 'var(--ap-bg-panel)'");
code = code.replace(/border:\s*'1px solid var\(--card-border\)'/g, "border: '1px solid var(--ap-border-color)'");

fs.writeFileSync(file, code);

console.log('Processed AdminPanel layout headers and styles.');
