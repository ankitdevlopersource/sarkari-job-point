import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { LayoutDashboard, FileText, RefreshCw, LogOut, Plus, Trash2, Edit, Users, Settings, Megaphone, Upload, ImageIcon, X, Bold as BoldIcon, Link as LinkIcon, Type, Eye, Code } from 'lucide-react';

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", 
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", 
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", 
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", 
  "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", 
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", 
  "Ladakh", "Lakshadweep", "Puducherry", "India"
];

const CATEGORIES = [
  "Central Govt Jobs", "State Govt Jobs", "Bank Jobs", "SSC / UPSC", 
  "Results", "Admit Cards", "Syllabus", "Notifications"
];

const PLACEMENT_OPTIONS = [
  "Normal Jobs",
  "Trending Sarkari Jobs",
  "Latest Updates & News",
  "Latest Updates"
];

const PAGE_DEFAULTS: { [key: string]: any } = {
  'about': {
    title: 'ABOUT US',
    subtitle: 'Learn about Sarkari job point, your destination for latest govt job updates.',
    content: `Welcome to **Sarkari job point**, your number one source for all things related to Government Job updates. We're dedicated to providing you the very best of informational updates, with an emphasis on Latest Jobs, Results, Admit Cards, and Syllabus.

Founded in 2026, Sarkari job point has come a long way from its beginnings. Our passion for helping students and job seekers find reliable and fast information drove us to start this professional resource.

## Our Purpose
The primary goal of this website is to simplify the complex landscape of Indian Government examinations.`,
    metaTitle: 'About Us - Sarkari job point',
    metaDescription: 'Learn about Sarkari job point, your destination for latest govt job updates, sarkari result, and admit cards.'
  },
  'contact': {
    title: 'CONTACT US',
    subtitle: "Have questions or feedback? We'd love to hear from you.",
    content: 'contact@sarkarijobpoint.com',
    metaTitle: 'Contact Us - Sarkari job point',
    metaDescription: 'Get in touch with Sarkari job point. Support, inquiries, and feedback.'
  },
  'privacy-policy': {
    title: 'PRIVACY POLICY',
    subtitle: 'Information on data collection, cookies, and protection.',
    content: `At **Sarkari job point**, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by Sarkari job point and how we use it.

## Log Files
Sarkari job point follows a standard procedure of using log files. These files log visitors when they visit websites.

## Cookies and Web Beacons
Like any other website, Sarkari job point uses 'cookies'. These cookies are used to store information including visitors' preferences.`,
    metaTitle: 'Privacy Policy - Sarkari job point',
    metaDescription: 'Privacy Policy for Sarkari job point. Information on data collection, cookies, and protection.'
  },
  'disclaimer': {
    title: 'DISCLAIMER',
    subtitle: 'Information regarding government affiliation and accuracy.',
    content: `All the information on this website - https://sarkarijobpoint.com - is published in good faith and for general information purpose only. Sarkari job point does not make any warranties about the completeness, reliability and accuracy of this information.

## Not a Government Entity
**Sarkari job point is NOT a government organization and is not affiliated with any government body.** We are a private informational portal.`,
    metaTitle: 'Disclaimer - Sarkari job point',
    metaDescription: 'Disclaimer for Sarkari job point. Information regarding government affiliation and accuracy.'
  }
};

export default function Admin() {
  const navigate = useNavigate();
  const location = useLocation();
  const [token, setToken] = useState(localStorage.getItem('adminToken'));
  const [password, setPassword] = useState('');
  const [blogs, setBlogs] = useState<any[]>([]);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'subscribers' | 'ads' | 'settings' | 'pages'>('dashboard');
  const [ads, setAds] = useState<any[]>([]);
  const [pages, setPages] = useState<any[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string, type: 'blog' | 'ad' } | null>(null);
  const [heroBgImage, setHeroBgImage] = useState('');
  const [socialLinks, setSocialLinks] = useState({ whatsapp: '', telegram: '' });
  const [showAdModal, setShowAdModal] = useState(false);
  const [editingAdId, setEditingAdId] = useState<string | null>(null);
  const [newAd, setNewAd] = useState({
    imageUrl: '',
    linkUrl: '',
    showOnHome: true,
    showOnBlog: false,
    isActive: true
  });
  const [showPageModal, setShowPageModal] = useState(false);
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [newPage, setNewPage] = useState({
    title: '',
    subtitle: '',
    content: '',
    metaTitle: '',
    metaDescription: ''
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState<{ [key: string]: boolean }>({});
  const [editorTab, setEditorTab] = useState<'edit' | 'preview'>('edit');
  const [linkDialog, setLinkDialog] = useState<{ isOpen: boolean, type: 'general' | 'apply' | 'admit', url: string, start: number, end: number } | null>(null);
  const [colorSelection, setColorSelection] = useState<{ start: number, end: number } | null>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);

  const applyFormat = (prefix: string, suffix: string, defaultValue?: string, forcedStart?: number, forcedEnd?: number) => {
    const textarea = textAreaRef.current;
    if (!textarea) return;

    const start = forcedStart !== undefined ? forcedStart : textarea.selectionStart;
    const end = forcedEnd !== undefined ? forcedEnd : textarea.selectionEnd;
    const text = textarea.value;
    const selection = text.substring(start, end);

    // If nothing selected, use defaultValue if provided, else don't wrap
    const contentToWrap = selection || defaultValue || '';
    
    const newContent = text.substring(0, start) + prefix + contentToWrap + suffix + text.substring(end);
    
    setNewPost({ ...newPost, content: newContent });

    // Focus back and select the inner part
    setTimeout(() => {
      textarea.focus();
      const newStart = start + prefix.length;
      const newEnd = newStart + contentToWrap.length;
      textarea.setSelectionRange(newStart, newEnd);
    }, 50);
  };

  const openLinkDialog = (type: 'general' | 'apply' | 'admit') => {
    const textarea = textAreaRef.current;
    if (!textarea) return;
    setLinkDialog({
      isOpen: true,
      type,
      url: 'https://',
      start: textarea.selectionStart,
      end: textarea.selectionEnd
    });
  };

  const insertLink = () => {
    if (!linkDialog || !textAreaRef.current) return;
    
    const { start, end, url, type } = linkDialog;
    const textarea = textAreaRef.current;
    const text = textarea.value;
    const selection = text.substring(start, end);

    let defaultText = selection || (type === 'apply' ? 'Apply Online' : type === 'admit' ? 'Download Admit Card' : 'Link Text');
    const prefix = '[';
    const suffix = `](${url})`;
    
    const newContent = text.substring(0, start) + prefix + defaultText + suffix + text.substring(end);
    setNewPost({ ...newPost, content: newContent });
    setLinkDialog(null);

    setTimeout(() => {
      textarea.focus();
      const newStart = start + prefix.length;
      textarea.setSelectionRange(newStart, newStart + defaultText.length);
    }, 50);
  };
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newPost, setNewPost] = useState({
    title: '',
    category: CATEGORIES[0],
    content: '',
    state: 'India',
    thumbnail: '',
    placement: PLACEMENT_OPTIONS[0]
  });

  useEffect(() => {
    // Hidden Admin Protection Logic
    if (location.pathname === '/avm-admin/dashboard' && !token) {
      navigate('/avm-admin', { replace: true });
    }
    if (location.pathname === '/avm-admin' && token) {
      navigate('/avm-admin/dashboard', { replace: true });
    }

    if (token) {
      fetchBlogs();
      fetchSubscribers();
      fetchAds();
      fetchSettings();
      fetchPages();
    }
  }, [token, location.pathname, navigate]);

  const fetchPages = async () => {
    try {
      const res = await fetch('/api/pages');
      const data = await res.json();
      if (Array.isArray(data)) setPages(data);
    } catch (error) {
      console.error('Failed to fetch pages', error);
    }
  };

  const handleUpdatePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPageId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/pages/${editingPageId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(newPage),
      });
      if (res.ok) {
        setShowPageModal(false);
        setEditingPageId(null);
        fetchPages();
      }
    } catch (error) {
      alert('Failed to update page');
    }
    setLoading(false);
  };

  const fetchSettings = async () => {
    try {
      const heroRes = await fetch('/api/settings/hero');
      const heroData = await heroRes.json();
      setHeroBgImage(heroData.heroBgImage || '');

      const socialRes = await fetch('/api/settings/social');
      const socialData = await socialRes.json();
      setSocialLinks({
        whatsapp: socialData.whatsapp || '',
        telegram: socialData.telegram || ''
      });
    } catch (error) {
      console.error('Failed to fetch settings');
    }
  };

  const updateSettings = async () => {
    setLoading(true);
    try {
      await fetch('/api/admin/settings/hero', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ heroBgImage }),
      });
      alert('Hero settings updated');
    } catch (error) {
      alert('Failed to update hero settings');
    }
    setLoading(false);
  };

  const updateSocialLinks = async () => {
    setLoading(true);
    try {
      await fetch('/api/admin/settings/social', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(socialLinks),
      });
      alert('Social links updated');
    } catch (error) {
      alert('Failed to update social links');
    }
    setLoading(false);
  };

  const fetchAds = async () => {
    try {
      const res = await fetch('/api/admin/ads', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) setAds(data);
    } catch (error) {
      console.error('Failed to fetch ads', error);
    }
  };

  const handleCreateAd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = editingAdId ? `/api/admin/ads/${editingAdId}` : '/api/admin/ads';
      const method = editingAdId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(newAd),
      });
      if (res.ok) {
        setShowAdModal(false);
        setEditingAdId(null);
        setNewAd({ imageUrl: '', linkUrl: '', showOnHome: true, showOnBlog: false, isActive: true });
        fetchAds();
      }
    } catch (error) {
      alert('Failed to manage ad');
    }
    setLoading(false);
  };

  const toggleAdStatus = async (ad: any) => {
    try {
      const res = await fetch(`/api/admin/ads/${ad.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ ...ad, isActive: !ad.isActive }),
      });
      if (res.ok) {
        fetchAds();
      }
    } catch (error) {
      alert('Failed to update ad status');
    }
  };

  const deleteAd = async (id: string) => {
    console.log('Executing ad deletion for:', id);
    try {
      const res = await fetch(`/api/admin/ads/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        console.log('Ad deleted successfully');
        fetchAds();
      } else {
        const data = await res.json();
        console.error('Delete ad failed:', data.error);
        alert(data.error || 'Delete failed');
      }
    } catch (error) {
      console.error('Delete ad error:', error);
      alert('Deletion failed due to network error');
    }
  };

  const fetchBlogs = async () => {
    console.log('Fetching blogs...');
    try {
      const res = await fetch('/api/blogs');
      const data = await res.json();
      if (Array.isArray(data)) {
        setBlogs(data);
      } else {
        setBlogs([]);
      }
    } catch (error) {
      console.error('Fetch blogs failed', error);
      setBlogs([]);
    }
  };

  const fetchSubscribers = async () => {
    try {
      const res = await fetch('/api/admin/subscribers', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setSubscribers(data);
      }
    } catch (error) {
      console.error('Failed to fetch subscribers', error);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    if (data.token) {
      setToken(data.token);
      localStorage.setItem('adminToken', data.token);
      navigate('/avm-admin/dashboard', { replace: true });
    } else {
      alert('Invalid password');
    }
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('adminToken');
    navigate('/avm-admin', { replace: true });
  };

  const handleFileUpload = async (file: File) => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      console.error('Cloudinary Configuration Missing:', { cloudName, uploadPreset });
      throw new Error(`Cloudinary not configured! Did you add VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in the AI Studio Settings menu?`);
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Upload failed');
    }

    const data = await response.json();
    return data.secure_url;
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = editingId ? `/api/admin/blogs/${editingId}` : '/api/admin/blogs';
      const method = editingId ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(newPost),
      });
      if (res.ok) {
        setShowModal(false);
        setEditingId(null);
        setNewPost({ title: '', category: CATEGORIES[0], content: '', state: 'India', thumbnail: '', placement: PLACEMENT_OPTIONS[0] });
        fetchBlogs();
      }
    } catch (error) {
      alert(`Failed to ${editingId ? 'update' : 'create'} post`);
    }
    setLoading(false);
  };

  const handleEdit = (blog: any) => {
    setEditingId(blog.id);
    setNewPost({
      title: blog.title,
      category: blog.category,
      content: blog.content,
      state: blog.state,
      thumbnail: blog.thumbnail || '',
      placement: blog.placement || PLACEMENT_OPTIONS[0]
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    console.log('Executing blog deletion for:', id);
    try {
      const res = await fetch(`/api/admin/blogs/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (res.ok) {
        console.log('Blog deleted successfully');
        fetchBlogs();
      } else {
        const errorData = await res.json();
        console.error('Delete blog failed:', errorData.error);
        alert(`Deletion failed: ${errorData.error || 'Server error'}.`);
      }
    } catch (error) {
      console.error('Delete blog error:', error);
      alert('Network error while deleting post.');
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-black text-gray-900">ADMIN LOGIN</h1>
            <p className="text-gray-500 text-sm">Enter password to access dashboard</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
            />
            <button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-colors">
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-xl font-black tracking-tighter">ADMIN <span className="text-red-500">PANEL</span></h2>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-sm transition-colors ${activeTab === 'dashboard' ? 'bg-red-600 text-white' : 'text-gray-400 hover:bg-gray-800'}`}
          >
            <LayoutDashboard size={18} /> Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('subscribers')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-sm transition-colors ${activeTab === 'subscribers' ? 'bg-red-600 text-white' : 'text-gray-400 hover:bg-gray-800'}`}
          >
            <Users size={18} /> Subscribers
          </button>
          <button 
            onClick={() => setActiveTab('ads')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-sm transition-colors ${activeTab === 'ads' ? 'bg-red-600 text-white' : 'text-gray-400 hover:bg-gray-800'}`}
          >
            <Megaphone size={18} /> Ad Management
          </button>
          <button 
            onClick={() => setActiveTab('pages')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-sm transition-colors ${activeTab === 'pages' ? 'bg-red-600 text-white' : 'text-gray-400 hover:bg-gray-800'}`}
          >
            <FileText size={18} /> Manage Pages
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-sm transition-colors ${activeTab === 'settings' ? 'bg-red-600 text-white' : 'text-gray-400 hover:bg-gray-800'}`}
          >
            <Settings size={18} /> Site Settings
          </button>
        </nav>
        <div className="p-4 border-t border-gray-800 space-y-2">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-red-400 transition-colors font-bold text-sm">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        {activeTab === 'dashboard' ? (
          <>
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    setEditingId(null);
                    setNewPost({ title: '', category: CATEGORIES[0], content: '', state: 'India', thumbnail: '', placement: PLACEMENT_OPTIONS[0] });
                    setShowModal(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-sm transition-colors"
                >
                  <Plus size={18} /> New Post
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <p className="text-gray-500 text-sm font-bold uppercase mb-1">Total Posts</p>
                <p className="text-3xl font-black text-gray-900">{blogs.length}</p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <p className="text-gray-500 text-sm font-bold uppercase mb-1">Total Views</p>
                <p className="text-3xl font-black text-gray-900">
                  {blogs.reduce((acc, b) => acc + (b.views || 0), 0)}
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <p className="text-gray-500 text-sm font-bold uppercase mb-1">Total Subscribers</p>
                <p className="text-3xl font-black text-gray-900">{subscribers.length}</p>
              </div>
            </div>

            {/* Posts Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Post Title</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Category</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Views</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {blogs.map((blog) => (
                    <tr key={blog.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-gray-900 text-sm">{blog.title}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold rounded uppercase">
                          {blog.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date((blog.createdAt?.seconds || blog.createdAt?._seconds || Date.now() / 1000) * 1000).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">{blog.views}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end items-center gap-2 md:gap-3">
                          <button 
                            type="button"
                            onClick={() => handleEdit(blog)}
                            className="p-1.5 md:p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Post"
                          >
                            <Edit size={18} />
                          </button>
                          <button 
                            type="button"
                            onClick={() => setDeleteConfirm({ id: blog.id, type: 'blog' })}
                            className="p-1.5 md:p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Post"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : activeTab === 'subscribers' ? (
          <>
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Subscribers List</h1>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Email Address</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Subscribed Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {subscribers.map((sub) => (
                    <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-gray-900 text-sm">{sub.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date((sub.subscribedAt?.seconds || sub.subscribedAt?._seconds || Date.now() / 1000) * 1000).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                  {subscribers.length === 0 && (
                    <tr>
                      <td colSpan={2} className="px-6 py-10 text-center text-gray-500 font-medium">
                        No subscribers found yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : activeTab === 'ads' ? (
          <>
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Ad Management</h1>
              <button 
                onClick={() => {
                  setEditingAdId(null);
                  setNewAd({ imageUrl: '', linkUrl: '', showOnHome: true, showOnBlog: false, isActive: true });
                  setShowAdModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-sm transition-colors"
              >
                <Plus size={18} /> New Ad
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {ads.map((ad) => (
                <div key={ad.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex">
                  <div className="w-1/3 bg-gray-100 flex items-center justify-center p-2">
                    <img src={ad.imageUrl} alt="Ad Preview" className="max-h-32 object-contain rounded shadow-sm" />
                  </div>
                  <div className="flex-1 p-4 flex flex-col justify-between">
                    <div>
                    <div className="flex justify-between items-start">
                      <button 
                        onClick={() => toggleAdStatus(ad)}
                        title={ad.isActive ? 'Deactivate Ad' : 'Activate Ad'}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-all ${ad.isActive ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
                      >
                        {ad.isActive ? 'Active' : 'Inactive'}
                      </button>
                      <div className="flex gap-2">
                        <button 
                          type="button"
                          onClick={() => {
                            setEditingAdId(ad.id);
                            setNewAd({ ...ad });
                            setShowAdModal(true);
                          }}
                          className="text-blue-600 hover:bg-blue-50 p-2 rounded transition-colors"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          type="button"
                          onClick={() => setDeleteConfirm({ id: ad.id, type: 'ad' })}
                          className="text-red-600 hover:bg-red-50 p-2 rounded transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                      <p className="mt-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Locations:</p>
                      <div className="flex gap-2 mt-1">
                        {ad.showOnHome && <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[9px] font-bold">Home Page</span>}
                        {ad.showOnBlog && <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded text-[9px] font-bold">Blog Posts</span>}
                      </div>
                    </div>
                    <p className="text-[10px] text-gray-400 truncate mt-2">Target: {ad.linkUrl || 'No Link'}</p>
                  </div>
                </div>
              ))}
            </div>
            {ads.length === 0 && (
              <div className="mt-12 text-center text-gray-400 font-bold">No advertisements found.</div>
            )}
          </>
        ) : activeTab === 'pages' ? (
          <>
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Manage Information Pages</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {['about', 'contact', 'privacy-policy', 'disclaimer'].map((pageId) => {
                const page = pages.find(p => p.id === pageId);
                const defaults = PAGE_DEFAULTS[pageId] || {};
                return (
                  <div key={pageId} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold text-gray-900 uppercase">{pageId.replace('-', ' ')}</h3>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${page ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {page ? 'Custom' : 'Default'}
                        </span>
                      </div>
                      <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                        {page?.subtitle || defaults.subtitle || 'Static content for ' + pageId + ' page.'}
                      </p>
                    </div>
                    <button 
                      onClick={() => {
                        setEditingPageId(pageId);
                        setNewPage({
                          title: page?.title || defaults.title || '',
                          subtitle: page?.subtitle || defaults.subtitle || '',
                          content: page?.content || defaults.content || '',
                          metaTitle: page?.metaTitle || defaults.metaTitle || '',
                          metaDescription: page?.metaDescription || defaults.metaDescription || ''
                        });
                        setShowPageModal(true);
                      }}
                      className="flex items-center justify-center gap-2 w-full py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg font-bold text-sm transition-colors"
                    >
                      <Edit size={16} /> Edit Page Content
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Site Settings</h1>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 max-w-xl">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Hero Background Image</label>
                      <label className={`group relative flex flex-col items-center justify-center w-full aspect-[21/9] border-2 border-dashed rounded-xl transition-all overflow-hidden bg-gray-50 ${heroBgImage ? 'border-gray-200' : 'border-gray-300 hover:bg-white hover:border-red-400 cursor-pointer'}`}>
                        {heroBgImage ? (
                          <>
                            <img src={heroBgImage} alt="Hero Preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity gap-3">
                              <label className="bg-white/90 px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer hover:bg-white">
                                <RefreshCw size={18} className={uploading['hero'] ? 'animate-spin' : ''} />
                                <span className="text-xs font-bold text-gray-900">{uploading['hero'] ? 'Uploading...' : 'Change Image'}</span>
                                <input 
                                  type="file" 
                                  className="hidden" 
                                  accept="image/*"
                                  disabled={uploading['hero']}
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      try {
                                        setUploading(prev => ({...prev, hero: true}));
                                        const url = await handleFileUpload(file);
                                        setHeroBgImage(url);
                                      } catch (err: any) {
                                        alert(`Upload failed: ${err.message}`);
                                      } finally {
                                        setUploading(prev => ({...prev, hero: false}));
                                      }
                                    }
                                  }}
                                />
                              </label>
                              <button 
                                onClick={(e) => {
                                  e.preventDefault();
                                  setHeroBgImage('');
                                }}
                                className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700"
                              >
                                <X size={18} />
                              </button>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex flex-col items-center gap-3 p-8">
                              <div className="p-4 bg-red-50 rounded-full text-red-500">
                                <ImageIcon size={32} />
                              </div>
                              <div className="text-center">
                                <p className="text-sm font-bold text-gray-900">Click to upload background</p>
                                <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                              </div>
                            </div>
                            <input 
                              type="file" 
                              className="hidden" 
                              accept="image/*"
                              disabled={uploading['hero']}
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  try {
                                    setUploading(prev => ({...prev, hero: true}));
                                    const url = await handleFileUpload(file);
                                    setHeroBgImage(url);
                                  } catch (err: any) {
                                    alert(`Upload failed: ${err.message}`);
                                  } finally {
                                    setUploading(prev => ({...prev, hero: false}));
                                  }
                                }
                              }}
                            />
                          </>
                        )}
                      </label>
                  <p className="text-[10px] text-gray-500 mt-2 italic">
                    This image will be used as the background for the search section on the home page.
                  </p>
                </div>

                <button 
                  onClick={updateSettings}
                  disabled={loading || !heroBgImage}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-colors shadow-lg shadow-red-500/20 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Update Hero Image'}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 max-w-xl mt-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <LinkIcon size={20} className="text-red-600" />
                Social Channel Links
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 italic">WhatsApp Group Link</label>
                  <input 
                    type="url"
                    placeholder="https://chat.whatsapp.com/..."
                    value={socialLinks.whatsapp}
                    onChange={(e) => setSocialLinks({ ...socialLinks, whatsapp: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-sm transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 italic">Telegram Channel Link</label>
                  <input 
                    type="url"
                    placeholder="https://t.me/..."
                    value={socialLinks.telegram}
                    onChange={(e) => setSocialLinks({ ...socialLinks, telegram: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-sm transition-all"
                  />
                </div>

                <button 
                  onClick={updateSocialLinks}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Update Social Links'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 animate-in zoom-in duration-200">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6 mx-auto">
              <Trash2 size={32} className="text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Are you sure?</h3>
            <p className="text-gray-500 text-center mb-8">
              This action cannot be undone. This {deleteConfirm.type} will be permanently removed.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  if (deleteConfirm.type === 'blog') {
                    handleDelete(deleteConfirm.id);
                  } else {
                    deleteAd(deleteConfirm.id);
                  }
                  setDeleteConfirm(null);
                }}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-200 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ad Modal */}
      {showAdModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">{editingAdId ? 'Edit Ad' : 'Create New Ad'}</h2>
              <button onClick={() => setShowAdModal(false)} className="text-gray-400 hover:text-gray-600">
                <LogOut size={20} className="rotate-180" />
              </button>
            </div>
            <form onSubmit={handleCreateAd} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Ad Banner</label>
                <label className={`group relative flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed rounded-xl transition-all overflow-hidden bg-gray-50 ${newAd.imageUrl ? 'border-gray-200' : 'border-gray-300 hover:bg-white hover:border-red-400 cursor-pointer'}`}>
                  {newAd.imageUrl ? (
                    <>
                      <img src={newAd.imageUrl} alt="Ad Preview" className="w-full h-full object-contain" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity gap-3">
                        <label className="bg-white/90 px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer hover:bg-white text-gray-900">
                          <RefreshCw size={18} className={uploading['ad'] ? 'animate-spin' : ''} />
                          <span className="text-xs font-bold">{uploading['ad'] ? 'Uploading...' : 'Change Banner'}</span>
                          <input 
                            type="file" 
                            className="hidden" 
                            accept="image/*"
                            disabled={uploading['ad']}
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                try {
                                  setUploading(prev => ({...prev, ad: true}));
                                  const url = await handleFileUpload(file);
                                  setNewAd({...newAd, imageUrl: url});
                                } catch (err: any) {
                                  alert(`Upload failed: ${err.message}`);
                                } finally {
                                  setUploading(prev => ({...prev, ad: false}));
                                }
                              }
                            }}
                          />
                        </label>
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            setNewAd({...newAd, imageUrl: ''});
                          }}
                          className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex flex-col items-center gap-2 p-4">
                        <ImageIcon size={32} className="text-gray-400" />
                        <p className="text-sm font-bold text-gray-600">Click to upload ad banner</p>
                      </div>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        disabled={uploading['ad']}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              setUploading(prev => ({...prev, ad: true}));
                              const url = await handleFileUpload(file);
                              setNewAd({...newAd, imageUrl: url});
                            } catch (err: any) {
                              alert(`Upload failed: ${err.message}`);
                            } finally {
                              setUploading(prev => ({...prev, ad: false}));
                            }
                          }
                        }}
                      />
                    </>
                  )}
                </label>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Target Link (Optional)</label>
                <input 
                  type="text" 
                  value={newAd.linkUrl}
                  onChange={(e) => setNewAd({...newAd, linkUrl: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 outline-none"
                  placeholder="https://example.com/promo"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700 mb-1">Display Settings</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={newAd.showOnHome}
                      onChange={(e) => setNewAd({...newAd, showOnHome: e.target.checked})}
                      className="w-4 h-4 text-red-600"
                    />
                    <span className="text-sm font-bold text-gray-600">Home Page</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={newAd.showOnBlog}
                      onChange={(e) => setNewAd({...newAd, showOnBlog: e.target.checked})}
                      className="w-4 h-4 text-red-600"
                    />
                    <span className="text-sm font-bold text-gray-600">Blog Posts</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={newAd.isActive}
                      onChange={(e) => setNewAd({...newAd, isActive: e.target.checked})}
                      className="w-4 h-4 text-red-600"
                    />
                    <span className="text-sm font-bold text-green-600">Is Active</span>
                  </label>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowAdModal(false)}
                  className="px-6 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? 'Processing...' : editingAdId ? 'Update Ad' : 'Create Ad'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Post Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">{editingId ? 'Edit Post' : 'Create New Post'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <LogOut size={20} className="rotate-180" />
              </button>
            </div>
            <form onSubmit={handleCreatePost} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Post Title</label>
                <input 
                  required
                  type="text" 
                  value={newPost.title}
                  onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 outline-none"
                  placeholder="e.g. Bihar Teacher Vacancy 2024"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
                  <select 
                    value={newPost.category}
                    onChange={(e) => setNewPost({...newPost, category: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 outline-none"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">State</label>
                  <select 
                    value={newPost.state}
                    onChange={(e) => setNewPost({...newPost, state: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 outline-none"
                  >
                    {INDIAN_STATES.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Where to Show</label>
                <select 
                  value={newPost.placement}
                  onChange={(e) => setNewPost({...newPost, placement: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 outline-none"
                >
                  {PLACEMENT_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Thumbnail <span className="text-[10px] font-normal text-gray-400 ml-1">(Recommended: 1200 x 675 px)</span>
                </label>
                <label className={`group relative flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed rounded-xl transition-all overflow-hidden bg-gray-50 ${newPost.thumbnail ? 'border-gray-200' : 'border-gray-300 hover:bg-white hover:border-red-400 cursor-pointer'}`}>
                  {newPost.thumbnail ? (
                    <>
                      <img src={newPost.thumbnail} alt="Post Thumbnail" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity gap-3">
                        <label className="bg-white/90 px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer hover:bg-white text-gray-900">
                          <RefreshCw size={18} className={uploading['blog'] ? 'animate-spin' : ''} />
                          <span className="text-xs font-bold">{uploading['blog'] ? 'Uploading...' : 'Change Thumbnail'}</span>
                          <input 
                            type="file" 
                            className="hidden" 
                            accept="image/*"
                            disabled={uploading['blog']}
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                try {
                                  setUploading(prev => ({...prev, blog: true}));
                                  const url = await handleFileUpload(file);
                                  setNewPost({...newPost, thumbnail: url});
                                } catch (err: any) {
                                  alert(`Upload failed: ${err.message}`);
                                } finally {
                                  setUploading(prev => ({...prev, blog: false}));
                                }
                              }
                            }}
                          />
                        </label>
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            setNewPost({...newPost, thumbnail: ''});
                          }}
                          className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex flex-col items-center gap-2 p-4">
                        <ImageIcon size={32} className="text-gray-400" />
                        <p className="text-sm font-bold text-gray-600">Click to upload thumbnail</p>
                      </div>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        disabled={uploading['blog']}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              setUploading(prev => ({...prev, blog: true}));
                              const url = await handleFileUpload(file);
                              setNewPost({...newPost, thumbnail: url});
                            } catch (err: any) {
                              alert(`Upload failed: ${err.message}`);
                            } finally {
                              setUploading(prev => ({...prev, blog: false}));
                            }
                          }
                        }}
                      />
                    </>
                  )}
                </label>
              </div>
              <div>
                <div className="flex justify-between items-end mb-1">
                  <label className="block text-sm font-bold text-gray-700">Content (Markdown)</label>
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <button 
                      type="button"
                      onClick={() => setEditorTab('edit')}
                      className={`px-3 py-1 text-xs font-bold rounded-md transition-all flex items-center gap-1 ${editorTab === 'edit' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      <Code size={14} /> Write
                    </button>
                    <button 
                      type="button"
                      onClick={() => setEditorTab('preview')}
                      className={`px-3 py-1 text-xs font-bold rounded-md transition-all flex items-center gap-1 ${editorTab === 'preview' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      <Eye size={14} /> Preview
                    </button>
                  </div>
                </div>

                {editorTab === 'edit' ? (
                  <>
                    <div className="flex flex-wrap gap-1 mb-0 p-1 bg-gray-100 border border-gray-300 rounded-t-lg border-b-0 relative">
                      {/* Hidden color picker */}
                      <input 
                        type="color" 
                        ref={colorInputRef} 
                        className="hidden" 
                        onChange={(e) => {
                          const color = e.target.value;
                          if (colorSelection) {
                            applyFormat(`<span style="color:${color};font-weight:bold">`, '</span>', undefined, colorSelection.start, colorSelection.end);
                            setColorSelection(null);
                          } else {
                            applyFormat(`<span style="color:${color};font-weight:bold">`, '</span>');
                          }
                        }}
                      />

                      {/* Link Dialog Section */}
                      {linkDialog && linkDialog.isOpen && (
                        <div className="absolute top-0 left-0 w-full h-full z-20 bg-white border border-red-200 rounded-t-lg flex items-center px-2 gap-3 animate-in fade-in slide-in-from-top-1 duration-200 shadow-sm">
                          <span className="text-[10px] font-black text-red-600 uppercase flex items-center gap-1">
                            <LinkIcon size={12} /> Link URL:
                          </span>
                          <input 
                            autoFocus
                            type="text" 
                            value={linkDialog.url}
                            onChange={(e) => setLinkDialog({...linkDialog, url: e.target.value})}
                            onKeyDown={(e) => e.key === 'Enter' && insertLink()}
                            className="flex-1 px-3 py-1 text-xs border border-gray-300 rounded outline-none focus:ring-1 focus:ring-red-500"
                            placeholder="https://example.com"
                          />
                          <div className="flex gap-1">
                            <button 
                              type="button" 
                              onClick={insertLink}
                              className="bg-red-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-red-700 transition-colors"
                            >
                              Add
                            </button>
                            <button 
                              type="button" 
                              onClick={() => setLinkDialog(null)}
                              className="bg-gray-100 text-gray-600 px-3 py-1 rounded text-xs font-bold hover:bg-gray-200 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                      
                      <button
                        type="button"
                        onMouseDown={(e) => { e.preventDefault(); applyFormat('**', '**', 'Bold Text'); }}
                        className="p-1.5 px-3 hover:bg-white hover:shadow-sm rounded text-gray-700 transition-all flex items-center gap-1.5"
                        title="Bold"
                      >
                        <BoldIcon size={14} /> <span className="text-[10px] font-bold uppercase">Bold</span>
                      </button>

                      <div className="w-[1px] h-6 bg-gray-300 mx-1 self-center" />

                      <button
                        type="button"
                        onMouseDown={(e) => { 
                          e.preventDefault(); 
                          if (textAreaRef.current) {
                            setColorSelection({
                              start: textAreaRef.current.selectionStart,
                              end: textAreaRef.current.selectionEnd
                            });
                          }
                          colorInputRef.current?.click(); 
                        }}
                        className="p-1.5 px-3 hover:bg-white hover:shadow-sm rounded text-gray-700 transition-all flex items-center gap-1.5"
                        title="Text Color"
                      >
                        <Type size={14} className="text-red-500" /> <span className="text-[10px] font-bold uppercase">Color</span>
                      </button>

                      <div className="w-[1px] h-6 bg-gray-300 mx-1 self-center" />

                      <button
                        type="button"
                        onMouseDown={(e) => { e.preventDefault(); openLinkDialog('general'); }}
                        className="p-1.5 px-3 hover:bg-white hover:shadow-sm rounded text-gray-700 transition-all flex items-center gap-1.5"
                        title="Insert Link"
                      >
                        <LinkIcon size={14} /> <span className="text-[10px] font-bold uppercase">Link</span>
                      </button>

                      <button
                        type="button"
                        onMouseDown={(e) => { e.preventDefault(); openLinkDialog('apply'); }}
                        className="p-1.5 px-3 hover:bg-white hover:shadow-sm rounded text-green-700 transition-all flex items-center gap-1.5"
                        title="Apply Link"
                      >
                        <Plus size={14} /> <span className="text-[10px] font-bold uppercase">Apply Link</span>
                      </button>

                      <button
                        type="button"
                        onMouseDown={(e) => { e.preventDefault(); openLinkDialog('admit'); }}
                        className="p-1.5 px-3 hover:bg-white hover:shadow-sm rounded text-orange-600 transition-all flex items-center gap-1.5"
                        title="Admit Card Link"
                      >
                        <FileText size={14} /> <span className="text-[10px] font-bold uppercase">Admit Card</span>
                      </button>
                    </div>
                    <textarea 
                      ref={textAreaRef}
                      required
                      rows={15}
                      value={newPost.content}
                      onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                      className="w-full px-4 py-3 rounded-b-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none font-mono text-sm leading-relaxed"
                      placeholder="Paste your content from ChatGPT here and use the toolbar to format..."
                    />
                  </>
                ) : (
                  <div className="w-full h-[400px] px-6 py-6 rounded-lg border border-gray-300 bg-white overflow-y-auto prose prose-red max-w-none">
                    {newPost.content ? (
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw]}
                        components={{
                          a: ({ node, ...props }) => (
                            <a 
                              {...props} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-red-600 font-bold hover:underline"
                            />
                          )
                        }}
                      >
                        {newPost.content}
                      </ReactMarkdown>
                    ) : (
                      <p className="text-gray-400 italic">Nothing to preview yet...</p>
                    )}
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? 'Processing...' : editingId ? 'Update Post' : 'Create Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Page Modal */}
      {showPageModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 uppercase">Edit {editingPageId?.replace('-', ' ')}</h2>
              <button onClick={() => setShowPageModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleUpdatePage} className="flex-1 flex flex-col p-6 overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Page Title</label>
                  <input 
                    type="text" 
                    required
                    value={newPage.title}
                    onChange={(e) => setNewPage({...newPage, title: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 outline-none"
                    placeholder="e.g., ABOUT US"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Subtitle</label>
                  <input 
                    type="text" 
                    value={newPage.subtitle}
                    onChange={(e) => setNewPage({...newPage, subtitle: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 outline-none"
                    placeholder="Short description..."
                  />
                </div>
              </div>

              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex items-center gap-4 mb-2">
                  <label className="text-sm font-bold text-gray-700">Page Content (Markdown)</label>
                  <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setEditorTab('edit')}
                      className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${editorTab === 'edit' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      Write
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditorTab('preview')}
                      className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${editorTab === 'preview' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      Preview
                    </button>
                  </div>
                </div>

                {editorTab === 'edit' ? (
                  <textarea 
                    required
                    className="flex-1 w-full p-4 rounded-lg border border-gray-300 font-mono text-sm resize-none focus:ring-2 focus:ring-red-500 outline-none"
                    value={newPage.content}
                    onChange={(e) => setNewPage({...newPage, content: e.target.value})}
                    placeholder="Enter page content in Markdown..."
                  />
                ) : (
                  <div className="flex-1 w-full p-6 rounded-lg border border-gray-300 bg-gray-50 overflow-y-auto prose prose-red max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                      {newPage.content}
                    </ReactMarkdown>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button 
                  type="button"
                  onClick={() => setShowPageModal(false)}
                  className="px-6 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
