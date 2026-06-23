import { ListTodo, GripVertical } from 'lucide-react';
import { useState } from 'react';
import axios from 'axios';
import { API_URL } from '../../../config';

export default function SidebarConfiguratorView({ orderedSidebar, setOrderedSidebar }) {
  const [dragItemIndex, setDragItemIndex] = useState(null);
  if (!orderedSidebar || !Array.isArray(orderedSidebar)) return null;

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
                onDrop={async () => {
                  const items = [...orderedSidebar];
                  const draggedItem = items[dragItemIndex];
                  items.splice(dragItemIndex, 1);
                  items.splice(index, 0, draggedItem);
                  setOrderedSidebar(items);
                  try {
                    await axios.post(`${API_URL}/api/mgmt/sidebar/reorder`, {
                      orders: items.map((it, i) => it ? { id: it.id, sort_order: i } : null).filter(Boolean)
                    });
                  } catch (err) { alert("Failed to save new order"); }
                }}
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
                          await axios.post(`${API_URL}/api/mgmt/sidebar/toggle`, {
                            id: item.id,
                            is_active: !item.is_active
                          });
                          const updated = [...orderedSidebar];
                          updated[index] = { ...item, is_active: !item.is_active };
                          setOrderedSidebar(updated);
                        } catch (err) { alert("Failed to toggle visibility"); }
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
