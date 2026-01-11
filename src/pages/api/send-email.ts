import type { APIRoute } from 'astro';

interface EmailRequest {
  to: string;
  subject: string;
  html: string;
  text?: string;
  teamId?: string;
  teamName?: string;
}

/**
 * Email API endpoint that sends emails using Resend
 * Resend is a modern email API that's reliable and easy to use
 * 
 * To use this:
 * 1. Sign up at https://resend.com
 * 2. Get your API key from the dashboard
 * 3. Set RESEND_API_KEY environment variable
 * 4. Set SENDER_EMAIL environment variable (e.g., noreply@yourdomain.com)
 */
export const POST: APIRoute = async ({ request }) => {
  // Only allow POST requests
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ message: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body: EmailRequest = await request.json();

    // Validate required fields
    if (!body.to || !body.subject || !body.html) {
      return new Response(
        JSON.stringify({ message: 'Missing required fields: to, subject, html' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.to)) {
      return new Response(
        JSON.stringify({ message: 'Invalid email address' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get email service credentials
    const resendApiKey = process.env.RESEND_API_KEY;
    const senderEmail = process.env.SENDER_EMAIL || 'noreply@campaign.local';

    // If no API key is configured, provide helpful error message
    if (!resendApiKey) {
      console.warn('RESEND_API_KEY not configured. Email sending is disabled.');
      console.warn('To enable email sending:');
      console.warn('1. Sign up at https://resend.com');
      console.warn('2. Get your API key from the dashboard');
      console.warn('3. Set RESEND_API_KEY environment variable');
      console.warn('4. Set SENDER_EMAIL environment variable (optional)');
      
      return new Response(
        JSON.stringify({ 
          message: 'Email service not configured. Please set up Resend API key.',
          success: false,
          error: 'MISSING_CONFIG'
        }),
        { 
          status: 503, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    // Send email via Resend API
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: senderEmail,
          to: body.to,
          subject: body.subject,
          html: body.html,
          text: body.text || stripHtml(body.html),
          reply_to: senderEmail,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error('Resend API error:', responseData);
        const errorMessage = responseData.message || responseData.error || 'Failed to send email';
        throw new Error(errorMessage);
      }

      console.log('Email sent successfully:', {
        to: body.to,
        subject: body.subject,
        messageId: responseData.id,
      });

      return new Response(
        JSON.stringify({ 
          message: 'Email sent successfully',
          success: true,
          email: body.to,
          messageId: responseData.id,
        }),
        { 
          status: 200, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    } catch (resendError) {
      const errorMsg = resendError instanceof Error ? resendError.message : 'Unknown error';
      console.error('Resend email service error:', errorMsg);
      
      return new Response(
        JSON.stringify({ 
          message: `Failed to send email: ${errorMsg}`,
          success: false,
          error: 'EMAIL_SEND_FAILED'
        }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Email API error:', error);

    return new Response(
      JSON.stringify({ 
        message: `Failed to process email request: ${errorMessage}`,
        success: false
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
};

/**
 * Strip HTML tags from a string to create plain text version
 */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .trim();
}
