async function run() {
    try {
        const res = await fetch('http://localhost:3001/api/menu?restaurant_id=4');
        const data = await res.json();
        const burger = data.data.find(i => i.name.includes('Classic Burger') || i.name.includes('Cheese Burger'));
        console.log(burger);
    } catch(e) { console.error(e) }
}
run();
