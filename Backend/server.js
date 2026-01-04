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

// Socket.IO
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

    socket.on('start-timer', (data) => socket.to(`user_${socket.userId}`).emit('timer-started', data));
    socket.on('pause-timer', (data) => socket.to(`user_${socket.userId}`).emit('timer-paused', data));
    socket.on('reset-timer', (data) => socket.to(`user_${socket.userId}`).emit('timer-reset', data));
    socket.on('timer-tick', (data) => socket.to(`user_${socket.userId}`).emit('timer-update', data));

    socket.on('task-created', (task) => socket.to(`user_${socket.userId}`).emit('task-added', task));
    socket.on('task-updated', (task) => socket.to(`user_${socket.userId}`).emit('task-updated', task));
    socket.on('task-deleted', (id) => socket.to(`user_${socket.userId}`).emit('task-deleted', id));
});

// Routes
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'success', uptime: process.uptime() });
});

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/user', require('./routes/user.routes')); 

const taskRoutes = require('./routes/task.routes');
taskRoutes.setIo(io);
app.use('/api/tasks', taskRoutes);

const sessionRoutes = require('./routes/session.routes');
sessionRoutes.setIo(io);
app.use('/api/sessions', sessionRoutes);

const subjectRoutes = require('./routes/subject.routes');
subjectRoutes.setIo(io);
app.use('/api/subjects', subjectRoutes);

app.use('/api/analytics', require('./routes/analytics.routes'));

const goalRoutes = require('./routes/goal.routes');
goalRoutes.setIo(io);
app.use('/api/goals', goalRoutes);

app.use('/api/achievements', require('./routes/achievement.routes'));

// Catch-all
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});

// Error Handling
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

const PORT = process.env.PORT || 5500;
server.listen(PORT, () => {
    console.log(`🚀 Server running optimized on port ${PORT}`);
});

process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        console.log('Process terminated.');
    });
});