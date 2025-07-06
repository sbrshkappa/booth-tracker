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
    const body = await req.json()
    console.log('Received request body:', JSON.stringify(body, null, 2))

    const { 
      sessionId,
      day, 
      start_time, 
      topic, 
      speaker, 
      description, 
      type, 
      location, 
      room, 
      capacity, 
      is_children_friendly, 
      requires_registration, 
      tags,
      userEmail 
    } = body

    // Validate required fields
    if (!sessionId || !day || !start_time || !topic || !type) {
      console.log('Validation failed:', { sessionId, day, start_time, topic, type })
      return new Response(
        JSON.stringify({ error: 'Session ID, day, start time, topic, and type are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    console.log('Looking up user with email:', userEmail)

    // Get user ID first
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', userEmail)
      .single()

    if (userError || !user) {
      console.log('User lookup failed:', userError)
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('User found:', user.id)

    // Check if user is admin
    const { data: adminUser, error: adminError } = await supabase
      .from('admin_users')
      .select('admin_level')
      .eq('user_id', user.id)
      .single()

    if (adminError || !adminUser) {
      console.log('Admin check failed:', adminError)
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Admin check passed:', adminUser.admin_level)

    // Update session
    const updateData = {
      day,
      start_time,
      topic,
      speaker,
      description,
      type,
      location,
      room,
      capacity,
      is_children_friendly: is_children_friendly || false,
      requires_registration: requires_registration || false,
      tags: tags || []
    }

    console.log('Updating session with data:', JSON.stringify(updateData, null, 2))

    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .update(updateData)
      .eq('id', sessionId)
      .select()
      .single()

    if (sessionError) {
      console.error('Error updating session:', sessionError)
      return new Response(
        JSON.stringify({ error: 'Failed to update session', details: sessionError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Session updated successfully:', session.id)

    return new Response(
      JSON.stringify({ success: true, session }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in updateSession:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}) 