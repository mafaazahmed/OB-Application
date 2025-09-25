import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const admin = localStorage.getItem("admin") === "true"; // ✅ always boolean

    if (token) {
      setIsAuthenticated(true);
      setUser({ token, admin });
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const response = await axios.post("/user/login", credentials);

      if (response.data.success) {
        const { authToken, admin } = response.data;

        // ✅ Always save "true" / "false" as strings
        localStorage.setItem("authToken", authToken);
        localStorage.setItem("admin", admin ? "true" : "false");

        // ✅ Save user with proper boolean admin
        setUser({ token: authToken, admin: !!admin });
        setIsAuthenticated(true);

        return { success: true };
      } else {
        return { success: false, error: response.data.error };
      }
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        error: error.response?.data?.error || "Login failed",
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("admin");
    setUser(null);
    setIsAuthenticated(false);
  };

  // ✅ Instead of function, just use user?.admin
  const isAdmin = user?.admin || false;

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, loading, login, logout, isAdmin }}
    >
      {children}
    </AuthContext.Provider>
  );
};
