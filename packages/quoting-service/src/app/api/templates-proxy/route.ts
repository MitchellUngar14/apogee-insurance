import { NextRequest, NextResponse } from 'next/server';

const BENEFIT_DESIGNER_URL = process.env.BENEFIT_DESIGNER_URL || 'http://localhost:3003';

// Proxy endpoint to fetch benefit templates from benefit-designer service
// This avoids CORS issues when fetching from client-side

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const type = searchParams.get('type') as 'individual' | 'group' | null;

    let url: string;

    if (id) {
      url = `${BENEFIT_DESIGNER_URL}/api/templates/${id}`;
    } else if (type === 'individual' || type === 'group') {
      url = `${BENEFIT_DESIGNER_URL}/api/templates?type=${type}&status=active&latest=true`;
    } else {
      url = `${BENEFIT_DESIGNER_URL}/api/templates?type=individual&status=active&latest=true`;
    }

    console.log('Fetching templates from:', url);

    const response = await fetch(url, { cache: 'no-store' });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const text = await response.text();
      console.error('Error response:', text);
      return NextResponse.json(
        { error: `Benefit designer returned ${response.status}: ${text.substring(0, 200)}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Template proxy error:', error);
    return NextResponse.json(
      {
        error: `Failed to fetch templates: ${(error as Error).message}`,
        attemptedUrl: `${BENEFIT_DESIGNER_URL}/api/templates`,
        envValue: process.env.BENEFIT_DESIGNER_URL || 'NOT SET'
      },
      { status: 500 }
    );
  }
}
