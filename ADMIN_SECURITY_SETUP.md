# Admin Security Setup Guide

## Overview
Admin access is restricted to employees only. This guide explains how to configure Clerk for manual account creation and secure admin login access.

## Approach: Manual Account Creation

### Step 1: Configure Clerk to Restrict Public Signup

1. **Go to Clerk Dashboard** → Your Application → Settings → User & Authentication
2. **Find "Restrictions" section**
3. **Enable "Restrict sign-ups"** - This prevents public signup
4. **Select "Disabled completely"** - This ensures all accounts must be created manually in the Clerk dashboard

### Step 2: Create Admin Accounts Manually

1. **Go to Clerk Dashboard** → Users → "Create User"
2. Enter the employee's email address
3. Set a temporary password (user will be prompted to change it on first login)
4. Click "Create User"
5. **Immediately assign the `admin` role** (see Step 3 below)

### Step 3: Assign Admin Role

**Via Clerk Dashboard (Required for new accounts):**
1. Clerk Dashboard → Users → Select the newly created user
2. Go to "Metadata" tab
3. Add to `publicMetadata`:
   ```json
   {
     "role": "admin"
   }
   ```
4. Click "Save" to apply the changes

**Note:** The admin role must be set in Clerk's `publicMetadata` before the user can access admin routes.

### Step 4: Admin Login Access

Admins can log in using one of these methods:

1. **Direct Admin Login URL**: `/admin/login`
   - This is the recommended method for admins
   - Not linked from the public website
   - Bookmark this URL for easy access

2. **Standard Sign-In URL**: `/sign-in`
   - Also accessible but less specific
   - Can be used if needed

**Important:** The landing page (`/`) no longer displays an admin login option to keep it public-facing for interpreters and insurance companies.

### Step 5: Verify Access

1. Admin navigates to `/admin/login` (or `/sign-in`)
2. Signs in with credentials provided
3. Clerk checks authentication (must be logged in)
4. Middleware checks `role === 'admin'` in `publicMetadata`
5. If not admin → redirected to landing page
6. If admin → access granted to `/admin/dashboard`

## Current Security Status

✅ **What's Protected:**
- `/admin/*` routes (except `/admin/login`) require authentication + admin role
- `/admin/login` is accessible without authentication (for login access)
- Middleware checks role before allowing access to admin routes
- Non-admins are redirected to landing page if they try to access admin routes
- Landing page is public-facing (no admin login card visible)

✅ **What's Configured:**
- Admin login route at `/admin/login` for easy admin access
- Middleware properly excludes `/admin/login` from protection
- Public website remains accessible for interpreters and insurance companies

⚠️ **What You Need to Configure:**
- Restrict public signup in Clerk dashboard (set to "Disabled completely")
- Create admin accounts manually in Clerk dashboard
- Assign `admin` role in Clerk's `publicMetadata` for each admin user

## Code Changes Made

1. **Updated Landing Page**: Removed admin login card to make it public-facing
2. **Created Admin Login Route**: `/admin/login` provides dedicated admin entry point
3. **Updated Middleware**: Excludes `/admin/login` from authentication requirement while protecting other admin routes
4. **Route Protection**: All `/admin/*` routes (except login) require admin role

## Testing

After configuration:
1. **Test Public Access**: Visit `/` → Should show public landing page (no admin login visible)
2. **Test Admin Login**: Visit `/admin/login` → Should show sign-in form (accessible without auth)
3. **Test Admin Access**: Admin logs in at `/admin/login` → Should redirect to `/admin/dashboard` with full access
4. **Test Non-Admin Protection**: Non-admin user tries to access `/admin/dashboard` → Should be redirected to `/`
5. **Test Sign-Up Restriction**: Try to sign up at `/sign-up` → Should be blocked/redirected (if Clerk restrictions enabled)

## Additional Security Recommendations

1. **Use Email Verification**: Require email verification in Clerk settings
2. **Enable MFA**: Consider requiring multi-factor authentication for admins
3. **Monitor User Activity**: Check Clerk dashboard regularly for new signups
4. **IP Restrictions** (Optional): If you have static IPs, consider restricting admin login to specific IPs

## Support

If you need help configuring Clerk:
- Clerk Documentation: https://clerk.com/docs
- Support: Check Clerk dashboard support section

