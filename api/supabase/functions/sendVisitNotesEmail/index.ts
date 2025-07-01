import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    const { userEmail, userName } = await req.json()

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

    if (!visits || visits.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No visit data found for this user' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Generate email content
    const emailContent = generateEmailContent(visits, userName || 'User')
    
    // Send email using a simple email service (you can replace this with your preferred email service)
    const emailSent = await sendEmail(userEmail, emailContent)

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
        message: 'Visit notes email sent successfully',
        visitCount: visits.length
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

function generateEmailContent(visits: any[], userName: string): string {
  const totalVisits = visits.length
  const visitsWithNotes = visits.filter(visit => visit.notes && visit.notes.trim())
  const totalNotes = visitsWithNotes.length

  let htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .stats { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
        .visit-card { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #667eea; }
        .booth-name { font-weight: bold; color: #667eea; font-size: 18px; margin-bottom: 10px; }
        .visit-date { color: #666; font-size: 14px; margin-bottom: 10px; }
        .notes { background: #f0f8ff; padding: 15px; border-radius: 5px; margin-top: 10px; }
        .rating { color: #ffa500; font-weight: bold; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🎪 SSSIO USA 2025 Booth Visit Summary</h1>
        <p>Hello ${userName}, here's a summary of your booth visits!</p>
      </div>
      
      <div class="content">
        <div class="stats">
          <h2>📊 Your Visit Statistics</h2>
          <p><strong>Total Booths Visited:</strong> ${totalVisits}</p>
          <p><strong>Booths with Notes:</strong> ${totalNotes}</p>
          <p><strong>Completion Rate:</strong> ${Math.round((totalVisits / 8) * 100)}%</p>
        </div>
  `

  if (visitsWithNotes.length > 0) {
    htmlContent += `<h2>📝 Your Visit Notes</h2>`
    
    visitsWithNotes.forEach(visit => {
      const booth = visit.booths
      const visitDate = new Date(visit.visited_at).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
      
      htmlContent += `
        <div class="visit-card">
          <div class="booth-name">🏢 ${booth.name}</div>
          <div class="visit-date">📅 Visited on ${visitDate}</div>
          ${visit.rating ? `<div class="rating">⭐ Rating: ${visit.rating}/5</div>` : ''}
          <div class="notes">
            <strong>Your Notes:</strong><br>
            ${visit.notes}
          </div>
        </div>
      `
    })
  } else {
    htmlContent += `
      <div style="text-align: center; padding: 40px; color: #666;">
        <h3>📝 No Notes Yet</h3>
        <p>You haven't taken any notes during your booth visits yet. Consider adding notes next time to keep track of important information!</p>
      </div>
    `
  }

  htmlContent += `
        <div class="footer">
          <p>Thank you for participating in SSSIO USA 2025!</p>
          <p>This email was generated automatically from your booth visit data.</p>
        </div>
      </div>
    </body>
    </html>
  `

  return htmlContent
}

async function sendEmail(toEmail: string, htmlContent: string): Promise<boolean> {
  try {
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    
    if (!RESEND_API_KEY) {
      console.log('Resend API key not configured, simulating email send...')
      return true
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'SSSIO USA <onboarding@resend.dev>', // Using Resend's default sender for now
        to: [toEmail],
        subject: '🎪 SSSIO USA 2025 - Your Booth Visit Summary',
        html: htmlContent,
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