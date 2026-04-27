const axios = require('axios');

async function test() {
    try {
        console.log("Fetching orders...");
        const res = await axios.get('http://localhost:3001/api/orders?restaurant_id=1');
        console.log("Success! Data count:", res.data.data.length);
    } catch (err) {
        console.error("Error Status:", err.response?.status);
        console.error("Error Data:", err.response?.data);
        console.error("Error Message:", err.message);
    }
}

test();
