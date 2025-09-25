import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const [userInfo, setUserInfo] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const result = await login(userInfo);
      
      if (result.success) {
        // Clear any existing view mode
        localStorage.removeItem('viewMode');
        
        // Add a longer delay to ensure authentication state is properly set
        setTimeout(() => {
        navigate("/product");
        }, 200);
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An unexpected error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const onChange = (e) => {
    setUserInfo({ ...userInfo, [e.target.name]: e.target.value });
  };

  return (
    <>
              <div className="min-vh-100 d-flex align-items-center justify-content-center"
             style={{
               background: 'white',
               padding: '20px'
             }}>
        <div className="card shadow-lg border-0" 
             style={{ 
               maxWidth: '450px', 
               width: '100%',
               borderRadius: '20px',
               backdropFilter: 'blur(10px)',
               backgroundColor: 'rgba(255, 255, 255, 0.95)'
             }}>
          
          {/* Header with Logo */}
          <div className="card-header bg-transparent border-0 text-center pt-4 pb-2">
            <div className="d-flex align-items-center justify-content-center mb-3">
              <div 
          style={{
                  width: "60px", 
                  height: "60px", 
                  borderRadius: "50%", 
                  overflow: "hidden",
                  marginRight: "15px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#fff",
                  boxShadow: '0 4px 15px rgba(34, 197, 94, 0.3)'
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
              <div>
                                       <h2 className="mb-0" style={{
                         background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.85) 0%, rgba(16, 185, 129, 0.85) 100%)',
                         WebkitBackgroundClip: 'text',
                         WebkitTextFillColor: 'transparent',
                         backgroundClip: 'text',
                         fontWeight: 900,
                         fontSize: '1.8rem',
                         textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
                       }}>
                         ONLINE BAAZAAR
                       </h2>
                <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
                  Sign in to your account
                </p>
              </div>
            </div>
          </div>

          <div className="card-body p-4">
            {/* Error Message */}
            {error && (
              <div className="alert alert-danger border-0 shadow-sm" role="alert" 
                   style={{ borderRadius: '12px', fontSize: '0.9rem' }}>
                <i className="fa-solid fa-exclamation-triangle me-2"></i>
                {error}
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="needs-validation" noValidate>
              <div className="mb-4">
                                       <label htmlFor="username" className="form-label fw-semibold"
                              style={{ color: '#495057', fontSize: '0.95rem' }}>
                         <i className="fa-solid fa-user me-2" style={{ color: '#22c55e' }}></i>
                         Username
            </label>
            <input
              required
                           type="text"
              minLength={8}
                           className="form-control border-0 shadow-sm"
                           id="username"
              name="username"
              value={userInfo.username}
              onChange={onChange}
                           placeholder="Enter your username"
                  style={{ 
                    borderRadius: '12px', 
                    padding: '12px 16px',
                    backgroundColor: '#f8f9fa',
                    transition: 'all 0.3s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.backgroundColor = '#fff';
                    e.target.style.boxShadow = '0 0 0 3px rgba(34, 197, 94, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.backgroundColor = '#f8f9fa';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <small className="text-muted mt-1 d-block">
                  Minimum 8 characters required
                </small>
            </div>

              <div className="mb-4">
                                       <label htmlFor="password" className="form-label fw-semibold"
                              style={{ color: '#495057', fontSize: '0.95rem' }}>
                         <i className="fa-solid fa-lock me-2" style={{ color: '#22c55e' }}></i>
                         Password
            </label>
            <input
              required
              minLength={8}
              type="password"
                         className="form-control border-0 shadow-sm"
                         id="password"
              name="password"
              value={userInfo.password}
              onChange={onChange}
                         placeholder="Enter your password"
                  style={{ 
                    borderRadius: '12px', 
                    padding: '12px 16px',
                    backgroundColor: '#f8f9fa',
                    transition: 'all 0.3s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.backgroundColor = '#fff';
                    e.target.style.boxShadow = '0 0 0 3px rgba(34, 197, 94, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.backgroundColor = '#f8f9fa';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <small className="text-muted mt-1 d-block">
                  Minimum 8 characters required
                </small>
            </div>

                                                        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="submit"
                         className="btn text-white fw-semibold"
                         style={{
                           background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.85) 0%, rgba(16, 185, 129, 0.85) 100%)',
                           borderRadius: '12px',
                           padding: '12px',
                           fontSize: '1rem',
                           transition: 'all 0.3s ease',
                           border: 'none',
                           boxShadow: '0 4px 15px rgba(34, 197, 94, 0.3)',
                           flex: '1'
                         }}
                         disabled={loading}
                         onMouseEnter={(e) => {
                           if (!loading) {
                             e.target.style.transform = 'translateY(-2px)';
                             e.target.style.boxShadow = '0 6px 20px rgba(34, 197, 94, 0.4)';
                           }
                         }}
                         onMouseLeave={(e) => {
                           if (!loading) {
                             e.target.style.transform = 'translateY(0)';
                             e.target.style.boxShadow = '0 4px 15px rgba(34, 197, 94, 0.3)';
                           }
                         }}
                       >
                         {loading ? (
                           <>
                             <i className="fa-solid fa-spinner fa-spin me-2"></i>
                             Signing in...
                           </>
                         ) : (
                           <>
                             <i className="fa-solid fa-sign-in-alt me-2"></i>
                             Sign In
                           </>
                         )}
                       </button>

                       {/* View Page Button */}
                       <button
                         type="button"
                         className="btn fw-semibold"
                         style={{
                           backgroundColor: 'transparent',
                           color: '#22c55e',
                           borderRadius: '12px',
                           padding: '12px',
                           fontSize: '1rem',
                           transition: 'all 0.3s ease',
                           border: '2px solid #22c55e',
                           boxShadow: '0 2px 10px rgba(34, 197, 94, 0.2)',
                           flex: '1'
                         }}
                         onClick={() => {
                           localStorage.setItem('viewMode', 'true');
                           // Dispatch custom event for view mode change
                           window.dispatchEvent(new CustomEvent('viewModeChange', { detail: true }));
                           navigate('/view-product');
                         }}
                         onMouseEnter={(e) => {
                           e.target.style.background = 'linear-gradient(135deg, rgba(34, 197, 94, 0.85) 0%, rgba(16, 185, 129, 0.85) 100%)';
                           e.target.style.color = 'white';
                           e.target.style.transform = 'translateY(-2px)';
                           e.target.style.boxShadow = '0 4px 15px rgba(34, 197, 94, 0.4)';
                         }}
                         onMouseLeave={(e) => {
                           e.target.style.background = 'transparent';
                           e.target.style.color = '#22c55e';
                           e.target.style.transform = 'translateY(0)';
                           e.target.style.boxShadow = '0 2px 10px rgba(34, 197, 94, 0.2)';
                         }}
                       >
                         <i className="fa-solid fa-eye me-2"></i>
                         View Page
          </button>
                     </div>
        </form>


          </div>
        </div>
      </div>
    </>
  );
}
