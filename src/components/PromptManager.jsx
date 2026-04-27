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
        <div className="view-container animate-fade-in ai-intelligence-panel">
            <div className="view-header-row">
                <div className="header-left">
                    <h2 className="view-title">AI Intelligence Master</h2>
                    <p className="view-subtitle">Global brain configuration for all restaurant branches</p>
                </div>
                <div className="header-actions">
                    <button className="btn-secondary" onClick={fetchPrompt} disabled={saving}>
                        <RotateCcw size={16} /> Reset Changes
                    </button>
                    <button className="btn-primary" onClick={handleSave} disabled={saving}>
                        {saving ? 'Syncing...' : <><Save size={16} /> Save Global Logic</>}
                    </button>
                </div>
            </div>

            {status && (
                <div className={`status-alert glass-panel animate-slide-down ${status.type}`}>
                    {status.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                    <span>{status.message}</span>
                </div>
            )}

            <div className="ai-config-grid mt-4">
                <div className="prompt-editor-section glass-panel shadow-premium">
                    <div className="card-header-accent mb-4">
                        <h3><Code size={18} /> System Instructions</h3>
                        <span className="badge-neural">Neural Engine v2.0</span>
                    </div>
                    
                    <div className="editor-container">
                        <textarea
                            className="prompt-textarea"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Enter AI system instructions..."
                            spellCheck="false"
                        />
                        <div className="editor-footer">
                            <span className="char-count">{prompt.length} tokens used</span>
                            <div className="variable-hints">
                                <span>Use <code>{"{{RESTAURANT_NAME}}"}</code> for dynamic names</span>
                                <span>Use <code>{"{{FLAT_MENU}}"}</code> for menu injection</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="ai-preview-tips glass-panel">
                    <div className="card-header">
                        <h3><Sparkles size={18} /> Master Logic Guide</h3>
                    </div>
                    <div className="tips-content mt-3">
                        <div className="tip-box">
                            <strong>Tone Control</strong>
                            <p>Current: Hinglish (Natural Mix). Keep instructions concise to reduce latency.</p>
                        </div>
                        <div className="tip-box">
                            <strong>Tool Awareness</strong>
                            <p>AI automatically handles cart addition, categories, and order placement. Do not remove tool-specific rules.</p>
                        </div>
                        <div className="tip-box warning">
                            <strong>Critical Rule</strong>
                            <p>Always enforce "Strict Ordering" to prevent hallucinations of items not present in menu.</p>
                        </div>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .ai-intelligence-panel .ai-config-grid {
                    display: grid;
                    grid-template-columns: 1fr 300px;
                    gap: 24px;
                    height: calc(100vh - 250px);
                }
                .ai-intelligence-panel .editor-container {
                    display: flex;
                    flex-direction: column;
                    height: calc(100% - 60px);
                    background: #1a1a2e;
                    border-radius: 12px;
                    border: 1px solid #333;
                    overflow: hidden;
                }
                .ai-intelligence-panel .prompt-textarea {
                    flex: 1;
                    background: transparent;
                    color: #e0e0ff;
                    border: none;
                    padding: 20px;
                    font-family: 'Fira Code', monospace;
                    font-size: 14px;
                    line-height: 1.6;
                    resize: none;
                    outline: none;
                }
                .ai-intelligence-panel .editor-footer {
                    padding: 12px 20px;
                    background: #111;
                    border-top: 1px solid #333;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 12px;
                }
                .ai-intelligence-panel .variable-hints code {
                    background: #333;
                    padding: 2px 6px;
                    border-radius: 4px;
                    margin-left: 10px;
                    color: var(--accent-color);
                }
                .ai-intelligence-panel .status-alert {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 20px;
                    margin-bottom: 20px;
                    border-left: 4px solid var(--accent-color);
                }
                .ai-intelligence-panel .status-alert.success { border-color: #4ade80; color: #4ade80; }
                .ai-intelligence-panel .status-alert.error { border-color: #f87171; color: #f87171; }
                .ai-intelligence-panel .tip-box {
                    padding: 15px;
                    background: rgba(255,255,255,0.03);
                    border-radius: 8px;
                    margin-bottom: 15px;
                }
                .ai-intelligence-panel .tip-box strong { display: block; margin-bottom: 5px; color: var(--accent-color); }
                .ai-intelligence-panel .tip-box p { font-size: 13px; color: #aaa; margin: 0; }
                .ai-intelligence-panel .tip-box.warning { border: 1px solid rgba(255, 100, 100, 0.2); background: rgba(255, 0, 0, 0.05); }
                .ai-intelligence-panel .badge-neural {
                    background: linear-gradient(90deg, var(--accent-color), #8b5cf6);
                    color: white;
                    padding: 4px 10px;
                    border-radius: 20px;
                    font-size: 10px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
            `}} />
        </div>
    );
};

export default PromptManager;
