import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Monitor, Smartphone, Link } from 'lucide-react';

const Welcome = () => {
  const [username, setUsername] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const targetHost = new URLSearchParams(location.search).get('host');

  const handleStartHost = () => {
    if (!username.trim()) return;
    navigate('/device-selection', { state: { username, intention: 'host' } });
  };

  const handleJoinSession = () => {
    if (!username.trim()) return;
    navigate('/device-selection', { state: { username, intention: 'client', targetHost } });
  };

  return (
    <div className="full-screen-center">
      <div className="card" style={{ width: '400px', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--accent-blue)', marginBottom: '2rem' }}>
          Wi-Fi Remote Screen'e Hoş Geldiniz
        </h2>
        
        <div className="input-group" style={{ textAlign: 'left', marginBottom: '2rem' }}>
          <label className="input-label">Kullanıcı Adı</label>
          <input 
            type="text" 
            className="input-field" 
            placeholder="Kullanıcı adınızı girin"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {targetHost && (
            <div style={{ padding: '1rem', backgroundColor: 'rgba(59, 113, 202, 0.1)', border: '1px solid var(--accent-blue)', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <Link size={16} color="var(--accent-blue)" />
              <span>Bir davet linkiyle geldiniz! İsim girip katılın.</span>
            </div>
          )}

          {!targetHost && (
            <button 
              className="btn btn-primary" 
              onClick={handleStartHost}
              disabled={!username.trim()}
              style={{ width: '100%' }}
            >
              <Monitor size={20} /> Host Oturumu Başlat
            </button>
          )}
          
          <button 
            className="btn btn-secondary" 
            onClick={handleJoinSession}
            disabled={!username.trim()}
            style={{ width: '100%', borderColor: targetHost ? 'var(--accent-green)' : undefined, color: targetHost ? 'var(--accent-green)' : undefined }}
          >
            <Smartphone size={20} /> Oturuma Katıl
          </button>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
