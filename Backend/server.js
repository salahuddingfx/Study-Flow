/* ==============================================
   🚀 StudyFlow Professional Server
   ============================================== */

require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const path = require('path');
const compression = require('compression'); 
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const Session = require('./models/Session');
const Task = require('./models/Task');
const sendEmail = require('./utils/sendEmail');

// 1️⃣ Initialize Database
connectDB();

// 2️⃣ Initialize App
const app = express();
const server = http.createServer(app);

// Trust proxy for production (Render, Heroku, etc)
app.set('trust proxy', 1);

// 3️⃣ Security & Performance Middleware
app.use(compression());
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 1000, 
    message: { 
        success: false,
        message: 'Too many requests, please try again later' 
    }, 
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api', limiter); 

// CORS Config
const allowedOrigins = [
    'http://127.0.0.1:5500',
    'http://localhost:5500',
    'https://salahuddingfx.github.io',      // GitHub Pages
    'https://studyflow-apk.netlify.app',    // Netlify App
    process.env.FRONTEND_URL 
];

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.log("Blocked by CORS:", origin);
            callback(null, true); 
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
};

app.use(cors(corsOptions));

// Socket.IO Setup
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ['GET', 'POST'],
        credentials: true
    }
});

// Standard Middleware
app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Static Files
app.use(express.static(path.join(__dirname, '..'), {
    maxAge: '1d', 
    etag: false
}));

// Socket Logic
io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (token) socket.userId = socket.handshake.auth.userId;
    next();
});

io.on('connection', (socket) => {
    if (socket.userId) socket.join(`user_${socket.userId}`);

    // Timer Events
    const handleStartTimer = (data) => socket.to(`user_${socket.userId}`).emit('timer-started', data);
    const handlePauseTimer = (data) => socket.to(`user_${socket.userId}`).emit('timer-paused', data);
    const handleResetTimer = (data) => socket.to(`user_${socket.userId}`).emit('timer-reset', data);
    const handleTimerTick = (data) => socket.to(`user_${socket.userId}`).emit('timer-update', data);

    socket.on('start-timer', handleStartTimer);
    socket.on('pause-timer', handlePauseTimer);
    socket.on('reset-timer', handleResetTimer);
    socket.on('timer-tick', handleTimerTick);

    // Task Events
    const handleTaskCreated = (task) => socket.to(`user_${socket.userId}`).emit('task-added', task);
    const handleTaskUpdated = (task) => socket.to(`user_${socket.userId}`).emit('task-updated', task);
    const handleTaskDeleted = (id) => socket.to(`user_${socket.userId}`).emit('task-deleted', id);

    socket.on('task-created', handleTaskCreated);
    socket.on('task-updated', handleTaskUpdated);
    socket.on('task-deleted', handleTaskDeleted);

    // 🔴 Study Rooms Logic
    socket.on('join-room', (roomName) => {
        // Leave previous rooms (except default user room)
        Array.from(socket.rooms).forEach(r => {
            if (r !== `user_${socket.userId}` && r !== socket.id) {
                socket.leave(r);
            }
        });

        if (roomName) {
            socket.join(roomName);
            // Emitting updated count to all clients
            updateRoomCounts();
        }
    });

    socket.on('leave-room', (roomName) => {
        if (roomName) {
            socket.leave(roomName);
            updateRoomCounts();
        }
    });

    // Helper to get room counts
    const updateRoomCounts = () => {
        const rooms = ['Math Club', 'Lofi Lounge', 'Silent Study', 'Coffee Shop', 'Library']; // Predefined rooms
        const counts = {};
        
        rooms.forEach(room => {
            const roomSet = io.sockets.adapter.rooms.get(room);
            counts[room] = roomSet ? roomSet.size : 0;
        });
        
        io.emit('update-room-counts', counts);
    };

    // Clean up listeners on disconnect to prevent memory leaks
    socket.on('disconnect', () => {
        updateRoomCounts(); // Update counts on disconnect
        socket.removeListener('start-timer', handleStartTimer);
        socket.removeListener('pause-timer', handlePauseTimer);
        socket.removeListener('reset-timer', handleResetTimer);
        socket.removeListener('timer-tick', handleTimerTick);
        socket.removeListener('task-created', handleTaskCreated);
        socket.removeListener('task-updated', handleTaskUpdated);
        socket.removeListener('task-deleted', handleTaskDeleted);
    });
});

// Routes
app.get('/api/health', (req, res) => {
    const healthCheck = {
        status: 'success',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
        aiStatus: process.env.GEMINI_API_KEY ? 'Active' : 'Inactive',
        environment: process.env.NODE_ENV || 'development',
        memory: {
            used: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`,
            total: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)} MB`
        }
    };
    res.status(200).json(healthCheck);
});

// Auth & User Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/user', require('./routes/user.routes')); 

// Task Routes (with Socket.IO)
const taskRoutes = require('./routes/task.routes');
taskRoutes.setIo(io);
app.use('/api/tasks', taskRoutes);

// Session Routes (with Socket.IO)
const sessionRoutes = require('./routes/session.routes');
sessionRoutes.setIo(io);
app.use('/api/sessions', sessionRoutes);

// Subject Routes (with Socket.IO)
const subjectRoutes = require('./routes/subject.routes');
subjectRoutes.setIo(io);
app.use('/api/subjects', subjectRoutes);

// Analytics Route
app.use('/api/analytics', require('./routes/analytics.routes'));

// Goal Routes (with Socket.IO)
const goalRoutes = require('./routes/goal.routes');
goalRoutes.setIo(io);
app.use('/api/goals', goalRoutes);

// Achievement Routes (✅ FIXED with Socket.IO)
const achievementRoutes = require('./routes/achievement.routes');
achievementRoutes.setIo(io); // এটি মিসিং ছিল, এখন ঠিক করা হয়েছে
app.use('/api/achievements', achievementRoutes);
// Admin Routes (Admin Dashboard)
app.use('/api/admin', require('./routes/admin.routes'));

// AI Routes (AI Features)
app.use('/api/ai', require('./routes/ai.routes'));

// Blog Routes (Blog System)
const blogRoutes = require('./routes/blog.routes');
blogRoutes.setIo(io);
app.use('/api/blogs', blogRoutes);

// Song Routes (Music System)
const songRoutes = require('./routes/song.routes');
songRoutes.setIo(io);
app.use('/api/songs', songRoutes);
// Catch-all Route
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});

// Global Error Handling
app.use((err, req, res, next) => {
    console.error(`❌ Error: ${err.message}`);
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    
    if (res.headersSent) {
        return next(err);
    }

    res.status(statusCode).json({
        success: false,
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, async () => {
    console.clear();
    
    // Colors
    const colors = {
        reset: '\x1b[0m',
        bright: '\x1b[1m',
        cyan: '\x1b[36m',
        green: '\x1b[32m',
        yellow: '\x1b[33m',
        blue: '\x1b[34m',
        magenta: '\x1b[35m',
        red: '\x1b[31m'
    };

    // Typewriter Effect Function
    const typewriter = (text, color = '', speed = 30) => {
        return new Promise((resolve) => {
            let i = 0;
            const interval = setInterval(() => {
                if (i < text.length) {
                    process.stdout.write(color + text[i] + colors.reset);
                    i++;
                } else {
                    clearInterval(interval);
                    console.log('');
                    resolve();
                }
            }, speed);
        });
    };

    // ASCII Art Header
    console.log(colors.cyan + colors.bright);
    console.log(`
    ╔═══════════════════════════════════════════════════════════╗
    ║                                                           ║
    ║       ███████╗████████╗██╗   ██╗██████╗ ██╗   ██╗        ║
    ║       ██╔════╝╚══██╔══╝██║   ██║██╔══██╗╚██╗ ██╔╝        ║
    ║       ███████╗   ██║   ██║   ██║██║  ██║ ╚████╔╝         ║
    ║       ╚════██║   ██║   ██║   ██║██║  ██║  ╚██╔╝          ║
    ║       ███████║   ██║   ╚██████╔╝██████╔╝   ██║           ║
    ║       ╚══════╝   ╚═╝    ╚═════╝ ╚═════╝    ╚═╝           ║
    ║                                                           ║
    ║              ███████╗██╗      ██████╗ ██╗    ██╗         ║
    ║              ██╔════╝██║     ██╔═══██╗██║    ██║         ║
    ║              █████╗  ██║     ██║   ██║██║ █╗ ██║         ║
    ║              ██╔══╝  ██║     ██║   ██║██║███╗██║         ║
    ║              ██║     ███████╗╚██████╔╝╚███╔███╔╝         ║
    ║              ╚═╝     ╚══════╝ ╚═════╝  ╚══╝╚══╝          ║
    ║                                                           ║
    ╚═══════════════════════════════════════════════════════════╝
    ` + colors.reset);

    // Typewriter Animation
    await typewriter('    ✨ StudyFlow by Salahuddin', colors.magenta + colors.bright, 50);
    console.log('');
    await typewriter('    🚀 Server Status: ONLINE', colors.green + colors.bright, 30);
    console.log(colors.yellow + '    📡 Port: ' + colors.bright + PORT + colors.reset);
    console.log(colors.blue + '    🌍 Environment: ' + colors.bright + (process.env.NODE_ENV || 'development') + colors.reset);
    console.log(colors.magenta + '    💾 Database: ' + colors.bright + 'Connected' + colors.reset);
    console.log(colors.cyan + '    ⏱️  Started at: ' + colors.bright + new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' }) + colors.reset);
    console.log('');
    await typewriter('    ✅ All Routes Loaded Successfully!', colors.green, 25);
    console.log(colors.yellow + '    🔥 AI Features: ' + (process.env.GEMINI_API_KEY ? colors.green + 'Active ✓' : colors.red + 'Inactive (Set GEMINI_API_KEY)') + colors.reset);
    console.log('');
    console.log(colors.cyan + '    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' + colors.reset);
    await typewriter('    🎯 Ready to serve requests!', colors.bright + colors.green, 40);
    console.log(colors.cyan + '    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' + colors.reset);
    console.log('');

    const shouldSendByDays = (lastSent, days) => {
        if (!lastSent) return true;
        const diffDays = Math.floor((Date.now() - new Date(lastSent)) / (1000 * 60 * 60 * 24));
        return diffDays >= days;
    };

    const buildSummaryMessage = (label, totalMinutes, sessionsCount, tasksCount, completedTasks, topSubject, streak) => (
        `Your ${label} StudyFlow Summary\n\n` +
        `Total study time: ${Math.round(totalMinutes)} minutes\n` +
        `Sessions completed: ${sessionsCount}\n` +
        `Tasks created: ${tasksCount}\n` +
        `Tasks completed: ${completedTasks}\n` +
        (topSubject ? `Top subject: ${topSubject.name} (${Math.round(topSubject.minutes)} min)\n` : '') +
        `Current streak: ${streak || 0} days\n`
    );

    const sendSummaryEmail = async ({ user, label, daysBack, lastSentField, subject }) => {
        const now = new Date();
        const startDate = new Date(now);
        startDate.setDate(now.getDate() - daysBack);

        if (!shouldSendByDays(user[lastSentField], daysBack)) return;

        const sessions = await Session.find({
            user: user._id,
            timestamp: { $gte: startDate, $lte: now }
        });
        const tasks = await Task.find({
            user: user._id,
            createdAt: { $gte: startDate, $lte: now }
        });

        const totalMinutes = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
        const completedTasks = tasks.filter(t => t.completed).length;
        const subjectBreakdown = {};
        sessions.forEach(s => {
            const subject = s.subject || 'Unspecified';
            subjectBreakdown[subject] = (subjectBreakdown[subject] || 0) + (s.duration || 0);
        });

        const topSubjectName = Object.keys(subjectBreakdown).sort((a, b) => subjectBreakdown[b] - subjectBreakdown[a])[0];
        const topSubject = topSubjectName
            ? { name: topSubjectName, minutes: subjectBreakdown[topSubjectName] }
            : null;

        const message = buildSummaryMessage(label, totalMinutes, sessions.length, tasks.length, completedTasks, topSubject, user.streakCurrent);

        await sendEmail({
            email: user.email,
            subject,
            heading: `Your ${label} StudyFlow Summary`,
            preheader: `Here is your ${label.toLowerCase()} progress snapshot.`,
            message,
            url: process.env.FRONTEND_URL || 'http://127.0.0.1:5500',
            ctaLabel: 'View Dashboard'
        });

        user[lastSentField] = now;
        await user.save();
    };

    // Summary scheduler (runs daily)
    const sendSummaries = async () => {
        try {
            const users = await User.find({});

            for (const user of users) {
                if (user.dailySummaryEnabled !== false) {
                    try {
                        await sendSummaryEmail({
                            user,
                            label: 'Daily',
                            daysBack: 1,
                            lastSentField: 'lastDailySummarySent',
                            subject: 'Your Daily StudyFlow Summary'
                        });
                    } catch (e) {
                        console.error('Daily summary email failed:', e.message);
                    }
                }

                if (user.weeklySummaryEnabled !== false) {
                    try {
                        await sendSummaryEmail({
                            user,
                            label: 'Weekly',
                            daysBack: 7,
                            lastSentField: 'lastWeeklySummarySent',
                            subject: 'Your Weekly StudyFlow Summary'
                        });
                    } catch (e) {
                        console.error('Weekly summary email failed:', e.message);
                    }
                }

                if (user.monthlySummaryEnabled !== false) {
                    try {
                        await sendSummaryEmail({
                            user,
                            label: 'Monthly',
                            daysBack: 30,
                            lastSentField: 'lastMonthlySummarySent',
                            subject: 'Your Monthly StudyFlow Summary'
                        });
                    } catch (e) {
                        console.error('Monthly summary email failed:', e.message);
                    }
                }
            }
        } catch (e) {
            console.error('Summary scheduler error:', e.message);
        }
    };

    // Run once at startup and then daily
    sendSummaries();
    setInterval(sendSummaries, 24 * 60 * 60 * 1000);
});

// Graceful shutdown handlers
const gracefulShutdown = () => {
    console.log('\n🛑 Shutting down gracefully...');
    server.close(async () => {
        console.log('✅ HTTP server closed');
        try {
            await mongoose.connection.close();
            console.log('✅ MongoDB connection closed');
            process.exit(0);
        } catch (error) {
            console.error('❌ Error closing MongoDB:', error.message);
            process.exit(1);
        }
    });

    // Force close after 10 seconds
    setTimeout(() => {
        console.error('⚠️ Forcing shutdown...');
        process.exit(1);
    }, 10000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);  // For Windows Ctrl+C