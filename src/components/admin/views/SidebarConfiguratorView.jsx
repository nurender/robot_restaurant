import React, { useState, useMemo } from 'react';
import apiService from '../../../services/apiService';
import toast from 'react-hot-toast';
import {
  GripVertical, Eye, EyeOff, Shield, ArrowUp, ArrowDown, Trash2,
  Search, SlidersHorizontal, RefreshCw, LayoutGrid, CheckCircle2,
  HelpCircle, Settings, ChevronRight
} from 'lucide-react';

export default function SidebarConfiguratorView({ orderedSidebar = [], setOrderedSidebar }) {
  const [dragItemIndex, setDragItemIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVisibility, setFilterVisibility] = useState('all'); // 'all', 'visible', 'hidden'
  const [selectedIds, setSelectedIds] = useState([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [originalSidebar] = useState([...orderedSidebar]);

  if (!orderedSidebar || !Array.isArray(orderedSidebar)) return null;

  // Search & Filter items
  const filteredItems = useMemo(() => {
    return orderedSidebar.filter(item => {
      if (!item) return false;
      const matchesSearch = item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.path || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchesVisibility = filterVisibility === 'all' ||
        (filterVisibility === 'visible' && item.is_active) ||
        (filterVisibility === 'hidden' && !item.is_active);

      return matchesSearch && matchesVisibility;
    });
  }, [orderedSidebar, searchQuery, filterVisibility]);

  // Statistics counters
  const stats = useMemo(() => {
    const total = orderedSidebar.length;
    const visible = orderedSidebar.filter(i => i?.is_active).length;
    const hidden = total - visible;
    return { total, visible, hidden };
  }, [orderedSidebar]);

  // Drag & Drop Handlers
  const handleDragStart = (e, index) => {
    setDragItemIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = async (index) => {
    if (dragItemIndex === null || dragItemIndex === index) return;

    const items = [...orderedSidebar];
    const draggedItem = items[dragItemIndex];
    items.splice(dragItemIndex, 1);
    items.splice(index, 0, draggedItem);

    setOrderedSidebar(items);
    setDragItemIndex(null);
    setDragOverIndex(null);
    setHasUnsavedChanges(true);
  };

  // Toggle Visibility
  const handleToggleVisibility = async (index, item) => {
    try {
      const updated = [...orderedSidebar];
      updated[index] = { ...item, is_active: !item.is_active };
      setOrderedSidebar(updated);
      setHasUnsavedChanges(true);
      await apiService.toggleSidebarItem(item.id, !item.is_active);
      toast.success(`${item.label} visibility updated`);
    } catch (err) {
      toast.error('Failed to update visibility');
    }
  };

  // Push Order to DB
  const handleSaveChanges = async () => {
    try {
      const payload = orderedSidebar.map((it, i) => it ? { id: it.id, sort_order: i } : null).filter(Boolean);
      await apiService.reorderSidebar(payload);
      setHasUnsavedChanges(false);
      toast.success('Sidebar layouts saved successfully!');
    } catch (err) {
      toast.error('Failed to save layout changes');
    }
  };

  // Move manual arrows
  const moveItem = (index, direction) => {
    const nextIndex = direction === 'up' ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= orderedSidebar.length) return;

    const items = [...orderedSidebar];
    const targetItem = items[index];
    items.splice(index, 1);
    items.splice(nextIndex, 0, targetItem);
    setOrderedSidebar(items);
    setHasUnsavedChanges(true);
  };

  const handleResetLayout = () => {
    setOrderedSidebar([...originalSidebar]);
    setHasUnsavedChanges(false);
    toast.success('Layout reset to initial state');
  };

  // Bulk operations
  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleBulkVisibility = async (status) => {
    if (selectedIds.length === 0) {
      toast.error('No modules selected.');
      return;
    }
    try {
      const updated = orderedSidebar.map(item => {
        if (selectedIds.includes(item.id)) {
          apiService.toggleSidebarItem(item.id, status);
          return { ...item, is_active: status };
        }
        return item;
      });
      setOrderedSidebar(updated);
      setSelectedIds([]);
      toast.success('Bulk visibility update completed');
    } catch (e) {
      toast.error('Bulk update failed');
    }
  };

  return (
    <div className="enterprise-sidebar-configurator animate-slide-up">
      <style>{`
        .enterprise-sidebar-configurator {
          background-color: var(--ap-main-bg, var(--bg-deep)) !important;
          color: var(--ap-text-main, var(--text-main)) !important;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
          min-height: 100vh;
          padding: 24px;
        }

        /* Header block */
        .sc-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--ap-card-bg, var(--card-bg));
          padding: 20px 24px;
          border-radius: 16px;
          border: 1px solid var(--ap-glass-border, var(--border-default));
          box-shadow: 0 1px 3px rgba(0,0,0,0.01);
          margin-bottom: 24px;
        }

        .sc-title-section h1 {
          font-size: 20px;
          font-weight: 800;
          color: var(--ap-text-main, var(--text-main));
          margin: 0;
        }

        .sc-title-section p {
          font-size: 13px;
          color: var(--ap-text-muted, var(--text-muted));
          margin: 4px 0 0 0;
        }

        .sc-btn-primary {
          background-color: var(--ap-accent-color, var(--accent-color)) !important;
          color: #ffffff !important;
          font-weight: 600 !important;
          border-radius: 8px !important;
          padding: 8px 16px !important;
          border: 1px solid var(--ap-accent-color, var(--accent-color)) !important;
          font-size: 13px !important;
          cursor: pointer !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 6px !important;
          transition: all 0.2s !important;
          height: 36px !important;
        }

        .sc-btn-primary:hover {
          background-color: var(--ap-accent-primary, var(--accent-primary)) !important;
        }

        .sc-btn-outline {
          background-color: transparent !important;
          color: var(--ap-text-main, var(--text-main)) !important;
          font-weight: 600 !important;
          border-radius: 8px !important;
          padding: 8px 16px !important;
          border: 1px solid var(--ap-glass-border, var(--border-default)) !important;
          font-size: 13px !important;
          cursor: pointer !important;
          transition: all 0.2s !important;
          height: 36px !important;
        }

        .sc-btn-outline:hover {
          background-color: var(--ap-sidebar-hover, var(--sidebar-hover)) !important;
        }

        /* Stats Cards */
        .sc-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .sc-stat-card {
          background: var(--ap-card-bg, var(--card-bg));
          border: 1px solid var(--ap-glass-border, var(--border-default));
          border-radius: 16px;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.01);
        }

        .sc-stat-icon-wrapper {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .sc-stat-icon-wrapper.blue { background-color: rgba(37, 99, 235, 0.1); color: #3b82f6; }
        .sc-stat-icon-wrapper.green { background-color: var(--success-bg, rgba(16, 185, 129, 0.1)); color: var(--success, #10b981); }
        .sc-stat-icon-wrapper.gray { background-color: var(--bg-tertiary); color: var(--text-muted); }

        .sc-stat-label {
          font-size: 11px;
          font-weight: 700;
          color: var(--ap-text-muted, var(--text-muted));
          text-transform: uppercase;
        }

        .sc-stat-value {
          font-size: 20px;
          font-weight: 800;
          color: var(--ap-text-main, var(--text-main));
          margin: 2px 0 0 0;
        }

        /* Configurator Split layout */
        .sc-split-layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
          margin-bottom: 80px; /* Space for sticky footer */
        }

        @media (min-width: 1024px) {
          .sc-split-layout { grid-template-columns: 65% 35% !important; }
        }

        /* Modules Cards List */
        .sc-card {
          background: var(--ap-card-bg, var(--card-bg));
          border: 1px solid var(--ap-glass-border, var(--border-default));
          border-radius: 16px;
          padding: 20px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.02);
        }

        /* Toolbar */
        .sc-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 20px;
          border-bottom: 1px solid var(--ap-glass-border, var(--border-default));
          padding-bottom: 16px;
        }

        .sc-search-wrapper {
          position: relative;
          min-width: 240px;
        }

        .sc-search-input {
          width: 100%;
          background: var(--bg-tertiary);
          border: 1px solid var(--ap-glass-border, var(--border-default));
          color: var(--ap-text-main, var(--text-main));
          border-radius: 8px;
          padding: 8px 12px 8px 32px;
          font-size: 13px;
          outline: none;
        }

        .sc-search-icon {
          position: absolute;
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--ap-text-muted, var(--text-muted));
        }

        /* Premium Module Card */
        .sc-module-card {
          background: var(--ap-card-bg, var(--card-bg));
          border: 1px solid var(--ap-glass-border, var(--border-default));
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: all 0.2s;
          cursor: grab;
          user-select: none;
        }

        .sc-module-card:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.04);
          border-color: var(--ap-accent-color, var(--accent-color));
        }

        .sc-module-card.dragging {
          opacity: 0.5;
          border: 2px dashed var(--ap-accent-color, var(--accent-color));
          background: var(--ap-sidebar-hover, var(--sidebar-hover));
        }

        .sc-module-card.drag-over {
          border-top: 3px solid var(--ap-accent-color, var(--accent-color));
          transform: translateY(2px);
        }

        .sc-module-left {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
        }

        .sc-checkbox {
          width: 16px;
          height: 16px;
          border-radius: 4px;
          border: 1px solid var(--ap-glass-border, var(--border-default));
          cursor: pointer;
          background: var(--bg-tertiary);
        }

        .sc-drag-puck {
          color: var(--ap-text-muted, var(--text-muted));
          cursor: grab;
        }

        .sc-icon-box {
          width: 36px;
          height: 36px;
          background: var(--bg-tertiary);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--ap-text-muted, var(--text-muted));
        }

        .sc-details {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .sc-name {
          font-size: 13px;
          font-weight: 700;
          color: var(--ap-text-main, var(--text-main));
        }

        .sc-desc {
          font-size: 11px;
          color: var(--ap-text-muted, var(--text-muted));
        }

        .sc-metadata-chips {
          display: flex;
          gap: 6px;
          margin-top: 4px;
        }

        .meta-chip {
          font-size: 9px;
          font-weight: 700;
          text-transform: uppercase;
          padding: 1px 6px;
          border-radius: 4px;
        }

        .meta-chip.core { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
        .meta-chip.admin { background: rgba(236, 72, 153, 0.1); color: #ec4899; }
        .meta-chip.visible { background: var(--success-bg, rgba(16, 185, 129, 0.1)); color: var(--success, #10b981); }
        .meta-chip.hidden { background: var(--bg-tertiary); color: var(--ap-text-muted, var(--text-muted)); }

        /* Controls right */
        .sc-module-controls-right {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .sc-action-btn-mini {
          background: var(--ap-card-bg, var(--card-bg));
          border: 1px solid var(--ap-glass-border, var(--border-default));
          border-radius: 6px;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--ap-text-muted, var(--text-muted));
          transition: all 0.2s;
        }

        .sc-action-btn-mini:hover {
          background: var(--bg-tertiary);
          color: var(--ap-text-main, var(--text-main));
        }

        /* Toggle switch */
        .saas-switch-btn {
          width: 44px;
          height: 22px;
          border-radius: 99px;
          background: var(--bg-tertiary);
          border: 1px solid var(--ap-glass-border, var(--border-default));
          cursor: pointer;
          position: relative;
          padding: 0;
          transition: background-color 0.2s;
        }

        .saas-switch-btn.active {
          background-color: var(--ap-accent-color, var(--accent-color));
          border-color: var(--ap-accent-color, var(--accent-color));
        }

        .saas-switch-knob {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: white;
          position: absolute;
          left: 3px;
          top: 2px;
          transition: left 0.2s;
          box-shadow: 0 1px 3px rgba(0,0,0,0.15);
        }

        .saas-switch-btn.active .saas-switch-knob {
          left: 23px;
        }

        /* Preview Panel */
        .preview-sidebar-menu {
          background: var(--ap-card-bg, var(--card-bg));
          border: 1px solid var(--ap-glass-border, var(--border-default));
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.02);
          position: sticky;
          top: 24px;
        }

        .preview-header {
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--ap-text-muted, var(--text-muted));
          border-bottom: 1px solid var(--ap-glass-border, var(--border-default));
          padding-bottom: 12px;
          margin-bottom: 16px;
        }

        .preview-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 12px;
          font-size: 13px;
          font-weight: 600;
          color: var(--ap-text-muted, var(--text-muted));
          border-radius: 8px;
          margin-bottom: 4px;
        }

        .preview-item.active {
          background: var(--ap-sidebar-hover, var(--sidebar-hover));
          color: var(--ap-accent-color, var(--accent-color));
        }

        /* Sticky Footer Bar */
        .sc-sticky-footer {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: var(--ap-header-bg, var(--header-bg));
          backdrop-filter: blur(10px);
          border-top: 1px solid var(--ap-glass-border, var(--border-default));
          padding: 16px 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          z-index: 1000;
          box-shadow: 0 -4px 15px rgba(0,0,0,0.03);
        }

        .changes-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          font-weight: 700;
          color: var(--warning, #f59e0b);
          background: var(--warning-bg, rgba(245, 158, 11, 0.1));
          padding: 6px 12px;
          border-radius: 8px;
          border: 1px solid rgba(245, 158, 11, 0.2);
        }

        .sc-empty-state {
          padding: 40px;
          text-align: center;
          color: var(--ap-text-muted, var(--text-muted));
        }

      `}</style>

      {/* --- PAGE HEADER --- */}
      <div className="sc-header-row">
        <div className="sc-title-section">
          <h1>Sidebar Configurator</h1>
          <p>Customize navigation modules, control visibility, organize menu order, and manage sidebar access for your organization.</p>
        </div>
        <div className="header-actions">
          <button onClick={handleResetLayout} className="sc-btn-outline">Reset Layout</button>
          {/* <button onClick={handleSaveChanges} className="sc-btn-primary" disabled={!hasUnsavedChanges} style={{ opacity: hasUnsavedChanges ? 1 : 0.65 }}>
            Save Changes
          </button> */}
        </div>
      </div>

      {/* --- STATISTICS KPI CARDS --- */}
      <div className="sc-stats-grid">
        <div className="sc-stat-card">
          <div className="sc-stat-icon-wrapper blue">
            <LayoutGrid size={20} />
          </div>
          <div>
            <span className="sc-stat-label">Total Modules</span>
            <h3 className="sc-stat-value">{stats.total}</h3>
          </div>
        </div>
        <div className="sc-stat-card">
          <div className="sc-stat-icon-wrapper green">
            <Eye size={20} />
          </div>
          <div>
            <span className="sc-stat-label">Visible Modules</span>
            <h3 className="sc-stat-value">{stats.visible}</h3>
          </div>
        </div>
        <div className="sc-stat-card">
          <div className="sc-stat-icon-wrapper gray">
            <EyeOff size={20} />
          </div>
          <div>
            <span className="sc-stat-label">Hidden Modules</span>
            <h3 className="sc-stat-value">{stats.hidden}</h3>
          </div>
        </div>
      </div>

      {/* --- SPLIT LAYOUT --- */}
      <div className="sc-split-layout">

        {/* Left Side: Modules Configurator List */}
        <div className="sc-card">

          {/* Toolbar */}
          <div className="sc-toolbar">
            <div className="sc-search-wrapper">
              <Search size={14} className="sc-search-icon" />
              <input
                type="text"
                placeholder="Search modules..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="sc-search-input"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={filterVisibility}
                onChange={(e) => setFilterVisibility(e.target.value)}
                className="saas-select"
                style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--ap-glass-border, var(--border-default))', borderRadius: '8px', fontSize: '12px', padding: '6px' }}
              >
                <option value="all">All Modules</option>
                <option value="visible">Visible Only</option>
                <option value="hidden">Hidden Only</option>
              </select>

              {selectedIds.length > 0 && (
                <div className="flex gap-1.5 animate-fade-in">
                  <button onClick={() => handleBulkVisibility(true)} className="sc-btn-outline" style={{ fontSize: '11px', height: '28px', padding: '0 8px' }}>Bulk Show</button>
                  <button onClick={() => handleBulkVisibility(false)} className="sc-btn-outline" style={{ fontSize: '11px', height: '28px', padding: '0 8px' }}>Bulk Hide</button>
                </div>
              )}
            </div>
          </div>

          {/* Modules Drag & Drop list */}
          {filteredItems.length === 0 ? (
            <div className="sc-empty-state">
              <Shield size={32} className="opacity-30 mb-2" />
              <p>No modules match your search filters.</p>
            </div>
          ) : (
            <div className="sc-modules-list">
              {filteredItems.map((item, index) => {
                const isSelected = selectedIds.includes(item.id);
                const isDragOver = dragOverIndex === index;

                return (
                  <div
                    key={item.id}
                    className={`sc-module-card ${dragItemIndex === index ? 'dragging' : ''} ${isDragOver ? 'drag-over' : ''}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={() => handleDrop(index)}
                    onDragEnd={() => { setDragItemIndex(null); setDragOverIndex(null); }}
                  >
                    <div className="sc-module-left">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(item.id)}
                        className="sc-checkbox"
                      />
                      <div className="sc-drag-puck">
                        <GripVertical size={14} />
                      </div>
                      <div className="sc-icon-box">
                        <LayoutGrid size={16} />
                      </div>
                      <div className="sc-details">
                        <span className="sc-name">{item.label}</span>
                        <span className="sc-desc">Path route: /admin/{item.path}</span>
                        <div className="sc-metadata-chips">
                          <span className="meta-chip core">Core System</span>
                          <span className="meta-chip admin">Permission: Admin</span>
                          <span className={`meta-chip ${item.is_active ? 'visible' : 'hidden'}`}>
                            {item.is_active ? 'Visible' : 'Hidden'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="sc-module-controls-right">
                      {/* Manual sorting arrow keys */}
                      <button
                        onClick={() => moveItem(index, 'up')}
                        disabled={index === 0}
                        className="sc-action-btn-mini"
                        style={{ opacity: index === 0 ? 0.35 : 1 }}
                        title="Move Up"
                      >
                        <ArrowUp size={12} />
                      </button>
                      <button
                        onClick={() => moveItem(index, 'down')}
                        disabled={index === orderedSidebar.length - 1}
                        className="sc-action-btn-mini"
                        style={{ opacity: index === orderedSidebar.length - 1 ? 0.35 : 1 }}
                        title="Move Down"
                      >
                        <ArrowDown size={12} />
                      </button>

                      {/* Visibility Toggle Switch */}
                      <button
                        onClick={() => handleToggleVisibility(index, item)}
                        className={`saas-switch-btn ${item.is_active ? 'active' : ''}`}
                        title={item.is_active ? 'Hide Module' : 'Show Module'}
                      >
                        <div className="saas-switch-knob" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Side: Live Sidebar Preview Panel */}
        <div className="sc-sidebar-preview-panel">
          <div className="preview-sidebar-menu">
            <h4 className="preview-header">Live Sidebar Preview</h4>
            <div style={{ background: 'var(--bg-tertiary)', borderRadius: '12px', padding: '12px', border: '1px solid var(--ap-glass-border, var(--border-default))' }}>
              {orderedSidebar.filter(i => i?.is_active).map((item, idx) => (
                <div key={item.id} className={`preview-item ${idx === 0 ? 'active' : ''}`}>
                  <LayoutGrid size={14} />
                  <span>{item.label}</span>
                  {idx === 0 && <ChevronRight size={12} style={{ marginLeft: 'auto' }} />}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* --- STICKY FOOTER ACTION BAR --- */}
      {hasUnsavedChanges && (
        <div className="sc-sticky-footer animate-slide-up">
          <div className="changes-badge">
            <CheckCircle2 size={14} />
            <span>You have unsaved changes to the sidebar menu ordering layout.</span>
          </div>
          <div className="flex gap-2">
            <button onClick={handleResetLayout} className="sc-btn-outline">Cancel</button>
            <button onClick={handleSaveChanges} className="sc-btn-primary">Save Changes</button>
          </div>
        </div>
      )}

    </div>
  );
}
