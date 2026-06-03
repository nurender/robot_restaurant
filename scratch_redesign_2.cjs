const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'components', 'AdminPanel.jsx');

let code = fs.readFileSync(file, 'utf8');

// 3. Update Menu Cards (food-ai-card)
code = code.replace(
    /className={`inventory-card glass-panel dish-card-premium shadow-premium \$\{!item\.is_active \? 'dish-card-hidden' : ''\}`}/g,
    'className={`food-ai-card ${!item.is_active ? \'opacity-50 grayscale\' : \'\'}`}'
);

// Add animated glow buttons instead of regular primary buttons in Menu page
code = code.replace(/className="btn-primary" onClick=\{\(\) => \{[^}]*?setNewDish[^}]*?\}\}/g, (match) => {
    return match.replace(/btn-primary/, 'btn-primary shadow-glow');
});

// Update the inventory-grid to gap-6
code = code.replace(/className="inventory-grid"/g, 'className="inventory-grid" style={{ display: \'grid\', gridTemplateColumns: \'repeat(auto-fill, minmax(280px, 1fr))\', gap: \'24px\' }}');

// Update Status badges in Orders Tab
code = code.replace(/className={`status-badge \$\{order\.status === 'completed' \? 'success' : order\.status === 'failed' \? 'danger' : order\.status === 'cooking' \? 'warning' : 'primary'\}`}/g,
    'className={`badge-neon ${order.status === \'completed\' ? \'success\' : order.status === \'failed\' ? \'danger\' : order.status === \'cooking\' ? \'warning\' : \'primary\'}`}'
);

// Remove some old background coloring that makes it look like old bootstrap
code = code.replace(/background:\s*'rgba\(255,255,255,0\.02\)'/g, "background: 'var(--ap-bg-panel)'");
code = code.replace(/border:\s*'1px solid rgba\(255,255,255,0\.05\)'/g, "border: '1px solid var(--ap-border-color)'");

fs.writeFileSync(file, code);

console.log('Processed Menu Cards and Order Status badges.');
