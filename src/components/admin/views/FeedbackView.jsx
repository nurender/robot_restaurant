import { Star } from 'lucide-react';

export default function FeedbackView({ feedbackList }) {
  return (
    <div className="view-container animate-slide-up view-container-deep">
      <div className="view-header-row mb-8">
        <div className="header-left">
          <h1 className="view-title ext-cls-46d76c78" >Customer Sentiments</h1>
          <p className="text-muted ext-cls-a6a615ae" >Direct qualitative feedback from neural session endpoints.</p>
        </div>
      </div>

      <div className="glass-panel glass-panel-styled">
        <table className="table-styled">
          <thead>
            <tr className="table-header-row">
              <th  className="ext-cls-fddc565a">TIMESTAMP</th>
              <th  className="ext-cls-fddc565a">CUSTOMER</th>
              <th  className="ext-cls-fddc565a">TABLE</th>
              <th  className="ext-cls-fddc565a">RATING</th>
              <th  className="ext-cls-fddc565a">COMMENT</th>
            </tr>
          </thead>
          <tbody>
            {feedbackList.map((f, i) => (
              <tr key={i}  className="ext-cls-9f54b374">
                <td  className="ext-cls-bf74304d">{new Date(f.created_at).toLocaleString()}</td>
                <td  className="ext-cls-fddc565a">
                  <div  className="ext-cls-dc3bece4">
                    <span  className="ext-cls-9f42a204">{f.customer_name || 'Anonymous'}</span>
                    <span  className="ext-cls-af91b662">{f.customer_phone || 'N/A'}</span>
                  </div>
                </td>
                <td  className="ext-cls-fddc565a"><span className="branch-id-tag">TABLE {f.table_number}</span></td>
                <td  className="ext-cls-fddc565a">
                  <div  className="ext-cls-83bbd88c">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} size={14} fill={s <= f.rating ? '#f1c40f' : 'none'} color={s <= f.rating ? '#f1c40f' : 'var(--text-muted)'} />
                    ))}
                  </div>
                </td>
                <td  className="ext-cls-ef3bfd90">{f.comment || <span  className="ext-cls-dceac6fb">No verbal feedback provided.</span>}</td>
              </tr>
            ))}
            {feedbackList.length === 0 && (
              <tr>
                <td colSpan="5"  className="ext-cls-16e2ef9b">
                  <Star size={48}  className="ext-cls-ac41c0c6" />
                  <p>No customer sentiments recorded yet.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
