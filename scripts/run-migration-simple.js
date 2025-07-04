const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  try {
    console.log('Running database migration...');
    
    // Step 1: Add password column
    console.log('Adding password column to users table...');
    const { error: alterError } = await supabase.rpc('exec_sql', { 
      sql: 'ALTER TABLE users ADD COLUMN IF NOT EXISTS password TEXT;' 
    });
    
    if (alterError) {
      console.log('Note: Could not add password column via RPC, this might need to be done manually in Supabase dashboard');
      console.log('Please run this SQL in your Supabase SQL Editor:');
      console.log('ALTER TABLE users ADD COLUMN IF NOT EXISTS password TEXT;');
    } else {
      console.log('✓ Password column added');
    }

    // Step 2: Add subscription fields
    console.log('Adding subscription fields...');
    const { error: subStatusError } = await supabase.rpc('exec_sql', { 
      sql: 'ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT \'free\' CHECK (subscription_status IN (\'free\', \'active\', \'expired\', \'cancelled\'));' 
    });
    
    const { error: subDateError } = await supabase.rpc('exec_sql', { 
      sql: 'ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMP WITH TIME ZONE;' 
    });

    if (subStatusError || subDateError) {
      console.log('Note: Could not add subscription fields via RPC, please run these manually in Supabase dashboard:');
      console.log('ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT \'free\' CHECK (subscription_status IN (\'free\', \'active\', \'expired\', \'cancelled\'));');
      console.log('ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMP WITH TIME ZONE;');
    } else {
      console.log('✓ Subscription fields added');
    }

    // Step 3: Create test users with hashed passwords
    console.log('Creating test users...');
    
    // Hash for 'password'
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('password', 10);
    
    // Insert test users
    const testUsers = [
      {
        name: 'Demo Client',
        phone: '+254700000001',
        email: 'client@demo.com',
        role: 'client',
        password: hashedPassword,
        is_verified: true,
        subscription_status: 'active'
      },
      {
        name: 'Demo Fundi',
        phone: '+254700000002',
        email: 'fundi@demo.com',
        role: 'fundi',
        password: hashedPassword,
        is_verified: true,
        subscription_status: 'free'
      }
    ];

    for (const user of testUsers) {
      const { error: insertError } = await supabase
        .from('users')
        .upsert([user], { onConflict: 'phone' });
      
      if (insertError) {
        console.error(`Error inserting user ${user.email}:`, insertError);
      } else {
        console.log(`✓ Test user created: ${user.email}`);
      }
    }

    // Step 4: Update existing users with default password
    console.log('Updating existing users with default password...');
    const { error: updateError } = await supabase
      .from('users')
      .update({ password: hashedPassword })
      .is('password', null);

    if (updateError) {
      console.log('Note: Could not update existing users, this might need to be done manually');
    } else {
      console.log('✓ Existing users updated with default password');
    }

    console.log('');
    console.log('Migration completed!');
    console.log('');
    console.log('Test users available:');
    console.log('- client@demo.com (password: password)');
    console.log('- fundi@demo.com (password: password)');
    console.log('');
    console.log('If any steps failed, please run the SQL manually in your Supabase dashboard.');
    
  } catch (error) {
    console.error('Migration failed:', error);
    console.log('');
    console.log('Please run the SQL manually in your Supabase dashboard:');
    console.log('Copy the contents of scripts/add-password-field.sql and execute it.');
    process.exit(1);
  }
}

runMigration(); 