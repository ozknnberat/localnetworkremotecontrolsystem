import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Square, Monitor, Link, Copy } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { QRCodeSVG } from 'qrcode.react';

const HostSession = () => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [connectedClients, setConnectedClients] = useState([]);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const peersRef = useRef(new Map());
  const { socket } = useSocket();
  const navigate = useNavigate();

  useEffect(() => {
    if (!socket) return;

    socket.on('remote_control', async (data) => {
      if (data.type === 'viewer_join') {
        const viewerId = data.viewerId;
        const peer = new RTCPeerConnection({
          iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });

        peersRef.current.set(viewerId, peer);

        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => {
            peer.addTrack(track, streamRef.current);
          });
        }

        peer.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit('ice_candidate', { target: viewerId, candidate: event.candidate });
          }
        };

        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        socket.emit('offer', { target: viewerId, offer });

        setConnectedClients(prev => [...prev, viewerId]);
      }
    });

    socket.on('answer', async ({ sender, answer }) => {
      const peer = peersRef.current.get(sender);
      if (peer) {
        await peer.setRemoteDescription(new RTCSessionDescription(answer));
      }
    });

    socket.on('ice_candidate', async ({ sender, candidate }) => {
      const peer = peersRef.current.get(sender);
      if (peer) {
        await peer.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    return () => {
      socket.off('remote_control');
      socket.off('answer');
      socket.off('ice_candidate');
      peersRef.current.forEach(peer => peer.close());
    };
  }, [socket]);

  const startStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: 'always' },
        audio: false
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsStreaming(true);

      stream.getVideoTracks()[0].onended = () => {
        stopStream();
      };
      
    } catch (err) {
      console.error("Error starting screen share:", err);
    }
  };

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
  };

  const joinLink = `${window.location.origin}?host=${socket?.id}`;

  const copyLink = () => {
    navigator.clipboard.writeText(joinLink);
  };

  return (
    <div className="full-screen-center" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      <div className="card" style={{ width: '800px', maxWidth: '90%' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Host Modu</h2>

        {socket?.id && isStreaming && (
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', backgroundColor: 'var(--bg-card-hover)', padding: '1rem 2rem', borderRadius: '8px', marginBottom: '2rem' }}>
            <div>
              <QRCodeSVG value={joinLink} size={100} bgColor={"#ffffff"} fgColor={"#000000"} />
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Link size={18} color="var(--accent-blue)" /> Davet Linkiniz
              </h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Bu QR kodu okutarak veya linki göndererek diğer cihazlardan direkt bu ekrana bağlanabilirsiniz.</p>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input type="text" readOnly value={joinLink} className="input-field" style={{ flex: 1, padding: '0.5rem' }} />
                <button className="btn btn-secondary" onClick={copyLink} style={{ padding: '0.5rem' }}>
                  <Copy size={18} /> Kopyala
                </button>
              </div>
            </div>
          </div>
        )}
        
        <div style={{ 
          background: 'black', 
          borderRadius: '8px', 
          aspectRatio: '16/9', 
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
          position: 'relative'
        }}>
          {!isStreaming && <span style={{ color: 'var(--text-muted)' }}>Ekran Paylaşımı Bekleniyor...</span>}
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline
            muted={true}
            style={{ width: '100%', height: '100%', objectFit: 'contain', display: isStreaming ? 'block' : 'none' }} 
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
          {!isStreaming ? (
            <button className="btn btn-success" onClick={startStream}>
              <Play size={20} /> Host Oturumu Başlat
            </button>
          ) : (
            <button className="btn btn-secondary" style={{ color: '#ef4444', borderColor: '#ef4444' }} onClick={stopStream}>
              <Square size={20} /> Paylaşımı Durdur
            </button>
          )}
          
          <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
            Yönetim Paneli
          </button>
        </div>

        <div>
          <h4 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
            Bağlı İstemciler ({connectedClients.length})
          </h4>
          {connectedClients.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Bağlı istemci yok</p>
          ) : (
            <ul>
              {connectedClients.map(clientId => (
                <li key={clientId} style={{ color: 'var(--text-muted)' }}>İstemci ID: {clientId}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default HostSession;
