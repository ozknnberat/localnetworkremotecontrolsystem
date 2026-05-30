import React, { useState, useEffect } from 'react';
import { ArrowLeft, Monitor, Smartphone, Tablet, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { sessions, currentUser } = useSocket();
  const [showOnlyActive, setShowOnlyActive] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getDeviceIcon = (type) => {
    switch(type) {
      case 'Telefon': return <Smartphone size={18} />;
      case 'Tablet': return <Tablet size={18} />;
      default: return <Monitor size={18} />;
    }
  };

  const getModeBadge = (role) => {
    if (role === 'host') {
      return <span className="badge badge-green">Ekran Paylaşıyor</span>;
    }
    return <span className="badge badge-blue">İzleyici</span>;
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('tr-TR', { 
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  };

  const calculateDuration = (startTime) => {
    const diff = currentTime - startTime;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}s ${minutes % 60}d`;
    if (minutes > 0) return `${minutes}d`;
    return 'Şimdi';
  };

  const filteredSessions = showOnlyActive 
    ? sessions.filter(s => s.status === 'active') 
    : sessions;

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button 
          className="btn btn-secondary" 
          style={{ padding: '0.5rem', borderRadius: '50%' }}
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={24} />
        </button>
        <h2>Yönetim Paneli</h2>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ 
          padding: '1.5rem', 
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem' }}>session_history</h3>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={showOnlyActive} 
              onChange={(e) => setShowOnlyActive(e.target.checked)} 
            />
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>show_only_active</span>
          </label>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Kullanıcı Adı</th>
                <th>Cihaz Türü</th>
                <th>Kullanım Modu</th>
                <th>Başlangıç Zamanı</th>
                <th>Süre</th>
                <th>Status</th>
                <th>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {filteredSessions.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                    Aktif oturum bulunamadı.
                  </td>
                </tr>
              ) : (
                filteredSessions.map((session) => (
                  <tr key={session.id}>
                    <td style={{ fontWeight: 500 }}>
                      {session.username} {session.id === currentUser?.id && '(Sen)'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {getDeviceIcon(session.deviceType)}
                        <span>{session.deviceType}</span>
                      </div>
                    </td>
                    <td>{getModeBadge(session.role)}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{formatTime(session.startTime)}</td>
                    <td style={{ color: 'var(--text-muted)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Clock size={14} /> {calculateDuration(session.startTime)}
                      </div>
                    </td>
                    <td>
                      <span style={{ color: session.status === 'active' ? 'var(--text-main)' : 'var(--text-muted)' }}>
                        {session.status === 'active' ? 'Çevrimiçi' : 'Çevrimdışı'}
                      </span>
                    </td>
                    <td>
                      {session.role === 'host' && session.id !== currentUser?.id && (
                        <button 
                          className="btn btn-primary" 
                          style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}
                          onClick={() => navigate(`/client/${session.id}`)}
                        >
                          Bağlan
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
