# Examination: Same Email with Different Providers - Multiple UserIDs

## Current Implementation Analysis

### Schema Design
- **Email field**: NOT unique (line 44 in `schema.prisma`)
  - Comment: "Removed @unique to allow same email for different providers"
- **UserID field**: Unique (line 42 in `schema.prisma`)
  - Each user can have one userID, but userID must be unique across all users

### Authentication Flow

1. **Email Modification** (`lib/auth.ts`, lines 83-99):
   - When signing in with OAuth, the email is modified to include provider and providerAccountId
   - Format: `user+provider-providerAccountId@domain.com`
   - Example: `john+google-12345678@example.com` vs `john+github-87654321@example.com`
   - This ensures each OAuth account gets a unique email in the database

2. **Custom Adapter** (`lib/custom-adapter.ts`):
   - `getUserByEmail()`: Returns `null` to prevent email-based user lookup
   - `getUserByAccount()`: Looks up users by `provider + providerAccountId` (unique combination)
   - This ensures each OAuth account creates a separate user, even with the same original email

### Result

**YES - The same email with different providers CAN have 2 different userIDs**

## Scenario Example

1. User signs in with Google using `john@example.com`
   - Creates User A with email `john+google-12345678@example.com`
   - User A can register userID: `john_google`

2. Same person signs in with GitHub using `john@example.com`
   - Creates User B with email `john+github-87654321@example.com`
   - User B can register userID: `john_github`

3. Result:
   - Two separate users in the database
   - Two different userIDs possible
   - Same original email, different providers

## Database Structure

```
User Table:
- User A: id=abc123, email=john+google-12345678@example.com, userID=john_google
- User B: id=def456, email=john+github-87654321@example.com, userID=john_github

Account Table:
- Account 1: provider=google, providerAccountId=12345678, userId=abc123
- Account 2: provider=github, providerAccountId=87654321, userId=def456
```

## Verification Steps

To verify this behavior:

1. Sign in with Google using email `test@example.com`
2. Register a userID (e.g., `test_google`)
3. Sign out
4. Sign in with GitHub using the same email `test@example.com`
5. Register a different userID (e.g., `test_github`)
6. Check database - you should see 2 separate users with 2 different userIDs

## Potential Issues

1. **User Confusion**: Users might not understand why they need to register twice
2. **Data Fragmentation**: Posts, likes, follows are split across two accounts
3. **No Account Linking**: There's no mechanism to link accounts from different providers

## Recommendations

If you want to prevent this behavior, you could:

1. **Link accounts by original email**: Modify the custom adapter to look up users by original email (before modification)
2. **Add account linking UI**: Allow users to link multiple OAuth providers to one account
3. **Warn users**: Show a message if an account with the same email already exists

