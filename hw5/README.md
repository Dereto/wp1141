# X-Clone - Social Media Platform

A full-stack Twitter/X-like social media platform built with Next.js, featuring OAuth authentication, real-time interactions, and a complete social networking experience.

## 🌐 Deployed Link

**🔗 wp-hw5.vercel.app**

> ⚠️ **Important**: Please ensure your deployed link is working before submission. Reviewers will test the deployed version.

---

## 🔐 How to Login and Use the App

### Step 1: Sign In with OAuth

1. **Visit the deployed link** (or `http://localhost:3000` for local development)
2. You will be redirected to the **Sign In** page
3. Choose one of the OAuth providers:
   - **🔵 Continue with Google** - Sign in with your Google account
   - **⚫ Continue with GitHub** - Sign in with your GitHub account

### Step 2: Complete Registration (First Time Only)

After signing in with OAuth for the first time:

1. You will be redirected to the **Registration** page
2. **Enter a unique userID**:
   - Must be **3-20 characters** long
   - Can contain **letters, numbers, and underscores** (`a-z`, `A-Z`, `0-9`, `_`)
   - Example: `ric2k1`, `john_doe`, `user123`
3. Click **"Complete Registration"**
4. You will be redirected to the **Home** feed

### Step 3: Using the App

Once registered, you can:

- **🏠 Home**: View all posts or posts from users you follow
- **👤 Profile**: View and edit your profile, see your posts and likes
- **✍️ Post**: Create new posts (click the "Post" button in sidebar)
- **💬 Comment**: Click on any post to view and add comments
- **❤️ Like**: Click the heart icon to like/unlike posts
- **🔄 Repost**: Click the repost icon to share posts
- **👥 Follow**: Visit other users' profiles and click "Follow"

### Important Notes

- **Different OAuth Providers = Different Accounts**: If you sign in with Google and then with GitHub (even with the same email), you will create **two separate accounts** with different userIDs. This is by design.
- **Session Persistence**: Once logged in, your session persists for 30 days. You don't need to log in again unless you sign out.
- **Selecting Different Accounts**: When signing in with Google, you can select a different Google account each time. Each Google account will create a separate user in the app.

---

## ✅ Feature List

### 🔐 Authentication & Registration

- ✅ **OAuth Authentication**: Sign in with Google or GitHub (Facebook not implemented)
- ✅ **User Registration**: Custom userID system (3-20 alphanumeric characters or underscores)
- ✅ **Session Management**: Persistent sessions with 30-day expiration
- ✅ **Separate Accounts per Provider**: Each OAuth provider creates a separate user account, even if they share the same email address

### 🔥 Main Menu (Sidebar)

- ✅ **Home**: Navigate to home feed
- ✅ **Profile**: Navigate to your profile page
- ✅ **Post**: Open post creation modal
- ✅ **User Info**: Click on your avatar/name to see logout option
- ✅ **Custom Logo**: App icon at the top
- ✅ **Hover Effects**: Buttons highlight on hover

### ✏️ Profile Management

- ✅ **View Own Profile**: See your posts, likes, following/followers count
- ✅ **Edit Profile**: Update description, background image, and avatar
- ✅ **View Other Users**: Click on userID in posts to view their profile (read-only)
- ✅ **Follow/Unfollow**: Follow or unfollow other users
- ✅ **Posts Tab**: View all posts and reposts (public)
- ✅ **Likes Tab**: View all liked posts (private, only visible to you)

### 📝 Post Creation

- ✅ **Post Modal**: Click "Post" button to open creation modal
- ✅ **Character Limit**: 280 characters with smart counting
  - Links count as 23 characters (regardless of actual length)
  - Hashtags (`#hashtag`) don't count toward limit
  - Mentions (`@userID`) don't count toward limit
- ✅ **Link Detection**: Automatically detects and converts URLs to clickable hyperlinks
- ✅ **Hashtag Support**: Automatic hashtag detection
- ✅ **Mention Support**: Automatic @mention detection
- ✅ **Draft System**: Save posts as drafts when canceling
- ✅ **Draft Management**: View and manage saved drafts

### 📖 Post Viewing & Interaction

- ✅ **Home Feed**: View all posts or posts from followed users
- ✅ **Post Sorting**: Newest posts first
- ✅ **Post Display**: Shows author avatar, relative timestamp, full content
- ✅ **Interactions**: Comment count, repost count, like count
- ✅ **Like Toggle**: Click heart to like/unlike (color changes when liked)
- ✅ **Repost**: Click repost icon to share posts
- ✅ **Comment**: Click comment icon to view/add comments
- ✅ **Delete Posts**: Delete your own posts (not reposts)
- ✅ **Mention Links**: Click @mentions to navigate to user profiles
- ✅ **Recursive Comments**: Click posts/comments to view nested threads
- ✅ **Breadcrumb Navigation**: Back arrow to navigate up the comment tree

### 🤼 Real-time Updates

- ✅ **Pusher Integration**: Real-time updates for likes and comments
- ✅ **Live Count Updates**: Like and comment counts update instantly across all sessions
- ✅ **Multi-account Testing**: Use two different accounts to test real-time features

### ✏️ UI/UX Features

- ✅ **Responsive Design**: Works on desktop and mobile
- ✅ **Dark Theme**: Modern dark interface
- ✅ **No Right Sidebar**: Clean, focused layout
- ✅ **Smooth Animations**: Hover effects and transitions

### ⛅ Deployment

- ✅ **Vercel Deployment**: Fully deployed and accessible
- ✅ **Environment Variables**: Properly configured
- ✅ **Database**: PostgreSQL with Prisma ORM

### 🚧 Advanced Features (Not Implemented)

- ❌ Explore page with recommendation engine
- ❌ Notifications system
- ❌ New post notices
- ❌ Full hashtag pages (clicking hashtags)
- ❌ Multimedia support (images, videos)
- ❌ Long post support

---

## 🛠️ Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Authentication**: NextAuth.js with OAuth (Google, GitHub)
- **Database**: PostgreSQL with Prisma ORM
- **Real-time**: Pusher for live updates
- **Styling**: Tailwind CSS
- **Language**: TypeScript (full type safety)
- **Deployment**: Vercel

---

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (local or cloud)
- Google OAuth credentials
- GitHub OAuth credentials
- Pusher account

---

## 🔧 Local Setup Instructions

### Quick Start

1. **Clone the repository** and navigate to `hw5/`:
   ```bash
   cd hw5
   ```

2. **Copy environment file**:
   ```bash
   cp .env.example .env.local
   ```

3. **Fill in environment variables** in `.env.local`:
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
   
   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-here"  # Generate with: openssl rand -base64 32
   
   # OAuth - Google
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   
   # OAuth - GitHub
   GITHUB_CLIENT_ID="your-github-client-id"
   GITHUB_CLIENT_SECRET="your-github-client-secret"
   
   # Pusher
   PUSHER_APP_ID="your-pusher-app-id"
   PUSHER_KEY="your-pusher-key"
   PUSHER_SECRET="your-pusher-secret"
   PUSHER_CLUSTER="your-pusher-cluster"
   ```

4. **Install dependencies**:
   ```bash
   npm install
   ```

5. **Set up database**:
   ```bash
   npm run db:generate
   npm run db:push
   ```

6. **Run development server**:
   ```bash
   npm run dev
   ```

7. **Visit** [http://localhost:3000](http://localhost:3000)

### Detailed Setup Guides

- **Local Development**: See **[SETUP.md](./SETUP.md)** for detailed local setup instructions
- **Vercel Deployment**: See **[VERCEL_DEPLOY.md](./VERCEL_DEPLOY.md)** for deploying to Vercel

---

## 📁 Project Structure

```
hw5/
├── app/
│   ├── api/                    # API routes
│   │   ├── auth/               # NextAuth endpoints
│   │   ├── posts/              # Post CRUD operations
│   │   ├── users/              # User management
│   │   ├── comments/           # Comment operations
│   │   ├── drafts/             # Draft management
│   │   └── pusher/             # Pusher authentication
│   ├── auth/                   # Authentication pages
│   │   ├── signin/             # Sign in page
│   │   └── register/           # UserID registration
│   ├── home/                   # Home feed
│   ├── post/                   # Post creation and viewing
│   ├── profile/                # User profiles
│   └── layout.tsx              # Root layout
├── components/                 # React components
│   ├── Sidebar.tsx             # Main navigation
│   ├── PostComposer.tsx        # Post creation
│   ├── PostFeed.tsx            # Post list
│   ├── PostCard.tsx            # Individual post
│   ├── CommentList.tsx         # Comment threads
│   ├── ProfileHeader.tsx       # Profile display
│   └── ...
├── lib/
│   ├── prisma.ts               # Prisma client
│   ├── auth.ts                # NextAuth configuration
│   ├── custom-adapter.ts       # Custom adapter for separate users per provider
│   ├── pusher.ts               # Pusher server client
│   └── utils.ts               # Utility functions
├── prisma/
│   └── schema.prisma           # Database schema
├── types/
│   └── next-auth.d.ts         # TypeScript definitions
└── middleware.ts               # Next.js middleware for auth
```

---

## 🗄️ Database Schema

Key models:

- **User**: User accounts with OAuth integration and custom userID
- **Account**: OAuth account links (one per provider per user)
- **Session**: NextAuth sessions
- **Post**: Posts and reposts
- **Comment**: Recursive comment structure
- **Like**: Likes on posts and comments
- **Repost**: Repost tracking
- **Follow**: User follow relationships
- **Draft**: Saved post drafts
- **Mention**: @mention tracking
- **Hashtag**: Hashtag system

---

## 🔌 API Endpoints

### Authentication
- `GET/POST /api/auth/[...nextauth]` - NextAuth endpoints

### Users
- `POST /api/users/register` - Register userID
- `GET /api/users/[userID]` - Get user profile
- `PUT /api/users/[userID]/profile` - Update profile
- `GET /api/users/[userID]/posts` - Get user's posts or likes
- `POST /api/users/[userID]/follow` - Follow/unfollow user

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

---

## 🏗️ Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Client (Browser)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   React UI   │  │  NextAuth    │  │   Pusher     │     │
│  │  Components  │  │   Client     │  │   Client     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP/WebSocket
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Next.js App Router (Server)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   API Routes │  │  NextAuth    │  │   Pusher     │     │
│  │  (RESTful)   │  │   Server     │  │   Server     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│         │                  │                  │             │
│         └──────────────────┴──────────────────┘             │
│                            │                                 │
│                            ▼                                 │
│                    ┌──────────────┐                         │
│                    │   Prisma     │                         │
│                    │    ORM       │                         │
│                    └──────────────┘                         │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    PostgreSQL Database                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Users   │  │  Posts   │  │ Comments │  │  Likes   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Reposts  │  │  Follows │  │  Drafts  │  │ Accounts │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            │
┌─────────────────────────────────────────────────────────────┐
│              External Services                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                 │
│  │  Google  │  │  GitHub  │  │  Pusher  │                 │
│  │   OAuth  │  │   OAuth  │  │  Service │                 │
│  └──────────┘  └──────────┘  └──────────┘                 │
└─────────────────────────────────────────────────────────────┘
```

### Flow Description

1. **User Authentication**: User signs in via OAuth (Google/GitHub) → NextAuth handles OAuth flow → Creates user in database
2. **User Registration**: After OAuth, user registers custom userID → Stored in User model
3. **Post Creation**: User creates post → API route validates → Prisma saves to database → Pusher broadcasts update
4. **Real-time Updates**: When user likes/comments → Pusher broadcasts → All connected clients update
5. **Data Flow**: Client → Next.js API Routes → Prisma ORM → PostgreSQL → Response back to client

---

## 🔒 Security Measures

### Authentication & Authorization

- ✅ **NextAuth.js**: Secure OAuth flow with session management
- ✅ **Session-based Auth**: Database sessions with 30-day expiration
- ✅ **Protected Routes**: Middleware checks authentication before allowing access
- ✅ **API Route Protection**: All API routes verify session before processing

### Data Validation

- ✅ **UserID Validation**: Regex validation (3-20 alphanumeric + underscores)
- ✅ **Post Length Validation**: 280 character limit with smart counting
- ✅ **Prisma ORM**: Prevents SQL injection attacks
- ✅ **Input Sanitization**: All user inputs are validated before database operations

### Environment Variables

- ✅ **Sensitive Data**: All secrets stored in environment variables
- ✅ **No Hardcoded Credentials**: OAuth secrets, database URLs, etc. in `.env.local`
- ✅ **Git Ignore**: `.env.local` and `.env*.local` files are gitignored

### Registration Key (Optional)

> **Note**: This app does not currently restrict registration. If you want to restrict registration, you can add a `REG_KEY` system. For now, anyone with OAuth access can register.

**REG_KEY** (if applicable): `[Not implemented - open registration]`

---

## 📝 Important Notes

### UserID Rules

- **Length**: 3-20 characters
- **Characters**: Letters (a-z, A-Z), numbers (0-9), and underscores (_)
- **Uniqueness**: Must be unique across all users
- **Examples**: `ric2k1`, `john_doe`, `user123`, `_test_`

### Post Character Counting

- **Base Limit**: 280 characters
- **Links**: Count as 23 characters (regardless of actual length)
- **Hashtags**: Don't count toward limit (e.g., `#hashtag` is free)
- **Mentions**: Don't count toward limit (e.g., `@userID` is free)
- **Example**: A post with 250 characters + 1 link (23 chars) + `#test` + `@user` = 273/280 characters used

### OAuth Provider Behavior

- **Separate Accounts**: Each OAuth provider (Google, GitHub) creates a **separate user account**, even if they share the same email address
- **Account Selection**: When signing in with Google, you can select different Google accounts. Each account will create a separate user in the app.
- **Session Persistence**: Sessions last 30 days. You don't need to log in again unless you sign out.

### Real-time Testing

To test real-time features (likes, comments):

1. Sign in with **Account A** (e.g., Google account 1)
2. Open the app in an **incognito window** or different browser
3. Sign in with **Account B** (e.g., GitHub account or different Google account)
4. Have Account A like/comment on a post
5. Account B should see the count update **instantly** without refreshing

---

## 🐛 Troubleshooting

### Common Issues

1. **"Redirect loop" after OAuth sign-in**
   - Ensure `NEXTAUTH_URL` is set correctly in environment variables
   - Check that OAuth callback URLs are configured correctly in Google/GitHub

2. **"UserID already taken"**
   - Choose a different userID
   - UserIDs must be unique across all users

3. **Real-time updates not working**
   - Verify Pusher credentials are correct
   - Check browser console for Pusher connection errors
   - Ensure both accounts are signed in and viewing the same post

4. **Database connection errors**
   - Verify `DATABASE_URL` is correct
   - Ensure database is running and accessible
   - Run `npm run db:push` to sync schema

---

## 📄 License

This project is for educational purposes as part of NTU Web Programming 114-1.

---

## 👤 Author

NTU Web Programming 114-1 - HW#5

---

## 📚 Additional Documentation

- **[SETUP.md](./SETUP.md)**: Detailed local development setup
- **[VERCEL_DEPLOY.md](./VERCEL_DEPLOY.md)**: Vercel deployment guide
- **[spec/hw5_spec.md](./spec/hw5_spec.md)**: Original assignment specification

---

**Last Updated**: November 2024
