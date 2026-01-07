# Test User Cleanup Guide

## Problem Solved

When you try to sign up with an email that already exists in Convex, you get:
```
"The user already exists"
```

This guide shows you how to delete those test accounts so you can use those email addresses again.

---

## Quick Commands

### Option 1: Interactive Script (Recommended)

**Run the interactive cleanup tool**:

```bash
npx tsx scripts/cleanup-test-users.ts
```

This gives you a menu with options to:
1. List all users
2. Check if specific email exists
3. Delete user by email
4. Delete multiple users (comma-separated)
5. Delete all unverified users

### Option 2: Direct Convex Dashboard

1. Go to **https://dashboard.convex.dev**
2. Select your project: **mild-tern-361**
3. Click **Data** → **users** table
4. Find the user by email
5. Click the **...** menu → **Delete**
6. Confirm deletion

---

## Step-by-Step: Delete Specific Emails

### Step 1: Run the cleanup script

```bash
cd /Users/briandusape/Projects/propiq
npx tsx scripts/cleanup-test-users.ts
```

### Step 2: Choose option 3 (Delete user by email)

```
What would you like to do?

1. List all users
2. Check if specific email exists
3. Delete user by email          <-- Choose this
4. Delete multiple users
5. Delete all unverified users
0. Exit

Enter your choice (0-5): 3
```

### Step 3: Enter the email

```
⚠️  Enter email address to DELETE: test@example.com
```

### Step 4: Confirm deletion

```
Found user:
   Email: test@example.com
   Name: Test User
   Email Verified: No
   Tier: free

❗ Are you sure you want to DELETE this user? (yes/no): yes
```

### Step 5: Success!

```
✅ Successfully deleted user: test@example.com

Deleted data:
   - Sessions: 1
   - Property Analyses: 0
   - Support Chats: 0
   - Verification Tokens: 1

✨ You can now sign up with this email address!
```

---

## Quick Examples

### Check if email exists

```bash
npx tsx scripts/cleanup-test-users.ts
# Choose option 2
# Enter: test@example.com
```

**Output**:
```
✅ Email test@example.com is NOT in database - you can sign up with it!
```

OR

```
⚠️  Email test@example.com EXISTS in database:
   ID: abc123
   Email Verified: ❌ No
   Active: 🟢 Yes
   Tier: free
```

### Delete multiple emails at once

```bash
npx tsx scripts/cleanup-test-users.ts
# Choose option 4
# Enter: test1@example.com, test2@example.com, test3@example.com
```

### Delete ALL unverified users

**⚠️ Use with caution** - this deletes ALL users who haven't verified their email.

```bash
npx tsx scripts/cleanup-test-users.ts
# Choose option 5
# Confirm: yes
```

This is useful for:
- Cleaning up abandoned signups
- Removing test accounts that never verified
- Starting fresh with test data

### List all users in database

```bash
npx tsx scripts/cleanup-test-users.ts
# Choose option 1
```

**Output**:
```
Found 3 users:

1. test@example.com
   ❌ Verified | 🟢 Active | Tier: free
   Created: 1/7/2026 | Analyses: 0

2. brian@example.com
   ✅ Verified | 🟢 Active | Tier: pro
   Created: 1/5/2026 | Analyses: 15

3. demo@example.com
   ❌ Verified | 🔴 Active | Tier: free
   Created: 1/3/2026 | Analyses: 0
```

---

## What Gets Deleted?

When you delete a user, the script **permanently removes**:

✅ **User account** - Email, password, profile info
✅ **Sessions** - All login sessions (logs user out everywhere)
✅ **Property analyses** - All saved property analyses
✅ **Support chats** - All support chat history
✅ **Email verification tokens** - All pending verification emails

**This is permanent and cannot be undone!**

---

## Common Scenarios

### Scenario 1: "I tried signing up but got 'user already exists'"

**Solution**: Delete that specific email

```bash
npx tsx scripts/cleanup-test-users.ts
# Option 3: Delete user by email
# Enter the email you tried to sign up with
```

### Scenario 2: "I created 10 test accounts and want to delete them all"

**Solution**: Delete multiple users

```bash
npx tsx scripts/cleanup-test-users.ts
# Option 4: Delete multiple users
# Enter: test1@ex.com, test2@ex.com, test3@ex.com, ...
```

### Scenario 3: "I want to start fresh - delete all test accounts"

**Solution**: Delete all unverified users

```bash
npx tsx scripts/cleanup-test-users.ts
# Option 5: Delete all unverified users
# Confirm: yes
```

This keeps real users (who verified their email) but removes test accounts.

### Scenario 4: "How do I see what emails are in the database?"

**Solution**: List all users

```bash
npx tsx scripts/cleanup-test-users.ts
# Option 1: List all users
```

---

## Direct Convex Dashboard Method

If the script doesn't work, you can use the Convex web dashboard:

### Step 1: Open Convex Dashboard

1. Go to **https://dashboard.convex.dev**
2. Log in with your Convex account
3. Select project: **mild-tern-361**

### Step 2: Navigate to Users Table

1. Click **Data** in left sidebar
2. Click **users** table
3. You'll see a list of all users

### Step 3: Find the User

- Scroll through the list to find the email
- OR use the search box (Cmd+F or Ctrl+F)
- Click on the user row to expand it

### Step 4: Delete the User

1. Click the **...** menu (3 dots) on the right
2. Select **Delete**
3. Confirm deletion

**Note**: This only deletes the user record, not related data (sessions, analyses, etc.). The script method is recommended because it cleans up everything.

---

## Troubleshooting

### "Error: CONVEX_URL environment variable not set"

**Fix**: Make sure you're in the project directory:

```bash
cd /Users/briandusape/Projects/propiq
npx tsx scripts/cleanup-test-users.ts
```

The script reads `VITE_CONVEX_URL` from `frontend/.env.local`.

### "User not found"

**Possible reasons**:
1. Email was already deleted
2. Typo in email address (check spelling)
3. Email never existed in database

**Verify**:
```bash
npx tsx scripts/cleanup-test-users.ts
# Option 1: List all users
# Check if the email appears in the list
```

### "Error fetching users"

**Possible reasons**:
1. Convex deployment is down
2. Network connection issue
3. Environment variable not set correctly

**Fix**:
```bash
# Check if Convex URL is set
cat frontend/.env.local | grep VITE_CONVEX_URL

# Should show: VITE_CONVEX_URL=https://mild-tern-361.convex.cloud
```

---

## Safety Notes

⚠️ **Important**:

1. **Deletion is permanent** - You cannot undo this action
2. **Double-check emails** - Make sure you're deleting the right account
3. **Don't delete real users** - Only delete test/development accounts
4. **Production caution** - Be extra careful when running in production

**Best Practice**:
- Use the "Check if email exists" option (2) first
- Verify it's the right user before deleting
- Only delete unverified test accounts

---

## Alternative: Using Convex CLI

If you prefer using the Convex CLI directly:

```bash
# List all users
npx convex run adminCleanup:listAllUsers

# Check specific email
npx convex run adminCleanup:findUserByEmail '{"email":"test@example.com"}'

# Delete user by email
npx convex run adminCleanup:deleteUserByEmail '{"email":"test@example.com"}'

# Delete multiple users
npx convex run adminCleanup:deleteMultipleUsers '{"emails":["test1@ex.com","test2@ex.com"]}'

# Delete all unverified users
npx convex run adminCleanup:deleteUnverifiedUsers '{}'
```

---

## Summary

**To clean up "user already exists" errors:**

1. **Run**: `npx tsx scripts/cleanup-test-users.ts`
2. **Choose**: Option 3 (Delete user by email)
3. **Enter**: The email you want to free up
4. **Confirm**: yes
5. **Done**: You can now sign up with that email!

**Quick one-liner**:
```bash
cd /Users/briandusape/Projects/propiq && npx tsx scripts/cleanup-test-users.ts
```

---

**Files Created**:
- `convex/adminCleanup.ts` - Cleanup functions (deployed to Convex)
- `scripts/cleanup-test-users.ts` - Interactive cleanup script

**Convex Deployment**: ✅ Deployed to https://mild-tern-361.convex.cloud

**Ready to use!** 🎉
