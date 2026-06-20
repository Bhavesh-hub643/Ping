# Ping 💬

A full-stack real-time chat application built with the MERN stack and Socket.io.

## Features

- Real-time messaging using WebSockets (Socket.io)
- User authentication with JWT and bcrypt password hashing
- Persistent chat history stored in MongoDB
- Cookie-based session management
- Responsive frontend UI

## Tech Stack

**Backend**
- Node.js + Express 5
- MongoDB + Mongoose
- Socket.io
- JSON Web Tokens (JWT)
- bcryptjs
- dotenv, cookie-parser, cors

**Frontend**
- React (Vite)
- Socket.io-client
- CSS

## Project Structure

```
Ping/
├── backend/
│   └── src/
│       └── index.js       # Entry point
├── frontend/              # React app
├── package.json           # Root scripts (concurrent dev, production start)
└── .gitignore
```

## Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB instance (local or Atlas)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Bhavesh-hub643/Ping.git
   cd Ping
   ```

2. Install root dependencies:
   ```bash
   npm install
   ```

3. Install backend dependencies:
   ```bash
   cd backend && npm install
   ```

4. Install frontend dependencies:
   ```bash
   cd frontend && npm install
   ```

5. Create a `.env` file inside the `backend/` directory with the following variables:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   NODE_ENV=development
   ```

### Running the App

**Development** (runs both frontend and backend concurrently):
```bash
npm run dev
```

**Production**:
```bash
npm start
```

The backend runs on `http://localhost:5000` and the frontend dev server on `http://localhost:5173` by default.


## License

ISC
