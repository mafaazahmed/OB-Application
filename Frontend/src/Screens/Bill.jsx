import "./Bill.css";
import { useState, useRef, useEffect } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import axios from "axios";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

export default function Bill() {
  const [id, setId] = useState("");
  const [products, setProducts] = useState([]);
  const [orderId, setOrderId] = useState("");
  const [discount, setDiscount] = useState(0);

  // const date = new Date();
  // const f = new Intl.DateTimeFormat("en-us", {
  //   dateStyle: "short",
  //   timeStyle: "short",
  // });
  const dateAndTime = new Date().toLocaleDateString();
  // f.format(date);

  async function generateInvoiceNumber() {
    const prefix = "OB";

    let letterPart = "A";
    let numberPart = 1;

    try {
      let lastInvoice = await axios.get("/bill/lastBill");
      const last_id = lastInvoice.data?.bill_id;

      if (last_id) {
        const match = last_id.match(/^OB([A-Z]+)(\d{8})$/);
        if (match) {
          letterPart = match[1];
          numberPart = parseInt(match[2], 10) + 1;

          if (numberPart > 99999999) {
            numberPart = 1;
            letterPart = nextLetterSequence(letterPart);
          }
        }
      }

      // ✅ Always return a valid invoice number (even if no bill exists)
      return `${prefix}${letterPart}${numberPart.toString().padStart(8, "0")}`;
    } catch (error) {
      console.error("Error generating invoice number:", error);

      // ✅ fallback in case of error
      return `${prefix}${letterPart}${numberPart.toString().padStart(8, "0")}`;
    }
  }

  function nextLetterSequence(seq) {
    let carry = 1;
    let result = "";
    for (let i = seq.length - 1; i >= 0; i--) {
      let charCode = seq.charCodeAt(i) + carry;
      if (charCode > 90) {
        // Z
        charCode = 65; // A
        carry = 1;
      } else {
        carry = 0;
      }
      result = String.fromCharCode(charCode) + result;
    }
    if (carry === 1) {
      result = "A" + result;
    }
    return result;
  }

  // Generate initial invoice ID
  const invoiceId = async () => {
    const invoice = await generateInvoiceNumber();
    console.log(invoice);
    setId(invoice);
  };

  useEffect(() => {
    invoiceId();
  }, []);

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

  const subtotal = products.reduce((sum, p) => sum + p.price * p.quantity, 0);

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
  }, []);

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

  const downloadPDF = async () => {
    if (products.length === 0) {
      alert("No products added to generate bill");
      return;
    }
    const currentOrderId = orderId.trim(); // Capture and trim orderId
const savedOrderId = localStorage.getItem("orderId");

if (currentOrderId === "") {
  alert("Please enter Order ID");
  return;
}

// Compare case-insensitively
if (savedOrderId && savedOrderId.toLowerCase() === currentOrderId.toLowerCase()) {
  alert("Bill already exists with this Order ID");
  return;
}

localStorage.setItem("orderId", currentOrderId);


    // let checkId = await axios.post("/bill/checkId", { orderId });

    // console.log(checkId);

    // // Axios wraps data under `response.data`, so:
    // if (checkId.data.success) {
    //   alert("Bill already exists with this Order ID");
    //   return;
    // }
    try {
      const bill = {
        id: id,
        products: products,
        deliveryCharge: discount,
        total: total,
        order_id: orderId, // ✅ Add order_id to the bill object
        Date: dateAndTime,
      };

      //console.log(bill);
      let response = await axios.post("/bill/createBill", bill);
    } catch (error) {
      console.log(error);
    }
    if (!billRef.current) return;

    try {
      // Add class to hide remove column during PDF generation
      const table = billRef.current.querySelector("table");
      if (table) {
        table.classList.add("pdf-generating");
      }

      // Temporarily apply print-like styling and force A4 width for capture
      const originalWidth = billRef.current.style.width || "";
      billRef.current.classList.add("invoice-print");
      document.body.classList.add("printing");
      // Force the element to A4 width so html2canvas renders at the correct aspect
      billRef.current.style.width = "210mm";

      const canvas = await html2canvas(billRef.current, {
        scale: 2, // higher resolution for better PDF quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
      });

      // Remove temporary classes after canvas generation (cleanup in finally too)
      if (table) {
        table.classList.remove("pdf-generating");
      }
      billRef.current.classList.remove("invoice-print");
      document.body.classList.remove("printing");
      billRef.current.style.width = originalWidth;

      const imgData = canvas.toDataURL("image/jpeg", 0.9);
      const pdf = new jsPDF("p", "mm", "a4");

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Use JPEG consistently
      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save(`${currentOrderId}.pdf`);

      // Now that PDF is saved, reset the form
      const invoice = await generateInvoiceNumber();
      setId(invoice);
      setProducts([]);
      setOrderId("");
      setDiscount(0);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF. Please try again.");

      // Remove the class in case of error
      const table = billRef.current?.querySelector("table");
      if (table) {
        table.classList.remove("pdf-generating");
      }
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
                Online Baazaar
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
                Invoice ID: {id}
              </div>
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
                Date: {dateAndTime}
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
            ⬇️ Download PDF
          </button>
        </div>
      </div>
      {/* <div style={{ marginTop: "111px" }}>
        <Footer />
      </div> */}
    </>
  );
}
