const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Session = require('../models/Session');
const Task = require('../models/Task');
const Subject = require('../models/Subject');
const Goal = require('../models/Goal');
const Quiz = require('../models/Quiz'); // Import Quiz model if recently created
const AuditLog = require('../models/AuditLog');
const { admin } = require('../middleware/admin.middleware');

const analyticsCache = {
    data: null,
    expiresAt: 0
};

const invalidateAnalyticsCache = () => {
    analyticsCache.data = null;
    analyticsCache.expiresAt = 0;
};

const logAdminAction = async (req, action, targetUser, metadata = {}) => {
    try {
        await AuditLog.create({
            actor: req.user.id,
            actorUsername: req.user.username,
            action,
            targetUser: targetUser?._id,
            targetUsername: targetUser?.username,
            metadata,
            ip: req.ip,
            userAgent: req.get('user-agent')
        });
    } catch (err) {
        console.error('AuditLog error:', err.message);
    }
};

// Get all users
router.get('/users', admin, async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page || '1', 10), 1);
        const pageSize = Math.min(Math.max(parseInt(req.query.pageSize || '10', 10), 1), 100);
        const search = (req.query.search || '').trim();
        const role = (req.query.role || '').trim();

        const query = {};
        if (search) {
            query.$or = [
                { username: new RegExp(search, 'i') },
                { email: new RegExp(search, 'i') },
                { firstName: new RegExp(search, 'i') },
                { lastName: new RegExp(search, 'i') }
            ];
        }
        if (role) {
            query.role = role;
        }

        const [users, total] = await Promise.all([
            User.find(query)
                .select('-password')
                .skip((page - 1) * pageSize)
                .limit(pageSize)
                .sort({ createdAt: -1 }),
            User.countDocuments(query)
        ]);

        res.json({
            users,
            total,
            page,
            pageSize
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// Admin analytics summary
router.get('/analytics', admin, async (req, res) => {
    try {
        if (analyticsCache.data && analyticsCache.expiresAt > Date.now()) {
            return res.json(analyticsCache.data);
        }

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

        const payload = {
            totalUsers,
            totalMinutes,
            totalSessions,
            perUser: sessionAgg
        };

        analyticsCache.data = payload;
        analyticsCache.expiresAt = Date.now() + 60 * 1000; // 60s TTL

        res.json(payload);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

const bcrypt = require('bcryptjs');

// Delete user (Super Admin - Cascade Delete)
router.delete('/users/:id', admin, async (req, res) => {
    try {
        const userToDelete = await User.findById(req.params.id);
        
        if (!userToDelete) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prevent deleting yourself
        if (req.user.id === req.params.id) {
             return res.status(400).json({ message: 'You cannot delete your own admin account.' });
        }

        const isSuperAdmin = process.env.SUPER_ADMIN_USERNAME && req.user && req.user.username === process.env.SUPER_ADMIN_USERNAME;
        if (userToDelete.role === 'admin' && !isSuperAdmin) {
            return res.status(403).json({ message: 'Only super admin can delete an admin account.' });
        }

        // Cascade Delete: Remove all user data
        await Promise.all([
            Session.deleteMany({ user: userToDelete._id }),
            Task.deleteMany({ user: userToDelete._id }),
            Subject.deleteMany({ user: userToDelete._id }),
            Goal.deleteMany({ user: userToDelete._id }),
            Quiz.deleteMany({ user: userToDelete._id }), // Remove their quizzes
            User.findByIdAndDelete(req.params.id)
        ]);

        invalidateAnalyticsCache();
        await logAdminAction(req, 'delete_user', userToDelete, { cascade: true });

        res.json({ success: true, message: 'User and all associated data deleted permanently.' });
    } catch (error) {
        console.error("Delete Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Get all admins
router.get('/admins', admin, async (req, res) => {
    try {
        const admins = await User.find({ role: 'admin' }).select('-password');
        res.json({ admins, count: admins.length });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// Promote user to subadmin
router.put('/users/:id/promote', admin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.role === 'admin' || user.role === 'subadmin') {
            return res.status(400).json({ message: 'User already has admin privileges' });
        }

        user.role = 'subadmin';
        await user.save();

        invalidateAnalyticsCache();
        await logAdminAction(req, 'promote_user', user);
        
        res.json({ 
            success: true, 
            message: `${user.username} promoted to subadmin`,
            user: { username: user.username, email: user.email, role: user.role }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// Promote user to admin (super admin only)
router.put('/users/:id/promote-admin', admin, async (req, res) => {
    try {
        if (process.env.SUPER_ADMIN_USERNAME && req.user && req.user.username !== process.env.SUPER_ADMIN_USERNAME) {
            return res.status(403).json({ message: 'Only super admin can promote to admin' });
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.role === 'admin') {
            return res.status(400).json({ message: 'User is already an admin' });
        }

        user.role = 'admin';
        await user.save();

        invalidateAnalyticsCache();
        await logAdminAction(req, 'promote_user_admin', user);

        res.json({
            success: true,
            message: `${user.username} promoted to admin`,
            user: { username: user.username, email: user.email, role: user.role }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// Demote admin/subadmin to user
router.put('/users/:id/demote', admin, async (req, res) => {
    try {
        const adminToDemote = await User.findById(req.params.id);
        
        if (!adminToDemote) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (adminToDemote.role === 'user') {
            return res.status(400).json({ message: 'User is not an admin' });
        }

        if (adminToDemote.role === 'admin') {
            if (process.env.SUPER_ADMIN_USERNAME && req.user && req.user.username !== process.env.SUPER_ADMIN_USERNAME) {
                return res.status(403).json({ message: 'Only super admin can demote an admin' });
            }
        }

        // Prevent removing the last admin
        if (adminToDemote.role === 'admin') {
            const adminCount = await User.countDocuments({ role: 'admin' });
            if (adminCount <= 1) {
                return res.status(403).json({ 
                    message: 'Cannot demote the last admin. There must be at least one admin.' 
                });
            }
        }

        adminToDemote.role = 'user';
        await adminToDemote.save();

        invalidateAnalyticsCache();
        await logAdminAction(req, 'demote_user', adminToDemote, { from: adminToDemote.role });
        
        res.json({ 
            success: true, 
            message: `${adminToDemote.username} demoted to user`,
            user: { username: adminToDemote.username, email: adminToDemote.email, role: adminToDemote.role }
        });
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
        const targetUser = await User.findById(req.params.id);
        await logAdminAction(req, 'change_password', targetUser);
        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// Bulk admin actions
router.post('/users/bulk', admin, async (req, res) => {
    try {
        const { action, userIds = [], role } = req.body || {};

        if (!Array.isArray(userIds) || userIds.length === 0) {
            return res.status(400).json({ message: 'userIds is required' });
        }

        if (action === 'delete') {
            if (userIds.includes(req.user.id)) {
                return res.status(400).json({ message: 'You cannot delete your own admin account.' });
            }
            const usersToDelete = await User.find({ _id: { $in: userIds } });
            const isSuperAdmin = process.env.SUPER_ADMIN_USERNAME && req.user && req.user.username === process.env.SUPER_ADMIN_USERNAME;
            if (!isSuperAdmin && usersToDelete.some(u => u.role === 'admin')) {
                return res.status(403).json({ message: 'Only super admin can delete admin accounts.' });
            }
            await Promise.all([
                Session.deleteMany({ user: { $in: userIds } }),
                Task.deleteMany({ user: { $in: userIds } }),
                Subject.deleteMany({ user: { $in: userIds } }),
                Goal.deleteMany({ user: { $in: userIds } }),
                Quiz.deleteMany({ user: { $in: userIds } }),
                User.deleteMany({ _id: { $in: userIds } })
            ]);

            invalidateAnalyticsCache();
            for (const user of usersToDelete) {
                await logAdminAction(req, 'bulk_delete_user', user, { bulk: true });
            }

            return res.json({ success: true, deleted: userIds.length });
        }

        if (action === 'set_role') {
            if (!['admin', 'subadmin', 'user'].includes(role)) {
                return res.status(400).json({ message: 'Invalid role' });
            }

            if (role === 'admin') {
                if (process.env.SUPER_ADMIN_USERNAME && req.user && req.user.username !== process.env.SUPER_ADMIN_USERNAME) {
                    return res.status(403).json({ message: 'Only super admin can promote to admin' });
                }
            }

            const usersToUpdate = await User.find({ _id: { $in: userIds } });

            // Prevent removing the last admin
            if (role === 'user') {
                const adminCount = await User.countDocuments({ role: 'admin' });
                const demoteCount = usersToUpdate.filter(u => u.role === 'admin').length;
                if (adminCount - demoteCount <= 0) {
                    return res.status(403).json({ message: 'Cannot demote the last admin.' });
                }
            }

            await User.updateMany({ _id: { $in: userIds } }, { role });
            invalidateAnalyticsCache();

            for (const user of usersToUpdate) {
                await logAdminAction(req, 'bulk_set_role', user, { role });
            }

            return res.json({ success: true, updated: userIds.length, role });
        }

        return res.status(400).json({ message: 'Unsupported bulk action' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// Audit log
router.get('/audit', admin, async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page || '1', 10), 1);
        const pageSize = Math.min(Math.max(parseInt(req.query.pageSize || '10', 10), 1), 100);
        const [logs, total] = await Promise.all([
            AuditLog.find({})
                .sort({ createdAt: -1 })
                .skip((page - 1) * pageSize)
                .limit(pageSize),
            AuditLog.countDocuments()
        ]);

        res.json({ logs, total, page, pageSize });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;