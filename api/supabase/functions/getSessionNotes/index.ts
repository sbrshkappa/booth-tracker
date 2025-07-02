import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    // Create Supabase client with service role key
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Get the current user from the Authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Unauthorized - No valid authorization header')
    }

    // Extract user email from the header
    const userEmail = req.headers.get('x-user-email')
    if (!userEmail) {
      throw new Error('User email is required')
    }

    // Get user ID from users table
    const { data: userData, error: userDataError } = await supabaseClient
      .from('users')
      .select('id')
      .eq('email', userEmail)
      .single()

    if (userDataError || !userData) {
      throw new Error('User not found')
    }

    // Get all session notes for the user
    const { data: sessionNotes, error } = await supabaseClient
      .from('user_session_notes')
      .select(`
        id,
        session_id,
        notes,
        rating,
        created_at,
        updated_at,
        sessions (
          id,
          topic,
          speaker,
          start_time,
          type,
          room
        )
      `)
      .eq('user_id', userData.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: sessionNotes 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
}) 