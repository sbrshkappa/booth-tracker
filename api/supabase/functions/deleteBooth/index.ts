// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

console.log("Hello from deleteBooth Function!")

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if(req.method !== "DELETE") {
    return new Response("Method not allowed. Only DELETE allowed.", { 
      status: 405,
      headers: corsHeaders
    })
  }

  const { id } = await req.json()

  // Validate required fields
  if(!id) {
    return new Response("Missing required field: id", { 
      status: 400,
      headers: corsHeaders
    })
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!
  )

  try {
    // 1. Check if booth exists
    const { data: existingBooth, error: checkError } = await supabase
      .from("booths")
      .select("id, phrase, name")
      .eq("id", id)
      .single()

    if (checkError) {
      if (checkError.code === 'PGRST116') { // Not found
        return new Response(JSON.stringify({ error: "Booth not found" }), { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
      return new Response(JSON.stringify({ error: checkError.message }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // 2. Check if booth has any visits (optional - for informational purposes)
    const { data: visits, error: visitsError } = await supabase
      .from("user_booth_visits")
      .select("id")
      .eq("booth_id", id)

    if (visitsError) {
      return new Response(JSON.stringify({ error: visitsError.message }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // 3. Delete the booth
    // Note: This will fail if there are foreign key constraints unless CASCADE is set up
    const { error: deleteError } = await supabase
      .from("booths")
      .delete()
      .eq("id", id)

    if (deleteError) {
      return new Response(JSON.stringify({ 
        error: deleteError.message,
        hint: "This booth may have associated visits that need to be deleted first"
      }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // 4. Return success response
    const response = {
      success: true,
      message: "Booth deleted successfully",
      data: {
        deletedBooth: existingBooth,
        associatedVisits: visits?.length || 0
      }
    }

    return new Response(
      JSON.stringify(response),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 200 
      },
    )

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/deleteBooth' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
