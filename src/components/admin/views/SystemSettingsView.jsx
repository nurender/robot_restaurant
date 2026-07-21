import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Settings, Shield, Paintbrush, Smartphone, Check, HelpCircle, Save, RotateCcw, UploadCloud, Trash2, ChevronDown, ChevronUp, Monitor, Tablet, X, Layout, Type, Palette, Image as ImageIcon } from 'lucide-react';
import apiService from '../../../services/apiService';
import './SystemSettingsView.css';

const THEME_PRESETS = [
  { id: 'blue', name: 'Blue', primary: '#3b82f6', secondary: '#2563eb', accent: '#f59e0b' },
  { id: 'green', name: 'Green', primary: '#10b981', secondary: '#059669', accent: '#f59e0b' },
  { id: 'purple', name: 'Purple', primary: '#8b5cf6', secondary: '#7c3aed', accent: '#10b981' },
  { id: 'orange', name: 'Orange', primary: '#f97316', secondary: '#ea580c', accent: '#3b82f6' },
  { id: 'custom', name: 'Custom', primary: '#ffffff', secondary: '#ffffff', accent: '#ffffff' }
];

export default function SystemSettingsView({ adminUser, restaurantsList }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState('desktop'); // desktop, tablet, mobile
  const [originalSettings, setOriginalSettings] = useState(null);
  
  const activeRestaurant = restaurantsList?.find(r => r.id === (adminUser?.restaurant_id || 4));
  const orgId = activeRestaurant?.organization_id || 1;

  // Settings State
  const [settings, setSettings] = useState({
    restaurant_id: adminUser?.restaurant_id || 4,
    restaurant_name: '',
    brand_tagline: '',
    theme_preset: 'blue',
    card_style: 'rounded',
    sidebar_style: 'dark',
    header_style: 'solid',
    primary_color: '#3b82f6',
    secondary_color: '#2563eb',
    accent_color: '#f59e0b',
    background_color: '#f8fafc',
    button_color: '#3b82f6',
    sidebar_color: '#0f172a',
    card_color: '#ffffff',
    text_color: '#0f172a',
    border_color: 'rgba(0, 0, 0, 0.08)',
    danger_color: '#ef4444',
    success_color: '#10b981',
    logo_url: '',
    favicon_url: '',
    banner_url: '',
    splash_url: ''
  });

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const [res, themeRes] = await Promise.all([
        apiService.getSettings(adminUser?.restaurant_id || 4),
        apiService.getOrgTheme(orgId)
      ]);
      
      let newSettings = { ...settings };

      if (res.data?.success && res.data?.data) {
        const dbSettings = res.data.data;
        newSettings = { ...newSettings, ...dbSettings };
      }

      if (themeRes.data?.success && themeRes.data?.data) {
        newSettings = { ...newSettings, ...themeRes.data.data };
      }

      setSettings(newSettings);
      setOriginalSettings(JSON.stringify(newSettings));
    } catch (e) {
      toast.error("Failed to load restaurant configurations.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [adminUser?.restaurant_id, orgId]);

  const handleFieldChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handlePresetSelect = (preset) => {
    if (preset.id === 'custom') {
      handleFieldChange('theme_preset', 'custom');
      return;
    }
    
    setSettings(prev => ({
      ...prev,
      theme_preset: preset.id,
      primary_color: preset.primary,
      secondary_color: preset.secondary,
      accent_color: preset.accent,
      button_color: preset.primary
    }));
  };

  const handleSaveSettings = async (e) => {
    e?.preventDefault();
    setIsLoading(true);
    try {
      const themePayload = {
        restaurant_name: settings.restaurant_name,
        brand_tagline: settings.brand_tagline,
        theme_preset: settings.theme_preset,
        card_style: settings.card_style,
        sidebar_style: settings.sidebar_style,
        header_style: settings.header_style,
        primary_color: settings.primary_color,
        secondary_color: settings.secondary_color,
        accent_color: settings.accent_color,
        background_color: settings.background_color,
        button_color: settings.button_color,
        sidebar_color: settings.sidebar_color,
        card_color: settings.card_color,
        text_color: settings.text_color,
        border_color: settings.border_color,
        danger_color: settings.danger_color,
        success_color: settings.success_color,
        logo_url: settings.logo_url,
        favicon_url: settings.favicon_url,
        banner_url: settings.banner_url,
        splash_url: settings.splash_url
      };

      await Promise.all([
        apiService.updateSettings(settings),
        apiService.updateOrgTheme(orgId, themePayload)
      ]);
      
      setOriginalSettings(JSON.stringify(settings));
      toast.success("Configurations saved successfully!");

      // Helper to convert hex to RGB
      const hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '124, 58, 237';
      };

      // Dynamically apply all color variables
      const root = document.documentElement;
      if (settings.primary_color) {
        root.style.setProperty('--accent-primary', settings.primary_color);
        root.style.setProperty('--ap-accent-color', settings.primary_color);
      }
      if (settings.secondary_color) root.style.setProperty('--accent-secondary', settings.secondary_color);
      if (settings.accent_color) {
        root.style.setProperty('--accent-color', settings.accent_color);
        const rgb = hexToRgb(settings.accent_color);
        root.style.setProperty('--accent-glow', `rgba(${rgb}, 0.35)`);
        root.style.setProperty('--accent-light', `rgba(${rgb}, 0.15)`);
      }
      if (settings.background_color) {
        root.style.setProperty('--bg-deep', settings.background_color);
        root.style.setProperty('--ap-main-bg', settings.background_color);
      }
      if (settings.button_color) root.style.setProperty('--button-color', settings.button_color);
      
      if (settings.sidebar_style === 'light') {
        root.style.setProperty('--sidebar-bg', '#ffffff');
        root.style.setProperty('--ap-sidebar-bg', '#ffffff');
        root.style.setProperty('--sidebar-text', '#0f172a');
        root.style.setProperty('--sidebar-text-muted', '#64748b');
        root.style.setProperty('--sidebar-hover', 'rgba(0, 0, 0, 0.05)');
        root.style.setProperty('--sidebar-border', 'rgba(0, 0, 0, 0.08)');
      } else {
        root.style.setProperty('--sidebar-bg', settings.sidebar_color || '#09090b');
        root.style.setProperty('--ap-sidebar-bg', settings.sidebar_color || '#09090b');
        root.style.setProperty('--sidebar-text', '#ffffff');
        root.style.setProperty('--sidebar-text-muted', '#a1a1aa');
        root.style.setProperty('--sidebar-hover', 'rgba(255, 255, 255, 0.05)');
        root.style.setProperty('--sidebar-border', 'rgba(255, 255, 255, 0.08)');
      }

      if (settings.card_color) {
        root.style.setProperty('--card-bg', settings.card_color);
        root.style.setProperty('--ap-card-bg', settings.card_color);
        root.style.setProperty('--ap-glass-bg', settings.card_color);
      }
      if (settings.text_color) {
        root.style.setProperty('--text-main', settings.text_color);
        root.style.setProperty('--ap-text-main', settings.text_color);
      }

    } catch (e) {
      toast.error("Failed to save changes.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetTheme = () => {
    if (originalSettings) {
      setSettings(JSON.parse(originalSettings));
      toast.success("Restored to last saved state.");
    }
  };

  const handleDiscard = () => {
    if (originalSettings) {
      setSettings(JSON.parse(originalSettings));
    }
  };

  const isDirty = originalSettings !== null && JSON.stringify(settings) !== originalSettings;

  const handleUploadClick = (field) => {
    const mockUrl = prompt(`Enter image URL for ${field} (Mock Upload)`);
    if (mockUrl) {
      handleFieldChange(field, mockUrl);
    }
  };

  const ImageUploadBox = ({ title, field, value, compact = false }) => (
    <div className="settings-input-group">
      <span className="settings-label">{title}</span>
      {value ? (
        <div className={`upload-preview ${compact ? 'compact' : ''}`}>
          <img src={value} alt={title} />
          <div className="upload-overlay">
            <button onClick={() => handleFieldChange(field, '')} className="btn-secondary" style={{ color: 'var(--danger)' }}>
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      ) : (
        <div onClick={() => handleUploadClick(field)} className={`upload-box ${compact ? 'compact' : ''}`}>
          <div className="upload-box-icon">
            <UploadCloud size={24} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', display: 'block' }}>Add {title}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Drag and drop or click to upload</span>
          </div>
        </div>
      )}
    </div>
  );

  const SegmentedControl = ({ options, value, onChange }) => (
    <div className="segmented-control">
      {options.map((option) => (
        <button
          key={option.id}
          onClick={() => onChange(option.id)}
          className={`segmented-btn ${value === option.id ? 'active' : ''}`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );

  return (
    <div className="settings-page-container">
      
      {/* Header */}
      <div className="settings-top-header">
        <div className="settings-header-inner">
          <div className="settings-header-title">
            <h1>Branding & Appearance</h1>
            <p>Customize your restaurant branding and application theme.</p>
          </div>
          <div className="settings-header-actions">
            <button onClick={handleResetTheme} className="btn-secondary">
              Reset
            </button>
            <button onClick={() => window.open('/', '_blank')} className="btn-secondary" style={{ borderColor: 'var(--accent-primary)', color: 'var(--accent-primary)' }}>
              <Monitor size={16} /> Preview
            </button>
            <button onClick={handleSaveSettings} disabled={isLoading || !isDirty} className="btn-premium">
              <Save size={16} /> Save Changes
            </button>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="settings-main-layout">
        
        {/* LEFT COLUMN (70%) */}
        <div className="settings-left-column animate-slide-up">
          
          {/* Card 1: Branding */}
          <div className="settings-card">
            <div className="settings-card-header">
              <div className="settings-card-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                <Type size={20} />
              </div>
              <div className="settings-card-title">
                <h2>Restaurant Branding</h2>
                <p>Basic details and main logo for your restaurant.</p>
              </div>
            </div>
            
            <ImageUploadBox title="Primary Logo" field="logo_url" value={settings.logo_url} />
            
            <div style={{ display: 'flex', gap: '1.5rem', width: '100%', flexWrap: 'wrap' }}>
              <div className="settings-input-group" style={{ flex: '1 1 250px' }}>
                <label className="settings-label">Restaurant Name</label>
                <input 
                  type="text" 
                  value={settings.restaurant_name || ''} 
                  onChange={(e) => handleFieldChange('restaurant_name', e.target.value)}
                  placeholder="e.g. The Golden Fork"
                  className="settings-input"
                />
              </div>
              <div className="settings-input-group" style={{ flex: '1 1 250px' }}>
                <label className="settings-label">Brand Tagline</label>
                <input 
                  type="text" 
                  value={settings.brand_tagline || ''} 
                  onChange={(e) => handleFieldChange('brand_tagline', e.target.value)}
                  placeholder="e.g. Fine Dining, Reimagined"
                  className="settings-input"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Theme */}
          <div className="settings-card">
            <div className="settings-card-header">
              <div className="settings-card-icon" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
                <Palette size={20} />
              </div>
              <div className="settings-card-title">
                <h2>Theme Colors</h2>
                <p>Select a preset or customize your brand colors.</p>
              </div>
            </div>
            
            <div className="settings-input-group">
              <label className="settings-label">Theme Presets</label>
              <div className="preset-grid">
                {THEME_PRESETS.map(preset => (
                  <button
                    key={preset.id}
                    onClick={() => handlePresetSelect(preset)}
                    className={`preset-card ${settings.theme_preset === preset.id ? 'active' : ''}`}
                  >
                    {preset.id === 'custom' ? (
                      <div className="preset-color-circle" style={{ background: 'var(--card-bg)' }}>
                        <Paintbrush size={18} style={{ color: 'var(--text-muted)' }} />
                      </div>
                    ) : (
                      <div className="preset-color-circle" style={{ backgroundColor: preset.primary }}></div>
                    )}
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: settings.theme_preset === preset.id ? 'var(--accent-primary)' : 'var(--text-main)' }}>
                      {preset.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="color-picker-row">
              <div className="color-picker-box">
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)' }}>Primary Brand Color</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontFamily: 'monospace' }}>{settings.primary_color}</div>
                </div>
                <div className="color-picker-input-wrapper">
                  <input type="color" value={settings.primary_color} onChange={(e) => handleFieldChange('primary_color', e.target.value)} />
                  <div className="color-swatch" style={{ backgroundColor: settings.primary_color }}></div>
                </div>
              </div>
              <div className="color-picker-box">
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)' }}>Accent Color</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontFamily: 'monospace' }}>{settings.accent_color}</div>
                </div>
                <div className="color-picker-input-wrapper">
                  <input type="color" value={settings.accent_color} onChange={(e) => handleFieldChange('accent_color', e.target.value)} />
                  <div className="color-swatch" style={{ backgroundColor: settings.accent_color }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Appearance */}
          <div className="settings-card">
            <div className="settings-card-header">
              <div className="settings-card-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                <Layout size={20} />
              </div>
              <div className="settings-card-title">
                <h2>Appearance</h2>
                <p>Layout and structural styles.</p>
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div className="settings-input-group">
                <label className="settings-label">Sidebar Style</label>
                <SegmentedControl 
                  options={[ { id: 'light', label: 'Light Theme' }, { id: 'dark', label: 'Dark Theme' } ]}
                  value={settings.sidebar_style}
                  onChange={(val) => handleFieldChange('sidebar_style', val)}
                />
              </div>
              
              <div className="settings-input-group">
                <label className="settings-label">Header Style</label>
                <SegmentedControl 
                  options={[ { id: 'solid', label: 'Solid Color' }, { id: 'transparent', label: 'Transparent Background' } ]}
                  value={settings.header_style}
                  onChange={(val) => handleFieldChange('header_style', val)}
                />
              </div>

              <div className="settings-input-group">
                <label className="settings-label">Card Style</label>
                <SegmentedControl 
                  options={[ { id: 'modern', label: 'Modern UI' }, { id: 'rounded', label: 'Highly Rounded' }, { id: 'minimal', label: 'Minimalist Square' } ]}
                  value={settings.card_style}
                  onChange={(val) => handleFieldChange('card_style', val)}
                />
              </div>
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="advanced-accordion">
            <button className="advanced-accordion-header" onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ padding: '0.5rem', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                  <Settings size={18} />
                </div>
                Advanced Theme Settings
              </div>
              {isAdvancedOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            
            {isAdvancedOpen && (
              <div className="advanced-accordion-content animate-slide-down">
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Fine-tune individual colors for maximum control. Recommended only for advanced users.</p>
                <div className="advanced-color-grid">
                  {[
                    { label: 'Primary', key: 'primary_color' },
                    { label: 'Secondary', key: 'secondary_color' },
                    { label: 'Sidebar', key: 'sidebar_color' },
                    { label: 'Card BG', key: 'card_color' },
                    { label: 'Text', key: 'text_color' },
                    { label: 'Border', key: 'border_color' },
                    { label: 'Danger', key: 'danger_color' },
                    { label: 'Success', key: 'success_color' }
                  ].map(color => (
                    <div key={color.key} style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-default)' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>{color.label}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div className="color-picker-input-wrapper" style={{ width: '2.5rem', height: '2.5rem', borderRadius: '8px' }}>
                          <input type="color" value={settings[color.key] || '#ffffff'} onChange={(e) => handleFieldChange(color.key, e.target.value)} />
                          <div className="color-swatch" style={{ backgroundColor: settings[color.key] || '#ffffff' }}></div>
                        </div>
                        <input 
                          type="text" 
                          value={settings[color.key] || ''} 
                          onChange={(e) => handleFieldChange(color.key, e.target.value)}
                          className="settings-input"
                          style={{ padding: '0.5rem', fontSize: '0.75rem', fontFamily: 'monospace' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN (35%) */}
        <div className="settings-right-column animate-slide-up" style={{ animationDelay: '0.1s' }}>
          
          <div className="sticky-preview">
            <div className="preview-card">
              <div className="preview-header">
                <div className="preview-dots">
                  <div className="preview-dot red"></div>
                  <div className="preview-dot yellow"></div>
                  <div className="preview-dot green"></div>
                </div>
                <div className="preview-controls">
                  <button className={previewMode === 'desktop' ? 'active' : ''} onClick={() => setPreviewMode('desktop')}><Monitor size={14} /></button>
                  <button className={previewMode === 'tablet' ? 'active' : ''} onClick={() => setPreviewMode('tablet')}><Tablet size={14} /></button>
                  <button className={previewMode === 'mobile' ? 'active' : ''} onClick={() => setPreviewMode('mobile')}><Smartphone size={14} /></button>
                </div>
              </div>

              <div className="preview-body">
                <div 
                  className={`preview-frame ${previewMode}`}
                  style={{
                    backgroundColor: settings.background_color || '#f8fafc',
                    borderRadius: settings.card_style === 'rounded' ? '24px' : settings.card_style === 'minimal' ? '4px' : '12px'
                  }}
                >
                  {/* Mock Sidebar */}
                  {previewMode !== 'mobile' && (
                    <div 
                      style={{
                        width: '180px',
                        display: 'flex',
                        flexDirection: 'column',
                        borderRight: `1px solid ${settings.border_color || 'rgba(0,0,0,0.1)'}`,
                        backgroundColor: settings.sidebar_style === 'dark' ? '#0f172a' : '#ffffff'
                      }}
                    >
                      <div style={{ padding: '1rem', borderBottom: `1px solid ${settings.border_color || 'rgba(0,0,0,0.1)'}`, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {settings.logo_url ? (
                          <img src={settings.logo_url} alt="Logo" style={{ width: '24px', height: '24px', borderRadius: '6px', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '24px', height: '24px', borderRadius: '6px', backgroundColor: '#e2e8f0' }}></div>
                        )}
                        <span style={{ fontSize: '0.875rem', fontWeight: 700, color: settings.sidebar_style === 'dark' ? '#fff' : '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {settings.restaurant_name || 'Restaurant'}
                        </span>
                      </div>
                      <div style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {[1, 2, 3].map(i => (
                          <div key={i} style={{ height: '32px', borderRadius: '8px', opacity: i === 1 ? 1 : 0.4, backgroundColor: i === 1 ? settings.primary_color : (settings.sidebar_style === 'dark' ? '#1e293b' : '#f1f5f9') }}></div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Mock Content */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <div style={{ height: '56px', flexShrink: 0, borderBottom: `1px solid ${settings.border_color || 'rgba(0,0,0,0.1)'}`, backgroundColor: settings.header_style === 'transparent' ? 'transparent' : '#ffffff', display: 'flex', alignItems: 'center', padding: '0 1rem', justifyContent: 'space-between' }}>
                      {previewMode === 'mobile' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ width: '20px', height: '20px', borderRadius: '6px', backgroundColor: '#e2e8f0' }}></div>
                          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: settings.text_color || '#0f172a' }}>{settings.restaurant_name || 'Restaurant'}</span>
                        </div>
                      )}
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', marginLeft: 'auto', backgroundColor: settings.primary_color }}></div>
                    </div>
                    
                    {settings.banner_url && (
                      <div style={{ height: '120px', width: '100%', flexShrink: 0, position: 'relative', overflow: 'hidden', backgroundColor: '#e2e8f0' }}>
                        <img src={settings.banner_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)', display: 'flex', alignItems: 'flex-end', padding: '1rem' }}>
                          <span style={{ color: '#fff', fontWeight: 700, fontSize: '1rem' }}>{settings.brand_tagline || 'Welcome!'}</span>
                        </div>
                      </div>
                    )}

                    <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1, overflowY: 'auto' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button style={{ padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600, color: '#fff', border: 'none', backgroundColor: settings.button_color || settings.primary_color }}>Primary</button>
                        <button style={{ padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600, border: `1px solid ${settings.primary_color}`, color: settings.primary_color, backgroundColor: 'transparent' }}>Secondary</button>
                      </div>
                      <div style={{ display: 'flex', gap: '1rem' }}>
                        {[1, 2].map(i => (
                          <div key={i} style={{ flex: 1, padding: '1rem', border: `1px solid ${settings.border_color || 'rgba(0,0,0,0.1)'}`, backgroundColor: settings.card_color || '#fff', borderRadius: settings.card_style === 'rounded' ? '16px' : settings.card_style === 'minimal' ? '0px' : '8px' }}>
                            <div style={{ width: '100%', height: '80px', borderRadius: '8px', backgroundColor: settings.background_color, marginBottom: '1rem' }}></div>
                            <div style={{ width: '80%', height: '12px', borderRadius: '4px', backgroundColor: settings.primary_color, marginBottom: '0.5rem' }}></div>
                            <div style={{ width: '60%', height: '8px', borderRadius: '4px', backgroundColor: '#e2e8f0' }}></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="settings-card" style={{ marginTop: '0.5rem' }}>
            <div className="settings-card-header">
              <div className="settings-card-icon" style={{ background: 'rgba(236, 72, 153, 0.1)', color: '#ec4899' }}>
                <ImageIcon size={20} />
              </div>
              <div className="settings-card-title">
                <h2>Media Assets</h2>
                <p>Banners and extra images.</p>
              </div>
            </div>
            <ImageUploadBox title="Hero Banner" field="banner_url" value={settings.banner_url} compact={true} />
            <ImageUploadBox title="Splash Screen" field="splash_url" value={settings.splash_url} compact={true} />
            <ImageUploadBox title="Favicon" field="favicon_url" value={settings.favicon_url} compact={true} />
          </div>

        </div>

      </div>

      {/* Sticky Save Bar */}
      {isDirty && (
        <div className="sticky-save-bar">
          <div className="sticky-save-inner">
            <div>
              <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-main)' }}>Unsaved Changes</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Please save your changes to apply them across the platform.</div>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={handleDiscard} className="btn-secondary">Discard</button>
              <button onClick={handleSaveSettings} disabled={isLoading} className="btn-premium">
                <Save size={16} /> {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
