import { BarChart2, Users } from 'lucide-react';

export default function CustomerDirectoryView({ customers }) {
  return (
    <div className="view-container animate-slide-up view-container-deep">
      <div className="view-header-row mb-8">
        <div className="header-left">
          <h1 className="view-title ext-cls-46d76c78" >Customer Directory</h1>
          <p className="text-muted ext-cls-a6a615ae" >Database of neural network customer profiles and behavior.</p>
        </div>
      </div>

      <div className="glass-panel glass-panel-styled">
        <table className="table-styled">
          <thead>
            <tr className="table-header-row">
              <th  className="ext-cls-fddc565a">NAME</th>
              <th  className="ext-cls-fddc565a">PHONE</th>
              <th  className="ext-cls-fddc565a">ORDERS</th>
              <th  className="ext-cls-fddc565a">TOTAL SPEND</th>
              <th  className="ext-cls-fddc565a">LAST ORDER</th>
              <th  className="ext-cls-fddc565a">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c, i) => (
              <tr key={i} className="table-body-row hover-row">
                <td  className="ext-cls-fddc565a">
                  <div  className="ext-cls-cc0ebbd6">
                    <div  className="ext-cls-0f562a21">
                      {c.name?.charAt(0) || 'U'}
                    </div>
                    <span  className="ext-cls-d71cfe4a">{c.name || 'Anonymous'}</span>
                  </div>
                </td>
                <td  className="ext-cls-5ff2c9c6">{c.phone}</td>
                <td  className="ext-cls-fddc565a">
                  <span  className="ext-cls-80280a61">{c.total_orders || 1}</span>
                </td>
                <td  className="ext-cls-725e691e">₹{Number(c.total_spend || 0).toLocaleString()}</td>
                <td  className="ext-cls-8b4cc2ab">{c.last_order_date ? new Date(c.last_order_date).toLocaleDateString() : 'Recent'}</td>
                <td  className="ext-cls-fddc565a">
                  <button
                    className="btn-global-outline"
                    onClick={() => alert(`Customer Insights for ${c.name || 'Anonymous'}\nPhone: ${c.phone}\nTotal Orders: ${c.total_orders || 1}\nTotal Spend: ₹${c.total_spend || 0}`)}
                  >
                    <BarChart2 size={14} /> View Insights
                  </button>
                </td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td colSpan="4"  className="ext-cls-16e2ef9b">
                  <Users size={48}  className="ext-cls-ac41c0c6" />
                  <p>No neural profiles found in this node.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
