// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

console.log("Hello from getAllUsers Function!")

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

    // Get all users with admin information
    const { data: users, error } = await supabase
      .from('users')
      .select(`
        id,
        email,
        first_name,
        last_name,
        badge_number,
        is_admin,
        created_at,
        admin_users (
          admin_level
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching users:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch users' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Transform the data to include admin level information
    const transformedUsers = users?.map(user => ({
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      badgeNumber: user.badge_number,
      is_admin: user.is_admin,
      admin_level: user.admin_users?.[0]?.admin_level || null,
      admin_level_name: user.admin_users?.[0]?.admin_level 
        ? (user.admin_users[0].admin_level === 1 ? 'Booth Admin' 
           : user.admin_users[0].admin_level === 2 ? 'Conference Admin'
           : user.admin_users[0].admin_level === 3 ? 'Super Admin'
           : 'Unknown')
        : null,
      created_at: user.created_at
    })) || []

    return new Response(
      JSON.stringify({ 
        success: true, 
        users: transformedUsers 
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

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request GET 'http://127.0.0.1:54321/functions/v1/getAllUsers' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

*/ 