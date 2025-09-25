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
  const isAdmin = localStorage.getItem("admin") === "true"; // ✅ check admin

  console.log(isAdmin);

  return (
    <>
      {shouldShowContent && (
        <>
          <Navbar />

          {/* Search Box Section */}
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
                  (e.target.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.1)")
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
                      {isAdmin && <th scope="col">Edit Product</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {product
                      .filter((item) =>
                        item.name.toLowerCase().includes(search.toLowerCase())
                      )
                      .map((data, index) => (
                        <tr key={data._id}>
                          <td>
                            <b>{index + 1}</b>
                          </td>
                          <td>{data.name}</td>
                          <td>
                            <span className="badge bg-secondary">
                              {data.category}
                            </span>
                          </td>
                          <td>
                            <span className="fw-bold text-success">
                              ₹{data.price}
                            </span>
                          </td>
                          {isAdmin && (
                            <td>
                              <button
                                className="btn btn-sm"
                                style={{
                                  borderRadius: "20px",
                                  padding: "6px 14px",
                                  background:
                                    "linear-gradient(135deg, #22c55e, #16a34a)",
                                  color: "#fff",
                                  fontWeight: "600",
                                  border: "none",
                                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                                  transition: "all 0.3s ease",
                                }}
                                onMouseEnter={(e) => {
                                  e.target.style.transform = "scale(1.05)";
                                  e.target.style.boxShadow =
                                    "0 6px 20px rgba(0,0,0,0.3)";
                                }}
                                onMouseLeave={(e) => {
                                  e.target.style.transform = "scale(1)";
                                  e.target.style.boxShadow =
                                    "0 4px 12px rgba(0,0,0,0.2)";
                                }}
                                onClick={() => {
                                  localStorage.setItem(
                                    "product",
                                    JSON.stringify(data)
                                  );
                                  navigate("/editproduct");
                                }}
                              >
                                ✏️ Edit
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {/* If no products match search */}
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
