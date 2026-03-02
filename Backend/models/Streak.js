const mongoose = require('mongoose');

const streakSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    currentStreak: {
        type: Number,
        default: 0
    },
    longestStreak: {
        type: Number,
        default: 0
    },
    lastStudyDate: {
        type: Date,
        default: null
    },
    streakHistory: [{
        date: Date,
        studyMinutes: Number,
        completed: Boolean
    }],
    totalStudyDays: {
        type: Number,
        default: 0
    },
    achievements: [{
        type: {
            type: String,
            enum: ['7-day', '14-day', '30-day', '60-day', '100-day', '365-day']
        },
        unlockedAt: Date
    }]
}, {
    timestamps: true
});

// Method to update streak
streakSchema.methods.updateStreak = function(studyMinutes) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const lastDate = this.lastStudyDate ? new Date(this.lastStudyDate) : null;
    if (lastDate) lastDate.setHours(0, 0, 0, 0);
    
    // Check if already studied today
    if (lastDate && lastDate.getTime() === today.getTime()) {
        // Update today's entry
        const todayEntry = this.streakHistory.find(entry => {
            const entryDate = new Date(entry.date);
            entryDate.setHours(0, 0, 0, 0);
            return entryDate.getTime() === today.getTime();
        });
        if (todayEntry) {
            todayEntry.studyMinutes += studyMinutes;
        }
        return { continued: true, currentStreak: this.currentStreak };
    }
    
    // Calculate difference in days
    const daysDiff = lastDate ? Math.floor((today - lastDate) / (1000 * 60 * 60 * 24)) : 0;
    
    if (daysDiff === 0) {
        // Same day, already handled above
        return { continued: true, currentStreak: this.currentStreak };
    } else if (daysDiff === 1) {
        // Consecutive day - streak continues
        this.currentStreak += 1;
    } else {
        // Streak broken - restart
        this.currentStreak = 1;
    }
    
    // Update longest streak
    if (this.currentStreak > this.longestStreak) {
        this.longestStreak = this.currentStreak;
    }
    
    // Add to history
    this.streakHistory.push({
        date: today,
        studyMinutes: studyMinutes,
        completed: true
    });
    
    // Update last study date
    this.lastStudyDate = today;
    this.totalStudyDays += 1;
    
    // Check for achievements
    this.checkAchievements();
    
    return { continued: daysDiff === 1, currentStreak: this.currentStreak, broken: daysDiff > 1 };
};

// Check and unlock streak achievements
streakSchema.methods.checkAchievements = function() {
    const milestones = [
        { days: 7, type: '7-day' },
        { days: 14, type: '14-day' },
        { days: 30, type: '30-day' },
        { days: 60, type: '60-day' },
        { days: 100, type: '100-day' },
        { days: 365, type: '365-day' }
    ];
    
    milestones.forEach(milestone => {
        const hasAchievement = this.achievements.some(a => a.type === milestone.type);
        if (!hasAchievement && this.currentStreak >= milestone.days) {
            this.achievements.push({
                type: milestone.type,
                unlockedAt: new Date()
            });
        }
    });
};

// Get streak status
streakSchema.methods.getStatus = function() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const lastDate = this.lastStudyDate ? new Date(this.lastStudyDate) : null;
    if (lastDate) lastDate.setHours(0, 0, 0, 0);
    
    const daysSinceStudy = lastDate ? Math.floor((today - lastDate) / (1000 * 60 * 60 * 24)) : 999;
    
    return {
        currentStreak: daysSinceStudy > 1 ? 0 : this.currentStreak,
        longestStreak: this.longestStreak,
        totalStudyDays: this.totalStudyDays,
        lastStudyDate: this.lastStudyDate,
        isActiveToday: daysSinceStudy === 0,
        achievements: this.achievements,
        streakStatus: daysSinceStudy === 0 ? 'active' : daysSinceStudy === 1 ? 'at-risk' : 'broken'
    };
};

module.exports = mongoose.model('Streak', streakSchema);
