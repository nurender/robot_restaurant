import React, { useState, useMemo } from 'react';
import apiService from '../../../services/apiService';
import toast from 'react-hot-toast';
import { GripVertical, Eye, EyeOff, Shield, ArrowUp, ArrowDown, Trash2, Search, SlidersHorizontal, RefreshCw, LayoutGrid, CheckCircle2, HelpCircle, Settings, ChevronRight } from 'lucide-react';
export default function SidebarConfiguratorView({
  orderedSidebar = [],
  setOrderedSidebar
}) {
  const [dragItemIndex, setDragItemIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVisibility, setFilterVisibility] = useState('all');
  const [selectedIds, setSelectedIds] = useState([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [originalSidebar] = useState([...orderedSidebar]);
  if (!orderedSidebar || !Array.isArray(orderedSidebar)) return null;
  const filteredItems = useMemo(() => {
    return orderedSidebar.filter(item => {
      if (!item) return false;
      const matchesSearch = item.label.toLowerCase().includes(searchQuery.toLowerCase()) || (item.path || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesVisibility = filterVisibility === 'all' || filterVisibility === 'visible' && item.is_active || filterVisibility === 'hidden' && !item.is_active;
      return matchesSearch && matchesVisibility;
    });
  }, [orderedSidebar, searchQuery, filterVisibility]);
  const stats = useMemo(() => {
    const total = orderedSidebar.length;
    const visible = orderedSidebar.filter(i => i?.is_active).length;
    const hidden = total - visible;
    return {
      total,
      visible,
      hidden
    };
  }, [orderedSidebar]);
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
  const handleDrop = async index => {
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
  const handleToggleVisibility = async (index, item) => {
    try {
      const updated = [...orderedSidebar];
      updated[index] = {
        ...item,
        is_active: !item.is_active
      };
      setOrderedSidebar(updated);
      setHasUnsavedChanges(true);
      await apiService.toggleSidebarItem(item.id, !item.is_active);
      toast.success(`${item.label} visibility updated`);
    } catch (err) {
      toast.error('Failed to update visibility');
    }
  };
  const handleSaveChanges = async () => {
    try {
      const payload = orderedSidebar.map((it, i) => it ? {
        id: it.id,
        sort_order: i
      } : null).filter(Boolean);
      await apiService.reorderSidebar(payload);
      setHasUnsavedChanges(false);
      toast.success('Sidebar layouts saved successfully!');
    } catch (err) {
      toast.error('Failed to save layout changes');
    }
  };
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
  const toggleSelect = id => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };
  const handleBulkVisibility = async status => {
    if (selectedIds.length === 0) {
      toast.error('No modules selected.');
      return;
    }
    try {
      const updated = orderedSidebar.map(item => {
        if (selectedIds.includes(item.id)) {
          apiService.toggleSidebarItem(item.id, status);
          return {
            ...item,
            is_active: status
          };
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
  return <div className="enterprise-sidebar-configurator animate-slide-up">
      

      {}
      <div className="sc-header-row">
        <div className="sc-title-section">
          <h1>Sidebar Configurator</h1>
          <p>Customize navigation modules, control visibility, organize menu order, and manage sidebar access for your organization.</p>
        </div>
        <div className="header-actions">
          <button onClick={handleResetLayout} className="sc-btn-outline">Reset Layout</button>
          {}
        </div>
      </div>

      {}
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

      {}
      <div className="sc-split-layout">

        {}
        <div className="sc-card">

          {}
          <div className="sc-toolbar">
            <div className="sc-search-wrapper">
              <Search size={14} className="sc-search-icon" />
              <input type="text" placeholder="Search modules..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="sc-search-input" />
            </div>

            <div className="flex gap-2">
              <select value={filterVisibility} onChange={e => setFilterVisibility(e.target.value)} className="saas-select ex-style-a2c11e">
                <option value="all">All Modules</option>
                <option value="visible">Visible Only</option>
                <option value="hidden">Hidden Only</option>
              </select>

              {selectedIds.length > 0 && <div className="flex gap-1.5 animate-fade-in">
                  <button onClick={() => handleBulkVisibility(true)} className="sc-btn-outline ex-style-adc8a6">Bulk Show</button>
                  <button onClick={() => handleBulkVisibility(false)} className="sc-btn-outline ex-style-adc8a6">Bulk Hide</button>
                </div>}
            </div>
          </div>

          {}
          {filteredItems.length === 0 ? <div className="sc-empty-state">
              <Shield size={32} className="opacity-30 mb-2" />
              <p>No modules match your search filters.</p>
            </div> : <div className="sc-modules-list">
              {filteredItems.map((item, index) => {
            const isSelected = selectedIds.includes(item.id);
            const isDragOver = dragOverIndex === index;
            return <div key={item.id} className={`sc-module-card ${dragItemIndex === index ? 'dragging' : ''} ${isDragOver ? 'drag-over' : ''}`} draggable onDragStart={e => handleDragStart(e, index)} onDragOver={e => handleDragOver(e, index)} onDrop={() => handleDrop(index)} onDragEnd={() => {
              setDragItemIndex(null);
              setDragOverIndex(null);
            }}>
                    <div className="sc-module-left">
                      <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(item.id)} className="sc-checkbox" />
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
                      {}
                      <button onClick={() => moveItem(index, 'up')} disabled={index === 0} className="sc-action-btn-mini" style={{
                  opacity: index === 0 ? 0.35 : 1
                }} title="Move Up">
                        <ArrowUp size={12} />
                      </button>
                      <button onClick={() => moveItem(index, 'down')} disabled={index === orderedSidebar.length - 1} className="sc-action-btn-mini" style={{
                  opacity: index === orderedSidebar.length - 1 ? 0.35 : 1
                }} title="Move Down">
                        <ArrowDown size={12} />
                      </button>

                      {}
                      <button onClick={() => handleToggleVisibility(index, item)} className={`saas-switch-btn ${item.is_active ? 'active' : ''}`} title={item.is_active ? 'Hide Module' : 'Show Module'}>
                        <div className="saas-switch-knob" />
                      </button>
                    </div>
                  </div>;
          })}
            </div>}
        </div>

        {}
        <div className="sc-sidebar-preview-panel">
          <div className="preview-sidebar-menu">
            <h4 className="preview-header">Live Sidebar Preview</h4>
            <div className="ex-style-ec119a">
              {orderedSidebar.filter(i => i?.is_active).map((item, idx) => <div key={item.id} className={`preview-item ${idx === 0 ? 'active' : ''}`}>
                  <LayoutGrid size={14} />
                  <span>{item.label}</span>
                  {idx === 0 && <ChevronRight size={12} className="ex-style-8d2f07" />}
                </div>)}
            </div>
          </div>
        </div>

      </div>

      {}
      {hasUnsavedChanges && <div className="sc-sticky-footer animate-slide-up">
          <div className="changes-badge">
            <CheckCircle2 size={14} />
            <span>You have unsaved changes to the sidebar menu ordering layout.</span>
          </div>
          <div className="flex gap-2">
            <button onClick={handleResetLayout} className="sc-btn-outline">Cancel</button>
            <button onClick={handleSaveChanges} className="sc-btn-primary">Save Changes</button>
          </div>
        </div>}

    </div>;
}