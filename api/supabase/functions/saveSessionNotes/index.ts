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

    // Get the request body
    const { session_id, notes, rating } = await req.json()

    // Validate required fields
    if (!session_id) {
      throw new Error('Session ID is required')
    }

    // Validate rating range
    if (rating !== undefined && (rating < 0 || rating > 5)) {
      throw new Error('Rating must be between 0 and 5')
    }

    // Get the current user from the Authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Unauthorized - No valid authorization header')
    }

    // Extract user email from the token or header
    // For now, we'll use a simple approach - you might want to decode the JWT token
    // to get the user email more securely
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

    // Check if notes already exist for this user and session
    const { data: existingNotes, error: checkError } = await supabaseClient
      .from('user_session_notes')
      .select('id')
      .eq('user_id', userData.id)
      .eq('session_id', session_id)
      .single()

    let result
    if (existingNotes) {
      // Update existing notes
      const { data, error } = await supabaseClient
        .from('user_session_notes')
        .update({
          notes: notes || null,
          rating: rating !== undefined ? rating : 0,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userData.id)
        .eq('session_id', session_id)
        .select()
        .single()

      if (error) throw error
      result = data
    } else {
      // Insert new notes
      const { data, error } = await supabaseClient
        .from('user_session_notes')
        .insert({
          user_id: userData.id,
          session_id,
          notes: notes || null,
          rating: rating !== undefined ? rating : 0
        })
        .select()
        .single()

      if (error) throw error
      result = data
    }

    return new Response(
      JSON.stringify({ success: true, data: result }),
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