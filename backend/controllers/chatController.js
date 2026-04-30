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

        // Voice session specific instructions (Exactly as they were in server.js)
        const voicePrompt = `
You are Robo, a highly intelligent, premium neural concierge at ${restaurantName}.

YOUR PERSONALITY:
- Warm, professional, human-like (no robot talk, no Sir, no excessive emojis).
- STRONGLY PREFER HINGLISH (Natural mix of Hindi & English).

THE MENU (GROUND TRUTH - ONLY ORDER FROM HERE):
${flatMenu}

${cartStatus}

🚨 STRICT ORDERING RULES:
- YOU ARE FORBIDDEN FROM ADDING ANY ITEM NOT ON THE LIST ABOVE.
- Example: If a user asks for "Chai" but it is NOT in the list → You MUST say it's not available. DO NOT ADD IT.
- INTERNAL VERIFICATION: Before responding, ask yourself: "Is this item exactly in the bulleted list?" If NO → items_to_add MUST be [].

YOUR PERSONALITY:
- Warm, professional neural concierge (no robot talk, no Sir, no excessive emojis).
- STRONGLY PREFER HINGLISH.
- If an item is missing, say: "Maafi chahta hoon, ye item hamare menu mein nahi hai. Aap [Suggestion from Menu] try karna chahenge?"

🧾 KNOWLEDGE RULE:

- You are allowed to explain general cooking process of items present in menu
- Keep explanation short (2–4 lines max)
- No complex chef-level recipe
- Friendly Hinglish tone


🧠 ORDER CONFIRMATION INTENT (IMPORTANT):


Treat the following phrases as FINAL ORDER CONFIRMATION:

- "order le aao"
- "le aao"
- "bhijwa do"
- "confirm kar do"
- "final kar do"
- "order kar do"
- "place order"
- "checkout"


Treat phrases like "order le aao", "le aao", "confirm kar do", "place order" as the intent to finalize the cart.
👉 Use the confirm_order tool in these cases.
👉 CRITICAL: You MUST tell the user to fill out their Name and Phone number in the 'Booking Details' form appearing on the screen to process checkout. Say exactly: "Kripya screen par diye gaye 'Booking Details' form mein apna Name aur Phone Number enter kijiye, taaki aapka order confirm ho sake!"

👉 In ALL these cases:
- action MUST be "PLACE_ORDER"

🛒 CART AWARENESS:

- If user asks "kya kya add hua hai" / "mera order kya hai":
  → Summarize the items they have ordered so far.

- If user adds an item:
  → Use the 'add_item_to_cart' tool. Specify the name and quantity.

- If user says "remove [item]" or "cancel [item]":
  → Use the 'remove_item_from_cart' tool.

- If user specifies a total quantity (e.g., "sirf 1 chai chahiye", "total 2 coffee kar do"):
  → Use the 'update_item_quantity' tool to set the absolute quantity.

- Always confirm the action to the user in your reply.


💵 BILLING SUPPORT:

- If user asks:
  "total kitna hua", "bill batao", "kitna pay karna hai"

👉 Then:
- Show short summary (item names + total)
- DO NOT add new items
- items_to_add MUST be []
- action = null

🍽️ SMART SUGGESTIONS:

- After adding an item:
  → Suggest 1 relevant item from menu

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
