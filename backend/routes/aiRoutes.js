const express = require('express');
const OpenAI = require('openai');
const db = require('../config/db');
const auth = require('../middleware/authMiddleware');
const router = express.Router();

// Initialize Groq (using the OpenAI library)
const openai = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: 'https://api.groq.com/openai/v1',
});

// @route   POST /api/ai/chat
// @desc    Chat with the AI about inventory
router.post('/chat', auth, async (req, res) => {
    const { message } = req.body;

    try {
        const [products] = await db.query('SELECT name, current_quantity, min_stock_level, buying_price, selling_price FROM products');
        const [[finance]] = await db.query('SELECT SUM(current_quantity * buying_price) as asset_value, SUM(current_quantity * selling_price) as potential_revenue FROM products');
        
        const productList = products.map(p => `${p.name} (Qty: ${p.current_quantity}, Min: ${p.min_stock_level}, Buy: $${p.buying_price}, Sell: $${p.selling_price})`).join('; ');
        const inventoryContext = `
            Total Asset Value: $${finance.asset_value || 0}. 
            Potential Revenue: $${finance.potential_revenue || 0}. 
            Products list: ${productList}
        `;

        const response = await openai.chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages: [
                {
                    role: "system",
                    content: `You are a helpful inventory assistant for an app called StockFlow. Here is the current database data: ${inventoryContext}. Answer concisely based ONLY on the provided data.`
                },
                {
                    role: "user",
                    content: message
                }
            ],
        });

        const reply = response.choices[0].message.content;
        res.json({ reply });
    } catch (error) {
        console.error("GROQ API ERROR:", error.message);
        res.status(500).json({ message: 'Failed to get AI response.' });
    }
});

// @route   POST /api/ai/generate-product
// @desc    Generate product details from a name using Groq
router.post('/generate-product', auth, async (req, res) => {
    const { productName } = req.body;

    if (!productName) return res.status(400).json({ message: 'Product name is required' });

    try {
        const response = await openai.chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages: [
                {
                    role: "system",
                    content: "You are an inventory management assistant. Given a product name, generate realistic inventory details. Respond ONLY with valid JSON."
                },
                {
                    role: "user",
                    content: `Generate inventory details for: ${productName}. Format: {"sku": "short-alphanumeric", "category": "category name", "buying_price": number, "selling_price": number, "min_stock_level": number}`
                }
            ],
            temperature: 0.7,
            response_format: { type: "json_object" },
        });

        const aiData = JSON.parse(response.choices[0].message.content);
        res.json(aiData);
    } catch (error) {
        console.error("AI GENERATE ERROR:", error.message);
        res.status(500).json({ message: 'Failed to generate AI data.' });
    }
});

// @route   GET /api/ai/forecast
// @desc    Generate AI demand forecast based on recent history
router.get('/forecast', auth, async (req, res) => {
    try {
        // 1. Fetch last 30 days of stock OUT movements (sales/usage)
        const [history] = await db.query(`
            SELECT p.name, sm.quantity, sm.created_at 
            FROM stock_movements sm 
            JOIN products p ON sm.product_id = p.id 
            WHERE sm.type = 'OUT' AND sm.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            ORDER BY sm.created_at DESC
        `);
        
        // 2. Fetch current low stock items
        const [lowStock] = await db.query('SELECT name, current_quantity, min_stock_level FROM products WHERE current_quantity <= min_stock_level');

        if (history.length === 0) {
            return res.json({ forecast: "Not enough sales data yet to generate a forecast. Please record some 'Stock Out' movements first!" });
        }

        const historyContext = history.map(h => `${h.name}: -${h.quantity} on ${new Date(h.created_at).toLocaleDateString()}`).join('; ');
        const lowStockContext = lowStock.map(p => `${p.name} (Current: ${p.current_quantity}, Min: ${p.min_stock_level})`).join('; ');

        // 3. Call Groq AI to analyze the data
        const response = await openai.chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages: [
                {
                    role: "system",
                    content: "You are an expert supply chain forecasting AI. Analyze the 30-day sales history and current low stock items. Provide 3 concise bullet points predicting what will run out soon and recommended actions. Use plain text with simple dashes (-) for bullets."
                },
                {
                    role: "user",
                    content: `30-Day Sales History: ${historyContext}. Current Low Stock: ${lowStockContext}.`
                }
            ],
        });

        const forecast = response.choices[0].message.content;
        res.json({ forecast });
    } catch (error) {
        console.error("FORECAST ERROR:", error.message);
        res.status(500).json({ message: 'Failed to generate forecast.' });
    }
});
module.exports = router;