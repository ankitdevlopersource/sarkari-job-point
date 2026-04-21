
import axios from 'axios';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'fallback-secret'; // Updated to match server.ts default
const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '1h' });

async function testDelete() {
  try {
    console.log('1. Creating a dummy blog...');
    const createRes = await axios.post('http://localhost:3000/api/admin/blogs', {
      title: 'Delete Test',
      content: 'Test content',
      category: 'Results',
      thumbnail: 'https://via.placeholder.com/150'
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const blogId = createRes.data.id;
    console.log('Created Blog ID:', blogId);

    console.log('2. Attempting to delete the dummy blog...');
    const deleteRes = await axios.delete(`http://localhost:3000/api/admin/blogs/${blogId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('Delete Response:', deleteRes.data);

  } catch (err: any) {
    console.error('Delete Test Failed:');
    if (err.response) {
      console.error('Status:', err.response.status);
      console.error('Data:', err.response.data);
    } else {
      console.error('Error:', err.message);
    }
  }
}

testDelete();
