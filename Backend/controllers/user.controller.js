const User = require('../models/User');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const sendEmail = require('../utils/sendEmail');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Get user profile
// @route   GET /api/user/profile
// @access  Private
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user profile
// @route   PUT /api/user/profile
// @access  Private
const updateUserProfile = async (req, res) => {
    const { firstName, lastName, profileImage } = req.body;

    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.firstName = firstName || user.firstName;
        user.lastName = lastName || user.lastName;
        user.profileImage = profileImage || user.profileImage;

        const updatedUser = await user.save();
        res.json({
            _id: updatedUser.id,
            username: updatedUser.username,
            email: updatedUser.email,
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            profileImage: updatedUser.profileImage,
            role: updatedUser.role
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Change password
// @route   PUT /api/user/change-password
// @access  Private
const changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.json({ 
            success: true,
            message: 'Password updated successfully' 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete user account
// @route   DELETE /api/user/account
// @access  Private
const deleteUserAccount = async (req, res) => {
    try {
        // Import all related models
        const Task = require('../models/Task');
        const Session = require('../models/Session');
        const Subject = require('../models/Subject');
        const Goal = require('../models/Goal');
        const Achievement = require('../models/Achievement');

        const userId = req.user.id;

        // Delete all user-related data
        await Promise.all([
            Task.deleteMany({ user: userId }),
            Session.deleteMany({ user: userId }),
            Subject.deleteMany({ user: userId }),
            Goal.deleteMany({ user: userId }),
            Achievement.deleteMany({ user: userId }),
            User.findByIdAndDelete(userId)
        ]);

        res.json({ 
            success: true,
            message: 'Account and all data deleted successfully' 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Request password reset
// @route   POST /api/user/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
    const { username, email } = req.body;

    try {
        // Find user by username and email
        const user = await User.findOne({ username, email });

        if (!user) {
            return res.status(404).json({ 
                message: 'No user found with that username and email combination' 
            });
        }

        // Generate reset token
        const resetToken = user.getResetPasswordToken();
        await user.save({ validateBeforeSave: false });

        // Create reset URL with frontend URL from environment
        const frontendUrl = process.env.FRONTEND_URL || 'http://127.0.0.1:5500';
        const resetUrl = `${frontendUrl}/?token=${resetToken}`;

        const message = `You requested a password reset. Click the link below to reset your password:\n\n${resetUrl}\n\nIf you didn't request this, please ignore this email.`;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Password Reset Request - StudyFlow',
                message,
                url: resetUrl
            });

            res.status(200).json({ 
                success: true, 
                message: 'Password reset instructions sent to your email' 
            });
        } catch (err) {
            console.error('Email error:', err);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save({ validateBeforeSave: false });

            return res.status(500).json({ 
                message: 'Email could not be sent. Please try again later.' 
            });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

// @desc    Reset password with token
// @route   PUT /api/user/reset-password/:resettoken
// @access  Public
const resetPassword = async (req, res) => {
    const { newPassword } = req.body;

    // Hash the token from URL to match database
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.resettoken)
        .digest('hex');

    try {
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ 
                message: 'Invalid or expired reset token' 
            });
        }

        // Set new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password reset successful! You can now login.',
            token: generateToken(user._id)
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

module.exports = {
    getUserProfile,
    updateUserProfile,
    changePassword,
    deleteUserAccount,
    forgotPassword,
    resetPassword
};
