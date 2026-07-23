import React, { useState, useEffect } from 'react';
import { Building2, Plus, MapPin, Phone, Clock, Edit2, Trash2, QrCode } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { API_URL } from '../../../config';
export default function FoodCourtsView({
  adminUser
}) {
  const [foodCourts, setFoodCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingFC, setEditingFC] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    contact: '',
    manager: '',
    working_hours: '{"mon": {"open": "10:00", "close": "22:00"}}'
  });
  useEffect(() => {
    fetchFoodCourts();
  }, []);
  const fetchFoodCourts = async () => {
    try {
      const res = await fetch(`${API_URL}/api/food-courts`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setFoodCourts(data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load food courts');
    } finally {
      setLoading(false);
    }
  };
  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const url = editingFC ? `${API_URL}/api/food-courts/${editingFC.id}` : `${API_URL}/api/food-courts`;
      const method = editingFC ? 'PUT' : 'POST';
      const payload = {
        ...formData,
        working_hours: JSON.parse(formData.working_hours || '{}')
      };
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        toast.success(editingFC ? 'Food Court updated!' : 'Food Court created!');
        setShowModal(false);
        fetchFoodCourts();
      } else {
        toast.error('Failed to save food court');
      }
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong');
    }
  };
  const handleDelete = async id => {
    if (!window.confirm("Are you sure you want to delete this food court?")) return;
    try {
      const res = await fetch(`${API_URL}/api/food-courts/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
        }
      });
      if (res.ok) {
        toast.success('Food court deleted');
        fetchFoodCourts();
      }
    } catch (err) {
      toast.error('Failed to delete');
    }
  };
  const openEdit = fc => {
    setEditingFC(fc);
    setFormData({
      name: fc.name || '',
      address: fc.address || '',
      city: fc.city || '',
      contact: fc.contact || '',
      manager: fc.manager || '',
      working_hours: JSON.stringify(fc.working_hours || {})
    });
    setShowModal(true);
  };
  const openNew = () => {
    setEditingFC(null);
    setFormData({
      name: '',
      address: '',
      city: '',
      contact: '',
      manager: '',
      working_hours: '{"mon": {"open": "10:00", "close": "22:00"}}'
    });
    setShowModal(true);
  };
  const printMasterQR = fc => {
    try {
      const printWindow = window.open('', '', 'width=600,height=800');
      if (!printWindow) throw new Error("Popup blocker prevented printing.");
      const baseUrl = window.location.origin;
      const url = `${baseUrl}/fc/${fc.id}`;
      const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(url)}`;
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Master QR - ${fc.name}</title>
            <style>
              body { font-family: 'Arial', sans-serif; text-align: center; padding: 40px; color: #111; }
              .container { border: 2px solid #333; border-radius: 16px; padding: 30px; display: inline-block; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
              h1 { margin: 0 0 10px 0; font-size: 28px; color: #1e293b; text-transform: uppercase; letter-spacing: 2px; }
              p { margin: 0 0 30px 0; font-size: 14px; color: #64748b; }
              img { width: 300px; height: 300px; margin-bottom: 20px; border-radius: 12px; }
              .footer-text { font-size: 16px; font-weight: bold; color: #475569; }
            </style>
          </head>
          <body onload="window.print(); window.onafterprint = function(){ window.close(); }">
            <div class="container">
              <h1>${fc.name}</h1>
              <p>Scan to view all available outlets</p>
              <img src="${qrImageUrl}" alt="Master QR Code" />
              <div class="footer-text">DIGITAL FOOD COURT</div>
            </div>
          </body>
        </html>
      `;
      printWindow.document.write(html);
      printWindow.document.close();
    } catch (e) {
      console.error("Print Error:", e);
      toast.error("Failed to generate QR: " + e.message);
    }
  };
  if (adminUser?.role !== 'super_admin') {
    return <div className="view-container">
      <h2>Access Denied</h2>
      <p>Only Super Admins can manage Food Courts.</p>
    </div>;
  }
  return <div className="view-container animate-slide-up">
    <div className="view-header-row">
      <div className="header-left">
        <h1 className="view-title">Food Courts</h1>
        <p className="text-muted">Manage your shared Food Court locations and details.</p>
      </div>
      <button className="btn-primary" onClick={openNew}>
        <Plus size={20} />
        <span>Add Food Court</span>
      </button>
    </div>

    <div className="glass-panel ex-style-d58794">
      {loading ? <p>Loading...</p> : foodCourts.length === 0 ? <p className="text-muted">No food courts created yet.</p> : <div className="ex-style-198a39">
        {foodCourts.map(fc => <div key={fc.id} className="ex-style-81a4a4">
          <div className="ex-style-627b12">
            <div className="ex-style-1c7bba">
              <div className="ex-style-e875e3">
                <Building2 size={24} />
              </div>
              <div>
                <h3 className="ex-style-f3550e">{fc.name}</h3>
                <span className="ex-style-6b4689">
                  ID: {fc.id}
                </span>
              </div>
            </div>
            <div className="ex-style-3c37f6">
              <button onClick={() => printMasterQR(fc)} className="btn-icon ex-style-b12ff2" title="Print Master QR">
                <QrCode size={14} />
              </button>
              <button onClick={() => openEdit(fc)} className="btn-icon ex-style-cce139" title="Edit">
                <Edit2 size={14} />
              </button>
              <button onClick={() => handleDelete(fc.id)} className="btn-icon ex-style-0424e8" title="Delete">
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          <div className="ex-style-f3461a">
            <div className="ex-style-1552d4">
              <MapPin size={14} /> {fc.address || 'No Address'}, {fc.city}
            </div>
            <div className="ex-style-1552d4">
              <Phone size={14} /> {fc.contact || 'No Contact'}
            </div>
            <div className="ex-style-1552d4">
              <Clock size={14} /> {fc.manager ? `Managed by ${fc.manager}` : 'No Manager assigned'}
            </div>
          </div>
        </div>)}
      </div>}
    </div>

    {showModal && <div className="modal-overlay ex-style-e31c2a">
      <div className="modal-content glass-panel animate-slide-up ex-style-b791e2">
        <h2 className="ex-style-ae37f5">
          {editingFC ? 'Edit Food Court' : 'New Food Court'}
        </h2>
        <form onSubmit={handleSubmit} className="ex-style-01998c">
          <div className="form-group">
            <label className="ex-style-49f39e">Food Court Name *</label>
            <input type="text" className="modal-input ex-style-7e7a53" required value={formData.name} onChange={e => setFormData({
              ...formData,
              name: e.target.value
            })} placeholder="e.g. Cyber Hub Food Court" />
          </div>
          <div className="ex-style-06faf2">
            <div className="form-group">
              <label className="ex-style-49f39e">City</label>
              <input type="text" className="modal-input ex-style-7e7a53" value={formData.city} onChange={e => setFormData({
                ...formData,
                city: e.target.value
              })} placeholder="e.g. New York" />
            </div>
            <div className="form-group">
              <label className="ex-style-49f39e">Contact Phone</label>
              <input type="text" className="modal-input ex-style-7e7a53" value={formData.contact} onChange={e => setFormData({
                ...formData,
                contact: e.target.value
              })} placeholder="e.g. +1 234 567 890" />
            </div>
          </div>
          <div className="form-group">
            <label className="ex-style-49f39e">Full Address</label>
            <textarea className="modal-input ex-style-d1d86e" rows="2" value={formData.address} onChange={e => setFormData({
              ...formData,
              address: e.target.value
            })} placeholder="Complete street address" />
          </div>
          <div className="form-group">
            <label className="ex-style-49f39e">Manager Name</label>
            <input type="text" className="modal-input ex-style-7e7a53" value={formData.manager} onChange={e => setFormData({
              ...formData,
              manager: e.target.value
            })} placeholder="e.g. John Doe" />
          </div>
          <div className="form-group">
            <label className="ex-style-49f39e">Working Hours (JSON format)</label>
            <textarea className="modal-input ex-style-61976a" rows="3" value={formData.working_hours} onChange={e => setFormData({
              ...formData,
              working_hours: e.target.value
            })} />
          </div>

          <div className="ex-style-f6bed6">
            <button type="button" onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'} onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} onClick={() => setShowModal(false)} className="ex-style-d3e937">Cancel</button>
            <button type="submit" onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'none'} className="ex-style-2c1a43">{editingFC ? 'Save Changes' : 'Create Food Court'}</button>
          </div>
        </form>
      </div>
    </div>}
  </div>;
}