const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const Session = require('../models/Session');
const User = require('../models/User');

// Get io instance
let io;
const setIo = (socketIo) => {
    io = socketIo;
};
module.exports.setIo = setIo;

// @desc    Get all sessions for user
// @route   GET /api/sessions
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const sessions = await Session.find({ user: req.user.id }).sort({ timestamp: -1 });
        res.json(sessions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Create a session
// @route   POST /api/sessions
// @access  Private
router.post('/', protect, async (req, res) => {
    const { subject, task, duration, timestamp } = req.body;

    if (!duration) {
        return res.status(400).json({ message: 'Duration is required' });
    }

    try {
        const session = await Session.create({
            user: req.user.id,
            subject,
            task,
            duration,
            timestamp: timestamp || Date.now()
        });

        // Update streaks
        try {
            const user = await User.findById(req.user.id);
            if (user) {
                const sessionDate = new Date(session.timestamp);
                sessionDate.setHours(0, 0, 0, 0);

                let lastDate = user.lastStudyDate ? new Date(user.lastStudyDate) : null;
                if (lastDate) {
                    lastDate.setHours(0, 0, 0, 0);
                }

                if (!lastDate || sessionDate.getTime() !== lastDate.getTime()) {
                    const dayDiff = lastDate ? Math.round((sessionDate - lastDate) / (1000 * 60 * 60 * 24)) : null;
                    if (dayDiff === 1 || !lastDate) {
                        user.streakCurrent = (user.streakCurrent || 0) + 1;
                    } else {
                        user.streakCurrent = 1;
                    }
                    user.streakLongest = Math.max(user.streakLongest || 0, user.streakCurrent);
                    user.lastStudyDate = sessionDate;
                    await user.save();
                }
            }
        } catch (e) {
            console.error('Streak update failed:', e.message);
        }

        // Emit real-time event
        if (io) {
            io.to(`user_${req.user.id}`).emit('session-created', session);
        }

        res.status(201).json(session);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
module.exports.setIo = setIo;