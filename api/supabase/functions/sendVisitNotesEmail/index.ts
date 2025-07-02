import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { EMAIL_TEMPLATE, generateVisitCard, generateNoNotesMessage } from './template.ts'

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
  const completionRate = Math.round((totalVisits / 8) * 100)

  // Start with the template and replace basic variables
  let htmlContent = EMAIL_TEMPLATE
    .replace(/\{\{userName\}\}/g, userName)
    .replace(/\{\{totalVisits\}\}/g, totalVisits.toString())
    .replace(/\{\{totalNotes\}\}/g, totalNotes.toString())
    .replace(/\{\{completionRate\}\}/g, completionRate.toString())

  if (visitsWithNotes.length > 0) {
    // Replace the conditional block with actual visit cards
    const visitsHtml = visitsWithNotes.map(generateVisitCard).join('')
    htmlContent = htmlContent.replace(
      /\{\{#if hasNotes\}\}\s*<h2>📝 Your Visit Notes<\/h2>\s*\{\{#each visitsWithNotes\}\}([\s\S]*?)\{\{\/each\}\}\s*\{\{else\}\}([\s\S]*?)\{\{\/if\}\}/,
      `<h2>📝 Your Visit Notes</h2>${visitsHtml}`
    )
  } else {
    // Replace with no notes message
    htmlContent = htmlContent.replace(
      /\{\{#if hasNotes\}\}\s*<h2>📝 Your Visit Notes<\/h2>\s*\{\{#each visitsWithNotes\}\}([\s\S]*?)\{\{\/each\}\}\s*\{\{else\}\}([\s\S]*?)\{\{\/if\}\}/,
      generateNoNotesMessage()
    )
  }

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