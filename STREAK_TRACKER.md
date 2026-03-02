# 🔥 Study Streak Tracker - Feature Documentation

**Status:** ✅ v2.0 Production Ready | 🚧 v2.5 In Active Development  
**Version:** 2.5.0 (In Development)  
**Last Updated:** March 2, 2026

## Overview
The Study Streak Tracker encourages daily consistency by tracking consecutive days of study and rewarding users with achievements. In v2.5, streak tracking extends to collaborative study groups, enabling team-based challenges and social motivation.

## Backend API Endpoints

### 1. Get Streak Status
```http
GET /api/streak/status
Authorization: Bearer {token}
```

**Response:**
```json
{
  "currentStreak": 7,
  "longestStreak": 15,
  "totalStudyDays": 45,
  "lastStudyDate": "2026-03-02T00:00:00.000Z",
  "isActiveToday": true,
  "achievements": [
    { "type": "7-day", "unlockedAt": "2026-03-02T10:30:00.000Z" }
  ],
  "streakStatus": "active"
}
```

### 2. Update Streak (Auto-called after study session)
```http
POST /api/streak/update
Authorization: Bearer {token}
Content-Type: application/json

{
  "studyMinutes": 25
}
```

**Response:**
```json
{
  "message": "Streak extended!",
  "currentStreak": 8,
  "longestStreak": 15,
  "totalStudyDays": 46,
  "newAchievements": []
}
```

### 3. Get Leaderboard
```http
GET /api/streak/leaderboard
Authorization: Bearer {token}
```

**Response:**
```json
{
  "leaderboard": [
    {
      "rank": 1,
      "userName": "John Doe",
      "currentStreak": 30,
      "longestStreak": 45,
      "totalStudyDays": 120
    }
  ]
}
```

### 4. Reset Streak (Testing)
```http
DELETE /api/streak/reset
Authorization: Bearer {token}
```

## Frontend Integration

### Initialization
The streak tracker auto-initializes on page load if user is authenticated:

```javascript
if (localStorage.getItem('token')) {
  StreakTracker.init();
}
```

### Widget Display
The streak widget appears in the home dashboard automatically after the progress stats section.

### Auto-Update on Session Complete
When a focus session completes, the streak automatically updates:

```javascript
// This happens automatically in script.js
document.dispatchEvent(new CustomEvent('sessionCompleted', {
  detail: { duration: 25 }
}));
```

### Manual Actions

**Show Leaderboard:**
```javascript
StreakTracker.showLeaderboard();
```

**Reload Streak Data:**
```javascript
await StreakTracker.loadStreak();
StreakTracker.render();
```

## Streak Logic

### Continuation Rules
- **Same Day**: Multiple sessions on same day count toward that day (doesn't increment)
- **Next Day**: Study on consecutive day = streak +1
- **Missed Day**: Miss 2+ days = streak resets to 1

### Streak Status
- **Active**: Studied today (green 🔥)
- **At Risk**: Studied yesterday but not today (orange ⚠️)
- **Broken**: Haven't studied in 2+ days (red 💔)

## Achievements

Automatic milestone achievements:
- 🏆 **7 days** - Consistent beginner
- 🏆 **14 days** - Two-week warrior
- 🏆 **30 days** - Monthly master
- 🏆 **60 days** - Two-month champion
- 🏆 **100 days** - Centurion scholar
- 🏆 **365 days** - Year-long legend

## Database Schema

### Streak Model
```javascript
{
  userId: ObjectId (unique),
  currentStreak: Number (default: 0),
  longestStreak: Number (default: 0),
  lastStudyDate: Date,
  streakHistory: [{
    date: Date,
    studyMinutes: Number,
    completed: Boolean
  }],
  totalStudyDays: Number (default: 0),
  achievements: [{
    type: String (enum: ['7-day', '14-day', '30-day', '60-day', '100-day', '365-day']),
    unlockedAt: Date
  }],
  timestamps: true
}
```

## UI Components

### Streak Widget
Located in home dashboard, displays:
- Current streak with fire emoji 🔥
- Longest streak record
- Total study days count
- Achievement badges
- Leaderboard button

### Leaderboard Modal
Shows top 10 streaks with:
- Rank medals (🥇🥈🥉)
- User names
- Current & longest streaks
- Total study days

### Achievement Notifications
Auto-appears when milestone reached:
- Animated slide-in from right
- Trophy icon 🏆
- Achievement name
- Auto-dismisses after 4 seconds

## Testing

1. **Start Session**: Go to Focus Timer, complete a 1-minute session
2. **Check Widget**: Return to home, see streak widget with 1 day
3. **Next Day**: Complete another session next day, streak = 2
4. **Skip Day**: Wait 48+ hours, streak resets on next session
5. **Leaderboard**: Click leaderboard button to see rankings

## Integration Points

- **Timer Complete**: Auto-updates streak after focus/custom sessions
- **Session API**: Creates session record in database
- **Achievement System**: Works alongside existing achievement system
- **Socket.io**: Can be extended for real-time leaderboard updates

---

## 🚀 What's Coming in v2.5 - Group Streak Features

### New Features Overview

v2.5 introduces **Collaborative Streak Challenges** where study groups can compete together, share progress, and motivate each other through team-based streak goals.

### 1. Group Streak Tracking

**Frontend Implementation:**
- Group streak dashboard widget (Vue component)
- Real-time group member activity feed
- Shared streak calendar visualization
- Team achievement showcase
- Contribution leaderboard within groups

**Backend Implementation:**
```http
POST /api/groups/:groupId/streaks/start
Authorization: Bearer {token}
Content-Type: application/json

{
  "challengeName": "March Study Marathon",
  "targetDays": 30,
  "minStudyMinutes": 25,
  "startDate": "2026-03-01",
  "endDate": "2026-03-31"
}
```

**Response:**
```json
{
  "challengeId": "65f8a7b2c3d4e5f6a7b8c9d0",
  "status": "active",
  "participants": 8,
  "currentDays": 0,
  "targetDays": 30
}
```

### 2. New API Endpoints

**Get Group Streak Status:**
```http
GET /api/groups/:groupId/streaks/current
Authorization: Bearer {token}
```

**Response:**
```json
{
  "groupStreak": {
    "currentStreak": 15,
    "longestStreak": 20,
    "activeChallenges": [
      {
        "challengeId": "65f8a7b2c3d4e5f6a7b8c9d0",
        "name": "March Study Marathon",
        "progress": "15/30 days",
        "participants": 8,
        "topContributor": {
          "userId": "user123",
          "name": "John Doe",
          "studyMinutes": 750
        }
      }
    ],
    "teamStats": {
      "totalStudyMinutes": 4500,
      "averageStreak": 12.5,
      "membersStudiedToday": 6
    }
  }
}
```

**Update Member Contribution:**
```http
POST /api/groups/:groupId/streaks/contribute
Authorization: Bearer {token}
Content-Type: application/json

{
  "challengeId": "65f8a7b2c3d4e5f6a7b8c9d0",
  "studyMinutes": 25,
  "sessionType": "pomodoro"
}
```

**Get Group Leaderboard:**
```http
GET /api/groups/:groupId/streaks/leaderboard
Authorization: Bearer {token}
```

**Response:**
```json
{
  "leaderboard": [
    {
      "rank": 1,
      "userId": "user123",
      "name": "John Doe",
      "avatar": "https://avatar.url",
      "currentStreak": 20,
      "contributionMinutes": 850,
      "studyDays": 20
    }
  ],
  "userRank": 3,
  "totalParticipants": 12
}
```

### 3. MongoDB Schema Extensions

**GroupChallenge Model:**
```javascript
{
  groupId: ObjectId (ref: 'Group'),
  challengeName: String (required),
  challengeType: String (enum: ['streak', 'total-minutes', 'study-days']),
  targetDays: Number,
  minStudyMinutes: Number (default: 25),
  startDate: Date,
  endDate: Date,
  status: String (enum: ['active', 'completed', 'failed']),
  participants: [{
    userId: ObjectId (ref: 'User'),
    joinedAt: Date,
    contributions: [{
      date: Date,
      studyMinutes: Number,
      sessionType: String
    }],
    totalMinutes: Number,
    currentStreak: Number
  }],
  milestones: [{
    day: Number,
    reachedAt: Date,
    celebrationMessage: String
  }],
  rewards: [{
    type: String (enum: ['badge', 'points', 'certificate']),
    awardedTo: [ObjectId],
    description: String
  }],
  createdBy: ObjectId (ref: 'User'),
  timestamps: true
}
```

### 4. WebSocket Events for Real-Time Updates

**Client → Server:**
```javascript
// Join group streak room
socket.emit('joinGroupStreak', { groupId: 'group123' });

// Contribute to challenge
socket.emit('streakContribution', {
  groupId: 'group123',
  challengeId: 'challenge456',
  studyMinutes: 25
});
```

**Server → Client:**
```javascript
// Member contributed to streak
socket.on('memberContributed', (data) => {
  // data: { userId, name, studyMinutes, currentStreak, timestamp }
  showNotification(`${data.name} just studied for ${data.studyMinutes} minutes!`);
  updateGroupProgress();
});

// Milestone reached
socket.on('milestoneReached', (data) => {
  // data: { milestone, totalDays, message }
  showCelebration(`🎉 Day ${data.totalDays} milestone reached!`);
});

// Challenge completed
socket.on('challengeCompleted', (data) => {
  // data: { challengeName, successRate, rewards }
  showCompletionModal(data);
});
```

### 5. UI Components for v2.5

**Group Streak Dashboard:**
- Current group streak counter with animated fire emoji
- Active challenges card with progress bars
- Member activity feed (real-time)
- Challenge leaderboard with ranks and avatars
- "Create Challenge" button for group admins

**Challenge Creation Modal:**
- Challenge name input
- Duration selector (7/14/30/60/90 days)
- Minimum daily study time slider
- Participant invitation checkboxes
- Preview of challenge rules

**Group Activity Feed:**
```html
<!-- Real-time updates -->
<div class="activity-item">
  <img src="avatar.jpg" class="avatar-sm">
  <span><strong>John Doe</strong> completed a 25-min session</span>
  <span class="time">2 mins ago</span>
</div>
```

### 6. Social Motivation Features

**Peer Pressure Notifications:**
- "5 members studied today, join them!"
- "You're the only one who hasn't studied yet today"
- "John just broke his personal record!"

**Team Achievements:**
- 🏆 **Team Synergy**: All members studied on same day
- 🏆 **Study Marathon**: 1000+ combined minutes in a day
- 🏆 **Consistency Kings**: 30-day group streak
- 🏆 **Early Birds**: All members started before 8 AM

**Streak Freeze for Groups:**
- Each group gets 2 "freeze days" per month
- Voting system to use a freeze day
- Prevents group streak from breaking if members are busy

### 7. Performance Considerations

**Optimizations:**
- Redis caching for real-time leaderboard (TTL: 5 minutes)
- Aggregation pipelines for group statistics
- Indexed queries on `groupId` and `challengeId`
- WebSocket room management for scalability

**Expected Performance:**
- Leaderboard retrieval: <150ms
- Contribution update: <100ms
- Real-time notification delivery: <50ms
- Group stats calculation: <200ms

### 8. Integration with Existing Features

**Pomodoro Timer:**
- Auto-contribute to group challenge on session complete
- Show group streak status in timer UI
- Option to share session completion with group

**Analytics Dashboard:**
- Group vs. personal streak comparison
- Contribution trends over time
- Member engagement heatmap

**Achievement System:**
- Group achievements unlock for all members
- Special badges for challenge completion
- Leaderboard integration

---

## Future Enhancements (Post v2.5)

Potential improvements for future versions:
- ~~Weekly/monthly streak charts~~ ✅ Coming in v2.5
- ~~Streak freeze (allow 1 skip per month)~~ ✅ Coming in v2.5 (for groups)
- ~~Social sharing of milestones~~ ✅ Coming in v2.5
- ~~Custom streak goals~~ ✅ Coming in v2.5 (group challenges)
- Email reminders for at-risk streaks (v2.6)
- Mobile push notifications (v2.6)
- AI-powered streak predictions (v3.0)
- Gamification with streak-based rewards (v3.0)
- Integration with habit tracking apps (v3.0)

---

**Team:** Salah Uddin Kader & Sohana Rahman  
**Status:** ✅ v2.0 Production Ready | 🚧 v2.5 In Active Development  
**Version:** 2.5.0 (In Development)  
**Date:** March 2, 2026

**v2.5 Additions:**
- 👥 Group streak tracking and challenges
- 🏆 Team-based achievements
- 📊 Real-time group leaderboards
- 🔔 Social motivation notifications

*Track together, succeed together!* 🔥
