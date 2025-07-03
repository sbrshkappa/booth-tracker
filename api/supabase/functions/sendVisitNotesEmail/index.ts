import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { EMAIL_TEMPLATE, generateVisitCard, generateSessionCard, generateNoNotesMessage } from './template.ts'

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
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get request body
    const { userEmail, userName, content, subject, shareType } = await req.json()

    if (!userEmail) {
      return new Response(
        JSON.stringify({ error: 'User email is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // 1. Get user by email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, first_name, last_name')
      .eq('email', userEmail)
      .single();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If content is provided and it's for sharing with others (not self), send the custom content directly
    if (content && userEmail !== user.email) {
      const emailSent = await sendEmail(userEmail, content, subject || 'My SSSIO Conference Journey')
      
      if (!emailSent) {
        return new Response(
          JSON.stringify({ error: 'Failed to send email' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Email sent successfully'
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // 2. Get user's visit history with booth details and notes by user_id
    const { data: visits, error: visitsError } = await supabase
      .from('user_booth_visits')
      .select(`
        *,
        booths (
          id,
          name,
          phrase
        )
      `)
      .eq('user_id', user.id)
      .order('visited_at', { ascending: false })

    if (visitsError) {
      console.error('Error fetching visits:', visitsError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch visit data' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // 3. Get user's session notes
    const { data: sessionNotes, error: sessionError } = await supabase
      .from('user_session_notes')
      .select(`
        *,
        sessions (
          id,
          topic,
          speaker,
          start_time,
          day,
          room
        )
      `)
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })

    if (sessionError) {
      console.error('Error fetching session notes:', sessionError)
    }

    if ((!visits || visits.length === 0) && (!sessionNotes || sessionNotes.length === 0)) {
      return new Response(
        JSON.stringify({ error: 'No data found for this user' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Generate email content
    const emailContent = generateEmailContent(visits || [], sessionNotes || [], userName || 'User', shareType)
    
    // Send email using a simple email service (you can replace this with your preferred email service)
    const emailSent = await sendEmail(userEmail, emailContent, subject || '🎪 SSSIO USA 2025 - Your Conference Summary')

    if (!emailSent) {
      return new Response(
        JSON.stringify({ error: 'Failed to send email' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Conference summary email sent successfully',
        visitCount: visits?.length || 0,
        sessionCount: sessionNotes?.length || 0
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

function generateEmailContent(visits: any[], sessionNotes: any[], userName: string, shareType?: string): string {
  const totalVisits = visits.length
  const visitsWithNotes = visits.filter(visit => visit.notes && visit.notes.trim())
  const totalNotes = visitsWithNotes.length
  const totalSessions = sessionNotes.length
  const sessionsWithNotes = sessionNotes.filter(note => note.notes && note.notes.trim())

  // Get unique days attended
  const daysAttended = new Set<number>()
  sessionNotes.forEach(note => {
    if (note.sessions?.day) {
      daysAttended.add(note.sessions.day)
    }
  })

  // Generate personalized thank you message
  const thankYouMessage = generateThankYouMessage(daysAttended, userName)

  // Filter content based on shareType
  let boothHtml = ''
  let sessionHtml = ''
  let showBooths = true
  let showSessions = true

  if (shareType === 'booths') {
    showSessions = false
  } else if (shareType === 'sessions') {
    showBooths = false
  }

  // Generate booth visits HTML
  if (showBooths) {
    if (visitsWithNotes.length > 0) {
      boothHtml = visitsWithNotes.map(generateVisitCard).join('')
    } else {
      boothHtml = '<div class="empty-state"><h3>🏠 Ready for Your First Memory</h3><p>Your exhibition journey is just beginning! Visit booths and capture your thoughts to create lasting memories.</p></div>'
    }
  }

  // Generate session notes HTML
  if (showSessions) {
    if (sessionsWithNotes.length > 0) {
      sessionHtml = sessionsWithNotes.map(generateSessionCard).join('')
    } else {
      sessionHtml = '<div class="empty-state"><h3>📅 Your Wisdom Awaits</h3><p>Attend sessions and capture the wisdom shared. Every insight is a step on your spiritual journey.</p></div>'
    }
  }

  // Update highlight box based on what's being shown
  const highlightBooths = showBooths ? totalVisits : 0
  const highlightBoothNotes = showBooths ? totalNotes : 0
  const highlightSessions = showSessions ? totalSessions : 0
  const highlightSessionNotes = showSessions ? sessionsWithNotes.length : 0

  // Create the complete HTML email
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
      line-height: 1.6; 
      color: #333; 
      max-width: 600px; 
      margin: 0 auto; 
      padding: 20px; 
      background-color: #f8f9fa;
    }
    .header { 
      background: linear-gradient(135deg, #fba758 0%, #ff8c42 100%); 
      color: white; 
      padding: 40px 30px; 
      text-align: center; 
      border-radius: 16px 16px 0 0; 
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .logo {
      width: 120px;
      height: auto;
      margin-bottom: 20px;
      border-radius: 12px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }
    .header h1 {
      margin: 0 0 10px 0;
      font-size: 28px;
      font-weight: 700;
      letter-spacing: 0.5px;
    }
    .header p {
      margin: 0;
      font-size: 16px;
      opacity: 0.9;
    }
    .content { 
      background: white; 
      padding: 30px; 
      border-radius: 0 0 16px 16px; 
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .welcome-section {
      text-align: center;
      margin-bottom: 30px;
      padding: 20px;
      background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
      border-radius: 12px;
      border: 1px solid #f59e0b;
    }
    .welcome-section h2 {
      color: #92400e;
      margin: 0 0 10px 0;
      font-size: 22px;
      font-weight: 600;
    }
    .welcome-section p {
      color: #78350f;
      margin: 0;
      font-size: 16px;
    }
    .highlight-box {
      background: linear-gradient(135deg, #fba758 0%, #ff8c42 100%); 
      color: white;
      padding: 24px; 
      border-radius: 12px; 
      margin: 20px 0; 
      text-align: center; 
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .highlight-box h3 {
      margin: 0 0 16px 0;
      font-size: 20px;
      font-weight: 600;
    }
    .highlight-box p {
      margin: 8px 0;
      font-size: 14px;
      opacity: 0.9;
    }
    .section-header {
      color: #374151;
      font-size: 20px;
      font-weight: 600;
      margin: 30px 0 20px 0;
      text-align: center;
      padding-bottom: 8px;
      border-bottom: 2px solid #fba758;
    }
    .memory-card { 
      background: white; 
      padding: 20px; 
      margin: 16px 0; 
      border-radius: 12px; 
      border-left: 4px solid #fba758; 
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      border: 1px solid #e5e7eb;
    }
    .memory-title { 
      font-weight: 600; 
      color: #fba758; 
      font-size: 18px; 
      margin-bottom: 12px; 
    }
    .memory-date { 
      color: #6b7280; 
      font-size: 14px; 
      margin-bottom: 12px; 
    }
    .memory-details { 
      color: #6b7280; 
      font-size: 14px; 
      margin-bottom: 12px; 
    }
    .memory-content { 
      background: #fef3c7; 
      padding: 16px; 
      border-radius: 8px; 
      margin-top: 12px; 
      border: 1px solid #fde68a;
    }
    .rating { 
      color: #f59e0b; 
      font-weight: 600; 
      margin: 8px 0;
    }
    .empty-state { 
      text-align: center; 
      padding: 40px; 
      color: #6b7280; 
      background: #f9fafb;
      border-radius: 12px;
      border: 1px solid #e5e7eb;
    }
    .empty-state h3 {
      color: #fba758;
      margin-bottom: 12px;
    }
    .thank-you-section {
      background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
      padding: 30px;
      border-radius: 12px;
      margin: 30px 0;
      text-align: center;
      border: 1px solid #f59e0b;
    }
    .thank-you-section h3 {
      color: #92400e;
      margin: 0 0 15px 0;
      font-size: 20px;
      font-weight: 600;
    }
    .thank-you-section p {
      color: #78350f;
      margin: 0;
      font-size: 16px;
      line-height: 1.6;
    }
    .footer { 
      text-align: center; 
      margin-top: 30px; 
      color: #6b7280; 
      font-size: 14px; 
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
    }
  </style>
</head>
<body>
  <div class="header">
    <img src="https://booth-tracker.vercel.app/assets/conference-companion.png" alt="SSSIO Conference Companion" class="logo">
    <h1>🌟 Your SSSIO Conference Journey</h1>
    <p>Dear ${userName}, here's a beautiful summary of your spiritual experience!</p>
  </div>
  
  <div class="content">
    <div class="welcome-section">
      <h2>🙏 Welcome to Your Conference Memories</h2>
      <p>Thank you for being part of this incredible spiritual gathering. Your presence and participation have made this conference truly special!</p>
    </div>

    <div class="highlight-box">
      <h3>✨ Your Conference Highlights</h3>
      ${showBooths ? `<p><strong>Booths Explored:</strong> ${highlightBooths} amazing experiences</p>` : ''}
      ${showBooths ? `<p><strong>Memories Captured:</strong> ${highlightBoothNotes} precious notes</p>` : ''}
      ${showSessions ? `<p><strong>Sessions Attended:</strong> ${highlightSessions} inspiring moments</p>` : ''}
      ${showSessions ? `<p><strong>Insights Recorded:</strong> ${highlightSessionNotes} valuable reflections</p>` : ''}
    </div>

    ${showBooths ? `<div class="section-header">🏠 Your Exhibition Memories</div>
    ${boothHtml}` : ''}

    ${showSessions ? `<div class="section-header">📅 Your Session Insights</div>
    ${sessionHtml}` : ''}

    <div class="thank-you-section">
      <h3>🙏 Thank You for Your Beautiful Presence</h3>
      <p>${thankYouMessage}</p>
    </div>

    <div class="footer">
      <p>With gratitude and love,<br>The SSSIO USA Team</p>
      <p>This email was created with love from your conference data.</p>
    </div>
  </div>
</body>
</html>`

  return htmlContent
}

function generateThankYouMessage(daysAttended: Set<number>, userName: string): string {
  const dayMessages = {
    1: "Day 1 brought the beautiful opening ceremonies and foundational wisdom that set the tone for our spiritual journey together.",
    2: "Day 2 deepened our connections through meaningful workshops and heart-to-heart interactions that strengthened our spiritual bonds.",
    3: "Day 3 culminated in powerful closing reflections and insights that will continue to guide our spiritual path forward."
  }

  const attendedDays = Array.from(daysAttended).sort()
  let message = ""

  if (attendedDays.length === 0) {
    message = `Dear ${userName}, your interest in the SSSIO USA 2025 National Conference touches our hearts. We hope to see you at future events and look forward to sharing more spiritual insights and community connections with you. Your presence, even in spirit, enriches our community.`
  } else if (attendedDays.length === 1) {
    const day = attendedDays[0]
    message = `Dear ${userName}, ${dayMessages[day as keyof typeof dayMessages]} Your presence and participation made this day truly special, and we hope the insights you gained will continue to inspire your spiritual journey. Every moment you shared with us is a blessing.`
  } else if (attendedDays.length === 2) {
    const day1 = attendedDays[0]
    const day2 = attendedDays[1]
    message = `Dear ${userName}, your commitment to attending multiple days of the conference shows your beautiful dedication to spiritual growth. ${dayMessages[day1 as keyof typeof dayMessages]} ${dayMessages[day2 as keyof typeof dayMessages]} We hope these experiences continue to guide and inspire you on your path.`
  } else {
    message = `Dear ${userName}, your full participation in the SSSIO USA 2025 National Conference has been truly inspiring. From the opening ceremonies to the closing reflections, your presence has enriched our community in countless ways. We hope the insights, connections, and spiritual growth you've experienced will continue to guide you on your journey and inspire others around you. You are a blessing to our community.`
  }

  return message
}

async function sendEmail(toEmail: string, htmlContent: string, subject: string): Promise<boolean> {
  try {
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    
    if (!RESEND_API_KEY) {
      console.log('Resend API key not configured, simulating email send...')
      console.log('HTML Content that would be sent:', htmlContent.substring(0, 500) + '...')
      return true
    }

    // Generate plain text version as fallback
    const plainTextContent = generatePlainTextContent(htmlContent)

    console.log('Sending email with HTML content length:', htmlContent.length)
    console.log('HTML Content preview:', htmlContent.substring(0, 200) + '...')

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'SSSIO USA <onboarding@resend.dev>',
        to: [toEmail],
        subject: subject,
        html: htmlContent,
        text: plainTextContent, // Add plain text fallback
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Resend API error:', error)
      return false
    }

    const result = await response.json()
    console.log('Email sent successfully:', result)
    return true
  } catch (error) {
    console.error('Error sending email:', error)
    return false
  }
}

function generatePlainTextContent(htmlContent: string): string {
  // Simple HTML to plain text conversion
  return htmlContent
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ') // Replace &nbsp; with spaces
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim()
} 