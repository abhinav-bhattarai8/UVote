# UVote

UVote is a real-time mobile live polling application. A host creates a room with a question and multiple options, shares a room code, and participants join from their phones. When the host opens voting, options update in real time over WebSockets. When voting closes, the final results appear on every screen at once.

- **Backend (Render):** https://uvote-uwrz.onrender.com
- **Frontend Stack:** React Native (Expo SDK 52+, Expo Router, TypeScript)
- **Backend Stack:** NestJS, Socket.IO (`@nestjs/websockets`), TypeScript

---

## Features

- **Live Room Creation:** Generate custom polls with dynamic options.
- **Join via Room Code:** Instant room entry using a unique room code.
- **Real-Time WebSockets:** Live raw participant counters (+/-) and instant vote updates via Socket.IO.
- **Interactive Voting State:** Visual selection feedback (selected option turns green with white text).
- **Admin Host Controls:** The room host can open (`ONVOTE`) and close (`CLOSED`) voting sessions.
- **Automatic Disconnect Cleanup:** If the host leaves or disconnects, all room participants are notified and returned to the home screen.

---

## How It Works

```text
┌─────────────────────────┐        Socket.IO        ┌─────────────────────────┐
│  React Native / Expo    │  createRoom / joinRoom  │  NestJS Gateway         │
│  Client (Mobile/Web)    │  vote / changeStatus    │  RoomsGateway           │
│                         │ ◄─────────────────────► │  RoomsService           │
│  src/socket.ts          │  roomUpdated/roomClosed │  In-Memory Room Map     │
└─────────────────────────┘                         └─────────────────────────┘
```

The app maintains a single WebSocket connection. The backend manages active rooms in memory without relying on slow database queries for live polling state.

### Room Lifecycle States

| Status | Trigger | Description |
| :--- | :--- | :--- |
| `OPEN` | Automatically on creation | Room is active, participants can join, voting is disabled. |
| `ONVOTE` | Host taps **Start Voting** | Voting is enabled. Vote choices update live in the backend. |
| `CLOSED` | Host taps **Stop Voting** | Voting ends. Vote counts are revealed next to each option. |

---

## Project Structure

```text
my-voting-app/
├── backend/                  # NestJS WebSocket server
│   └── src/
│       └── voting/           # RoomsGateway, RoomsService, and DTOs
└── frontend/                 # React Native / Expo application
    └── src/
        ├── app/              # Expo Router screens (_layout, index, join, create, room)
        └── socket.ts         # Socket.IO client configuration
```

---

## Getting Started Locally

### Prerequisites
- Node.js (v18+ or v20+)
- npm
- **Expo Go** app on your physical mobile device (or Android/iOS emulators)

### 1. Run the Backend Locally (Optional)
```bash
cd backend
npm install
npm run start:dev
```
The local server starts on `http://localhost:3000`.

### 2. Run the Mobile App
```bash
cd frontend
npm install
npx expo start --clear
```
Scan the QR code in your terminal using **Expo Go** on your phone.

---

## Building Android APK (EAS Build)

To build a direct standalone Android `.apk` preview file using Expo Application Services (EAS):

1. Install the EAS CLI globally (if not already installed):
   ```bash
   npm install -g eas-cli
   ```
2. Log in to your Expo account:
   ```bash
   eas login
   ```
3. Ensure your `eas.json` is configured with a preview profile targeting an APK build:
   ```json
   {
     "build": {
       "preview": {
         "android": {
           "buildType": "apk"
         },
         "distribution": "internal"
       }
     }
   }
   ```
4. Run the cloud build command:
   ```bash
   eas build --platform android --profile preview
   ```
5. Once the build finishes, scan the QR code or click the direct download link provided in your terminal to install the APK onto your Android device.

---

## Socket Configuration

The socket endpoint is defined in `frontend/src/socket.ts`. By default, it connects to the production Render backend:

```typescript
import { io } from 'socket.io-client';

const RENDER_BACKEND_URL = 'https://uvote-uwrz.onrender.com';

export const socket = io(RENDER_BACKEND_URL, {
    transports: ['websocket'],
    autoConnect: true,
});
```

*Note: If testing on local Wi-Fi with a local backend, replace the URL with your computer's local IP address (e.g., `http://192.168.x.x:3000`).*

---

## Troubleshooting

- **Cold Start Delay:** Render free-tier instances sleep when idle. The initial connection or room creation can take 30–50 seconds while the backend wakes up.
- **Invalid Room Code:** Room codes are stored in server memory. If the backend restarts or redeploys, active room codes are wiped and users will need to create a new room.