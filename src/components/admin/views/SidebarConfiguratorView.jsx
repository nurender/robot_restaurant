import apiService from '../../../services/apiService';
import toast from 'react-hot-toast';
import { ListTodo, GripVertical } from 'lucide-react';
import { useState } from 'react';
import { API_URL } from '../../../config';

export default function SidebarConfiguratorView({ orderedSidebar, setOrderedSidebar }) {
  const [dragItemIndex, setDragItemIndex] = useState(null);
  if (!orderedSidebar || !Array.isArray(orderedSidebar)) return null;

  const handleDrop = async (index) => {
    const items = [...orderedSidebar];
    const draggedItem = items[dragItemIndex];
    items.splice(dragItemIndex, 1);
    items.splice(index, 0, draggedItem);
    setOrderedSidebar(items);
    try {
      const payload = items.map((it, i) => it ? { id: it.id, sort_order: i } : null).filter(Boolean);
      await apiService.reorderSidebar(payload);
    } catch (err) { toast.error('Failed to save new order'); }
  };

  const handleToggle = async (e, index, item) => {
    e.stopPropagation();
    try {
      await apiService.toggleSidebarItem(item.id, !item.is_active);
      const updated = [...orderedSidebar];
      updated[index] = { ...item, is_active: !item.is_active };
      setOrderedSidebar(updated);
    } catch (err) { toast.error('Failed to toggle visibility'); }
  };


  return (
    <div className="view-container animate-slide-up view-container-deep">
      <div className="view-header-row mb-8">
        <div className="header-left">
          <h1 className="view-title">Sidebar Configurator</h1>
          <p className="text-muted">Drag to reorder your navigation menu or toggle module visibility.</p>
        </div>
      </div>

      <div className="glass-panel">
        <div className="sc-list">
          {orderedSidebar.map((item, index) => {
            if (!item) return null; // Prevent crash on undefined items
            return (
              <div
                key={item.id}
                className={`sc-item ${!item.is_active ? 'sc-item-hidden' : ''}`}
                draggable
                onDragStart={() => setDragItemIndex(index)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(index)}
              >
                <div className="sc-item-left">
                  <div className="sc-drag-handle">
                    <GripVertical size={16} />
                  </div>
                  <div className="sc-icon">
                    <ListTodo size={18} />
                  </div>
                  <div className="sc-details">
                    <p className="sc-label">{item.label}</p>
                    <p className="sc-module">Module: {item.module_name}</p>
                  </div>
                </div>

                <div className="sc-item-right">
                  <div className="sc-toggle-wrapper">
                    <span className={`sc-status ${item.is_active ? 'sc-status-visible' : 'sc-status-hidden'}`}>
                      {item.is_active ? 'VISIBLE' : 'HIDDEN'}
                    </span>
                    <button
                      className={`sc-toggle-btn ${item.is_active ? 'active' : ''}`}
                      onClick={async (e) => {
                        e.stopPropagation();
                        try {
                          const updated = [...orderedSidebar];
                          updated[index] = { ...item, is_active: !item.is_active };
                          setOrderedSidebar(updated);
                        } catch (err) { toast.error("Failed to toggle visibility"); }
                      }}
                    >
                      <div className="sc-toggle-knob" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
