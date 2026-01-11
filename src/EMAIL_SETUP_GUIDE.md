# Email Sending Setup Guide

## Overview

The admin dashboard now has a fully functional email sending system that uses **Resend** as the email service provider. This guide will help you set up email sending for your campaign.

## What is Resend?

Resend is a modern, reliable email API service that:
- ✅ Has excellent deliverability rates
- ✅ Provides detailed email tracking and analytics
- ✅ Offers a simple, developer-friendly API
- ✅ Has a free tier for testing
- ✅ Scales easily for production use

## Setup Steps

### Step 1: Create a Resend Account

1. Go to [https://resend.com](https://resend.com)
2. Click "Sign Up" and create a free account
3. Verify your email address
4. You'll be taken to the dashboard

### Step 2: Get Your API Key

1. In the Resend dashboard, go to **API Keys** (usually in the left sidebar)
2. Click **Create API Key**
3. Give it a name like "Campaign Admin"
4. Copy the API key (it will look like `re_xxxxxxxxxxxxx`)
5. **Keep this key safe** - don't share it publicly

### Step 3: Configure Environment Variables

Add these environment variables to your deployment:

```
RESEND_API_KEY=re_xxxxxxxxxxxxx
SENDER_EMAIL=noreply@yourdomain.com
```

#### For Local Development (Astro):

1. Create or edit `.env.local` in your project root:

```env
RESEND_API_KEY=re_xxxxxxxxxxxxx
SENDER_EMAIL=noreply@yourdomain.com
```

2. Restart your development server

#### For Production (Wix):

1. Go to your Wix site settings
2. Find the environment variables or secrets section
3. Add the two variables above
4. Deploy your changes

### Step 4: Verify Sender Email (Optional but Recommended)

For production use, verify your sender email domain:

1. In Resend dashboard, go to **Domains**
2. Click **Add Domain**
3. Follow the instructions to add DNS records
4. Once verified, use that domain as your `SENDER_EMAIL`

Example: `noreply@campaign.example.com`

## How to Use

### Sending Team Credentials

1. Go to **Admin Dashboard** → **Manage Teams**
2. Click the **Email** button on any team
3. Enter the recipient's email address
4. (Optional) Add a custom message
5. Click **Send Email**
6. You'll see a success message when the email is sent

### What Gets Sent

The email includes:
- Team ID
- Team Password
- Team name and details
- Member count
- Fundraising goal
- Any custom message you add

## Troubleshooting

### "Email service not configured" Error

**Problem:** You see this error when trying to send an email.

**Solution:**
1. Check that `RESEND_API_KEY` is set in your environment variables
2. Verify the API key is correct (should start with `re_`)
3. Make sure you've restarted your development server after adding the env var
4. Check the browser console for more details

### Email Not Arriving

**Problem:** Email was sent successfully but recipient didn't receive it.

**Solutions:**
1. Check spam/junk folder
2. Verify the recipient email address is correct
3. In Resend dashboard, check the **Emails** section to see delivery status
4. If status shows "Failed", click on it to see the error details
5. Common issues:
   - Invalid recipient email address
   - Recipient email server rejecting the email
   - DKIM/SPF not configured (if using custom domain)

### API Key Issues

**Problem:** "Invalid API key" or "Unauthorized" error.

**Solutions:**
1. Verify the API key is correct (copy-paste from Resend dashboard)
2. Make sure it starts with `re_`
3. Check that the API key hasn't been revoked in Resend dashboard
4. Create a new API key if needed

## Email Customization

### Changing the Sender Email

Edit the `SENDER_EMAIL` environment variable:

```env
SENDER_EMAIL=support@campaign.example.com
```

### Customizing Email Template

To modify the email template, edit `/src/components/TeamEmailSender.tsx`:

Look for the `emailContent` section (around line 43) to change:
- Email subject
- Email body text
- HTML formatting
- What information is included

## Testing

### Test Email Sending

1. Go to Admin Dashboard → Manage Teams
2. Click Email on any team
3. Enter your own email address
4. Click Send Email
5. Check your inbox (and spam folder)

### Using Resend Test Mode

For development, you can use Resend's test API key:

1. In Resend dashboard, toggle **Test Mode**
2. Copy the test API key
3. Use it in your `.env.local`
4. Emails won't actually be sent, but you'll see them in the dashboard

## Security Best Practices

1. **Never commit API keys** to version control
2. **Use environment variables** for all sensitive data
3. **Rotate API keys** periodically
4. **Use separate keys** for development and production
5. **Monitor email logs** in Resend dashboard for suspicious activity

## Monitoring & Analytics

In the Resend dashboard, you can:
- View all sent emails
- Check delivery status (Sent, Delivered, Bounced, etc.)
- See open rates and click rates
- Monitor bounce rates
- Set up webhooks for email events

## Limits & Pricing

### Free Tier
- Up to 100 emails per day
- Perfect for testing and small campaigns

### Paid Plans
- Higher daily limits
- Advanced analytics
- Priority support
- Custom domains

See [Resend Pricing](https://resend.com/pricing) for current rates.

## Alternative Email Services

If you prefer not to use Resend, you can modify `/src/pages/api/send-email.ts` to use:

- **SendGrid** - Popular, enterprise-grade
- **Mailgun** - Developer-friendly
- **AWS SES** - Cost-effective at scale
- **SMTP** - Use your own email server

Contact support if you need help integrating a different service.

## Support

### Resend Support
- Documentation: [https://resend.com/docs](https://resend.com/docs)
- Status Page: [https://status.resend.com](https://status.resend.com)
- Email: support@resend.com

### Campaign Admin Support
- Check the browser console for error messages
- Review `/src/pages/api/send-email.ts` for implementation details
- Check server logs for API errors

## FAQ

**Q: Can I send emails to multiple recipients at once?**
A: Currently, the system sends to one email at a time. For bulk sending, you can:
1. Send individual emails to each team lead
2. Modify the API to support batch sending
3. Use Resend's batch API

**Q: Can I schedule emails for later?**
A: Not currently. Emails are sent immediately. Resend supports scheduled sending - contact support if you need this feature.

**Q: What happens if an email fails to send?**
A: You'll see an error message in the UI. Check the Resend dashboard for details. The email can be resent by trying again.

**Q: Can I add attachments to emails?**
A: Yes! Modify the API call in `/src/pages/api/send-email.ts` to include attachments. See Resend docs for details.

**Q: Is there a way to test emails without sending them?**
A: Yes! Use Resend's test mode or test email addresses (test@resend.dev).

## Next Steps

1. ✅ Sign up for Resend
2. ✅ Get your API key
3. ✅ Set environment variables
4. ✅ Test sending an email
5. ✅ Monitor emails in Resend dashboard
6. ✅ Set up custom domain (optional)
7. ✅ Deploy to production

Happy emailing! 🚀
