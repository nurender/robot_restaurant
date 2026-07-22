import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Building2, Utensils, MapPin, Clock, ChevronRight } from 'lucide-react';
import { API_URL } from '../config';
export default function FoodCourtHome() {
  const {
    id
  } = useParams();
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
    return <div className="ex-style-9cfaed">
        <div className="animate-pulse">Loading Food Court...</div>
      </div>;
  }
  if (!foodCourt) {
    return <div className="ex-style-16b3d7">
        <Building2 size={64} className="ex-style-2e4378" />
        <h2>Food Court Not Found</h2>
        <p className="ex-style-24b5ef">The QR code you scanned might be invalid.</p>
      </div>;
  }
  return <div className="ex-style-19ace4">
      {}
      <div style={{
      height: '35vh',
      position: 'relative',
      background: foodCourt.cover_url ? `url(${foodCourt.cover_url}) center/cover` : 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-end',
      padding: '30px'
    }}>
        {}
        <div className="ex-style-12c73e" />
        
        <div className="ex-style-d88ec2">
          <h1 className="ex-style-a9e2ca">
            {foodCourt.logo_url ? <img src={foodCourt.logo_url} alt="" className="ex-style-2334aa" /> : <Building2 />}
            {foodCourt.name}
          </h1>
          
          <div className="ex-style-121dbf">
            {foodCourt.address && <span className="ex-style-45b21a"><MapPin size={14} /> {foodCourt.city}</span>}
            <span className="ex-style-45b21a"><Utensils size={14} /> {foodCourt.restaurants?.length || 0} Outlets</span>
          </div>
        </div>
      </div>

      {}
      <div className="ex-style-c6c2d5">
        <h3 className="ex-style-266d1f">Select an Outlet to Order</h3>
        
        {foodCourt.restaurants && foodCourt.restaurants.length > 0 ? <div className="ex-style-33550d">
            {foodCourt.restaurants.map(rest => <div key={rest.id} onClick={() => navigate(`/?restaurant=${rest.id}`)} onMouseOver={e => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
          e.currentTarget.style.border = '1px solid rgba(124, 58, 237, 0.4)';
        }} onMouseOut={e => {
          e.currentTarget.style.transform = 'none';
          e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
          e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)';
        }} className="ex-style-612a9c">
                <div className="ex-style-2e373c">
                  {rest.logo_url ? <img src={rest.logo_url} alt="" className="ex-style-4f2823" /> : <Utensils size={28} />}
                </div>
                
                <div className="ex-style-68de98">
                  <h4 className="ex-style-d08b19">{rest.name}</h4>
                  <p className="ex-style-0d0aae">
                    {rest.description || 'Tap to view menu & place order'}
                  </p>
                </div>
                
                <ChevronRight size={20} color="#64748b" />
              </div>)}
          </div> : <div className="ex-style-9facf7">
            <p className="ex-style-ea4b97">No active outlets found in this food court yet.</p>
          </div>}
      </div>
    </div>;
}