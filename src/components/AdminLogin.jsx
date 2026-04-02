import React, { useState } from 'react';
import axios from 'axios';
import { ChefHat, Lock, Mail, ChevronRight, AlertCircle, Loader2 } from 'lucide-react';
import './AdminLogin.css';

import { API_URL } from '../config';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await axios.post(`${API_URL}/api/login`, { email, password });
            if (response.data.success) {
                // Save session
                localStorage.setItem('admin_token', JSON.stringify(response.data.user));
                window.location.href = '/admin';
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Connection failed. Is the server running?');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-bg-decoration">
                <div className="blob blob-1"></div>
                <div className="blob blob-2"></div>
            </div>

            <div className="login-card glass-panel animate-scale-in">
                <div className="login-header">
                    <div className="login-logo shadow-premium">
                        <ChefHat size={32} color="white" />
                    </div>
                    <h1>AI Command Center</h1>
                    <p>Enter credentials to access the bridge</p>
                </div>

                <form onSubmit={handleLogin} className="login-form">
                    <div className="input-field-group">
                        <label><Mail size={14} /> Email Address</label>
                        <input 
                            type="email" 
                            placeholder="admin@resto.com" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)}
                            required 
                        />
                    </div>

                    <div className="input-field-group">
                        <label><Lock size={14} /> Password</label>
                        <input 
                            type="password" 
                            placeholder="••••••••" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)}
                            required 
                        />
                    </div>

                    {error && (
                        <div className="login-error-msg animate-shake">
                            <AlertCircle size={16} /> {error}
                        </div>
                    )}

                    <button type="submit" className="btn-login-premium" disabled={loading}>
                        {loading ? <Loader2 className="animate-spin" /> : <>Initiate Access <ChevronRight size={18} /></>}
                    </button>
                </form>

                <div className="login-footer">
                    <p>Authorized personnel only. Access strictly monitored.</p>
                </div>
            </div>
            
            <div className="login-demo-hints">
                <div className="hint-pill"><b>S.Admin:</b> super@resto.com / super123</div>
                <div className="hint-pill"><b>Admin:</b> admin@resto.com / admin123</div>
            </div>
        </div>
    );
};

export default AdminLogin;
