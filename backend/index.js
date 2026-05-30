import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { mouse, keyboard, Point, Button, Key, screen } from '@nut-tree-fork/nut-js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

// Fare gecikmelerini kapatarak kasma/donmaları sıfırla:
mouse.config.autoDelayMs = 0;
mouse.config.mouseSpeed = 10000;

const activeSessions = new Map();

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  socket.emit('sessions_update', Array.from(activeSessions.values()));

  socket.on('register', (data) => {
    console.log('Client registered:', data);
    activeSessions.set(socket.id, {
      id: socket.id,
      username: data.username,
      deviceType: data.deviceType,
      role: data.role || 'client',
      startTime: Date.now(),
      status: 'active',
    });
    
    io.emit('sessions_update', Array.from(activeSessions.values()));
  });

  socket.on('offer', (data) => {
    socket.to(data.target).emit('offer', {
      offer: data.offer,
      sender: socket.id,
    });
  });

  socket.on('answer', (data) => {
    socket.to(data.target).emit('answer', {
      answer: data.answer,
      sender: socket.id,
    });
  });

  socket.on('ice_candidate', (data) => {
    socket.to(data.target).emit('ice_candidate', {
      candidate: data.candidate,
      sender: socket.id,
    });
  });
  
  socket.on('remote_control', async (data) => {
     socket.to(data.target).emit('remote_control', data);
     
     try {
       if (data.type === 'interaction') {
         const screenWidth = await screen.width();
         const screenHeight = await screen.height();
         
         const targetX = (data.x / 100) * screenWidth;
         const targetY = (data.y / 100) * screenHeight;

         if (data.action === 'move') {
           await mouse.setPosition(new Point(targetX, targetY));
         } else if (data.action === 'mouse_down') {
           await mouse.setPosition(new Point(targetX, targetY));
           await mouse.pressButton(Button.LEFT);
         } else if (data.action === 'mouse_up') {
           await mouse.setPosition(new Point(targetX, targetY));
           await mouse.releaseButton(Button.LEFT);
         } else if (data.action === 'right_mouse_down') {
           await mouse.setPosition(new Point(targetX, targetY));
           await mouse.pressButton(Button.RIGHT);
         } else if (data.action === 'right_mouse_up') {
           await mouse.setPosition(new Point(targetX, targetY));
           await mouse.releaseButton(Button.RIGHT);
         } else if (data.action === 'click') {
           await mouse.setPosition(new Point(targetX, targetY));
           await mouse.click(Button.LEFT);
         } else if (data.action === 'right_click') {
           await mouse.setPosition(new Point(targetX, targetY));
           await mouse.click(Button.RIGHT);
         } else if (data.action === 'double_click') {
           await mouse.setPosition(new Point(targetX, targetY));
           await mouse.doubleClick(Button.LEFT); // Eğer nut-tree fork'unda doubleClick yoksa bile hata vermez, olmazsa iki click deneriz.
           // Alternatif garanti yöntem:
           await mouse.click(Button.LEFT);
           await mouse.click(Button.LEFT);
         }
       } else if (data.type === 'gamepad') {
         if (data.action === 'button') {
            const isPressed = data.state === 'pressed';
            if (data.button === 'A') isPressed ? await keyboard.pressKey(Key.Space) : await keyboard.releaseKey(Key.Space);
            if (data.button === 'B') isPressed ? await keyboard.pressKey(Key.LeftControl) : await keyboard.releaseKey(Key.LeftControl);
            if (data.button === 'X') isPressed ? await keyboard.pressKey(Key.R) : await keyboard.releaseKey(Key.R);
            if (data.button === 'Y') isPressed ? await keyboard.pressKey(Key.F) : await keyboard.releaseKey(Key.F);
            if (data.button === 'L1') isPressed ? await keyboard.pressKey(Key.Q) : await keyboard.releaseKey(Key.Q);
            if (data.button === 'R1') isPressed ? await keyboard.pressKey(Key.E) : await keyboard.releaseKey(Key.E);
         } else if (data.action === 'joystick_left') {
            if (data.y < -0.5) await keyboard.pressKey(Key.W); else await keyboard.releaseKey(Key.W);
            if (data.y > 0.5) await keyboard.pressKey(Key.S); else await keyboard.releaseKey(Key.S);
            if (data.x < -0.5) await keyboard.pressKey(Key.A); else await keyboard.releaseKey(Key.A);
            if (data.x > 0.5) await keyboard.pressKey(Key.D); else await keyboard.releaseKey(Key.D);
         } else if (data.action === 'joystick_right') {
            if (Math.abs(data.x) > 0.1 || Math.abs(data.y) > 0.1) {
              const currentPos = await mouse.getPosition();
              await mouse.setPosition(new Point(currentPos.x + data.x * 20, currentPos.y + data.y * 20));
            }
         } else if (data.action === 'trigger') {
            // Analog değerleri (0.0 - 1.0 arası) klavye tuşlarına dönüştürüyoruz (Geçici dijital mapping)
            const threshold = 0.1;
            if (data.button === 'R2') {
              if (data.value > threshold) await keyboard.pressKey(Key.W); 
              else await keyboard.releaseKey(Key.W);
            } else if (data.button === 'L2') {
              if (data.value > threshold) await keyboard.pressKey(Key.S); 
              else await keyboard.releaseKey(Key.S);
            }
         }
       } else if (data.type === 'gamepad_key') {
         // Dinamik tuş atama altyapısı (Frontend'den gelen 'W', 'Space', 'Down' gibi stringleri nut.js Key'e çevirir)
         const nutKey = Key[data.key];
         if (nutKey !== undefined) {
           if (data.state === 'pressed') {
             await keyboard.pressKey(nutKey);
           } else {
             await keyboard.releaseKey(nutKey);
           }
         }
       } else if (data.type === 'keyboard') {
         if (data.key.length === 1) {
           await keyboard.type(data.key);
         } else if (data.key === 'Backspace') {
           await keyboard.pressKey(Key.Backspace);
           await keyboard.releaseKey(Key.Backspace);
         } else if (data.key === 'Enter') {
           await keyboard.pressKey(Key.Enter);
           await keyboard.releaseKey(Key.Enter);
         }
       }
     } catch (err) {
       console.error('Nut.js HW Control Error:', err);
     }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    activeSessions.delete(socket.id);
    io.emit('sessions_update', Array.from(activeSessions.values()));
  });
});

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Signaling server running on port ${PORT}`);
});
