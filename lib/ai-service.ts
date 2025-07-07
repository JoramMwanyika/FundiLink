import { createServerClient } from './supabase';
import { addDays, format, isToday, isTomorrow, parse, setHours, setMinutes } from 'date-fns';

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
      // Extract service category, date, and time from the message or context
      const serviceCategory = this.extractServiceCategory(lastMessage);
      // Try to get date/time from context, or parse from message
      let date = context?.date || undefined;
      let time = context?.time || undefined;
      if (!date || !time) {
        const parsed = this.parseDateTimeFromMessage(lastMessage);
        if (parsed.date) date = parsed.date;
        if (parsed.time) time = parsed.time;
      }
      if (serviceCategory && date && time) {
        const fundis = await this.searchFundis(serviceCategory, date, time);
        if (fundis.length > 0) {
          const fundiList = fundis.map(fundi => 
            `• ${fundi.name} - ${fundi.categories.join(', ')} - ${fundi.location} (Rating: ${fundi.rating}/5)`
          ).join('\n');
          return `I found ${fundis.length} available ${serviceCategory} fundis for ${date} at ${time}:\n\n${fundiList}\n\nWould you like to book an appointment with one of these fundis? I can help you schedule a visit.`;
        } else {
          return `I couldn't find any available ${serviceCategory} fundis for ${date} at ${time}. Would you like to try a different time or service?`;
        }
      } else {
        return 'Please provide the service category, date, and time you need a fundi for.';
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

  // Helper to auto-generate availability slots for the next 7 days, 9am-5pm
  private generateDefaultAvailability(): any[] {
    const slots = [];
    const now = new Date();
    for (let d = 0; d < 7; d++) {
      const date = addDays(now, d);
      const dateStr = format(date, 'yyyy-MM-dd');
      for (let h = 9; h <= 17; h++) {
        const timeStr = `${h.toString().padStart(2, '0')}:00`;
        slots.push({ date: dateStr, time: timeStr, available: true });
      }
    }
    return slots;
  }

  // Helper to parse date and time from a message
  private parseDateTimeFromMessage(message: string): { date?: string, time?: string } {
    const now = new Date();
    let date: string | undefined;
    let time: string | undefined;
    const lower = message.toLowerCase();

    // Date parsing
    if (lower.includes('tomorrow')) {
      date = format(addDays(now, 1), 'yyyy-MM-dd');
    } else if (lower.includes('today')) {
      date = format(now, 'yyyy-MM-dd');
    } else {
      // Check for weekday names
      const weekdays = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
      for (let i = 0; i < weekdays.length; i++) {
        if (lower.includes(weekdays[i])) {
          // Find next occurrence of this weekday
          const dayDiff = (i + 7 - now.getDay()) % 7 || 7;
          date = format(addDays(now, dayDiff), 'yyyy-MM-dd');
          break;
        }
      }
    }

    // Time parsing (e.g. 2pm, 10:00, 14:00)
    const timeMatch = lower.match(/(\d{1,2})(:|\s)?(\d{2})?\s?(am|pm)?/);
    if (timeMatch) {
      let hour = parseInt(timeMatch[1], 10);
      let minute = timeMatch[3] ? parseInt(timeMatch[3], 10) : 0;
      const ampm = timeMatch[4];
      if (ampm === 'pm' && hour < 12) hour += 12;
      if (ampm === 'am' && hour === 12) hour = 0;
      if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
        time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      }
    }
    return { date, time };
  }

  async searchFundis(serviceCategory: string, date: string, time: string): Promise<FundiInfo[]> {
    try {
      const supabase = createServerClient();
      const { data: fundis, error } = await supabase
        .from('users')
        .select('id, name, categories, location, rating, is_verified, phone, availability')
        .eq('role', 'fundi')
        .eq('is_verified', true)
        .contains('categories', [serviceCategory]);

      if (error) {
        console.error('Error searching fundis:', error);
        return [];
      }

      // Auto-generate availability if missing
      const fundisWithAvailability = (fundis || []).map(fundi => {
        if (!Array.isArray(fundi.availability) || fundi.availability.length === 0) {
          return { ...fundi, availability: this.generateDefaultAvailability() };
        }
        return fundi;
      });

      // Filter by availability for the requested date and time
      return fundisWithAvailability.filter(fundi =>
        Array.isArray(fundi.availability) &&
        fundi.availability.some(slot => slot.date === date && slot.time === time && slot.available)
      );
    } catch (error) {
      console.error('Error in searchFundis:', error);
      return [];
    }
  }

  async createBooking(bookingData: BookingRequest): Promise<{ success: boolean; message: string; bookingId?: string }> {
    try {
      const supabase = createServerClient();
      // Find a fundi for the service and availability
      const { data: fundis, error: fundiError } = await supabase
        .from('users')
        .select('id, name, availability')
        .eq('role', 'fundi')
        .eq('is_verified', true)
        .contains('categories', [bookingData.service_category]);

      if (fundiError || !fundis || fundis.length === 0) {
        return {
          success: false,
          message: 'No available fundis found for this service.'
        };
      }

      // Find a fundi with an available slot for the requested date and time
      const fundi = fundis.find(f =>
        Array.isArray(f.availability) &&
        f.availability.some(slot => slot.date === bookingData.date && slot.time === bookingData.time && slot.available)
      );

      if (!fundi) {
        return {
          success: false,
          message: 'No fundis available for the requested date and time.'
        };
      }

      // Double-check the slot is still available (prevent race condition)
      const slotAvailable = Array.isArray(fundi.availability) && fundi.availability.some(slot => slot.date === bookingData.date && slot.time === bookingData.time && slot.available);
      if (!slotAvailable) {
        return {
          success: false,
          message: 'Sorry, this slot was just booked by someone else. Please try another time.'
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
          location: bookingData.location || '',
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

      // Mark the slot as unavailable in the fundi's availability array
      const updatedAvailability = (fundi.availability || []).map((slot: any) =>
        slot.date === bookingData.date && slot.time === bookingData.time
          ? { ...slot, available: false }
          : slot
      );
      const { error: updateError } = await supabase
        .from('users')
        .update({ availability: updatedAvailability })
        .eq('id', fundi.id);
      if (updateError) {
        console.error('Error updating fundi availability:', updateError);
        // Not a blocker for booking, but should be logged
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