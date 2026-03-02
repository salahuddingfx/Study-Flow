/**
 * Study Streak Tracker Module
 * Track daily study consistency and reward streaks
 * Team: Salah Uddin Kader & Sohana Rahman
 */

const StreakTracker = {
    streakData: null,
    
    // Get API base URL from Vue app
    getApiUrl() {
        if (window.app && window.app.API_BASE_URL) {
            return window.app.API_BASE_URL;
        }
        // Fallback
        return (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
            ? 'http://localhost:5000'
            : 'https://study-flow-nfym.onrender.com';
    },
    
    // Initialize streak tracker
    async init() {
        // Wait for DOM
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
            return;
        }

        try {
            await this.loadStreak();
            this.render();
            console.log('✅ Streak tracker initialized');
        } catch (error) {
            console.error('❌ Streak init error:', error);
        }
    },
    
    // Load streak data from API
    async loadStreak() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${this.getApiUrl()}/api/streak/status`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                this.streakData = await response.json();
                return this.streakData;
            }
        } catch (error) {
            console.error('Load streak error:', error);
        }
        return null;
    },
    
    // Update streak after study session
    async updateStreak(studyMinutes) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${this.getApiUrl()}/api/streak/update`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ studyMinutes })
            });
            
            if (response.ok) {
                const result = await response.json();
                this.streakData = result;
                this.render();
                
                // Show achievement notifications
                if (result.newAchievements && result.newAchievements.length > 0) {
                    result.newAchievements.forEach(achievement => {
                        this.showAchievementNotification(achievement);
                    });
                }
                
                return result;
            }
        } catch (error) {
            console.error('Update streak error:', error);
        }
        return null;
    },
    
    // Get leaderboard
    async getLeaderboard() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${this.getApiUrl()}/api/streak/leaderboard`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                return data.leaderboard;
            }
        } catch (error) {
            console.error('Get leaderboard error:', error);
        }
        return [];
    },
    
    // Render streak widget in dashboard
    render() {
        const container = document.getElementById('streak-widget');
        if (!container || !this.streakData) return;
        
        const { currentStreak, longestStreak, totalStudyDays, streakStatus, achievements } = this.streakData;
        
        const statusColors = {
            'active': 'text-green-500',
            'at-risk': 'text-orange-500',
            'broken': 'text-red-500'
        };
        
        const statusIcons = {
            'active': '🔥',
            'at-risk': '⚠️',
            'broken': '💔'
        };
        
        const statusText = {
            'active': 'Active Today!',
            'at-risk': 'Study Today!',
            'broken': 'Start New Streak'
        };
        
        container.innerHTML = `
            <div class="glass p-6 rounded-2xl border border-purple-500/30">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-xl font-bold text-white flex items-center gap-2">
                        🔥 Study Streak
                    </h3>
                    <span class="${statusColors[streakStatus]} font-semibold">
                        ${statusIcons[streakStatus]} ${statusText[streakStatus]}
                    </span>
                </div>
                
                <div class="grid grid-cols-3 gap-4 mb-4">
                    <div class="text-center p-3 bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-xl">
                        <div class="text-3xl font-bold text-purple-400">${currentStreak}</div>
                        <div class="text-xs text-gray-400 mt-1">Current</div>
                    </div>
                    <div class="text-center p-3 bg-gradient-to-br from-blue-900/50 to-cyan-900/50 rounded-xl">
                        <div class="text-3xl font-bold text-blue-400">${longestStreak}</div>
                        <div class="text-xs text-gray-400 mt-1">Longest</div>
                    </div>
                    <div class="text-center p-3 bg-gradient-to-br from-green-900/50 to-emerald-900/50 rounded-xl">
                        <div class="text-3xl font-bold text-green-400">${totalStudyDays}</div>
                        <div class="text-xs text-gray-400 mt-1">Total Days</div>
                    </div>
                </div>
                
                ${achievements.length > 0 ? `
                    <div class="mt-4 pt-4 border-t border-white/10">
                        <div class="text-sm text-gray-400 mb-2">Achievements:</div>
                        <div class="flex flex-wrap gap-2">
                            ${achievements.map(a => `
                                <span class="px-2 py-1 bg-purple-600/30 text-purple-300 rounded-full text-xs">
                                    🏆 ${a.type.replace('-day', 'd')}
                                </span>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                <button onclick="StreakTracker.showLeaderboard()" 
                    class="w-full mt-4 btn-secondary py-2 rounded-lg text-sm font-semibold hover:bg-purple-600/50 transition-colors">
                    View Leaderboard 🏅
                </button>
            </div>
        `;
    },
    
    // Show leaderboard modal
    async showLeaderboard() {
        const leaderboard = await this.getLeaderboard();
        
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80';
        modal.innerHTML = `
            <div class="glass max-w-2xl w-full rounded-2xl p-6 max-h-[80vh] overflow-y-auto">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold text-white">🏆 Streak Leaderboard</h2>
                    <button onclick="this.closest('.fixed').remove()" 
                        class="text-white hover:text-purple-400 text-2xl">×</button>
                </div>
                
                <div class="space-y-2">
                    ${leaderboard.map((entry, index) => `
                        <div class="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                            <div class="flex items-center gap-4">
                                <div class="text-2xl font-bold ${index < 3 ? 'text-yellow-400' : 'text-gray-400'}">
                                    ${index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${entry.rank}`}
                                </div>
                                <div>
                                    <div class="font-semibold text-white">${entry.userName}</div>
                                    <div class="text-sm text-gray-400">${entry.totalStudyDays} total study days</div>
                                </div>
                            </div>
                            <div class="text-right">
                                <div class="text-2xl font-bold text-purple-400">${entry.currentStreak}🔥</div>
                                <div class="text-xs text-gray-400">Best: ${entry.longestStreak}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                ${leaderboard.length === 0 ? `
                    <div class="text-center py-8 text-gray-400">
                        No data yet. Start studying to appear on the leaderboard!
                    </div>
                ` : ''}
            </div>
        `;
        
        document.body.appendChild(modal);
    },
    
    // Show achievement notification
    showAchievementNotification(achievement) {
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 z-50 glass p-6 rounded-2xl border-2 border-yellow-500 animate-slideInRight';
        notification.innerHTML = `
            <div class="text-center">
                <div class="text-4xl mb-2">🏆</div>
                <div class="text-xl font-bold text-white mb-1">New Achievement!</div>
                <div class="text-purple-300">${achievement.type} Streak</div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.5s ease-in-out';
            setTimeout(() => notification.remove(), 500);
        }, 4000);
    }
};

// Auto-update streak after completing study session
if (typeof window !== 'undefined') {
    window.StreakTracker = StreakTracker;
}
