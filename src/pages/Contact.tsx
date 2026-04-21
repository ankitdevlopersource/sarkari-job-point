import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Mail, MapPin, Send } from 'lucide-react';

export default function Contact() {
  const [pageData, setPageData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState<null | 'success' | 'error'>(null);

  useEffect(() => {
    fetch('/api/pages/contact')
      .then(res => res.json())
      .then(data => {
        if (!data.error) setPageData(data);
      })
      .catch(err => console.error('Failed to fetch Contact page', err))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Contact form submission:', formData);
    setStatus('success');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-white py-16">
      <Helmet>
        <title>{pageData?.metaTitle || 'Contact Us - Sarkari job point'}</title>
        <meta name="description" content={pageData?.metaDescription || "Get in touch with Sarkari job point. Support, inquiries, and feedback."} />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-4xl font-black tracking-tighter text-gray-900 mb-4 uppercase">
            {pageData?.title?.includes(' ') ? (
              <>
                {pageData.title.split(' ')[0]}{' '}
                <span className="text-red-600">{pageData.title.split(' ').slice(1).join(' ')}</span>
              </>
            ) : (
              <span className="text-red-600">{pageData?.title || 'CONTACT US'}</span>
            )}
          </h1>
          <p className="text-gray-600 text-lg">
            {pageData?.subtitle || "Have questions or feedback? We'd love to hear from you."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-gray-600">
          {/* Contact Info */}
          <div className="space-y-8">
            <div className="bg-gray-50 p-8 rounded-2xl">
              <h2 className="text-xl font-bold text-gray-900 mb-6 font-mono">Get in Touch</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-red-100 rounded-xl text-red-600">
                    <Mail size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 mb-1">Email Us</p>
                    <a href={`mailto:${pageData?.content || 'contact@sarkarijobpoint.com'}`} className="text-gray-600 hover:text-red-600 transition-colors">
                      {pageData?.content || 'contact@sarkarijobpoint.com'}
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-red-100 rounded-xl text-red-600">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 mb-1">Office</p>
                    <p className="text-gray-600">
                      India
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-red-600 p-8 rounded-2xl text-white">
              <h2 className="text-xl font-bold mb-4">Response Time</h2>
              <p className="text-red-100 leading-relaxed">
                We usually respond to all inquiries within 24-48 business hours. Thank you for your patience.
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
            {status === 'success' ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                  <Send size={32} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2 font-mono">Message Sent!</h3>
                <p className="text-gray-600 mb-8">We'll get back to you as soon as possible.</p>
                <button 
                  onClick={() => setStatus(null)}
                  className="px-6 py-2 bg-gray-900 text-white font-bold rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                    <input 
                      type="text"
                      required
                      placeholder="Your name"
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all outline-none"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                    <input 
                      type="email"
                      required
                      placeholder="Your email"
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all outline-none"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Subject</label>
                  <input 
                    type="text"
                    required
                    placeholder="Inquiry subject"
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all outline-none"
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Message</label>
                  <textarea 
                    rows={4}
                    required
                    placeholder="How can we help you?"
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all outline-none resize-none"
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl transition-all shadow-lg shadow-red-200 uppercase tracking-wider"
                >
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
