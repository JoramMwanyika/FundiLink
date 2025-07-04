const fetch = require('node-fetch');

async function testChatbot() {
  try {
    console.log('Testing chatbot API...');
    
    const response = await fetch('http://localhost:3000/api/chatbot', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'I need a plumber in Westlands, Nairobi'
      })
    });

    const data = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('✅ Chatbot is working!');
      console.log('AI Response:', data.response);
    } else {
      console.log('❌ Chatbot failed:', data.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testChatbot(); 