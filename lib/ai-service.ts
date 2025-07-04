import { createServerClient } from './supabase';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface FundiInfo {
  id: string;
  name: string;
  categories: string[];
  location: string;
  rating: number;
  is_verified: boolean;
  phone: string;
}

export interface BookingRequest {
  service_category: string;
  location: string;
  date: string;
  time: string;
  description: string;
  client_name: string;
  client_phone: string;
}

class AIService {
  private apiKey: string;
  private baseUrl = 'https://openrouter.ai/api/v1';

  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY || '';
    if (!this.apiKey) {
      console.warn('OpenRouter API key not found');
    }
  }

  async chat(messages: ChatMessage[], context?: any): Promise<string> {
    if (!this.apiKey) {
      return "I'm sorry, but I'm currently unable to process your request. Please try again later.";
    }

    // Check if the user is asking for fundi search
    const lastMessage = messages[messages.length - 1]?.content.toLowerCase() || '';
    const isSearchingFundis = lastMessage.includes('plumber') || 
                             lastMessage.includes('electrician') || 
                             lastMessage.includes('mechanic') || 
                             lastMessage.includes('cleaner') || 
                             lastMessage.includes('carpenter') ||
                             lastMessage.includes('fundi') ||
                             lastMessage.includes('technician');

    if (isSearchingFundis) {
      // Extract service category and location from the message
      const serviceCategory = this.extractServiceCategory(lastMessage);
      const location = this.extractLocation(lastMessage);
      
      if (serviceCategory && location) {
        const fundis = await this.searchFundis(serviceCategory, location);
        
        if (fundis.length > 0) {
          const fundiList = fundis.map(fundi => 
            `• ${fundi.name} - ${fundi.categories.join(', ')} - ${fundi.location} (Rating: ${fundi.rating}/5)`
          ).join('\n');
          
          return `I found ${fundis.length} available ${serviceCategory} fundis in ${location}:\n\n${fundiList}\n\nWould you like to book an appointment with one of these fundis? I can help you schedule a visit.`;
        } else {
          return `I couldn't find any available ${serviceCategory} fundis in ${location} at the moment. Would you like me to search in nearby areas or suggest alternative services?`;
        }
      }
    }

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
          'X-Title': 'FundiLink Chatbot'
        },
        body: JSON.stringify({
          model: 'anthropic/claude-3.5-sonnet',
          messages: messages,
          max_tokens: 1000,
          temperature: 0.7,
          system: this.getSystemPrompt(context)
        })
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || "I'm sorry, I couldn't process your request.";
    } catch (error) {
      console.error('AI Service error:', error);
      return "I'm sorry, but I'm experiencing technical difficulties. Please try again later.";
    }
  }

  private getSystemPrompt(context?: any): string {
    return `You are FundiLink, a helpful AI assistant for connecting clients with skilled technicians (fundis) in Kenya. Your role is to:

1. Help clients find available fundis based on their service needs and location
2. Assist with booking appointments
3. Provide information about services and pricing
4. Be friendly, professional, and culturally appropriate for Kenya

Key Guidelines:
- Always ask for the service category and location when helping find fundis
- Suggest specific dates and times for bookings
- Be clear about pricing expectations
- Encourage clients to provide detailed descriptions of their needs
- If a client wants to book, collect all necessary information

Available service categories: plumber, electrician, mechanic, cleaner, carpenter, general

Current context: ${JSON.stringify(context || {})}

Respond in a helpful, conversational manner. If you need to search for fundis or create a booking, indicate this clearly in your response.`;
  }

  private extractServiceCategory(message: string): string | null {
    const serviceKeywords = {
      'plumber': ['plumber', 'plumbing', 'pipe', 'water', 'tap', 'toilet', 'sink'],
      'electrician': ['electrician', 'electrical', 'electric', 'wiring', 'light', 'power', 'socket'],
      'mechanic': ['mechanic', 'mechanical', 'car', 'vehicle', 'engine', 'repair'],
      'cleaner': ['cleaner', 'cleaning', 'clean', 'housekeeping', 'maid'],
      'carpenter': ['carpenter', 'carpentry', 'wood', 'furniture', 'door', 'window'],
      'general': ['general', 'handyman', 'maintenance', 'repair']
    };

    for (const [category, keywords] of Object.entries(serviceKeywords)) {
      if (keywords.some(keyword => message.includes(keyword))) {
        return category;
      }
    }
    return null;
  }

  private extractLocation(message: string): string | null {
    // Common Kenyan locations
    const locations = [
      'nairobi', 'mombasa', 'kisumu', 'nakuru', 'eldoret', 'thika', 'kakamega',
      'westlands', 'kilimani', 'karen', 'lavington', 'kileleshwa', 'industrial area',
      'kasarani', 'donholm', 'buruburu', 'embakasi', 'kibera', 'mathare'
    ];

    for (const location of locations) {
      if (message.includes(location)) {
        return location;
      }
    }
    return null;
  }

  async searchFundis(serviceCategory: string, location: string): Promise<FundiInfo[]> {
    try {
      const supabase = createServerClient();
      
      const { data: fundis, error } = await supabase
        .from('fundis')
        .select('id, name, categories, location, rating, is_verified, phone')
        .eq('is_verified', true)
        .eq('available', true)
        .contains('categories', [serviceCategory])
        .ilike('location', `%${location}%`);

      if (error) {
        console.error('Error searching fundis:', error);
        return [];
      }

      return fundis || [];
    } catch (error) {
      console.error('Error in searchFundis:', error);
      return [];
    }
  }

  async createBooking(bookingData: BookingRequest): Promise<{ success: boolean; message: string; bookingId?: string }> {
    try {
      const supabase = createServerClient();
      
      // First, find a fundi for the service
      const { data: fundi, error: fundiError } = await supabase
        .from('fundis')
        .select('id, name')
        .eq('is_verified', true)
        .eq('available', true)
        .contains('categories', [bookingData.service_category])
        .ilike('location', `%${bookingData.location}%`)
        .limit(1)
        .single();

      if (fundiError || !fundi) {
        return {
          success: false,
          message: 'No available fundis found for this service and location.'
        };
      }

      // Create the booking
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert([{
          client_id: 'guest', // For now, using guest for chatbot bookings
          fundi_id: fundi.id,
          client_name: bookingData.client_name,
          fundi_name: fundi.name,
          service_category: bookingData.service_category,
          location: bookingData.location,
          date: bookingData.date,
          time: bookingData.time,
          status: 'pending',
          description: bookingData.description
        }])
        .select()
        .single();

      if (bookingError) {
        console.error('Error creating booking:', bookingError);
        return {
          success: false,
          message: 'Failed to create booking. Please try again.'
        };
      }

      return {
        success: true,
        message: `Booking created successfully! Your booking ID is ${booking.id}. A fundi will contact you soon.`,
        bookingId: booking.id
      };
    } catch (error) {
      console.error('Error in createBooking:', error);
      return {
        success: false,
        message: 'An error occurred while creating your booking.'
      };
    }
  }
}

export const aiService = new AIService(); 