import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Maximize } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import VirtualGamepad from '../components/VirtualGamepad';

const ClientSession = () => {
  const { hostId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { socket } = useSocket();
  const { mode, device } = location.state || {};
  const videoRef = useRef(null);
  const peerRef = useRef(null);
  const containerRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!socket || !hostId) return;

    const peer = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });
    peerRef.current = peer;

    peer.ontrack = (event) => {
      if (videoRef.current) {
        videoRef.current.srcObject = event.streams[0];
        videoRef.current.play().catch(err => console.error(err));
        setIsConnected(true);
      }
    };

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice_candidate', { target: hostId, candidate: event.candidate });
      }
    };

    socket.on('offer', async ({ sender, offer }) => {
      if (sender === hostId) {
        await peer.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        socket.emit('answer', { target: hostId, answer });
      }
    });

    socket.on('ice_candidate', async ({ sender, candidate }) => {
      if (sender === hostId) {
        await peer.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    const joinAsViewer = () => {
      if (socket.id) {
        socket.emit('remote_control', { type: 'viewer_join', target: hostId, viewerId: socket.id });
      }
    };

    if (socket.id) {
      joinAsViewer();
    } else {
      socket.on('connect', joinAsViewer);
    }

    return () => {
      socket.off('offer');
      socket.off('ice_candidate');
      socket.off('connect', joinAsViewer);
      peer.close();
    };
  }, [socket, hostId]);

  useEffect(() => {
    const handleContextMenu = (e) => e.preventDefault();
    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, []);

  const touchState = useRef({
    startX: 0, startY: 0,
    moved: false,
    tapCount: 0,
    tapTimeout: null,
    longPressTimeout: null
  });
  
  const moveRequestRef = useRef(null);

  const getPercentage = (clientX, clientY) => {
    if (!videoRef.current) return { x: 0, y: 0 };
    const rect = videoRef.current.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    return { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) };
  };

  const handleMouseMove = (e) => {
    if (!socket || !isConnected) return;
    if (moveRequestRef.current) return;
    
    moveRequestRef.current = requestAnimationFrame(() => {
      const { x, y } = getPercentage(e.clientX, e.clientY);
      socket.emit('remote_control', { target: hostId, type: 'interaction', action: 'move', x, y, viewerId: socket?.id });
      moveRequestRef.current = null;
    });
  };

  const handleMouseDown = (e) => {
    if (!socket || !isConnected) return;
    const { x, y } = getPercentage(e.clientX, e.clientY);
    const action = e.button === 2 ? 'right_mouse_down' : 'mouse_down';
    socket.emit('remote_control', { target: hostId, type: 'interaction', action, x, y, viewerId: socket?.id });
  };

  const handleMouseUp = (e) => {
    if (!socket || !isConnected) return;
    const { x, y } = getPercentage(e.clientX, e.clientY);
    const action = e.button === 2 ? 'right_mouse_up' : 'mouse_up';
    socket.emit('remote_control', { target: hostId, type: 'interaction', action, x, y, viewerId: socket?.id });
  };

  const handleTouchStart = (e) => {
    if (!socket || !isConnected || e.touches.length !== 1) return;
    const touch = e.touches[0];
    touchState.current.startX = touch.clientX;
    touchState.current.startY = touch.clientY;
    touchState.current.moved = false;

    const { x, y } = getPercentage(touch.clientX, touch.clientY);
    socket.emit('remote_control', { target: hostId, type: 'interaction', action: 'move', x, y, viewerId: socket?.id });

    clearTimeout(touchState.current.longPressTimeout);
    touchState.current.longPressTimeout = setTimeout(() => {
      if (!touchState.current.moved) {
        socket.emit('remote_control', { target: hostId, type: 'interaction', action: 'right_click', x, y, viewerId: socket?.id });
        touchState.current.moved = true; // Prevent click on end
      }
    }, 500);
  };

  const handleTouchMove = (e) => {
    if (!socket || !isConnected || e.touches.length !== 1) return;
    const touch = e.touches[0];
    const dx = Math.abs(touch.clientX - touchState.current.startX);
    const dy = Math.abs(touch.clientY - touchState.current.startY);

    if (dx > 10 || dy > 10) {
      touchState.current.moved = true;
      clearTimeout(touchState.current.longPressTimeout);
      
      if (moveRequestRef.current) return;
      moveRequestRef.current = requestAnimationFrame(() => {
        const { x, y } = getPercentage(touch.clientX, touch.clientY);
        socket.emit('remote_control', { target: hostId, type: 'interaction', action: 'move', x, y, viewerId: socket?.id });
        moveRequestRef.current = null;
      });
    }
  };

  const handleTouchEnd = (e) => {
    clearTimeout(touchState.current.longPressTimeout);
    if (!touchState.current.moved) {
      const touch = e.changedTouches[0];
      const { x, y } = getPercentage(touch.clientX, touch.clientY);
      
      touchState.current.tapCount++;
      if (touchState.current.tapCount === 1) {
        touchState.current.tapTimeout = setTimeout(() => {
          touchState.current.tapCount = 0;
          socket.emit('remote_control', { target: hostId, type: 'interaction', action: 'click', x, y, viewerId: socket?.id });
        }, 250);
      } else if (touchState.current.tapCount === 2) {
        clearTimeout(touchState.current.tapTimeout);
        touchState.current.tapCount = 0;
        socket.emit('remote_control', { target: hostId, type: 'interaction', action: 'double_click', x, y, viewerId: socket?.id });
      }
    }
  };

  const handleKeyDown = (e) => {
    if (!socket || !isConnected) return;
    socket.emit('remote_control', {
      target: hostId,
      type: 'keyboard',
      key: e.key,
      viewerId: socket?.id
    });
  };

  const handleFullscreen = () => {
    if (containerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        if (containerRef.current.requestFullscreen) {
          containerRef.current.requestFullscreen();
        } else if (containerRef.current.webkitRequestFullscreen) {
          containerRef.current.webkitRequestFullscreen();
        }
      }
    }
  };

  return (
    <div className="full-screen-center" style={{ padding: '2rem' }}>
      <div className="card" style={{ width: '100%', height: 'calc(100vh - 4rem)', display: 'flex', flexDirection: 'column', padding: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button className="btn btn-secondary" style={{ padding: '0.5rem', borderRadius: '50%' }} onClick={() => navigate('/dashboard')}>
              <ArrowLeft size={20} />
            </button>
            <h3 style={{ margin: 0 }}>İzleyici Modu {isConnected ? '(Bağlandı)' : '(Bağlanıyor...)'}</h3>
          </div>
          
          <button className="btn btn-secondary" onClick={handleFullscreen}>
            <Maximize size={20} /> Tam Ekran
          </button>
        </div>

        <div 
          ref={containerRef}
          tabIndex={0}
          style={{ 
            flex: 1, 
            background: 'black', 
            borderRadius: document.fullscreenElement ? '0' : '8px', 
            overflow: 'hidden',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
            touchAction: 'none',
            outline: 'none'
          }}
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onKeyDown={handleKeyDown}
        >
          {!isConnected && <span style={{ color: 'var(--text-muted)' }}>Görüntü Bekleniyor...</span>}
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline
            muted={true}
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'contain', 
              display: isConnected ? 'block' : 'none'
            }} 
          />
          {mode === 'gamer' && (device === 'Telefon' || device === 'Tablet') && (
            <VirtualGamepad />
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientSession;
