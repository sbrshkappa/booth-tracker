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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!
    )

    // Get total users
    const { count: totalUsers, error: usersError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })

    if (usersError) {
      console.error('Error fetching users:', usersError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch user data' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get total booths
    const { count: totalBooths, error: boothsError } = await supabase
      .from('booths')
      .select('*', { count: 'exact', head: true })

    if (boothsError) {
      console.error('Error fetching booths:', boothsError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch booth data' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get user booth visits to calculate progress
    const { data: boothVisits, error: visitsError } = await supabase
      .from('user_booth_visits')
      .select(`
        user_id,
        booth_id,
        booths (
          name
        )
      `)

    if (visitsError) {
      console.error('Error fetching booth visits:', visitsError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch booth visit data' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Calculate user progress
    const totalRegisteredUsers = totalUsers || 0
    const totalBoothsCount = totalBooths || 0
    
    // Group visits by user
    const userVisits: { [key: number]: number } = {}
    boothVisits?.forEach(visit => {
      userVisits[visit.user_id] = (userVisits[visit.user_id] || 0) + 1
    })

    const activeUsers = Object.keys(userVisits).length
    const completedUsers = Object.values(userVisits).filter(visitCount => visitCount === totalBoothsCount).length

    const completionRate = totalRegisteredUsers > 0 ? Math.round((completedUsers / totalRegisteredUsers) * 100) : 0
    const activeRate = totalRegisteredUsers > 0 ? Math.round((activeUsers / totalRegisteredUsers) * 100) : 0

    // Calculate popular booths
    const boothVisitCounts: { [key: string]: number } = {}
    boothVisits?.forEach(visit => {
      const boothName = visit.booths?.name || 'Unknown Booth'
      boothVisitCounts[boothName] = (boothVisitCounts[boothName] || 0) + 1
    })

    const popularBooths = Object.entries(boothVisitCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, visits: count }))

    // Get session data for popular session types
    const { data: sessions, error: sessionError } = await supabase
      .from('sessions')
      .select('type')

    if (sessionError) {
      console.error('Error fetching sessions:', sessionError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch session data' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Calculate popular session types
    const sessionTypeCounts: { [key: string]: number } = {}
    sessions?.forEach(session => {
      const type = session.type || 'unknown'
      sessionTypeCounts[type] = (sessionTypeCounts[type] || 0) + 1
    })

    const popularSessionTypes = Object.entries(sessionTypeCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([type, count]) => ({ type, count }))

    const metrics = {
      totalUsers: totalRegisteredUsers,
      completedUsers,
      activeUsers,
      completionRate,
      activeRate,
      popularBooths,
      popularSessionTypes,
      totalSessions: sessions?.length || 0,
      totalBooths: totalBoothsCount
    }

    return new Response(
      JSON.stringify({ success: true, data: metrics }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in getAdminMetrics:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}) 