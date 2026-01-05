const API_BASE_URL = 'http://localhost:8000/api';

// Auth functions
export const registerUser = async (userData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/register/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });
        return await response.json();
    } catch (error) {
        console.error('Registration error:', error);
        return { error: 'Network error' };
    }
};

export const loginUser = async (credentials) => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
        });
        return await response.json();
    } catch (error) {
        console.error('Login error:', error);
        return { error: 'Network error' };
    }
};

// Products functions
export const fetchProducts = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/shop/products/`);
        if (!response.ok) throw new Error('Failed to fetch products');
        return await response.json();
    } catch (error) {
        console.error('Fetch products error:', error);
        return [];
    }
};

// Utility function to get auth header
export const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Token ${token}` } : {};
};