import { useState } from "react";
import axios from "axios";
import Footer from "./Footer";
import Navbar from "./Navbar";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const [user, setUser] = useState({ username: "", password: "", role: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user.username || !user.password || !user.role) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const createUser = await axios.post(
        "/user/signup",
        user
      );
      console.log(createUser);
      setUser({ username: "", password: "", role: "" });
      navigate("/viewroles");
    } catch (error) {
      console.error("Error creating user:", error);
      setError("Failed to create user. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onchange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
    setError(""); // Clear error when user starts typing
  };

  return (
    <>
      <Navbar />
      <div className="container mt-4">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div
              className="card shadow-lg border-0"
              style={{
                background: "white",
                borderRadius: "16px",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                border: "1px solid #e2e8f0",
              }}
            >
              <div className="card-header bg-transparent border-0 text-center pt-4 pb-2">
                <h3
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(34, 197, 94, 0.85) 0%, rgba(16, 185, 129, 0.85) 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    fontWeight: 700,
                    fontSize: "1.8rem",
                  }}
                >
                  Add New User
                </h3>
                <p className="text-muted mb-0" style={{ fontSize: "0.9rem" }}>
                  Create a new user account
                </p>
              </div>

              <div className="card-body p-4">
                {/* Error Message */}
                {error && (
                  <div
                    className="alert alert-danger border-0 shadow-sm mb-4"
                    role="alert"
                    style={{ borderRadius: "12px", fontSize: "0.9rem" }}
                  >
                    <i className="fa-solid fa-exclamation-triangle me-2"></i>
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  {/* Username Field */}
                  <div className="mb-4">
                    <label
                      htmlFor="username"
                      className="form-label fw-semibold"
                      style={{ color: "#2d3748", fontSize: "0.95rem" }}
                    >
                      <i
                        className="fa-solid fa-user me-2"
                        style={{ color: "#22c55e" }}
                      ></i>
                      Username
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="username"
                      name="username"
                      value={user.username}
                      onChange={onchange}
                      placeholder="Enter username"
                      style={{
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0",
                        padding: "12px 16px",
                        fontSize: "0.95rem",
                      }}
                    />
                  </div>

                  {/* Password Field */}
                  <div className="mb-4">
                    <label
                      htmlFor="password"
                      className="form-label fw-semibold"
                      style={{ color: "#2d3748", fontSize: "0.95rem" }}
                    >
                      <i
                        className="fa-solid fa-lock me-2"
                        style={{ color: "#22c55e" }}
                      ></i>
                      Password
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      id="password"
                      name="password"
                      value={user.password}
                      onChange={onchange}
                      placeholder="Enter password"
                      style={{
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0",
                        padding: "12px 16px",
                        fontSize: "0.95rem",
                      }}
                    />
                  </div>

                  {/* Role Selection */}
                  <div className="mb-4">
                    <label
                      className="form-label fw-semibold mb-3"
                      style={{ color: "#2d3748", fontSize: "0.95rem" }}
                    >
                      <i
                        className="fa-solid fa-user-tag me-2"
                        style={{ color: "#22c55e" }}
                      ></i>
                      User Role
                    </label>
                    <div className="d-flex gap-4">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          id="adminRole"
                          name="role"
                          value="Admin"
                          checked={user.role === "Admin"}
                          onChange={onchange}
                          style={{
                            width: "1.2rem",
                            height: "1.2rem",
                            accentColor: "#667eea",
                          }}
                        />
                        <label
                          className="form-check-label fw-semibold ms-2"
                          htmlFor="adminRole"
                          style={{ color: "#2d3748", fontSize: "0.95rem" }}
                        >
                          <i className="fa-solid fa-user-shield me-1 text-success"></i>
                          Administrator
                        </label>
                      </div>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          id="cashierRole"
                          name="role"
                          value="Cashier"
                          checked={user.role === "Cashier"}
                          onChange={onchange}
                          style={{
                            width: "1.2rem",
                            height: "1.2rem",
                            accentColor: "#667eea",
                          }}
                        />
                        <label
                          className="form-check-label fw-semibold ms-2"
                          htmlFor="cashierRole"
                          style={{ color: "#2d3748", fontSize: "0.95rem" }}
                        >
                          <i className="fa-solid fa-cash-register me-1 text-danger"></i>
                          Cashier
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="d-flex gap-3 mt-4">
                    <button
                      type="submit"
                      className="btn text-white fw-semibold flex-fill"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(34, 197, 94, 0.85) 0%, rgba(16, 185, 129, 0.85) 100%)",
                        borderRadius: "8px",
                        padding: "8px 16px",
                        fontSize: "0.9rem",
                        border: "none",
                        boxShadow: "0 4px 15px rgba(102, 126, 234, 0.3)",
                      }}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <i className="fa-solid fa-spinner fa-spin me-2"></i>
                          Creating User...
                        </>
                      ) : (
                        <>
                          <i className="fa-solid fa-user-plus me-2"></i>
                          Add New User
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-secondary fw-semibold"
                      onClick={() => navigate("/viewroles")}
                      style={{
                        borderRadius: "8px",
                        padding: "8px 16px",
                        fontSize: "0.9rem",
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      <i className="fa-solid fa-times me-2"></i>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div style={{ marginTop: "60px" }}>
        <Footer />
      </div>
    </>
  );
}
