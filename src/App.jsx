import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import RobotChat from './components/RobotChat';
import AdminPanel from './components/AdminPanel';
import AdminLogin from './components/AdminLogin';
import { API_URL } from './config';

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
  return children;
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
            setSession({ table: data.table_number, restaurant: data.restaurant_id });
          } else {
            alert("Invalid or Expired QR Code");
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
      {!session ? (
        <LandingPage 
          onStartDemo={handleStartDemo} 
          onAdminLogin={handleAdminLogin} 
        />
      ) : (
        <div className="app-container">
          <RobotChat tableNumber={session.table} restaurantId={session.restaurant} />
        </div>
      )}
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
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
