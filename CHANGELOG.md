# Changelog

All notable changes to StudyFlow will be documented in this file.

## [2.0.0] - 2026-01-10

### 🚀 Major Features

#### AI System Overhaul
- **Unlimited Models**: Switched to `gemini-2.0-flash-exp` (no rate limits)
- **Smart Fallback Chain**: 9+ models including Gemini 2.0, Gemini Exp, Gemma 2-9B, Gemma 2-27B
- **Response Metadata**: Each AI response includes model used and timestamp
- **Health Endpoint**: `/api/ai/health` shows active model and available options
- **Context-Aware AI**: AI assistant now has access to user's subjects, tasks, sessions, and goals

#### Admin Panel
- Full admin dashboard with user management
- Analytics overview with charts
- Blog and song management
- Protected routes with admin middleware

### 🎨 UI/UX Enhancements

#### Custom Cursor System
- Glassmorphism design with gradient effects
- 17+ interactive element types covered (buttons, links, inputs, cards, etc.)
- Hover effects: expands from 25px to 35px with color shift
- Automatically disabled on touch devices

#### Mobile Responsiveness
- Full-screen mobile menu with backdrop blur
- Fixed horizontal overflow in Timer and Analytics
- Responsive chart containers
- Touch-optimized controls

#### Blog System
- Default blog posts with beautiful images
- Modal reader with full content view
- Server-side blog management
- Image upload support

### 🛡️ Security & Performance

#### Security
- Removed sensitive debug logs from production
- Added `.env.example` template
- Helmet.js security headers
- Rate limiting middleware
- Protected admin routes

#### Performance
- Compression middleware enabled
- Optimized database queries
- Socket.io for real-time updates
- Efficient AI model fallback

### 📝 Developer Experience
- `.env.example` template for easy setup
- Comprehensive README updates
- Clear API documentation
- Admin panel setup guide

---

## [1.0.0] - Initial Release

### Core Features
- Pomodoro timer with customizable intervals
- Task and subject management
- Study session tracking
- Analytics dashboard with charts
- Goal tracking system
- Achievement/gamification system
- Music player integration
- JWT authentication
- MongoDB database
- Socket.io real-time updates
