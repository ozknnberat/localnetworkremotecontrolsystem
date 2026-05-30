import React from 'react';
import { ArrowLeft, Monitor, Radio } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';

const AvailableHosts = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { sessions } = useSocket();
  const { mode, device } = location.state || {};

  // Filter only active hosts
  const activeHosts = sessions.filter(s => s.role === 'host' && s.status === 'active');

  return (
    <div className="full-screen-center" style={{ padding: '2rem' }}>
      <div className="card" style={{ width: '600px', maxWidth: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <button 
            className="btn btn-secondary" 
            style={{ padding: '0.5rem', borderRadius: '50%' }}
            onClick={() => navigate('/device-selection')}
          >
            <ArrowLeft size={24} />
          </button>
          <h2 style={{ margin: 0 }}>Bağlanılacak Host'u Seçin</h2>
        </div>

        <div>
          {activeHosts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              <Radio size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
              <p>Şu anda ağda ekranını paylaşan hiçbir cihaz bulunamadı.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {activeHosts.map(host => (
                <div key={host.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1.5rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--border-radius)',
                  backgroundColor: 'var(--bg-main)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Monitor size={32} color="var(--accent-blue)" />
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{host.username}</h4>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Cihaz: {host.deviceType}</span>
                    </div>
                  </div>
                  <button 
                    className="btn btn-primary"
                    onClick={() => navigate(`/client/${host.id}`, { state: { mode, device } })}
                  >
                    Bağlan
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AvailableHosts;
