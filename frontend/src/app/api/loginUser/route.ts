import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Validate request body
    if (!request.body) {
      return NextResponse.json(
        { error: 'Request body is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    // Validate email field
    if (!body.email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/getUserProgress`, {
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
      let errorMessage = 'Login failed';
      
      if (data.error) {
        if (data.error.includes('User not found')) {
          errorMessage = 'User not found. Please register first.';
        } else if (data.error.includes('Missing required field')) {
          errorMessage = 'Email is required.';
        } else if (data.error.includes('Method not allowed')) {
          errorMessage = 'Invalid request method.';
        } else if (data.error.includes('Invalid')) {
          errorMessage = 'Invalid email format.';
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
    console.error('Login error:', error);
    
    // Handle specific error types
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      );
    }
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return NextResponse.json(
        { error: 'Unable to connect to server. Please try again later.' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Network error. Please check your connection and try again.' },
      { status: 500 }
    );
  }
} 