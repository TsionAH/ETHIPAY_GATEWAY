import { useState } from "react";
import { initiatePayment, processPayment, calculateFee } from "../service/userService";

function PaymentForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    recipientID: "",
    amount: "",
    currency: "ETB",
    paymentMethod: "Wallet",
  });
  const [fee, setFee] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, [e.target.name]: value });

    // Calculate fee when amount changes
    if (e.target.name === "amount" && value) {
      calculateFee(value)
        .then((data) => {
          setFee(data);
        })
        .catch(() => {
          setFee(null);
        });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // Initiate payment
      const paymentResponse = await initiatePayment(formData);
      
      // Process payment
      await processPayment(paymentResponse.paymentID);
      
      setSuccess("Payment processed successfully!");
      setFormData({ recipientID: "", amount: "", currency: "ETB", paymentMethod: "Wallet" });
      setFee(null);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(err.response?.data?.error || "Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Recipient ID
        </label>
        <input
          type="text"
          name="recipientID"
          value={formData.recipientID}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Enter recipient UUID"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Amount
        </label>
        <input
          type="number"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          required
          min="0.01"
          step="0.01"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="0.00"
        />
        {fee && (
          <div className="mt-2 text-sm text-gray-600">
            <p>Service Fee: {fee.serviceFee} {formData.currency}</p>
            <p className="font-semibold">Total: {fee.totalAmount} {formData.currency}</p>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Currency
        </label>
        <select
          name="currency"
          value={formData.currency}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="ETB">ETB</option>
          <option value="USD">USD</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Payment Method
        </label>
        <select
          name="paymentMethod"
          value={formData.paymentMethod}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="Wallet">Wallet</option>
          <option value="BankTransfer">Bank Transfer</option>
          <option value="Card">Card</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {loading ? "Processing..." : "Pay Now"}
      </button>
    </form>
  );
}

export default PaymentForm;



