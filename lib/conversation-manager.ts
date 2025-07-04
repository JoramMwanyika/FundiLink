interface ConversationState {
  stage: "initial" | "booking_details" | "fundi_selection" | "confirmation" | "cancellation_confirmation"
  bookingData: {
    service?: string
    date?: string
    time?: string
    location?: string
    missing?: string[]
  }
  availableFundis?: any[]
  lastMessage?: string
  messageCount: number
  createdAt: Date
}

export class ConversationManager {
  private static conversations = new Map<string, ConversationState>()

  static getContext(phoneNumber: string): ConversationState {
    const existing = this.conversations.get(phoneNumber)
    if (existing) {
      return existing
    }

    const newContext: ConversationState = {
      stage: "initial",
      bookingData: {},
      messageCount: 0,
      createdAt: new Date(),
    }

    this.conversations.set(phoneNumber, newContext)
    return newContext
  }

  static updateContext(phoneNumber: string, updates: Partial<ConversationState>) {
    const context = this.getContext(phoneNumber)
    const updatedContext = { ...context, ...updates, messageCount: context.messageCount + 1 }
    this.conversations.set(phoneNumber, updatedContext)
    return updatedContext
  }

  static clearContext(phoneNumber: string) {
    this.conversations.delete(phoneNumber)
  }

  static isContextExpired(phoneNumber: string, maxAgeMinutes = 30): boolean {
    const context = this.conversations.get(phoneNumber)
    if (!context) return true

    const ageMinutes = (Date.now() - context.createdAt.getTime()) / (1000 * 60)
    return ageMinutes > maxAgeMinutes
  }

  static cleanupExpiredContexts(maxAgeMinutes = 30) {
    for (const [phoneNumber, context] of this.conversations.entries()) {
      if (this.isContextExpired(phoneNumber, maxAgeMinutes)) {
        this.conversations.delete(phoneNumber)
      }
    }
  }
}
