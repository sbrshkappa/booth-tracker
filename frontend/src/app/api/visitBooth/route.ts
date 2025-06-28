import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/visitBooth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(body),
    });

    const contentType = response.headers.get('content-type');
    let data;
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = { error: text };
    }

    if (!response.ok) {
      // Handle specific error cases
      let errorMessage = 'Failed to visit booth';
      
      if (data.error) {
        if (data.error.includes('Invalid phrase')) {
          errorMessage = 'Incorrect phrase. Please try again.';
        } else if (data.error.includes('already visited')) {
          errorMessage = 'You have already visited this booth.';
        } else if (data.error.includes('not found')) {
          errorMessage = 'Booth not found.';
        } else {
          errorMessage = data.error;
        }
      }

      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Visit booth error:', error);
    return NextResponse.json(
      { error: 'Network error. Please check your connection and try again.' },
      { status: 500 }
    );
  }
} 