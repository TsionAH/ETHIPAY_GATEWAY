import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { isAuthenticated } from "../service/authService";

function BankPaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    account_number: "910000001",
    password: "00ldfb@B",
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

  const processBankPayment = async (paymentData) => {
    try {
      const response = await fetch('http://localhost:8001/api/bank/process/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData)
      });
      
      return await response.json();
    } catch (error) {
      throw error;
    }
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
        amount: amount
      });

      if (result.success) {
        setSuccess(true);
        setTransactionId(result.transaction_id);
        
        // Redirect to success page after 3 seconds
        setTimeout(() => {
          navigate(`/payment-success?transaction_id=${result.transaction_id}&amount=${amount}&merchant_received=${result.merchant_received}&service_fee=${result.service_fee}`);
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
                  <span className="font-semibold">{merchant || "ETHO SHOP"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Order ID:</span>
                  <span className="font-mono">{orderId || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-bold text-blue-600">{amount} ETB</span>
                </div>
                <div className="flex justify-between text-sm text-green-600">
                  <span>Merchant Receives (98%):</span>
                  <span>{(parseFloat(amount || 0) * 0.98).toFixed(2)} ETB</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Service Fee (2%):</span>
                  <span>{(parseFloat(amount || 0) * 0.02).toFixed(2)} ETB</span>
                </div>
              </div>
            </div>

            {/* Demo Account Info */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-green-800 mb-2">Demo Account</h3>
              <p className="text-sm text-green-700 mb-2">
                Use these demo credentials for testing:
              </p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="font-medium">Account:</span> 910000001
                </div>
                <div>
                  <span className="font-medium">Password:</span> 00ldfb@B
                </div>
              </div>
              <p className="text-xs text-green-600 mt-2">
                Balance: 10,000,000.00 ETB
              </p>
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
                  placeholder="e.g., 910000001"
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
                  placeholder="e.g., 00ldfb@B"
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
              <h4 className="font-semibold text-gray-800 mb-2">Secure Sandbox</h4>
              <p className="text-sm text-gray-600">
                This is a sandbox flow. Use demo credentials to complete the payment.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default BankPaymentPage;