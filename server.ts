import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import cron from 'node-cron';
import admin from 'firebase-admin';
import { getFirestore as getAdminFirestore } from 'firebase-admin/firestore';
import { initializeApp as initializeClientApp } from 'firebase/app';
import { getFirestore as getClientFirestore, collection, getDocs, query, limit, where, orderBy, doc, getDoc, updateDoc, increment, addDoc, serverTimestamp, setDoc, deleteDoc } from 'firebase/firestore/lite';
import axios from 'axios';
import * as cheerio from 'cheerio';
import dotenv from 'dotenv';

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

dotenv.config();

// Explicitly set the project ID for Google SDKs to prevent it from defaulting to the container's project
import firebaseConfig from './firebase-applet-config.json' with { type: 'json' };
process.env.GOOGLE_CLOUD_PROJECT = firebaseConfig.projectId;

// Suppress gRPC idle stream warnings which are common in Node.js environments
process.env.GRPC_VERBOSITY = 'ERROR';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// Middleware to verify JWT
const authenticateAdmin = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      res.status(401).json({ error: 'Token expired. Please login again.' });
    } else {
      res.status(401).json({ error: 'Invalid token' });
    }
  }
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin
try {
  if (!admin.apps.length) {
    admin.initializeApp();
    console.log('Firebase Admin initialized automatically');
  }
} catch (e) {
  console.error('Firebase Admin initialization failed:', e);
  // Fallback if auto-init fails
  try {
     admin.initializeApp({
       projectId: firebaseConfig.projectId
     });
  } catch (e2) {
     console.error('Firebase Admin fallback failed:', e2);
  }
}

// Use Admin SDK for Firestore - it's more reliable on the server for writes
let firestore: admin.firestore.Firestore;
try {
  if (firebaseConfig.firestoreDatabaseId) {
    // Modern way to initialize for named database
    firestore = getAdminFirestore(firebaseConfig.firestoreDatabaseId);
    console.log('Firestore Admin initialized for named database:', firebaseConfig.firestoreDatabaseId);
  } else {
    firestore = getAdminFirestore();
    console.log('Firestore Admin initialized for default database');
  }
} catch (e) {
  console.error('Firestore Admin initialization failed, falling back to basic getFirestore:', e);
  firestore = getAdminFirestore();
}

// Client SDK for reads and public writes
const clientApp = initializeClientApp(firebaseConfig);
const clientDb = getClientFirestore(clientApp, firebaseConfig.firestoreDatabaseId);

// Helper to convert Admin Firestore data to client-friendly format
const formatDoc = (doc: admin.firestore.DocumentSnapshot) => {
  const data = doc.data();
  if (!data) return null;
  
  // Recursively handle timestamps and other complex types if needed
  const cleanData = JSON.parse(JSON.stringify(data, (key, value) => {
    if (value && typeof value === 'object' && value._seconds !== undefined) {
      return { seconds: value._seconds, nanoseconds: value._nanoseconds };
    }
    return value;
  }));

  return {
    id: doc.id,
    ...cleanData
  };
};

// Helper to convert Client Firestore data
const formatClientDoc = (doc: any) => {
  const data = doc.data();
  if (!data) return null;
  return {
    id: doc.id,
    ...data
  };
};

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 10000;
  const siteUrl = process.env.APP_URL || `http://localhost:${PORT}`;

  app.use(express.json());
  app.use(helmet({
    contentSecurityPolicy: false, // Disable for Vite dev
  }));

  // --- API Routes ---

  // Get all published blogs
  // Debug Firestore
  app.get('/api/debug/firestore', async (req, res) => {
    const results: any = {};
    
    try {
      const namedDb = getAdminFirestore(firebaseConfig.firestoreDatabaseId);
      const snapshot = await namedDb.collection('blogs').limit(1).get();
      results.namedDb = { success: true, count: snapshot.size };
    } catch (e: any) {
      results.namedDb = { success: false, error: e.message, code: e.code };
    }

    try {
      const defaultDb = getAdminFirestore();
      const snapshot = await defaultDb.collection('blogs').limit(1).get();
      results.defaultDb = { success: true, count: snapshot.size };
    } catch (e: any) {
      results.defaultDb = { success: false, error: e.message, code: e.code };
    }

    res.json(results);
  });

  // Admin SDK is removed for Firestore due to IAM issues.
  // We use Client SDK with API key for all database operations.

  // --- Settings & Ads ---

  // Get Hero Settings
  app.get('/api/settings/hero', async (req, res) => {
    try {
      const docRef = doc(clientDb, 'settings', 'admin');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        res.json({ heroBgImage: docSnap.data().heroBgImage });
      } else {
        res.json({ heroBgImage: null });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch settings' });
    }
  });

  // Update Hero Settings (Admin)
  app.put('/api/admin/settings/hero', authenticateAdmin, async (req, res) => {
    try {
      const { heroBgImage } = req.body;
      const docRef = doc(clientDb, 'settings', 'admin');
      await setDoc(docRef, { heroBgImage }, { merge: true });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update settings' });
    }
  });

  // Get Social Links (Public)
  app.get('/api/settings/social', async (req, res) => {
    try {
      const docRef = doc(clientDb, 'settings', 'social');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        res.json(docSnap.data());
      } else {
        res.json({ whatsapp: '', telegram: '' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch social links' });
    }
  });

  // Update Social Links (Admin)
  app.put('/api/admin/settings/social', authenticateAdmin, async (req, res) => {
    try {
      const { whatsapp, telegram } = req.body;
      const docRef = doc(clientDb, 'settings', 'social');
      await setDoc(docRef, { whatsapp, telegram }, { merge: true });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update social links' });
    }
  });

  // Get Active Ads (Public)
  app.get('/api/ads/active', async (req, res) => {
    try {
      const { location } = req.query; // 'home' or 'blog'
      const adsRef = collection(clientDb, 'ads');
      const q = query(
        adsRef, 
        where('isActive', '==', true),
        where(location === 'home' ? 'showOnHome' : 'showOnBlog', '==', true)
      );
      const snapshot = await getDocs(q);
      const ads = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(ads);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch ads' });
    }
  });

  // Ad Management (Admin)
  app.get('/api/admin/ads', authenticateAdmin, async (req, res) => {
    try {
      const q = collection(clientDb, 'ads');
      const snapshot = await getDocs(q);
      const ads = snapshot.docs.map(doc => formatClientDoc(doc)).filter(a => a !== null);
      res.json(ads);
    } catch (error) {
      console.error('Error fetching ads with Client SDK:', error);
      res.status(500).json({ error: 'Failed to fetch ads' });
    }
  });

  app.post('/api/admin/ads', authenticateAdmin, async (req, res) => {
    try {
      const adData = req.body;
      const docRef = await addDoc(collection(clientDb, 'ads'), {
        ...adData,
        createdAt: serverTimestamp()
      });
      res.json({ id: docRef.id, ...adData });
    } catch (error) {
      console.error('Error creating ad with Client SDK:', error);
      res.status(500).json({ error: 'Failed to create ad' });
    }
  });

  app.put('/api/admin/ads/:id', authenticateAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const adRef = doc(clientDb, 'ads', id);
      await updateDoc(adRef, req.body);
      res.json({ success: true });
    } catch (error) {
      console.error('Error updating ad with Client SDK:', error);
      res.status(500).json({ error: 'Failed to update ad' });
    }
  });

  app.delete('/api/admin/ads/:id', authenticateAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      console.log(`Deleting ad with ID: ${id}`);
      const adRef = doc(clientDb, 'ads', id);
      await deleteDoc(adRef);
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting ad with Client SDK:', error);
      res.status(500).json({ error: 'Failed to delete ad' });
    }
  });

  // --- Static Pages ---
  app.get('/api/pages', async (req, res) => {
    try {
      const q = collection(clientDb, 'pages');
      const snapshot = await getDocs(q);
      const pages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(pages);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch pages' });
    }
  });

  app.get('/api/pages/:id', async (req, res) => {
    try {
      const docRef = doc(clientDb, 'pages', req.params.id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        res.json({ id: docSnap.id, ...docSnap.data() });
      } else {
        res.status(404).json({ error: 'Page not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch page' });
    }
  });

  app.put('/api/admin/pages/:id', authenticateAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const pageData = req.body;
      const pageRef = doc(clientDb, 'pages', id);
      await setDoc(pageRef, {
        ...pageData,
        updatedAt: serverTimestamp()
      }, { merge: true });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update page' });
    }
  });

  app.get('/api/blogs', async (req, res) => {
    try {
      const q = query(
        collection(clientDb, 'blogs'),
        where('isPublished', '==', true),
        orderBy('createdAt', 'desc'),
        limit(20)
      );
      const snapshot = await getDocs(q);
      const blogs = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt ? { seconds: data.createdAt.seconds, nanoseconds: data.createdAt.nanoseconds } : null,
          updatedAt: data.updatedAt ? { seconds: data.updatedAt.seconds, nanoseconds: data.updatedAt.nanoseconds } : null,
        };
      });
      res.json(blogs);
    } catch (error: any) {
      console.error('Error fetching blogs with Client SDK:', error);
      res.status(500).json({ 
        error: 'Failed to fetch blogs', 
        details: error.message
      });
    }
  });

  // Get single blog by slug
  app.get('/api/blogs/:slug', async (req, res) => {
    try {
      const q = query(
        collection(clientDb, 'blogs'),
        where('slug', '==', req.params.slug),
        limit(1)
      );
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        return res.status(404).json({ error: 'Blog not found' });
      }
      
      const docSnap = snapshot.docs[0];
      const data = docSnap.data();
      res.json({
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt ? { seconds: data.createdAt.seconds, nanoseconds: data.createdAt.nanoseconds } : null,
        updatedAt: data.updatedAt ? { seconds: data.updatedAt.seconds, nanoseconds: data.updatedAt.nanoseconds } : null,
      });
    } catch (error: any) {
      console.error('Error fetching blog with Client SDK:', error);
      res.status(500).json({ error: 'Failed to fetch blog', details: error.message });
    }
  });

  // Increment view count
  app.post('/api/blogs/:id/view', async (req, res) => {
    try {
      const { id } = req.params;
      const blogRef = doc(clientDb, 'blogs', id);
      await updateDoc(blogRef, {
        views: increment(1)
      });
      res.json({ success: true });
    } catch (error: any) {
      console.error('Error incrementing views with Client SDK:', error);
      res.status(500).json({ error: 'Failed to increment view count', details: error.message });
    }
  });

  // User Subscription
  app.post('/api/subscribe', async (req, res) => {
    try {
      const { email, fcmToken } = req.body;
      if (!email) return res.status(400).json({ error: 'Email is required' });

      // Use Client SDK with API KEY because Admin SDK lacks permission in this environment
      const q = query(collection(clientDb, 'subscribers'), where('email', '==', email), limit(1));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const docRef = snapshot.docs[0].ref;
        await updateDoc(docRef, {
          fcmToken: fcmToken || null,
          updatedAt: serverTimestamp()
        });
      } else {
        await addDoc(collection(clientDb, 'subscribers'), {
          email,
          fcmToken: fcmToken || null,
          subscribedAt: serverTimestamp()
        });
      }
      res.json({ message: 'Subscribed successfully' });
    } catch (error: any) {
      console.error('Error subscribing with Client SDK:', error);
      res.status(500).json({ error: 'Subscription failed', details: error.message });
    }
  });

  // Admin Login
  app.post('/api/admin/login', async (req, res) => {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) {
      const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
      return res.json({ token });
    }
    res.status(401).json({ error: 'Invalid password' });
  });

  // Get all subscribers (Admin only)
  app.get('/api/admin/subscribers', authenticateAdmin, async (req, res) => {
    try {
      const q = collection(clientDb, 'subscribers');
      const snapshot = await getDocs(q);
      const subscribers = snapshot.docs
        .map(doc => formatClientDoc(doc))
        .filter(s => s !== null)
        .sort((a, b) => {
          const timeA = a.subscribedAt?.seconds || 0;
          const timeB = b.subscribedAt?.seconds || 0;
          return timeB - timeA;
        });
      
      console.log(`Fetched ${subscribers.length} subscribers with Client SDK`);
      res.json(subscribers);
    } catch (error) {
      console.error('Error fetching subscribers with Client SDK:', error);
      res.status(500).json({ error: 'Failed to fetch subscribers' });
    }
  });

  // Create a blog post manually (Admin only)
  app.post('/api/admin/blogs', authenticateAdmin, async (req, res) => {
    try {
      const blogData = req.body;
      const slug = blogData.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
      const blogPost = {
        ...blogData,
        slug,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        views: 0,
        isPublished: true,
        thumbnail: blogData.thumbnail || `https://picsum.photos/seed/${slug}/800/450`
      };
      const docRef = await addDoc(collection(clientDb, 'blogs'), blogPost);
      
      // Send notifications
      sendNotifications(
        `New Blog: ${blogPost.title}`,
        blogData.content.substring(0, 100) + '...',
        slug
      );

      res.json({ id: docRef.id, ...blogPost });
    } catch (error) {
      console.error('Error creating blog with Client SDK:', error);
      res.status(500).json({ error: 'Failed to create blog post' });
    }
  });

  // Update a blog post (Admin only)
  app.put('/api/admin/blogs/:id', authenticateAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const blogData = req.body;
      const blogRef = doc(clientDb, 'blogs', id);
      const updateData = {
        ...blogData,
        updatedAt: serverTimestamp()
      };
      await updateDoc(blogRef, updateData);
      res.json({ message: 'Post updated successfully' });
    } catch (error) {
      console.error('Error updating blog with Client SDK:', error);
      res.status(500).json({ error: 'Failed to update post' });
    }
  });

  // Delete a blog post (Admin only)
  app.delete('/api/admin/blogs/:id', authenticateAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      console.log(`Deleting blog with ID: ${id}`);
      const blogRef = doc(clientDb, 'blogs', id);
      await deleteDoc(blogRef);
      res.json({ message: 'Post deleted successfully' });
    } catch (error) {
      console.error('Error deleting blog with Client SDK:', error);
      res.status(500).json({ error: 'Failed to delete post' });
    }
  });

  // --- SEO Endpoints ---
  app.get('/robots.txt', (req, res) => {
    const robots = `User-agent: *
Allow: /
Disallow: /avm-admin
Sitemap: ${siteUrl}/sitemap.xml
`;
    res.type('text/plain');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(robots);
  });

  app.get('/sitemap.xml', async (req, res) => {
    try {
      const staticPages = [
        '/',
        '/latest-jobs',
        '/results',
        '/admit-cards',
        '/syllabus',
        '/notifications',
        '/about',
        '/contact',
        '/privacy-policy',
        '/disclaimer',
      ];

      const blogSnapshot = await getDocs(
        query(
          collection(clientDb, 'blogs'),
          where('isPublished', '==', true),
          orderBy('createdAt', 'desc'),
          limit(1000)
        )
      );

      const urls = staticPages.map((path) => ({
        loc: `${siteUrl}${path}`,
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: 'daily',
        priority: path === '/' ? '1.0' : '0.8',
      }));

      blogSnapshot.docs.forEach((doc) => {
        const data = doc.data();
        if (!data?.slug) return;
        const lastmod = data.updatedAt?.seconds
          ? new Date(data.updatedAt.seconds * 1000).toISOString().split('T')[0]
          : data.createdAt?.seconds
            ? new Date(data.createdAt.seconds * 1000).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0];

        urls.push({
          loc: `${siteUrl}/blog/${data.slug}`,
          lastmod,
          changefreq: 'weekly',
          priority: '0.7',
        });
      });

      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
        .map(
          (url) => `  <url>\n    <loc>${url.loc}</loc>\n    <lastmod>${url.lastmod}</lastmod>\n    <changefreq>${url.changefreq}</changefreq>\n    <priority>${url.priority}</priority>\n  </url>`
        )
        .join('\n')}
</urlset>`;

      res.type('application/xml');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.send(sitemap);
    } catch (error) {
      console.error('Failed to generate sitemap:', error);
      res.status(500).send('Unable to generate sitemap at this time.');
    }
  });

  // --- Vite Setup ---

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath, { maxAge: '1d' }));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  getDocs(query(collection(clientDb, 'blogs'), limit(1)))
    .then(() => console.log('Firestore connectivity verified via Client SDK'))
    .catch(err => console.error('Firestore connectivity check failed:', err.message));

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

async function sendNotifications(title: string, body: string, slug: string) {
  try {
    // We use Client SDK to fetch tokens because Admin SDK fails in this env
    const snapshot = await getDocs(collection(clientDb, 'subscribers'));
    const tokens = snapshot.docs
      .map(doc => doc.data().fcmToken)
      .filter(token => !!token);
    
    if (tokens.length === 0) {
      console.log('No FCM tokens found to send notifications');
      return;
    }

    const message = {
      notification: {
        title: title,
        body: body,
      },
      data: {
        slug: slug,
      },
      tokens: tokens,
      webpush: {
        fcmOptions: {
          link: `${process.env.APP_URL}/blog/${slug}`
        }
      }
    };

    const response = await admin.messaging().sendEachForMulticast(message);
    console.log(`${response.successCount} notifications sent successfully`);
  } catch (error) {
    console.error('Error sending notifications:', error);
  }
}

startServer();
