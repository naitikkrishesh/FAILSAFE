import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../utils/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("fs_user")); } catch { return null; }
  });

  
  const [theme, setThemeState] = useState(() => {
    return localStorage.getItem("fs_theme") || "light";
  });

  
  useEffect(() => {
    document.documentElement.className = theme;
    localStorage.setItem("fs_theme", theme);
  }, [theme]);

  
  useEffect(() => {
    if (user) {
      api.get("/settings/").then(r => {
        setThemeState(r.data.theme || "light");
      }).catch(() => {});
    }
  }, [user?.id]);

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    localStorage.setItem("fs_token", res.data.access_token);
    localStorage.setItem("fs_user", JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data;
  };

  const register = async (data) => {
    const res = await api.post("/auth/register", data);
    localStorage.setItem("fs_token", res.data.access_token);
    localStorage.setItem("fs_user", JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem("fs_token");
    localStorage.removeItem("fs_user");
    setUser(null);
  };

  // Fix 2: toggle theme and save to DB
  const toggleTheme = async () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setThemeState(newTheme);
    try {
      await api.patch("/settings/", { theme: newTheme });
    } catch {}
  };

  // Fix 3: update profile
  const updateProfile = async (data) => {
    const res = await api.patch("/auth/profile", data);
    const updatedUser = res.data;
    localStorage.setItem("fs_user", JSON.stringify(updatedUser));
    setUser(updatedUser);
    return updatedUser;
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, theme, toggleTheme, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
