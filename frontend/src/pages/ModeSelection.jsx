import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Gamepad2, MousePointer2, ArrowLeft } from 'lucide-react';
import { useSocket } from '../context/SocketContext';

const ModeSelection = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { registerUser } = useSocket();

  // Retrieve state passed from DeviceSelection
  const { username, intention, device, targetHost } = location.state || {};

  if (!username) {
    // Fallback if accessed directly
    navigate('/');
    return null;
  }

  const handleModeSelect = (mode) => {
    // Register user with their selected mode as part of context (or just pass via state)
    // Mode can be 'gamer' or 'user'
    registerUser(username, device, intention); // intention is 'client'

    // Navigate to specific Host or AvailableHosts
    if (targetHost) {
      navigate(`/client/${targetHost}`, { state: { mode, device } });
    } else {
      navigate('/available-hosts', { state: { username, intention, device, mode } });
    }
  };

  return (
    <div className="full-screen-center">
      <div style={{ textAlign: 'center' }}>
        <button 
          className="btn btn-secondary" 
          style={{ position: 'absolute', top: '2rem', left: '2rem', padding: '0.5rem', borderRadius: '50%' }}
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={24} />
        </button>

        <h2 style={{ marginBottom: '3rem' }}>Kullanım Modunuz Nedir?</h2>
        
        <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          
          <div 
            className="device-card"
            onClick={() => handleModeSelect('user')}
          >
            <MousePointer2 size={48} className="device-icon" />
            <span style={{ fontWeight: 500, fontSize: '1.1rem' }}>Normal Kullanım</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Sadece izle ve tıkla</span>
          </div>

          <div 
            className="device-card"
            onClick={() => handleModeSelect('gamer')}
          >
            <Gamepad2 size={48} className="device-icon" style={{ color: 'var(--accent-green)' }} />
            <span style={{ fontWeight: 500, fontSize: '1.1rem' }}>Oyuncu Modu</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Sanal Gamepad (Joystick)</span>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default ModeSelection;
