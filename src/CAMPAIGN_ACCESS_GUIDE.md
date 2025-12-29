# Campaign Access & Email Sender Implementation Guide

## Overview
This document explains how to resolve access issues for campaigns and how to use the new email sender feature to distribute team credentials.

---

## Part 1: Resolving Campaign Access Issues

### Issue: "Building For Our Future" Campaign Not Accessible

#### Root Cause
The campaign access issue typically occurs when:
1. The campaign hasn't been created in the database yet
2. The campaign dates are set incorrectly
3. The campaign status is set to "draft" instead of "active"
4. The campaign ID is missing or incorrect

#### Solution Steps

##### Step 1: Create/Update the Campaign
1. Go to **Admin Dashboard** (`/admin-login`)
2. Enter the admin password: `admin5786`
3. Navigate to the **Campaign** tab
4. Fill in the campaign details:
   - **Campaign Title**: "Building For Our Future"
   - **Fundraising Goal**: Enter the target amount (e.g., £50,000)
   - **Project Description**: Add a compelling description
   - **Campaign Status**: Set to "Active"
   - **Campaign Start Date**: Set to today or earlier
   - **Campaign End Date**: Set to a future date

##### Step 2: Verify Campaign Dates
- Ensure the campaign start date is **before or equal to today**
- Ensure the campaign end date is **in the future**
- The system now allows donations even before the campaign officially starts

##### Step 3: Save the Campaign
- Click **Save Campaign**
- You should see a success message
- The campaign is now accessible to donors

##### Step 4: Access the Campaign
- Navigate to `/campaign/[campaignId]` where `[campaignId]` is the campaign's ID
- Or go to the campaigns page (`/campaigns`) to view all campaigns

---

## Part 2: Team Email Sender Feature

### Overview
The email sender feature allows admins to send team credentials (Team ID and Password) to team leads via email.

### How to Use

#### Step 1: Create a Team
1. In the Admin Dashboard, go to the **Teams** tab
2. Click **Add Team**
3. Fill in the team details:
   - **Team Name**: e.g., "The Builders"
   - **Fundraising Goal**: e.g., £5,000
   - **Number of Members**: e.g., 10
   - **Team Description**: Add a description
   - **Team Logo URL** (optional): Add a team logo image URL

#### Step 2: Generate Team Credentials
1. Click **Generate** next to the Team ID field to auto-generate a unique ID
2. Click **Generate** next to the Team Password field to auto-generate a secure password
3. These credentials will be used by team members to access the team dashboard

#### Step 3: Save the Team
1. Click **Add Team** to save
2. The team is now created and visible in the teams list

#### Step 4: Send Credentials via Email
1. In the teams list, find the team you want to email
2. Click the **Email** button (green button with envelope icon)
3. A modal will open with the team's information
4. Enter the **Recipient Email Address** (team lead's email)
5. Optionally add an **Additional Message** with instructions or welcome text
6. Review the email preview
7. Click **Send Email**

### Email Content
The email includes:
- Team ID
- Team Password
- Team Name
- Number of Members
- Fundraising Goal
- Team Description
- Any custom message you added
- Security reminder to keep credentials safe

### Email Delivery
- Emails are sent via the Wix Email API
- If the API is not configured, emails are logged for manual sending
- The system provides feedback on whether the email was sent successfully

---

## Part 3: Campaign-Specific Data Structure

### How Campaigns Work Now

#### Independent Campaigns
Each campaign now has its own:
- **Donations**: Only donations for that specific campaign are counted
- **Teams**: Only teams created for that campaign are visible
- **Matchers**: Only matchers assigned to that campaign are active

#### Campaign ID Linking
When creating donations or teams, they are automatically linked to the campaign:
```
Donation {
  _id: "unique-id",
  campaignId: "campaign-123",  // Links to specific campaign
  teamId: "team-456",
  amount: 100,
  ...
}

Team {
  _id: "team-456",
  campaignId: "campaign-123",  // Links to specific campaign
  teamName: "The Builders",
  ...
}
```

#### Viewing Campaign-Specific Data
- Campaign Detail Page (`/campaign/[campaignId]`) shows only that campaign's data
- Admin Dashboard filters all data by campaign
- Teams page shows only teams for the current campaign

---

## Part 4: Admin Dashboard Features

### Campaign Management
- **Create/Edit Campaigns**: Set up campaign details, dates, and goals
- **Manage Teams**: Create teams, generate credentials, and send emails
- **View Donations**: See all donations for the campaign
- **Manage Matchers**: Set up matching fund partners
- **Gallery**: Upload and manage campaign images

### Quick Navigation
The admin dashboard provides quick links to:
- Manage Campaigns
- Campaign Dates
- Donations
- Matchers
- Analytics
- Video Editor
- AI Website Editor

---

## Part 5: Troubleshooting

### Campaign Not Showing Up
**Problem**: Campaign doesn't appear on the campaigns page
**Solution**:
1. Check if the campaign has been created in the Admin Dashboard
2. Verify the campaign status is set to "Active"
3. Check if the campaign dates are correct (start date ≤ today ≤ end date)
4. Clear browser cache and refresh

### Email Not Sending
**Problem**: Email button doesn't work or shows error
**Solution**:
1. Verify the email address is valid
2. Check browser console for error messages
3. Ensure the team has a valid Team ID and Password
4. Check if Wix API credentials are configured in environment variables

### Team Credentials Not Generated
**Problem**: Team ID or Password fields are empty
**Solution**:
1. Click the **Generate** button next to each field
2. The system will auto-generate unique credentials
3. Save the team after generating credentials

### Campaign Data Not Filtering Correctly
**Problem**: Seeing donations/teams from other campaigns
**Solution**:
1. Ensure all donations have the correct `campaignId` field
2. Ensure all teams have the correct `campaignId` field
3. Check the campaign ID in the URL matches the campaign you're viewing
4. Clear browser cache and refresh

---

## Part 6: API Endpoints

### Send Email Endpoint
**Endpoint**: `POST /api/send-email`

**Request Body**:
```json
{
  "to": "team-lead@example.com",
  "subject": "Team Credentials: Team Name",
  "html": "<html>...</html>",
  "teamId": "team-123",
  "teamName": "Team Name"
}
```

**Response**:
```json
{
  "message": "Email sent successfully",
  "success": true,
  "email": "team-lead@example.com"
}
```

---

## Part 7: Security Considerations

### Admin Password
- Default admin password: `admin5786`
- **IMPORTANT**: Change this password in production
- Located in: `/src/components/pages/AdminLoginPage.tsx`

### Team Credentials
- Team IDs and Passwords are auto-generated
- They are stored in the database
- Admins should only share credentials via secure email
- Teams should keep credentials confidential

### Email Security
- Emails are sent via Wix API (if configured)
- Email addresses are validated before sending
- No sensitive data is logged in plain text

---

## Part 8: Environment Variables

To enable email sending via Wix API, add these to your `.env` file:

```env
WIX_API_KEY=your_wix_api_key_here
WIX_SITE_ID=your_wix_site_id_here
```

If these are not set, the system will log emails for manual sending.

---

## Summary

### Quick Start Checklist
- [ ] Create campaign "Building For Our Future" in Admin Dashboard
- [ ] Set campaign dates (start ≤ today, end > today)
- [ ] Set campaign status to "Active"
- [ ] Create teams for the campaign
- [ ] Generate Team IDs and Passwords
- [ ] Send credentials to team leads via email
- [ ] Verify campaign is accessible at `/campaign/[campaignId]`
- [ ] Test donation flow

### Key Features
✅ Campaign-independent data structure
✅ Pre-campaign donations allowed
✅ Email sender for team credentials
✅ Auto-generated Team IDs and Passwords
✅ Campaign filtering across all pages
✅ Admin dashboard for full control

---

## Support

For additional help:
1. Check the Admin Dashboard for error messages
2. Review browser console for JavaScript errors
3. Verify all required fields are filled in
4. Ensure campaign dates are set correctly
5. Check that team credentials are generated before sending emails
