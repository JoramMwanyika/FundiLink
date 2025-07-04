# FundiLink

[Live Site: https://fundilink254.netlify.app](https://fundilink254.netlify.app)

FundiLink is an AI-powered platform that connects clients with verified technicians ("fundis") for a wide range of services (plumbing, electrical, cleaning, carpentry, and more). The app features:

- Modern, mobile-friendly UI/UX
- Secure registration and login with JWT authentication
- AI chatbot for service discovery and booking (OpenRouter integration)
- Booking system with fundi search and appointment scheduling
- WhatsApp integration (via WhatsApp Cloud API)
- Admin dashboard for user management
- Payment integration (demo)

---

## Features

- **User Roles:** Client, Fundi, Admin
- **Authentication:** JWT-based, password hashed with bcrypt
- **Chatbot:** AI assistant helps users find and book fundis
- **Booking:** Multi-step booking form, fundi selection, and payment
- **Admin:** Manage users, verify fundis, view bookings
- **WhatsApp:** Receive and respond to messages via WhatsApp Cloud API

---

## Getting Started (Local Setup)

### 1. **Clone the Repository**
```bash
git clone https://github.com/JoramMwanyika/FundiLink.git
cd FundiLink
```

### 2. **Install Dependencies**
```bash
pnpm install
# or
yarn install
# or
npm install
```

### 3. **Set Up Environment Variables**
Copy the template and fill in your values:
```bash
cp env.template .env.local
```
Edit `.env.local` and set:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
JWT_SECRET=your_jwt_secret_key
OPENROUTER_API_KEY=your_openrouter_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your-whatsapp-verify-token
```

### 4. **Set Up the Database**
- Create a [Supabase](https://supabase.com/) project.
- Run the SQL scripts in `/scripts` (especially `add-password-field.sql` and `create-tables.sql`) using the Supabase SQL editor.
- Add test users if needed (see `DATABASE_SETUP.md`).

### 5. **Run Migrations (Optional)**
```bash
node scripts/run-migration-simple.js
```

### 6. **Start the Development Server**
```bash
pnpm dev
# or
yarn dev
# or
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000)

---

## WhatsApp Cloud API Setup (Optional)
1. Create a Facebook Developer App and add the WhatsApp product.
2. Get a test phone number and access token.
3. Set up your webhook endpoint (e.g., `/api/whatsapp/webhook`).
4. Add your webhook URL and verify token in the Facebook Developer Console.
5. See [Meta's WhatsApp Cloud API docs](https://developers.facebook.com/docs/whatsapp/cloud-api) for details.

---

## Project Structure
- `app/` — Next.js app directory (pages, API routes)
- `components/` — Reusable UI components
- `lib/` — Utility libraries (auth, AI, Supabase, etc.)
- `scripts/` — Database setup and migration scripts
- `public/` — Static assets
- `styles/` — Global styles (Tailwind CSS)

---

## Demo Accounts (after migration)
- **Client:** client@demo.com / password
- **Fundi:** fundi@demo.com / password
- **Admin:** admin@fundilink.co.ke / password

---

## Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## License
[MIT](LICENSE) 