const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { protect } = require('../middleware/auth.middleware');
const Subject = require('../models/Subject');
const Task = require('../models/Task');
const Session = require('../models/Session');
const Goal = require('../models/Goal');

// যদি API Key না থাকে, তবে ডামি রেসপন্স দিবে
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;
// Using unlimited model as default to avoid rate limits
const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp';

// AI Route now protected to access user data
router.post('/ask', protect, async (req, res) => {
    try {
        if (!genAI) {
            return res.json({ answer: "AI সার্ভিসটি এখন অ্যাক্টিভ নেই। দয়া করে সার্ভারে API Key যোগ করুন।" });
        }
        
        const { prompt } = req.body;
        const userId = req.user.id;
        const userName = req.user.firstName ? `${req.user.firstName} ${req.user.lastName}` : req.user.username;

        // Fetch user data for context
        const [subjects, tasks, sessions, goals] = await Promise.all([
            Subject.find({ user: userId }),
            Task.find({ user: userId, completed: false }),
            Session.find({ user: userId }).sort({ createdAt: -1 }).limit(5),
            Goal.find({ user: userId, current: { $lt: 100 } }) // Incomplete goals
        ]);

        // Construct context string
        const context = `
            User Profile:
            - Name: ${userName}
            - Current Subjects: ${subjects.map(s => s.name).join(', ') || 'None'}
            - Pending Tasks: ${tasks.map(t => `${t.title} (Due: ${t.deadline ? new Date(t.deadline).toDateString() : 'No date'})`).join(', ') || 'None'}
            - Recent Study Sessions: ${sessions.map(s => `${s.subject} for ${s.duration} mins on ${new Date(s.createdAt).toDateString()}`).join(', ') || 'None'}
            - Active Goals: ${goals.map(g => `${g.title} (Target: ${g.target} ${g.unit})`).join(', ') || 'None'}
        `;

        const model = genAI.getGenerativeModel({ model: DEFAULT_MODEL });
        
        // Enhanced prompt with context
        const fullPrompt = `
            You are "StudyFlow AI", a personal study assistant for ${userName}.
            Here is the user's current study data:
            ${context}

            User's Question: "${prompt}"

            Instructions:
            1. Use the study data to give personalized advice if relevant.
            2. Be encouraging, concise, and helpful.
            3. If the user asks to "add a subject", "start a timer", or "create a task", guide them on how to do it in the app, or confirm you understand (even though you can't execute actions directly yet, respond as a helpful assistant).
            4. If the user asks for motivation, use their goals or tasks to inspire them.
        `;

        // Fallback chain: Start with unlimited models, then stable ones
        const candidates = [
            'gemini-2.0-flash-exp',           // Unlimited experimental model
            'gemini-exp-1206',                // Experimental (often unlimited)
            'gemma-2-9b-it',                  // Gemma 9B model
            'gemma-2-27b-it',                 // Gemma 27B model
            'gemini-2.5-flash',               // Rate limited (5 RPM)
            'gemini-3-flash',
            'gemini-2.5-flash-lite',
            'gemini-1.5-pro',
            'gemini-1.0-pro'
        ];
        let text = null;
        let lastErr = null;
        let usedModel = null;
        for (const m of candidates.filter(Boolean)) {
            try {
                const activeModel = genAI.getGenerativeModel({ model: m });
                const result = await activeModel.generateContent(fullPrompt);
                const response = await result.response;
                text = response.text();
                usedModel = m;
                console.log(`✅ AI Success with model: ${m}`);
                break;
            } catch (err) {
                console.log(`❌ AI Failed with ${m}:`, err.message);
                lastErr = err;
                continue;
            }
        }

        if (!text) {
            console.error('AI Fallback Error:', lastErr);
            return res.status(500).json({ message: 'No supported Gemini model responded. Check your API key and available models.' });
        }
        
        // Send response with model info
        res.json({ 
            answer: text,
            model: usedModel,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('AI Error:', error);
        const message = error?.message?.includes('model')
            ? 'Unsupported Gemini model. Set GEMINI_MODEL to gemini-1.5-flash or gemini-1.5-pro.'
            : error?.message?.includes('API key')
            ? 'Invalid API key. Check GEMINI_API_KEY.'
            : 'AI failed to respond';
        res.status(500).json({ message });
    }
});

// Health check to verify AI readiness
router.get('/health', (req, res) => {
    const availableModels = [
        { name: 'gemini-2.0-flash-exp', rateLimit: 'Unlimited ⚡', recommended: true },
        { name: 'gemini-exp-1206', rateLimit: 'Unlimited ⚡' },
        { name: 'gemma-2-9b-it', rateLimit: 'Varies' },
        { name: 'gemma-2-27b-it', rateLimit: 'Varies' },
        { name: 'gemini-2.5-flash', rateLimit: '5 RPM / 20 RPD ⚠️' },
    ];
    
    res.json({ 
        active: !!genAI, 
        defaultModel: DEFAULT_MODEL,
        hasKey: !!process.env.GEMINI_API_KEY,
        availableModels,
        status: genAI ? '✅ Ready' : '❌ No API Key'
    });
});

module.exports = router;