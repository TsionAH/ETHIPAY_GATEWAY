import React, { useState, useEffect } from 'react';
import { fetchProducts } from '../api.js';
import { useNavigate } from 'react-router-dom';

const ProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const navigate = useNavigate();

    useEffect(() => {
        const loadProducts = async () => {
            const data = await fetchProducts();
            setProducts(data);
            setFilteredProducts(data);
            setLoading(false);
        };
        loadProducts();
    }, []);

    useEffect(() => {
        let filtered = products;
        
        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        // Apply category filter
        if (categoryFilter !== 'all') {
            filtered = filtered.filter(product => 
                product.category === categoryFilter
            );
        }
        
        setFilteredProducts(filtered);
    }, [searchTerm, categoryFilter, products]);

    const handleAddToCart = (product) => {
        const token = localStorage.getItem('token');
        
        if (!token) {
            navigate('/login', { state: { from: '/products' } });
            return;
        }

        let cart = JSON.parse(localStorage.getItem('cart') || '[]');
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

    const categories = ['all', 'clothing', 'art', 'material'];

    return (
        <div className="max-w-7xl mx-auto p-8">
            <h1 className="text-3xl font-bold mb-6">All Products</h1>
            
            {/* Search and Filter Section */}
            <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-3 border rounded-lg"
                    />
                </div>
                
                <div className="flex gap-4">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setCategoryFilter(cat)}
                            className={`px-4 py-2 rounded-lg ${
                                categoryFilter === cat 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-gray-200 text-gray-700'
                            }`}
                        >
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </button>
                    ))}
                </div>
            </div>
            
            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4">Loading products...</p>
                </div>
            ) : (
                <>
                    <div className="mb-4">
                        <p className="text-gray-600">
                            Showing {filteredProducts.length} of {products.length} products
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {filteredProducts.map(product => (
                            <div key={product.id} className="bg-white shadow rounded-lg overflow-hidden">
                                <div 
                                    onClick={() => navigate(`/products/${product.id}`)}
                                    className="cursor-pointer"
                                >
                                    <img 
                                        src={product.image_url || '/products/Amhara.png'} 
                                        alt={product.name}
                                        className="w-full h-48 object-cover"
                                    />
                                    <div className="p-4">
                                        <h3 className="font-bold text-lg mb-2">{product.name}</h3>
                                        <p className="text-gray-600 text-sm mb-2">{product.category}</p>
                                        <p className="font-bold text-blue-600">${product.price}</p>
                                    </div>
                                </div>
                                
                                <div className="p-4 pt-0">
                                    <button
                                        onClick={() => handleAddToCart(product)}
                                        className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
                                    >
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    {filteredProducts.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-gray-600 text-lg">No products found</p>
                            <button 
                                onClick={() => {
                                    setSearchTerm('');
                                    setCategoryFilter('all');
                                }}
                                className="mt-4 text-blue-600 hover:text-blue-800"
                            >
                                Clear filters
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ProductsPage;