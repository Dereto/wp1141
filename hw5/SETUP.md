# Setup Guide

This guide will help you set up all the required services and environment variables for X-Clone.

## Quick Start

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in all the environment variables in `.env.local` (see details below)

3. Install dependencies:
   ```bash
   npm install
   ```

4. Set up the database:
   ```bash
   npm run db:generate
   npm run db:push
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

## Environment Variables Setup

### 1. Database (PostgreSQL)

**Option A: Local PostgreSQL**
- Install PostgreSQL locally
- Create a database: `createdb xclone`
- Update `DATABASE_URL` in `.env.local`:
  ```
  DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/xclone?schema=public"
  ```

**Option B: Supabase (Recommended for beginners)**
1. Go to https://supabase.com/
2. Create a free account and new project
3. Go to Project Settings > Database
4. Copy the "Connection string" (URI format)
5. Replace `[YOUR-PASSWORD]` with your database password
6. Paste into `DATABASE_URL` in `.env.local`

**Option C: Vercel Postgres (For production)**
1. In Vercel dashboard, go to your project
2. Storage > Create Database > Postgres
3. Copy the connection string to `DATABASE_URL`

### 2. NextAuth Secret

Generate a random secret:
```bash
openssl rand -base64 32
```

Or use: https://generate-secret.vercel.app/32

Copy the output to `NEXTAUTH_SECRET` in `.env.local`

### 3. Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Enable **Google+ API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
4. Create OAuth credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Application type: **Web application**
   - Name: X-Clone (or your choice)
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google` (for local)
     - `https://your-domain.vercel.app/api/auth/callback/google` (for production)
   - Click "Create"
5. Copy **Client ID** and **Client Secret** to `.env.local`

### 4. GitHub OAuth

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in:
   - **Application name**: X-Clone (or your choice)
   - **Homepage URL**: `http://localhost:3000` (or your production URL)
   - **Authorization callback URL**: 
     - `http://localhost:3000/api/auth/callback/github` (for local)
     - `https://your-domain.vercel.app/api/auth/callback/github` (for production)
4. Click "Register application"
5. Copy **Client ID**
6. Click "Generate a new client secret"
7. Copy **Client Secret** to `.env.local`

### 5. Pusher

1. Go to [Pusher Dashboard](https://dashboard.pusher.com/)
2. Sign up for a free account
3. Create a new app:
   - **App name**: X-Clone (or your choice)
   - **Cluster**: Choose closest to you (e.g., `us2`, `eu`, `ap-southeast-1`)
   - **Front-end tech**: React
   - **Back-end tech**: Node.js
4. Go to "App Keys" tab
5. Copy:
   - **App ID** → `PUSHER_APP_ID`
   - **Key** → `PUSHER_KEY` and `NEXT_PUBLIC_PUSHER_KEY`
   - **Secret** → `PUSHER_SECRET`
   - **Cluster** → `PUSHER_CLUSTER` and `NEXT_PUBLIC_PUSHER_CLUSTER`

## Verification

After setting up all environment variables, verify:

1. **Database connection**:
   ```bash
   npm run db:push
   ```
   Should complete without errors.

2. **Environment variables**:
   ```bash
   # Check if all required vars are set (in your terminal)
   node -e "require('dotenv').config({path:'.env.local'}); console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✓' : '✗'); console.log('NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? '✓' : '✗');"
   ```

3. **Start the app**:
   ```bash
   npm run dev
   ```
   Visit http://localhost:3000 and try signing in.

## Troubleshooting

### Database Connection Error
- Check PostgreSQL is running: `pg_isready`
- Verify connection string format
- Check firewall/network settings

### OAuth Not Working
- Verify redirect URIs match exactly (including http/https)
- Check OAuth credentials are correct
- Clear browser cookies and try again

### Pusher Not Working
- Verify cluster matches in both `PUSHER_CLUSTER` and `NEXT_PUBLIC_PUSHER_CLUSTER`
- Check browser console for errors
- Ensure Pusher app is active in dashboard

## Production Deployment (Vercel)

When deploying to Vercel:

1. Add all environment variables in Vercel dashboard:
   - Go to your project > Settings > Environment Variables
   - Add each variable from `.env.local`

2. Update `NEXTAUTH_URL` to your Vercel URL:
   ```
   NEXTAUTH_URL=https://your-app.vercel.app
   ```

3. Update OAuth redirect URIs to include your production URL

4. Deploy:
   ```bash
   vercel --prod
   ```

## Notes

- Never commit `.env.local` to git (it's in `.gitignore`)
- Use different OAuth apps for development and production
- Free tier limits:
  - Supabase: 500MB database, 2GB bandwidth
  - Pusher: 200k messages/day, 100 concurrent connections
  - Vercel: Generous free tier

