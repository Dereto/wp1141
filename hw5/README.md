# X-Clone - Twitter/X Clone Social Media Platform

A full-stack social media platform built with Next.js, featuring real-time interactions, OAuth authentication, and a Twitter/X-like user experience.

## 🚀 Features

### Basic Features
- **OAuth Authentication**: Sign in with Google or GitHub
- **User Registration**: Custom userID system (3-20 alphanumeric characters)
- **Session Management**: Persistent sessions with NextAuth
- **Posts**: Create, view, like, repost, and comment on posts
- **Character Limit**: 280 characters with smart counting (links = 23 chars, hashtags/mentions excluded)
- **Hashtags & Mentions**: Automatic detection and linking
- **Recursive Comments**: Nested comment threads
- **User Profiles**: View and edit profiles, follow/unfollow users
- **Drafts**: Save and manage post drafts
- **Real-time Updates**: Live updates using Pusher for likes and comments

### Advanced Features (Optional)
- Explore page with recommendation engine
- Notifications system
- New post notices
- Full hashtag support with hashtag pages
- Multimedia support
- Mobile responsive design

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Authentication**: NextAuth.js with OAuth
- **Database**: PostgreSQL with Prisma ORM
- **Real-time**: Pusher
- **Styling**: Tailwind CSS
- **TypeScript**: Full type safety
- **Deployment**: Vercel

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Google OAuth credentials
- GitHub OAuth credentials
- Pusher account

## 🔧 Setup Instructions

### Quick Start

1. **Copy environment file**:
   ```bash
   cp .env.example .env.local
   ```

2. **Fill in environment variables** (see [SETUP.md](./SETUP.md) for detailed instructions):
   - Database connection string
   - NextAuth secret (generate with `openssl rand -base64 32`)
   - Google OAuth credentials
   - GitHub OAuth credentials
   - Pusher credentials

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Set up database**:
   ```bash
   npm run db:generate
   npm run db:push
   ```

5. **Run development server**:
   ```bash
   npm run dev
   ```

Visit [http://localhost:3000](http://localhost:3000)

### Detailed Setup Guide

- **Local Development**: See **[SETUP.md](./SETUP.md)** for local setup instructions
- **Vercel Deployment**: See **[VERCEL_DEPLOY.md](./VERCEL_DEPLOY.md)** for deploying directly to Vercel

## 📁 Project Structure

```
hw5/
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # NextAuth routes
│   │   ├── posts/        # Post endpoints
│   │   ├── users/        # User endpoints
│   │   ├── comments/     # Comment endpoints
│   │   ├── drafts/       # Draft endpoints
│   │   └── pusher/       # Pusher authentication
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── lib/
│   ├── prisma.ts         # Prisma client
│   ├── auth.ts           # NextAuth configuration
│   ├── pusher.ts         # Pusher server client
│   └── utils.ts          # Utility functions
├── prisma/
│   └── schema.prisma     # Database schema
└── types/
    └── next-auth.d.ts   # TypeScript definitions
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/[...nextauth]` - NextAuth endpoints

### Users
- `POST /api/users/register` - Register userID
- `GET /api/users/[userID]` - Get user profile
- `PUT /api/users/[userID]/profile` - Update profile
- `GET /api/users/[userID]/posts` - Get user's posts or likes
- `POST /api/users/[userID]/follow` - Follow/unfollow user
- `GET /api/users/[userID]/follow` - Check follow status

### Posts
- `GET /api/posts` - Get posts (all or following)
- `POST /api/posts` - Create post
- `GET /api/posts/[postId]` - Get single post
- `DELETE /api/posts/[postId]` - Delete post
- `POST /api/posts/[postId]/like` - Like/unlike post
- `POST /api/posts/[postId]/repost` - Repost
- `GET /api/posts/[postId]/comments` - Get comments
- `POST /api/posts/[postId]/comments` - Create comment

### Comments
- `GET /api/posts/[postId]/comments/[commentId]` - Get comment with replies
- `POST /api/comments/[commentId]/like` - Like/unlike comment

### Drafts
- `GET /api/drafts` - Get all drafts
- `POST /api/drafts` - Create draft
- `PUT /api/drafts/[draftId]` - Update draft
- `DELETE /api/drafts/[draftId]` - Delete draft

### Pusher
- `POST /api/pusher/auth` - Authenticate Pusher channel

## 🗄️ Database Schema

Key models:
- **User**: User accounts with OAuth integration
- **Post**: Posts and reposts
- **Comment**: Recursive comment structure
- **Like**: Likes on posts and comments
- **Repost**: Repost tracking
- **Follow**: User follow relationships
- **Draft**: Saved post drafts
- **Mention**: @mention tracking
- **Hashtag**: Hashtag system

## 🚢 Deployment

### Vercel Deployment

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Database

For production, use a managed PostgreSQL service:
- Vercel Postgres
- Supabase
- Railway
- Neon

Update `DATABASE_URL` in Vercel environment variables.

## 📝 Notes

- UserID must be unique and 3-20 alphanumeric characters (underscores allowed)
- Posts have 280 character limit with smart counting
- Links count as 23 characters regardless of length
- Hashtags and mentions don't count toward character limit
- Real-time updates require Pusher configuration
- OAuth providers must be configured with correct callback URLs

## 🔒 Security

- All API routes are protected with NextAuth session checks
- UserID validation prevents injection
- Database queries use Prisma for SQL injection protection
- Environment variables for sensitive data

## 📄 License

This project is for educational purposes.

## 👤 Author

NTU Web Programming 114-1

---

**Deployed Link**: [Add your Vercel deployment link here]

**Registration Key** (if applicable): [Add REG_KEY if you restrict registration]

