import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import RobotChat from './components/RobotChat';
import AdminPanel from './components/AdminPanel';
import AdminLogin from './components/AdminLogin';
import { API_URL } from './config';
import toast, { Toaster } from 'react-hot-toast';
import ThemeEngine from './components/ThemeEngine';

// Globally override browser default alerts to show a premium popup instead
window.alert = (message) => {
  toast(message, {
    icon: '🔔',
    style: {
      borderRadius: '12px',
      background: '#1a1a24',
      color: '#fff',
      border: '1px solid rgba(124, 58, 237, 0.3)',
      boxShadow: '0 4px 15px rgba(124, 58, 237, 0.2)',
      fontWeight: '600'
    },
  });
};

window.customConfirm = (message) => {
  return new Promise((resolve) => {
    toast((t) => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', minWidth: '220px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px' }}>⚠️</span>
          <strong style={{ fontSize: '14px', color: '#fff' }}>Confirmation Required</strong>
        </div>
        <span style={{ fontSize: '13px', color: '#cbd5e1' }}>{message}</span>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '4px' }}>
          <button 
            style={{ padding: '6px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }} 
            onClick={() => { toast.dismiss(t.id); resolve(false); }}
          >
            Cancel
          </button>
          <button 
            style={{ padding: '6px 14px', background: '#ef4444', border: '1px solid #dc2626', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', boxShadow: '0 0 10px rgba(239, 68, 68, 0.3)' }} 
            onClick={() => { toast.dismiss(t.id); resolve(true); }}
          >
            Confirm Action
          </button>
        </div>
      </div>
    ), { 
      duration: Infinity, // don't close untill clicked
      style: { 
        background: '#09090b', 
        color: '#fff', 
        border: '1px solid rgba(239, 68, 68, 0.4)',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)',
        padding: '16px',
        maxWidth: '350px'
      } 
    });
  });
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error("ErrorBoundary Caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ color: 'red', padding: '20px', background: 'white', minHeight: '100vh', zIndex: 99999 }}>
          <h2>React App Crashed!</h2>
          <pre>{this.state.error && this.state.error.toString()}</pre>
          <pre>{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

function ProtectedRoute({ children }) {
  const user = (() => {
    try {
      const saved = localStorage.getItem('admin_token');
      if (!saved || saved === 'undefined') return null;
      return JSON.parse(saved);
    } catch (e) {
      return null;
    }
  })();
  if (!user) return <Navigate to="/admin/login" replace />;
  return (
    <>
      <ThemeEngine organizationId={1} />
      {children}
    </>
  );
}

function CustomerApp() {
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return !!params.get('s');
  });

  // 🔎 Secure Token se Auto-Login
  React.useEffect(() => {
    const fetchTokenDetails = async () => {
      const params = new URLSearchParams(window.location.search);
      const secretToken = params.get('s');

      if (secretToken) {
        setIsLoading(true);
        try {
          const response = await fetch(`${API_URL}/api/verify-token/${secretToken}`);
          const data = await response.json();
          if (data.success) {
            setSession({ 
              table: data.table_number, 
              restaurant: data.restaurant_id,
              is_room: data.is_room,
              floor_name: data.floor_name,
              is_food_court: data.is_food_court,
              organization_id: data.organization_id,
              branches: data.branches
            });
          } else {
            toast.error("Invalid or Expired QR Code");
          }
        } catch (err) {
          console.error("Token verification failed", err);
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchTokenDetails();
  }, []);

  const navigate = useNavigate();

  const handleStartDemo = () => {
    window.location.href = '/?s=T5-R4-SECRET';
  };

  const handleAdminLogin = () => {
    navigate('/admin/login');
  };

  if (isLoading) {
    return (
      <div style={{
        height: '100vh',
        background: '#0a0a0b',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontFamily: 'Inter, sans-serif'
      }}>
        <div className="premium-loader"></div>
        <h2 style={{ marginTop: '20px', fontWeight: '300', letterSpacing: '2px', animation: 'pulse 2s infinite' }}>
          VERIFYING SESSION
        </h2>
        <style>{`
          .premium-loader {
            width: 50px;
            height: 50px;
            border: 2px solid rgba(124, 58, 237, 0.1);
            border-top: 2px solid #7c3aed;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            box-shadow: 0 0 15px rgba(124, 58, 237, 0.4);
          }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          @keyframes pulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
        `}</style>
      </div>
    );
  }

  return (
    <>
      {session?.organization_id && <ThemeEngine organizationId={session.organization_id} />}
      {!session ? (
        <LandingPage
          onStartDemo={handleStartDemo}
          onAdminLogin={handleAdminLogin}
        />
      ) : (
        <div className="app-container">
          <RobotChat 
            tableNumber={session.table} 
            restaurantId={session.restaurant} 
            isRoom={session.is_room}
            floorName={session.floor_name}
            isFoodCourt={session.is_food_court}
            organizationId={session.organization_id}
            branches={session.branches}
          />
        </div>
      )}
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <Toaster 
        position="top-right" 
        reverseOrder={false} 
        containerStyle={{ zIndex: 999999 }} 
        toastOptions={{
          style: {
            borderRadius: '12px',
            background: '#09090b',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)',
            fontWeight: '600',
            fontSize: '14px',
            padding: '12px 18px',
          },
          success: {
            iconTheme: { primary: '#10b981', secondary: '#fff' },
            style: { border: '1px solid rgba(16, 185, 129, 0.3)', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.15)' }
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#fff' },
            style: { border: '1px solid rgba(239, 68, 68, 0.3)', boxShadow: '0 4px 15px rgba(239, 68, 68, 0.15)' }
          }
        }}
      />
      <Router>
        <Routes>
          <Route path="/" element={<CustomerApp />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/*" element={
            <ProtectedRoute>
              <AdminPanel />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
