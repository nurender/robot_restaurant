import { Send, CheckCircle, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import apiService from '../../../services/apiService';

export default function MarketingHubView({ coupons, customers }) {
  const [targetAudience, setTargetAudience] = useState('all');
  const [couponCode, setCouponCode] = useState(coupons[0]?.code || '');
  const [templateBody, setTemplateBody] = useState('Hi {name}, we miss you! Here is a special discount for your next visit. Use code {code}.');
  const [isBlasting, setIsBlasting] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [excludedPhones, setExcludedPhones] = useState(new Set());
  const [campaignChannel, setCampaignChannel] = useState('whatsapp');

  const [activeTab, setActiveTab] = useState('campaigns'); // 'campaigns' | 'config'
  const [marketingConfig, setMarketingConfig] = useState({
    smtp_user: '', smtp_pass: '', meta_access_token: '', meta_phone_id: '', meta_template: ''
  });
  const [isSavingConfig, setIsSavingConfig] = useState(false);

  useEffect(() => {
    setExcludedPhones(new Set());
  }, [targetAudience]);

  useEffect(() => {
    fetchCampaigns();
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const restaurantId = localStorage.getItem('restaurant_id') || 4;
      const res = await apiService.getMarketingConfig(restaurantId);
      if (res.data.data) setMarketingConfig({ ...marketingConfig, ...res.data.data });
    } catch(e) {}
  };

  const handleSaveConfig = async () => {
    setIsSavingConfig(true);
    try {
      const restaurantId = localStorage.getItem('restaurant_id') || 4;
      await apiService.saveMarketingConfig({ restaurant_id: restaurantId, ...marketingConfig });
      toast.success('Configuration saved successfully!');
    } catch(e) {
      toast.error('Failed to save config');
    }
    setIsSavingConfig(false);
  };

  const fetchCampaigns = async () => {
    try {
      const restaurantId = localStorage.getItem('restaurant_id') || 4;
      const res = await apiService.getCampaigns(restaurantId);
      setCampaigns(res.data.data || []);
    } catch (err) { console.error(err); }
  };

  const handleLaunchCampaign = async () => {
    setIsBlasting(true);
    try {
      const payload = {
        name: `Campaign ${new Date().toISOString().split('T')[0]}`,
        target_audience: targetAudience,
        coupon_code: couponCode,
        template_body: templateBody,
        excluded_phones: Array.from(excludedPhones),
        channel: campaignChannel,
        restaurant_id: localStorage.getItem('restaurant_id')
      };
      const res = await apiService.launchCampaign(payload);
      if (res.data.success) {
        toast.success(res.data.message || 'Campaign queued successfully!');
        fetchCampaigns();
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to launch campaign');
    } finally {
      setIsBlasting(false);
    }
  };

  const filteredAudience = (customers || []).filter(c => {
    if (campaignChannel === 'email' && !c.email) return false;

    if (targetAudience === 'all') return true;
    if (targetAudience === 'high_spenders') return c.total_spend >= 5000;
    if (targetAudience === 'inactive') {
      if (!c.last_order_date) return true;
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return new Date(c.last_order_date) < thirtyDaysAgo;
    }
    return true;
  });

  return (
    <div className="view-container animate-slide-up view-container-deep">
      <div className="view-header-row mb-10">
        <div className="header-left">
          <h1 className="view-title ext-cls-46d76c78" >Marketing Hub</h1>
          <p className="text-muted ext-cls-a6a615ae" >Automated engagement and loyalty orchestration.</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button className={`btn-secondary ${activeTab === 'campaigns' ? 'active-tab' : ''}`} style={{ background: activeTab === 'campaigns' ? 'var(--accent-primary)' : '', color: activeTab === 'campaigns' ? '#fff' : '' }} onClick={() => setActiveTab('campaigns')}>Launch & History</button>
        <button className={`btn-secondary ${activeTab === 'config' ? 'active-tab' : ''}`} style={{ background: activeTab === 'config' ? 'var(--accent-primary)' : '', color: activeTab === 'config' ? '#fff' : '' }} onClick={() => setActiveTab('config')}>API Configuration</button>
      </div>

      {activeTab === 'campaigns' ? (
      <div className="ext-cls-8ccfe086">
        <div className="glass-panel ext-cls-ad458a07" >
          <h3 className="ext-cls-ae6542b2">Launch Campaign</h3>

          {/* Channel Tabs */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', background: 'var(--bg-deep)', padding: '6px', borderRadius: '12px' }}>
            <button
              style={{ flex: 1, padding: '10px', borderRadius: '8px', transition: 'all 0.2s', background: campaignChannel === 'whatsapp' ? 'var(--accent-primary)' : 'transparent', color: campaignChannel === 'whatsapp' ? '#fff' : 'var(--text-muted)', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
              onClick={() => setCampaignChannel('whatsapp')}
            >
              WhatsApp
            </button>
            <button
              style={{ flex: 1, padding: '10px', borderRadius: '8px', transition: 'all 0.2s', background: campaignChannel === 'email' ? 'var(--accent-primary)' : 'transparent', color: campaignChannel === 'email' ? '#fff' : 'var(--text-muted)', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
              onClick={() => setCampaignChannel('email')}
            >
              Email
            </button>
          </div>

          <div className="ext-cls-21558a0c">
            <div>
              <label className="ext-cls-0c40bbfd">SELECT AUDIENCE</label>
              <select className="ext-cls-9a29e908" value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)}>
                <option value="all">All Neural Profiles</option>
                <option value="high_spenders">Top 10% High Spenders (&gt;= 5000)</option>
                <option value="inactive">Inactive (Last 30 Days)</option>
              </select>
              <div className="mt-2 text-muted" style={{ fontSize: '13px', padding: '8px', background: 'var(--bg-deep)', borderRadius: '6px', border: '1px solid var(--border-default)' }}>
                {targetAudience === 'all' && "Sends the campaign to every customer who has ever placed an order or registered in the database."}
                {targetAudience === 'high_spenders' && "Sends only to loyal VIP customers whose total accumulated spend across all visits is ₹5000 or greater."}
                {targetAudience === 'inactive' && "Sends to customers who haven't placed any order in the last 30 days to encourage them to return."}
              </div>

              {/* Audience Preview List */}
              <div className="mt-3" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-default)', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ padding: '8px 12px', background: 'var(--bg-deep)', borderBottom: '1px solid var(--border-default)', fontSize: '12px', fontWeight: 'bold' }}>
                  Targeted Users ({filteredAudience.filter(c => !excludedPhones.has(c.phone)).length} of {filteredAudience.length})
                </div>
                <div className="custom-scrollbar" style={{ maxHeight: '150px', overflowY: 'auto', padding: '8px 0' }}>
                  {filteredAudience.length === 0 ? (
                    <div className="text-muted text-center" style={{ fontSize: '13px', padding: '10px' }}>No users match this criteria.</div>
                  ) : (
                    filteredAudience.map((user, idx) => {
                      const isSelected = !excludedPhones.has(user.phone);
                      return (
                        <div key={idx} style={{ padding: '6px 12px', borderBottom: '1px solid var(--border-default)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', opacity: isSelected ? 1 : 0.5, transition: 'all 0.2s' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {
                                setExcludedPhones(prev => {
                                  const map = new Set(prev);
                                  if (isSelected) map.add(user.phone);
                                  else map.delete(user.phone);
                                  return map;
                                });
                              }}
                              style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: 'var(--accent-primary)' }}
                            />
                            <div style={{ width: '24px', height: '24px', background: 'var(--bg-deep)', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', border: '1px solid var(--border-default)' }}>
                              {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                            </div>
                            <div>
                              <div>{user.name || 'Unknown'}</div>
                              <div className="text-muted" style={{ fontSize: '11px' }}>{campaignChannel === 'email' ? user.email : user.phone}</div>
                            </div>
                          </div>
                          <div className="text-muted" style={{ fontSize: '12px', textAlign: 'right' }}>
                            <div>Spend: ₹{user.total_spend || 0}</div>
                            {user.last_order_date && <div>Last: {new Date(user.last_order_date).toLocaleDateString()}</div>}
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            </div>
            <div>
              <label className="ext-cls-0c40bbfd">COUPON CODE</label>
              <select className="ext-cls-9a29e908" value={couponCode} onChange={(e) => setCouponCode(e.target.value)}>
                <option value="">No Coupon</option>
                {coupons.map(c => <option key={c.id} value={c.code}>{c.code} - {c.discount_value}% Off</option>)}
              </select>
            </div>
            <div>
              <label className="ext-cls-0c40bbfd">MESSAGE PRESET</label>
              <textarea
                rows="4"
                value={templateBody}
                onChange={(e) => setTemplateBody(e.target.value)}
                className="ext-cls-9a29e908" />
            </div>
            <button className="btn-global-primary" onClick={handleLaunchCampaign} disabled={isBlasting}>
              {isBlasting ? <div className="spinner-small" /> : <><Send size={18} /> Blast Campaign API</>}
            </button>
            <p className="text-muted mt-2" style={{ fontSize: '12px' }}>
              Beta API connected. Messages will be queued in PostgreSQL and handled by the background process.
            </p>
          </div>
        </div>

        <div className="glass-panel ext-cls-ad458a07" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 className="ext-cls-ae6542b2">Recent Campaigns</h3>
          <div className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto' }}>
            {campaigns.length === 0 ? (
              <p className="text-muted">No campaigns sent yet.</p>
            ) : (
              campaigns.map((camp, idx) => (
                <div key={idx} style={{ padding: '12px', background: 'var(--bg-deep)', borderRadius: '12px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong>{camp.name}</strong>
                    <span className={`status-pill ${camp.status === 'completed' ? 'active' : ''}`}>{camp.status.toUpperCase()}</span>
                  </div>
                  <div style={{ marginTop: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
                    Target: <strong>{camp.target_audience}</strong> | Delivered: <strong>{camp.total_delivered}/{camp.total_sent}</strong>
                  </div>
                  <div style={{ marginTop: '4px', fontSize: '12px', color: 'var(--accent-primary)', opacity: 0.9 }}>
                    {camp.name.toLowerCase().includes('(email)') ? (
                      <span>📧 Sent via Email (From: nurenderbishnoi29292929@gmail.com)</span>
                    ) : (
                      <span>🟢 Sent via Phone/WhatsApp (Meta API)</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      ) : (
      <div className="glass-panel ext-cls-ad458a07" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h3 className="ext-cls-ae6542b2">API Credentials & Templates</h3>
          <p className="text-muted text-sm mb-4">Provide your keys here so emails and WhatsApp messages are sent via your own accounts.</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {/* Email Settings */}
            <div style={{ background: 'var(--bg-deep)', padding: '16px', borderRadius: '12px' }}>
              <h4 style={{ marginBottom: '12px', color: '#fff' }}>📧 Email (SMTP)</h4>
              <div className="form-group">
                <label className="text-xs text-muted">Sender Email</label>
                <input type="text" className="modal-input" placeholder="e.g. hello@myrestaurant.com" value={marketingConfig.smtp_user || ''} onChange={e => setMarketingConfig({...marketingConfig, smtp_user: e.target.value})} />
              </div>
              <div className="form-group mt-3">
                <label className="text-xs text-muted">App Password / SMTP Password</label>
                <input type="password" className="modal-input" placeholder="••••••••" value={marketingConfig.smtp_pass || ''} onChange={e => setMarketingConfig({...marketingConfig, smtp_pass: e.target.value})} />
              </div>
            </div>

            {/* WhatsApp Settings */}
            <div style={{ background: 'var(--bg-deep)', padding: '16px', borderRadius: '12px' }}>
              <h4 style={{ marginBottom: '12px', color: '#fff' }}>🟢 WhatsApp (Meta API)</h4>
              <div className="form-group">
                <label className="text-xs text-muted">Phone Number ID</label>
                <input type="text" className="modal-input" placeholder="e.g. 10293xxx" value={marketingConfig.meta_phone_id || ''} onChange={e => setMarketingConfig({...marketingConfig, meta_phone_id: e.target.value})} />
              </div>
              <div className="form-group mt-3">
                <label className="text-xs text-muted">Permanent Access Token</label>
                <input type="password" className="modal-input" placeholder="EAAIxxx..." value={marketingConfig.meta_access_token || ''} onChange={e => setMarketingConfig({...marketingConfig, meta_access_token: e.target.value})} />
              </div>
              <div className="form-group mt-3">
                <label className="text-xs text-muted">Approved Template Name</label>
                <input type="text" className="modal-input" placeholder="e.g. flash_sale_offer" value={marketingConfig.meta_template || ''} onChange={e => setMarketingConfig({...marketingConfig, meta_template: e.target.value})} />
              </div>
            </div>
          </div>
          
          <div className="mt-4" style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn-primary" onClick={handleSaveConfig} disabled={isSavingConfig}>
              {isSavingConfig ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
      </div>
      )}
    </div>
  );
}
