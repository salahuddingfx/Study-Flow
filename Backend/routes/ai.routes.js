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

// AI Route now protected to access user data
router.post('/ask', protect, async (req, res) => {
    try {
        if (!genAI) {
            return res.json({ answer: "AI সার্ভিসটি এখন অ্যাক্টিভ নেই। দয়া করে সার্ভারে API Key যোগ করুন।" });
        }
        
        const { prompt } = req.body;
        const userId = req.user.id;
        const userName = req.user.firstName ? `${req.user.firstName} ${req.user.lastName}` : req.user.username;
        const today = new Date().toLocaleString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
        });
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
            3. The current date provided in context is accurate. Use it to calculate days remaining for deadlines or to answer "what is today".
            4. 🔴 CRITICAL AUTO-ACTION RULE 🔴: 
               - If user says ANY variation of: "add [subject name]", "create task", "set goal", "add a subject", "make a task", etc.
               - You MUST ALWAYS include the action JSON at the END of your response
               - Format: |||{"action": "ACTION_TYPE", "data": {...}}|||
               
               Examples:
               User: "Add CSE Basic as a subject" 
               → Response: "Great! I'll add that for you. |||{"action": "add_subject", "data": {"name": "CSE Basic"}}|||"
               
               User: "Create task to study math tomorrow"
               → Response: "Got it! |||{"action": "create_task", "data": {"title": "Study math", "deadline": "2026-01-14"}}|||"
               
               User: "Set goal to read 5 books this month"
               → Response: "Excellent goal! |||{"action": "set_goal", "data": {"title": "Read books", "target": 5, "unit": "books", "type": "monthly"}}|||"
               
               Supported actions: "create_task", "add_subject", "set_goal"
               - create_task: required: title | optional: deadline (YYYY-MM-DD), priority (low/medium/high)
               - add_subject: required: name
               - set_goal: required: title, target (number), unit (string), type (daily/weekly/monthly)
            5. If user is just asking questions or chatting, reply normally WITHOUT any JSON.
        `;

        // Optimized Model Selection Based on Quota
        // Priority: Models with remaining daily quota
        const candidates = [
            'gemini-2.5-flash-lite', // 10 RPM, 20 RPD limit
            'gemini-2.5-flash'       // 5 RPM, 20 RPD limit
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
                    actionResult = `Created task: "${newTask.title}"`;
                    console.log("✅ Task created:", newTask);
                } 
                else if (actionJson.action === 'add_subject') {
                    const newSubject = await Subject.create({
                        user: userId,
                        name: actionJson.data.name
                    });
                    actionResult = `Added subject: "${newSubject.name}"`;
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
                    actionResult = `Set goal: "${newGoal.title}"`;
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
                    sessionId: session._id
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