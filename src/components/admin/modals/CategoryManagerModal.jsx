import toast from 'react-hot-toast';
import { Plus } from 'lucide-react';
import React from 'react';
import apiService from '../../../services/apiService';
import { API_URL } from '../../../config';

export default function CategoryManagerModal({
  isOpen,
  onClose,
  categories,
  newCatName,
  setNewCatName,
  handleAddCategory,
  isAdding,
  fetchData
}) {
  if (!isOpen) return null;

  const handleDeleteCategory = async (e, cat) => {
    e.stopPropagation();
    if (await window.customConfirm(`Are you sure you want to delete "${cat.name}"?`)) {
      try {
        await apiService.deleteCategory(cat.id);
        fetchData();
      } catch (err) {
        toast.error("Failed to delete category. It might have items assigned to it.");
      }
    }
  };

  return (
    <div className="modal-overlay ext-cls-e0b4af75" >
      <div className="modal-content glass-panel animate-slide-up ext-cls-b675278c" >
        <div  className="ext-cls-6902f166">
          <div>
            <h3  className="ext-cls-58cd1799">Neural Categories</h3>
            <p  className="ext-cls-90cb03c4">Manage your menu clusters and taxonomies.</p>
          </div>
          <button onClick={onClose}  className="ext-cls-7e7a1f7e">✕</button>
        </div>

        <div  className="ext-cls-450d6700">
          <div  className="ext-cls-e5c85b98">
            <input className="ext-cls-94735f6f" 
              type="text"
              
              placeholder="Enter new cluster name..."
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
            />
            <button
              onClick={handleAddCategory}
              disabled={isAdding}
              style={{ background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)', border: 'none', padding: '12px 24px', borderRadius: '14px', color: 'white', fontWeight: '800', cursor: isAdding ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 15px rgba(124, 58, 237, 0.3)' }}
            >
              {isAdding ? <div className="spinner-small" /> : <><Plus size={20} /> Add</>}
            </button>
          </div>

          <div  className="custom-scrollbar ext-cls-c9d685a2">
            {categories.length === 0 ? (
              <div  className="ext-cls-7be8af63">
                <p  className="ext-cls-6afb1311">No categories defined yet.</p>
              </div>
            ) : (
              categories.map(cat => (
                <div className="ext-cls-9d5e1c9b" 
                  key={cat.id}
                  
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(124, 58, 237, 0.15)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(124, 58, 237, 0.08)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {cat.name}
                  <button
                    onClick={(e) => handleDeleteCategory(e, cat)}
                    className="st-cls-3a00955a"
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>
          <div  className="ext-cls-0ec538d6">
            <button
              className="btn-global-outline"
              onClick={onClose}
              
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
