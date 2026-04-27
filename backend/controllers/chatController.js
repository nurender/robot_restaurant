const { ai, openai } = require('../config/ai');
const { pool } = require('../config/db');
const { getAiSystemPrompt } = require('../services/cacheService');

// 🧠 Zero-Hallucination Menu Pre-Processor
function flattenMenu(categories) {
    if (!Array.isArray(categories)) return "Menu not available.";
    let menuList = "";
    categories.forEach(cat => {
        if (cat.items && Array.isArray(cat.items)) {
            cat.items.filter(item => item.is_active !== false).forEach(item => {
                menuList += `- ${item.name} (Price: ₹${item.price}, ID: ${item.id}, Image: ${item.image_url || 'No Image'})\n`;
            });
        }
    });
    return menuList || "Menu is empty.";
}

const handleChat = async (req, res) => {
    const { transcript, menuContext, cartContext, textLanguage, chatHistory = [], restaurantId, isIOS } = req.body;
    let restaurantName = "Cyber Chef";

    if (restaurantId) {
        try {
            const restRes = await pool.query("SELECT name FROM restaurants WHERE id = $1", [restaurantId]);
            if (restRes.rows.length > 0) restaurantName = restRes.rows[0].name;
            console.log(`🔍 AI for ${restaurantName} (ID: ${restaurantId})`);
        } catch (e) { console.error("Rest Name Fetch Error:", e.message); }
    }

    const provider = process.env.AI_PROVIDER || 'GEMINI';
    const flatMenu = flattenMenu(menuContext);
    console.log(`🤖 AI Processing [${provider}]: "${transcript}"`);

    // Dynamic Prompt from DB via Cache Service (Global)
    let basePrompt = await getAiSystemPrompt();
    
    // Inject dynamic variables
    basePrompt = basePrompt.replace('{{RESTAURANT_NAME}}', restaurantName);
    basePrompt = basePrompt.replace('{{FLAT_MENU}}', flatMenu);

    const contextPrompt = `
${basePrompt}

CONTEXT:
${chatHistory.map(h => `${h.role}: ${h.text}`).join('\n')}

USER REQUEST:
"${transcript}"
`;

    // 🚨 Ensure response follows strictly this schema
    const schemaInstructions = `
You MUST return ONLY a raw JSON object with this exact structure:
{
    "reply": "Your conversational response in Hinglish",
    "items_to_add": [
        { "id": "item_id_from_menu_list", "qty": number }
    ],
    "action": "PLACE_ORDER" | "EXPAND_CATEGORY" | null,
    "category": "Category name if EXPAND_CATEGORY" | null
}
Never include markdown formatting (\`\`\`json) or extra text.
`;

    try {
        let aiJsonResponse = "";

        if (provider === 'OPENAI' && openai) {
            const completion = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: contextPrompt + schemaInstructions }
                ],
                response_format: { type: "json_object" },
                temperature: 0.1
            });
            aiJsonResponse = completion.choices[0].message.content;
        } else if (ai) {
            const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });
            const result = await model.generateContent(contextPrompt + schemaInstructions);
            aiJsonResponse = result.response.text().trim();
            if (aiJsonResponse.startsWith('```json')) {
                aiJsonResponse = aiJsonResponse.replace(/^```json/, '').replace(/```$/, '').trim();
            }
        } else {
            return res.status(500).json({ error: "No AI Provider Configured" });
        }

        const jsonMatch = aiJsonResponse.match(/\{[\s\S]*\}/);
        const parsedData = JSON.parse(jsonMatch ? jsonMatch[0] : aiJsonResponse);
        console.log("📤 AI Parsed Response:", parsedData);

        // 🔊 Optional Neural TTS for iOS (Premium Voice)
        if (isIOS === true || isIOS === 'true') {
            const responseText = parsedData.reply_text || parsedData.reply || "";
            console.log("🔊 Generating Premium Neural Voice for iOS...", responseText);
            const { generateNeuralTTS } = require('../config/ai');
            const audioData = await generateNeuralTTS(responseText, textLanguage);
            if (audioData) parsedData.audio_response = audioData;
        }

        res.json(parsedData);

    } catch (error) {
        console.error(`❌ [${provider}] Processing Error:`, error.message);
        res.status(500).json({
            reply_text: "Maafi chahta hoon, mujhe samajhne me thodi problem ho rahi hai.",
            items_to_add: []
        });
    }
};

const handleRealtimeSession = async (req, res) => {
    try {
        const { OPENAI_REALTIME_API_KEY } = require('../config/ai');
        const axios = require('axios');
        if (!OPENAI_REALTIME_API_KEY || OPENAI_REALTIME_API_KEY === 'your_OPENAI_REALTIME_API_KEY_here') {
            console.error("❌ OPENAI_REALTIME_API_KEY is missing");
            return res.status(500).json({ error: 'OPENAI_REALTIME_API_KEY is not set' });
        }

        const { restaurantId } = req.query;
        if (!restaurantId) return res.status(400).json({ error: "Missing restaurantId" });

        const menuResult = await pool.query('SELECT name, description, price FROM menu WHERE restaurant_id = $1', [restaurantId]);
        const menu = menuResult.rows;
        const flatMenu = menu.map(m => `- ${m.name} (₹${m.price}): ${m.description || 'No description'}`).join('\n');

        let restaurantName = "Cyber Chef";
        try {
            const restRes = await pool.query("SELECT name FROM restaurants WHERE id = $1", [restaurantId]);
            if (restRes.rows.length > 0) restaurantName = restRes.rows[0].name;
        } catch (e) { console.error("Rest Name Fetch Error:", e.message); }

        let basePrompt = await getAiSystemPrompt();
        basePrompt = basePrompt.replace('{{RESTAURANT_NAME}}', restaurantName);
        basePrompt = basePrompt.replace('{{FLAT_MENU}}', flatMenu);

        // Voice session specific instructions (Exactly as they were in server.js)
        const voicePrompt = `
You are Robo, a highly intelligent, premium neural concierge at ${restaurantName}.

YOUR PERSONALITY:
- Warm, professional, human-like (no robot talk, no Sir, no excessive emojis).
- STRONGLY PREFER HINGLISH (Natural mix of Hindi & English).

THE MENU (GROUND TRUTH - ONLY ORDER FROM HERE):
${flatMenu}

🚨 STRICT ORDERING RULES:
- YOU ARE FORBIDDEN FROM ADDING ANY ITEM NOT ON THE LIST ABOVE.
- If a user asks for something NOT in the list → You MUST say it's not available. DO NOT ADD IT.
- Before responding, ask yourself: "Is this item exactly in the list?" If NO → do not use the add_item tool.

YOUR PERSONALITY:
- Warm, professional neural concierge.
- STRONGLY PREFER HINGLISH.
- If an item is missing, say: "Maafi chahta hoon, ye item hamare menu mein nahi hai. Aap [Suggestion from Menu] try karna chahenge?"

🧾 KNOWLEDGE RULE:
- You are allowed to explain general cooking process of items present in menu.
- Keep explanation short (2–4 lines max).
- Friendly Hinglish tone.

🧠 ORDER CONFIRMATION INTENT:
Treat phrases like "order le aao", "le aao", "confirm kar do", "place order" as FINAL confirmation.
👉 Use the confirm_order tool in these cases.

🛒 CART AWARENESS:
- If user asks "kya kya add hua hai" → Show current cart.
- If user adds same item again → increase quantity.
- To remove items, use the remove_item_from_cart tool with the correct name.

💵 BILLING SUPPORT:
- If user asks for bill/total → Show short summary (item names + total). Do not add items.

📂 CATEGORY HANDLING:
- If user says "menu dikhao" or asks for a category → Use the show_menu tool.

🔎 SMART MATCHING:
- Handle variations like "chai"/"tea".
- If confidence low → ask clarification.

🗣️ HUMAN TONE:
- Vary replies: "Add kar diya hai", "Ho gaya", "Done".
- Avoid repeating same sentence.

🧹 RESPONSE CLEANLINESS:
- Max 1–2 lines for order responses.
- No unnecessary explanation.

**CRITICAL: You MUST ALWAYS speak and respond strictly in HINGLISH.**`;

        const response = await axios.post(
            'https://api.openai.com/v1/realtime/sessions',
            {
                model: 'gpt-realtime-1.5',
                voice: 'shimmer',
                modalities: ['audio', 'text'],
                instructions: voicePrompt,
                input_audio_format: 'pcm16',
                output_audio_format: 'pcm16',
                input_audio_transcription: { model: 'whisper-1' },
                turn_detection: { type: 'server_vad' },
                tools: [
                    {
                        type: 'function',
                        name: 'add_item_to_cart',
                        description: "Adds a food item to the user's shopping cart.",
                        parameters: {
                            type: 'object',
                            properties: {
                                name: { type: 'string' },
                                quantity: { type: 'integer', default: 1 }
                            },
                            required: ['name']
                        }
                    },
                    {
                        type: 'function',
                        name: 'remove_item_from_cart',
                        description: "Removes a specific food item from the user's shopping cart.",
                        parameters: {
                            type: 'object',
                            properties: {
                                name: { type: 'string' },
                                quantity: { type: 'integer', default: 1 }
                            },
                            required: ['name']
                        }
                    },
                    {
                        type: 'function',
                        name: 'show_item_photo',
                        description: 'Displays a high-quality photograph of a menu item to the user.',
                        parameters: {
                            type: 'object',
                            properties: {
                                name: { type: 'string' }
                            },
                            required: ['name']
                        }
                    },
                    {
                        type: 'function',
                        name: 'show_menu',
                        description: 'Opens the menu popup to browse categories.',
                        parameters: {
                            type: 'object',
                            properties: {
                                category: { type: 'string' }
                            }
                        }
                    },
                    {
                        type: 'function',
                        name: 'confirm_order',
                        description: 'Confirms and places the order.',
                        parameters: {
                            type: 'object',
                            properties: {}
                        }
                    }
                ],
                tool_choice: 'auto',
            },
            {
                headers: {
                    Authorization: `Bearer ${OPENAI_REALTIME_API_KEY}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        res.json(response.data);
    } catch (error) {
        console.error("❌ Session Error:", error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to initialize session' });
    }
};

module.exports = { handleChat, handleRealtimeSession };
