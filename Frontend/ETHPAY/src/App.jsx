// In ETHPAY frontend: src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { isAuthenticated } from "./service/authService";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import BankPaymentPage from "./pages/BankPaymentPage";
import MerchantDashboardPage from "./pages/MerchantDashboardPage"; // Add this import

function ProtectedRoute({ children, requireMerchant = false }) {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  
  if (requireMerchant && user.role !== 'merchant') {
    alert("Only merchants can access this page");
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/bank-payment" element={<BankPaymentPage />} />
        
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/merchant-dashboard"
          element={
            <ProtectedRoute requireMerchant={true}>
              <MerchantDashboardPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;