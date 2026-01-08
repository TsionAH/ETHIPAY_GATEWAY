import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const DEMO_ACCOUNTS = {
  CUSTOMER: {
    account_number: '910000001',
    password: '00ldfb@B'
  },
  MERCHANT: {
    account_number: '200000001',
    password: 'merchant123'
  }
};

const CheckoutPage = () => {
    const [cartItems, setCartItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [showBankForm, setShowBankForm] = useState(false);
    const [bankForm, setBankForm] = useState({
        account_number: DEMO_ACCOUNTS.CUSTOMER.account_number,
        password: DEMO_ACCOUNTS.CUSTOMER.password
    });
    const [paymentData, setPaymentData] = useState(null);
    const [orderDetails, setOrderDetails] = useState({
        name: '',
        email: '',
        address: '',
        phone: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        setCartItems(cart);
        
        const calculatedTotal = cart.reduce((sum, item) => {
            return sum + (parseFloat(item.price) * item.quantity);
        }, 0);
        setTotal(calculatedTotal.toFixed(2));
    }, []);

    const handleInputChange = (e) => {
        setOrderDetails({
            ...orderDetails,
            [e.target.name]: e.target.value
        });
    };

    const handleBankFormChange = (e) => {
        setBankForm({
            ...bankForm,
            [e.target.name]: e.target.value
        });
    };

    const initiatePayment = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Please login to proceed with checkout');
            navigate('/login');
            return null;
        }

        const orderData = {
            items: cartItems.map(item => ({
                id: item.id,
                name: item.name,
                quantity: item.quantity || 1,
                price: item.price
            })),
            total: total,
            email: orderDetails.email,
            name: orderDetails.name,
            address: orderDetails.address,
            phone: orderDetails.phone || ''
        };

        try {
            const orderResponse = await fetch('http://localhost:8000/api/shop/orders/create/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${token}`
                },
                body: JSON.stringify({
                    ...orderData,
                    payment_method: 'bank_transfer',
                    status: 'pending'
                })
            });

            const orderDataResult = await orderResponse.json();
            console.log('E-commerce order creation response:', orderDataResult);

            if (orderResponse.ok && (orderDataResult.success || orderDataResult.order_id)) {
                const orderId = orderDataResult.order_id || orderDataResult.id;
                const paymentIdFromApi = orderDataResult.payment_id || orderDataResult.paymentID || orderDataResult.paymentId;
                const paymentId = paymentIdFromApi || `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
                
                localStorage.setItem('current_order', JSON.stringify({
                    order_id: orderId,
                    payment_id: paymentId,
                    total: total,
                    timestamp: new Date().toISOString()
                }));
                
                return {
                    payment_id: paymentId,
                    order_id: orderId,
                    amount: total
                };
            } else {
                const errorMsg = orderDataResult.error || 'Failed to create order';
                alert('Order creation failed: ' + errorMsg);
                return null;
            }
        } catch (error) {
            console.error('Checkout error:', error);
            setError('Failed to process checkout: ' + error.message);
            alert('Failed to process checkout. Please try again.');
            return null;
        }
    };

    const processRealBankPayment = async (paymentId, accountNumber, password) => {
        try {
            console.log('Processing REAL bank payment with EthPay...');
            console.log('Payment ID:', paymentId);
            console.log('Account:', accountNumber);
            console.log('Amount:', total);
            
            // Show demo account hint if empty
            if (!accountNumber) {
                return {
                    success: false,
                    error: 'Please enter account number. Use demo: 910000001'
                };
            }
            
            // Show hint if using old account
            if (accountNumber === '100035366') {
                return {
                    success: false,
                    error: 'Account number changed. Please use 910000001 instead.'
                };
            }
            
            const response = await fetch('http://localhost:8001/api/bank/process/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    payment_id: paymentId,
                    account_number: accountNumber,
                    password: password,
                    amount: total
                })
            });

            const data = await response.json();
            console.log('REAL EthPay bank process response:', data);
            
            if (response.ok && data.success) {
                return {
                    success: true,
                    transaction_id: data.transaction_id,
                    message: data.message || `Payment successful!`,
                    details: {
                        amount: data.amount,
                        service_fee: data.service_fee,
                        total_deducted: data.total_deducted,
                        merchant_received: data.merchant_received,
                        customer_balance: data.customer_balance,
                        merchant_balance: data.merchant_balance,
                        fee_percentage: data.fee_percentage || '2%'
                    }
                };
            } else {
                return {
                    success: false,
                    error: data.error || 'Payment failed'
                };
            }
        } catch (error) {
            console.error('REAL Bank payment API error:', error);
            return {
                success: false,
                error: 'Payment processing failed. Please try again.'
            };
        }
    };

    const handleProceedToPayment = async () => {
        // Validate form
        if (!orderDetails.name || !orderDetails.email || !orderDetails.address) {
            alert('Please fill all required fields (Name, Email, Address)');
            return;
        }

        if (cartItems.length === 0) {
            alert('Your cart is empty');
            return;
        }

        setLoading(true);
        setError('');

        // First, initiate the payment to get payment_id
        const paymentInfo = await initiatePayment();
        
        if (paymentInfo) {
            setPaymentData(paymentInfo);
            setShowBankForm(true);
        }
        
        setLoading(false);
    };

    const handleBankPaymentSubmit = async (e) => {
        e.preventDefault();
        
        if (!bankForm.account_number || !bankForm.password) {
            alert('Please enter bank account number and password');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const result = await processRealBankPayment(
                paymentData?.payment_id,
                bankForm.account_number,
                bankForm.password
            );

            if (result.success) {
                // Update shop backend order status
                try {
                    await fetch('http://localhost:8000/api/shop/payment/callback/', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            payment_id: paymentData?.payment_id,
                            status: 'success',
                            transaction_id: result.transaction_id
                        })
                    });
                } catch (callbackError) {
                    console.warn('Callback update failed:', callbackError);
                }

                localStorage.setItem('last_payment', JSON.stringify({
                    order_id: paymentData?.order_id,
                    transaction_id: result.transaction_id,
                    amount: total,
                    details: result.details,
                    timestamp: new Date().toISOString(),
                    status: 'completed',
                    payment_method: 'bank_transfer',
                    fee_breakdown: {
                        total_amount: total,
                        service_fee: result.details?.service_fee || (parseFloat(total) * 0.02).toFixed(2),
                        merchant_received: result.details?.merchant_received || (parseFloat(total) * 0.98).toFixed(2),
                        fee_percentage: result.details?.fee_percentage || '2%'
                    }
                }));
                
                localStorage.removeItem('cart');
                
                navigate(`/order-success?order_id=${paymentData?.order_id}&transaction_id=${result.transaction_id}&amount=${total}&merchant_received=${result.details?.merchant_received}&service_fee=${result.details?.service_fee}&payment_id=${paymentData?.payment_id}`);
            } else {
                setError(result.error || 'Payment failed. Please try again.');
                alert(`Payment Failed: ${result.error || 'Unknown error'}`);
            }
        } catch (error) {
            setError('Payment processing failed: ' + error.message);
            alert('Payment processing failed. Please try again.');
        } finally {
            setLoading(false);
            setShowBankForm(false);
            setBankForm({ 
                account_number: DEMO_ACCOUNTS.CUSTOMER.account_number,
                password: DEMO_ACCOUNTS.CUSTOMER.password 
            });
        }
    };

    const handleCancelBankPayment = () => {
        setShowBankForm(false);
        setBankForm({ 
            account_number: DEMO_ACCOUNTS.CUSTOMER.account_number,
            password: DEMO_ACCOUNTS.CUSTOMER.password 
        });
        setPaymentData(null);
        setError('');
    };

    const createDemoAccounts = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:8001/api/bank/create-demo/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            const data = await response.json();
            if (data.success) {
                alert(`Demo accounts created/verified!\n\nUse these credentials for testing:\n\nCUSTOMER:\n• Account: 910000001\n• Password: 00ldfb@B\n• Balance: 10,000,000 ETB\n\nMERCHANT (ETHO SHOP):\n• Account: 200000001\n• Password: merchant123\n\nClick "Check Merchant Balance" after payment to see updates.`);
            } else {
                alert(`Failed to create demo accounts: ${data.error}`);
            }
        } catch (error) {
            alert(`Failed to create demo accounts: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const checkMerchantBalance = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Please login first');
                return;
            }
            
            const response = await fetch('http://localhost:8001/api/bank/merchant/dashboard/', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                alert(`Merchant Dashboard:\n\nAccount: ${data.account?.account_number}\nBalance: ETB ${data.account?.current_balance}\nTotal Received: ETB ${data.statistics?.total_received}\nFees Paid: ETB ${data.statistics?.total_fees}`);
            } else {
                alert('Failed to fetch merchant dashboard');
            }
        } catch (error) {
            console.error('Error checking merchant balance:', error);
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="max-w-7xl mx-auto p-8 text-center">
                <h1 className="text-3xl font-bold mb-4">Checkout</h1>
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
        <div className="max-w-7xl mx-auto p-4 md:p-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-6">Checkout</h1>
            
            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-800">
                    <strong>Error:</strong> {error}
                </div>
            )}
            
            {/* Bank Payment Modal */}
            {showBankForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-4 md:p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Bank Payment</h2>
                            <button
                                onClick={handleCancelBankPayment}
                                className="text-gray-500 hover:text-gray-700"
                                disabled={loading}
                            >
                                ✕
                            </button>
                        </div>
                        
                        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded">
                            <h3 className="font-semibold mb-2">Payment Details:</h3>
                            <p><strong>Order ID:</strong> {paymentData?.order_id?.substring(0, 10)}...</p>
                            <p><strong>Amount:</strong> ETB {total}</p>
                            <p><strong>Payment ID:</strong> {paymentData?.payment_id?.substring(0, 12)}...</p>
                            
                            {/* DEMO ACCOUNT INFO */}
                            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
                                <h4 className="font-semibold text-green-800 mb-1">Demo Account:</h4>
                                <p className="text-sm"><strong>Account:</strong> 910000001</p>
                                <p className="text-sm"><strong>Password:</strong> 00ldfb@B</p>
                                <p className="text-sm text-green-600 mt-1">
                                    Use this demo account for testing
                                </p>
                            </div>
                            
                            <p className="text-sm text-blue-600 mt-2">
                                Note: 2% service fee will be deducted. Merchant receives 98%.
                            </p>
                        </div>
                        
                        <form onSubmit={handleBankPaymentSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">
                                    Bank Account Number *
                                </label>
                                <input
                                    type="text"
                                    name="account_number"
                                    value={bankForm.account_number}
                                    onChange={handleBankFormChange}
                                    className="w-full border p-2 rounded"
                                    placeholder="Enter 910000001 for demo"
                                    required
                                    disabled={loading}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Demo account: 910000001
                                </p>
                            </div>
                            
                            <div className="mb-6">
                                <label className="block text-sm font-medium mb-1">
                                    Bank Password *
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    value={bankForm.password}
                                    onChange={handleBankFormChange}
                                    className="w-full border p-2 rounded"
                                    placeholder="Enter 00ldfb@B for demo"
                                    required
                                    disabled={loading}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Demo password: 00ldfb@B
                                </p>
                            </div>
                            
                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center">
                                            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                                            Processing...
                                        </span>
                                    ) : 'Pay Now'}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCancelBankPayment}
                                    disabled={loading}
                                    className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400 disabled:bg-gray-200"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                {/* Order Details Form */}
                <div>
                    <div className="bg-white rounded-lg shadow p-4 md:p-6 mb-6">
                        <h2 className="text-xl font-bold mb-4">Shipping Information</h2>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Full Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={orderDetails.name}
                                    onChange={handleInputChange}
                                    className="w-full border p-2 rounded"
                                    required
                                    disabled={showBankForm || loading}
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Email Address <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={orderDetails.email}
                                    onChange={handleInputChange}
                                    className="w-full border p-2 rounded"
                                    required
                                    disabled={showBankForm || loading}
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1">Phone Number</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={orderDetails.phone}
                                    onChange={handleInputChange}
                                    className="w-full border p-2 rounded"
                                    disabled={showBankForm || loading}
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Shipping Address <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    name="address"
                                    value={orderDetails.address}
                                    onChange={handleInputChange}
                                    className="w-full border p-2 rounded"
                                    rows="3"
                                    required
                                    disabled={showBankForm || loading}
                                />
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow p-4 md:p-6">
                        <h2 className="text-xl font-bold mb-4">Order Items</h2>
                        <div className="space-y-3">
                            {cartItems.map(item => (
                                <div key={item.id} className="flex justify-between items-center border-b pb-3">
                                    <div className="flex-1">
                                        <p className="font-medium">{item.name}</p>
                                        <p className="text-sm text-gray-600">Qty: {item.quantity || 1}</p>
                                        <p className="text-sm text-gray-600">ETB {item.price} each</p>
                                    </div>
                                    <p className="font-medium">ETB {((parseFloat(item.price) || 0) * (item.quantity || 1)).toFixed(2)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                
                {/* Order Summary & Payment */}
                <div>
                    <div className="bg-white rounded-lg shadow p-4 md:p-6 sticky top-4">
                        <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                        
                        <div className="space-y-3 mb-6">
                            {cartItems.map(item => (
                                <div key={item.id} className="flex justify-between text-sm">
                                    <span className="truncate mr-2">{item.name} × {item.quantity || 1}</span>
                                    <span className="whitespace-nowrap">ETB {((parseFloat(item.price) || 0) * (item.quantity || 1)).toFixed(2)}</span>
                                </div>
                            ))}
                            
                            <div className="border-t pt-3">
                                <div className="flex justify-between font-bold text-lg">
                                    <span>Total Amount</span>
                                    <span>ETB {total}</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-600 mt-1">
                                    <span>Service Fee (2%)</span>
                                    <span>ETB {(parseFloat(total) * 0.02).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm font-semibold text-green-600 mt-1">
                                    <span>Merchant Receives</span>
                                    <span>ETB {(parseFloat(total) * 0.98).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="mb-6">
                            <h3 className="font-bold mb-3">Payment Method</h3>
                            <div className="space-y-2">
                                <label className="flex items-center">
                                    <input 
                                        type="radio" 
                                        name="payment" 
                                        defaultChecked 
                                        className="mr-2" 
                                        disabled={showBankForm || loading}
                                    />
                                    <span>Bank Transfer via EthPay</span>
                                </label>
                                <p className="text-sm text-gray-600 mt-2">
                                    Secure bank payment with 2% service fee. Merchant receives 98% instantly.
                                </p>
                            </div>
                        </div>
                        
                        {!showBankForm ? (
                            <button
                                onClick={handleProceedToPayment}
                                disabled={loading}
                                className={`w-full py-3 rounded-lg text-lg font-semibold ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'} text-white transition-colors mb-3`}
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center">
                                        <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></span>
                                        Processing...
                                    </span>
                                ) : 'Proceed to Payment'}
                            </button>
                        ) : (
                            <div className="text-center p-4 bg-blue-50 rounded mb-3">
                                <p className="text-blue-700">
                                    <strong>Payment in progress...</strong><br />
                                    Please fill the bank payment form above
                                </p>
                            </div>
                        )}
                        
                        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
                            <p className="text-sm text-yellow-800 font-semibold mb-2">
                                Demo System Tools:
                            </p>
                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={createDemoAccounts}
                                    disabled={loading}
                                    className="text-sm bg-yellow-100 text-yellow-800 px-3 py-1 rounded hover:bg-yellow-200 disabled:opacity-50"
                                >
                                    Create/Reset Demo Accounts
                                </button>
                                <button
                                    onClick={checkMerchantBalance}
                                    disabled={loading}
                                    className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded hover:bg-blue-200 disabled:opacity-50"
                                >
                                    Check Merchant Balance
                                </button>
                            </div>
                            <p className="text-xs text-yellow-600 mt-2">
                                Using REAL EthPay payment system with 2% fee distribution
                            </p>
                        </div>
                        
                        <p className="text-sm text-gray-500 mt-4 text-center">
                            By completing your purchase, you agree to our terms of service
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;