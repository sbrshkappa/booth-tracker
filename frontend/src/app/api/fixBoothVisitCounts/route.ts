import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/fixBoothVisitCounts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || 'Failed to fix booth visit counts' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Fix booth visit counts error:', error);
    return NextResponse.json(
      { error: 'Network error. Please check your connection and try again.' },
      { status: 500 }
    );
  }
} 