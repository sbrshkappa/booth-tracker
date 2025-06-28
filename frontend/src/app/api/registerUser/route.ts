import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/registerUser`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle specific error cases
      let errorMessage = 'Registration failed';
      
      if (data.error) {
        if (data.error.includes('duplicate key') || data.error.includes('already exists')) {
          errorMessage = 'A user with this email already exists. Please login instead.';
        } else if (data.error.includes('invalid')) {
          errorMessage = 'Please check your input and try again.';
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
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Network error. Please check your connection and try again.' },
      { status: 500 }
    );
  }
} 