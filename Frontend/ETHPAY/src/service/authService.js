import api from "./api";

export const register = async (userData) => {
  const response = await api.post("auth/register/", {
    fullName: userData.fullName,
    companyName: userData.companyName || "",
    phoneNumber: userData.phoneNumber,
    email: userData.email,
    password: userData.password,
    role: userData.role || "endUser",
  });
  return response.data;
};

export const login = async (email, password, companyName = "") => {
  try {
    console.log("Attempting login with:", { email, companyName: companyName || "none" });
    const response = await api.post("auth/login/", {
      email,
      password,
      companyName: companyName || "",
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

