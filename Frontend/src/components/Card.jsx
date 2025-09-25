import axios from 'axios';
import {useNavigate} from 'react-router-dom';
import { useState } from 'react';


export default function Card(props) {
    
  const navigate = useNavigate();
    


    let handleEdit = async (Product) => {
      //console.log(upProduct);
      let productData = JSON.stringify(Product);
      localStorage.setItem('product', productData);
      navigate('/Editproduct');
      }
      
    

  return (
    <>
      <div className="card mb-4 w-100"  style={{ 
        width: "18rem", 
        maxHeight: "400px", 
        backgroundColor: 'white', 
        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        cursor: 'pointer',
        transform: 'scale(1)',
        boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
        borderRadius: '16px',
        border: 'none',
        overflow: 'hidden',
        position: 'relative'
      }} 
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.03) translateY(-8px)';
        e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1) translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.08)';
      }}
      >
        <div style={{ position: 'relative', overflow: 'hidden' }}>
          <img 
            src={`http://localhost:3000/images/${props.product.img}`} 
            className="card-img-top" 
            alt={props.product.name} 
            style={{ 
              height: "200px", 
              objectFit: "cover",
              transition: 'transform 0.4s ease',
              width: '100%'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
            }}
          />
          <div style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
            color: 'white',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '0.8rem',
            fontWeight: '600',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
          }}>
            {props.product.category}
          </div>
        </div>
        <div className="card-body" style={{ padding: '1.5rem' }}>
          <h5 className="card-title" style={{ 
            fontSize: '1.1rem', 
            fontWeight: '700', 
            color: '#2d3748',
            marginBottom: '0.8rem',
            lineHeight: '1.3'
          }}>
            {props.product.name}
          </h5>
          <div className='d-flex justify-content-between align-items-center mb-3'>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <p className="card-text" style={{ 
                margin: '0', 
                fontSize: '1.2rem', 
                fontWeight: '800', 
                color: '#667eea',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <span style={{ fontSize: '0.9rem', color: '#718096' }}>Price:</span>
                {props.product.price} &#x62f;&#x2e;&#x625;
              </p>
              <p className="card-text" style={{ 
                margin: '0', 
                fontSize: '0.9rem', 
                color: '#718096',
                fontWeight: '500'
              }}>
                Quantity: {props.product.quantity}
              </p>
            </div>
           </div>
           <div>
            {(localStorage.getItem('admin') === 'true' && !props.viewMode) ? (
                <button  
                  onClick={() => handleEdit(props.product)} 
                  className="btn" 
                  style={{
                    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '10px 24px',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    transition: 'all 0.3s ease',
                    width: '100%',
                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
                  }}
                >
                  Edit Product
                </button>
              
            ) : null}
           </div>
        </div>
      </div>
    </>
  );
}
