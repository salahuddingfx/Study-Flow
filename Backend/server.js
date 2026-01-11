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

// 1️⃣ Initialize Database
connectDB();

// 2️⃣ Initialize App
const app = express();
const server = http.createServer(app);

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

    // Clean up listeners on disconnect to prevent memory leaks
    socket.on('disconnect', () => {
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