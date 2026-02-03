# 🚀 Render Backend Deployment Setup

**Backend Service:** studyflow-backend  
**Status:** Ready to deploy  
**Version:** 1.0.0-production

---

## 📋 Environment Variables for Render

When deploying to Render, add these environment variables in the dashboard:

### **Required Variables:**

```

```

---

## 🔐 Security Notes

✅ **What's Protected:**
- `.env` file is in `.gitignore` - NOT pushed to GitHub
- `.env.example` shows template without secrets
- API keys not exposed in public repo

⚠️ **Keep Safe:**
- Never commit real `.env` to GitHub
- Keep `GEMINI_API_KEY` secret
- Keep `JWT_SECRET` safe
- Keep `EMAIL_PASSWORD` (app-specific) private

---

## 📝 Step-by-Step Render Setup

### **1. Create Render Account**
```
Visit: https://render.com
Sign up with GitHub account
```

### **2. Create Web Service**
```
1. Click: New → Web Service
2. Connect GitHub
3. Select: salahuddingfx/Study-Flow
4. Name: studyflow-backend
```

### **3. Build & Start Commands**
```
Build Command: cd Backend && npm install
Start Command: cd Backend && npm start
```

### **4. Add Environment Variables**
```
Go to: Environment tab
Add each variable from list above (copy from Backend/.env)
```

### **5. Deploy**
```
Click: Create Web Service
Wait ~5-10 minutes for first deploy
You'll get a URL like: https://studyflow-backend-xxxx.onrender.com
```

---

## 🔄 Auto-Redeploy Setup

### **Enable GitHub Integration**
```
1. In Render dashboard, go to Deployments
2. GitHub is already connected (from repo selection)
3. Every GitHub push = Auto-redeploy
4. Redeploy takes ~5 minutes
```

### **To Redeploy Manually**
```
1. Go to Render dashboard
2. Click "Manual Deploy"
3. Select branch: main
4. Click "Deploy latest commit"
```

---

## 🧪 Test Backend Deployment

### **Once deployed, test these URLs:**

```
Health Check:
GET https://studyflow-backend-xxxx.onrender.com/

Login Test:
POST https://studyflow-backend-xxxx.onrender.com/api/auth/login
Body: {"username": "salahuddin", "password": "your_password"}

Get User Profile:
GET https://studyflow-backend-xxxx.onrender.com/api/user/profile
(Requires auth token)
```

---

## 🛠️ Troubleshooting

### **If Backend Doesn't Start**

1. **Check Logs:**
   ```
   In Render dashboard → Logs tab
   Look for error messages
   ```

2. **Common Issues:**
   - ❌ `Cannot connect to MongoDB` → Check MONGO_URI
   - ❌ `JWT_SECRET not found` → Add to environment variables
   - ❌ `Port already in use` → Change PORT to different number
   - ❌ `Module not found` → Run: npm install in Backend/

3. **Restart Service:**
   ```
   Render dashboard → Manual → Restart
   ```

---

## 📊 Monitoring

### **After Deployment, Monitor:**

1. **Logs:** Click Logs tab to see real-time server logs
2. **Metrics:** Check CPU/Memory usage
3. **Health:** Service should show "Live"
4. **URLs:** Backend URL + Frontend URL should communicate

---

## 🔗 Important Links

```
Backend URL:     https://studyflow-backend-xxxx.onrender.com
Frontend URL:    https://studyflow.salahuddin.codes
GitHub Repo:     https://github.com/salahuddingfx/Study-Flow
Render Dashboard: https://dashboard.render.com
```

---

## ✅ Pre-Deployment Checklist

- [x] Code pushed to GitHub (main branch)
- [x] .env NOT in GitHub (in .gitignore)
- [x] .env.example created as template
- [x] All variables documented
- [x] Backend tested locally
- [x] Database connected (MongoDB)
- [ ] Render account created
- [ ] Backend service created on Render
- [ ] Environment variables added to Render
- [ ] First deployment successful
- [ ] Backend URL verified
- [ ] Frontend API_BASE_URL updated to backend URL

---

## 🚀 Final Integration

After backend is deployed on Render:

1. **Get Backend URL** from Render dashboard
2. **Update Frontend** - In `Assets/script.js`:
   ```javascript
   const API_BASE_URL = 'https://studyflow-backend-xxxx.onrender.com';
   ```
3. **Test Login** - Should now connect to live backend
4. **Test Password Reset** - Should send real emails

---

**Status:** ✅ Ready for Render deployment  
**Version:** 1.0.0-production  
**Date:** February 3, 2026
