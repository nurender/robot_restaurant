const { pool } = require('../config/db');
const { invalidateAiPromptCache } = require('../services/cacheService');

const updateAiPrompt = async (req, res) => {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt is required" });

    try {
        await pool.query(
            `INSERT INTO app_settings (key, value) VALUES ('ai_prompt', $1)
             ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
            [prompt]
        );
        
        // Invalidate cache so the new prompt is picked up immediately
        invalidateAiPromptCache();
        
        res.json({ success: true, message: "AI Prompt updated successfully" });
    } catch (error) {
        console.error("Error updating AI prompt:", error);
        res.status(500).json({ error: "Failed to update AI prompt" });
    }
};

const getAiPrompt = async (req, res) => {
    try {
        const { getAiSystemPrompt } = require('../services/cacheService');
        const prompt = await getAiSystemPrompt();
        res.json({ prompt });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch AI prompt" });
    }
};

module.exports = { updateAiPrompt, getAiPrompt };
