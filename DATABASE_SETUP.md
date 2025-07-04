# Database Setup Guide

## Authentication Setup

The login system has been updated to use password-based authentication with JWT tokens. Follow these steps to set up the database:

### 1. Run Database Migration

You need to run the SQL migration script to add the password field to the users table. You can do this in your Supabase dashboard:

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `scripts/add-password-field.sql`
4. Execute the script

This will:
- Add a `password` field to the users table
- Add subscription fields that are referenced in the TypeScript types
- Create test users with known passwords for development
- Set default passwords for existing users

### 2. Environment Variables

Make sure you have the following environment variables set in your `.env.local` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here

# Other variables as needed...
```

### 3. Test Users

After running the migration, you'll have these test users available:

**Demo Client:**
- Email: `client@demo.com`
- Password: `password`

**Demo Fundi:**
- Email: `fundi@demo.com`
- Password: `password`

**Admin User:**
- Email: `admin@fundilink.co.ke`
- Password: `password`

### 4. Testing the Login

1. Start your development server: `pnpm dev`
2. Navigate to `/login`
3. Try logging in with the demo credentials above
4. The login should now work and redirect you to the appropriate dashboard

### 5. Registration

The registration system is also updated to:
- Hash passwords using bcrypt
- Generate JWT tokens
- Store user data in the database

### Security Notes

- In production, change the default passwords
- Use a strong JWT_SECRET
- Consider implementing rate limiting
- Add email verification for new registrations
- Implement password reset functionality

### Troubleshooting

If you encounter issues:

1. Check that the migration script ran successfully
2. Verify all environment variables are set
3. Check the browser console and server logs for errors
4. Ensure the Supabase connection is working
5. Verify the JWT_SECRET is properly set 