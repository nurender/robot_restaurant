import { ListTodo } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../../../config';

export default function SidebarConfiguratorView({ orderedSidebar, setOrderedSidebar, dragItemIndex, setDragItemIndex }) {
  return (
    <div className="view-container animate-slide-up view-container-deep">
      <div className="view-header-row mb-8">
        <div className="header-left">
          <h1 className="view-title ext-cls-c718dc75" >Sidebar Configurator</h1>
          <p className="text-muted ext-cls-a6a615ae" >Drag to reorder your navigation menu or toggle module visibility.</p>
        </div>
      </div>

      <div className="glass-panel ext-cls-25ce5297" >
        <div  className="ext-cls-48fd353c">
          {orderedSidebar.map((item, index) => (
            <div
              key={item.id}
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
                    order: items.map(it => it.id)
                  });
                } catch (err) { alert("Failed to save new order"); }
              }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '16px 24px', background: 'rgba(255,255,255,0.03)', borderRadius: '18px',
                border: '1px solid rgba(255,255,255,0.05)', cursor: 'grab',
                transition: 'transform 0.2s, background 0.2s',
                opacity: item.is_active ? 1 : 0.4
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
            >
              <div  className="ext-cls-45ebfcb4">
                <div  className="ext-cls-bbbf41f5"><ListTodo size={18} /></div>
                <div>
                  <p  className="ext-cls-e35ad15b">{item.label}</p>
                  <p  className="ext-cls-b98663d3">Module: {item.module_name}</p>
                </div>
              </div>

              <div  className="ext-cls-9eaf11e7">
                <div  className="ext-cls-22fbab1e">
                  <span style={{ fontSize: '10px', fontWeight: '900', color: item.is_active ? 'var(--accent-primary)' : '#666', letterSpacing: '1px' }}>{item.is_active ? 'VISIBLE' : 'HIDDEN'}</span>
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      try {
                        await axios.post(`${API_URL}/api/mgmt/sidebar/toggle/${item.id}`, {
                          is_active: !item.is_active
                        });
                        const updated = [...orderedSidebar];
                        updated[index].is_active = !item.is_active;
                        setOrderedSidebar(updated);
                      } catch (err) { alert("Failed to toggle visibility"); }
                    }}
                    style={{
                      width: '48px', height: '24px', borderRadius: '12px',
                      background: item.is_active ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)',
                      border: 'none', cursor: 'pointer', position: 'relative', marginTop: '6px',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                  >
                    <div style={{
                      width: '18px', height: '18px', borderRadius: '50%', background: 'white',
                      position: 'absolute', top: '3px', left: item.is_active ? '27px' : '3px',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.3)'
                    }} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
