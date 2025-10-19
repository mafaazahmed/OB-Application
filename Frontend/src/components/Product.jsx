import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function Product() {
  const [product, setProduct] = useState([]);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const productData = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/product/show");
        setProduct(response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    productData();

    const isViewMode = localStorage.getItem("viewMode") === "true";
    setViewMode(isViewMode);

    const handleViewModeChange = (event) => {
      setViewMode(event.detail);
    };

    window.addEventListener("viewModeChange", handleViewModeChange);

    return () => {
      window.removeEventListener("viewModeChange", handleViewModeChange);
    };
  }, []);

  const shouldShowContent = localStorage.getItem("authToken") || viewMode;
  const isAdmin = localStorage.getItem("admin") === "true";

  // Inline editing state
  const [editingRowId, setEditingRowId] = useState(null);
  const [drafts, setDrafts] = useState({});

  // ✅ Delete product handler
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await axios.delete(`/product/delete/${id}`);
        setProduct((prev) => prev.filter((item) => item._id !== id));
        navigate("/product");
      } catch (err) {
        console.error("Error deleting product:", err);
        alert("Failed to delete product: " + (err.response?.data?.message || err.message));
      }
    }
  };

  return (
    <>
      {shouldShowContent && (
        <>
          <Navbar />

          {/* Search Box */}
          <div className="py-4">
            <div className="d-flex justify-content-center">
              <input
                className="form-control"
                type="search"
                placeholder="🔍 Search products..."
                aria-label="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  maxWidth: "500px",
                  padding: "12px 16px",
                  borderRadius: "12px",
                  border: "1px solid #d1d1d1",
                  background: "#fff",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                  transition: "all 0.3s ease",
                }}
                onFocus={(e) =>
                  (e.target.style.boxShadow = "0 0 8px rgba(128, 0, 128, 0.5)")
                }
                onBlur={(e) =>
                  (e.target.style.boxShadow =
                    "0 4px 12px rgba(0, 0, 0, 0.1)")
                }
              />
            </div>
          </div>

          {/* Loading Spinner */}
          {loading ? (
            <div className="text-center py-4">
              <div
                className="spinner-border text-primary"
                role="status"
                style={{ width: "2rem", height: "2rem" }}
              >
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2 text-muted" style={{ fontSize: "0.9rem" }}>
                Loading products...
              </p>
            </div>
          ) : (
            <div className="container py-4">
              <div className="table-responsive shadow rounded">
                <table className="table table-hover align-middle text-center mb-0">
                  <thead
                    className="text-white"
                    style={{
                      background: "linear-gradient(90deg, #22c55e, #16a34a)",
                    }}
                  >
                    <tr>
                      <th scope="col">#</th>
                      <th scope="col">Product Name</th>
                      <th scope="col">Category</th>
                      <th scope="col">Price (₹)</th>
                      <th scope="col">Actual Price (₹)</th>
                      <th scope="col">Profit (₹)</th>
                      <th scope="col">Size</th>
                      {isAdmin && <th scope="col">Edit Product</th>}
                      {isAdmin && <th scope="col">Delete</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {product
                      .filter((item) =>
                        item.name.toLowerCase().includes(search.toLowerCase())
                      )
                      .map((data, index) => {
                        const isEditing = editingRowId === data._id;
                        const draft = drafts[data._id] || {
                          name: data.name,
                          category: data.category,
                          price: data.price,
                          actualprice: data.actual_price ?? 0,
                          profit: data.profit ?? 0,
                          size: data.size ?? "1kg", // Initialize size with default
                        };

                        const startEdit = () => {
                          setEditingRowId(data._id);
                          setDrafts((prev) => ({
                            ...prev,
                            [data._id]: {
                              name: data.name,
                              category: data.category,
                              price: data.price,
                              actualprice: data.actual_price ?? 0,
                              profit: data.profit ?? 0,
                              size: data.size ?? "1kg", // Initialize size with default
                            },
                          }));
                        };

                        const cancelEdit = () => {
                          setEditingRowId(null);
                          setDrafts((prev) => {
                            const copy = { ...prev };
                            delete copy[data._id];
                            return copy;
                          });
                        };

                        const saveEdit = async () => {
                          try {
                            const d = drafts[data._id];
                            const payload = {
                              name: d.name,
                              category: d.category,
                              price: d.price,
                              profit: d.profit,
                              actual_price: d.actualprice,
                              size: d.size, // Include size in payload
                            };
                            await axios.put(`/product/update/${data._id}`, payload);
                            setProduct((prev) =>
                              prev.map((p) =>
                                p._id === data._id ? { ...p, ...payload } : p
                              )
                            );
                            setEditingRowId(null);
                            setDrafts((prev) => {
                              const copy = { ...prev };
                              delete copy[data._id];
                              return copy;
                            });
                          } catch (err) {
                            console.error("Error updating product", err);
                            alert(
                              "Failed to update product: " +
                                (err.response?.data?.message || err.message)
                            );
                          }
                        };

                        return (
                          <tr key={data._id}>
                            <td>
                              <b>{index + 1}</b>
                            </td>
                            <td>
                              {isEditing ? (
                                <input
                                  className="form-control"
                                  value={draft.name}
                                  onChange={(e) =>
                                    setDrafts((prev) => ({
                                      ...prev,
                                      [data._id]: {
                                        ...prev[data._id],
                                        name: e.target.value,
                                      },
                                    }))
                                  }
                                />
                              ) : (
                                data.name
                              )}
                            </td>
                            <td>
                              {isEditing ? (
                                <select
                                  className="form-select"
                                  value={draft.category}
                                  onChange={(e) =>
                                    setDrafts((prev) => ({
                                      ...prev,
                                      [data._id]: {
                                        ...prev[data._id],
                                        category: e.target.value,
                                      },
                                    }))
                                  }
                                >
                                  <option value="Vegetable">Vegetable</option>
                                  <option value="Chicken">Chicken</option>
                                  <option value="Beef">Beef</option>
                                  <option value="Mutton">Mutton</option>
                                  <option value="Other">Other</option>
                                </select>
                              ) : (
                                <span className="badge bg-secondary">
                                  {data.category}
                                </span>
                              )}
                            </td>
                            <td>
                              {isEditing ? (
                                <input
                                  type="number"
                                  min="0"
                                  className="form-control"
                                  value={draft.price}
                                  onChange={(e) =>
                                    setDrafts((prev) => ({
                                      ...prev,
                                      [data._id]: {
                                        ...prev[data._id],
                                        price: Number(e.target.value),
                                      },
                                    }))
                                  }
                                />
                              ) : (
                                <span className="fw-bold text-success">
                                  ₹{data.price}
                                </span>
                              )}
                            </td>
                            <td>
                              {isEditing ? (
                                <input
                                  type="number"
                                  min="0"
                                  className="form-control"
                                  value={draft.actualprice}
                                  onChange={(e) =>
                                    setDrafts((prev) => ({
                                      ...prev,
                                      [data._id]: {
                                        ...prev[data._id],
                                        actualprice: Number(e.target.value),
                                      },
                                    }))
                                  }
                                />
                              ) : (
                                <span className="fw-bold text-muted">
                                  ₹{(data.actual_price || 0).toFixed(2)}
                                </span>
                              )}
                            </td>
                            <td>
                              {isEditing ? (
                                <input
                                  type="number"
                                  min="0"
                                  className="form-control"
                                  value={draft.profit}
                                  onChange={(e) =>
                                    setDrafts((prev) => ({
                                      ...prev,
                                      [data._id]: {
                                        ...prev[data._id],
                                        profit: Number(e.target.value),
                                      },
                                    }))
                                  }
                                />
                              ) : (
                                <span className="fw-bold text-primary">
                                  ₹{(Number(data.profit) || 0).toFixed(2)}
                                </span>
                              )}
                            </td>
                            <td>
                              {isEditing ? (
                                <select
                                  className="form-select"
                                  value={draft.size}
                                  onChange={(e) =>
                                    setDrafts((prev) => ({
                                      ...prev,
                                      [data._id]: {
                                        ...prev[data._id],
                                        size: e.target.value,
                                      },
                                    }))
                                  }
                                >
                                  <option value="1kg">1kg</option>
                                  <option value="1.1kg">1.1kg</option>
                                  <option value="1.2kg">1.2kg</option>
                                  <option value="1.3kg">1.3kg</option>
                                  <option value="1.4kg">1.4kg</option>
                                  <option value="1.5kg">1.5kg</option>
                                  <option value="1.6kg">1.6kg</option>
                                  <option value="1.7kg">1.7kg</option>
                                  <option value="1.8kg">1.8kg</option>
                                  <option value="1.9kg">1.9kg</option>
                                  <option value="2.1kg">2.1kg</option>
                                  <option value="2.2kg">2.2kg</option>
                                  <option value="2.3kg">2.3kg</option>
                                  <option value="2.4kg">2.4kg</option>
                                  <option value="2.5kg">2.5kg</option>
                                  <option value="2.6kg">2.6kg</option>
                                  <option value="2.7kg">2.7kg</option>
                                  <option value="2.8kg">2.8kg</option>
                                  <option value="2.9kg">2.9kg</option>
                                  <option value="3kg">3kg</option>
                                  <option value="1/2kg">1/2kg</option>
                                  <option value="1/4kg">1/4kg</option>
                                  <option value="3/4kg">3/4kg</option>
                                  <option value="100gm">100gm</option>
                                  <option value="150gm">150gm</option>
                                  <option value="200gm">200gm</option>
                                  <option value="300gm">300gm</option>
                                  <option value="350gm">350gm</option>
                                  <option value="400gm">400gm</option>
                                </select>
                              ) : (
                                <span className="badge bg-info">
                                  {data.size}
                                </span>
                              )}
                            </td>

                            {/* Admin Buttons */}
                            {isAdmin && (
                              <>
                                <td>
                                  {isEditing ? (
                                    <div style={{ display: "flex", gap: 8 }}>
                                      <button
                                        className="btn btn-sm btn-success"
                                        onClick={saveEdit}
                                      >
                                        Save
                                      </button>
                                      <button
                                        className="btn btn-sm btn-secondary"
                                        onClick={cancelEdit}
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      className="btn btn-sm"
                                      onClick={startEdit}
                                      style={{
                                        borderRadius: "20px",
                                        padding: "6px 14px",
                                        background:
                                          "linear-gradient(135deg, #22c55e, #16a34a)",
                                        color: "#fff",
                                        fontWeight: "600",
                                        border: "none",
                                      }}
                                    >
                                      ✏️ Edit
                                    </button>
                                  )}
                                </td>
                                <td>
                                  <button
                                    className="btn btn-sm btn-danger"
                                    onClick={() => handleDelete(data._id)}
                                    style={{
                                      borderRadius: "20px",
                                      padding: "6px 14px",
                                      fontWeight: "600",
                                    }}
                                  >
                                    🗑️ Delete
                                  </button>
                                </td>
                              </>
                            )}
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>

              {/* If no products found */}
              {product.filter((item) =>
                item.name.toLowerCase().includes(search.toLowerCase())
              ).length === 0 && (
                <p className="text-center text-muted mt-3">
                  ❌ No products found
                </p>
              )}
            </div>
          )}

          <Footer />
        </>
      )}
    </>
  );
}

