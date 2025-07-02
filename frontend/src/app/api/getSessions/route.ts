import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const day = searchParams.get('day')
    const type = searchParams.get('type')
    const childrenFriendly = searchParams.get('children_friendly')

    // Build query string
    const queryParams = new URLSearchParams()
    if (day) queryParams.append('day', day)
    if (type) queryParams.append('type', type)
    if (childrenFriendly) queryParams.append('children_friendly', childrenFriendly)

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    
    console.log('Frontend API - Supabase URL:', supabaseUrl)
    console.log('Frontend API - Service key exists:', !!supabaseServiceKey)
    console.log('Frontend API - Query params:', queryParams.toString())
    
    const edgeFunctionUrl = `${supabaseUrl}/functions/v1/getSessions?${queryParams.toString()}`
    console.log('Frontend API - Calling:', edgeFunctionUrl)
    
    const response = await fetch(edgeFunctionUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
      },
    })

    console.log('Frontend API - Response status:', response.status)
    console.log('Frontend API - Response ok:', response.ok)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Frontend API - Error response:', errorText)
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`)
    }

    const data = await response.json()
    console.log('Frontend API - Success, sessions count:', data.sessions?.length || 0)
    return NextResponse.json(data)

  } catch (error) {
    console.error('Frontend API - Error fetching sessions:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Failed to fetch sessions', details: errorMessage },
      { status: 500 }
    )
  }
} 