# How to Rename Your GitHub Repository

Renaming a GitHub repository is actually very simple! Here's how to do it:

## Steps to Rename on GitHub:

1. **Go to your repository on GitHub** (https://github.com/yourusername/intermed-main)

2. **Click on the "Settings" tab** (it's in the top navigation bar of your repository)

3. **Scroll down to the "Repository name" section** (near the top of the settings page)

4. **Enter the new name**: `interprefi` (or whatever you'd like - GitHub allows lowercase letters, numbers, and hyphens)

5. **Click "Rename"** button

6. **That's it!** GitHub will automatically:
   - Update the repository URL
   - Redirect the old URL to the new one
   - Update all references in the GitHub UI

## After Renaming:

### Update Your Local Repository Remote URL:

After renaming on GitHub, update your local repository's remote URL:

```bash
git remote set-url origin https://github.com/yourusername/interprefi.git
```

Or if you're using SSH:
```bash
git remote set-url origin git@github.com:yourusername/interprefi.git
```

Verify it worked:
```bash
git remote -v
```

### Important Notes:

- ⚠️ **Update CI/CD pipelines**: If you use GitHub Actions, Vercel, or other services, update the repository URL there
- ⚠️ **Update deployment settings**: Update your Vercel/deployment platform with the new repository name
- ⚠️ **Update any documentation**: Update README files or docs that reference the old name
- ⚠️ **Team notifications**: Let your team know about the rename if you work with others

## Service Configuration Updates Needed:

When you change your domain name, you'll need to update configurations in several services:

### 1. **Clerk (Authentication)** ⚠️ REQUIRED
- **Where**: Clerk Dashboard → Settings → Domains
- **What to do**: Add your new domain (e.g., `interprefi.com` and `www.interprefi.com`)
- **Also update**: Allowed origins/redirect URLs in Clerk settings
- **Impact**: Users won't be able to sign in if this isn't updated

### 2. **Ably (Real-time Messaging)** ⚠️ RECOMMENDED
- **Where**: Ably Dashboard → Your App → Settings → Allowed Origins
- **What to do**: Add your new domain to the allowed origins list
- **Why**: Prevents unauthorized domains from using your Ably API keys
- **Note**: Your API keys (`NEXT_PUBLIC_ABLY_API_KEY` and `ABLY_API_KEY`) don't need to change, but domain restrictions should be updated

### 3. **Google Maps API** ⚠️ RECOMMENDED
- **Where**: Google Cloud Console → APIs & Services → Credentials
- **What to do**: 
  - Update HTTP referrer restrictions on your API key
  - Add your new domain (e.g., `interprefi.com/*`)
  - Remove old domain if no longer needed
- **Environment variables**: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` and `NEXT_PUBLIC_GOOGLE_MAP_ID` (values don't change, just restrictions)

### 4. **Vercel (Deployment)** ⚠️ REQUIRED
- **Where**: Vercel Dashboard → Your Project → Settings
- **What to do**: 
  - Update the repository connection if you renamed the GitHub repo
  - Update custom domain settings
  - Update environment variables if any contain the old domain
- **Domains**: Add your new domain in the Domains section

### 5. **Neon Database** ✅ NO ACTION NEEDED
- **Why**: Database connection strings don't depend on your domain name
- **Note**: Just ensure your `DATABASE_URL` environment variable is still set correctly

### 6. **Code Updates** ⚠️ REQUIRED
- **File**: `/app/api/[[...route]]/route.ts`
- **What to do**: Update CORS origins array:
  ```typescript
  origin: [
    'http://localhost:8081', 
    'https://interprefi.com',  // ← Add your new domain
    'https://www.interprefi.com',  // ← Add www version
    'https://interprefi.vercel.app',  // ← Update Vercel URL if changed
    'https://localhost:3000'
  ]
  ```
- **Remove**: Old domain references (`https://www.pena-med.com`, etc.)

### 7. **Environment Variables** ⚠️ CHECK
Check these in Vercel/your hosting platform and update if they contain the old domain:
- Any variables that might reference the old domain
- Mobile app API endpoints (if your mobile app calls your API)
- Webhook URLs (if any services send webhooks to your app)

## ⚠️ Will This Cause Downtime?

**Short Answer: No, if done in the correct order!** Your production site will remain live throughout the process.

### How Vercel Deployments Work:

1. **Code changes don't immediately go live** - When you push code changes, Vercel builds a new deployment but keeps your current live site running
2. **Zero-downtime deployments** - Vercel only switches to the new deployment once it's successfully built and ready
3. **Old deployments stay active** - Even if you rename the GitHub repo, your current Vercel deployment keeps running

### Safe Order of Operations (Zero Downtime):

**Phase 1: Preparation (No Impact on Live Site)**
1. ✅ Make code changes locally (update CORS, rename references)
2. ✅ Test changes locally
3. ✅ Commit and push code changes (triggers new Vercel deployment, but old one stays live)

**Phase 2: Service Configuration (Add, Don't Remove)**
4. ✅ **Add** new domain to Clerk (keep old domain too)
5. ✅ **Add** new domain to Ably allowed origins (keep old domain too)
6. ✅ **Add** new domain to Google Maps API restrictions (keep old domain too)
7. ✅ **Add** new domain in Vercel (old domain continues working)

**Phase 3: Domain Migration**
8. ✅ Wait for new Vercel deployment to complete (you can see this in Vercel dashboard)
9. ✅ Point your DNS to new domain OR add new domain as primary in Vercel
10. ✅ Test everything works on new domain

**Phase 4: GitHub Repo Rename (Minimal Impact)**
11. ✅ Rename GitHub repository (Vercel deployment keeps running)
12. ✅ Reconnect Vercel to renamed repo (in Vercel Settings → Git)
13. ✅ Update local git remote URL

**Phase 5: Cleanup (Do This Last, After Everything Works)**
14. ⏰ **Only after new domain is fully working**: Remove old domain from service restrictions
15. ⏰ Remove old domain from Vercel (optional, keep if you want redirects)

### Critical Rules to Avoid Downtime:

❌ **DON'T remove old domains** from Clerk/Ably/Google Maps until new domain is fully working
❌ **DON'T rename GitHub repo** until you're ready to reconnect Vercel (takes 1-2 minutes)
❌ **DON'T delete old Vercel deployments** - keep them as backup

✅ **DO add new domains alongside old ones** (not replace)
✅ **DO test new domain thoroughly** before removing old one
✅ **DO rename GitHub repo during low-traffic period** if possible (safer, but not required)

### What Happens During Each Change:

- **Code changes pushed**: Old site stays live, new deployment builds in background (~2-5 minutes)
- **Service config (add new domain)**: Instant, both old and new domains work
- **Vercel domain update**: Instant, both domains work simultaneously
- **GitHub repo rename**: Vercel loses connection for ~1-2 minutes until you reconnect it
- **Remove old domains**: Instant, but old domain stops working immediately

## Summary Checklist (In Order):

### Phase 1: Code Changes
- [ ] Update CORS origins in code (add new domain, keep old one for now)
- [ ] Update any other code references to old name/domain
- [ ] Commit and push changes
- [ ] Wait for Vercel deployment to complete

### Phase 2: Add New Domain to Services
- [ ] Add new domain to Clerk (Settings → Domains)
- [ ] Add new domain to Ably allowed origins (if restrictions enabled)
- [ ] Add new domain to Google Maps API restrictions
- [ ] Add new domain in Vercel (Settings → Domains)

### Phase 3: Test & Switch
- [ ] Test new domain works end-to-end
- [ ] Update DNS (if using custom domain)
- [ ] Verify sign-in works on new domain
- [ ] Verify all features work

### Phase 4: GitHub Rename
- [ ] Rename GitHub repository
- [ ] Update local git remote URL
- [ ] Reconnect Vercel to renamed repo

### Phase 5: Cleanup (After Everything Works)
- [ ] Remove old domain from Clerk (only after confirming new one works)
- [ ] Remove old domain from other services
- [ ] Update code to remove old domain from CORS (optional cleanup)

