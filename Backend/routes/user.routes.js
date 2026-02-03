const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
    getUserProfile,
    updateUserProfile,
    changePassword,
    deleteUserAccount,
    forgotPassword,
    resetPassword
} = require('../controllers/user.controller');

// Import models for data management routes
const Task = require('../models/Task');
const Session = require('../models/Session');
const Subject = require('../models/Subject');
const Goal = require('../models/Goal');
const Achievement = require('../models/Achievement');

// =====================
// User Profile Routes
// =====================

// @desc    Get user profile
// @route   GET /api/user/profile
// @access  Private
router.get('/profile', protect, getUserProfile);

// @desc    Update user profile
// @route   PUT /api/user/profile
// @access  Private
router.put('/profile', protect, updateUserProfile);

// @desc    Change password
// @route   PUT /api/user/change-password
// @access  Private
router.put('/change-password', protect, changePassword);

// @desc    Delete account
// @route   DELETE /api/user/account
// @access  Private
router.delete('/account', protect, deleteUserAccount);

// =====================
// Password Reset Routes
// =====================

// @desc    Forgot password (request reset)
// @route   POST /api/user/forgot-password
// @access  Public
router.post('/forgot-password', forgotPassword);

// @desc    Reset password with token
// @route   PUT /api/user/reset-password/:resettoken
// @access  Public
router.put('/reset-password/:resettoken', resetPassword);

// =====================
// Data Management Routes
// =====================

// @desc    Load user data (subjects, sessions, tasks, goals, achievements)
// @route   GET /api/user/data
// @access  Private
router.get('/data', protect, async (req, res) => {
    try {
        const subjects = await Subject.find({ user: req.user.id });
        const sessions = await Session.find({ user: req.user.id });
        const tasks = await Task.find({ user: req.user.id });
        const goals = await Goal.find({ user: req.user.id });
        const achievements = await Achievement.find({ user: req.user.id });

        res.json({
            subjects,
            sessions,
            tasks,
            goals,
            achievements
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Save/Update user data (subjects, sessions, tasks)
// @route   PUT /api/user/data
// @access  Private
router.put('/data', protect, async (req, res) => {
    const { subjects, sessions, tasks } = req.body;

    try {
        // Clear existing data
        await Task.deleteMany({ user: req.user.id });
        await Session.deleteMany({ user: req.user.id });
        await Subject.deleteMany({ user: req.user.id });

        // Save new subjects
        if (subjects && subjects.length > 0) {
            const subjectsWithUser = subjects.map(subject => ({
                ...subject,
                user: req.user.id
            }));
            await Subject.insertMany(subjectsWithUser);
        }

        // Save new sessions
        if (sessions && sessions.length > 0) {
            const sessionsWithUser = sessions.map(session => ({
                ...session,
                user: req.user.id
            }));
            await Session.insertMany(sessionsWithUser);
        }

        // Save new tasks
        if (tasks && tasks.length > 0) {
            const tasksWithUser = tasks.map(task => ({
                ...task,
                user: req.user.id
            }));
            await Task.insertMany(tasksWithUser);
        }

        res.json({ message: 'User data saved successfully' });
    } catch (error) {
        console.error('Save data error:', error);
        res.status(500).json({ message: error.message });
    }
});

// @desc    Clear all user data (Keep account)
// @route   DELETE /api/user/data
// @access  Private
router.delete('/data', protect, async (req, res) => {
    try {
        await Task.deleteMany({ user: req.user.id });
        await Session.deleteMany({ user: req.user.id });
        await Subject.deleteMany({ user: req.user.id });
        await Goal.deleteMany({ user: req.user.id });
        await Achievement.deleteMany({ user: req.user.id }); 

        res.json({ 
            success: true,
            message: 'All user data cleared successfully' 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
