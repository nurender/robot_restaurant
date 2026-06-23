import { Send } from 'lucide-react';

export default function MarketingHubView({ coupons, customers }) {
  return (
    <div className="view-container animate-slide-up view-container-deep">
      <div className="view-header-row mb-10">
        <div className="header-left">
          <h1 className="view-title ext-cls-46d76c78" >Marketing Hub</h1>
          <p className="text-muted ext-cls-a6a615ae" >Automated engagement and loyalty orchestration.</p>
        </div>
      </div>

      <div  className="ext-cls-8ccfe086">
        <div className="glass-panel ext-cls-ad458a07" >
          <h3  className="ext-cls-ae6542b2">Launch Campaign</h3>
          <div  className="ext-cls-21558a0c">
            <div>
              <label  className="ext-cls-0c40bbfd">SELECT AUDIENCE</label>
              <select  className="ext-cls-9a29e908">
                <option>Top 10% High Spenders</option>
                <option>Inactive (Last 30 Days)</option>
                <option>All Neural Profiles</option>
              </select>
            </div>
            <div>
              <label  className="ext-cls-0c40bbfd">COUPON CODE</label>
              <select  className="ext-cls-9a29e908">
                {coupons.map(c => <option key={c.id}>{c.code} - {c.discount_value}% Off</option>)}
              </select>
            </div>
            <div>
              <label  className="ext-cls-0c40bbfd">MESSAGE PRESET</label>
              <textarea
                rows="4"
                
                defaultValue="Hi {name}, we miss you! Here is a special 20% discount for your next visit. Use code {code}."
              className="ext-cls-9a29e908" />
            </div>
            <button className="btn-global-primary" >
              <Send size={18} /> Blast Campaign via WhatsApp
            </button>
            <p  className="ext-cls-ccd6d1f2">Note: Real-time API integration required for actual delivery.</p>
          </div>
        </div>

        <div className="glass-panel ext-cls-ad458a07" >
          <h3  className="ext-cls-ae6542b2">Top Target Leads</h3>
          <div  className="ext-cls-73683d33">
            {customers.slice(0, 5).map((c, i) => (
              <div key={i}  className="ext-cls-33de44e3">
                <div  className="ext-cls-cc0ebbd6">
                  <div  className="ext-cls-ecd58a19">{c.name.charAt(0)}</div>
                  <div>
                    <div  className="ext-cls-d71cfe4a">{c.name}</div>
                    <div  className="ext-cls-b98663d3">Spent: ₹{c.total_spend}</div>
                  </div>
                </div>
                <div className="status-pill active ext-cls-2b8184be" >HIGH VALUE</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
