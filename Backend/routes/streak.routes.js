const express = require('express');
const router = express.Router();
const Streak = require('../models/Streak');
const { protect } = require('../middleware/auth.middleware');
const Session = require('../models/Session');

// Get user's streak status
router.get('/status', protect, async (req, res) => {
    try {
        let streak = await Streak.findOne({ userId: req.user.id });
        
        if (!streak) {
            streak = new Streak({ userId: req.user.id });
            await streak.save();
        }
        
        const status = streak.getStatus();
        res.json(status);
    } catch (error) {
        console.error('Get streak error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update streak (called after study session)
router.post('/update', protect, async (req, res) => {
    try {
        const { studyMinutes } = req.body;
        
        if (!studyMinutes || studyMinutes <= 0) {
            return res.status(400).json({ message: 'Invalid study minutes' });
        }
        
        let streak = await Streak.findOne({ userId: req.user.id });
        
        if (!streak) {
            streak = new Streak({ userId: req.user.id });
        }
        
        const result = streak.updateStreak(studyMinutes);
        await streak.save();
        
        const status = streak.getStatus();
        
        res.json({
            message: result.broken ? 'Streak restarted!' : result.continued ? 'Keep going!' : 'Streak extended!',
            ...status,
            newAchievements: streak.achievements.filter(a => {
                const achievedToday = new Date(a.unlockedAt);
                const today = new Date();
                return achievedToday.toDateString() === today.toDateString();
            })
        });
    } catch (error) {
        console.error('Update streak error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get streak history (last 30 days)
router.get('/history', protect, async (req, res) => {
    try {
        const streak = await Streak.findOne({ userId: req.user.id });
        
        if (!streak) {
            return res.json({ history: [] });
        }
        
        // Get last 30 days
        const history = streak.streakHistory
            .sort((a, b) => b.date - a.date)
            .slice(0, 30);
        
        res.json({ history });
    } catch (error) {
        console.error('Get history error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get leaderboard (top streaks)
router.get('/leaderboard', protect, async (req, res) => {
    try {
        const topStreaks = await Streak.find()
            .sort({ currentStreak: -1 })
            .limit(10)
            .populate('userId', 'name email');
        
        const leaderboard = topStreaks.map((streak, index) => ({
            rank: index + 1,
            userName: streak.userId?.name || 'Anonymous',
            currentStreak: streak.currentStreak,
            longestStreak: streak.longestStreak,
            totalStudyDays: streak.totalStudyDays
        }));
        
        res.json({ leaderboard });
    } catch (error) {
        console.error('Get leaderboard error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Reset streak (admin only or for testing)
router.delete('/reset', protect, async (req, res) => {
    try {
        const streak = await Streak.findOne({ userId: req.user.id });
        
        if (streak) {
            streak.currentStreak = 0;
            streak.streakHistory = [];
            streak.lastStudyDate = null;
            await streak.save();
        }
        
        res.json({ message: 'Streak reset successfully' });
    } catch (error) {
        console.error('Reset streak error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
