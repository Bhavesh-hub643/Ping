import { useEffect, useState } from "react";
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

export default function Sidebar({ selectedUser, onSelectUser }) {
  const { authUser, logout } = useAuth();
  const { isOnline } = useSocket();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/messages/users`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setUsers(d.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <aside className="sidebar">
      {/* Header */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <span className="logo-icon">✦</span>
          <span className="logo-text">Ping</span>
        </div>
        <button className="icon-btn logout-btn" onClick={logout} title="Sign out">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>

      {/* Me */}
      <div className="sidebar-me">
        <div className="avatar avatar--me">
          {authUser?.profilePic ? (
            <img src={authUser.profilePic} alt={authUser.fullName} />
          ) : (
            getInitials(authUser?.fullName)
          )}
          <span className="online-dot" />
        </div>
        <div className="sidebar-me-info">
          <span className="me-name">{authUser?.fullName}</span>
          <span className="me-username">@{authUser?.username}</span>
        </div>
      </div>

      <div className="sidebar-divider" />

      {/* Search label */}
      <p className="sidebar-label">People</p>

      {/* User list */}
      <div className="sidebar-list">
        {loading && (
          <div className="sidebar-empty">Loading…</div>
        )}
        {!loading && users.length === 0 && (
          <div className="sidebar-empty">No other users yet</div>
        )}
        {users.map((u) => {
          const online = isOnline(u._id);
          const active = selectedUser?._id === u._id;
          return (
            <button
              key={u._id}
              className={`sidebar-user ${active ? "sidebar-user--active" : ""}`}
              onClick={() => onSelectUser(u)}
            >
              <div className="avatar">
                {u.profilePic ? (
                  <img src={u.profilePic} alt={u.fullName} />
                ) : (
                  getInitials(u.fullName)
                )}
                {online && <span className="online-dot" />}
              </div>
              <div className="sidebar-user-info">
                <span className="user-name">{u.fullName}</span>
                <span className={`user-status ${online ? "user-status--on" : ""}`}>
                  {online ? "Online" : "Offline"}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}