import { Send, CheckCircle, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import apiService from '../../../services/apiService';
export default function MarketingHubView({
  coupons,
  customers
}) {
  const [targetAudience, setTargetAudience] = useState('all');
  const [couponCode, setCouponCode] = useState(coupons[0]?.code || '');
  const [templateBody, setTemplateBody] = useState('Hi {name}, we miss you! Here is a special discount for your next visit. Use code {code}.');
  const [isBlasting, setIsBlasting] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [excludedPhones, setExcludedPhones] = useState(new Set());
  const [campaignChannel, setCampaignChannel] = useState('whatsapp');
  const [activeTab, setActiveTab] = useState('campaigns');
  const [marketingConfig, setMarketingConfig] = useState({
    smtp_user: '',
    smtp_pass: '',
    meta_access_token: '',
    meta_phone_id: '',
    meta_template: ''
  });
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [expandedCampaignId, setExpandedCampaignId] = useState(null);
  const [campaignMessages, setCampaignMessages] = useState([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
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
      if (res.data.data) setMarketingConfig({
        ...marketingConfig,
        ...res.data.data
      });
    } catch (e) {}
  };
  const handleSaveConfig = async () => {
    setIsSavingConfig(true);
    try {
      const restaurantId = localStorage.getItem('restaurant_id') || 4;
      await apiService.saveMarketingConfig({
        restaurant_id: restaurantId,
        ...marketingConfig
      });
      toast.success('Configuration saved successfully!');
    } catch (e) {
      toast.error('Failed to save config');
    }
    setIsSavingConfig(false);
  };
  const fetchCampaigns = async () => {
    try {
      const restaurantId = localStorage.getItem('restaurant_id') || 4;
      const res = await apiService.getCampaigns(restaurantId);
      setCampaigns(res.data.data || []);
      if (expandedCampaignId) {
        fetchCampaignMessages(expandedCampaignId);
      }
    } catch (err) {
      console.error(err);
    }
  };
  const fetchCampaignMessages = async campaignId => {
    setIsLoadingMessages(true);
    try {
      const res = await apiService.getCampaignMessages(campaignId);
      setCampaignMessages(res.data.data || []);
    } catch (err) {}
    setIsLoadingMessages(false);
  };
  const handleToggleCampaignInfo = campaignId => {
    if (expandedCampaignId === campaignId) {
      setExpandedCampaignId(null);
      setCampaignMessages([]);
    } else {
      setExpandedCampaignId(campaignId);
      fetchCampaignMessages(campaignId);
    }
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
  return <div className="view-container animate-slide-up view-container-deep">
      <div className="view-header-row mb-10">
        <div className="header-left">
          <h1 className="view-title ext-cls-46d76c78">Marketing Hub</h1>
          <p className="text-muted ext-cls-a6a615ae">Automated engagement and loyalty orchestration.</p>
        </div>
      </div>

      <div className="ex-style-9ea1b3">
        <button className={`btn-secondary ${activeTab === 'campaigns' ? 'active-tab' : ''}`} style={{
        background: activeTab === 'campaigns' ? 'var(--accent-primary)' : '',
        color: activeTab === 'campaigns' ? '#fff' : ''
      }} onClick={() => setActiveTab('campaigns')}>Launch & History</button>
        <button className={`btn-secondary ${activeTab === 'config' ? 'active-tab' : ''}`} style={{
        background: activeTab === 'config' ? 'var(--accent-primary)' : '',
        color: activeTab === 'config' ? '#fff' : ''
      }} onClick={() => setActiveTab('config')}>API Configuration</button>
      </div>

      {activeTab === 'campaigns' ? <div className="ext-cls-8ccfe086">
          <div className="glass-panel ext-cls-ad458a07">
            <h3 className="ext-cls-ae6542b2">Launch Campaign</h3>

            {}
            <div className="ex-style-36977b">
              <button style={{
            flex: 1,
            padding: '10px',
            borderRadius: '8px',
            transition: 'all 0.2s',
            background: campaignChannel === 'whatsapp' ? 'var(--accent-primary)' : 'transparent',
            color: campaignChannel === 'whatsapp' ? '#fff' : 'var(--text-muted)',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 'bold'
          }} onClick={() => setCampaignChannel('whatsapp')}>
                WhatsApp
              </button>
              <button style={{
            flex: 1,
            padding: '10px',
            borderRadius: '8px',
            transition: 'all 0.2s',
            background: campaignChannel === 'email' ? 'var(--accent-primary)' : 'transparent',
            color: campaignChannel === 'email' ? '#fff' : 'var(--text-muted)',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 'bold'
          }} onClick={() => setCampaignChannel('email')}>
                Email
              </button>
            </div>

            <div className="ext-cls-21558a0c">
              <div>
                <label className="ext-cls-0c40bbfd">SELECT AUDIENCE</label>
                <select className="ext-cls-9a29e908" value={targetAudience} onChange={e => setTargetAudience(e.target.value)}>
                  <option value="all">All Neural Profiles</option>
                  <option value="high_spenders">Top 10% High Spenders (&gt;= 5000)</option>
                  <option value="inactive">Inactive (Last 30 Days)</option>
                </select>
                <div className="mt-2 text-muted ex-style-ada520">
                  {targetAudience === 'all' && "Sends the campaign to every customer who has ever placed an order or registered in the database."}
                  {targetAudience === 'high_spenders' && "Sends only to loyal VIP customers whose total accumulated spend across all visits is ₹5000 or greater."}
                  {targetAudience === 'inactive' && "Sends to customers who haven't placed any order in the last 30 days to encourage them to return."}
                </div>

                {}
                <div className="mt-3 ex-style-4a4cf0">
                  <div className="ex-style-d86997">
                    Targeted Users ({filteredAudience.filter(c => !excludedPhones.has(c.phone)).length} of {filteredAudience.length})
                  </div>
                  <div className="custom-scrollbar ex-style-f2a938">
                    {filteredAudience.length === 0 ? <div className="text-muted text-center ex-style-c0937c">No users match this criteria.</div> : filteredAudience.map((user, idx) => {
                  const isSelected = !excludedPhones.has(user.phone);
                  return <div key={idx} style={{
                    padding: '6px 12px',
                    borderBottom: '1px solid var(--border-default)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '13px',
                    opacity: isSelected ? 1 : 0.5,
                    transition: 'all 0.2s'
                  }}>
                            <div className="ex-style-1552d4">
                              <input type="checkbox" checked={isSelected} onChange={() => {
                        setExcludedPhones(prev => {
                          const map = new Set(prev);
                          if (isSelected) map.add(user.phone);else map.delete(user.phone);
                          return map;
                        });
                      }} className="ex-style-628b95" />
                              <div className="ex-style-3f0385">
                                {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                              </div>
                              <div>
                                <div>{user.name || 'Unknown'}</div>
                                <div className="text-muted ex-style-3cef7c">{campaignChannel === 'email' ? user.email : user.phone}</div>
                              </div>
                            </div>
                            <div className="text-muted ex-style-03afaa">
                              <div>Spend: ₹{user.total_spend || 0}</div>
                              {user.last_order_date && <div>Last: {new Date(user.last_order_date).toLocaleDateString()}</div>}
                            </div>
                          </div>;
                })}
                  </div>
                </div>
              </div>
              <div>
                <label className="ext-cls-0c40bbfd">COUPON CODE</label>
                <select className="ext-cls-9a29e908" value={couponCode} onChange={e => setCouponCode(e.target.value)}>
                  <option value="">No Coupon</option>
                  {coupons.map(c => <option key={c.id} value={c.code}>{c.code} - {c.discount_value}% Off</option>)}
                </select>
              </div>
              <div>
                <label className="ext-cls-0c40bbfd">MESSAGE PRESET</label>
                <textarea rows="4" value={templateBody} onChange={e => setTemplateBody(e.target.value)} className="ext-cls-9a29e908" />
              </div>
              <button className="btn-global-primary" onClick={handleLaunchCampaign} disabled={isBlasting}>
                {isBlasting ? <div className="spinner-small" /> : <><Send size={18} /> Blast Campaign API</>}
              </button>
              <p className="text-muted mt-2 ex-style-83f23d">
                Beta API connected. Messages will be queued in PostgreSQL and handled by the background process.
              </p>
            </div>
          </div>

          <div className="glass-panel ext-cls-ad458a07 ex-style-01998c">
            <h3 className="ext-cls-ae6542b2">Recent Campaigns</h3>
            <div className="custom-scrollbar ex-style-1743a9">
              {campaigns.length === 0 ? <p className="text-muted">No campaigns sent yet.</p> : campaigns.map((camp, idx) => <div key={idx} className="ex-style-47f94d">
                    <div onClick={() => handleToggleCampaignInfo(camp.id)} className="ex-style-6852d0">
                      <strong>{camp.name}</strong>
                      <span className={`status-pill ${camp.status === 'completed' ? 'active' : ''}`}>{camp.status.toUpperCase()}</span>
                    </div>
                    <div className="ex-style-82cd30">
                      Target: <strong>{camp.target_audience}</strong> | Delivered: <strong>{camp.total_delivered}/{camp.total_sent}</strong> | Coupon: <strong>{camp.coupon_code || 'None'}</strong>
                    </div>
                    <div className="ex-style-e615bd">
                      {camp.name.toLowerCase().includes('(email)') ? <span>📧 Sent via Email (From: {marketingConfig && marketingConfig.smtp_user || 'System Default'})</span> : <span>🟢 Sent via Phone/WhatsApp (Meta API)</span>}
                    </div>

                    {expandedCampaignId === camp.id && <div className="ex-style-6fd7cf">
                        <div className="ex-style-bd93c9">
                          <h4 className="ex-style-fe807b">Message Sent:</h4>
                          <p className="ex-style-2d3527">
                            "{camp.template_body}"
                          </p>
                        </div>

                        <h4 className="ex-style-f28282">Delivery Status</h4>
                        {isLoadingMessages ? <div className="ex-style-2a950b">Loading records...</div> : <div className="custom-scrollbar ex-style-0feac3">
                            {campaignMessages.length === 0 ? <div className="ex-style-2a950b">No messages found</div> : campaignMessages.map(msg => <div key={msg.id} className="ex-style-a19a01">
                                  <div className="ex-style-7fd33c">
                                    <strong className="ex-style-7c899d">{msg.customer_name || 'Unknown'}</strong> ({camp.name.toLowerCase().includes('(email)') ? msg.customer_email || 'Missing email' : msg.customer_phone || 'Missing phone'})
                                  </div>
                                  <div style={{
                    color: msg.status === 'delivered' ? '#4ade80' : msg.status === 'failed' ? '#f87171' : 'var(--text-muted)',
                    textTransform: 'capitalize'
                  }}>
                                    {msg.status}
                                  </div>
                                </div>)}
                          </div>}
                      </div>}
                  </div>)}
            </div>
          </div>
        </div> : <div className="glass-panel ext-cls-ad458a07 ex-style-f8a3d6">
          <h3 className="ext-cls-ae6542b2">API Credentials & Templates</h3>
          <p className="text-muted text-sm mb-4">Provide your keys here so emails and WhatsApp messages are sent via your own accounts.</p>

          <div className="ex-style-e0ff1f">
            {}
            <div className="ex-style-7c02c2">
              <h4 className="ex-style-0d0e9f">📧 Email (SMTP)</h4>
              <div className="form-group">
                <label className="text-xs text-muted">Sender Email</label>
                <input type="text" className="modal-input" placeholder="e.g. hello@myrestaurant.com" value={marketingConfig.smtp_user || ''} onChange={e => setMarketingConfig({
              ...marketingConfig,
              smtp_user: e.target.value
            })} />
              </div>
              <div className="form-group mt-3">
                <label className="text-xs text-muted">App Password / SMTP Password</label>
                <input type="password" className="modal-input" placeholder="••••••••" value={marketingConfig.smtp_pass || ''} onChange={e => setMarketingConfig({
              ...marketingConfig,
              smtp_pass: e.target.value
            })} />
              </div>
            </div>

            {}
            <div className="ex-style-7c02c2">
              <h4 className="ex-style-0d0e9f">🟢 WhatsApp (Meta API)</h4>
              <div className="form-group">
                <label className="text-xs text-muted">Phone Number ID</label>
                <input type="text" className="modal-input" placeholder="e.g. 10293xxx" value={marketingConfig.meta_phone_id || ''} onChange={e => setMarketingConfig({
              ...marketingConfig,
              meta_phone_id: e.target.value
            })} />
              </div>
              <div className="form-group mt-3">
                <label className="text-xs text-muted">Permanent Access Token</label>
                <input type="password" className="modal-input" placeholder="EAAIxxx..." value={marketingConfig.meta_access_token || ''} onChange={e => setMarketingConfig({
              ...marketingConfig,
              meta_access_token: e.target.value
            })} />
              </div>
              <div className="form-group mt-3">
                <label className="text-xs text-muted">Approved Template Name</label>
                <input type="text" className="modal-input" placeholder="e.g. flash_sale_offer" value={marketingConfig.meta_template || ''} onChange={e => setMarketingConfig({
              ...marketingConfig,
              meta_template: e.target.value
            })} />
              </div>
            </div>
          </div>

          <div className="mt-4 ex-style-d03b54">
            <button className="btn-primary" onClick={handleSaveConfig} disabled={isSavingConfig}>
              {isSavingConfig ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </div>}
    </div>;
}