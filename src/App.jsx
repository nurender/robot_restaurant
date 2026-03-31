import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import ScannerScreen from './components/ScannerScreen';
import RobotChat from './components/RobotChat';
import AdminPanel from './components/AdminPanel';
import AdminLogin from './components/AdminLogin';
import { Navigate } from 'react-router-dom';

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
  const user = JSON.parse(localStorage.getItem('admin_token'));
  if (!user) return <Navigate to="/admin/login" replace />;
  return children;
}

function CustomerApp() {
  const [session, setSession] = useState(null);
  
  const handleTableDetected = (tableNum, restaurantId = 1) => {
    setSession({ table: tableNum, restaurant: restaurantId });
  };

  return (
    <div className="app-container">
      {!session ? (
        <ScannerScreen onTableDetected={handleTableDetected} />
      ) : (
        <RobotChat tableNumber={session.table} restaurantId={session.restaurant} />
      )}
    </div>
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
