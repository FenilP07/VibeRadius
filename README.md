# VibeRadius

A collaborative music sharing application that allows users to create shared listening sessions where multiple people can vote on and queue songs together in real-time using Spotify integration.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [How-Tos & Usage](#how-tos--usage)
- [API Endpoints](#api-endpoints)
- [Contributors](#contributors)

## ✨ Features

- **User Authentication**: Secure user registration and login with JWT tokens
- **Spotify Integration**: Search and queue songs from Spotify
- **Session Management**: Create collaborative listening sessions with unique session codes
- **Real-time Voting**: Vote on songs in the queue (upvote/downvote)
- **Queue Management**: Dynamic queue that responds to user votes
- **Admin Controls**: Host-specific controls for managing sessions
- **Multi-user Sync**: Real-time synchronization across multiple connected users via WebSockets
- **Session Profiles**: Track host profiles and session history
- **Spotify Token Refresh**: Automatic token refresh for uninterrupted streaming

## 🛠 Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js 5.2.1
- **Database**: MongoDB with Mongoose 9.1.1
- **Authentication**: JWT (jsonwebtoken), bcrypt
- **Real-time Communication**: Socket.IO 4.8.3
- **Spotify API**: Axios for HTTP requests
- **File Management**: Multer, Cloudinary
- **Logging**: Winston, Morgan
- **Environment**: Dotenv

### Frontend
- **Framework**: React 19.2.3
- **Build Tool**: Vite 7.2.4
- **Styling**: Tailwind CSS 4.1.18
- **State Management**: Zustand 5.0.10
- **Routing**: React Router DOM 7.12.0
- **Real-time**: Socket.IO Client 4.8.3
- **Animations**: Framer Motion 12.26.2, Lottie React
- **Icons**: React Icons, Lucide React
- **HTTP Client**: Axios

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- MongoDB instance (local or cloud)
- Spotify Developer Account (for API credentials)

### Step 1: Clone the Repository

```bash
git clone https://github.com/FenilP07/VibeRadius.git
cd VibeRadius
```

### Step 2: Backend Setup

```bash
cd backend
npm install
```

### Step 3: Frontend Setup

```bash
cd ../frontend
npm install
```

## 🔐 Environment Variables

### Backend (.env)

Create a `.env` file in the `backend` folder with the following variables:

```env
# Database
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

# Spotify API
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REDIRECT_URI=http://localhost:5000/api/spotify/callback

# Application
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Cloudinary (optional, for image uploads)
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### Frontend (.env)

Create a `.env` file in the `frontend` folder:

```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

### Getting Spotify Credentials

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new application
3. Accept the terms and create the app
4. Copy your **Client ID** and **Client Secret**
5. Set the redirect URI to `http://localhost:5000/api/spotify/callback`

## 🚀 Running the Application

### Development Mode

#### Terminal 1 - Backend
```bash
cd backend
npm run dev
```
Backend runs on `http://localhost:5000`

#### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```
Frontend runs on `http://localhost:5173`

### Production Mode

#### Backend
```bash
cd backend
npm start
```

#### Frontend
```bash
cd frontend
npm run build
npm run preview
```

## 📂 Project Structure

```
VibeRadius/
├── backend/
│   ├── configs/           # Database, Socket, Spotify configurations
│   ├── controllers/       # Route handlers
│   │   └── spotify/       # Spotify-specific controllers
│   ├── middlewares/       # Auth, error handling, Socket auth
│   │   └── spotify/       # Spotify token middleware
│   ├── models/            # MongoDB schemas
│   ├── routes/            # API routes
│   ├── services/          # Business logic (Spotify, Token refresh)
│   ├── socket/            # WebSocket handlers and namespaces
│   ├── utils/             # Helper functions, API utilities
│   ├── public/            # Static files
│   ├── app.js             # Express app setup
│   ├── index.js           # Server entry point
│   └── package.json       # Dependencies
│
└── frontend/
    ├── src/
    │   ├── components/    # React components
    │   │   ├── ui/        # Reusable UI components
    │   │   └── admin/     # Admin-specific components
    │   ├── pages/         # Page components
    │   │   └── admin/     # Admin pages
    │   ├── services/      # API service calls
    │   ├── socket/        # Socket.IO setup
    │   ├── store/         # Zustand stores (state management)
    │   ├── utils/         # Utilities (API client, socket manager)
    │   ├── hooks/         # Custom React hooks
    │   ├── modals/        # Modal components
    │   ├── assets/        # Images, animations, etc.
    │   ├── App.jsx        # Root component
    │   ├── AppRoutes.jsx  # Route definitions
    │   └── main.jsx       # React entry point
    └── package.json       # Dependencies
```

## 💡 How-Tos & Usage

### For Users

#### 1. Sign Up
- Navigate to the Register page
- Enter email and password
- Account created with a unique username

#### 2. Create a Session
- Click "Create Session"
- Get a unique session code (share with friends)
- Configure session settings

#### 3. Search and Queue Songs
- Use the Spotify Search component
- Click on a song to add it to queue
- Songs appear in the voting queue

#### 4. Vote on Songs
- Upvote songs you want to hear
- Downvote songs you don't want
- Queue reorders based on votes

#### 5. Join a Session
- Enter a session code
- See the live queue
- Start voting on songs

### For Developers

#### Connect to Spotify API
The backend handles Spotify authentication. The frontend receives a token after login.

#### Add a New Route
1. Create controller in `backend/controllers/`
2. Create router in `backend/routes/`
3. Import and use in `backend/app.js`

```javascript
// Example route in app.js
import myRoutes from "./routes/my.route.js";
app.use("/api/my", myRoutes);
```

#### Add Real-time Events
1. Create handler in `backend/socket/handlers/`
2. Register in `backend/socket/namespaces/`
3. Emit from frontend: `socket.emit('eventName', data)`

Example in frontend:
```javascript
import { socket } from './socket/session.socket';
socket.emit('vote', { songId, type: 'upvote' });
```

#### Add State Management
Use Zustand in `frontend/src/store/`:

```javascript
// Create store
import { create } from 'zustand';

export const useMyStore = create((set) => ({
  data: null,
  setData: (data) => set({ data }),
}));

// Use in component
import { useMyStore } from '../store/myStore';
const { data } = useMyStore();
```

## 📡 API Endpoints

### Auth Routes
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Session Routes
- `POST /api/session/create` - Create new session
- `GET /api/session/:code` - Get session details
- `POST /api/session/:code/join` - Join session
- `GET /api/session/:code/queue` - Get session queue

### Spotify Routes
- `GET /api/spotify/search` - Search Spotify tracks
- `POST /api/spotify/callback` - Spotify auth callback

### Health Check
- `GET /api/health` - API health status

## 🔧 Testing

### Backend
```bash
cd backend
npm test
```

### Frontend Linting
```bash
cd frontend
npm run lint
```

## 👥 Contributors

- Fenil Patel
- Henil Patel
- Priyam Vasi

## 📄 License

ISC License - See LICENSE file for details

## 🔗 Repository

[GitHub - VibeRadius](https://github.com/FenilP07/VibeRadius)

## 🤝 Support

For issues and feature requests, please visit [GitHub Issues](https://github.com/FenilP07/VibeRadius/issues)
