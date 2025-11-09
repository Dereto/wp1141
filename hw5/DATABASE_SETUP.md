# Database Setup on Vercel

The error indicates that the database tables don't exist yet. You need to push the Prisma schema to your Vercel Postgres database.

## Quick Fix

### Option 1: Using npx (Recommended for WSL/Windows)

If you're using WSL and don't have Node installed globally, use `npx`:

1. **Login to Vercel**:
   ```bash
   cd hw5
   npx vercel login
   ```

2. **Link to your project**:
   ```bash
   npx vercel link
   ```
   - Select your Vercel project when prompted

3. **Pull environment variables**:
   ```bash
   npx vercel env pull .env.local
   ```
   This will download your Vercel environment variables (including `DATABASE_URL`)

4. **Push database schema**:
   ```bash
   npm run db:push
   ```
   This will create all the tables in your Vercel Postgres database.

### Option 2: Using Vercel CLI (If Node is installed globally)

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Link to your project**:
   ```bash
   cd hw5
   vercel link
   ```
   - Select your Vercel project when prompted

4. **Pull environment variables**:
   ```bash
   vercel env pull .env.local
   ```
   This will download your Vercel environment variables (including `DATABASE_URL`)

5. **Push database schema**:
   ```bash
   npm run db:push
   ```
   This will create all the tables in your Vercel Postgres database.

### Option 3: Manual DATABASE_URL Setup

If you can't use Vercel CLI:

1. **Get DATABASE_URL from Vercel**:
   - Go to your Vercel project dashboard
   - Navigate to **Storage** tab
   - Click on your Postgres database
   - Go to **.env.local** tab
   - Copy the `POSTGRES_URL` value

2. **Set up locally**:
   ```bash
   cd hw5
   # Create or edit .env.local
   echo 'DATABASE_URL="<paste-your-postgres-url-here>"' >> .env.local
   ```

3. **Push schema**:
   ```bash
   npm run db:push
   ```

## Verify Tables Were Created

After running `db:push`, you should see output like:

```
✔ Generated Prisma Client
The database is now in sync with your Prisma schema.
```

## Common Issues

### Issue: "Can't reach database server"
- **Solution**: Check that `DATABASE_URL` is correct
- Verify the database is active in Vercel Storage tab
- Ensure the database region matches your app region

### Issue: "Schema already exists"
- **Solution**: This is fine - it means tables already exist
- You can continue or run `prisma migrate reset` if you want to start fresh (⚠️ deletes all data)

### Issue: "Connection timeout"
- **Solution**: Check your network/firewall
- Verify database is not paused
- Try again after a few minutes

### Issue: "node: not found" in WSL
- **Solution**: Use `npx vercel` instead of `vercel` command
- Or install Node.js in WSL: `curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && sudo apt-get install -y nodejs`

## After Setup

Once the schema is pushed:
1. Restart your Vercel deployment (or wait for next deployment)
2. Try signing in again
3. The OAuth flow should work now

## Next Steps

After database setup:
- Test OAuth login
- Create a test user
- Verify posts/comments work
