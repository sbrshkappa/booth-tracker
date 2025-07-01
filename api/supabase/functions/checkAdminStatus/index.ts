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

  if(req.method !== "POST") {
    return new Response("Method not allowed. Only POST allowed.", { 
      status: 405,
      headers: corsHeaders
    })
  }

  let userEmail;
  try {
    ({ userEmail } = await req.json());
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  if(!userEmail) {
    return new Response(JSON.stringify({ error: "Missing userEmail" }), {
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

  // Check if user is an admin
  const { data: adminData, error: adminError } = await supabase
    .from("admin_users")
    .select("admin_level")
    .eq("user_id", user.id)
    .eq("conference_id", "sssio_usa_2025")
    .single()

  if (adminError && adminError.code !== 'PGRST116') { // PGRST116 is "not found"
    return new Response(JSON.stringify({ error: adminError.message }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  const isAdmin = !!adminData;
  const adminLevel = adminData?.admin_level || null;

  return new Response(
    JSON.stringify({
      isAdmin,
      adminLevel,
      userId: user.id
    }),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
      status: 200 
    },
  )
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/checkAdminStatus' \
    --header 'Authorization: Bearer ' \
    --header 'Content-Type: application/json' \
    --data '{"userEmail":"user@example.com"}'

*/ 