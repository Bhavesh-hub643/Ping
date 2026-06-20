import { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import "./index.css";

function Inner() {
  const { authUser, isCheckingAuth } = useAuth();
  const [showSignup, setShowSignup] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  if (isCheckingAuth) {
    return (
      <div className="splash">
        <span className="logo-icon splash-icon">✦</span>
      </div>
    );
  }

  if (!authUser) {
    return (
      <div className="auth-page">
        {showSignup ? (
          <SignupPage onSwitch={() => setShowSignup(false)} />
        ) : (
          <LoginPage onSwitch={() => setShowSignup(true)} />
        )}
      </div>
    );
  }

  return (
    <SocketProvider>
      <div className="app-layout">
        <Sidebar selectedUser={selectedUser} onSelectUser={setSelectedUser} />
        <main className="chat-area">
          <ChatWindow receiver={selectedUser} />
        </main>
      </div>
    </SocketProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Inner />
    </AuthProvider>
  );
}