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
    const { transcript, menuContext, cartContext, textLanguage, chatHistory = [], restaurantId, isIOS, phone } = req.body;
    let restaurantName = "Cyber Chef";
    let userPrefContext = "";

    // 1. Fetch Restaurant & User Details
    if (restaurantId) {
        try {
            const [restRes, prefRes] = await Promise.all([
                pool.query("SELECT name FROM restaurants WHERE id = $1", [restaurantId]),
                phone ? pool.query("SELECT preferences FROM user_preferences WHERE phone = $1", [phone]) : Promise.resolve({ rows: [] })
            ]);

            if (restRes.rows.length > 0) restaurantName = restRes.rows[0].name;
            if (prefRes.rows.length > 0) {
                const prefs = prefRes.rows[0].preferences;
                userPrefContext = `CUSTOMER PREFERENCES: ${JSON.stringify(prefs)}`;
                console.log(`🧠 AI recalled preferences for ${phone}`);
            }
        } catch (e) { console.error("Data Fetch Error:", e.message); }
    }

    const provider = process.env.AI_PROVIDER || 'GEMINI';
    const flatMenu = flattenMenu(menuContext);

    // 2. Build Intelligent Prompt
    let basePrompt = await getAiSystemPrompt();
    basePrompt = basePrompt.replace('{{RESTAURANT_NAME}}', restaurantName);
    basePrompt = basePrompt.replace('{{FLAT_MENU}}', flatMenu);

    const contextPrompt = `
${basePrompt}

${userPrefContext}

CONTEXT:
${chatHistory.map(h => `${h.role}: ${h.text}`).join('\n')}

USER REQUEST:
"${transcript}"
`;

    const schemaInstructions = `
You MUST return ONLY a raw JSON object with this exact structure:
{
    "reply": "Your Hinglish response",
    "items_to_add": [
        { "id": "item_id_from_menu_list", "qty": number }
    ],
    "action": "PLACE_ORDER" | "EXPAND_CATEGORY" | null,
    "mood": "happy" | "neutral" | "angry" | "sad",
    "detected_preference": { "key": "value" } | null
}
Mood Analysis: Adjust tone based on mood. If angry, be extra apologetic.
Never include markdown formatting or extra text.
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

        const { restaurantId, cart } = req.body;
        if (!restaurantId) return res.status(400).json({ error: "Missing restaurantId" });

        const menuResult = await pool.query('SELECT name, description, price FROM menu WHERE restaurant_id = $1', [restaurantId]);
        const menu = menuResult.rows;
        const flatMenu = menu.map(m => `- ${m.name} (₹${m.price}): ${m.description || 'No description'}`).join('\n');

        let restaurantName = "Cyber Chef";
        try {
            const restRes = await pool.query("SELECT name FROM restaurants WHERE id = $1", [restaurantId]);
            if (restRes.rows.length > 0) restaurantName = restRes.rows[0].name;
        } catch (e) { console.error("Rest Name Fetch Error:", e.message); }

        let cartStatus = "The cart is currently empty.";
        if (cart && Array.isArray(cart) && cart.length > 0) {
            cartStatus = "Current Cart Items:\n" + cart.map(i => `- ${i.name}: ${i.qty || i.quantity || 1}`).join('\n');
        }
        console.log("Current Cart for Session:", cartStatus);

        // Voice session specific instructions
        const voicePrompt = `
You are Robo, a highly intelligent, premium neural concierge at ${restaurantName}.

YOUR PERSONALITY:
- Warm, professional, human-like (no robot talk, no Sir, no excessive emojis).
- STRONGLY PREFER HINGLISH (Natural mix of Hindi & English).
- Your goal is to make the user smile and recover angry customers.

THE MENU (GROUND TRUTH - ONLY ORDER FROM HERE):
${flatMenu}

${cartStatus}

🚀 ADVANCED BUSINESS OBJECTIVES:
- Detect hunger urgency (suggest quick items).
- Detect group ordering (suggest combos/family packs).
- Detect budget sensitivity (suggest value meals/budget items under ₹200).
- Increase Average Order Value (upsell complementary items).
- Recover angry customers with empathy and fast solutions.

🛒 CART OPERATIONS (USE TOOLS ONLY):
- To ADD multiple items: Use 'add_items_to_cart' (Pass all items in the array).
- To ADD a single item: Use 'add_item_to_cart'.
- To REMOVE an item: Use 'remove_item_from_cart'.
- To SET a total (e.g. "total 1 chai"): Use 'update_item_quantity'.
- To CLEAR the whole cart: Use 'clear_cart'.
- To CONFIRM order (Checkout): You MUST call 'confirm_order' tool first, then speak.

🎁 OFFERS & DISCOUNTS:
- If user asks for offers/deals: Use 'show_offers'.
- To apply a coupon: Use 'apply_coupon'.

📈 RECOMMENDATIONS & LOYALTY:
- To show famous/popular items: Use 'show_best_sellers'.
- To repeat previous order: Use 'repeat_last_order'.
- To track a previous order: Use 'track_order'.
- To save preferences (e.g. "no onion", "less sugar"): Use 'save_user_preference'.

🧠 SMART CART RULES:
- If "budget < 200": Suggest budget-friendly menu.
- If "healthy": Filter for healthy items.
- If "urgent/jaldi": Suggest items with fast prep time.

🔎 SMART MATCHING:
- Handle variations like "chai/tea", "coffee/cofee" by matching to the closest menu item.
- If ambiguous, ask for clarification.

🗣️ TONE & STYLE:
- Keep replies short (1-2 lines).
- ALWAYS confirm every action VERBALLY. Never remain silent after a tool call.
- After adding items, say: "Zaroor! Maine [items] add kar diye hain. Kuch aur chahiye?"
- Use Hinglish naturally.
- IMPORTANT: Calling 'confirm_order' ONLY opens the checkout form. The order is NOT yet complete.
- If you receive a system message saying the form was closed, DO NOT assume it is still open.
- When you open the form, NEVER say "Order confirmed" or "Order booked". 
- Instead, ALWAYS say: "Zaroor! Maine checkout form open kar diya hai. Kripya screen par apni details bhar dijiye aur phir 'Confirm Order' button par click karke apna order confirm kijiye!"

💵 BILLING SUPPORT:
- If user asks for bill/total: Show items and total amount.

🍽️ SMART SUGGESTIONS:
- After adding an item: → Suggest 1 relevant item from menu

Example:
"Ek Elaichi Chai add kar di hai 🙂 Aap iske saath Samosa try karna chahenge?"

- Keep suggestion optional (not pushy)

📂 CATEGORY HANDLING:

- If user says:
  "menu dikhao", "kya kya hai", "drinks dikhao"

👉 Then:
- action = "EXPAND_CATEGORY"
- category = relevant category name
- items_to_add = []

🔎 SMART MATCHING:

- Handle variations:
  "chai", "chay", "tea" → same item
  "cofee", "coffee" → same

- Match closest item from menu
- BUT:
  If confidence low → ask clarification

❓ CLARIFICATION RULE:

- If user input unclear:
  → Ask short clarification question
  → DO NOT add item

Example:
"Kaunsi chai chahiye? Elaichi ya normal?"

🚫 EMPTY CART RULE:

- If user tries to place order without items:
  → Reject politely
  → Suggest adding items

  🗣️ HUMAN TONE:

- Vary replies slightly:
  "Add kar diya hai"
  "Ho gaya"
  "Done, add ho gaya"

- Avoid repeating same sentence every time

🧹 RESPONSE CLEANLINESS:

- No long paragraphs in order responses
- Max 1–2 lines
- No unnecessary explanation

🧠 CONTEXT MEMORY:

- Use previous chat to understand:
  → already added items
  → user preferences

Example:
User: "aur ek aur wahi"
→ Add same last item again

🚫 RESPONSE SEPARATION RULE:

- If user intent = ORDER (user wants to buy / add item):
  → ONLY confirm order
  → DO NOT explain recipe
  → Keep reply short

- If user intent = INFORMATION (kaise banta hai / ingredients / recipe):
  → ONLY explain
  → DO NOT add item to cart
  → items_to_add MUST be []

- NEVER mix both actions in one response
`;

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
                        name: 'add_items_to_cart',
                        description: "Adds multiple food items to the user's shopping cart at once.",
                        parameters: {
                            type: 'object',
                            properties: {
                                items: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            name: { type: 'string' },
                                            quantity: { type: 'integer', default: 1 }
                                        },
                                        required: ['name']
                                    }
                                }
                            },
                            required: ['items']
                        }
                    },
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
                    },
                    {
                        type: 'function',
                        name: 'update_item_quantity',
                        description: "Updates the absolute quantity of an item in the user's shopping cart.",
                        parameters: {
                            type: 'object',
                            properties: {
                                name: { type: 'string' },
                                quantity: { type: 'integer' }
                            },
                            required: ['name', 'quantity']
                        }
                    },
                    {
                        type: 'function',
                        name: 'show_best_sellers',
                        description: 'Displays the most popular and trending items from the menu.',
                        parameters: { type: 'object', properties: {} }
                    },
                    {
                        type: 'function',
                        name: 'apply_coupon',
                        description: 'Applies a discount coupon to the current order.',
                        parameters: {
                            type: 'object',
                            properties: {
                                code: { type: 'string', description: 'The coupon code to apply' }
                            }
                        }
                    },
                    {
                        type: 'function',
                        name: 'repeat_last_order',
                        description: 'Automatically populates the cart with the items from the user\'s last successful order.',
                        parameters: { type: 'object', properties: {} }
                    },
                    {
                        type: 'function',
                        name: 'track_order',
                        description: 'Shows the real-time status and ETA of the active order.',
                        parameters: { type: 'object', properties: {} }
                    },
                    {
                        type: 'function',
                        name: 'clear_cart',
                        description: 'Removes all items from the current shopping cart.',
                        parameters: { type: 'object', properties: {} }
                    },
                    {
                        type: 'function',
                        name: 'show_offers',
                        description: 'Displays all active promotional offers and deals.',
                        parameters: { type: 'object', properties: {} }
                    },
                    {
                        type: 'function',
                        name: 'save_user_preference',
                        description: 'Saves user-specific preferences like food choices, spice levels, or allergies.',
                        parameters: {
                            type: 'object',
                            properties: {
                                preference: { type: 'string', description: 'The preference to save (e.g., "no onion", "extra spicy")' }
                            },
                            required: ['preference']
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
