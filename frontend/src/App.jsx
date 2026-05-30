import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Welcome from './pages/Welcome';
import DeviceSelection from './pages/DeviceSelection';
import Dashboard from './pages/Dashboard';
import HostSession from './pages/HostSession';
import ClientSession from './pages/ClientSession';
import ModeSelection from './pages/ModeSelection';
import AvailableHosts from './pages/AvailableHosts';

function App() {
  return (
    <Router>
      <div className="app-wrapper">
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/device-selection" element={<DeviceSelection />} />
          <Route path="/mode-selection" element={<ModeSelection />} />
          <Route path="/available-hosts" element={<AvailableHosts />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/host" element={<HostSession />} />
          <Route path="/client/:hostId" element={<ClientSession />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
