import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to product page as the main landing page
    navigate("/product");
  }, [navigate]);

  return (
    <div className="container mt-5 d-flex justify-content-center">
      <div className="text-center">
        <h3 style={{ color: "green" }}>
          <i className="fa-solid fa-baseball"></i> Sports Application
        </h3>
        <p>Redirecting to products...</p>
      </div>
    </div>
  );
} 