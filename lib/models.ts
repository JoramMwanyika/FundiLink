export interface User {
  id?: string
  name: string
  phone: string
  email?: string
  role: "client" | "fundi" | "admin"
  categories?: string[]
  location?: string
  availability?: AvailabilitySlot[]
  rating?: number
  is_verified?: boolean
  created_at?: string
  updated_at?: string
}

export interface AvailabilitySlot {
  date: string
  time: string
  available: boolean
}

export interface Booking {
  id?: string
  client_id: string
  fundi_id: string
  client_name: string
  fundi_name: string
  service_category: string
  location: string
  date: string
  time: string
  status: "pending" | "confirmed" | "completed" | "cancelled"
  description?: string
  price?: number
  created_at?: string
  updated_at?: string
}

export interface ServiceCategory {
  id: string
  name: string
  description: string
  icon: string
  examples: string[]
}

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    id: "mechanic",
    name: "Mechanic",
    description: "Car repairs and maintenance",
    icon: "🔧",
    examples: ["Engine diagnostics", "Oil change", "Car service", "Brake repair"],
  },
  {
    id: "plumber",
    name: "Plumber",
    description: "Water and plumbing services",
    icon: "🔧",
    examples: ["Tap repair", "Leak fixing", "Pipe installation", "Toilet repair"],
  },
  {
    id: "electrician",
    name: "Electrician",
    description: "Electrical installations and repairs",
    icon: "⚡",
    examples: ["Lighting installation", "Wiring", "Socket repair", "Electrical faults"],
  },
  {
    id: "internet",
    name: "Internet Services",
    description: "Internet and networking solutions",
    icon: "📡",
    examples: ["Router installation", "Cable setup", "WiFi configuration", "Network troubleshooting"],
  },
  {
    id: "carpenter",
    name: "Carpenter",
    description: "Wood work and furniture services",
    icon: "🔨",
    examples: ["Furniture repair", "Shelf installation", "Door repair", "Custom woodwork"],
  },
  {
    id: "cleaner",
    name: "Cleaner",
    description: "Cleaning services",
    icon: "🧹",
    examples: ["House cleaning", "Office cleaning", "Deep cleaning", "Move-in cleaning"],
  },
  {
    id: "general",
    name: "General Technician",
    description: "General maintenance and repairs",
    icon: "🛠️",
    examples: ["Masonry", "Painting", "Roofing", "General repairs"],
  },
]
