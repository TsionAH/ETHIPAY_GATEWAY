import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { processBankPayment } from "../service/bankService";
import { isAuthenticated } from "../service/authService";

function BankPaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    account_number: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [transactionId, setTransactionId] = useState("");

  // Get payment data from query params
  const queryParams = new URLSearchParams(location.search);
  const paymentId = queryParams.get("payment_id");
  const amount = queryParams.get("amount");
  const orderId = queryParams.get("order_id");
  const merchant = queryParams.get("merchant");

  if (!isAuthenticated()) {
    navigate("/login", { 
      state: { 
        from: location.pathname + location.search,
        message: "Please login to complete payment"
      }
    });
    return null;
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await processBankPayment({
        payment_id: paymentId,
        account_number: formData.account_number,
        password: formData.password,
      });

      if (result.success) {
        setSuccess(true);
        setTransactionId(result.transaction_id);
        
        // Redirect to success page after 3 seconds
        setTimeout(() => {
          navigate(`/payment-success?transaction_id=${result.transaction_id}&amount=${amount}`);
        }, 3000);
      } else {
        setError(result.error || "Payment failed");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Payment processing failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Bank Payment</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {success ? (
          <div className="text-center py-8">
            <div className="text-green-500 text-5xl mb-4">✓</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-4">
              Transaction ID: <span className="font-mono">{transactionId}</span>
            </p>
            <p className="text-gray-600">
              Redirecting to confirmation page...
            </p>
          </div>
        ) : (
          <>
            {/* Payment Summary */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-800 mb-2">Payment Details</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Merchant:</span>
                  <span className="font-semibold">{merchant || "E-commerce Store"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Order ID:</span>
                  <span className="font-mono">{orderId || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-bold text-blue-600">{amount} ETB</span>
                </div>
              </div>
            </div>

            {/* Bank Payment Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bank Account Number
                </label>
                <input
                  type="text"
                  name="account_number"
                  value={formData.account_number}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 100035363"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bank Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your bank password"
                />
              </div>

              <div className="text-sm text-gray-600 bg-yellow-50 p-3 rounded border border-yellow-200">
                <p className="font-semibold text-yellow-800 mb-1">Security Note:</p>
                <p>Your bank credentials are securely processed and not stored.</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? "Processing Payment..." : "Pay Now"}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="font-semibold text-gray-800 mb-2">Demo Accounts (for testing):</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Account: <span className="font-mono">100035363</span> | Password: <span className="font-mono">bank123</span></li>
                <li>• Account: <span className="font-mono">100035364</span> | Password: <span className="font-mono">secure456</span></li>
                <li>• Account: <span className="font-mono">100035365</span> | Password: <span className="font-mono">test789</span></li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default BankPaymentPage;