# 🔧 Email Issues Diagnostic Checklist

**Status:** February 3, 2026  
**Issue:** Email connection timeout on Render  
**Backend Error:** `Email error: Error: Connection timeout`

---

## ✅ What We've Done

1. ✅ Added `trust proxy` setting to server.js (fixes X-Forwarded-For error)
2. ✅ Added SMTP timeout settings (5 seconds)
3. ✅ Added detailed email verification logging
4. ✅ Better error messages for debugging

---

## 🔍 Verification Steps

### Step 1: Check Environment Variables on Render

Go to: **Render Dashboard → Study-Flow → Environment**

Verify ALL these are present:

```
✓ PORT=5000
✓ NODE_ENV=production
✓ MONGO_URI=mongodb+srv://...
✓ JWT_SECRET=...
✓ GEMINI_API_KEY=...
✓ EMAIL_SERVICE=gmail
✓ EMAIL_USER=salauddinkaderappy@gmail.com
✓ EMAIL_PASSWORD=trln aqcs alrr wwfz
✓ FROM_EMAIL=salauddinkaderappy@gmail.com
✓ FROM_NAME=StudyFlow Admin
✓ FRONTEND_URL=https://studyflow.salahuddin.codes
```

**⚠️ IMPORTANT:** 
- EMAIL_PASSWORD must be exactly: `trln aqcs alrr wwfz` (no extra spaces)
- Make sure you're using **App Password**, not your real Gmail password

---

### Step 2: Verify Gmail 2FA App Password

1. Go to: https://myaccount.google.com/apppasswords
2. Select: App: Mail, Device: Windows/Mac
3. Copy the generated password (16 characters, 4 groups with spaces)
4. In Render, paste WITHOUT spaces: `trln aqcs alrr wwfz`
5. Save & redeploy

---

### Step 3: Check Backend Logs After Redeployment

In Render Logs, you should now see:

```
✓ 📧 Initializing email transporter...
✓    Service: gmail
✓    From: salauddinkaderappy@gmail.com
✓ 🔐 Verifying SMTP connection...
✓ ✓ SMTP connection verified
✓ 📤 Sending email to: [user's email]
✓ ✓ Email sent successfully: [message id]
```

If you see **❌ errors** instead, note the exact message.

---

### Step 4: Test Password Reset Again

1. Open: https://studyflow.salahuddin.codes
2. Click "Forgot Password?"
3. Enter:
   - Username: `testuser`
   - Email: `usala7948@gmail.com`
4. Click "Send Reset Link"
5. Check the logs in Render Dashboard

---

## 🚨 Common Issues & Fixes

### Issue: "Email configuration missing"
**Cause:** EMAIL_USER or EMAIL_PASSWORD not set on Render  
**Fix:** Add both variables to Render Environment tab

### Issue: "SMTP verification failed"
**Cause:** Gmail credentials wrong or 2FA disabled  
**Fix:** 
1. Enable 2FA on Gmail
2. Generate new App Password
3. Use 16-character password (without spaces in Render)

### Issue: "Connection timeout"
**Cause:** Port 587 blocked or Gmail SMTP unreachable  
**Fix:**
1. Try alternative SMTP port (465 with secure: true)
2. Or use SendGrid/Mailgun (easier on Render)

### Issue: "X-Forwarded-For header error"
**Cause:** Missing trust proxy setting  
**Fix:** ✅ Already added to server.js

---

## 📊 Backend Changes Made

### server.js
```javascript
// Added line 27:
app.set('trust proxy', 1);
```

### utils/sendEmail.js
```javascript
// Added:
- Environment variable verification
- Detailed logging with emojis
- SMTP connection verification before sending
- Timeout settings (5s)
- Better error messages
```

---

## 🚀 Next Steps

1. **Redeployment:** Click "Manual Deploy" in Render
   - Backend will rebuild (~5 min)
   - New logs will show with diagnostics

2. **Monitor Logs:** Watch Render logs for:
   - ✓ SMTP connection verified message
   - ✗ Any email-related errors

3. **Test:** Try forgot password again
   - Should show better error if still failing

4. **Debug:** If still failing, check:
   - Gmail App Password is correct
   - 2FA is enabled on Gmail
   - Email variables have NO extra spaces in Render

---

## 📝 Troubleshooting Notes

**If email fails with timeout:**
- Check Gmail security settings: https://myaccount.google.com/security
- Less secure apps might need enabling (or use App Password)
- Render free tier sometimes has SMTP issues - may need upgrade

**Alternative Email Services:**
- SendGrid (free tier, more reliable on Render)
- Mailgun (easier setup)
- AWS SES

---

## ✅ Ready to Test!

Once environment variables confirmed and backend redeployed:

**Expected behavior:**
1. Click "Send Reset Link"
2. Button shows "Sending..."
3. Toast notification appears
4. Success: "✅ Password reset link sent to your email!"
5. Email arrives in 1-2 seconds

**Log in Render should show:**
- SMTP verification
- Email sent to user's address
- Message ID confirmation

---

**Status:** Production Ready (pending email fix)  
**Pushed:** Yes, backend code updated  
**Next:** Verify Render environment variables
