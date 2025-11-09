# Vercel Deployment Guide

This guide will help you deploy X-Clone directly to Vercel and set up all required services.

## Prerequisites

- GitHub account (to push code)
- Vercel account (sign up at https://vercel.com)
- Google account (for OAuth)
- GitHub account (for OAuth)
- Pusher account (sign up at https://pusher.com)

## Step 1: Push Code to GitHub

1. **Initialize git repository** (if not already done):
   ```bash
   cd hw5
   git init
   git add .
   git commit -m "Initial commit: X-Clone app"
   ```

2. **Create a new repository on GitHub**:
   - Go to https://github.com/new
   - Name it (e.g., `x-clone`)
   - Don't initialize with README
   - Click "Create repository"

3. **Push your code**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git branch -M main
   git push -u origin main
   ```

## Step 2: Set Up Vercel Postgres Database

1. **Go to Vercel Dashboard**:
   - Visit https://vercel.com/dashboard
   - Sign in or create account

2. **Import your GitHub repository**:
   - Click "Add New..." > "Project"
   - Import your GitHub repository
   - Framework Preset: **Next.js**
   - Root Directory: `hw5` (if your repo is in a subdirectory)
   - Click "Deploy" (we'll configure environment variables after)

3. **Create Postgres Database**:
   - In your project dashboard, go to **Storage** tab
   - Click **Create Database** > **Postgres**
   - Name it (e.g., `xclone-db`)
   - Select region closest to you
   - Click **Create**
   - Wait for database to be created

4. **Get Database Connection String**:
   - In Storage tab, click on your database
   - Go to **.env.local** tab
   - Copy the `POSTGRES_URL` value
   - Format: `postgres://default:xxxxx@xxxxx.xxxxx.xxxxx:5432/verceldb`
   - **Save this for Step 4**

## Step 3: Set Up OAuth Providers

### Google OAuth

1. **Go to Google Cloud Console**:
   - Visit https://console.cloud.google.com/
   - Create a new project or select existing

2. **Enable Google+ API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and click **Enable**

3. **Create OAuth Credentials**:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Application type: **Web application**
   - Name: `X-Clone Production`
   - **Authorized redirect URIs**: 
     ```
     https://YOUR_VERCEL_APP.vercel.app/api/auth/callback/google
     ```
     (Replace `YOUR_VERCEL_APP` with your actual Vercel app name)
   - Click **Create**
   - **Copy Client ID and Client Secret** (save for Step 4)

### GitHub OAuth

1. **Go to GitHub Developer Settings**:
   - Visit https://github.com/settings/developers
   - Click "New OAuth App"

2. **Create OAuth App**:
   - **Application name**: `X-Clone Production`
   - **Homepage URL**: `https://YOUR_VERCEL_APP.vercel.app`
   - **Authorization callback URL**: 
     ```
     https://YOUR_VERCEL_APP.vercel.app/api/auth/callback/github
     ```
   - Click **Register application**
   - **Copy Client ID**
   - Click **Generate a new client secret**
   - **Copy Client Secret** (save for Step 4)

## Step 4: Set Up Pusher

1. **Go to Pusher Dashboard**:
   - Visit https://dashboard.pusher.com/
   - Sign in or create account

2. **Create New App**:
   - Click "Create app" or "Channels apps" > "Create app"
   - **App name**: `X-Clone`
   - **Cluster**: Choose closest to you (e.g., `us2`, `eu`, `ap-southeast-1`)
   - **Front-end tech**: React
   - **Back-end tech**: Node.js
   - Click **Create app**

3. **Get App Credentials**:
   - Go to **App Keys** tab
   - **Copy the following** (save for Step 5):
     - App ID
     - Key
     - Secret
     - Cluster

## Step 5: Configure Environment Variables in Vercel

1. **Go to Your Project Settings**:
   - In Vercel dashboard, click on your project
   - Go to **Settings** > **Environment Variables**

2. **Add Each Variable** (click "Add" for each):

   ```
   DATABASE_URL
   Value: [Paste the POSTGRES_URL from Step 2]
   ```

   ```
   NEXTAUTH_URL
   Value: https://YOUR_VERCEL_APP.vercel.app
   ```

   ```
   NEXTAUTH_SECRET
   Value: [Generate with: openssl rand -base64 32]
   ```
   (Run `openssl rand -base64 32` in terminal, or use https://generate-secret.vercel.app/32)

   ```
   GOOGLE_CLIENT_ID
   Value: [From Step 3 - Google OAuth]
   ```

   ```
   GOOGLE_CLIENT_SECRET
   Value: [From Step 3 - Google OAuth]
   ```

   ```
   GITHUB_CLIENT_ID
   Value: [From Step 3 - GitHub OAuth]
   ```

   ```
   GITHUB_CLIENT_SECRET
   Value: [From Step 3 - GitHub OAuth]
   ```

   ```
   PUSHER_APP_ID
   Value: [From Step 4]
   ```

   ```
   PUSHER_KEY
   Value: [From Step 4]
   ```

   ```
   PUSHER_SECRET
   Value: [From Step 4]
   ```

   ```
   PUSHER_CLUSTER
   Value: [From Step 4, e.g., us2]
   ```

   ```
   NEXT_PUBLIC_PUSHER_KEY
   Value: [Same as PUSHER_KEY from Step 4]
   ```

   ```
   NEXT_PUBLIC_PUSHER_CLUSTER
   Value: [Same as PUSHER_CLUSTER from Step 4]
   ```

3. **Set Environment for All Variables**:
   - For each variable, select:
     - ✅ Production
     - ✅ Preview
     - ✅ Development
   - Click **Save**

## Step 6: Deploy and Run Database Migrations

1. **Trigger a New Deployment**:
   - Go to **Deployments** tab
   - Click the three dots on latest deployment > **Redeploy**
   - Or push a new commit to trigger deployment

2. **Run Database Migrations**:
   - After deployment completes, go to your project
   - Click on the deployment
   - Open **Functions** tab to see logs
   - Or use Vercel CLI (optional):
     ```bash
     npm i -g vercel
     vercel login
     vercel link
     vercel env pull .env.local
     npx prisma migrate deploy
     ```

3. **Alternative: Use Vercel CLI for Database Setup**:
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Login
   vercel login
   
   # Link to your project
   cd hw5
   vercel link
   
   # Pull environment variables
   vercel env pull .env.local
   
   # Generate Prisma Client
   npm run db:generate
   
   # Push database schema
   npm run db:push
   ```

## Step 7: Update OAuth Redirect URIs (If Needed)

If your Vercel app URL is different from what you configured:

1. **Get Your Vercel App URL**:
   - In Vercel dashboard, your app URL is shown at the top
   - Format: `https://your-app-name.vercel.app`

2. **Update Google OAuth**:
   - Go back to Google Cloud Console
   - Edit your OAuth client
   - Update redirect URI to: `https://your-app-name.vercel.app/api/auth/callback/google`

3. **Update GitHub OAuth**:
   - Go back to GitHub Developer Settings
   - Edit your OAuth app
   - Update callback URL to: `https://your-app-name.vercel.app/api/auth/callback/github`

## Step 8: Test Your Deployment

1. **Visit Your App**:
   - Go to `https://YOUR_VERCEL_APP.vercel.app`
   - You should see the sign-in page

2. **Test OAuth**:
   - Click "Continue with Google" or "Continue with GitHub"
   - Complete OAuth flow
   - Register with a userID
   - Test creating posts, comments, likes

3. **Check Logs** (if issues):
   - Go to **Deployments** tab
   - Click on deployment
   - Check **Functions** tab for errors
   - Check **Runtime Logs** for runtime errors

## Troubleshooting

### Database Connection Issues

- **Error: "Can't reach database server"**:
  - Verify `DATABASE_URL` is correct in Vercel environment variables
  - Check database is active in Vercel Storage tab
  - Ensure database region matches your app region

- **Error: "Schema not found"**:
  - Run `npm run db:push` locally with Vercel env vars, or
  - Use Vercel CLI: `vercel env pull .env.local && npm run db:push`

### OAuth Issues

- **Error: "Redirect URI mismatch"**:
  - Verify redirect URIs in OAuth provider match exactly
  - Check `NEXTAUTH_URL` in Vercel matches your app URL
  - Ensure no trailing slashes

- **Error: "Invalid client"**:
  - Verify Client ID and Secret are correct
  - Check for extra spaces when copying

### Pusher Issues

- **Real-time not working**:
  - Verify `NEXT_PUBLIC_PUSHER_KEY` and `NEXT_PUBLIC_PUSHER_CLUSTER` are set
  - Check browser console for Pusher errors
  - Ensure cluster matches in both variables

### Build Errors

- **Prisma Client not generated**:
  - Add to `package.json` scripts:
    ```json
    "postinstall": "prisma generate"
    ```
  - Or add build command in Vercel: `npm run db:generate && npm run build`

- **TypeScript errors**:
  - Check all files are committed
  - Verify `tsconfig.json` is correct

## Quick Checklist

Before testing, ensure:

- [ ] Code pushed to GitHub
- [ ] Project imported to Vercel
- [ ] Vercel Postgres database created
- [ ] Google OAuth configured with production URL
- [ ] GitHub OAuth configured with production URL
- [ ] Pusher app created
- [ ] All environment variables added to Vercel
- [ ] Database schema pushed (`npm run db:push`)
- [ ] Deployment successful
- [ ] OAuth redirect URIs match Vercel URL

## Next Steps

After successful deployment:

1. **Set up custom domain** (optional):
   - Go to Settings > Domains
   - Add your custom domain

2. **Enable analytics** (optional):
   - Go to Analytics tab
   - Enable Web Analytics

3. **Set up monitoring**:
   - Check Runtime Logs regularly
   - Set up error alerts if needed

## Useful Commands

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link project
vercel link

# Pull environment variables locally
vercel env pull .env.local

# Deploy to production
vercel --prod

# View logs
vercel logs
```

## Support

- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs
- Prisma Docs: https://www.prisma.io/docs

