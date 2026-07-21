import React, { useState, useEffect } from 'react';
import { Building2, Plus, MapPin, Phone, Clock, Edit2, Trash2, QrCode } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { API_URL } from '../../../config';

export default function FoodCourtsView({ adminUser }) {
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
        headers: { 'Authorization': `Bearer ${localStorage.getItem('jwt_token')}` }
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

  const handleSubmit = async (e) => {
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

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this food court?")) return;
    
    try {
      const res = await fetch(`${API_URL}/api/food-courts/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('jwt_token')}` }
      });
      if (res.ok) {
        toast.success('Food court deleted');
        fetchFoodCourts();
      }
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const openEdit = (fc) => {
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

  const printMasterQR = (fc) => {
    try {
      const printWindow = window.open('', '', 'width=600,height=800');
      if (!printWindow) throw new Error("Popup blocker prevented printing.");

      // Use the actual domain in production, for now fallback to window.location.origin
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
    return (
      <div className="view-container">
        <h2>Access Denied</h2>
        <p>Only Super Admins can manage Food Courts.</p>
      </div>
    );
  }

  return (
    <div className="view-container animate-slide-up">
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

      <div className="glass-panel" style={{ padding: '24px' }}>
        {loading ? (
           <p>Loading...</p>
        ) : foodCourts.length === 0 ? (
           <p className="text-muted">No food courts created yet.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {foodCourts.map(fc => (
              <div key={fc.id} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ padding: '12px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', borderRadius: '12px' }}>
                      <Building2 size={24} />
                    </div>
                    <div>
                      <h3 style={{ margin: '0 0 4px 0', fontSize: '18px' }}>{fc.name}</h3>
                      <span style={{ fontSize: '12px', background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                        ID: {fc.id}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => printMasterQR(fc)} className="btn-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer' }} title="Print Master QR">
                      <QrCode size={14} />
                    </button>
                    <button onClick={() => openEdit(fc)} className="btn-icon" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer' }} title="Edit">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => handleDelete(fc.id)} className="btn-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer' }} title="Delete">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin size={14} /> {fc.address || 'No Address'}, {fc.city}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Phone size={14} /> {fc.contact || 'No Contact'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={14} /> {fc.manager ? `Managed by ${fc.manager}` : 'No Manager assigned'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}>
          <div className="modal-content glass-panel animate-slide-up" style={{ marginTop: '18vh', maxWidth: '600px', width: '90%', padding: '32px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
            <h2 style={{ marginBottom: '24px', fontSize: '24px', fontWeight: '700', color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '16px' }}>
              {editingFC ? 'Edit Food Court' : 'New Food Court'}
            </h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="form-group">
                <label style={{ fontSize: '11px', fontWeight: '800', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', display: 'block' }}>Food Court Name *</label>
                <input type="text" className="modal-input" style={{ width: '100%', padding: '12px 16px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '14px', outline: 'none' }} required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Cyber Hub Food Court" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="form-group">
                  <label style={{ fontSize: '11px', fontWeight: '800', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', display: 'block' }}>City</label>
                  <input type="text" className="modal-input" style={{ width: '100%', padding: '12px 16px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '14px', outline: 'none' }} value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} placeholder="e.g. New York" />
                </div>
                <div className="form-group">
                  <label style={{ fontSize: '11px', fontWeight: '800', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', display: 'block' }}>Contact Phone</label>
                  <input type="text" className="modal-input" style={{ width: '100%', padding: '12px 16px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '14px', outline: 'none' }} value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})} placeholder="e.g. +1 234 567 890" />
                </div>
              </div>
              <div className="form-group">
                <label style={{ fontSize: '11px', fontWeight: '800', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', display: 'block' }}>Full Address</label>
                <textarea className="modal-input" rows="2" style={{ width: '100%', padding: '12px 16px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '14px', outline: 'none', resize: 'vertical' }} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Complete street address" />
              </div>
              <div className="form-group">
                <label style={{ fontSize: '11px', fontWeight: '800', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', display: 'block' }}>Manager Name</label>
                <input type="text" className="modal-input" style={{ width: '100%', padding: '12px 16px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '14px', outline: 'none' }} value={formData.manager} onChange={e => setFormData({...formData, manager: e.target.value})} placeholder="e.g. John Doe" />
              </div>
              <div className="form-group">
                <label style={{ fontSize: '11px', fontWeight: '800', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', display: 'block' }}>Working Hours (JSON format)</label>
                <textarea className="modal-input" rows="3" style={{ width: '100%', padding: '12px 16px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#10b981', fontSize: '13px', fontFamily: 'monospace', outline: 'none', resize: 'vertical' }} value={formData.working_hours} onChange={e => setFormData({...formData, working_hours: e.target.value})} />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <button type="button" style={{ padding: '12px 24px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'} onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" style={{ padding: '12px 24px', borderRadius: '12px', background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: '600', boxShadow: '0 4px 15px rgba(124, 58, 237, 0.4)', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'none'}>{editingFC ? 'Save Changes' : 'Create Food Court'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
