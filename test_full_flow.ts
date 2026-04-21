
import axios from 'axios';

const ADMIN_PASSWORD = 'admin123'; // Default from server.ts

async function testRealDelete() {
  try {
    console.log('1. Logging in to get a real token...');
    const loginRes = await axios.post('http://localhost:3000/api/admin/login', {
      password: ADMIN_PASSWORD
    });
    const token = loginRes.data.token;
    console.log('Token obtained.');

    console.log('2. Creating a dummy blog...');
    const createRes = await axios.post('http://localhost:3000/api/admin/blogs', {
      title: 'Delete Test ' + Date.now(),
      content: 'Test content',
      category: 'Results',
      thumbnail: 'https://via.placeholder.com/150'
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const blogId = createRes.data.id;
    console.log('Created Blog ID:', blogId);

    console.log('3. Attempting to delete the dummy blog...');
    const deleteRes = await axios.delete(`http://localhost:3000/api/admin/blogs/${blogId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('Delete Response:', deleteRes.data);

  } catch (err: any) {
    console.error('Test Failed:');
    if (err.response) {
      console.error('Status:', err.response.status);
      console.error('Data:', err.response.data);
    } else {
      console.error('Error:', err.message);
    }
  }
}

testRealDelete();
