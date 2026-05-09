/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import ErrorBoundary from './components/ErrorBoundary';

const Home = lazy(() => import('./pages/Home'));
const BlogDetail = lazy(() => import('./pages/BlogDetail'));
const ArchivePage = lazy(() => import('./pages/ArchivePage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const Admin = lazy(() => import('./pages/Admin'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const Disclaimer = lazy(() => import('./pages/Disclaimer'));

export default function App() {
  const fallback = (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="rounded-full h-14 w-14 border-4 border-red-600 border-t-transparent animate-spin" />
    </div>
  );

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/avm-admin" element={
            <Suspense fallback={fallback}>
              <Admin />
            </Suspense>
          } />
          <Route path="/avm-admin/dashboard" element={
            <Suspense fallback={fallback}>
              <Admin />
            </Suspense>
          } />
          <Route path="*" element={
            <>
              <Navbar />
              <ErrorBoundary>
                <Suspense fallback={fallback}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/latest-jobs" element={<ArchivePage archiveKey="latest-jobs" />} />
                    <Route path="/results" element={<ArchivePage archiveKey="results" />} />
                    <Route path="/admit-cards" element={<ArchivePage archiveKey="admit-card" />} />
                    <Route path="/syllabus" element={<ArchivePage archiveKey="syllabus" />} />
                    <Route path="/notifications" element={<ArchivePage archiveKey="latest-jobs" />} />
                    <Route path="/answer-key" element={<ArchivePage archiveKey="answer-key" />} />
                    <Route path="/railway-jobs" element={<ArchivePage archiveKey="railway-jobs" />} />
                    <Route path="/bank-jobs" element={<ArchivePage archiveKey="bank-jobs" />} />
                    <Route path="/ssc-jobs" element={<ArchivePage archiveKey="ssc-jobs" />} />
                    <Route path="/teaching-jobs" element={<ArchivePage archiveKey="teaching-jobs" />} />
                    <Route path="/10th-pass-jobs" element={<ArchivePage archiveKey="10th-pass-jobs" />} />
                    <Route path="/12th-pass-jobs" element={<ArchivePage archiveKey="12th-pass-jobs" />} />
                    <Route path="/graduate-jobs" element={<ArchivePage archiveKey="graduate-jobs" />} />
                    <Route path="/iti-jobs" element={<ArchivePage archiveKey="iti-jobs" />} />
                    <Route path="/engineering-jobs" element={<ArchivePage archiveKey="engineering-jobs" />} />
                    <Route path="/jobs/:state" element={<ArchivePage archiveKey="state" />} />
                    <Route path="/search" element={<SearchPage />} />
                    <Route path="/blog/:slug" element={<BlogDetail />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                    <Route path="/disclaimer" element={<Disclaimer />} />
                  </Routes>
                </Suspense>
              </ErrorBoundary>
              
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
