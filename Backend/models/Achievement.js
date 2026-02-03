const mongoose = require('mongoose');

const achievementSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    title: {
        type: String,
        required: [true, 'Please add a title']
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    icon: {
        type: String,
        default: 'trophy'
    },
    category: {
        type: String,
        enum: ['study-time', 'consistency', 'goals', 'subjects', 'tasks', 'special'],
        required: true
    },
    criteria: {
        type: {
            type: String,
            enum: ['total-hours', 'sessions-count', 'streak-days', 'goals-completed', 'subjects-mastered', 'tasks-completed', 'perfect-week'],
            required: true
        },
        value: {
            type: Number,
            required: true
        },
        subject: String, // For subject-specific achievements
        period: {
            type: String,
            enum: ['daily', 'weekly', 'monthly', 'all-time']
        }
    },
    unlocked: {
        type: Boolean,
        default: false
    },
    unlockedAt: {
        type: Date
    },
    progress: {
        type: Number,
        default: 0
    },
    rarity: {
        type: String,
        enum: ['common', 'rare', 'epic', 'legendary'],
        default: 'common'
    },
    points: {
        type: Number,
        default: 10
    },
    level: {
        type: Number,
        default: 1,
        min: 1,
        max: 5
    },
    levelName: {
        type: String,
        enum: ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'],
        default: 'Bronze'
    }
}, {
    timestamps: true
});

// Index for efficient queries
achievementSchema.index({ user: 1, unlocked: 1 });
achievementSchema.index({ user: 1, category: 1 });

module.exports = mongoose.model('Achievement', achievementSchema);