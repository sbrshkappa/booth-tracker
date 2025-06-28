// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

console.log("Write to Google Sheet function loaded!")

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if(req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed. Only POST allowed." }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  try {
    const { userEmail } = await req.json()

    if(!userEmail) {
      return new Response(JSON.stringify({ error: "Missing required field: userEmail" }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!
    )

    // 1. Get user data
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, email, first_name, last_name, badge_number, created_at")
      .eq("email", userEmail)
      .single()

    if (userError) {
      return new Response(JSON.stringify({ error: "User not found" }), { 
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // 2. Get user's visit history
    const { data: visitHistory, error: visitError } = await supabase
      .from("user_booth_visits")
      .select(`
        visited_at,
        booths (
          id,
          name,
          phrase
        )
      `)
      .eq("user_id", user.id)
      .order("visited_at", { ascending: true })

    if (visitError) {
      return new Response(JSON.stringify({ error: visitError.message }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // 3. Get total booth count
    const { data: allBooths, error: boothsError } = await supabase
      .from("booths")
      .select("id")

    if (boothsError) {
      return new Response(JSON.stringify({ error: boothsError.message }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // 4. Check if user has completed all booths
    const visitedCount = visitHistory.length
    const totalBooths = allBooths.length
    const isCompleted = visitedCount === totalBooths && visitedCount > 0

    if (!isCompleted) {
      return new Response(JSON.stringify({ 
        message: "User has not completed all booths yet",
        progress: { visited: visitedCount, total: totalBooths }
      }), { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // 5. Prepare data for Google Sheets
    const completionData = {
      timestamp: new Date().toISOString(),
      user: {
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        badgeNumber: user.badge_number,
        registrationDate: user.created_at,
        completionDate: new Date().toISOString()
      },
      progress: {
        visitedCount,
        totalBooths,
        completionPercentage: 100
      },
      visitHistory: visitHistory.map(visit => ({
        boothName: visit.booths.name,
        boothPhrase: visit.booths.phrase,
        visitedAt: visit.visited_at
      }))
    }

    // 6. Send to Google Apps Script webhook
    const googleScriptUrl = Deno.env.get("GOOGLE_APPS_SCRIPT_WEBHOOK_URL")
    
    if (!googleScriptUrl) {
      return new Response(JSON.stringify({ error: "Google Apps Script webhook URL not configured" }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const webhookResponse = await fetch(googleScriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(completionData)
    })

    if (!webhookResponse.ok) {
      console.error('Google Apps Script webhook failed:', await webhookResponse.text())
      return new Response(JSON.stringify({ error: "Failed to write to Google Sheets" }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({
      success: true,
      message: "User completion data sent to Google Sheets",
      data: completionData
    }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
      status: 200 
    })

  } catch (error) {
    console.error('Error in writeToGoogleSheet function:', error)
    return new Response(JSON.stringify({ error: "Internal server error" }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
}) 