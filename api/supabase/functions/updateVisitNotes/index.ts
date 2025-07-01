// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

console.log("Update Visit Notes function loaded!")

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if(req.method !== "PUT" && req.method !== "PATCH") {
    return new Response(JSON.stringify({ error: "Method not allowed. Only PUT/PATCH allowed." }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  let visitId, notes, userEmail;
  try {
    ({ visitId, notes, userEmail } = await req.json());
  } catch {
    return new Response(JSON.stringify({ error: "Missing required fields: visitId, notes, and userEmail" }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  // Validate required fields
  if(!visitId || !userEmail) {
    return new Response(JSON.stringify({ error: "Missing required fields: visitId and userEmail" }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!
  )

  try {
    // 1. Find the user by email
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, email")
      .eq("email", userEmail)
      .single()

    if (userError) {
      if (userError.code === 'PGRST116') { // Not found
        return new Response(JSON.stringify({ error: "User not found" }), { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
      return new Response(JSON.stringify({ error: userError.message }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // 2. Verify the visit belongs to this user
    const { data: visit, error: visitError } = await supabase
      .from("user_booth_visits")
      .select("id, user_id, booth_id, visited_at, notes")
      .eq("id", visitId)
      .eq("user_id", user.id)
      .single()

    if (visitError) {
      if (visitError.code === 'PGRST116') { // Not found
        return new Response(JSON.stringify({ error: "Visit not found or access denied" }), { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
      return new Response(JSON.stringify({ error: visitError.message }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // 3. Update the notes
    const { data: updatedVisit, error: updateError } = await supabase
      .from("user_booth_visits")
      .update({ notes: notes })
      .eq("id", visitId)
      .eq("user_id", user.id)
      .select(`
        id,
        visited_at,
        notes,
        booths (
          id,
          name,
          phrase
        )
      `)
      .single()

    if (updateError) {
      return new Response(JSON.stringify({ error: updateError.message }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({
      success: true,
      message: "Notes updated successfully",
      data: {
        visitId: updatedVisit.id,
        boothName: updatedVisit.booths.name,
        boothPhrase: updatedVisit.booths.phrase,
        visitedAt: updatedVisit.visited_at,
        notes: updatedVisit.notes
      }
    }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
      status: 200 
    })

  } catch (error) {
    console.error('Error in updateVisitNotes function:', error)
    return new Response(JSON.stringify({ error: "Internal server error" }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
}) 