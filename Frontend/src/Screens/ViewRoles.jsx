import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function ViewRoles() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/user/show");
        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleEdit = async (data) => {
    let userData = JSON.stringify(data);
    localStorage.setItem("user", userData);
    navigate("/Edituser");
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "Admin":
        return "bg-success text-white";
      case "Cashier":
        return "bg-danger text-white";
      default:
        return "bg-secondary text-white";
    }
  };

  return (
    <>
      <Navbar />
      <div
        className="container-fluid py-4"
        style={{
          background: "white",
          minHeight: "calc(100vh - 200px)",
          marginBottom: "50px",
        }}
      >
        <div className="container">
          {/* Stats Cards */}
          <div className="row mb-3">
            <div className="col-md-4 mb-2">
              <div
                className="card border-0 h-100"
                style={{
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                  border: "1px solid #f0f0f0",
                }}
              >
                <div className="card-body text-center py-2">
                  <div
                    style={{
                      fontSize: "1.5rem",
                      background:
                        "linear-gradient(135deg, rgba(34, 197, 94, 0.85) 0%, rgba(16, 185, 129, 0.85) 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    <i className="fa-solid fa-users"></i>
                  </div>
                  <h5 className="card-title text-dark mb-1">{users.length}</h5>
                  <p
                    className="card-text text-muted mb-0"
                    style={{ fontSize: "0.8rem" }}
                  >
                    Total Users
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-2">
              <div
                className="card border-0 h-100"
                style={{
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                  border: "1px solid #f0f0f0",
                }}
              >
                <div className="card-body text-center py-2">
                  <div
                    style={{
                      fontSize: "1.5rem",
                      background:
                        "linear-gradient(135deg, rgba(34, 197, 94, 0.85) 0%, rgba(16, 185, 129, 0.85) 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    <i className="fa-solid fa-user-shield"></i>
                  </div>
                  <h5 className="card-title text-dark mb-1">
                    {users.filter((user) => user.role === "Admin").length}
                  </h5>
                  <p
                    className="card-text text-muted mb-0"
                    style={{ fontSize: "0.8rem" }}
                  >
                    Administrators
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-2">
              <div
                className="card border-0 h-100"
                style={{
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                  border: "1px solid #f0f0f0",
                }}
              >
                <div className="card-body text-center py-2">
                  <div
                    style={{
                      fontSize: "1.5rem",
                      background:
                        "linear-gradient(135deg, rgba(34, 197, 94, 0.85) 0%, rgba(16, 185, 129, 0.85) 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    <i className="fa-solid fa-cash-register"></i>
                  </div>
                  <h5 className="card-title text-dark mb-1">
                    {users.filter((user) => user.role === "Cashier").length}
                  </h5>
                  <p
                    className="card-text text-muted mb-0"
                    style={{ fontSize: "0.8rem" }}
                  >
                    Cashiers
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Table Card */}
          <div
            className="card border-0"
            style={{
              borderRadius: "12px",
              overflow: "hidden",
              boxShadow: "0 6px 20px rgba(0, 0, 0, 0.15)",
              border: "1px solid #e0e0e0",
            }}
          >
            <div className="card-header bg-white border-0 py-3">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0 text-dark fw-bold">
                  <i
                    className="fa-solid fa-list me-2"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(34, 197, 94, 0.85) 0%, rgba(16, 185, 129, 0.85) 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  ></i>
                  User Roles Overview
                </h5>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-sm"
                    onClick={() => navigate("/signup")}
                    style={{
                      borderRadius: "8px",
                      fontSize: "0.8rem",
                      background:
                        "linear-gradient(135deg, rgba(34, 197, 94, 0.85) 0%, rgba(16, 185, 129, 0.85) 100%)",
                      color: "white",
                      border: "none",
                      boxShadow: "0 4px 15px rgba(102, 126, 234, 0.3)",
                    }}
                  >
                    <i className="fa-solid fa-plus me-1"></i>
                    Add User
                  </button>
                </div>
              </div>
            </div>

            <div className="card-body p-0">
              {loading ? (
                <div className="text-center py-4">
                  <div
                    className="spinner-border"
                    role="status"
                    style={{
                      width: "2rem",
                      height: "2rem",
                      background:
                        "linear-gradient(135deg, rgba(34, 197, 94, 0.85) 0%, rgba(16, 185, 129, 0.85) 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2 text-muted" style={{ fontSize: "0.9rem" }}>
                    Loading users...
                  </p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th
                          className="border-0 py-2 px-3 text-muted fw-semibold"
                          style={{ fontSize: "0.85rem" }}
                        >
                          <i className="fa-solid fa-hashtag me-1"></i>
                        </th>
                        <th
                          className="border-0 py-2 px-3 text-muted fw-semibold"
                          style={{ fontSize: "0.85rem" }}
                        >
                          <i className="fa-solid fa-user me-1"></i>Username
                        </th>
                        <th
                          className="border-0 py-2 px-3 text-muted fw-semibold"
                          style={{ fontSize: "0.85rem" }}
                        >
                          <i className="fa-solid fa-user-tag me-1"></i>Role
                        </th>
                        <th
                          className="border-0 py-2 px-3 text-muted fw-semibold"
                          style={{ fontSize: "0.85rem" }}
                        >
                          <i className="fa-solid fa-edit me-1"></i>Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((data, idx) => (
                        <tr key={idx} className="border-bottom">
                          <td className="py-2 px-3">
                            <span
                              className="badge rounded-pill"
                              style={{
                                fontSize: "0.75rem",
                                background:
                                  "linear-gradient(135deg, rgba(34, 197, 94, 0.85) 0%, rgba(16, 185, 129, 0.85) 100%)",
                                color: "white",
                              }}
                            >
                              {idx + 1}
                            </span>
                          </td>
                          <td className="py-2 px-3">
                            <div className="d-flex align-items-center">
                              <div
                                className="bg-light rounded-circle d-flex align-items-center justify-content-center me-2"
                                style={{ width: "32px", height: "32px" }}
                              >
                                <i
                                  className="fa-solid fa-user text-muted"
                                  style={{ fontSize: "0.8rem" }}
                                ></i>
                              </div>
                              <span
                                className="fw-semibold text-dark"
                                style={{ fontSize: "0.9rem" }}
                              >
                                {data.username}
                              </span>
                            </div>
                          </td>
                          <td className="py-2 px-3">
                            <span
                              className={`badge ${getRoleBadgeColor(
                                data.role
                              )} rounded-pill px-2 py-1`}
                              style={{ fontSize: "0.75rem" }}
                            >
                              <i
                                className={`fa-solid ${
                                  data.role === "Admin"
                                    ? "fa-user-shield"
                                    : "fa-cash-register"
                                } me-1`}
                              ></i>
                              {data.role}
                            </span>
                          </td>
                          <td className="py-2 px-3">
                            <div className="d-flex gap-1">
                              <button
                                className="btn btn-sm"
                                onClick={() => handleEdit(data)}
                                style={{
                                  borderRadius: "6px",
                                  fontSize: "0.75rem",
                                  padding: "0.25rem 0.5rem",
                                  background:
                                    "linear-gradient(135deg, rgba(34, 197, 94, 0.85) 0%, rgba(16, 185, 129, 0.85) 100%)",
                                  color: "white",
                                  border: "none",
                                  boxShadow:
                                    "0 2px 8px rgba(102, 126, 234, 0.3)",
                                }}
                              >
                                <i className="fa-solid fa-edit me-1"></i>
                                Edit
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Empty State */}
          {!loading && users.length === 0 && (
            <div className="text-center py-4">
              <div className="display-4 text-muted mb-2">
                <i className="fa-solid fa-users-slash"></i>
              </div>
              <h5 className="text-muted mb-2">No Users Found</h5>
              <p className="text-muted mb-3" style={{ fontSize: "0.9rem" }}>
                Start by adding your first user to the system.
              </p>
              <button
                className="btn btn-sm"
                onClick={() => navigate("/signup")}
                style={{
                  borderRadius: "8px",
                  background:
                    "linear-gradient(135deg, rgba(34, 197, 94, 0.85) 0%, rgba(16, 185, 129, 0.85) 100%)",
                  color: "white",
                  border: "none",
                  boxShadow: "0 4px 15px rgba(102, 126, 234, 0.3)",
                }}
              >
                <i className="fa-solid fa-plus me-1"></i>
                Add First User
              </button>
            </div>
          )}

          {/* Space after table */}
          <div style={{ height: "300px" }}></div>
        </div>
      </div>
      <div style={{ marginTop: "60px" }}>
        {" "}
        <Footer />
      </div>
    </>
  );
}
