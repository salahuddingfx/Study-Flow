/* eslint-disable */
/* Vue.js Application - StudyFlow Frontend */
/* @vue/component */
/* jshint ignore:start */

const { createApp } = Vue;

createApp({
    data() {
        return {
            // API Configuration
            API_BASE_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
                ? 'http://localhost:5000' 
                : 'https://study-flow-nfym.onrender.com',

            // Loading Text for Real Effect
            loadingText: 'Initializing...', 

            // Loading states
            isLoading: false,

            // Loader
            showLoader: true,
            showOutro: false,
            showLoginSuccess: false,
            showLoginDoor: false,
            showLogoutAnimation: false,
            logoutButtonPosition: '',

            // Modals
            showDeveloperModal: false,
            showDataModal: false,
            showChangeCredentials: false,
            showThemeModal: false,
            showNotificationSettings: false,
            showAdvancedTimer: false,
            showMusicModal: false,

            // Auth
            isAuthenticated: false,
            authMode: 'login',
            showPassword: false,
            showCurrentPassword: false,
            showNewPassword: false,
            authToken: null,

            // Password strength
            passwordStrength: 0,
            newPasswordStrength: 0,
            forgotPasswordStrength: 0,
            loginForm: { username: '', password: '' },
            registerForm: {
                username: '',
                password: '',
                firstName: '',
                lastName: '',
                email: ''
            },
            forgotForm: {
                username: '',
                email: '',
                newPassword: ''
            },
            currentUser: '',
            userFullName: '',
            userEmail: '',
            userProfileImage: '',
            userId: null,
            exportData: null,
            importFile: null,

            // Credentials Change
            credentialsForm: {
                newUsername: '',
                currentPassword: '',
                newPassword: ''
            },

            // Navigation
            currentView: 'home',
            mobileMenuOpen: false,

            // Timer
            timerMode: 'focus',
            timerRunning: false,
            timeRemaining: 25 * 60, // seconds
            totalTimerDuration: 25 * 60,
            timerInterval: null,
            currentSubject: '',
            currentTask: '',
            customMinutes: 60,

            // Advanced Timer Settings
            focusDuration: 25, // minutes
            shortBreakDuration: 5, // minutes
            longBreakDuration: 15, // minutes
            sessionsUntilLongBreak: 4,
            currentSessionCount: 0,
            autoStartBreaks: false,
            autoStartFocus: false,

            // Subjects
            subjects: [],
            newSubject: '',

            // Sessions
            sessions: [],

            // Tasks
            tasks: [],
            newTask: '',

            // Goals & Streaks
            goals: [], 
            achievements: [],
            currentStreak: 0,

            // Alarm Settings
            alarmSound: 'bell',
            warningAlarmEnabled: true,
            warningAlarmPlayed: false,
            audioContext: null,

            // Theme
            currentTheme: 'dark',

            // Notifications
            notificationsEnabled: false,
            studyReminders: true,
            goalDeadlines: true,
            streakAlerts: true,
            reminderInterval: 60, // minutes

            // Music Variables
            musicTab: 'playlists',
            musicPlaylists: [],
            currentPlaylist: null,
            currentTrack: null,
            isPlaying: false,
            musicVolume: 50,
            newPlaylistName: '',
            newTrackName: '',
            newTrackUrl: '',
            editingPlaylist: null,

            // YouTube API Integration Variables
            youtubeUrl: '',
            youtubeVideoId: '',
            showYouTubePlayer: false,
            youtubePlayer: null, 
            youtubeVolume: 50,
            youtubeMuted: false,
            youtubeSpeed: 1,
            
            youtubePlaylists: [
                {
                    name: 'Focus & Concentration',
                    videos: [
                        { id: 'lFcSrYw-ARY', title: 'Deep Focus Music' },
                        { id: 'DWcJFNfaw9c', title: 'Study Music Alpha Waves' },
                        { id: '4n7B9b8l3kE', title: 'Concentration Music' }
                    ]
                },
                {
                    name: 'Ambient & Nature',
                    videos: [
                        { id: '21qNxnCS8JU', title: 'Rain Sounds for Focus' },
                        { id: 'qvyrrvVdF8U', title: 'Forest Ambience' },
                        { id: 'sELs4sOO2us', title: 'Ocean Waves' }
                    ]
                },
                {
                    name: 'Classical & Piano',
                    videos: [
                        { id: '9E6b3swbnWg', title: 'Classical Piano' },
                        { id: 'Dx5qFachd3A', title: 'Beethoven Moonlight Sonata' },
                        { id: 'JkxBHZBMXOg', title: 'Relaxing Piano Music' }
                    ]
                }
            ],

            // Quotes
            motivationalQuotes: [
                "Focus is the gateway to thinking clearly.",
                "The secret of getting ahead is getting started.",
                "Success is the sum of small efforts repeated day in and day out.",
                "Don't watch the clock; do what it does. Keep going.",
                "The future depends on what you do today.",
                "Believe you can and you're halfway there.",
                "Your limitation—it's only your imagination.",
                "Great things never come from comfort zones.",
                "Dream it. Wish it. Do it.",
                "Success doesn't just find you. You have to go out and get it."
            ],
            currentQuote: '',

            // DateTime
            currentDateTime: '',
            dateTimeInterval: null,

            // Scroll to top
            showScrollTop: false,

            // Cursor
            cursorX: 0,
            cursorY: 0,
            cursorDotX: 0,
            cursorDotY: 0,

            // Analytics
            analyticsView: 'daily',
            studyTimeChart: null,
            subjectChart: null,
            updatingCharts: false,
            chartKey: 0,

            // Online/Offline status
            isOnline: navigator.onLine,
            lastSyncTime: null,

            // Admin Panel
            showAdminPanel: false,
            isAdmin: false,
            allUsers: [],
            adminStats: {
                totalUsers: 0,
                activeUsers: 0,
                totalSessions: 0,
                totalMinutes: 0,
                totalBlogs: 0,
                totalSongs: 0
            },
            adminSessionsSummary: {
                totalMinutes: 0,
                totalSessions: 0,
                perUser: []
            },
            adminSessionsChart: null,
            adminLoading: false,
            adminBlogs: [],
            adminSongs: [],
            newBlog: {
                title: '',
                content: '',
                category: 'Study Related',
                image: ''
            },
            newSong: {
                title: '',
                url: '',
                category: 'focus'
            },

            // Public Blogs
            selectedBlog: null,
            blogsPublic: [
                {
                    _id: '1',
                    title: 'The Art of Deep Focus',
                    content: 'In our distracted world, the ability to focus is a superpower. Deep work is the ability to focus without distraction on a cognitively demanding task. It makes you better at what you do and provides the sense of true fulfillment that comes from craftsmanship. To master this, start by eliminating distractions...',
                    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1000&auto=format&fit=crop',
                    createdAt: new Date().toISOString()
                },
                {
                    _id: '2',
                    title: 'Science of Spaced Repetition',
                    content: 'Spaced repetition is an evidence-based learning technique that is usually performed with flashcards. Newly introduced and more difficult flashcards are shown more frequently, while older and less difficult flashcards are shown less frequently in order to exploit the psychological effect of distraction...',
                    image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=1000&auto=format&fit=crop',
                    createdAt: new Date().toISOString()
                },
                {
                    _id: '3',
                    title: 'Optimizing Your Study Environment',
                    content: 'Your physical environment directly impacts your cognitive performance. Lighting, ergonomics, noise levels, and even air quality play a significant role. A minimalist desk setup with warm lighting can reduce eye strain and keep your mind clear. Lets explore the elements of a perfect study station...',
                    image: 'https://images.unsplash.com/photo-1497493292307-31c376b6e479?q=80&w=1000&auto=format&fit=crop',
                    createdAt: new Date().toISOString()
                }
            ],

            // Goals Management
            goals: [],
            newGoal: {
                title: '',
                type: 'weekly',
                target: '',
                unit: 'hours',
                deadline: '',
                priority: 'medium'
            },

            // AI Assistant
            aiPrompt: '',
            aiReply: '',
            showAIChat: false, // Controls visibility of the floating AI chat
            aiLoading: false,
            aiChatHistory: [], // New Chat History Array
            isTouchDevice: false, // New touch detection
        }; 
    }, 

    async mounted() {
        document.body.className = 'theme-dark';
        this.createParticles();
        
        // Detect Touch Device
        this.isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

        // Display a random motivational quote
        this.currentQuote = this.motivationalQuotes[
            Math.floor(Math.random() * this.motivationalQuotes.length)
        ];
        
        // Load YouTube API Script
        this.loadYouTubeAPI(); 

        // Add touch class to disable global cursor hide on touch devices
        if (this.isTouchDevice) {
            try {
                document.documentElement.classList.add('hasTouch');
            } catch (e) {}
        }

        // --- UPDATED CURSOR LOGIC FOR NEW CSS ---
        this._mouseMoveHandler = (e) => {
            if (this.isTouchDevice) return; // Disable cursor follow on touch

            this.cursorX = e.clientX;
            this.cursorY = e.clientY;
            
            // New logic: Use 'left' and 'top' instead of 'transform'
            // CSS handles the centering (-50% translate)
            if (this.$refs.cursor) {
                this.$refs.cursor.style.left = e.clientX + 'px';
                this.$refs.cursor.style.top = e.clientY + 'px';
            }
            if (this.$refs.cursorDot) {
                this.$refs.cursorDot.style.left = e.clientX + 'px';
                this.$refs.cursorDot.style.top = e.clientY + 'px';
            }
        };

        // --- Hover Effect Logic ---
        this._hoverChecker = (e) => {
            const target = e.target;
            const isHoverable = target.closest('a') || 
                                target.closest('button') || 
                                target.closest('.card-hover') || 
                                target.closest('input') || 
                                target.closest('select') ||
                                target.closest('textarea') ||
                                target.closest('.btn-primary') ||
                                target.closest('.btn-secondary') ||
                                target.closest('.glass') ||
                                target.closest('.glass-strong') ||
                                target.closest('[role="button"]') ||
                                target.closest('.clickable') ||
                                target.closest('label') ||
                                target.closest('.nav-item') ||
                                target.closest('.card');

            if (isHoverable) {
                if (this.$refs.cursor) this.$refs.cursor.classList.add('hover');
                if (this.$refs.cursorDot) this.$refs.cursorDot.classList.add('hover');
            } else {
                if (this.$refs.cursor) this.$refs.cursor.classList.remove('hover');
                if (this.$refs.cursorDot) this.$refs.cursorDot.classList.remove('hover');
            }
        };
        
        document.addEventListener('mouseover', this._hoverChecker);
        document.addEventListener('mousemove', this._mouseMoveHandler);

        this.updateDateTime(); 
        this.dateTimeInterval = setInterval(this.updateDateTime, 1000);

        this._scrollHandler = () => {
            this.showScrollTop = window.scrollY > 300;
        };
        window.addEventListener('scroll', this._scrollHandler);

        this._onlineHandler = () => {
            this.isOnline = true;
            this.lastSyncTime = new Date().toISOString();
            this.showNotification('Back online!', 'success');
            this.syncData();
        };
        this._offlineHandler = () => {
            this.isOnline = false;
            this.showNotification('You are offline. Changes will sync when connection is restored.', 'warning');
        };
        window.addEventListener('online', this._onlineHandler);
        window.addEventListener('offline', this._offlineHandler);

        this.isOnline = navigator.onLine;

        // --- OPTIMIZED LOADING LOGIC ---
        const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

        this.loadingText = "Checking authentication...";
        
        // Server Wake-up Message
        const slowServerTimeout = setTimeout(() => {
            if (this.isLoading || this.showLoader) {
                this.loadingText = "Waking up server (this may take 30s)...";
            }
        }, 5000);

        const token = localStorage.getItem('jwt');

        if (!token) {
            await wait(1500); 
            this.loadingText = "Setting up guest environment...";
            this.currentUser = 'guest';
            await wait(1000); 
            
            this.loadTheme();
            this.loadNotificationSettings();
            this.loadTimerSettings();
            this.loadMusicSettings();
            
            clearTimeout(slowServerTimeout);
            this.showLoader = false;
            return;
        }

        try {
            await wait(1000);
            this.loadingText = "Connecting to server...";
            const res = await fetch(`${this.API_BASE_URL}/api/auth/me`, {
                headers: {
                    Authorization: 'Bearer ' + token
                }
            });

            clearTimeout(slowServerTimeout); 

            if (!res.ok) throw new Error('Invalid token');

            this.loadingText = "Verifying user data...";
            const user = await res.json();

            this.currentUser = user.username || user.user?.username; 
            this.userEmail = user.email || user.user?.email || '';
            this.userFullName = user.firstName ? `${user.firstName} ${user.lastName}` : this.currentUser;
            this.isAuthenticated = true;
            this.authToken = token;

            // Parallel Loading
            this.loadingText = "Syncing data & preferences...";
            await Promise.all([
                this.loadUserData(),
                this.loadAlarmSettings(),
                this.loadMusicSettings()
            ]);

            this.loadingText = "Establishing secure connection...";
            this.initializeSocket();
            await wait(100); 

            this.loadTheme();
            this.loadNotificationSettings();
            this.loadTimerSettings();
            this.startNotificationFeatures();

            this.loadingText = "Ready!";
            await wait(1500); 

        } catch (err) {
            console.error('Auth restore failed', err);
            clearTimeout(slowServerTimeout);
            this.loadingText = "Session expired. Redirecting...";
            await wait(500); 
            localStorage.removeItem('jwt');
            this.loadTheme();
            this.loadNotificationSettings();
            this.loadTimerSettings();
        } finally {
            this.showLoader = false;
        }
    },

    beforeUnmount() {
        if (this._mouseMoveHandler) document.removeEventListener('mousemove', this._mouseMoveHandler);
        if (this._scrollHandler) window.removeEventListener('scroll', this._scrollHandler);
        if (this._onlineHandler) window.removeEventListener('online', this._onlineHandler);
        if (this._offlineHandler) window.removeEventListener('offline', this._offlineHandler);
        if (this.dateTimeInterval) clearInterval(this.dateTimeInterval);
        if (this._hoverChecker) document.removeEventListener('mouseover', this._hoverChecker);
    },

    computed: {
        timerModeLabel() {
            const labels = {
                focus: 'Focus Time',
                shortBreak: 'Short Break',
                longBreak: 'Long Break',
                custom: 'Custom Session'
            };
            return labels[this.timerMode];
        },

        timerColor() {
            const colors = {
                focus: '#8b5cf6',
                shortBreak: '#10b981',
                longBreak: '#3b82f6',
                custom: '#f97316'
            };
            return colors[this.timerMode];
        },

        formattedTime() {
            const minutes = Math.floor(this.timeRemaining / 60);
            const seconds = this.timeRemaining % 60;
            return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        },

        timerProgress() {
            const progress = (this.timeRemaining / this.totalTimerDuration);
            return 753.98 * (1 - progress);
        },

        todaySessions() {
            const today = new Date().toDateString();
            return this.sessions.filter(s => new Date(s.timestamp).toDateString() === today);
        },

        totalFocusTime() {
            return this.sessions.reduce((sum, s) => sum + s.duration, 0);
        },

        totalSessions() {
            return this.sessions.length;
        },

        completedTasksCount() {
            return this.tasks.filter(t => t.completed).length;
        },

        subjectStats() {
            const stats = {};
            this.sessions.forEach(session => {
                const subject = session.subject || 'Unspecified';
                if (!stats[subject]) {
                    stats[subject] = { time: 0, sessions: 0 };
                }
                stats[subject].time += session.duration;
                stats[subject].sessions += 1;
            });
            return stats;
        },

        userInitials() {
            if (this.userFullName) {
                const names = this.userFullName.split(' ');
                return names.map(n => n.charAt(0).toUpperCase()).join('');
            }
            if (this.currentUser) {
                return this.currentUser.charAt(0).toUpperCase();
            }
            return 'G'; // Guest
        },

        passwordStrengthWidth() { return `${this.passwordStrength}%`; },
        passwordStrengthColor() {
            if (this.passwordStrength < 40) return 'bg-red-500';
            if (this.passwordStrength < 70) return 'bg-yellow-500';
            return 'bg-green-500';
        },
        passwordStrengthTextColor() {
            if (this.passwordStrength < 40) return 'text-red-400';
            if (this.passwordStrength < 70) return 'text-yellow-400';
            return 'text-green-400';
        },
        passwordStrengthText() {
            if (this.passwordStrength < 40) return 'Weak';
            if (this.passwordStrength < 70) return 'Medium';
            return 'Strong';
        },

        newPasswordStrengthWidth() { return `${this.newPasswordStrength}%`; },
        newPasswordStrengthColor() {
            if (this.newPasswordStrength < 40) return 'bg-red-500';
            if (this.newPasswordStrength < 70) return 'bg-yellow-500';
            return 'bg-green-500';
        },
        newPasswordStrengthTextColor() {
            if (this.newPasswordStrength < 40) return 'text-red-400';
            if (this.newPasswordStrength < 70) return 'text-yellow-400';
            return 'text-green-400';
        },
        newPasswordStrengthText() {
            if (this.newPasswordStrength < 40) return 'Weak';
            if (this.newPasswordStrength < 70) return 'Medium';
            return 'Strong';
        },

        forgotPasswordStrengthWidth() { return `${this.forgotPasswordStrength}%`; },
        forgotPasswordStrengthColor() {
            if (this.forgotPasswordStrength < 40) return 'bg-red-500';
            if (this.forgotPasswordStrength < 70) return 'bg-yellow-500';
            return 'bg-green-500';
        },
        forgotPasswordStrengthTextColor() {
            if (this.forgotPasswordStrength < 40) return 'text-red-400';
            if (this.forgotPasswordStrength < 70) return 'text-yellow-400';
            return 'text-green-400';
        },
        forgotPasswordStrengthText() {
            if (this.forgotPasswordStrength < 40) return 'Weak';
            if (this.forgotPasswordStrength < 70) return 'Medium';
            return 'Strong';
        },

        currentPeriodStats() {
            let filteredSessions = [];
            const now = new Date();

            if (this.analyticsView === 'daily') {
                const today = now.toDateString();
                filteredSessions = this.sessions.filter(s =>
                    new Date(s.timestamp).toDateString() === today
                );
            } else if (this.analyticsView === 'weekly') {
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                filteredSessions = this.sessions.filter(s =>
                    new Date(s.timestamp) >= weekAgo
                );
            } else if (this.analyticsView === 'monthly') {
                const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                filteredSessions = this.sessions.filter(s =>
                    new Date(s.timestamp) >= monthAgo
                );
            }

            const totalMinutes = filteredSessions.reduce((sum, s) => sum + s.duration, 0);
            const totalSessions = filteredSessions.length;
            const avgSessionLength = totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0;

            return {
                totalMinutes,
                totalSessions,
                avgSessionLength
            };
        },
    },

    watch: {
        currentView(newView) {
            if (newView === 'analytics') {
                this.$nextTick(() => {
                    this.$nextTick(() => {
                        setTimeout(() => {
                            this.updateCharts();
                        }, 500);
                    });
                });
            }
        },

        analyticsView() {
            this.$nextTick(() => {
                this.$nextTick(() => {
                    setTimeout(() => {
                        this.updateCharts();
                    }, 500);
                });
            });
        },

        sessions: {
            handler() {
                if (this.currentView === 'analytics') {
                    this.$nextTick(() => {
                        this.updateCharts();
                    });
                }
            },
            deep: true
        }
    },

    methods: {

        createParticles() {
            const container = this.$refs.particleContainer;
            if (!container) return;

            // আগের কোনো কণা থাকলে পরিষ্কার করা
            container.innerHTML = '';
            
            // কতগুলো কণা বা particle চাও (এখানে ৫০টি দেওয়া হলো)
            const particleCount = 50;

            for (let i = 0; i < particleCount; i++) {
                const particle = document.createElement('div');
                particle.classList.add('particle');
                
                // র‍্যান্ডম পজিশন এবং অ্যানিমেশন ডিলে
                particle.style.left = Math.random() * 100 + 'vw';
                particle.style.top = Math.random() * 100 + 'vh';
                particle.style.animationDelay = Math.random() * 5 + 's';
                particle.style.animationDuration = (Math.random() * 3 + 2) + 's'; // ২ থেকে ৫ সেকেন্ডের স্পিড
                
                container.appendChild(particle);
            }
        },

        updateDateTime() {
            const now = new Date();
            this.currentDateTime = now.toLocaleDateString('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        },

        async apiRequest(endpoint, options = {}) {
            const url = `${this.API_BASE_URL}${endpoint}`;
            const headers = {
                'Content-Type': 'application/json',
                'X-User': this.currentUser,
                ...options.headers
            };

            if (this.authToken) {
                headers['Authorization'] = `Bearer ${this.authToken}`;
            }

            try {
                const response = await fetch(url, {
                    ...options,
                    headers
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'API request failed');
                }

                return data;
            } catch (error) {
                console.error('API Error:', error);
                throw error;
            }
        },

        initializeSocket() {
            if (!this.authToken || !this.userId) return;

            this.socket = io(this.API_BASE_URL, {
                auth: {
                    token: this.authToken,
                    userId: this.userId
                }
            });

            this.socket.on('connect', () => {
                console.log('Connected to server');
            });

            this.socket.on('timer-started', (data) => {
                if (data.userId !== this.userId) {
                    this.timeRemaining = data.timeRemaining;
                    this.timerRunning = true;
                }
            });

            this.socket.on('timer-paused', (data) => {
                if (data.userId !== this.userId) {
                    this.timeRemaining = data.timeRemaining;
                    this.timerRunning = false;
                }
            });

            this.socket.on('timer-reset', (data) => {
                if (data.userId !== this.userId) {
                    this.timeRemaining = data.timeRemaining;
                    this.timerRunning = false;
                }
            });

            this.socket.on('timer-update', (data) => {
                if (data.userId !== this.userId) {
                    this.timeRemaining = data.timeRemaining;
                }
            });

            this.socket.on('task-created', (task) => {
                if (!this.tasks.find(t => t._id === task._id)) {
                    this.tasks.push(task);
                }
            });

            this.socket.on('task-updated', (task) => {
                const index = this.tasks.findIndex(t => t._id === task._id);
                if (index !== -1) {
                    this.tasks[index] = task;
                }
            });

            this.socket.on('task-deleted', (taskId) => {
                this.tasks = this.tasks.filter(t => t._id !== taskId);
            });

            this.socket.on('session-created', (session) => {
                if (!this.sessions.find(s => s._id === session._id)) {
                    this.sessions.push(session);
                }
            });

            this.socket.on('subject-created', (subject) => {
                if (!this.subjects.find(s => s._id === subject._id)) {
                    this.subjects.push(subject);
                }
            });

            this.socket.on('subject-deleted', (subjectName) => {
                this.subjects = this.subjects.filter(s => s.name !== subjectName);
            });

            this.socket.on('achievements-unlocked', (achievements) => {
                achievements.forEach(achievement => {
                    this.showInlineMessage(`🏆 Achievement Unlocked: ${achievement.title}!`);
                });
                // Reload achievements
                this.loadUserData();
            });

            this.socket.on('disconnect', () => {
                console.log('Disconnected from server');
            });
        },

        emitTimerEvent(event, data) {
            if (this.socket && this.isAuthenticated) {
                this.socket.emit(event, {
                    ...data,
                    userId: this.userId,
                    timeRemaining: this.timeRemaining
                });
            }
        },

        async handleLogin() {
            this.isLoading = true;
            try {
                const res = await fetch(`${this.API_BASE_URL}/api/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(this.loginForm)
                });

                const data = await res.json();
                if (!res.ok) throw new Error(data.message);

                localStorage.setItem('jwt', data.token);
                this.authToken = data.token;

                this.currentUser = data.user.username;
                this.userEmail = data.user.email;
                this.userFullName = data.user.firstName ? `${data.user.firstName} ${data.user.lastName || ''}`.trim() : data.user.username;
                this.isAuthenticated = true;
                
                this.showLoginSuccess = true;
                setTimeout(() => {
                    this.showLoginSuccess = false;
                }, 2000);

                await this.loadUserData();
                await this.loadAlarmSettings();
                await this.loadMusicSettings();
                this.loadTheme();
                this.loadNotificationSettings();
                this.loadTimerSettings();
                this.startNotificationFeatures();

                // Check if user is admin
                await this.checkAdminStatus();

            } catch (e) {
                this.showInlineMessage(e.message || 'Login failed');
            } finally {
                this.isLoading = false;
            }
        },

        async handleRegister() {
            if (!this.registerForm.firstName.trim()) {
                this.showInlineMessage('First name is required');
                return;
            }
            if (!this.registerForm.lastName.trim()) {
                this.showInlineMessage('Last name is required');
                return;
            }
            if (!this.registerForm.email.trim()) {
                this.showInlineMessage('Email is required');
                return;
            }
            if (!this.registerForm.username.trim()) {
                this.showInlineMessage('Username is required');
                return;
            }
            if (this.registerForm.password.length < 6) {
                this.showInlineMessage('Password must be at least 6 characters');
                return;
            }

            this.isLoading = true;
            try {
                await this.apiRequest('/api/auth/register', { 
                    method: 'POST',
                    body: JSON.stringify(this.registerForm)
                });

                this.authMode = 'login';
                this.loginForm.username = this.registerForm.username;
                this.showInlineMessage('Account created successfully! Please login.');
                
                this.registerForm = {
                    username: '',
                    password: '',
                    firstName: '',
                    lastName: '',
                    email: ''
                };
            } catch (error) {
                this.showInlineMessage('Registration failed: ' + error.message);
            } finally {
                this.isLoading = false;
            }
        },

        async handleLogout() {
            const logoutButtons = document.querySelectorAll('button');
            let logoutButton = null;
            logoutButtons.forEach(btn => {
                if (btn.textContent.includes('Logout')) {
                    logoutButton = btn;
                }
            });

            if (logoutButton) {
                const rect = logoutButton.getBoundingClientRect();
                this.logoutButtonPosition = `top: ${rect.top}px; left: ${rect.left}px;`;
                this.showLogoutAnimation = true;

                setTimeout(() => {
                    this.showLogoutAnimation = false;
                    this.performLogoutCleanup();
                }, 1000);
            } else {
                this.performLogoutCleanup();
            }
        },

        performLogoutCleanup() {
            this.showOutro = true;
            setTimeout(() => {
                this.isAuthenticated = false;
                this.currentUser = '';
                this.userFullName = '';
                this.userEmail = '';
                this.userProfileImage = '';
                this.authToken = null;
                this.userId = null;
                localStorage.removeItem('jwt'); 
                this.authMode = 'login';
                this.showOutro = false;
                this.sessions = [];
                this.tasks = [];
                this.subjects = [];

                if (this.socket) {
                    this.socket.disconnect();
                    this.socket = null;
                }
            }, 2000);
        },

        async handleChangeCredentials() {
            try {
                await this.apiRequest('/api/auth/update-credentials', { 
                    method: 'PUT',
                    body: JSON.stringify(this.credentialsForm)
                });
                
                this.showChangeCredentials = false;
                this.credentialsForm = { newUsername: '', currentPassword: '', newPassword: '' };
                this.showInlineMessage('Credentials updated successfully!');
            } catch (error) {
                this.showInlineMessage('Update failed: ' + error.message);
            }
        },

        async handleForgotPassword() {
            try {
                await this.apiRequest('/api/auth/reset-password', {
                    method: 'POST',
                    body: JSON.stringify(this.forgotForm)
                });
                
                this.showInlineMessage('Password reset successfully! Please login.');
                this.authMode = 'login';
                this.loginForm.username = this.forgotForm.username;
                this.forgotForm = { username: '', email: '', newPassword: '' };
            } catch (error) {
                this.showInlineMessage('Password reset failed: ' + error.message);
            }
        },

        setTimerMode(mode) {
            if (this.timerRunning) return;

            this.timerMode = mode;
            const durations = {
                focus: this.focusDuration * 60,
                shortBreak: this.shortBreakDuration * 60,
                longBreak: this.longBreakDuration * 60,
                custom: this.customMinutes * 60
            };
            this.timeRemaining = durations[mode];
            this.totalTimerDuration = durations[mode];
        },

        applyCustomTime() {
            if (this.customMinutes < 1 || this.customMinutes > 180) {
                this.showInlineMessage('Please enter a duration between 1 and 180 minutes');
                return;
            }
            this.timeRemaining = this.customMinutes * 60;
            this.totalTimerDuration = this.customMinutes * 60;
            this.showInlineMessage(`Custom timer set to ${this.customMinutes} minutes`);
        },

        toggleTimer() {
            if (this.timerRunning) {
                this.pauseTimer();
            } else {
                this.startTimer();
            }
        },

        startTimer() {
            this.timerRunning = true;
            this.warningAlarmPlayed = false;
            this.emitTimerEvent('start-timer', {});
            this.timerInterval = setInterval(() => {
                if (this.timeRemaining > 0) {
                    this.timeRemaining--;

                    if (this.timeRemaining === 50 && this.warningAlarmEnabled && !this.warningAlarmPlayed) {
                        this.playAlarm();
                        this.warningAlarmPlayed = true;
                        this.showInlineMessage('⏰ 50 seconds remaining!');
                    }
                } else {
                    this.completeTimer();
                }
            }, 1000);
        },

        pauseTimer() {
            this.timerRunning = false;
            clearInterval(this.timerInterval);
            this.emitTimerEvent('pause-timer', {});
        },

        resetTimer() {
            this.pauseTimer();
            this.setTimerMode(this.timerMode);
            this.emitTimerEvent('reset-timer', {});
        },

        async completeTimer() {
            this.pauseTimer();
            this.playAlarm();

            if (this.timerMode === 'focus' || this.timerMode === 'custom') {
                this.currentSessionCount++;

                const duration = Math.floor(this.totalTimerDuration / 60);
                const session = {
                    subject: this.currentSubject,
                    task: this.currentTask,
                    duration: duration,
                    timestamp: new Date().toISOString(),
                    time: new Date().toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                    })
                };

                this.sessions.push(session);

                try {
                     await this.apiRequest('/api/sessions', {
                         method: 'POST',
                         body: JSON.stringify(session)
                     });

                     // Check for new achievements
                     await this.apiRequest('/api/achievements/check-progress', {
                         method: 'POST'
                     });
                } catch (e) {
                    console.error("Failed to save session", e);
                }

                const isLongBreak = this.currentSessionCount % this.sessionsUntilLongBreak === 0;
                const nextMode = isLongBreak ? 'longBreak' : 'shortBreak';

                if (this.autoStartBreaks) {
                    setTimeout(() => {
                        this.setTimerMode(nextMode);
                        this.startTimer();
                        this.showInlineMessage(`Auto-starting ${nextMode.replace('Break', ' break')}! ☕`);
                    }, 1000);
                } else {
                    this.showInlineMessage(`${this.timerModeLabel} completed! Time for a ${nextMode.replace('Break', ' break')}? ☕`);
                }
            } else if (this.timerMode === 'shortBreak' || this.timerMode === 'longBreak') {
                if (this.autoStartFocus) {
                    setTimeout(() => {
                        this.setTimerMode('focus');
                        this.startTimer();
                        this.showInlineMessage('Break over! Auto-starting focus session! 🚀');
                    }, 1000);
                } else {
                    this.showInlineMessage(`${this.timerModeLabel} completed! Ready for another focus session? 🚀`);
                }
            }

            if (!this.autoStartBreaks && !this.autoStartFocus) {
                this.resetTimer();
            }
        },

        async addSubject() {
            if (this.newSubject.trim()) {
                const subject = {
                    name: this.newSubject.trim(),
                    id: Date.now() 
                };

                this.subjects.push(subject);
                this.newSubject = '';

                try {
                    const savedSubject = await this.apiRequest('/api/subjects', {
                        method: 'POST',
                        body: JSON.stringify({ name: subject.name })
                    });

                    const index = this.subjects.findIndex(s => s.id === subject.id);
                    if (index !== -1) {
                        this.subjects[index] = savedSubject;
                    }
                } catch (e) {
                    this.showInlineMessage("Error saving subject to server");
                    this.subjects = this.subjects.filter(s => s.id !== subject.id);
                }
            }
        },

        async removeSubject(subject) {
            this.subjects = this.subjects.filter(s => s !== subject);
            if (this.currentSubject === subject) {
                this.currentSubject = '';
            }

            try {
                await this.apiRequest(`/api/subjects/${encodeURIComponent(subject)}`, {
                    method: 'DELETE'
                });
            } catch (e) {
                console.error("Failed to delete subject", e);
            }
        },
        
        async deleteSubject(name) {
            this.subjects = this.subjects.filter(s => s.name !== name && s !== name);

            try {
                await this.apiRequest(`/api/subjects/${encodeURIComponent(name)}`, {
                    method: 'DELETE'
                });
            } catch (e) {
                console.error(e);
            }
        },

        async addTask() {
            if (this.newTask.trim()) {
                const task = {
                    id: Date.now(),
                    text: this.newTask.trim(),
                    completed: false,
                    createdAt: new Date().toISOString()
                };

                this.tasks.push(task);
                this.newTask = '';

                try {
                    const savedTask = await this.apiRequest('/api/tasks', {
                        method: 'POST',
                        body: JSON.stringify({ text: task.text })
                    });

                    const index = this.tasks.findIndex(t => t.id === task.id);
                    if (index !== -1) {
                        this.tasks[index] = savedTask;
                    }
                } catch (e) {
                    this.showInlineMessage("Error saving task to server");
                    this.tasks = this.tasks.filter(t => t.id !== task.id);
                }
            }
        },

        async toggleTask(id) {
            const task = this.tasks.find(t => t._id === id || t.id === id);
            if (task) {
                task.completed = !task.completed;

                try {
                    await this.apiRequest(`/api/tasks/${task._id || task.id}`, {
                        method: 'PUT',
                        body: JSON.stringify({ completed: task.completed })
                    });

                    // Check for new achievements
                    await this.apiRequest('/api/achievements/check-progress', {
                        method: 'POST'
                    });
                } catch(e) {
                     console.error(e);
                }
            }
        },

        async deleteTask(id) {
            const task = this.tasks.find(t => t._id === id || t.id === id);
            if (!task) return;

            this.tasks = this.tasks.filter(t => (t._id || t.id) !== id);

            try {
                await this.apiRequest(`/api/tasks/${task._id || task.id}`, {
                    method: 'DELETE'
                });
            } catch (e) {
                console.error(e);
                this.tasks.push(task);
            }
        },

        async createGoal() {
            if (!this.newGoal.title || !this.newGoal.target || !this.newGoal.deadline) {
                this.showInlineMessage('Please fill all required fields');
                return;
            }

            try {
                const goalData = {
                    ...this.newGoal,
                    title: this.newGoal.title,
                    target: Number(this.newGoal.target),
                    unit: this.newGoal.unit,
                    deadline: this.newGoal.deadline,
                    priority: this.newGoal.priority
                };

                const res = await this.apiRequest('/api/goals', {
                    method: 'POST',
                    body: JSON.stringify(goalData)
                });

                if (res) {
                    this.goals.unshift(res);
                    this.showInlineMessage('Goal set successfully!');
                    this.newGoal = {
                        title: '',
                        type: 'weekly',
                        target: '',
                        unit: 'hours',
                        deadline: '',
                        priority: 'medium'
                    };
                }
            } catch (error) {
                console.error('Failed to create goal', error);
                this.showInlineMessage('Failed to create goal');
            }
        },

        async deleteGoal(id) {
            if (!confirm('Delete this goal?')) return;
            try {
                await this.apiRequest(`/api/goals/${id}`, { method: 'DELETE' });
                this.goals = this.goals.filter(g => g._id !== id);
                this.showInlineMessage('Goal deleted');
            } catch (error) {
                console.error('Failed to delete goal', error);
            }
        },

        async clearCompletedTasks() {
            this.tasks = this.tasks.filter(t => !t.completed);
        },

        async loadUserData() {
            try {
                const subjectsData = await this.apiRequest('/api/subjects');
                this.subjects = subjectsData || [];

                const tasksData = await this.apiRequest('/api/tasks');
                this.tasks = tasksData || [];

                const sessionsData = await this.apiRequest('/api/sessions');
                this.sessions = sessionsData || [];

                const goalsData = await this.apiRequest('/api/goals');
                this.goals = goalsData || [];

                const achievementsData = await this.apiRequest('/api/achievements');
                this.achievements = achievementsData || [];

                // Public blogs
                try {
                    const blogsRes = await fetch(`${this.API_BASE_URL}/api/blogs`);
                    if (blogsRes.ok) {
                        const fetchedBlogs = await blogsRes.json();
                        // Only merge if we have fetched blogs, otherwise keep the defaults
                        if (fetchedBlogs && fetchedBlogs.length > 0) {
                            // Avoid duplicates if defaults are already there (simple check)
                            const currentIds = new Set(this.blogsPublic.map(b => b._id));
                            const uniqueFetched = fetchedBlogs.filter(b => !currentIds.has(b._id));
                            this.blogsPublic = [...this.blogsPublic, ...uniqueFetched];
                        }
                    }
                } catch (e) {
                    console.warn('Failed to load blogs', e);
                }
            } catch (error) {
                console.error("Failed to load user data", error);
            }
        },

        async syncData() {
            if (!this.isAuthenticated || !this.isOnline) return;

            try {
                this.showNotification('Syncing data...', 'info');
                await this.loadUserData();
                this.lastSyncTime = new Date().toISOString();
                this.showNotification('Data synced successfully!', 'success');
            } catch (error) {
                console.error('Sync failed:', error);
                this.showNotification('Sync failed. Please check your connection.', 'error');
            }
        },

        async saveUserData() {
            const data = {
                subjects: this.subjects,
                sessions: this.sessions,
                tasks: this.tasks
            };
            
            try {
                await this.apiRequest('/api/user/data', {
                    method: 'PUT',
                    body: JSON.stringify(data)
                });
                this.showNotification('Data saved successfully!', 'success');
            } catch (error) {
                console.error("Save failed", error);
                this.showNotification('Failed to save data', 'error');
            }
        },

        async clearAllData() {
            const messageDiv = document.createElement('div');
            messageDiv.innerHTML = `
                <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(0,0,0,0.95); padding: 30px; border-radius: 20px; z-index: 10000; max-width: 400px;">
                    <p style="color: white; margin-bottom: 20px; font-size: 16px;">Are you sure you want to clear all your data? This cannot be undone.</p>
                    <div style="display: flex; gap: 10px;">
                        <button id="confirmClear" style="flex: 1; padding: 12px; background: #ef4444; color: white; border: none; border-radius: 10px; font-weight: 600;">Yes, Clear All</button>
                        <button id="cancelClear" style="flex: 1; padding: 12px; background: #6b7280; color: white; border: none; border-radius: 10px; font-weight: 600;">Cancel</button>
                    </div>
                </div>
            `;
            document.body.appendChild(messageDiv);

            document.getElementById('confirmClear').onclick = async () => {
                try {
                     await this.apiRequest('/api/user/data', {
                        method: 'DELETE'
                     });
                     
                    this.subjects = [];
                    this.sessions = [];
                    this.tasks = [];
                    this.showInlineMessage('All data cleared successfully');
                } catch(e) {
                    this.showInlineMessage('Failed to clear data');
                }
                messageDiv.remove();
            };

            document.getElementById('cancelClear').onclick = () => {
                messageDiv.remove();
            };
        },

        async playAlarm() {
            try {
                if (!this.audioContext) {
                    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                }
                const ctx = this.audioContext;
                if (ctx.state === 'suspended' && ctx.resume) await ctx.resume().catch(() => { });
                const oscillator = ctx.createOscillator();
                const gain = ctx.createGain();
                oscillator.type = 'sine';
                let freq = 880;
                switch (this.alarmSound) {
                    case 'chime': freq = 660; break;
                    case 'beep': freq = 1200; break;
                    case 'ding': freq = 1000; break;
                    case 'gong': freq = 200; break;
                    default: freq = 880;
                }
                oscillator.frequency.value = freq;
                gain.gain.setValueAtTime(0, ctx.currentTime);
                gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.01);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
                oscillator.connect(gain);
                gain.connect(ctx.destination);
                oscillator.start();
                oscillator.stop(ctx.currentTime + 1);
            } catch (e) {
                console.error('Alarm error', e);
            }
        },

        testAlarm() {
            this.playAlarm();
            this.showInlineMessage('Playing test alarm...');
        },

        toggleWarningAlarm() {
            this.warningAlarmEnabled = !this.warningAlarmEnabled;
            this.saveAlarmSettings();
        },

        saveAlarmSettings() {
            localStorage.setItem(`studyflow_alarm_settings_${this.currentUser}`, JSON.stringify({
                sound: this.alarmSound,
                warning: this.warningAlarmEnabled
            }));
        },

        loadAlarmSettings() {
            const settings = JSON.parse(localStorage.getItem(`studyflow_alarm_settings_${this.currentUser}`) || '{}');
            if (settings.sound) this.alarmSound = settings.sound;
            if (settings.warning !== undefined) this.warningAlarmEnabled = settings.warning;
        },

        showInlineMessage(text) {
            const msg = document.createElement('div');
            msg.className = 'fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-xl shadow-lg z-[9999] flex items-center gap-2';
            msg.innerHTML = `<span>${text}</span>`;
            document.body.appendChild(msg);
            setTimeout(() => {
                msg.style.opacity = '0';
                setTimeout(() => msg.remove(), 300);
            }, 3000);
        },

        reloadApp() {
            window.location.reload();
        },

        scrollToTop() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        },

        changeTheme(themeName) {
            this.currentTheme = themeName;
            document.body.className = `theme-${themeName}`;
            localStorage.setItem(`studyflow_theme_${this.currentUser}`, themeName);
        },

        loadTheme() {
            const savedTheme = localStorage.getItem(`studyflow_theme_${this.currentUser}`);
            if (savedTheme) {
                this.changeTheme(savedTheme);
            }
        },

        async requestNotificationPermission() {
            if ('Notification' in window) {
                const permission = await Notification.requestPermission();
                this.notificationsEnabled = permission === 'granted';
                localStorage.setItem(`studyflow_notifications_${this.currentUser}`, this.notificationsEnabled);
                return permission === 'granted';
            }
            return false;
        },

        loadNotificationSettings() {
            const enabled = localStorage.getItem(`studyflow_notifications_${this.currentUser}`);
            this.notificationsEnabled = enabled === 'true';
            this.studyReminders = localStorage.getItem(`studyflow_study_reminders_${this.currentUser}`) !== 'false';
            this.goalDeadlines = localStorage.getItem(`studyflow_goal_deadlines_${this.currentUser}`) !== 'false';
            this.streakAlerts = localStorage.getItem(`studyflow_streak_alerts_${this.currentUser}`) !== 'false';
            const interval = localStorage.getItem(`studyflow_reminder_interval_${this.currentUser}`);
            this.reminderInterval = interval ? parseInt(interval) : 60;
        },

        saveNotificationSettings() {
            localStorage.setItem(`studyflow_notifications_${this.currentUser}`, this.notificationsEnabled);
            localStorage.setItem(`studyflow_study_reminders_${this.currentUser}`, this.studyReminders);
            localStorage.setItem(`studyflow_goal_deadlines_${this.currentUser}`, this.goalDeadlines);
            localStorage.setItem(`studyflow_streak_alerts_${this.currentUser}`, this.streakAlerts);
            localStorage.setItem(`studyflow_reminder_interval_${this.currentUser}`, this.reminderInterval);
        },

        showNotification(title, body, icon = '/favicon.ico') {
            if (this.notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
                new Notification(title, {
                    body,
                    icon,
                    tag: 'studyflow'
                });
            }
        },

        startStudyReminders() {
            if (this.studyReminders && this.notificationsEnabled) {
                this.stopStudyReminders(); 
                this.reminderTimer = setInterval(() => {
                    if (!this.timerRunning) { 
                        this.showNotification(
                            'Study Reminder',
                            `Time to focus! You've been away for ${this.reminderInterval} minutes.`,
                            '/favicon.ico'
                        );
                    }
                }, this.reminderInterval * 60 * 1000);
            }
        },

        stopStudyReminders() {
            if (this.reminderTimer) {
                clearInterval(this.reminderTimer);
                this.reminderTimer = null;
            }
        },

        checkGoalDeadlines() {
            if (this.goalDeadlines && this.notificationsEnabled) {
                const now = new Date();
                const tomorrow = new Date(now);
                tomorrow.setDate(tomorrow.getDate() + 1);

                if(this.goals && this.goals.length > 0) {
                    this.goals.forEach(goal => {
                        if (!goal.completed) {
                            const deadline = new Date(goal.deadline);
                            if (deadline <= tomorrow && deadline >= now) {
                                this.showNotification(
                                    'Goal Deadline Approaching',
                                    `"${goal.title}" is due ${deadline.toLocaleDateString()}. Current progress: ${goal.current}/${goal.target} ${goal.unit}`,
                                    '/favicon.ico'
                                );
                            }
                        }
                    });
                }
            }
        },

        checkStreakAlerts() {
            if (this.streakAlerts && this.notificationsEnabled) {
                const today = new Date().toDateString();
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = yesterday.toDateString();

                const hasStudiedToday = this.sessions.some(s => new Date(s.timestamp).toDateString() === today);
                const hasStudiedYesterday = this.sessions.some(s => new Date(s.timestamp).toDateString() === yesterdayStr);

                if (!hasStudiedToday && hasStudiedYesterday && this.currentStreak > 0) {
                    this.showNotification(
                        'Streak Alert!',
                        `Don't break your ${this.currentStreak}-day streak! Study today to keep it going.`,
                        '/favicon.ico'
                    );
                }
            }
        },

        startNotificationFeatures() {
            this.startStudyReminders();
            setInterval(() => {
                this.checkGoalDeadlines();
                this.checkStreakAlerts();
            }, 60 * 60 * 1000); 
        },

        loadTimerSettings() {
            const focus = localStorage.getItem(`studyflow_focus_duration_${this.currentUser}`);
            const short = localStorage.getItem(`studyflow_short_break_${this.currentUser}`);
            const long = localStorage.getItem(`studyflow_long_break_${this.currentUser}`);
            const sessions = localStorage.getItem(`studyflow_sessions_long_break_${this.currentUser}`);
            const autoBreaks = localStorage.getItem(`studyflow_auto_breaks_${this.currentUser}`);
            const autoFocus = localStorage.getItem(`studyflow_auto_focus_${this.currentUser}`);

            this.focusDuration = focus ? parseInt(focus) : 25;
            this.shortBreakDuration = short ? parseInt(short) : 5;
            this.longBreakDuration = long ? parseInt(long) : 15;
            this.sessionsUntilLongBreak = sessions ? parseInt(sessions) : 4;
            this.autoStartBreaks = autoBreaks === 'true';
            this.autoStartFocus = autoFocus === 'true';
        },

        saveTimerSettings() {
            localStorage.setItem(`studyflow_focus_duration_${this.currentUser}`, this.focusDuration);
            localStorage.setItem(`studyflow_short_break_${this.currentUser}`, this.shortBreakDuration);
            localStorage.setItem(`studyflow_long_break_${this.currentUser}`, this.longBreakDuration);
            localStorage.setItem(`studyflow_sessions_long_break_${this.currentUser}`, this.sessionsUntilLongBreak);
            localStorage.setItem(`studyflow_auto_breaks_${this.currentUser}`, this.autoStartBreaks);
            localStorage.setItem(`studyflow_auto_focus_${this.currentUser}`, this.autoStartFocus);
        },

        changeQuote() {
            const randomIndex = Math.floor(Math.random() * this.motivationalQuotes.length);
            this.currentQuote = this.motivationalQuotes[randomIndex];
        },

        updateCharts() {
            if (this.updatingCharts) {
                console.log('Already updating charts, skipping');
                return;
            }
            this.updatingCharts = true;
            if (!this.$refs.studyTimeChart || !this.$refs.subjectChart) {
                return;
            }

            if (typeof Chart === 'undefined') {
                return;
            }

            if (this.studyTimeChart) {
                this.studyTimeChart.destroy();
            }
            if (this.subjectChart) {
                this.subjectChart.destroy();
            }

            const now = new Date();
            let startDate, daysToShow, chartTitle;

            if (this.analyticsView === 'daily') {
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()); 
                daysToShow = 1;
                chartTitle = 'Today\'s Focus Time';
            } else if (this.analyticsView === 'weekly') {
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                daysToShow = 7;
                chartTitle = 'Weekly Focus Time';
            } else if (this.analyticsView === 'monthly') {
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                daysToShow = 30;
                chartTitle = 'Monthly Focus Time';
            }

            const filteredSessions = this.sessions.filter(s =>
                new Date(s.timestamp) >= startDate
            );

            const ctx1 = this.$refs.studyTimeChart.getContext('2d');

            const labels = [];
            const data = [];
            const sessionsMap = {};

            filteredSessions.forEach(s => {
                const date = new Date(s.timestamp).toLocaleDateString();
                sessionsMap[date] = (sessionsMap[date] || 0) + s.duration;
            });

            for (let i = daysToShow - 1; i >= 0; i--) {
                const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
                const dateStr = date.toLocaleDateString();
                labels.push(this.analyticsView === 'daily' ? date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : dateStr);
                data.push(sessionsMap[dateStr] || 0);
            }

            try {
                this.studyTimeChart = new Chart(ctx1, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Minutes Focused',
                        data: data,
                        borderColor: '#8b5cf6',
                        backgroundColor: 'rgba(139, 92, 246, 0.1)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        title: {
                            display: true,
                            text: chartTitle,
                            color: '#9ca3af',
                            font: { size: 14 }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: { color: 'rgba(255,255,255,0.1)' },
                            title: {
                                display: true,
                                text: 'Minutes',
                                color: '#9ca3af'
                            }
                        },
                        x: {
                            grid: { display: false },
                            title: {
                                display: true,
                                text: this.analyticsView === 'daily' ? 'Time' : 'Date',
                                color: '#9ca3af'
                            }
                        }
                    }
                }
            });
            } catch (e) {
                console.error('Error creating study time chart:', e);
            }

            const ctx2 = this.$refs.subjectChart.getContext('2d');

            const subjectStats = {};
            filteredSessions.forEach(s => {
                const subject = s.subject || 'Unspecified';
                if (!subjectStats[subject]) {
                    subjectStats[subject] = { time: 0, sessions: 0 };
                }
                subjectStats[subject].time += s.duration;
                subjectStats[subject].sessions += 1;
            });

            const subjectLabels = Object.keys(subjectStats);
            const subjectData = subjectLabels.map(s => subjectStats[s].time);

            try {
                this.subjectChart = new Chart(ctx2, {
                type: 'doughnut',
                data: {
                    labels: subjectLabels.length ? subjectLabels : ['No Data'],
                    datasets: [{
                        data: subjectData.length ? subjectData : [1],
                        backgroundColor: ['#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'right',
                            labels: { color: '#9ca3af' }
                        },
                        title: {
                            display: true,
                            text: 'Subject Distribution',
                            color: '#9ca3af',
                            font: { size: 14 }
                        }
                    }
                }
            });
            } catch (e) {
                console.error('Error creating subject chart:', e);
            }
            this.updatingCharts = false;
        },

        handleProfileImageUpload(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.userProfileImage = e.target.result;
                    this.showInlineMessage('Profile image updated locally!');
                };
                reader.readAsDataURL(file);
            }
        },

        checkPasswordStrength() {
            this.passwordStrength = this.calculateStrength(this.registerForm.password);
        },
        checkNewPasswordStrength() {
            this.newPasswordStrength = this.calculateStrength(this.credentialsForm.newPassword);
        },
        checkForgotPasswordStrength() {
            this.forgotPasswordStrength = this.calculateStrength(this.forgotForm.newPassword);
        },
        calculateStrength(pass) {
            if (!pass) return 0;
            let score = 0;
            if (pass.length > 6) score += 20;
            if (pass.length > 10) score += 20;
            if (/[A-Z]/.test(pass)) score += 20;
            if (/[0-9]/.test(pass)) score += 20;
            if (/[^A-Za-z0-9]/.test(pass)) score += 20;
            return score;
        },

        // --- UPDATED MUSIC FUNCTIONS ---

        loadMusicSettings() {
            const savedPlaylists = localStorage.getItem(`studyflow_playlists_${this.currentUser}`);
            if (savedPlaylists) {
                this.musicPlaylists = JSON.parse(savedPlaylists);
            }
            
            // Replaced Default Playlists with Working CDN Links (Pixabay)
            if (this.musicPlaylists.length === 0 || this.musicPlaylists[0].name === 'Free Ambient Music') {
                this.musicPlaylists = [
                    {
                        id: 'default_1',
                        name: 'Lofi & Chill (Demo)',
                        tracks: [
                            {
                                id: 1,
                                name: 'Chill Lofi Beat',
                                url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3'
                            },
                            {
                                id: 2,
                                name: 'Rain & Piano',
                                url: 'https://cdn.pixabay.com/download/audio/2022/03/09/audio_c8c8a73467.mp3'
                            },
                            {
                                id: 3,
                                name: 'Soft Ambient',
                                url: 'https://cdn.pixabay.com/download/audio/2022/02/07/audio_6593f64996.mp3'
                            }
                        ]
                    }
                ];
                localStorage.setItem(`studyflow_playlists_${this.currentUser}`, JSON.stringify(this.musicPlaylists));
            }
        },

        toggleMusic() {
            const audio = this.$refs.audioPlayer;
            if (!this.currentTrack || !audio) return;

            if (this.isPlaying) {
                audio.pause();
                this.isPlaying = false;
            } else {
                audio.play().then(() => {
                    this.isPlaying = true;
                }).catch(e => {
                    console.error(e);
                    this.isPlaying = false;
                });
            }
        },

        stopMusic() {
            this.$refs.audioPlayer.pause();
            this.$refs.audioPlayer.currentTime = 0;
            this.isPlaying = false;
        },

        updateVolume() {
            if (this.$refs.audioPlayer) {
                this.$refs.audioPlayer.volume = this.musicVolume / 100;
            }
        },

        playTrack(playlist, track) {
            this.currentPlaylist = playlist;
            this.currentTrack = track;
            
            this.$nextTick(async () => {
                const audio = this.$refs.audioPlayer;
                if(!audio) return;

                audio.src = track.url;
                audio.load(); // Force load source
                audio.volume = this.musicVolume / 100;

                try {
                    await audio.play();
                    this.isPlaying = true;
                } catch (e) {
                    console.error("Playback failed:", e);
                    // Check if link is blob (local file expired) or network error
                    if (track.url.startsWith('blob:')) {
                        this.showInlineMessage("⚠️ Local file expired. Please re-upload.");
                    } else {
                        this.showInlineMessage("⚠️ Error playing track. Link might be broken.");
                    }
                    this.isPlaying = false;
                }
            });
        },

        onTrackEnded() {
            this.isPlaying = false;
            if (this.currentPlaylist) {
                const idx = this.currentPlaylist.tracks.findIndex(t => t.id === this.currentTrack.id);
                if (idx > -1 && idx < this.currentPlaylist.tracks.length - 1) {
                    this.playTrack(this.currentPlaylist, this.currentPlaylist.tracks[idx + 1]);
                }
            }
        },

        handleAudioError(e) {
            console.error("Audio Error:", e);
            this.isPlaying = false;
            
            if (this.currentTrack && this.currentTrack.url.startsWith('blob:')) {
                // Silent fail for blob expiration often better handled in play catch block
            } else {
               this.showInlineMessage("🚫 Cannot play audio source."); 
            }
        },

        addTrackToPlaylist() {
            if (!this.newTrackName || !this.newTrackUrl) return;
            if (!this.editingPlaylist.tracks) this.editingPlaylist.tracks = [];
            this.editingPlaylist.tracks.push({
                id: Date.now(),
                name: this.newTrackName,
                url: this.newTrackUrl
            });
            this.newTrackName = '';
            this.newTrackUrl = '';
        },

        addFilesToPlaylist(event) {
            const files = event.target.files;
            if (!this.editingPlaylist.tracks) this.editingPlaylist.tracks = [];
            
            let addedCount = 0;
            for (let file of files) {
                if (file.type.startsWith('audio/')) {
                    this.editingPlaylist.tracks.push({
                        id: Date.now() + Math.random(),
                        name: file.name,
                        url: URL.createObjectURL(file),
                        isLocal: true 
                    });
                    addedCount++;
                }
            }
            
            if (addedCount > 0) {
                this.showInlineMessage("⚠️ Note: Local files will disappear if you refresh the page.");
            }
            event.target.value = '';
        },

        removeTrackFromPlaylist(index) {
            this.editingPlaylist.tracks.splice(index, 1);
        },
        savePlaylist() {
            if (!this.editingPlaylist.name) return;

            if (!this.editingPlaylist.id) {
                this.editingPlaylist.id = Date.now();
                this.musicPlaylists.push(this.editingPlaylist);
            } else {
                const idx = this.musicPlaylists.findIndex(p => p.id === this.editingPlaylist.id);
                if (idx !== -1) this.musicPlaylists[idx] = this.editingPlaylist;
            }

            localStorage.setItem(`studyflow_playlists_${this.currentUser}`, JSON.stringify(this.musicPlaylists));
            this.editingPlaylist = null;
            this.showInlineMessage('Playlist saved!');
        },
        deletePlaylist(id) {
            this.musicPlaylists = this.musicPlaylists.filter(p => p.id !== id);
            localStorage.setItem(`studyflow_playlists_${this.currentUser}`, JSON.stringify(this.musicPlaylists));
            if (this.currentPlaylist && this.currentPlaylist.id === id) {
                this.stopMusic();
                this.currentPlaylist = null;
                this.currentTrack = null;
            }
        },

        // --- NEW YOUTUBE API INTEGRATION ---

        loadYouTubeAPI() {
            if (!window.YT) {
                const tag = document.createElement('script');
                tag.src = "https://www.youtube.com/iframe_api";
                const firstScriptTag = document.getElementsByTagName('script')[0];
                firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
            }
        },

        loadYouTubeVideo(videoId, title = 'YouTube Video') {
            this.youtubeVideoId = videoId;
            this.showYouTubePlayer = true;
            this.showInlineMessage(`🎵 Loading: ${title}...`);
            
            let retryCount = 0;
            const maxRetries = 10; 

            const checkYT = () => {
                if (typeof YT === 'undefined' || typeof YT.Player === 'undefined') {
                    retryCount++;
                    if (retryCount > maxRetries) {
                        this.showInlineMessage("YouTube API failed to load. Please refresh.");
                        return;
                    }
                    setTimeout(checkYT, 1000);
                    return;
                }

                this.$nextTick(() => {
                    if (this.youtubePlayer) {
                        this.youtubePlayer.loadVideoById(videoId);
                    } else {
                        this.youtubePlayer = new YT.Player('youtube-player', {
                            height: '100%',
                            width: '100%',
                            videoId: videoId,
                            playerVars: {
                                'playsinline': 1,
                                'origin': window.location.origin
                            },
                            events: {
                                'onReady': (event) => {
                                    event.target.playVideo();
                                    event.target.setVolume(this.youtubeVolume);
                                },
                                'onStateChange': (event) => {
                                    this.isPlaying = (event.data === YT.PlayerState.PLAYING);
                                }
                            }
                        });
                    }
                });
            };

            checkYT(); 
        },

        playYouTubeVideo(video) {
            this.loadYouTubeVideo(video.id, video.title);
        },

        openYouTubeLink(videoId) {
            // FIX: Now uses internal player instead of window.open
            this.loadYouTubeVideo(videoId, 'YouTube Video');
        },

        // ADDED: Option to open in new tab manually if needed
        openInYouTube() {
            if (this.youtubeVideoId) {
                window.open(`https://www.youtube.com/watch?v=${this.youtubeVideoId}`, '_blank');
            }
        },

        loadCustomYouTubeUrl() {
            if (!this.youtubeUrl.trim()) {
                this.showInlineMessage('Please enter a YouTube URL');
                return;
            }

            const videoId = this.extractYouTubeId(this.youtubeUrl);
            if (videoId) {
                // FIX: Now uses internal player
                this.loadYouTubeVideo(videoId, 'Custom Video'); 
                this.youtubeUrl = '';
            } else {
                this.showInlineMessage('Invalid YouTube URL. Please check the link.');
            }
        },

        stopYouTubeVideo() {
            this.showYouTubePlayer = false;
            this.youtubeVideoId = '';
            if (this.youtubePlayer) {
                this.youtubePlayer.stopVideo();
                this.youtubePlayer.destroy();
                this.youtubePlayer = null;
            }
            this.isPlaying = false;
        },

        playYouTubeManually() {
            if (this.youtubePlayer && typeof this.youtubePlayer.playVideo === 'function') {
                if (this.isPlaying) {
                    this.youtubePlayer.pauseVideo();
                } else {
                    this.youtubePlayer.playVideo();
                }
            }
        },

        toggleYouTubeMute() {
            if (this.youtubePlayer && typeof this.youtubePlayer.isMuted === 'function') {
                if (this.youtubePlayer.isMuted()) {
                    this.youtubePlayer.unMute();
                    this.youtubeMuted = false;
                } else {
                    this.youtubePlayer.mute();
                    this.youtubeMuted = true;
                }
            }
        },

        setYouTubeVolume() {
            if (this.youtubePlayer && typeof this.youtubePlayer.setVolume === 'function') {
                this.youtubePlayer.setVolume(this.youtubeVolume);
            }
        },

        setYouTubeSpeed() {
            if (this.youtubePlayer && typeof this.youtubePlayer.setPlaybackRate === 'function') {
                this.youtubePlayer.setPlaybackRate(parseFloat(this.youtubeSpeed));
            }
        },

        extractYouTubeId(url) {
            const patterns = [
                /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/,
                /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^"&?\/\s]{11})/
            ];

            for (const pattern of patterns) {
                const match = url.match(pattern);
                if (match && match[1]) {
                    return match[1];
                }
            }
            return null;
        },

        formatDate(dateString) {
            const date = new Date(dateString);
            const now = new Date();
            const diffTime = Math.abs(now - date);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                return 'today';
            } else if (diffDays === 2) {
                return 'yesterday';
            } else if (diffDays <= 7) {
                return `${diffDays - 1} days ago`;
            } else {
                return date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
                });
            }
        },

        getSubjectCardClass(index) {
            const colors = [
                'hover:shadow-purple-500/25',
                'hover:shadow-blue-500/25',
                'hover:shadow-green-500/25',
                'hover:shadow-pink-500/25',
                'hover:shadow-orange-500/25',
                'hover:shadow-indigo-500/25'
            ];
            return colors[index % colors.length];
        },

        getSubjectIconClass(index) {
            const gradients = [
                'bg-gradient-to-br from-purple-500 to-pink-500',
                'bg-gradient-to-br from-blue-500 to-cyan-500',
                'bg-gradient-to-br from-green-500 to-emerald-500',
                'bg-gradient-to-br from-pink-500 to-rose-500',
                'bg-gradient-to-br from-orange-500 to-yellow-500',
                'bg-gradient-to-br from-indigo-500 to-purple-500'
            ];
            return gradients[index % gradients.length];
        },

        // Data Export Methods (PDF Support)
        async exportUserData() {
            try {
                // Check if jsPDF is loaded
                if (!window.jspdf) {
                    this.showInlineMessage('PDF Library not loaded. Please refresh.');
                    return;
                }

                const { jsPDF } = window.jspdf;
                const doc = new jsPDF();
                
                // 1. Header
                doc.setFontSize(22);
                doc.setTextColor(139, 92, 246); // Purple
                doc.text(`StudyFlow Report`, 20, 20);
                
                // 2. User Info
                doc.setFontSize(12);
                doc.setTextColor(0, 0, 0);
                doc.text(`User: ${this.currentUser}`, 20, 30);
                doc.text(`Email: ${this.userEmail}`, 20, 36);
                doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 42);
                
                // Divider
                doc.setDrawColor(200, 200, 200);
                doc.line(20, 48, 190, 48);

                // 3. Statistics
                doc.setFontSize(16);
                doc.setTextColor(100, 100, 100);
                doc.text('Statistics', 20, 60);
                
                doc.setFontSize(12);
                doc.setTextColor(0, 0, 0);
                doc.text(`• Total Focus Time: ${Math.floor(this.totalFocusTime / 60)}h ${this.totalFocusTime % 60}m`, 25, 70);
                doc.text(`• Total Sessions: ${this.totalSessions}`, 25, 78);
                doc.text(`• Completed Tasks: ${this.completedTasksCount}`, 25, 86);
                doc.text(`• Current Streak: ${this.currentStreak} days`, 25, 94);
                
                // 4. Pending Tasks List
                doc.setFontSize(16);
                doc.setTextColor(100, 100, 100);
                doc.text('Pending Tasks', 20, 110);
                
                let y = 120;
                const pendingTasks = this.tasks.filter(t => !t.completed);
                
                if (pendingTasks.length > 0) {
                    doc.setFontSize(11);
                    doc.setTextColor(0, 0, 0);
                    
                    pendingTasks.forEach((task, index) => {
                        // Add new page if list is too long
                        if (y > 270) { 
                            doc.addPage(); 
                            y = 20; 
                        }
                        doc.text(`${index + 1}. ${task.text}`, 25, y);
                        y += 8;
                    });
                } else {
                    doc.setFontSize(11);
                    doc.setTextColor(150, 150, 150);
                    doc.text('No pending tasks! Great job!', 25, y);
                }

                // 5. Save PDF
                doc.save(`StudyFlow_Report_${this.currentUser}.pdf`);
                this.showInlineMessage('Report downloaded as PDF! 📄');
                
            } catch (error) {
                console.error("PDF Export Error:", error);
                this.showInlineMessage('Failed to generate PDF');
            }
        },

        // এই ফাংশনটি যোগ করুন (Raw JSON ব্যাকআপ ডাউনলোড করার জন্য)
        downloadBackup() {
            const data = {
                user: {
                    username: this.currentUser,
                    email: this.userEmail,
                    firstName: this.userFullName.split(' ')[0],
                    lastName: this.userFullName.split(' ').slice(1).join(' ')
                },
                subjects: this.subjects,
                tasks: this.tasks,
                sessions: this.sessions,
                goals: this.goals,
                achievements: this.achievements,
                musicPlaylists: this.musicPlaylists,
                settings: {
                    theme: this.currentTheme,
                    timer: {
                        focus: this.focusDuration,
                        short: this.shortBreakDuration,
                        long: this.longBreakDuration
                    }
                },
                exportDate: new Date().toISOString()
            };

            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
            const downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", `studyflow-backup-${this.currentUser}-${new Date().toISOString().split('T')[0]}.json`);
            document.body.appendChild(downloadAnchorNode);
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
            
            this.showInlineMessage('Backup file downloaded successfully! 💾');
        },

        handleImportFile(event) {
            this.importFile = event.target.files[0];
        },

        async importUserData() {
            if (!this.importFile) {
                this.showInlineMessage('Please select a file to import');
                return;
            }

            try {
                const text = await this.importFile.text();
                const data = JSON.parse(text);

                // Import subjects
                if (data.subjects) {
                    for (const subject of data.subjects) {
                        await this.apiRequest('/api/subjects', { method: 'POST', body: JSON.stringify(subject) });
                    }
                }

                // Import tasks
                if (data.tasks) {
                    for (const task of data.tasks) {
                        await this.apiRequest('/api/tasks', { method: 'POST', body: JSON.stringify(task) });
                    }
                }

                // Import goals
                if (data.goals) {
                    for (const goal of data.goals) {
                        await this.apiRequest('/api/goals', { method: 'POST', body: JSON.stringify(goal) });
                    }
                }

                // Reload data
                await this.loadUserData();

                this.showInlineMessage('Data imported successfully!');
                this.importFile = null;
            } catch (error) {
                this.showInlineMessage('Failed to import data. Please check the file format.');
            }
        },

        // ==================== ADMIN PANEL METHODS ====================
        
        async checkAdminStatus() {
            try {
                const response = await fetch(`${this.API_BASE_URL}/api/auth/me`, {
                    headers: {
                        'Authorization': `Bearer ${this.authToken}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (response.ok) {
                    const userData = await response.json();
                    this.isAdmin = userData.role === 'admin';
                }
            } catch (error) {
                console.error('Admin check failed:', error);
            }
        },

        async refreshAdminData() {
            if (this.adminLoading) return;
            
            this.adminLoading = true;
            try {
                await this.loadAdminData();
                this.showInlineMessage('Admin data refreshed successfully!');
            } catch (error) {
                console.error('Failed to refresh admin data:', error);
                this.showInlineMessage('Failed to refresh admin data. Please try again.');
            } finally {
                this.adminLoading = false;
            }
        },

        async loadAdminData() {
            if (!this.isAdmin) return;

            try {
                // Load all users
                const usersResponse = await fetch(`${this.API_BASE_URL}/api/admin/users`, {
                    headers: {
                        'Authorization': `Bearer ${this.authToken}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (usersResponse.ok) {
                    this.allUsers = await usersResponse.json();
                    this.adminStats.totalUsers = this.allUsers.length;
                }

                // Load blogs
                const blogsResponse = await fetch(`${this.API_BASE_URL}/api/blogs`);
                if (blogsResponse.ok) {
                    this.adminBlogs = await blogsResponse.json();
                    this.adminStats.totalBlogs = this.adminBlogs.length;
                }

                // Load songs
                const songsResponse = await fetch(`${this.API_BASE_URL}/api/songs`);
                if (songsResponse.ok) {
                    this.adminSongs = await songsResponse.json();
                    this.adminStats.totalSongs = this.adminSongs.length;
                }

                // Load analytics summary
                const analyticsRes = await fetch(`${this.API_BASE_URL}/api/admin/analytics`, {
                    headers: {
                        'Authorization': `Bearer ${this.authToken}`,
                        'Content-Type': 'application/json'
                    }
                });
                if (analyticsRes.ok) {
                    const analytics = await analyticsRes.json();
                    this.adminStats.totalUsers = analytics.totalUsers;
                    this.adminStats.totalSessions = analytics.totalSessions;
                    this.adminSessionsSummary = analytics;
                    this.adminStats.totalMinutes = analytics.totalMinutes || 0;
                    this.renderAdminSessionsChart();
                }
            } catch (error) {
                console.error('Failed to load admin data:', error);
            }
        },

        async deleteUser(userId) {
            if (!confirm('Are you sure you want to delete this user?')) return;

            try {
                const response = await fetch(`${this.API_BASE_URL}/api/admin/users/${userId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${this.authToken}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    this.showInlineMessage('User deleted successfully');
                    await this.loadAdminData();
                } else {
                    this.showInlineMessage('Failed to delete user');
                }
            } catch (error) {
                console.error('Delete user failed:', error);
                this.showInlineMessage('Error deleting user');
            }
        },

        async adminChangePassword(id) {
            const newPassword = prompt("Enter new password for this user (min 6 chars):");
            if (!newPassword) return;
            if (newPassword.length < 6) {
                alert("Password must be at least 6 characters.");
                return;
            }

            try {
                const response = await fetch(`${this.API_BASE_URL}/api/admin/users/${id}/password`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${this.authToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ newPassword })
                });

                if (response.ok) {
                    this.showInlineMessage('Password changed successfully');
                } else {
                    this.showInlineMessage('Failed to change password');
                }
            } catch (error) {
                console.error('Change password failed:', error);
                this.showInlineMessage('Error changing password');
            }
        },

        async createBlog() {
            if (!this.newBlog.title || !this.newBlog.content) {
                this.showInlineMessage('Please fill all blog fields');
                return;
            }

            try {
                const response = await fetch(`${this.API_BASE_URL}/api/blogs`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.authToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(this.newBlog)
                });

                if (response.ok) {
                    this.showInlineMessage('Blog created successfully');
                    this.newBlog = { title: '', content: '', category: 'Study Related', image: '' };
                    await this.loadAdminData();
                } else {
                    this.showInlineMessage('Failed to create blog');
                }
            } catch (error) {
                console.error('Create blog failed:', error);
                this.showInlineMessage('Error creating blog');
            }
        },

        async deleteBlog(blogId) {
            if (!confirm('Are you sure you want to delete this blog?')) return;

            try {
                const response = await fetch(`${this.API_BASE_URL}/api/blogs/${blogId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${this.authToken}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    this.showInlineMessage('Blog deleted successfully');
                    await this.loadAdminData();
                } else {
                    this.showInlineMessage('Failed to delete blog');
                }
            } catch (error) {
                console.error('Delete blog failed:', error);
                this.showInlineMessage('Error deleting blog');
            }
        },

        async createSong() {
            if (!this.newSong.title || !this.newSong.url) {
                this.showInlineMessage('Please fill all song fields');
                return;
            }

            try {
                const response = await fetch(`${this.API_BASE_URL}/api/songs`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.authToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(this.newSong)
                });

                if (response.ok) {
                    this.showInlineMessage('Song added successfully');
                    this.newSong = { title: '', url: '', category: 'focus' };
                    await this.loadAdminData();
                } else {
                    this.showInlineMessage('Failed to add song');
                }
            } catch (error) {
                console.error('Add song failed:', error);
                this.showInlineMessage('Error adding song');
            }
        },

        async deleteSong(songId) {
            if (!confirm('Are you sure you want to delete this song?')) return;

            try {
                const response = await fetch(`${this.API_BASE_URL}/api/songs/${songId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${this.authToken}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    this.showInlineMessage('Song deleted successfully');
                    await this.loadAdminData();
                } else {
                    this.showInlineMessage('Failed to delete song');
                }
            } catch (error) {
                console.error('Delete song failed:', error);
                this.showInlineMessage('Error deleting song');
            }
        },

        async askAI() {
            const prompt = this.aiPrompt.trim();
            if (!prompt) return;

            // Add user message to chat history immediately
            this.aiChatHistory.push({ role: 'user', content: prompt });
            this.aiPrompt = ''; // Clear input
            this.aiLoading = true;
            
            // Scroll to bottom
            this.$nextTick(() => {
                const container = document.getElementById('ai-chat-container');
                if (container) container.scrollTop = container.scrollHeight;
            });

            try {
                // Use apiRequest helper to ensuring auth headers are sent
                const data = await this.apiRequest('/api/ai/ask', {
                    method: 'POST',
                    body: JSON.stringify({ prompt })
                });

                if (data && data.answer) {
                    this.aiChatHistory.push({ role: 'assistant', content: data.answer });
                } else {
                    this.aiChatHistory.push({ role: 'assistant', content: "I'm having trouble connecting to my brain right now." });
                }
            } catch (error) {
                console.error('AI request failed', error);
                this.aiChatHistory.push({ role: 'assistant', content: "Sorry, something went wrong. Please try again." });
            } finally {
                this.aiLoading = false;
                this.$nextTick(() => {
                    const container = document.getElementById('ai-chat-container');
                    if (container) container.scrollTop = container.scrollHeight;
                });
            }
        },

        renderAdminSessionsChart() {
            try {
                const ctx = this.$refs.adminSessionsChart?.getContext('2d');
                if (!ctx) return;

                if (this.adminSessionsChart) {
                    this.adminSessionsChart.destroy();
                }

                const labels = this.adminSessionsSummary.perUser.map(u => u.username);
                const data = this.adminSessionsSummary.perUser.map(u => u.totalMinutes);

                this.adminSessionsChart = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: labels.length ? labels : ['No data'],
                        datasets: [{
                            label: 'Total Minutes',
                            data: data.length ? data : [0],
                            backgroundColor: '#8b5cf6'
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: {
                            y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.1)' } },
                            x: { grid: { display: false } }
                        }
                    }
                });
            } catch (error) {
                console.error('Failed to render admin chart', error);
            }
        },

        async openAdminPanel() {
            if (!this.isAdmin) {
                this.showInlineMessage('You do not have admin privileges');
                return;
            }
            await this.loadAdminData();
            this.showAdminPanel = true;
        }
    }
}).mount('#app');

// Register service worker for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('ServiceWorker registered successfully');
            })
            .catch((error) => {
                console.log('ServiceWorker registration failed:', error);
            });
    });
}

/* jshint ignore:end */