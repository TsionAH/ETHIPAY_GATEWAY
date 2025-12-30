import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../service/authService";

function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    companyName: "",
    phoneNumber: "",
    email: "",
    password: "",
    role: "endUser",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const value = e.target.value;
    const name = e.target.name;
    
    setFormData({ ...formData, [name]: value });
    
    // Auto-set role to merchant if company name is provided
    if (name === "companyName" && value) {
      setFormData(prev => ({ ...prev, role: "merchant" }));
    } else if (name === "companyName" && !value) {
      setFormData(prev => ({ ...prev, role: "endUser" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      console.log("Registering with data:", formData);
      const response = await register(formData);
      console.log("Registration successful:", response);
      navigate("/login");
    } catch (err) {
      console.error("Registration error:", err);
      console.error("Error response:", err.response?.data);
      
      let errorMessage = "Registration failed. Please try again.";
      
      if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        errorMessage = "Cannot connect to server. Please make sure the backend is running on http://127.0.0.1:8000";
      } else if (err.response?.data) {
        // Handle validation errors - show all errors
        const errorData = err.response.data;
        
        if (typeof errorData === 'object') {
          const errorMessages = [];
          
          // Collect all error messages
          for (const [field, messages] of Object.entries(errorData)) {
            if (Array.isArray(messages)) {
              errorMessages.push(...messages);
            } else if (typeof messages === 'string') {
              errorMessages.push(messages);
            } else if (typeof messages === 'object') {
              errorMessages.push(...Object.values(messages).flat());
            }
          }
          
          if (errorMessages.length > 0) {
            errorMessage = errorMessages.join(', ');
          } else if (errorData.error) {
            errorMessage = errorData.error;
          } else if (errorData.detail) {
            errorMessage = errorData.detail;
          }
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">ETHPAY Register</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Full Name *
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="First Last"
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Company Name (for merchants)
            </label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Your Company"
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="+251..."
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Password *
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="At least 8 characters"
            />
            <p className="text-xs text-gray-500 mt-1">
              Must contain uppercase, lowercase, number, and special character
            </p>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Role
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="endUser">End User</option>
              <option value="merchant">Merchant</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600">
          Already have an account?{" "}
          <a href="/login" className="text-indigo-600 hover:text-indigo-800 font-semibold">
            Login here
          </a>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;

