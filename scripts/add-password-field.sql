-- Add password field to users table for authentication
ALTER TABLE users ADD COLUMN IF NOT EXISTS password TEXT;

-- Add subscription fields that are referenced in the TypeScript types
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'free' CHECK (subscription_status IN ('free', 'active', 'expired', 'cancelled'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMP WITH TIME ZONE;

-- Create index for password field for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_password ON users(password);

-- Update existing users with a default password (for development)
-- In production, this should be handled differently
UPDATE users SET password = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' WHERE password IS NULL;
-- This is the bcrypt hash for 'password'

-- Add some test users with known passwords for development
INSERT INTO users (name, phone, email, role, password, is_verified) VALUES
('Demo Client', '+254700000001', 'client@demo.com', 'client', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', true),
('Demo Fundi', '+254700000002', 'fundi@demo.com', 'fundi', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', true)
ON CONFLICT (phone) DO NOTHING; 