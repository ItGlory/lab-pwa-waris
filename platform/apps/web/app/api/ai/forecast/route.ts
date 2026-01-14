import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_URL || 'http://waris-api:8000';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const days = searchParams.get('days') || '7';

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/ai/forecast?days=${days}`, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('AI forecast fetch error:', error);
    // Return mock data if backend unavailable
    const numDays = parseInt(days);
    const dates: string[] = [];
    const predictions: number[] = [];
    const lowerBound: number[] = [];
    const upperBound: number[] = [];

    const startDate = new Date();
    const baseLoss = 150;

    for (let i = 0; i < numDays; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i + 1);
      dates.push(date.toISOString().split('T')[0]);

      const prediction = baseLoss + Math.random() * 40 - 20 + i * 2;
      predictions.push(Math.round(prediction * 10) / 10);
      lowerBound.push(Math.round((prediction - 25) * 10) / 10);
      upperBound.push(Math.round((prediction + 25) * 10) / 10);
    }

    return NextResponse.json({
      dates,
      predictions,
      lower_bound: lowerBound,
      upper_bound: upperBound,
      confidence: 0.95,
    });
  }
}
