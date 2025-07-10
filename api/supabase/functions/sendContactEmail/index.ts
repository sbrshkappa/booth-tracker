// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

console.log("Hello from sendContactEmail Function!")

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { name, email, message, attachments } = await req.json()

    // Validate required fields
    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ error: 'Name, email, and message are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Send email using Resend
    const emailSent = await sendContactEmail(name, email, message, attachments)

    if (emailSent) {
      return new Response(
        JSON.stringify({ success: true, message: 'Contact form submitted successfully' }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    } else {
      return new Response(
        JSON.stringify({ error: 'Failed to send email' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

  } catch (error) {
    console.error('Error processing contact form:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function sendContactEmail(name: string, email: string, message: string, attachments?: any[]): Promise<boolean> {
  try {
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    
    if (!RESEND_API_KEY) {
      console.log('Resend API key not configured, simulating email send...')
      console.log('Contact form submission:', { name, email, message, attachments })
      return true
    }

    const htmlContent = generateContactEmailHTML(name, email, message, attachments)
    const plainTextContent = generatePlainTextContent(htmlContent)

    console.log('Sending contact email from:', email, 'to organizers')

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
              body: JSON.stringify({
          from: 'Sri Sathya Sai International Organization - USA <no-reply@sathyasai.us>',
          to: ['2025-nc-core-group@sathyasai.us'], // Replace with actual organizer email
          reply_to: email,
          subject: `Contact Form Submission from ${name}`,
          html: htmlContent,
          text: plainTextContent,
        }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Resend API error:', error)
      return false
    }

    const result = await response.json()
    console.log('Contact email sent successfully:', result)
    return true
  } catch (error) {
    console.error('Error sending contact email:', error)
    return false
  }
}

function generateContactEmailHTML(name: string, email: string, message: string, attachments?: any[]): string {
  const hasAttachments = attachments && attachments.length > 0
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Contact Form Submission</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #fba758; border-bottom: 2px solid #fba758; padding-bottom: 10px;">
    New Contact Form Submission
  </h2>
  
  <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
    <h3 style="margin-top: 0; color: #333;">Contact Information</h3>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
  </div>

  <div style="background-color: #fff; padding: 15px; border-left: 4px solid #fba758; margin: 20px 0;">
    <h3 style="margin-top: 0; color: #333;">Message</h3>
    <p style="white-space: pre-wrap; line-height: 1.6;">${message}</p>
  </div>

  ${hasAttachments ? `
  <div style="background-color: #e8f4fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
    <h3 style="margin-top: 0; color: #333;">Attachments (${attachments!.length})</h3>
    ${attachments!.map(attachment => `
      <p><strong>File:</strong> ${attachment.name || 'Unnamed file'}</p>
      <p><strong>Type:</strong> ${attachment.type || 'Unknown'}</p>
      <p><strong>Size:</strong> ${attachment.size ? `${(attachment.size / 1024).toFixed(1)} KB` : 'Unknown'}</p>
    `).join('')}
  </div>
  ` : ''}

  <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px;">
    <p>This message was sent from the Conference Companion contact form.</p>
    <p>You can reply directly to this email to respond to ${name}.</p>
  </div>
</body>
</html>`
}

function generatePlainTextContent(htmlContent: string): string {
  // Simple HTML to plain text conversion
  return htmlContent
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ') // Replace &nbsp; with spaces
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim()
} 