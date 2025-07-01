// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
// import "https://deno.land/x/supabase_functions_deno_runtime@1.0.0/edge-runtime.d.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

console.log("Hello from Functions!")

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if(req.method !== "PUT") {
    return new Response("Method not allowed. Only PUT allowed.", { 
      status: 405,
      headers: corsHeaders
    })
  }

  let visitId, rating, userEmail;
  try {
    ({ visitId, rating, userEmail } = await req.json());
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  // Validate required fields
  if(!visitId || !userEmail || rating === undefined) {
    return new Response(JSON.stringify({ error: "Missing required fields: visitId, rating, and userEmail" }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  // Validate rating
  if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
    return new Response(JSON.stringify({ error: "Rating must be an integer between 1 and 5" }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!
  )

  // First, get the user
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("id")
    .eq("email", userEmail)
    .single()

  if (userError || !user) {
    return new Response(JSON.stringify({ error: "User not found" }), { 
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  // Update the visit with the new rating
  const { data, error } = await supabase
    .from("user_booth_visits")
    .update({ rating })
    .eq("id", visitId)
    .eq("user_id", user.id)
    .select()

  if(error) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  return new Response(
    JSON.stringify({success: true, data}),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
      status: 200 
    },
  )
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request PUT 'http://127.0.0.1:54321/functions/v1/updateBoothRating' \
    --header 'Authorization: Bearer ' \
    --header 'Content-Type: application/json' \
    --data '{"visitId": 1, "rating": 5, "userEmail": "user@example.com"}'

*/ 