import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Smartphone, Tablet, Monitor } from 'lucide-react';
import { useSocket } from '../context/SocketContext';

const DeviceSelection = () => {
  const [selectedDevice, setSelectedDevice] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { registerUser } = useSocket();
  
  const { username, intention, targetHost } = location.state || { username: 'Misafir', intention: 'client' };

  const handleDeviceSelect = (device) => {
    setSelectedDevice(device);
    
    setTimeout(() => {
      if (intention === 'host') {
        registerUser(username, device, intention);
        navigate('/host');
      } else {
        // Pass to ModeSelection without registering yet (registering happens in ModeSelection)
        navigate('/mode-selection', { state: { username, intention, device, targetHost } });
      }
    }, 500);
  };

  return (
    <div className="full-screen-center">
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ marginBottom: '3rem' }}>Hangi cihazdan bağlanıyorsunuz?</h2>
        
        <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          
          <div 
            className={`device-card ${selectedDevice === 'Telefon' ? 'active' : ''}`}
            onClick={() => handleDeviceSelect('Telefon')}
          >
            <Smartphone size={48} className="device-icon" />
            <span style={{ fontWeight: 500 }}>Telefon</span>
          </div>

          <div 
            className={`device-card ${selectedDevice === 'Tablet' ? 'active' : ''}`}
            onClick={() => handleDeviceSelect('Tablet')}
          >
            <Tablet size={48} className="device-icon" />
            <span style={{ fontWeight: 500 }}>Tablet</span>
          </div>

          <div 
            className={`device-card ${selectedDevice === 'Bilgisayar' ? 'active' : ''}`}
            onClick={() => handleDeviceSelect('Bilgisayar')}
          >
            <Monitor size={48} className="device-icon" />
            <span style={{ fontWeight: 500 }}>Bilgisayar</span>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default DeviceSelection;
