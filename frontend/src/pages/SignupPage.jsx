import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function SignupPage({ onSwitch }) {
  const { signup } = useAuth();
  const [form, setForm] = useState({
    fullName: "",
    username: "",
    password: "",
  });
  const [picFile, setPicFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPicFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signup({ ...form, profilePic: picFile });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <div className="auth-logo">
        <span className="logo-icon">✦</span>
        <span className="logo-text">Ping</span>
      </div>
      <h1 className="auth-title">Create account</h1>
      <p className="auth-sub">Pick a username and start chatting</p>

      {/* Avatar picker */}
      <label className="avatar-picker" title="Upload profile picture">
        {preview ? (
          <img src={preview} alt="preview" className="avatar-preview" />
        ) : (
          <div className="avatar-placeholder">
            <span>+</span>
            <span className="avatar-hint">Photo</span>
          </div>
        )}
        <input type="file" accept="image/*" onChange={handleFile} hidden />
      </label>

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="field">
          <label>Full name</label>
          <input
            type="text"
            placeholder="Alex Rivera"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            required
          />
        </div>
        <div className="field">
          <label>Username</label>
          <input
            type="text"
            placeholder="alexrivera"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            required
          />
        </div>
        <div className="field">
          <label>Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            autoComplete="new-password"
            required
          />
        </div>

        {error && <p className="auth-error">{error}</p>}

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="auth-switch">
        Already have one?{" "}
        <button onClick={onSwitch} className="link-btn">
          Sign in
        </button>
      </p>
    </div>
  );
}