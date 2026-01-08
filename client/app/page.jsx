'use client';

import { useAuth } from '@/contexts/AuthContext';
import UnifiedChat from '@/components/UnifiedChat';
import ProtectedRoute from '@/components/ProtectedRoute';
import '@/styles/Home.css';

export default function HomePage() {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <div className="home-container">
        <header className="home-header">
          <div className="header-content">
            <h1>Counterfeit Medicine Detector</h1>
            <p className="welcome-text">
              Welcome, {user?.firstName || user?.userName || 'User'}!
            </p>
          </div>
        </header>

        <main className="home-main">
          <UnifiedChat />
        </main>
      </div>
    </ProtectedRoute>
  );
}
