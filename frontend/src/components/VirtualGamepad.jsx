import React, { useState, useRef, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { useParams } from 'react-router-dom';
import { Settings, X, RotateCcw, Eye, EyeOff } from 'lucide-react';

const DEFAULT_LAYOUT = {
  L1: { x: 10, y: 20, scale: 0.8, visible: true },
  L2: { x: 5, y: 50, scale: 1.0, visible: true },
  JOY_LEFT: { x: 18, y: 75, scale: 0.9, visible: true },
  DPAD: { x: 32, y: 85, scale: 0.9, visible: true },
  
  R1: { x: 90, y: 20, scale: 0.8, visible: true },
  R2: { x: 95, y: 50, scale: 1.0, visible: true },
  ACTIONS: { x: 82, y: 75, scale: 0.9, visible: true },
  JOY_RIGHT: { x: 68, y: 85, scale: 0.9, visible: true }
};

const DEFAULT_KEYMAP = {
  L1: 'S',
  L2: 'Space',
  R1: 'W',
  R2: 'Down',
  DPAD_UP: 'F',
  DPAD_DOWN: 'G',
  DPAD_LEFT: 'H',
  DPAD_RIGHT: 'J',
  JOY_LEFT_LEFT: 'A',
  JOY_LEFT_RIGHT: 'D',
  JOY_LEFT_UP: 'W', 
  JOY_LEFT_DOWN: 'S', 
  JOY_RIGHT_UP: 'Up',
  JOY_RIGHT_DOWN: 'Down',
  JOY_RIGHT_LEFT: 'Left',
  JOY_RIGHT_RIGHT: 'Right',
  X: 'E',
  Y: 'Y',
  A: 'Enter',
  B: 'Q'
};

const AVAILABLE_KEYS = [
  'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z',
  'Up', 'Down', 'Left', 'Right', 'Space', 'Enter', 'Escape', 'Tab', 'Shift', 'Control', 'Alt',
  'Num0','Num1','Num2','Num3','Num4','Num5','Num6','Num7','Num8','Num9'
];

const TriggerSlider = ({ label, onValueChange, color = 'rgba(255,255,255,0.2)', onActiveChange }) => {
  const [value, setValue] = useState(0);
  const sliderRef = useRef(null);

  const updateValue = (clientY) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    let val = 1 - (clientY - rect.top) / rect.height;
    val = Math.max(0, Math.min(1, val));
    setValue(val);
    onValueChange(val);
  };

  const handleTouch = (e) => {
    e.preventDefault();
    onActiveChange(true);
    updateValue(e.touches[0].clientY);
  };

  const handleTouchEnd = (e) => {
    e.preventDefault();
    onActiveChange(false);
    setValue(0);
    onValueChange(0);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
      <span style={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem', textShadow: '1px 1px 2px black' }}>{label}</span>
      <div 
        ref={sliderRef}
        onTouchStart={handleTouch}
        onTouchMove={handleTouch}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        style={{
          width: '40px', height: '120px', backgroundColor: 'rgba(0,0,0,0.4)',
          borderRadius: '20px', position: 'relative', overflow: 'hidden',
          border: '2px solid rgba(255,255,255,0.1)', touchAction: 'none'
        }}
      >
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: `${value * 100}%`,
          backgroundColor: color, transition: 'height 0.1s ease-out'
        }} />
      </div>
    </div>
  );
};

const Joystick = ({ id, onMove, onRelease, onActiveChange }) => {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const moveRequestRef = useRef(null);

  const updateJoystick = (touch) => {
    const joypad = document.getElementById(id);
    if (!joypad) return;

    const rect = joypad.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    let dx = touch.clientX - centerX;
    let dy = touch.clientY - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const maxRadius = rect.width / 2;

    if (distance > maxRadius) {
      dx = (dx / distance) * maxRadius;
      dy = (dy / distance) * maxRadius;
    }

    setPos({ x: dx, y: dy });

    if (!moveRequestRef.current) {
      moveRequestRef.current = requestAnimationFrame(() => {
        onMove({ x: dx / maxRadius, y: dy / maxRadius });
        moveRequestRef.current = null;
      });
    }
  };

  const handleTouch = (e) => {
    e.preventDefault();
    onActiveChange(true);
    const joypad = document.getElementById(id);
    const rect = joypad.getBoundingClientRect();
    
    for (let i = 0; i < e.touches.length; i++) {
      const touch = e.touches[i];
      if (touch.clientX >= rect.left - 50 && touch.clientX <= rect.right + 50 &&
          touch.clientY >= rect.top - 50 && touch.clientY <= rect.bottom + 50) {
        updateJoystick(touch);
        break;
      }
    }
  };

  const handleEnd = (e) => {
    e.preventDefault();
    onActiveChange(false);
    setPos({ x: 0, y: 0 });
    onRelease();
  };

  return (
    <div 
      id={id}
      onTouchStart={handleTouch}
      onTouchMove={handleTouch}
      onTouchEnd={handleEnd}
      onTouchCancel={handleEnd}
      style={{
        width: '120px', height: '120px', borderRadius: '50%', backgroundColor: 'rgba(255, 255, 255, 0.05)',
        border: '2px solid rgba(255, 255, 255, 0.1)', position: 'relative', pointerEvents: 'auto', touchAction: 'none'
      }}
    >
      <div style={{
        width: '50px', height: '50px', borderRadius: '50%', backgroundColor: 'rgba(255, 255, 255, 0.5)',
        position: 'absolute', top: '50%', left: '50%', boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
        transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))`
      }} />
    </div>
  );
};

const GamepadButton = ({ label, onDown, onUp, style, onActiveChange }) => {
  return (
    <button 
      onPointerDown={(e) => {
        e.target.setPointerCapture(e.pointerId);
        onActiveChange?.(true);
        onDown();
      }} 
      onPointerUp={(e) => {
        e.target.releasePointerCapture(e.pointerId);
        onActiveChange?.(false);
        onUp();
      }} 
      onPointerCancel={(e) => {
        onActiveChange?.(false);
        onUp();
      }}
      style={{ ...style, cursor: 'pointer', touchAction: 'none' }}
    >
      {label}
    </button>
  );
};

const DraggableWidget = ({ id, config, updateConfig, isEditMode, globalOpacity, isActive, children }) => {
  const [isDragging, setIsDragging] = useState(false);

  if (!config.visible && !isEditMode) return null;

  const handleTouchStart = (e) => {
    if (!isEditMode) return;
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isEditMode || !isDragging) return;
    const touch = e.touches[0];
    const newX = (touch.clientX / window.innerWidth) * 100;
    const newY = (touch.clientY / window.innerHeight) * 100;
    updateConfig(id, { x: newX, y: newY });
  };

  const handleTouchEnd = () => {
    if (isEditMode) setIsDragging(false);
  };

  return (
    <div
      style={{
        position: 'absolute',
        left: `${config.x}%`,
        top: `${config.y}%`,
        transform: `translate(-50%, -50%) scale(${config.scale})`,
        opacity: isEditMode ? (config.visible ? 1 : 0.3) : (isActive ? 1 : globalOpacity),
        border: isEditMode ? '2px dashed rgba(255,255,255,0.5)' : 'none',
        borderRadius: '16px',
        padding: isEditMode ? '10px' : '0',
        zIndex: isEditMode ? 2000 : 1000,
        pointerEvents: isEditMode ? 'auto' : 'none',
        transition: isEditMode || isDragging ? 'none' : 'opacity 0.2s',
      }}
      onTouchStart={isEditMode ? handleTouchStart : undefined}
      onTouchMove={isEditMode ? handleTouchMove : undefined}
      onTouchEnd={isEditMode ? handleTouchEnd : undefined}
      onTouchCancel={isEditMode ? handleTouchEnd : undefined}
    >
      <div style={{ pointerEvents: isEditMode ? 'none' : 'auto' }}>
        {children}
      </div>
    </div>
  );
};

const SettingsModal = ({ layout, setLayout, keyMap, setKeyMap, globalOpacity, setGlobalOpacity, onReset, onClose }) => {
  const [activeTab, setActiveTab] = useState('layout');

  const toggleVisibility = (key) => {
    setLayout(prev => ({
      ...prev,
      [key]: { ...prev[key], visible: !prev[key].visible }
    }));
  };

  const updateKeyMapping = (buttonKey, newKey) => {
    setKeyMap(prev => ({
      ...prev,
      [buttonKey]: newKey
    }));
  };

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 3000,
      display: 'flex', justifyContent: 'center', alignItems: 'center', pointerEvents: 'auto'
    }}>
      <div className="card" style={{ width: '450px', maxWidth: '95%', maxHeight: '90vh', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0 }}>Ayarlar</h3>
          <button className="btn btn-secondary" onClick={onClose} style={{ padding: '0.25rem', borderRadius: '50%' }}><X size={20}/></button>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <button className={`btn ${activeTab === 'layout' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('layout')} style={{ flex: 1 }}>Görünüm</button>
          <button className={`btn ${activeTab === 'keymap' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('keymap')} style={{ flex: 1 }}>Tuş Atamaları</button>
        </div>

        <div style={{ overflowY: 'auto', flex: 1, paddingRight: '0.5rem' }}>
          {activeTab === 'layout' && (
            <>
              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Şeffaflık (Ghost UI)</label>
                <input 
                  type="range" 
                  min="0.1" max="1" step="0.1" 
                  value={globalOpacity} 
                  onChange={(e) => setGlobalOpacity(parseFloat(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ color: 'var(--text-muted)' }}>Buton Görünürlüğü</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  {Object.keys(layout).map(key => (
                    <button 
                      key={key}
                      onClick={() => toggleVisibility(key)}
                      className="btn btn-secondary"
                      style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem' }}
                    >
                      <span>{key}</span>
                      {layout[key].visible ? <Eye size={18} /> : <EyeOff size={18} color="var(--text-muted)" />}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === 'keymap' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>Oyuncu butonlarına karşılık gelen klavye tuşlarını seçin.</p>
              {Object.keys(DEFAULT_KEYMAP).map(key => (
                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '8px' }}>
                  <span style={{ fontWeight: 'bold' }}>{key.replace(/_/g, ' ')}</span>
                  <select 
                    value={keyMap[key]} 
                    onChange={(e) => updateKeyMapping(key, e.target.value)}
                    style={{ backgroundColor: 'var(--bg-secondary)', color: 'white', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '0.25rem 0.5rem' }}
                  >
                    {AVAILABLE_KEYS.map(k => (
                      <option key={k} value={k}>{k}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}
        </div>

        <button 
          className="btn btn-danger" 
          onClick={onReset}
          style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '0.5rem', alignItems: 'center', marginTop: '1rem' }}
        >
          <RotateCcw size={18} /> Varsayılana Dön
        </button>

      </div>
    </div>
  );
};

const VirtualGamepad = () => {
  const { hostId } = useParams();
  const { socket } = useSocket();

  const [layout, setLayout] = useState(() => {
    const saved = localStorage.getItem('gamepad_layout_v3');
    return saved ? JSON.parse(saved) : DEFAULT_LAYOUT;
  });
  const [keyMap, setKeyMap] = useState(() => {
    const saved = localStorage.getItem('gamepad_keymap_v2');
    return saved ? JSON.parse(saved) : DEFAULT_KEYMAP;
  });
  const [globalOpacity, setGlobalOpacity] = useState(() => {
    const saved = localStorage.getItem('gamepad_opacity');
    return saved ? parseFloat(saved) : 0.4;
  });
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeKeys, setActiveKeys] = useState({});

  // Eşik (threshold) değerleri için önceki (previous) stateleri takip edelim. (Spam engellemek için)
  const analogStates = useRef({
    L2: false, R2: false,
    JOY_LEFT_UP: false, JOY_LEFT_DOWN: false, JOY_LEFT_LEFT: false, JOY_LEFT_RIGHT: false,
    JOY_RIGHT_UP: false, JOY_RIGHT_DOWN: false, JOY_RIGHT_LEFT: false, JOY_RIGHT_RIGHT: false
  });

  useEffect(() => {
    localStorage.setItem('gamepad_layout_v3', JSON.stringify(layout));
    localStorage.setItem('gamepad_keymap_v2', JSON.stringify(keyMap));
    localStorage.setItem('gamepad_opacity', globalOpacity.toString());
  }, [layout, keyMap, globalOpacity]);

  const updateConfig = (id, newProps) => {
    setLayout(prev => ({ ...prev, [id]: { ...prev[id], ...newProps } }));
  };

  const handleActive = (id, active) => {
    setActiveKeys(prev => ({ ...prev, [id]: active }));
  };

  const sendKey = (mappedKeyName, isPressed) => {
    if (isEditMode) return;
    const key = keyMap[mappedKeyName];
    if (key && socket && hostId) {
      socket.emit('remote_control', { target: hostId, type: 'gamepad_key', key, state: isPressed ? 'pressed' : 'released' });
    }
  };

  const handleTrigger = (triggerName, val) => {
    const isPressed = val > 0.25; // Hassasiyet eşiği %25'e çekildi
    if (isPressed !== analogStates.current[triggerName]) {
      analogStates.current[triggerName] = isPressed;
      sendKey(triggerName, isPressed);
    }
  };

  const handleJoystick = (joyName, pos) => {
    // pos.x and pos.y are from -1.0 to 1.0
    const THRESHOLD = 0.3;
    const isUp = pos.y < -THRESHOLD;
    const isDown = pos.y > THRESHOLD;
    const isLeft = pos.x < -THRESHOLD;
    const isRight = pos.x > THRESHOLD;

    const checkAndSend = (dirName, currentState) => {
      if (currentState !== analogStates.current[dirName]) {
        analogStates.current[dirName] = currentState;
        sendKey(dirName, currentState);
      }
    };

    checkAndSend(`${joyName}_UP`, isUp);
    checkAndSend(`${joyName}_DOWN`, isDown);
    checkAndSend(`${joyName}_LEFT`, isLeft);
    checkAndSend(`${joyName}_RIGHT`, isRight);
  };

  const handleJoystickRelease = (joyName) => {
    handleJoystick(joyName, { x: 0, y: 0 });
  };

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
      pointerEvents: 'none', zIndex: 1000
    }}>
      
      {/* Settings Gear */}
      <button 
        onClick={() => setIsEditMode(!isEditMode)}
        className="btn btn-secondary"
        style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 3000, pointerEvents: 'auto', padding: '0.5rem', borderRadius: '50%' }}
      >
        <Settings size={24} color={isEditMode ? 'var(--accent-blue)' : 'white'} />
      </button>

      {/* Edit Mode HUD */}
      {isEditMode && (
        <div style={{ position: 'absolute', top: '1rem', left: '50%', transform: 'translateX(-50%)', zIndex: 3000, display: 'flex', gap: '1rem', pointerEvents: 'auto' }}>
          <button className="btn btn-secondary" onClick={() => setShowSettings(true)}>Detaylı Ayarlar</button>
          <button className="btn btn-primary" onClick={() => setIsEditMode(false)}>Kaydet ve Çık</button>
        </div>
      )}

      {showSettings && (
        <SettingsModal 
          layout={layout} setLayout={setLayout} 
          keyMap={keyMap} setKeyMap={setKeyMap}
          globalOpacity={globalOpacity} setGlobalOpacity={setGlobalOpacity}
          onReset={() => { setLayout(DEFAULT_LAYOUT); setKeyMap(DEFAULT_KEYMAP); setGlobalOpacity(0.4); }}
          onClose={() => setShowSettings(false)}
        />
      )}

      <div className="gamepad-side">
        {/* L1 */}
        <DraggableWidget id="L1" config={layout.L1} updateConfig={updateConfig} isEditMode={isEditMode} globalOpacity={globalOpacity} isActive={activeKeys['L1']}>
          <GamepadButton label="L1" onDown={() => sendKey('L1', true)} onUp={() => sendKey('L1', false)} style={bumperStyle} onActiveChange={(a) => handleActive('L1', a)} />
        </DraggableWidget>

        {/* L2 */}
        <DraggableWidget id="L2" config={layout.L2} updateConfig={updateConfig} isEditMode={isEditMode} globalOpacity={globalOpacity} isActive={activeKeys['L2']}>
          <TriggerSlider label="L2" onValueChange={(val) => handleTrigger('L2', val)} color="rgba(59, 130, 246, 0.4)" onActiveChange={(a) => handleActive('L2', a)} />
        </DraggableWidget>

        {/* JOY LEFT */}
        <DraggableWidget id="JOY_LEFT" config={layout.JOY_LEFT} updateConfig={updateConfig} isEditMode={isEditMode} globalOpacity={globalOpacity} isActive={activeKeys['JOY_LEFT']}>
          <Joystick id="joystick-left" onMove={(pos) => handleJoystick('JOY_LEFT', pos)} onRelease={() => handleJoystickRelease('JOY_LEFT')} onActiveChange={(a) => handleActive('JOY_LEFT', a)} />
        </DraggableWidget>

        {/* DPAD */}
        <DraggableWidget id="DPAD" config={layout.DPAD} updateConfig={updateConfig} isEditMode={isEditMode} globalOpacity={globalOpacity} isActive={activeKeys['DPAD']}>
          <div style={{ position: 'relative', width: '120px', height: '120px' }}>
            <GamepadButton label="▲" onDown={() => sendKey('DPAD_UP', true)} onUp={() => sendKey('DPAD_UP', false)} style={{ ...dpadBtnStyle, top: 0, left: '35px' }} onActiveChange={(a) => handleActive('DPAD', a)} />
            <GamepadButton label="▼" onDown={() => sendKey('DPAD_DOWN', true)} onUp={() => sendKey('DPAD_DOWN', false)} style={{ ...dpadBtnStyle, bottom: 0, left: '35px' }} onActiveChange={(a) => handleActive('DPAD', a)} />
            <GamepadButton label="◀" onDown={() => sendKey('DPAD_LEFT', true)} onUp={() => sendKey('DPAD_LEFT', false)} style={{ ...dpadBtnStyle, top: '35px', left: 0 }} onActiveChange={(a) => handleActive('DPAD', a)} />
            <GamepadButton label="▶" onDown={() => sendKey('DPAD_RIGHT', true)} onUp={() => sendKey('DPAD_RIGHT', false)} style={{ ...dpadBtnStyle, top: '35px', right: 0 }} onActiveChange={(a) => handleActive('DPAD', a)} />
          </div>
        </DraggableWidget>

        {/* R1 */}
        <DraggableWidget id="R1" config={layout.R1} updateConfig={updateConfig} isEditMode={isEditMode} globalOpacity={globalOpacity} isActive={activeKeys['R1']}>
          <GamepadButton label="R1" onDown={() => sendKey('R1', true)} onUp={() => sendKey('R1', false)} style={bumperStyle} onActiveChange={(a) => handleActive('R1', a)} />
        </DraggableWidget>

        {/* R2 */}
        <DraggableWidget id="R2" config={layout.R2} updateConfig={updateConfig} isEditMode={isEditMode} globalOpacity={globalOpacity} isActive={activeKeys['R2']}>
          <TriggerSlider label="R2" onValueChange={(val) => handleTrigger('R2', val)} color="rgba(59, 130, 246, 0.4)" onActiveChange={(a) => handleActive('R2', a)} />
        </DraggableWidget>

        {/* ACTIONS */}
        <DraggableWidget id="ACTIONS" config={layout.ACTIONS} updateConfig={updateConfig} isEditMode={isEditMode} globalOpacity={globalOpacity} isActive={activeKeys['ACTIONS']}>
          <div style={{ position: 'relative', width: '120px', height: '120px' }}>
            <GamepadButton label="Y" onDown={() => sendKey('Y', true)} onUp={() => sendKey('Y', false)} style={{ ...actionBtnStyle, top: 0, left: '35px', backgroundColor: 'rgba(250, 204, 21, 0.4)' }} onActiveChange={(a) => handleActive('ACTIONS', a)} />
            <GamepadButton label="X" onDown={() => sendKey('X', true)} onUp={() => sendKey('X', false)} style={{ ...actionBtnStyle, top: '35px', left: 0, backgroundColor: 'rgba(59, 130, 246, 0.4)' }} onActiveChange={(a) => handleActive('ACTIONS', a)} />
            <GamepadButton label="B" onDown={() => sendKey('B', true)} onUp={() => sendKey('B', false)} style={{ ...actionBtnStyle, top: '35px', right: 0, backgroundColor: 'rgba(239, 68, 68, 0.4)' }} onActiveChange={(a) => handleActive('ACTIONS', a)} />
            <GamepadButton label="A" onDown={() => sendKey('A', true)} onUp={() => sendKey('A', false)} style={{ ...actionBtnStyle, bottom: 0, left: '35px', backgroundColor: 'rgba(34, 197, 94, 0.4)' }} onActiveChange={(a) => handleActive('ACTIONS', a)} />
          </div>
        </DraggableWidget>

        {/* JOY RIGHT */}
        <DraggableWidget id="JOY_RIGHT" config={layout.JOY_RIGHT} updateConfig={updateConfig} isEditMode={isEditMode} globalOpacity={globalOpacity} isActive={activeKeys['JOY_RIGHT']}>
          <Joystick id="joystick-right" onMove={(pos) => handleJoystick('JOY_RIGHT', pos)} onRelease={() => handleJoystickRelease('JOY_RIGHT')} onActiveChange={(a) => handleActive('JOY_RIGHT', a)} />
        </DraggableWidget>

      </div>

      <style>
        {`
          .rotate-warning { display: none; }
          @media (orientation: portrait) {
            .rotate-warning {
              display: flex; position: absolute; top: 0; left: 0; right: 0; bottom: 0;
              background-color: rgba(0,0,0,0.9); color: white; z-index: 4000;
              justify-content: center; align-items: center; font-size: 1.5rem;
              text-align: center; padding: 2rem; pointer-events: auto;
            }
            .gamepad-side { display: none !important; }
          }
        `}
      </style>
      <div className="rotate-warning">
        🎮 Lütfen Oyun Modu için cihazınızı yan (yatay) çevirin.
      </div>
    </div>
  );
};

const bumperStyle = {
  width: '80px', height: '40px', borderRadius: '8px', border: '2px solid rgba(255,255,255,0.2)',
  backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', fontWeight: 'bold', fontSize: '1.2rem'
};

const actionBtnStyle = {
  position: 'absolute', width: '50px', height: '50px', borderRadius: '50%', border: 'none',
  color: 'white', fontWeight: 'bold', fontSize: '1.2rem', boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
  display: 'flex', justifyContent: 'center', alignItems: 'center'
};

const dpadBtnStyle = {
  position: 'absolute', width: '50px', height: '50px', borderRadius: '8px', border: 'none',
  backgroundColor: 'rgba(255, 255, 255, 0.15)', color: 'white', fontWeight: 'bold', fontSize: '1.2rem',
  display: 'flex', justifyContent: 'center', alignItems: 'center'
};

export default VirtualGamepad;
