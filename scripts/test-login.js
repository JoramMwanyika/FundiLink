const fetch = require('node-fetch');

async function testLogin() {
  try {
    console.log('Testing login API...');
    
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'client@demo.com',
        password: 'password'
      })
    });

    const data = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('✅ Login successful!');
      console.log('User:', data.user.name);
      console.log('Role:', data.user.role);
    } else {
      console.log('❌ Login failed:', data.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testLogin(); 