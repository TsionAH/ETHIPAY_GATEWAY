// apiConfig.js
const isProduction = process.env.NODE_ENV === 'production';

export const API_CONFIG = {
  // For main frontend (Vite)
  ECOMMERCE_API: isProduction 
    ? import.meta.env.VITE_ECOMMERCE_API_URL 
    : 'http://localhost:8000',
  
  ETHPAY_API: isProduction 
    ? import.meta.env.VITE_ETHPAY_API_URL 
    : 'http://localhost:8001',
};

// For Create React App (e-commerce frontend)
export const REACT_APP_CONFIG = {
  API_URL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  ETHPAY_URL: process.env.REACT_APP_ETHPAY_URL || 'http://localhost:8001',
};