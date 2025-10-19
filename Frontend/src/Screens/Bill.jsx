import "./Bill.css";
import { useState, useRef, useEffect } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import axios from "axios";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

export default function Bill() {
  // invoice id removed; use orderId as the primary identifier
  const [products, setProducts] = useState([]);
  const [orderId, setOrderId] = useState("");
  const [discount, setDiscount] = useState(0);
  const [billDateISO, setBillDateISO] = useState(new Date().toISOString().slice(0, 10));
  // Local storage key for persisting current bill products
  const LS_PRODUCTS_KEY = "current_bill_products_v1";
  const LS_ORDER_ID_KEY = "current_bill_order_id_v1";

  // const date = new Date();
  // const f = new Intl.DateTimeFormat("en-us", {
  //   dateStyle: "short",
  //   timeStyle: "short",
  // });
  const dateAndTime = new Date().toLocaleDateString();
  // f.format(date);

  const formatDateToDDMMYYYY = (isoDate) => {
    if (!isoDate) return "";
    const d = new Date(isoDate + "T00:00:00");
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // invoice id logic removed. Order ID is used and provided by the user.

  // const [customer, setCustomer] = useState({ name: '', email: '' });

  //Both query and suggestions is used for search option
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  //all productlist
  const [productList, setProductList] = useState([]);

  const billRef = useRef();

  const handleChange = (_id, field, value) => {
    setProducts(
      products.map((p) =>
        p._id === _id
          ? {
              ...p,
              [field]:
                field === "quantity" || field === "price"
                  ? Number(value)
                  : value,
            }
          : p
      )
    );
  };

  // const handleCustomerChange = (e) => {
  //   setCustomer({ ...customer, [e.target.name]: e.target.value });
  // };

  const removeProduct = (_id) => {
    setProducts(products.filter((p) => p._id !== _id));
  };

  const subtotal = products.reduce((sum, p) => sum + (Number(p.price) || 0) * (Number(p.quantity) || 0), 0);
  // Total number of distinct product line-items added to the bill
  const totalQuantity = products.length;

  const handleDiscount = (e) => {
    if (e.target.value >= 0) {
      setDiscount(e.target.value);
    }
  };
  let calDis = subtotal + Number(discount);
  const total = calDis;

  const printInvoice = async () => {
    window.print();
  };

  useEffect(() => {
    const fetchUsers = async () => {
      const response = await axios.get("/product/show");
      setProductList(response.data);
    };
    fetchUsers();
    // Load persisted products and orderId from localStorage on mount
    try {
      const saved = localStorage.getItem(LS_PRODUCTS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setProducts(parsed);
      }
    } catch (e) {
      console.warn('Failed to load saved products from localStorage', e);
    }
    try {
      const savedOrder = localStorage.getItem(LS_ORDER_ID_KEY);
      if (savedOrder) setOrderId(savedOrder);
    } catch (e) {
      // ignore
    }
  }, []);

  // Persist products to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(LS_PRODUCTS_KEY, JSON.stringify(products));
    } catch (e) {
      console.warn('Failed to save products to localStorage', e);
    }
  }, [products]);

  // Persist orderId as user types (so it's restored on reload)
  useEffect(() => {
    try {
      if (orderId && orderId.trim() !== "") {
        localStorage.setItem(LS_ORDER_ID_KEY, orderId);
      } else {
        localStorage.removeItem(LS_ORDER_ID_KEY);
      }
    } catch (e) {
      // ignore
    }
  }, [orderId]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    if (value.length === 0) {
      setSuggestions([]);
    } else {
      const filtered = productList.filter((item) =>
        item.name.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
    }
  };

  const handleSuggestionClick = (value) => {
    let val = JSON.stringify(value);
    localStorage.setItem("product", val);
    setQuery(value.name);
    setSuggestions([]);
  };

  let addProducts = () => {
    const product = localStorage.getItem("product");
    if (!product) return;

    const data = JSON.parse(product);
    const newProduct = {
      _id: data._id,
      name: data.name,
      price: data.price,
      quantity: 1,
      // include category and profit if available so aggregation works correctly
      category: data.category || 'other',
      profit: Number(data.profit) || 0,
      size: data.size || "1kg", // Include size with default
    };

    const existingProduct = products.find((p) => p._id === newProduct._id);

    if (existingProduct) {
      // Increase quantity if product already exists
      const updatedProducts = products.map((p) =>
        p._id === newProduct._id ? { ...p, quantity: p.quantity + 1 } : p
      );
      setProducts(updatedProducts);
    } else {
      // Add new product if not found
      setProducts([...products, newProduct]);
    }

    setQuery("");
  };

  localStorage.setItem('order_id', orderId);
  const currentOrderId = localStorage.getItem('order_id');

  const checkId = async () => {
    try {
       console.log(currentOrderId);
       let response = await axios.post("/bill/checkId", { orderId: currentOrderId });

      if (response.data.success) {
       if(orderId.toLowerCase() === response.data.orderId.toLowerCase()){
         setOrderId("");
         alert("Bill already exists with this Order ID");
         return;
       }
      }
    } catch (error) {
      alert(error);
    }
  };

 useEffect(() => {
  if (orderId.trim() !== "" && (orderId.length === 4 || orderId.length === 5)) {
    checkId();
  }
}, [orderId]);


  const downloadPDF = async () => {
    if (products.length === 0) {
      alert("No products added to generate bill");
      return;
    }

    try {
      // ✅ Calculate product-level profit and aggregate profit by category
      const productsWithProfit = products.map((p) => {
        const qty = Number(p.quantity) || 0;
        const perUnitProfit = Number(p.profit) || 0;
        const lineProfit = perUnitProfit * qty;
        return {
          ...p,
          profit: Math.round(lineProfit * 100) / 100,
          size: p.size, // Ensure size is passed to backend
        };
      });

      const profitMap = {};
      productsWithProfit.forEach((p) => {
        const cat = (p.category || "other").toLowerCase();
        profitMap[cat] = (profitMap[cat] || 0) + p.profit;
      });

      const profitByCategory = Object.keys(profitMap).map((cat) => ({
        category: cat,
        amount: Math.round(profitMap[cat] * 100) / 100,
      }));

      const totalProfit = Object.values(profitMap).reduce((a, b) => a + b, 0);

      // ✅ Prepare bill object for backend
      const bill = {
        order_id: orderId.toUpperCase(),
        products: productsWithProfit,
        deliveryCharge: discount,
        total,
        profitByCategory,
        profit: Math.round(totalProfit * 100) / 100,
        billDate: formatDateToDDMMYYYY(billDateISO),
      };

      // ✅ Send to backend
      await axios.post("/bill/createBill", bill);

      // ✅ Generate PDF visual
      const table = billRef.current?.querySelector("table");
      if (table) table.classList.add("pdf-generating");
      const originalWidth = billRef.current.style.width;
      billRef.current.classList.add("invoice-print");
      billRef.current.style.width = "210mm";

      const canvas = await html2canvas(billRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#fff",
      });

      billRef.current.classList.remove("invoice-print");
      if (table) table.classList.remove("pdf-generating");
      billRef.current.style.width = originalWidth;

  // Save as JPEG image instead of PDF (use orderId)
  const imgData = canvas.toDataURL("image/jpeg", 0.95);
  const link = document.createElement("a");
  link.href = imgData;
  link.download = `${orderId.toUpperCase() || 'bill'}.jpeg`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

      // ✅ Reset form
  // invoice id removed; just reset products and inputs
      setProducts([]);
      setOrderId("");
      setDiscount(0);
  // reset date to today
  setBillDateISO(new Date().toISOString().slice(0, 10));
      // Clear persisted products and order id
      try {
        localStorage.removeItem(LS_PRODUCTS_KEY);
        localStorage.removeItem(LS_ORDER_ID_KEY);
        localStorage.removeItem('product'); // remove temporary product selection too
      } catch (e) {
        // ignore
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF");
    }
  };

  return (
    <>
      <Navbar />
      <div className="container mt-4">
        {/* search bar  */}
        <div className="container mt-4" style={{ maxWidth: "600px" }}>
          <div className="d-flex">
            <input
              type="text"
              className="form-control"
              placeholder="Search products..."
              value={query}
              onChange={handleSearchChange}
              style={{ borderRadius: "8px", border: "1px solid #e2e8f0" }}
            />
            <button
              className="btn mx-3"
              style={{
                width: "220px",
                borderRadius: "8px",
                fontWeight: 500,
                background:
                  "linear-gradient(135deg, rgba(34, 197, 94, 0.85) 0%, rgba(16, 185, 129, 0.85) 100%)",
                color: "white",
                border: "none",
              }}
              onClick={() => addProducts()}
            >
              + Add Product
            </button>
          </div>
          {suggestions.length > 0 && (
            <ul
              className="list-group mt-1"
              style={{
                borderRadius: "8px",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              }}
            >
              {suggestions.map((item, index) => (
                <li
                  key={index}
                  className="list-group-item list-group-item-action"
                  onClick={() => handleSuggestionClick(item)}
                  style={{ cursor: "pointer" }}
                >
                  {item.name}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Billing Table */}
        <div
          className="card p-4 mt-4"
          ref={billRef}
          style={{
            background: "white",
            //borderRadius: "12px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            border: "1px solid #e2e8f0",
          }}
        >
          <div className="d-flex mb-3 align-items-center">
            <h5 className="d-flex align-items-center">
              <div
                style={{
                  width: "70px",
                  height: "70px",
                  borderRadius: "50%",
                  overflow: "hidden",
                  marginRight: "20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#fff",
                  border: "2px solid #e2e8f0",
                }}
              >
                <img
                  src="/OnlineBaazaar.jpeg"
                  alt="Shams Sports Logo"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: "center",
                  }}
                />
              </div>
              <span
                style={{
                  color: "#1a202c",
                  fontWeight: 700,
                  fontSize: "1.5rem",
                }}
              >
                OnlineBaazaar
              </span>
            </h5>
            <div style={{ marginLeft: "auto", textAlign: "right" }}>
              <div
                style={{
                  fontWeight: 600,
                  color: "#4a5568",
                  marginBottom: "4px",
                }}
              >
                Order ID:
                <input
                  type="text"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  maxLength={5} // ✅ Limit input length to 5 characters
                  style={{
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                    padding: "4px 8px",
                    marginLeft: "8px",
                    width: "70px", // Adjust width as needed
                    fontWeight: 500,
                  }}
                />
              </div>
              <div style={{ fontWeight: 600, color: "#4a5568" }}>
                Date:
                <input
                  type="date"
                  value={billDateISO}
                  onChange={(e) => setBillDateISO(e.target.value)}
                  style={{
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                    padding: "4px 8px",
                    marginLeft: "8px",
                    width: "140px",
                    fontWeight: 500,
                  }}
                />
              </div>
            </div>
          </div>
          <table
            className="table"
            style={{ borderRadius: "8px", overflow: "hidden" }}
          >
            <thead
              style={{
                background: "#f7fafc",
                borderBottom: "2px solid #e2e8f0",
              }}
            >
              <tr>
                <th style={{ width: "65%", fontWeight: 600, color: "#2d3748" }}>
                  Product
                </th>
                <th
                  style={{ width: "11.67%", fontWeight: 600, color: "#2d3748" }}
                >
                  Quantity
                </th>
                <th
                  style={{ width: "11.67%", fontWeight: 600, color: "#2d3748" }}
                >
                  Price (&#8377;)
                </th>
                <th
                  style={{ width: "11.67%", fontWeight: 600, color: "#2d3748" }}
                >
                  Total
                </th>
                <th
                  style={{ width: "11.67%", fontWeight: 600, color: "#2d3748" }}
                >
                  Remove
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                  <td>
                    <input
                      value={p.name}
                      className="form-control"
                      onChange={(e) =>
                        handleChange(p._id, "name", e.target.value)
                      }
                      disabled
                      style={{
                        border: "none",
                        background: "transparent",
                        fontWeight: 500,
                      }}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min="1"
                      value={p.quantity}
                      className="form-control"
                      onChange={(e) =>
                        handleChange(p._id, "quantity", e.target.value)
                      }
                      style={{
                        borderRadius: "6px",
                        border: "none",
                        background: "transparent",
                        fontWeight: 500,
                      }}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={p.price}
                      className="form-control"
                      onChange={(e) =>
                        handleChange(p._id, "price", e.target.value)
                      }
                      disabled
                      style={{
                        border: "none",
                        background: "transparent",
                        fontWeight: 500,
                      }}
                    />
                  </td>
                  <td style={{ fontWeight: 600, color: "#2d3748" }}>
                    &#8377; {p.price * p.quantity}
                  </td>
                  <td>
                    <button
                      onClick={() => removeProduct(p._id)}
                      className="btn btn-danger"
                      style={{ borderRadius: "6px", padding: "4px 8px" }}
                    >
                      <i className="fa-solid fa-xmark"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="totals-section">
            <div className="totals-row">
              <span className="totals-label">Total Quantity :</span>
              <span className="totals-value">{totalQuantity}</span>
            </div>
            <div className="totals-row">
              <span className="totals-label">Subtotal :</span>
              <span className="totals-value">
                &#8377; {subtotal.toFixed(2)}
              </span>
            </div>
            <div className="totals-row">
              <span className="totals-label">Delivery Charge :</span>
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <span style={{ fontWeight: 600, color: "#4a5568" }}>
                  &#8377;
                </span>
                <input
                  type="number"
                  onChange={handleDiscount}
                  className="discount-input"
                  value={discount}
                />
              </div>
            </div>
            <div className="totals-row total-row">
              <span className="totals-label">Total :</span>
              <span className="total-value">&#8377; {total}</span>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-4 d-flex justify-content-end gap-3">
          <button
            className="btn btn-outline-primary"
            onClick={printInvoice}
            style={{
              borderRadius: "8px",
              fontWeight: 500,
              padding: "10px 24px",
            }}
          >
            🖨️ Print
          </button>
          <button
            className="btn btn-outline-success"
            onClick={downloadPDF}
            style={{
              borderRadius: "8px",
              fontWeight: 500,
              padding: "10px 24px",
            }}
          >
            💾 Save Bill
          </button>
        </div>
      </div>
      {/* <div style={{ marginTop: "111px" }}>
        <Footer />
      </div> */}
    </>
  );
}
