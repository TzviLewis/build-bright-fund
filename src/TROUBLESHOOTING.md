# Complete Troubleshooting Guide

## Quick Start: Diagnostic Panel

A **Diagnostic Panel** has been added to help identify issues:

1. Look for the **blue circle button** in the bottom-right corner
2. Click it to open the diagnostic panel
3. Click "Run Diagnostics"
4. Review the results:
   - ✅ Green = Working correctly
   - ⚠️ Yellow = Warning (may need attention)
   - ❌ Red = Error (needs fixing)

---

## Issue 1: Campaign Not Showing

### Symptoms
- `/campaigns` page is empty
- Can't access campaign detail page
- "Campaign not found" error

### Quick Fixes

**Step 1: Check if campaign exists**
1. Go to `/admin-login`
2. Enter password: `admin5786`
3. Look at the "Campaign" tab
4. If empty, you need to create a campaign

**Step 2: Create a campaign**
1. In Admin Dashboard, fill in campaign details:
   - Campaign Title: "Building For Our Future"
   - Fundraising Goal: 50000
   - Project Description: Add description
   - Campaign Status: **Active** (not "draft")
   - Campaign Start Date: Today or earlier
   - Campaign End Date: Future date (e.g., 3 months from now)
2. Click "Save Campaign"
3. Go to `/campaigns` - campaign should now appear

**Step 3: Verify campaign dates**
- Start date must be ≤ today
- End date must be > today
- If dates are wrong, edit and save again

**Step 4: Clear browser cache**
1. Press `Ctrl+Shift+Delete` (Windows) or `Cmd+Shift+Delete` (Mac)
2. Select "All time"
3. Check "Cookies and other site data"
4. Click "Clear data"
5. Refresh page

### Advanced Debugging

**Check browser console**
1. Press `F12` to open Developer Tools
2. Go to "Console" tab
3. Look for error messages
4. Note any red errors

**Check Network tab**
1. Go to "Network" tab
2. Refresh page
3. Look for failed requests (red)
4. Click on failed request to see details

**Check database directly**
1. Go to Admin Dashboard
2. Check "Campaign" tab
3. Verify campaign data is saved
4. Check all required fields are filled

---

## Issue 2: Email Button Not Working

### Symptoms
- Email button doesn't respond
- Modal doesn't open
- "Failed to send email" error
- Email not received

### Quick Fixes

**Step 1: Check team has credentials**
1. Go to Admin Dashboard
2. Go to "Teams" tab
3. Find your team
4. Check if Team ID and Password are filled
5. If empty, click "Generate" buttons
6. Save team

**Step 2: Check email address**
1. Verify email format: `user@domain.com`
2. No spaces before/after
3. Valid domain name
4. Test with known email address

**Step 3: Open email modal**
1. Click green "Email" button on team card
2. Modal should open
3. If not, check browser console for errors

**Step 4: Send test email**
1. Enter your own email address
2. Click "Send Email"
3. Check your email (including spam folder)
4. If received, system is working

### Advanced Debugging

**Check API endpoint**
1. Open browser console (F12)
2. Go to "Network" tab
3. Click "Email" button
4. Look for `/api/send-email` request
5. Check response status:
   - 200 = Success
   - 400 = Bad request (check email)
   - 500 = Server error

**Check email service**
1. If using Wix API, verify credentials in `.env`
2. Check `WIX_API_KEY` and `WIX_SITE_ID`
3. If not set, system logs emails to console
4. Check browser console for email logs

**Check team data**
1. Go to Admin Dashboard
2. Find team in list
3. Verify Team ID is a number
4. Verify Password is a string
5. Both should be non-empty

---

## Issue 3: Teams Not Showing

### Symptoms
- Teams tab is empty
- No teams appear on campaign page
- "No teams yet" message

### Quick Fixes

**Step 1: Create a team**
1. Go to Admin Dashboard
2. Go to "Teams" tab
3. Click "Add Team"
4. Fill in all fields:
   - Team Name: Required
   - Fundraising Goal: Required
   - Number of Members: Required
   - Team Description: Required
5. Click "Generate" for Team ID
6. Click "Generate" for Password
7. Click "Add Team"

**Step 2: Verify team was saved**
1. Refresh Admin Dashboard
2. Go to "Teams" tab
3. Team should appear in list
4. Check all data is correct

**Step 3: Check team filtering**
1. Teams may be filtered by campaign
2. If team doesn't have campaignId, it shows for all campaigns
3. This is intentional for backward compatibility

### Advanced Debugging

**Check database**
1. Open browser console (F12)
2. Go to "Network" tab
3. Refresh Admin Dashboard
4. Look for `teams` API call
5. Check response has team data

**Check form validation**
1. Try creating team again
2. Fill all required fields
3. Check for error messages
4. Verify no special characters in Team ID

---

## Issue 4: Donations Not Counting

### Symptoms
- Donations don't appear in total
- Progress bar not updating
- Team totals incorrect

### Quick Fixes

**Step 1: Check donation status**
1. Go to Admin Dashboard
2. Go to "Donations" tab
3. Find donation
4. Check status = "completed"
5. If "pending", update to "completed"

**Step 2: Check donation amount**
1. Verify amount > 0
2. Verify amount is a number
3. Check no null/undefined values

**Step 3: Refresh data**
1. Go to Admin Dashboard
2. Click "Back to Campaign"
3. Return to campaign page
4. Data should refresh

**Step 4: Check campaign ID**
1. Donations should have campaignId
2. If missing, system shows all donations
3. This is intentional for backward compatibility

### Advanced Debugging

**Check database**
1. Go to Admin Dashboard
2. Go to "Donations" tab
3. Verify donations exist
4. Check all required fields
5. Verify amounts are correct

**Check filtering**
1. Donations filter by campaignId
2. If no campaignId, shows all donations
3. Check campaign ID matches

---

## Issue 5: Admin Login Not Working

### Symptoms
- Can't log in to Admin Dashboard
- "Invalid password" error
- Redirects to login page

### Quick Fixes

**Step 1: Check password**
- Password is: `admin5786`
- Case sensitive
- No spaces
- Exactly as shown

**Step 2: Clear browser storage**
1. Press `F12` to open Developer Tools
2. Go to "Application" tab
3. Click "Session Storage"
4. Delete `adminAuth` entry
5. Refresh page
6. Try logging in again

**Step 3: Try incognito mode**
1. Open new incognito/private window
2. Go to `/admin-login`
3. Enter password
4. If works, clear cache in normal mode

### Advanced Debugging

**Check session storage**
1. Open Developer Tools (F12)
2. Go to "Application" tab
3. Click "Session Storage"
4. Look for `adminAuth` key
5. Should be set to "true" after login

**Check browser console**
1. Open console (F12)
2. Look for error messages
3. Check for network errors

---

## Issue 6: Email Not Received

### Symptoms
- Email button shows success
- Email not in inbox
- Email not in spam folder

### Quick Fixes

**Step 1: Check spam folder**
1. Check email spam/junk folder
2. Look for email from "Campaign Administration"
3. If found, mark as "not spam"

**Step 2: Check email address**
1. Verify email address is correct
2. No typos
3. Valid domain
4. Test with different email

**Step 3: Check email service**
1. If Wix API not configured, emails are logged
2. Check browser console for logs
3. Look for "Email would be sent to:" message

**Step 4: Resend email**
1. Click Email button again
2. Enter email address
3. Click "Send Email"
4. Check inbox again

### Advanced Debugging

**Check API response**
1. Open Developer Tools (F12)
2. Go to "Network" tab
3. Click Email button
4. Look for `/api/send-email` request
5. Click on it
6. Check "Response" tab
7. Should show success message

**Check email logs**
1. Open browser console (F12)
2. Look for "Email would be sent to:" message
3. This means email was logged (API not configured)
4. Check email details in console

---

## Issue 7: Campaign Dates Not Working

### Symptoms
- Campaign shows as "ended"
- Campaign not accepting donations
- "Campaign not active" error

### Quick Fixes

**Step 1: Check dates**
1. Go to Admin Dashboard
2. Go to "Campaign Dates" tab
3. Verify:
   - Start Date ≤ Today
   - End Date > Today
4. If wrong, update dates
5. Save changes

**Step 2: Check date format**
1. Dates should be in format: YYYY-MM-DD
2. Example: 2024-12-29
3. Check for typos

**Step 3: Check timezone**
1. Dates are in UTC
2. Your timezone might be different
3. Set dates with buffer (e.g., start yesterday, end next month)

### Advanced Debugging

**Check campaign data**
1. Go to Admin Dashboard
2. Go to "Campaign" tab
3. Check campaign dates
4. Verify dates are saved correctly

**Check browser console**
1. Open console (F12)
2. Look for date-related errors
3. Check for parsing errors

---

## Issue 8: Page Not Loading

### Symptoms
- Blank page
- Loading spinner forever
- "Error" message

### Quick Fixes

**Step 1: Refresh page**
1. Press `F5` or `Ctrl+R`
2. Wait for page to load
3. If still blank, try Step 2

**Step 2: Clear cache**
1. Press `Ctrl+Shift+Delete`
2. Select "All time"
3. Check all boxes
4. Click "Clear data"
5. Refresh page

**Step 3: Check browser console**
1. Press `F12`
2. Go to "Console" tab
3. Look for red error messages
4. Note the error details

**Step 4: Try different browser**
1. Try Chrome, Firefox, Safari, or Edge
2. If works in different browser, clear cache in original
3. Check for browser extensions blocking page

### Advanced Debugging

**Check network requests**
1. Open Developer Tools (F12)
2. Go to "Network" tab
3. Refresh page
4. Look for failed requests (red)
5. Click on failed request
6. Check error details

**Check for JavaScript errors**
1. Go to "Console" tab
2. Look for red error messages
3. Expand error to see details
4. Note file and line number

---

## Issue 9: Data Not Saving

### Symptoms
- Form submits but data doesn't save
- "Error saving" message
- Data reverts after refresh

### Quick Fixes

**Step 1: Check required fields**
1. Verify all required fields are filled
2. No empty fields
3. Valid data types

**Step 2: Check for errors**
1. Look for error message on page
2. Check browser console for errors
3. Note error details

**Step 3: Try again**
1. Fill form again
2. Click save
3. Wait for success message
4. Refresh page to verify

**Step 4: Check database**
1. Go to Admin Dashboard
2. Check if data appears in list
3. If appears, data was saved
4. If not, check error message

### Advanced Debugging

**Check API response**
1. Open Developer Tools (F12)
2. Go to "Network" tab
3. Submit form
4. Look for API request
5. Check response status and message

**Check form validation**
1. Open browser console
2. Look for validation errors
3. Check field values
4. Verify data types

---

## Issue 10: Performance Issues

### Symptoms
- Page loads slowly
- Buttons respond slowly
- Animations lag

### Quick Fixes

**Step 1: Clear cache**
1. Press `Ctrl+Shift+Delete`
2. Clear all data
3. Refresh page

**Step 2: Close other tabs**
1. Close unnecessary browser tabs
2. Close other applications
3. Free up system memory

**Step 3: Disable extensions**
1. Open browser extensions
2. Disable all extensions
3. Refresh page
4. If faster, enable extensions one by one to find culprit

**Step 4: Check internet speed**
1. Test internet connection
2. Restart router if slow
3. Move closer to WiFi router

### Advanced Debugging

**Check network performance**
1. Open Developer Tools (F12)
2. Go to "Network" tab
3. Refresh page
4. Look for slow requests
5. Check file sizes

**Check CPU usage**
1. Open Task Manager (Windows) or Activity Monitor (Mac)
2. Check browser CPU usage
3. If high, close other applications
4. Check for memory leaks

---

## Diagnostic Panel Guide

### What Each Check Means

| Check | Green ✅ | Yellow ⚠️ | Red ❌ |
|-------|---------|----------|--------|
| Campaigns | Campaigns exist | No campaigns | Error loading |
| Teams | Teams with credentials | Teams missing credentials | Error loading |
| Donations | Donations exist | No donations | Error loading |
| Email API | API accessible | API slow | API not accessible |
| Admin Auth | Logged in | Not logged in | Error checking |

### How to Use Results

1. **Green checks**: Everything working, no action needed
2. **Yellow warnings**: May need attention, follow suggestions
3. **Red errors**: Needs fixing, follow troubleshooting steps

---

## Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| "Campaign not found" | Campaign ID invalid | Create campaign in Admin Dashboard |
| "Invalid password" | Wrong password | Use `admin5786` |
| "Invalid email address" | Email format wrong | Check email format |
| "Failed to send email" | API error | Check console for details |
| "Team fields required" | Missing data | Fill all required fields |
| "Campaign dates invalid" | Dates not set correctly | Set start ≤ today, end > today |
| "No campaigns found" | No campaigns created | Create campaign in Admin Dashboard |
| "No teams found" | No teams created | Create teams in Admin Dashboard |

---

## Getting Help

### Check These First
1. Run Diagnostic Panel (blue button, bottom-right)
2. Check browser console (F12)
3. Check Admin Dashboard for data
4. Read error messages carefully

### Provide This Information
When asking for help, provide:
1. Screenshot of error message
2. Browser console errors (F12 → Console)
3. Diagnostic Panel results
4. Steps to reproduce issue
5. What you expected to happen

### Common Solutions
1. **Clear cache**: `Ctrl+Shift+Delete`
2. **Refresh page**: `F5` or `Ctrl+R`
3. **Check password**: `admin5786`
4. **Check dates**: Start ≤ today, end > today
5. **Check email**: Valid format (user@domain.com)

---

## Summary

### Quick Checklist
- [ ] Campaign created and set to "Active"
- [ ] Campaign dates correct (start ≤ today, end > today)
- [ ] Teams created with credentials
- [ ] Email address valid
- [ ] Admin logged in
- [ ] Browser cache cleared
- [ ] No error messages in console

### Next Steps
1. Run Diagnostic Panel
2. Fix any red/yellow issues
3. Create campaign
4. Create teams
5. Send credentials
6. Test donations

If issues persist, check browser console and provide error details.
