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
    <div className="modal-overlay ext-cls-dd6e81bf" >
      <div className="modal-content glass-panel animate-slide-down ext-cls-956fe062" >
        <div  className="ext-cls-72e6eb14">
          <div  className="ext-cls-cc0ebbd6">
            <Sparkles className="text-warning" size={24} />
            <h3  className="ext-cls-97744935">Review Extracted AI Menu</h3>
          </div>
          <button className="text-muted hover:text-white ext-cls-8fd31018" onClick={onClose} >✕</button>
        </div>

        <p className="text-muted mb-6 ext-cls-947cedd7" >Please verify and edit the item details parsed by optical scanning models below.</p>

        <div  className="ext-cls-e6f83a76">
          {extractedReviewData.categories && extractedReviewData.categories.map((cat, catIdx) => (
            <div key={catIdx}  className="ext-cls-50925be6">
              <div  className="ext-cls-e98a66b4">
                <span  className="ext-cls-012db373">Category:</span>
                <input
                  type="text"
                  value={cat.name}
                  onChange={(e) => {
                    const updated = { ...extractedReviewData };
                    updated.categories[catIdx].name = e.target.value;
                    setExtractedReviewData(updated);
                  }}
                  className="st-cls-6068dcac"
                />
              </div>

              <div  className="ext-cls-73683d33">
                {cat.items && cat.items.map((item, itemIdx) => (
                  <div key={itemIdx}  className="ext-cls-2c572851">
                    <div>
                      <label  className="ext-cls-e3b7f7e8">ITEM NAME</label>
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => {
                          const updated = { ...extractedReviewData };
                          updated.categories[catIdx].items[itemIdx].name = e.target.value;
                          setExtractedReviewData(updated);
                        }}
                        className="st-cls-8b294391"
                      />
                    </div>

                    <div>
                      <label  className="ext-cls-e3b7f7e8">HINDI NAME</label>
                      <input
                        type="text"
                        value={item.name_hindi || ''}
                        onChange={(e) => {
                          const updated = { ...extractedReviewData };
                          updated.categories[catIdx].items[itemIdx].name_hindi = e.target.value;
                          setExtractedReviewData(updated);
                        }}
                        className="st-cls-e6514299"
                      />
                    </div>

                    <div>
                      <label  className="ext-cls-e3b7f7e8">PRICE (₹)</label>
                      <input
                        type="number"
                        value={item.base_price || item.price || ''}
                        onChange={(e) => {
                          const updated = { ...extractedReviewData };
                          updated.categories[catIdx].items[itemIdx].price = Number(e.target.value);
                          updated.categories[catIdx].items[itemIdx].base_price = Number(e.target.value);
                          setExtractedReviewData(updated);
                        }}
                        className="st-cls-d6a97b87"
                      />
                    </div>

                    <div  className="ext-cls-3643ba81">
                      <select
                        value={item.veg_type || 'veg'}
                        onChange={(e) => {
                          const updated = { ...extractedReviewData };
                          updated.categories[catIdx].items[itemIdx].veg_type = e.target.value;
                          setExtractedReviewData(updated);
                        }}
                        className="st-cls-93d34588"
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
                        className="st-cls-2a513c90"
                      >✕</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div  className="ext-cls-f8ad01a3">
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
