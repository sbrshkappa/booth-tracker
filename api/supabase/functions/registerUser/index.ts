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

  const { email, first_name, last_name, badge_number } = await req.json()

  if(!email || !first_name || !last_name) {
    return new Response("Missing required fields", { 
      status: 400,
      headers: corsHeaders
    })
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!
  )

  const userData: any = { email, first_name, last_name };
  if (badge_number) {
    userData.badge_number = badge_number;
  }

  const { data, error } = await supabase
    .from("users")
    .insert([userData])
    .select()
    .single()

  if(error) {
    let errorMessage = error.message;
    let statusCode = 500;

    // Handle specific error cases
    if (error.message.includes('duplicate key') || error.message.includes('already exists')) {
      errorMessage = 'A user with this email already exists. Please login instead.';
      statusCode = 409; // Conflict
    } else if (error.message.includes('invalid')) {
      errorMessage = 'Please check your input and try again.';
      statusCode = 400; // Bad Request
    } else if (error.message.includes('foreign key')) {
      errorMessage = 'Invalid badge number. Please check and try again.';
      statusCode = 400;
    }

    return new Response(JSON.stringify({ error: errorMessage }), { 
      status: statusCode,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  // Transform the response to match frontend expectations
  const transformedUser = {
    id: data.id,
    email: data.email,
    firstName: data.first_name,
    lastName: data.last_name,
    badgeNumber: data.badge_number,
    is_admin: false,
    admin_level: null,
    admin_level_name: null,
    created_at: data.created_at
  }

  return new Response(
    JSON.stringify({success: true, user: transformedUser}),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
      status: 201 
    },
  )
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/registerUser' \
    --header 'Authorization: Bearer ' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
