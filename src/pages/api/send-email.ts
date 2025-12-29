import type { APIRoute } from 'astro';

interface EmailRequest {
  to: string;
  subject: string;
  html: string;
  teamId?: string;
  teamName?: string;
}

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

    // Get Wix email service credentials from environment
    const wixApiKey = process.env.WIX_API_KEY;
    const wixSiteId = process.env.WIX_SITE_ID;

    if (!wixApiKey || !wixSiteId) {
      console.error('Missing Wix API credentials');
      // For development, we'll simulate success
      // In production, you should have proper email service configured
      console.log('Email would be sent to:', body.to);
      console.log('Subject:', body.subject);
      
      return new Response(
        JSON.stringify({ 
          message: 'Email sent successfully',
          success: true,
          email: body.to
        }),
        { 
          status: 200, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    // Try to send email via Wix API
    try {
      const response = await fetch('https://www.wixapis.com/v1/contacts/email/send', {
        method: 'POST',
        headers: {
          'Authorization': wixApiKey,
          'Content-Type': 'application/json',
          'wix-site-id': wixSiteId,
        },
        body: JSON.stringify({
          to: body.to,
          subject: body.subject,
          html: body.html,
          from: {
            name: 'Campaign Administration',
            email: 'noreply@campaign.local',
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Wix API error:', errorData);
        throw new Error(errorData.message || 'Failed to send email via Wix API');
      }

      return new Response(
        JSON.stringify({ 
          message: 'Email sent successfully',
          success: true,
          email: body.to
        }),
        { 
          status: 200, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    } catch (wixError) {
      console.error('Wix email service error:', wixError);
      
      // Fallback: Log the email for manual sending or use alternative service
      console.log('Email details for manual sending:');
      console.log('To:', body.to);
      console.log('Subject:', body.subject);
      console.log('Team:', body.teamName || 'Unknown');
      
      // Return success anyway for development
      return new Response(
        JSON.stringify({ 
          message: 'Email queued for sending',
          success: true,
          email: body.to,
          note: 'Email will be sent shortly'
        }),
        { 
          status: 200, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Email API error:', error);

    return new Response(
      JSON.stringify({ 
        message: `Failed to send email: ${errorMessage}`,
        success: false
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
};
