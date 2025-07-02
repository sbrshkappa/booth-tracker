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
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    console.log('Supabase URL:', supabaseUrl)
    console.log('Service key exists:', !!supabaseServiceKey)
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get query parameters
    const url = new URL(req.url)
    const day = url.searchParams.get('day')
    const type = url.searchParams.get('type')
    const childrenFriendly = url.searchParams.get('children_friendly')

    console.log('Query params:', { day, type, childrenFriendly })

    // Build query
    let query = supabase
      .from('sessions')
      .select('*')
      .order('day', { ascending: true })
      .order('start_time', { ascending: true })

    // Apply filters
    if (day) {
      query = query.eq('day', parseInt(day))
    }
    if (type) {
      query = query.eq('type', type)
    }
    if (childrenFriendly === 'true') {
      query = query.eq('is_children_friendly', true)
    }

    // Execute query
    const { data, error } = await query

    if (error) {
      console.error('Error fetching sessions:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch sessions', details: error }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Sessions fetched successfully, count:', data?.length || 0)

    return new Response(
      JSON.stringify({ sessions: data }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}) 