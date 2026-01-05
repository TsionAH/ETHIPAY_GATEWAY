// In ETHPAY frontend: src/service/authService.js
import api from "./api";

// In ETHPAY frontend: src/service/authService.js


export const register = async (userData) => {
  console.log("Sending registration data to ETHPAY backend:", userData);
  
  // ETHPAY backend expects companyName field (can be empty string)
  const registrationData = {
    fullName: userData.fullName,
    email: userData.email,
    phoneNumber: userData.phoneNumber,
    password: userData.password,
    role: userData.role || "endUser",
    companyName: userData.companyName || "", // ADD THIS - even if empty
  };
  
  console.log("Formatted registration data:", registrationData);
  
  try {
    const response = await api.post("auth/register/", registrationData);
    console.log("Registration successful:", response.data);
    return response.data;
  } catch (error) {
    console.error("Registration API error:", error.response?.data || error.message);
    throw error;
  }
};

export const login = async (email, password, companyName = "") => {
  try {
    console.log("Attempting login with:", { email, companyName: companyName || "none" });
    const response = await api.post("auth/login/", {
      email,
      password,
      companyName: companyName || "", // Include empty string if not provided
    });
    
    console.log("Login response:", response.data);
    
    // Store tokens and user data
    if (response.data && response.data.access) {
      localStorage.setItem("accessToken", response.data.access);
      localStorage.setItem("refreshToken", response.data.refresh);
      localStorage.setItem("user", JSON.stringify({
        userId: response.data.userId,
        email: response.data.email,
        role: response.data.role,
        fullName: response.data.fullName,
      }));
      console.log("Tokens stored successfully");
      return response.data;
    } else {
      throw new Error("Invalid response from server - no access token");
    }
  } catch (error) {
    console.error("Login service error:", error);
    console.error("Error response:", error.response?.data);
    console.error("Error status:", error.response?.status);
    throw error;
  }
};

// ... rest of the file stays the same



// ... rest of the file remains the same

export const logout = async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  if (refreshToken) {
    try {
      await api.post("auth/logout/", { refresh: refreshToken });
    } catch (error) {
      console.error("Logout error:", error);
    }
  }
  
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
};

export const getCurrentUser = () => {
  const userStr = localStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
};

export const isAuthenticated = () => {
  return !!localStorage.getItem("accessToken");
};

