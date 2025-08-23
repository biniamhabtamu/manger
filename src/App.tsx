import React, { useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/layout/Layout';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Dashboard } from './pages/Dashboard';
import { Tasks } from './pages/Tasks';
import { Categories } from './pages/Categories';
import { Premium } from './pages/Premium';
import { Settings } from './pages/Settings';
import { Profile } from './pages/Profile';
import { Analytics } from './pages/Analytics';
import { OfflineIndicator } from './components/common/OfflineIndicator';
import { CalendarPage } from './pages/CalendarPage';
import { BottomBar } from './components/layout/BottomBar';

// Capacitor App with safe initialization
let CapacitorApp;
let isNativePlatform = false;

try {
  const { App } = require('@capacitor/app');
  const { Capacitor } = require('@capacitor/core');
  if (App && Capacitor?.isNative) {
    CapacitorApp = App;
    isNativePlatform = true;
  }
} catch (e) {
  console.log('Running in web mode - Capacitor not available');
}

const AppBackHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const lastBackPressRef = useRef(0);
  const listenerRef = useRef(null);

  useEffect(() => {
    if (!isNativePlatform || !CapacitorApp) return;

    const handleBackButton = ({ canGoBack }) => {
      const currentTime = Date.now();
      const DOUBLE_PRESS_DELAY = 2000;

      if (['/dashboard', '/'].includes(location.pathname)) {
        if (currentTime - lastBackPressRef.current < DOUBLE_PRESS_DELAY) {
          CapacitorApp.exitApp().catch(console.error);
        } else {
          window.Toaster?.show({
            message: 'Press back again to exit',
            duration: 2000,
          });
          lastBackPressRef.current = currentTime;
        }
      } else if (canGoBack) {
        navigate(-1);
      } else {
        navigate('/dashboard', { replace: true });
      }
    };

    // Initialize the listener only once
    if (!listenerRef.current) {
      CapacitorApp.addListener('backButton', handleBackButton)
        .then((listener) => {
          listenerRef.current = listener;
        })
        .catch(console.error);
    }

    return () => {
      // Clean up the listener safely
      if (listenerRef.current && typeof listenerRef.current.remove === 'function') {
        listenerRef.current.remove()
          .then(() => {
            listenerRef.current = null;
          })
          .catch(console.error);
      }
    };
  }, [navigate, location]);

  return null;
};

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <div className="App">
            <OfflineIndicator />
            <Toaster 
              position="top-center"
              toastOptions={{
                duration: 2000,
                style: {
                  background: '#363636',
                  color: '#ffffff',
                  padding: '16px',
                  borderRadius: '8px',
                },
              }}
              ref={(ref) => { window.Toaster = ref; }}
            />
            
            {isNativePlatform && <AppBackHandler />}
            
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tasks"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Tasks />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tasks/:category"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Categories />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/categories"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Categories />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analytics"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Analytics />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/premium"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Premium />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Settings />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Profile />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/calendarpage"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <CalendarPage tasks={[]} />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="*"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/bottombar"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <BottomBar />
                    </Layout>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;