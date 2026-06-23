import { ChevronUp, ChevronDown } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../../../config';

export default function MenuOrderView({ orderedMenu, setOrderedMenu, dragItemIndex, setDragItemIndex, fetchData }) {
  return (
    <div className="view-container animate-slide-up view-container-deep">
      <div className="view-header-row mb-8">
        <div className="header-left">
          <h1 className="view-title ext-cls-46d76c78" >Menu Ordering</h1>
          <p className="text-muted ext-cls-a6a615ae" >Arrange the sequence of dishes in your digital menu.</p>
        </div>
        <div  className="ext-cls-78e7532f">
          <button
            className="btn-primary st-cls-855f6b9d"
            onClick={async () => {
              try {
                const payload = orderedMenu.map((item, index) => ({ id: item.id, sort_order: index }));
                await axios.post(`${API_URL}/api/menu/reorder`, { orders: payload });
                alert("Menu sequence synchronized!");
                fetchData('Menu Reordered');
              } catch (e) { alert("Save failed"); }
            }}
            
          >
            Save Sequence
          </button>
        </div>
      </div>

      <div className="glass-panel glass-panel-styled">
        <table className="table-styled">
          <thead  className="ext-cls-df65cc38">
            <tr  className="ext-cls-cd95e8a0">
              <th  className="ext-cls-fddc565a">ORDER</th>
              <th  className="ext-cls-fddc565a">DISH NAME</th>
              <th  className="ext-cls-fddc565a">CATEGORY</th>
              <th  className="ext-cls-5d7d2d8c">CONTROLS</th>
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
                className="menu-order-row"
                style={{
                  background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)'
                }}
              >
                <td  className="ext-cls-fddc565a">
                  <div  className="ext-cls-cc0ebbd6">
                    <span  className="ext-cls-6e57e604">⠿</span>
                    <span  className="ext-cls-0707aabd">{idx + 1}</span>
                  </div>
                </td>
                <td  className="ext-cls-fddc565a">
                  <div  className="ext-cls-cc0ebbd6">
                    {item.image_url && <img src={item.image_url} alt=""  className="ext-cls-88747601" />}
                    <span  className="ext-cls-d71cfe4a">{item.name}</span>
                  </div>
                </td>
                <td  className="ext-cls-fddc565a">
                  <span  className="ext-cls-80abd924">{item.category}</span>
                </td>
                <td  className="ext-cls-5d7d2d8c">
                  <div  className="ext-cls-013653c3">
                    <button
                      disabled={idx === 0}
                      onClick={() => {
                        const newArr = [...orderedMenu];
                        [newArr[idx - 1], newArr[idx]] = [newArr[idx], newArr[idx - 1]];
                        setOrderedMenu(newArr);
                      }}
                      className={`menu-order-control-btn ${idx === 0 ? 'disabled' : ''}`}
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
                      className={`menu-order-control-btn ${idx === orderedMenu.length - 1 ? 'disabled' : ''}`}
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
