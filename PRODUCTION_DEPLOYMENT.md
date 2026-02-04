# 🚀 Production Deployment Guide

**StudyFlow - Complete Production Setup**

---

## 📦 What Changed?

### ✅ **Integrated Authentication System**
- ❌ **Removed:** `login.html`, `reset-password.html`, `auth.css`, `auth.js`
- ✅ **Single Entry Point:** Everything in `index.html`
- ✅ **URL Token Detection:** `?token=xxx` automatically shows reset form
- ✅ **Production Ready:** Domain-based reset links

---

## 🌐 Environment Setup

### **Backend/.env Configuration**

```env
# Server Configuration
PORT=5000
NODE_ENV=production

# Database
MONGO_URI=you_mongo_uri here

# Security
JWT_SECRET=your-very-long-secret-key-min-32-chars

# AI Integration
GEMINI_API_KEY=your-gemini-api-key

# Admin Account
SUPER_ADMIN_USERNAME=your-admin-username
SUPER_ADMIN_EMAIL=your-admin@email.com

# ⚠️ IMPORTANT: Update with your production domain
FRONTEND_URL=https://yourdomain.com

# Email Configuration (Gmail App Password)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
FROM_EMAIL=your-email@gmail.com
FROM_NAME=StudyFlow Admin
```

---

## 🔐 Password Reset Flow (Production)

### **How It Works:**

1. **User clicks "Forgot Password"**
   - Enters username + email
   - Clicks "Send Reset Link"

2. **Backend generates token**
   - Creates secure 40-char token
   - Saves hashed version to database
   - Expires in 10 minutes

3. **Email sent with link**
   - URL format: `https://yourdomain.com/?token=abc123...`
   - Beautiful HTML email template
   - One-click reset button

4. **User clicks link**
   - Opens `yourdomain.com/?token=xxx`
   - Vue app detects token in URL
   - Automatically switches to reset mode
   - Shows password reset form

5. **Password reset**
   - User enters new password
   - Confirms password
   - Submits form
   - Token validated + password updated
   - Auto-redirect to login

---

## 🎯 Deployment Options

### **Option 1: Netlify (Recommended)**

#### **Frontend Deployment:**

```bash
# 1. Install Netlify CLI
npm install -g netlify-cli

# 2. Login to Netlify
netlify login

# 3. Deploy from project root
cd "f:\Backup_Code\MVEN Project\Study Flow"
netlify deploy --prod

# 4. Select these settings:
# - Build command: (leave empty)
# - Publish directory: .
# - Site name: studyflow-your-name
```

#### **Backend Deployment:**

```bash
# 1. Deploy to Render.com
# Go to: https://render.com

# 2. Create New Web Service
# - Connect GitHub repo or manual upload
# - Build command: cd Backend && npm install
# - Start command: cd Backend && npm start
# - Environment: Node

# 3. Add Environment Variables
# Copy all variables from Backend/.env

# 4. Get backend URL
# Example: https://studyflow-backend.onrender.com
```

#### **Update Environment:**

```env
# In Backend/.env on Render
FRONTEND_URL=https://studyflow-your-name.netlify.app

# In Assets/script.js
const API_BASE_URL = 'https://studyflow-backend.onrender.com';
```

---

### **Option 2: Vercel + Railway**

#### **Frontend (Vercel):**

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Deploy
cd "f:\Backup_Code\MVEN Project\Study Flow"
vercel --prod

# 3. Domain will be: https://studyflow.vercel.app
```

#### **Backend (Railway):**

```bash
# 1. Go to railway.app
# 2. Create new project
# 3. Deploy from GitHub
# 4. Add environment variables
# 5. Get deployment URL
```

---

### **Option 3: Custom Domain Setup**

#### **Buy Domain (Namecheap/GoDaddy):**

```bash
# Example: studyflow.io
```

#### **DNS Configuration:**

```
A Record:
@ → Your server IP

CNAME Record:
www → studyflow.io
api → backend-server-ip
```

#### **SSL Certificate:**

```bash
# Use Let's Encrypt (Free)
sudo certbot --nginx -d studyflow.io -d www.studyflow.io
```

#### **Update Environment:**

```env
# Backend/.env
FRONTEND_URL=https://studyflow.io

# Assets/script.js
const API_BASE_URL = 'https://api.studyflow.io';
```

---

## 📧 Email Configuration Guide

### **Gmail App Password Setup:**

1. **Enable 2-Factor Authentication**
   - Go to: https://myaccount.google.com/security
   - Enable 2-Step Verification

2. **Generate App Password**
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Name it: "StudyFlow"
   - Copy the 16-character password

3. **Update .env:**
   ```env
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
   ```

---

## 🧪 Testing Production Setup

### **1. Test Reset Email Locally:**

```bash
# Start backend
cd Backend
npm start

# Send test reset request
curl -X POST http://localhost:5000/api/user/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"username":"salahuddin","email":"salauddinkaderappy@gmail.com"}'

# Check email inbox
# Click link → Should redirect to: http://127.0.0.1:5500/?token=xxx
```

### **2. Test Reset Flow:**

```bash
# Open browser
http://127.0.0.1:5500/?token=test123

# Should show:
# - Password reset form (not login form)
# - "Set New Password" heading
# - New password + confirm password fields
# - Submit button
```

### **3. Test Production Email:**

```bash
# After deploying, update .env
FRONTEND_URL=https://yourdomain.com

# Restart backend
# Send forgot password request
# Email should contain: https://yourdomain.com/?token=xxx
```

---

## 🔒 Security Checklist

### **Before Going Live:**

- [ ] Update `FRONTEND_URL` in Backend/.env
- [ ] Update `API_BASE_URL` in Assets/script.js
- [ ] Generate strong `JWT_SECRET` (32+ characters)
- [ ] Set `NODE_ENV=production`
- [ ] Enable CORS only for your domain
- [ ] Set up SSL certificate (HTTPS)
- [ ] Test password reset email delivery
- [ ] Test token expiry (10 minutes)
- [ ] Verify email template displays correctly
- [ ] Check all links work with production domain

---

## 📊 File Structure (Production Ready)

```
Study Flow/
├── index.html              ✅ Single entry point (auth + dashboard)
├── Assets/
│   ├── script.js           ✅ Reset token detection added
│   ├── style.css           ✅ Scroll button fixed
│   └── critical.css        ✅ Performance optimized
├── Backend/
│   ├── .env                ✅ FRONTEND_URL added
│   ├── controllers/
│   │   ├── auth.controller.js    ✅ Login/Register
│   │   └── user.controller.js    ✅ Password reset
│   ├── utils/
│   │   └── sendEmail.js    ✅ Production URL support
│   └── routes/
│       └── user.routes.js  ✅ Reset endpoints
├── manifest.json           ✅ PWA ready
├── sw.js                   ✅ Service Worker v6
├── robots.txt              ✅ SEO ready
└── sitemap.xml             ✅ Search engines ready
```

**❌ Removed (unnecessary):**
- login.html
- reset-password.html
- auth.css
- auth.js

---

## 🚀 Quick Production Commands

### **Deploy Everything:**

```bash
# 1. Update .env
FRONTEND_URL=https://yourdomain.com

# 2. Update script.js
const API_BASE_URL = 'https://api.yourdomain.com';

# 3. Deploy frontend
netlify deploy --prod

# 4. Deploy backend (Render)
git push origin main

# 5. Test
curl https://yourdomain.com
curl https://api.yourdomain.com/api/auth/health

# 6. Send test reset email
# Use production domain in reset link
```

---

## 📝 User-Facing URLs

### **Production:**

```
Main App:        https://yourdomain.com
Login:           https://yourdomain.com (auto-shows if not logged in)
Reset Password:  https://yourdomain.com/?token=xxx (from email)
API:             https://api.yourdomain.com
```

### **Development:**

```
Main App:        http://127.0.0.1:5500
Login:           http://127.0.0.1:5500 (auto-shows if not logged in)
Reset Password:  http://127.0.0.1:5500/?token=xxx
API:             http://localhost:5000
```

---

## ✅ Production Checklist

- [x] Integrated auth into index.html
- [x] Removed separate login/reset pages
- [x] Added URL token detection
- [x] Updated email templates with domain URLs
- [x] Added FRONTEND_URL environment variable
- [x] Optimized for single-page deployment
- [x] SEO ready (robots.txt, sitemap.xml)
- [x] PWA ready (manifest.json, service worker)
- [x] Security headers configured
- [ ] **Update FRONTEND_URL before deployment**
- [ ] **Update API_BASE_URL before deployment**
- [ ] **Test email delivery in production**
- [ ] **Set up custom domain (optional)**

---

## 🎉 Ready to Deploy!

**Your StudyFlow app is now production-ready with:**
- ✅ Single-page application (index.html)
- ✅ Integrated authentication
- ✅ URL-based password reset
- ✅ Production domain support
- ✅ Beautiful email templates
- ✅ Secure token system
- ✅ 10-minute token expiry
- ✅ Mobile-optimized UI
- ✅ PWA support
- ✅ SEO optimized

**Just update your domain and deploy! 🚀**

---

**Last Updated:** February 3, 2026  
**Version:** Production Ready v1.0  
**Status:** ✅ READY FOR DEPLOYMENT
