import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("API Request Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  async (error) => {
    console.error("API Error:", error.message);
    
    // Network error (backend not running or CORS issue)
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      console.error("Network Error: Make sure the backend server is running on http://127.0.0.1:8000");
      error.message = "Cannot connect to server. Please make sure the backend is running.";
    }
    
    // Handle token refresh on 401
    if (error.response?.status === 401 && error.config.url !== '/api/auth/login/') {
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        try {
          const response = await axios.post(
            "http://127.0.0.1:8000/api/auth/refresh/",
            { refresh: refreshToken },
            { headers: { "Content-Type": "application/json" } }
          );
          localStorage.setItem("accessToken", response.data.access);
          localStorage.setItem("refreshToken", response.data.refresh);
          error.config.headers.Authorization = `Bearer ${response.data.access}`;
          return api.request(error.config);
        } catch (refreshError) {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
