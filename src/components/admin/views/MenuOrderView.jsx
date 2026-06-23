import { ChevronUp, ChevronDown } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../../../config';

export default function MenuOrderView({ orderedMenu, setOrderedMenu, dragItemIndex, setDragItemIndex, fetchData }) {
  return (
    <div className="view-container animate-slide-up view-container-deep">
      <div className="view-header-row mb-8">
        <div className="header-left">
          <h1 className="view-title" style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-main)' }}>Menu Ordering</h1>
          <p className="text-muted" style={{ marginTop: '4px', fontSize: '15px' }}>Arrange the sequence of dishes in your digital menu.</p>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <button
            className="btn-primary"
            onClick={async () => {
              try {
                const payload = orderedMenu.map((item, index) => ({ id: item.id, sort_order: index }));
                await axios.post(`${API_URL}/api/menu/reorder`, { orders: payload });
                alert("Menu sequence synchronized!");
                fetchData('Menu Reordered');
              } catch (e) { alert("Save failed"); }
            }}
            style={{ background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', padding: '12px 24px', borderRadius: '14px', fontWeight: '800' }}
          >
            Save Sequence
          </button>
        </div>
      </div>

      <div className="glass-panel glass-panel-styled">
        <table className="table-styled">
          <thead style={{ background: 'rgba(255,255,255,0.02)' }}>
            <tr style={{ textAlign: 'left', color: 'var(--text-muted)', fontSize: '13px' }}>
              <th style={{ padding: '20px' }}>ORDER</th>
              <th style={{ padding: '20px' }}>DISH NAME</th>
              <th style={{ padding: '20px' }}>CATEGORY</th>
              <th style={{ padding: '20px', textAlign: 'right' }}>CONTROLS</th>
            </tr>
          </thead>
          <tbody>
            {orderedMenu.map((item, idx) => (
              <tr
                key={item.id}
                draggable
                onDragStart={() => setDragItemIndex(idx)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  const newArr = [...orderedMenu];
                  const draggedItem = newArr.splice(dragItemIndex, 1)[0];
                  newArr.splice(idx, 0, draggedItem);
                  setOrderedMenu(newArr);
                  setDragItemIndex(null);
                }}
                style={{
                  borderBottom: '1px solid var(--card-border)',
                  background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                  cursor: 'grab'
                }}
              >
                <td style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ color: 'var(--text-muted)', cursor: 'grab' }}>⠿</span>
                    <span style={{ background: 'var(--bg-deep)', padding: '4px 12px', borderRadius: '8px', fontWeight: '800', color: 'var(--accent-primary)' }}>{idx + 1}</span>
                  </div>
                </td>
                <td style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {item.image_url && <img src={item.image_url} alt="" style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />}
                    <span style={{ fontWeight: '700' }}>{item.name}</span>
                  </div>
                </td>
                <td style={{ padding: '20px' }}>
                  <span style={{ fontSize: '12px', background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '20px', fontWeight: '600' }}>{item.category}</span>
                </td>
                <td style={{ padding: '20px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button
                      disabled={idx === 0}
                      onClick={() => {
                        const newArr = [...orderedMenu];
                        [newArr[idx - 1], newArr[idx]] = [newArr[idx], newArr[idx - 1]];
                        setOrderedMenu(newArr);
                      }}
                      style={{ padding: '8px', borderRadius: '10px', border: '1px solid var(--card-border)', background: 'var(--bg-deep)', color: 'var(--text-main)', cursor: idx === 0 ? 'not-allowed' : 'pointer', opacity: idx === 0 ? 0.2 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <ChevronUp size={16} />
                    </button>
                    <button
                      disabled={idx === orderedMenu.length - 1}
                      onClick={() => {
                        const newArr = [...orderedMenu];
                        [newArr[idx], newArr[idx + 1]] = [newArr[idx + 1], newArr[idx]];
                        setOrderedMenu(newArr);
                      }}
                      style={{ padding: '8px', borderRadius: '10px', border: '1px solid var(--card-border)', background: 'var(--bg-deep)', color: 'var(--text-main)', cursor: idx === orderedMenu.length - 1 ? 'not-allowed' : 'pointer', opacity: idx === orderedMenu.length - 1 ? 0.2 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <ChevronDown size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
