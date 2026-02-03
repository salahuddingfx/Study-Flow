# 🚀 Deployment to studyflow.salahuddin.codes

## 📋 What You Have Ready

✅ **Frontend:** `index.html` (single-page app)
✅ **Backend:** Node.js + Express
✅ **Database:** MongoDB Atlas (already connected)
✅ **Email:** Gmail configured
✅ **Domain:** studyflow.salahuddin.codes (already set in .env)
✅ **Password Reset:** Fully working

---

## 🎯 Deployment Options

### **Option 1: Netlify (Recommended for Frontend)**

#### **Step 1: Prepare Frontend**
```bash
# All files are already in root:
- index.html
- Assets/ (css, js, images)
- manifest.json
- sw.js
- robots.txt
- sitemap.xml
- _headers
- _redirects
```

#### **Step 2: Deploy to Netlify**
```bash
# Method A: Using Netlify CLI
npm install -g netlify-cli
netlify login
cd "f:\Backup_Code\MVEN Project\Study Flow"
netlify deploy --prod --dir=.

# Method B: Drag & Drop
# Go to https://app.netlify.com
# Drag the entire project folder
```

#### **Step 3: Set Custom Domain**
```
1. Go to Netlify Dashboard
2. Site settings → Domain settings
3. Add custom domain: studyflow.salahuddin.codes
4. Update your domain DNS:
   - Go to your domain registrar (Namecheap/GoDaddy)
   - Add CNAME: studyflow.salahuddin.codes → your-netlify-domain.netlify.app
```

---

### **Option 2: Render.com (For Backend)**

#### **Step 1: Deploy Backend**
```bash
# 1. Go to https://render.com
# 2. Click "New +" → "Web Service"
# 3. Select GitHub repo (or upload manually)
# 4. Build Command:
cd Backend && npm install

# 5. Start Command:
cd Backend && npm start

# 6. Add Environment Variables:
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=...
GEMINI_API_KEY=...
SUPER_ADMIN_USERNAME=salahuddin
SUPER_ADMIN_EMAIL=...
FRONTEND_URL=https://studyflow.salahuddin.codes
EMAIL_SERVICE=gmail
EMAIL_USER=...
EMAIL_PASSWORD=...
FROM_EMAIL=...
FROM_NAME=StudyFlow Admin
```

#### **Step 2: Get Backend URL**
```
Render will give you: https://studyflow-backend-xxxx.onrender.com
```

#### **Step 3: Update Frontend**
```javascript
// In Assets/script.js (line ~12)
const API_BASE_URL = 'https://studyflow-backend-xxxx.onrender.com';
```

---

### **Option 3: Vercel (Alternative)**

#### **Frontend:**
```bash
npm install -g vercel
vercel --prod
# Choose studyflow.salahuddin.codes as domain
```

#### **Backend on Railway:**
```bash
# Go to railway.app
# Create project → Deploy from GitHub
# Add same environment variables
```

---

## 📁 File Structure for Deployment

```
studyflow.salahuddin.codes/
├── index.html              ✅ Main app
├── Assets/
│   ├── style.css           ✅ Styles
│   ├── script.js           ✅ Vue app
│   ├── critical.css        ✅ Performance
│   ├── lazy-load.js        ✅ Monitoring
│   └── images/             ✅ Icons & images
├── manifest.json           ✅ PWA
├── sw.js                   ✅ Service Worker
├── robots.txt              ✅ SEO
├── sitemap.xml             ✅ SEO
├── _headers                ✅ Security
├── _redirects              ✅ Routing
└── test-reset-link.html    ✅ Testing
```

---

## 🔗 DNS Setup (If Custom Domain)

### **At Your Domain Registrar (Namecheap/GoDaddy):**

```
Type: CNAME
Name: @ (or studyflow)
Value: your-netlify-domain.netlify.app

OR

Type: A
Name: @
Value: 76.76.19.165 (Netlify IP)
```

**Wait 24-48 hours for DNS propagation**

---

## ✅ After Deployment Checklist

- [ ] Frontend deployed to domain
- [ ] Backend deployed to Render/Railway
- [ ] Update `API_BASE_URL` in script.js
- [ ] Test login at: https://studyflow.salahuddin.codes
- [ ] Test password reset email
- [ ] Verify SSL certificate (HTTPS)
- [ ] Test Service Worker: DevTools → Application
- [ ] Run Lighthouse audit
- [ ] Test on mobile
- [ ] Submit sitemap to Google Search Console

---

## 🧪 Testing After Deployment

### **1. Check Website**
```
https://studyflow.salahuddin.codes/
```

### **2. Test Login**
```
Username: salahuddin
Password: (your password)
```

### **3. Test Password Reset**
```
1. Click "Forgot Password?"
2. Enter: salahuddin + salauddinkaderappy@gmail.com
3. Check email for reset link
4. Click link with token
5. Should see reset form
6. Set new password
```

### **4. Check Console**
```
DevTools → Console
Should see:
✅ Service Worker registered
✅ Load Complete
✅ No errors
```

---

## 🚨 Common Issues & Fixes

### **Issue: API calls failing (CORS error)**
```
Solution: Update API_BASE_URL in script.js
const API_BASE_URL = 'https://your-backend-url.onrender.com';
```

### **Issue: Email not sending**
```
Solution: Verify .env variables on Render
EMAIL_USER: must be Gmail address
EMAIL_PASSWORD: must be App Password (not regular password)
```

### **Issue: Reset link not working**
```
Solution: Check FRONTEND_URL in Backend/.env
FRONTEND_URL=https://studyflow.salahuddin.codes
```

### **Issue: SSL Certificate**
```
Solution: Netlify provides free SSL automatically
Just wait for DNS propagation (24-48 hours)
```

---

## 📞 Quick Deployment Steps

### **For Netlify (Frontend):**
```bash
1. cd "f:\Backup_Code\MVEN Project\Study Flow"
2. netlify deploy --prod --dir=.
3. Add domain in Netlify dashboard
4. Update DNS at registrar
```

### **For Render (Backend):**
```bash
1. Go to render.com
2. Connect GitHub or upload Backend folder
3. Set environment variables from .env
4. Get backend URL: https://studyflow-backend.onrender.com
5. Update API_BASE_URL in script.js
6. Redeploy frontend
```

---

## 🎉 After Everything is Live

**Your app will be:**
- ✅ Accessible at: https://studyflow.salahuddin.codes
- ✅ Password reset working via email
- ✅ HTTPS/SSL secure
- ✅ PWA installable
- ✅ SEO optimized
- ✅ Mobile responsive
- ✅ Service Worker caching

---

## 📊 Environment Variables Reference

### **Backend (.env)**
```env
FRONTEND_URL=https://studyflow.salahuddin.codes
API_BASE_URL=https://studyflow-backend.onrender.com
```

### **Frontend (script.js)**
```javascript
API_BASE_URL: 'https://studyflow-backend.onrender.com'
```

---

## 🆘 Support URLs

- **Netlify Docs:** https://docs.netlify.com
- **Render Docs:** https://render.com/docs
- **Vercel Docs:** https://vercel.com/docs
- **Gmail App Password:** https://myaccount.google.com/apppasswords

---

## 🚀 You're Ready!

**All files are prepared and production-ready!**
**Just choose deployment platform and follow the steps!**

**Recommended:** Netlify (Frontend) + Render (Backend) ✅

---

**Status:** ✅ READY FOR DEPLOYMENT  
**Date:** February 3, 2026  
**Domain:** studyflow.salahuddin.codes
