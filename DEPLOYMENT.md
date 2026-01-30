# StudyFlow Deployment Guide 🚀

## Railway Deployment (Recommended)

### Step 1: Prepare Your Project
1. **Create .gitignore** (if not exists):
   ```
   node_modules/
   .env
   *.log
   ```

2. **Environment Variables** needed for Railway:
   - `MONGO_URI` - Your MongoDB connection string
   - `JWT_SECRET` - A secure random string
   - `NODE_ENV` - Set to `production`

### Step 2: Deploy to Railway
1. Go to [Railway.app](https://railway.app) and sign up/login
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Connect your GitHub account and select the StudyFlow repository
4. Railway will automatically detect it's a Node.js app

### Step 3: Configure Environment
1. In Railway dashboard, go to your project
2. Click **"Variables"** tab
3. Add these environment variables:
   ```
   MONGO_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/your_project
   JWT_SECRET=your_super_secure_random_string_here
   NODE_ENV=production
   ```

### Step 4: Deploy
1. Railway will automatically build and deploy
2. Once deployed, you'll get a live URL like: `https://studyflow-production.up.railway.app`

### Step 5: Access Your App
- **Desktop:** Open the Railway URL
- **Mobile:** Same URL works on phone
- **Share:** Send the URL to anyone for access

## Alternative: Render Deployment

### Step 1: Sign up at Render.com
1. Go to [Render.com](https://render.com) and create account
2. Connect your GitHub repository

### Step 2: Create Web Service
1. Click **"New"** → **"Web Service"**
2. Connect GitHub repo
3. Configure:
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`

### Step 3: Add Environment Variables
Same as Railway:
```
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
NODE_ENV=production
```

### Step 4: Deploy
Render will build and give you a live URL.

## Testing Your Live App

1. **Open the live URL** in browser
2. **Test on mobile** by opening the same URL
3. **Test registration/login** to ensure database works
4. **Test all features** (timer, analytics, music, etc.)

## Troubleshooting

### Common Issues:
1. **Port Error:** Railway sets PORT automatically, don't hardcode it
2. **MongoDB Connection:** Make sure your MongoDB Atlas allows all IPs (0.0.0.0/0)
3. **Environment Variables:** Double-check all required vars are set
4. **Build Errors:** Check Railway/Render logs for specific errors

### Database Setup:
If using MongoDB Atlas:
1. Go to Network Access → Add IP Address → `0.0.0.0/0` (Allow from anywhere)
2. Get connection string from Connect → Connect your application

## Live URL Examples:
- Railway: `https://studyflow-production.up.railway.app`
- Render: `https://studyflow.onrender.com`

Your app will be live and accessible from anywhere! 🎉
