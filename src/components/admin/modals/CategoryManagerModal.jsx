import { Plus } from 'lucide-react';
import React from 'react';
import axios from 'axios';
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

  return (
    <div className="modal-overlay" style={{ zIndex: 10000 }}>
      <div className="modal-content glass-panel animate-slide-up" style={{ maxWidth: '600px', width: '95%', padding: '40px', borderRadius: '32px', background: 'var(--card-bg)', border: '1px solid var(--card-border)', boxShadow: 'var(--shadow-2xl)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h3 style={{ fontSize: '28px', fontWeight: '900', color: 'var(--text-main)', letterSpacing: '-0.5px' }}>Neural Categories</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Manage your menu clusters and taxonomies.</p>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', width: '40px', height: '40px', borderRadius: '50%', color: 'var(--text-main)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          <div style={{ display: 'flex', gap: '12px', background: 'var(--bg-deep)', padding: '8px', borderRadius: '20px', border: '1px solid var(--card-border)' }}>
            <input
              type="text"
              style={{ flex: 1, background: 'transparent', border: 'none', padding: '12px 16px', color: 'var(--text-main)', fontSize: '15px', fontWeight: '600', outline: 'none' }}
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

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', maxHeight: '350px', overflowY: 'auto', paddingRight: '8px' }} className="custom-scrollbar">
            {categories.length === 0 ? (
              <div style={{ width: '100%', textAlign: 'center', padding: '40px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px dashed var(--card-border)' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No categories defined yet.</p>
              </div>
            ) : (
              categories.map(cat => (
                <div
                  key={cat.id}
                  style={{
                    background: 'rgba(124, 58, 237, 0.08)',
                    color: 'var(--accent-primary)',
                    padding: '10px 18px',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    fontWeight: '700',
                    fontSize: '14px',
                    border: '1px solid rgba(124, 58, 237, 0.15)',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'default'
                  }}
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
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (window.confirm(`Are you sure you want to delete "${cat.name}"?`)) {
                        try {
                          await axios.delete(`${API_URL}/api/menu/categories/${cat.id}`);
                          fetchData();
                        } catch (err) {
                          alert("Failed to delete category. It might have items assigned to it.");
                        }
                      }
                    }}
                    style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: 'none',
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      color: '#ef4444',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
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
