import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(undefined);
const API = "/api";

export const AuthProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(`${API}/users/profile`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setAuthUser(data.data);
        } else {
          setAuthUser(null);
        }
      } catch {
        setAuthUser(null);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, []);

  const signup = async ({ fullName, username, password, profilePic }) => {
    const formData = new FormData();
    formData.append("fullName", fullName);
    formData.append("username", username);
    formData.append("password", password);
    if (profilePic) formData.append("profilePic", profilePic);

    const res = await fetch(`${API}/auth/signup`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Signup failed");

    return login({ username, password });
  };

  const login = async ({ username, password }) => {
    const res = await fetch(`${API}/auth/login`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Login failed");
    setAuthUser(data.data.user);
    return data.data.user;
  };

  const logout = async () => {
    await fetch(`${API}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    setAuthUser(null);
  };

  const updateProfilePic = async (file) => {
    const formData = new FormData();
    formData.append("profilePic", file);

    const res = await fetch(`${API}/users/update-profile-pic`, {
      method: "PATCH",
      credentials: "include",
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Update failed");
    setAuthUser(data.data);
    return data.data;
  };

  return (
    <AuthContext.Provider
      value={{ authUser, isCheckingAuth, signup, login, logout, updateProfilePic }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};