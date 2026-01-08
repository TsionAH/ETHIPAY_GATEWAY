import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';

const OrderSuccess = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [orderDetails, setOrderDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get order details from URL, localStorage, and backend
        const params = new URLSearchParams(location.search);
        const orderId = params.get('order_id');
        const transactionId = params.get('transaction_id');
        const amount = params.get('amount');
        const merchantReceived = params.get('merchant_received');
        const serviceFee = params.get('service_fee');
        const paymentId = params.get('payment_id');
        
        // Get from localStorage
        const savedPayment = JSON.parse(localStorage.getItem('last_payment') || '{}');
        const savedOrder = JSON.parse(localStorage.getItem('current_order') || '{}');
        
        // Determine the actual amounts
        let actualAmount = amount || savedPayment.amount || savedOrder.total || '0.00';
        let actualMerchantReceived = merchantReceived || savedPayment.details?.merchant_received || (parseFloat(actualAmount) * 0.98).toFixed(2);
        let actualServiceFee = serviceFee || savedPayment.details?.service_fee || (parseFloat(actualAmount) * 0.02).toFixed(2);
        let actualTransactionId = transactionId || savedPayment.transaction_id || `TXN-${Date.now()}`;
        let actualOrderId = orderId || savedOrder.order_id || `ORD-${Date.now()}`;
        
        // Try to fetch real transaction details from backend
        const fetchTransactionDetails = async () => {
            if (transactionId || paymentId) {
                try {
                    // Try to get transaction details from backend
                    const response = await fetch(`http://localhost:8001/api/bank/transaction/${transactionId || paymentId}/`);
                    if (response.ok) {
                        const data = await response.json();
                        if (data.success) {
                            actualAmount = data.amount || actualAmount;
                            actualMerchantReceived = data.merchant_received || actualMerchantReceived;
                            actualServiceFee = data.service_fee || actualServiceFee;
                            actualTransactionId = data.transaction_id || actualTransactionId;
                        }
                    }
                } catch (error) {
                    console.warn('Could not fetch transaction details:', error);
                }
            }
            
            setOrderDetails({
                order_id: actualOrderId,
                payment_id: paymentId || savedOrder.payment_id || savedPayment.payment_id,
                transaction_id: actualTransactionId,
                total: parseFloat(actualAmount).toFixed(2),
                merchant_received: parseFloat(actualMerchantReceived).toFixed(2),
                service_fee: parseFloat(actualServiceFee).toFixed(2),
                customer_balance: savedPayment.details?.customer_balance || '0.00',
                merchant_balance: savedPayment.details?.merchant_balance || '0.00',
                fee_percentage: savedPayment.fee_breakdown?.fee_percentage || '2%',
                date: new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                }),
                status: 'completed'
            });
            
            setLoading(false);
        };

        fetchTransactionDetails();

        // Clear cart after successful order
        localStorage.removeItem('cart');
        // Keep current_order for reference but mark as completed
        if (savedOrder) {
            localStorage.setItem('completed_order', JSON.stringify({
                ...savedOrder,
                completed_at: new Date().toISOString(),
                status: 'completed'
            }));
            localStorage.removeItem('current_order');
        }

    }, [location]);

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto p-8 text-center">
                <div className="flex flex-col items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-gray-600">Loading transaction details...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 text-center">
            <div className="mb-8">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Payment Successful!</h1>
                <p className="text-gray-600">Your EthPay bank transaction was completed successfully</p>
            </div>

            {orderDetails && (
                <div className="bg-white rounded-lg shadow p-6 mb-8 max-w-2xl mx-auto">
                    <h2 className="text-xl font-bold mb-6 pb-4 border-b">Transaction Details</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left Column - Order Info */}
                        <div className="space-y-4 text-left">
                            <div>
                                <h3 className="font-semibold text-gray-700 mb-3">Order Information</h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Order ID:</span>
                                        <span className="font-mono text-sm">{orderDetails.order_id?.substring(0, 12)}...</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Payment ID:</span>
                                        <span className="font-mono text-sm">{orderDetails.payment_id?.substring(0, 12)}...</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Transaction ID:</span>
                                        <span className="font-mono text-sm">{orderDetails.transaction_id}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Date & Time:</span>
                                        <span className="text-sm">{orderDetails.date}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Status:</span>
                                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold">
                                            {orderDetails.status.toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Payment Breakdown */}
                        <div className="space-y-4 text-left">
                            <h3 className="font-semibold text-gray-700 mb-3">Payment Breakdown</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between text-lg">
                                    <span className="text-gray-700">Order Amount:</span>
                                    <span className="font-bold">ETB {orderDetails.total}</span>
                                </div>
                                
                                <div className="border-t pt-3 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Service Fee ({orderDetails.fee_percentage}):</span>
                                        <span className="text-red-600">- ETB {orderDetails.service_fee}</span>
                                    </div>
                                    
                                    <div className="flex justify-between font-semibold text-green-700 pt-2 border-t">
                                        <span>Merchant Receives:</span>
                                        <span>ETB {orderDetails.merchant_received}</span>
                                    </div>
                                </div>

                                <div className="pt-4 border-t">
                                    <h4 className="font-semibold text-gray-700 mb-2">Account Balances</h4>
                                    <div className="space-y-1 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Your New Balance:</span>
                                            <span>ETB {orderDetails.customer_balance}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Merchant Balance:</span>
                                            <span>ETB {orderDetails.merchant_balance}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Summary Card */}
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <div className="mb-2 md:mb-0">
                                <p className="text-sm text-blue-800">
                                    <strong>Note:</strong> A 2% service fee was applied to this transaction.
                                    The merchant received 98% of the payment amount.
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-bold text-blue-700">
                                    Net Transfer: ETB {orderDetails.merchant_received}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-6">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200 max-w-md mx-auto">
                    <p className="text-green-800">
                        <svg className="inline w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Payment confirmed and funds transferred to merchant
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        to="/products"
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center justify-center"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                        </svg>
                        Continue Shopping
                    </Link>
                    
                    <button
                        onClick={() => {
                            // Create a printable receipt
                            const receiptWindow = window.open('', '_blank');
                            receiptWindow.document.write(`
                                <html>
                                    <head>
                                        <title>Receipt - ${orderDetails?.transaction_id}</title>
                                        <style>
                                            body { font-family: Arial, sans-serif; padding: 20px; }
                                            .receipt { max-width: 400px; margin: 0 auto; }
                                            .header { text-align: center; margin-bottom: 20px; }
                                            .details { border-top: 2px solid #000; border-bottom: 2px solid #000; padding: 15px 0; }
                                            .row { display: flex; justify-content: space-between; margin: 5px 0; }
                                            .total { font-weight: bold; font-size: 18px; }
                                            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
                                        </style>
                                    </head>
                                    <body>
                                        <div class="receipt">
                                            <div class="header">
                                                <h1>ETHPAY RECEIPT</h1>
                                                <p>Transaction: ${orderDetails?.transaction_id}</p>
                                                <p>Date: ${orderDetails?.date}</p>
                                            </div>
                                            <div class="details">
                                                <div class="row">
                                                    <span>Order Amount:</span>
                                                    <span>ETB ${orderDetails?.total}</span>
                                                </div>
                                                <div class="row">
                                                    <span>Service Fee (2%):</span>
                                                    <span>- ETB ${orderDetails?.service_fee}</span>
                                                </div>
                                                <div class="row total">
                                                    <span>Merchant Receives:</span>
                                                    <span>ETB ${orderDetails?.merchant_received}</span>
                                                </div>
                                            </div>
                                            <div class="footer">
                                                <p>Thank you for using EthPay!</p>
                                                <p>This is an electronic receipt</p>
                                            </div>
                                        </div>
                                    </body>
                                </html>
                            `);
                            receiptWindow.document.close();
                            receiptWindow.print();
                        }}
                        className="bg-gray-100 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-200 flex items-center justify-center"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                        Print Receipt
                    </button>
                    
                    <Link
                        to="/"
                        className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 flex items-center justify-center"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        View Dashboard
                    </Link>
                </div>
            </div>

            <div className="mt-8 p-6 bg-gray-50 rounded-lg max-w-2xl mx-auto">
                <h3 className="font-semibold mb-3 text-gray-800">What happens next?</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                            <span className="text-blue-600 font-bold">1</span>
                        </div>
                        <p className="text-sm text-gray-600">Order is being processed by the merchant</p>
                    </div>
                    <div className="text-center p-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                            <span className="text-blue-600 font-bold">2</span>
                        </div>
                        <p className="text-sm text-gray-600">Merchant will prepare and ship your items</p>
                    </div>
                    <div className="text-center p-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                            <span className="text-blue-600 font-bold">3</span>
                        </div>
                        <p className="text-sm text-gray-600">Track delivery in your account dashboard</p>
                    </div>
                </div>
            </div>

            <div className="mt-8 text-sm text-gray-500">
                <p>Need help? <Link to="/contact" className="text-blue-600 hover:underline">Contact support</Link></p>
                <p className="mt-2">Transaction reference: {orderDetails?.transaction_id}</p>
            </div>
        </div>
    );
};

export default OrderSuccess;