# LensScan — Object Recognition System

A full-stack web application that identifies objects in images using a vision-capable LLM via the OpenRouter API. Capture a photo directly from your webcam or upload an image, and get back labeled object detections in real time.

**Live demo:** https://lensscan.vercel.app/ <!-- update if needed -->

---

## Features

- **User authentication** — signup/login secured with JWT and bcrypt password hashing
- **Image capture** — take a photo directly from your device camera, or upload an existing image
- **Mobile-friendly camera controls** — automatically detects and offers front/back camera switching on devices with multiple cameras
- **AI-powered object detection** — sends captured images to a vision LLM (via OpenRouter) and returns structured labels, confidence levels, and short descriptions
- **Responsive design** — works across mobile, tablet, and desktop
- **Protected REST API** — backend routes secured with custom JWT middleware

---

## Tech Stack

**Frontend:** React (Vite), Axios, vanilla CSS<br>
**Backend:** Node.js, Express, Mongoose<br>
**Database:** MongoDB Atlas<br>
**Authentication:** JWT, bcrypt<br>
**AI/Detection:** OpenRouter API (vision-capable LLM)<br>
**Deployment:** Render (backend), Vercel (frontend)<br>

---

## Project Structure

```
object-recognition-system/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── models/
│   │   ├── User.js
│   │   └── Detection.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── detect.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── server.js
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Login.jsx
    │   │   ├── Login.css
    │   │   ├── WebcamDetector.jsx
    │   │   └── WebcamDetector.css
    │   ├── App.jsx
    │   ├── App.css
    │   ├── index.css
    │   └── main.jsx
    └── package.json
```

---

## Getting Started

### Prerequisites

- Node.js (v18+)
- A MongoDB Atlas account and connection string
- An OpenRouter API key ([openrouter.ai](https://openrouter.ai))

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/object-recognition-system.git
cd object-recognition-system
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_random_jwt_secret
OPENROUTER_API_KEY=your_openrouter_api_key
```

Run the backend:

```bash
node server.js
```

### 3. Frontend setup

```bash
cd ../frontend
npm install
```

Create a `.env` file in `frontend/`:

```
VITE_API_URL=http://localhost:5000
```

Run the frontend:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## API Endpoints

| Method | Endpoint             | Description                          | Auth Required |
|--------|-----------------------|---------------------------------------|----------------|
| POST   | `/api/auth/signup`    | Register a new user                   | No             |
| POST   | `/api/auth/login`     | Log in and receive a JWT              | No             |
| POST   | `/api/detect`         | Detect objects in an uploaded image   | Yes            |

---
## ⭐ Support

If you found this project useful, consider giving it a ⭐ on GitHub.
