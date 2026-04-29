import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, RotateCcw, AlertCircle, CheckCircle, Bot, Sparkles, Code } from 'lucide-react';
import { API_URL } from '../config';

const PromptManager = () => {
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState(null);

    const fetchPrompt = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/api/admin/prompt`);
            setPrompt(response.data.prompt);
        } catch (error) {
            console.error("Failed to fetch prompt:", error);
            setStatus({ type: 'error', message: 'Failed to load AI instructions' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPrompt();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        setStatus(null);
        try {
            await axios.post(`${API_URL}/api/admin/prompt`, { prompt });
            setStatus({ type: 'success', message: 'AI Intelligence updated successfully' });
            setTimeout(() => setStatus(null), 3000);
        } catch (error) {
            console.error("Save failed:", error);
            setStatus({ type: 'error', message: 'Failed to sync AI memory' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="empty-state glass-panel animate-pulse">
                <Bot size={48} className="text-muted mb-4" />
                <h3>Calibrating Neural Link...</h3>
            </div>
        );
    }

    return (
        <div style={{ padding: '0px', minHeight: '100vh', background: 'var(--bg-deep)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h2 style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-main)' }}>AI Intelligence Master</h2>
                    <p style={{ fontSize: '15px', color: 'var(--text-muted)', marginTop: '4px' }}>Global brain configuration for all restaurant branches.</p>
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                    <button 
                      onClick={fetchPrompt} 
                      disabled={saving}
                      style={{ padding: '12px 20px', borderRadius: '12px', background: 'transparent', border: '1px solid var(--card-border)', color: 'var(--text-dim)', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <RotateCcw size={16} /> Reset
                    </button>
                    <button 
                      onClick={handleSave} 
                      disabled={saving}
                      style={{ padding: '12px 24px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)', color: 'white', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 8px 16px -4px rgba(124, 58, 237, 0.3)' }}
                    >
                        {saving ? 'Syncing...' : <><Save size={16} /> Save Logic</>}
                    </button>
                </div>
            </div>

            {status && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 20px', marginBottom: '24px', borderRadius: '12px', border: '1px solid var(--card-border)', background: status.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: status.type === 'success' ? 'var(--success)' : 'var(--danger)' }}>
                    {status.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                    <span style={{ fontWeight: '600', fontSize: '14px' }}>{status.message}</span>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', alignItems: 'start' }}>
                <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '24px', padding: '24px', boxShadow: 'var(--shadow-md)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Code size={20} style={{ color: 'var(--accent-primary)' }} />
                            <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-main)' }}>System Instructions</h3>
                        </div>
                        <span style={{ background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>Neural Engine v2.0</span>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg-deep)', borderRadius: '16px', border: '1px solid var(--card-border)', overflow: 'hidden' }}>
                        <textarea
                            style={{ height: '450px', background: 'transparent', color: 'var(--text-main)', border: 'none', padding: '24px', fontFamily: '"Fira Code", monospace', fontSize: '14px', lineHeight: '1.6', resize: 'none', outline: 'none' }}
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Enter AI system instructions..."
                            spellCheck="false"
                        />
                        <div style={{ padding: '16px 24px', background: 'rgba(0,0,0,0.15)', borderTop: '1px solid var(--card-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600' }}>{prompt.length} characters used</span>
                            <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: 'var(--text-dim)', flexWrap: 'wrap' }}>
                                <span>Use <code style={{ background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px', color: 'var(--accent-primary)' }}>{"{{RESTAURANT_NAME}}"}</code></span>
                                <span>Use <code style={{ background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px', color: 'var(--accent-primary)' }}>{"{{FLAT_MENU}}"}</code></span>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '24px', padding: '28px', boxShadow: 'var(--shadow-md)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                            <Sparkles size={20} style={{ color: 'var(--warning)' }} />
                            <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-main)' }}>Master Logic Guide</h3>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ padding: '16px', background: 'var(--bg-deep)', borderRadius: '16px', border: '1px solid var(--card-border)' }}>
                                <strong style={{ color: 'var(--accent-primary)', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Tone Control</strong>
                                <p style={{ fontSize: '12px', color: 'var(--text-dim)', margin: 0, lineHeight: '1.5' }}>Hinglish (Natural Mix). Keep directions explicit and focused.</p>
                            </div>
                            <div style={{ padding: '16px', background: 'var(--bg-deep)', borderRadius: '16px', border: '1px solid var(--card-border)' }}>
                                <strong style={{ color: 'var(--accent-primary)', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Tool Awareness</strong>
                                <p style={{ fontSize: '12px', color: 'var(--text-dim)', margin: 0, lineHeight: '1.5' }}>Maintains access to product mapping sequences. Protect key instructions.</p>
                            </div>
                            <div style={{ padding: '16px', background: 'rgba(239,68,68,0.05)', borderRadius: '16px', border: '1px solid rgba(239,68,68,0.2)' }}>
                                <strong style={{ color: 'var(--danger)', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Critical Constraint</strong>
                                <p style={{ fontSize: '12px', color: 'var(--text-dim)', margin: 0, lineHeight: '1.5' }}>Do not fabricate out-of-bounds menu configurations.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PromptManager;
