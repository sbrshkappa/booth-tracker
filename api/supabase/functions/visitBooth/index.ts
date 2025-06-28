// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

console.log("Hello from visitBooth Function!")

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

  let phrase, userEmail;
  try {
    ({ phrase, userEmail } = await req.json());
  } catch {
    return new Response(JSON.stringify({ error: "Missing required fields: phrase and userEmail" }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  // Validate required fields
  if(!phrase || !userEmail) {
    return new Response(JSON.stringify({ error: "Missing required fields: phrase and userEmail" }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
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
      .select("id, email, first_name, last_name")
      .eq("email", userEmail)
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

    // 2. Find the booth by phrase
    const { data: booth, error: boothError } = await supabase
      .from("booths")
      .select("id, phrase, name")
      .eq("phrase", phrase)
      .single()

    if (boothError) {
      if (boothError.code === 'PGRST116') { // Not found
        return new Response(JSON.stringify({ error: "Invalid booth phrase" }), { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
      return new Response(JSON.stringify({ error: boothError.message }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // 3. Check if user has already visited this booth
    const { data: existingVisit, error: visitCheckError } = await supabase
      .from("user_booth_visits")
      .select("id, visited_at")
      .eq("user_id", user.id)
      .eq("booth_id", booth.id)
      .single()

    if (visitCheckError && visitCheckError.code !== 'PGRST116') { // PGRST116 is "not found"
      return new Response(JSON.stringify({ error: visitCheckError.message }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (existingVisit) {
      return new Response(JSON.stringify({ 
        error: "You have already visited this booth",
        visitedAt: existingVisit.visited_at
      }), { 
        status: 409,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // 4. Record the visit
    const { data: newVisit, error: visitError } = await supabase
      .from("user_booth_visits")
      .insert([{
        user_id: user.id,
        booth_id: booth.id,
        visited_at: new Date().toISOString()
      }])
      .select()

    if (visitError) {
      return new Response(JSON.stringify({ error: visitError.message }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // 5. Check if user has visited all booths
    const { data: allBooths, error: allBoothsError } = await supabase
      .from("booths")
      .select("id")

    if (allBoothsError) {
      return new Response(JSON.stringify({ error: allBoothsError.message }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const { data: userVisits, error: userVisitsError } = await supabase
      .from("user_booth_visits")
      .select("booth_id")
      .eq("user_id", user.id)

    if (userVisitsError) {
      return new Response(JSON.stringify({ error: userVisitsError.message }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const totalBooths = allBooths.length
    const visitedBooths = userVisits.length
    const isComplete = visitedBooths >= totalBooths

    // 6. Return response
    const response = {
      success: true,
      message: isComplete ? "Congratulations! You've visited all booths and are entered into the raffle!" : "Booth visit recorded successfully",
      data: {
        visit: newVisit[0],
        booth: booth,
        user: user,
        progress: {
          visited: visitedBooths,
          total: totalBooths,
          remaining: totalBooths - visitedBooths
        },
        isComplete: isComplete
      }
    }

    return new Response(
      JSON.stringify(response),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 201 
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

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/visitBooth' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
