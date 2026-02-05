const crypto = require('crypto');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const sendEmail = require('../utils/sendEmail');
const AuditLog = require('../models/AuditLog');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Register new user
// @route   POST /api/auth/register
const registerUser = async (req, res) => {
    try {
        const { username, email, password, firstName, lastName } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Username, email, and password are required' });
        }

        const userExists = await User.findOne({ $or: [{ email }, { username }] });
        if (userExists) {
            return res.status(400).json({ message: 'User or Email already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const isSuperAdminMatch =
            process.env.SUPER_ADMIN_USERNAME &&
            process.env.SUPER_ADMIN_EMAIL &&
            username === process.env.SUPER_ADMIN_USERNAME &&
            email === process.env.SUPER_ADMIN_EMAIL;

        const user = await User.create({
            username,
            email,
            password: hashedPassword,
            firstName,
            lastName,
            role: isSuperAdminMatch ? 'admin' : 'user'
        });

        try {
            await AuditLog.create({
                actor: user._id,
                actorUsername: user.username,
                action: 'register',
                targetUser: user._id,
                targetUsername: user.username,
                metadata: { role: user.role },
                ip: req.ip,
                userAgent: req.get('user-agent')
            });
        } catch (err) {
            console.error('AuditLog error:', err.message);
        }

        if (user) {
            // Notify Admin about new user registration
            const adminEmail = process.env.SUPER_ADMIN_EMAIL || process.env.FROM_EMAIL;
            if (adminEmail) {
                try {
                    await sendEmail({
                        email: adminEmail,
                        subject: 'New User Registered - StudyFlow',
                        message: `A new user has registered:\nUsername: ${user.username}\nEmail: ${user.email}\nName: ${user.firstName} ${user.lastName}`,
                        template: 'info',
                        heading: 'New Registration'
                    });
                } catch (err) {
                    console.error('Admin registration email failed:', err.message);
                }
            }

            res.status(201).json({
                _id: user.id,
                username: user.username,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                token: generateToken(user._id),
                role: user.role
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });

        if (user && (await bcrypt.compare(password, user.password))) {
            const isSuperAdminMatch =
                process.env.SUPER_ADMIN_USERNAME &&
                process.env.SUPER_ADMIN_EMAIL &&
                user.username === process.env.SUPER_ADMIN_USERNAME &&
                user.email === process.env.SUPER_ADMIN_EMAIL;

            if (isSuperAdminMatch && user.role !== 'admin') {
                user.role = 'admin';
            }

            const isFirstLogin = !user.lastLoginAt;
            user.lastLoginAt = new Date();
            await user.save();

            try {
                await AuditLog.create({
                    actor: user._id,
                    actorUsername: user.username,
                    action: 'login',
                    targetUser: user._id,
                    targetUsername: user.username,
                    metadata: { role: user.role, firstLogin: isFirstLogin },
                    ip: req.ip,
                    userAgent: req.get('user-agent')
                });
            } catch (err) {
                console.error('AuditLog error:', err.message);
            }

            // Removed "First Login" email notification as it has been moved to Registration

            res.json({
                _id: user.id,
                username: user.username,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                token: generateToken(user._id),
                role: user.role
            });
        } else {
            res.status(401).json({ message: 'Invalid username or password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get user profile
// @route   GET /api/auth/me
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Make a user admin (temporary route for setup)
// @route   POST /api/auth/make-admin
const makeAdmin = async (req, res) => {
    try {
        const { username } = req.body;
        const user = await User.findOneAndUpdate(
            { username: username },
            { $set: { role: 'admin' } },
            { new: true }
        ).select('-password');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.json({ 
            success: true,
            message: `${username} is now an admin!`, 
            user: {
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Forgot Password
// @route   POST /api/auth/forgotpassword
const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found with that email' });
        }

        // Get reset token
        const resetToken = user.getResetPasswordToken();

        // Save (only saving the new fields, disabling validation for other required fields)
        await user.save({ validateBeforeSave: false });

        // Create reset URL
        // NOTE: In production, change this to your frontend URL
        const resetUrl = `${req.protocol}://${req.get('host')}/resetpassword/${resetToken}`; 
        // Or if you separate frontend: `http://localhost:5500/reset-password.html?token=${resetToken}`

        const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Password Reset Token - StudyFlow',
                message,
                url: resetUrl,
                template: 'password-reset',
                heading: 'StudyFlow Password Reset'
            });

            res.status(200).json({ success: true, data: 'Email sent' });
        } catch (err) {
            console.error(err);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;

            await user.save({ validateBeforeSave: false });

            return res.status(500).json({ message: 'Email could not be sent' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Reset Password
// @route   PUT /api/auth/resetpassword/:resettoken
const resetPassword = async (req, res) => {
    // Get hashed token
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
            return res.status(400).json({ message: 'Invalid token' });
        }

        // Set new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
        
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.status(200).json({
            success: true,
            token: generateToken(user._id),
            message: 'Password updated successfully'
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update username/password (requires current password)
// @route   PUT /api/auth/update-credentials
// @access  Private
const updateCredentials = async (req, res) => {
    const { newUsername, currentPassword, newPassword } = req.body;

    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!currentPassword) {
            return res.status(400).json({ message: 'Current password is required' });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        if (newUsername && newUsername !== user.username) {
            const exists = await User.findOne({ username: newUsername });
            if (exists) {
                return res.status(400).json({ message: 'Username already taken' });
            }
            user.username = newUsername;
        }

        if (newPassword) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
        }

        const updatedUser = await user.save();
        return res.json({
            success: true,
            message: 'Credentials updated successfully',
            user: {
                _id: updatedUser.id,
                username: updatedUser.username,
                email: updatedUser.email
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getMe,
    makeAdmin,
    forgotPassword,
    resetPassword,
    updateCredentials
};
