const { pool } = require('../config/db');

const getMenu = async (req, res) => {
    const { restaurant_id } = req.query;
    let query = "SELECT * FROM menu";
    let params = [];
    if (restaurant_id && restaurant_id !== 'null') {
        query += " WHERE restaurant_id = $1";
        params.push(restaurant_id);
    }
    try {
        const result = await pool.query(query, params);
        res.json({ data: result.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const createMenuItem = async (req, res) => {
    const { restaurant_id, name, category, price, description, image_url, video_url, is_active } = req.body;
    const io = req.app.get('socketio');
    const id = 'm' + Date.now(); // Generate unique TEXT ID
    try {
        const result = await pool.query(
            "INSERT INTO menu (id, restaurant_id, name, category, price, description, image_url, video_url, is_active) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id",
            [id, Number(restaurant_id) || 1, name, category, Number(price) || 0, description, image_url, video_url, is_active !== undefined ? is_active : true]
        );
        if (io) io.emit('menu_updated');
        res.json({ id: result.rows[0].id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const updateMenuItem = async (req, res) => {
    const { name, category, price, description, image_url, video_url, is_active } = req.body;
    const { id } = req.params;
    const io = req.app.get('socketio');
    try {
        await pool.query(
            "UPDATE menu SET name = $1, category = $2, price = $3, description = $4, image_url = $5, video_url = $6, is_active = $7 WHERE id = $8",
            [name, category, Number(price) || 0, description, image_url, video_url, is_active !== undefined ? is_active : true, id]
        );
        if (io) io.emit('menu_updated');
        res.json({ message: "Item updated successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const deleteMenuItem = async (req, res) => {
    const { id } = req.params;
    const io = req.app.get('socketio');
    try {
        await pool.query("DELETE FROM menu WHERE id = $1", [id]);
        if (io) io.emit('menu_updated');
        res.json({ message: "deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getCategories = async (req, res) => {
    const { restaurant_id } = req.query;
    let query = "SELECT * FROM categories";
    let params = [];
    if (restaurant_id && restaurant_id !== 'null') {
        query += " WHERE restaurant_id = $1";
        params.push(restaurant_id);
    }
    try {
        const result = await pool.query(query, params);
        res.json({ data: result.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const createCategory = async (req, res) => {
    const { name, restaurant_id } = req.body;
    const finalRestId = restaurant_id || 1;
    const io = req.app.get('socketio');
    try {
        const result = await pool.query("INSERT INTO categories (name, restaurant_id) VALUES ($1,$2) RETURNING id", [name, finalRestId]);
        if (io) io.emit('categories_updated');
        res.json({ id: result.rows[0].id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const deleteCategory = async (req, res) => {
    const { id } = req.params;
    const io = req.app.get('socketio');
    try {
        await pool.query("DELETE FROM categories WHERE id = $1", [id]);
        if (io) io.emit('categories_updated');
        res.json({ message: "deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const fs = require('fs');
const { ai } = require('../config/ai');

const importMenuAI = async (req, res) => {
    if (!req.file || !ai) {
        return res.status(400).json({ error: "No menu image file provided or Gemini key missing." });
    }
    try {
        const imageBase64 = fs.readFileSync(req.file.path).toString('base64');
        const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `Analyze this restaurant menu image carefully.
Extract all menu categories and items accurately.
You MUST output ONLY a valid JSON string (no markdown ticks, no extra text) conforming to this exact schema:
{
  "categories": [
    {
      "name": "Tea",
      "items": [
        {
          "name": "Cutting Chai",
          "name_hindi": "कटिंग चाय",
          "base_price": 20,
          "veg_type": "veg",
          "description": "Traditional street-style Indian tea"
        }
      ]
    }
  ]
}`;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: imageBase64,
                    mimeType: req.file.mimetype
                }
            }
        ]);

        let responseText = result.response.text().trim();
        if (responseText.startsWith('```json')) {
            responseText = responseText.replace(/```json\n?/, '').replace(/```$/, '').trim();
        }

        const extractedData = JSON.parse(responseText);

        // Delete uploaded file after processing
        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

        res.json({ success: true, data: extractedData });
    } catch (e) {
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ error: e.message });
    }
};

const getSmartMenu = async (req, res) => {
    try {
        const items = await pool.query("SELECT * FROM menu_items ORDER BY display_order ASC");
        const categories = await pool.query("SELECT * FROM menu_categories ORDER BY sort_order ASC");
        res.json({ success: true, items: items.rows, categories: categories.rows });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

const createSmartItem = async (req, res) => {
    const { name, base_price, category_id, veg_type } = req.body;
    try {
        const result = await pool.query(
            "INSERT INTO menu_items (name, base_price, category_id, veg_type) VALUES ($1, $2, $3, $4) RETURNING id",
            [name, Number(base_price) || 0, category_id || null, veg_type || 'veg']
        );
        res.json({ success: true, id: result.rows[0].id });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

module.exports = {
    getMenu,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    getCategories,
    createCategory,
    deleteCategory,
    importMenuAI,
    getSmartMenu,
    createSmartItem
};
