import { Bell, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { auth, googleProvider, messaging, getToken } from '../lib/firebase';
import { signInWithPopup, onAuthStateChanged } from 'firebase/auth';

interface SidebarProps {
  blogs?: any[];
}

export default function Sidebar({ blogs = [] }: SidebarProps) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  const handleSubscribe = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    
    let emailToSubscribe = email;
    let fcmToken = null;

    try {
      // 1. Handle Email logic
      if (!emailToSubscribe) {
        if (user) {
          emailToSubscribe = user.email || '';
        } else {
          try {
            const result = await signInWithPopup(auth, googleProvider);
            emailToSubscribe = result.user.email || '';
          } catch (err) {
            console.error('Login failed', err);
            setLoading(false);
            return;
          }
        }
      }

      if (!emailToSubscribe) {
        setLoading(false);
        return;
      }

      // 2. Try to get FCM Token for notifications
      try {
        const msg = await messaging();
        if (msg) {
          // You need to set up VAPID key in Firebase Console -> Project Settings -> Cloud Messaging
          // For now we try to get it if possible
          fcmToken = await getToken(msg, {
            vapidKey: import.meta.env.VITE_VAPID_KEY
          });
        }
      } catch (err) {
        console.warn('FCM token registration failed, proceeding without push', err);
      }

      // 3. Send to backend
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: emailToSubscribe,
          fcmToken: fcmToken
        }),
      });

      if (res.ok) {
        setSubscribed(true);
        setEmail('');
      } else {
        const errData = await res.json();
        console.error('Subscription error:', errData.error);
      }
    } catch (error) {
      console.error('Subscription process failed', error);
    }
    setLoading(false);
  };

  const defaultUpdates = [
    "Bihar Teacher Vacancy 2024",
    "RRB Group D New Vacancy",
    "Delhi DSSSB Recruitment",
    "MPPSC 2024 Notification",
    "SSC CGL 2024 Exam Date",
  ];

  const displayUpdates = blogs.length > 0 
    ? blogs
        .filter(b => b.placement === 'Latest Updates' || !b.placement)
        .slice(0, 5)
        .map(b => ({ title: b.title, slug: b.slug }))
    : defaultUpdates.map(u => ({ title: u, slug: '#' }));

  return (
    <div className="w-full md:w-80 space-y-6">
      {/* Latest Updates */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider">Latest Updates</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {displayUpdates.map((update, i) => (
            <Link 
              key={i} 
              to={update.slug === '#' ? '/' : `/blog/${update.slug}`}
              className="px-4 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors group"
            >
              <div className="w-4 h-4 mt-0.5 bg-orange-500 rounded-sm flex-shrink-0" />
              <span className="text-sm font-bold text-gray-700 group-hover:text-red-600 line-clamp-2">
                {update.title}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Job Alerts Subscription */}
      <div className="bg-[#1e3a8a] rounded-lg p-6 text-center text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Bell size={80} />
        </div>
        
        <h3 className="text-3xl font-black mb-1 tracking-tighter italic">job Alerts</h3>
        <div className="flex justify-center gap-1 mb-4">
          {[1,2,3,4,5].map(i => <div key={i} className="w-1 h-1 bg-white rounded-full opacity-50" />)}
        </div>
        
        <p className="text-sm font-medium mb-6 leading-tight">
          Get Free Job Notifications<br />via Email & Push
        </p>
        
        {subscribed ? (
          <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 flex items-center gap-3 text-sm font-bold animate-in fade-in zoom-in duration-300">
            <CheckCircle2 size={20} className="text-green-400" />
            Subscribed Successfully!
          </div>
        ) : (
          <div className="space-y-3">
            <form onSubmit={handleSubscribe} className="space-y-3">
              <input 
                type="email" 
                placeholder="Enter your email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-full bg-white/10 border border-white/20 text-white placeholder:text-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
              />
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-full shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:scale-100"
              >
                {loading ? 'Subscribing...' : 'Subscribe for Free Alerts!'}
              </button>
            </form>
            <p className="text-[10px] text-white/50 italic">
              * Leave email blank to subscribe with Google account
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
