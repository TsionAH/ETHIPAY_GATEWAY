import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchProducts } from "../../api.js";

const CardContainer = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    useEffect(() => {
        const loadProducts = async () => {
            setLoading(true);
            try {
                const data = await fetchProducts();
                setProducts(data);
            } catch (error) {
                console.error("Error loading products:", error);
            } finally {
                setLoading(false);
            }
        };

        loadProducts();
    }, []);

    const handleShopNow = (product, e) => {
        e.stopPropagation(); // Prevent card click
        const token = localStorage.getItem('token');
        
        if (!token) {
            setSelectedProduct(product);
            setShowAuthModal(true);
        } else {
            // User is logged in, add to cart
            addToCart(product);
        }
    };

    const addToCart = (product) => {
        let cart = JSON.parse(localStorage.getItem('cart') || '[]');
        
        // Check if product already in cart
        const existingItem = cart.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                ...product,
                quantity: 1
            });
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        alert(`${product.name} added to cart!`);
    };

    const handleNavigateToLogin = () => {
        setShowAuthModal(false);
        navigate('/login', { state: { from: 'shopnow' } });
    };

    const handleNavigateToRegister = () => {
        setShowAuthModal(false);
        navigate('/register', { state: { from: 'shopnow' } });
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4">Loading products...</p>
            </div>
        );
    }

    return (
        <>
            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {products.map((product) => (
                        <div
                            key={product.id}
                            onClick={() => navigate(`/products/${product.id}`)}
                            className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition hover:scale-105"
                        >
                            <img
                                src={product.image_url || '/products/Amhara.png'}
                                alt={product.name}
                                className="w-full h-56 object-cover"
                            />
                            <div className="p-4">
                                <h2 className="text-lg font-semibold">
                                    {product.name}
                                </h2>
                                <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                                    {product.description}
                                </p>
                                <div className="mt-3 flex justify-between items-center">
                                    <span className="font-bold text-blue-600">
                                        {product.price} ETB
                                    </span>
                                    <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                                        {product.category}
                                    </span>
                                </div>
                                <button
                                    onClick={(e) => handleShopNow(product, e)}
                                    className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
                                >
                                    Shop Now
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Auth Modal */}
            {showAuthModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
                        <h3 className="text-xl font-bold mb-4">Login Required</h3>
                        <p className="mb-6">
                            You need to login or register to purchase{" "}
                            <span className="font-semibold">{selectedProduct?.name}</span>.
                        </p>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleNavigateToLogin}
                                className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                            >
                                Login
                            </button>
                            <button
                                onClick={handleNavigateToRegister}
                                className="bg-green-600 text-white py-2 rounded hover:bg-green-700"
                            >
                                Create Account
                            </button>
                            <button
                                onClick={() => setShowAuthModal(false)}
                                className="bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default CardContainer;