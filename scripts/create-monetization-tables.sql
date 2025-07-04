-- Create subscription plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price_weekly DECIMAL(10,2) NOT NULL,
  price_monthly DECIMAL(10,2),
  features JSONB NOT NULL DEFAULT '[]',
  max_categories INTEGER DEFAULT 3,
  priority_listing BOOLEAN DEFAULT FALSE,
  verified_badge BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create fundi subscriptions table
CREATE TABLE IF NOT EXISTS fundi_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  fundi_id UUID REFERENCES users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES subscription_plans(id),
  status TEXT NOT NULL CHECK (status IN ('active', 'expired', 'cancelled', 'pending')) DEFAULT 'pending',
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE,
  amount_paid DECIMAL(10,2),
  payment_method TEXT DEFAULT 'mpesa',
  mpesa_transaction_id TEXT,
  auto_renew BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create commission tracking table
CREATE TABLE IF NOT EXISTS commissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  fundi_id UUID REFERENCES users(id),
  client_id TEXT NOT NULL,
  booking_amount DECIMAL(10,2) NOT NULL,
  commission_rate DECIMAL(5,2) NOT NULL DEFAULT 10.00, -- 10% default
  commission_amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'collected', 'waived')) DEFAULT 'pending',
  collected_at TIMESTAMP WITH TIME ZONE,
  mpesa_transaction_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payment transactions table
CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('subscription', 'commission', 'booking_payment', 'refund')),
  reference_id UUID, -- booking_id, subscription_id, etc.
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'KES',
  payment_method TEXT NOT NULL CHECK (payment_method IN ('mpesa', 'card', 'bank')),
  mpesa_phone TEXT,
  mpesa_transaction_id TEXT,
  mpesa_receipt_number TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')) DEFAULT 'pending',
  callback_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create leads tracking table
CREATE TABLE IF NOT EXISTS leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  fundi_id UUID REFERENCES users(id),
  client_phone TEXT NOT NULL,
  client_name TEXT,
  service_category TEXT NOT NULL,
  location TEXT,
  lead_source TEXT DEFAULT 'whatsapp', -- whatsapp, web, referral
  status TEXT NOT NULL CHECK (status IN ('new', 'contacted', 'converted', 'lost')) DEFAULT 'new',
  converted_booking_id UUID REFERENCES bookings(id),
  lead_fee DECIMAL(10,2) DEFAULT 20.00, -- KES 20 per lead
  charged BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default subscription plans
INSERT INTO subscription_plans (name, description, price_weekly, price_monthly, features, max_categories, priority_listing, verified_badge) VALUES
('Basic', 'Get started with basic listing', 50.00, 180.00, '["Basic listing", "Up to 2 service categories", "WhatsApp notifications"]', 2, FALSE, FALSE),
('Standard', 'Most popular for growing fundis', 100.00, 350.00, '["Priority listing", "Up to 4 service categories", "Verified badge", "Customer reviews", "Analytics"]', 4, TRUE, TRUE),
('Premium', 'For established professionals', 200.00, 700.00, '["Top priority listing", "Unlimited categories", "Verified badge", "Premium support", "Advanced analytics", "Featured placement"]', 10, TRUE, TRUE);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_fundi_subscriptions_fundi_id ON fundi_subscriptions(fundi_id);
CREATE INDEX IF NOT EXISTS idx_fundi_subscriptions_status ON fundi_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_commissions_booking_id ON commissions(booking_id);
CREATE INDEX IF NOT EXISTS idx_commissions_fundi_id ON commissions(fundi_id);
CREATE INDEX IF NOT EXISTS idx_commissions_status ON commissions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_leads_fundi_id ON leads(fundi_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);

-- Enable RLS
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE fundi_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can read subscription plans" ON subscription_plans FOR SELECT USING (is_active = true);

CREATE POLICY "Fundis can read own subscriptions" ON fundi_subscriptions
  FOR SELECT USING (fundi_id::text = auth.uid()::text);

CREATE POLICY "Fundis can read own commissions" ON commissions
  FOR SELECT USING (fundi_id::text = auth.uid()::text);

CREATE POLICY "Users can read own transactions" ON payment_transactions
  FOR SELECT USING (user_id::text = auth.uid()::text);

CREATE POLICY "Fundis can read own leads" ON leads
  FOR SELECT USING (fundi_id::text = auth.uid()::text);

-- Service role policies
CREATE POLICY "Service role full access plans" ON subscription_plans FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access subscriptions" ON fundi_subscriptions FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access commissions" ON commissions FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access transactions" ON payment_transactions FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access leads" ON leads FOR ALL USING (auth.role() = 'service_role');

-- Add subscription status to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'free' CHECK (subscription_status IN ('free', 'active', 'expired', 'cancelled'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMP WITH TIME ZONE;

-- Add pricing to bookings table
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS quoted_price DECIMAL(10,2);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS final_price DECIMAL(10,2);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded'));
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_transaction_id UUID REFERENCES payment_transactions(id);

-- Create triggers for updated_at
CREATE TRIGGER update_fundi_subscriptions_updated_at BEFORE UPDATE ON fundi_subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_transactions_updated_at BEFORE UPDATE ON payment_transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
