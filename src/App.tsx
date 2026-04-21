/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import BlogDetail from './pages/BlogDetail';
import Admin from './pages/Admin';
import About from './pages/About';
import Contact from './pages/Contact';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Disclaimer from './pages/Disclaimer';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/avm-admin" element={<Admin />} />
          <Route path="/avm-admin/dashboard" element={<Admin />} />
          <Route path="*" element={
            <>
              <Navbar />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/latest-jobs" element={<Home />} />
                <Route path="/results" element={<Home />} />
                <Route path="/admit-cards" element={<Home />} />
                <Route path="/syllabus" element={<Home />} />
                <Route path="/notifications" element={<Home />} />
                <Route path="/blog/:slug" element={<BlogDetail />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/disclaimer" element={<Disclaimer />} />
              </Routes>
              
              {/* Footer */}
              <footer className="bg-gray-900 text-white py-12 mt-20">
                <div className="max-w-7xl mx-auto px-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-6">
                    <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center text-white font-bold">
                      🇮🇳
                    </div>
                    <span className="text-xl font-black tracking-tighter">
                      SARKARI <span className="text-red-500">JOB UPDATES</span>
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm max-w-md mx-auto mb-8">
                    Your one-stop destination for latest government job updates, results, admit cards, and exam notifications.
                  </p>
                  <div className="flex justify-center gap-6 text-sm font-medium text-gray-400">
                    <Link to="/about" className="hover:text-white transition-colors">About Us</Link>
                    <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
                    <Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
                    <Link to="/disclaimer" className="hover:text-white transition-colors">Disclaimer</Link>
                  </div>
                  <div className="mt-12 pt-8 border-t border-gray-800 text-xs text-gray-500">
                    © 2026 Sarkari job point . All right reserved.
                  </div>
                </div>
              </footer>
            </>
          } />
        </Routes>
      </div>
    </Router>
  );
}
