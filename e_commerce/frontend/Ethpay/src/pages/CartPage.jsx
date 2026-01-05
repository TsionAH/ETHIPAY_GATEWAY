import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CartPage = () => {
    const [cartItems, setCartItems] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        loadCart();
    }, []);

    const loadCart = () => {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        setCartItems(cart);
    };

    const updateQuantity = (id, newQuantity) => {
        if (newQuantity < 1) return;
        
        const updatedCart = cartItems.map(item => 
            item.id === id ? { ...item, quantity: newQuantity } : item
        );
        
        localStorage.setItem('cart', JSON.stringify(updatedCart));
        setCartItems(updatedCart);
    };

    const removeItem = (id) => {
        const updatedCart = cartItems.filter(item => item.id !== id);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
        setCartItems(updatedCart);
    };

    const clearCart = () => {
        if (window.confirm('Are you sure you want to clear your cart?')) {
            localStorage.removeItem('cart');
            setCartItems([]);
        }
    };

    const calculateTotal = () => {
        return cartItems.reduce((total, item) => {
            const price = parseFloat(item.price) || 0;
            return total + (price * item.quantity);
        }, 0).toFixed(2);
    };

    if (cartItems.length === 0) {
        return (
            <div className="max-w-7xl mx-auto p-8 text-center">
                <h1 className="text-3xl font-bold mb-4">Your Cart</h1>
                <p className="text-gray-600 mb-6">Your cart is empty</p>
                <button
                    onClick={() => navigate('/products')}
                    className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                >
                    Continue Shopping
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-8">
            <h1 className="text-3xl font-bold mb-6">Your Shopping Cart</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        {cartItems.map(item => (
                            <div key={item.id} className="p-4 border-b flex items-center">
                                <img 
                                    src={item.image_url || '/products/Amhara.png'} 
                                    alt={item.name}
                                    className="w-24 h-24 object-cover rounded"
                                />
                                
                                <div className="ml-4 flex-1">
                                    <h3 className="font-semibold">{item.name}</h3>
                                    <p className="text-gray-600 text-sm">${item.price} each</p>
                                    <p className="text-sm text-gray-500">{item.category}</p>
                                </div>
                                
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                            className="px-3 py-1 bg-gray-200 rounded"
                                        >
                                            -
                                        </button>
                                        <span className="font-semibold">{item.quantity}</span>
                                        <button 
                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            className="px-3 py-1 bg-gray-200 rounded"
                                        >
                                            +
                                        </button>
                                    </div>
                                    
                                    <div className="text-right min-w-24">
                                        <p className="font-bold">${(parseFloat(item.price) * item.quantity).toFixed(2)}</p>
                                    </div>
                                    
                                    <button 
                                        onClick={() => removeItem(item.id)}
                                        className="text-red-600 hover:text-red-800 ml-4"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                        
                        <div className="p-4 flex justify-between">
                            <button
                                onClick={clearCart}
                                className="text-red-600 hover:text-red-800"
                            >
                                Clear Cart
                            </button>
                            <button
                                onClick={() => navigate('/products')}
                                className="text-blue-600 hover:text-blue-800"
                            >
                                Continue Shopping
                            </button>
                        </div>
                    </div>
                </div>
                
                {/* Order Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg shadow p-6 sticky top-4">
                        <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                        
                        <div className="space-y-3 mb-6">
                            {cartItems.map(item => (
                                <div key={item.id} className="flex justify-between">
                                    <span className="text-gray-600">
                                        {item.name} x {item.quantity}
                                    </span>
                                    <span>${(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                            
                            <div className="border-t pt-3">
                                <div className="flex justify-between font-bold text-lg">
                                    <span>Total</span>
                                    <span>${calculateTotal()}</span>
                                </div>
                            </div>
                        </div>
                        
                        <button
                            onClick={() => navigate('/checkout')}
                            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 text-lg font-semibold mb-3"
                        >
                            Proceed to Checkout
                        </button>
                        
                        <p className="text-sm text-gray-500 text-center">
                            You'll be redirected to payment after checkout
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;