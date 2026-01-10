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

// Predefined achievements
const DEFAULT_ACHIEVEMENTS = [
    {
        title: "First Steps",
        description: "Complete your first study session",
        icon: "play-circle",
        category: "study-time",
        criteria: { type: "sessions-count", value: 1, period: "all-time" },
        rarity: "common",
        points: 10
    },
    {
        title: "Hour Master",
        description: "Study for 1 hour total",
        icon: "clock",
        category: "study-time",
        criteria: { type: "total-hours", value: 1, period: "all-time" },
        rarity: "common",
        points: 15
    },
    {
        title: "Dedicated Scholar",
        description: "Study for 10 hours total",
        icon: "book",
        category: "study-time",
        criteria: { type: "total-hours", value: 10, period: "all-time" },
        rarity: "rare",
        points: 50
    },
    {
        title: "Study Warrior",
        description: "Study for 50 hours total",
        icon: "shield",
        category: "study-time",
        criteria: { type: "total-hours", value: 50, period: "all-time" },
        rarity: "epic",
        points: 150
    },
    {
        title: "Consistency King",
        description: "Maintain a 7-day study streak",
        icon: "flame",
        category: "consistency",
        criteria: { type: "streak-days", value: 7, period: "all-time" },
        rarity: "rare",
        points: 75
    },
    {
        title: "Perfect Week",
        description: "Study every day for a week",
        icon: "calendar-check",
        category: "consistency",
        criteria: { type: "perfect-week", value: 7, period: "weekly" },
        rarity: "epic",
        points: 100
    },
    {
        title: "Goal Crusher",
        description: "Complete your first goal",
        icon: "target",
        category: "goals",
        criteria: { type: "goals-completed", value: 1, period: "all-time" },
        rarity: "common",
        points: 20
    },
    {
        title: "Goal Master",
        description: "Complete 10 goals",
        icon: "bullseye",
        category: "goals",
        criteria: { type: "goals-completed", value: 10, period: "all-time" },
        rarity: "rare",
        points: 100
    },
    {
        title: "Subject Explorer",
        description: "Create your first subject",
        icon: "folder",
        category: "subjects",
        criteria: { type: "subjects-mastered", value: 1, period: "all-time" },
        rarity: "common",
        points: 10
    },
    {
        title: "Task Manager",
        description: "Complete your first task",
        icon: "check-circle",
        category: "tasks",
        criteria: { type: "tasks-completed", value: 1, period: "all-time" },
        rarity: "common",
        points: 15
    },
    {
        title: "Task Champion",
        description: "Complete 50 tasks",
        icon: "star",
        category: "tasks",
        criteria: { type: "tasks-completed", value: 50, period: "all-time" },
        rarity: "rare",
        points: 80
    }
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
                        // Using new Date() to safely parse timestamp (handles both string and date formats)
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

        const stats = {
            total: achievements.length,
            unlocked: achievements.filter(a => a.unlocked).length,
            totalPoints: achievements.filter(a => a.unlocked).reduce((sum, a) => sum + a.points, 0),
            byCategory: {},
            byRarity: {}
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