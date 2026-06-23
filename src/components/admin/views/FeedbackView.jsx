import { Star } from 'lucide-react';

export default function FeedbackView({ feedbackList }) {
  return (
    <div className="view-container animate-slide-up view-container-deep">
      <div className="view-header-row mb-8">
        <div className="header-left">
          <h1 className="view-title" style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-main)' }}>Customer Sentiments</h1>
          <p className="text-muted" style={{ marginTop: '4px', fontSize: '15px' }}>Direct qualitative feedback from neural session endpoints.</p>
        </div>
      </div>

      <div className="glass-panel glass-panel-styled">
        <table className="table-styled">
          <thead>
            <tr className="table-header-row">
              <th style={{ padding: '20px' }}>TIMESTAMP</th>
              <th style={{ padding: '20px' }}>CUSTOMER</th>
              <th style={{ padding: '20px' }}>TABLE</th>
              <th style={{ padding: '20px' }}>RATING</th>
              <th style={{ padding: '20px' }}>COMMENT</th>
            </tr>
          </thead>
          <tbody>
            {feedbackList.map((f, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--card-border)', color: 'var(--text-main)' }}>
                <td style={{ padding: '20px', fontSize: '13px' }}>{new Date(f.created_at).toLocaleString()}</td>
                <td style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: '700', fontSize: '14px' }}>{f.customer_name || 'Anonymous'}</span>
                    <span style={{ fontSize: '12px', opacity: 0.6 }}>{f.customer_phone || 'N/A'}</span>
                  </div>
                </td>
                <td style={{ padding: '20px' }}><span className="branch-id-tag">TABLE {f.table_number}</span></td>
                <td style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', gap: '2px' }}>
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} size={14} fill={s <= f.rating ? '#f1c40f' : 'none'} color={s <= f.rating ? '#f1c40f' : 'var(--text-muted)'} />
                    ))}
                  </div>
                </td>
                <td style={{ padding: '20px', fontSize: '14px', maxWidth: '400px' }}>{f.comment || <span style={{ opacity: 0.3 }}>No verbal feedback provided.</span>}</td>
              </tr>
            ))}
            {feedbackList.length === 0 && (
              <tr>
                <td colSpan="5" style={{ padding: '80px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <Star size={48} style={{ opacity: 0.1, marginBottom: '16px' }} />
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
