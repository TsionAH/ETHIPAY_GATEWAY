import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../service/authService";

function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    password: "",
    companyName: "", 
    role: "endUser", // Default to end user
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const value = e.target.value;
    const name = e.target.name;
    
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validate password strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      setError("Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character");
      setLoading(false);
      return;
    }

    // Validate phone number (Ethiopian format)
    const phoneRegex = /^(\+251|0)[79]\d{8}$/;
    if (!phoneRegex.test(formData.phoneNumber.replace(/\s/g, ''))) {
      setError("Please enter a valid Ethiopian phone number (e.g., +251912345678 or 0912345678)");
      setLoading(false);
      return;
    }

    try {
      console.log("Registering with data:", formData);
      const response = await register(formData);
      console.log("Registration successful:", response);
      
      // Show success message and redirect
      alert("Registration successful! Please login with your credentials.");
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
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Create Your Account</h2>
        
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
              Phone Number *
            </label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="+251912345678 or 0912345678"
            />
            <p className="text-xs text-gray-500 mt-1">
              Ethiopian phone number format
            </p>
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
    placeholder="Your Company (optional)"
  />
  <p className="text-xs text-gray-500 mt-1">
    Required only for merchants, leave blank for end users
  </p>
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
              Must contain: uppercase, lowercase, number, and special character (@$!%*?&)
            </p>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Account Type *
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div 
                className={`p-4 border rounded-lg cursor-pointer transition-all ${formData.role === 'endUser' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-300'}`}
                onClick={() => setFormData({...formData, role: 'endUser'})}
              >
                <div className="flex items-center">
                  <div className={`w-4 h-4 rounded-full border mr-2 ${formData.role === 'endUser' ? 'border-indigo-500 bg-indigo-500' : 'border-gray-400'}`}>
                    {formData.role === 'endUser' && (
                      <div className="w-2 h-2 rounded-full bg-white m-auto mt-1"></div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold">End User</h3>
                    <p className="text-xs text-gray-600">Shop and make payments</p>
                  </div>
                </div>
              </div>
              
              <div 
                className={`p-4 border rounded-lg cursor-pointer transition-all ${formData.role === 'merchant' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-300'}`}
                onClick={() => setFormData({...formData, role: 'merchant'})}
              >
                <div className="flex items-center">
                  <div className={`w-4 h-4 rounded-full border mr-2 ${formData.role === 'merchant' ? 'border-indigo-500 bg-indigo-500' : 'border-gray-400'}`}>
                    {formData.role === 'merchant' && (
                      <div className="w-2 h-2 rounded-full bg-white m-auto mt-1"></div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold">Merchant</h3>
                    <p className="text-xs text-gray-600">Sell products and receive payments</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Hidden select for form submission */}
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="hidden"
              required
            >
              <option value="endUser">End User</option>
              <option value="merchant">Merchant</option>
            </select>
          </div>

          <div className="mt-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Account...
                </span>
              ) : "Create Account"}
            </button>
          </div>

          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              By creating an account, you agree to our{" "}
              <a href="/terms" className="text-indigo-600 hover:text-indigo-800">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="/privacy" className="text-indigo-600 hover:text-indigo-800">
                Privacy Policy
              </a>
            </p>
          </div>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-center text-gray-600">
            Already have an account?{" "}
            <a 
              href="/login" 
              className="text-indigo-600 hover:text-indigo-800 font-semibold hover:underline"
              onClick={(e) => {
                e.preventDefault();
                navigate("/login");
              }}
            >
              Sign in here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;