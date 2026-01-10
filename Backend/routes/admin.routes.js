const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Session = require('../models/Session');
const { admin } = require('../middleware/admin.middleware');

// Get all users
router.get('/users', admin, async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// Admin analytics summary
router.get('/analytics', admin, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();

        // Support legacy docs where user was stored in userId
        const sessionAgg = await Session.aggregate([
            {
                $addFields: {
                    userResolved: { $ifNull: ['$user', '$userId'] }
                }
            },
            {
                $group: {
                    _id: '$userResolved',
                    totalMinutes: { $sum: '$duration' },
                    totalSessions: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'userInfo'
                }
            },
            { $unwind: { path: '$userInfo', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    username: { $ifNull: ['$userInfo.username', 'Unknown'] },
                    totalMinutes: 1,
                    totalSessions: 1
                }
            }
        ]);

        const totalMinutes = sessionAgg.reduce((sum, s) => sum + s.totalMinutes, 0);
        const totalSessions = sessionAgg.reduce((sum, s) => sum + s.totalSessions, 0);

        res.json({
            totalUsers,
            totalMinutes,
            totalSessions,
            perUser: sessionAgg
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

const bcrypt = require('bcryptjs');

// Delete user
router.delete('/users/:id', admin, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// Admin change user password
router.put('/users/:id/password', admin, async (req, res) => {
    try {
        const { newPassword } = req.body;
        if (!newPassword || newPassword.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        
        await User.findByIdAndUpdate(req.params.id, { password: hashedPassword });
        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;