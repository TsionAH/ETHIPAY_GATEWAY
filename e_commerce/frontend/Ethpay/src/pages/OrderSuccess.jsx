import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';

const OrderSuccess = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [orderDetails, setOrderDetails] = useState(null);

    useEffect(() => {
        // Get order details from URL or localStorage
        const params = new URLSearchParams(location.search);
        const orderId = params.get('order_id');
        const transactionId = params.get('transaction_id');
        
        const savedOrder = JSON.parse(localStorage.getItem('current_order') || '{}');
        
        setOrderDetails({
            order_id: orderId || savedOrder.order_id,
            transaction_id: transactionId || `TXN-${Date.now()}`,
            total: savedOrder.total || '0.00',
            date: new Date().toLocaleDateString()
        });

        // Clear cart after successful order
        localStorage.removeItem('cart');
        localStorage.removeItem('current_order');
    }, [location]);

    return (
        <div className="max-w-4xl mx-auto p-8 text-center">
            <div className="mb-8">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                </div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Payment Successful!</h1>
                <p className="text-gray-600">Thank you for your purchase</p>
            </div>

            {orderDetails && (
                <div className="bg-white rounded-lg shadow p-6 mb-8 max-w-md mx-auto">
                    <h2 className="text-xl font-bold mb-4">Order Details</h2>
                    <div className="space-y-3 text-left">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Order ID:</span>
                            <span className="font-semibold">{orderDetails.order_id?.substring(0, 8)}...</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Transaction ID:</span>
                            <span className="font-semibold">{orderDetails.transaction_id}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Amount Paid:</span>
                            <span className="font-bold text-green-600">${orderDetails.total}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Date:</span>
                            <span>{orderDetails.date}</span>
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-4">
                <p className="text-gray-600">
                    A confirmation email has been sent to your email address.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        to="/"
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
                    >
                        Continue Shopping
                    </Link>
                    <button
                        onClick={() => window.print()}
                        className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300"
                    >
                        Print Receipt
                    </button>
                </div>
            </div>

            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">What happens next?</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                    <li>✓ Your order is being processed</li>
                    <li>✓ You will receive shipping confirmation within 24 hours</li>
                    <li>✓ Estimated delivery: 3-5 business days</li>
                </ul>
            </div>
        </div>
    );
};

export default OrderSuccess;