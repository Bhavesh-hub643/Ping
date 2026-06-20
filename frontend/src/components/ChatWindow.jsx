import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";

const API = "/api";

function getInitials(name = "") {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ChatWindow({ receiver }) {
  const { authUser } = useAuth();
  const { subscribeToMessages, unsubscribeFromMessages, isOnline } = useSocket();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  // Fetch history when receiver changes
  useEffect(() => {
    if (!receiver) return;
    setLoading(true);
    setMessages([]);

    fetch(`${API}/messages/${receiver._id}`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setMessages(d.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [receiver?._id]);

  // Subscribe to real-time messages from this receiver
  useEffect(() => {
    if (!receiver) return;

    subscribeToMessages(receiver._id, (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => unsubscribeFromMessages(receiver._id);
  }, [receiver?._id]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() || sending) return;

    const optimistic = {
      _id: `temp-${Date.now()}`,
      senderId: authUser._id,
      receiverId: receiver._id,
      message: text.trim(),
      createdAt: new Date().toISOString(),
      _optimistic: true,
    };

    setMessages((prev) => [...prev, optimistic]);
    setText("");
    setSending(true);

    try {
      const res = await fetch(`${API}/messages/send/${receiver._id}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: optimistic.message }),
      });
      const data = await res.json();
      if (res.ok) {
        // Replace optimistic with real message
        setMessages((prev) =>
          prev.map((m) => (m._id === optimistic._id ? data.data : m))
        );
      } else {
        // Remove optimistic on failure
        setMessages((prev) => prev.filter((m) => m._id !== optimistic._id));
      }
    } catch {
      setMessages((prev) => prev.filter((m) => m._id !== optimistic._id));
    } finally {
      setSending(false);
    }
  };

  if (!receiver) {
    return (
      <div className="chat-empty">
        <div className="chat-empty-icon">✦</div>
        <p>Select someone to start chatting</p>
      </div>
    );
  }

  const online = isOnline(receiver._id);

  return (
    <div className="chat-window">
      {/* Header */}
      <div className="chat-header">
        <div className="avatar">
          {receiver.profilePic ? (
            <img src={receiver.profilePic} alt={receiver.fullName} />
          ) : (
            getInitials(receiver.fullName)
          )}
          {online && <span className="online-dot" />}
        </div>
        <div className="chat-header-info">
          <span className="chat-header-name">{receiver.fullName}</span>
          <span className={`user-status ${online ? "user-status--on" : ""}`}>
            {online ? "Online" : "Offline"}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {loading && <div className="chat-loading">Loading messages…</div>}

        {!loading && messages.length === 0 && (
          <div className="chat-no-messages">
            Say hello to {receiver.fullName} 👋
          </div>
        )}

        {messages.map((msg) => {
          const mine = String(msg.senderId) === String(authUser._id);
          return (
            <div
              key={msg._id}
              className={`msg-row ${mine ? "msg-row--mine" : "msg-row--theirs"}`}
            >
              {!mine && (
                <div className="avatar avatar--sm">
                  {receiver.profilePic ? (
                    <img src={receiver.profilePic} alt={receiver.fullName} />
                  ) : (
                    getInitials(receiver.fullName)
                  )}
                </div>
              )}
              <div className={`bubble ${mine ? "bubble--mine" : "bubble--theirs"} ${msg._optimistic ? "bubble--sending" : ""}`}>
                <span className="bubble-text">{msg.message}</span>
                <span className="bubble-time">{formatTime(msg.createdAt)}</span>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form className="chat-input-row" onSubmit={sendMessage}>
        <input
          className="chat-input"
          type="text"
          placeholder={`Message ${receiver.fullName}…`}
          value={text}
          onChange={(e) => setText(e.target.value)}
          autoComplete="off"
        />
        <button
          type="submit"
          className="send-btn"
          disabled={!text.trim() || sending}
          aria-label="Send"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </form>
    </div>
  );
}