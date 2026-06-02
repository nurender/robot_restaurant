async function run() {
    try {
        const fetch = require('node-fetch'); // or global fetch
    } catch(e) {}
    try {
        const res = await fetch('http://localhost:3001/api/menu?restaurant_id=1');
        const data = await res.json();
        const item = data.data.find(i => i.name === 'Classic Burger');
        console.log(item);
    } catch(e) { console.error(e) }
}
run();
