// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

console.log("Hello from createUser Function!")

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
    const { email, firstName, lastName, badgeNumber, isAdmin, adminLevel, userEmail } = await req.json()

    // Validate required fields
    if (!email || !firstName || !lastName) {
      return new Response(
        JSON.stringify({ error: 'Email, first name, and last name are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found"
      return new Response(
        JSON.stringify({ error: 'Error checking user existence' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (existingUser) {
      return new Response(
        JSON.stringify({ error: 'A user with this email already exists' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create user in users table
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert([{
        email,
        first_name: firstName,
        last_name: lastName,
        badge_number: badgeNumber || null,
        is_admin: isAdmin || false
      }])
      .select()
      .single()

    if (createError) {
      console.error('Error creating user:', createError)
      return new Response(
        JSON.stringify({ error: 'Failed to create user' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // If user is admin, add to admin_users table
    if (isAdmin && adminLevel && newUser) {
      const { error: adminError } = await supabase
        .from('admin_users')
        .insert([{
          user_id: newUser.id,
          admin_level: adminLevel
        }])

      if (adminError) {
        console.error('Error creating admin user:', adminError)
        // Don't fail the whole request, just log the error
      }
    }

    // Transform the response to match frontend expectations
    const transformedUser = {
      id: newUser.id,
      email: newUser.email,
      firstName: newUser.first_name,
      lastName: newUser.last_name,
      badgeNumber: newUser.badge_number,
      is_admin: newUser.is_admin,
      admin_level: isAdmin ? adminLevel : null,
      admin_level_name: isAdmin && adminLevel 
        ? (adminLevel === 1 ? 'Booth Admin' 
           : adminLevel === 2 ? 'Conference Admin'
           : adminLevel === 3 ? 'Super Admin'
           : 'Unknown')
        : null,
      created_at: newUser.created_at
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        user: transformedUser 
      }),
      { 
        status: 201, 
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

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/createUser' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"email":"test@example.com","firstName":"John","lastName":"Doe"}'

*/ 