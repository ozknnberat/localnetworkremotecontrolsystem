# 🎮 Local Network Remote Control System

![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?logo=react&logoColor=white)
![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?logo=nodedotjs&logoColor=white)
![WebRTC](https://img.shields.io/badge/Streaming-WebRTC-FF4500?logo=webrtc&logoColor=white)

Local Network Remote Control System is an ultra-low latency, P2P-based web application that transforms your smartphone or tablet into a fully functional AAA game controller and remote desktop manager, requiring no native app installation.

## ✨ Key Features

- **Ultra-Low Latency Streaming:** Real-time 60 FPS screen sharing via WebRTC directly over your local Wi-Fi network.
- **Hardware-Level OS Hook:** Utilizes `@nut-tree/nut.js` to communicate directly with OS-level C/C++ APIs (Windows `SendInput` / macOS `CGEvent`), effectively bypassing anti-cheat engines or raw-input listeners in games like GTA 5 and Forza Horizon.
- **Dynamic "Ghost UI" HUD:** A fully customizable, drag-and-drop virtual gamepad interface built with React. Layouts, opacity, and custom key-bindings are saved locally to your browser's LocalStorage.
- **Physical Key Hold Simulation:** Differentiates between instant taps and continuous `keydown`/`keyup` signals, enabling seamless acceleration and steering in racing and action games.
- **Zero Network Congestion:** Employs `requestAnimationFrame` based throttling algorithms on Socket.IO emissions to maintain stable network throughput.
- **100% Privacy & Security:** Operates entirely within your local area network (LAN). No data is ever routed through external servers.

## 🏗 Architecture & Tech Stack

- **Frontend:** React (Vite), Tailwind CSS / Vanilla CSS, WebRTC API
- **Backend:** Node.js, Express, `@nut-tree/nut.js`
- **Signaling:** Socket.IO

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) installed on your Host machine (the PC running the games).
- Both the Host machine and the Client device (smartphone/tablet) must be connected to the **same Wi-Fi network**.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/ozknnberat/localnetworkremotecontrolsystem.git
   cd localnetworkremotecontrolsystem
   ```

2. Install Backend Dependencies:
   ```bash
   cd backend
   npm install
   ```

3. Install Frontend Dependencies:
   ```bash
   cd ../frontend
   npm install
   ```

### Running the System

You must start both the backend and frontend servers on your Host machine.

**1. Start the Backend:**
```bash
cd backend
npm start
```
*(Runs the Socket and Hardware simulation server on port 3001)*

**2. Start the Frontend:**
```bash
cd frontend
npm run dev
```

**3. Connect your devices:**
- On your Host PC, look at the terminal output of Vite and open the **Network IP** address (e.g., `https://192.168.1.100:3000`) in your browser.
- Select **"Host"** mode. A QR code will appear on your screen.
- Scan the QR code with your smartphone or tablet.
- You are now connected! Select **"Gamer Mode"** on your mobile device to start controlling your PC.

## ⚠️ Important Note for Windows Gamers (GTA 5, Forza, etc.)
If you are playing heavy AAA games on Windows, these games often run with high-priority permissions or exclusive modes that ignore simulated inputs. To fix this:
1. **Run as Administrator:** You must open your Terminal (cmd/PowerShell) as **Administrator** before running `npm start` in the backend folder.
2. **Windowed Borderless:** Set the game's display settings from "Exclusive Fullscreen" to **"Windowed Borderless"** or "Windowed".

## 👨‍💻 Development
This project was developed with a focus on solving hardware dependency through modern web capabilities and "Vibe Coding" methodologies. Contributions and feature requests are welcome!
