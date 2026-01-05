import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaBars, FaTimes, FaUser, FaSignOutAlt, FaShoppingCart } from "react-icons/fa";

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [cartCount, setCartCount] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token);
        updateCartCount();
        
        // Listen for cart updates
        window.addEventListener('storage', updateCartCount);
        return () => window.removeEventListener('storage', updateCartCount);
    }, []);

    const updateCartCount = () => {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const count = cart.reduce((total, item) => total + item.quantity, 0);
        setCartCount(count);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        navigate('/login');
    };

    const toggleMenu = () => setIsOpen(!isOpen);

    return (
        <nav className="bg-blue-600 text-white fixed w-full z-50 shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
                <div className="text-2xl font-bold">
                    <Link to="/">EthPay Shop</Link>
                </div>

                {/* Hamburger for mobile */}
                <div className="md:hidden cursor-pointer" onClick={toggleMenu}>
                    {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
                </div>

                {/* Links */}
                <ul className={`md:flex md:items-center md:space-x-6 absolute md:static bg-blue-600 w-full md:w-auto left-0 md:left-auto transition-all duration-300 ${isOpen ? "top-16" : "top-[-200px]"}`}>
                    <li>
                        <Link to="/" className="block py-2 px-4 hover:bg-blue-500 rounded">
                            Home
                        </Link>
                    </li>
                    <li>
                        <Link to="/products" className="block py-2 px-4 hover:bg-blue-500 rounded">
                            Products
                        </Link>
                    </li>
                    
                    {/* Cart Icon */}
                    <li className="relative">
                        <Link to="/cart" className="block py-2 px-4 hover:bg-blue-500 rounded">
                            <FaShoppingCart size={20} />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                    {cartCount}
                                </span>
                            )}
                        </Link>
                    </li>
                    
                    {isLoggedIn ? (
                        <>
                            <li>
                                <Link to="/profile" className="block py-2 px-4 hover:bg-blue-500 rounded">
                                    <FaUser className="inline mr-1" /> Profile
                                </Link>
                            </li>
                            <li>
                                <button onClick={handleLogout} className="block py-2 px-4 hover:bg-blue-500 rounded w-full text-left">
                                    <FaSignOutAlt className="inline mr-1" /> Logout
                                </button>
                            </li>
                        </>
                    ) : (
                        <>
                            <li>
                                <Link to="/login" className="block py-2 px-4 hover:bg-blue-500 rounded">
                                    Login
                                </Link>
                            </li>
                            <li>
                                <Link to="/register" className="block py-2 px-4 hover:bg-blue-500 rounded">
                                    Register
                                </Link>
                            </li>
                        </>
                    )}
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;