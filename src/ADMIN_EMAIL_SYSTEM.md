# Admin Dashboard Email System - Complete Guide

## Overview

The admin dashboard now includes a **fully functional email sending system** that allows administrators to send team credentials and custom messages to team leads via email.

## Features

✅ **Send Team Credentials** - Automatically formatted emails with team ID and password
✅ **Custom Messages** - Add personalized messages to each email
✅ **Email Preview** - See exactly what will be sent before sending
✅ **Error Handling** - Clear error messages and setup guidance
✅ **Professional Templates** - HTML-formatted emails with proper styling
✅ **Validation** - Email address validation before sending
✅ **Resend Integration** - Uses Resend for reliable email delivery

## System Architecture

### Components

1. **TeamEmailSender.tsx** - Frontend component for sending emails
   - Located: `/src/components/TeamEmailSender.tsx`
   - Handles UI, form validation, and API calls
   - Shows helpful error messages and setup guidance

2. **send-email.ts** - Backend API endpoint
   - Located: `/src/pages/api/send-email.ts`
   - Validates email data
   - Integrates with Resend API
   - Handles errors gracefully

3. **AdminDashboard.tsx** - Integration point
   - Located: `/src/components/pages/AdminDashboard.tsx`
   - Triggers email sender modal
   - Manages team selection

## How It Works

### User Flow

```
Admin clicks "Email" button on team
    ↓
TeamEmailSender modal opens
    ↓
Admin enters recipient email
    ↓
Admin adds optional custom message
    ↓
Admin clicks "Send Email"
    ↓
Frontend validates email format
    ↓
API call to /api/send-email
    ↓
Backend validates request
    ↓
Resend API sends email
    ↓
Success/Error response to user
```

### Email Content

Each email includes:
- Team name
- Team ID (for login)
- Team password (for login)
- Member count
- Fundraising goal
- Team description
- Custom message (if provided)
- Professional HTML formatting

## Setup Instructions

### Quick Start (5 minutes)

#### 1. Create Resend Account
```bash
# Go to https://resend.com
# Click "Sign Up"
# Verify your email
```

#### 2. Get API Key
```bash
# In Resend dashboard:
# 1. Click "API Keys" in sidebar
# 2. Click "Create API Key"
# 3. Copy the key (starts with "re_")
```

#### 3. Set Environment Variables

**For Local Development:**

Create `.env.local` in project root:
```env
RESEND_API_KEY=re_xxxxxxxxxxxxx
SENDER_EMAIL=noreply@yourdomain.com
```

**For Wix Deployment:**

1. Go to your Wix site settings
2. Find "Environment Variables" or "Secrets"
3. Add the two variables above
4. Deploy your changes

#### 4. Restart Development Server
```bash
# Stop your dev server (Ctrl+C)
# Start it again
npm run dev
```

#### 5. Test Email Sending
1. Go to Admin Dashboard
2. Go to "Manage Teams"
3. Click "Email" on any team
4. Enter your email address
5. Click "Send Email"
6. Check your inbox

### Detailed Setup

#### Environment Variables Explained

**RESEND_API_KEY** (Required)
- Your Resend API key
- Format: `re_xxxxxxxxxxxxx`
- Get from: https://resend.com/api-keys
- Keep this secret! Never commit to version control

**SENDER_EMAIL** (Optional)
- Email address that appears as sender
- Default: `noreply@campaign.local`
- For production, use your domain: `noreply@yourdomain.com`
- Must be verified in Resend for custom domains

#### Verifying Custom Domain (Optional)

For production use with your own domain:

1. In Resend dashboard, go to "Domains"
2. Click "Add Domain"
3. Enter your domain (e.g., `campaign.example.com`)
4. Add DNS records as shown
5. Wait for verification (usually 5-10 minutes)
6. Update `SENDER_EMAIL` to use your domain

## Usage Guide

### Sending an Email

1. **Navigate to Admin Dashboard**
   - URL: `/admin`
   - Requires admin login

2. **Go to Manage Teams**
   - Click "Manage Teams" in the navigation grid
   - Or click the "Teams" tab in the dashboard

3. **Find the Team**
   - Scroll through the teams list
   - Or search for the team name

4. **Click Email Button**
   - Each team card has an "Email" button
   - Click it to open the email sender

5. **Enter Recipient Email**
   - Type the team lead's email address
   - Must be a valid email format

6. **Add Custom Message (Optional)**
   - Click the "Additional Message" field
   - Add any personalized text
   - This will be included in the email

7. **Review Email Preview**
   - Check the "Email Preview" section
   - Verify all information is correct

8. **Send Email**
   - Click "Send Email" button
   - Wait for success message
   - Modal will close automatically

### Email Preview

Before sending, you can see:
- Email subject line
- Recipient address
- Team credentials
- Custom message (if added)
- Professional HTML formatting

### Troubleshooting

#### Error: "Email service not configured"

**Cause:** `RESEND_API_KEY` environment variable is not set

**Solution:**
1. Set `RESEND_API_KEY` in your environment
2. Restart your development server
3. Try sending again

**For Wix:**
1. Go to site settings
2. Add `RESEND_API_KEY` environment variable
3. Redeploy your site
4. Wait 2-3 minutes for changes to take effect

#### Error: "Invalid email address"

**Cause:** Email format is incorrect

**Solution:**
- Check for typos
- Make sure format is: `name@domain.com`
- No spaces or special characters

#### Email Not Arriving

**Cause:** Various delivery issues

**Solutions:**
1. Check spam/junk folder
2. Verify email address is correct
3. Check Resend dashboard for delivery status:
   - Go to https://resend.com
   - Click "Emails" in sidebar
   - Find your email and check status
4. If status is "Failed", click it to see error details

**Common Delivery Issues:**
- Recipient email server rejecting emails
- Invalid recipient address
- Sender domain not verified (for custom domains)
- Email flagged as spam

#### "Failed to send email" Error

**Cause:** API error or network issue

**Solution:**
1. Check browser console for details (F12)
2. Verify API key is correct
3. Check Resend status page: https://status.resend.com
4. Try again in a few moments
5. Contact Resend support if issue persists

## API Reference

### Endpoint: POST /api/send-email

**Request Body:**
```json
{
  "to": "recipient@example.com",
  "subject": "Email Subject",
  "html": "<html>Email content</html>",
  "text": "Plain text version (optional)",
  "teamId": "team-123 (optional)",
  "teamName": "Team Name (optional)"
}
```

**Success Response (200):**
```json
{
  "message": "Email sent successfully",
  "success": true,
  "email": "recipient@example.com",
  "messageId": "msg_xxxxx"
}
```

**Error Response (400/500):**
```json
{
  "message": "Error description",
  "success": false,
  "error": "ERROR_CODE"
}
```

**Error Codes:**
- `MISSING_CONFIG` - API key not configured
- `EMAIL_SEND_FAILED` - Resend API error
- `INVALID_EMAIL` - Email format invalid

## Customization

### Changing Email Template

Edit `/src/components/TeamEmailSender.tsx`, around line 43:

```typescript
const emailContent = `
Team Credentials for: ${team.teamName}

Dear Team Lead,
...
`;
```

### Changing Sender Email

Update environment variable:
```env
SENDER_EMAIL=support@yourdomain.com
```

### Adding More Fields to Email

1. Edit the `emailContent` variable in TeamEmailSender.tsx
2. Add the field you want to include
3. Update the HTML template as well

Example:
```typescript
const emailContent = `
...
Team Website: ${team.teamWebsite || 'N/A'}
...
`;
```

### Styling Email Template

The HTML template is in TeamEmailSender.tsx (lines 76-108). You can:
- Change colors
- Adjust spacing
- Add/remove sections
- Change fonts
- Add images

## Monitoring & Analytics

### In Resend Dashboard

1. Go to https://resend.com
2. Click "Emails" in sidebar
3. View all sent emails with:
   - Delivery status (Sent, Delivered, Bounced, etc.)
   - Open rates
   - Click rates
   - Bounce reasons

### Logging

Check your server logs for:
- Email send attempts
- API errors
- Configuration issues

Example log output:
```
Email sent successfully: {
  to: "team-lead@example.com",
  subject: "Team Credentials: Team Alpha",
  messageId: "msg_xxxxx"
}
```

## Security

### Best Practices

1. **Never commit API keys** to version control
   - Use `.env.local` for local development
   - Use environment variables for production

2. **Use separate keys** for development and production
   - Create different API keys in Resend
   - Use different keys in different environments

3. **Rotate API keys** periodically
   - Delete old keys in Resend dashboard
   - Create new ones
   - Update environment variables

4. **Monitor email logs**
   - Check Resend dashboard regularly
   - Look for suspicious activity
   - Set up alerts if available

5. **Validate all inputs**
   - Email validation is built-in
   - Never trust user input
   - Sanitize before sending

### Data Privacy

- Emails are sent via Resend's secure API
- Email content is not stored in your database
- Resend complies with GDPR and other regulations
- See Resend privacy policy: https://resend.com/privacy

## Limits & Quotas

### Resend Free Tier
- 100 emails per day
- Perfect for testing and small campaigns
- No credit card required

### Resend Paid Plans
- Higher daily limits (1,000+)
- Advanced analytics
- Priority support
- Custom domains

See https://resend.com/pricing for current rates.

## Alternatives

If you prefer not to use Resend, you can modify `/src/pages/api/send-email.ts` to use:

- **SendGrid** - Enterprise-grade, high volume
- **Mailgun** - Developer-friendly, good documentation
- **AWS SES** - Cost-effective at scale
- **SMTP** - Use your own email server

Contact support for help integrating alternatives.

## Frequently Asked Questions

**Q: Can I send to multiple recipients at once?**
A: Currently, one email at a time. For bulk sending, you can:
- Send individual emails in a loop
- Modify the API to support batch sending
- Use Resend's batch API

**Q: Can I schedule emails for later?**
A: Not currently. Emails send immediately. Resend supports scheduled sending - contact them for details.

**Q: What happens if an email fails?**
A: You'll see an error message. Check Resend dashboard for details. Resend will retry failed emails automatically.

**Q: Can I add attachments?**
A: Yes! Modify the API to include attachments. See Resend docs for format.

**Q: Is there a way to test without sending?**
A: Yes! Use Resend's test mode or test email addresses (test@resend.dev).

**Q: How do I know if an email was delivered?**
A: Check Resend dashboard. It shows delivery status for each email.

**Q: Can I track email opens?**
A: Yes! Resend tracks opens and clicks. View in dashboard.

**Q: What's the maximum email size?**
A: Resend supports up to 25MB per email.

**Q: Can I send HTML emails?**
A: Yes! The system sends HTML emails by default.

## Support & Resources

### Resend
- Documentation: https://resend.com/docs
- Status Page: https://status.resend.com
- Email Support: support@resend.com
- Discord Community: https://discord.gg/resend

### Campaign Admin
- Check browser console (F12) for errors
- Review server logs for API errors
- See EMAIL_SETUP_GUIDE.md for setup help
- Check this file for troubleshooting

## Changelog

### Version 1.0 (Current)
- ✅ Initial email system implementation
- ✅ Resend API integration
- ✅ Email validation
- ✅ Error handling and user guidance
- ✅ HTML email templates
- ✅ Custom message support
- ✅ Email preview
- ✅ Comprehensive documentation

## Next Steps

1. ✅ Sign up for Resend (https://resend.com)
2. ✅ Get your API key
3. ✅ Set environment variables
4. ✅ Restart development server
5. ✅ Test sending an email
6. ✅ Monitor in Resend dashboard
7. ✅ Set up custom domain (optional)
8. ✅ Deploy to production

Happy emailing! 🚀
