const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const Achievement = require('../models/Achievement');
const Session = require('../models/Session');
const Task = require('../models/Task');
const Goal = require('../models/Goal');
const Subject = require('../models/Subject');

// Get io instance
let io;
const setIo = (socketIo) => {
    io = socketIo;
};
module.exports.setIo = setIo;

// Level progression configuration
const LEVEL_CONFIG = {
    1: { name: 'Bronze', color: '#CD7F32', minPoints: 0, maxPoints: 249 },
    2: { name: 'Silver', color: '#C0C0C0', minPoints: 250, maxPoints: 749 },
    3: { name: 'Gold', color: '#FFD700', minPoints: 750, maxPoints: 1499 },
    4: { name: 'Platinum', color: '#E5E4E2', minPoints: 1500, maxPoints: 2999 },
    5: { name: 'Diamond', color: '#B9F2FF', minPoints: 3000, maxPoints: Infinity }
};

// Predefined achievements with levels
const DEFAULT_ACHIEVEMENTS = [
    // Study Time - Levels 1-5
    {
        title: "First Steps",
        description: "Complete your first study session",
        icon: "play-circle",
        category: "study-time",
        criteria: { type: "sessions-count", value: 1, period: "all-time" },
        rarity: "common",
        level: 1,
        levelName: "Bronze",
        points: 10
    },
    {
        title: "Hour Master",
        description: "Study for 1 hour total",
        icon: "clock",
        category: "study-time",
        criteria: { type: "total-hours", value: 1, period: "all-time" },
        rarity: "common",
        level: 1,
        levelName: "Bronze",
        points: 15
    },
    {
        title: "Dedicated Scholar",
        description: "Study for 10 hours total",
        icon: "book",
        category: "study-time",
        criteria: { type: "total-hours", value: 10, period: "all-time" },
        rarity: "rare",
        level: 2,
        levelName: "Silver",
        points: 50
    },
    {
        title: "Study Warrior",
        description: "Study for 50 hours total",
        icon: "shield",
        category: "study-time",
        criteria: { type: "total-hours", value: 50, period: "all-time" },
        rarity: "epic",
        level: 3,
        levelName: "Gold",
        points: 150
    },
    {
        title: "Legendary Scholar",
        description: "Study for 200 hours total",
        icon: "crown",
        category: "study-time",
        criteria: { type: "total-hours", value: 200, period: "all-time" },
        rarity: "legendary",
        level: 4,
        levelName: "Platinum",
        points: 300
    },
    {
        title: "Study Immortal",
        description: "Study for 500 hours total",
        icon: "infinity",
        category: "study-time",
        criteria: { type: "total-hours", value: 500, period: "all-time" },
        rarity: "legendary",
        level: 5,
        levelName: "Diamond",
        points: 500
    },
    // Consistency - Levels 1-5
    {
        title: "Consistency King",
        description: "Maintain a 7-day study streak",
        icon: "flame",
        category: "consistency",
        criteria: { type: "streak-days", value: 7, period: "all-time" },
        rarity: "rare",
        level: 2,
        levelName: "Silver",
        points: 75
    },
    {
        title: "Streak Master",
        description: "Maintain a 30-day study streak",
        icon: "fire",
        category: "consistency",
        criteria: { type: "streak-days", value: 30, period: "all-time" },
        rarity: "epic",
        level: 4,
        levelName: "Platinum",
        points: 250
    },
    {
        title: "Perfect Week",
        description: "Study every day for a week",
        icon: "calendar-check",
        category: "consistency",
        criteria: { type: "perfect-week", value: 7, period: "weekly" },
        rarity: "epic",
        level: 3,
        levelName: "Gold",
        points: 100
    },
    {
        title: "Streak Legend",
        description: "Maintain a 100-day study streak",
        icon: "trophy",
        category: "consistency",
        criteria: { type: "streak-days", value: 100, period: "all-time" },
        rarity: "legendary",
        level: 5,
        levelName: "Diamond",
        points: 400
    },
    // Goals - Levels 1-5
    {
        title: "Goal Crusher",
        description: "Complete your first goal",
        icon: "target",
        category: "goals",
        criteria: { type: "goals-completed", value: 1, period: "all-time" },
        rarity: "common",
        level: 1,
        levelName: "Bronze",
        points: 20
    },
    {
        title: "Goal Master",
        description: "Complete 10 goals",
        icon: "bullseye",
        category: "goals",
        criteria: { type: "goals-completed", value: 10, period: "all-time" },
        rarity: "rare",
        level: 2,
        levelName: "Silver",
        points: 100
    },
    {
        title: "Goal Legend",
        description: "Complete 50 goals",
        icon: "medal",
        category: "goals",
        criteria: { type: "goals-completed", value: 50, period: "all-time" },
        rarity: "epic",
        level: 4,
        levelName: "Platinum",
        points: 200
    },
    {
        title: "Goal Supremacy",
        description: "Complete 100 goals",
        icon: "crown",
        category: "goals",
        criteria: { type: "goals-completed", value: 100, period: "all-time" },
        rarity: "legendary",
        level: 5,
        levelName: "Diamond",
        points: 350
    },
    // Subjects - Levels 1-4
    {
        title: "Subject Explorer",
        description: "Create your first subject",
        icon: "folder",
        category: "subjects",
        criteria: { type: "subjects-mastered", value: 1, period: "all-time" },
        rarity: "common",
        level: 1,
        levelName: "Bronze",
        points: 10
    },
    {
        title: "Multi-Learner",
        description: "Study 5 different subjects",
        icon: "books",
        category: "subjects",
        criteria: { type: "subjects-mastered", value: 5, period: "all-time" },
        rarity: "rare",
        level: 2,
        levelName: "Silver",
        points: 75
    },
    {
        title: "Universal Scholar",
        description: "Study 10 different subjects",
        icon: "globe",
        category: "subjects",
        criteria: { type: "subjects-mastered", value: 10, period: "all-time" },
        rarity: "epic",
        level: 4,
        levelName: "Platinum",
        points: 180
    },
    // Tasks - Levels 1-5
    {
        title: "Task Manager",
        description: "Complete your first task",
        icon: "check-circle",
        category: "tasks",
        criteria: { type: "tasks-completed", value: 1, period: "all-time" },
        rarity: "common",
        level: 1,
        levelName: "Bronze",
        points: 15
    },
    {
        title: "Task Champion",
        description: "Complete 50 tasks",
        icon: "star",
        category: "tasks",
        criteria: { type: "tasks-completed", value: 50, period: "all-time" },
        rarity: "rare",
        level: 2,
        levelName: "Silver",
        points: 80
    },
    {
        title: "Task Dominator",
        description: "Complete 200 tasks",
        icon: "zap",
        category: "tasks",
        criteria: { type: "tasks-completed", value: 200, period: "all-time" },
        rarity: "epic",
        level: 4,
        levelName: "Platinum",
        points: 200
    },
    {
        title: "Task God",
        description: "Complete 500 tasks",
        icon: "lightning-bold",
        category: "tasks",
        criteria: { type: "tasks-completed", value: 500, period: "all-time" },
        rarity: "legendary",
        level: 5,
        levelName: "Diamond",
        points: 400
    },
    // Special achievements
    {
        title: "Early Bird",
        description: "Study before 8 AM",
        icon: "sunrise",
        category: "special",
        criteria: { type: "sessions-count", value: 5, period: "all-time" },
        rarity: "rare",
        level: 2,
        levelName: "Silver",
        points: 60
    },
    {
        title: "Night Owl",
        description: "Study after 10 PM",
        icon: "moon",
        category: "special",
        criteria: { type: "sessions-count", value: 5, period: "all-time" },
        rarity: "rare",
        level: 2,
        levelName: "Silver",
        points: 60
    },
    {
        title: "Super Focus",
        description: "Complete a 2-hour study session",
        icon: "lightning",
        category: "special",
        criteria: { type: "sessions-count", value: 1, period: "all-time" },
        rarity: "epic",
        level: 3,
        levelName: "Gold",
        points: 120
    },
    // Extended Achievements
    {
        title: "Marathon Master",
        description: "Complete a 5-hour study marathon",
        icon: "target",
        category: "study-time",
        criteria: { type: "total-hours", value: 5, period: "all-time" },
        rarity: "legendary",
        level: 5,
        levelName: "Diamond",
        points: 600
    },
    {
        title: "Weekly Warrior",
        description: "Study 50 hours in a week",
        icon: "flame",
        category: "consistency",
        criteria: { type: "total-hours", value: 50, period: "weekly" },
        rarity: "epic",
        level: 4,
        levelName: "Platinum",
        points: 280
    },
    {
        title: "Goal Breaker",
        description: "Complete 100 goals",
        icon: "target",
        category: "goals",
        criteria: { type: "goals-completed", value: 100, period: "all-time" },
        rarity: "legendary",
        level: 5,
        levelName: "Diamond",
        points: 500
    },
    {
        title: "Knowledge Seeker",
        description: "Study 20 different subjects",
        icon: "books",
        category: "subjects",
        criteria: { type: "subjects-mastered", value: 20, period: "all-time" },
        rarity: "legendary",
        level: 5,
        levelName: "Diamond",
        points: 450
    },
    {
        title: "Task Terminator",
        description: "Complete 1000 tasks",
        icon: "zap",
        category: "tasks",
        criteria: { type: "tasks-completed", value: 1000, period: "all-time" },
        rarity: "legendary",
        level: 5,
        levelName: "Diamond",
        points: 700
    },
    {
        title: "Streak Smasher",
        description: "Maintain a 365-day study streak",
        icon: "fire",
        category: "consistency",
        criteria: { type: "streak-days", value: 365, period: "all-time" },
        rarity: "legendary",
        level: 5,
        levelName: "Diamond",
        points: 1000
    },
    {
        title: "Balanced Scholar",
        description: "Complete goals in 10 different subjects",
        icon: "globe",
        category: "goals",
        criteria: { type: "goals-completed", value: 10, period: "all-time" },
        rarity: "rare",
        level: 2,
        levelName: "Silver",
        points: 90
    },
    {
        title: "Speed Demon",
        description: "Complete 5 goals in one day",
        icon: "lightning-bold",
        category: "special",
        criteria: { type: "goals-completed", value: 5, period: "daily" },
        rarity: "epic",
        level: 3,
        levelName: "Gold",
        points: 140
    },
    {
        title: "Perfectionist",
        description: "Maintain 100% task completion rate",
        icon: "check-double",
        category: "tasks",
        criteria: { type: "tasks-completed", value: 100, period: "all-time" },
        rarity: "rare",
        level: 2,
        levelName: "Silver",
        points: 85
    },
    {
        title: "Focus Champion",
        description: "Complete 10 consecutive sessions",
        icon: "target",
        category: "consistency",
        criteria: { type: "sessions-count", value: 10, period: "all-time" },
        rarity: "rare",
        level: 2,
        levelName: "Silver",
        points: 70
    },
    {
        title: "Time Master",
        description: "Total 1000 study hours",
        icon: "clock",
        category: "study-time",
        criteria: { type: "total-hours", value: 1000, period: "all-time" },
        rarity: "legendary",
        level: 5,
        levelName: "Diamond",
        points: 800    },
    {
        title: "Quiz Master",
        description: "Complete 20 quizzes with perfect scores",
        icon: "graduation-cap",
        category: "special",
        criteria: { type: "quiz-perfects", value: 20, period: "all-time" },
        rarity: "legendary",
        level: 5,
        levelName: "Diamond",
        points: 600
    },
    {
        title: "Knowledge Ninja",
        description: "Complete 50 quizzes",
        icon: "brain",
        category: "special",
        criteria: { type: "quiz-completed", value: 50, period: "all-time" },
        rarity: "epic",
        level: 4,
        levelName: "Platinum",
        points: 350
    },
    {
        title: "Quick Learner",
        description: "Complete 10 quizzes with 80%+ score",
        icon: "lightning",
        category: "special",
        criteria: { type: "quiz-high-scores", value: 10, period: "all-time" },
        rarity: "rare",
        level: 3,
        levelName: "Gold",
        points: 180    }
];

// @desc    Get all achievements for user
// @route   GET /api/achievements
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        let achievements = await Achievement.find({ user: req.user.id });

        // If no achievements exist, create default ones
        if (achievements.length === 0) {
            const defaultAchievements = DEFAULT_ACHIEVEMENTS.map(achievement => ({
                ...achievement,
                user: req.user.id
            }));

            achievements = await Achievement.insertMany(defaultAchievements);
        }

        res.json(achievements);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Check and update achievement progress
// @route   POST /api/achievements/check-progress
// @access  Private
router.post('/check-progress', protect, async (req, res) => {
    try {
        const achievements = await Achievement.find({ user: req.user.id, unlocked: false });
        const sessions = await Session.find({ user: req.user.id });
        const tasks = await Task.find({ user: req.user.id });
        const goals = await Goal.find({ user: req.user.id });
        const subjects = await Subject.find({ user: req.user.id });

        let unlockedAchievements = [];

        for (const achievement of achievements) {
            let newProgress = 0;
            let shouldUnlock = false;

switch (achievement.criteria.type) {
                case 'total-hours':
                    newProgress = sessions.reduce((sum, session) => sum + session.duration, 0) / 60;
                    break;

                case 'sessions-count':
                    newProgress = sessions.length;
                    break;

                case 'streak-days':
                    const studyDays = new Set();
                    sessions.forEach(session => {
                        // FIX: startTime -> timestamp
                        // timestamp যদি স্ট্রিং হয়, তাই new Date() ব্যবহার করা নিরাপদ
                        const date = new Date(session.timestamp).toISOString().split('T')[0];
                        studyDays.add(date);
                    });
                    const sortedDays = Array.from(studyDays).sort();
                    let currentStreak = 0;
                    let maxStreak = 0;
                    let tempStreak = 0;

                    for (let i = 0; i < sortedDays.length; i++) {
                        const currentDate = new Date(sortedDays[i]);
                        const prevDate = i > 0 ? new Date(sortedDays[i - 1]) : null;

                        if (!prevDate || (currentDate - prevDate) / (1000 * 60 * 60 * 24) === 1) {
                            tempStreak++;
                        } else {
                            maxStreak = Math.max(maxStreak, tempStreak);
                            tempStreak = 1;
                        }
                    }
                    maxStreak = Math.max(maxStreak, tempStreak);
                    newProgress = maxStreak;
                    break;

                case 'goals-completed':
                    newProgress = goals.filter(goal => goal.completed).length;
                    break;

                case 'subjects-mastered':
                    newProgress = subjects.length;
                    break;

                case 'tasks-completed':
                    newProgress = tasks.filter(task => task.completed).length;
                    break;

                case 'perfect-week':
                    const now = new Date();
                    const weekStart = new Date(now);
                    weekStart.setDate(now.getDate() - now.getDay());

                    const weekSessions = sessions.filter(session => {
                        // FIX: startTime -> timestamp
                        const sessionDate = new Date(session.timestamp);
                        return sessionDate >= weekStart && sessionDate <= now;
                    });

                    const weekDays = new Set();
                    weekSessions.forEach(session => {
                        // FIX: startTime -> timestamp
                        const day = new Date(session.timestamp).getDay();
                        weekDays.add(day);
                    });

                    newProgress = weekDays.size;
                    break;

                case 'quiz-perfects':
                    const Quiz = require('../models/Quiz');
                    const quizzes = await Quiz.find({ user: req.user.id, completed: true });
                    newProgress = quizzes.filter(q => q.score === 100).length;
                    break;

                case 'quiz-completed':
                    const Quiz2 = require('../models/Quiz');
                    const allQuizzes = await Quiz2.find({ user: req.user.id, completed: true });
                    newProgress = allQuizzes.length;
                    break;

                case 'quiz-high-scores':
                    const Quiz3 = require('../models/Quiz');
                    const highScoreQuizzes = await Quiz3.find({ user: req.user.id, completed: true });
                    newProgress = highScoreQuizzes.filter(q => q.score >= 80).length;
                    break;
            }

            achievement.progress = Math.min(newProgress, achievement.criteria.value);

            if (achievement.progress >= achievement.criteria.value && !achievement.unlocked) {
                achievement.unlocked = true;
                achievement.unlockedAt = new Date();
                shouldUnlock = true;
                unlockedAchievements.push(achievement);
            }

            await achievement.save();
        }

        // Update user level and points if new achievements were unlocked
        if (unlockedAchievements.length > 0) {
            const User = require('../models/User');
            const user = await User.findById(req.user.id);
            const totalPoints = unlockedAchievements.reduce((sum, a) => sum + a.points, 0);
            
            user.achievementPoints += totalPoints;
            user.totalAchievementsUnlocked += unlockedAchievements.length;

            // Update level based on points
            if (user.achievementPoints >= 3000) {
                user.achievementLevel = 5;
                user.achievementLevelName = 'Diamond';
            } else if (user.achievementPoints >= 1500) {
                user.achievementLevel = 4;
                user.achievementLevelName = 'Platinum';
            } else if (user.achievementPoints >= 750) {
                user.achievementLevel = 3;
                user.achievementLevelName = 'Gold';
            } else if (user.achievementPoints >= 250) {
                user.achievementLevel = 2;
                user.achievementLevelName = 'Silver';
            } else {
                user.achievementLevel = 1;
                user.achievementLevelName = 'Bronze';
            }

            await user.save();
        }

        // Emit real-time events for unlocked achievements
        if (io && unlockedAchievements.length > 0) {
            io.to(`user_${req.user.id}`).emit('achievements-unlocked', unlockedAchievements);
        }

        res.json({
            checked: achievements.length,
            unlocked: unlockedAchievements.length,
            achievements: unlockedAchievements
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get achievement statistics
// @route   GET /api/achievements/stats
// @access  Private
router.get('/stats', protect, async (req, res) => {
    try {
        const achievements = await Achievement.find({ user: req.user.id });
        const user = await require('../models/User').findById(req.user.id);

        const stats = {
            total: achievements.length,
            unlocked: achievements.filter(a => a.unlocked).length,
            totalPoints: achievements.filter(a => a.unlocked).reduce((sum, a) => sum + a.points, 0),
            byCategory: {},
            byRarity: {},
            userLevel: {
                level: user.achievementLevel,
                levelName: user.achievementLevelName,
                points: user.achievementPoints,
                totalUnlocked: user.totalAchievementsUnlocked
            }
        };

        achievements.forEach(achievement => {
            if (!stats.byCategory[achievement.category]) {
                stats.byCategory[achievement.category] = { total: 0, unlocked: 0 };
            }
            stats.byCategory[achievement.category].total++;
            if (achievement.unlocked) stats.byCategory[achievement.category].unlocked++;

            if (!stats.byRarity[achievement.rarity]) {
                stats.byRarity[achievement.rarity] = { total: 0, unlocked: 0 };
            }
            stats.byRarity[achievement.rarity].total++;
            if (achievement.unlocked) stats.byRarity[achievement.rarity].unlocked++;
        });

        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get leaderboard by achievement level
// @route   GET /api/achievements/leaderboard
// @access  Public
router.get('/leaderboard', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const level = req.query.level; // Optional: filter by specific level

        let query = {};
        if (level) {
            query.achievementLevel = level;
        }

        const User = require('../models/User');
        const leaderboard = await User.find(query)
            .select('username firstName lastName profileImage achievementLevel achievementLevelName achievementPoints totalAchievementsUnlocked')
            .sort({ achievementLevel: -1, achievementPoints: -1 })
            .limit(limit);

        res.json(leaderboard);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get achievements by level
// @route   GET /api/achievements/by-level/:level
// @access  Private
router.get('/by-level/:level', protect, async (req, res) => {
    try {
        const level = parseInt(req.params.level);
        if (level < 1 || level > 5) {
            return res.status(400).json({ message: 'Level must be between 1 and 5' });
        }

        const achievements = await Achievement.find({ 
            user: req.user.id,
            level: level 
        });

        res.json({
            level,
            levelName: LEVEL_CONFIG[level].name,
            color: LEVEL_CONFIG[level].color,
            achievements
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Reset achievements (for testing)
// @route   POST /api/achievements/reset
// @access  Private (Development only)
router.post('/reset', protect, async (req, res) => {
    try {
        await Achievement.deleteMany({ user: req.user.id });

        const defaultAchievements = DEFAULT_ACHIEVEMENTS.map(achievement => ({
            ...achievement,
            user: req.user.id
        }));

        const achievements = await Achievement.insertMany(defaultAchievements);

        res.json({ message: 'Achievements reset', achievements });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
module.exports.setIo = setIo;