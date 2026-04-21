
import admin from 'firebase-admin';
import fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
process.env.GOOGLE_CLOUD_PROJECT = firebaseConfig.projectId;

if (!admin.apps.length) {
  admin.initializeApp();
}

async function testAuth() {
  try {
    console.log('Testing Admin Auth (create user)...');
    const user = await admin.auth().createUser({
      email: 'admin_server@example.com',
      password: 'temporary_password_123'
    });
    console.log('Success! Created user:', user.uid);
  } catch (err: any) {
    if (err.code === 'auth/email-already-exists') {
      console.log('User already exists, that counts as success for Admin SDK Auth access.');
    } else {
      console.error('Admin Auth Test Failed:', err.message);
    }
  }
}

testAuth();
