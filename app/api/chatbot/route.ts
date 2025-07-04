import { NextRequest, NextResponse } from 'next/server';
import { aiService, ChatMessage } from '@/lib/ai-service';
import { verifyToken } from '@/lib/auth';

function getTokenFromRequest(request: NextRequest): string | null {
  // Try Authorization header
  const authHeader = request.headers.get('authorization') || '';
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.replace('Bearer ', '').trim();
  }
  // Try cookie
  const cookie = request.cookies.get('fundilink_token')?.value;
  if (cookie) return cookie;
  return null;
}

export async function POST(request: NextRequest) {
  // --- Auth check ---
  const token = getTokenFromRequest(request);
  const user = token ? verifyToken(token) : null;
  if (!user) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  // --- End auth check ---
  try {
    const body = await request.json();
    const { message, conversationHistory = [], action, bookingData } = body;

    if (!message && !action) {
      return NextResponse.json(
        { success: false, message: 'Message or action is required' },
        { status: 400 }
      );
    }

    let response: string;

    // Handle specific actions
    if (action === 'search_fundis') {
      const { serviceCategory, location } = bookingData;
      const fundis = await aiService.searchFundis(serviceCategory, location);
      
      if (fundis.length === 0) {
        response = `I couldn't find any available fundis for ${serviceCategory} services in ${location}. Would you like me to search in nearby areas or suggest alternative services?`;
      } else {
        const fundiList = fundis.map(fundi => 
          `• ${fundi.name} - ${fundi.categories.join(', ')} - ${fundi.location} (Rating: ${fundi.rating}/5)`
        ).join('\n');
        
        response = `I found ${fundis.length} available fundis for ${serviceCategory} services in ${location}:\n\n${fundiList}\n\nWould you like to book an appointment with one of these fundis?`;
      }
    } else if (action === 'create_booking') {
      const result = await aiService.createBooking(bookingData);
      response = result.message;
    } else {
      // Regular chat conversation
      const messages: ChatMessage[] = [
        ...conversationHistory,
        { role: 'user', content: message }
      ];

      response = await aiService.chat(messages);
    }

    return NextResponse.json({
      success: true,
      response,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chatbot API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'FundiLink Chatbot API is running',
    timestamp: new Date().toISOString()
  });
} 