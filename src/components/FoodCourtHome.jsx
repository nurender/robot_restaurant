import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Building2, Utensils, MapPin, Clock, ChevronRight } from 'lucide-react';
import { API_URL } from '../config';

export default function FoodCourtHome() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [foodCourt, setFoodCourt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await fetch(`${API_URL}/api/food-courts/${id}`);
        if (res.ok) {
          const data = await res.json();
          setFoodCourt(data);
        }
      } catch (err) {
        console.error('Failed to fetch food court:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: '#fff' }}>
        <div className="animate-pulse">Loading Food Court...</div>
      </div>
    );
  }

  if (!foodCourt) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: '#fff' }}>
        <Building2 size={64} style={{ opacity: 0.2, marginBottom: '20px' }} />
        <h2>Food Court Not Found</h2>
        <p style={{ color: 'rgba(255,255,255,0.6)' }}>The QR code you scanned might be invalid.</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#fff', fontFamily: "'Inter', sans-serif" }}>
      {/* Hero Section */}
      <div style={{ 
        height: '35vh', 
        position: 'relative', 
        background: foodCourt.cover_url ? `url(${foodCourt.cover_url}) center/cover` : 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: '30px'
      }}>
        {/* Dark Overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #0f172a 0%, transparent 100%)' }} />
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ margin: '0 0 10px 0', fontSize: '32px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '12px' }}>
            {foodCourt.logo_url ? <img src={foodCourt.logo_url} style={{ height: '40px', width: '40px', borderRadius: '8px' }} alt="" /> : <Building2 />}
            {foodCourt.name}
          </h1>
          
          <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: 'rgba(255,255,255,0.7)', flexWrap: 'wrap' }}>
            {foodCourt.address && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={14} /> {foodCourt.city}</span>
            )}
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Utensils size={14} /> {foodCourt.restaurants?.length || 0} Outlets</span>
          </div>
        </div>
      </div>

      {/* Restaurants List */}
      <div style={{ padding: '30px' }}>
        <h3 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: '600', color: '#e2e8f0' }}>Select an Outlet to Order</h3>
        
        {foodCourt.restaurants && foodCourt.restaurants.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {foodCourt.restaurants.map(rest => (
              <div 
                key={rest.id}
                onClick={() => navigate(`/?restaurant=${rest.id}`)}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '16px',
                  padding: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                  e.currentTarget.style.border = '1px solid rgba(124, 58, 237, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                  e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)';
                }}
              >
                <div style={{ width: '60px', height: '60px', borderRadius: '12px', background: 'rgba(124, 58, 237, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7c3aed', flexShrink: 0, overflow: 'hidden' }}>
                  {rest.logo_url ? <img src={rest.logo_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : <Utensils size={28} />}
                </div>
                
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '600', color: '#f8fafc' }}>{rest.name}</h4>
                  <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {rest.description || 'Tap to view menu & place order'}
                  </p>
                </div>
                
                <ChevronRight size={20} color="#64748b" />
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '40px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '16px' }}>
            <p style={{ color: 'rgba(255,255,255,0.5)' }}>No active outlets found in this food court yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
