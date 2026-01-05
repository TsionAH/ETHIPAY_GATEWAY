import React, { useState } from "react";
import { loginUser } from "../api.js";
import { useNavigate, useLocation } from "react-router-dom";

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [formData, setFormData] = useState({
        username: "",
        password: "",
    });

    const handleChange = (e) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = await loginUser(formData);
        
        if (data.token) {
            localStorage.setItem("token", data.token);
            
            // Redirect to where they came from or home
            const from = location.state?.from || "/";
            navigate(from);
        } else {
            alert(data.error || "Login failed");
        }
    };

    return (
        <div className="max-w-md mx-auto mt-20">
            <h2 className="text-2xl font-bold mb-4">Login</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    onChange={handleChange}
                    className="border p-2 rounded"
                    required
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    onChange={handleChange}
                    className="border p-2 rounded"
                    required
                />
                <button className="bg-blue-600 text-white py-2 rounded hover:bg-blue-500">
                    Login
                </button>
            </form>
            <p className="mt-4 text-center">
                Don't have an account?{" "}
                <button 
                    onClick={() => navigate('/register')}
                    className="text-blue-600 hover:underline"
                >
                    Register here
                </button>
            </p>
        </div>
    );
};

export default Login;