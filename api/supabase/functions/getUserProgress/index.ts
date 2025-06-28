// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

console.log("Hello from getUserProgress Function!")

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
    return new Response("Method not allowed. Only POST allowed.", { 
      status: 405,
      headers: corsHeaders
    })
  }

  const { email } = await req.json()

  // Validate required fields
  if(!email) {
    return new Response("Missing required field: email", { 
      status: 400,
      headers: corsHeaders
    })
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!
  )

  try {
    // 1. Find the user by email
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, email, first_name, last_name, badge_number")
      .eq("email", email)
      .single()

    if (userError) {
      if (userError.code === 'PGRST116') { // Not found
        return new Response(JSON.stringify({ error: "User not found" }), { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
      return new Response(JSON.stringify({ error: userError.message }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // 2. Get all booths (to calculate total)
    const { data: allBooths, error: allBoothsError } = await supabase
      .from("booths")
      .select("id, phrase, name")

    if (allBoothsError) {
      return new Response(JSON.stringify({ error: allBoothsError.message }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // 3. Get user's booth visits with booth details
    const { data: userVisits, error: userVisitsError } = await supabase
      .from("user_booth_visits")
      .select(`
        id,
        visited_at,
        booths (
          id,
          phrase,
          name
        )
      `)
      .eq("user_id", user.id)
      .order("visited_at", { ascending: true })

    if (userVisitsError) {
      return new Response(JSON.stringify({ error: userVisitsError.message }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // 4. Calculate progress
    const totalBooths = allBooths.length
    const visitedBooths = userVisits.length
    const remainingBooths = totalBooths - visitedBooths
    const isComplete = visitedBooths >= totalBooths
    const progressPercentage = totalBooths > 0 ? Math.round((visitedBooths / totalBooths) * 100) : 0

    // 5. Get list of booths not yet visited
    const visitedBoothIds = userVisits.map(visit => visit.booths.id)
    const unvisitedBooths = allBooths.filter(booth => !visitedBoothIds.includes(booth.id))

    // 6. Format visit history
    const visitHistory = userVisits.map(visit => ({
      visitId: visit.id,
      boothId: visit.booths.id,
      boothPhrase: visit.booths.phrase,
      boothName: visit.booths.name,
      visitedAt: visit.visited_at
    }))

    // 7. Return comprehensive progress data
    const response = {
      success: true,
      message: "User progress retrieved successfully",
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          badgeNumber: user.badge_number
        },
        progress: {
          visited: visitedBooths,
          total: totalBooths,
          remaining: remainingBooths,
          percentage: progressPercentage,
          isComplete: isComplete
        },
        visitHistory: visitHistory,
        unvisitedBooths: unvisitedBooths.map(booth => ({
          id: booth.id,
          phrase: booth.phrase,
          name: booth.name
        })),
        summary: {
          firstVisit: visitHistory.length > 0 ? visitHistory[0].visitedAt : null,
          lastVisit: visitHistory.length > 0 ? visitHistory[visitHistory.length - 1].visitedAt : null,
          totalVisits: visitHistory.length
        }
      }
    }

    return new Response(
      JSON.stringify(response),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 200 
      },
    )

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/getUserProgress' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
