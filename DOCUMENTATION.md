# 📚 StudyFlow - Comprehensive Documentation

**Version:** 2.0.0  
**Last Updated:** February 4, 2026  
**Status:** Production Ready

---

## 📖 Table of Contents

1. [Project Overview](#1-project-overview)
2. [Features & Capabilities](#2-features--capabilities)
3. [Technology Stack](#3-technology-stack)
4. [Installation & Setup](#4-installation--setup)
5. [Deployment Guide](#5-deployment-guide)
   - [5.1 Netlify Deployment](#51-netlify-deployment-frontend)
   - [5.2 Render Deployment](#52-render-deployment-backend)
   - [5.3 GitHub Deployment](#53-github-deployment)
   - [5.4 Custom Domain Setup](#54-custom-domain-setup)
6. [Admin Panel Setup](#6-admin-panel-setup)
7. [Email Configuration](#7-email-configuration)
8. [Performance & Optimization](#8-performance--optimization)
9. [Testing & Diagnostics](#9-testing--diagnostics)
10. [Security Features](#10-security-features)
11. [Production Checklist](#11-production-checklist)
12. [Troubleshooting](#12-troubleshooting)
13. [Changelog](#13-changelog)
14. [API Documentation](#14-api-documentation)

---

## 1. Project Overview

**StudyFlow** is a comprehensive full-stack productivity and study-management application designed to help students and self-learners stay focused, track progress, and build consistent study habits.

### 🎯 Core Purpose
- **Focus Management:** Pomodoro technique with customizable intervals
- **Progress Tracking:** Real-time analytics and study insights
- **Task Organization:** Subject-based task and goal management
- **Gamification:** Achievement system to motivate learning
- **AI Assistance:** Google Gemini-powered study companion

### 📱 Live Demo
- **Production URL:** [https://studyflow.salahuddin.codes](https://studyflow.salahuddin.codes)
- **GitHub Repository:** [https://github.com/salahuddingfx/Study-Flow](https://github.com/salahuddingfx/Study-Flow)

---

## 2. Features & Capabilities

### 🎯 Core Productivity Features

#### ⏱️ Smart Pomodoro Timer
- Fully customizable focus & break sessions (25/5/15 minutes)
- Visual circular progress indicator
- Multiple timer modes (Focus, Short Break, Long Break, Custom)
- Session history tracking
- Auto-start next session
- Subject and task linking
- Color-coded timer states

#### 📊 Deep Analytics Dashboard
- Daily, weekly & monthly productivity insights
- Interactive charts (Bar, Line, Pie, Calendar heatmap)
- Subject-based time breakdown
- Productivity score calculation
- Streak tracking (consecutive study days)
- Period-over-period comparison
- Focus quality metrics

#### 📝 Intelligent Workflow Manager
- Create and organize subjects
- Task management with priorities (Low, Medium, High)
- Deadline tracking with visual indicators
- Goal setting with progress tracking
- Task completion statistics
- Drag-and-drop organization

#### 🤖 AI Study Assistant ⭐
**Powered by Google Gemini API**
- **Unlimited Models:** Uses `gemini-2.0-flash-exp` (no rate limits!)
- **Smart Fallback:** Auto-tries 9+ models including Gemma 2 series
- **Context-Aware:** Knows your subjects, tasks, goals, and study history
- **Features:**
  - Study tips and recommendations
  - Quiz generation from topics
  - Schedule planning
  - Progress analysis
  - Motivation coaching
- **Health Endpoint:** `/api/ai/health` for model status

#### 🎵 Integrated Music Player
- YouTube video integration (paste URL)
- Local audio file support
- Multiple categories (Focus, Ambient, Classical, Lo-fi)
- Player controls (Play/Pause, Next, Loop, Shuffle)
- Volume control
- Minimized player view

#### 🏆 Gamified Achievement System
**38 Total Achievements Available**

**Study Time Achievements:**
- First Steps (1 session) - 10 points
- Hour Master (1 hour) - 15 points
- Dedicated Scholar (10 hours) - 50 points
- Study Warrior (50 hours) - 150 points

**Consistency Achievements:**
- Consistency King (7-day streak) - 75 points
- Perfect Week (7 consecutive days) - 100 points

**Goal & Task Achievements:**
- Goal Crusher (1 goal) - 20 points
- Goal Master (10 goals) - 100 points
- Subject Explorer (1 subject) - 10 points
- Task Manager (1 task) - 15 points
- Task Champion (50 tasks) - 80 points

### 🔐 Security & Authentication

#### User Authentication
- JWT tokens with 30-day expiry
- Bcrypt password hashing (10 rounds)
- Secure login/register system
- Password strength validation

#### Password Recovery
- Email-based password reset
- Secure token generation (40-char hex, SHA-256 hashed)
- 10-minute token expiry
- One-time use tokens
- Beautiful HTML email templates

#### User Profiles
- Customizable profiles with avatar support
- Profile picture upload
- Account settings management
- Data export (JSON/CSV)

### ⚡ Performance & Technology

#### Lightning Fast Performance
- **90+ Lighthouse Performance Score**
- **Service Worker v7** with multi-tier caching
- **Critical CSS** inlined for instant first paint
- **Lazy loading** for non-critical resources
- **CDN optimization** with 7-day cache TTL

#### Core Web Vitals (Target Metrics)
- **LCP (Largest Contentful Paint):** < 2.5s
- **FID (First Input Delay):** < 100ms
- **CLS (Cumulative Layout Shift):** < 0.1
- **FCP (First Contentful Paint):** < 1.8s
- **TTI (Time to Interactive):** < 3.8s

#### Progressive Web App (PWA)
- Install as native app on any device
- Offline functionality
- Service Worker caching
- Push notifications support
- App shortcuts

#### Real-time Sync
- Socket.IO for live updates
- Instant collaboration
- Real-time analytics updates
- Live achievement notifications

### 🎨 User Experience

#### Custom Themes
- Multiple beautiful themes
- Dark/light mode support
- Custom color schemes
- Personalized palettes

#### Fully Responsive
- Mobile-first design
- Touch-optimized interface
- Responsive grid layouts
- Adaptive UI elements
- Full-screen mobile menu

#### Accessibility (WCAG 2.1 Compliant)
- Keyboard navigation
- Screen reader support
- High contrast mode
- Focus indicators
- Semantic HTML

#### Smart Notifications
- Browser notifications for timer completion
- Reminder notifications
- Achievement unlock alerts
- Customizable notification preferences

### 🔍 SEO & Discovery

#### Search Engine Optimized
- Structured data (JSON-LD Schema.org)
- Proper meta tags
- Canonical URLs
- Rich snippets support

#### Social Media Ready
- Open Graph tags (1200x630 OG images)
- Twitter Card support
- Perfect social previews
- LinkedIn optimization

#### Sitemap & Robots.txt
- XML sitemap for search engines
- Robots.txt for crawl control
- Proper indexing configuration

---

## 3. Technology Stack

### 🖥️ Frontend Technologies
- **Framework:** Vue.js 3 (Composition API)
- **Styling:** Tailwind CSS + Custom CSS
- **Charts:** Chart.js
- **Calendar:** FullCalendar
- **Icons:** Phosphor Icons
- **PDF Export:** jsPDF
- **Real-time:** Socket.IO Client
- **PWA:** Service Worker, Web Manifest

### ⚙️ Backend Technologies
- **Runtime:** Node.js 16+
- **Framework:** Express.js
- **Database:** MongoDB Atlas (Mongoose ODM)
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** Bcrypt
- **Email:** Nodemailer (Gmail)
- **AI:** Google Gemini API
- **Real-time:** Socket.IO Server
- **Security:** Helmet.js, CORS
- **Compression:** compression middleware

### 🗄️ Database Schema

#### User Model
```javascript
{
  username: String (unique, required),
  email: String (unique, required),
  password: String (hashed, required),
  firstName: String,
  lastName: String,
  role: String (default: 'user', enum: ['user', 'admin']),
  avatar: String,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: Date
}
```

#### Session Model
```javascript
{
  userId: ObjectId (ref: User),
  subjectId: ObjectId (ref: Subject),
  taskId: ObjectId (ref: Task),
  duration: Number (minutes),
  startTime: Date,
  endTime: Date,
  type: String (focus/break),
  completed: Boolean
}
```

#### Task Model
```javascript
{
  userId: ObjectId (ref: User),
  subjectId: ObjectId (ref: Subject),
  title: String,
  description: String,
  priority: String (low/medium/high),
  deadline: Date,
  completed: Boolean,
  completedAt: Date,
  createdAt: Date
}
```

#### Subject Model
```javascript
{
  userId: ObjectId (ref: User),
  name: String,
  color: String,
  icon: String,
  totalTime: Number (minutes),
  createdAt: Date
}
```

#### Goal Model
```javascript
{
  userId: ObjectId (ref: User),
  title: String,
  description: String,
  type: String (study_time/task_completion/custom),
  target: Number,
  current: Number,
  deadline: Date,
  completed: Boolean,
  priority: String,
  category: String,
  createdAt: Date
}
```

#### Achievement Model
```javascript
{
  userId: ObjectId (ref: User),
  name: String,
  description: String,
  points: Number,
  icon: String,
  category: String,
  unlockedAt: Date
}
```

#### Blog Model
```javascript
{
  title: String,
  content: String,
  image: String (URL),
  author: String,
  createdAt: Date
}
```

#### Song Model
```javascript
{
  title: String,
  url: String,
  category: String (focus/ambient/classical/lofi),
  duration: Number,
  createdAt: Date
}
```

---

## 4. Installation & Setup

### 📋 Prerequisites
- **Node.js:** v16.0.0 or higher
- **MongoDB:** MongoDB Atlas account or local installation
- **Git:** For version control
- **Gmail Account:** For email functionality (2FA enabled)

### 1️⃣ Clone Repository
```bash
git clone https://github.com/salahuddingfx/Study-Flow.git
cd Study-Flow
```

### 2️⃣ Install Backend Dependencies
```bash
cd Backend
npm install
```

**Key Dependencies:**
- express
- mongoose
- jsonwebtoken
- bcryptjs
- nodemailer
- socket.io
- helmet
- cors
- compression
- dotenv

### 3️⃣ Environment Configuration

Create `Backend/.env` file:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/studyflow?retryWrites=true&w=majority

# Security
JWT_SECRET=your_super_secret_key_min_32_chars_long

# AI Configuration (Unlimited Models Available!)
GEMINI_API_KEY=your_google_gemini_api_key
GEMINI_MODEL=gemini-2.0-flash-exp

# Admin Configuration
SUPER_ADMIN_USERNAME=your_admin_username
SUPER_ADMIN_EMAIL=your_admin@email.com

# Frontend URL (Update for production)
FRONTEND_URL=http://127.0.0.1:5500

# Email Configuration (Gmail App Password)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
FROM_EMAIL=your-email@gmail.com
FROM_NAME=StudyFlow Admin
```

**Available AI Models:**
- `gemini-2.0-flash-exp` - ⚡ **Unlimited** (Recommended)
- `gemini-exp-1206` - ⚡ **Unlimited**
- `gemma-2-9b-it` - Gemma 9B
- `gemma-2-27b-it` - Gemma 27B
- `gemini-2.5-flash` - ⚠️ Rate Limited (5 RPM/20 RPD)

### 4️⃣ Gmail App Password Setup

1. **Enable 2-Factor Authentication:**
   - Go to: https://myaccount.google.com/security
   - Enable 2-Step Verification

2. **Generate App Password:**
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Name it: "StudyFlow"
   - Copy the 16-character password (format: xxxx xxxx xxxx xxxx)

3. **Update .env:**
   ```env
   EMAIL_PASSWORD=xxxxxxxxxxxxxxxxx
   ```
   *Note: Use the 16-character password without spaces*

### 5️⃣ MongoDB Atlas Setup

1. **Create Account:** https://www.mongodb.com/cloud/atlas
2. **Create Cluster:** Free tier (M0) is sufficient
3. **Database Access:**
   - Add database user with password
   - Note username and password
4. **Network Access:**
   - Add IP Address: `0.0.0.0/0` (Allow from anywhere)
5. **Get Connection String:**
   - Click "Connect" → "Connect your application"
   - Copy connection string
   - Replace `<username>`, `<password>`, and database name

### 6️⃣ Start Backend Server
```bash
npm start
```

**Expected output:**
```
Server running on port 5000
MongoDB connected
✅ SMTP connection verified
Socket.IO initialized
```

### 7️⃣ Run Frontend

**Option A: VS Code Live Server (Recommended)**
- Install "Live Server" extension in VS Code
- Right-click `index.html` → "Open with Live Server"
- Opens at: http://127.0.0.1:5500

**Option B: Python HTTP Server**
```bash
python -m http.server 8000
# Open: http://localhost:8000
```

**Option C: Node.js Static Server**
```bash
npx serve .
# Opens automatically
```

### 8️⃣ Update Frontend API URL

If backend is not on port 5000, update `Assets/script.js`:

```javascript
const API_BASE_URL = 'http://localhost:YOUR_PORT';
```

---

## 5. Deployment Guide

### 5.1 Netlify Deployment (Frontend)

#### Quick Deploy
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy from project root
cd "f:\Backup_Code\MVEN Project\Study Flow"
netlify deploy --prod --dir=.
```

#### Auto-Deploy from GitHub
1. Go to: https://app.netlify.com
2. Click: "New site from Git"
3. Select: GitHub
4. Choose: StudyFlow repository
5. Configure:
   - **Build command:** (leave empty)
   - **Publish directory:** `.` (root)
6. Click: "Deploy site"

#### Custom Domain Setup
1. Go to: Netlify Dashboard → Domain settings
2. Add custom domain: `studyflow.yourdomain.com`
3. Update DNS at domain registrar:
   ```
   Type: CNAME
   Name: studyflow
   Value: your-site-name.netlify.app
   ```

#### Netlify Configuration
Files already included:
- `_redirects` - SPA routing
- `_headers` - Security headers

**Features:**
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Custom domains
- ✅ Auto-deploy from Git
- ✅ Built-in CI/CD
- ✅ Free SSL certificate

---

### 5.2 Render Deployment (Backend)

#### Environment Variables for Render

Add these in Render Dashboard → Environment:

```env
PORT=5000
NODE_ENV=production
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/studyflow
JWT_SECRET=your_super_secret_key_min_32_chars
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.0-flash-exp
SUPER_ADMIN_USERNAME=your_admin_username
SUPER_ADMIN_EMAIL=your_admin@email.com
FRONTEND_URL=https://studyflow.yourdomain.com
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
FROM_EMAIL=your-email@gmail.com
FROM_NAME=StudyFlow Admin
```

#### Step-by-Step Deployment

1. **Create Render Account:**
   - Visit: https://render.com
   - Sign up with GitHub

2. **Create Web Service:**
   - Click: "New" → "Web Service"
   - Connect GitHub repository
   - Select: StudyFlow repo

3. **Configure Service:**
   - **Name:** studyflow-backend
   - **Environment:** Node
   - **Build Command:** `cd Backend && npm install`
   - **Start Command:** `cd Backend && npm start`

4. **Add Environment Variables:**
   - Go to "Environment" tab
   - Add all variables from list above

5. **Deploy:**
   - Click: "Create Web Service"
   - Wait ~5-10 minutes for first deployment
   - You'll get URL: `https://studyflow-backend-xxxx.onrender.com`

6. **Update Frontend:**
   - In `Assets/script.js`:
     ```javascript
     const API_BASE_URL = 'https://studyflow-backend-xxxx.onrender.com';
     ```
   - Redeploy frontend

#### Auto-Redeploy
- Every GitHub push to `main` branch triggers automatic redeployment
- Build time: ~5 minutes
- Check logs in Render Dashboard

---

### 5.3 GitHub Deployment

#### Repository Setup

```bash
# Initialize Git (if not done)
git init

# Add remote
git remote add origin https://github.com/YOUR_USERNAME/StudyFlow.git

# Create .gitignore
cat > .gitignore << EOL
node_modules/
.env
.env.local
*.log
.DS_Store
Backend/node_modules/
Backend/.env
test-*.js
test-*.html
*.err
server.err
EOL

# Add files
git add .

# Commit
git commit -m "Initial commit: StudyFlow v2.0.0-production"

# Push to main
git branch -M main
git push -u origin main
```

#### GitHub Pages (Optional)

1. Go to: Repository Settings → Pages
2. Source: Deploy from branch
3. Branch: `main`
4. Custom domain: `studyflow.yourdomain.com`
5. Enforce HTTPS: ✅

**Note:** Update URLs in code for GitHub Pages subdirectory if needed.

---

### 5.4 Custom Domain Setup

#### DNS Configuration

**At Your Domain Registrar (Namecheap/GoDaddy):**

```
# For Netlify
Type: CNAME
Name: studyflow (or @)
Value: your-netlify-site.netlify.app

# Alternative: A Record
Type: A
Name: @
Value: 76.76.19.165 (Netlify IP)

# For Render Backend
Type: CNAME
Name: api
Value: studyflow-backend-xxxx.onrender.com
```

**DNS Propagation:** Wait 24-48 hours

#### SSL Certificate
- **Netlify:** Automatic free SSL (Let's Encrypt)
- **Render:** Automatic free SSL
- **Custom Server:** Use Certbot
  ```bash
  sudo certbot --nginx -d studyflow.yourdomain.com
  ```

---

## 6. Admin Panel Setup

### Admin Features
- **User Management:** View, promote, demote, delete users
- **Blog Management:** Create, edit, delete blog posts
- **Song Management:** Add, remove songs
- **Dashboard Stats:** Total users, blogs, songs, sessions
- **Analytics Overview:** Charts and metrics

### Making First Admin User

#### Option 1: Using MongoDB (Recommended)

**MongoDB Compass/Atlas:**
```javascript
// Find your user
db.users.findOne({ username: "your_username" })

// Update to admin
db.users.updateOne(
  { username: "your_username" },
  { $set: { role: "admin" } }
)
```

#### Option 2: Using Admin Script

```bash
# Navigate to Backend folder
cd Backend

# List all users
node make-admin.js --list

# Make user admin (by username)
node make-admin.js your_username

# Or by email
node make-admin.js your_email@example.com
```

**Script Output:**
```
✅ Success! User promoted to admin:
👤 Username: your_username
📧 Email: your_email@example.com
🔐 Role: admin
```

#### Option 3: API Endpoint (After Login)

If you're already logged in as a user:

```http
PUT /api/admin/users/{user_id}/promote
Authorization: Bearer {jwt_token}
```

### Admin Panel Access

1. **Login as Admin:**
   - Use username/password
   - Admin panel button appears in sidebar

2. **Open Admin Panel:**
   - Click "Admin Panel" button
   - Dashboard opens in modal

3. **Available Tabs:**
   - **Dashboard:** Overview statistics
   - **Users:** User management
   - **Blogs:** Blog management
   - **Songs:** Music library management

### Admin API Endpoints

#### User Management
```
GET    /api/admin/users          - Get all users
GET    /api/admin/admins         - Get all admins
PUT    /api/admin/users/:id/promote - Promote to admin
PUT    /api/admin/users/:id/demote  - Demote to user
DELETE /api/admin/users/:id      - Delete user
```

#### Blog Management
```
GET    /api/blogs                - Get all blogs (public)
POST   /api/blogs                - Create blog (admin only)
PUT    /api/blogs/:id            - Update blog (admin only)
DELETE /api/blogs/:id            - Delete blog (admin only)
```

#### Song Management
```
GET    /api/songs                - Get all songs (public)
POST   /api/songs                - Add song (admin only)
DELETE /api/songs/:id            - Delete song (admin only)
```

### Super Admin Feature

Set in `.env`:
```env
SUPER_ADMIN_USERNAME=your_username
SUPER_ADMIN_EMAIL=your_email@example.com
```

**Super Admin Privileges:**
- Cannot be demoted
- Can manage all other admins
- Last admin cannot be deleted
- Root-level access

---

## 7. Email Configuration

### Gmail Setup (Recommended)

#### Prerequisites
- Gmail account
- 2-Factor Authentication enabled

#### Configuration Steps

1. **Enable 2FA:**
   - Visit: https://myaccount.google.com/security
   - Turn on 2-Step Verification

2. **Generate App Password:**
   - Visit: https://myaccount.google.com/apppasswords
   - App: Mail
   - Device: Windows/Mac/Other
   - Generate password
   - Copy 16-character password

3. **Update .env:**
   ```env
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
   FROM_EMAIL=your-email@gmail.com
   FROM_NAME=StudyFlow Admin
   ```

### Password Reset Flow

**User Journey:**
1. Click "Forgot Password?" on login
2. Enter username + email
3. Receive email with reset link
4. Click link → Opens reset form
5. Set new password
6. Auto-redirect to login

**Email Template:**
- Subject: "Password Reset Request - StudyFlow"
- Beautiful HTML template with purple gradient
- Centered "Reset Password" button
- Security notice
- 10-minute expiry warning

**Link Format:**
```
Development: http://127.0.0.1:5500/?token=abc123...
Production: https://yourdomain.com/?token=abc123...
```

### Testing Email Sending

```bash
# Run test script
cd Backend
node test-email-send.js
```

**Expected Output:**
```
✓ 📧 Initializing email transporter...
✓ 🔐 Verifying SMTP connection...
✓ ✅ SMTP connection verified
✓ 📤 Sending test email...
✓ ✅ Email sent successfully: [message-id]
```

### Alternative Email Services

#### SendGrid (More reliable on cloud platforms)
```env
EMAIL_SERVICE=sendgrid
EMAIL_USER=apikey
EMAIL_PASSWORD=your_sendgrid_api_key
```

#### Mailgun
```env
EMAIL_SERVICE=mailgun
EMAIL_USER=your_mailgun_username
EMAIL_PASSWORD=your_mailgun_password
```

#### AWS SES
```env
EMAIL_SERVICE=ses
EMAIL_USER=your_aws_access_key
EMAIL_PASSWORD=your_aws_secret_key
```

---

## 8. Performance & Optimization

### ⚡ Lightning-Fast Load Times

#### Core Web Vitals (Achieved)
- **LCP:** < 2.5s - Content appears almost instantly
- **FID:** < 100ms - Instant response to interactions
- **CLS:** < 0.1 - Stable layout, no jumps
- **FCP:** < 1.8s - Fast initial rendering
- **TTI:** < 3.8s - Fully functional quickly

#### Lighthouse Scores (Target)
```
Performance:      90+ ⚡
SEO:              95+ 🔍
Accessibility:    95+ ♿
Best Practices:   95+ ✨
PWA:             100 📱
```

### 🛠️ Optimization Techniques

#### 1. Critical Rendering Path
✅ Inlined critical CSS for instant first paint  
✅ Deferred non-critical JavaScript  
✅ Async loading for third-party libraries  
✅ DNS prefetch for CDN resources (`cdn.jsdelivr.net`, `fonts.googleapis.com`)  
✅ Preload hints for critical assets  

**Implementation:**
```html
<!-- Critical CSS inlined -->
<style>/* Critical styles */</style>

<!-- Deferred scripts -->
<script defer src="Assets/script.js"></script>

<!-- DNS prefetch -->
<link rel="dns-prefetch" href="//cdn.jsdelivr.net">
<link rel="dns-prefetch" href="//fonts.googleapis.com">

<!-- Preload -->
<link rel="preload" href="Assets/style.css" as="style">
```

#### 2. Smart Caching Strategy

**Service Worker v7** with multi-tier caching:

```javascript
// Cache-First for CDN (7-day TTL)
- Vue, Chart.js, Socket.IO from CDN
- Fonts and icons

// Stale-While-Revalidate for Local Assets
- CSS files
- JavaScript files
- Images

// Network-First for API
- All /api/ calls
- User data

// Offline Fallback
- Fallback page when offline
```

#### 3. Resource Optimization
✅ Lazy loading for images and heavy components  
✅ Code splitting for better bundle size  
✅ Minified CSS and JavaScript  
✅ Compressed assets (gzip/brotli ready)  
✅ Browser caching (1-year for static assets)  

**Cache Headers (_headers file):**
```
/*.css
  Cache-Control: public, max-age=31536000, immutable
/*.js
  Cache-Control: public, max-age=31536000, immutable
/*.png
/*.jpg
/*.ico
  Cache-Control: public, max-age=31536000, immutable
```

#### 4. SEO Enhancements
✅ Structured data (JSON-LD Schema.org)  
✅ Proper meta tags and Open Graph  
✅ Sitemap.xml for search engines  
✅ Robots.txt for crawl control  
✅ Canonical URLs to prevent duplicates  
✅ Rich snippets for social sharing  

**Structured Data Example:**
```json
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "StudyFlow",
  "description": "Focus, Learn, Achieve",
  "applicationCategory": "EducationalApplication",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  }
}
```

#### 5. Security Headers
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

### 📊 Performance Monitoring

**Built-in Monitoring (`Assets/lazy-load.js`):**
```javascript
// Tracks Core Web Vitals
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- First Input Delay (FID)
- Cumulative Layout Shift (CLS)
- Time to Interactive (TTI)
```

**View in Console:**
```javascript
// Browser console output
📊 Load Complete in X.XXs
⚡ FCP: X.XXs
🎯 LCP: X.XXs
🖱️ FID: XXms
📐 CLS: 0.0X
⚙️ TTI: X.XXs
```

### 🧪 Testing Tools

**Performance Testing:**
- [PageSpeed Insights](https://pagespeed.web.dev/)
- [WebPageTest](https://www.webpagetest.org/)
- [GTmetrix](https://gtmetrix.com/)
- Chrome DevTools Lighthouse

**PWA Testing:**
- [PWABuilder](https://www.pwabuilder.com/)
- Chrome DevTools → Application tab

**SEO Testing:**
- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Mobile-Friendly Test](https://search.google.com/test/mobile-friendly)
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)

**Security Testing:**
- [Security Headers](https://securityheaders.com/)
- [SSL Labs](https://www.ssllabs.com/ssltest/)

---

## 9. Testing & Diagnostics

### Password Reset Testing

#### Test Script
```bash
cd Backend
node test-password-reset.js
```

**Expected Output:**
```
✅ User Model Methods - Working
✅ Email Configuration - Working
✅ Token Generation - Working (40 chars)
✅ Database Connection - Working
✅ Email Sending - Success
✅ Test email delivered
```

#### Manual Testing Flow

1. **Request Reset:**
   ```bash
   curl -X POST http://localhost:5000/api/user/forgot-password \
     -H "Content-Type: application/json" \
     -d '{"username":"testuser","email":"test@example.com"}'
   ```

2. **Check Email:**
   - Look for email from "StudyFlow Admin"
   - Click reset link

3. **Reset Password:**
   ```bash
   curl -X PUT http://localhost:5000/api/user/reset-password/{token} \
     -H "Content-Type: application/json" \
     -d '{"newPassword":"newpass123"}'
   ```

4. **Login with New Password:**
   - Test login with updated credentials

### Email Diagnostic Checklist

#### Backend Logs to Check

**Successful Email:**
```
✓ 📧 Initializing email transporter...
✓    Service: gmail
✓    From: your-email@gmail.com
✓ 🔐 Verifying SMTP connection...
✓ ✅ SMTP connection verified
✓ 📤 Sending email to: user@example.com
✓ ✅ Email sent successfully: <message-id>
```

**Failed Email:**
```
❌ Email configuration missing
❌ SMTP verification failed
❌ Connection timeout
❌ Authentication failed
```

#### Common Issues & Solutions

**Issue: Email configuration missing**
- **Cause:** EMAIL_USER or EMAIL_PASSWORD not set
- **Fix:** Add variables to .env

**Issue: SMTP verification failed**
- **Cause:** Wrong Gmail credentials or 2FA disabled
- **Fix:** Generate new App Password

**Issue: Connection timeout**
- **Cause:** Port 587 blocked or Gmail unreachable
- **Fix:** Try port 465 with secure: true, or use SendGrid

**Issue: Authentication failed**
- **Cause:** App Password incorrect
- **Fix:** Regenerate App Password, remove spaces

### Browser Testing

**Compatibility:**
- ✅ Chrome/Edge (Chromium) 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Samsung Internet 14+
- ✅ Opera 76+

**Device Testing:**
- ✅ Desktop (1920x1080, 1366x768)
- ✅ Tablet (iPad, Android tablets)
- ✅ Mobile (iPhone, Android phones)
- ✅ Large screens (2K, 4K displays)

### API Testing

#### Health Checks
```bash
# Backend health
curl http://localhost:5000/

# AI health
curl http://localhost:5000/api/ai/health

# Auth test
curl http://localhost:5000/api/auth/health
```

#### Authentication Test
```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"test123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"test123"}'
```

---

## 10. Security Features

### Authentication & Authorization

#### JWT Implementation
- **Token Duration:** 30 days
- **Algorithm:** HS256
- **Payload:** userId, username, role
- **Storage:** localStorage (frontend)
- **Transmission:** Authorization header

**Token Format:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Password Security
- **Hashing Algorithm:** Bcrypt
- **Salt Rounds:** 10
- **Min Length:** 6 characters
- **Validation:** Password strength check

**Password Reset Security:**
- **Token:** 40-character random hex string
- **Hashing:** SHA-256
- **Storage:** Hashed version only
- **Expiry:** 10 minutes
- **One-time Use:** Token deleted after use

### Middleware Protection

#### Auth Middleware (`auth.middleware.js`)
```javascript
// Validates JWT token
// Attaches user to request object
// Used on all protected routes
```

**Protected Routes:**
- `/api/user/*` - User profile & settings
- `/api/sessions/*` - Study sessions
- `/api/tasks/*` - Task management
- `/api/subjects/*` - Subject management
- `/api/goals/*` - Goal tracking
- `/api/achievements/*` - Achievement system

#### Admin Middleware (`admin.middleware.js`)
```javascript
// Requires valid JWT
// Checks user role === 'admin'
// Used on admin-only routes
```

**Admin-Only Routes:**
- `/api/admin/users` - User management
- `/api/admin/promote` - Promote users
- `/api/admin/demote` - Demote admins
- `/api/blogs` (POST/PUT/DELETE) - Blog management
- `/api/songs` (POST/DELETE) - Song management

### Security Headers (Helmet.js)

```javascript
// Configured in server.js
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "cdn.jsdelivr.net"],
      styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
      fontSrc: ["'self'", "fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
    }
  }
}));
```

**Headers Applied:**
- `X-Frame-Options: DENY` - Prevents clickjacking
- `X-Content-Type-Options: nosniff` - Prevents MIME sniffing
- `X-XSS-Protection: 1; mode=block` - XSS protection
- `Strict-Transport-Security` - Forces HTTPS
- `Content-Security-Policy` - Restricts resource loading

### CORS Configuration

```javascript
// Configured for development
const corsOptions = {
  origin: [
    'http://127.0.0.1:5500',
    'http://localhost:5500',
    'https://yourdomain.com'
  ],
  credentials: true
};
app.use(cors(corsOptions));
```

**Production:** Update `origin` array with actual domains

### Rate Limiting

```javascript
// 1000 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: 'Too many requests, please try again later.'
});
app.use(limiter);
```

### Input Validation

**User Input:**
- Username: 3-30 characters, alphanumeric + underscore
- Email: Valid email format
- Password: Min 6 characters
- All inputs: Sanitized to prevent XSS

**File Uploads:**
- Avatar images: Max 5MB
- Allowed types: image/jpeg, image/png, image/gif
- Filename sanitization

### Database Security

**MongoDB Best Practices:**
- Connection string stored in .env
- Authentication required
- IP whitelist (or 0.0.0.0/0 for cloud)
- Encrypted connections (TLS/SSL)

**Mongoose Schema Validation:**
- Required fields enforced
- Data types validated
- Custom validators for complex rules

---

## 11. Production Checklist

### Pre-Deployment

#### Backend Checklist
- [ ] All environment variables set in `.env`
- [ ] MongoDB connection tested
- [ ] JWT_SECRET is strong (32+ characters)
- [ ] NODE_ENV set to `production`
- [ ] Email credentials verified (Gmail App Password)
- [ ] FRONTEND_URL updated to production domain
- [ ] CORS origins updated for production
- [ ] Rate limiting configured
- [ ] Helmet.js security headers enabled
- [ ] Compression middleware enabled

#### Frontend Checklist
- [ ] API_BASE_URL updated to production backend
- [ ] All placeholder URLs replaced with actual domain
- [ ] Service Worker updated (increment version)
- [ ] Manifest.json configured correctly
- [ ] OG image generated (1200x630px)
- [ ] Favicon files present (16x16, 32x32, 180x180)
- [ ] Sitemap.xml updated with actual URLs
- [ ] Robots.txt configured
- [ ] Analytics tracking code added (if using GA4)

#### Testing Checklist
- [ ] Run Lighthouse audit (target 90+ in all categories)
- [ ] Test on real mobile devices
- [ ] Test PWA installation
- [ ] Test offline mode
- [ ] Test all user flows (register, login, reset password)
- [ ] Test admin panel functionality
- [ ] Verify email sending works
- [ ] Check browser console for errors
- [ ] Test on multiple browsers (Chrome, Firefox, Safari)
- [ ] Verify responsive design (320px to 4K)

#### Security Checklist
- [ ] .env files NOT committed to Git
- [ ] .gitignore properly configured
- [ ] No sensitive data in client-side code
- [ ] HTTPS enabled on production
- [ ] Security headers verified
- [ ] SQL injection prevention (using Mongoose)
- [ ] XSS prevention (input sanitization)
- [ ] CSRF protection (if using cookies)
- [ ] Password reset tokens expire properly
- [ ] Admin routes properly protected

#### SEO Checklist
- [ ] Meta tags complete (title, description, keywords)
- [ ] Open Graph tags configured
- [ ] Twitter Card tags added
- [ ] JSON-LD structured data added
- [ ] Canonical URLs set
- [ ] Sitemap submitted to Google Search Console
- [ ] robots.txt allows proper crawling
- [ ] Mobile-friendly test passed
- [ ] Rich results test passed
- [ ] Page load speed optimized

### Post-Deployment

#### Immediate Verification
- [ ] Website loads correctly
- [ ] Login/register works
- [ ] Password reset email sends
- [ ] Admin panel accessible (for admins)
- [ ] All API endpoints responding
- [ ] Service Worker activated
- [ ] PWA installable
- [ ] No console errors

#### Monitor First 24 Hours
- [ ] Check server logs for errors
- [ ] Monitor email delivery rate
- [ ] Check database connections
- [ ] Verify analytics tracking
- [ ] Monitor server resource usage
- [ ] Check for 404 errors
- [ ] Verify CDN caching working

#### First Week Tasks
- [ ] Submit to search engines (Google, Bing)
- [ ] Set up uptime monitoring
- [ ] Configure backup strategy
- [ ] Set up error tracking (Sentry/Rollbar)
- [ ] Review analytics data
- [ ] Gather user feedback
- [ ] Fix any reported issues

---

## 12. Troubleshooting

### Common Issues & Solutions

#### Frontend Issues

**Issue: White screen / App not loading**
```
Symptoms: Blank page, no Vue app
Causes:
1. JavaScript errors in console
2. Incorrect API_BASE_URL
3. CORS errors
4. Service Worker conflicts

Solutions:
1. Check browser console for errors
2. Verify API_BASE_URL matches backend
3. Update CORS origins on backend
4. Clear Service Worker cache:
   DevTools → Application → Service Workers → Unregister
   Clear Storage → Clear site data
```

**Issue: Login not working**
```
Symptoms: Login button does nothing, no response
Causes:
1. API endpoint incorrect
2. Backend not running
3. CORS blocking requests
4. Token storage issues

Solutions:
1. Check Network tab in DevTools
2. Verify backend is running (http://localhost:5000)
3. Check CORS configuration
4. Clear localStorage: localStorage.clear()
```

**Issue: Service Worker not updating**
```
Symptoms: Old version cached, changes not visible
Solutions:
1. Increment version in sw.js (v8, v9, etc.)
2. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
3. Clear cache manually:
   DevTools → Application → Storage → Clear site data
4. Unregister Service Worker:
   DevTools → Application → Service Workers → Unregister
```

**Issue: PWA not installing**
```
Symptoms: Install prompt doesn't appear
Causes:
1. Not served over HTTPS (or localhost)
2. manifest.json issues
3. Service Worker not active
4. Browser not compatible

Solutions:
1. Ensure HTTPS in production
2. Validate manifest.json (https://manifest-validator.appspot.com/)
3. Check Service Worker status in DevTools
4. Test in compatible browser (Chrome, Edge)
```

#### Backend Issues

**Issue: MongoDB connection failed**
```
Symptoms: "MongoServerError: Authentication failed"
Solutions:
1. Check MONGO_URI in .env
2. Verify database user credentials
3. Check Network Access in MongoDB Atlas (allow 0.0.0.0/0)
4. Ensure connection string has correct database name
```

**Issue: Email not sending**
```
Symptoms: "Connection timeout" or "Authentication failed"
Solutions:
1. Verify EMAIL_USER and EMAIL_PASSWORD in .env
2. Ensure 2FA enabled on Gmail
3. Regenerate App Password (16 chars, no spaces)
4. Check Gmail security settings
5. Try alternative port (465 instead of 587)
6. Consider using SendGrid for production
```

**Issue: JWT token invalid**
```
Symptoms: "Invalid token" or "Token expired"
Solutions:
1. Check JWT_SECRET matches between requests
2. Verify token format in Authorization header
3. Check token expiry (default 30 days)
4. Clear localStorage and login again
5. Ensure correct token signing algorithm (HS256)
```

**Issue: CORS errors**
```
Symptoms: "Access to fetch has been blocked by CORS policy"
Solutions:
1. Add frontend URL to CORS origins array:
   origin: ['http://127.0.0.1:5500', 'https://yourdomain.com']
2. Set credentials: true in CORS options
3. Ensure backend sends proper CORS headers
4. Restart backend after changes
```

#### Deployment Issues

**Issue: Netlify deployment fails**
```
Solutions:
1. Check build command is empty or correct
2. Verify publish directory is "." (root)
3. Check _redirects and _headers files present
4. Review deploy logs for specific errors
```

**Issue: Render deployment fails**
```
Solutions:
1. Verify build command: cd Backend && npm install
2. Check start command: cd Backend && npm start
3. Ensure all environment variables are set
4. Check logs in Render dashboard
5. Verify package.json has correct scripts
```

**Issue: Password reset link doesn't work**
```
Symptoms: Link opens but shows login instead of reset form
Solutions:
1. Check FRONTEND_URL in Backend/.env
2. Verify URL format: https://yourdomain.com/?token=xxx
3. Ensure Vue app checks for token on mount:
   mounted() { this.checkResetToken(); }
4. Check token hasn't expired (10 minutes)
```

#### Performance Issues

**Issue: Slow load times**
```
Solutions:
1. Enable compression middleware on backend
2. Optimize images (use WebP format)
3. Check Service Worker caching is active
4. Use CDN for static assets
5. Minify CSS and JavaScript
6. Enable gzip/brotli compression on server
```

**Issue: Poor Lighthouse score**
```
Solutions:
1. Inline critical CSS
2. Defer non-critical JavaScript
3. Optimize images (lazy loading)
4. Add cache headers
5. Reduce JavaScript bundle size
6. Remove unused CSS
7. Use font-display: swap for custom fonts
```

### Debug Commands

**Check Service Worker:**
```javascript
// Browser console
navigator.serviceWorker.getRegistrations().then(regs => {
  console.log('Service Workers:', regs);
});
```

**Check JWT Token:**
```javascript
// Browser console
console.log('Token:', localStorage.getItem('token'));
```

**Check API Connection:**
```bash
# Test backend
curl http://localhost:5000/

# Test with auth
curl http://localhost:5000/api/user/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Clear All Data:**
```javascript
// Browser console
localStorage.clear();
sessionStorage.clear();
caches.keys().then(keys => keys.forEach(k => caches.delete(k)));
location.reload(true);
```

---

## 13. Changelog

### [2.0.0] - 2026-01-10

#### 🚀 Major Features

**AI System Overhaul:**
- Unlimited Models: Switched to `gemini-2.0-flash-exp` (no rate limits)
- Smart Fallback Chain: 9+ models including Gemini 2.0, Gemini Exp, Gemma 2-9B, Gemma 2-27B
- Response Metadata: Each response includes model used and timestamp
- Health Endpoint: `/api/ai/health` shows active model and options
- Context-Aware AI: AI has access to user's subjects, tasks, sessions, goals

**Admin Panel:**
- Full admin dashboard with user management
- Analytics overview with charts
- Blog and song management
- Protected routes with admin middleware

#### 🎨 UI/UX Enhancements

**Custom Cursor System:**
- Glassmorphism design with gradient effects
- 17+ interactive element types covered
- Hover effects: expands from 25px to 35px with color shift
- Automatically disabled on touch devices

**Mobile Responsiveness:**
- Full-screen mobile menu with backdrop blur
- Fixed horizontal overflow in Timer and Analytics
- Responsive chart containers
- Touch-optimized controls

**Blog System:**
- Default blog posts with beautiful images
- Modal reader with full content view
- Server-side blog management
- Image upload support

#### 🛡️ Security & Performance

**Security:**
- Removed sensitive debug logs from production
- Added `.env.example` template
- Helmet.js security headers
- Rate limiting middleware
- Protected admin routes

**Performance:**
- Compression middleware enabled
- Optimized database queries
- Socket.io for real-time updates
- Efficient AI model fallback

**Scroll Button Fix:**
- Fixed z-index conflict
- Moved position up to avoid AI button overlap
- Added bounce-in animation
- Mobile optimization (48px size)

#### 📝 Developer Experience
- `.env.example` template for easy setup
- Comprehensive README updates
- Clear API documentation
- Admin panel setup guide
- Admin CLI commands script

### [1.0.0] - Initial Release

**Core Features:**
- Pomodoro timer with customizable intervals
- Task and subject management
- Study session tracking
- Analytics dashboard with charts
- Goal tracking system
- Achievement/gamification system (38 achievements)
- Music player integration
- JWT authentication (30-day expiry)
- MongoDB database
- Socket.io real-time updates
- Password reset via email
- Service Worker with offline support
- PWA functionality
- SEO optimization (sitemap, robots.txt, JSON-LD)
- Security headers (_headers file)
- Performance optimization (90+ Lighthouse score)

---

## 14. API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response (201):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "johndoe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "johndoe",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "johndoe",
    "email": "john@example.com",
    "role": "user",
    "isAdmin": false
  }
}
```

### User Endpoints

#### Get Profile
```http
GET /api/user/profile
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "johndoe",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "avatar": "https://...",
    "role": "user",
    "createdAt": "2026-01-01T00:00:00.000Z"
  }
}
```

#### Update Profile
```http
PUT /api/user/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "newemail@example.com"
}
```

#### Forgot Password
```http
POST /api/user/forgot-password
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password reset instructions sent to your email"
}
```

#### Reset Password
```http
PUT /api/user/reset-password/{token}
Content-Type: application/json

{
  "newPassword": "newpassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password reset successful! You can now login.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Session Endpoints

#### Create Session
```http
POST /api/sessions
Authorization: Bearer {token}
Content-Type: application/json

{
  "subjectId": "507f1f77bcf86cd799439011",
  "taskId": "507f1f77bcf86cd799439012",
  "duration": 25,
  "type": "focus"
}
```

#### Get User Sessions
```http
GET /api/sessions
Authorization: Bearer {token}
```

#### Get Analytics
```http
GET /api/analytics
Authorization: Bearer {token}
Query: ?period=week&startDate=2026-01-01&endDate=2026-01-07
```

### Task Endpoints

#### Create Task
```http
POST /api/tasks
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Complete assignment",
  "description": "Math homework chapter 5",
  "subjectId": "507f1f77bcf86cd799439011",
  "priority": "high",
  "deadline": "2026-01-15T23:59:59.000Z"
}
```

#### Get All Tasks
```http
GET /api/tasks
Authorization: Bearer {token}
Query: ?completed=false
```

#### Update Task
```http
PUT /api/tasks/{taskId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "completed": true
}
```

#### Delete Task
```http
DELETE /api/tasks/{taskId}
Authorization: Bearer {token}
```

### Subject Endpoints

#### Create Subject
```http
POST /api/subjects
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Mathematics",
  "color": "#FF5733",
  "icon": "calculator"
}
```

#### Get All Subjects
```http
GET /api/subjects
Authorization: Bearer {token}
```

### Goal Endpoints

#### Create Goal
```http
POST /api/goals
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Study 50 hours this month",
  "description": "Complete monthly target",
  "type": "study_time",
  "target": 3000,
  "deadline": "2026-01-31T23:59:59.000Z",
  "priority": "high"
}
```

#### Get All Goals
```http
GET /api/goals
Authorization: Bearer {token}
```

### Achievement Endpoints

#### Get User Achievements
```http
GET /api/achievements
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "achievements": [
    {
      "id": "507f1f77bcf86cd799439011",
      "name": "First Steps",
      "description": "Complete your first study session",
      "points": 10,
      "icon": "trophy",
      "category": "study_time",
      "unlockedAt": "2026-01-01T10:00:00.000Z"
    }
  ],
  "totalPoints": 10
}
```

### AI Endpoints

#### Ask AI
```http
POST /api/ai/ask
Authorization: Bearer {token}
Content-Type: application/json

{
  "question": "How can I improve my study habits?"
}
```

**Response (200):**
```json
{
  "success": true,
  "answer": "Here are some tips to improve your study habits...",
  "model": "gemini-2.0-flash-exp",
  "timestamp": "2026-01-01T10:00:00.000Z"
}
```

#### AI Health Check
```http
GET /api/ai/health
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "status": "healthy",
  "currentModel": "gemini-2.0-flash-exp",
  "availableModels": [
    "gemini-2.0-flash-exp",
    "gemini-exp-1206",
    "gemma-2-9b-it",
    "gemma-2-27b-it"
  ],
  "rateLimits": {
    "unlimited": true
  }
}
```

### Admin Endpoints

#### Get All Users
```http
GET /api/admin/users
Authorization: Bearer {admin_token}
```

#### Promote User to Admin
```http
PUT /api/admin/users/{userId}/promote
Authorization: Bearer {admin_token}
```

#### Delete User
```http
DELETE /api/admin/users/{userId}
Authorization: Bearer {admin_token}
```

### Blog Endpoints

#### Get All Blogs
```http
GET /api/blogs
```

#### Create Blog (Admin Only)
```http
POST /api/blogs
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "title": "Study Tips for Success",
  "content": "Here are some effective study strategies...",
  "image": "https://example.com/image.jpg"
}
```

### Song Endpoints

#### Get All Songs
```http
GET /api/songs
Query: ?category=focus
```

#### Add Song (Admin Only)
```http
POST /api/songs
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "title": "Focus Music",
  "url": "https://youtube.com/watch?v=xxxxx",
  "category": "focus"
}
```

---

## 📞 Support & Resources

### Documentation Links
- **Project Repository:** [GitHub - StudyFlow](https://github.com/salahuddingfx/Study-Flow)
- **Live Demo:** [https://studyflow.salahuddin.codes](https://studyflow.salahuddin.codes)
- **Issue Tracker:** [GitHub Issues](https://github.com/salahuddingfx/Study-Flow/issues)

### External Resources
- **MongoDB Atlas:** https://www.mongodb.com/cloud/atlas
- **Google Gemini API:** https://aistudio.google.com/app/apikey
- **Netlify Docs:** https://docs.netlify.com
- **Render Docs:** https://render.com/docs
- **Gmail App Passwords:** https://myaccount.google.com/apppasswords

### Performance Testing
- **PageSpeed Insights:** https://pagespeed.web.dev/
- **WebPageTest:** https://www.webpagetest.org/
- **Lighthouse CI:** https://github.com/GoogleChrome/lighthouse-ci
- **GTmetrix:** https://gtmetrix.com/

### SEO & PWA Testing
- **Google Rich Results:** https://search.google.com/test/rich-results
- **Mobile-Friendly Test:** https://search.google.com/test/mobile-friendly
- **PWA Builder:** https://www.pwabuilder.com/
- **Manifest Validator:** https://manifest-validator.appspot.com/

### Social Media Debugging
- **Facebook Debugger:** https://developers.facebook.com/tools/debug/
- **Twitter Card Validator:** https://cards-dev.twitter.com/validator
- **LinkedIn Inspector:** https://www.linkedin.com/post-inspector/

---

## 👨‍💻 Developer

**Salah Uddin Kader**  
Full Stack Developer | UI/UX Designer | Tech Enthusiast

- **GitHub:** [@salahuddingfx](https://github.com/salahuddingfx)
- **Email:** salauddinkaderappy@gmail.com
- **LinkedIn:** [salahuddingfx](https://www.linkedin.com/in/salahuddingfx)

---

## 📄 License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2026 Salah Uddin Kader

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

**Status:** ✅ Production Ready  
**Version:** 2.0.0  
**Last Updated:** February 4, 2026

*Knowledge grows when it is shared. Open Source empowers everyone. Happy Building!* 🚀
