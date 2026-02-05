const crypto = require('crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: String,
    lastName: String,
    profileImage: String,
    // 👇 নতুন রোল ফিল্ড যোগ করা হয়েছে
    role: {
        type: String,
        enum: ['user', 'subadmin', 'admin'], // user, subadmin, admin
        default: 'user'
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    // Streaks & summaries
    streakCurrent: { type: Number, default: 0 },
    streakLongest: { type: Number, default: 0 },
    lastStudyDate: Date,
    dailySummaryEnabled: { type: Boolean, default: true },
    lastDailySummarySent: Date,
    weeklySummaryEnabled: { type: Boolean, default: true },
    lastWeeklySummarySent: Date,
    monthlySummaryEnabled: { type: Boolean, default: true },
    lastMonthlySummarySent: Date,
    // Achievement Level System
    achievementPoints: { type: Number, default: 0 },
    achievementLevel: { type: Number, default: 1, min: 1, max: 5 },
    achievementLevelName: { 
        type: String, 
        enum: ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'],
        default: 'Bronze'
    },
    totalAchievementsUnlocked: { type: Number, default: 0 },
    // Calendar & public profile
    calendarToken: String,
    publicProfileToken: String,
    publicProfileEnabled: { type: Boolean, default: false },
    lastLoginAt: Date
}, { timestamps: true });

// Match password method
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password reset token
userSchema.methods.getResetPasswordToken = function() {
    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // Set expire (10 minutes)
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    return resetToken;
};

module.exports = mongoose.model('User', userSchema);