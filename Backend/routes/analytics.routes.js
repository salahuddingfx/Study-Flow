const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const Session = require('../models/Session');
const Task = require('../models/Task');
const Subject = require('../models/Subject');
const Goal = require('../models/Goal');
const Achievement = require('../models/Achievement');
const User = require('../models/User');

// @desc    Get study time trends (daily/weekly/monthly)
// @route   GET /api/analytics/time-trends
// @access  Private
router.get('/time-trends', protect, async (req, res) => {
    try {
        const { period = 'weekly', days = 30 } = req.query;
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - parseInt(days));

        const sessions = await Session.find({
            user: req.user.id,
            timestamp: { $gte: startDate, $lte: endDate }
        }).sort({ timestamp: 1 });

        const trends = {};
        const subjectTrends = {};

        sessions.forEach(session => {
            const date = session.timestamp.toISOString().split('T')[0]; // YYYY-MM-DD
            const subject = session.subject || 'Unspecified';

            if (!trends[date]) {
                trends[date] = 0;
            }
            trends[date] += session.duration;

            if (!subjectTrends[subject]) {
                subjectTrends[subject] = {};
            }
            if (!subjectTrends[subject][date]) {
                subjectTrends[subject][date] = 0;
            }
            subjectTrends[subject][date] += session.duration;
        });

        res.json({
            totalDays: Object.keys(trends).length,
            averageDaily: Object.values(trends).reduce((a, b) => a + b, 0) / Math.max(Object.keys(trends).length, 1),
            trends,
            subjectTrends
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get productivity metrics
// @route   GET /api/analytics/productivity
// @access  Private
router.get('/productivity', protect, async (req, res) => {
    try {
        const sessions = await Session.find({ user: req.user.id });
        const tasks = await Task.find({ user: req.user.id });

        // Calculate session metrics
        const totalSessions = sessions.length;
        const totalTime = sessions.reduce((sum, session) => sum + session.duration, 0);
        const averageSessionLength = totalSessions > 0 ? totalTime / totalSessions : 0;

        // Calculate task completion rate
        const completedTasks = tasks.filter(task => task.completed).length;
        const totalTasks = tasks.length;
        const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

        // Calculate streaks
        const studyDays = new Set();
        sessions.forEach(session => {
            const date = session.timestamp.toISOString().split('T')[0];
            studyDays.add(date);
        });

        const sortedDays = Array.from(studyDays).sort();
        let currentStreak = 0;
        let longestStreak = 0;
        let tempStreak = 0;

        for (let i = 0; i < sortedDays.length; i++) {
            const currentDate = new Date(sortedDays[i]);
            const prevDate = i > 0 ? new Date(sortedDays[i - 1]) : null;

            if (!prevDate || (currentDate - prevDate) / (1000 * 60 * 60 * 24) === 1) {
                tempStreak++;
                currentStreak = tempStreak;
            } else {
                longestStreak = Math.max(longestStreak, tempStreak);
                tempStreak = 1;
                currentStreak = 1;
            }
        }
        longestStreak = Math.max(longestStreak, tempStreak);

        res.json({
            totalSessions,
            totalTime,
            averageSessionLength,
            completionRate,
            currentStreak,
            longestStreak,
            studyDaysCount: studyDays.size
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get subject performance comparison
// @route   GET /api/analytics/subject-performance
// @access  Private
router.get('/subject-performance', protect, async (req, res) => {
    try {
        const subjects = await Subject.find({ user: req.user.id });
        const sessions = await Session.find({ user: req.user.id });

        const performance = {};

        subjects.forEach(subject => {
            performance[subject.name] = {
                targetHours: subject.targetHours,
                actualHours: 0,
                sessions: 0,
                efficiency: 0,
                category: subject.category,
                priority: subject.priority
            };
        });

        sessions.forEach(session => {
            const subjectName = session.subject || 'Unspecified';
            if (performance[subjectName]) {
                performance[subjectName].actualHours += session.duration / 60; // Convert to hours
                performance[subjectName].sessions++;
            }
        });

        // Calculate efficiency (actual vs target)
        Object.keys(performance).forEach(subjectName => {
            const subject = performance[subjectName];
            subject.efficiency = subject.targetHours > 0 ? (subject.actualHours / subject.targetHours) * 100 : 0;
        });

        res.json(performance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get weekly/monthly reports
// @route   GET /api/analytics/reports/:period
// @access  Private
router.get('/reports/:period', protect, async (req, res) => {
    try {
        const { period } = req.params; // 'weekly' or 'monthly'
        const now = new Date();

        let startDate;
        if (period === 'weekly') {
            startDate = new Date(now);
            startDate.setDate(now.getDate() - 7);
        } else if (period === 'monthly') {
            startDate = new Date(now);
            startDate.setMonth(now.getMonth() - 1);
        } else {
            return res.status(400).json({ message: 'Invalid period. Use "weekly" or "monthly"' });
        }

        const sessions = await Session.find({
            user: req.user.id,
            timestamp: { $gte: startDate, $lte: now }
        });

        const tasks = await Task.find({
            user: req.user.id,
            createdAt: { $gte: startDate, $lte: now }
        });

        const report = {
            period,
            startDate,
            endDate: now,
            totalStudyTime: sessions.reduce((sum, session) => sum + session.duration, 0),
            totalSessions: sessions.length,
            tasksCreated: tasks.length,
            tasksCompleted: tasks.filter(task => task.completed).length,
            subjectBreakdown: {},
            dailyBreakdown: {}
        };

        // Subject breakdown
        sessions.forEach(session => {
            const subject = session.subject || 'Unspecified';
            if (!report.subjectBreakdown[subject]) {
                report.subjectBreakdown[subject] = 0;
            }
            report.subjectBreakdown[subject] += session.duration;
        });

        // Daily breakdown
        sessions.forEach(session => {
            const date = session.timestamp.toISOString().split('T')[0];
            if (!report.dailyBreakdown[date]) {
                report.dailyBreakdown[date] = 0;
            }
            report.dailyBreakdown[date] += session.duration;
        });

        res.json(report);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Public leaderboard
// @route   GET /api/analytics/leaderboard
// @access  Public
router.get('/leaderboard', async (req, res) => {
    try {
        const { period = 'weekly', limit = 10 } = req.query;
        const now = new Date();
        let startDate = null;

        if (period === 'weekly') {
            startDate = new Date(now);
            startDate.setDate(now.getDate() - 7);
        } else if (period === 'monthly') {
            startDate = new Date(now);
            startDate.setDate(now.getDate() - 30);
        }

        const matchStage = startDate
            ? { timestamp: { $gte: startDate, $lte: now } }
            : {};

        const leaderboard = await Session.aggregate([
            { $match: matchStage },
            { $group: { _id: '$user', totalMinutes: { $sum: '$duration' }, sessions: { $sum: 1 } } },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            { $unwind: '$user' },
            { $match: { 'user.role': { $ne: 'admin' } } },
            { $sort: { totalMinutes: -1 } },
            { $limit: parseInt(limit) },
            {
                $project: {
                    totalMinutes: 1,
                    sessions: 1,
                    username: '$user.username',
                    firstName: '$user.firstName',
                    lastName: '$user.lastName'
                }
            }
        ]);

        const results = leaderboard.map((item, index) => {
            const fullName = item.firstName || item.lastName
                ? `${item.firstName || ''} ${item.lastName || ''}`.trim()
                : item.username || 'User';
            return {
                rank: index + 1,
                username: item.username || 'user',
                fullName,
                totalMinutes: item.totalMinutes,
                sessions: item.sessions
            };
        });

        res.json({ period, results });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Export study data as CSV
// @route   GET /api/analytics/export/csv
// @access  Private
router.get('/export/csv', protect, async (req, res) => {
    try {
        const { type = 'all', startDate, endDate } = req.query;

        let filter = { user: req.user.id };
        if (startDate && endDate) {
            filter.startTime = { $gte: new Date(startDate), $lte: new Date(endDate) };
        }

        let csvData = '';
        let filename = 'studyflow_export.csv';

        if (type === 'sessions' || type === 'all') {
            const sessions = await Session.find(filter).populate('user', 'name email');
            csvData += 'Type,Subject,Duration (minutes),Timestamp\n';
            sessions.forEach(session => {
                csvData += `Session,${session.subject || 'Unspecified'},${session.duration},${session.timestamp}\n`;
            });
        }

        if (type === 'tasks' || type === 'all') {
            const tasks = await Task.find({ user: req.user.id }).populate('user', 'name email');
            if (csvData) csvData += '\n';
            csvData += 'Type,Title,Description,Completed,Created At,Completed At\n';
            tasks.forEach(task => {
                csvData += `Task,"${task.title}","${task.description || ''}",${task.completed},${task.createdAt},${task.completedAt || ''}\n`;
            });
        }

        if (type === 'subjects' || type === 'all') {
            const subjects = await Subject.find({ user: req.user.id });
            if (csvData) csvData += '\n';
            csvData += 'Type,Name,Category,Color,Target Hours,Description\n';
            subjects.forEach(subject => {
                csvData += `Subject,"${subject.name}","${subject.category}","${subject.color}",${subject.targetHours},"${subject.description || ''}"\n`;
            });
        }

        if (type === 'goals' || type === 'all') {
            const goals = await Goal.find({ user: req.user.id });
            if (csvData) csvData += '\n';
            csvData += 'Type,Title,Type,Target,Current,Unit,Deadline,Completed\n';
            goals.forEach(goal => {
                csvData += `Goal,"${goal.title}","${goal.type}",${goal.target},${goal.current},"${goal.unit}","${goal.deadline}",${goal.completed}\n`;
            });
        }

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(csvData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Export study data as JSON
// @route   GET /api/analytics/export/json
// @access  Private
router.get('/export/json', protect, async (req, res) => {
    try {
        const { type = 'all', startDate, endDate } = req.query;

        let filter = { user: req.user.id };
        if (startDate && endDate) {
            filter.timestamp = { $gte: new Date(startDate), $lte: new Date(endDate) };
        }

        const exportData = {};

        if (type === 'sessions' || type === 'all') {
            exportData.sessions = await Session.find(filter).populate('user', 'name email');
        }

        if (type === 'tasks' || type === 'all') {
            exportData.tasks = await Task.find({ user: req.user.id }).populate('user', 'name email');
        }

        if (type === 'subjects' || type === 'all') {
            exportData.subjects = await Subject.find({ user: req.user.id });
        }

        if (type === 'goals' || type === 'all') {
            exportData.goals = await Goal.find({ user: req.user.id });
        }

        if (type === 'achievements' || type === 'all') {
            exportData.achievements = await Achievement.find({ user: req.user.id });
        }

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename="studyflow_export.json"');
        res.json(exportData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get quiz statistics
// @route   GET /api/analytics/quiz-stats
// @access  Private
router.get('/quiz-stats', protect, async (req, res) => {
    try {
        const Quiz = require('../models/Quiz');
        const quizzes = await Quiz.find({ user: req.user.id });
        
        const stats = {
            totalQuizzes: quizzes.length,
            completedQuizzes: quizzes.filter(q => q.completed).length,
            averageScore: quizzes.length > 0 
                ? Math.round(quizzes.reduce((sum, q) => sum + (q.score || 0), 0) / quizzes.length) 
                : 0,
            highestScore: quizzes.length > 0 ? Math.max(...quizzes.map(q => q.score || 0)) : 0,
            quizzes: quizzes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 10)
        };

        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;