import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function Addproduct() {
  const navigate = useNavigate();
  const [product, setProduct] = useState({
    name: "",
    price: 0,
    category: "Vegetable", // Changed to "Vegetable" (capital V)
    profit: 0,
    actualprice: 0,
    size: "1kg", // Added size field with default
  });

  const [error, setError] = useState(""); // For validation alert

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!product.name.trim() || product.price <= 0 || !product.category) {
      setError("Please fill in all fields");
      return;
    }

    setError(""); // Clear error if valid

    try {
  // send actualprice as actual_price to match backend schema
    let res = await axios.post("/product/add", { ...product, actual_price: product.actualprice });
      console.log(res);
  setProduct({ name: "", price: 0, category: "Vegetable", profit: 0, actualprice: 0, size: "1kg" }); // Reset size on submit
      navigate("/product");
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    }
  };

  const onChange = (e) => {
    const { name, value, type } = e.target;
    const parsed = type === "number" ? Number(value) : value;
    setProduct({ ...product, [name]: parsed });
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
                  Add New Product
                </h3>
                <p className="text-muted mb-0" style={{ fontSize: "0.9rem" }}>
                  Fill in the details to add a new product
                </p>
              </div>

              <div className="card-body p-4">
                {/* Alert Box */}
                {error && (
                  <div
                    style={{
                      backgroundColor: "#fed7d7",
                      color: "#742a2a",
                      padding: "12px 16px",
                      borderRadius: "8px",
                      marginBottom: "16px",
                      display: "flex",
                      alignItems: "center",
                      fontSize: "0.9rem",
                      fontWeight: "500",
                    }}
                  >
                    <i
                      className="fa-solid fa-triangle-exclamation me-2"
                      style={{ color: "#c53030" }}
                    ></i>
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label
                      htmlFor="category"
                      className="form-label fw-semibold"
                      style={{
                        color: "#2d3748",
                        fontSize: "0.95rem",
                      }}
                    >
                      <i
                        className="fa-solid fa-tags me-2"
                        style={{ color: "#22c55e" }}
                      ></i>
                      Category
                    </label>
                    <select
                      className="form-select"
                      aria-label="Default select example"
                      id="category"
                      name="category"
                      value={product.category}
                      onChange={onChange}
                      style={{
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0",
                        padding: "12px 16px",
                        fontSize: "0.95rem",
                      }}
                    >
                      <option value={"Vegetable"}>Vegetable</option>
                      <option value="Chicken">Chicken</option>
                      <option value="Beef">Beef</option>
                      <option value="Mutton">Mutton</option>
                      <option value="Other">Other</option>
                      <option value="Chicken Boneless">Chicken Boneless</option>
                      <option value="Live Chicken">Live Chicken</option>
                      <option value="Nati Chicken">Nati Chicken</option>
                      <option value="Special Chicken">Special Chicken</option>
                      <option value="Beef Boneless">Beef Boneless</option>
                      <option value="Mutton Boneless">Mutton Boneless</option>
                    </select>
                  </div>

                  {/* Size Dropdown */}
                  <div className="mb-4">
                    <label
                      htmlFor="size"
                      className="form-label fw-semibold"
                      style={{
                        color: "#2d3748",
                        fontSize: "0.95rem",
                      }}
                    >
                      <i
                        className="fa-solid fa-weight-hanging me-2"
                        style={{ color: "#22c55e" }}
                      ></i>
                      Size
                    </label>
                    <select
                      className="form-select"
                      aria-label="Default select example"
                      id="size"
                      name="size"
                      value={product.size}
                      onChange={onChange}
                      style={{
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0",
                        padding: "12px 16px",
                        fontSize: "0.95rem",
                      }}
                    >
                      <option value="100gm">100gm</option>
                      <option value="150gm">150gm</option>
                      <option value="200gm">200gm</option>
                      <option value="300gm">300gm</option>
                      <option value="350gm">350gm</option>
                      <option value="400gm">400gm</option>
                      <option value="1/4kg">1/4kg</option>
                      <option value="1/2kg">1/2kg</option>
                      <option value="3/4kg">3/4kg</option>
                      <option value="1kg">1kg</option>
                      <option value="1.1kg">1.1kg</option>
                      <option value="1.2kg">1.2kg</option>
                      <option value="1.25kg">1.25kg</option>
                      <option value="1.3kg">1.3kg</option>
                      <option value="1.4kg">1.4kg</option>
                      <option value="1.5kg">1.5kg</option>
                      <option value="1.6kg">1.6kg</option>
                      <option value="1.7kg">1.7kg</option>
                      <option value="1.75kg">1.75kg</option>
                      <option value="1.8kg">1.8kg</option>
                      <option value="1.9kg">1.9kg</option>
                      <option value="2.1kg">2.1kg</option>
                      <option value="2.2kg">2.2kg</option>
                      <option value="2.25kg">2.25kg</option>
                      <option value="2.3kg">2.3kg</option>
                      <option value="2.4kg">2.4kg</option>
                      <option value="2.5kg">2.5kg</option>
                      <option value="2.6kg">2.6kg</option>
                      <option value="2.7kg">2.7kg</option>
                      <option value="2.75kg">2.75kg</option>
                      <option value="2.8kg">2.8kg</option>
                      <option value="2.9kg">2.9kg</option>
                      <option value="3kg">3kg</option>
                    </select>
                  </div>

                  <div className="mb-4">
                    <label
                      htmlFor="exampleInputEmail1"
                      className="form-label fw-semibold"
                      style={{
                        color: "#2d3748",
                        fontSize: "0.95rem",
                      }}
                    >
                      <i
                        className="fa-solid fa-box me-2"
                        style={{ color: "#22c55e" }}
                      ></i>
                      Product Name
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="exampleInputEmail1"
                      name="name"
                      value={product.name}
                      onChange={onChange}
                      placeholder="Enter product name"
                      style={{
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0",
                        padding: "12px 16px",
                        fontSize: "0.95rem",
                      }}
                    />
                  </div>

                  <div className="mb-4">
                    <label
                      htmlFor="price"
                      className="form-label fw-semibold"
                      style={{
                        color: "#2d3748",
                        fontSize: "0.95rem",
                      }}
                    >
                      <span
                        style={{
                          color: "#22c55e",
                          fontWeight: "bold",
                        }}
                      >
                        (₹)
                      </span>{" "}
                      Price
                    </label>
                    <input
                      type="number"
                      min="0"
                      className="form-control"
                      id="price"
                      name="price"
                      value={product.price}
                      onChange={onChange}
                      placeholder="0.00"
                      style={{
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0",
                        padding: "12px 16px",
                        fontSize: "0.95rem",
                      }}
                    />
                  </div>

                  <div className="mb-4">
                    <label
                      htmlFor="actualprice"
                      className="form-label fw-semibold"
                      style={{
                        color: "#2d3748",
                        fontSize: "0.95rem",
                      }}
                    >
                      <span style={{ color: "#22c55e", fontWeight: "bold" }}>(₹)</span>{" "}
                      Actual Price
                    </label>
                    <input
                      type="number"
                      min="0"
                      className="form-control"
                      id="actualprice"
                      name="actualprice"
                      value={product.actualprice}
                      onChange={onChange}
                      placeholder="0.00"
                      style={{
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0",
                        padding: "12px 16px",
                        fontSize: "0.95rem",
                      }}
                    />
                  </div>

                  <div className="mb-4">
                    <label
                      htmlFor="profit"
                      className="form-label fw-semibold"
                      style={{
                        color: "#2d3748",
                        fontSize: "0.95rem",
                      }}
                    >
                      <i
                        className="fa-solid fa-coins me-2"
                        style={{ color: "#22c55e" }}
                      ></i>
                      Profit
                    </label>
                    <input
                      type="number"
                      min="0"
                      className="form-control"
                      id="profit"
                      name="profit"
                      value={product.profit}
                      onChange={onChange}
                      placeholder="0.00"
                      style={{
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0",
                        padding: "12px 16px",
                        fontSize: "0.95rem",
                      }}
                    />
                  </div>

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
                        boxShadow: "0 4px 15px rgba(34, 197, 94, 0.3)",
                      }}
                    >
                      <i className="fa-solid fa-plus me-2"></i>
                      Add Product
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-secondary fw-semibold"
                      onClick={() => navigate("/product")}
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
