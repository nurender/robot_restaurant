import { Sparkles } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../../../config';

export default function MenuImportReviewModal({
  isOpen,
  onClose,
  extractedReviewData,
  setExtractedReviewData,
  adminUser,
  categories,
  fetchData
}) {
  if (!isOpen || !extractedReviewData) return null;

  const handlePublishLiveMenu = async () => {
    try {
      // Bulk publish extraction variables 
      for (const cat of extractedReviewData.categories) {
        // 1. Create or Check Category mapping
        let catName = cat.name;
        let existingCat = categories.find(c => c.name.toLowerCase() === catName.toLowerCase());
        if (!existingCat) {
          const catRes = await axios.post(`${API_URL}/api/menu/categories`, { name: catName, restaurant_id: adminUser.restaurant_id });
          categories.push({ id: catRes.data.id, name: catName });
        }

        // 2. Publish items
        for (const itm of cat.items) {
          await axios.post(`${API_URL}/api/menu`, {
            restaurant_id: adminUser.restaurant_id,
            name: itm.name,
            category: catName,
            price: itm.base_price || itm.price || 0,
            description: itm.description || `${itm.name_hindi || itm.name} freshly served.`,
            is_active: true
          });
        }
      }
      alert("Menu populated successfully!");
      onClose(); // This equates to setShowImportReview(false)
      fetchData();
    } catch (err) {
      alert("Publish failed: " + err.message);
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }}>
      <div className="modal-content glass-panel animate-slide-down" style={{ maxWidth: '800px', width: '90%', maxHeight: '85vh', overflowY: 'auto', padding: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Sparkles className="text-warning" size={24} />
            <h3 style={{ fontSize: '24px', fontWeight: '800' }}>Review Extracted AI Menu</h3>
          </div>
          <button className="text-muted hover:text-white" onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✕</button>
        </div>

        <p className="text-muted mb-6" style={{ fontSize: '14px' }}>Please verify and edit the item details parsed by optical scanning models below.</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {extractedReviewData.categories && extractedReviewData.categories.map((cat, catIdx) => (
            <div key={catIdx} style={{ background: 'var(--bg-deep)', borderRadius: '20px', padding: '24px', border: '1px solid var(--card-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <span style={{ fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--accent-primary)' }}>Category:</span>
                <input
                  type="text"
                  value={cat.name}
                  onChange={(e) => {
                    const updated = { ...extractedReviewData };
                    updated.categories[catIdx].name = e.target.value;
                    setExtractedReviewData(updated);
                  }}
                  style={{ background: 'transparent', border: '1px solid var(--card-border)', padding: '6px 12px', borderRadius: '10px', color: 'var(--text-main)', fontWeight: '700', fontSize: '16px' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {cat.items && cat.items.map((item, itemIdx) => (
                  <div key={itemIdx} style={{ background: 'var(--card-bg)', borderRadius: '14px', padding: '16px', border: '1px solid var(--card-border)', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '16px', alignItems: 'center' }}>
                    <div>
                      <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700' }}>ITEM NAME</label>
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => {
                          const updated = { ...extractedReviewData };
                          updated.categories[catIdx].items[itemIdx].name = e.target.value;
                          setExtractedReviewData(updated);
                        }}
                        style={{ width: '100%', background: 'transparent', border: 'none', color: 'var(--text-main)', fontWeight: '600', padding: '4px 0', borderBottom: '1px solid var(--card-border)' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700' }}>HINDI NAME</label>
                      <input
                        type="text"
                        value={item.name_hindi || ''}
                        onChange={(e) => {
                          const updated = { ...extractedReviewData };
                          updated.categories[catIdx].items[itemIdx].name_hindi = e.target.value;
                          setExtractedReviewData(updated);
                        }}
                        style={{ width: '100%', background: 'transparent', border: 'none', color: 'var(--text-dim)', fontWeight: '600', padding: '4px 0', borderBottom: '1px solid var(--card-border)' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700' }}>PRICE (₹)</label>
                      <input
                        type="number"
                        value={item.base_price || item.price || ''}
                        onChange={(e) => {
                          const updated = { ...extractedReviewData };
                          updated.categories[catIdx].items[itemIdx].price = Number(e.target.value);
                          updated.categories[catIdx].items[itemIdx].base_price = Number(e.target.value);
                          setExtractedReviewData(updated);
                        }}
                        style={{ width: '100%', background: 'transparent', border: 'none', color: 'var(--accent-primary)', fontWeight: '700', padding: '4px 0', borderBottom: '1px solid var(--card-border)' }}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <select
                        value={item.veg_type || 'veg'}
                        onChange={(e) => {
                          const updated = { ...extractedReviewData };
                          updated.categories[catIdx].items[itemIdx].veg_type = e.target.value;
                          setExtractedReviewData(updated);
                        }}
                        style={{ padding: '6px 12px', borderRadius: '10px', fontSize: '12px', background: 'var(--bg-deep)', color: 'var(--text-main)', border: '1px solid var(--card-border)', fontWeight: '600' }}
                      >
                        <option value="veg">Veg</option>
                        <option value="nonveg">Non-Veg</option>
                        <option value="egg">Egg</option>
                      </select>
                      <button
                        onClick={() => {
                          const updated = { ...extractedReviewData };
                          updated.categories[catIdx].items.splice(itemIdx, 1);
                          setExtractedReviewData(updated);
                        }}
                        style={{ background: 'rgba(239, 68, 68, 0.12)', border: 'none', color: 'var(--danger)', borderRadius: '10px', padding: '6px 10px', cursor: 'pointer' }}
                      >✕</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '32px' }}>
          <button className="btn-global-outline" onClick={onClose} >Abort</button>
          <button
            className="btn-global-primary"
            
            onClick={handlePublishLiveMenu}
          >
            Publish Live Menu
          </button>
        </div>
      </div>
    </div>
  );
}
