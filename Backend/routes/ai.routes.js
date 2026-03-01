const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { protect } = require('../middleware/auth.middleware');
const Subject = require('../models/Subject');
const Task = require('../models/Task');
const Session = require('../models/Session');
const Goal = require('../models/Goal');
const Quiz = require('../models/Quiz');

// যদি API Key না থাকে, তবে ডামি রেসপন্স দিবে
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;
// Use user's preferred model (optimized for quota)
const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite';
// Public-facing developer info (avoid exposing multiple contacts)
const PUBLIC_DEV_NAME = process.env.PUBLIC_DEV_NAME || 'Salah Uddin Kader';
const PUBLIC_DEV_CONTACT = process.env.PUBLIC_DEV_CONTACT || 'salauddinkaderappy@gmail.com';
const PUBLIC_DEV_CONTACT_URL = process.env.PUBLIC_DEV_CONTACT_URL || '';
// Optional JSON array of contacts: [{"label":"Email","value":"sala..."}, {"label":"GitHub","value":"https://..."}]
let PUBLIC_DEV_CONTACTS = [];
try {
    PUBLIC_DEV_CONTACTS = process.env.PUBLIC_DEV_CONTACTS
        ? JSON.parse(process.env.PUBLIC_DEV_CONTACTS)
        : [];
} catch (err) {
    console.warn('Invalid PUBLIC_DEV_CONTACTS JSON. Falling back to single contact.');
    PUBLIC_DEV_CONTACTS = [];
}

// AI Route now protected to access user data
router.post('/ask', protect, async (req, res) => {
    try {
        if (!genAI) {
            return res.json({ answer: "AI সার্ভিসটি এখন অ্যাক্টিভ নেই। দয়া করে সার্ভারে API Key যোগ করুন।" });
        }
        
        const { prompt } = req.body;
        const userId = req.user.id;
        const userName = req.user.firstName ? `${req.user.firstName} ${req.user.lastName}` : req.user.username;
        const normalizedPrompt = (prompt || '').toLowerCase();

        // Get current time in Bangladesh timezone
        const now = new Date();
        const today = now.toLocaleString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
            timeZone: 'Asia/Dhaka'
        });
        const dayOfWeek = now.toLocaleString('en-US', { weekday: 'long', timeZone: 'Asia/Dhaka' });
        const currentHour = parseInt(now.toLocaleString('en-US', { hour: '2-digit', hour12: false, timeZone: 'Asia/Dhaka' }));
        // Time-based greeting
        let timeGreeting = 'Hello';
        if (currentHour >= 5 && currentHour < 12) timeGreeting = 'Good morning';
        else if (currentHour >= 12 && currentHour < 17) timeGreeting = 'Good afternoon';
        else if (currentHour >= 17 && currentHour < 21) timeGreeting = 'Good evening';
        else timeGreeting = 'Good night';

        // Fast path: developer or contact info questions (avoid hallucinations or listing multiple contacts)
        const isDeveloperQuestion = /\b(developers?|developed|creator|owner|founder|author|who made|who created|who built|made this|built this)\b|\b(ke ban|banay|banano|banai|developer ke|kader|salah)\b/.test(normalizedPrompt);
        const isContactQuestion = /\b(contact|email|mail|phone|whatsapp|facebook|linkedin|github)\b|\b(contact info|যোগাযোগ|ইমেইল|ফোন)\b/.test(normalizedPrompt);

        if (isDeveloperQuestion || isContactQuestion) {
            let contactLine = '';
            if (Array.isArray(PUBLIC_DEV_CONTACTS) && PUBLIC_DEV_CONTACTS.length > 0) {
                const formatted = PUBLIC_DEV_CONTACTS
                    .filter(c => c && c.label && c.value)
                    .map(c => `${c.label}: ${c.value}`)
                    .join(' | ');
                contactLine = `Contact: ${formatted}`;
            } else if (PUBLIC_DEV_CONTACT_URL) {
                contactLine = `Contact: ${PUBLIC_DEV_CONTACT_URL}`;
            } else {
                contactLine = `Contact: ${PUBLIC_DEV_CONTACT}`;
            }
            const answer = `${timeGreeting}, ${userName}! StudyFlow was developed by ${PUBLIC_DEV_NAME}. ${contactLine}`;
            return res.json({
                answer,
                model: 'static',
                timestamp: new Date().toISOString(),
                actionPerformed: null
            });
        }
        // Fetch user data for context
        const [subjects, tasks, sessions, goals] = await Promise.all([
            Subject.find({ user: userId }),
            Task.find({ user: userId, completed: false }),
            Session.find({ user: userId }).sort({ createdAt: -1 }).limit(5),
            Goal.find({ user: userId, current: { $lt: 100 } }) // Incomplete goals
        ]);

        // Construct context string
        const context = `
            Current Date and Time: ${today}
            User Profile:
            - Name: ${userName}
            - Current Subjects: ${subjects.map(s => s.name).join(', ') || 'None'}
            - Pending Tasks: ${tasks.map(t => `${t.title} (Due: ${t.deadline ? new Date(t.deadline).toDateString() : 'No date'})`).join(', ') || 'None'}
            - Recent Study Sessions: ${sessions.map(s => `${s.subject} for ${s.duration} mins on ${new Date(s.createdAt).toDateString()}`).join(', ') || 'None'}
            - Active Goals: ${goals.map(g => `${g.title} (Target: ${g.target} ${g.unit})`).join(', ') || 'None'}
        `;

        // Prepare developer contact info for the prompt
        let devContactInfo = '';
        if (Array.isArray(PUBLIC_DEV_CONTACTS) && PUBLIC_DEV_CONTACTS.length > 0) {
            devContactInfo = PUBLIC_DEV_CONTACTS
                .filter(c => c && c.label && c.value)
                .map(c => `${c.label}: ${c.value}`)
                .join(', ');
        } else {
             devContactInfo = PUBLIC_DEV_CONTACT || 'salauddinkaderappy@gmail.com';
        }

        const model = genAI.getGenerativeModel({ model: DEFAULT_MODEL });
        
        // Enhanced prompt with context
        const fullPrompt = `
            You are "StudyFlow AI", a friendly and smart personal study assistant for ${userName}.
            Current Context:
            ${context}

            User's Question: "${prompt}"

            Instructions:
            1. ALWAYS start with a time-appropriate greeting (adapt language to user): "${timeGreeting}, ${userName}!"
            2. Use the study data to give HIGHLY PERSONALIZED advice
            3. Be ENCOURAGING, CONCISE (2-3 sentences max unless detailed explanation needed), and ACTIONABLE
            4. The current date/time is: ${today} (Bangladesh time, Asia/Dhaka timezone)
            5. CRITICAL: Detect time-related queries accurately:
               - "What time is it?" → Use ${today}
               - "What day is today?" → Use ${dayOfWeek}
               - "Is it morning/afternoon/evening?" → Use ${timeGreeting} context
            6. 🤖 SMART AUTO-ACTION DETECTION (MANDATORY):
               
               TRIGGER KEYWORDS (English + Bengali):
               • Task: "add task", "create task", "new task", "make task", "task add koro", "task banaao"
               • Subject: "add subject", "new subject", "subject add", "subject banaao", "subject add koro"
               • Goal: "set goal", "create goal", "new goal", "goal set koro", "goal banaao"
               
               ACTION FORMAT: |||{"action": "TYPE", "data": {...}}|||
               
               Examples:
               ✅ "Add CSE Basic as a subject" 
                  → "${timeGreeting}! I'll add CSE Basic for you. |||{"action": "add_subject", "data": {"name": "CSE Basic"}}|||"
               
               ✅ "Create task: study math tomorrow"
                  → "Perfect! Task created. |||{"action": "create_task", "data": {"title": "Study math", "deadline": "YYYY-MM-DD", "priority": "medium"}}|||"
               
               ✅ "Set goal to complete 10 hours this week"
                  → "Great goal! |||{"action": "set_goal", "data": {"title": "Study hours", "target": 10, "unit": "hours", "type": "weekly"}}|||"
               
               ✅ "task add koro - math homework"
                  → "Thik ache! |||{"action": "create_task", "data": {"title": "Math homework", "priority": "medium"}}|||"
               
               SUPPORTED ACTIONS:
               • create_task: {title: string, deadline?: "YYYY-MM-DD", priority?: "low"|"medium"|"high"}
               • add_subject: {name: string, category?: string, color?: string}
               • set_goal: {title: string, target: number, unit: string, type: "daily"|"weekly"|"monthly"}
               
                7. ATTRIBUTION & CONTACT RULES (CRITICAL):
                    - StudyFlow was developed by ${PUBLIC_DEV_NAME}. NEVER claim Google or any other company as the developer.
                    - Developer Contact Info: ${devContactInfo}
                    - If asked for developer contact info, use ONLY the above information.
                    - Do NOT invent or guess contacts.
                8. SMART RESPONSES:
               - Questions/chat → Reply normally (NO JSON)
               - Action requests → Reply + JSON
               - Motivational advice → Be inspiring
               - Study tips → Be practical and specific
               
                9. LANGUAGE & COMMUNICATION:
                   - Detect the language of the User's Question (Bengali or English).
                   - Respond in the SAME language as the query (English -> English, Bengali -> Bengali).
                   - If the user uses "Banglish" (Bengali in English script), reply in standard Bengali or friendly Banglish.
                   - If explicitly asked to translate, perform the translation.
        `;

        // Optimized Model Selection Based on Quota
        // Priority: Models with remaining daily quota
        const candidates = [
            'gemini-2.5-flash-lite', // 10 RPM (Highest Quota)
            'gemini-2.5-flash',      // 5 RPM
        ];
        
        let text = null;
        let lastErr = null;
        let usedModel = null;
        
        // Loop through models until one works
        for (const m of candidates) {
            try {
                const activeModel = genAI.getGenerativeModel({ model: m });
                const result = await activeModel.generateContent(fullPrompt);
                const response = await result.response;
                text = response.text();
                usedModel = m;
                console.log(`✅ AI Success with model: ${m}`);
                break; // Stop loop if successful
            } catch (err) {
                console.log(`⚠️ AI Failed with ${m}:`, err.message);
                lastErr = err;
                // Continue to next model
            }
        }

        if (!text) {
             console.error('AI Fatal Error: All models failed.', lastErr);
             // Check if it's a quota error
             if (lastErr?.status === 429) {
                 throw new Error('Daily AI quota reached (20 requests per model). Quota resets at midnight UTC. Please try again later.');
             }
             throw new Error('All AI models are currently unavailable. Please try again later.');
        }

        // Check for Auto-Action
        const actionMatch = text.match(/\|\|\|(.*?)\|\|\|/s);
        let actionResult = null;

        if (actionMatch) {
            try {
                const actionJson = JSON.parse(actionMatch[1]);
                console.log("🤖 AI Action Triggered:", actionJson);

                if (actionJson.action === 'create_task') {
                    const taskData = {
                        user: userId,
                        title: actionJson.data.title,
                        priority: actionJson.data.priority || 'medium'
                    };
                    
                    // Only add deadline if it exists and is valid
                    if (actionJson.data.deadline) {
                        taskData.deadline = new Date(actionJson.data.deadline);
                    }
                    
                    const newTask = await Task.create(taskData);
                    actionResult = `Task created`;
                    console.log("✅ Task created:", newTask);
                } 
                else if (actionJson.action === 'add_subject') {
                    const newSubject = await Subject.create({
                        user: userId,
                        name: actionJson.data.name
                    });
                    actionResult = `Subject added`;
                    console.log("✅ Subject created:", newSubject);
                }
                else if (actionJson.action === 'set_goal') {
                    const newGoal = await Goal.create({
                        user: userId,
                        title: actionJson.data.title,
                        target: actionJson.data.target,
                        unit: actionJson.data.unit,
                        type: actionJson.data.type || 'daily',
                        current: 0
                    });
                    actionResult = `Goal set`;
                    console.log("✅ Goal created:", newGoal);
                }
                
                // Remove the JSON from the user-facing text
                text = text.replace(actionMatch[0], '').trim();
                text += `\n\n✅ ${actionResult}`;

            } catch (err) {
                console.error("❌ AI Action Failed:", err.message);
                text += "\n\n(Note: I tried to perform an action but something went wrong.)";
                // Still set actionResult to trigger refresh, but with error
                actionResult = "Action failed: " + err.message;
            }
        }
        
        // Send response with model info
        res.json({ 
            answer: text,
            model: usedModel,
            timestamp: new Date().toISOString(),
            actionPerformed: actionResult || null
        });
    } catch (error) {
        console.error('AI Error:', error);
        const message = error?.message?.includes('model')
            ? 'Unsupported Gemini model. Check GEMINI_MODEL env var.'
            : error?.message?.includes('API key')
            ? 'Invalid API key. Check GEMINI_API_KEY.'
            : 'AI processing failed';
        res.status(500).json({ message });
    }
});

// AI Study Plan Generator
router.post('/study-plan', protect, async (req, res) => {
    try {
        if (!genAI) {
            return res.json({ plan: 'AI service is not available right now.' });
        }

        const { focusArea = '', timeframe = '7 days', dailyHours = 2 } = req.body || {};
        const userId = req.user.id;
        const userName = req.user.firstName ? `${req.user.firstName} ${req.user.lastName}` : req.user.username;

        const [subjects, tasks, goals] = await Promise.all([
            Subject.find({ user: userId }),
            Task.find({ user: userId, completed: false }).limit(10),
            Goal.find({ user: userId, current: { $lt: 100 } }).limit(5)
        ]);

        const planPrompt = `
You are StudyFlow AI. Create a concise, actionable study plan.

User: ${userName}
Timeframe: ${timeframe}
Daily Hours: ${dailyHours}
Focus Area: ${focusArea || 'General study improvement'}

Current Subjects: ${subjects.map(s => s.name).join(', ') || 'None'}
Pending Tasks: ${tasks.map(t => t.title).join(', ') || 'None'}
Active Goals: ${goals.map(g => `${g.title} (${g.target} ${g.unit})`).join(', ') || 'None'}

Rules:
- Provide a day-by-day plan for the timeframe.
- Keep it under 10 bullets total if possible.
- Include short breaks and revision time.
- Output plain text only.
        `;

        const model = genAI.getGenerativeModel({ model: DEFAULT_MODEL });
        const result = await model.generateContent(planPrompt);
        const response = await result.response;
        const text = response.text();

        res.json({ plan: text, timestamp: new Date().toISOString() });
    } catch (error) {
        console.error('AI Study Plan Error:', error);
        res.status(500).json({ message: 'Failed to generate study plan' });
    }
});

// AI Weekly Summary
router.get('/weekly-summary', protect, async (req, res) => {
    try {
        const userId = req.user.id;
        const userName = req.user.firstName ? `${req.user.firstName} ${req.user.lastName}` : req.user.username;

        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const [sessions, completedTasks] = await Promise.all([
            Session.find({ user: userId, createdAt: { $gte: weekAgo } }),
            Task.find({ user: userId, completed: true, updatedAt: { $gte: weekAgo } })
        ]);

        const totalMinutes = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
        const totalSessions = sessions.length;
        const subjects = {};
        sessions.forEach(s => {
            const subject = s.subject || 'Unspecified';
            subjects[subject] = (subjects[subject] || 0) + (s.duration || 0);
        });

        if (!genAI) {
            return res.json({
                summary: `Weekly summary for ${userName}: ${totalSessions} sessions, ${totalMinutes} minutes, ${completedTasks.length} tasks completed.`,
                stats: { totalMinutes, totalSessions, completedTasks: completedTasks.length, subjects }
            });
        }

        const summaryPrompt = `
You are StudyFlow AI. Write a short, motivational weekly summary (2-4 sentences).

User: ${userName}
Total Sessions: ${totalSessions}
Total Minutes: ${totalMinutes}
Completed Tasks: ${completedTasks.length}
Top Subjects: ${Object.entries(subjects).map(([k, v]) => `${k}: ${v} mins`).join(', ') || 'None'}

Rules:
- Encourage consistency.
- Mention one improvement tip.
- Output plain text only.
        `;

        const model = genAI.getGenerativeModel({ model: DEFAULT_MODEL });
        const result = await model.generateContent(summaryPrompt);
        const response = await result.response;
        const text = response.text();

        res.json({
            summary: text,
            stats: { totalMinutes, totalSessions, completedTasks: completedTasks.length, subjects }
        });
    } catch (error) {
        console.error('AI Weekly Summary Error:', error);
        res.status(500).json({ message: 'Failed to generate weekly summary' });
    }
});

// Generate Quiz Route
router.post('/quiz', protect, async (req, res) => {
    try {
        if (!genAI) {
            return res.json({ questions: [] });
        }
        
        const { topic } = req.body;
        
        const candidates = [
            'gemini-2.5-flash-lite',
            'gemini-2.5-flash'
        ];

        let text = null;
        let usedModel = null;

        for (const m of candidates) {
            try {
                const model = genAI.getGenerativeModel({ model: m });
                const prompt = `
                    Generate a 5-question multiple choice quiz about "${topic}".
                    Return strictly a JSON array without any markdown formatting.
                    Structure:
                    [
                        {
                            "question": "Question text?",
                            "options": ["A", "B", "C", "D"],
                            "correctAnswer": 0 // Index of correct option (0-3)
                        }
                    ]
                `;

                const result = await model.generateContent(prompt);
                const response = await result.response;
                text = response.text();
                usedModel = m;
                console.log(`✅ Quiz generated with: ${m}`);
                break;
            } catch (err) {
                 console.log(`⚠️ Quiz Gen failed with ${m}:`, err.message);
            }
        }

        if (!text) throw new Error('Failed to generate quiz with all available models');
        
        // Clean markdown if present
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        
        const questions = JSON.parse(text);

        // Save to Database
        let quizId = null;
        if (req.user && req.user.id) {
            const savedQuiz = await Quiz.create({
                user: req.user.id,
                topic: topic,
                questions: questions
            });
            quizId = savedQuiz._id;
            console.log("💾 Quiz saved to database with ID:", quizId);
        }
        
        res.json({ questions, quizId });
    } catch (error) {
        console.error('Quiz Gen Error:', error);
        const message = error?.message?.includes('model')
            ? 'Unsupported Gemini model. Check GEMINI_MODEL env var.'
            : error?.message?.includes('API key')
            ? 'Invalid API key. Check GEMINI_API_KEY.'
            : 'Quiz generation failed';
        res.status(500).json({ message });
    }
});

// Update Quiz Score Route
router.put('/quiz/:id', protect, async (req, res) => {
    try {
        const { score, completed } = req.body;
        const quiz = await Quiz.findOne({ _id: req.params.id, user: req.user.id });
        
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }
        
        quiz.score = score;
        quiz.completed = completed;
        await quiz.save();
        
        // Award achievement points based on score
        const User = require('../models/User');
        const user = await User.findById(req.user.id);
        
        let pointsToAdd = 0;
        if (user && completed) {
            if (score === 100) {
                pointsToAdd = 50; // Perfect score bonus
            } else if (score >= 80) {
                pointsToAdd = 30; // High score
            } else if (score >= 60) {
                pointsToAdd = 20; // Good score
            } else if (score >= 40) {
                pointsToAdd = 10; // Passing score
            }
            
            if (pointsToAdd > 0) {
                user.achievementPoints = (user.achievementPoints || 0) + pointsToAdd;
                
                // Update level based on points
                const levelTiers = [
                    { level: 1, name: 'Bronze', minPoints: 0 },
                    { level: 2, name: 'Silver', minPoints: 250 },
                    { level: 3, name: 'Gold', minPoints: 750 },
                    { level: 4, name: 'Platinum', minPoints: 1500 },
                    { level: 5, name: 'Diamond', minPoints: 3000 }
                ];
                
                const currentTier = levelTiers.reverse().find(t => user.achievementPoints >= t.minPoints);
                if (currentTier) {
                    user.achievementLevel = currentTier.level;
                    user.achievementLevelName = currentTier.name;
                }
                
                await user.save();
                console.log(`⭐ User ${user.username} earned ${pointsToAdd} points for quiz score ${score}%`);
            }
        }
        
        res.json({ message: 'Quiz updated successfully', score, pointsAwarded: pointsToAdd || 0 });
    } catch (error) {
        console.error('Quiz Update Error:', error);
        res.status(500).json({ message: 'Quiz update failed' });
    }
});



// AI Timer Control - Ask AI to control/stop timer and save incomplete sessions
router.post('/timer-control', protect, async (req, res) => {
    try {
        const { command, elapsedMinutes, totalMinutes, subject } = req.body;
        const userId = req.user.id;
        
        // Commands: "start", "stop", "save-incomplete", "remind"
        if (command === 'save-incomplete') {
            // Auto-save incomplete session if user stops before timer ends
            if (elapsedMinutes > 0) {
                const session = await Session.create({
                    user: userId,
                    subject: subject || 'Quick Study',
                    duration: Math.round(elapsedMinutes),
                    date: new Date(),
                    completed: false, // Mark as incomplete
                    notes: `Incomplete session: ${elapsedMinutes}/${totalMinutes} minutes completed`
                });
                
                console.log(`✅ Incomplete session saved: ${elapsedMinutes} mins for ${subject}`);
                res.json({ 
                    success: true, 
                    message: `Great effort! Saved ${Math.round(elapsedMinutes)} minutes of study time.`,
                    sessionId: session._id,
                    session: {
                        _id: session._id,
                        subject: session.subject,
                        duration: session.duration,
                        timestamp: session.timestamp,
                        task: session.task || ''
                    }
                });
            } else {
                res.json({ success: false, message: 'No study time to save' });
            }
        } 
        else if (command === 'remind') {
            // AI sends motivational reminder
            const reminders = [
                "You're doing great! Keep pushing! 💪",
                "Time flies when you're learning! 📚",
                "Every minute counts towards your goals! 🎯",
                "You're building amazing study habits! ✨",
                "Stay focused, you've got this! 🔥"
            ];
            
            res.json({ 
                success: true, 
                reminder: reminders[Math.floor(Math.random() * reminders.length)],
                elapsedMinutes
            });
        }
        
    } catch (error) {
        console.error('Timer Control Error:', error);
        res.status(500).json({ message: 'Timer control failed', error: error.message });
    }
});

// Health check to verify AI readiness
router.get('/health', (req, res) => {
    const availableModels = [
        { name: 'gemini-2.5-flash-lite', rateLimit: '10 RPM', dailyQuota: '20 RPD', status: '✅ Primary', recommended: true },
        { name: 'gemini-2.5-flash', rateLimit: '5 RPM', dailyQuota: '20 RPD', status: '✅ Backup' },
        { name: 'gemini-2.5-flash-tts', rateLimit: '3 RPM', dailyQuota: '10 RPD', status: '🔇 Audio Only (Not used)' },
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