import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Navbar() {
  const navigate = useNavigate();
  const { logout, isAdmin } = useAuth();
  const [viewMode, setViewMode] = useState(false);

  useEffect(() => {
    const isViewMode = localStorage.getItem('viewMode') === 'true';
    setViewMode(isViewMode);
    
    // Listen for custom view mode change event
    const handleViewModeChange = (event) => {
      setViewMode(event.detail);
    };
    
    window.addEventListener('viewModeChange', handleViewModeChange);
    
    return () => {
      window.removeEventListener('viewModeChange', handleViewModeChange);
    };
  }, []);

  const handleLogout = () => {
    if (viewMode) {
      localStorage.removeItem('viewMode');
      setViewMode(false);
      // Dispatch custom event for view mode change
      window.dispatchEvent(new CustomEvent('viewModeChange', { detail: false }));
      navigate("/login");
    } else {
      logout();
      navigate("/login");
    }
  };

  return (
    <>
      <nav
        className="navbar navbar-expand-lg text-white sticky-top"
        style={{ 
          background: "linear-gradient(135deg, rgba(34, 197, 94, 0.85) 0%, rgba(16, 185, 129, 0.85) 100%)",
          backdropFilter: "blur(15px)",
          WebkitBackdropFilter: "blur(15px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
          zIndex: 1000,
          padding: "12px 0"
        }}
      >
        <div className="container-fluid">
          <Link className="navbar-brand d-flex align-items-center" to="/product">
            <div 
              style={{ 
                width: "60px", 
                height: "60px", 
                borderRadius: "50%", 
                overflow: "hidden",
                marginRight: "18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                transition: "all 0.3s ease"
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.05)';
                e.target.style.boxShadow = '0 12px 35px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.9)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.8)';
              }}
            >
              <img
                src="/OnlineBaazaar.jpeg"
                alt="Shams Sports Logo"
                style={{ 
                  width: "100%", 
                  height: "100%", 
                  objectFit: "cover",
                  objectPosition: "center"
                }}
              />
            </div>
            <span className="fw-bold" style={{ 
              fontSize: "1.6rem", 
              color: "#fff", 
              fontWeight: 900, 
              letterSpacing: '0px',
              margin: 0,
              padding: 0,
              display: 'inline-block'
            }}>
              OnlineBaazaar
            </span>
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            {!viewMode && (
              <>
            <ul className="navbar-nav me-auto gap-2">
              <li className="nav-item">
                <Link
                  className="nav-link text-white active fs-5"
                  aria-current="page"
                  to="/generate_bill"
                  style={{
                    transition: 'all 0.3s ease',
                    display: 'inline-block',
                    padding: '8px 16px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                    fontWeight: '600'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'scale(1.05) translateY(-2px)';
                    e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                    e.target.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'scale(1) translateY(0)';
                    e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  Generate Bill
                </Link>
              </li>
              <li>
                <Link
                  className="nav-link text-white active fs-5"
                  to="/viewbills"
                  style={{
                    transition: 'all 0.3s ease',
                    display: 'inline-block',
                    padding: '8px 16px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                    fontWeight: '600'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'scale(1.05) translateY(-2px)';
                    e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                    e.target.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'scale(1) translateY(0)';
                    e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  View-Bills
                </Link>
              </li>
            </ul>
                {isAdmin && (
              <div className="d-flex">
                           <Link
                             className="btn text-white m-1"
                             to="/addproduct"
                             style={{
                               transition: 'all 0.3s ease',
                               display: 'inline-block',
                               padding: '8px 16px',
                               borderRadius: '12px',
                               background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%)',
                               backdropFilter: 'blur(10px)',
                               border: '1px solid rgba(255, 255, 255, 0.2)',
                               textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                               fontWeight: '600',
                               fontSize: '0.9rem'
                             }}
                             onMouseEnter={(e) => {
                               e.target.style.transform = 'scale(1.05) translateY(-2px)';
                               e.target.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.1) 100%)';
                               e.target.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
                             }}
                             onMouseLeave={(e) => {
                               e.target.style.transform = 'scale(1) translateY(0)';
                               e.target.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%)';
                               e.target.style.boxShadow = 'none';
                             }}
                           >
                  Add Product
                </Link>
                           <Link
                             className="btn text-white m-1"
                             to="/viewroles"
                             style={{
                               transition: 'all 0.3s ease',
                               display: 'inline-block',
                               padding: '8px 16px',
                               borderRadius: '12px',
                               background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%)',
                               backdropFilter: 'blur(10px)',
                               border: '1px solid rgba(255, 255, 255, 0.2)',
                               textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                               fontWeight: '600',
                               fontSize: '0.9rem'
                             }}
                             onMouseEnter={(e) => {
                               e.target.style.transform = 'scale(1.05) translateY(-2px)';
                               e.target.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.1) 100%)';
                               e.target.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
                             }}
                             onMouseLeave={(e) => {
                               e.target.style.transform = 'scale(1) translateY(0)';
                               e.target.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%)';
                               e.target.style.boxShadow = 'none';
                             }}
                           >
                  View Roles
                </Link>
                           <Link
                             className="btn text-white m-1"
                             to="/signup"
                             style={{
                               transition: 'all 0.3s ease',
                               display: 'inline-block',
                               padding: '8px 16px',
                               borderRadius: '12px',
                               background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%)',
                               backdropFilter: 'blur(10px)',
                               border: '1px solid rgba(255, 255, 255, 0.2)',
                               textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                               fontWeight: '600',
                               fontSize: '0.9rem'
                             }}
                             onMouseEnter={(e) => {
                               e.target.style.transform = 'scale(1.05) translateY(-2px)';
                               e.target.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.1) 100%)';
                               e.target.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
                             }}
                             onMouseLeave={(e) => {
                               e.target.style.transform = 'scale(1) translateY(0)';
                               e.target.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%)';
                               e.target.style.boxShadow = 'none';
                             }}
                           >
                  Add User
                </Link>
              </div>
            )}
              </>
            )}
             <button
                  className="btn text-white m-1"
                  onClick={handleLogout}
                  style={{ 
                    backgroundColor: "transparent", 
                    border: "none",
                    transition: 'transform 0.3s ease',
                    display: 'inline-block'
                  }}
                  onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
                  onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                >
                  {viewMode ? 'Exit View Mode' : 'Logout'}
                </button>
          </div>
        </div>
      </nav>
    </>
  );
}
