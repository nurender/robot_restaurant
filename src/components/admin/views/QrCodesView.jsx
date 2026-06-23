import { Edit2, Trash2, ListTodo, Plus } from 'lucide-react';
import React from 'react';
import axios from 'axios';
import { API_URL } from '../../../config';

export default function QrCodesView({ restaurantTables, adminUser, fetchData, printTableQR }) {
  return (
    <div className="view-container animate-slide-up view-container-deep">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="view-title" style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-main)' }}>Tables & QR Codes</h1>
          <p className="text-muted" style={{ marginTop: '4px', fontSize: '15px' }}>Dine-in Customer ordering entry endpoints.</p>
        </div>
        <button
          onClick={async () => {
            const nextId = restaurantTables.length + 1;
            const tableName = prompt("Enter Table Name/Label:", `Table ${nextId}`);
            if (!tableName) return;

            const randomSecret = `T${nextId}-DINE${Math.floor(1000 + Math.random() * 9000)}`;
            try {
              const res = await axios.post(`${API_URL}/api/tables`, {
                table_number: nextId,
                secret_token: randomSecret,
                restaurant_id: adminUser.restaurant_id || 4,
                name: tableName
              });
              fetchData('New Table Added');
            } catch (err) { alert("Persistence failed"); }
          }}
          className="btn-global-primary"
          
        >
          <Plus size={18} /> Add New Table
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
        {restaurantTables.map((t, idx) => {
          const tokenVal = t.secret_token || t.token;
          const liveUrl = `${window.location.origin}/?s=${tokenVal}`;
          return (
            <div key={idx} className="glass-panel" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', padding: '24px', borderRadius: '20px', boxShadow: 'var(--shadow-md)', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ padding: '16px', background: 'white', borderRadius: '16px', width: '160px', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(liveUrl)}`}
                  alt="Scannable QR Code"
                  style={{ width: '130px', height: '130px', objectFit: 'contain' }}
                />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {t.name || t.table || `Table ${t.table_number}`}
                <button
                  onClick={() => {
                    const newName = prompt("Edit Table Name:", t.name || t.table);
                    if (newName) {
                      axios.put(`${API_URL}/api/tables/${t.id}`, { name: newName, table_number: t.table_number })
                        .then(() => fetchData('Table Updated'));
                    }
                  }}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px', borderRadius: '4px', display: 'flex', alignItems: 'center', transition: 'all 0.2s' }}
                >
                  <Edit2 size={14} />
                </button>
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-deep)', padding: '6px 12px', borderRadius: '8px', width: '100%', justifyContent: 'center' }}>
                <div style={{ fontSize: '12px', color: 'var(--accent-primary)', fontWeight: '700', wordBreak: 'break-all' }}>{tokenVal}</div>
                <button
                  onClick={() => {
                    const newKey = prompt("Edit Secret Key (Token):", tokenVal);
                    if (newKey) {
                      axios.put(`${API_URL}/api/tables/${t.id}`, { name: t.name || t.table, table_number: t.table_number, secret_token: newKey })
                        .then(() => fetchData('Key Updated'));
                    }
                  }}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}
                >
                  <Edit2 size={12} />
                </button>
              </div>

              <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(liveUrl);
                    alert("Table URL copied to clipboard!");
                  }}
                  className="btn-global-primary"
                  
                >
                  Copy Link
                </button>
                <button
                  onClick={() => printTableQR(liveUrl, t.name || t.table || `Table ${t.table_number}`)}
                  style={{ padding: '10px 16px', borderRadius: '12px', fontWeight: '800', fontSize: '13px', flex: 1, border: 'none', cursor: 'pointer', background: 'var(--success)', color: 'white' }}
                >
                  Print QR
                </button>
                <button
                  onClick={async () => {
                    if (window.confirm("Are you sure you want to delete this table?")) {
                      try {
                        await axios.delete(`${API_URL}/api/tables/${t.id}`);
                        fetchData('Table Deleted');
                      } catch (err) { alert("Delete failed"); }
                    }
                  }}
                  style={{ padding: '10px', borderRadius: '12px', border: '1px solid var(--danger)', color: 'var(--danger)', background: 'transparent', cursor: 'pointer' }}
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <button
                onClick={() => {
                  fetch(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(liveUrl)}`)
                    .then(response => response.blob())
                    .then(blob => {
                      const blobUrl = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = blobUrl;
                      a.download = `${t.table}_QR.png`;
                      document.body.appendChild(a);
                      a.click();
                      a.remove();
                      window.URL.revokeObjectURL(blobUrl);
                    })
                    .catch(() => alert("Download failed"));
                }}
                style={{ padding: '10px 16px', borderRadius: '12px', fontWeight: '700', fontSize: '13px', width: '100%', border: '1px solid var(--card-border)', background: 'transparent', color: 'var(--text-main)', cursor: 'pointer', marginTop: '-8px' }}
              >
                Download QR
              </button>
            </div>
          );
        })}
      </div>

      <div className="glass-panel" style={{ marginTop: '48px', background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '24px', padding: '28px', boxShadow: 'var(--shadow-md)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <ListTodo size={24} className="text-accent" />
          <h2 style={{ fontSize: '20px', fontWeight: '800', margin: 0 }}>Dine-In Hub: Master Table List</h2>
        </div>
        <div className="overflow-x-auto">
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
            <thead>
              <tr style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'left' }}>
                <th style={{ padding: '12px 20px' }}>Table #</th>
                <th style={{ padding: '12px 20px' }}>Name/Label</th>
                <th style={{ padding: '12px 20px' }}>Secret Token</th>
                <th style={{ padding: '12px 20px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {restaurantTables.map((t, idx) => (
                <tr key={idx} style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                  <td style={{ padding: '16px 20px', fontWeight: '800', color: 'var(--accent-primary)', borderTopLeftRadius: '12px', borderBottomLeftRadius: '12px' }}>
                    #{t.table_number || (idx + 1)}
                  </td>
                  <td style={{ padding: '16px 20px', fontWeight: '700' }}>{t.name || t.table}</td>
                  <td style={{ padding: '16px 20px', fontFamily: 'monospace', fontSize: '12px', color: 'var(--text-dim)' }}>{t.token}</td>
                  <td style={{ padding: '16px 20px', textAlign: 'right', borderTopRightRadius: '12px', borderBottomRightRadius: '12px' }}>
                    <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/?s=${t.token}`); alert("Copied!"); }} style={{ background: 'transparent', border: '1px solid var(--card-border)', color: 'var(--text-main)', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '11px', fontWeight: '700' }}>Copy URL</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
