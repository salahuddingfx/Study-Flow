# 🔒 StudyFlow Security Policy

**Status:** ✅ v2.0 Production Ready | 🚧 v2.5 In Active Development  
**Version:** 2.5.0 (In Development)  
**Last Updated:** March 2, 2026

---

## 📋 Table of Contents

1. [Supported Versions](#supported-versions)
2. [Security Features](#security-features)
3. [Authentication & Authorization](#authentication--authorization)
4. [Data Protection](#data-protection)
5. [API Security](#api-security)
6. [v2.5 Security Enhancements](#v25-security-enhancements)
7. [Reporting a Vulnerability](#reporting-a-vulnerability)
8. [Security Best Practices](#security-best-practices)
9. [Compliance](#compliance)

---

## ✅ Supported Versions

Currently supported versions with security updates:

| Version | Status | Support Level | End of Support |
|---------|--------|---------------|----------------|
| 2.5.x (Dev) | 🚧 In Development | Active Development | TBA |
| 2.0.x | ✅ Current Stable | Full Support | June 2027 |
| 1.5.x | ⚠️ Maintenance | Security Patches Only | December 2026 |
| < 1.5 | ❌ Unsupported | No Support | Ended |

**Recommendation:** Always use the latest stable version (currently 2.0.x) for production deployments.

---

## 🛡️ Security Features (v2.0)

### 1. Authentication System

**JWT-Based Authentication:**
- Secure token generation with 24-hour expiration
- HTTP-only cookie storage (XSS protection)
- Token refresh mechanism
- Automatic logout on inactivity

**Password Security:**
- bcrypt hashing with salt rounds (12)
- Minimum password requirements:
  - At least 8 characters
  - One uppercase letter
  - One lowercase letter
  - One number
  - One special character
- Password reset via secure email link (1-hour expiration)

**Example Implementation:**
```javascript
// Backend/middleware/auth.middleware.js
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};
```

### 2. Input Validation & Sanitization

**Protection Against:**
- SQL Injection (MongoDB parameterized queries)
- NoSQL Injection (input sanitization)
- XSS Attacks (HTML escaping)
- CSRF Attacks (CSRF tokens)

**Validation Libraries:**
- express-validator for request validation
- DOMPurify for HTML sanitization
- validator.js for email/URL validation

**Example:**
```javascript
// Backend/routes/auth.routes.js
const { body, validationResult } = require('express-validator');

router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }).isStrongPassword(),
  body('username').trim().isLength({ min: 3, max: 30 })
    .matches(/^[a-zA-Z0-9_]+$/)
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  // Process registration...
});
```

### 3. Rate Limiting

**Protection Against:**
- Brute force attacks
- DDoS attacks
- API abuse

**Limits:**
```javascript
// Backend/server.js
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Max 100 requests per window
  message: 'Too many requests, please try again later.'
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // Max 5 login attempts per 15 minutes
  skipSuccessfulRequests: true
});

app.use('/api/', limiter);
app.use('/api/auth/login', authLimiter);
```

### 4. CORS Configuration

**Secure Cross-Origin Requests:**
```javascript
// Backend/server.js
const cors = require('cors');

app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://studyflow.salahuddin.codes',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### 5. Environment Variables

**Sensitive Data Protection:**
- All secrets stored in `.env` file (not committed)
- Environment-specific configurations
- Secure key management

**Example `.env`:**
```env
# Never commit this file!
JWT_SECRET=your_super_secret_jwt_key_here_change_this
MONGO_URI=mongodb://localhost:27017/studyflow
BREVO_API_KEY=your_brevo_api_key
EMAIL_FROM=noreply@studyflow.com
FRONTEND_URL=https://studyflow.salahuddin.codes
NODE_ENV=production
```

---

## 🔐 Authentication & Authorization

### Authentication Flow

```
Client                          Server                       Database
  │                               │                             │
  │──── POST /auth/register ────>│                             │
  │      (email, password)        │                             │
  │                               │─── Hash Password ─────────>│
  │                               │    (bcrypt, 12 rounds)      │
  │                               │<─── Store User ────────────│
  │                               │                             │
  │<─── JWT Token ───────────────│                             │
  │     (24h expiration)          │                             │
  │                               │                             │
  │──── GET /api/user/profile ──>│                             │
  │     Authorization: Bearer     │                             │
  │                               │─── Verify Token ──────────>│
  │                               │<─── User Data ─────────────│
  │<─── User Profile ────────────│                             │
```

### Authorization Middleware

**Role-Based Access Control (RBAC):**
```javascript
// Backend/middleware/admin.middleware.js
const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      error: 'Access denied. Admin privileges required.' 
    });
  }
  next();
};

// Usage
router.delete('/api/admin/users/:id', 
  authMiddleware, 
  adminMiddleware, 
  adminController.deleteUser
);
```

**Resource Ownership Verification:**
```javascript
// Ensure users can only access their own data
const ownershipMiddleware = (req, res, next) => {
  const resourceUserId = req.params.userId || req.body.userId;
  
  if (resourceUserId !== req.userId) {
    return res.status(403).json({ 
      error: 'Access denied. You can only access your own resources.' 
    });
  }
  next();
};
```

---

## 🗄️ Data Protection

### Database Security

**MongoDB Security Measures:**
1. **Authentication Required:**
   ```javascript
   mongodb://username:password@host:port/database?authSource=admin
   ```

2. **Connection Encryption:**
   - TLS/SSL enabled for production
   - Certificate validation

3. **Query Parameterization:**
   ```javascript
   // ✅ SAFE - Parameterized query
   const user = await User.findOne({ email: req.body.email });
   
   // ❌ UNSAFE - Never do this
   const user = await User.findOne({
     $where: `this.email == "${req.body.email}"`
   });
   ```

### Data Encryption

**Encryption at Rest:**
- MongoDB encryption enabled (Enterprise)
- Sensitive fields encrypted (e.g., API keys)

**Encryption in Transit:**
- HTTPS/TLS for all communications
- Secure WebSocket connections (WSS)

**Field-Level Encryption:**
```javascript
// Backend/models/User.js
const crypto = require('crypto');

userSchema.methods.encryptSensitiveData = function(data) {
  const cipher = crypto.createCipher('aes-256-cbc', process.env.ENCRYPTION_KEY);
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
};

userSchema.methods.decryptSensitiveData = function(encrypted) {
  const decipher = crypto.createDecipher('aes-256-cbc', process.env.ENCRYPTION_KEY);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};
```

### Data Retention & Privacy

**GDPR Compliance:**
- User data deletion on request
- Data export functionality
- Privacy policy and consent
- Audit logs for data access

**Data Anonymization:**
```javascript
// Anonymize user data for analytics
const anonymizedData = {
  userId: crypto.createHash('sha256').update(user._id.toString()).digest('hex'),
  totalSessions: user.totalSessions,
  // No PII included
};
```

---

## 🔒 API Security

### Secure Headers

**Helmet.js Configuration:**
```javascript
// Backend/server.js
const helmet = require('helmet');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}));
```

### Request Validation

**Schema Validation:**
```javascript
// Backend/validators/taskValidator.js
const taskSchema = {
  title: {
    type: 'string',
    minLength: 1,
    maxLength: 200,
    required: true
  },
  subject: {
    type: 'string',
    pattern: '^[a-zA-Z0-9 ]+$'
  },
  priority: {
    type: 'string',
    enum: ['low', 'medium', 'high']
  }
};
```

### API Key Management

**Secure API Keys:**
- Stored in environment variables
- Rotated regularly (every 90 days)
- Scoped permissions
- Usage monitoring

---

## 🚀 v2.5 Security Enhancements

### 1. WebSocket Security

**Real-Time Communication Protection:**

**Authentication:**
```javascript
// Backend/websocket/socketAuth.js
const socketAuth = (socket, next) => {
  const token = socket.handshake.auth.token;
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    socket.userRole = decoded.role;
    next();
  } catch (error) {
    next(new Error('Authentication failed'));
  }
};

io.use(socketAuth);
```

**Room Authorization:**
```javascript
// Verify user is member of study group before joining room
socket.on('joinRoom', async (roomId) => {
  const isMember = await Group.exists({
    _id: roomId,
    'members.userId': socket.userId
  });
  
  if (!isMember) {
    socket.emit('error', { message: 'Access denied to this room' });
    return;
  }
  
  socket.join(roomId);
});
```

**Message Validation:**
```javascript
// Sanitize and validate all incoming messages
socket.on('sendMessage', async (data) => {
  // Validate message format
  if (!data.message || typeof data.message !== 'string') {
    return socket.emit('error', { message: 'Invalid message format' });
  }
  
  // Sanitize HTML
  const sanitizedMessage = DOMPurify.sanitize(data.message);
  
  // Rate limiting (max 10 messages per minute)
  const messageCount = await redis.incr(`msg_count:${socket.userId}`);
  await redis.expire(`msg_count:${socket.userId}`, 60);
  
  if (messageCount > 10) {
    return socket.emit('error', { message: 'Rate limit exceeded' });
  }
  
  // Broadcast message
  io.to(data.roomId).emit('newMessage', {
    userId: socket.userId,
    message: sanitizedMessage,
    timestamp: Date.now()
  });
});
```

### 2. Redis Security

**Secure Caching Layer:**

**Connection Security:**
```javascript
// Backend/config/redis.js
const redis = require('redis');

const client = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
  tls: process.env.NODE_ENV === 'production' ? {} : undefined,
  db: 0
});

// Enable ACL (Access Control Lists)
// Only allow specific commands for each connection type
```

**Data Encryption:**
```javascript
// Encrypt sensitive data before caching
const cacheUserData = async (userId, data) => {
  const encrypted = encrypt(JSON.stringify(data));
  await redis.set(`user:${userId}`, encrypted, 'EX', 3600);
};

const getCachedUserData = async (userId) => {
  const encrypted = await redis.get(`user:${userId}`);
  if (!encrypted) return null;
  return JSON.parse(decrypt(encrypted));
};
```

### 3. File Upload Security

**Cloudinary/S3 Integration:**

**Upload Validation:**
```javascript
// Backend/middleware/fileUpload.js
const multer = require('multer');
const path = require('path');

const upload = multer({
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
  fileFilter: (req, file, cb) => {
    // Allow only specific file types
    const allowedTypes = /jpeg|jpg|png|pdf|docx/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Invalid file type'));
  }
});

// Virus scanning (ClamAV integration)
const scanFile = async (fileBuffer) => {
  const NodeClam = require('clamscan');
  const clamscan = await new NodeClam().init();
  const { isInfected } = await clamscan.scanBuffer(fileBuffer);
  return !isInfected;
};

router.post('/upload', upload.single('file'), async (req, res) => {
  // Scan file for viruses
  const safe = await scanFile(req.file.buffer);
  if (!safe) {
    return res.status(400).json({ error: 'File contains malware' });
  }
  
  // Upload to Cloudinary
  const result = await cloudinary.uploader.upload(req.file.path, {
    folder: 'studyflow/notes',
    resource_type: 'auto',
    access_control: [{ access_type: 'token' }]
  });
  
  res.json({ url: result.secure_url });
});
```

### 4. Enhanced Logging & Monitoring

**Audit Logs:**
```javascript
// Backend/models/AuditLog.js
const auditLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: { 
    type: String, 
    enum: ['login', 'logout', 'data_export', 'data_delete', 'settings_change']
  },
  ipAddress: String,
  userAgent: String,
  metadata: mongoose.Schema.Types.Mixed,
  timestamp: { type: Date, default: Date.now }
});

// Middleware to log all sensitive operations
const auditMiddleware = (action) => async (req, res, next) => {
  req.on('finish', async () => {
    await AuditLog.create({
      userId: req.userId,
      action: action,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      metadata: {
        method: req.method,
        path: req.path,
        statusCode: res.statusCode
      }
    });
  });
  next();
};
```

**Security Monitoring:**
```javascript
// Backend/services/securityMonitor.js
const monitor = {
  // Detect suspicious login patterns
  checkSuspiciousLogin: async (userId, ipAddress) => {
    const recentLogins = await AuditLog.find({
      userId,
      action: 'login',
      timestamp: { $gte: Date.now() - 3600000 } // Last hour
    });
    
    const uniqueIPs = new Set(recentLogins.map(log => log.ipAddress));
    
    // Alert if multiple IPs in short time
    if (uniqueIPs.size > 3) {
      await sendSecurityAlert(userId, 'Multiple login locations detected');
    }
  },
  
  // Detect brute force attempts
  checkBruteForce: async (ipAddress) => {
    const failedAttempts = await redis.get(`failed_login:${ipAddress}`);
    if (failedAttempts > 10) {
      // Block IP temporarily
      await redis.set(`blocked_ip:${ipAddress}`, '1', 'EX', 3600);
      return true;
    }
    return false;
  }
};
```

### 5. Two-Factor Authentication (2FA)

**Coming in v2.5:**
```javascript
// Backend/utils/2fa.js
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

const enable2FA = async (userId) => {
  const secret = speakeasy.generateSecret({
    name: `StudyFlow (${user.email})`
  });
  
  const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);
  
  // Save secret to user (encrypted)
  await User.findByIdAndUpdate(userId, {
    'twoFA.secret': encrypt(secret.base32),
    'twoFA.enabled': false // Enable after verification
  });
  
  return { qrCodeUrl, secret: secret.base32 };
};

const verify2FA = (secret, token) => {
  return speakeasy.totp.verify({
    secret: decrypt(secret),
    encoding: 'base32',
    token: token,
    window: 2 // Allow 2 time steps for clock drift
  });
};
```

### 6. Content Security Policy (CSP)

**Enhanced CSP for v2.5:**
```javascript
// More strict CSP with nonce-based script loading
app.use((req, res, next) => {
  const nonce = crypto.randomBytes(16).toString('base64');
  res.locals.nonce = nonce;
  
  res.setHeader('Content-Security-Policy', `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' https://cdn.jsdelivr.net;
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https://res.cloudinary.com;
    connect-src 'self' wss://studyflow.salahuddin.codes;
    font-src 'self' data:;
    frame-src 'none';
    object-src 'none';
  `.replace(/\s{2,}/g, ' ').trim());
  
  next();
});
```

---

## 🚨 Reporting a Vulnerability

### How to Report

If you discover a security vulnerability in StudyFlow, please follow responsible disclosure:

**📧 Email:** security@studyflow.salahuddin.codes  
**🔒 PGP Key:** Available upon request  
**⏱️ Response Time:** Within 48 hours

### What to Include

1. **Description** of the vulnerability
2. **Steps to reproduce** the issue
3. **Potential impact** assessment
4. **Suggested fix** (if any)
5. **Your contact information**

### Our Commitment

- ✅ Acknowledge receipt within 48 hours
- ✅ Provide regular updates (at least weekly)
- ✅ Credit you in release notes (if desired)
- ✅ Fix critical vulnerabilities within 7 days
- ✅ Fix high-severity issues within 30 days
- ✅ Maintain confidentiality until patch is released

### Hall of Fame

We recognize security researchers who help make StudyFlow safer:

| Researcher | Vulnerability | Severity | Date |
|------------|---------------|----------|------|
| *Your name here* | - | - | - |

---

## 📘 Security Best Practices

### For Developers

1. **Never Commit Secrets:**
   ```bash
   # Add to .gitignore
   .env
   .env.local
   .env.production
   config/secrets.js
   ```

2. **Regular Dependency Updates:**
   ```bash
   # Check for vulnerabilities
   npm audit
   
   # Fix automatically
   npm audit fix
   
   # Update dependencies
   npm update
   ```

3. **Use Security Linters:**
   ```bash
   # ESLint security plugin
   npm install --save-dev eslint-plugin-security
   
   # Add to .eslintrc.js
   plugins: ['security'],
   extends: ['plugin:security/recommended']
   ```

4. **Code Review Checklist:**
   - [ ] No hardcoded credentials
   - [ ] Input validation on all endpoints
   - [ ] Authorization checks present
   - [ ] Sensitive data encrypted
   - [ ] Error messages don't leak information
   - [ ] Rate limiting applied

### For Users

1. **Strong Passwords:**
   - Use unique passwords for StudyFlow
   - Enable 2FA when available (v2.5)
   - Never share credentials

2. **Secure Your Account:**
   - Log out on shared devices
   - Review login history regularly
   - Report suspicious activity

3. **Data Privacy:**
   - Review privacy settings
   - Export your data regularly
   - Be cautious with third-party integrations

---

## ✅ Compliance

### Standards & Regulations

**GDPR (General Data Protection Regulation):**
- ✅ Right to access data
- ✅ Right to data portability
- ✅ Right to erasure ("right to be forgotten")
- ✅ Consent management
- ✅ Data breach notification (within 72 hours)

**CCPA (California Consumer Privacy Act):**
- ✅ Disclosure of data collection
- ✅ Opt-out of data sales (we don't sell data)
- ✅ Data deletion requests

**OWASP Top 10 (2021):**
- ✅ A01: Broken Access Control → Role-based access, ownership verification
- ✅ A02: Cryptographic Failures → bcrypt, TLS/SSL, encryption
- ✅ A03: Injection → Parameterized queries, input validation
- ✅ A04: Insecure Design → Security by design principles
- ✅ A05: Security Misconfiguration → Helmet.js, secure headers
- ✅ A06: Vulnerable Components → Regular dependency updates
- ✅ A07: Authentication Failures → JWT, rate limiting, 2FA (v2.5)
- ✅ A08: Software Integrity → Package verification, SRI
- ✅ A09: Logging Failures → Comprehensive audit logs
- ✅ A10: SSRF → URL validation, allowlist

### Security Certifications

**Planned:**
- SOC 2 Type II (2026)
- ISO 27001 (2027)
- HIPAA Compliance (if handling health data)

---

**Team:** Salah Uddin Kader & Sohana Rahman  
**Status:** ✅ v2.0 Production Ready | 🚧 v2.5 In Active Development  
**Version:** 2.5.0 (In Development)  
**Last Updated:** March 2, 2026

**v2.5 Security Additions:**
- 🔐 WebSocket authentication and authorization
- 🗄️ Redis security with ACL and encryption
- 📁 Secure file upload with virus scanning
- 📊 Enhanced audit logging and monitoring
- 🔑 Two-factor authentication (2FA)
- 🛡️ Stricter Content Security Policy

*Security is not a product, but a process.* 🔒
