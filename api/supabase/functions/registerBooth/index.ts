// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

console.log("Hello from registerBooth Function!")

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

  const { phrase, name, description } = await req.json()

  // Validate required fields
  if(!phrase || !name) {
    return new Response("Missing required fields: phrase and name", { 
      status: 400,
      headers: corsHeaders
    })
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!
  )

  // Check if booth with same phrase already exists
  const { data: existingBooth, error: checkError } = await supabase
    .from("booths")
    .select("id, phrase")
    .eq("phrase", phrase)
    .single()

  if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found"
    return new Response(JSON.stringify({ error: checkError.message }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  if (existingBooth) {
    return new Response(JSON.stringify({ error: "Booth with this phrase already exists" }), { 
      status: 409,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  // Insert new booth
  const { data, error } = await supabase
    .from("booths")
    .insert([{
      phrase,
      name,
      description
    }])
    .select()

  if(error) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  return new Response(
    JSON.stringify({
      success: true, 
      message: "Booth registered successfully",
      data
    }),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
      status: 201 
    },
  )
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/registerBooth' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
