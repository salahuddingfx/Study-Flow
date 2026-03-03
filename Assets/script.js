/* eslint-disable */
/* Vue.js Application - StudyFlow Frontend */
/* @vue/component */
/* jshint ignore:start */

// Detect Node.js environment (User sanity check)
if (typeof window === 'undefined') {
    console.error("❌ ERROR: This script file ('script.js') is the Frontend logic.");
    console.error("   It runs inside your BROWSER (Chrome/Edge), linked from index.html.");
    console.error("   Do NOT run it with 'node script.js' in the terminal.");
    process.exit(1);
}

// Critical Dependency Check
if (typeof Vue === 'undefined') {
    document.body.innerHTML = '<div style="color:white;text-align:center;padding:50px;"><h1>Error: Vue.js failed to load.</h1><p>Please check your internet connection and try again.</p></div>';
    throw new Error("Vue is not defined. Script aborted.");
}

const { createApp } = Vue;

const legacyVueApp = createApp({
    data() {
        return {
            // API Configuration (auto switch: local vs production)
            API_BASE_URL: (location.hostname === 'localhost' || location.hostname === '127.0.0.1')
                ? 'http://localhost:5000'
                : (location.hostname.endsWith('netlify.app') ? '' : 'https://study-flow-nfym.onrender.com'),

            // Language Support
            currentLang: localStorage.getItem('studyflow_lang') || 'en',
            translations: (typeof window.translations !== 'undefined') ? window.translations : {},

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
            showAchievementModal: false,
            showLanguageModal: false,
            // Notes System
            notes: [],
            currentNote: null,
            searchNotes: '',
            showNoteEditor: false,
            isZenMode: false,
            // PWA Install
            deferredPrompt: null,
            showInstallModal: false,

            // Auth
            isAuthenticated: false,
            authMode: 'login',
            showPassword: false,
            showCurrentPassword: false,
            showNewPassword: false,
            authToken: null,
            resetToken: null,
            resetPasswordForm: {
                newPassword: '',
                confirmPassword: ''
            },

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
                email: ''
            },
            forgotPasswordLoading: false,
            resetPasswordLoading: false,
            currentUser: '',
            userFullName: '',
            userEmail: '',
            userProfileImage: '',
            userId: null,
            exportData: null,
            importFile: null,
            // Streaks & summaries
            streakCurrent: 0,
            streakLongest: 0,
            dailySummaryEnabled: true,
            weeklySummaryEnabled: true,
            monthlySummaryEnabled: true,
            // Calendar & public profile
            calendarUrl: '',
            publicProfileEnabled: false,
            publicProfileUrl: '',
            // Offline task sync
            isOnline: true,
            taskSyncQueue: [],
            tasksCacheKey: 'studyflow_tasks_cache',
            taskQueueKey: 'studyflow_task_queue',
            // Leaderboard
            leaderboardPeriod: 'weekly',
            leaderboardResults: [],
            achievementLeaderboard: [],
            // Quiz Stats
            quizStats: {
                totalQuizzes: 0,
                completedQuizzes: 0,
                averageScore: 0,
                highestScore: 0,
                quizzes: []
            },

            // Credentials Change
            credentialsForm: {
                newUsername: '',
                currentPassword: '',
                newPassword: ''
            },

            // Achievement System
            userLevel: {
                level: 1,
                levelName: 'Bronze',
                points: 0,
                totalUnlocked: 0
            },
            totalAchievements: 38,
            levelTiers: [
                { level: 1, name: 'Bronze', color: '#CD7F32', range: '0-249' },
                { level: 2, name: 'Silver', color: '#C0C0C0', range: '250-749' },
                { level: 3, name: 'Gold', color: '#FFD700', range: '750-1499' },
                { level: 4, name: 'Platinum', color: '#E5E4E2', range: '1500-2999' },
                { level: 5, name: 'Diamond', color: '#B9F2FF', range: '3000+' }
            ],

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
            leaderboardChart: null,
            updatingCharts: false,
            analyticsTimeouts: [],
            chartKey: 0,
            chartJsReady: false,
            analyticsHasSessions: false,
            analyticsHasSubjects: false,
            
            // Note debounce
            noteUpdateTimeout: null,

            // Online/Offline status
            isOnline: navigator.onLine,
            lastSyncTime: null,

            // Admin Panel
            showAdminPanel: false,
            isAdmin: false,
            adminActiveTab: 'users',
            adminUserSearch: '',
            adminUserRoleFilter: 'all',
            adminUserPage: 1,
            adminUserPageSize: 10,
            adminUsersTotal: 0,
            adminSelectedUserIds: [],
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
            adminLoaded: {
                analytics: false,
                users: false,
                blogs: false,
                songs: false,
                audit: false
            },
            adminBlogs: [],
            adminSongs: [],
            adminAuditLogs: [],
            adminAuditPage: 1,
            adminAuditPageSize: 10,
            adminAuditTotal: 0,
            adminAuditLoading: false,
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
            newGoal: {
                title: '',
                type: 'weekly',
                target: '',
                unit: 'hours',
                deadline: '',
                priority: 'medium'
            },

            // AI Quiz
            quizTopic: '',
            quizQuestions: [],
            quizLoading: false,
            currentQuizId: null,
            quizCompleted: false,

            // Calendar
            calendarInstance: null,

            // Study Rooms
            activeRooms: null,
            currentRoom: '',
            roomCounts: {},

            // AI Assistant
            aiPrompt: '',
            aiReply: '',
            showAIChat: false, // Controls visibility of the floating AI chat
            aiLoading: false,
            aiChatHistory: JSON.parse(localStorage.getItem('sf_ai_chat') || '[]'), // Persisted chat history
            aiSuggestions: [
                { icon: '📝', label: 'Add a task for me', text: 'Add task: review my notes today' },
                { icon: '🎯', label: 'Set a study goal', text: 'Set a goal to study 2 hours today' },
                { icon: '🧠', label: 'What should I study?', text: 'Based on my subjects and goals, what should I study right now?' },
                { icon: '⏰', label: 'Best study schedule', text: 'Create an optimal study schedule for today based on my tasks' },
                { icon: '📚', label: 'Add a subject', text: 'Add subject: ' },
                { icon: '🔥', label: 'Productivity tips', text: 'Give me 3 tips to double my study productivity today' },
            ],
            isTouchDevice: false, // New touch detection
            prefersReducedMotion: false,
            effectsEnabled: true,
        }; 
    }, 

    async mounted() {
        // Initialize Notes Manager
        if (typeof NotesManager !== 'undefined') {
            this.notesManager = new NotesManager(this.API_BASE_URL);
            const token = localStorage.getItem('jwt');
            if (token) {
                this.notesManager.setToken(token);
                await this.notesManager.loadNotes();
            }
            this.notes = this.notesManager.notes;
            
            // Re-sync view if we are on a note permalink
            if (window.location.hash.includes('notes/')) {
                this.$nextTick(() => {
                    this.syncViewFromHash();
                });
            }
        }

        // PWA Install Prompt Listener
        window.addEventListener('beforeinstallprompt', (e) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later.
            this.deferredPrompt = e;
            // Update UI notify the user they can install the PWA
            this.showInstallModal = true;
        });

        // Attempt to detect Chart.js early
        if (typeof Chart !== 'undefined') {
            this.chartJsReady = true;
            Chart.defaults.animation = false;
        }

        document.body.className = 'theme-dark';
        
        // Check for reset token in URL FIRST - if found, skip auth
        const hasResetToken = this.checkResetToken();
        if (hasResetToken) {
            // Skip auth check completely, show reset form immediately
            this.loadTheme();
            this.loadNotificationSettings();
            this.loadTimerSettings();
            this.loadMusicSettings();
            return; // Exit mounted() early
        }
        
        // Detect Touch Device
        this.isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
        this.isOnline = navigator.onLine;

        window.addEventListener('online', this.handleOnline);
        window.addEventListener('offline', this.handleOffline);

        this.initOfflineTasks();
        this.prefersReducedMotion = window.matchMedia
            ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
            : false;
        const isSmallScreen = window.innerWidth < 768;
        this.effectsEnabled = !(this.isTouchDevice || this.prefersReducedMotion || isSmallScreen);

        if (this.effectsEnabled) {
            this.createParticles();
        }

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
        // Trailing cursor with particle effects - OPTIMIZED FOR SPEED
        let lastMoveTime = 0;
        const MOVE_THROTTLE = 16; // Lower frequency for performance
        let ringX = window.innerWidth / 2;
        let ringY = window.innerHeight / 2;
        
        this._mouseMoveHandler = (e) => {
            if (!this.effectsEnabled) return;
            
            const now = Date.now();
            if (now - lastMoveTime < MOVE_THROTTLE) return;
            lastMoveTime = now;

            this.cursorX = e.clientX;
            this.cursorY = e.clientY;
            
            // Dot moves immediately
            if (this.$refs.cursorDot) {
                this.$refs.cursorDot.style.left = e.clientX + 'px';
                this.$refs.cursorDot.style.top = e.clientY + 'px';
            }
            
            // Ring follows faster now
            requestAnimationFrame(() => {
                const easing = 0.25; // Faster easing (was 0.15)
                ringX += (e.clientX - ringX) * easing;
                ringY += (e.clientY - ringY) * easing;
                
                if (this.$refs.cursor) {
                    this.$refs.cursor.style.left = ringX + 'px';
                    this.$refs.cursor.style.top = ringY + 'px';
                }
            });
            
            // Create particle trail effect randomly
            if (Math.random() > 0.85 && this.$refs.particleContainer) {
                const particle = document.createElement('div');
                particle.style.position = 'fixed';
                particle.style.left = e.clientX + 'px';
                particle.style.top = e.clientY + 'px';
                particle.style.width = Math.random() * 8 + 3 + 'px';
                particle.style.height = particle.style.width;
                particle.style.borderRadius = '50%';
                particle.style.background = ['#8b5cf6', '#f43f5e', '#667eea', '#ec4899'][Math.floor(Math.random() * 4)];
                particle.style.pointerEvents = 'none';
                particle.style.zIndex = '9998';
                particle.style.opacity = '0.8';
                particle.style.boxShadow = `0 0 ${Math.random() * 12 + 6}px currentColor`;
                
                this.$refs.particleContainer.appendChild(particle);
                
                // Animate particle away FASTER
                let pX = e.clientX, pY = e.clientY;
                let vX = (Math.random() - 0.5) * 6; // More velocity
                let vY = (Math.random() - 0.5) * 6 - 1.5;
                let life = 1;
                
                const animate = () => {
                    life -= 0.025; // Faster fade
                    if (life <= 0) {
                        particle.remove();
                        return;
                    }
                    
                    pX += vX;
                    pY += vY;
                    vY += 0.2; // More gravity
                    
                    particle.style.left = pX + 'px';
                    particle.style.top = pY + 'px';
                    particle.style.opacity = life * 0.8;
                    
                    requestAnimationFrame(animate);
                };
                animate();
            }
        };

        // --- Hover Effect Logic ---
        this._hoverChecker = (e) => {
            const target = e.target;
            // Only trigger on actual interactive elements, not glass backgrounds
            const isHoverable = target.closest('a') || 
                                target.closest('button:not([disabled])') || 
                                target.closest('input') || 
                                target.closest('select') ||
                                target.closest('textarea') ||
                                target.closest('.btn-primary') ||
                                target.closest('.btn-secondary') ||
                                target.closest('[role="button"]') ||
                                target.closest('.clickable') ||
                                target.closest('.nav-item') ||
                                target.closest('.card-hover');

            if (isHoverable) {
                if (this.$refs.cursor) this.$refs.cursor.classList.add('hover');
                if (this.$refs.cursorDot) this.$refs.cursorDot.classList.add('hover');
            } else {
                if (this.$refs.cursor) this.$refs.cursor.classList.remove('hover');
                if (this.$refs.cursorDot) this.$refs.cursorDot.classList.remove('hover');
            }
        };
        
        if (this.effectsEnabled) {
            document.addEventListener('mouseover', this._hoverChecker);
            document.addEventListener('mousemove', this._mouseMoveHandler);
        }

        this.updateDateTime(); 
        this.dateTimeInterval = setInterval(this.updateDateTime, 1000);

        this._scrollHandler = () => {
            const containerScrollTop = this.$refs.mainScrollContainer ? this.$refs.mainScrollContainer.scrollTop : 0;
            const pageScrollTop = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
            // console.log('ScrollTop:', pageScrollTop, containerScrollTop); // Debug
            this.showScrollTop = Math.max(containerScrollTop, pageScrollTop) > 100; // Lower threshold to 100
        };
        document.addEventListener('scroll', this._scrollHandler, true);
        
        // Also listen to scroll on mainScrollContainer (important!)
        this.$nextTick(() => {
            if (this.$refs.mainScrollContainer) {
                this.$refs.mainScrollContainer.addEventListener('scroll', this._scrollHandler);
            }
        });
        
        this._scrollHandler();

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
        this._hashChangeHandler = () => this.syncViewFromHash();
        window.addEventListener('hashchange', this._hashChangeHandler);

        this.isOnline = navigator.onLine;
        this.syncViewFromHash();
        this.syncHashFromView();

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
            await wait(300); 
            this.loadingText = "Setting up guest environment...";
            this.currentUser = 'guest';
            await wait(200); 
            
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

            this.currentUser = user?.username || '';
            this.userEmail = user?.email || '';
            this.userFullName = (user?.firstName && user?.lastName) 
                ? `${user.firstName} ${user.lastName}`.trim()
                : (user?.firstName || user?.lastName || user?.username || 'User');
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
            await wait(200); 

        } catch (err) {
            console.error('Auth restore failed', err);
            clearTimeout(slowServerTimeout);
            this.loadingText = "Session expired. Redirecting...";
            await wait(200); 
            localStorage.removeItem('jwt');
            this.loadTheme();
            this.loadNotificationSettings();
            this.loadTimerSettings();
        } finally {
            this.showLoader = false;
        }
    },

    beforeUnmount() {
        this.clearAnalyticsTimers();
        this.destroyAnalyticsCharts();
        if (this.calendarInstance) {
            try {
                this.calendarInstance.destroy();
            } catch (e) {
                console.warn('Calendar destroy warning:', e);
            }
            this.calendarInstance = null;
        }
        if (this._mouseMoveHandler) document.removeEventListener('mousemove', this._mouseMoveHandler);
        if (this._scrollHandler) {
            document.removeEventListener('scroll', this._scrollHandler, true);
            if (this.$refs.mainScrollContainer) {
                this.$refs.mainScrollContainer.removeEventListener('scroll', this._scrollHandler);
            }
        }
        if (this._onlineHandler) window.removeEventListener('online', this._onlineHandler);
        if (this._offlineHandler) window.removeEventListener('offline', this._offlineHandler);
        if (this._hashChangeHandler) window.removeEventListener('hashchange', this._hashChangeHandler);
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

        levelProgressPercent() {
            if (this.userLevel.level >= 5) return 100;
            const points = this.userLevel.points;
            const nextLevelThreshold = [250, 750, 1500, 3000][this.userLevel.level - 1];
            return Math.min((points / nextLevelThreshold) * 100, 100);
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

        adminUsersTotalPages() {
            return Math.max(Math.ceil(this.adminUsersTotal / this.adminUserPageSize), 1);
        },

        adminAuditTotalPages() {
            return Math.max(Math.ceil(this.adminAuditTotal / this.adminAuditPageSize), 1);
        },

        adminAllVisibleSelected() {
            return this.allUsers.length > 0 && this.allUsers.every(u => this.adminSelectedUserIds.includes(u._id));
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

        periodInsight() {
            const now = new Date();
            let periodDays = 1;

            if (this.analyticsView === 'weekly') {
                periodDays = 7;
            } else if (this.analyticsView === 'monthly') {
                periodDays = 30;
            }

            const periodStart = new Date(now.getTime() - (periodDays - 1) * 24 * 60 * 60 * 1000);

            const periodSessions = this.sessions.filter((session) => {
                const sessionTime = new Date(session.timestamp);
                return sessionTime >= periodStart && sessionTime <= now;
            });

            if (!periodSessions.length) {
                return {
                    label: 'No sessions in this period',
                    details: 'Start a focus session to unlock insights'
                };
            }

            const minutesPerDay = new Map();
            let totalMinutes = 0;

            periodSessions.forEach((session) => {
                const rawDate = new Date(session.timestamp);
                const dayKeyDate = new Date(rawDate.getFullYear(), rawDate.getMonth(), rawDate.getDate());
                const dayKey = dayKeyDate.getTime();
                const sessionMinutes = Number(session.duration) || 0;
                totalMinutes += sessionMinutes;
                minutesPerDay.set(dayKey, (minutesPerDay.get(dayKey) || 0) + sessionMinutes);
            });

            let bestDayKey = null;
            let bestDayMinutes = 0;

            minutesPerDay.forEach((minutes, dayKey) => {
                if (minutes > bestDayMinutes) {
                    bestDayMinutes = minutes;
                    bestDayKey = dayKey;
                }
            });

            const avgPerDay = Math.round(totalMinutes / periodDays);
            const formattedBestDay = bestDayKey
                ? new Date(Number(bestDayKey)).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
                : 'N/A';

            return {
                label: `${avgPerDay} min/day average`,
                details: `Best day: ${formattedBestDay} (${bestDayMinutes} min)`
            };
        },

        todayStats() {
            const now = new Date();
            const today = now.toDateString();
            
            // Get today's sessions
            const todaySessions = this.sessions.filter(s =>
                new Date(s.timestamp).toDateString() === today
            );
            
            // Calculate today's minutes
            const minutes = todaySessions.reduce((sum, s) => sum + s.duration, 0);
            const sessions = todaySessions.length;
            
            // Get today's completed tasks
            const tasksCompleted = this.tasks.filter(t => {
                if (!t.completed || !t.completedAt) return false;
                return new Date(t.completedAt).toDateString() === today;
            }).length;
            
            // Get current streak (from StreakTracker module)
            const streak = (window.StreakTracker?.streakData?.currentStreak) || 0;
            
            return {
                minutes,
                sessions,
                tasksCompleted,
                streak
            };
        },
    },

    watch: {
        currentView(newView, oldView) {
            this.syncHashFromView();
            if (newView !== oldView) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
            if (newView === 'analytics') {
                this.clearAnalyticsTimers();
                this.$nextTick(() => {
                    this.$nextTick(() => {
                        const t1 = setTimeout(() => {
                            this.updateCharts();
                            this.loadLeaderboard();
                            this.loadAchievementStats();
                            this.loadAchievementLeaderboard();
                            if (this.isAuthenticated && this.authToken) {
                                this.loadQuizStats();
                            }
                        }, 100);
                        const t2 = setTimeout(() => this.updateCharts(), 800);
                        const t3 = setTimeout(() => this.updateCharts(), 1500);
                        this.analyticsTimeouts.push(t1, t2, t3);
                    });
                });
            } else if (newView === 'calendar') {
                this.$nextTick(() => {
                    setTimeout(() => {
                        this.initCalendar();
                    }, 200);
                });
            } else {
                this.clearAnalyticsTimers();
                this.destroyAnalyticsCharts();
            }
        },

        analyticsView() {
            this.$nextTick(() => {
                this.updateCharts();
                this.$nextTick(() => {
                    const t = setTimeout(() => {
                        this.updateCharts();
                    }, 150);
                    this.analyticsTimeouts.push(t);
                });
            });
        },

        leaderboardPeriod() {
            this.loadLeaderboard();
        },

        adminActiveTab(newTab) {
            this.ensureAdminTabData(newTab);
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
        },

        tasks: {
            handler() {
                if (this.currentView === 'calendar') {
                    this.$nextTick(() => {
                        this.initCalendar();
                    });
                }
            },
            deep: true
        }
    },

    methods: {
        // --- Note Management Methods ---
        async createNote(title = '', content = '') {
            if (this.notesManager) {
                const note = await this.notesManager.createNote(title, content);
                this.notes = this.notesManager.notes;
                
                // Select the note and open the editor
                this.currentNote = note;
                this.showNoteEditor = true;
                
                // Focus on title input if on desktop (optional)
                this.$nextTick(() => {
                    const titleInput = document.querySelector('input[placeholder="Note Title"]');
                    if (titleInput) titleInput.focus();
                });

                return note;
            }
        },

        async updateNote() {
            if (this.currentNote && this.notesManager) {
                // Debounce the update to prevent server overload
                if (this.noteUpdateTimeout) clearTimeout(this.noteUpdateTimeout);

                this.noteUpdateTimeout = setTimeout(async () => {
                    await this.notesManager.updateNote(this.currentNote.id || this.currentNote._id, {
                        title: this.currentNote.title,
                        content: this.currentNote.content,
                        subject: this.currentNote.subject
                    });
                    // Only update list references, don't overwrite currentNote to avoid cursor jumping
                    this.notes = [...this.notesManager.notes];
                }, 1000); 
            }
        },

        async deleteNote(id) {
            // Guard against undefined ID to prevent API errors
            if (!id || id === 'undefined') {
                console.warn('Cannot delete note: Invalid ID');
                return;
            }
            if (this.notesManager) {
                if (confirm('Are you sure you want to delete this note?')) {
                    await this.notesManager.deleteNote(id);
                    this.notes = this.notesManager.notes;
                    if (this.currentNote && (this.currentNote.id === id || this.currentNote._id === id)) {
                        this.currentNote = null;
                        this.showNoteEditor = false;
                    }
                }
            }
        },

        selectNote(note, updateHash = true) {
            this.currentNote = { ...note }; // Clone to avoid direct mutation
            this.showNoteEditor = true;
            if (updateHash) this.syncHashFromView();
        },

        resetNoteEditor() {
            this.currentNote = null;
            this.showNoteEditor = false;
            this.isZenMode = false;
            this.syncHashFromView();
        },
        
        async installApp() {
            if (this.deferredPrompt) {
                // Show the install prompt
                this.deferredPrompt.prompt();
                // Wait for the user to respond to the prompt
                const { outcome } = await this.deferredPrompt.userChoice;
                console.log(`User response to the install prompt: ${outcome}`);
                // release the deferred prompt
                this.deferredPrompt = null;
                // close modal
                this.showInstallModal = false;
            }
        },
        getAllowedViews() {
            return ['home', 'timer', 'tasks', 'calendar', 'quiz', 'goals', 'analytics', 'blog', 'notes'];
        },

        syncViewFromHash() {
            let hashView = (window.location.hash || '').replace('#', '').trim();
            if (!hashView) return;
            
            // Handle params like notes/123
            const parts = hashView.split('/');
            const mainView = parts[0];
            const param = parts[1];

            if (!this.getAllowedViews().includes(mainView)) return;
            
            if (this.currentView !== mainView) {
                this.currentView = mainView;
            }

            // Specific logic for notes permalinks
            if (mainView === 'notes') {
                if (param) {
                    const found = this.notes.find(n => (n.id === param || n._id === param));
                    if (found) {
                        this.selectNote(found, false); // false = don't update hash again
                    }
                } else {
                    this.showNoteEditor = false;
                    this.currentNote = null;
                }
            }
        },

        syncHashFromView() {
            const view = this.currentView || 'home';
            if (!this.getAllowedViews().includes(view)) return;
            
            let nextHash = `#${view}`;
            
            // Append ID for notes
            if (view === 'notes' && this.currentNote && (this.currentNote.id || this.currentNote._id)) {
                nextHash = `#notes/${this.currentNote.id || this.currentNote._id}`;
            }

            if (window.location.hash !== nextHash) {
                history.replaceState(null, '', `${window.location.pathname}${window.location.search}${nextHash}`);
            }
        },

        safeDestroyChart(chartRefName) {
            try {
                const chart = this[chartRefName];
                if (!chart) return;
                if (typeof chart.stop === 'function') chart.stop();
                if (typeof chart.destroy === 'function') chart.destroy();
            } catch (e) {
                console.warn(`Chart destroy warning for ${chartRefName}:`, e);
            } finally {
                this[chartRefName] = null;
            }
        },

        clearAnalyticsTimers() {
            if (Array.isArray(this.analyticsTimeouts)) {
                this.analyticsTimeouts.forEach((id) => clearTimeout(id));
            }
            this.analyticsTimeouts = [];
        },

        destroyAnalyticsCharts() {
            try {
                this.safeDestroyChart('studyTimeChart');
                this.safeDestroyChart('subjectChart');
                this.safeDestroyChart('leaderboardChart');
            } catch (e) {
                console.warn('Chart destroy warning:', e);
            }
            this.updatingCharts = false;
        },

        // Translation Helper
        t(key) {
            if (this.translations && this.translations[this.currentLang] && this.translations[this.currentLang][key]) {
                return this.translations[this.currentLang][key];
            }
            return (this.translations['en'] && this.translations['en'][key]) || key;
        },

        setLanguage(lang) {
            this.currentLang = lang;
            localStorage.setItem('studyflow_lang', this.currentLang);
            this.showLanguageModal = false;
        },

        toggleLanguage() {
            this.currentLang = this.currentLang === 'en' ? 'bn' : 'en';
            localStorage.setItem('studyflow_lang', this.currentLang);
            // Optional: force update if needed, but Vue reactivity should handle it
        },

        async loadAchievementStats() {
            try {
                if (!this.authToken) return;
                const response = await fetch(`${this.API_BASE_URL}/api/achievements/stats`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${this.authToken}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const stats = await response.json();
                    if (stats.userLevel) {
                        this.userLevel = {
                            level: stats.userLevel.level,
                            levelName: stats.userLevel.levelName,
                            points: stats.userLevel.points,
                            totalUnlocked: stats.userLevel.totalUnlocked
                        };
                    }
                }
            } catch (error) {
                console.log('Achievement stats load error:', error);
            }
        },

        createParticles() {
            // Disable on small screens
            if (window.innerWidth < 768 || !this.effectsEnabled) return;

            const container = this.$refs.particleContainer;
            if (!container) return;

            // আগের কোনো কণা থাকলে পরিষ্কার করা
            container.innerHTML = '';
            
            // কতগুলো কণা বা particle চাও (এখানে ৫০টি দেওয়া হলো)
            const particleCount = window.innerWidth < 1024 ? 16 : 30;

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

            const isLocal = ['localhost', '127.0.0.1'].includes(location.hostname);
            const altBase5001 = `http://${location.hostname}:5001`;
            const altBase5000 = `http://${location.hostname}:5000`;

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
                // Only retry on network failures, not HTTP errors (4xx/5xx)
                const isNetworkError = error instanceof TypeError;
                if (isLocal && isNetworkError && this.API_BASE_URL.includes(':5000')) {
                    try {
                        const retryResponse = await fetch(`${altBase5001}${endpoint}`, {
                            ...options,
                            headers
                        });

                        const retryData = await retryResponse.json();

                        if (!retryResponse.ok) {
                            throw new Error(retryData.message || 'API request failed');
                        }

                        this.API_BASE_URL = altBase5001;
                        return retryData;
                    } catch (retryError) {
                        console.error('API Error:', retryError);
                        throw retryError;
                    }
                }

                if (isLocal && this.API_BASE_URL.includes(':5001')) {
                    try {
                        const retryResponse = await fetch(`${altBase5000}${endpoint}`, {
                            ...options,
                            headers
                        });

                        const retryData = await retryResponse.json();

                        if (!retryResponse.ok) {
                            throw new Error(retryData.message || 'API request failed');
                        }

                        this.API_BASE_URL = altBase5000;
                        return retryData;
                    } catch (retryError) {
                        console.error('API Error:', retryError);
                        throw retryError;
                    }
                }

                console.error('API Error:', error);
                throw error;
            }
        },

        showInlineMessage(message) {
            // Create a temporary message element
            const messageDiv = document.createElement('div');
            messageDiv.textContent = message;
            messageDiv.style.cssText = `
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 12px 24px;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 500;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                z-index: 10000;
                max-width: 90%;
                animation: slideDown 0.3s ease-out;
            `;
            document.body.appendChild(messageDiv);

            // Add animation
            const style = document.createElement('style');
            style.textContent = `
                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateX(-50%) translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(-50%) translateY(0);
                    }
                }
            `;
            if (!document.querySelector('style[data-toast]')) {
                style.setAttribute('data-toast', 'true');
                document.head.appendChild(style);
            }

            // Remove after 3 seconds
            setTimeout(() => {
                messageDiv.style.animation = 'slideDown 0.3s ease-out reverse';
                setTimeout(() => messageDiv.remove(), 300);
            }, 3000);
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

            this.socket.on('achievements-updated', (data) => {
                if (data.achievements) {
                    this.achievements = data.achievements;
                }
                if (data.userStats) {
                    this.userLevel = {
                        level: data.userStats.achievementLevel,
                        levelName: data.userStats.achievementLevelName,
                        points: data.userStats.achievementPoints,
                        totalUnlocked: data.userStats.totalAchievementsUnlocked
                    };
                }
            });

            this.socket.on('leaderboard-updated', (leaderboard) => {
                this.achievementLeaderboard = leaderboard;
            });

            this.socket.on('update-room-counts', (counts) => {
                this.roomCounts = counts;
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
                if (this.notesManager) {
                    this.notesManager.setToken(data.token);
                    await this.notesManager.loadNotes();
                    this.notes = this.notesManager.notes;
                }

                this.currentUser = data.user?.username || data.username || '';
                this.userEmail = data.user?.email || data.email || '';
                const firstName = data.user?.firstName || data.firstName || '';
                const lastName = data.user?.lastName || data.lastName || '';
                this.userFullName = (firstName && lastName)
                    ? `${firstName} ${lastName}`.trim()
                    : (this.currentUser || 'User');
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
                if (this.notesManager) {
                    this.notesManager.setToken(null);
                    this.notes = [];
                }
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
                if (!this.credentialsForm.currentPassword) {
                    this.showInlineMessage('Current password is required');
                    return;
                }
                if (!this.credentialsForm.newUsername && !this.credentialsForm.newPassword) {
                    this.showInlineMessage('Enter a new username or new password');
                    return;
                }

                const response = await this.apiRequest('/api/auth/update-credentials', { 
                    method: 'PUT',
                    body: JSON.stringify(this.credentialsForm)
                });
                
                if (response?.user?.username) {
                    this.currentUser = response.user.username;
                }
                this.showChangeCredentials = false;
                this.credentialsForm = { newUsername: '', currentPassword: '', newPassword: '' };
                this.showInlineMessage('Credentials updated successfully!');
            } catch (error) {
                this.showInlineMessage('Update failed: ' + error.message);
            }
        },

        /* --- 1. Calendar Integration --- */
        initCalendar() {
            const calendarEl = document.getElementById('calendar');
            if (!calendarEl) return;

            // Recreate safely on view re-entry (v-if destroys DOM)
            if (this.calendarInstance) {
                try {
                    this.calendarInstance.destroy();
                } catch (e) {
                    console.warn('Calendar destroy warning:', e);
                }
                this.calendarInstance = null;
            }

            // Map tasks to events
            const events = this.tasks.map(task => ({
                title: task.title || task.text || 'Untitled Task',
                start: task.deadline || task.createdAt || new Date(),
                allDay: true,
                backgroundColor: task.completed ? '#10b981' : '#8b5cf6',
                borderColor: task.completed ? '#10b981' : '#8b5cf6'
            }));

            this.calendarInstance = new FullCalendar.Calendar(calendarEl, {
                initialView: 'dayGridMonth',
                headerToolbar: {
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek'
                },
                themeSystem: 'standard',
                height: 600,
                events: events,
                eventClick: (info) => {
                    alert('Task: ' + info.event.title);
                }
            });

            this.calendarInstance.render();
        },

        /* --- 2. Real-Time Rooms --- */
        joinRoom() {
            if (this.socket) {
                // Allows joining empty room (leaving rooms)
                this.socket.emit('join-room', this.currentRoom);
            }
        },

        /* --- 3. AI Quiz --- */
        async generateQuiz() {
            if (!this.quizTopic) return;
            this.quizLoading = true;
            this.quizQuestions = [];
            this.currentQuizId = null;
            this.quizCompleted = false;

            try {
                const res = await this.apiRequest('/api/ai/quiz', {
                    method: 'POST',
                    body: JSON.stringify({ topic: this.quizTopic })
                });

                if (res.questions && res.questions.length > 0) {
                    this.quizQuestions = res.questions.map(q => ({
                        ...q,
                        userAnswer: undefined
                    }));
                    this.currentQuizId = res.quizId; // Store quiz ID for later submission
                } else {
                    this.showInlineMessage('Could not generate quiz. Try a different topic.');
                }
            } catch (err) {
                this.showInlineMessage('Quiz error: ' + err.message);
            } finally {
                this.quizLoading = false;
            }
        },

        checkAnswer(qIndex, optIndex) {
            if (this.quizQuestions[qIndex].userAnswer !== undefined) return;
            this.quizQuestions[qIndex].userAnswer = optIndex;
            
            // Check if all questions are answered
            const allAnswered = this.quizQuestions.every(q => q.userAnswer !== undefined);
            if (allAnswered && !this.quizCompleted) {
                this.submitQuiz();
            }
        },

        async submitQuiz() {
            try {
                // Calculate score
                const correctAnswers = this.quizQuestions.filter((q, i) => 
                    q.userAnswer === q.correctAnswer
                ).length;
                const score = Math.round((correctAnswers / this.quizQuestions.length) * 100);
                
                // Update quiz in database
                if (this.currentQuizId) {
                    await this.apiRequest(`/api/ai/quiz/${this.currentQuizId}`, {
                        method: 'PUT',
                        body: JSON.stringify({
                            score: score,
                            completed: true
                        })
                    });
                    
                    this.quizCompleted = true;
                    
                    // Check for new achievements
                    await this.apiRequest('/api/achievements/check-progress', {
                        method: 'POST'
                    });
                    
                    // Reload quiz stats
                    await this.loadQuizStats();
                    
                    // Emit to Socket.io for real-time updates
                    if (this.socket && this.userId) {
                        this.socket.emit('check-achievements', this.userId);
                    }
                    
                    // Show message
                    const percentage = score;
                    let message = '';
                    if (percentage === 100) {
                        message = `🎉 Perfect score! +50 points earned!`;
                    } else if (percentage >= 80) {
                        message = `✨ Great job! ${percentage}% - Keep it up!`;
                    } else if (percentage >= 60) {
                        message = `👍 Good effort! ${percentage}% - You can do better!`;
                    } else {
                        message = `📚 ${percentage}% - Keep practicing!`;
                    }
                    this.showInlineMessage(message);
                }
            } catch (e) {
                console.error('Quiz submission error:', e);
            }
        },

        resetQuiz() {
            this.quizTopic = '';
            this.quizQuestions = [];
            this.currentQuizId = null;
            this.quizCompleted = false;
        },

        checkResetToken() {
            const urlParams = new URLSearchParams(window.location.search);
            const token = urlParams.get('token');
            if (token) {
                this.resetToken = token;
                this.authMode = 'reset';
                this.isAuthenticated = false;
                this.showLoader = false; // Hide loader immediately
                console.log('✓ Reset token detected:', token.substring(0, 10) + '...');
                return true; // Signal that reset mode is active
            }
            return false;
        },

        async handleForgotPassword() {
            // Validation
            if (!this.forgotForm.username || !this.forgotForm.email) {
                this.showInlineMessage('Please enter both username and email');
                return;
            }

            this.forgotPasswordLoading = true;
            try {
                const response = await this.apiRequest('/api/user/forgot-password', {
                    method: 'POST',
                    body: JSON.stringify({
                        username: this.forgotForm.username,
                        email: this.forgotForm.email
                    })
                });
                
                this.showInlineMessage('✅ Password reset link sent to your email! Check your inbox.');
                this.authMode = 'login';
                this.loginForm.username = this.forgotForm.username;
                this.forgotForm = { username: '', email: '' };
            } catch (error) {
                console.error('Forgot password error:', error);
                this.showInlineMessage('❌ ' + (error.message || 'Password reset request failed'));
            } finally {
                this.forgotPasswordLoading = false;
            }
        },

        async handleResetPassword() {
            // Validation
            if (!this.resetPasswordForm.newPassword || !this.resetPasswordForm.confirmPassword) {
                this.showInlineMessage('Please fill in all fields');
                return;
            }

            if (this.resetPasswordForm.newPassword !== this.resetPasswordForm.confirmPassword) {
                this.showInlineMessage('❌ Passwords do not match!');
                return;
            }
            
            if (this.resetPasswordForm.newPassword.length < 6) {
                this.showInlineMessage('❌ Password must be at least 6 characters!');
                return;
            }

            this.resetPasswordLoading = true;
            try {
                const response = await this.apiRequest(`/api/user/reset-password/${this.resetToken}`, {
                    method: 'PUT',
                    body: JSON.stringify({
                        newPassword: this.resetPasswordForm.newPassword
                    })
                });

                this.showInlineMessage('✅ Password reset successful! Redirecting to login...');
                
                // Reset form
                this.resetPasswordForm = { newPassword: '', confirmPassword: '' };
                this.resetToken = null;
                
                // Redirect after 2 seconds
                setTimeout(() => {
                    window.history.replaceState({}, document.title, window.location.pathname);
                    this.authMode = 'login';
                    this.isAuthenticated = false;
                    localStorage.removeItem('jwt');
                }, 2000);
            } catch (error) {
                console.error('Reset password error:', error);
                this.showInlineMessage('❌ ' + (error.message || 'Password reset failed'));
            } finally {
                this.resetPasswordLoading = false;
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

        pauseTimer(options = {}) {
            const { autoSaveIncomplete = true } = options;
            this.timerRunning = false;
            clearInterval(this.timerInterval);
            
            // Auto-save incomplete session if user studied for at least 1 minute
            const elapsedMinutes = (this.totalTimerDuration - this.timeRemaining) / 60;
            if (autoSaveIncomplete && elapsedMinutes >= 1 && this.currentSubject) {
                this.saveIncompleteSession(elapsedMinutes);
            }
            
            this.emitTimerEvent('pause-timer', {});
        },

        resetTimer() {
            this.pauseTimer({ autoSaveIncomplete: false });
            this.setTimerMode(this.timerMode);
            this.emitTimerEvent('reset-timer', {});
        },

        async saveIncompleteSession(elapsedMinutes) {
            try {
                const response = await this.apiRequest('/api/ai/timer-control', {
                    method: 'POST',
                    body: JSON.stringify({
                        command: 'save-incomplete',
                        elapsedMinutes: Math.round(elapsedMinutes * 10) / 10,
                        totalMinutes: this.totalTimerDuration / 60,
                        subject: this.currentSubject
                    })
                });
                
                if (response && response.success) {
                    if (response.session) {
                        this.sessions.unshift(response.session);
                    }

                    this.showInlineMessage(`✅ ${response.message}`);
                    console.log('🎯 Incomplete session saved:', response.sessionId);

                    if (this.currentView === 'analytics') {
                        this.$nextTick(() => this.updateCharts());
                    }

                    try {
                        await this.apiRequest('/api/achievements/check-progress', {
                            method: 'POST'
                        });
                        await this.loadAchievementStats();
                    } catch (e) {
                        console.warn('Achievement refresh after incomplete save failed', e);
                    }
                }
            } catch (error) {
                console.error('Failed to save incomplete session:', error);
            }
        },

        async completeTimer() {
            this.pauseTimer({ autoSaveIncomplete: false });
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
                     
                     // Emit to Socket.io for real-time updates
                     if (this.socket && this.userId) {
                         this.socket.emit('check-achievements', this.userId);
                         this.socket.emit('request-leaderboard');
                     }
                     
                     // Refresh achievement stats
                     await this.loadAchievementStats();
                     
                     // Dispatch event for streak tracker
                     document.dispatchEvent(new CustomEvent('sessionCompleted', {
                         detail: { duration }
                     }));
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
                    title: this.newTask.trim(), // Added title
                    text: this.newTask.trim(),  // Kept text for backward compatibility
                    completed: false,
                    createdAt: new Date().toISOString()
                };

                this.tasks.push(task);
                this.newTask = '';
                this.saveTasksCache();

                if (!this.isOnline) {
                    this.queueTaskOperation({ type: 'create', clientId: task.id, data: task });
                    this.showInlineMessage('Saved offline. Will sync when online.');
                    return;
                }

                try {
                    const savedTask = await this.apiRequest('/api/tasks', {
                        method: 'POST',
                        body: JSON.stringify({ title: task.title }) // Sending title
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
            if (!task) return;
            
            // Store previous state for rollback
            const previousCompleted = task.completed;
            const previousTimestamp = task.completedAt;
            
            try {
                // Optimistically update UI
                task.completed = !task.completed;
                if (task.completed) {
                    task.completedAt = new Date().toISOString();
                } else {
                    delete task.completedAt;
                }
                this.saveTasksCache();

                if (!this.isOnline) {
                    if (task._id) {
                        this.queueTaskOperation({ 
                            type: 'update', 
                            id: task._id, 
                            data: { completed: task.completed } 
                        });
                    } else {
                        this.updateQueuedCreate(task.id, { completed: task.completed });
                    }
                    const message = task.completed ? '✅ Task marked complete' : '⭕ Task marked incomplete';
                    this.showInlineMessage(message + ' (Offline - will sync)');
                    return;
                }

                // Send to server
                const response = await this.apiRequest(`/api/tasks/${task._id || task.id}`, {
                    method: 'PUT',
                    body: JSON.stringify({ completed: task.completed })
                });
                
                // Update with server response
                if (response) {
                    Object.assign(task, response);
                    this.saveTasksCache();
                }

                // Show success message
                const message = task.completed 
                    ? '✅ Task marked as done! +10 points' 
                    : '⭕ Task marked as incomplete';
                this.showInlineMessage(message);

                // Check for new achievements after marking complete
                if (task.completed) {
                    try {
                        await this.apiRequest('/api/achievements/check-progress', {
                            method: 'POST'
                        });
                        
                        // Emit to Socket.io for real-time achievement updates
                        if (this.socket && this.userId) {
                            this.socket.emit('check-achievements', this.userId);
                        }
                    } catch (err) {
                        console.warn('Achievement check failed:', err);
                    }
                }
                
            } catch (error) {
                console.error('Toggle task error:', error);
                
                // Rollback on error
                task.completed = previousCompleted;
                if (previousTimestamp) {
                    task.completedAt = previousTimestamp;
                } else {
                    delete task.completedAt;
                }
                this.saveTasksCache();
                
                this.showInlineMessage('❌ Failed to update task. Rolled back.');
            }
        },

        async deleteTask(id) {
            const task = this.tasks.find(t => t._id === id || t.id === id);
            if (!task) return;

            this.tasks = this.tasks.filter(t => (t._id || t.id) !== id);
            this.saveTasksCache();

            if (!this.isOnline) {
                if (task._id) {
                    this.queueTaskOperation({ type: 'delete', id: task._id });
                } else {
                    this.taskSyncQueue = this.taskSyncQueue.filter(q => !(q.type === 'create' && q.clientId === task.id));
                    localStorage.setItem(this.taskQueueKey, JSON.stringify(this.taskSyncQueue));
                }
                this.showInlineMessage('Saved offline. Will sync when online.');
                return;
            }

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

        async toggleGoalCompletion(id) {
            const goal = this.goals.find(g => g._id === id);
            if (!goal) return;
            
            try {
                const newCurrent = goal.current >= goal.target ? 0 : goal.target;
                
                const response = await this.apiRequest(`/api/goals/${id}`, {
                    method: 'PUT',
                    body: JSON.stringify({ current: newCurrent })
                });
                
                if (response) {
                    Object.assign(goal, response);
                }
                
                const message = newCurrent >= goal.target 
                    ? '🎉 Goal completed! +50 points'
                    : '👍 Goal progress updated';
                this.showInlineMessage(message);
                
                // Check achievements
                await this.apiRequest('/api/achievements/check-progress', { method: 'POST' });
                if (this.socket && this.userId) {
                    this.socket.emit('check-achievements', this.userId);
                }
            } catch (error) {
                console.error('Failed to update goal:', error);
                this.showInlineMessage('❌ Failed to update goal');
            }
        },

        async deleteGoal(id) {
            if (!confirm('Delete this goal?')) return;
            try {
                await this.apiRequest(`/api/goals/${id}`, { method: 'DELETE' });
                this.goals = this.goals.filter(g => g._id !== id);
                this.showInlineMessage('✅ Goal deleted');
            } catch (error) {
                console.error('Failed to delete goal', error);
                this.showInlineMessage('❌ Failed to delete goal');
            }
        },

        async clearCompletedTasks() {
            this.tasks = this.tasks.filter(t => !t.completed);
        },

        async loadUserData() {
            try {
                const endpointDefs = [
                    { key: 'subjects', endpoint: '/api/subjects' },
                    { key: 'tasks', endpoint: '/api/tasks' },
                    { key: 'sessions', endpoint: '/api/sessions' },
                    { key: 'goals', endpoint: '/api/goals' },
                    { key: 'achievements', endpoint: '/api/achievements' }
                ];

                const settled = await Promise.allSettled(
                    endpointDefs.map(def => this.apiRequest(def.endpoint))
                );

                const normalizeArray = (payload, key) => {
                    if (Array.isArray(payload)) return payload;
                    if (payload && Array.isArray(payload[key])) return payload[key];
                    return [];
                };

                endpointDefs.forEach((def, index) => {
                    const result = settled[index];
                    if (result.status === 'fulfilled') {
                        this[def.key] = normalizeArray(result.value, def.key);
                    } else {
                        if (!Array.isArray(this[def.key])) {
                            this[def.key] = [];
                        }
                        console.warn(`Failed to load ${def.key}:`, result.reason);
                    }
                });

                this.saveTasksCache();

                if (this.currentView === 'analytics') {
                    this.$nextTick(() => {
                        this.updateCharts();
                        this.loadLeaderboard();
                        this.loadAchievementLeaderboard();
                        if (this.isAuthenticated && this.authToken) {
                            this.loadQuizStats();
                        }
                    });
                }

                // Emit to Socket.io for real-time sync
                if (this.socket && this.userId) {
                    this.socket.emit('check-achievements', this.userId);
                }

                await this.loadProfileSettings();

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

        initOfflineTasks() {
            try {
                const cachedTasks = JSON.parse(localStorage.getItem(this.tasksCacheKey) || '[]');
                if (!this.isOnline && cachedTasks.length) {
                    this.tasks = cachedTasks;
                }
                const queue = JSON.parse(localStorage.getItem(this.taskQueueKey) || '[]');
                this.taskSyncQueue = queue;
            } catch (e) {
                this.taskSyncQueue = [];
            }
        },

        saveTasksCache() {
            try {
                localStorage.setItem(this.tasksCacheKey, JSON.stringify(this.tasks));
            } catch (e) {}
        },

        queueTaskOperation(op) {
            this.taskSyncQueue.push(op);
            try {
                localStorage.setItem(this.taskQueueKey, JSON.stringify(this.taskSyncQueue));
            } catch (e) {}
        },

        updateQueuedCreate(clientId, patch) {
            const index = this.taskSyncQueue.findIndex(q => q.type === 'create' && q.clientId === clientId);
            if (index !== -1) {
                this.taskSyncQueue[index].data = { ...this.taskSyncQueue[index].data, ...patch };
                try {
                    localStorage.setItem(this.taskQueueKey, JSON.stringify(this.taskSyncQueue));
                } catch (e) {}
            }
        },

        async flushTaskQueue() {
            if (!this.isOnline || this.taskSyncQueue.length === 0) return;
            try {
                const response = await this.apiRequest('/api/tasks/sync', {
                    method: 'POST',
                    body: JSON.stringify({ operations: this.taskSyncQueue })
                });
                if (response?.tasks) {
                    this.tasks = response.tasks;
                    this.saveTasksCache();
                }
                this.taskSyncQueue = [];
                localStorage.removeItem(this.taskQueueKey);
            } catch (e) {
                console.error('Task sync failed', e);
            }
        },

        handleOnline() {
            this.isOnline = true;
            this.flushTaskQueue();
        },

        handleOffline() {
            this.isOnline = false;
        },

        async loadProfileSettings() {
            try {
                const profile = await this.apiRequest('/api/user/profile');
                this.streakCurrent = profile?.streakCurrent || 0;
                this.streakLongest = profile?.streakLongest || 0;
                this.currentStreak = this.streakCurrent;

                const daily = await this.apiRequest('/api/user/daily-summary');
                this.dailySummaryEnabled = daily?.dailySummaryEnabled !== false;

                const weekly = await this.apiRequest('/api/user/weekly-summary');
                this.weeklySummaryEnabled = weekly?.weeklySummaryEnabled !== false;

                const monthly = await this.apiRequest('/api/user/monthly-summary');
                this.monthlySummaryEnabled = monthly?.monthlySummaryEnabled !== false;

                const calendar = await this.apiRequest('/api/user/calendar-token');
                this.calendarUrl = calendar?.calendarUrl || '';

                const publicProfile = await this.apiRequest('/api/user/public-profile');
                this.publicProfileEnabled = !!publicProfile?.publicProfileEnabled;
                this.publicProfileUrl = publicProfile?.publicProfileUrl || '';
            } catch (e) {
                console.error('Profile settings load failed', e);
            }
        },

        async loadLeaderboard() {
            try {
                // Ensure auth token is present
                const res = await fetch(`${this.API_BASE_URL}/api/analytics/leaderboard?period=${this.leaderboardPeriod}`, {
                     headers: { 'Authorization': `Bearer ${this.authToken}` } 
                });
                
                if (!res.ok) {
                    throw new Error(`Leaderboard fetch failed: ${res.status}`);
                }
                const data = await res.json();
                this.leaderboardResults = data?.results || [];
            } catch (e) {
                console.warn('Leaderboard load failed, using empty state:', e);
                this.leaderboardResults = []; 
            }
        },

        async loadAchievementLeaderboard() {
            try {
                if (this.currentView !== 'analytics') return;
                
                const res = await fetch(`${this.API_BASE_URL}/api/achievements/leaderboard?limit=10`, {
                    headers: { 'Authorization': `Bearer ${this.authToken}` }
                });
                
                if (!res.ok) {
                     throw new Error(`Achievement LB fetch failed: ${res.status}`);
                }
                const data = await res.json();
                this.achievementLeaderboard = Array.isArray(data) ? data : (data.leaderboard || []);
                
                // Render chart after data loads
                this.$nextTick(() => {
                    this.renderLeaderboardChart();
                });
            } catch (e) {
                console.warn('Achievement leaderboard load failed:', e);
                this.achievementLeaderboard = [];
            }
        },

        renderLeaderboardChart() {
            if (this.currentView !== 'analytics') return; 
            
            const canvas = this.$refs.leaderboardChart;
            if (!canvas) return; // Silent fail if element missing (e.g. tabs switched)
            if (!canvas.isConnected) return;
            
            if (!this.achievementLeaderboard || this.achievementLeaderboard.length === 0) return;
            
            if (!this.ensureChartJsLoaded()) return;

            const chartRect = canvas.getBoundingClientRect();
            if (chartRect.width === 0 || chartRect.height === 0) {
                const retry = setTimeout(() => {
                    if (this.currentView === 'analytics') {
                        this.renderLeaderboardChart();
                    }
                }, 200);
                this.analyticsTimeouts.push(retry);
                return;
            }

            const ctx = canvas.getContext('2d');
            
            // Destroy existing chart
            this.safeDestroyChart('leaderboardChart');
            
            // Prepare data
            const labels = this.achievementLeaderboard.map((user, index) => 
                user.username || `User ${index + 1}`
            );
            const points = this.achievementLeaderboard.map(user => user.achievementPoints || 0);
            const levels = this.achievementLeaderboard.map(user => user.achievementLevel || 1);
            
            // Level colors
            const levelColors = levels.map(level => {
                const colors = {
                    1: 'rgba(205, 127, 50, 0.8)',    // Bronze
                    2: 'rgba(192, 192, 192, 0.8)',   // Silver
                    3: 'rgba(255, 215, 0, 0.8)',     // Gold
                    4: 'rgba(229, 228, 226, 0.8)',   // Platinum
                    5: 'rgba(185, 242, 255, 0.8)'    // Diamond
                };
                return colors[level] || colors[1];
            });
            
            this.leaderboardChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Achievement Points',
                        data: points,
                        backgroundColor: levelColors,
                        borderColor: levelColors.map(c => c.replace('0.8', '1')),
                        borderWidth: 2,
                        borderRadius: 8
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    aspectRatio: window.innerWidth < 640 ? 1 : 1.5,
                    animation: { duration: 0 },
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            titleColor: '#fff',
                            bodyColor: '#fff',
                            callbacks: {
                                label: (context) => {
                                    return `Points: ${context.parsed.y}`;
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                color: 'rgba(255, 255, 255, 0.7)'
                            },
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            }
                        },
                        x: {
                            ticks: {
                                color: 'rgba(255, 255, 255, 0.7)',
                                maxRotation: 45,
                                minRotation: 45
                            },
                            grid: {
                                display: false
                            }
                        }
                    }
                }
            });
        },

        ensureChartJsLoaded() {
            if (typeof Chart !== 'undefined') return true;

            if (window.__studyflowChartJsLoading) return false;
            window.__studyflowChartJsLoading = true;

            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.0/chart.umd.min.js';
            script.async = true;
            script.onload = () => {
                window.__studyflowChartJsLoading = false;
                this.chartJsReady = true;
                if (typeof Chart !== 'undefined') {
                    Chart.defaults.animation = false;
                }
                if (this.currentView === 'analytics') {
                    this.$nextTick(() => {
                        this.updateCharts();
                        this.renderLeaderboardChart();
                    });
                }
            };
            script.onerror = () => {
                window.__studyflowChartJsLoading = false;
                this.chartJsReady = false;
                console.error('Chart.js failed to load from fallback CDN.');
            };
            document.head.appendChild(script);

            return false;
        },

        async loadQuizStats() {
            if (!this.isAuthenticated || !this.authToken) {
                return;
            }
            try {
                const res = await fetch(`${this.API_BASE_URL}/api/analytics/quiz-stats`, {
                    headers: { 'Authorization': `Bearer ${this.authToken}` }
                });
                if (res.status === 401) {
                    this.quizStats = {
                        totalQuizzes: 0,
                        completedQuizzes: 0,
                        averageScore: 0,
                        highestScore: 0,
                        quizzes: []
                    };
                    return;
                }
                if (!res.ok) return;
                const data = await res.json();
                this.quizStats = data;
            } catch (e) {
                console.warn('Quiz stats load failed', e);
            }
        },

        async toggleWeeklySummary() {
            try {
                const res = await this.apiRequest('/api/user/weekly-summary', {
                    method: 'PUT',
                    body: JSON.stringify({ weeklySummaryEnabled: this.weeklySummaryEnabled })
                });
                this.weeklySummaryEnabled = !!res?.weeklySummaryEnabled;
            } catch (e) {
                this.showInlineMessage('Failed to update weekly summary setting');
            }
        },

        async toggleDailySummary() {
            try {
                const res = await this.apiRequest('/api/user/daily-summary', {
                    method: 'PUT',
                    body: JSON.stringify({ dailySummaryEnabled: this.dailySummaryEnabled })
                });
                this.dailySummaryEnabled = !!res?.dailySummaryEnabled;
            } catch (e) {
                this.showInlineMessage('Failed to update daily summary setting');
            }
        },

        async toggleMonthlySummary() {
            try {
                const res = await this.apiRequest('/api/user/monthly-summary', {
                    method: 'PUT',
                    body: JSON.stringify({ monthlySummaryEnabled: this.monthlySummaryEnabled })
                });
                this.monthlySummaryEnabled = !!res?.monthlySummaryEnabled;
            } catch (e) {
                this.showInlineMessage('Failed to update monthly summary setting');
            }
        },

        async regenerateCalendarToken() {
            try {
                const res = await this.apiRequest('/api/user/calendar-token/regenerate', { method: 'POST' });
                this.calendarUrl = res?.calendarUrl || '';
                this.showInlineMessage('New calendar link generated');
            } catch (e) {
                this.showInlineMessage('Failed to regenerate calendar link');
            }
        },

        async enablePublicProfile() {
            try {
                const res = await this.apiRequest('/api/user/public-profile/enable', { method: 'POST' });
                this.publicProfileEnabled = true;
                this.publicProfileUrl = res?.publicProfileUrl || '';
                this.showInlineMessage('Public profile enabled');
            } catch (e) {
                this.showInlineMessage('Failed to enable public profile');
            }
        },

        async disablePublicProfile() {
            try {
                await this.apiRequest('/api/user/public-profile/disable', { method: 'POST' });
                this.publicProfileEnabled = false;
                this.showInlineMessage('Public profile disabled');
            } catch (e) {
                this.showInlineMessage('Failed to disable public profile');
            }
        },

        async copyText(text) {
            try {
                await navigator.clipboard.writeText(text);
                this.showInlineMessage('Copied to clipboard');
            } catch (e) {
                this.showInlineMessage('Copy failed');
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
                     
                    // Reset all local data
                    this.subjects = [];
                    this.sessions = [];
                    this.tasks = [];
                    this.notes = [];
                    this.goals = [];
                    this.achievements = [];
                    this.currentStreak = 0;
                    this.streakCurrent = 0;
                    this.quizStats = {
                        totalQuizzes: 0,
                        completedQuizzes: 0,
                        averageScore: 0,
                        highestScore: 0,
                        quizzes: []
                    };

                    // ✅ Reset leaderboards immediately so stale data disappears
                    this.leaderboardResults = [];
                    this.achievementLeaderboard = [];

                    // ✅ Re-fetch leaderboards from server so realtime reflects the clear
                    await Promise.all([
                        this.loadLeaderboard(),
                        this.loadAchievementLeaderboard()
                    ]);

                    // ✅ Trigger socket leaderboard refresh for all connected users
                    if (this.socket) {
                        this.socket.emit('request-leaderboard');
                    }
                    
                    this.showInlineMessage('All data cleared successfully');
                } catch(e) {
                    console.error(e);
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
            // Scroll to top for all possible scrollable elements
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
            // Also try documentElement and body just in case
            if (document.documentElement) document.documentElement.scrollTo({ top: 0, behavior: 'smooth' });
            if (document.body) document.body.scrollTo({ top: 0, behavior: 'smooth' });

            // And the main container if it exists
            const container = this.$refs.mainScrollContainer;
            if (container && typeof container.scrollTo === 'function') {
                container.scrollTo({ top: 0, behavior: 'smooth' });
            }
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

// Assets/script.js এর updateCharts ফাংশনটি এভাবে আপডেট করুন:

updateCharts() {
            console.log('updateCharts called');
            if (this.currentView !== 'analytics') {
                return;
            }
            if (this.updatingCharts) {
                return;
            }

    const getSessionDate = (session) => {
        const rawDate = session?.timestamp || session?.createdAt || session?.updatedAt;
        if (!rawDate) return null;
        const parsedDate = new Date(rawDate);
        return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
    };

    const getSessionDuration = (session) => {
        const rawDuration = session?.duration ?? session?.minutes ?? session?.totalMinutes ?? 0;
        const parsedDuration = Number(rawDuration);
        return Number.isFinite(parsedDuration) && parsedDuration >= 0 ? parsedDuration : 0;
    };

    // ১. আগে ডাটা ক্যালকুলেট করুন (যাতে v-show true হতে পারে)
    const now = new Date();
    let startDate, daysToShow, chartTitle;

    if (this.analyticsView === 'daily') {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        daysToShow = 24;
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

    const filteredSessions = (Array.isArray(this.sessions) ? this.sessions : []).filter(s => {
        const sessionDate = getSessionDate(s);
        if (!sessionDate) return false;
        return sessionDate >= startDate && sessionDate <= now;
    });

    console.log('filteredSessions length:', filteredSessions.length);
    console.log('sessions:', this.sessions);

    // এই লাইনটি অত্যন্ত গুরুত্বপূর্ণ - এটি আগে আপডেট না করলে ক্যানভাস hidden থাকবে
    // We explicitly set this to TRUE to always try to render the chart, 
    // even if empty (it will show empty axis)
    this.analyticsHasSessions = filteredSessions.length > 0;

    // Subject Data ক্যালকুলেশন
    const subjectStats = {};
    filteredSessions.forEach(s => {
        const subject = s.subject || 'Unspecified';
        if (!subjectStats[subject]) {
            subjectStats[subject] = { time: 0, sessions: 0 };
        }
        subjectStats[subject].time += getSessionDuration(s);
        subjectStats[subject].sessions += 1;
    });
    const subjectLabels = Object.keys(subjectStats);
    this.analyticsHasSubjects = subjectLabels.length > 0;

    // ২. এবার DOM আপডেটের জন্য অপেক্ষা করুন এবং তারপর চার্ট আঁকুন
    this.$nextTick(() => {
        console.log('$nextTick in updateCharts');
        // Check if DOM elements exist
        const studyRef = this.$refs.studyTimeChart;
        const subjectRef = this.$refs.subjectChart;

        if (!studyRef || !subjectRef || !studyRef.isConnected || !subjectRef.isConnected) {
            console.log('DOM refs not ready:', studyRef, subjectRef);
            return;
        }

        // Check if Library is loaded
        console.log('Chart defined:', typeof Chart !== 'undefined');
        if (!this.ensureChartJsLoaded()) {
            console.log('Chart.js not loaded, retrying');
            this.chartJsReady = typeof Chart !== 'undefined';
            const retry = setTimeout(() => {
                if (this.currentView === 'analytics') {
                    this.updateCharts();
                }
            }, 500);
            this.analyticsTimeouts.push(retry);
            return;
        }

        this.chartJsReady = true;

        // Force canvas visibility/sizing before Chart init
        const studyCanvas = studyRef;
        const subjectCanvas = subjectRef;

        studyCanvas.style.display = 'block';
        studyCanvas.style.width = '100%';
        studyCanvas.style.height = '100%';
        subjectCanvas.style.display = 'block';
        subjectCanvas.style.width = '100%';
        subjectCanvas.style.height = '100%';

        if (!studyCanvas.width || !studyCanvas.height) {
            studyCanvas.width = 900;
            studyCanvas.height = 360;
        }
        if (!subjectCanvas.width || !subjectCanvas.height) {
            subjectCanvas.width = 900;
            subjectCanvas.height = 360;
        }

        this.updatingCharts = true;

        try {
            // --- Chart 1: Study Time Trend ---
            this.safeDestroyChart('studyTimeChart');

            // Always render chart, data or no data
            if (true) { 
                const ctx1 = this.$refs.studyTimeChart.getContext('2d');
                if (!ctx1) return;
                let labels = [];
                let data = [];

                if (this.analyticsHasSessions && filteredSessions.length > 0) {
                     if (this.analyticsView === 'daily') {
                        const hourlyTotals = new Array(24).fill(0);
                        filteredSessions.forEach(s => {
                            const date = getSessionDate(s);
                            if (!date) return;
                            const hour = date.getHours();
                            hourlyTotals[hour] += getSessionDuration(s);
                        });
                        for (let hour = 0; hour < 24; hour++) {
                            labels.push(`${String(hour).padStart(2, '0')}:00`);
                            data.push(hourlyTotals[hour]);
                        }
                    } else if (this.analyticsView === 'weekly') {
                        const dailyTotals = {};
                        for (let i = 0; i < 7; i++) {
                            const d = new Date(startDate);
                            d.setDate(startDate.getDate() + i);
                            const dateStr = d.toLocaleDateString();
                            dailyTotals[dateStr] = 0;
                            labels.push(d.toLocaleDateString(undefined, { weekday: 'short' }));
                        }
                        filteredSessions.forEach(s => {
                            const sessionDate = getSessionDate(s);
                            if (!sessionDate) return;
                            const dateStr = sessionDate.toLocaleDateString();
                            if (dailyTotals[dateStr] !== undefined) {
                                dailyTotals[dateStr] += getSessionDuration(s);
                            }
                        });
                        data = Object.values(dailyTotals);
                    } else if (this.analyticsView === 'monthly') {
                        const dailyTotals = {};
                        // Create last 30 days buckets
                        for (let i = 0; i <= 30; i++) {
                            const d = new Date(startDate);
                            d.setDate(startDate.getDate() + i);
                            if (d > now) break;
                            const dateStr = d.toLocaleDateString();
                            dailyTotals[dateStr] = 0;
                            labels.push(d.getDate());
                        }

                        filteredSessions.forEach(s => {
                            const sessionDate = getSessionDate(s);
                            if (!sessionDate) return;
                            const dateStr = sessionDate.toLocaleDateString();
                             // Try to match key
                             if (dailyTotals[dateStr] !== undefined) {
                                dailyTotals[dateStr] += getSessionDuration(s);
                            } else {
                                // If exact locale string match fails (unlikely if same machine), 
                                // we can try more robust matching, but usually this is fine.
                            }
                        });
                        // Ensure we push data in correct order matching labels
                        // The loop above pushed labels, let's collect data in same order
                         data = [];
                         for (let i = 0; i <= 30; i++) {
                            const d = new Date(startDate);
                            d.setDate(startDate.getDate() + i);
                            if (d > now) break;
                            const dateStr = d.toLocaleDateString();
                            data.push(dailyTotals[dateStr] || 0);
                        }
                    }
                } else {
                    // Empty State Defaults
                     if (this.analyticsView === 'daily') {
                        labels = ['00:00', '06:00', '12:00', '18:00', '23:59'];
                        data = [0, 0, 0, 0, 0];
                     }
                     else if (this.analyticsView === 'weekly') {
                        labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                        data = [0, 0, 0, 0, 0, 0, 0];
                     }
                     else {
                        labels = Array.from({length: 30}, (_, i) => i + 1);
                        data = new Array(30).fill(0);
                     }
                }

                this.studyTimeChart = new Chart(ctx1, {
                    type: 'line',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: 'Minutes Focused',
                            data: data,
                            borderColor: '#8b5cf6',
                            backgroundColor: 'rgba(139, 92, 246, 0.1)',
                            borderWidth: 2,
                            pointRadius: 2,
                            pointHoverRadius: 4,
                            tension: 0.4,
                            fill: true
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        aspectRatio: window.innerWidth < 640 ? 1 : 2,
                        animation: { duration: 0 },
                        devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
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
                                suggestedMax: Math.max(...data, 0) + 10,
                                grid: { color: 'rgba(255,255,255,0.1)' },
                                title: { display: true, text: 'Minutes', color: '#9ca3af' }
                            },
                            x: {
                                grid: { display: false },
                                title: { display: true, text: this.analyticsView === 'daily' ? 'Time' : 'Date', color: '#9ca3af' }
                            }
                        }
                    }
                });
            }

            // --- Chart 2: Subject Distribution ---
            this.safeDestroyChart('subjectChart');

            // Always render donut chart too or empty state if needed
            if (true) {
                const ctx2 = this.$refs.subjectChart.getContext('2d');
                if (!ctx2) return;
                let subjectData = [];
                let sLabels = [];

                if (this.analyticsHasSubjects && subjectLabels.length > 0) {
                     subjectData = subjectLabels.map(s => subjectStats[s].time);
                     sLabels = subjectLabels;
                } else {
                     subjectData = [1]; // Minimal value to show empty ring
                     sLabels = ['No Data'];
                }

                this.subjectChart = new Chart(ctx2, {
                    type: 'doughnut',
                    data: {
                        labels: sLabels,
                        datasets: [{
                            data: subjectData,
                            backgroundColor: this.analyticsHasSubjects 
                                ? ['#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
                                : ['#334155'], // Dark gray for empty state
                            borderWidth: 2,
                            borderColor: 'rgba(255,255,255,0.08)'
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        aspectRatio: window.innerWidth < 640 ? 1 : 2,
                        animation: { duration: 0 },
                        devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
                        cutout: '62%',
                        plugins: {
                            legend: {
                                position: window.innerWidth < 640 ? 'bottom' : 'right',
                                labels: { color: '#9ca3af', boxWidth: 12, padding: 15 }
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
            }

        } catch (error) {
            console.error("🔥 Error updating charts:", error);
        } finally {
            this.updatingCharts = false;
        }
    });
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
                const pageWidth = doc.internal.pageSize.getWidth();
                const pageHeight = doc.internal.pageSize.getHeight();
                const margin = 15;

                // Helper to add gradient-style border
                const addBorder = () => {
                    doc.setDrawColor(139, 92, 246);
                    doc.setLineWidth(1.5);
                    doc.rect(5, 5, pageWidth - 10, pageHeight - 10);
                    
                    // Corner accents
                    doc.setFillColor(139, 92, 246);
                    doc.rect(5, 5, 15, 2, 'F');
                    doc.rect(5, 5, 2, 15, 'F');
                    doc.rect(pageWidth - 20, 5, 15, 2, 'F');
                    doc.rect(pageWidth - 7, 5, 2, 15, 'F');
                };

                // Helper for section headers
                const addSectionHeader = (text, y, icon = '') => {
                    doc.setFillColor(139, 92, 246);
                    doc.rect(margin, y - 6, pageWidth - 2 * margin, 10, 'F');
                    doc.setFontSize(14);
                    doc.setTextColor(255, 255, 255);
                    doc.setFont('helvetica', 'bold');
                    doc.text(text, margin + 3, y);
                    return y + 10;
                };

                // 1. Setup & Header
                addBorder();
                
                // Header with gradient effect
                doc.setFillColor(139, 92, 246);
                doc.rect(6, 6, pageWidth - 12, 35, 'F');
                
                doc.setFillColor(118, 75, 162);
                doc.rect(6, 20, pageWidth - 12, 21, 'F');

                // Logo circle
                doc.setFillColor(255, 255, 255);
                doc.circle(margin + 7, 20, 6, 'F');
                doc.setFillColor(139, 92, 246);
                doc.circle(margin + 7, 20, 4, 'F');

                // Title
                doc.setFontSize(26);
                doc.setTextColor(255, 255, 255);
                doc.setFont('helvetica', 'bold');
                doc.text('StudyFlow Performance Report', margin + 18, 26);

                // Subtitle
                doc.setFontSize(11);
                doc.setFont('helvetica', 'normal');
                doc.text('Your Complete Productivity Analysis', margin + 15, 33);

                // Date Badge
                doc.setFillColor(255, 255, 255);
                doc.roundedRect(pageWidth - 50, 13, 40, 10, 2, 2, 'F');
                doc.setFontSize(9);
                doc.setTextColor(139, 92, 246);
                doc.setFont('helvetica', 'bold');
                doc.text(new Date().toLocaleDateString(), pageWidth - 30, 20, { align: 'center' });

                // 2. User Info Card
                let currentY = 50;
                doc.setDrawColor(139, 92, 246);
                doc.setLineWidth(0.5);
                doc.setFillColor(248, 248, 255);
                doc.roundedRect(margin, currentY, pageWidth - 2 * margin, 20, 3, 3, 'FD');

                doc.setFontSize(11);
                doc.setTextColor(60, 60, 60);
                doc.setFont('helvetica', 'bold');
                doc.text('User:', margin + 5, currentY + 7);
                doc.setFont('helvetica', 'normal');
                doc.text(`${this.currentUser}`, margin + 20, currentY + 7);
                
                doc.setFont('helvetica', 'bold');
                doc.text('Email:', margin + 5, currentY + 14);
                doc.setFont('helvetica', 'normal');
                doc.text(`${this.userEmail}`, margin + 20, currentY + 14);

                // 3. Key Performance Indicators
                currentY = addSectionHeader('Key Performance Indicators', 80, '');
                
                // Stats boxes with colored backgrounds
                const stats = [
                    { label: 'Focus Time', value: `${Math.floor(this.totalFocusTime / 60)}h ${this.totalFocusTime % 60}m`, color: [79, 70, 229] },
                    { label: 'Sessions', value: `${this.totalSessions}`, color: [16, 185, 129] },
                    { label: 'Tasks Done', value: `${this.completedTasksCount}`, color: [245, 158, 11] },
                    { label: 'Streak', value: `${this.currentStreak}d`, color: [239, 68, 68] }
                ];

                const boxWidth = (pageWidth - 2 * margin - 15) / 4;
                const boxHeight = 25;
                
                stats.forEach((stat, index) => {
                    const x = margin + index * (boxWidth + 5);
                    
                    // Colored box
                    doc.setFillColor(stat.color[0], stat.color[1], stat.color[2]);
                    doc.roundedRect(x, currentY, boxWidth, boxHeight, 2, 2, 'F');
                    
                    // Label
                    doc.setFontSize(8);
                    doc.setTextColor(255, 255, 255);
                    doc.setFont('helvetica', 'bold');
                    doc.text(stat.label.toUpperCase(), x + boxWidth / 2, currentY + 8, { align: 'center' });
                    
                    // Value
                    doc.setFontSize(16);
                    doc.setFont('helvetica', 'bold');
                    doc.text(stat.value, x + boxWidth / 2, currentY + 18, { align: 'center' });
                });

                currentY += boxHeight + 15;

                // 4. Subject Performance
                if (this.subjects && this.subjects.length > 0) {
                    currentY = addSectionHeader('Subject Performance', currentY, '');
                    
                    this.subjects.slice(0, 8).forEach((subject, index) => {
                        if (currentY > pageHeight - 40) {
                            doc.addPage();
                            addBorder();
                            currentY = 20;
                        }
                        
                        const subjectHours = Math.floor((subject.totalTime || 0) / 60);
                        const subjectMins = (subject.totalTime || 0) % 60;
                        
                        // Subject name
                        doc.setFontSize(10);
                        doc.setTextColor(60, 60, 60);
                        doc.setFont('helvetica', 'bold');
                        doc.text(`${subject.name}`, margin + 5, currentY + 5);
                        
                        // Time badge
                        doc.setFillColor(139, 92, 246);
                        doc.roundedRect(pageWidth - margin - 35, currentY, 30, 7, 1, 1, 'F');
                        doc.setFontSize(9);
                        doc.setTextColor(255, 255, 255);
                        doc.text(`${subjectHours}h ${subjectMins}m`, pageWidth - margin - 20, currentY + 5, { align: 'center' });
                        
                        // Progress bar
                        const maxTime = Math.max(...this.subjects.map(s => s.totalTime || 0));
                        const barWidth = ((subject.totalTime || 0) / (maxTime || 1)) * (pageWidth - 2 * margin - 50);
                        
                        doc.setFillColor(230, 230, 235);
                        doc.roundedRect(margin + 5, currentY + 8, pageWidth - 2 * margin - 45, 4, 1, 1, 'F');
                        
                        doc.setFillColor(139, 92, 246);
                        doc.roundedRect(margin + 5, currentY + 8, barWidth, 4, 1, 1, 'F');
                        
                        currentY += 17;
                    });
                    
                    currentY += 5;
                }

                // 5. Completed Tasks Showcase
                const completedTasks = this.tasks.filter(t => t.completed);
                if (completedTasks.length > 0) {
                    if (currentY > pageHeight - 50) {
                        doc.addPage();
                        addBorder();
                        currentY = 20;
                    }
                    
                    currentY = addSectionHeader('Completed Tasks', currentY, '');
                    
                    completedTasks.slice(0, 10).forEach((task, index) => {
                        if (currentY > pageHeight - 30) {
                            doc.addPage();
                            addBorder();
                            currentY = 20;
                        }
                        
                        // Checkmark
                        doc.setFillColor(16, 185, 129);
                        doc.circle(margin + 5, currentY + 2, 2, 'F');
                        
                        doc.setFontSize(10);
                        doc.setTextColor(60, 60, 60);
                        doc.setFont('helvetica', 'normal');
                        doc.text(task.text, margin + 10, currentY + 4);
                        
                        currentY += 8;
                    });
                    
                    if (completedTasks.length > 10) {
                        doc.setFontSize(9);
                        doc.setTextColor(120, 120, 120);
                        doc.setFont('helvetica', 'italic');
                        doc.text(`+${completedTasks.length - 10} more completed tasks`, margin + 10, currentY + 4);
                        currentY += 8;
                    }
                    
                    currentY += 5;
                }

                // 6. Pending Tasks
                const pendingTasks = this.tasks.filter(t => !t.completed);
                if (currentY > pageHeight - 50) {
                    doc.addPage();
                    addBorder();
                    currentY = 20;
                }
                
                currentY = addSectionHeader('Pending Tasks', currentY, '');
                
                if (pendingTasks.length > 0) {
                    pendingTasks.slice(0, 8).forEach((task, index) => {
                        if (currentY > pageHeight - 30) {
                            doc.addPage();
                            addBorder();
                            currentY = 20;
                        }
                        
                        // Priority indicator
                        const priorityColors = {
                            high: [239, 68, 68],
                            medium: [245, 158, 11],
                            low: [139, 92, 246]
                        };
                        const color = priorityColors[task.priority] || [139, 92, 246];
                        doc.setFillColor(color[0], color[1], color[2]);
                        doc.circle(margin + 5, currentY + 2, 2, 'F');
                        
                        doc.setFontSize(10);
                        doc.setTextColor(60, 60, 60);
                        doc.setFont('helvetica', 'normal');
                        doc.text(task.text, margin + 10, currentY + 4);
                        
                        // Priority badge
                        if (task.priority) {
                            doc.setFillColor(color[0], color[1], color[2]);
                            doc.roundedRect(pageWidth - margin - 30, currentY - 1, 25, 6, 1, 1, 'F');
                            doc.setFontSize(7);
                            doc.setTextColor(255, 255, 255);
                            doc.setFont('helvetica', 'bold');
                            doc.text(task.priority.toUpperCase(), pageWidth - margin - 17.5, currentY + 3, { align: 'center' });
                        }
                        
                        currentY += 8;
                    });
                } else {
                    doc.setFontSize(11);
                    doc.setTextColor(16, 185, 129);
                    doc.setFont('helvetica', 'bold');
                    doc.text('No pending tasks! You\'re all caught up!', margin + 5, currentY + 4);
                    currentY += 10;
                }

                // 7. Achievements & Progress
                if (currentY > pageHeight - 50) {
                    doc.addPage();
                    addBorder();
                    currentY = 20;
                }
                
                currentY = addSectionHeader('Achievements & Progress', currentY, '');
                
                // Tier badge
                doc.setFillColor(245, 158, 11);
                doc.roundedRect(margin + 5, currentY, 50, 15, 2, 2, 'F');
                doc.setFontSize(11);
                doc.setTextColor(255, 255, 255);
                doc.setFont('helvetica', 'bold');
                doc.text(`Tier: ${this.tier || 'Bronze'}`, margin + 30, currentY + 10, { align: 'center' });
                
                // Points
                doc.setFillColor(139, 92, 246);
                doc.roundedRect(margin + 60, currentY, 50, 15, 2, 2, 'F');
                doc.text(`${this.points || 0} pts`, margin + 85, currentY + 10, { align: 'center' });
                
                // Achievement count
                const achievementCount = this.achievements ? this.achievements.filter(a => a.unlocked).length : 0;
                doc.setFillColor(16, 185, 129);
                doc.roundedRect(margin + 115, currentY, 50, 15, 2, 2, 'F');
                doc.text(`${achievementCount} Badges`, margin + 140, currentY + 10, { align: 'center' });
                
                currentY += 20;

                // 8. Footer with Team Attribution
                const pageCount = doc.internal.getNumberOfPages();
                for (let i = 1; i <= pageCount; i++) {
                    doc.setPage(i);
                    
                    // Footer line
                    doc.setDrawColor(220, 220, 220);
                    doc.setLineWidth(0.3);
                    doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
                    
                    // Page number
                    doc.setFontSize(8);
                    doc.setTextColor(120, 120, 120);
                    doc.setFont('helvetica', 'normal');
                    doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
                    
                    // Attribution
                    doc.setFontSize(7);
                    doc.text('Generated by StudyFlow', margin, pageHeight - 10);
                    doc.text('studyflow.salahuddin.codes', pageWidth - margin, pageHeight - 10, { align: 'right' });
                    
                    // Team credit
                    doc.setFontSize(6);
                    doc.setTextColor(150, 150, 150);
                    doc.text('Developed by Salah Uddin Kader • Admin: Sohana Rahman', pageWidth / 2, pageHeight - 6, { align: 'center' });
                }

                // Save
                doc.save(`StudyFlow_Report_${this.currentUser}.pdf`);
                this.showInlineMessage('📊 Performance report downloaded successfully!');
                
            } catch (error) {
                console.error("PDF Export Error:", error);
                this.showInlineMessage('Failed to generate PDF report');
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
                const userData = await this.apiRequest('/api/auth/me', { method: 'GET' });
                this.isAdmin = userData.role === 'admin';
            } catch (error) {
                console.error('Admin check failed:', error);
            }
        },

        async refreshAdminData() {
            if (this.adminLoading) return;
            
            this.adminLoaded = {
                analytics: false,
                users: false,
                blogs: false,
                songs: false,
                audit: false
            };
            try {
                await this.loadAdminData(true);
                this.showInlineMessage('Admin data refreshed successfully!');
            } catch (error) {
                console.error('Failed to refresh admin data:', error);
                this.showInlineMessage('Failed to refresh admin data. Please try again.');
            }
        },

        async loadAdminData(force = false) {
            if (!this.isAdmin || this.adminLoading) return;

            this.adminLoading = true;
            try {
                await Promise.allSettled([
                    this.loadAdminAnalytics(force),
                    this.ensureAdminTabData(this.adminActiveTab, force)
                ]);
            } catch (error) {
                console.error('Failed to load admin data:', error);
            } finally {
                this.adminLoading = false;
            }
        },

        async loadAdminAnalytics(force = false) {
            if (this.adminLoaded.analytics && !force) return;

            try {
                const analytics = await this.apiRequest('/api/admin/analytics', { method: 'GET' });
                this.adminStats.totalUsers = analytics.totalUsers;
                this.adminStats.totalSessions = analytics.totalSessions;
                this.adminSessionsSummary = analytics;
                this.adminStats.totalMinutes = analytics.totalMinutes || 0;
                this.adminLoaded.analytics = true;
                this.$nextTick(() => this.renderAdminSessionsChart());
            } catch (error) {
                console.error('Failed to load admin analytics:', error);
            }
        },

        async loadAdminUsers(force = false) {
            if (this.adminLoaded.users && !force) return;

            try {
                const params = new URLSearchParams({
                    page: this.adminUserPage,
                    pageSize: this.adminUserPageSize,
                    search: this.adminUserSearch || '',
                    role: this.adminUserRoleFilter === 'all' ? '' : this.adminUserRoleFilter
                });
                const payload = await this.apiRequest(`/api/admin/users?${params.toString()}`, { method: 'GET' });
                this.allUsers = payload.users || [];
                this.adminUsersTotal = payload.total || this.allUsers.length;
                this.adminLoaded.users = true;
                this.adminSelectedUserIds = this.adminSelectedUserIds.filter(id => this.allUsers.some(u => u._id === id));
            } catch (error) {
                console.error('Failed to load admin users:', error);
            }
        },

        async loadAdminBlogs(force = false) {
            if (this.adminLoaded.blogs && !force) return;

            try {
                const blogs = await this.apiRequest('/api/blogs', { method: 'GET' });
                this.adminBlogs = blogs || [];
                this.adminStats.totalBlogs = this.adminBlogs.length;
                this.adminLoaded.blogs = true;
            } catch (error) {
                console.error('Failed to load admin blogs:', error);
            }
        },

        async loadAdminSongs(force = false) {
            if (this.adminLoaded.songs && !force) return;

            try {
                const songs = await this.apiRequest('/api/songs', { method: 'GET' });
                this.adminSongs = songs || [];
                this.adminStats.totalSongs = this.adminSongs.length;
                this.adminLoaded.songs = true;
            } catch (error) {
                console.error('Failed to load admin songs:', error);
            }
        },

        async ensureAdminTabData(tab, force = false) {
            if (!this.isAdmin) return;

            if (tab === 'users') return this.loadAdminUsers(force);
            if (tab === 'blogs') return this.loadAdminBlogs(force);
            if (tab === 'songs') return this.loadAdminSongs(force);
            if (tab === 'audit') return this.loadAdminAuditLogs(force);
        },

        async loadAdminAuditLogs(force = false) {
            if (this.adminAuditLoading || (this.adminLoaded.audit && !force)) return;

            this.adminAuditLoading = true;
            try {
                const params = new URLSearchParams({
                    page: this.adminAuditPage,
                    pageSize: this.adminAuditPageSize
                });
                const payload = await this.apiRequest(`/api/admin/audit?${params.toString()}`, { method: 'GET' });
                this.adminAuditLogs = payload.logs || [];
                this.adminAuditTotal = payload.total || this.adminAuditLogs.length;
                this.adminLoaded.audit = true;
            } catch (error) {
                console.error('Failed to load admin audit logs:', error);
            } finally {
                this.adminAuditLoading = false;
            }
        },

        async adminApplyUserFilters() {
            this.adminUserPage = 1;
            this.adminLoaded.users = false;
            await this.loadAdminUsers(true);
        },

        async adminChangePage(delta) {
            const next = this.adminUserPage + delta;
            if (next < 1 || next > this.adminUsersTotalPages) return;
            this.adminUserPage = next;
            this.adminLoaded.users = false;
            await this.loadAdminUsers(true);
        },

        toggleSelectAllUsers() {
            if (this.adminAllVisibleSelected) {
                this.adminSelectedUserIds = [];
            } else {
                this.adminSelectedUserIds = this.allUsers.map(u => u._id);
            }
        },

        toggleSelectUser(userId) {
            if (this.adminSelectedUserIds.includes(userId)) {
                this.adminSelectedUserIds = this.adminSelectedUserIds.filter(id => id !== userId);
            } else {
                this.adminSelectedUserIds.push(userId);
            }
        },

        async bulkDeleteUsers() {
            if (this.adminSelectedUserIds.length === 0) return;
            if (!confirm(`Delete ${this.adminSelectedUserIds.length} users? This is permanent.`)) return;

            try {
                const response = await fetch(`${this.API_BASE_URL}/api/admin/users/bulk`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.authToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ action: 'delete', userIds: this.adminSelectedUserIds })
                });

                if (response.ok) {
                    this.showInlineMessage('Users deleted successfully');
                    this.adminSelectedUserIds = [];
                    this.adminLoaded.users = false;
                    await this.loadAdminUsers(true);
                } else {
                    const err = await response.json();
                    this.showInlineMessage(err.message || 'Bulk delete failed');
                }
            } catch (error) {
                console.error('Bulk delete failed:', error);
                this.showInlineMessage('Bulk delete failed');
            }
        },

        async bulkSetRole(role) {
            if (this.adminSelectedUserIds.length === 0) return;
            if (!confirm(`Set role "${role}" for ${this.adminSelectedUserIds.length} users?`)) return;

            try {
                const response = await fetch(`${this.API_BASE_URL}/api/admin/users/bulk`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.authToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ action: 'set_role', role, userIds: this.adminSelectedUserIds })
                });

                if (response.ok) {
                    this.showInlineMessage('Roles updated successfully');
                    this.adminSelectedUserIds = [];
                    this.adminLoaded.users = false;
                    await this.loadAdminUsers(true);
                } else {
                    const err = await response.json();
                    this.showInlineMessage(err.message || 'Bulk role update failed');
                }
            } catch (error) {
                console.error('Bulk role update failed:', error);
                this.showInlineMessage('Bulk role update failed');
            }
        },

        async promoteUser(userId) {
            try {
                const response = await fetch(`${this.API_BASE_URL}/api/admin/users/${userId}/promote`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${this.authToken}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    this.showInlineMessage('User promoted to sub admin');
                    this.adminLoaded.users = false;
                    await this.loadAdminUsers(true);
                } else {
                    const err = await response.json();
                    this.showInlineMessage(err.message || 'Promote failed');
                }
            } catch (error) {
                console.error('Promote failed:', error);
                this.showInlineMessage('Promote failed');
            }
        },

        async demoteUser(userId) {
            try {
                const response = await fetch(`${this.API_BASE_URL}/api/admin/users/${userId}/demote`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${this.authToken}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    this.showInlineMessage('Admin demoted to user');
                    this.adminLoaded.users = false;
                    await this.loadAdminUsers(true);
                } else {
                    const err = await response.json();
                    this.showInlineMessage(err.message || 'Demote failed');
                }
            } catch (error) {
                console.error('Demote failed:', error);
                this.showInlineMessage('Demote failed');
            }
        },

        exportAdminAnalyticsCSV() {
            const rows = [['Username', 'Total Minutes', 'Total Sessions']];
            (this.adminSessionsSummary?.perUser || []).forEach(u => {
                rows.push([u.username, u.totalMinutes || 0, u.totalSessions || 0]);
            });

            const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'admin-analytics.csv';
            link.click();
            URL.revokeObjectURL(url);
        },

        exportAdminAnalyticsPDF() {
            const perUser = this.adminSessionsSummary?.perUser || [];
            const html = `
                <html><head><title>Admin Analytics</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    h1 { margin-bottom: 8px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 12px; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background: #f3f4f6; }
                </style></head><body>
                <h1>Admin Analytics</h1>
                <p>Total Users: ${this.adminStats.totalUsers}</p>
                <p>Total Sessions: ${this.adminStats.totalSessions}</p>
                <p>Total Minutes: ${this.adminStats.totalMinutes}</p>
                <table>
                    <thead><tr><th>Username</th><th>Total Minutes</th><th>Total Sessions</th></tr></thead>
                    <tbody>
                        ${perUser.map(u => `<tr><td>${u.username}</td><td>${u.totalMinutes || 0}</td><td>${u.totalSessions || 0}</td></tr>`).join('')}
                    </tbody>
                </table>
                </body></html>
            `;
            const win = window.open('', '_blank');
            if (!win) return;
            win.document.write(html);
            win.document.close();
            win.focus();
            win.print();
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
            this.aiChatHistory.push({ role: 'user', content: prompt, timestamp: new Date().toISOString() });
            this.aiPrompt = ''; // Clear input
            this.aiLoading = true;
            
            // Add typing indicator
            this.aiChatHistory.push({ role: 'assistant', content: '...', isTyping: true });
            
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

                // Remove typing indicator
                this.aiChatHistory = this.aiChatHistory.filter(msg => !msg.isTyping);

                if (data && data.answer) {
                    this.aiChatHistory.push({ 
                        role: 'assistant', 
                        content: data.answer,
                        timestamp: new Date().toISOString()
                    });
                    
                    // Check if the AI performed an action (Task/Subject/Goal etc.)
                    if (data.actionPerformed) {
                         const actionKey = data.actionPerformed;

                         // Handle frontend-only actions
                         if (actionKey.startsWith('navigate_to:')) {
                             const page = actionKey.replace('navigate_to:', '').trim();
                             this.currentView = page;
                             this.showInlineMessage(`📍 Navigated to ${page}`);
                             return;
                         }
                         if (actionKey.startsWith('start_timer:')) {
                             const mins = parseInt(actionKey.replace('start_timer:', '')) || 25;
                             this.startPomodoroFromAI(mins);
                             this.showInlineMessage(`⏱️ Timer started: ${mins} minutes`);
                             return;
                         }
                         
                         // Refresh data immediately to show changes in UI
                         await this.loadUserData();
                         
                         // Show success notification with action details
                         const actionIcons = {
                             'Task created': '✅',
                             'Subject added': '📚',
                             'Goal set': '🎯',
                             'Note saved': '📝',
                         };
                         
                         let message = actionKey;
                         if (actionKey.startsWith('Task completed:')) message = `✅ ${actionKey}`;
                         else if (actionKey.startsWith('Task deleted:')) message = `🗑️ ${actionKey}`;
                         else if (actionKey.startsWith('Subject deleted:')) message = `🗑️ ${actionKey}`;
                         else if (actionKey.startsWith('Goal updated:')) message = `🎯 ${actionKey}`;
                         else if (actionKey.startsWith('Session logged:')) message = `⏱️ ${actionKey}`;
                         else if (actionKey === 'Task created') message = '✅ Task added!';
                         else if (actionKey === 'Subject added') message = '📚 Subject added!';
                         else if (actionKey === 'Goal set') message = '🎯 Goal created!';
                         else if (actionKey === 'Note saved') message = '📝 Note saved!';
                         else if (actionKey === 'Task not found') message = '⚠️ Task not found — try a different name';
                         else if (actionKey === 'Goal not found') message = '⚠️ Goal not found';
                         
                         this.showInlineMessage(message);
                    }

                } else {
                    this.aiChatHistory.push({ 
                        role: 'assistant', 
                        content: "I'm having trouble connecting right now. Please try again in a moment.",
                        timestamp: new Date().toISOString()
                    });
                }
            } catch (error) {
                console.error('AI request failed:', error);
                
                // Remove typing indicator
                this.aiChatHistory = this.aiChatHistory.filter(msg => !msg.isTyping);
                
                let errorMessage = "Sorry, something went wrong. Please try again.";
                
                // More specific error messages
                if (error.message?.includes('quota')) {
                    errorMessage = "⏳ AI quota reached. Try again in a few minutes.";
                } else if (error.message?.includes('network')) {
                    errorMessage = "🌐 Network error. Check your connection.";
                } else if (error.message?.includes('API key')) {
                    errorMessage = "🔑 AI service temporarily unavailable.";
                }
                
                this.aiChatHistory.push({ 
                    role: 'assistant', 
                    content: errorMessage,
                    timestamp: new Date().toISOString(),
                    isError: true
                });
            } finally {
                this.aiLoading = false;
                
                // Persist chat history (keep last 50 messages to avoid quota)
                try {
                    const toSave = this.aiChatHistory.filter(m => !m.isTyping).slice(-50);
                    localStorage.setItem('sf_ai_chat', JSON.stringify(toSave));
                } catch(e) { /* ignore storage errors */ }
                
                // Smooth scroll to bottom
                this.$nextTick(() => {
                    setTimeout(() => {
                        const container = document.getElementById('ai-chat-container');
                        if (container) {
                            container.scrollTo({
                                top: container.scrollHeight,
                                behavior: 'smooth'
                            });
                        }
                    }, 100);
                });
            }
        },

        clearAIChat() {
            this.aiChatHistory = [];
            localStorage.removeItem('sf_ai_chat');
        },

        async copyAIMessage(content) {
            try {
                await navigator.clipboard.writeText(content);
                this.showInlineMessage('✅ Copied to clipboard!');
            } catch (e) {
                // fallback
                const ta = document.createElement('textarea');
                ta.value = content;
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                document.body.removeChild(ta);
                this.showInlineMessage('✅ Copied!');
            }
        },

        async sendQuickPrompt(text) {
            if (this.aiLoading) return;
            this.aiPrompt = text;
            await this.askAI();
        },

        async getDailyFocus() {
            if (this.aiLoading) return;
            await this.sendQuickPrompt('Based on my pending tasks, goals, and study history, what ONE thing should I focus on today and why? Give me a clear, motivating action plan.');
        },

        async generateStudyPlan() {
            if (this.aiLoading) return;

            const focusArea = '';
            const timeframe = '7 days';
            const dailyHours = 2;

            this.aiLoading = true;
            this.aiChatHistory.push({ role: 'assistant', content: 'Generating your personalized study plan...', isTyping: true });

            try {
                const data = await this.apiRequest('/api/ai/study-plan', {
                    method: 'POST',
                    body: JSON.stringify({ focusArea, timeframe, dailyHours })
                });

                this.aiChatHistory = this.aiChatHistory.filter(msg => !msg.isTyping);
                this.aiChatHistory.push({
                    role: 'assistant',
                    content: data.plan || 'Plan generated, but no content returned.',
                    timestamp: new Date().toISOString()
                });
            } catch (error) {
                this.aiChatHistory = this.aiChatHistory.filter(msg => !msg.isTyping);
                this.aiChatHistory.push({
                    role: 'assistant',
                    content: 'Sorry, failed to generate study plan.',
                    timestamp: new Date().toISOString(),
                    isError: true
                });
            } finally {
                this.aiLoading = false;
            }
        },

        async getWeeklySummary() {
            if (this.aiLoading) return;

            this.aiLoading = true;
            this.aiChatHistory.push({ role: 'assistant', content: 'Preparing your weekly summary...', isTyping: true });

            try {
                const data = await this.apiRequest('/api/ai/weekly-summary', { method: 'GET' });
                this.aiChatHistory = this.aiChatHistory.filter(msg => !msg.isTyping);
                this.aiChatHistory.push({
                    role: 'assistant',
                    content: data.summary || 'Summary generated, but no content returned.',
                    timestamp: new Date().toISOString()
                });
            } catch (error) {
                this.aiChatHistory = this.aiChatHistory.filter(msg => !msg.isTyping);
                this.aiChatHistory.push({
                    role: 'assistant',
                    content: 'Sorry, failed to load weekly summary.',
                    timestamp: new Date().toISOString(),
                    isError: true
                });
            } finally {
                this.aiLoading = false;
            }
        },

        renderAdminSessionsChart() {
            try {
                const ctx = this.$refs.adminSessionsChart?.getContext('2d');
                if (!ctx) return;

                this.safeDestroyChart('adminSessionsChart');

                const perUser = this.adminSessionsSummary?.perUser || [];
                const labels = perUser.map(u => u?.username || 'Unknown');
                const data = perUser.map(u => u?.totalMinutes || 0);

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
                        animation: { duration: 0 },
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
            this.showAdminPanel = true;
            this.loadAdminData();
        }
    }
});

// Export app instance for external modules
// Needs to capture the MOUNTED instance (vm)
const mountedApp = legacyVueApp.mount('#app');
window.StudyFlowLegacyApp = mountedApp;
window.app = mountedApp; // Alias for modules expecting 'app'

// Register service worker for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Register with a relative path so it works on GitHub Pages project sites
        navigator.serviceWorker.register('sw.js')
            .then((registration) => {
                console.log('ServiceWorker registered successfully');
            })
            .catch((error) => {
                console.log('ServiceWorker registration failed:', error);
            });
    });
}

/* jshint ignore:end */