import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchProducts } from '../api.js';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        const loadProduct = async () => {
            setLoading(true);
            try {
                const products = await fetchProducts();
                const foundProduct = products.find(p => p.id === parseInt(id));
                setProduct(foundProduct);
            } catch (error) {
                console.error("Error loading product:", error);
            } finally {
                setLoading(false);
            }
        };

        loadProduct();
    }, [id]);

    const handleAddToCart = () => {
        const token = localStorage.getItem('token');
        
        if (!token) {
            navigate('/login', { state: { from: `/products/${id}` } });
            return;
        }

        let cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const existingItem = cart.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({
                ...product,
                quantity: quantity
            });
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        alert(`${quantity} x ${product.name} added to cart!`);
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4">Loading product...</p>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="max-w-7xl mx-auto p-8">
                <h1 className="text-2xl font-bold">Product not found</h1>
                <button 
                    onClick={() => navigate('/products')}
                    className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
                >
                    Back to Products
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-8">
            <button 
                onClick={() => navigate('/products')}
                className="mb-6 text-blue-600 hover:text-blue-800"
            >
                ← Back to Products
            </button>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <img 
                        src={product.image_url || '/products/Amhara.png'} 
                        alt={product.name}
                        className="w-full rounded-lg shadow-lg"
                    />
                </div>
                
                <div>
                    <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
                    <p className="text-gray-600 mb-4">Category: {product.category}</p>
                    <p className="text-2xl font-bold text-blue-600 mb-4">{product.price} ETB</p>
                    
                    <div className="mb-6">
                        <h3 className="font-semibold mb-2">Description:</h3>
                        <p className="text-gray-700">{product.description}</p>
                    </div>
                    
                    <div className="mb-6">
                        <label className="block font-semibold mb-2">Quantity:</label>
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                className="px-4 py-2 bg-gray-200 rounded"
                            >
                                -
                            </button>
                            <span className="text-lg font-semibold">{quantity}</span>
                            <button 
                                onClick={() => setQuantity(quantity + 1)}
                                className="px-4 py-2 bg-gray-200 rounded"
                            >
                                +
                            </button>
                        </div>
                    </div>
                    
                    <button
                        onClick={handleAddToCart}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 text-lg font-semibold"
                    >
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;