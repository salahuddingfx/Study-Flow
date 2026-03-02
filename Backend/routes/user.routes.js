const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const User = require('../models/User');
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

// @desc    Get weekly summary settings
// @route   GET /api/user/weekly-summary
// @access  Private
router.get('/weekly-summary', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('weeklySummaryEnabled');
        res.json({ weeklySummaryEnabled: user?.weeklySummaryEnabled !== false });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get daily summary settings
// @route   GET /api/user/daily-summary
// @access  Private
router.get('/daily-summary', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('dailySummaryEnabled');
        res.json({ dailySummaryEnabled: user?.dailySummaryEnabled !== false });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Update weekly summary settings
// @route   PUT /api/user/weekly-summary
// @access  Private
router.put('/weekly-summary', protect, async (req, res) => {
    try {
        const { weeklySummaryEnabled } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        user.weeklySummaryEnabled = !!weeklySummaryEnabled;
        await user.save();
        res.json({ success: true, weeklySummaryEnabled: user.weeklySummaryEnabled });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Update daily summary settings
// @route   PUT /api/user/daily-summary
// @access  Private
router.put('/daily-summary', protect, async (req, res) => {
    try {
        const { dailySummaryEnabled } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        user.dailySummaryEnabled = !!dailySummaryEnabled;
        await user.save();
        res.json({ success: true, dailySummaryEnabled: user.dailySummaryEnabled });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get monthly summary settings
// @route   GET /api/user/monthly-summary
// @access  Private
router.get('/monthly-summary', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('monthlySummaryEnabled');
        res.json({ monthlySummaryEnabled: user?.monthlySummaryEnabled !== false });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Update monthly summary settings
// @route   PUT /api/user/monthly-summary
// @access  Private
router.put('/monthly-summary', protect, async (req, res) => {
    try {
        const { monthlySummaryEnabled } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        user.monthlySummaryEnabled = !!monthlySummaryEnabled;
        await user.save();
        res.json({ success: true, monthlySummaryEnabled: user.monthlySummaryEnabled });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get calendar token
// @route   GET /api/user/calendar-token
// @access  Private
router.get('/calendar-token', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (!user.calendarToken) {
            user.calendarToken = crypto.randomBytes(16).toString('hex');
            await user.save();
        }
        const baseUrl = process.env.BACKEND_URL || process.env.FRONTEND_URL || 'http://127.0.0.1:5500';
        res.json({ calendarToken: user.calendarToken, calendarUrl: `${baseUrl}/api/user/calendar/${user.calendarToken}.ics` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Regenerate calendar token
// @route   POST /api/user/calendar-token/regenerate
// @access  Private
router.post('/calendar-token/regenerate', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        user.calendarToken = crypto.randomBytes(16).toString('hex');
        await user.save();
        const baseUrl = process.env.BACKEND_URL || process.env.FRONTEND_URL || 'http://127.0.0.1:5500';
        res.json({ calendarToken: user.calendarToken, calendarUrl: `${baseUrl}/api/user/calendar/${user.calendarToken}.ics` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Public calendar feed (ICS)
// @route   GET /api/user/calendar/:token.ics
// @access  Public
router.get('/calendar/:token.ics', async (req, res) => {
    try {
        const user = await User.findOne({ calendarToken: req.params.token });
        if (!user) return res.status(404).send('Not found');

        const sessions = await Session.find({ user: user._id }).sort({ timestamp: -1 }).limit(200);
        const tasks = await Task.find({ user: user._id, deadline: { $ne: null } }).sort({ deadline: -1 }).limit(200);

        const formatDate = (d) => {
            const date = new Date(d);
            const iso = date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
            return iso;
        };

        let ics = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//StudyFlow//EN\nCALSCALE:GREGORIAN\n';
        sessions.forEach((s) => {
            const start = formatDate(s.timestamp);
            const end = formatDate(new Date(new Date(s.timestamp).getTime() + (s.duration || 0) * 60000));
            ics += 'BEGIN:VEVENT\n';
            ics += `UID:${s._id}@studyflow\n`;
            ics += `DTSTART:${start}\n`;
            ics += `DTEND:${end}\n`;
            ics += `SUMMARY:Study Session${s.subject ? ' - ' + s.subject : ''}\n`;
            ics += 'END:VEVENT\n';
        });
        tasks.forEach((t) => {
            const due = formatDate(t.deadline);
            ics += 'BEGIN:VEVENT\n';
            ics += `UID:${t._id}@studyflow-task\n`;
            ics += `DTSTART:${due}\n`;
            ics += `DTEND:${due}\n`;
            ics += `SUMMARY:Task Due - ${t.title || 'Task'}\n`;
            ics += 'END:VEVENT\n';
        });
        ics += 'END:VCALENDAR';

        res.set('Content-Type', 'text/calendar');
        res.send(ics);
    } catch (error) {
        res.status(500).send('Server error');
    }
});

// @desc    Get public profile settings
// @route   GET /api/user/public-profile
// @access  Private
router.get('/public-profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (!user.publicProfileToken) {
            user.publicProfileToken = crypto.randomBytes(16).toString('hex');
            await user.save();
        }
        const baseUrl = process.env.BACKEND_URL || process.env.FRONTEND_URL || 'http://127.0.0.1:5500';
        res.json({
            publicProfileEnabled: user.publicProfileEnabled,
            publicProfileToken: user.publicProfileToken,
            publicProfileUrl: `${baseUrl}/api/user/public/${user.publicProfileToken}`
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Enable public profile
// @route   POST /api/user/public-profile/enable
// @access  Private
router.post('/public-profile/enable', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (!user.publicProfileToken) {
            user.publicProfileToken = crypto.randomBytes(16).toString('hex');
        }
        user.publicProfileEnabled = true;
        await user.save();
        const baseUrl = process.env.BACKEND_URL || process.env.FRONTEND_URL || 'http://127.0.0.1:5500';
        res.json({
            publicProfileEnabled: true,
            publicProfileToken: user.publicProfileToken,
            publicProfileUrl: `${baseUrl}/api/user/public/${user.publicProfileToken}`
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Disable public profile
// @route   POST /api/user/public-profile/disable
// @access  Private
router.post('/public-profile/disable', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        user.publicProfileEnabled = false;
        await user.save();
        res.json({ publicProfileEnabled: false });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Public profile stats
// @route   GET /api/user/public/:token
// @access  Public
router.get('/public/:token', async (req, res) => {
    try {
        const user = await User.findOne({ publicProfileToken: req.params.token, publicProfileEnabled: true });
        if (!user) return res.status(404).json({ message: 'Not found' });

        const sessions = await Session.find({ user: user._id });
        const tasks = await Task.find({ user: user._id });

        const totalMinutes = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
        const completedTasks = tasks.filter(t => t.completed).length;
        const studyDays = new Set(sessions.map(s => s.timestamp.toISOString().split('T')[0]));
        const fullName = user.firstName || user.lastName
            ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
            : user.username;

        res.json({
            username: user.username,
            fullName,
            totalMinutes,
            totalSessions: sessions.length,
            completedTasks,
            studyDaysCount: studyDays.size,
            streakCurrent: user.streakCurrent || 0,
            streakLongest: user.streakLongest || 0
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

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

// =====================
// Report Generation Routes
// =====================

// @desc    Send progress report via email
// @route   POST /api/user/send-report
// @access  Private
router.post('/send-report', protect, async (req, res) => {
    try {
        const { sendReportEmail } = require('../utils/generatePDFReport');
        
        // Gather user statistics
        const [sessions, tasks, subjects, goals, achievements] = await Promise.all([
            Session.find({ user: req.user.id }),
            Task.find({ user: req.user.id, completed: true }),
            Subject.find({ user: req.user.id }),
            Goal.find({ user: req.user.id }),
            Achievement.find({ user: req.user.id })
        ]);

        const totalMinutes = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
        const user = await User.findById(req.user.id);

        const userData = {
            name: user.name,
            email: user.email,
            totalSessions: sessions.length,
            totalMinutes: totalMinutes,
            completedTasks: tasks.length,
            achievements: achievements.length,
            subjects: subjects.map(s => ({
                name: s.name,
                hours: Math.floor(s.totalTime / 60) || 0
            })),
            tier: user.tier || 'Bronze'
        };

        await sendReportEmail(userData, {
            subject: req.body.subject || undefined,
            heading: req.body.heading || undefined,
            dashboardUrl: `${process.env.FRONTEND_URL || 'http://127.0.0.1:5500'}#dashboard`
        });

        res.json({
            success: true,
            message: 'Progress report sent to your email successfully!'
        });
    } catch (error) {
        console.error('❌ Send report error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to send report: ' + error.message 
        });
    }
});

// @desc    Get report data (without sending email)
// @route   GET /api/user/report-data
// @access  Private
router.get('/report-data', protect, async (req, res) => {
    try {
        const { generateReportHTML } = require('../utils/generatePDFReport');
        
        // Gather user statistics
        const [sessions, tasks, subjects, goals, achievements] = await Promise.all([
            Session.find({ user: req.user.id }),
            Task.find({ user: req.user.id, completed: true }),
            Subject.find({ user: req.user.id }),
            Goal.find({ user: req.user.id }),
            Achievement.find({ user: req.user.id })
        ]);

        const totalMinutes = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
        const user = await User.findById(req.user.id);

        const userData = {
            name: user.name,
            email: user.email,
            totalSessions: sessions.length,
            totalMinutes: totalMinutes,
            completedTasks: tasks.length,
            achievements: achievements.length,
            subjects: subjects.map(s => ({
                name: s.name,
                hours: Math.floor(s.totalTime / 60) || 0
            })),
            tier: user.tier || 'Bronze'
        };

        res.json({
            success: true,
            data: userData,
            html: generateReportHTML(userData)
        });
    } catch (error) {
        console.error('❌ Get report data error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to generate report: ' + error.message 
        });
    }
});

module.exports = router;
