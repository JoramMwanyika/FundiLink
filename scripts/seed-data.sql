-- Insert sample admin user
INSERT INTO users (name, phone, email, role, is_verified) VALUES
('Admin User', '+254700000000', 'admin@fundilink.co.ke', 'admin', true);

-- Insert sample fundis
INSERT INTO users (name, phone, email, role, categories, location, rating, is_verified) VALUES
('John Mwangi', '+254701234567', 'john@example.com', 'fundi', ARRAY['plumber', 'general'], 'Westlands, Nairobi', 4.8, true),
('Mary Wanjiku', '+254702345678', 'mary@example.com', 'fundi', ARRAY['electrician'], 'Kilimani, Nairobi', 4.9, true),
('Peter Ochieng', '+254703456789', 'peter@example.com', 'fundi', ARRAY['mechanic'], 'Industrial Area, Nairobi', 4.7, true),
('Grace Akinyi', '+254704567890', 'grace@example.com', 'fundi', ARRAY['cleaner'], 'Karen, Nairobi', 4.6, true),
('David Kiprop', '+254705678901', 'david@example.com', 'fundi', ARRAY['carpenter', 'general'], 'Kasarani, Nairobi', 4.5, true);

-- Insert sample clients
INSERT INTO users (name, phone, email, role, location, is_verified) VALUES
('Alice Njeri', '+254706789012', 'alice@example.com', 'client', 'Kileleshwa, Nairobi', true),
('Robert Kamau', '+254707890123', 'robert@example.com', 'client', 'Lavington, Nairobi', true);

-- Insert sample bookings
INSERT INTO bookings (client_id, fundi_id, client_name, fundi_name, service_category, location, date, time, status, description) VALUES
('guest', (SELECT id FROM users WHERE phone = '+254701234567'), 'Alice Njeri', 'John Mwangi', 'plumber', 'Kileleshwa, Nairobi', '2024-12-31', '10:00', 'confirmed', 'Fix leaking kitchen tap'),
('guest', (SELECT id FROM users WHERE phone = '+254702345678'), 'Robert Kamau', 'Mary Wanjiku', 'electrician', 'Lavington, Nairobi', '2025-01-02', '14:00', 'pending', 'Install new lighting in living room'),
('guest', (SELECT id FROM users WHERE phone = '+254704567890'), 'Alice Njeri', 'Grace Akinyi', 'cleaner', 'Kileleshwa, Nairobi', '2024-12-28', '09:00', 'completed', 'Deep cleaning of 3-bedroom apartment');
