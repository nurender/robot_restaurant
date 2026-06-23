import { Edit2, Trash2, ListTodo, Plus } from 'lucide-react';
import React from 'react';
import axios from 'axios';
import { API_URL } from '../../../config';

export default function QrCodesView({ restaurantTables, adminUser, fetchData, printTableQR }) {
  return (
    <div className="view-container animate-slide-up view-container-deep">
      <div  className="ext-cls-bb123862">
        <div>
          <h1 className="view-title ext-cls-46d76c78" >Tables & QR Codes</h1>
          <p className="text-muted ext-cls-a6a615ae" >Dine-in Customer ordering entry endpoints.</p>
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

      <div  className="ext-cls-d9fddbb2">
        {restaurantTables.map((t, idx) => {
          const tokenVal = t.secret_token || t.token;
          const liveUrl = `${window.location.origin}/?s=${tokenVal}`;
          return (
            <div key={idx} className="glass-panel ext-cls-22dec2a2" >
              <div  className="ext-cls-f64a1d92">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(liveUrl)}`}
                  alt="Scannable QR Code"
                  
                className="ext-cls-6010c780" />
              </div>
              <h3  className="ext-cls-c26cd7f5">
                {t.name || t.table || `Table ${t.table_number}`}
                <button
                  onClick={() => {
                    const newName = prompt("Edit Table Name:", t.name || t.table);
                    if (newName) {
                      axios.put(`${API_URL}/api/tables/${t.id}`, { name: newName, table_number: t.table_number })
                        .then(() => fetchData('Table Updated'));
                    }
                  }}
                  className="st-cls-8798020a"
                >
                  <Edit2 size={14} />
                </button>
              </h3>
              <div  className="ext-cls-2b909440">
                <div  className="ext-cls-de20d623">{tokenVal}</div>
                <button
                  onClick={() => {
                    const newKey = prompt("Edit Secret Key (Token):", tokenVal);
                    if (newKey) {
                      axios.put(`${API_URL}/api/tables/${t.id}`, { name: t.name || t.table, table_number: t.table_number, secret_token: newKey })
                        .then(() => fetchData('Key Updated'));
                    }
                  }}
                  className="st-cls-7670380b"
                >
                  <Edit2 size={12} />
                </button>
              </div>

              <div  className="ext-cls-159f41f8">
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
                  className="st-cls-a8dc57e6"
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
                  className="st-cls-9265d60b"
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
                className="st-cls-e930308b"
              >
                Download QR
              </button>
            </div>
          );
        })}
      </div>

      <div className="glass-panel ext-cls-75c7ac2e" >
        <div  className="ext-cls-f7aba57e">
          <ListTodo size={24} className="text-accent" />
          <h2  className="ext-cls-460d2182">Dine-In Hub: Master Table List</h2>
        </div>
        <div className="overflow-x-auto">
          <table  className="ext-cls-577f2ddf">
            <thead>
              <tr  className="ext-cls-72549c7a">
                <th  className="ext-cls-678ab1a6">Table #</th>
                <th  className="ext-cls-678ab1a6">Name/Label</th>
                <th  className="ext-cls-678ab1a6">Secret Token</th>
                <th  className="ext-cls-edc5c104">Actions</th>
              </tr>
            </thead>
            <tbody>
              {restaurantTables.map((t, idx) => (
                <tr key={idx}  className="ext-cls-937b953c">
                  <td  className="ext-cls-813414b4">
                    #{t.table_number || (idx + 1)}
                  </td>
                  <td  className="ext-cls-3b376603">{t.name || t.table}</td>
                  <td  className="ext-cls-5feee2a5">{t.token}</td>
                  <td  className="ext-cls-2590b86a">
                    <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/?s=${t.token}`); alert("Copied!"); }} className="st-cls-228e32a7">Copy URL</button>
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
