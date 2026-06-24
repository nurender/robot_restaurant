const fs = require('fs');
const glob = require('fs').readdirSync;
const path = require('path');

function processDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;

            if (content.includes('axios.post(') || content.includes('axios.put(') || content.includes('axios.delete(') || content.includes('axios.get(')) {
                if (!content.includes('import apiService')) {
                    const depth = fullPath.split(path.sep).length - 2; 
                    const levels = depth > 0 ? '../'.repeat(depth) : './';
                    content = content.replace(/(import React.*?\\n)/, "$1import apiService from '" + levels + "services/apiService';\n");
                }
                
                // Perform generic replacements first since variable names might mismatch
                // Rather than exact string replacements matching `${id}` vs `${cat.id}`, use a flexible regex
                
                // Helper to replace exactly
                const rep = (regex, replacement) => {
                    const oldContent = content;
                    content = content.replace(regex, replacement);
                    if (oldContent !== content) modified = true;
                };

                // --- MULTI-VARYING ---
                rep(/axios\.delete\(`\$\{API_URL\}\/api\/menu\/categories\/\$\{([^\}]+)\}`\)/gs, 'apiService.deleteCategory($1)');
                rep(/axios\.post\(`\$\{API_URL\}\/api\/menu\/categories`,\s*{(.*?)}\)/gs, 'apiService.createCategory({$1})');
                
                rep(/axios\.delete\(`\$\{API_URL\}\/api\/menu\/\$\{([^\}]+)\}`\)/gs, 'apiService.deleteDish($1)');
                rep(/axios\.put\(`\$\{API_URL\}\/api\/menu\/\$\{([^\}]+)\}`,\s*(.*?)\)/gs, 'apiService.updateDish($1, $2)');
                rep(/axios\.post\(`\$\{API_URL\}\/api\/menu`,\s*{(.*?)}\)/gs, 'apiService.createDish({$1})');

                rep(/axios\.put\(`\$\{API_URL\}\/api\/orders\/\$\{([^\}]+)\}\/status`,\s*{\s*status\s*}\)/gs, 'apiService.updateOrderStatus($1, status)');
                rep(/axios\.put\(`\$\{API_URL\}\/api\/orders\/\$\{([^\}]+)\}`,\s*{(.*?)}\)/gs, 'apiService.updateOrder($1, {$2})');
                rep(/axios\.post\(`\$\{API_URL\}\/api\/orders`,\s*{(.*?)}\)/gs, 'apiService.createOrder({$1})');
                rep(/axios\.post\(`\$\{API_URL\}\/api\/mgmt\/orders\/assign-rider`,\s*{(.*?)}\)/gs, 'apiService.assignRider({$1})');
                
                rep(/axios\.delete\(`\$\{API_URL\}\/api\/restaurants\/\$\{([^\}]+)\}`\)/gs, 'apiService.deleteRestaurant($1)');
                rep(/axios\.put\(`\$\{API_URL\}\/api\/restaurants\/\$\{([^\}]+)\}`,\s*(.*?)\)/gs, 'apiService.updateRestaurant($1, $2)');
                rep(/axios\.post\(`\$\{API_URL\}\/api\/restaurants`,\s*(.*?)\)/gs, 'apiService.createRestaurant($1)');
                
                rep(/axios\.delete\(`\$\{API_URL\}\/api\/users\/\$\{([^\}]+)\}`\)/gs, 'apiService.deleteUser($1)');
                rep(/axios\.put\(`\$\{API_URL\}\/api\/users\/\$\{([^\}]+)\}`,\s*(.*?)\)/gs, 'apiService.updateUser($1, $2)');
                rep(/axios\.post\(`\$\{API_URL\}\/api\/users`,\s*(.*?)\)/gs, 'apiService.createUser($1)');
                
                rep(/axios\.delete\(`\$\{API_URL\}\/api\/mgmt\/roles\/\$\{([^\}]+)\}`\)/gs, 'apiService.deleteRole($1)');
                rep(/axios\.post\(`\$\{API_URL\}\/api\/mgmt\/roles`,\s*(.*?)\)/gs, 'apiService.createRole($1)');
                rep(/axios\.get\(`\$\{API_URL\}\/api\/mgmt\/roles`\)/gs, 'apiService.getRoles()');
                
                rep(/axios\.post\(`\$\{API_URL\}\/api\/mgmt\/sidebar\/reorder`,\s*\{\s*items\s*\}\)/gs, 'apiService.reorderSidebar(items)');
                rep(/axios\.post\(`\$\{API_URL\}\/api\/mgmt\/sidebar\/toggle`,\s*{(.*?)}\)/gs, 'apiService.toggleSidebarItem($1)');
                
                rep(/axios\.delete\(`\$\{API_URL\}\/api\/mgmt\/riders\/\$\{([^\}]+)\}`\)/gs, 'apiService.deleteRider($1)');
                rep(/axios\.put\(`\$\{API_URL\}\/api\/mgmt\/riders\/\$\{([^\}]+)\}`,\s*{(.*?)}\)/gs, 'apiService.updateRider($1, {$2})');
                rep(/axios\.post\(`\$\{API_URL\}\/api\/mgmt\/riders`,\s*{(.*?)}\)/gs, 'apiService.createRider({$1})');
                
                rep(/axios\.delete\(`\$\{API_URL\}\/api\/mgmt\/coupons\/\$\{([^\}]+)\}`\)/gs, 'apiService.deleteCoupon($1)');
                rep(/axios\.put\(`\$\{API_URL\}\/api\/mgmt\/coupons\/\$\{([^\}]+)\}`,\s*(.*?)\)/gs, 'apiService.updateCoupon($1, $2)');
                rep(/axios\.post\(`\$\{API_URL\}\/api\/mgmt\/coupons`,\s*(.*?)\)/gs, 'apiService.createCoupon($1)');
                
                rep(/axios\.delete\(`\$\{API_URL\}\/api\/tables\/\$\{([^\}]+)\}`\)/gs, 'apiService.deleteTable($1)');
                rep(/axios\.put\(`\$\{API_URL\}\/api\/tables\/\$\{([^\}]+)\}`,\s*{(.*?)}\)/gs, 'apiService.updateTable($1, {$2})');
                rep(/axios\.post\(`\$\{API_URL\}\/api\/tables`,\s*{(.*?)}\)/gs, 'apiService.createTable({$1})');
                
                rep(/axios\.post\(`\$\{API_URL\}\/api\/login`,\s*{(.*?)}\)/gs, 'apiService.login({$1})');
                rep(/axios\.get\(`\$\{API_URL\}\/api\/mgmt\/sidebar`,\s*\{.*?\}\)/gs, 'apiService.getSidebar()');
                
                // UPLOADS
                rep(/axios\.post\(`\$\{API_URL\}\/api\/upload`,\s*formData\)/gs, 'apiService.uploadImage(formData)');

            }
            if (modified) {
                fs.writeFileSync(fullPath, content);
                console.log('Migrated', fullPath);
            }
        }
    }
}
processDir('./src/components');
console.log('Done!');
